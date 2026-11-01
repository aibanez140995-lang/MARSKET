# REGISTRO DE INTEGRACIONES Y ENTORNOS - MARS-KET OS

Este documento registra los servicios de infraestructura, métodos de acceso y validaciones de conectividad sin almacenar jamás credenciales reales.

---

## 1. Matriz de Entornos

| Servicio | Rol en el Proyecto | Estado de Conexión | Método de Conexión | Script de Validación |
| :--- | :--- | :---: | :--- | :--- |
| **Servidor Web cdmon** | Hosting Web y Producción | 🟢 CONECTADO (112 ms) | FTP / SFTP | `tools/integrations/test-cdmon-ftp.mjs` |
| **Base de Datos cdmon** | SQLite Embebido (WAL) | 🟢 Activo en backend | PDO SQLite (`api/db.php`) | Autogestionado en servidor |
| **Cloudflare Pages / D1** | Sandbox / Entorno Pruebas | 🟢 CONECTADO (D1 OK) | Wrangler CLI / D1 Remote | `tools/integrations/test-cloudflare.mjs` |

---

## 2. Historial de Validaciones

### [Paso 1] Servidor Web cdmon (FTP / Despliegue)
* **Objetivo:** Comprobar handshake FTP, autenticación y acceso al directorio `/web` sin exponer contraseñas.
* **Script:** `node --env-file=.env tools/integrations/test-cdmon-ftp.mjs`
* **Resultado:** `CONEXIÓN_EXITOSA` (Latencia: 112 ms, Directorio `/web` verificado y accesible).
* **Fecha:** 2026-10-31

### [Paso 2] Cloudflare D1 (Sandbox de Pruebas)
* **Objetivo:** Comprobar conectividad remota hacia la base de datos de pruebas `marsket-db` vía Wrangler sin exponer tokens.
* **Script:** `node tools/integrations/test-cloudflare.mjs`
* **Resultado:** `CONEXIÓN_EXITOSA` (Ping OK, estructura `D1_QUERY_RESULT_ARRAY` validada).
* **Fecha:** 2026-10-31

---

*Última actualización: 2026-10-31*
