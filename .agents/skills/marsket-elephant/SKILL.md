---
name: marsket-elephant
description: Contexto Arquitectónico Maestro (Project Elephant) de MARS-KET OS para el modelo Elephant-Goldfish (EGM). Activa esta skill SIEMPRE que el usuario utilice o mencione comandos EGM (/egm-brainstorm, /egm-draft, /egm-review, /egm-resolve, /egm-drift-report, /egm-bootstrap), pida diseñar una especificación técnica en docs/designs/ o someter una propuesta al tribunal de Peces Dorados (Goldfish).
---

# 🐘 MARS-KET OS — Project Elephant Context (`marsket-elephant`)

Esta skill proporciona al **Elefante** (autor del diseño con contexto histórico) y a los **Peces Dorados** (revisores aislados `egm-*` mediante `GoldfishContext`) el mapa exacto del código fuente y las restricciones legales, pedagógicas y técnicas innegociables de **MARS-KET OS**.

---

## 1. Propósito del Sistema y Dominio Educativo (LOMLOE)

**MARS-KET OS** es un simulador empresarial y aeroespacial interdisciplinar para alumnado de **4º ESO / Bachillerato** (14–16 años), estructurado en **6 grupos de clase (`A`, `B`, `C`, `D`, `E`, `F`)** más el entorno de pruebas **`TEST`** (`TEST-0000` con privilegios de prueba y `TEST-1111` con candados reales de alumno), gestionando ~30 startups simultáneas.

- **5 Fases Cronológicas Cerradas:**
  1. **Fase I:** Fundación y Viabilidad.
  2. **Fase II:** I+D y Prototipado Aeroespacial.
  3. **Fase III:** Producción y Finanzas B2B.
  4. **Fase IV:** Validación Científica y Comercialización.
  5. **Fase V:** Concurso Final (`19/05/2027`) — 1 empresa finalista por clase (`A`–`F`), lanzamientos en directo y 6 galardones oficiales (sin peso en la nota curricular).
- **6 Materias Evaluadoras Reales (18 Entregables, 100% Acta General):**
  - `FYQ` (Física y Química), `LYE` (Laboratorios y Emprendimiento), `LEN` (Lengua), `ECO` (Economía), `MAT` (Matemáticas) e `ING` (Inglés).
- **Roles de Alumnado en cada Startup:**
  - `CEO` (Dirección General, visado ejecutivo, notas de prensa `DOC_15`, licencia AESA `DOC_14`, contratos).
  - `FINANZAS` (Presupuesto en `€v`, autorización de compras B2C/B2B/I+D/MKT, balances `DOC_17`).
  - `TECNICO` (Banco de pruebas de vuelo, cálculo de eficiencia `E = Altura / Coste`, solicitudes de material I+D, compras de 2ª mano con `DOC_9`).
  - `OPERACIONES_IA` (Taller, inventario BOM, recepción de pedidos, auditoría ética y Bitácora IA).
  - `MARKETING` (Identidad corporativa, eslogan `DOC_11`, campañas publicitarias, inteligencia de mercado).
  - `AUXILIAR` (Rol comodín con **paridad operativa 100%** con el departamento asignado en `co.auxRoleDept` vía `getEffectiveRole()`, manteniendo su propio PIN y su voto individual en mociones de asamblea).

---

## 2. Invariantes y Restricciones Innegociables (Leyes del Sistema)

Ningún documento de diseño (`concepts_brief.md`, `design_draft.md` o `docs/designs/*.md`) ni ningún revisor Goldfish puede proponer soluciones que vulneren estas 6 reglas:

1. **Política Zero-Text / Zero-PII para Alumnos (RGPD y LOPDGDD art. 7):**
   - **Terminantemente prohibido** incluir campos de texto libre (`<input type="text">` abiertos o `<textarea>`) donde los alumnos puedan escribir mensajes, justificaciones, nombres personales o comentarios libres.
   - Toda entrada del alumno se realiza exclusivamente mediante **selectores desplegables tipificados (`<select>`)**, valores numéricos acotados o **enlaces validados a documentos de Google Docs / Google Drive** (`https://docs.google.com/...` o `https://drive.google.com/...`).
   - Cada trámite documental ofrece botones duales: **Ver Plantilla Oficial** y **Clonar en Drive (`/copy`)**.
