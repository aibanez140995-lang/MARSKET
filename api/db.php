<?php
// api/db.php
// Capa de Persistencia SQLite3 (PDO) en modo WAL para Hosting CDMON (v1.1.06)

declare(strict_types=1);

const MARS_VAULT_KEY = 'MARS_AEE_2026_SECRET_KEY';
const MARS_TEACHER_MASTER_CODE = 'KetMars02';

/**
 * Cifra una cadena con XOR simétrico y prefijo VLT_ (idéntico a la especificación JS)
 */
function encodeSecret(?string $str, string $key = MARS_VAULT_KEY): string {
    if ($str === null || $str === '') {
        return '';
    }
    $s = (string)$str;
    $res = '';
    $kLen = strlen($key);
    for ($i = 0; $i < strlen($s); $i++) {
        $res .= chr(ord($s[$i]) ^ ord($key[$i % $kLen]));
    }
    return 'VLT_' . base64_encode($res);
}

/**
 * Descifra una cadena VLT_ usando XOR con MARS_VAULT_KEY
 */
function decodeSecret(?string $enc, string $key = MARS_VAULT_KEY): string {
    if (!$enc || !is_string($enc)) {
        return '';
    }
    if (strpos($enc, 'VLT_') !== 0) {
        return $enc;
    }
    $b64 = substr($enc, 4);
    $raw = base64_decode($b64, true);
    if ($raw === false) {
        return '';
    }
    $res = '';
    $kLen = strlen($key);
    for ($i = 0; $i < strlen($raw); $i++) {
        $res .= chr(ord($raw[$i]) ^ ord($key[$i % $kLen]));
    }
    return $res;
}

/**
 * Obtiene la conexión PDO a SQLite con configuración de alta concurrencia WAL (180 alumnos)
 */
function getDatabaseConnection(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dataDir = dirname(__DIR__) . '/data';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0755, true);
    }

    // Asegurar protección del directorio de datos mediante .htaccess
    $dataHtaccess = $dataDir . '/.htaccess';
    if (!file_exists($dataHtaccess)) {
        @file_put_contents($dataHtaccess, "<IfModule mod_authz_core.c>\n    Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n    Order allow,deny\n    Deny from all\n</IfModule>\n");
    }

    $dbPath = $dataDir . '/marsket.sqlite';
    $isNewDb = !file_exists($dbPath);

    $pdo = new PDO('sqlite:' . $dbPath, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ]);

    // Concurrencia crítica: Pragmas para soporte de 180 alumnos concurrentes en CDMON
    $pdo->exec("PRAGMA journal_mode = WAL;");
    $pdo->exec("PRAGMA busy_timeout = 5000;");
    $pdo->exec("PRAGMA synchronous = NORMAL;");
    $pdo->exec("PRAGMA foreign_keys = ON;");
    $pdo->exec("PRAGMA temp_store = MEMORY;");
    $pdo->exec("PRAGMA wal_autocheckpoint = 1000;");

    // Auto-creación de tablas si no existen
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS state (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS company_state (
            company_id VARCHAR(100) PRIMARY KEY,
            data LONGTEXT NOT NULL,
            version INT NOT NULL DEFAULT 1,
            updated_at BIGINT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS moderation_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_id TEXT,
            student_alias TEXT,
            offending_text TEXT,
            matched_term TEXT,
            timestamp TEXT
        );
    ");

    // Inicialización del estado base virgen si la tabla state está vacía
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM state WHERE id = 'current'");
    $row = $stmt->fetch();
    if (!$row || (int)$row['count'] === 0) {
        seedInitialState($pdo);
    }

    return $pdo;
}

/**
 * Siembra el estado virgen de producción en SQLite
 */
