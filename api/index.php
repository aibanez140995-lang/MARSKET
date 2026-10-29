<?php
// api/index.php
// Front-Controller Atómico de MARS-KET OS para Hosting CDMON (Apache + PHP 8.x + SQLite3)
// Versión: v1.1.50

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
        $isCoord = strpos($rLower, 'coord') !== false || $rLower === 'coordinador';
        $teacherRoles = ['FYQ', 'ECO', 'BIO', 'MAT', 'LEN', 'ING', 'LYE'];
        $isTeacherRole = in_array(strtoupper($role), $teacherRoles, true) || $isCoord;
        return [
            'authorized' => true,
            'isCoordinator' => $isCoord,
            'isTeacher' => $isTeacherRole,
            'role' => $role,
            'isAdmin' => true
        ];
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
            $decoded = json_decode($cleanPayload, true);
            if (is_array($decoded)) {
                $sanitized = sanitizeStateForClient($decoded);
                header('Content-Type: application/json; charset=utf-8');
                header('ETag: ' . $serverETag);
                header('Cache-Control: public, no-cache');
                echo json_encode($sanitized, JSON_UNESCAPED_UNICODE);
                exit;
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
                        json_extract(data, '$.companies.' || :coId || '.name') AS name,
                        json_extract(data, '$.companies.' || :coId || '.authUpdatedAt') AS auth_stamp
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
                            ");
                            $statStmt->execute([
                                ':coId' => $coId,
                                ':role' => $role,
                                ':lastLogin' => $nowStr
                            ]);
                        } catch(\Exception $e) {}
                    }

                    http_response_code($verified ? 200 : 401);
                    echo json_encode([
                        'verified' => $verified,
                        'companyName' => $row['name'] ?? 'EMPRESA',
                        'authStamp' => $authStamp,
                        'token' => $verified ? encodeSecret("S|{$coId}|{$role}|{$authStamp}") : null
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
                    'ING' => '0606',
                    'BIO' => '0707'
                ];

                $dbPin = $row ? $row['pin'] : null;
                $expectedPin = !empty($dbPin) ? trim((string)$dbPin) : ($defaultTeacherPins[$role] ?? '');
                $pinStamp = (int)($row['pin_stamp'] ?? 0);
                $verified = ($expectedPin !== '' && $expectedPin === $pinAttempt);

                http_response_code($verified ? 200 : 401);
                echo json_encode([
                    'verified' => $verified,
                    'pinStamp' => $pinStamp,
                    'token' => $verified ? encodeSecret("T|{$role}|{$pinStamp}") : null
                ], JSON_UNESCAPED_UNICODE);
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

            // Guardado de Estado: Autorización y Particionado Zero-Trust (v1.1.25)
            $auth = verifySession();
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

            $stmt = $pdo->query("SELECT data FROM state WHERE id = 'current'");
            $row = $stmt->fetch();
            $currentState = $row ? json_decode($row['data'], true) : [];

            // Reseteo destructivo reservado exclusivamente a roles COORD_*
            if ((($payload['action'] ?? '') === 'reset' || (!empty($payload['resetEpoch']) && !empty($currentState['resetEpoch']) && $payload['resetEpoch'] !== $currentState['resetEpoch'])) && !$isCoord) {
                http_response_code(403);
                echo json_encode([
                    'error' => 'UNAUTHORIZED_RESET',
                    'message' => 'El reseteo destructivo está reservado exclusivamente a roles COORD_*.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Si es un Alumno/Empresa (NO docente), blindar la configuración global y resto de empresas
            if (!$isTeacher) {
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
                        $coordHasUpdatedAuth = $isCoord && !empty($co['authUpdatedAt']) && (!isset($sCo['authUpdatedAt']) || $co['authUpdatedAt'] >= $sCo['authUpdatedAt']);
                        if (!$coordHasUpdatedAuth) {
                            if (!empty($sCo['authVault']['code']) || !empty($sCo['authVault']['roles'])) {
                                $co['authVault'] = $sCo['authVault'];
                            }
                            if (!empty($sCo['accessCode'])) $co['accessCode'] = $sCo['accessCode'];
                            if (!empty($sCo['roles'])) $co['roles'] = $sCo['roles'];
                            if (!empty($sCo['authUpdatedAt'])) $co['authUpdatedAt'] = $sCo['authUpdatedAt'];
                        }
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
        // -------------------------------------------------------------------------
    // A2. ENDPOINT: /api/company/:cid/version (Sondeo Reactivo 3s ETag - v1.1.11)
    // -------------------------------------------------------------------------
    if (preg_match('#^company/([^/]+)/version$#', $endpoint, $matches)) {
        $cid = $matches[1];
        if ($method === 'OPTIONS') { http_response_code(200); exit; }

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS company_state (
                company_id VARCHAR(100) PRIMARY KEY,
                data LONGTEXT NOT NULL,
                version INT NOT NULL DEFAULT 1,
                updated_at BIGINT NOT NULL
            )
        ");

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

        $serverETag = 'W/"co-' . $cid . '-' . $version . '-' . $updatedAt . '"';
        $clientETag = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';

        if ($clientETag === $serverETag) {
            header('ETag: ' . $serverETag);
            header('Cache-Control: public, no-cache');
            http_response_code(304);
            exit;
        }

        header('Content-Type: application/json; charset=utf-8');
        header('ETag: ' . $serverETag);
        header('Cache-Control: public, no-cache');
        if ($method === 'HEAD') { exit; }

        echo json_encode([
            'companyId' => $cid,
            'version' => $version,
            'updatedAt' => $updatedAt,
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
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

        $auth = verifySession();
        $isCoord = !empty($auth['authorized']);
        $isStudentOfCompany = !empty($auth['isStudent']) && ($auth['coId'] === $cid);

        if (!$isCoord && !$isStudentOfCompany) {
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

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS company_state (
                company_id VARCHAR(100) PRIMARY KEY,
                data LONGTEXT NOT NULL,
                version INT NOT NULL DEFAULT 1,
                updated_at BIGINT NOT NULL
            )
        ");

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

        if (!$co) {
            http_response_code(404);
            echo json_encode(['error' => 'COMPANY_NOT_FOUND']);
            exit;
        }

        // Blindaje de credenciales: extraer la bóveda autorizada de state para no degradarla
        try {
            $stmtAuth = $pdo->prepare("
                SELECT 
                    json_extract(data, '$.companies.' || :cid || '.authVault') AS vlt,
                    json_extract(data, '$.companies.' || :cid || '.authUpdatedAt') AS au,
                    json_extract(data, '$.companies.' || :cid || '.accessCode') AS ac
                FROM state WHERE id = 'current'
            ");
            $stmtAuth->execute([':cid' => $cid]);
            $aRow = $stmtAuth->fetch();
            if ($aRow) {
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

        $calcBalance = function(array $ledger): float {
            $initial = 2400.0;
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

        switch ($action) {
            case 'EXECUTE_PURCHASE':
                $items = !empty($payload['items']) && is_array($payload['items']) ? $payload['items'] : $co['cart'];
                if (empty($items)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'EMPTY_CART']);
                    exit;
                }
                $totalPurchase = 0.0;
                foreach ($items as $it) {
                    $p = (float)($it['price'] ?? 0);
                    $q = (int)($it['qty'] ?? 1);
                    $totalPurchase += round($p * $q, 2);
                }
                $curBal = $calcBalance($co['ledger']);
                if ($curBal < $totalPurchase) {
                    http_response_code(400);
                    echo json_encode(['error' => 'INSUFFICIENT_FUNDS', 'currentBalance' => $curBal, 'required' => $totalPurchase]);
                    exit;
                }
                $orderId = (string)($payload['orderId'] ?? ('ORD-' . substr((string)$now, -4)));
                $txId = 'TX-' . strtoupper(base_convert((string)$now, 10, 36)) . '-' . strtoupper(substr(md5(uniqid()), 0, 4));
                $concept = (string)($payload['concept'] ?? ("Compra Catálogo (" . count($items) . " ítems) - Pedido #" . $orderId));
                array_unshift($co['ledger'], [
                    'id' => $txId,
                    'tx_id' => $txId,
                    'date' => date('d/m/Y, H:i:s'),
                    'concept' => $concept,
                    'dept' => $payload['dept'] ?? 'TECNICO',
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
                $delta = round((float)($payload['delta'] ?? 0), 2);
                $txId = (string)($payload['txId'] ?? ('TX-' . strtoupper(base_convert((string)$now, 10, 36)) . '-' . strtoupper(substr(md5(uniqid()), 0, 4))));
                array_unshift($co['ledger'], [
                    'id' => $txId,
                    'tx_id' => $txId,
                    'date' => date('d/m/Y, H:i:s'),
                    'concept' => $payload['concept'] ?? 'Ajuste financiero',
                    'dept' => $payload['dept'] ?? 'FINANZAS',
                    'delta' => $delta,
                    'timestamp' => $now
                ]);
                break;

            case 'RECORD_REAL_SPEND':
            case 'EXECUTE_PHYSICAL_ORDER':
                if (($auth['role'] ?? '') !== 'OPERACIONES_IA' && ($auth['role'] ?? '') !== 'OPERACIONES' && empty($auth['isAdmin']) && empty($auth['isCoordinator'])) {
                    http_response_code(403);
                    echo json_encode(['error' => 'FORBIDDEN_ROLE', 'message' => 'Acceso restringido: Solo Operaciones o Administrador puede registrar compras físicas reales.']);
                    exit;
                }
                if (!empty($payload['realCosts']) && is_array($payload['realCosts'])) {
                    $co['realCosts'] = is_array($co['realCosts'] ?? null) ? $co['realCosts'] : [];
                    foreach ($payload['realCosts'] as $rc) {
                        $co['realCosts'][] = $rc;
                    }
                }
                if (!empty($payload['orderId'])) {
                    $co['orders'] = is_array($co['orders'] ?? null) ? $co['orders'] : [];
                    foreach ($co['orders'] as &$ord) {
                        if (String($ord['id'] ?? '') === String($payload['orderId'])) {
                            $ord['status'] = 'EJECUTADO';
                        }
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
                if (!empty($payload['campaign'])) {
                    $camp = $payload['campaign'];
                    if (isset($camp['packageId'], $mktPackages[$camp['packageId']])) {
                        $camp['price'] = $mktPackages[$camp['packageId']]['price'];
                        $camp['totalActions'] = $mktPackages[$camp['packageId']]['actions'];
                    }
                    array_unshift($co['marketingCampaigns'], $camp);
                }
                if (!empty($payload['actionItem']) && !empty($payload['campaignId'])) {
                    foreach ($co['marketingCampaigns'] as &$c) {
                        if (String($c['id'] ?? '') === String($payload['campaignId'])) {
                            $c['executedActions'] = is_array($c['executedActions'] ?? null) ? $c['executedActions'] : [];
                            $c['executedActions'][] = $payload['actionItem'];
                        }
                    }
                }
                break;

            case 'SUBMIT_DELIVERABLE':
                $co['deliverables'] = is_array($co['deliverables'] ?? null) ? $co['deliverables'] : [];
                $rawKey = trim((string)($payload['key'] ?? $payload['docKey'] ?? $payload['docType'] ?? ''));
                if ($rawKey !== '') {
                    $driveUrl = trim((string)($payload['driveUrl'] ?? $payload['url'] ?? ''));
                    $isCEO = ($auth['role'] ?? '') === 'CEO' || !empty($auth['isCoordinator']);
                    $status = $isCEO ? 'DELIVERED_TO_TEACHER' : 'SUBMITTED_TO_CEO';
                    $returnReasonId = null;
                    $returnReason = null;

                    if ($rawKey === 'hoja_taller_fyq') {
                        $reqStatus = trim((string)($payload['status'] ?? ''));
                        $validWorkshop = ['DRAFT_TECNICO', 'EN_TALLER_OPERARIO', 'DEVUELTO_A_TECNICO', 'CEO_REVISION', 'SUBMITTED_TO_CEO', 'DELIVERED_TO_TEACHER'];
                        if (in_array($reqStatus, $validWorkshop, true)) {
                            $status = $reqStatus;
                        } elseif ($isCEO) {
                            $status = 'DELIVERED_TO_TEACHER';
                        } else {
                            $status = 'EN_TALLER_OPERARIO';
                        }
                        $returnReasonId = $payload['returnReasonId'] ?? null;
                        $returnReason = $payload['returnReason'] ?? null;
                    }

                    $prevDoc = $co['deliverables'][$rawKey] ?? null;
                    $retDrive = $payload['returnDriveUrl'] ?? ($prevDoc['returnDriveUrl'] ?? null);
                    $retTeacher = !empty($payload['returnByTeacher']) || !empty($prevDoc['returnByTeacher']);

                    $co['deliverables'][$rawKey] = [
                        'driveUrl' => $driveUrl,
                        'status' => $status,
                        'returnReasonId' => $returnReasonId,
                        'returnReason' => $returnReason,
                        'returnDriveUrl' => $retDrive,
                        'returnByTeacher' => $retTeacher,
                        'updatedAt' => date('c')
                    ];
                }
                break;

            case 'CEO_REVIEW_DELIVERABLE':
                if (($auth['role'] ?? '') !== 'CEO' && empty($auth['isCoordinator'])) {
                    http_response_code(403);
                    echo json_encode(['error' => 'UNAUTHORIZED_ROLE', 'message' => 'Solo el CEO o Coordinación puede supervisar entregables.']);
                    exit;
                }
                $rawKey = trim((string)($payload['key'] ?? $payload['docKey'] ?? $payload['docType'] ?? ''));
                $co['deliverables'] = is_array($co['deliverables'] ?? null) ? $co['deliverables'] : [];
                if (!isset($co['deliverables'][$rawKey])) {
                    http_response_code(404);
                    echo json_encode(['error' => 'DELIVERABLE_NOT_FOUND']);
                    exit;
                }
                $currentDoc = &$co['deliverables'][$rawKey];
                $subAction = strtoupper(trim((string)($payload['action'] ?? $payload['subAction'] ?? '')));
                if ($subAction === 'APPROVE') {
                    if (is_string($currentDoc)) {
                        $currentDoc = ['driveUrl' => $currentDoc, 'status' => 'DELIVERED_TO_TEACHER', 'updatedAt' => date('c')];
                    } else {
                        $currentDoc['status'] = 'DELIVERED_TO_TEACHER';
                        unset($currentDoc['returnReasonId'], $currentDoc['returnReason'], $currentDoc['returnDriveUrl']);
                        $currentDoc['updatedAt'] = date('c');
                    }
                } elseif ($subAction === 'RETURN') {
                    $reasonId = trim((string)($payload['reasonId'] ?? ''));
                    $reasonText = trim((string)($payload['reason'] ?? $reasonId));
                    $retDriveUrl = trim((string)($payload['returnDriveUrl'] ?? ''));
                    if (is_string($currentDoc)) {
                        $currentDoc = [
                            'driveUrl' => $currentDoc,
                            'status' => 'CEO_REVISION',
                            'returnReasonId' => $reasonId,
                            'returnReason' => $reasonText,
                            'returnDriveUrl' => $retDriveUrl ?: null,
                            'returnByTeacher' => false,
                            'updatedAt' => date('c')
                        ];
                    } else {
                        $currentDoc['status'] = 'CEO_REVISION';
                        $currentDoc['returnReasonId'] = $reasonId;
                        $currentDoc['returnReason'] = $reasonText;
                        if ($retDriveUrl) {
                            $currentDoc['returnDriveUrl'] = $retDriveUrl;
                        }
                        $currentDoc['updatedAt'] = date('c');
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'INVALID_REVIEW_ACTION']);
                    exit;
                }
                break;

            case 'COORDINATOR_DECIDE_BRAND':
                if (empty($auth['isCoordinator']) && empty($auth['isAdmin'])) {
                    http_response_code(403);
                    echo json_encode(['error' => 'UNAUTHORIZED_ROLE', 'message' => 'Solo Coordinación puede validar marcas.']);
                    exit;
                }
                $approved = !empty($payload['approved']);
                if ($approved) {
                    $co['slogan'] = $co['pendingSlogan'] ?? ($co['brandApproval']['pendingSlogan'] ?? ($co['slogan'] ?? ''));
                    $co['mission'] = $co['pendingMission'] ?? ($co['valueProposition'] ?? ($co['mission'] ?? ''));
                    $co['valueProposition'] = $co['mission'];
                    unset($co['pendingSlogan'], $co['pendingMission'], $co['brandStatus']);
                    if (isset($co['brandApproval']) && is_array($co['brandApproval'])) {
                        $co['brandApproval']['status'] = 'APROBADO';
                        unset($co['brandApproval']['pendingSlogan']);
                    }
                } else {
                    unset($co['pendingSlogan'], $co['pendingMission']);
                    $co['brandStatus'] = 'REJECTED';
                    if (isset($co['brandApproval']) && is_array($co['brandApproval'])) {
                        $co['brandApproval']['status'] = 'RECHAZADO';
                        unset($co['brandApproval']['pendingSlogan']);
                        $co['brandApproval']['feedback'] = 'Propuesta de marca rechazada por Coordinación.';
                    }
                }
                break;

            case 'VOTE_MOTION':
                $motionId = trim((string)($payload['id'] ?? $payload['motionId'] ?? ''));
                $voteValue = trim((string)($payload['vote'] ?? ''));
                $validVotes = ['A_FAVOR', 'EN_CONTRA', 'NO_ESTOY_SEGURO'];
                if (!in_array($voteValue, $validVotes, true)) {
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
                        $roleKey = $auth['role'] ?? 'ESTUDIANTE';
                        $m['votes'][$roleKey] = $voteValue;
                        break;
                    }
                }
                break;

            case 'GENERIC_PATCH':
                $allowed = ['slogan', 'valueProposition', 'cart', 'votingMotions', 'flightTests', 'bom', 'brandApproval', 'pendingSlogan', 'pendingMission', 'brandStatus'];
                foreach ($allowed as $k) {
                    if (isset($payload[$k])) {
                        $co[$k] = $payload[$k];
                    }
                }
                break;

            default:
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

        try {
            $syncStmt = $pdo->prepare("
                UPDATE state
                SET data = json_set(data, '$.companies.' || :cid, json(:co_json), '$.version', :ver)
                WHERE id = 'current'
            ");
            $syncStmt->execute([
                ':cid' => $cid,
                ':co_json' => json_encode($co, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ':ver' => $newVersion
            ]);
        } catch(\Exception $e) {}

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => true,
            'companyId' => $cid,
            'version' => $newVersion,
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
            $defaultCodes = [
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
            $hasMutations = false;
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
                    $plainCode = decodeSecret($co['authVault']['code']);
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
                        $rPin = decodeSecret($co['authVault']['roles'][$r]);
                    } elseif (!empty($co['roles'][$r]) && strpos((string)$co['roles'][$r], 'VLT_') !== 0 && (string)$co['roles'][$r] !== 'PROTECTED') {
                        $rPin = (string)$co['roles'][$r];
                    }
                    if ($r !== 'AUXILIAR' && (empty($rPin) || $rPin === 'PROTECTED')) {
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
                    'auxRoleDept' => $co['auxRoleDept'] ?? ''
                ];
            }
            unset($co);

            if ($hasMutations) {
                $currentState['lastUpdated'] = $now;
                $saveStmt = $pdo->prepare("UPDATE state SET data = :data, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'");
                $saveStmt->execute([':data' => json_encode($currentState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
            }

            $currentVersion = $currentState['version'] ?? 1;
            header('ETag: W/"v-' . $currentVersion . '"');
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
                            http_response_code(400);
                            echo json_encode(['error' => 'El PIN departamental debe tener exactamente 4 dígitos numéricos']);
                            exit;
                        }
                        $co['authVault']['roles'][$role] = encodeSecret($cleanPin);
                        $co['roles'][$role] = 'PROTECTED';
                    }
                }

                $co['updatedAt'] = $now;
                $co['authUpdatedAt'] = $now;
            }

            $currentState['version'] = ((int)($currentState['version'] ?? 0)) + 1;
            $currentState['lastUpdated'] = $now;

            $saveStmt = $pdo->prepare("UPDATE state SET data = :data, updated_at = CURRENT_TIMESTAMP WHERE id = 'current'");
            $saveStmt->execute([':data' => json_encode($currentState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

            if ($type === 'company' && isset($currentState['companies'][$id])) {
                $upCo = $currentState['companies'][$id];
                try {
                    $upCoStmt = $pdo->prepare("
                        UPDATE company_state 
                        SET data = json_set(
                            data,
                            '$.authVault', json(:vlt),
                            '$.authUpdatedAt', :au,
                            '$.updatedAt', :up
                        )
                        WHERE company_id = :cid
                    ");
                    $upCoStmt->execute([
                        ':vlt' => json_encode($upCo['authVault'] ?? [], JSON_UNESCAPED_UNICODE),
                        ':au' => $now,
                        ':up' => $now,
                        ':cid' => $id
                    ]);
                } catch (\Exception $e) {}
            }

            $etag = 'W/"v-' . $currentState['version'] . '"';
            header('ETag: ' . $etag);
            echo json_encode(['success' => true, 'newVersion' => $currentState['version'], 'etag' => $etag]);
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