2. **Stack Vanilla JS Sin Dependencias Externas:**
   - Frontend en **Vanilla JavaScript (ES6+)** cargado en cliente, HTML5 semántico (`index.html`) y **Tailwind CSS compilado localmente** (`css/tailwind.css` desde `css/input.css`).
   - **Prohibido** proponer frameworks (React, Vue, Svelte), bundlers complejos o librerías npm de terceros en cliente.
3. **Arquitectura de Persistencia Híbrida y Concurrencia (LWW + Tombstones):**
   - El estado vive en `state.data` (`js/state.js`), cacheado en `localStorage` y sincronizado con:
     - **Producción Principal (CDMON):** Backend PHP + SQLite (`api/index.php` y `api/db.php`).
     - **Edge / Respaldo (Cloudflare Pages Functions + D1):** `functions/api/action.js` y `functions/api/state.js`.
   - Toda mutación crítica debe ser determinista, compatible con migración en `state.migrate()` y respetar las listas negras persistentes (*tombstones*: `deletedCompanyIds`, `deletedSuggestionIds`, `dismissedNotificationIds`) para evitar que la sincronización reviva elementos borrados.
4. **Ergonomía Táctil BYOD y Enfoque Docente por Clase:**
   - Todo botón, selector o enlace interactivo debe cumplir una altura mínima táctil de **44px (`min-h-[44px]`)** y estética Cyberpunk Marciana (`#07090E`, `#FF5722`, `#00F0FF`, `#FFB300`).
   - Toda vista docente nueva o modificada debe respetar el filtro global de clase (`ui.currentClassFilter`: `A`–`F` y `TEST`) y usar tablas con cabeceras fijas (`sticky top-0`) y scroll contenido.
5. **Integridad Estructural y Versionado Sincronizado:**
   - Ningún cambio puede romper `node tools/audit-integrity.mjs` (que verifica que todos los handlers `ui.*`, `auth.*`, `state.*` invocados en HTML/JS existan y que la versión coincida en `js/config.js`, `index.html`, `sw.js`, `.htaccess` y `api/index.php`).
6. **Despliegue por Lista Blanca a CDMON:**
   - El despliegue a producción se ejecuta automáticamente vía GitHub Actions ejecutando `node tools/deploy-cdmon.mjs`, que sube únicamente los archivos listados en `filesToUpload`. Los documentos en `docs/designs/` nunca ensucian el servidor de producción.
7. **Reglas de Dominio en Taller (`DOC_10`), Costes Reales (`€`) y Buzón HR Confidencial (`DOC_2`):**
   - **Hoja de Taller (`hoja_taller_fyq` / `DOC_10`):** Aunque se entrega para nota en **Fase III**, funciona desde fases previas como canal de comunicación iterativo entre **Técnico** y **Operaciones** para ir configurando el cohete y construyendo el **Histórico de Montaje del Cohete** (`hoja.history`); solo la elevación final al CEO/FyQ espera a Fase III.
   - **Costes Reales (`€` en tienda):** Todo material B2C (incluso traído de casa o reciclado) tiene siempre un coste real `> 0 €` (prohibido botón `0.00 €` reciclado). Los euros reales (`€`) solo los registra Operaciones en la recepción y son de **uso exclusivo del profesorado** (control de gasto familiar y estudio de distribuidores para otros años), por lo que no se muestran como KPI al alumnado.
   - **Buzón HR (`DOC_2`):** Es **100% confidencial y anónimo hacia el Claustro Docente**; nunca se notifica ni se muestra al CEO ni a otros alumnos.

---

## 3. Mapa de Módulos del Código Fuente (`Codebase Map`)

Al redactar un `Technical Plan` o ejecutar revisiones EGM (`egm-codebase-details`, `egm-implementation-readiness`), referencia siempre estos archivos reales:

