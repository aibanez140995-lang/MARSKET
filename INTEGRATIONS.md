# REGISTRO DE INTEGRACIONES Y ENTORNOS - MARS-KET OS

Este documento registra los servicios de infraestructura, métodos de acceso y validaciones de conectividad sin almacenar jamás credenciales reales.

---

## 1. Matriz de Entornos

| Servicio | Rol en el Proyecto | Estado de Conexión | Método de Conexión | Script de Validación |
| :--- | :--- | :---: | :--- | :--- |
| **Servidor Web cdmon** | Hosting Web y Producción | 🟡 Listo para probar | FTP / SFTP | `tools/integrations/test-cdmon-ftp.mjs` |
| **Base de Datos cdmon** | SQLite Embebido (WAL) | 🟢 Activo en backend | PDO SQLite (`api/db.php`) | Autogestionado en servidor |
| **Cloudflare Pages / D1** | Sandbox / Entorno Pruebas | ⚪ En cola | Wrangler CLI / API REST | Pendiente |

---

## 2. Historial de Validaciones

### [Paso 1] Servidor Web cdmon (FTP / Despliegue)
* **Objetivo:** Comprobar handshake FTP, autenticación y acceso al directorio `/web` sin exponer contraseñas.
* **Script:** `node --env-file=.env tools/integrations/test-cdmon-ftp.mjs`
* **Resultado:** *Pendiente de ejecución*.

---

*Última actualización: 2026-10-31*
