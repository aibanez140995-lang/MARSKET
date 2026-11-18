# 🐘 Especificación de Diseño EGM (Resuelta): Plan Integral de Mejora Continua (`v2.0.21` – `v2.0.24`)

> **Contexto Arquitectónico Base (Elephant Baseline):** [MARS-KET OS Architecture & Constraints](../../.agents/skills/marsket-elephant/SKILL.md)
> **Estado:** ✅ Aprobado por Tribunal Goldfish y Resuelto con Coordinación (`/egm-resolve`)
> **División de Carga Técnica:** 4 Fases Quirúrgicas (`v2.0.21`, `v2.0.22`, `v2.0.23`, `v2.0.24`) para garantizar 0 regresiones.

---

## 1. Decisiones Cerradas con Coordinación (`/egm-resolve`)

1. **Buscador en Llavero Maestro:** Descartado. Se mantiene la navegación por pestañas de clase (`A–F` y `TEST`) y se añade únicamente el botón `👁️` de revelado individual por fila de startup.
2. **Chip de Cuenta Atrás en Banners de Rol (`A4`):**
   - Si el rol **ya ha entregado todos sus entregables de la fase activa** (`DELIVERED_TO_TEACHER` / `REVIEWED` / `ACCEPTED`), el chip muestra en verde **`✓ Fase al día`**.
   - Si tiene entregas pendientes: `⌛ Plazo vencido` (si `isDeadlinePassed`), `🚨 ¡Último día!` / `🚨 ¡Últimos X días!` (si `daysRemaining <= 3`), o `⏱️ Cierre en X días` (si `daysRemaining > 3`).
3. **Estudio Docente de Costes Reales `€` (`B3`):**
   - **Umbral fijo de alerta familiar:** **`25 €`** (`> 25 €` muestra badge `⚠️ >25€` en la columna `Físico(€)` de *Control Financiero*).
   - **Exclusión de `TEST` y `Mercado B2B`:** Cuando el filtro global es `ALL`, las empresas `TEST` (`isTestCompany || classGroup === 'TEST'`) quedan excluidas del estudio y del CSV. Las recepciones B2B (`eur <= 0` o `shop === 'Mercado B2B'`) se excluyen del cálculo de tiendas reales para no distorsionar medias.
   - **Contenido del Modal y del CSV (`[📥 Exportar CSV (€)]`):** Exporta y muestra las **dos tablas resumen** (1. *Resumen por Comercio Oficial* y 2. *Comparativa Componente × Comercio con coste medio `€/ud`*), con protección anti-Formula Injection (`escapeCSVCell`) y UTF-8 BOM.
4. **Inspección de Evidencias en Contratos Comerciales (`B4`):**
   - Al pulsar el nombre de una startup en `🤝 Contratos`, se abre un **modal rápido de evidencias in-situ** (`ui.modalInspectContractEvidences(cid, ph)`) **sin salir de la vista de Contratos** ni alterar `currentClassFilter`, mostrando saldo actual, Coste BOM, Mejor `E`, vuelos registrados, enlaces a Google Drive de los entregables de esa fase y un botón secundario opcional `[📝 Ir a Rúbricas ↗]`.
5. **Unificación de Reset en Backups (`B6`):**
   - Se cierra el `</div>` huérfano en `renderAdminBackups()` (`js/ui-docente-core.js:635`).
   - Se **unifican las dos tarjetas de Reset** en una única tarjeta clara **«🚨 Reset General de Fábrica (2400 €v · 18 Entregables)»** y se elimina la segunda tarjeta obsoleta/duplicada (`RESET GLOBAL TRANSACCIONAL`), alineando también `functions/api/admin/reset.js` a `2400.00 €v` con `api/index.php`.

---

## 2. Plan de Acción Subdividido en 4 Fases Quirúrgicas

### 🔹 Fase 1 (`v2.0.21`) — Blindaje Multi-PC Final y Claridad Visual de Alumnado
*Objetivo: Cerrar los últimos detalles de sincronización entre portátiles de alumnos y pulir los indicadores visuales de los 5 roles.*