function seedInitialState(PDO $pdo): void {
    $defaultState = [
        'version' => 1,
        'resetEpoch' => 0,
        'b2bMarket' => [],
        'b2bContracts' => [],
        'securityIncidents' => [],
        'suggestionsToAlex' => [],
        'pendingCustom' => [],
        'telemetry' => [
            'totalLogins' => 0,
            'sessions' => []
        ],
        'catalog' => [
            ['id' => 'F01', 'name' => 'Botella PET 500ml', 'price' => 97.0, 'unit' => 'Unidad', 'category' => 'Fuselaje', 'origin' => 'China'],
            ['id' => 'F02', 'name' => 'Botella PET 1L', 'price' => 120.0, 'unit' => 'Unidad', 'category' => 'Fuselaje', 'origin' => 'China'],
            ['id' => 'P01', 'name' => 'Bicarbonato de Sodio', 'price' => 10.0, 'unit' => 'Gramo', 'category' => 'Propulsión', 'origin' => 'Turquía'],
            ['id' => 'P02', 'name' => 'Vinagre', 'price' => 5.0, 'unit' => '10ml', 'category' => 'Propulsión', 'origin' => 'España'],
            ['id' => 'A01', 'name' => 'Cartón Básico', 'price' => 30.0, 'unit' => 'Set', 'category' => 'Aerodinámica', 'origin' => 'Marruecos'],
            ['id' => 'S01', 'name' => 'Papel de Cocina', 'price' => 5.0, 'unit' => 'Unidad', 'category' => 'Sellado', 'origin' => 'Portugal'],
            ['id' => 'S05', 'name' => 'Cinta Aislante', 'price' => 10.0, 'unit' => 'Rollo', 'category' => 'Sellado', 'origin' => 'Alemania']
        ],
        'config' => [
            'nextOrderId' => 1000,
            'deadlines' => [
                'preliminaryReport' => '2026-12-15T23:59',
                'technicalReport' => '2027-04-20T23:59',
                'brandIdentity_dec' => '2026-12-10T23:59',
                'brandIdentity_apr' => '2027-04-10T23:59',
                'businessModelDoc' => '2026-11-20T23:59',
                'businessModelCanvas' => '2026-11-25T23:59',
                'decisionDiary_dec' => '2026-12-15T23:59',
                'decisionDiary_apr' => '2027-04-20T23:59',
                'budgetInitial' => '2026-11-10T23:59',
                'incomeStatement' => '2026-12-18T23:59',
                'budgetPostProto' => '2027-02-15T23:59',
                'balanceSheet' => '2027-04-15T23:59',
                'goniometerEvidence' => '2026-11-15T23:59',
                'mathReportDist' => '2026-12-01T23:59',
                'mathReportTwoPoints' => '2027-02-20T23:59',
                'mathReportFinal' => '2027-04-15T23:59',
                'investorDossier' => '2026-12-05T23:59',
                'oralPresentation' => '2027-04-25T23:59',
                'writtenEssays' => '2027-04-25T23:59'
            ],
            'guidelines' => [
                'techReportDocUrl' => '',
                'techReportNotes' => 'Guía oficial redactada por FYQ.'
            ],
            'teachers' => [
                'COORD_MARIO' => ['name' => "Coordinación - Mario", 'pin' => "0001", 'admin' => true, 'canSponsor' => true],
                'COORD_ALEX' => ['name' => "Coordinación - Álex", 'pin' => "0002", 'admin' => true, 'canSponsor' => true],
                'FYQ' => ['name' => "Dpto. Física y Química", 'pin' => "0101", 'admin' => true, 'canSponsor' => false],
                'ECO' => ['name' => "Dpto. Economía", 'pin' => "0202", 'admin' => true, 'canSponsor' => false],
                'LYE' => ['name' => "Dpto. Liderazgo y Emprendimiento", 'pin' => "0303", 'admin' => true, 'canSponsor' => false],
                'LEN' => ['name' => "Dpto. Lengua Castellana", 'pin' => "0404", 'admin' => true, 'canSponsor' => false],
                'MAT' => ['name' => "Dpto. Matemáticas", 'pin' => "0505", 'admin' => true, 'canSponsor' => false],
                'ING' => ['name' => "Dpto. Inglés", 'pin' => "0606", 'admin' => true, 'canSponsor' => false]
            ]
        ],
        'companies' => [
            'astra' => [
                'name' => "Astra Dynamics",
                'balance' => 2400,
                'classGroup' => 'A',
                'logo' => null,
                'slogan' => "EXPLORING THE RED HORIZON",
                'valueProposition' => "Propulsión eólica y diseño de vanguardia para la exploración marciana.",
                'accessCode' => "AST-1010",
                'roles' => [
                    'CEO' => 'PROTECTED',
                    'TECNICO' => 'PROTECTED',
                    'FINANZAS' => 'PROTECTED',
                    'MARKETING' => 'PROTECTED',
                    'OPERACIONES_IA' => 'PROTECTED'
                ],
                'authVault' => [
                    'code' => encodeSecret('AST-1010'),
                    'roles' => [
                        'CEO' => encodeSecret('1234'),
                        'TECNICO' => encodeSecret('1234'),
                        'FINANZAS' => encodeSecret('1234'),
                        'MARKETING' => encodeSecret('1234'),
                        'OPERACIONES_IA' => encodeSecret('1234')
                    ]
                ],
                'brandApproval' => [
                    'status' => 'APROBADO',
                    'pendingLogo' => null,
                    'pendingSlogan' => "",
                    'feedback' => ""
                ],
                'sponsorAwarded' => null,
                'sponsorData' => ['name' => null, 'logo' => null],
                'aiPrompts' => [],
                'executiveResolutions' => [],
                'flightTests' => [],
                'votingMotions' => [],
                'cart' => [],
                'orders' => [],
                'ledger' => [],
                'realCosts' => [],
                'grades' => new stdClass(),
                'marketingCampaigns' => [],
                'inactivityReports' => [],
                'notifications' => [],
                'sanctions' => [],
                'crisisAlerts' => [],
                'bom' => [],
                'deliverables' => new stdClass()
            ],
            'nova' => [
                'name' => "Nova Aerospace",
                'balance' => 2400,
                'classGroup' => 'B',
                'logo' => null,
                'slogan' => "BEYOND THE ATMOSPHERE",
                'valueProposition' => "Innovación en fuselaje ligero para máximo apogeo.",
                'accessCode' => "NOV-2020",
                'roles' => [
                    'CEO' => 'PROTECTED',
                    'TECNICO' => 'PROTECTED',
                    'FINANZAS' => 'PROTECTED',
                    'MARKETING' => 'PROTECTED',
                    'OPERACIONES_IA' => 'PROTECTED'
                ],
                'authVault' => [
                    'code' => encodeSecret('NOV-2020'),
                    'roles' => [
                        'CEO' => encodeSecret('1234'),
                        'TECNICO' => encodeSecret('1234'),
                        'FINANZAS' => encodeSecret('1234'),
                        'MARKETING' => encodeSecret('1234'),
                        'OPERACIONES_IA' => encodeSecret('1234')
                    ]
                ],
                'brandApproval' => ['status' => 'APROBADO', 'pendingLogo' => null, 'pendingSlogan' => '', 'feedback' => ''],
                'sponsorAwarded' => null,
                'sponsorData' => ['name' => null, 'logo' => null],
                'aiPrompts' => [],
                'executiveResolutions' => [],
                'flightTests' => [],
                'votingMotions' => [],
                'cart' => [],
                'orders' => [],
                'ledger' => [],
                'realCosts' => [],
                'grades' => new stdClass(),
                'marketingCampaigns' => [],
                'inactivityReports' => [],
                'notifications' => [],
                'sanctions' => [],
                'crisisAlerts' => [],
                'bom' => [],
                'deliverables' => new stdClass()
            ],
            'titan' => [
                'name' => "Titan Launch",
                'balance' => 2400,
                'classGroup' => 'C',
                'logo' => null,
                'slogan' => "STRENGTH AND PRECISION",
                'valueProposition' => "Cálculo matemático riguroso y trayectoria aerodinámica optimizada.",
                'accessCode' => "TIT-3030",
                'roles' => [
                    'CEO' => 'PROTECTED',
                    'TECNICO' => 'PROTECTED',
                    'FINANZAS' => 'PROTECTED',
                    'MARKETING' => 'PROTECTED',
                    'OPERACIONES_IA' => 'PROTECTED'
                ],
                'authVault' => [
                    'code' => encodeSecret('TIT-3030'),
                    'roles' => [
                        'CEO' => encodeSecret('1234'),
                        'TECNICO' => encodeSecret('1234'),
                        'FINANZAS' => encodeSecret('1234'),
                        'MARKETING' => encodeSecret('1234'),
                        'OPERACIONES_IA' => encodeSecret('1234')
                    ]
                ],
                'brandApproval' => ['status' => 'APROBADO', 'pendingLogo' => null, 'pendingSlogan' => '', 'feedback' => ''],
                'sponsorAwarded' => null,
                'sponsorData' => ['name' => null, 'logo' => null],
                'aiPrompts' => [],
                'executiveResolutions' => [],
                'flightTests' => [],
                'votingMotions' => [],
                'cart' => [],
                'orders' => [],
                'ledger' => [],
                'realCosts' => [],
                'grades' => new stdClass(),
                'marketingCampaigns' => [],
                'inactivityReports' => [],
                'notifications' => [],
                'sanctions' => [],
                'crisisAlerts' => [],
                'bom' => [],
                'deliverables' => new stdClass()
            ]
        ]
    ];

    $json = json_encode($defaultState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $stmt = $pdo->prepare("INSERT OR REPLACE INTO state (id, data, updated_at) VALUES ('current', :data, CURRENT_TIMESTAMP)");
    $stmt->execute([':data' => $json]);
}
