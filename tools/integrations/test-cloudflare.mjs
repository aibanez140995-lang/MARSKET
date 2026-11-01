// tools/integrations/test-cloudflare.mjs
// Script unitario para validar conectividad y estado de Cloudflare Sandbox (Zero-PII / Solo Lectura)

import { execSync } from 'child_process';

async function testCloudflare() {
  console.log('\n--- INICIANDO VALIDACIÓN UNITARIA DE CLOUDFLARE (Sandbox) ---');
  console.log('Modo: Consulta de estado D1 / Pages (Solo Lectura - Zero-PII)\n');

  const startTime = Date.now();

  try {
    // Consulta mínima de salud hacia D1 remoto
    const stdout = execSync('npx wrangler d1 execute marsket-db --command="SELECT 1 as ping;" --remote --json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const latency = Date.now() - startTime;
    let parsedResult = null;
    try {
      parsedResult = JSON.parse(stdout);
    } catch {
      // Ignorar parse si el output trae cabeceras adicionales
    }

    const report = {
      status: 'CONEXIÓN_EXITOSA',
      servicio: 'Cloudflare D1 (Sandbox)',
      database: 'marsket-db',
      pingOk: true,
      latencyMs: latency,
      dataExposure: 'NONE (Zero-PII)',
      responseStructure: Array.isArray(parsedResult) ? 'D1_QUERY_RESULT_ARRAY' : 'OK'
    };

    console.log('\n--- RESULTADO DE LA VALIDACIÓN UNITARIA ---');
    console.log(JSON.stringify(report, null, 2));
    console.log('-------------------------------------------\n');
    process.exit(0);
  } catch (err) {
    console.error(`[ERROR DE CONEXIÓN CLOUDFLARE]: ${err.message}`);
    process.exit(1);
  }
}

testCloudflare();