1. **`A1` · Blindaje LWW con Reloj Lógico en Subsanación `DOC_12`:**
   - **Archivos:** `js/state.js:885-939, 2729-2829`, `api/index.php:1375-1415`, `functions/api/company/[cid]/action.js:338-384`.
   - **Cambios exactos:**
     - En `resubmitMktAction()` (`js/state.js:2779`): sellar `act.resubmittedAt = Math.max(Date.now(), (Number(act.reviewedAt) || 0) + 1)`, `act.updatedAt = act.resubmittedAt`, limpiar `act.feedback = ''` y `act.returnDriveUrl = ''`, sellar `camp.updatedAt = act.resubmittedAt`, `co.updatedAt = act.resubmittedAt` y llamar a `this.save(coId)`.
     - En `decideMktAction()` (`js/state.js:2729`): sellar `act.reviewedAt = Math.max(Date.now(), (Number(act.resubmittedAt) || 0) + 1)`, `act.updatedAt = act.reviewedAt`, `camp.updatedAt = act.reviewedAt`, `co.updatedAt = act.reviewedAt` y llamar a `this.save(coId)`.
     - En `reconcileExecutedActions()` (`js/state.js:885-939`): determinar el objeto ganador comparando `lSub = Number(lAct.resubmittedAt) || 0`, `lRev = Number(lAct.reviewedAt) || 0`, `sSub = Number(sAct.resubmittedAt) || 0`, `sRev = Number(sAct.reviewedAt) || 0`. Si el timestamp efectivo mayor corresponde a una subsanación (`sub > rev`), el estado ganador es `'PENDIENTE_CEO'` con la `url`/`driveUrl` nueva y `feedback: ''`; si corresponde a una revisión del CEO (`rev >= sub` y `rev > 0`), gana `'VALIDADO_CEO'` / `'RECHAZADO_CEO'` del lado con mayor `reviewedAt`. Combinar siempre `{ ...loser, ...winner }` tomando `url` y `driveUrl` del ganador (`winner.url || winner.driveUrl || loser.url || ''`).
     - En `api/index.php:1375-1415` (`UPDATE_MARKETING`): validar cuota `totalActions`, forzar `status = 'PENDIENTE_CEO'` cuando muta Marketing y proteger contra sobrescrituras con timestamp inferior.
2. **`A2` · Paridad SQL `company_state` (`version` + `updated_at`) y Helper Único de Reset `TEST`:**
   - **Archivos:** `api/index.php:2134-2154`, `functions/api/admin/credentials.js:249-268`, `js/state.js:1293-1340, 1420-1425`.
   - **Cambios exactos:**
     - En `api/index.php` y `functions/api/admin/credentials.js`, actualizar en `UPDATE company_state` tanto `version = MAX(COALESCE(version, 0) + 1, :ver)` como `updated_at = :up` junto con el `json_set(...)`.
     - En `js/state.js`, extraer un único helper `isTestCompanyReset(k, sCo, lCo, sTime, lTime)` que compruebe `const sR = Number(sCo?.resetAt) || 0; const lR = Number(lCo?.resetAt) || 0; const winR = Math.max(sR, lR); const loseT = (sR >= lR) ? lTime : sTime; return Boolean(isTest && sR !== lR && winR >= loseT);` y usarlo en las **3 ramas** (`1296`, `1335` y `1423`).
3. **`A4` · Chip de Cuenta Atrás / «✓ Fase al día» en Banners de Todos los Roles:**
   - **Archivo:** `js/ui-empresa-core.js:3880-3997`.
   - **Cambios exactos:** En `renderRoleActivePhaseDeliverableBanner(co)`, comprobar primero si todos los `myActiveDeliverables` del rol están ya entregados (`DELIVERED_TO_TEACHER`, `REVIEWED`, `ACCEPTED`). Si es así, mostrar chip esmeralda `✓ Fase al día`. En caso contrario, consultar `this.getPhaseClockMetrics(co)` y mostrar en orden: `⌛ Plazo vencido` (`isDeadlinePassed`), `🚨 ¡Último día!` (`daysRemaining === 1`), `🚨 ¡Últimos X días!` (`daysRemaining <= 3`) o `⏱️ Cierre en X días`.
