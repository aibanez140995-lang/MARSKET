-- functions/api/migrations/0002_partitioning.sql
-- Migración Arquitectónica: Particionado Relacional del Estado en Cloudflare D1 / SQLite3 (v1.1.11)
-- Erradica la contención monolítica de OCC (HTTP 409 Conflict) dividiendo el megadocumento escolar.

-- 1. Tabla particionada para el estado de cada startup/empresa
CREATE TABLE IF NOT EXISTS company_state (
    company_id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER NOT NULL
);

-- 2. Tabla particionada para la configuración global docente y catálogo
CREATE TABLE IF NOT EXISTS global_config (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER NOT NULL
);

-- 3. Índices de alta concurrencia para polling sub-milisegundo
CREATE INDEX IF NOT EXISTS idx_company_state_version ON company_state(company_id, version, updated_at);
CREATE INDEX IF NOT EXISTS idx_global_config_version ON global_config(id, version, updated_at);

-- 4. Migración idempotente de empresas existentes desde la tabla 'state' monolítica
INSERT OR REPLACE INTO company_state (company_id, data, version, updated_at)
SELECT 
    c.key AS company_id,
    c.value AS data,
    COALESCE(json_extract(state.data, '$.version'), 1) AS version,
    COALESCE(json_extract(c.value, '$.updatedAt'), CAST(strftime('%s', 'now') AS INTEGER) * 1000) AS updated_at
FROM state, json_each(state.data, '$.companies') AS c
WHERE state.id = 'current';

-- 5. Migración de configuración global desde 'state'
INSERT OR REPLACE INTO global_config (id, data, version, updated_at)
SELECT 
    'config' AS id,
    json_object(
        'config', json_extract(state.data, '$.config'),
        'catalog', json_extract(state.data, '$.catalog'),
        'b2bMarket', json_extract(state.data, '$.b2bMarket'),
        'b2bContracts', json_extract(state.data, '$.b2bContracts'),
        'securityIncidents', json_extract(state.data, '$.securityIncidents'),
        'suggestionsToAlex', json_extract(state.data, '$.suggestionsToAlex'),
        'pendingCustom', json_extract(state.data, '$.pendingCustom'),
        'telemetry', json_extract(state.data, '$.telemetry'),
        'resetEpoch', json_extract(state.data, '$.resetEpoch')
    ) AS data,
    COALESCE(json_extract(state.data, '$.version'), 1) AS version,
    COALESCE(json_extract(state.data, '$.lastUpdated'), CAST(strftime('%s', 'now') AS INTEGER) * 1000) AS updated_at
FROM state
WHERE state.id = 'current';
