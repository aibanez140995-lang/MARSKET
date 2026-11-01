// tools/integrations/test-cdmon-ftp.mjs
// Script unitario de solo lectura para validar conectividad y credenciales FTP de cdmon sin exponer datos sensibles.

import net from 'net';

async function testFtpConnection() {
  const host = process.env.CDMON_FTP_HOST || '185.42.104.199';
  const port = parseInt(process.env.CDMON_FTP_PORT || '21', 10);
  const user = process.env.CDMON_FTP_USER;
  const pass = process.env.CDMON_FTP_PASS;
  const remoteDir = process.env.CDMON_REMOTE_WEB_DIR || '/web';

  if (!user || !pass) {
    console.error('[ERROR DE CONFIGURACIÓN] Faltan variables en .env: CDMON_FTP_USER o CDMON_FTP_PASS están vacías.');
    process.exit(1);
  }

  console.log('\n--- INICIANDO VALIDACIÓN UNITARIA DE CONEXIÓN FTP (cdmon) ---');
  console.log(`Destino: ${host}:${port}`);
  console.log(`Usuario: ${user}`);
  console.log(`Directorio objetivo: ${remoteDir}`);
  console.log('Modo: Handshake FTP + Autenticación + Verificación PWD (Zero-PII / Solo Lectura)\n');

  const startTime = Date.now();
  const socket = new net.Socket();
  socket.setTimeout(10000);

  let step = 0;

  socket.connect(port, host, () => {
    // Conexión TCP establecida
  });

  socket.on('data', (data) => {
    const response = data.toString();
    const code = response.substring(0, 3);

    // 1. Mensaje de bienvenida del servidor FTP (220)
    if (step === 0 && code === '220') {
      step = 1;
      socket.write(`USER ${user}\r\n`);
      return;
    }

    // 2. Servidor solicita contraseña (331)
    if (step === 1 && code === '331') {
      step = 2;
      socket.write(`PASS ${pass}\r\n`);
      return;
    }

    // 3. Autenticación exitosa (230)
    if (step === 2 && code === '230') {
      step = 3;
      // Comprobar directorio remoto con CWD
      socket.write(`CWD ${remoteDir}\r\n`);
      return;
    }

    // 4. Directorio remoto verificado (250)
    if (step === 3 && code === '250') {
      const latency = Date.now() - startTime;
      const report = {
        status: 'CONEXIÓN_EXITOSA',
        servicio: 'cdmon FTP Server',
        host: host,
        port: port,
        userAuthenticated: true,
        targetDirectoryValid: true,
        remoteDir: remoteDir,
        latencyMs: latency,
        dataExposure: 'NONE (Zero-PII)'
      };

      console.log('\n--- RESULTADO DE LA VALIDACIÓN UNITARIA ---');
      console.log(JSON.stringify(report, null, 2));
      console.log('-------------------------------------------\n');

      socket.write('QUIT\r\n');
      step = 4;
      return;
    }

    // Errores de credenciales (530)
    if (code === '530') {
      console.error(`[ERROR DE AUTENTICACIÓN] Usuario o contraseña incorrectos en cdmon FTP.`);
      socket.destroy();
      process.exit(1);
    }

    // Errores de directorio
    if (step === 3 && (code === '550' || code.startsWith('5'))) {
      console.error(`[AVISO] El usuario conecta pero el directorio '${remoteDir}' no existe o no tiene permisos.`);
      socket.destroy();
      process.exit(1);
    }

    if (step === 4 && (code === '221' || code.startsWith('2'))) {
      socket.end();
      process.exit(0);
    }
  });

  socket.on('timeout', () => {
    console.error(`[TIMEOUT] El servidor FTP ${host}:${port} no respondió en 10000 ms.`);
    socket.destroy();
    process.exit(1);
  });

  socket.on('error', (err) => {
    console.error(`[ERROR DE RED FTP] No se pudo conectar a ${host}:${port}: ${err.message}`);
    process.exit(1);
  });
}

testFtpConnection();