4. **`A5` · Limpieza de Prefijos Numéricos Redundantes (`'1. '`, `'2. '`) en Trackers:**
   - **Archivos:** `js/ui-core.js:1751-1776`, `js/ui-empresa-finance.js`, `js/ui-empresa-ops.js`, `js/ui-empresa-tech.js`, `js/ui-empresa-gov-brand.js`.
   - **Cambios exactos:** Normalizar `String(step).replace(/^\d+\.\s*/, '')` dentro de `renderWorkflowTracker()` y limpiar los literales en las llamadas existentes.

---

### 🔹 Fase 2 (`v2.0.22`) — Llavero Maestro, Telemetría, Catálogo I+D y Unificación de Backups
*Objetivo: Agilizar las herramientas administrativas diarias de Coordinación sin tocar los módulos de evaluación.*

1. **`B1` · Revelado Individual de PIN por Fila (`👁️`) en Llavero Maestro (Sin Buscador):**
   - **Archivo:** `js/ui-docente-management.js:512-638`.
   - **Cambios exactos:**
     - Mantener `this.revealedPinCompanyIds` (conjunto en memoria RAM) para que los refrescos cada 12s no oculten la fila mientras el profesor dicta el PIN.
     - Añadir **1 único botón `👁️` / `🙈`** (`min-h-[44px] min-w-[44px]`) por fila de startup (en la columna `Acción` junto a `🎲 PINs`) que invoque `ui.toggleCompanyRowPins(cid)`, revelando/ocultando solo los inputs `pin-input-${cid}-*` de esa empresa. Al pulsar el botón global `[🔒 Ocultar PINs]`, se limpia también `revealedPinCompanyIds`.
2. **`B2` · Sincronización de Clase y Estado `--` de `AUXILIAR` en Telemetría:**
   - **Archivos:** `js/ui-docente-core.js:206-212`, `js/ui-docente-management.js:1458-1535`.
   - **Cambios exactos:**
     - Añadir `this.telemetryClassFilter = cls;` en `setClassFilter(cls)`.
     - En `renderTelemetryMatrixRows()`, para `r === 'AUXILIAR'`, si `count === 0` y la startup no tiene Auxiliar activo (`!co.auxRoleDept && co.auxRoleRequest?.status !== 'APROBADO'`), mostrar `--` en gris (`text-slate-500`) en lugar de `0` rojo pulsante.
3. **`A3` · Limpieza de `pendingCustom` en `resetTestCompany` + `deleteStartup` y Solicitudes I+D Arriba del Catálogo:**
   - **Archivo:** `js/ui-docente-management.js:1667-1775, 2229-2232, 2307-2309`.
   - **Cambios exactos:**
     - Filtrar `req && req.company !== cid && req.coId !== cid` tanto en `resetTestCompany()` como en `deleteStartup()`.
     - Colocar el panel *"Solicitudes de Material Externo / I+D"* a ancho completo **encima** del grid del Catálogo en `renderAdminCatalog()`, con badge contador cuando haya pendientes (y plegado compacto en `<details>` cuando esté en `0` pendientes para no empujar la tabla).
4. **`B6` · Higiene HTML y Unificación de Reset en Backups:**
   - **Archivos:** `js/ui-docente-core.js:588-672`, `functions/api/admin/reset.js:88,109`.
   - **Cambios exactos:**
     - Cerrar el `</div>` de la línea `635` en `renderAdminBackups()`.
     - Eliminar la segunda tarjeta duplicada (`RESET GLOBAL TRANSACCIONAL`) y dejar una única tarjeta clara **«🚨 Reset General de Fábrica (2400 €v · 18 Entregables)»** corrigiendo `"19 entregables"` ➔ `"18 entregables"`.
     - Alinear `functions/api/admin/reset.js` (`1000.00` ➔ `2400.00`) con `api/index.php`.

---

### 🔹 Fase 3 (`v2.0.23`) — Estudio Docente de Costes Reales (`€`) y Auditoría de Contratos Comerciales
*Objetivo: Implementar el panel analítico de precios reales por tienda y el inspector in-situ de Contratos.*

