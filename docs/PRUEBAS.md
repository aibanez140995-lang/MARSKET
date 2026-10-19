# PROTOCOLO DE PRUEBAS Y ENTORNO ESTÁNDAR (v1.0.19) // BLOQUE E

## 1. Servidor de Desarrollo Local y Simulación D1 (`tools/dev-server.mjs`)

Para garantizar mediciones científicas reproducibles en el navegador (eliminando las restricciones de `file://` sobre recursos CSS, fuentes y API de red), se proporciona un servidor HTTP nativo sin dependencias externas.

### Comando de Ejecución
```bash
node tools/dev-server.mjs
```
O especificando un puerto alternativo:
```bash
PORT=3000 node tools/dev-server.mjs
```

### Puertos y Endpoints
- **URL Base:** `http://localhost:3000/` (o `http://127.0.0.1:3000/`)
- **Aplicación:** `http://localhost:3000/index.html`
- **Simulación Cloudflare Pages + D1:** `http://localhost:3000/api/state`
  - `GET /api/state`: Retorna el estado en memoria o `{ status: 'empty' }` si aún no hay datos persistidos.
  - `POST /api/state`: Guarda el nuevo estado en memoria, incrementa la versión atómicamente y valida concurrencia optimista (responde `409 Conflict` si la versión entrante es menor que la del servidor).
- **Reinicio del Estado de Pruebas:**
  - `GET /api/reset` o `POST /api/reset`: Restaura el estado en memoria a `null` (`{ status: 'empty' }`), permitiendo arrancar baterías de prueba limpias.

---

## 2. Reglas Inviolables de Medición
1. **Prohibido medir desde `file://`:** Todas las pruebas de Playwright o navegador deben apuntar obligatoriamente a `http://localhost:3000/` con el servidor activo.
2. **Caché desactivada:** El servidor entrega cabeceras `Cache-Control: no-store, no-cache, must-revalidate` para evitar mediciones viciadas por caché previa.
3. **Reinicio previo a baterías completas:** Antes de ejecutar una suite adversaria, realizar una llamada a `/api/reset` para asegurar que el entorno no contenga residuos de sesiones o datos de pruebas anteriores.
