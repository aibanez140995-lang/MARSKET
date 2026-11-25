<?php
// api/index.php
// Front-Controller Atómico de MARS-KET OS para Hosting CDMON (Apache + PHP 8.x + SQLite3)
// Versión: v2.0.75

declare(strict_types=1);

require_once __DIR__ . '/db.php';

// 1. Configuración de Cabeceras Globales y CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Marsket-Auth, If-None-Match');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

// Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Control de Tamaño de Carga (Tope 8 MB para soportar ediciones A3 de Coordinación)
$maxBytes = 8 * 1024 * 1024;
$rawInput = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
if ($rawInput !== false && strlen($rawInput) > $maxBytes) {
    http_response_code(413);
    echo json_encode([
        'error' => 'PAYLOAD_TOO_LARGE',
        'message' => 'El cuerpo de la petición excede el límite máximo permitido de 8 MB.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Resolución de Enrutamiento
$endpoint = $_GET['endpoint'] ?? '';
if ($endpoint === '') {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?? '';
    $endpoint = (string)preg_replace('#^.*?/api/?#', '', $uri);
}
$endpoint = trim($endpoint, '/');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// 4. Funciones Auxiliares de Autenticación y Sanitización
function getAuthorizationToken(): string {
    // 1. Prioridad absoluta: Cabecera dedicada de MARS-KET (inmune a colisiones con HTTP Basic Auth del hosting)
    $marsAuth = $_SERVER['HTTP_X_MARSKET_AUTH'] ?? '';
    if (!$marsAuth && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $marsAuth = $headers['X-Marsket-Auth'] ?? $headers['x-marsket-auth'] ?? '';
    }
    if ($marsAuth) {
        return trim((string)$marsAuth);
    }

    // 2. Cabecera Authorization estándar (únicamente si emplea el esquema Bearer)
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$auth && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (preg_match('/^Bearer\s+(.*)$/i', (string)$auth, $matches)) {
        return trim($matches[1]);
    }
    return '';
}

function isValidCompanyId(string $cid): bool {
    return $cid !== '' && preg_match('/^[a-zA-Z0-9_-]{1,64}$/', $cid) === 1;
}

function isValidStudentRole(string $role): bool {
    return in_array($role, ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'], true);
}

function parseMsTimestamp($val): int {
    if (is_int($val) || is_float($val)) return (int)$val;
    if (is_string($val)) {
        $trim = trim($val);
        if ($trim === '') return 0;
        if (is_numeric($trim)) return (int)$trim;
        $sec = strtotime($trim);
        if ($sec === false) return 0;
        $msPart = 0;
        if (preg_match('/\.(\d{1,3})/', $trim, $m)) {
            $msPart = (int)str_pad($m[1], 3, '0', STR_PAD_RIGHT);
        }
        return ($sec * 1000) + $msPart;
    }
    return 0;
}

function isoMsNow(int $minAfterMs = 0): string {
    $ms = max((int)round(microtime(true) * 1000), $minAfterMs);
    $sec = intdiv($ms, 1000);
    $rem = $ms % 1000;
    return gmdate('Y-m-d\TH:i:s', $sec) . '.' . sprintf('%03d', $rem) . 'Z';
}

function mergeLoginStatsArr(array $a, array $b): array {
    $out = $a;
    $out['totalLogins'] = max((int)($a['totalLogins'] ?? 0), (int)($b['totalLogins'] ?? 0));
    $rolesA = is_array($a['roles'] ?? null) ? $a['roles'] : [];
    $rolesB = is_array($b['roles'] ?? null) ? $b['roles'] : [];
    $mergedRoles = $rolesA;
    foreach ($rolesB as $rk => $rv) {
        if (!is_array($rv)) continue;
        $ra = is_array($mergedRoles[$rk] ?? null) ? $mergedRoles[$rk] : [];
        $cA = (int)($ra['count'] ?? 0);
        $cB = (int)($rv['count'] ?? 0);
        $lA = (string)($ra['lastLogin'] ?? '');
        $lB = (string)($rv['lastLogin'] ?? '');
        $lastLogin = (parseMsTimestamp($lB) >= parseMsTimestamp($lA) && $lB !== '') ? $lB : $lA;
        $mergedRoles[$rk] = ['count' => max($cA, $cB), 'lastLogin' => $lastLogin];
    }
    $out['roles'] = $mergedRoles;
    return $out;
}

function isValidTeacherRole(string $role): bool {
    return preg_match('/^(COORD_[A-Z0-9_]{1,32}|FYQ|ECO|LYE|LEN|MAT|ING)$/', $role) === 1;
}

function beginImmediateTx(PDO $pdo): void {
    if (!$pdo->inTransaction()) {
        $pdo->exec('BEGIN IMMEDIATE');
    }
}

function commitTx(PDO $pdo): void {
    if ($pdo->inTransaction()) {
        $pdo->exec('COMMIT');
    }
}

function rollbackQuietly(PDO $pdo): void {
    try {
        if ($pdo->inTransaction()) {
            $pdo->exec('ROLLBACK');
        }
    } catch (\Throwable $e) {}
}

function normalizeCompanyDictsForJson(&$co): void {
    if (!is_array($co)) return;
    foreach (['deliverables', 'grades', 'contracts', 'phaseBalances', 'pressReleases', 'roles'] as $dictKey) {
        if (!isset($co[$dictKey]) || !is_array($co[$dictKey]) || count($co[$dictKey]) === 0) {
            $co[$dictKey] = new \stdClass();
        }
    }
    if (isset($co['loginStats']) && is_array($co['loginStats'])) {
        if (!isset($co['loginStats']['roles']) || !is_array($co['loginStats']['roles']) || count($co['loginStats']['roles']) === 0) {
            $co['loginStats']['roles'] = new \stdClass();
        }
    }
    if (!empty($co['votingMotions']) && is_array($co['votingMotions'])) {
        foreach ($co['votingMotions'] as &$m) {
            if (is_array($m) && (!isset($m['votes']) || !is_array($m['votes']) || count($m['votes']) === 0)) {
                $m['votes'] = new \stdClass();
            }
        }
        unset($m);
    }
}

function verifySession(?PDO $pdo = null): array {
    $token = getAuthorizationToken();
    if (!$token) {
        return ['authorized' => false, 'isCoordinator' => false, 'role' => null, 'isAdmin' => false];
    }

    if (hash_equals(MARS_TEACHER_MASTER_CODE, $token) || hash_equals('MASTER_MARS_2026', $token)) {
        return ['authorized' => true, 'isCoordinator' => true, 'isTeacher' => true, 'role' => 'coordinador', 'isAdmin' => true];
    }

    if ($pdo === null) {
        $pdo = getDatabaseConnection();
    }

    // Validación criptográfica HMAC-SHA256 obligatoria (formato MKT2.<payload>.<sig>)
    if (strpos($token, 'MKT2.') === 0) {
        $claims = verifySignedSessionToken($pdo, $token);
        if (!$claims) {
            return ['authorized' => false, 'isCoordinator' => false, 'role' => null, 'isAdmin' => false];
        }
        $typ = (string)($claims['typ'] ?? '');
        if ($typ === 'T') {
            $role = (string)($claims['role'] ?? '');
            $rLower = strtolower($role);
            $isCoord = strpos($rLower, 'coord') !== false || $rLower === 'coordinador';
            $teacherRoles = ['FYQ', 'ECO', 'MAT', 'LEN', 'ING', 'LYE'];
            $isTeacherRole = in_array(strtoupper($role), $teacherRoles, true) || $isCoord;
            if (!$isTeacherRole) {
                return ['authorized' => false, 'isCoordinator' => false, 'role' => null, 'isAdmin' => false];
            }
            return [
                'authorized' => true,
                'isCoordinator' => $isCoord,
                'isTeacher' => true,
                'role' => $role,
                'isAdmin' => true,
                'stamp' => (int)($claims['stamp'] ?? 0)
            ];
        }
        if ($typ === 'V') {
            return [
                'authorized' => false,
                'isCoordinator' => false,
                'isVip' => true,
                'isStudent' => false,
                'role' => 'VIP_READER',
                'coId' => 'vip_reader',
                'isAdmin' => false,
                'stamp' => (int)($claims['stamp'] ?? 1)
            ];
        }
        if ($typ === 'S') {
            $coId = (string)($claims['coId'] ?? '');
            $role = (string)($claims['role'] ?? '');
            if (!isValidCompanyId($coId) || !isValidStudentRole($role)) {
                return ['authorized' => false, 'isCoordinator' => false, 'role' => null, 'isAdmin' => false];
            }
            return [
                'authorized' => false,
                'isCoordinator' => false,
                'isStudent' => true,
                'role' => $role,
                'coId' => $coId,
                'isAdmin' => false,
                'stamp' => (int)($claims['stamp'] ?? 0)
            ];
        }
    }

    return ['authorized' => false, 'isCoordinator' => false, 'role' => null, 'isAdmin' => false];
}

function redactFinalContestForClient(array $fc, bool $includeContestDraft = false): array {
    $isPublished = !empty($fc['published']);
    $nextFinalists = (isset($fc['finalists']) && is_array($fc['finalists']) && count($fc['finalists']) > 0)
        ? $fc['finalists']
        : new \stdClass();
    if (!$includeContestDraft && !$isPublished) {
        return [
            'finalists' => $nextFinalists,
            'launches' => new \stdClass(),
            'podium' => ['first' => null, 'second' => null, 'third' => null],
            'roleAwards' => ['CEO' => null, 'TECNICO' => null, 'FINANZAS' => null, 'MARKETING' => null, 'OPERACIONES' => null],
            'published' => false,
            'publishedAt' => null,
            'updatedAt' => (int)($fc['updatedAt'] ?? 0)
        ];
    }
    $fc['finalists'] = $nextFinalists;
    if (!isset($fc['launches']) || !is_array($fc['launches']) || count($fc['launches']) === 0) {
        $fc['launches'] = new \stdClass();
    }
    return $fc;
}

function purgeCompanyFromFinalContest(&$fc, string $delCid): void {
    if (!is_array($fc) || $delCid === '') return;
    if (isset($fc['finalists']) && is_array($fc['finalists'])) {
        foreach ($fc['finalists'] as $cls => $cid) {
            if ($cid === $delCid) {
                unset($fc['finalists'][$cls]);
            }
        }
    }
    if (isset($fc['launches']) && is_array($fc['launches'])) {
        unset($fc['launches'][$delCid]);
    }
    if (isset($fc['podium']) && is_array($fc['podium'])) {
        foreach (['first', 'second', 'third'] as $slot) {
            if (($fc['podium'][$slot] ?? null) === $delCid) {
                $fc['podium'][$slot] = null;
            }
        }
    }
    if (isset($fc['roleAwards']) && is_array($fc['roleAwards'])) {
        foreach ($fc['roleAwards'] as $rKey => $cid) {
            if ($cid === $delCid) {
                $fc['roleAwards'][$rKey] = null;
            }
        }
    }
}

function sanitizeStateForClient(array $state, bool $includeContestDraft = false, bool $includeTeacherPrivate = false): array {
    if (isset($state['config']) && is_array($state['config'])) {
        if (isset($state['config']['teachers']) && is_array($state['config']['teachers'])) {
            foreach ($state['config']['teachers'] as $tk => &$t) {
                if (is_array($t)) {
                    unset($t['pin']);
                }
            }
            unset($t);
        }
        foreach (['teachers', 'deadlines', 'deliverableSchedule'] as $cfgDict) {
            if (!isset($state['config'][$cfgDict]) || !is_array($state['config'][$cfgDict]) || count($state['config'][$cfgDict]) === 0) {
                $state['config'][$cfgDict] = new \stdClass();
            }
        }
    }
    if (isset($state['companies']) && is_array($state['companies'])) {
        foreach ($state['companies'] as $cid => &$co) {
            if (is_array($co)) {
                unset($co['authVault'], $co['roles'], $co['accessCode']);
                if (!$includeContestDraft && isset($co['auxRoleRequest']) && is_array($co['auxRoleRequest'])) {
                    unset($co['auxRoleRequest']['pin']);
                }
                if (!$includeTeacherPrivate) {
                    unset($co['inactivityReports']);
                }
                normalizeCompanyDictsForJson($co);
            }
        }
        unset($co);
        if (count($state['companies']) === 0) {
            $state['companies'] = new \stdClass();
        }
    }
    if (isset($state['finalContest']) && is_array($state['finalContest'])) {
        $state['finalContest'] = redactFinalContestForClient($state['finalContest'], $includeContestDraft);
    }
    if (isset($state['realCompanyLogos']) && is_array($state['realCompanyLogos']) && count($state['realCompanyLogos']) === 0) {
        $state['realCompanyLogos'] = new \stdClass();
    }
    if (!$includeContestDraft) {
        unset($state['printEditions'], $state['printAdLibrary'], $state['deletedPrintEditionIds']);
        if (isset($state['config']['orbita'])) {
            unset($state['config']['orbita']);
        }
        if (isset($state['news']) && is_array($state['news'])) {
            $state['news'] = array_values(array_filter($state['news'], function ($it) {
                return is_array($it) && strtoupper((string)($it['status'] ?? 'PUBLISHED')) !== 'DRAFT';
            }));
        }
    }
    unset($state['officialNews']);
    return $state;
}

function ensureTestCompaniesInState(array &$state): bool {
    $changed = false;
    if (isset($state['config']['teachers']) && is_array($state['config']['teachers']) && array_key_exists('BIO', $state['config']['teachers'])) {
        unset($state['config']['teachers']['BIO']);
        $changed = true;
    }
    if (!isset($state['companies']) || !is_array($state['companies'])) {
        $state['companies'] = [];
    }
    $defs = [
        'sandbox_master' => [
            'name' => 'MARS-X SANDBOX (PRUEBAS)',
            'code' => 'TEST-0000',
            'unlockAllContracts' => true
        ],
        'sandbox_student' => [
            'name' => 'MARS-X ALUMNO (ESTÁNDAR)',
            'code' => 'TEST-1111',
            'unlockAllContracts' => false
        ]
    ];
    $allRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
    foreach ($defs as $cid => $meta) {
        if (!isset($state['companies'][$cid]) || !is_array($state['companies'][$cid])) {
            $state['companies'][$cid] = [
                'id' => $cid,
                'name' => $meta['name'],
                'classGroup' => 'TEST',
                'balance' => 2400,
                'isTestCompany' => true,
                'unlockAllContracts' => $meta['unlockAllContracts'],
                'slogan' => '',
                'valueProposition' => '',
                'roles' => [],
                'authVault' => ['code' => encodeSecret($meta['code']), 'roles' => []],
                'deliverables' => new \stdClass(),
                'contracts' => new \stdClass(),
                'ledger' => [],
                'orders' => [],
                'flightTests' => [],
                'authUpdatedAt' => 0
            ];
            foreach ($allRoles as $r) {
                $state['companies'][$cid]['authVault']['roles'][$r] = encodeSecret('1234');
                $state['companies'][$cid]['roles'][$r] = 'PROTECTED';
            }
            $changed = true;
            continue;
        }
        $co = &$state['companies'][$cid];
        if (empty($co['name']) || $co['name'] === strtoupper($cid)) {
            $co['name'] = $meta['name'];
            $changed = true;
        }
        if (($co['classGroup'] ?? '') !== 'TEST') {
            $co['classGroup'] = 'TEST';
            $changed = true;
        }
        if (empty($co['isTestCompany'])) {
            $co['isTestCompany'] = true;
            $changed = true;
        }
        if (!isset($co['unlockAllContracts']) || (bool)$co['unlockAllContracts'] !== $meta['unlockAllContracts']) {
            $co['unlockAllContracts'] = $meta['unlockAllContracts'];
            $changed = true;
        }
        if (!isset($co['authVault']) || !is_array($co['authVault'])) {
            $co['authVault'] = ['code' => '', 'roles' => []];
            $changed = true;
        }
        if (empty($co['authVault']['code'])) {
            $plainCode = !empty($co['accessCode']) ? (string)$co['accessCode'] : $meta['code'];
            $co['authVault']['code'] = encodeSecret(strtoupper(trim($plainCode)));
            unset($co['accessCode']);
            $changed = true;
        }
        if (!isset($co['authVault']['roles']) || !is_array($co['authVault']['roles'])) {
            $co['authVault']['roles'] = [];
            $changed = true;
        }
        if (!isset($co['roles']) || !is_array($co['roles'])) {
            $co['roles'] = [];
            $changed = true;
        }
        foreach ($allRoles as $r) {
            if (empty($co['authVault']['roles'][$r])) {
                $existingPlain = (string)($co['roles'][$r] ?? '');
                $pinVal = ($existingPlain !== '' && strtoupper($existingPlain) !== 'PROTECTED' && strpos($existingPlain, 'VLT_') !== 0)
                    ? $existingPlain
                    : '1234';
                $co['authVault']['roles'][$r] = encodeSecret($pinVal);
                $co['roles'][$r] = 'PROTECTED';
                $changed = true;
            }
        }
        if (!isset($co['deliverables']) || !is_array($co['deliverables'])) { $co['deliverables'] = new \stdClass(); $changed = true; }
        if (!isset($co['contracts']) || !is_array($co['contracts'])) { $co['contracts'] = new \stdClass(); $changed = true; }
        if (!isset($co['ledger']) || !is_array($co['ledger'])) { $co['ledger'] = []; $changed = true; }
        if (!isset($co['orders']) || !is_array($co['orders'])) { $co['orders'] = []; $changed = true; }
        if (!isset($co['flightTests']) || !is_array($co['flightTests'])) { $co['flightTests'] = []; $changed = true; }
        unset($co);
    }
    return $changed;
}

// 5. Despacho Atómico de Endpoints
try {
    $pdo = getDatabaseConnection();

    // -------------------------------------------------------------------------
    // A. ENDPOINT: /api/state
    // -------------------------------------------------------------------------
    if ($endpoint === 'state') {
        if ($method === 'GET') {
            $action = $_GET['action'] ?? '';

            // Descarga de backup específico (solo Coordinación Docente)
            if ($action === 'get_backup') {
                $readAuthBackup = verifySession($pdo);
                if (empty($readAuthBackup['isCoordinator'])) {
                    http_response_code(403);
                    echo json_encode(['error' => 'UNAUTHORIZED_BACKUP_ACCESS', 'message' => 'Acceso restringido a Coordinación docente.'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                $type = (string)($_GET['type'] ?? 'backup_daily');
                if ($type !== 'backup_daily' && preg_match('/^backup_weekly_\d{4}-\d{2}-\d{2}$/', $type) !== 1) {
                    http_response_code(400);
                    echo json_encode(['error' => 'INVALID_BACKUP_TYPE']);
                    exit;
                }
                $stmt = $pdo->prepare("SELECT data AS clean_data FROM state WHERE id = :id");
                $stmt->execute([':id' => $type]);
                $row = $stmt->fetch();
                if ($row && !empty($row['clean_data'])) {
                    $decodedBackup = json_decode($row['clean_data'], true);
                    header('Content-Type: application/json; charset=utf-8');
                    header('Cache-Control: private, no-cache');
                    header('Vary: X-Marsket-Auth');
                    if (is_array($decodedBackup)) {
                        echo json_encode(sanitizeStateForClient($decodedBackup, true), JSON_UNESCAPED_UNICODE);
                    } else {
                        echo json_encode(['status' => 'corrupt']);
                    }
                    exit;
                }
                echo json_encode(['status' => 'empty']);
                exit;
            }

            if ($action === 'fast_version') {
                $stmtFast = $pdo->query("SELECT json_extract(data, '$.version') as v, json_extract(data, '$.lastUpdated') as lu, json_extract(data, '$.config.updatedAt') as cu FROM state WHERE id = 'current'");
                $rowFast = $stmtFast ? $stmtFast->fetch() : null;
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'version' => (int)($rowFast['v'] ?? 1),
                    'updatedAt' => (int)($rowFast['lu'] ?? 0),
                    'configUpdatedAt' => (int)($rowFast['cu'] ?? 0)
                ]);
                exit;
            }

            // Determinar si la lectura proviene de Coordinación, Claustro Docente o Lector VIP
            $readAuth = verifySession();
            $isCoordReader = !empty($readAuth['isCoordinator']);
            $isTeacherReader = $isCoordReader || !empty($readAuth['isTeacher']) || !empty($readAuth['isAdmin']);
            $isVipReader = !empty($readAuth['isVip']);
            $readerScope = $isCoordReader ? 'coord' : ($isTeacherReader ? 'teacher' : ($isVipReader ? 'vip' : 'pub'));

            // Mitigación de Ancho de Banda con ETag y HTTP 304 (0 bytes si versión, config.updatedAt y nivel de lector coinciden)
            $stmt = $pdo->query("SELECT json_extract(data, '$.version') as v, json_extract(data, '$.config.updatedAt') as cu FROM state WHERE id = 'current'");
            $row = $stmt->fetch();
            $version = (string)($row['v'] ?? '1');
            $cu = (string)((int)($row['cu'] ?? 0));
            $serverETag = 'W/"v-' . $version . '-' . $cu . '-' . $readerScope . '"';
            $clientETag = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';

            if (!$isVipReader && $clientETag === $serverETag) {
                http_response_code(304);
                header('ETag: ' . $serverETag);
                header('Cache-Control: private, no-cache');
                header('Vary: X-Marsket-Auth');
                exit;
            }

            // Lectura Zero-Heap sanitizada directamente en motor SQLite (Zero json_decode)
            $stmtClean = $pdo->query("
                SELECT json_remove(
                    data,
                    '$.config.teachers.COORD_MARIO.pin',
                    '$.config.teachers.COORD_ALEX.pin',
                    '$.config.teachers.FYQ.pin',
                    '$.config.teachers.ECO.pin',
                    '$.config.teachers.LYE.pin',
                    '$.config.teachers.LEN.pin',
                    '$.config.teachers.MAT.pin',
                    '$.config.teachers.ING.pin',
                    '$.companies.astra.authVault',
                    '$.companies.astra.roles',
                    '$.companies.astra.accessCode',
                    '$.companies.pulsar.authVault',
                    '$.companies.pulsar.roles',
                    '$.companies.pulsar.accessCode',
                    '$.companies.zenith.authVault',
                    '$.companies.zenith.roles',
                    '$.companies.zenith.accessCode',
                    '$.companies.titan.authVault',
                    '$.companies.titan.roles',
                    '$.companies.titan.accessCode',
                    '$.companies.nova.authVault',
                    '$.companies.nova.roles',
                    '$.companies.nova.accessCode',
                    '$.companies.vortex.authVault',
                    '$.companies.vortex.roles',
                    '$.companies.vortex.accessCode'
                ) AS clean_data FROM state WHERE id = 'current'
            ");
            $row = $stmtClean->fetch();
            if (!$row || empty($row['clean_data'])) {
                header('Content-Type: application/json; charset=utf-8');
                header('ETag: ' . $serverETag);
                header('Cache-Control: private, no-cache');
                header('Vary: X-Marsket-Auth');
                echo json_encode(['status' => 'empty']);
                exit;
            }

            $cleanPayload = $row['clean_data'];
            $decoded = json_decode($cleanPayload, true);
            if (is_array($decoded)) {
                if ($isVipReader) {
                    $rawVipNews = is_array($decoded['news'] ?? null) ? $decoded['news'] : (is_array($decoded['officialNews'] ?? null) ? $decoded['officialNews'] : []);
                    $vipNews = array_values(array_filter($rawVipNews, function ($it) {
                        return is_array($it) && strtoupper((string)($it['status'] ?? 'PUBLISHED')) !== 'DRAFT';
                    }));
                    $vipStartups = [];
                    if (!empty($decoded['companies']) && is_array($decoded['companies'])) {
                        foreach ($decoded['companies'] as $vCid => $vCo) {
                            if (!is_array($vCo)) continue;
                            $clsUpper = strtoupper(trim((string)($vCo['classGroup'] ?? '')));
                            if (!empty($vCo['isTestCompany']) || $vCid === 'sandbox_master' || $vCid === 'sandbox_student' || $clsUpper === 'TEST') {
                                continue;
                            }
                            $flightCount = 0;
                            $maxHeight = 0.0;
                            $bestE = 0.0;
                            if (!empty($vCo['flightTests']) && is_array($vCo['flightTests'])) {
                                foreach ($vCo['flightTests'] as $ft) {
                                    if (!is_array($ft)) continue;
                                    $flightCount++;
                                    $h = (float)($ft['height'] ?? $ft['apogee'] ?? 0);
                                    $c = (float)($ft['cost'] ?? $ft['flightCost'] ?? 0);
                                    $eVal = isset($ft['efficiency']) ? (float)$ft['efficiency'] : (isset($ft['e']) ? (float)$ft['e'] : ($c > 0 ? ($h / $c) : 0.0));
                                    if ($h > $maxHeight) $maxHeight = $h;
                                    if ($eVal > $bestE) $bestE = $eVal;
                                }
                            }
                            $publishedPrCount = 0;
                            if (!empty($vCo['pressReleases']) && is_array($vCo['pressReleases'])) {
                                foreach ($vCo['pressReleases'] as $prEntry) {
                                    if (is_array($prEntry) && ($prEntry['status'] ?? '') === 'PUBLISHED') {
                                        $publishedPrCount++;
                                    }
                                }
                            }
                            $rawLogo = trim((string)($vCo['logo'] ?? ''));
                            $safeLogo = (preg_match('#^(https://|data:image/)#i', $rawLogo) === 1) ? $rawLogo : '';
                            $vipStartups[] = [
                                'id' => (string)$vCid,
                                'name' => (string)($vCo['name'] ?? strtoupper((string)$vCid)),
                                'slogan' => (string)($vCo['slogan'] ?? ''),
                                'logo' => $safeLogo,
                                'bestE' => round($bestE, 4),
                                'maxHeight' => round($maxHeight, 2),
                                'flightCount' => $flightCount,
                                'publishedPrCount' => $publishedPrCount
                            ];
                        }
                    }
                    $vipRealLogos = (isset($decoded['realCompanyLogos']) && is_array($decoded['realCompanyLogos']) && count($decoded['realCompanyLogos']) > 0)
                        ? $decoded['realCompanyLogos']
                        : new \stdClass();
                    $vipState = [
                        'version' => $decoded['version'] ?? 1,
                        'lastUpdated' => $decoded['lastUpdated'] ?? 0,
                        'news' => $vipNews,
                        'vipStartups' => $vipStartups,
                        'realCompanyLogos' => $vipRealLogos,
                        'realCompanyLogosUpdatedAt' => (int)($decoded['realCompanyLogosUpdatedAt'] ?? 0),
                        'deletedNewsIds' => array_values(is_array($decoded['deletedNewsIds'] ?? null) ? $decoded['deletedNewsIds'] : []),
                        'deletedOfficialNewsIds' => array_values(is_array($decoded['deletedOfficialNewsIds'] ?? null) ? $decoded['deletedOfficialNewsIds'] : []),
                        'printEditions' => [],
                        'deletedPrintEditionIds' => [],
                        'companies' => new \stdClass(),
                        'b2bMarket' => [],
                        'b2bContracts' => [],
                        'suggestions' => [],
                        'pendingCustomItems' => [],
                        'catalog' => [],
                        'config' => [
                            'phase' => $decoded['config']['phase'] ?? 'I',
                            'updatedAt' => $decoded['config']['updatedAt'] ?? 0,
                            'orbita' => [
                                'currentEditionNumber' => (int)($decoded['config']['orbita']['currentEditionNumber'] ?? 0)
                            ]
                        ]
                    ];
                    $vipJson = json_encode($vipState, JSON_UNESCAPED_UNICODE);
                    $vipETag = 'W/"vip-' . md5((string)$vipJson) . '"';
                    if ($clientETag === $vipETag) {
                        http_response_code(304);
                        header('ETag: ' . $vipETag);
                        header('Cache-Control: private, no-cache');
                        header('Vary: X-Marsket-Auth');
                        exit;
                    }
                    header('Content-Type: application/json; charset=utf-8');
                    header('ETag: ' . $vipETag);
                    header('Cache-Control: private, no-cache');
                    header('Vary: X-Marsket-Auth');
                    echo $vipJson;
                    exit;
                }
                ensureTestCompaniesInState($decoded);
                $sanitized = sanitizeStateForClient($decoded, $isCoordReader, $isTeacherReader);
                header('Content-Type: application/json; charset=utf-8');
                header('ETag: ' . $serverETag);
                header('Cache-Control: private, no-cache');
                header('Vary: X-Marsket-Auth');
                echo json_encode($sanitized, JSON_UNESCAPED_UNICODE);
                exit;
            }

            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => 'STATE_DECODE_ERROR', 'message' => 'Error interno al deserializar el estado.']);
            exit;
        }

        if ($method === 'POST') {
            $payload = json_decode($rawInput, true);
            if (!is_array($payload)) {
                http_response_code(400);
                echo json_encode(['error' => 'INVALID_JSON', 'message' => 'Cuerpo JSON malformado o vacío']);
                exit;
            }

            $action = $payload['action'] ?? '';

            // Acción: Verificación de código maestro docente
            if ($action === 'verify_teacher_master') {
                $code = trim((string)($payload['code'] ?? ''));
                $verified = ($code !== '' && (
                    hash_equals(MARS_TEACHER_MASTER_CODE, $code) ||
                    hash_equals('KetMars02', $code) ||
                    hash_equals('MASTER_MARS_2026', $code)
                ));
                http_response_code($verified ? 200 : 403);
                echo json_encode(['verified' => $verified]);
                exit;
            }

            // Acción: Validación de código de empresa (Zero-Trust Quirúrgico con json_extract)
            if ($action === 'validate_company_code') {
                $code = strtoupper(trim((string)($payload['code'] ?? '')));
                $coIdInput = strtolower(trim((string)($payload['coId'] ?? '')));
                $matchedCoId = null;
                $companyName = 'EMPRESA';
                $hasAux = false;

                if ($coIdInput !== '' && isValidCompanyId($coIdInput)) {
                    $stmt = $pdo->prepare("
                        SELECT 
                            :coId AS co_id,
                            json_extract(data, '$.companies.' || :coId || '.accessCode') AS access_code,
                            json_extract(data, '$.companies.' || :coId || '.authVault.code') AS vault_code,
                            json_extract(data, '$.companies.' || :coId || '.name') AS name,
                            json_extract(data, '$.companies.' || :coId || '.roles.AUXILIAR') AS aux_role,
                            json_extract(data, '$.companies.' || :coId || '.authVault.roles.AUXILIAR') AS aux_vault
                        FROM state WHERE id = 'current'
                    ");
                    $stmt->execute([':coId' => $coIdInput]);
                    $row = $stmt->fetch();
                    if ($row) {
                        $coCode = '';
                        if (!empty($row['vault_code'])) {
                            $coCode = strtoupper(trim(decodeSecret((string)$row['vault_code'])));
                        } elseif (!empty($row['access_code'])) {
                            $coCode = strtoupper(trim((string)$row['access_code']));
                        }
                        if ($coCode === $code && $coCode !== '') {
                            $matchedCoId = $coIdInput;
                            $companyName = (string)($row['name'] ?? strtoupper($coIdInput));
                            $hasAux = (!empty($row['aux_vault']) || !empty($row['aux_role']));
                        }
                    }
                } else {
                    $stmt = $pdo->query("
                        SELECT 
                            key AS co_id,
                            json_extract(value, '$.accessCode') AS access_code,
                            json_extract(value, '$.authVault.code') AS vault_code,
                            json_extract(value, '$.name') AS name,
                            json_extract(value, '$.roles.AUXILIAR') AS aux_role,
                            json_extract(value, '$.authVault.roles.AUXILIAR') AS aux_vault
                        FROM state, json_each(data, '$.companies')
                        WHERE state.id = 'current'
                    ");
                    while ($row = $stmt->fetch()) {
                        $coCode = '';
                        if (!empty($row['vault_code'])) {
                            $coCode = strtoupper(trim(decodeSecret((string)$row['vault_code'])));
                        } elseif (!empty($row['access_code'])) {
                            $coCode = strtoupper(trim((string)$row['access_code']));
                        }
                        if ($coCode === $code && $coCode !== '') {
                            $matchedCoId = (string)$row['co_id'];
                            $companyName = (string)($row['name'] ?? strtoupper($matchedCoId));
                            $hasAux = (!empty($row['aux_vault']) || !empty($row['aux_role']));
                            break;
                        }
                    }
                }

                if ($matchedCoId !== null) {
                    echo json_encode([
                        'matchedCoId' => $matchedCoId,
                        'companyMeta' => [
                            'hasAux' => $hasAux,
                            'name' => $companyName
                        ]
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                if ($code === 'TEST-0000') {
                    echo json_encode([
                        'matchedCoId' => 'sandbox_master',
                        'companyMeta' => [
                            'hasAux' => true,
                            'name' => 'MARS-X SANDBOX (PRUEBAS)'
                        ]
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                if ($code === 'TEST-1111') {
                    echo json_encode([
                        'matchedCoId' => 'sandbox_student',
                        'companyMeta' => [
                            'hasAux' => true,
                            'name' => 'MARS-X ALUMNO (ESTÁNDAR)'
                        ]
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                if ($code === 'VIP-0000') {
                    echo json_encode([
                        'matchedCoId' => 'vip_reader',
                        'isVip' => true,
                        'companyMeta' => [
                            'hasAux' => false,
                            'isVip' => true,
                            'name' => 'Lector Invitado · Órbita.'
                        ]
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                http_response_code(404);
                echo json_encode(['error' => 'Company code not found']);
                exit;
            }

            // Acción: Verificación de PIN de alumno / departamento (Zero-Heap con json_extract)
            if ($action === 'verify_student_login') {
                $coId = (string)($payload['coId'] ?? '');
                $role = strtoupper(trim((string)($payload['role'] ?? '')));
                $pinAttempt = trim((string)($payload['pin'] ?? ''));

                if ($coId === 'vip_reader' && $role === 'VIP_READER') {
                    $verified = ($pinAttempt === '0000');
                    if ($verified) {
                        try {
                            $pdo->exec("
                                CREATE TABLE IF NOT EXISTS vip_access_log (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    accessed_at INTEGER NOT NULL
                                )
                            ");
                            $pdo->prepare("INSERT INTO vip_access_log (accessed_at) VALUES (:t)")->execute([':t' => time()]);
                        } catch (\Throwable $e) {}
                    }
                    http_response_code($verified ? 200 : 401);
                    echo json_encode([
                        'verified' => $verified,
                        'isVip' => true,
                        'companyName' => 'Órbita. · Lector VIP',
                        'authStamp' => 1,
                        'token' => $verified ? issueSignedSessionToken($pdo, ['typ' => 'V', 'coId' => 'vip_reader', 'role' => 'VIP_READER', 'stamp' => 1]) : null
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                if (!isValidCompanyId($coId) || !isValidStudentRole($role)) {
                    http_response_code(400);
                    echo json_encode(['verified' => false, 'error' => 'INVALID_CREDENTIALS_PARAMS'], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                $stmt = $pdo->prepare("
                    SELECT 
                        json_extract(data, '$.companies.' || :coId || '.roles.' || :role) AS role_pin,
                        json_extract(data, '$.companies.' || :coId || '.authVault.roles.' || :role) AS vault_pin,
                        json_extract(data, '$.companies.' || :coId || '.name') AS name,
                        json_extract(data, '$.companies.' || :coId || '.authUpdatedAt') AS auth_stamp
                    FROM state WHERE id = 'current'
                ");
                $stmt->execute([':coId' => $coId, ':role' => $role]);
                $row = $stmt->fetch();

                if ($coId === 'sandbox_master' && (!$row || empty($row['name']) || $row['name'] === 'SANDBOX_MASTER')) {
                    if (!$row) {
                        $row = [
                            'vault_pin' => '',
                            'role_pin' => '1234',
                            'auth_stamp' => 0
                        ];
                    }
                    $row['name'] = 'MARS-X SANDBOX (PRUEBAS)';
                }
                if ($coId === 'sandbox_student' && (!$row || empty($row['name']) || $row['name'] === 'SANDBOX_STUDENT')) {
                    if (!$row) {
                        $row = [
                            'vault_pin' => '',
                            'role_pin' => '1234',
                            'auth_stamp' => 0
                        ];
                    }
                    $row['name'] = 'MARS-X ALUMNO (ESTÁNDAR)';
                }

                if ($row && $row['name'] !== null) {
                    $expectedPin = '';
                    if (!empty($row['vault_pin'])) {
                        $expectedPin = trim(decodeSecret((string)$row['vault_pin']));
                    } elseif (!empty($row['role_pin']) && strpos((string)$row['role_pin'], 'VLT_') !== 0 && strtoupper(trim((string)$row['role_pin'])) !== 'PROTECTED') {
                        $expectedPin = trim((string)$row['role_pin']);
                    }
                    if (!$expectedPin && ($role !== 'AUXILIAR' || $coId === 'sandbox_master' || $coId === 'sandbox_student')) {
                        $expectedPin = '1234';
                    }
                    $authStamp = (int)($row['auth_stamp'] ?? 0);
                    $verified = ($expectedPin !== '' && $expectedPin === $pinAttempt);

                    if ($verified) {
                        try {
                            $nowStr = date('c');
                            $statStmt = $pdo->prepare("
                                UPDATE state
                                SET data = json_set(
                                    data,
                                    '$.companies.' || :coId || '.loginStats.totalLogins', COALESCE(json_extract(data, '$.companies.' || :coId || '.loginStats.totalLogins'), 0) + 1,
                                    '$.companies.' || :coId || '.loginStats.roles.' || :role || '.count', COALESCE(json_extract(data, '$.companies.' || :coId || '.loginStats.roles.' || :role || '.count'), 0) + 1,
                                    '$.companies.' || :coId || '.loginStats.roles.' || :role || '.lastLogin', :lastLogin,
                                    '$.telemetry.totalLogins', COALESCE(json_extract(data, '$.telemetry.totalLogins'), 0) + 1
                                )
                                WHERE id = 'current'
                                  AND json_extract(data, '$.companies.' || :coId || '.name') IS NOT NULL
                            ");
                            $statStmt->execute([
                                ':coId' => $coId,
                                ':role' => $role,
                                ':lastLogin' => $nowStr
                            ]);
                        } catch (\Exception $e) {}
                        try {
                            $pdo->prepare("
                                UPDATE company_state
                                SET data = json_set(
                                    data,
                                    '$.loginStats.totalLogins', COALESCE(json_extract(data, '$.loginStats.totalLogins'), 0) + 1,
                                    '$.loginStats.roles.' || :role || '.count', COALESCE(json_extract(data, '$.loginStats.roles.' || :role || '.count'), 0) + 1,
                                    '$.loginStats.roles.' || :role || '.lastLogin', :lastLogin
                                )
                                WHERE company_id = :cid
                            ")->execute([
                                ':cid' => $coId,
                                ':role' => $role,
                                ':lastLogin' => $nowStr
                            ]);
                        } catch (\Exception $e) {}
                    }

                    http_response_code($verified ? 200 : 401);
                    echo json_encode([
                        'verified' => $verified,
                        'companyName' => $row['name'] ?? 'EMPRESA',
                        'authStamp' => $authStamp,
                        'token' => $verified ? issueSignedSessionToken($pdo, ['typ' => 'S', 'coId' => $coId, 'role' => $role, 'stamp' => $authStamp]) : null
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                http_response_code(401);
                echo json_encode(['verified' => false]);
                exit;
            }

            // Acción: Verificación de PIN docente en servidor (Zero-Heap con json_extract)
            if ($action === 'verify_teacher_login') {
                $role = (string)($payload['role'] ?? '');
                $pinAttempt = trim((string)($payload['pin'] ?? ''));

                $allowedLoginTeachers = ['COORD_MARIO', 'COORD_ALEX', 'FYQ', 'ECO', 'LYE', 'LEN', 'MAT', 'ING'];
                if (!isValidTeacherRole($role) || (!in_array($role, $allowedLoginTeachers, true) && strpos($role, 'COORD_') !== 0)) {
                    http_response_code(401);
                    echo json_encode(['verified' => false, 'error' => 'INVALID_TEACHER_ROLE'], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                $stmt = $pdo->prepare("
                    SELECT 
                        json_extract(data, '$.config.teachers.' || :role || '.pin') AS pin,
                        json_extract(data, '$.config.teachers.' || :role || '.pinUpdatedAt') AS pin_stamp
                    FROM state WHERE id = 'current'
                ");
                $stmt->execute([':role' => $role]);
                $row = $stmt->fetch();

                $defaultTeacherPins = [
                    'COORD_MARIO' => '0001',
                    'COORD_ALEX' => '0002',
                    'FYQ' => '0101',
                    'ECO' => '0202',
                    'LYE' => '0303',
                    'LEN' => '0404',
                    'MAT' => '0505',
                    'ING' => '0606'
                ];

                $dbPin = $row ? $row['pin'] : null;
                $expectedPin = !empty($dbPin) ? trim((string)$dbPin) : ($defaultTeacherPins[$role] ?? '');
                $pinStamp = (int)($row['pin_stamp'] ?? 0);
                $verified = ($expectedPin !== '' && $expectedPin === $pinAttempt);

                http_response_code($verified ? 200 : 401);
                echo json_encode([
                    'verified' => $verified,
                    'pinStamp' => $pinStamp,
                    'token' => $verified ? issueSignedSessionToken($pdo, ['typ' => 'T', 'role' => $role, 'stamp' => $pinStamp]) : null
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Acción: Forzado de backup SQLite nativo (solo Coordinación)
            if ($action === 'force_backup') {
                $authBackup = verifySession($pdo);
                if (empty($authBackup['isCoordinator'])) {
                    http_response_code(403);
                    echo json_encode(['error' => 'UNAUTHORIZED_BACKUP', 'message' => 'Solo Coordinación puede generar backups en servidor.'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                $stmt = $pdo->query("SELECT data FROM state WHERE id = 'current'");
                $row = $stmt->fetch();
                if ($row && !empty($row['data'])) {
                    $insertStmt = $pdo->prepare("INSERT OR REPLACE INTO state (id, data, updated_at) VALUES (:id, :data, CURRENT_TIMESTAMP)");
                    $insertStmt->execute([':id' => 'backup_daily', ':data' => $row['data']]);
                    if (($payload['type'] ?? '') === 'weekly') {
                        $weeklyId = 'backup_weekly_' . date('Y-m-d');
                        $insertStmt->execute([':id' => $weeklyId, ':data' => $row['data']]);
                    }
                    echo json_encode(['success' => true, 'message' => 'Backup SQLite completado de forma nativa']);
                    exit;
                }
                http_response_code(400);
                echo json_encode(['error' => 'No hay datos en estado corriente']);
                exit;
            }

            // Guardado de Estado: Autorización y Particionado Zero-Trust (v1.1.25)
            $auth = verifySession($pdo);
            if (!empty($auth['isVip'])) {
                http_response_code(403);
                echo json_encode([
                    'error' => 'VIP_READONLY',
                    'message' => 'El acceso VIP-0000 es exclusivamente de lectura del periódico.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $isCoord = !empty($auth['isCoordinator']);
            $isTeacher = !empty($auth['isAdmin']) || !empty($auth['isTeacher']);
            $isStudent = !empty($auth['isStudent']) || !empty($auth['coId']);

            // Permitir guardado a usuarios docentes (materias o coordinación) y a Startups/Alumnos autenticados
            if (!$isTeacher && !$isStudent) {
                http_response_code(403);
                echo json_encode([
                    'error' => 'UNAUTHORIZED_MUTATION',
                    'message' => 'Guardado restringido a sesiones activas de la misión.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            beginImmediateTx($pdo);
            $stmt = $pdo->query("SELECT data FROM state WHERE id = 'current'");
            $row = $stmt->fetch();
            $currentState = $row ? json_decode($row['data'], true) : [];
            if (!is_array($currentState)) {
                $currentState = [];
            }
            ensureTestCompaniesInState($currentState);

            // Reseteo destructivo reservado exclusivamente a roles COORD_*
            if ((($payload['action'] ?? '') === 'reset' || (!empty($payload['resetEpoch']) && !empty($currentState['resetEpoch']) && (int)$payload['resetEpoch'] !== (int)$currentState['resetEpoch'])) && !$isCoord) {
                rollbackQuietly($pdo);
                http_response_code(403);
                echo json_encode([
                    'error' => 'UNAUTHORIZED_RESET',
                    'message' => 'El reseteo destructivo está reservado exclusivamente a roles COORD_*.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $isRestoreBackup = $isCoord && (($payload['action'] ?? '') === 'restore_backup');
            if ($isRestoreBackup) {
                unset($payload['action']);
                // Preservar credenciales maestras si el backup estaba sanitizado
                if (!empty($currentState['config']['teachers']) && (empty($payload['config']['teachers']))) {
                    $payload['config']['teachers'] = $currentState['config']['teachers'];
                }
                if (!empty($currentState['companies']) && is_array($currentState['companies']) && !empty($payload['companies']) && is_array($payload['companies'])) {
                    foreach ($payload['companies'] as $bCid => &$bCo) {
                        if (is_array($bCo) && empty($bCo['authVault']['code']) && !empty($currentState['companies'][$bCid]['authVault'])) {
                            $bCo['authVault'] = $currentState['companies'][$bCid]['authVault'];
                        }
                    }
                    unset($bCo);
                }
                $payload['resetEpoch'] = max((int)($currentState['resetEpoch'] ?? 0), (int)($payload['resetEpoch'] ?? 0)) + 1;
            } else {
                // Unión de tombstones globales en servidor (nunca perder borrados entre docentes ni descartes de avisos)
                foreach (['deletedCatalogIds', 'deletedSuggestionIds', 'deletedPendingCustomIds'] as $gTombKey) {
                    $currTomb = is_array($currentState[$gTombKey] ?? null) ? $currentState[$gTombKey] : [];
                    $incTomb = ($isTeacher && is_array($payload[$gTombKey] ?? null)) ? $payload[$gTombKey] : [];
                    $payload[$gTombKey] = array_values(array_unique(array_map('strval', array_merge($currTomb, $incTomb))));
                }
                // Tombstones y artículos de ORBITAL REPORT (news / officialNews): escritura exclusiva de Coordinación (COORD_*)
                $currNewsTomb = array_merge(
                    is_array($currentState['deletedNewsIds'] ?? null) ? $currentState['deletedNewsIds'] : [],
                    is_array($currentState['deletedOfficialNewsIds'] ?? null) ? $currentState['deletedOfficialNewsIds'] : []
                );
                $incNewsTomb = $isCoord ? array_merge(
                    is_array($payload['deletedNewsIds'] ?? null) ? $payload['deletedNewsIds'] : [],
                    is_array($payload['deletedOfficialNewsIds'] ?? null) ? $payload['deletedOfficialNewsIds'] : []
                ) : [];
                $mergedNewsTomb = array_values(array_unique(array_map('strval', array_merge($currNewsTomb, $incNewsTomb))));
                $payload['deletedNewsIds'] = $mergedNewsTomb;
                $payload['deletedOfficialNewsIds'] = $mergedNewsTomb;

                $currPrintTomb = is_array($currentState['deletedPrintEditionIds'] ?? null) ? $currentState['deletedPrintEditionIds'] : [];
                $incPrintTomb = ($isCoord && is_array($payload['deletedPrintEditionIds'] ?? null)) ? $payload['deletedPrintEditionIds'] : [];
                $mergedPrintTomb = array_values(array_unique(array_map('strval', array_merge($currPrintTomb, $incPrintTomb))));
                $payload['deletedPrintEditionIds'] = $mergedPrintTomb;
                if (!$isCoord) {
                    if (isset($currentState['printEditions'])) {
                        $payload['printEditions'] = $currentState['printEditions'];
                    }
                    if (isset($currentState['printAdLibrary'])) {
                        $payload['printAdLibrary'] = $currentState['printAdLibrary'];
                    }
                    if (isset($currentState['realCompanyLogos'])) {
                        $payload['realCompanyLogos'] = $currentState['realCompanyLogos'];
                    }
                    if (isset($currentState['realCompanyLogosUpdatedAt'])) {
                        $payload['realCompanyLogosUpdatedAt'] = $currentState['realCompanyLogosUpdatedAt'];
                    }
                } else {
                    $currLogos = (isset($currentState['realCompanyLogos']) && is_array($currentState['realCompanyLogos'])) ? $currentState['realCompanyLogos'] : [];
                    $incLogos = (isset($payload['realCompanyLogos']) && is_array($payload['realCompanyLogos'])) ? $payload['realCompanyLogos'] : [];
                    $mergedLogos = $currLogos;
                    foreach ($incLogos as $k => $v) {
                        $kStr = (string)$k;
                        $vStr = is_string($v) ? trim($v) : '';
                        if ($vStr === '') {
                            $mergedLogos[$kStr] = '';
                        } else {
                            $mergedLogos[$kStr] = $vStr;
                        }
                    }
                    $payload['realCompanyLogos'] = $mergedLogos;
                    $payload['realCompanyLogosUpdatedAt'] = max(
                        (int)($currentState['realCompanyLogosUpdatedAt'] ?? 0),
                        (int)($payload['realCompanyLogosUpdatedAt'] ?? 0)
                    );
                    if (isset($payload['printEditions']) && is_array($payload['printEditions'])) {
                        $delPrintSet = array_flip($mergedPrintTomb);
                        $payload['printEditions'] = array_values(array_filter($payload['printEditions'], function ($pe) use ($delPrintSet) {
                            return is_array($pe) && !empty($pe['id']) && !isset($delPrintSet[(string)$pe['id']]);
                        }));
                    }
                }
                if (!$isCoord) {
                    if (isset($currentState['news'])) {
                        $payload['news'] = $currentState['news'];
                    }
                    if (!isset($payload['config']) || !is_array($payload['config'])) {
                        $payload['config'] = [];
                    }
                    if (isset($currentState['config']['orbita'])) {
                        $payload['config']['orbita'] = $currentState['config']['orbita'];
                    } else {
                        unset($payload['config']['orbita']);
                    }
                } elseif (isset($payload['news']) && is_array($payload['news'])) {
                    $delNewsSet = array_flip($mergedNewsTomb);
                    $payload['news'] = array_values(array_filter($payload['news'], function ($it) use ($delNewsSet) {
                        return is_array($it) && !empty($it['id']) && !isset($delNewsSet[(string)$it['id']]);
                    }));
                }
                unset($payload['officialNews']);
                $currDismissed = is_array($currentState['dismissedNotificationIds'] ?? null) ? $currentState['dismissedNotificationIds'] : [];
                $incDismissed = is_array($payload['dismissedNotificationIds'] ?? null) ? $payload['dismissedNotificationIds'] : [];
                $payload['dismissedNotificationIds'] = array_values(array_unique(array_map('strval', array_merge($currDismissed, $incDismissed))));
                if ($isTeacher && is_array($payload['catalog'] ?? null) && !empty($payload['deletedCatalogIds'])) {
                    $recreatedCatIds = [];
                    foreach ($payload['catalog'] as $cIt) {
                        if (is_array($cIt) && !empty($cIt['recreatedAt']) && !empty($cIt['id'])) {
                            $recreatedCatIds[(string)$cIt['id']] = true;
                        }
                    }
                    if (!empty($recreatedCatIds)) {
                        $payload['deletedCatalogIds'] = array_values(array_filter($payload['deletedCatalogIds'], function ($did) use ($recreatedCatIds) {
                            return !isset($recreatedCatIds[(string)$did]);
                        }));
                    }
                }
            }

            // Si es un Alumno/Empresa (NO docente), blindar la configuración global, tombstones globales y resto de empresas
            if (!$isTeacher && !$isRestoreBackup) {
                // 1. Prohibir a alumnos alterar la configuración, fechas límite, resetEpoch ni listas globales de borrado/noticias
                if (isset($currentState['config'])) {
                    $payload['config'] = $currentState['config'];
                }
                if (isset($currentState['resetEpoch'])) {
                    $payload['resetEpoch'] = $currentState['resetEpoch'];
                }
                if (isset($currentState['officialNews'])) {
                    $payload['officialNews'] = $currentState['officialNews'];
                }
                if (isset($currentState['deletedCompanyIds'])) {
                    $payload['deletedCompanyIds'] = $currentState['deletedCompanyIds'];
                }
                // 2. Prohibir a alumnos alterar el catálogo oficial ni colecciones globales de evaluación/concurso
                if (isset($currentState['catalog'])) {
                    $payload['catalog'] = $currentState['catalog'];
                }
                foreach (['pressReleases', 'finalContest', 'telemetry', 'loginStats'] as $globalROKey) {
                    if (isset($currentState[$globalROKey])) {
                        $payload[$globalROKey] = $currentState[$globalROKey];
                    }
                }
                $dirtyCompanyIds = [];
                // 3. Si el alumno tiene empresa fijada, aislar el resto de empresas competidoras y proteger campos docentes propios
                $studentCoId = $auth['coId'] ?? null;
                if ($studentCoId) {
                    $dirtyCompanyIds[(string)$studentCoId] = true;
                    // Preservar solicitudes I+D especiales (pendingCustom) de otras startups y filtrar eliminadas
                    $delPcSet = array_flip($payload['deletedPendingCustomIds'] ?? []);
                    $currPc = is_array($currentState['pendingCustom'] ?? null) ? $currentState['pendingCustom'] : [];
                    $incPc = is_array($payload['pendingCustom'] ?? null) ? $payload['pendingCustom'] : [];
                    $otherPc = array_filter($currPc, function ($it) use ($studentCoId, $delPcSet) {
                        if (!is_array($it)) return false;
                        $pid = (string)($it['id'] ?? '');
                        if ($pid !== '' && isset($delPcSet[$pid])) return false;
                        $owner = (string)($it['company'] ?? $it['coId'] ?? '');
                        return $owner !== '' && $owner !== (string)$studentCoId;
                    });
                    $ownPc = array_filter($incPc, function ($it) use ($studentCoId, $delPcSet) {
                        if (!is_array($it)) return false;
                        $pid = (string)($it['id'] ?? '');
                        if ($pid !== '' && isset($delPcSet[$pid])) return false;
                        $owner = (string)($it['company'] ?? $it['coId'] ?? '');
                        return $owner === (string)$studentCoId;
                    });
                    $payload['pendingCustom'] = array_values(array_merge($otherPc, $ownPc));
                }
                if ($studentCoId && isset($currentState['companies']) && is_array($currentState['companies'])) {
                    foreach ($currentState['companies'] as $otherCid => $otherCo) {
                        if ($otherCid !== $studentCoId) {
                            $payload['companies'][$otherCid] = $otherCo;
                        } elseif (is_array($otherCo) && isset($payload['companies'][$studentCoId]) && is_array($payload['companies'][$studentCoId])) {
                            $incCo = &$payload['companies'][$studentCoId];
                            foreach (['grades', 'sanctions', 'unlockAllContracts'] as $docField) {
                                if (array_key_exists($docField, $otherCo)) {
                                    $incCo[$docField] = $otherCo[$docField];
                                }
                            }
                            $sSpTs = (int)($otherCo['sponsorUpdatedAt'] ?? $otherCo['sponsorData']['updatedAt'] ?? 0);
                            $lSpTs = (int)($incCo['sponsorUpdatedAt'] ?? $incCo['sponsorData']['updatedAt'] ?? 0);
                            if (($sSpTs > 0 && $sSpTs >= $lSpTs) || (!empty($otherCo['sponsorAwarded']) && $lSpTs === 0)) {
                                $incCo['sponsorAwarded'] = $otherCo['sponsorAwarded'] ?? null;
                                if (array_key_exists('sponsorData', $otherCo)) $incCo['sponsorData'] = $otherCo['sponsorData'];
                                if ($sSpTs > 0) $incCo['sponsorUpdatedAt'] = $sSpTs;
                            }
                            if (isset($otherCo['launchLicense']) && is_array($otherCo['launchLicense'])) {
                                $sLic = $otherCo['launchLicense'];
                                $lLic = is_array($incCo['launchLicense'] ?? null) ? $incCo['launchLicense'] : [];
                                $sLicDecTs = max((int)($sLic['approvedAt'] ?? 0), (int)($sLic['rejectedAt'] ?? 0));
                                $lLicAppTs = (int)($lLic['appliedAt'] ?? 0);
                                if (in_array($sLic['status'] ?? '', ['APROBADA', 'APROBADO'], true) || ($sLicDecTs > 0 && $sLicDecTs >= $lLicAppTs)) {
                                    $incCo['launchLicense'] = $sLic;
                                }
                            }
                            if (isset($otherCo['contracts']) && is_array($otherCo['contracts'])) {
                                $incCont = is_array($incCo['contracts'] ?? null) ? $incCo['contracts'] : [];
                                foreach ($otherCo['contracts'] as $ph => $sC) {
                                    if (is_array($sC) && !empty($sC['settledAt'])) {
                                        $incCont[$ph] = $sC;
                                    }
                                }
                                $incCo['contracts'] = $incCont;
                            }
                            // Proteger entregables devueltos o revisados por docente (LWW)
                            if (isset($otherCo['deliverables']) && is_array($otherCo['deliverables'])) {
                                $incCo['deliverables'] = is_array($incCo['deliverables'] ?? null) ? $incCo['deliverables'] : [];
                                foreach ($otherCo['deliverables'] as $dKey => $sDel) {
                                    if (!is_array($sDel)) continue;
                                    $lDel = is_array($incCo['deliverables'][$dKey] ?? null) ? $incCo['deliverables'][$dKey] : null;
                                    $sDT = parseMsTimestamp($sDel['updatedAt'] ?? 0);
                                    $lDT = $lDel ? parseMsTimestamp($lDel['updatedAt'] ?? 0) : 0;
                                    if (!$lDel || $sDT > $lDT || (!empty($sDel['returnByTeacher']) && $sDT >= $lDT)) {
                                        $incCo['deliverables'][$dKey] = $sDel;
                                    }
                                }
                            }
                            // Proteger Notas de Prensa DOC_15 (devoluciones docentes y portadas Nano Banana)
                            if (isset($otherCo['pressReleases']) && is_array($otherCo['pressReleases'])) {
                                $incCo['pressReleases'] = is_array($incCo['pressReleases'] ?? null) ? $incCo['pressReleases'] : [];
                                $getPrTs = function ($p) {
                                    return is_array($p) ? max((int)($p['updatedAt'] ?? 0), (int)($p['returnedAt'] ?? 0), (int)($p['publishedAt'] ?? 0), (int)($p['ceoValidatedAt'] ?? 0)) : 0;
                                };
                                foreach ($otherCo['pressReleases'] as $ph => $sPr) {
                                    if (!is_array($sPr)) continue;
                                    $lPr = $incCo['pressReleases'][$ph] ?? null;
                                    if (!$lPr || $getPrTs($sPr) > $getPrTs($lPr) || (($sPr['status'] ?? '') === 'RETURNED' && $getPrTs($sPr) >= $getPrTs($lPr))) {
                                        $incCo['pressReleases'][$ph] = $sPr;
                                    }
                                }
                            }
                            // Proteger Nombre Social / Modificación Estatutaria y Marca (DOC_1 / DOC_11)
                            $sNameTs = (int)($otherCo['nameUpdatedAt'] ?? 0);
                            $lNameTs = (int)($incCo['nameUpdatedAt'] ?? 0);
                            if ($sNameTs > $lNameTs) {
                                if (!empty($otherCo['name'])) $incCo['name'] = $otherCo['name'];
                                if (isset($otherCo['previousNames'])) $incCo['previousNames'] = $otherCo['previousNames'];
                                $incCo['nameUpdatedAt'] = $sNameTs;
                            }
                            if (isset($otherCo['nameChangeRequest']) && is_array($otherCo['nameChangeRequest'])) {
                                $getNcrTs = function ($r) {
                                    return is_array($r) ? max((int)($r['resolvedAt'] ?? 0), (int)($r['updatedAt'] ?? 0), (int)($r['requestedAt'] ?? 0), (int)($r['rejectedAt'] ?? 0), (int)($r['dismissedAt'] ?? 0)) : 0;
                                };
                                if (!isset($incCo['nameChangeRequest']) || $getNcrTs($otherCo['nameChangeRequest']) >= $getNcrTs($incCo['nameChangeRequest'])) {
                                    $incCo['nameChangeRequest'] = $otherCo['nameChangeRequest'];
                                }
                            }
                            $sBrandTs = max((int)($otherCo['brandUpdatedAt'] ?? 0), (int)($otherCo['brandApproval']['updatedAt'] ?? 0));
                            $lBrandTs = max((int)($incCo['brandUpdatedAt'] ?? 0), (int)($incCo['brandApproval']['updatedAt'] ?? 0));
                            if ($sBrandTs > $lBrandTs) {
                                if (isset($otherCo['brandApproval'])) $incCo['brandApproval'] = $otherCo['brandApproval'];
                                if (isset($otherCo['brandStatus'])) $incCo['brandStatus'] = $otherCo['brandStatus'];
                                if (array_key_exists('logo', $otherCo)) $incCo['logo'] = $otherCo['logo'];
                                if (array_key_exists('slogan', $otherCo)) $incCo['slogan'] = $otherCo['slogan'];
                                $incCo['brandUpdatedAt'] = $sBrandTs;
                            }
                            // Proteger Buzón HR (DOC_2) resuelto por docente y Solicitudes I+D (DOC_13)
                            if (isset($otherCo['inactivityReports']) && is_array($otherCo['inactivityReports'])) {
                                $hrMap = [];
                                foreach (($incCo['inactivityReports'] ?? []) as $h) {
                                    if (is_array($h) && !empty($h['id'])) $hrMap[(string)$h['id']] = $h;
                                }
                                $getHrTs = function ($h) {
                                    return max((int)($h['resolvedAt'] ?? 0), (int)($h['updatedAt'] ?? 0), (int)($h['warnedAt'] ?? 0), (int)($h['timestamp'] ?? 0));
                                };
                                foreach ($otherCo['inactivityReports'] as $sH) {
                                    if (!is_array($sH) || empty($sH['id'])) continue;
                                    $hid = (string)$sH['id'];
                                    if (!isset($hrMap[$hid]) || $getHrTs($sH) >= $getHrTs($hrMap[$hid])) {
                                        $hrMap[$hid] = $sH;
                                    }
                                }
                                $incCo['inactivityReports'] = array_values($hrMap);
                            }
                            if (isset($otherCo['specialItemRequests']) && is_array($otherCo['specialItemRequests'])) {
                                $spMap = [];
                                foreach (($incCo['specialItemRequests'] ?? []) as $sp) {
                                    if (is_array($sp) && !empty($sp['id'])) $spMap[(string)$sp['id']] = $sp;
                                }
                                $getSpTs2 = function ($r) {
                                    return max((int)($r['resolvedAt'] ?? 0), (int)($r['updatedAt'] ?? 0), (int)($r['resubmittedAt'] ?? 0), (int)($r['rejectedAt'] ?? 0), (int)($r['approvedAt'] ?? 0), (int)($r['createdAt'] ?? 0));
                                };
                                foreach ($otherCo['specialItemRequests'] as $sSp) {
                                    if (!is_array($sSp) || empty($sSp['id'])) continue;
                                    $spId = (string)$sSp['id'];
                                    if (!isset($spMap[$spId]) || $getSpTs2($sSp) >= $getSpTs2($spMap[$spId])) {
                                        $spMap[$spId] = $sSp;
                                    }
                                }
                                $incCo['specialItemRequests'] = array_values($spMap);
                            }
                            unset($incCo);
                        }
                    }

                    // Propagación controlada cross-company cuando Finanzas del comprador bloquea una compra B2B (EN_ADUANA)
                    $currContractIds = [];
                    foreach (($currentState['b2bContracts'] ?? []) as $cc) {
                        if (is_array($cc) && !empty($cc['id'])) $currContractIds[(string)$cc['id']] = true;
                    }
                    $nowB2B = round(microtime(true) * 1000);
                    foreach (($payload['b2bContracts'] ?? []) as $nc) {
                        if (!is_array($nc) || empty($nc['id']) || isset($currContractIds[(string)$nc['id']])) continue;
                        if ((string)($nc['buyerCoId'] ?? '') !== (string)$studentCoId || ($nc['status'] ?? '') !== 'PENDIENTE_ADUANA') continue;
                        $offerId = (string)($nc['offerId'] ?? '');
                        $sellerCid = (string)($nc['sellerCoId'] ?? '');
                        $itemNameB2B = (string)($nc['itemName'] ?? 'Componente B2B');
                        $buyerNameB2B = (string)($nc['buyerName'] ?? $studentCoId);
                        $priceB2B = (float)($nc['price'] ?? 0);

                        if ($sellerCid !== '' && $sellerCid !== (string)$studentCoId && isset($payload['companies'][$sellerCid]) && is_array($payload['companies'][$sellerCid])) {
                            $sellerNotifs = is_array($payload['companies'][$sellerCid]['notifications'] ?? null) ? $payload['companies'][$sellerCid]['notifications'] : [];
                            $alreadyNotified = false;
                            foreach ($sellerNotifs as $sn) {
                                if (is_array($sn) && ($sn['b2bOfferId'] ?? '') === $offerId && $offerId !== '') {
                                    $alreadyNotified = true;
                                    break;
                                }
                            }
                            if (!$alreadyNotified) {
                                array_unshift($sellerNotifs, [
                                    'id' => 'NTF-B2B-' . $nowB2B . '-' . substr(md5($offerId . $sellerCid), 0, 5),
                                    'b2bOfferId' => $offerId,
                                    'role' => 'TECNICO',
                                    'message' => "🤝 ¡Oferta adquirida! {$buyerNameB2B} ha bloqueado \"{$itemNameB2B}\" por " . number_format($priceB2B, 2, '.', '') . " €v. Pendiente de validación en Aduana Docente.",
                                    'type' => 'info',
                                    'target' => ['view' => 'market'],
                                    'date' => date('d/m/Y, H:i:s'),
                                    'timestamp' => $nowB2B,
                                    'read' => false
                                ]);
                                $payload['companies'][$sellerCid]['notifications'] = array_slice($sellerNotifs, 0, 150);
                                $payload['companies'][$sellerCid]['updatedAt'] = $nowB2B;
                                $dirtyCompanyIds[$sellerCid] = true;
                            }
                        }

                        if ($offerId !== '') {
                            foreach ($payload['companies'] as $oCid => &$oCo) {
                                if ((string)$oCid === (string)$studentCoId || !is_array($oCo)) continue;
                                $changedComp = false;
                                if (!empty($oCo['orders']) && is_array($oCo['orders'])) {
                                    foreach ($oCo['orders'] as &$oOrd) {
                                        if (is_array($oOrd) && ($oOrd['offerId'] ?? '') === $offerId && ($oOrd['status'] ?? '') === 'PENDIENTE_FINANZAS') {
                                            $oOrd['status'] = 'CANCELADO_OTRA_EMPRESA';
                                            $oOrd['cancelledAt'] = $nowB2B;
                                            $oOrd['updatedAt'] = $nowB2B;
                                            $changedComp = true;
                                        }
                                    }
                                    unset($oOrd);
                                }
                                if ($changedComp) {
                                    $oCo['updatedAt'] = $nowB2B;
                                    $dirtyCompanyIds[(string)$oCid] = true;
                                }
                            }
                            unset($oCo);
                        }
                    }
                }
            } else {
                // Filtrar borrados definitivos de catálogo y solicitudes especiales en guardados docentes
                if (is_array($payload['catalog'] ?? null) && !empty($payload['deletedCatalogIds'])) {
                    $delCatSet = array_flip($payload['deletedCatalogIds']);
                    $payload['catalog'] = array_values(array_filter($payload['catalog'], function ($it) use ($delCatSet) {
                        return is_array($it) && !isset($delCatSet[(string)($it['id'] ?? '')]);
                    }));
                }
                if (is_array($payload['pendingCustom'] ?? null) && !empty($payload['deletedPendingCustomIds'])) {
                    $delPcSet = array_flip($payload['deletedPendingCustomIds']);
                    $payload['pendingCustom'] = array_values(array_filter($payload['pendingCustom'], function ($it) use ($delPcSet) {
                        return is_array($it) && !isset($delPcSet[(string)($it['id'] ?? '')]);
                    }));
                }
            }

            // Blindaje Fase V (finalContest): escritura reservada exclusivamente a roles COORD_*
            if (!$isCoord) {
                if (isset($currentState['finalContest'])) {
                    $payload['finalContest'] = $currentState['finalContest'];
                } else {
                    unset($payload['finalContest']);
                }
            } elseif (!empty($currentState['finalContest']) && !empty($payload['finalContest']) && is_array($currentState['finalContest']) && is_array($payload['finalContest'])) {
                $currFcUpd = (int)($currentState['finalContest']['updatedAt'] ?? 0);
                $incFcUpd = (int)($payload['finalContest']['updatedAt'] ?? 0);
                if ($currFcUpd > $incFcUpd) {
                    $payload['finalContest'] = $currentState['finalContest'];
                }
            }

            // Fusión de Secretos en Servidor (Evitar que el payload sanitizado borre PINs)
            $defaultTeacherPins = [
                'COORD_MARIO' => '0001',
                'COORD_ALEX' => '0002',
                'FYQ' => '0101',
                'ECO' => '0202',
                'LYE' => '0303',
                'LEN' => '0404',
                'MAT' => '0505',
                'ING' => '0606'
            ];
            if (isset($payload['config']['teachers']) && is_array($payload['config']['teachers'])) {
                unset($payload['config']['teachers']['BIO']);
                foreach ($payload['config']['teachers'] as $tk => &$t) {
                    if (!empty($currentState['config']['teachers'][$tk]['pin'])) {
                        $t['pin'] = $currentState['config']['teachers'][$tk]['pin'];
                    } elseif (empty($t['pin'])) {
                        $t['pin'] = $defaultTeacherPins[$tk] ?? '1234';
                    }
                }
                if (isset($currentState['config']['teachers']) && is_array($currentState['config']['teachers'])) {
                    foreach ($currentState['config']['teachers'] as $tk => $ct) {
                        if ($tk === 'BIO') continue;
                        if (!isset($payload['config']['teachers'][$tk])) {
                            $payload['config']['teachers'][$tk] = $ct;
                        }
                    }
                }
            } elseif (isset($currentState['config'])) {
                $payload['config'] = $currentState['config'];
                if (isset($payload['config']['teachers']) && is_array($payload['config']['teachers'])) {
                    unset($payload['config']['teachers']['BIO']);
                }
            }

            // Protección granular LWW de config.deliverableSchedule, config.deadlines, config.scheduleBaselineVersion y config.guidelines
            if ($isTeacher && isset($currentState['config']) && is_array($currentState['config'])) {
                $currCfg = $currentState['config'];
                $incCfg = is_array($payload['config'] ?? null) ? $payload['config'] : [];
                $currCfgUpdated = (int)($currCfg['updatedAt'] ?? 0);
                $incCfgUpdated = (int)($incCfg['updatedAt'] ?? 0);

                $currBaseline = (int)($currCfg['scheduleBaselineVersion'] ?? 0);
                $incBaseline = (int)($incCfg['scheduleBaselineVersion'] ?? 0);
                $incCfg['scheduleBaselineVersion'] = max($currBaseline, $incBaseline);

                $currSched = is_array($currCfg['deliverableSchedule'] ?? null) ? $currCfg['deliverableSchedule'] : [];
                $incSched = is_array($incCfg['deliverableSchedule'] ?? null) ? $incCfg['deliverableSchedule'] : [];
                $mergedSched = [];
                $allSchedKeys = array_unique(array_merge(array_keys($currSched), array_keys($incSched)));

                foreach ($allSchedKeys as $dKey) {
                    $cItem = is_array($currSched[$dKey] ?? null) ? $currSched[$dKey] : null;
                    $iItem = is_array($incSched[$dKey] ?? null) ? $incSched[$dKey] : null;
                    if ($cItem && !$iItem) {
                        $mergedSched[$dKey] = $cItem;
                    } elseif (!$cItem && $iItem) {
                        $mergedSched[$dKey] = $iItem;
                    } elseif ($cItem && $iItem) {
                        $cUpd = (int)($cItem['updatedAt'] ?? 0);
                        $iUpd = (int)($iItem['updatedAt'] ?? 0);
                        if ($cUpd > $iUpd) {
                            $mergedSched[$dKey] = $cItem;
                        } elseif ($iUpd > $cUpd) {
                            $mergedSched[$dKey] = $iItem;
                        } else {
                            $cHasExplicit = !empty($cItem['guideDocUrl']) || !empty($cItem['clearedGuide']);
                            $iHasExplicit = !empty($iItem['guideDocUrl']) || !empty($iItem['clearedGuide']);
                            $mergedSched[$dKey] = ($cHasExplicit && !$iHasExplicit) ? $cItem : $iItem;
                        }
                    }
                }
                if (!empty($mergedSched)) {
                    $incCfg['deliverableSchedule'] = $mergedSched;
                }

                $currDeadlines = is_array($currCfg['deadlines'] ?? null) ? $currCfg['deadlines'] : [];
                $incDeadlines = is_array($incCfg['deadlines'] ?? null) ? $incCfg['deadlines'] : [];
                $mergedDeadlines = ($currCfgUpdated > $incCfgUpdated)
                    ? array_merge($incDeadlines, $currDeadlines)
                    : array_merge($currDeadlines, $incDeadlines);
                foreach ($mergedSched as $dKey => $sItem) {
                    if (!empty($sItem['deadline'])) {
                        $mergedDeadlines[$dKey] = $sItem['deadline'];
                    }
                }
                $incCfg['deadlines'] = $mergedDeadlines;

                if ($currCfgUpdated > $incCfgUpdated && isset($currCfg['guidelines'])) {
                    $incCfg['guidelines'] = $currCfg['guidelines'];
                }
                $incCfg['updatedAt'] = max($currCfgUpdated, $incCfgUpdated);
                $payload['config'] = $incCfg;
            }

            // Manejo de deletedCompanyIds (Lista negra persistente de startups eliminadas)
            $allDeletedCompanyIds = array_values(array_unique(array_map('strval', array_merge(
                is_array($currentState['deletedCompanyIds'] ?? null) ? $currentState['deletedCompanyIds'] : [],
                is_array($payload['deletedCompanyIds'] ?? null) ? $payload['deletedCompanyIds'] : []
            ))));
            $payload['deletedCompanyIds'] = $allDeletedCompanyIds;
            $currentState['deletedCompanyIds'] = $allDeletedCompanyIds;

            foreach ($allDeletedCompanyIds as $delCid) {
                if (isset($currentState['companies'][$delCid])) {
                    unset($currentState['companies'][$delCid]);
                }
                if (isset($payload['companies'][$delCid])) {
                    unset($payload['companies'][$delCid]);
                }
                if (isset($currentState['finalContest']) && is_array($currentState['finalContest'])) {
                    purgeCompanyFromFinalContest($currentState['finalContest'], (string)$delCid);
                }
                if (isset($payload['finalContest']) && is_array($payload['finalContest'])) {
                    purgeCompanyFromFinalContest($payload['finalContest'], (string)$delCid);
                }
                try {
                    $pdo->prepare("DELETE FROM company_state WHERE company_id = :cid")->execute([':cid' => $delCid]);
                } catch (\Exception $e) {}
            }

            if (!$isRestoreBackup && isset($payload['companies']) && is_array($payload['companies'])) {
                foreach ($payload['companies'] as $cid => &$co) {
                    $sCo = $currentState['companies'][$cid] ?? null;
                    if ($sCo) {
                        $coordHasUpdatedAuth = $isCoord && !empty($co['authUpdatedAt']) && (!isset($sCo['authUpdatedAt']) || $co['authUpdatedAt'] >= $sCo['authUpdatedAt']);
                        if (!$coordHasUpdatedAuth) {
                            if (!empty($sCo['authVault']['code']) || !empty($sCo['authVault']['roles'])) {
                                $co['authVault'] = $sCo['authVault'];
                            }
                            if (!empty($sCo['accessCode'])) $co['accessCode'] = $sCo['accessCode'];
                            if (!empty($sCo['roles'])) $co['roles'] = $sCo['roles'];
                            if (!empty($sCo['authUpdatedAt'])) $co['authUpdatedAt'] = $sCo['authUpdatedAt'];
                        }
                        $clientResetNewer = ((int)($co['resetAt'] ?? 0) > (int)($sCo['resetAt'] ?? 0));
                        if (!$clientResetNewer && !empty($sCo['loginStats']) && is_array($sCo['loginStats'])) {
                            $co['loginStats'] = mergeLoginStatsArr($sCo['loginStats'], is_array($co['loginStats'] ?? null) ? $co['loginStats'] : []);
                        }
                        // Unión e imposición de tombstones contables (deletedLedgerTxIds) para impedir resurrección de asientos rectificados
                        $sDelTx = is_array($sCo['deletedLedgerTxIds'] ?? null) ? $sCo['deletedLedgerTxIds'] : [];
                        $iDelTx = ($isTeacher && is_array($co['deletedLedgerTxIds'] ?? null)) ? $co['deletedLedgerTxIds'] : [];
                        $mergedDelTx = array_values(array_unique(array_map('strval', array_merge($sDelTx, $iDelTx))));
                        if (!empty($mergedDelTx)) {
                            $co['deletedLedgerTxIds'] = $mergedDelTx;
                            if (isset($co['ledger']) && is_array($co['ledger'])) {
                                $delTxSet = array_flip($mergedDelTx);
                                $origCount = count($co['ledger']);
                                $filteredLedger = [];
                                $seenTx = [];
                                $baseInit = (isset($co['initialBalance']) && is_numeric($co['initialBalance']))
                                    ? (float)$co['initialBalance']
                                    : ((isset($sCo['initialBalance']) && is_numeric($sCo['initialBalance'])) ? (float)$sCo['initialBalance'] : 2400.0);
                                $sumDelta = 0.0;
                                foreach ($co['ledger'] as $tx) {
                                    if (!is_array($tx)) continue;
                                    $txId = (string)($tx['id'] ?? $tx['tx_id'] ?? '');
                                    if ($txId !== '' && isset($delTxSet[$txId])) continue;
                                    $filteredLedger[] = $tx;
                                    if ($txId !== '' && !isset($seenTx[$txId])) {
                                        $seenTx[$txId] = true;
                                        $sumDelta += (float)($tx['delta'] ?? 0);
                                    }
                                }
                                if (count($filteredLedger) !== $origCount) {
                                    $co['ledger'] = $filteredLedger;
                                    $co['balance'] = round($baseInit + $sumDelta, 2);
                                }
                            }
                        }
                    }
                }
            } elseif (isset($currentState['companies'])) {
                $payload['companies'] = $currentState['companies'];
            }
            ensureTestCompaniesInState($payload);

            // Control Optimista Estricto de Concurrencia
            $serverVersion = isset($currentState['version']) ? (int)$currentState['version'] : 0;
            $incomingVersion = $payload['version'] ?? null;

            if (!$isRestoreBackup && (!is_numeric($incomingVersion) || (int)$incomingVersion <= $serverVersion)) {
                rollbackQuietly($pdo);
                http_response_code(409);
                echo json_encode([
                    'error' => 'CONFLICT',
                    'serverVersion' => $serverVersion,
                    'message' => 'Versión obsoleta o ausente. Conflicto de concurrencia detectado.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $nowMs = round(microtime(true) * 1000);
            $prevSharedUpdatedAt = (int)($currentState['sharedUpdatedAt'] ?? $currentState['lastUpdated'] ?? 0);
            $sharedChanged = ($isTeacher || $isRestoreBackup);
            if (!$sharedChanged) {
                foreach (['b2bMarket', 'b2bContracts', 'pendingCustom', 'suggestions', 'suggestionsToAlex', 'securityIncidents'] as $sharedKey) {
                    $prevJson = json_encode($currentState[$sharedKey] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    $nextJson = json_encode($payload[$sharedKey] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    if ($prevJson !== $nextJson) {
                        $sharedChanged = true;
                        break;
                    }
                }
            }
            $payload['sharedUpdatedAt'] = $sharedChanged ? $nowMs : $prevSharedUpdatedAt;
            $payload['version'] = $serverVersion + 1;
            $payload['lastUpdated'] = $nowMs;
            $jsonString = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

            $saveStmt = $pdo->prepare("INSERT OR REPLACE INTO state (id, data, updated_at) VALUES ('current', :data, CURRENT_TIMESTAMP)");
            $saveStmt->execute([':data' => $jsonString]);

            // Sincronizar la tabla company_state dentro de la misma transacción (solo empresas modificadas cuando guarda un alumno)
            if (!empty($payload['companies']) && is_array($payload['companies'])) {
                if ($isRestoreBackup) {
                    $pdo->exec("DELETE FROM company_state");
                }
                $coStmt = $pdo->prepare("
                    INSERT OR REPLACE INTO company_state (company_id, data, version, updated_at)
                    VALUES (:cid, :data, :version, :updated_at)
                ");
                $syncVer = (int)$payload['version'];
                $syncTargets = (!$isTeacher && !$isRestoreBackup && !empty($dirtyCompanyIds))
                    ? array_keys($dirtyCompanyIds)
                    : array_keys($payload['companies']);
                foreach ($syncTargets as $compCid) {
                    if (!isset($payload['companies'][$compCid]) || !is_array($payload['companies'][$compCid])) continue;
                    $compData = $payload['companies'][$compCid];
                    $coStmt->execute([
                        ':cid' => $compCid,
                        ':data' => json_encode($compData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        ':version' => $syncVer,
                        ':updated_at' => (int)($compData['updatedAt'] ?? $payload['lastUpdated'] ?? $nowMs)
                    ]);
                }
            }
            commitTx($pdo);

            $savedCfgUpdated = (int)($payload['config']['updatedAt'] ?? 0);
            $savedETag = 'W/"v-' . $payload['version'] . '-' . $savedCfgUpdated . '-' . ($isCoord ? 'coord' : 'pub') . '"';
            header('ETag: ' . $savedETag);
            header('Cache-Control: private, no-cache');
            header('Vary: X-Marsket-Auth');
            echo json_encode([
                'success' => true,
                'version' => $payload['version'],
                'configUpdatedAt' => $savedCfgUpdated,
                'sharedUpdatedAt' => $payload['sharedUpdatedAt'],
                'etag' => $savedETag
            ]);
            exit;
        }

        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        exit;
    }

    // -------------------------------------------------------------------------
        // -------------------------------------------------------------------------
    // A2. ENDPOINT: /api/company/:cid/version (Sondeo Reactivo 3s ETag - v1.1.11)
    // -------------------------------------------------------------------------
    if (preg_match('#^company/([^/]+)/version$#', $endpoint, $matches)) {
        $cid = $matches[1];
        if ($method === 'OPTIONS') { http_response_code(200); exit; }
        if (!isValidCompanyId($cid)) {
            http_response_code(400);
            echo json_encode(['error' => 'INVALID_COMPANY_ID']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT version, updated_at FROM company_state WHERE company_id = :cid");
        $stmt->execute([':cid' => $cid]);
        $row = $stmt->fetch();

        $version = 1;
        $updatedAt = 0;
        if ($row) {
            $version = (int)$row['version'];
            $updatedAt = (int)$row['updated_at'];
        } else {
            $stmtLegacy = $pdo->prepare("SELECT json_extract(data, '$.version') AS v, json_extract(data, '$.companies.' || :cid || '.updatedAt') AS u FROM state WHERE id = 'current'");
            $stmtLegacy->execute([':cid' => $cid]);
            $lRow = $stmtLegacy->fetch();
            if ($lRow) {
                $version = (int)($lRow['v'] ?? 1);
                $updatedAt = (int)($lRow['u'] ?? 0);
            }
        }

        $configUpdatedAt = 0;
        $globalVersion = 1;
        $globalUpdatedAt = 0;
        $sharedUpdatedAt = 0;
        try {
            $stmtCfg = $pdo->query("SELECT json_extract(data, '$.config.updatedAt') AS cu, json_extract(data, '$.version') AS gv, json_extract(data, '$.lastUpdated') AS gu, json_extract(data, '$.sharedUpdatedAt') AS su FROM state WHERE id = 'current'");
            $cRow = $stmtCfg ? $stmtCfg->fetch() : null;
            if ($cRow) {
                $configUpdatedAt = (int)($cRow['cu'] ?? 0);
                $globalVersion = (int)($cRow['gv'] ?? 1);
                $globalUpdatedAt = (int)($cRow['gu'] ?? 0);
                $sharedUpdatedAt = (int)($cRow['su'] ?? 0);
            }
        } catch (\Exception $e) {}

        $serverETag = 'W/"co-' . $cid . '-' . $version . '-' . $updatedAt . '-' . $configUpdatedAt . '-s' . $sharedUpdatedAt . '"';
        $clientETag = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';

        if ($clientETag === $serverETag) {
            header('ETag: ' . $serverETag);
            header('Cache-Control: private, no-cache');
            http_response_code(304);
            exit;
        }

        header('Content-Type: application/json; charset=utf-8');
        header('ETag: ' . $serverETag);
        header('Cache-Control: private, no-cache');
        if ($method === 'HEAD') { exit; }

        echo json_encode([
            'companyId' => $cid,
            'version' => $version,
            'updatedAt' => $updatedAt,
            'configUpdatedAt' => $configUpdatedAt,
            'globalVersion' => $globalVersion,
            'globalUpdatedAt' => $globalUpdatedAt,
            'sharedUpdatedAt' => $sharedUpdatedAt,
            'etag' => $serverETag
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // -------------------------------------------------------------------------
    // A3. ENDPOINT: /api/company/:cid/action (Mutación Atómica Particionada - v1.1.11)
    // -------------------------------------------------------------------------
    if (preg_match('#^company/([^/]+)/action$#', $endpoint, $matches)) {
        $cid = $matches[1];
        if ($method === 'OPTIONS') { http_response_code(200); exit; }
        if (!isValidCompanyId($cid)) {
            http_response_code(400);
            echo json_encode(['error' => 'INVALID_COMPANY_ID']);
            exit;
        }
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

        $auth = verifySession($pdo);
        $isCoord = !empty($auth['isCoordinator']);
        $isTeacherAdmin = !empty($auth['authorized']);
        $isStudentOfCompany = !empty($auth['isStudent']) && ($auth['coId'] === $cid);

        if (!$isTeacherAdmin && !$isStudentOfCompany) {
            http_response_code(403);
            echo json_encode(['error' => 'UNAUTHORIZED_MUTATION'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $payload = json_decode($rawInput, true);
        if (!is_array($payload) || empty($payload['action'])) {
            http_response_code(400);
            echo json_encode(['error' => 'INVALID_PAYLOAD']);
            exit;
        }

        $action = strtoupper((string)$payload['action']);
        $inner = (isset($payload['payload']) && is_array($payload['payload'])) ? $payload['payload'] : $payload;

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS company_state (
                company_id VARCHAR(100) PRIMARY KEY,
                data LONGTEXT NOT NULL,
                version INT NOT NULL DEFAULT 1,
                updated_at BIGINT NOT NULL
            )
        ");

        beginImmediateTx($pdo);
        $stmt = $pdo->prepare("SELECT data, version FROM company_state WHERE company_id = :cid");
        $stmt->execute([':cid' => $cid]);
        $row = $stmt->fetch();

        $co = null;
        $version = 1;
        if ($row && !empty($row['data'])) {
            $co = json_decode($row['data'], true);
            $version = (int)$row['version'];
        }

        if (!$co) {
            $stmtLegacy = $pdo->query("SELECT data FROM state WHERE id = 'current'");
            $sRow = $stmtLegacy->fetch();
            if ($sRow && !empty($sRow['data'])) {
                $legacyData = json_decode($sRow['data'], true);
                if (!empty($legacyData['companies'][$cid])) {
                    $co = $legacyData['companies'][$cid];
                    $version = (int)($legacyData['version'] ?? 1);
                }
            }
        }

        if (!$co && ($cid === 'sandbox_master' || $cid === 'sandbox_student')) {
            $tmpState = ['companies' => []];
            ensureTestCompaniesInState($tmpState);
            $co = $tmpState['companies'][$cid] ?? null;
        }

        if (!$co) {
            rollbackQuietly($pdo);
            http_response_code(404);
            echo json_encode(['error' => 'COMPANY_NOT_FOUND']);
            exit;
        }

        // Blindaje de credenciales y campos docentes: extraer bóveda, calificaciones y licencias de state para no degradarlas
        try {
            $stmtAuth = $pdo->prepare("
                SELECT 
                    json_extract(data, '$.companies.' || :cid) AS state_co,
                    json_extract(data, '$.companies.' || :cid || '.authVault') AS vlt,
                    json_extract(data, '$.companies.' || :cid || '.authUpdatedAt') AS au,
                    json_extract(data, '$.companies.' || :cid || '.accessCode') AS ac
                FROM state WHERE id = 'current'
            ");
            $stmtAuth->execute([':cid' => $cid]);
            $aRow = $stmtAuth->fetch();
            if ($aRow) {
                if (!empty($aRow['state_co'])) {
                    $sCo = json_decode($aRow['state_co'], true);
                    if (is_array($sCo)) {
                        // Si la empresa fue reseteada (TEST-0000 / TEST-1111) más recientemente en state, limpiar caché vieja de company_state
                        if ((int)($sCo['resetAt'] ?? 0) > (int)($co['resetAt'] ?? 0)) {
                            $co = $sCo;
                        }
                        // Preservar siempre calificaciones docentes sCo.grades
                        if (!empty($sCo['grades']) && is_array($sCo['grades'])) {
                            $co['grades'] = is_array($co['grades'] ?? null) ? $co['grades'] : [];
                            foreach ($sCo['grades'] as $gSubj => $gVal) {
                                $lG = $co['grades'][$gSubj] ?? null;
                                $sGTime = (int)($gVal['updatedAt'] ?? 0);
                                $lGTime = (int)($lG['updatedAt'] ?? 0);
                                if (!$lG || $sGTime >= $lGTime) {
                                    $co['grades'][$gSubj] = $gVal;
                                }
                            }
                        }
                        // Preservar patrocinio docente (LWW por sponsorUpdatedAt)
                        $sSpTs = (int)($sCo['sponsorUpdatedAt'] ?? $sCo['sponsorData']['updatedAt'] ?? 0);
                        $lSpTs = (int)($co['sponsorUpdatedAt'] ?? $co['sponsorData']['updatedAt'] ?? 0);
                        if (($sSpTs > 0 && $sSpTs >= $lSpTs) || (!empty($sCo['sponsorAwarded']) && $lSpTs === 0)) {
                            $co['sponsorAwarded'] = $sCo['sponsorAwarded'] ?? null;
                            if (array_key_exists('sponsorData', $sCo)) $co['sponsorData'] = $sCo['sponsorData'];
                            if ($sSpTs > 0) $co['sponsorUpdatedAt'] = $sSpTs;
                        }
                        // Preservar licencia de vuelo AESA (LWW por marca de tiempo)
                        if (!empty($sCo['launchLicense']) && is_array($sCo['launchLicense'])) {
                            $cLic = is_array($co['launchLicense'] ?? null) ? $co['launchLicense'] : null;
                            $sLicTime = max((int)($sCo['launchLicense']['approvedAt'] ?? 0), (int)($sCo['launchLicense']['rejectedAt'] ?? 0), (int)($sCo['launchLicense']['appliedAt'] ?? 0));
                            $cLicTime = $cLic ? max((int)($cLic['approvedAt'] ?? 0), (int)($cLic['rejectedAt'] ?? 0), (int)($cLic['appliedAt'] ?? 0)) : 0;
                            if (!$cLic || $sLicTime > $cLicTime) {
                                $co['launchLicense'] = $sCo['launchLicense'];
                            }
                        }
                        // Preservar contratos comerciales por fase (LWW)
                        if (!empty($sCo['contracts']) && is_array($sCo['contracts'])) {
                            $co['contracts'] = is_array($co['contracts'] ?? null) ? $co['contracts'] : [];
                            foreach ($sCo['contracts'] as $ph => $sC) {
                                $lC = $co['contracts'][$ph] ?? null;
                                $sCTime = (int)($sC['settledAt'] ?? $sC['signedAt'] ?? 0);
                                $lCTime = (int)($lC['settledAt'] ?? $lC['signedAt'] ?? 0);
                                if (!$lC || $sCTime >= $lCTime) {
                                    $co['contracts'][$ph] = $sC;
                                }
                            }
                        }
                        // Preservar sanciones docentes
                        if (!empty($sCo['sanctions']) && is_array($sCo['sanctions'])) {
                            $co['sanctions'] = $sCo['sanctions'];
                        }
                        // Preservar entregables devueltos o revisados por docente (LWW)
                        if (!empty($sCo['deliverables']) && is_array($sCo['deliverables'])) {
                            $co['deliverables'] = is_array($co['deliverables'] ?? null) ? $co['deliverables'] : [];
                            foreach ($sCo['deliverables'] as $dKey => $sDel) {
                                if (!is_array($sDel)) continue;
                                $lDel = is_array($co['deliverables'][$dKey] ?? null) ? $co['deliverables'][$dKey] : null;
                                $sDT = parseMsTimestamp($sDel['updatedAt'] ?? 0);
                                $lDT = $lDel ? parseMsTimestamp($lDel['updatedAt'] ?? 0) : 0;
                                if (!$lDel || $sDT > $lDT || (!empty($sDel['returnByTeacher']) && $sDT >= $lDT)) {
                                    $co['deliverables'][$dKey] = $sDel;
                                }
                            }
                        }
                        // Preservar Notas de Prensa DOC_15
                        if (!empty($sCo['pressReleases']) && is_array($sCo['pressReleases'])) {
                            $co['pressReleases'] = is_array($co['pressReleases'] ?? null) ? $co['pressReleases'] : [];
                            $getPrTs = function ($p) {
                                return is_array($p) ? max((int)($p['updatedAt'] ?? 0), (int)($p['returnedAt'] ?? 0), (int)($p['publishedAt'] ?? 0), (int)($p['ceoValidatedAt'] ?? 0)) : 0;
                            };
                            foreach ($sCo['pressReleases'] as $ph => $sPr) {
                                if (!is_array($sPr)) continue;
                                $lPr = $co['pressReleases'][$ph] ?? null;
                                if (!$lPr || $getPrTs($sPr) > $getPrTs($lPr) || (($sPr['status'] ?? '') === 'RETURNED' && $getPrTs($sPr) >= $getPrTs($lPr))) {
                                    $co['pressReleases'][$ph] = $sPr;
                                }
                            }
                        }
                        // Preservar Nombre Social / Estatutos y Marca
                        $sNameTs = (int)($sCo['nameUpdatedAt'] ?? 0);
                        $lNameTs = (int)($co['nameUpdatedAt'] ?? 0);
                        if ($sNameTs > $lNameTs) {
                            if (!empty($sCo['name'])) $co['name'] = $sCo['name'];
                            if (isset($sCo['previousNames'])) $co['previousNames'] = $sCo['previousNames'];
                            $co['nameUpdatedAt'] = $sNameTs;
                        }
                        if (isset($sCo['nameChangeRequest']) && is_array($sCo['nameChangeRequest'])) {
                            $getNcrTs = function ($r) {
                                return is_array($r) ? max((int)($r['resolvedAt'] ?? 0), (int)($r['updatedAt'] ?? 0), (int)($r['requestedAt'] ?? 0), (int)($r['rejectedAt'] ?? 0), (int)($r['dismissedAt'] ?? 0)) : 0;
                            };
                            if (!isset($co['nameChangeRequest']) || $getNcrTs($sCo['nameChangeRequest']) >= $getNcrTs($co['nameChangeRequest'])) {
                                $co['nameChangeRequest'] = $sCo['nameChangeRequest'];
                            }
                        }
                        $sBrandTs = max((int)($sCo['brandUpdatedAt'] ?? 0), (int)($sCo['brandApproval']['updatedAt'] ?? 0));
                        $lBrandTs = max((int)($co['brandUpdatedAt'] ?? 0), (int)($co['brandApproval']['updatedAt'] ?? 0));
                        if ($sBrandTs > $lBrandTs) {
                            if (isset($sCo['brandApproval'])) $co['brandApproval'] = $sCo['brandApproval'];
                            if (isset($sCo['brandStatus'])) $co['brandStatus'] = $sCo['brandStatus'];
                            if (array_key_exists('logo', $sCo)) $co['logo'] = $sCo['logo'];
                            if (array_key_exists('slogan', $sCo)) $co['slogan'] = $sCo['slogan'];
                            $co['brandUpdatedAt'] = $sBrandTs;
                        }
                        // Preservar Buzón HR DOC_2
                        if (!empty($sCo['inactivityReports']) && is_array($sCo['inactivityReports'])) {
                            $hrMap = [];
                            foreach (($co['inactivityReports'] ?? []) as $h) {
                                if (is_array($h) && !empty($h['id'])) $hrMap[(string)$h['id']] = $h;
                            }
                            $getHrTs = function ($h) {
                                return max((int)($h['resolvedAt'] ?? 0), (int)($h['updatedAt'] ?? 0), (int)($h['warnedAt'] ?? 0), (int)($h['timestamp'] ?? 0));
                            };
                            foreach ($sCo['inactivityReports'] as $sH) {
                                if (!is_array($sH) || empty($sH['id'])) continue;
                                $hid = (string)$sH['id'];
                                if (!isset($hrMap[$hid]) || $getHrTs($sH) >= $getHrTs($hrMap[$hid])) {
                                    $hrMap[$hid] = $sH;
                                }
                            }
                            $co['inactivityReports'] = array_values($hrMap);
                        }
                        // Preservar solicitudes especiales DOC_13 resueltas por docente/CEO (LWW por id)
                        if (!empty($sCo['specialItemRequests']) && is_array($sCo['specialItemRequests'])) {
                            $coSpMap = [];
                            foreach (($co['specialItemRequests'] ?? []) as $cSp) {
                                if (is_array($cSp) && !empty($cSp['id'])) $coSpMap[(string)$cSp['id']] = $cSp;
                            }
                            $getSpTs = function ($r) {
                                return max((int)($r['resolvedAt'] ?? 0), (int)($r['updatedAt'] ?? 0), (int)($r['resubmittedAt'] ?? 0), (int)($r['rejectedAt'] ?? 0), (int)($r['approvedAt'] ?? 0), (int)($r['createdAt'] ?? 0));
                            };
                            foreach ($sCo['specialItemRequests'] as $sSp) {
                                if (!is_array($sSp) || empty($sSp['id'])) continue;
                                $spId = (string)$sSp['id'];
                                if (!isset($coSpMap[$spId]) || $getSpTs($sSp) >= $getSpTs($coSpMap[$spId])) {
                                    $coSpMap[$spId] = $sSp;
                                }
                            }
                            $co['specialItemRequests'] = array_values($coSpMap);
                        }
                        // Preservar tombstones contables deletedLedgerTxIds y filtrar ledger antes del recálculo
                        $sDelTx = is_array($sCo['deletedLedgerTxIds'] ?? null) ? $sCo['deletedLedgerTxIds'] : [];
                        $cDelTx = is_array($co['deletedLedgerTxIds'] ?? null) ? $co['deletedLedgerTxIds'] : [];
                        $mergedDelTx = array_values(array_unique(array_map('strval', array_merge($sDelTx, $cDelTx))));
                        if (!empty($mergedDelTx)) {
                            $co['deletedLedgerTxIds'] = $mergedDelTx;
                            $delSet = array_flip($mergedDelTx);
                            $co['ledger'] = array_values(array_filter(is_array($co['ledger'] ?? null) ? $co['ledger'] : [], function ($tx) use ($delSet) {
                                $tid = (string)($tx['id'] ?? $tx['tx_id'] ?? '');
                                return $tid === '' || !isset($delSet[$tid]);
                            }));
                        }
                        $clientResetNewer = ((int)($co['resetAt'] ?? 0) > (int)($sCo['resetAt'] ?? 0));
                        if (!$clientResetNewer && !empty($sCo['loginStats']) && is_array($sCo['loginStats'])) {
                            $co['loginStats'] = mergeLoginStatsArr($sCo['loginStats'], is_array($co['loginStats'] ?? null) ? $co['loginStats'] : []);
                        }
                    }
                }
                if (!empty($aRow['vlt'])) {
                    $parsedVlt = is_string($aRow['vlt']) ? json_decode($aRow['vlt'], true) : $aRow['vlt'];
                    if (!empty($parsedVlt['code'])) {
                        $co['authVault'] = $parsedVlt;
                    }
                }
                if (!empty($aRow['ac']) && empty($co['accessCode'])) $co['accessCode'] = $aRow['ac'];
                if (!empty($aRow['au'])) $co['authUpdatedAt'] = (int)$aRow['au'];
            }
        } catch(\Exception $e) {}

        $now = round(microtime(true) * 1000);
        $co['ledger'] = is_array($co['ledger'] ?? null) ? $co['ledger'] : [];
        $co['cart'] = is_array($co['cart'] ?? null) ? $co['cart'] : [];
        $co['orders'] = is_array($co['orders'] ?? null) ? $co['orders'] : [];

        $initialCap = isset($co['initialBalance']) && is_numeric($co['initialBalance']) ? (float)$co['initialBalance'] : 2400.0;
        $calcBalance = function(array $ledger) use ($initialCap): float {
            $initial = $initialCap;
            $seen = [];
            $deltaSum = 0.0;
            foreach ($ledger as $tx) {
                $id = (string)($tx['id'] ?? $tx['tx_id'] ?? '');
                if ($id === '' || isset($seen[$id])) continue;
                $seen[$id] = true;
                $d = (float)($tx['delta'] ?? 0);
                $deltaSum += $d;
            }
            return round($initial + $deltaSum, 2);
        };

        $rawRole = (string)($auth['role'] ?? '');
        $auxDept = trim((string)($co['auxRoleDept'] ?? ''));
        $effectiveRole = ($rawRole === 'AUXILIAR' && $auxDept !== '') ? $auxDept : $rawRole;
        if ($effectiveRole === 'OPERACIONES') $effectiveRole = 'OPERACIONES_IA';

        switch ($action) {
            case 'EXECUTE_PURCHASE':
                $items = !empty($inner['items']) && is_array($inner['items']) ? $inner['items'] : $co['cart'];
                if (empty($items)) {
                    rollbackQuietly($pdo);
                    http_response_code(400);
                    echo json_encode(['error' => 'EMPTY_CART']);
                    exit;
                }
                $totalPurchase = 0.0;
                foreach ($items as $it) {
                    $p = (float)($it['price'] ?? 0);
                    $q = (int)($it['qty'] ?? 1);
                    if ($p < 0 || $q < 1) {
                        rollbackQuietly($pdo);
                        http_response_code(400);
                        echo json_encode(['error' => 'INVALID_ITEM_VALUES']);
                        exit;
                    }
                    $totalPurchase += round($p * $q, 2);
                }
                $curBal = $calcBalance($co['ledger']);
                if ($curBal <= 0 || $curBal < $totalPurchase) {
                    rollbackQuietly($pdo);
                    http_response_code(400);
                    echo json_encode([
                        'error' => 'INSUFFICIENT_FUNDS',
                        'message' => $curBal <= 0 ? 'Empresa bloqueada en números rojos (saldo <= 0 €v).' : 'Saldo insuficiente para completar la compra.',
                        'currentBalance' => $curBal,
                        'required' => $totalPurchase
                    ]);
                    exit;
                }
                $orderId = (string)($inner['orderId'] ?? ('ORD-' . substr((string)$now, -4)));
                $txId = 'TX-' . strtoupper(base_convert((string)$now, 10, 36)) . '-' . strtoupper(substr(md5(uniqid()), 0, 4));
                $concept = (string)($inner['concept'] ?? ("Compra Catálogo (" . count($items) . " ítems) - Pedido #" . $orderId));
                array_unshift($co['ledger'], [
                    'id' => $txId,
                    'tx_id' => $txId,
                    'date' => date('d/m/Y, H:i:s'),
                    'concept' => $concept,
                    'dept' => $inner['dept'] ?? 'TECNICO',
                    'delta' => -$totalPurchase,
                    'timestamp' => $now,
                    'orderId' => $orderId
                ]);
                array_unshift($co['orders'], [
                    'id' => $orderId,
                    'items' => $items,
                    'total' => $totalPurchase,
                    'date' => date('c'),
                    'status' => 'ENTREGADO'
                ]);
                $co['cart'] = [];
                break;

            case 'ADD_LEDGER_TX':
                $delta = round((float)($inner['delta'] ?? 0), 2);
                if (empty($auth['isCoordinator']) && empty($auth['isAdmin'])) {
                    if ($delta > 0) {
                        rollbackQuietly($pdo);
                        http_response_code(403);
                        echo json_encode(['error' => 'UNAUTHORIZED_LEDGER_CREDIT', 'message' => 'Solo el profesorado puede abonar capital en Ledger.'], JSON_UNESCAPED_UNICODE);
                        exit;
                    }
                    if ($delta < 0) {
                        $curBal = $calcBalance($co['ledger']);
                        if ($curBal <= 0) {
                            rollbackQuietly($pdo);
                            http_response_code(400);
                            echo json_encode([
                                'error' => 'INSUFFICIENT_FUNDS',
                                'message' => 'Empresa bloqueada en números rojos (saldo <= 0 €v).',
                                'currentBalance' => $curBal
                            ]);
                            exit;
                        }
                    }
                }
                $txId = (string)($inner['txId'] ?? ('TX-' . strtoupper(base_convert((string)$now, 10, 36)) . '-' . strtoupper(substr(md5(uniqid()), 0, 4))));
                array_unshift($co['ledger'], [
                    'id' => $txId,
                    'tx_id' => $txId,
                    'date' => date('d/m/Y, H:i:s'),
                    'concept' => $inner['concept'] ?? 'Ajuste financiero',
                    'dept' => $inner['dept'] ?? 'FINANZAS',
                    'delta' => $delta,
                    'timestamp' => $now
                ]);
                break;

            case 'RECORD_REAL_SPEND':
            case 'EXECUTE_PHYSICAL_ORDER':
                if ($effectiveRole !== 'OPERACIONES_IA' && empty($auth['isAdmin']) && empty($auth['isCoordinator'])) {
                    rollbackQuietly($pdo);
                    http_response_code(403);
                    echo json_encode(['error' => 'FORBIDDEN_ROLE', 'message' => 'Acceso restringido: Solo Operaciones o Administrador puede registrar compras físicas reales.']);
                    exit;
                }
                if (!empty($inner['realCosts']) && is_array($inner['realCosts'])) {
                    $co['realCosts'] = is_array($co['realCosts'] ?? null) ? $co['realCosts'] : [];
                    foreach ($inner['realCosts'] as $rc) {
                        $co['realCosts'][] = $rc;
                    }
                }
                if (!empty($inner['orderId'])) {
                    $co['orders'] = is_array($co['orders'] ?? null) ? $co['orders'] : [];
                    $executedIndices = is_array($inner['executedIndices'] ?? null) ? array_map('intval', $inner['executedIndices']) : null;
                    $chargeEurV = 0.0;
                    foreach ($co['orders'] as &$ord) {
                        if ((string)($ord['id'] ?? '') === (string)($inner['orderId'])) {
                            $itemsArr = is_array($ord['items'] ?? null) ? $ord['items'] : [];
                            $allDone = true;
                            foreach ($itemsArr as $idx => &$it) {
                                if (!empty($it['executed'])) continue;
                                if ($executedIndices === null || in_array((int)$idx, $executedIndices, true)) {
                                    $it['executed'] = true;
                                    $chargeEurV += ((float)($it['price'] ?? 0)) * ((float)($it['qty'] ?? 1));
                                } else {
                                    $allDone = false;
                                }
                            }
                            unset($it);
                            $ord['items'] = $itemsArr;
                            $ord['status'] = $allDone ? 'EJECUTADO' : ($ord['status'] ?? 'APROBADO_FINANZAS');
                            if (!$allDone) $ord['partialExecuted'] = true;
                            $ord['updatedAt'] = $now;
                        }
                    }
                    unset($ord);
                    if ($chargeEurV > 0 && empty($inner['skipLedger'])) {
                        $co['ledger'] = is_array($co['ledger'] ?? null) ? $co['ledger'] : [];
                        $txId = 'TX-' . $now . '-' . substr(md5((string)$inner['orderId'] . $now), 0, 5);
                        array_unshift($co['ledger'], [
                            'id' => $txId,
                            'tx_id' => $txId,
                            'date' => date('d/m/Y, H:i:s'),
                            'concept' => 'Recepción física Orden #' . $inner['orderId'],
                            'dept' => 'OPERACIONES_IA',
                            'delta' => -round($chargeEurV, 2),
                            'timestamp' => $now
                        ]);
                    }
                }
                break;

            case 'UPDATE_MARKETING':
                $co['marketingCampaigns'] = is_array($co['marketingCampaigns'] ?? null) ? $co['marketingCampaigns'] : [];
                $mktPackages = [
                    'MK-SAT' => ['price' => 200, 'actions' => 3],
                    'MK-TRA' => ['price' => 300, 'actions' => 3],
                    'MK-HYB' => ['price' => 450, 'actions' => 4],
                    'MK-SUP' => ['price' => 750, 'actions' => 6]
                ];
                if (!empty($inner['campaign'])) {
                    $curBal = $calcBalance($co['ledger']);
                    if ($curBal <= 0) {
                        rollbackQuietly($pdo);
                        http_response_code(400);
                        echo json_encode([
                            'error' => 'INSUFFICIENT_FUNDS',
                            'message' => 'Empresa bloqueada en números rojos (saldo <= 0 €v).',
                            'currentBalance' => $curBal
                        ]);
                        exit;
                    }
                    $camp = $inner['campaign'];
                    if (isset($camp['packageId'], $mktPackages[$camp['packageId']])) {
                        $camp['price'] = $mktPackages[$camp['packageId']]['price'];
                        $camp['totalActions'] = $mktPackages[$camp['packageId']]['actions'];
                    }
                    $campIdStr = (string)($camp['id'] ?? '');
                    $foundCampIdx = -1;
                    if ($campIdStr !== '') {
                        foreach ($co['marketingCampaigns'] as $cIdx => $existingCamp) {
                            if ((string)($existingCamp['id'] ?? '') === $campIdStr) {
                                $foundCampIdx = $cIdx;
                                break;
                            }
                        }
                    }
                    if ($foundCampIdx >= 0) {
                        $co['marketingCampaigns'][$foundCampIdx] = array_merge($co['marketingCampaigns'][$foundCampIdx], $camp);
                    } else {
                        array_unshift($co['marketingCampaigns'], $camp);
                    }
                }
                if (!empty($inner['actionItem']) && !empty($inner['campaignId'])) {
                    $incomingItem = $inner['actionItem'];
                    $incomingId = (string)($incomingItem['id'] ?? '');
                    $isCeoOrCoordMkt = ($effectiveRole === 'CEO' || !empty($auth['isCoordinator']) || !empty($auth['isAdmin']));
                    if (!$isCeoOrCoordMkt || empty($incomingItem['status'])) {
                        $incomingItem['status'] = 'PENDIENTE_CEO';
                    }
                    foreach ($co['marketingCampaigns'] as &$c) {
                        if ((string)($c['id'] ?? '') === (string)($inner['campaignId'])) {
                            $c['executedActions'] = is_array($c['executedActions'] ?? null) ? $c['executedActions'] : [];
                            $totalAllowedMkt = (int)($c['totalActions'] ?? 3);
                            $updated = false;
                            if ($incomingId !== '') {
                                foreach ($c['executedActions'] as &$exAct) {
                                    if ((string)($exAct['id'] ?? '') === $incomingId) {
                                        $exTs = max((int)($exAct['resubmittedAt'] ?? 0), (int)($exAct['reviewedAt'] ?? 0), (int)($exAct['updatedAt'] ?? 0));
                                        $inTs = max((int)($incomingItem['resubmittedAt'] ?? 0), (int)($incomingItem['reviewedAt'] ?? 0), (int)($incomingItem['updatedAt'] ?? 0));
                                        if ($inTs === 0 || $inTs >= $exTs) {
                                            $exAct = array_merge($exAct, $incomingItem);
                                            if (($exAct['status'] ?? '') === 'PENDIENTE_CEO') {
                                                $resubTs = max($now, (int)($exAct['reviewedAt'] ?? 0) + 1);
                                                $exAct['resubmittedAt'] = $resubTs;
                                                $exAct['updatedAt'] = $resubTs;
                                                $exAct['feedback'] = '';
                                                $exAct['returnDriveUrl'] = '';
                                                $c['updatedAt'] = $resubTs;
                                            } else {
                                                $c['updatedAt'] = $now;
                                            }
                                        }
                                        $updated = true;
                                        break;
                                    }
                                }
                                unset($exAct);
                            }
                            if (!$updated) {
                                if (count($c['executedActions']) >= $totalAllowedMkt) {
                                    rollbackQuietly($pdo);
                                    http_response_code(400);
                                    echo json_encode(['error' => 'CAMPAIGN_QUOTA_EXCEEDED', 'message' => 'Cupo de acciones publicitarias agotado para este paquete.']);
                                    exit;
                                }
                                $c['executedActions'][] = $incomingItem;
                                $c['updatedAt'] = $now;
                            }
                        }
                    }
                    unset($c);
                }
                if (!empty($inner['decideAction']) && is_array($inner['decideAction'])) {
                    if ($effectiveRole !== 'CEO' && empty($auth['isCoordinator']) && empty($auth['isAdmin'])) {
                        rollbackQuietly($pdo);
                        http_response_code(403);
                        echo json_encode(['error' => 'UNAUTHORIZED_ROLE', 'message' => 'Solo el CEO o Docente puede validar o devolver acciones publicitarias.']);
                        exit;
                    }
                    $da = $inner['decideAction'];
                    $campIdDa = (string)($da['campId'] ?? '');
                    $actIdDa = (string)($da['actId'] ?? '');
                    $approvedDa = !empty($da['approved']);
                    foreach ($co['marketingCampaigns'] as &$c) {
                        if ((string)($c['id'] ?? '') === $campIdDa && is_array($c['executedActions'] ?? null)) {
                            foreach ($c['executedActions'] as &$exAct) {
                                if ((string)($exAct['id'] ?? '') === $actIdDa) {
                                    $revTs = max($now, (int)($exAct['resubmittedAt'] ?? 0) + 1);
                                    $exAct['status'] = $approvedDa ? 'VALIDADO_CEO' : 'RECHAZADO_CEO';
                                    $exAct['reviewedAt'] = $revTs;
                                    $exAct['updatedAt'] = $revTs;
                                    $exAct['feedback'] = $approvedDa ? '' : (string)($da['feedback'] ?? 'Revisión requerida por CEO');
                                    $exAct['returnDriveUrl'] = $approvedDa ? '' : (string)($da['returnDriveUrl'] ?? '');
                                    $c['updatedAt'] = $revTs;
                                    break;
                                }
                            }
                            unset($exAct);
                        }
                    }
                    unset($c);
                }
                break;

            case 'SUBMIT_DELIVERABLE':
                $co['deliverables'] = is_array($co['deliverables'] ?? null) ? $co['deliverables'] : [];
                $rawKey = trim((string)($inner['key'] ?? $inner['docKey'] ?? $inner['docType'] ?? ''));
                if ($rawKey !== '') {
                    $driveUrl = trim((string)($inner['driveUrl'] ?? $inner['url'] ?? ''));
                    $isAdminOverride = !empty($auth['isCoordinator']) || !empty($auth['isAdmin']);
                    $reqDelivStatus = trim((string)($inner['status'] ?? ''));
                    if ($isAdminOverride) {
                        $status = 'DELIVERED_TO_TEACHER';
                    } elseif ($effectiveRole === 'CEO' && $reqDelivStatus === 'DELIVERED_TO_TEACHER') {
                        $status = 'DELIVERED_TO_TEACHER';
                    } else {
                        $status = 'SUBMITTED_TO_CEO';
                    }
                    $returnReasonId = null;
                    $returnReason = null;

                    $existingDoc = is_array($co['deliverables'][$rawKey] ?? null) ? $co['deliverables'][$rawKey] : [];
                    $existingHistory = is_array($existingDoc['history'] ?? null) ? $existingDoc['history'] : [];
                    $lastWorkshopCheckAt = $existingDoc['lastWorkshopCheckAt'] ?? null;
                    $prevTeacherReturned = !empty($existingDoc['returnByTeacher']) || !empty($existingDoc['wasTeacherReturned']);
                    $prevTeacherRole = $existingDoc['returnByTeacherRole'] ?? null;

                    if ($rawKey === 'hoja_taller_fyq') {
                        $reqStatus = trim((string)($inner['status'] ?? ''));
                        $validWorkshop = ['DRAFT_TECNICO', 'EN_TALLER_OPERARIO', 'DEVUELTO_A_TECNICO', 'CEO_REVISION', 'SUBMITTED_TO_CEO', 'DELIVERED_TO_TEACHER'];
                        if (in_array($reqStatus, $validWorkshop, true)) {
                            $status = $reqStatus;
                        } elseif ($isAdminOverride) {
                            $status = 'DELIVERED_TO_TEACHER';
                        } else {
                            $status = 'EN_TALLER_OPERARIO';
                        }
                        $returnReasonId = $inner['returnReasonId'] ?? null;
                        $returnReason = $inner['returnReason'] ?? null;
                        if (is_array($inner['history'] ?? null)) {
                            $histById = [];
                            foreach ($existingHistory as $ev) {
                                if (is_array($ev) && !empty($ev['id'])) $histById[(string)$ev['id']] = $ev;
                            }
                            foreach ($inner['history'] as $ev) {
                                if (is_array($ev) && !empty($ev['id'])) $histById[(string)$ev['id']] = $ev;
                            }
                            $existingHistory = array_values($histById);
                        }
                        if (!empty($inner['lastWorkshopCheckAt'])) {
                            $lastWorkshopCheckAt = (string)$inner['lastWorkshopCheckAt'];
                        }
                    }

                    $prevDocMs = parseMsTimestamp($co['deliverables'][$rawKey]['updatedAt'] ?? 0);
                    $monoDelivIso = isoMsNow($prevDocMs + 1);
                    $newDelivObj = [
                        'driveUrl' => $driveUrl,
                        'status' => $status,
                        'returnReasonId' => $returnReasonId,
                        'returnReason' => $returnReason,
                        'returnDriveUrl' => $inner['returnDriveUrl'] ?? null,
                        'returnByTeacher' => !empty($inner['returnByTeacher']),
                        'updatedAt' => $monoDelivIso
                    ];
                    if ($status === 'DELIVERED_TO_TEACHER' && (!empty($inner['resubmittedAfterTeacherReturn']) || $prevTeacherReturned)) {
                        $newDelivObj['resubmittedAfterTeacherReturn'] = true;
                        $newDelivObj['resubmittedAt'] = !empty($inner['resubmittedAt']) ? (string)$inner['resubmittedAt'] : $monoDelivIso;
                    } elseif ($status === 'SUBMITTED_TO_CEO' && (!empty($inner['wasTeacherReturned']) || $prevTeacherReturned)) {
                        $newDelivObj['wasTeacherReturned'] = true;
                        $tRole = trim((string)($inner['returnByTeacherRole'] ?? $prevTeacherRole ?? ''));
                        if ($tRole !== '') {
                            $newDelivObj['returnByTeacherRole'] = $tRole;
                        }
                    }
                    if ($rawKey === 'hoja_taller_fyq') {
                        $newDelivObj['history'] = $existingHistory;
                        if ($lastWorkshopCheckAt) {
                            $newDelivObj['lastWorkshopCheckAt'] = $lastWorkshopCheckAt;
                        }
                    }
                    $co['deliverables'][$rawKey] = $newDelivObj;
                }
                break;

            case 'CEO_REVIEW_DELIVERABLE':
                if ($effectiveRole !== 'CEO' && empty($auth['isCoordinator']) && empty($auth['isAdmin'])) {
                    rollbackQuietly($pdo);
                    http_response_code(403);
                    echo json_encode(['error' => 'UNAUTHORIZED_ROLE', 'message' => 'Solo el CEO o Coordinación puede supervisar entregables.']);
                    exit;
                }
                $rawKey = trim((string)($inner['key'] ?? $inner['docKey'] ?? $inner['docType'] ?? ''));
                $co['deliverables'] = is_array($co['deliverables'] ?? null) ? $co['deliverables'] : [];
                if ($rawKey === '' || !isset($co['deliverables'][$rawKey])) {
                    rollbackQuietly($pdo);
                    http_response_code(404);
                    echo json_encode(['error' => 'DELIVERABLE_NOT_FOUND']);
                    exit;
                }
                $currentDoc = &$co['deliverables'][$rawKey];
                $prevDocMs = is_array($currentDoc) ? parseMsTimestamp($currentDoc['updatedAt'] ?? 0) : 0;
                $monoIso = isoMsNow($prevDocMs + 1);
                $rawSubAction = (string)($inner['ceoAction'] ?? $inner['subAction'] ?? $inner['action'] ?? '');
                $subAction = strtoupper(trim($rawSubAction === 'CEO_REVIEW_DELIVERABLE' ? '' : $rawSubAction));
                if ($subAction === 'APPROVE') {
                    $cameFromTeacher = (is_array($currentDoc) && (!empty($currentDoc['returnByTeacher']) || !empty($currentDoc['wasTeacherReturned'])))
                        || !empty($inner['resubmittedAfterTeacherReturn']);
                    if (is_string($currentDoc)) {
                        $currentDoc = ['driveUrl' => $currentDoc, 'status' => 'DELIVERED_TO_TEACHER', 'updatedAt' => $monoIso];
                    } else {
                        $currentDoc['status'] = 'DELIVERED_TO_TEACHER';
                        unset($currentDoc['returnReasonId'], $currentDoc['returnReason'], $currentDoc['returnDriveUrl'], $currentDoc['returnByTeacher'], $currentDoc['returnByTeacherRole'], $currentDoc['wasTeacherReturned']);
                        $currentDoc['updatedAt'] = $monoIso;
                    }
                    if ($cameFromTeacher) {
                        $currentDoc['resubmittedAfterTeacherReturn'] = true;
                        $currentDoc['resubmittedAt'] = $monoIso;
                    }
                    if ($rawKey === 'hoja_taller_fyq' && is_array($inner['history'] ?? null)) {
                        $histById = [];
                        foreach ((is_array($currentDoc['history'] ?? null) ? $currentDoc['history'] : []) as $ev) {
                            if (is_array($ev) && !empty($ev['id'])) $histById[(string)$ev['id']] = $ev;
                        }
                        foreach ($inner['history'] as $ev) {
                            if (is_array($ev) && !empty($ev['id'])) $histById[(string)$ev['id']] = $ev;
                        }
                        $currentDoc['history'] = array_values($histById);
                    }
                } elseif ($subAction === 'RESUBMIT_TO_TEACHER') {
                    $newUrl = trim((string)($inner['driveUrl'] ?? ''));
                    if (is_string($currentDoc)) {
                        $currentDoc = [
                            'driveUrl' => $newUrl !== '' ? $newUrl : $currentDoc,
                            'status' => 'DELIVERED_TO_TEACHER',
                            'resubmittedAfterTeacherReturn' => true,
                            'resubmittedAt' => $monoIso,
                            'updatedAt' => $monoIso
                        ];
                    } else {
                        if ($newUrl !== '') {
                            $currentDoc['driveUrl'] = $newUrl;
                        }
                        $currentDoc['status'] = 'DELIVERED_TO_TEACHER';
                        $currentDoc['resubmittedAfterTeacherReturn'] = true;
                        $currentDoc['resubmittedAt'] = $monoIso;
                        $currentDoc['updatedAt'] = $monoIso;
                        unset($currentDoc['returnReasonId'], $currentDoc['returnReason'], $currentDoc['returnDriveUrl'], $currentDoc['returnByTeacher'], $currentDoc['returnByTeacherRole'], $currentDoc['wasTeacherReturned']);
                    }
                    if ($rawKey === 'hoja_taller_fyq' && is_array($inner['history'] ?? null)) {
                        $histById = [];
                        foreach ((is_array($currentDoc['history'] ?? null) ? $currentDoc['history'] : []) as $ev) {
                            if (is_array($ev) && !empty($ev['id'])) $histById[(string)$ev['id']] = $ev;
                        }
                        foreach ($inner['history'] as $ev) {
                            if (is_array($ev) && !empty($ev['id'])) $histById[(string)$ev['id']] = $ev;
                        }
                        $currentDoc['history'] = array_values($histById);
                    }
                } elseif ($subAction === 'RETURN') {
                    $reasonId = trim((string)($inner['reasonId'] ?? ''));
                    $reasonText = trim((string)($inner['reasonText'] ?? $inner['reason'] ?? $reasonId));
                    $retDriveUrl = trim((string)($inner['returnDriveUrl'] ?? ''));
                    if (is_string($currentDoc)) {
                        $currentDoc = [
                            'driveUrl' => $currentDoc,
                            'status' => 'CEO_REVISION',
                            'returnReasonId' => $reasonId,
                            'returnReason' => $reasonText,
                            'returnDriveUrl' => $retDriveUrl ?: null,
                            'returnByTeacher' => false,
                            'updatedAt' => $monoIso
                        ];
                    } else {
                        $currentDoc['status'] = 'CEO_REVISION';
                        $currentDoc['returnReasonId'] = $reasonId;
                        $currentDoc['returnReason'] = $reasonText;
                        if ($retDriveUrl) {
                            $currentDoc['returnDriveUrl'] = $retDriveUrl;
                        }
                        unset($currentDoc['returnByTeacher'], $currentDoc['returnByTeacherRole'], $currentDoc['wasTeacherReturned']);
                        $currentDoc['updatedAt'] = $monoIso;
                    }
                    if ($rawKey === 'hoja_taller_fyq' && is_array($inner['history'] ?? null)) {
                        $histById = [];
                        foreach ((is_array($currentDoc['history'] ?? null) ? $currentDoc['history'] : []) as $ev) {
                            if (is_array($ev) && !empty($ev['id'])) $histById[(string)$ev['id']] = $ev;
                        }
                        foreach ($inner['history'] as $ev) {
                            if (is_array($ev) && !empty($ev['id'])) $histById[(string)$ev['id']] = $ev;
                        }
                        $currentDoc['history'] = array_values($histById);
                    }
                } else {
                    rollbackQuietly($pdo);
                    http_response_code(400);
                    echo json_encode(['error' => 'INVALID_REVIEW_ACTION']);
                    exit;
                }
                break;

            case 'DOCENTE_REVIEW_DELIVERABLE':
                if (empty($auth['isAdmin']) && empty($auth['isCoordinator'])) {
                    rollbackQuietly($pdo);
                    http_response_code(403);
                    echo json_encode(['error' => 'UNAUTHORIZED_ROLE', 'message' => 'Solo el profesorado o Coordinación puede devolver entregables.']);
                    exit;
                }
                $rawKey = trim((string)($inner['key'] ?? $inner['docKey'] ?? $inner['docType'] ?? ''));
                if ($rawKey === '') {
                    rollbackQuietly($pdo);
                    http_response_code(400);
                    echo json_encode(['error' => 'MISSING_DELIVERABLE_KEY', 'message' => 'Falta la clave del entregable.']);
                    exit;
                }
                $co['deliverables'] = is_array($co['deliverables'] ?? null) ? $co['deliverables'] : [];
                $currentDoc = $co['deliverables'][$rawKey] ?? null;
                $reasonId = trim((string)($inner['reasonId'] ?? ''));
                $reasonText = trim((string)($inner['reasonText'] ?? $inner['reason'] ?? $reasonId));
                $driveUrl = is_array($currentDoc) ? ($currentDoc['driveUrl'] ?? '') : (string)$currentDoc;

                $prevDocMs = is_array($currentDoc) ? parseMsTimestamp($currentDoc['updatedAt'] ?? 0) : 0;
                $returnDriveUrl = trim((string)($inner['returnDriveUrl'] ?? ''));
                $returnByTeacherRole = trim((string)($inner['returnByTeacherRole'] ?? $auth['role'] ?? 'DOCENTE'));
                $preservedDoc = [
                    'driveUrl' => $driveUrl,
                    'status' => 'CEO_REVISION',
                    'returnReasonId' => $reasonId,
                    'returnReason' => $reasonText,
                    'returnDriveUrl' => !empty($returnDriveUrl) ? $returnDriveUrl : null,
                    'returnByTeacher' => true,
                    'returnByTeacherRole' => $returnByTeacherRole !== '' ? $returnByTeacherRole : 'DOCENTE',
                    'updatedAt' => isoMsNow($prevDocMs + 1)
                ];
                if (is_array($currentDoc)) {
                    if (is_array($currentDoc['history'] ?? null)) $preservedDoc['history'] = $currentDoc['history'];
                    if (!empty($currentDoc['lastWorkshopCheckAt'])) $preservedDoc['lastWorkshopCheckAt'] = $currentDoc['lastWorkshopCheckAt'];
                }
                $co['deliverables'][$rawKey] = $preservedDoc;
                break;

            case 'COORDINATOR_DECIDE_BRAND':
                if (empty($auth['isCoordinator']) && empty($auth['isAdmin'])) {
                    rollbackQuietly($pdo);
                    http_response_code(403);
                    echo json_encode(['error' => 'UNAUTHORIZED_ROLE', 'message' => 'Solo Coordinación puede validar marcas.']);
                    exit;
                }
                $approved = !empty($inner['approved']);
                $co['brandUpdatedAt'] = $now;
                if ($approved) {
                    $incSlogan = trim((string)($inner['officialSlogan'] ?? ''));
                    $pendingSl = trim((string)($co['pendingSlogan'] ?? ($co['brandApproval']['pendingSlogan'] ?? '')));
                    $currSlogan = trim((string)($co['slogan'] ?? ''));
                    $co['slogan'] = $incSlogan !== '' ? $incSlogan : ($pendingSl !== '' ? $pendingSl : $currSlogan);
                    if (array_key_exists('logo', $inner) && $inner['logo']) {
                        $co['logo'] = $inner['logo'];
                    } elseif (!empty($co['brandApproval']['pendingLogo'])) {
                        $co['logo'] = $co['brandApproval']['pendingLogo'];
                    }
                    $co['mission'] = $co['pendingMission'] ?? ($co['valueProposition'] ?? ($co['mission'] ?? ''));
                    $co['valueProposition'] = $co['mission'];
                    unset($co['pendingSlogan'], $co['pendingMission']);
                    $co['brandStatus'] = 'APPROVED';
                    if (isset($co['brandApproval']) && is_array($co['brandApproval'])) {
                        $co['brandApproval']['status'] = 'APROBADO';
                        $co['brandApproval']['pendingLogo'] = null;
                        $co['brandApproval']['pendingSlogan'] = '';
                        $co['brandApproval']['feedback'] = '';
                        $co['brandApproval']['updatedAt'] = $now;
                    }
                } else {
                    unset($co['pendingSlogan'], $co['pendingMission']);
                    $co['brandStatus'] = 'REJECTED';
                    $rejReason = trim((string)($inner['reason'] ?? ''));
                    $rejDrive = trim((string)($inner['returnDriveUrl'] ?? ''));
                    if (isset($co['brandApproval']) && is_array($co['brandApproval'])) {
                        $co['brandApproval']['status'] = 'RECHAZADO';
                        $co['brandApproval']['updatedAt'] = $now;
                        unset($co['brandApproval']['pendingSlogan']);
                        if ($rejReason !== '') {
                            $co['brandApproval']['feedback'] = $rejReason;
                        } elseif (empty($co['brandApproval']['feedback'])) {
                            $co['brandApproval']['feedback'] = 'Propuesta de marca rechazada por Coordinación.';
                        }
                        if ($rejDrive !== '') {
                            $co['brandApproval']['returnDriveUrl'] = $rejDrive;
                        }
                    }
                }
                break;

            case 'VOTE_MOTION':
                $motionId = trim((string)($inner['id'] ?? $inner['motionId'] ?? ''));
                $voteValue = trim((string)($inner['vote'] ?? ''));
                $validVotes = ['A_FAVOR', 'EN_CONTRA', 'NO_ESTOY_SEGURO'];
                if (!in_array($voteValue, $validVotes, true)) {
                    rollbackQuietly($pdo);
                    http_response_code(400);
                    echo json_encode(['error' => 'INVALID_VOTE_VALUE', 'allowed' => $validVotes]);
                    exit;
                }
                $co['votingMotions'] = is_array($co['votingMotions'] ?? null) ? $co['votingMotions'] : [];
                foreach ($co['votingMotions'] as &$m) {
                    if (($m['id'] ?? '') === $motionId) {
                        if (!isset($m['votes']) || !is_array($m['votes'])) {
                            $m['votes'] = [];
                        }
                        $roleKey = $rawRole ?: 'ESTUDIANTE';
                        $m['votes'][$roleKey] = $voteValue;
                        break;
                    }
                }
                unset($m);
                break;

            case 'REQUEST_AUX_ROLE':
                $reqDept = strtoupper(trim((string)($inner['dept'] ?? '')));
                $reqPin = trim((string)($inner['pin'] ?? ''));
                $allowedDepts = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA'];
                if (!in_array($reqDept, $allowedDepts, true)) {
                    rollbackQuietly($pdo);
                    http_response_code(400);
                    echo json_encode(['error' => 'INVALID_DEPT', 'message' => 'Departamento auxiliar no válido.']);
                    exit;
                }
                if (!preg_match('/^\d{4}$/', $reqPin)) {
                    rollbackQuietly($pdo);
                    http_response_code(400);
                    echo json_encode(['error' => 'INVALID_PIN', 'message' => 'El PIN debe tener 4 dígitos.']);
                    exit;
                }
                $co['auxRoleRequest'] = [
                    'status' => 'PENDIENTE',
                    'dept' => $reqDept,
                    'pin' => $reqPin,
                    'date' => (string)($inner['date'] ?? date('d/m/Y, H:i:s')),
                    'updatedAt' => $now
                ];
                break;

            case 'GENERIC_PATCH':
                $allowed = ['slogan', 'valueProposition', 'cart', 'votingMotions', 'flightTests', 'bom', 'brandApproval', 'pendingSlogan', 'pendingMission', 'brandStatus', 'executiveResolutions'];
                foreach ($allowed as $k) {
                    if (isset($inner[$k])) {
                        $co[$k] = $inner[$k];
                    }
                }
                break;

            default:
                rollbackQuietly($pdo);
                http_response_code(400);
                echo json_encode(['error' => 'UNKNOWN_ACTION', 'action' => $action]);
                exit;
        }

        $co['balance'] = $calcBalance($co['ledger']);
        $co['updatedAt'] = $now;
        $newVersion = $version + 1;

        $saveStmt = $pdo->prepare("
            INSERT OR REPLACE INTO company_state (company_id, data, version, updated_at)
            VALUES (:cid, :data, :version, :updated_at)
        ");
        $saveStmt->execute([
            ':cid' => $cid,
            ':data' => json_encode($co, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':version' => $newVersion,
            ':updated_at' => $now
        ]);

        $syncStmt = $pdo->prepare("
            UPDATE state
            SET data = json_set(
                data,
                '$.companies.' || :cid, json(:co_json),
                '$.version', COALESCE(json_extract(data, '$.version'), 0) + 1,
                '$.lastUpdated', :lu
            )
            WHERE id = 'current'
        ");
        $syncStmt->execute([
            ':cid' => $cid,
            ':co_json' => json_encode($co, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':lu' => $now
        ]);
        $stmtGlobalMeta = $pdo->query("SELECT json_extract(data, '$.version') AS gv, json_extract(data, '$.config.updatedAt') AS cu FROM state WHERE id = 'current'");
        $gMeta = $stmtGlobalMeta ? $stmtGlobalMeta->fetch() : null;
        $newGlobalVersion = (int)($gMeta['gv'] ?? 1);
        $cfgUpdAct = (int)($gMeta['cu'] ?? 0);
        commitTx($pdo);

        $coETag = 'W/"co-' . $cid . '-' . $newVersion . '-' . $now . '-' . $cfgUpdAct . '-g' . $newGlobalVersion . '"';
        header('Content-Type: application/json; charset=utf-8');
        header('ETag: ' . $coETag);
        echo json_encode([
            'success' => true,
            'companyId' => $cid,
            'version' => $newVersion,
            'globalVersion' => $newGlobalVersion,
            'configUpdatedAt' => $cfgUpdAct,
            'etag' => $coETag,
            'balance' => $co['balance'],
            'action' => $action,
            'updatedAt' => $now
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // -------------------------------------------------------------------------
    // B. ENDPOINT: /api/moderation/report
    // -------------------------------------------------------------------------
    if ($endpoint === 'moderation/report') {
        $authMod = verifySession($pdo);
        if ($method === 'POST') {
            if (empty($authMod['isAdmin']) && empty($authMod['isStudent'])) {
                http_response_code(403);
                echo json_encode(['error' => 'UNAUTHORIZED_MODERATION_REPORT'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $payload = json_decode($rawInput, true) ?? [];
            $record = [
                'id' => 'MOD-' . round(microtime(true) * 1000),
                'team_id' => (string)($payload['team_id'] ?? ($authMod['coId'] ?? 'UNKNOWN')),
                'student_alias' => (string)($payload['student_alias'] ?? ($authMod['role'] ?? 'ESTUDIANTE')),
                'offending_text' => (string)($payload['offending_text'] ?? ''),
                'matched_term' => (string)($payload['matched_term'] ?? ''),
                'timestamp' => $payload['timestamp'] ?? date('c')
            ];

            $stmt = $pdo->prepare("INSERT INTO moderation_alerts (team_id, student_alias, offending_text, matched_term, timestamp) VALUES (:t, :s, :o, :m, :ts)");
            $stmt->execute([
                ':t' => $record['team_id'],
                ':s' => $record['student_alias'],
                ':o' => $record['offending_text'],
                ':m' => $record['matched_term'],
                ':ts' => $record['timestamp']
            ]);

            echo json_encode(['ok' => true, 'success' => true, 'record' => $record], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($method === 'GET') {
            if (empty($authMod['isAdmin']) && empty($authMod['isCoordinator'])) {
                http_response_code(403);
                echo json_encode(['error' => 'UNAUTHORIZED_MODERATION_READ'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
            $stmt = $pdo->prepare("SELECT id, team_id, student_alias, offending_text, matched_term, timestamp FROM moderation_alerts ORDER BY id DESC LIMIT :lim");
            $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $results = $stmt->fetchAll();
            echo json_encode($results ?: [], JSON_UNESCAPED_UNICODE);
            exit;
        }

        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        exit;
    }

    // -------------------------------------------------------------------------
    // C. ENDPOINT: /api/catalog/:id
    // -------------------------------------------------------------------------
    if (preg_match('#^catalog/([^/]+)$#', $endpoint, $matches)) {
        $targetId = urldecode($matches[1]);
        $auth = verifySession($pdo);
        if (empty($auth['isCoordinator'])) {
            http_response_code(403);
            echo json_encode(['error' => 'UNAUTHORIZED', 'message' => 'Acceso restringido a Coordinación docente.']);
            exit;
        }

        beginImmediateTx($pdo);
        $stmt = $pdo->query("SELECT data FROM state WHERE id = 'current'");
        $row = $stmt->fetch();
        if (!$row) {
            rollbackQuietly($pdo);
            http_response_code(404);
            echo json_encode(['error' => 'State not found']);
            exit;
        }

        $currentState = json_decode($row['data'], true);
        $serverVersion = (int)($currentState['version'] ?? 1);

        if ($method === 'PATCH') {
            $body = json_decode($rawInput, true) ?? [];
            $clientVersion = $body['version'] ?? null;
            $force = !empty($body['force']) || (($_GET['force'] ?? '') === 'true');

            if (!is_numeric($clientVersion)) {
                rollbackQuietly($pdo);
                http_response_code(400);
                echo json_encode(['error' => 'Falta parámetro version']);
                exit;
            }

            if (!$force && (int)$clientVersion !== $serverVersion) {
                rollbackQuietly($pdo);
                http_response_code(409);
                echo json_encode(['error' => 'CONFLICT', 'serverVersion' => $serverVersion]);
                exit;
            }

            $catalog = &$currentState['catalog'];
            $itemIndex = -1;
            foreach ($catalog as $idx => $item) {
                if ((string)$item['id'] === (string)$targetId) {
                    $itemIndex = $idx;
                    break;
                }
            }

            if ($itemIndex === -1) {
                rollbackQuietly($pdo);
                http_response_code(404);
                echo json_encode(['error' => 'Not found']);
                exit;
            }

            $changes = $body['changes'] ?? [];
            if (isset($body['price']) && !isset($changes['price'])) $changes['price'] = (float)$body['price'];
            if (isset($body['name']) && !isset($changes['name'])) $changes['name'] = (string)$body['name'];
            if (isset($body['stock']) && !isset($changes['stock'])) $changes['stock'] = (int)$body['stock'];

            $nowCat = round(microtime(true) * 1000);
            $changes['updatedAt'] = $nowCat;
            $catalog[$itemIndex] = array_merge($catalog[$itemIndex], $changes);
            $currentState['version'] = $serverVersion + 1;
            $currentState['lastUpdated'] = $nowCat;

            $saveStmt = $pdo->prepare("UPDATE state SET data = :data, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'");
            $saveStmt->execute([':data' => json_encode($currentState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
            commitTx($pdo);

            echo json_encode([
                'success' => true,
                'version' => $currentState['version'],
                'item' => $catalog[$itemIndex]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($method === 'DELETE') {
            $body = json_decode($rawInput, true) ?? [];
            $clientVersion = $body['version'] ?? ($_GET['version'] ?? null);
            $force = !empty($body['force']) || (($_GET['force'] ?? '') === 'true');

            if (!is_numeric($clientVersion)) {
                rollbackQuietly($pdo);
                http_response_code(400);
                echo json_encode(['error' => 'Falta parámetro version']);
                exit;
            }

            $catalog = &$currentState['catalog'];
            $itemIndex = -1;
            foreach ($catalog as $idx => $item) {
                if ((string)$item['id'] === (string)$targetId) {
                    $itemIndex = $idx;
                    break;
                }
            }

            // Éxito idempotente si ya no existe
            if ($itemIndex === -1) {
                rollbackQuietly($pdo);
                echo json_encode([
                    'success' => true,
                    'alreadyDeleted' => true,
                    'message' => 'Artículo ya purgado previamente.',
                    'version' => $serverVersion
                ]);
                exit;
            }

            if (!$force && (int)$clientVersion !== $serverVersion) {
                rollbackQuietly($pdo);
                http_response_code(409);
                echo json_encode(['error' => 'CONFLICT', 'serverVersion' => $serverVersion]);
                exit;
            }

            $deletedItem = array_splice($catalog, $itemIndex, 1)[0];
            $currentState['deletedCatalogIds'] = array_values(array_unique(array_merge(
                is_array($currentState['deletedCatalogIds'] ?? null) ? $currentState['deletedCatalogIds'] : [],
                [(string)$targetId]
            )));
            $currentState['version'] = $serverVersion + 1;
            $currentState['lastUpdated'] = round(microtime(true) * 1000);

            $saveStmt = $pdo->prepare("UPDATE state SET data = :data, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'");
            $saveStmt->execute([':data' => json_encode($currentState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
            commitTx($pdo);

            echo json_encode([
                'success' => true,
                'deleted' => $deletedItem,
                'version' => $currentState['version']
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        rollbackQuietly($pdo);
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        exit;
    }

    // -------------------------------------------------------------------------
    // D. ENDPOINT: /api/admin/credentials
    // -------------------------------------------------------------------------
    if ($endpoint === 'admin/credentials') {
        $auth = verifySession($pdo);
        if (!$auth['authorized'] || !$auth['isCoordinator']) {
            http_response_code(403);
            echo json_encode([
                'error' => 'UNAUTHORIZED_COORDINATOR_ACCESS',
                'message' => 'Acceso restringido exclusivamente a Coordinación docente.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        beginImmediateTx($pdo);
        $stmt = $pdo->query("SELECT data FROM state WHERE id = 'current'");
        $row = $stmt->fetch();
        if (!$row) {
            rollbackQuietly($pdo);
            http_response_code(404);
            echo json_encode(['error' => 'Estado corriente no encontrado']);
            exit;
        }

        $currentState = json_decode($row['data'], true);
        if (!is_array($currentState)) {
            $currentState = [];
        }

        if ($method === 'GET') {
            $ensuredChanged = ensureTestCompaniesInState($currentState);
            $teachers = $currentState['config']['teachers'] ?? [];
            $companies = [];
            $allRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
            $defaultCodes = [
                'sandbox_master' => 'TEST-0000',
                'sandbox_student' => 'TEST-1111',
                'astromars' => 'AST-1010',
                'redares' => 'RED-2020',
                'olympus' => 'OLY-3030',
                'curiosity' => 'CUR-4040',
                'phoenix' => 'PHX-5050',
                'valleys' => 'VAL-6060',
                'titan' => 'TTN-7070',
                'nova' => 'NOV-8080',
                'vortex' => 'VTX-9090',
                'astra' => 'AST-1010',
                'orion' => 'ORI-2020',
                'stellar' => 'STL-3030'
            ];
            $hasMutations = $ensuredChanged;
            $now = round(microtime(true) * 1000);

            foreach ($currentState['companies'] ?? [] as $cid => &$co) {
                if (!isset($co['authVault']) || !is_array($co['authVault'])) {
                    $co['authVault'] = ['code' => '', 'roles' => []];
                }
                if (!isset($co['authVault']['roles']) || !is_array($co['authVault']['roles'])) {
                    $co['authVault']['roles'] = [];
                }

                $plainCode = '';
                if (!empty($co['authVault']['code'])) {
                    $plainCode = decodeSecret((string)$co['authVault']['code']);
                }
                if (empty($plainCode) && !empty($co['accessCode'])) {
                    $plainCode = (string)$co['accessCode'];
                }
                if (empty($plainCode)) {
                    $plainCode = $defaultCodes[$cid] ?? (strtoupper(substr($cid, 0, 3)) . '-1010');
                    $co['authVault']['code'] = encodeSecret($plainCode);
                    unset($co['accessCode']);
                    $hasMutations = true;
                }

                $plainRoles = [];
                foreach ($allRoles as $r) {
                    $rPin = '';
                    if (!empty($co['authVault']['roles'][$r])) {
                        $rPin = decodeSecret((string)$co['authVault']['roles'][$r]);
                    } elseif (!empty($co['roles'][$r]) && strpos((string)$co['roles'][$r], 'VLT_') !== 0 && (string)$co['roles'][$r] !== 'PROTECTED') {
                        $rPin = (string)$co['roles'][$r];
                    }
                    if (($r !== 'AUXILIAR' || $cid === 'sandbox_master' || $cid === 'sandbox_student') && (empty($rPin) || $rPin === 'PROTECTED')) {
                        $rPin = '1234';
                        $co['authVault']['roles'][$r] = encodeSecret($rPin);
                        $co['roles'][$r] = 'PROTECTED';
                        $hasMutations = true;
                    }
                    if ($rPin !== '' && $rPin !== 'PROTECTED') {
                        $plainRoles[$r] = $rPin;
                    }
                }

                $companies[$cid] = [
                    'id' => $cid,
                    'name' => $co['name'] ?? $cid,
                    'classGroup' => $co['classGroup'] ?? 'A',
                    'accessCode' => $plainCode,
                    'roles' => $plainRoles,
                    'auxRoleDept' => $co['auxRoleDept'] ?? '',
                    'auxRoleRequest' => $co['auxRoleRequest'] ?? null
                ];
            }
            unset($co);

            if ($hasMutations) {
                $currentState['version'] = ((int)($currentState['version'] ?? 0)) + 1;
                $currentState['lastUpdated'] = $now;
                $saveStmt = $pdo->prepare("UPDATE state SET data = :data, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'");
                $saveStmt->execute([':data' => json_encode($currentState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
            }
            commitTx($pdo);

            $currentVersion = $currentState['version'] ?? 1;
            $savedCu = (int)($currentState['config']['updatedAt'] ?? 0);
            header('ETag: W/"v-' . $currentVersion . '-' . $savedCu . '-coord"');
            header('Cache-Control: private, no-cache');
            echo json_encode([
                'teachers' => $teachers,
                'companies' => $companies,
                'version' => $currentVersion
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($method === 'PATCH') {
            $body = json_decode($rawInput, true) ?? [];
            $type = $body['type'] ?? '';
            $id = (string)($body['id'] ?? '');
            $role = $body['role'] ?? null;
            $newPin = (string)($body['newPin'] ?? '');
            $newCode = (string)($body['newCode'] ?? $newPin);
            $now = round(microtime(true) * 1000);

            if ($type !== 'teacher' && $type !== 'company') {
                rollbackQuietly($pdo);
                http_response_code(400);
                echo json_encode(['error' => 'Parámetros inválidos. Requiere type ("teacher"|"company") e id.']);
                exit;
            }

            if ($type === 'teacher') {
                if (empty($currentState['config']['teachers'][$id])) {
                    rollbackQuietly($pdo);
                    http_response_code(404);
                    echo json_encode(['error' => "Docente $id no encontrado"]);
                    exit;
                }
                $cleanPin = trim($newPin);
                if (!preg_match('/^\d{4}$/', $cleanPin)) {
                    rollbackQuietly($pdo);
                    http_response_code(400);
                    echo json_encode(['error' => 'El PIN docente debe tener exactamente 4 dígitos numéricos']);
                    exit;
                }
                $currentState['config']['teachers'][$id]['pin'] = $cleanPin;
                $currentState['config']['teachers'][$id]['pinUpdatedAt'] = $now;
                $currentState['config']['updatedAt'] = $now;
            } else {
                if (!isValidCompanyId($id)) {
                    rollbackQuietly($pdo);
                    http_response_code(400);
                    echo json_encode(['error' => 'INVALID_COMPANY_ID']);
                    exit;
                }
                if (empty($currentState['companies'][$id])) {
                    $currentState['companies'][$id] = [
                        'id' => $id,
                        'name' => strtoupper($id),
                        'authVault' => ['code' => '', 'roles' => []],
                        'roles' => [],
                        'updatedAt' => $now,
                        'authUpdatedAt' => $now
                    ];
                }
                $co = &$currentState['companies'][$id];
                if (!isset($co['authVault']) || !is_array($co['authVault'])) {
                    $co['authVault'] = ['code' => '', 'roles' => []];
                }

                if (!empty($body['newCode']) || (!empty($body['newPin']) && empty($role) && empty($body['roles']))) {
                    $cleanCode = strtoupper(trim(!empty($body['newCode']) ? (string)$body['newCode'] : (string)$newPin));
                    if (strlen($cleanCode) < 3) {
                        rollbackQuietly($pdo);
                        http_response_code(400);
                        echo json_encode(['error' => 'El código de empresa debe tener al menos 3 caracteres']);
                        exit;
                    }
                    $co['authVault']['code'] = encodeSecret($cleanCode);
                    unset($co['accessCode']);
                }

                if (!empty($body['roles']) && is_array($body['roles'])) {
                    foreach ($body['roles'] as $r => $pin) {
                        $cleanPin = trim((string)$pin);
                        if (preg_match('/^\d{4}$/', $cleanPin)) {
                            $co['authVault']['roles'][$r] = encodeSecret($cleanPin);
                            $co['roles'][$r] = 'PROTECTED';
                            if ($r === 'AUXILIAR' && isset($co['auxRoleRequest']) && is_array($co['auxRoleRequest'])) {
                                $co['auxRoleRequest']['pin'] = $cleanPin;
                                $co['auxRoleRequest']['status'] = 'APROBADO';
                            }
                        }
                    }
                } elseif ($role) {
                    $cleanPin = trim($newPin);
                    if ($role === 'AUXILIAR' && $cleanPin === '') {
                        unset($co['authVault']['roles']['AUXILIAR'], $co['roles']['AUXILIAR']);
                    } else {
                        if (!preg_match('/^\d{4}$/', $cleanPin)) {
                            rollbackQuietly($pdo);
                            http_response_code(400);
                            echo json_encode(['error' => 'El PIN departamental debe tener exactamente 4 dígitos numéricos']);
                            exit;
                        }
                        $co['authVault']['roles'][$role] = encodeSecret($cleanPin);
                        $co['roles'][$role] = 'PROTECTED';
                    }
                    if ($role === 'AUXILIAR') {
                        if (isset($body['auxRoleDept'])) {
                            $d = strtoupper(trim((string)$body['auxRoleDept']));
                            $co['auxRoleDept'] = $d !== '' ? $d : null;
                        }
                        if (isset($body['auxRoleRequest']) && is_array($body['auxRoleRequest'])) {
                            $co['auxRoleRequest'] = $body['auxRoleRequest'];
                            $co['auxRoleRequest']['updatedAt'] = (int)($co['auxRoleRequest']['updatedAt'] ?? $now);
                        } elseif (isset($co['auxRoleRequest']) && is_array($co['auxRoleRequest'])) {
                            $co['auxRoleRequest']['pin'] = $cleanPin;
                            $co['auxRoleRequest']['status'] = $cleanPin === '' ? 'INACTIVO' : 'APROBADO';
                            $co['auxRoleRequest']['updatedAt'] = $now;
                        }
                    }
                }

                $co['updatedAt'] = $now;
                if (empty($body['skipAuthStamp']) || $role !== 'AUXILIAR') {
                    $co['authUpdatedAt'] = $now;
                }
            }

            $currentState['version'] = ((int)($currentState['version'] ?? 0)) + 1;
            $currentState['lastUpdated'] = $now;

            $saveStmt = $pdo->prepare("UPDATE state SET data = :data, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'");
            $saveStmt->execute([':data' => json_encode($currentState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

            if ($type === 'company' && isset($currentState['companies'][$id])) {
                $upCo = $currentState['companies'][$id];
                $coAuthStamp = (int)($upCo['authUpdatedAt'] ?? $now);
                $upCoStmt = $pdo->prepare("
                    UPDATE company_state 
                    SET version = MAX(COALESCE(version, 0) + 1, :ver),
                        updated_at = :upsql,
                        data = json_set(
                            data,
                            '$.authVault', json(:vlt),
                            '$.auxRoleDept', :ard,
                            '$.auxRoleRequest', json(:arr),
                            '$.authUpdatedAt', :au,
                            '$.updatedAt', :up
                        )
                    WHERE company_id = :cid
                ");
                $upCoStmt->execute([
                    ':ver' => (int)$currentState['version'],
                    ':upsql' => $now,
                    ':vlt' => json_encode($upCo['authVault'] ?? [], JSON_UNESCAPED_UNICODE),
                    ':ard' => $upCo['auxRoleDept'] ?? null,
                    ':arr' => json_encode($upCo['auxRoleRequest'] ?? ['status' => 'INACTIVO', 'dept' => '', 'pin' => '', 'updatedAt' => $now], JSON_UNESCAPED_UNICODE),
                    ':au' => $coAuthStamp,
                    ':up' => $now,
                    ':cid' => $id
                ]);
            }
            commitTx($pdo);

            $savedCu = (int)($currentState['config']['updatedAt'] ?? 0);
            $etag = 'W/"v-' . $currentState['version'] . '-' . $savedCu . '-coord"';
            header('ETag: ' . $etag);
            echo json_encode(['success' => true, 'newVersion' => $currentState['version'], 'etag' => $etag]);
            exit;
        }

        rollbackQuietly($pdo);
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        exit;
    }

    // -------------------------------------------------------------------------
    // E. ENDPOINT: /api/admin/reset
    // -------------------------------------------------------------------------
    if ($endpoint === 'admin/reset') {
        if ($method === 'POST') {
            $auth = verifySession($pdo);
            if (empty($auth['isCoordinator'])) {
                http_response_code(403);
                echo json_encode(['error' => 'UNAUTHORIZED_RESET', 'message' => 'Privilegios de Coordinación requeridos']);
                exit;
            }

            $resetBody = json_decode($rawInput, true) ?? [];
            $providedCode = trim((string)($resetBody['code'] ?? ''));
            $validResetCode = ($providedCode !== '' && (
                hash_equals(MARS_TEACHER_MASTER_CODE, $providedCode) ||
                hash_equals('MASTER_MARS_2026', $providedCode)
            ));
            if (!$validResetCode) {
                http_response_code(403);
                echo json_encode(['error' => 'INVALID_MASTER_CODE', 'message' => 'Clave maestra de Coordinación incorrecta o ausente.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            beginImmediateTx($pdo);
            $stmt = $pdo->query("SELECT data FROM state WHERE id = 'current'");
            $row = $stmt->fetch();
            $currentState = $row ? json_decode($row['data'], true) : [];
            if (!is_array($currentState)) {
                $currentState = [];
            }
            ensureTestCompaniesInState($currentState);

            $now = round(microtime(true) * 1000);
            $newEpoch = ((int)($currentState['resetEpoch'] ?? 0)) + 1;
            $newVersion = ((int)($currentState['version'] ?? 0)) + 1;

            // Limpieza completa de todas las empresas a estado virgen (18 entregables pendientes, 2400 €v)
            foreach ($currentState['companies'] ?? [] as $cid => &$co) {
                $co['balance'] = 2400;
                $co['logo'] = null;
                $co['slogan'] = '';
                $co['mission'] = '';
                $co['valueProposition'] = '';
                $co['pendingSlogan'] = null;
                $co['pendingMission'] = null;
                $co['brandStatus'] = null;
                $co['nameChangeStatus'] = null;
                $co['pendingName'] = null;
                $co['nameChangeReason'] = null;
                $co['nameChangeRequest'] = null;
                $co['auxRoleDept'] = null;
                $co['auxRoleRequest'] = [
                    'status' => 'INACTIVO',
                    'dept' => '',
                    'pin' => '',
                    'updatedAt' => $now
                ];
                if (isset($co['authVault']['roles']['AUXILIAR']) && $cid !== 'sandbox_master' && $cid !== 'sandbox_student') {
                    unset($co['authVault']['roles']['AUXILIAR'], $co['roles']['AUXILIAR']);
                }
                $co['deliverables'] = new \stdClass();
                $co['grades'] = new \stdClass();
                $co['contracts'] = new \stdClass();
                $co['phaseBalances'] = new \stdClass();
                $co['pressReleases'] = new \stdClass();
                $co['launchLicense'] = null;
                $co['sponsorAwarded'] = null;
                $co['sponsorData'] = null;
                $co['executiveResolutions'] = [];
                $co['meetingMinutes'] = [];
                $co['specialItemRequests'] = [];
                $co['coordinatorReports'] = [];
                $co['orders'] = [];
                $co['cart'] = [];
                $co['ledger'] = [];
                $co['deletedLedgerTxIds'] = [];
                $co['realCosts'] = [];
                $co['flightTests'] = [];
                $co['votingMotions'] = [];
                $co['aiPrompts'] = [];
                $co['marketingCampaigns'] = [];
                $co['inactivityReports'] = [];
                $co['notifications'] = [];
                $co['sanctions'] = [];
                $co['crisisAlerts'] = [];
                $co['bom'] = [];
                $co['loginStats'] = ['totalLogins' => 0, 'roles' => new \stdClass()];
                $co['brandApproval'] = [
                    'status' => 'APROBADO',
                    'pendingLogo' => null,
                    'pendingSlogan' => '',
                    'feedback' => '',
                    'updatedAt' => 0
                ];
                $co['updatedAt'] = $now;
            }
            unset($co);

            $currentState['catalog'] = getOfficialCatalogDefinition();
            $currentState['b2bMarket'] = [];
            $currentState['b2bContracts'] = [];
            $currentState['securityIncidents'] = [];
            $currentState['suggestionsToAlex'] = [];
            $currentState['pendingCustom'] = [];
            $currentState['news'] = [];
            $currentState['officialNews'] = [];
            $currentState['printEditions'] = [];
            $currentState['printAdLibrary'] = [];
            $currentState['deletedPrintEditionIds'] = [];
            $currentState['pressReleases'] = [];
            $currentState['deletedNewsIds'] = [];
            $currentState['deletedOfficialNewsIds'] = [];
            $currentState['deletedSuggestionIds'] = [];
            $currentState['deletedCompanyIds'] = [];
            $currentState['deletedCatalogIds'] = [];
            $currentState['deletedPendingCustomIds'] = [];
            $currentState['dismissedNotificationIds'] = [];
            $currentState['telemetry'] = ['totalLogins' => 0, 'sessions' => []];
            $currentState['finalContest'] = [
                'finalists' => new \stdClass(),
                'launches' => new \stdClass(),
                'podium' => ['first' => null, 'second' => null, 'third' => null],
                'roleAwards' => ['CEO' => null, 'TECNICO' => null, 'FINANZAS' => null, 'MARKETING' => null, 'OPERACIONES' => null],
                'published' => false,
                'publishedAt' => null,
                'updatedAt' => $now
            ];
            if (!isset($currentState['config']) || !is_array($currentState['config'])) {
                $currentState['config'] = [];
            }
            $currentState['config']['nextOrderId'] = 1001;
            $currentState['config']['orbita'] = ['currentEditionNumber' => 0];
            $currentState['config']['updatedAt'] = $now;
            $currentState['resetEpoch'] = $newEpoch;
            $currentState['version'] = $newVersion;
            $currentState['lastUpdated'] = $now;

            $saveStmt = $pdo->prepare("UPDATE state SET data = :data, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'");
            $saveStmt->execute([':data' => json_encode($currentState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

            $pdo->exec("DELETE FROM company_state");
            $pdo->exec("DELETE FROM news_views");
            try {
                $pdo->exec("DELETE FROM vip_access_log");
            } catch (\Throwable $e) {}
            commitTx($pdo);

            echo json_encode([
                'success' => true,
                'resetEpoch' => $newEpoch,
                'version' => $newVersion,
                'message' => 'Reset transaccional SQLite completado'
            ]);
            exit;
        }

        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        exit;
    }

    // -------------------------------------------------------------------------
    // C2. ENDPOINT: /api/telemetry/vip (Accesos del lector invitado VIP-0000)
    // -------------------------------------------------------------------------
    if ($endpoint === 'telemetry/vip' && $method === 'GET') {
        $vAuth = verifySession($pdo);
        if (empty($vAuth['isCoordinator'])) {
            http_response_code(403);
            echo json_encode(['error' => 'COORDINATOR_ONLY']);
            exit;
        }
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS vip_access_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                accessed_at INTEGER NOT NULL
            )
        ");
        $nowSec = time();
        $tz = new \DateTimeZone('Europe/Madrid');
        $todayDt = new \DateTimeImmutable('today', $tz);
        $todayStart = $todayDt->getTimestamp();
        $weekStart = $nowSec - (7 * 86400);

        $totalLogins = (int)$pdo->query("SELECT COUNT(*) FROM vip_access_log")->fetchColumn();
        $stmtToday = $pdo->prepare("SELECT COUNT(*) FROM vip_access_log WHERE accessed_at >= :t");
        $stmtToday->execute([':t' => $todayStart]);
        $todayLogins = (int)$stmtToday->fetchColumn();

        $stmtWeek = $pdo->prepare("SELECT COUNT(*) FROM vip_access_log WHERE accessed_at >= :w");
        $stmtWeek->execute([':w' => $weekStart]);
        $last7DaysLogins = (int)$stmtWeek->fetchColumn();

        $lastLoginAt = (int)$pdo->query("SELECT COALESCE(MAX(accessed_at), 0) FROM vip_access_log")->fetchColumn();

        $stmtRecent = $pdo->query("SELECT accessed_at FROM vip_access_log ORDER BY accessed_at DESC, id DESC LIMIT 30");
        $recentRows = $stmtRecent ? $stmtRecent->fetchAll(\PDO::FETCH_COLUMN) : [];
        $recentAccesses = array_map('intval', $recentRows ?: []);

        $cutoff14 = $todayDt->modify('-13 days')->getTimestamp();
        $stmt14 = $pdo->prepare("SELECT accessed_at FROM vip_access_log WHERE accessed_at >= :c ORDER BY accessed_at DESC");
        $stmt14->execute([':c' => $cutoff14]);
        $dayCounts = [];
        foreach (($stmt14->fetchAll(\PDO::FETCH_COLUMN) ?: []) as $tsVal) {
            $dKey = (new \DateTimeImmutable('@' . (int)$tsVal))->setTimezone($tz)->format('Y-m-d');
            $dayCounts[$dKey] = ($dayCounts[$dKey] ?? 0) + 1;
        }
        $dailySummary = [];
        foreach ($dayCounts as $day => $cnt) {
            $dailySummary[] = ['date' => $day, 'count' => $cnt];
        }

        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        echo json_encode([
            'totalLogins' => $totalLogins,
            'todayLogins' => $todayLogins,
            'last7DaysLogins' => $last7DaysLogins,
            'lastLoginAt' => $lastLoginAt,
            'dailySummary' => $dailySummary,
            'recentAccesses' => $recentAccesses
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // -------------------------------------------------------------------------
    // D. ENDPOINTS DE PERIÓDICO ORBITAL REPORT (SNAPI v4 + EXTRACTOR + TRADUCTOR + PROXY IMG)
    // -------------------------------------------------------------------------
    if ($endpoint === 'news/image' || $endpoint === 'news/wire' || $endpoint === 'news/article' || $endpoint === 'news/translate' || $endpoint === 'news/view' || $endpoint === 'news/top') {
        $isAllowedNewsHttpUrl = function (string $url): bool {
            $parts = @parse_url($url);
            if (!$parts || empty($parts['scheme']) || empty($parts['host'])) return false;
            $scheme = strtolower($parts['scheme']);
            if ($scheme !== 'http' && $scheme !== 'https') return false;
            $host = strtolower($parts['host']);
            if ($host === 'localhost' || $host === '127.0.0.1' || $host === '::1') return false;
            $ip = @gethostbyname($host);
            if ($ip && filter_var($ip, FILTER_VALIDATE_IP)) {
                if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return false;
                }
            }
            return true;
        };

        $httpGetServer = function (string $url, int $timeout = 10, bool $isImage = false): array {
            if (function_exists('curl_init')) {
                $ch = curl_init($url);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_MAXREDIRS => 4,
                    CURLOPT_TIMEOUT => $timeout,
                    CURLOPT_CONNECTTIMEOUT => 5,
                    CURLOPT_SSL_VERIFYPEER => true,
                    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                    CURLOPT_HTTPHEADER => $isImage
                        ? ['Accept: image/avif,image/webp,image/apng,image/*,*/*;q=0.8']
                        : ['Accept: text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8', 'Accept-Language: en-US,en;q=0.9,es;q=0.8']
                ]);
                $body = curl_exec($ch);
                $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $ctype = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
                curl_close($ch);
                if (is_string($body) && $code >= 200 && $code < 400) {
                    return ['ok' => true, 'body' => $body, 'code' => $code, 'contentType' => $ctype];
                }
            }
            $ctx = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'timeout' => $timeout,
                    'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36\r\n"
                ]
            ]);
            $body = @file_get_contents($url, false, $ctx);
            if (is_string($body) && $body !== '') {
                return ['ok' => true, 'body' => $body, 'code' => 200, 'contentType' => ''];
            }
            return ['ok' => false, 'body' => '', 'code' => 0, 'contentType' => ''];
        };

        $translateServer = function (string $text, string $from = 'en', string $to = 'es') use ($httpGetServer): string {
            $clean = trim($text);
            if ($clean === '' || $from === $to) return $clean;
            $chunks = preg_split('/\n{2,}/', $clean) ?: [$clean];
            $outParts = [];
            foreach ($chunks as $chunk) {
                $chunk = trim($chunk);
                if ($chunk === '') continue;
                $tr = '';
                $gUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' . rawurlencode($from) . '&tl=' . rawurlencode($to) . '&dt=t&q=' . rawurlencode(mb_substr($chunk, 0, 1800, 'UTF-8'));
                $res = $httpGetServer($gUrl, 8, false);
                if ($res['ok'] && $res['body'] !== '') {
                    $json = json_decode($res['body'], true);
                    if (is_array($json) && isset($json[0]) && is_array($json[0])) {
                        $buf = '';
                        foreach ($json[0] as $seg) {
                            if (is_array($seg) && isset($seg[0])) $buf .= (string)$seg[0];
                        }
                        $tr = trim($buf);
                    }
                }
                if ($tr === '') {
                    $mmUrl = 'https://api.mymemory.translated.net/get?q=' . rawurlencode(mb_substr($chunk, 0, 480, 'UTF-8')) . '&langpair=' . rawurlencode($from . '|' . $to);
                    $res2 = $httpGetServer($mmUrl, 8, false);
                    if ($res2['ok'] && $res2['body'] !== '') {
                        $j2 = json_decode($res2['body'], true);
                        $cand = trim((string)($j2['responseData']['translatedText'] ?? ''));
                        if ($cand !== '' && stripos($cand, 'MYMEMORY WARNING') === false) {
                            $tr = $cand;
                        }
                    }
                }
                $outParts[] = ($tr !== '') ? $tr : $chunk;
            }
            return implode("\n\n", $outParts);
        };

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS news_cache (
                cache_key TEXT PRIMARY KEY,
                payload LONGTEXT NOT NULL,
                updated_at INTEGER NOT NULL
            )
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS news_views (
                article_id TEXT PRIMARY KEY,
                views INTEGER NOT NULL DEFAULT 0,
                vip_views INTEGER NOT NULL DEFAULT 0,
                updated_at INTEGER NOT NULL
            )
        ");
        try {
            $pdo->exec("ALTER TABLE news_views ADD COLUMN vip_views INTEGER NOT NULL DEFAULT 0");
        } catch (\Throwable $e) {}

        if ($endpoint === 'news/translate' && $method === 'POST') {
            $tBody = json_decode($rawInput, true);
            $txt = trim((string)($tBody['text'] ?? ''));
            $from = trim((string)($tBody['from'] ?? 'es'));
            $to = trim((string)($tBody['to'] ?? 'en'));
            $translated = ($txt !== '') ? $translateServer($txt, $from, $to) : '';
            echo json_encode(['translatedText' => $translated], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }

        if ($endpoint === 'news/image') {
            $imgUrl = trim((string)($_GET['url'] ?? ''));
            if ($imgUrl !== '' && $isAllowedNewsHttpUrl($imgUrl)) {
                $res = $httpGetServer($imgUrl, 9, true);
                if ($res['ok'] && strlen($res['body']) > 256 && strlen($res['body']) <= 4 * 1024 * 1024) {
                    $ctype = strtolower(trim(explode(';', $res['contentType'])[0] ?? ''));
                    if (strpos($ctype, 'image/') !== 0) {
                        $finfo = class_exists('finfo') ? new \finfo(FILEINFO_MIME_TYPE) : null;
                        $detected = $finfo ? (string)$finfo->buffer($res['body']) : '';
                        if (strpos($detected, 'image/') === 0) $ctype = $detected;
                    }
                    if (strpos($ctype, 'image/') === 0 && $ctype !== 'image/svg+xml') {
                        header('Content-Type: ' . $ctype);
                        header('Cache-Control: public, max-age=86400');
                        echo $res['body'];
                        exit;
                    }
                }
            }
            header('Content-Type: image/svg+xml; charset=utf-8');
            header('Cache-Control: public, max-age=3600');
            echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#111827"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/><g stroke="#cbd5e1" stroke-opacity="0.15"><path d="M0 180H1280M0 360H1280M0 540H1280M320 0V720M640 0V720M960 0V720"/></g><polygon points="640,120 685,250 685,460 595,460 595,250" fill="#f8fafc" fill-opacity="0.9"/><polygon points="595,380 540,490 595,460" fill="#991b1b"/><polygon points="685,380 740,490 685,460" fill="#991b1b"/><text x="640" y="575" text-anchor="middle" fill="#e2e8f0" font-family="Georgia, serif" font-size="34" font-weight="bold" letter-spacing="4">Órbita. // ARCHIVO FOTOGRÁFICO</text></svg>';
            exit;
        }

        if ($endpoint === 'news/view' && $method === 'POST') {
            $vAuth = verifySession($pdo);
            if (empty($vAuth['authorized']) && empty($vAuth['isVip']) && empty($vAuth['isStudent']) && empty($vAuth['isTeacher'])) {
                http_response_code(401);
                echo json_encode(['error' => 'SESSION_REQUIRED']);
                exit;
            }
            $vBody = json_decode($rawInput, true);
            $articleId = trim((string)($vBody['articleId'] ?? ($vBody['article_id'] ?? '')));
            if (!preg_match('/^[A-Za-z0-9_.-]{3,80}$/', $articleId)) {
                http_response_code(400);
                echo json_encode(['error' => 'INVALID_ARTICLE_ID']);
                exit;
            }
            $nowSec = time();
            $isVipViewer = !empty($vAuth['isVip']) || strtoupper((string)($vAuth['role'] ?? '')) === 'VIP_READER';
            $vipInc = $isVipViewer ? 1 : 0;
            $stmtV = $pdo->prepare("
                INSERT INTO news_views (article_id, views, vip_views, updated_at)
                VALUES (:id, 1, :vip, :u)
                ON CONFLICT(article_id) DO UPDATE SET views = views + 1, vip_views = COALESCE(vip_views, 0) + :vip, updated_at = :u
            ");
            $stmtV->execute([':id' => $articleId, ':vip' => $vipInc, ':u' => $nowSec]);
            $stmtGet = $pdo->prepare("SELECT views, COALESCE(vip_views, 0) AS vip_views FROM news_views WHERE article_id = :id");
            $stmtGet->execute([':id' => $articleId]);
            $vRow = $stmtGet->fetch();
            echo json_encode([
                'ok' => true,
                'articleId' => $articleId,
                'views' => (int)($vRow['views'] ?? 1),
                'vipViews' => (int)($vRow['vip_views'] ?? $vipInc)
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }

        if ($endpoint === 'news/top' && $method === 'GET') {
            $limit = max(1, min(200, (int)($_GET['limit'] ?? 20)));
            $stmtTop = $pdo->prepare("SELECT article_id, views, COALESCE(vip_views, 0) AS vip_views, updated_at FROM news_views WHERE views > 0 ORDER BY views DESC, updated_at DESC LIMIT :lim");
            $stmtTop->bindValue(':lim', $limit, \PDO::PARAM_INT);
            $stmtTop->execute();
            $topRows = $stmtTop->fetchAll();
            $topItems = [];
            foreach ($topRows as $trRow) {
                $topItems[] = [
                    'articleId' => (string)$trRow['article_id'],
                    'views' => (int)$trRow['views'],
                    'vipViews' => (int)($trRow['vip_views'] ?? 0),
                    'updatedAt' => (int)($trRow['updated_at'] ?? 0)
                ];
            }
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            echo json_encode(['items' => $topItems], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }

        if ($endpoint === 'news/wire') {
            $sectionMap = [
                'nasa' => 'nasa',
                'lanzamientos' => 'launch',
                'tecnologia' => 'technology',
                'industria' => 'industry',
                'juguetes' => 'lego'
            ];
            $rawSection = strtolower(trim((string)($_GET['section'] ?? '')));
            $secKey = isset($sectionMap[$rawSection]) ? $rawSection : '';
            $q = $secKey !== '' ? $sectionMap[$secKey] : trim((string)($_GET['q'] ?? 'rocket'));
            if ($q === '') $q = 'rocket';
            $forceReq = ((string)($_GET['force'] ?? '0') === '1');
            $nowSec = time();

            if ($forceReq) {
                $wAuth = verifySession($pdo);
                if (empty($wAuth['isCoordinator'])) {
                    http_response_code(403);
                    echo json_encode(['error' => 'COORDINATOR_ONLY_REFRESH']);
                    exit;
                }
                $cdKey = 'wire_cd_' . md5(($secKey !== '' ? $secKey : strtolower($q)));
                $stmtCd = $pdo->prepare("SELECT updated_at FROM news_cache WHERE cache_key = :k");
                $stmtCd->execute([':k' => $cdKey]);
                $cdRow = $stmtCd->fetch();
                if ($cdRow && ($nowSec - (int)$cdRow['updated_at']) < 60) {
                    $retryAfter = 60 - ($nowSec - (int)$cdRow['updated_at']);
                    http_response_code(429);
                    echo json_encode(['error' => 'COOLDOWN', 'retryAfterSec' => max(1, $retryAfter)]);
                    exit;
                }
                $pdo->prepare("INSERT OR REPLACE INTO news_cache (cache_key, payload, updated_at) VALUES (:k, '1', :u)")
                    ->execute([':k' => $cdKey, ':u' => $nowSec]);
            }

            $cacheKey = 'wire_' . md5(($secKey !== '' ? $secKey . ':' : '') . strtolower($q));
            $stmtC = $pdo->prepare("SELECT payload, updated_at FROM news_cache WHERE cache_key = :k");
            $stmtC->execute([':k' => $cacheKey]);
            $cRow = $stmtC->fetch();
            $cachedPayload = ($cRow && !empty($cRow['payload'])) ? json_decode((string)$cRow['payload'], true) : null;
            $hasStale = (is_array($cachedPayload) && !empty($cachedPayload['results']));

            if (!$forceReq && $hasStale && ($nowSec - (int)$cRow['updated_at']) < 1800) {
                $cachedPayload['source'] = 'cache';
                $cachedPayload['section'] = $secKey !== '' ? $secKey : 'general';
                echo json_encode($cachedPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                exit;
            }

            // Bloqueo anti-avalancha (single-flight 20s) si no es recarga forzada de Coordinación
            $lockKey = 'wire_lock_' . md5(($secKey !== '' ? $secKey : strtolower($q)));
            if (!$forceReq && $hasStale) {
                $stmtL = $pdo->prepare("SELECT updated_at FROM news_cache WHERE cache_key = :k");
                $stmtL->execute([':k' => $lockKey]);
                $lRow = $stmtL->fetch();
                if ($lRow && ($nowSec - (int)$lRow['updated_at']) < 20) {
                    $cachedPayload['source'] = 'stale_fallback';
                    $cachedPayload['section'] = $secKey !== '' ? $secKey : 'general';
                    echo json_encode($cachedPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    exit;
                }
            }
            $pdo->prepare("INSERT OR REPLACE INTO news_cache (cache_key, payload, updated_at) VALUES (:k, '1', :u)")
                ->execute([':k' => $lockKey, ':u' => $nowSec]);

            $translateBatchServer = function (array $texts) use ($httpGetServer, $translateServer): array {
                $count = count($texts);
                if ($count === 0) return [];
                $out = array_fill(0, $count, '');
                $sep = "\n[[S]]\n";
                $chunks = [];
                $curIdx = [];
                $curLen = 0;
                foreach ($texts as $idx => $txt) {
                    $clean = trim(str_replace('[[S]]', ' ', (string)$txt));
                    $len = mb_strlen($clean, 'UTF-8');
                    if (!empty($curIdx) && ($curLen + $len + 8) > 1350) {
                        $chunks[] = $curIdx;
                        $curIdx = [];
                        $curLen = 0;
                    }
                    $curIdx[] = [$idx, $clean];
                    $curLen += $len + 8;
                }
                if (!empty($curIdx)) $chunks[] = $curIdx;

                foreach ($chunks as $chunk) {
                    $joined = implode($sep, array_map(function ($pair) { return $pair[1]; }, $chunk));
                    if (trim($joined) === '') continue;
                    $gUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=' . rawurlencode(mb_substr($joined, 0, 1750, 'UTF-8'));
                    $res = $httpGetServer($gUrl, 7, false);
                    $translatedWhole = '';
                    if ($res['ok'] && $res['body'] !== '') {
                        $json = json_decode($res['body'], true);
                        if (is_array($json) && isset($json[0]) && is_array($json[0])) {
                            foreach ($json[0] as $seg) {
                                if (is_array($seg) && isset($seg[0])) $translatedWhole .= (string)$seg[0];
                            }
                        }
                    }
                    $parts = preg_split('/\s*\[\[\s*S\s*\]\]\s*/u', trim($translatedWhole));
                    if (is_array($parts) && count($parts) === count($chunk)) {
                        foreach ($chunk as $pos => $pair) {
                            $cand = trim((string)$parts[$pos]);
                            $out[$pair[0]] = ($cand !== '') ? $cand : $pair[1];
                        }
                    } else {
                        // Respaldo seguro por ítem o inglés si el separador cambió
                        foreach ($chunk as $pair) {
                            $fallbackTr = (count($chunk) <= 4) ? $translateServer($pair[1], 'en', 'es') : $pair[1];
                            $out[$pair[0]] = ($fallbackTr !== '') ? $fallbackTr : $pair[1];
                        }
                    }
                }
                return $out;
            };

            $queries = [$q];
            if ($secKey === 'lanzamientos') {
                $queries = ['launch', 'rocket'];
            } elseif ($secKey === 'juguetes') {
                $queries = ['lego', 'toy', 'model'];
            }
            $rawResults = [];
            foreach ($queries as $tryQ) {
                $snapiUrl = 'https://api.spaceflightnewsapi.net/v4/articles/?limit=6&search=' . rawurlencode($tryQ);
                $res = $httpGetServer($snapiUrl, 8, false);
                if ($res['ok'] && $res['body'] !== '') {
                    $decoded = json_decode($res['body'], true);
                    $cand = is_array($decoded['results'] ?? null) ? $decoded['results'] : [];
                    if (!empty($cand)) {
                        $rawResults = $cand;
                        break;
                    }
                }
            }
            $items = [];
            if (!empty($rawResults)) {
                $titlesToTr = [];
                $summariesToTr = [];
                $filtered = [];
                foreach ($rawResults as $art) {
                    if (!is_array($art) || empty($art['title'])) continue;
                    $tEn = trim((string)$art['title']);
                    $sEn = trim((string)($art['summary'] ?? ''));
                    $filtered[] = $art;
                    $titlesToTr[] = $tEn;
                    $summariesToTr[] = mb_substr($sEn, 0, 500, 'UTF-8');
                }
                $titlesEs = $translateBatchServer($titlesToTr);
                $summariesEs = $translateBatchServer($summariesToTr);
                foreach ($filtered as $idx => $art) {
                    $tEn = trim((string)$art['title']);
                    $sEn = trim((string)($art['summary'] ?? ''));
                    $rawImg = (string)($art['image_url'] ?? '');
                    $proxyImg = ($rawImg !== '' && $isAllowedNewsHttpUrl($rawImg))
                        ? ('/api/news/image?url=' . rawurlencode($rawImg))
                        : '';
                    $items[] = [
                        'id' => (string)($art['id'] ?? md5($tEn)),
                        'title' => $tEn,
                        'titleEs' => (string)($titlesEs[$idx] ?? $tEn),
                        'summary' => $sEn,
                        'summaryEs' => (string)($summariesEs[$idx] ?? $sEn),
                        'news_site' => (string)($art['news_site'] ?? 'Aerospace Wire'),
                        'published_at' => (string)($art['published_at'] ?? ''),
                        'url' => (string)($art['url'] ?? ''),
                        'image_url' => $rawImg,
                        'proxy_image_url' => $proxyImg
                    ];
                }
            }
            if (empty($items) && $hasStale) {
                $cachedPayload['source'] = 'stale_fallback';
                $cachedPayload['section'] = $secKey !== '' ? $secKey : 'general';
                echo json_encode($cachedPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                exit;
            }
            $outPayload = [
                'results' => $items,
                'cachedAt' => $nowSec,
                'source' => 'live',
                'section' => $secKey !== '' ? $secKey : 'general'
            ];
            if (!empty($items)) {
                $pdo->prepare("INSERT OR REPLACE INTO news_cache (cache_key, payload, updated_at) VALUES (:k, :p, :u)")
                    ->execute([':k' => $cacheKey, ':p' => json_encode($outPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), ':u' => $nowSec]);
            }
            echo json_encode($outPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }

        if ($endpoint === 'news/article') {
            $artUrl = trim((string)($_GET['url'] ?? ''));
            $fallbackTitle = trim((string)($_GET['title'] ?? ''));
            $fallbackSummary = trim((string)($_GET['summary'] ?? ''));
            $siteName = trim((string)($_GET['site'] ?? 'Aerospace Press'));
            $fallbackImg = trim((string)($_GET['img'] ?? ''));

            if ($artUrl === '' || !$isAllowedNewsHttpUrl($artUrl)) {
                http_response_code(400);
                echo json_encode(['error' => 'INVALID_ARTICLE_URL']);
                exit;
            }

            $cacheKey = 'art_' . md5($artUrl);
            $stmtC = $pdo->prepare("SELECT payload, updated_at FROM news_cache WHERE cache_key = :k");
            $stmtC->execute([':k' => $cacheKey]);
            $cRow = $stmtC->fetch();
            $nowSec = time();
            if ($cRow && ($nowSec - (int)$cRow['updated_at']) < 86400) {
                $cached = json_decode((string)$cRow['payload'], true);
                if (is_array($cached) && !empty($cached['bodyEn'])) {
                    echo json_encode($cached, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    exit;
                }
            }

            $res = $httpGetServer($artUrl, 12, false);
            $paragraphs = [];
            $extractedTitle = $fallbackTitle;
            $extractedImg = $fallbackImg;

            if ($res['ok'] && $res['body'] !== '' && class_exists('DOMDocument')) {
                $html = $res['body'];
                $dom = new \DOMDocument();
                $prevErr = libxml_use_internal_errors(true);
                @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_NOWARNING | LIBXML_NOERROR);
                libxml_clear_errors();
                libxml_use_internal_errors($prevErr);

                $xpath = new \DOMXPath($dom);
                foreach ($xpath->query('//script|//style|//noscript|//nav|//header|//footer|//aside|//form') as $node) {
                    if ($node->parentNode) $node->parentNode->removeChild($node);
                }

                $ogImg = $xpath->query('//meta[@property="og:image"]/@content|//meta[@name="twitter:image"]/@content');
                if ($ogImg && $ogImg->length > 0) {
                    $candImg = trim((string)$ogImg->item(0)->nodeValue);
                    if ($candImg !== '' && $isAllowedNewsHttpUrl($candImg)) $extractedImg = $candImg;
                }
                if ($extractedTitle === '') {
                    $ogT = $xpath->query('//meta[@property="og:title"]/@content|//h1');
                    if ($ogT && $ogT->length > 0) $extractedTitle = trim((string)$ogT->item(0)->textContent);
                }

                $pNodes = $xpath->query('//article//p');
                if (!$pNodes || $pNodes->length < 3) {
                    $pNodes = $xpath->query('//main//p|//div[contains(@class,"content") or contains(@class,"article") or contains(@class,"post")]//p|//p');
                }
                $seenP = [];
                if ($pNodes) {
                    foreach ($pNodes as $pNode) {
                        $txt = preg_replace('/\s+/', ' ', trim((string)$pNode->textContent));
                        if ($txt === '' || mb_strlen($txt, 'UTF-8') < 48) continue;
                        if (preg_match('/^(subscribe|sign up|cookie|privacy|advertisement|read more|all rights reserved|follow us)/i', $txt)) continue;
                        $sig = md5($txt);
                        if (isset($seenP[$sig])) continue;
                        $seenP[$sig] = true;
                        $paragraphs[] = $txt;
                        if (count($paragraphs) >= 10) break;
                    }
                }
            }

            if (count($paragraphs) < 2 && $fallbackSummary !== '') {
                $paragraphs = array_values(array_filter(array_merge([$fallbackSummary], $paragraphs)));
            }
            if (empty($paragraphs)) {
                $paragraphs = [$extractedTitle ?: 'Aerospace launch update reported by ' . $siteName . '.'];
            }

            $bodyEn = implode("\n\n", $paragraphs);
            $titleEn = $extractedTitle ?: 'Aerospace Dispatch';
            $titleEs = $translateServer($titleEn, 'en', 'es');
            $bodyEs = $translateServer($bodyEn, 'en', 'es');
            $summaryEs = $fallbackSummary !== '' ? $translateServer($fallbackSummary, 'en', 'es') : '';

            $proxyImg = ($extractedImg !== '' && $isAllowedNewsHttpUrl($extractedImg))
                ? ('/api/news/image?url=' . rawurlencode($extractedImg))
                : '/api/news/image';

            $articlePayload = [
                'url' => $artUrl,
                'sourceName' => $siteName,
                'titleEn' => $titleEn,
                'titleEs' => $titleEs,
                'subtitleEn' => $fallbackSummary,
                'subtitleEs' => $summaryEs,
                'bodyEn' => $bodyEn,
                'bodyEs' => $bodyEs,
                'imageUrl' => $proxyImg,
                'rawImageUrl' => $extractedImg,
                'extractedParagraphs' => count($paragraphs)
            ];

            $pdo->prepare("INSERT OR REPLACE INTO news_cache (cache_key, payload, updated_at) VALUES (:k, :p, :u)")
                ->execute([':k' => $cacheKey, ':p' => json_encode($articlePayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), ':u' => $nowSec]);

            echo json_encode($articlePayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }
    }

    // 404 para cualquier endpoint de API no reconocido
    http_response_code(404);
    echo json_encode([
        'error' => 'ENDPOINT_NOT_FOUND',
        'endpoint' => $endpoint,
        'message' => 'Endpoint API no reconocido en MARS-KET OS'
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO) {
        rollbackQuietly($pdo);
    }
    http_response_code(500);
    echo json_encode([
        'error' => 'INTERNAL_SERVER_ERROR',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
