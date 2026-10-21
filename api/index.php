<?php
// api/index.php
// Front-Controller Atómico de MARS-KET OS para Hosting CDMON (Apache + PHP 8.x + SQLite3)
// Versión: v1.1.07

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

// 2. Control de Tamaño de Carga (Tope 2 MB)
$maxBytes = 2 * 1024 * 1024;
$rawInput = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
if ($rawInput !== false && strlen($rawInput) > $maxBytes) {
    http_response_code(413);
    echo json_encode([
        'error' => 'PAYLOAD_TOO_LARGE',
        'message' => 'El cuerpo de la petición excede el límite máximo permitido de 2 MB.'
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

function verifySession(): array {
    $token = getAuthorizationToken();
    if (!$token) {
        return ['authorized' => false, 'isCoordinator' => false, 'role' => null, 'isAdmin' => false];
    }

    if ($token === MARS_TEACHER_MASTER_CODE) {
        return ['authorized' => true, 'isCoordinator' => true, 'role' => 'coordinador', 'isAdmin' => true];
    }

    $decoded = '';
    if (strpos($token, 'VLT_') === 0) {
        $decoded = decodeSecret($token);
    } elseif (strpos($token, '.') !== false) {
        $parts = explode('.', $token);
        if (isset($parts[1])) {
            $payload = json_decode((string)base64_decode($parts[1]), true);
            $role = strtolower((string)($payload['role'] ?? $payload['sub'] ?? ''));
            $isCoord = strpos($role, 'coord') !== false || $role === 'coordinador' || !empty($payload['admin']);
            return ['authorized' => $isCoord, 'isCoordinator' => $isCoord, 'role' => $role, 'isAdmin' => $isCoord];
        }
    } else {
        $decoded = $token;
    }

    $lower = strtolower($decoded);
    if (strpos($decoded, 'T|') === 0) {
        $parts = explode('|', $decoded);
        $role = $parts[1] ?? '';
        $rLower = strtolower($role);
        $isCoord = strpos($rLower, 'coord') !== false || $rLower === 'coordinador' || $rLower === 'docente';
        return ['authorized' => $isCoord, 'isCoordinator' => $isCoord, 'role' => $role, 'isAdmin' => true];
    }

    if (strpos($decoded, 'S|') === 0) {
        $parts = explode('|', $decoded);
        return [
            'authorized' => false,
            'isCoordinator' => false,
            'isStudent' => true,
            'role' => $parts[2] ?? 'student',
            'coId' => $parts[1] ?? '',
            'isAdmin' => false
        ];
    }

    if (strpos($lower, 'coord') !== false || $lower === 'coordinador' || $lower === 'docente') {
        return ['authorized' => true, 'isCoordinator' => true, 'role' => 'coordinador', 'isAdmin' => true];
    }

    return ['authorized' => false, 'isCoordinator' => false, 'role' => null, 'isAdmin' => false];
}

function sanitizeStateForClient(array $state): array {
    if (isset($state['config']['teachers']) && is_array($state['config']['teachers'])) {
        foreach ($state['config']['teachers'] as $tk => &$t) {
            if (is_array($t)) {
                unset($t['pin']);
            }
        }
    }
    if (isset($state['companies']) && is_array($state['companies'])) {
        foreach ($state['companies'] as $cid => &$co) {
            if (is_array($co)) {
                unset($co['authVault'], $co['roles'], $co['accessCode']);
            }
        }
    }
    return $state;
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

            // Descarga de backup específico (Zero-Heap con json_remove)
            if ($action === 'get_backup') {
                $type = (string)($_GET['type'] ?? 'backup_daily');
                $stmt = $pdo->prepare("
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
                    ) AS clean_data FROM state WHERE id = :id
                ");
                $stmt->execute([':id' => $type]);
                $row = $stmt->fetch();
                if ($row && !empty($row['clean_data'])) {
                    header('Content-Type: application/json; charset=utf-8');
                    echo $row['clean_data'];
                    exit;
                }
                echo json_encode(['status' => 'empty']);
                exit;
            }

            // Mitigación de Ancho de Banda con ETag y HTTP 304 (0 bytes si la versión coincide)
            $stmt = $pdo->query("SELECT json_extract(data, '$.version') as v FROM state WHERE id = 'current'");
            $row = $stmt->fetch();
            $version = (string)($row['v'] ?? '1');
            $serverETag = 'W/"v-' . $version . '"';
            $clientETag = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';

            if ($clientETag === $serverETag) {
                http_response_code(304);
                header('ETag: ' . $serverETag);
                header('Cache-Control: public, no-cache');
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
                header('Cache-Control: public, no-cache');
                echo json_encode(['status' => 'empty']);
                exit;
            }

            $cleanPayload = $row['clean_data'];
            // Purgado complementario sobre string crudo para empresas dinámicas sin instanciar grafos en PHP
            if (strpos($cleanPayload, '"authVault"') !== false || strpos($cleanPayload, '"accessCode"') !== false) {
                $cleanPayload = preg_replace('/"authVault":\s*\{[^}]*\}/', '"authVault":{"code":"","roles":{}}', $cleanPayload);
                $cleanPayload = preg_replace('/"accessCode":\s*"[^"]*"/', '"accessCode":""', $cleanPayload);
            }

            header('Content-Type: application/json; charset=utf-8');
            header('ETag: ' . $serverETag);
            header('Cache-Control: public, no-cache');
            echo $cleanPayload;
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
                $code = (string)($payload['code'] ?? '');
                $verified = ($code === MARS_TEACHER_MASTER_CODE || $code === 'KetMars02');
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

                if ($coIdInput !== '') {
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

                http_response_code(404);
                echo json_encode(['error' => 'Company code not found']);
                exit;
            }

            // Acción: Verificación de PIN de alumno / departamento (Zero-Heap con json_extract)
            if ($action === 'verify_student_login') {
                $coId = (string)($payload['coId'] ?? '');
                $role = (string)($payload['role'] ?? '');
                $pinAttempt = trim((string)($payload['pin'] ?? ''));

                $stmt = $pdo->prepare("
                    SELECT 
                        json_extract(data, '$.companies.' || :coId || '.roles.' || :role) AS role_pin,
                        json_extract(data, '$.companies.' || :coId || '.authVault.roles.' || :role) AS vault_pin,
                        json_extract(data, '$.companies.' || :coId || '.name') AS name
                    FROM state WHERE id = 'current'
                ");
                $stmt->execute([':coId' => $coId, ':role' => $role]);
                $row = $stmt->fetch();

                if ($row && $row['name'] !== null) {
                    $expectedPin = '';
                    if (!empty($row['vault_pin'])) {
                        $expectedPin = trim(decodeSecret((string)$row['vault_pin']));
                    } elseif (!empty($row['role_pin']) && strpos((string)$row['role_pin'], 'VLT_') !== 0) {
                        $expectedPin = trim((string)$row['role_pin']);
                    }
                    if (!$expectedPin && $role !== 'AUXILIAR') {
                        $expectedPin = '1234';
                    }
                    $verified = ($expectedPin !== '' && $expectedPin === $pinAttempt);
                    http_response_code($verified ? 200 : 401);
                    echo json_encode([
                        'verified' => $verified,
                        'companyName' => $row['name'] ?? 'EMPRESA',
                        'token' => $verified ? encodeSecret("S|{$coId}|{$role}|" . time()) : null
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

                $stmt = $pdo->prepare("
                    SELECT json_extract(data, '$.config.teachers.' || :role || '.pin') AS pin
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
                $verified = ($expectedPin !== '' && $expectedPin === $pinAttempt);

                http_response_code($verified ? 200 : 401);
                echo json_encode(['verified' => $verified]);
                exit;
            }

            // Acción: Forzado de backup SQLite nativo
            if ($action === 'force_backup') {
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

            // Guardado de Estado: Autorización y Particionado Zero-Trust
            $auth = verifySession();
            $isCoord = !empty($auth['authorized']);
            $isStudent = !empty($auth['isStudent']) || !empty($auth['coId']);

            // Permitir guardado tanto a Coordinación docente como a Startups/Alumnos autenticados
            if (!$isCoord && !$isStudent) {
                http_response_code(403);
                echo json_encode([
                    'error' => 'UNAUTHORIZED_MUTATION',
                    'message' => 'Guardado restringido a sesiones activas de la misión.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->query("SELECT data FROM state WHERE id = 'current'");
            $row = $stmt->fetch();
            $currentState = $row ? json_decode($row['data'], true) : [];

            // Si es un Alumno/Empresa, blindar la configuración global y resto de empresas
            if (!$isCoord) {
                // 1. Prohibir a alumnos alterar la configuración y fechas límite
                if (isset($currentState['config'])) {
                    $payload['config'] = $currentState['config'];
                }
                // 2. Prohibir a alumnos alterar el catálogo oficial
                if (isset($currentState['catalog'])) {
                    $payload['catalog'] = $currentState['catalog'];
                }
                // 3. Si el alumno tiene empresa fijada, aislar el resto de empresas competidoras
                $studentCoId = $auth['coId'] ?? null;
                if ($studentCoId && isset($currentState['companies'])) {
                    foreach ($currentState['companies'] as $otherCid => $otherCo) {
                        if ($otherCid !== $studentCoId) {
                            $payload['companies'][$otherCid] = $otherCo;
                        }
                    }
                }
            }

            // Fusión de Secretos en Servidor (Evitar que el payload sanitizado borre PINs)
            if (isset($payload['config']['teachers']) && is_array($payload['config']['teachers'])) {
                foreach ($payload['config']['teachers'] as $tk => &$t) {
                    if (!empty($currentState['config']['teachers'][$tk]['pin'])) {
                        $t['pin'] = $currentState['config']['teachers'][$tk]['pin'];
                    } elseif (empty($t['pin'])) {
                        $t['pin'] = '1234';
                    }
                }
            } elseif (isset($currentState['config'])) {
                $payload['config'] = $currentState['config'];
            }

            if (isset($payload['companies']) && is_array($payload['companies'])) {
                foreach ($payload['companies'] as $cid => &$co) {
                    $sCo = $currentState['companies'][$cid] ?? null;
                    if ($sCo) {
                        if (!empty($sCo['authVault'])) $co['authVault'] = $sCo['authVault'];
                        if (!empty($sCo['accessCode'])) $co['accessCode'] = $sCo['accessCode'];
                        if (!empty($sCo['roles'])) $co['roles'] = $sCo['roles'];
                        if (!empty($sCo['authUpdatedAt'])) $co['authUpdatedAt'] = $sCo['authUpdatedAt'];
                    }
                }
            } elseif (isset($currentState['companies'])) {
                $payload['companies'] = $currentState['companies'];
            }

            // Control Optimista Estricto de Concurrencia
            $serverVersion = isset($currentState['version']) ? (int)$currentState['version'] : 0;
            $incomingVersion = $payload['version'] ?? null;

            if (!is_numeric($incomingVersion) || (int)$incomingVersion <= $serverVersion) {
                http_response_code(409);
                echo json_encode([
                    'error' => 'CONFLICT',
                    'serverVersion' => $serverVersion,
                    'message' => 'Versión obsoleta o ausente. Conflicto de concurrencia detectado.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $payload['version'] = $serverVersion + 1;
            $payload['lastUpdated'] = round(microtime(true) * 1000);
            $jsonString = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

            $saveStmt = $pdo->prepare("INSERT OR REPLACE INTO state (id, data, updated_at) VALUES ('current', :data, CURRENT_TIMESTAMP)");
            $saveStmt->execute([':data' => $jsonString]);

            echo json_encode(['success' => true, 'version' => $payload['version']]);
            exit;
        }

        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        exit;
    }

    // -------------------------------------------------------------------------
    // B. ENDPOINT: /api/moderation/report
    // -------------------------------------------------------------------------
    if ($endpoint === 'moderation/report') {
        if ($method === 'POST') {
            $payload = json_decode($rawInput, true) ?? [];
            $record = [
                'id' => 'MOD-' . round(microtime(true) * 1000),
                'team_id' => (string)($payload['team_id'] ?? 'UNKNOWN'),
                'student_alias' => (string)($payload['student_alias'] ?? 'ESTUDIANTE'),
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
        $auth = verifySession();
        if (!$auth['authorized']) {
            http_response_code(403);
            echo json_encode(['error' => 'UNAUTHORIZED', 'message' => 'Acceso restringido a Coordinación docente.']);
            exit;
        }

        $stmt = $pdo->query("SELECT data FROM state WHERE id = 'current'");
        $row = $stmt->fetch();
        if (!$row) {
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
                http_response_code(400);
                echo json_encode(['error' => 'Falta parámetro version']);
                exit;
            }

            if (!$force && (int)$clientVersion !== $serverVersion) {
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
                http_response_code(404);
                echo json_encode(['error' => 'Not found']);
                exit;
            }

            $changes = $body['changes'] ?? [];
            if (isset($body['price']) && !isset($changes['price'])) $changes['price'] = (float)$body['price'];
            if (isset($body['name']) && !isset($changes['name'])) $changes['name'] = (string)$body['name'];
            if (isset($body['stock']) && !isset($changes['stock'])) $changes['stock'] = (int)$body['stock'];

            $catalog[$itemIndex] = array_merge($catalog[$itemIndex], $changes);
            $currentState['version'] = $serverVersion + 1;
            $currentState['lastUpdated'] = round(microtime(true) * 1000);

            $saveStmt = $pdo->prepare("UPDATE state SET data = :data, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'");
            $saveStmt->execute([':data' => json_encode($currentState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

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
                echo json_encode([
                    'success' => true,
                    'alreadyDeleted' => true,
                    'message' => 'Artículo ya purgado previamente.',
                    'version' => $serverVersion
                ]);
                exit;
            }

            if (!$force && (int)$clientVersion !== $serverVersion) {
                http_response_code(409);
                echo json_encode(['error' => 'CONFLICT', 'serverVersion' => $serverVersion]);
                exit;
            }

            $deletedItem = array_splice($catalog, $itemIndex, 1)[0];
            $currentState['version'] = $serverVersion + 1;
            $currentState['lastUpdated'] = round(microtime(true) * 1000);

            $saveStmt = $pdo->prepare("UPDATE state SET data = :data, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'");
            $saveStmt->execute([':data' => json_encode($currentState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

            echo json_encode([
                'success' => true,
                'deleted' => $deletedItem,
                'version' => $currentState['version']
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        exit;
    }

    // -------------------------------------------------------------------------
    // D. ENDPOINT: /api/admin/credentials
    // -------------------------------------------------------------------------
    if ($endpoint === 'admin/credentials') {
        $auth = verifySession();
        if (!$auth['authorized'] || !$auth['isCoordinator']) {
            http_response_code(403);
            echo json_encode([
                'error' => 'UNAUTHORIZED_COORDINATOR_ACCESS',
                'message' => 'Acceso restringido exclusivamente a Coordinación docente.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $pdo->query("SELECT data FROM state WHERE id = 'current'");
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Estado corriente no encontrado']);
            exit;
        }

        $currentState = json_decode($row['data'], true);

        if ($method === 'GET') {
            $teachers = $currentState['config']['teachers'] ?? [];
            $companies = [];
            $allRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];

            foreach ($currentState['companies'] ?? [] as $cid => $co) {
                $plainCode = $co['accessCode'] ?? '';
                if (!empty($co['authVault']['code'])) {
                    $plainCode = decodeSecret($co['authVault']['code']);
                }

                $plainRoles = [];
                foreach ($allRoles as $r) {
                    $rPin = '';
                    if (!empty($co['authVault']['roles'][$r])) {
                        $rPin = decodeSecret($co['authVault']['roles'][$r]);
                    } elseif (!empty($co['roles'][$r]) && strpos((string)$co['roles'][$r], 'VLT_') !== 0) {
                        $rPin = (string)$co['roles'][$r];
                    }
                    if ($rPin !== '') {
                        $plainRoles[$r] = $rPin;
                    }
                }

                $companies[$cid] = [
                    'id' => $cid,
                    'name' => $co['name'] ?? $cid,
                    'classGroup' => $co['classGroup'] ?? 'A',
                    'accessCode' => $plainCode,
                    'roles' => $plainRoles,
                    'auxRoleDept' => $co['auxRoleDept'] ?? ''
                ];
            }

            echo json_encode([
                'teachers' => $teachers,
                'companies' => $companies,
                'version' => $currentState['version'] ?? 1
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($method === 'PATCH') {
            $body = json_decode($rawInput, true) ?? [];
            $type = $body['type'] ?? '';
            $id = $body['id'] ?? '';
            $role = $body['role'] ?? null;
            $newPin = (string)($body['newPin'] ?? '');
            $newCode = (string)($body['newCode'] ?? $newPin);
            $now = round(microtime(true) * 1000);

            if ($type !== 'teacher' && $type !== 'company') {
                http_response_code(400);
                echo json_encode(['error' => 'Parámetros inválidos. Requiere type ("teacher"|"company") e id.']);
                exit;
            }

            if ($type === 'teacher') {
                if (empty($currentState['config']['teachers'][$id])) {
                    http_response_code(404);
                    echo json_encode(['error' => "Docente $id no encontrado"]);
                    exit;
                }
                $cleanPin = trim($newPin);
                if (!preg_match('/^\d{4}$/', $cleanPin)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'El PIN docente debe tener exactamente 4 dígitos numéricos']);
                    exit;
                }
                $currentState['config']['teachers'][$id]['pin'] = $cleanPin;
                $currentState['config']['teachers'][$id]['pinUpdatedAt'] = $now;
                $currentState['config']['updatedAt'] = $now;
            } else {
                if (empty($currentState['companies'][$id])) {
                    http_response_code(404);
                    echo json_encode(['error' => "Empresa $id no encontrada"]);
                    exit;
                }
                $co = &$currentState['companies'][$id];
                if (!isset($co['authVault']) || !is_array($co['authVault'])) {
                    $co['authVault'] = ['code' => '', 'roles' => []];
                }

                if ($role) {
                    $cleanPin = trim($newPin);
                    if ($role === 'AUXILIAR' && $cleanPin === '') {
                        unset($co['authVault']['roles']['AUXILIAR'], $co['roles']['AUXILIAR']);
                    } else {
                        if (!preg_match('/^\d{4}$/', $cleanPin)) {
                            http_response_code(400);
                            echo json_encode(['error' => 'El PIN departamental debe tener exactamente 4 dígitos numéricos']);
                            exit;
                        }
                        $co['authVault']['roles'][$role] = encodeSecret($cleanPin);
                        $co['roles'][$role] = 'PROTECTED';
                    }
                } else {
                    $cleanCode = strtoupper(trim($newCode));
                    if (strlen($cleanCode) < 3) {
                        http_response_code(400);
                        echo json_encode(['error' => 'El código de empresa debe tener al menos 3 caracteres']);
                        exit;
                    }
                    $co['authVault']['code'] = encodeSecret($cleanCode);
                    unset($co['accessCode']);
                }

                $co['updatedAt'] = $now;
                $co['authUpdatedAt'] = $now;
            }

            $currentState['version'] = ((int)($currentState['version'] ?? 0)) + 1;
            $currentState['lastUpdated'] = $now;

            $saveStmt = $pdo->prepare("UPDATE state SET data = :data, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'");
            $saveStmt->execute([':data' => json_encode($currentState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

            echo json_encode(['success' => true, 'newVersion' => $currentState['version']]);
            exit;
        }

        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        exit;
    }

    // -------------------------------------------------------------------------
    // E. ENDPOINT: /api/admin/reset
    // -------------------------------------------------------------------------
    if ($endpoint === 'admin/reset') {
        if ($method === 'POST') {
            $auth = verifySession();
            if (!$auth['authorized']) {
                http_response_code(403);
                echo json_encode(['error' => 'UNAUTHORIZED_RESET', 'message' => 'Privilegios de Coordinación requeridos']);
                exit;
            }

            $stmt = $pdo->query("SELECT data FROM state WHERE id = 'current'");
            $row = $stmt->fetch();
            $currentState = $row ? json_decode($row['data'], true) : [];

            $now = round(microtime(true) * 1000);
            $newEpoch = ((int)($currentState['resetEpoch'] ?? 0)) + 1;
            $newVersion = ((int)($currentState['version'] ?? 0)) + 1;

            // Limpieza de empresas a estado virgen de simulación
            foreach ($currentState['companies'] ?? [] as $cid => &$co) {
                $co['balance'] = 2400;
                $co['logo'] = null;
                $co['slogan'] = '';
                $co['valueProposition'] = '';
                $co['orders'] = [];
                $co['cart'] = [];
                $co['ledger'] = [];
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
                $co['brandApproval'] = [
                    'status' => 'APROBADO',
                    'pendingLogo' => null,
                    'pendingSlogan' => '',
                    'feedback' => ''
                ];
            }

            $currentState['b2bMarket'] = [];
            $currentState['b2bContracts'] = [];
            $currentState['securityIncidents'] = [];
            $currentState['suggestionsToAlex'] = [];
            $currentState['pendingCustom'] = [];
            $currentState['resetEpoch'] = $newEpoch;
            $currentState['version'] = $newVersion;
            $currentState['lastUpdated'] = $now;

            $saveStmt = $pdo->prepare("UPDATE state SET data = :data, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'");
            $saveStmt->execute([':data' => json_encode($currentState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

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

    // 404 para cualquier endpoint de API no reconocido
    http_response_code(404);
    echo json_encode([
        'error' => 'ENDPOINT_NOT_FOUND',
        'endpoint' => $endpoint,
        'message' => 'Endpoint API no reconocido en MARS-KET OS'
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'INTERNAL_SERVER_ERROR',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
