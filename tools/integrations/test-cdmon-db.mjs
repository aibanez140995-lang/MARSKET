// tools/integrations/test-cdmon-db.mjs
// Script unitario de solo lectura para validar conectividad con MySQL cdmon sin volcar datos ni credenciales.

import net from 'net';

async function runValidation() {
  const host = process.env.CDMON_DB_HOST;
  const port = parseInt(process.env.CDMON_DB_PORT || '3306', 10);
  const dbName = process.env.CDMON_DB_NAME;
  const dbUser = process.env.CDMON_DB_USER;
  const dbPass = process.env.CDMON_DB_PASS;

  if (!host || !dbUser) {
    console.error('[ERROR DE CONFIGURACIÓN] Faltan variables en .env (CDMON_DB_HOST o CDMON_DB_USER vacíos).');
    process.exit(1);
  }

  console.log('\n--- INICIANDO VALIDACIÓN UNITARIA DE CONEXIÓN (cdmon MySQL) ---');
  console.log(`Destino: ${host}:${port}`);
  console.log(`Base de datos objetivo: ${dbName || '(por defecto)'}`);
  console.log('Modo: Ping TCP + Handshake protocolario (Zero-PII / Cero datos expuestos)\n');

  const startTime = Date.now();

  // Paso A: Test de socket TCP puro (comprueba si el firewall/puerto de cdmon permite conexión remota)
  const socket = new net.Socket();
  socket.setTimeout(8000);

  socket.connect(port, host, () => {
    const latency = Date.now() - startTime;
    console.log(`[OK] Socket TCP conectado en ${latency} ms.`);
  });

  socket.on('data', (data) => {
    // El servidor MySQL envía su paquete inicial de saludo (Handshake Packet)
    const latency = Date.now() - startTime;
    // Extraer versión de MySQL reportada en el handshake sin exponer datos de usuario
    let serverVersion = 'Desconocida';
    try {
      // En el paquete handshake de MySQL, la versión viene como string terminada en null a partir del byte 5
      const nullIdx = data.indexOf(0x00, 5);
      if (nullIdx !== -1) {
        serverVersion = data.subarray(5, nullIdx).toString('ascii');
      }
    } catch {
      // Mantener en desconocida si el formato difiere
    }

    const report = {
      status: 'CONEXIÓN_EXITOSA',
      servicio: 'cdmon MySQL Server',
      hostReachable: true,
      portOpen: port,
      latencyMs: latency,
      serverVersionHeader: serverVersion,
      protocolHandshakeReceived: true,
      dataExposure: 'NONE (Zero-PII)'
    };

    console.log('\n--- RESULTADO DE LA VALIDACIÓN UNITARIA ---');
    console.log(JSON.stringify(report, null, 2));
    console.log('-------------------------------------------\n');

    socket.end();
    process.exit(0);
  });

  socket.on('timeout', () => {
    console.error(`[TIMEOUT] No se obtuvo respuesta de ${host}:${port} en 8000 ms.`);
    console.error('Aviso: Si es hosting compartido de cdmon, comprueba si el acceso remoto a MySQL está habilitado para tu IP pública en el panel de control.');
    socket.destroy();
    process.exit(1);
  });

  socket.on('error', (err) => {
    console.error(`[ERROR DE RED] No se pudo conectar a ${host}:${port}: ${err.message}`);
    process.exit(1);
  });
}

runValidation();