1. **`B3` · Estudio de Costes Reales (`€`) por Comercio Oficial + Alerta `> 25 €` + CSV Resumen:**
   - **Archivo:** `js/ui-docente-management.js:270-377, 2821-2873`.
   - **Cambios exactos:**
     - En la tabla *Control Financiero* (visible solo para `isCoord`), mostrar badge `⚠️ >25€` junto al importe `Físico(€)` cuando `r > 25`.
     - En la tarjeta *"Inversión FÍSICA"*, añadir el botón **`[🏪 Estudio Precios € / CSV]`** (`ui.modalRealCostsStudy()`), usando modal ancho (`max-w-5xl`).
     - Reglas de agregación del estudio:
       - Respeta `ui.currentClassFilter`; cuando es `ALL`, **excluye empresas `TEST`** (`co.isTestCompany || co.classGroup === 'TEST'`).
       - Excluye registros B2B sin coste físico (`Number(rc.eur) <= 0` o `shop` normalizado `=== 'MERCADO B2B'`).
       - Muestra **Tabla 1 (Resumen por Comercio Oficial):** Comercio, Nº de recepciones, Unidades totales, Gasto total (`€`) y Ticket medio por compra (`€`).
       - Muestra **Tabla 2 (Comparativa Componente × Comercio):** Componente, Comercio, Compras, Unidades totales, Gasto total (`€`) y Coste medio unitario (`€/ud`).
     - Botón **`[📥 Exportar Tablas Resumen CSV (€)]`** (`ui.exportRealCostsSummaryCSV()`): exporta ambas tablas resumen con UTF-8 BOM, separador `;` compatible con Excel España y sanitización anti-inyección de fórmulas (`escapeCSVCell`).
2. **`B4` · Ergonomía de Contratos Comerciales e Inspector In-Situ sin Salir de Contratos:**
   - **Archivo:** `js/ui-docente-eval.js:1123-1313`.
   - **Cambios exactos:**
     - Inicializar `phaseFilter` en la fase activa (`this.adminContractsPhaseFilter || (this.getCurrentPhaseKey ? this.getCurrentPhaseKey() : 'I')`).
     - Añadir botón conmutador **`[⚡ Solo con contrato activo]`** (`this.adminContractsOnlySigned`) mostrando cuántas filas sin contrato se ocultan `(${hiddenCount} ocultas)`.
     - Permitir salto de línea limpio (`whitespace-normal`) en la celda y `<span>` hijos de *Requisitos Clave*.
     - Cambiar el clic en el nombre de startup a `ui.modalInspectContractEvidences(cid, ph)` para ver en un modal (sin salir de *Contratos*) el saldo, Coste BOM, Mejor `E`, ensayos de vuelo y enlaces Drive de entregables de esa fase, más un botón opcional `[📝 Ir a Rúbricas ↗]`.

---

### 🔹 Fase 4 (`v2.0.24`) — Concurso Final (Fase V) en Proyector de Gala, Auto-Guardado y Móvil
*Objetivo: Dejar blindada la operativa en vivo del salón de actos (`19/05/2027`).*

1. **`B5` · Modo Proyector Ancho (`max-w-5xl`), Auto-Guardado de Gala y Tabla Responsive con DOM Único:**
   - **Archivos:** `js/ui-core.js:4323-4340`, `js/ui-docente-contest.js:380-506, 508-643, 917-1075`.
   - **Cambios exactos:**
     - Añadir parámetro opcional `maxWidthClass = 'max-w-lg'` a `ui.showModal(title, body, actions, maxWidthClass)` y pasar `'max-w-5xl'` desde `openContestProjectorModal()`.
     - En `suggestContestPodiumFromE()`: antes de ordenar por `E`, recorrer los inputs del Paso 2 con `_readLaunchInputsForCompany()`, guardando automáticamente todas las filas válidas no vacías (y avisando sin abortar si alguna otra fila quedó a medio escribir).
     - En `confirmToggleContestPublished(true)`: guardar/validar automáticamente las selecciones actuales de los `<select>` del Paso 3 (`saveContestPodiumAndAwards()`) antes de comprobar `!fc.podium?.first` y abrir la confirmación.
     - En el Paso 2 de `renderAdminContest()`: aplicar diseño responsive sobre **un único árbol DOM** (`hidden md:table-header-group` en `<thead>` y `block md:table-row` en cada `<tr>` con etiquetas móviles `<span class="md:hidden">`), evitando al 100% duplicar IDs `contest-height-${cid}`.