| Archivo / Ruta | Responsabilidad Principal |
| :--- | :--- |
| [index.html](file:///c:/Users/aiban/OneDrive/MARSKET/index.html) | Estructura DOM principal, modales, contenedores de vistas de empresa y docente. |
| [js/config.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/config.js) | `APP_VERSION`, `APP_CHANGELOG`, catálogo base, fases (`PHASES`), entregables (`DELIVERABLES_CONFIG`), contratos, rúbricas y constantes. |
| [js/state.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/state.js) | Estado global `state.data`, `state.migrate()`, sincronización remota (`syncWithServer`, `sendAction`), helpers de roles (`getEffectiveRole`). |
| [js/auth.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/auth.js) | Inicio de sesión por credenciales/PIN de alumnos y claustro docente, gestión de sesión activa. |
| [js/ui-core.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-core.js) | Enrutador de vistas (`ui.switchView`, `ui.render`), reloj de fase (`getPhaseClockMetrics`), HUD superior, modales, notificaciones y utilidades comunes. |
| [js/ui-empresa-core.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-core.js) | Sala de Mando del CEO, Bandeja de Visado Ejecutivo, Radar de Fase, Licencia AESA (`DOC_14`), Notas de Prensa (`DOC_15`), Dossier Académico. |
| [js/ui-empresa-tech.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-tech.js) | Banco de Pruebas de Vuelo (Tsiolkovski / eficiencia `E`), Solicitudes Especiales de I+D. |
| [js/ui-empresa-ops.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-ops.js) | Taller y BOM (escandallo de cohete, montaje, venta de excedentes B2B), Bitácora Ética de IA. |
| [js/ui-empresa-finance.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-finance.js) | Libro Mayor (Ledger `€v`), Bandeja de Autorización Presupuestaria, Balances `DOC_17`, solvencia. |
| [js/ui-empresa-market.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-market.js) | SUPER-MARSKET: Catálogo Oficial B2C, Mercado Secundario B2B (con `DOC_9`), Carrito y Mis Órdenes. |
| [js/ui-empresa-gov-brand.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js) | Identidad y Marca (Eslogan `DOC_11`, Campañas MKT, Inteligencia de Mercado) y Trámites Societarios (Asamblea `DOC_16`, Estatutos, Buzón HR). |
| [js/ui-docente-core.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-docente-core.js) | Panel de Control Docente, Radar de Misión por Clases (`A`–`F` y `TEST`), Crónicas AEE, navegación docente. |
| [js/ui-docente-eval.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-docente-eval.js) | Evaluación por Rúbricas LOMLOE, recepción de entregables Drive, Acta General (100%). |
| [js/ui-docente-management.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-docente-management.js) | Control Financiero, Aduana B2B, Gestión de Catálogo (PDF/CSV), Contratos, Llavero Maestro y Reset de empresas `TEST`. |
| [js/ui-docente-contest.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-docente-contest.js) | Módulo del Concurso Final (Fase V) y clasificación aeroespacial. |
| [api/index.php](file:///c:/Users/aiban/OneDrive/MARSKET/api/index.php) | Endpoint backend principal en CDMON (SQLite, acciones atómicas, concurrencia y estado). |
| [functions/api/action.js](file:///c:/Users/aiban/OneDrive/MARSKET/functions/api/action.js) | Endpoint serverless de mutaciones en Cloudflare D1 (paridad con `api/index.php`). |
| [tools/audit-integrity.mjs](file:///c:/Users/aiban/OneDrive/MARSKET/tools/audit-integrity.mjs) | Suite automatizada de auditoría estática, paridad de versiones y referencias cruzadas. |

---

## 4. Protocolo de Integración EGM ➔ MARS-KET OS

1. **Enlace Obligatorio para los Peces Dorados (`GoldfishContext`):**
   - Siempre que redactes un `concepts_brief.md` (con `egm-brainstorm`) o un `design_draft.md` (con `egm-draft`), incluye en la cabecera o sección de referencias un enlace relativo a este archivo:
     `[MARS-KET OS Architecture & Constraints](.agents/skills/marsket-elephant/SKILL.md)` (o `../../.agents/skills/marsket-elephant/SKILL.md` si el documento ya está en `docs/designs/`).
   - De este modo, el paso 1.3 de `/egm:egm-review` inyectará automáticamente nuestras reglas en el contexto de todos los subagentes Goldfish (`egm-design`, `egm-zoom-out`, `egm-codebase-details`, `egm-implementation-readiness`).
2. **Archivado en `docs/designs/`:**
   - Una vez aprobado un diseño tras `/egm:egm-review` y `/egm:egm-resolve`, guárdalo con nombre descriptivo en `docs/designs/<nombre-funcionalidad>.md` y regístralo en [docs/designs/SITEMAP.md](file:///c:/Users/aiban/OneDrive/MARSKET/docs/designs/SITEMAP.md).
3. **Relevo hacia la Implementación (`@orchestrator` y `@builder`):**
   - El documento aprobado en `docs/designs/` actúa como el Plan de Acción oficial (Tiempo 1 de la Metodología en Dos Tiempos).
   - Para la implementación (Tiempo 2), toman el relevo `@builder`, `@feature-reviewer`, `@qa-validator`, `@ui-ux-designer` y `@legal-privacy-auditor` siguiendo el ciclo habitual de MARS-KET OS.
