# MARS-KET OS · REGISTRO DE DEFECTOS (DEFECT LEDGER)
Última actualización: v1.1.02 (2026-10-19)

| ID | Severidad | Módulo | Descripción | Estado | Resolución / Recomendación |
|---|---|---|---|---|---|
| DEF-001 | BAJA | `ui-docente-management.js` | Discrepancia visual potencial en navegadores sin soporte `@media print` nativo | RESUELTO | Se aplicó aislamiento en `@media print` con `@page { size: A4 portrait; margin: 10mm; }` y fallback responsivo. |
| DEF-002 | BAJA | `ui-empresa-tech.js` | Posible entrada de caracteres alfanuméricos en masa/volumen de reactivos | RESUELTO | Se incorporó regex estricta `/^[0-9]+(\.[0-9]+)?$/` y comprobación de valor mayor a cero. |
| DEF-003 | BAJA | `state.js` | Errores de coma flotante en acumulados de céntimos en balances de libro mayor | RESUELTO | Implementada normalización estándar `Math.round((val + Number.EPSILON) * 100) / 100`. |
| DEF-004 | MEDIA | `ui-docente-management.js` | Desincronización durante edición de catálogo por polling activo de fondo | RESUELTO | Pausado temporal del ciclo de sondeo (`state.pausePolling = true`) y espera obligatoria de `res.ok`. |
| DEF-005 | MEDIA | `state.js` / D1 | Riesgo de sobreescritura concurrente entre múltiples terminales de aula | RESUELTO | Bloqueo optimista con versión incremental e intercepción de colisión HTTP 409 con rehidratación automática. |
| DEF-006 | MEDIA | `functions/api/catalog/update.js` | Falta de alias de endpoint para llamadas concurrentes de catálogo | RESUELTO | Creado re-export `export { onRequestPatch, onRequestDelete } from './[id].js'` con control de versión. |
| DEF-007 | ALTA | `ui-docente-management.js` | Exposición de generación PDF sin intercepción explícita de consola | RESUELTO | Añadido wrapper `window.exportBadgePDF` con verificación de rol y lanzamiento de `SECURITY_EXCEPTION`. |
