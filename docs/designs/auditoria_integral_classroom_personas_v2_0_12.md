# 🎭 Auditoría Integral de Experiencia de Aula (`@classroom-personas`) — MARS-KET OS `v2.0.12`

Este documento unifica todas las auditorías realizadas por el **Tribunal de Arquetipos de Aula** ([SKILL.md](file:///c:/Users/aiban/OneDrive/MARSKET/.agents/skills/classroom-personas/SKILL.md)) bajo el marco arquitectónico **Elephant-Goldfish** ([SKILL.md](file:///c:/Users/aiban/OneDrive/MARSKET/.agents/skills/marsket-elephant/SKILL.md)) sobre los **5 departamentos de alumnado** de **MARS-KET OS**: **Técnico (I+D)**, **Finanzas (CFO)**, **Operaciones e IA (Taller)**, **Dirección General (CEO)** y **Marketing (CMO)**, además del bloque inicial de **Login y Aterrizaje en Fase I** (ya implementado en `v2.0.12`).

> [!IMPORTANT]
> **Directrices Pedagógicas Oficiales Incorporadas:**
> 1. **Política Zero-Text / Zero-PII (RGPD):** Cero campos de texto libre para alumnos; todo funciona con selectores tipificados (`<select>`), casillas, números acotados y enlaces a Google Drive/Docs validados.
> 2. **Hoja de Taller (`DOC_10`) como Canal Vivo + Histórico de Montaje:** Aunque se entrega para nota en **Fase III**, debe servir desde antes como medio de comunicación iterativo entre **Técnico** y **Operaciones** para ir configurando el cohete y acumulando el **Histórico de Montaje del Cohete** (`hoja.history`), bloqueando hasta Fase III únicamente el envío final al CEO/FyQ.
> 3. **Costes de Compra Reales (`€` en tienda `> 0 €`) Exclusivos para el Docente:** Todo material B2C (incluso traído de casa) tiene siempre un coste real en tienda (`> 0 €`, sin botón de `0.00 €` reciclado). El alumno de Operaciones solo registra el gasto y comercio al recepcionar; el dato en `€` no se muestra como KPI a los alumnos, pues sirve únicamente al **profesorado** para vigilar que no gasten dinero excesivo y estudiar precios reales por distribuidor de cara a otros cursos.
> 4. **Buzón HR (`DOC_2`) 100% Anónimo y Exclusivo para el Docente:** Los reportes de inactividad llegan **únicamente al Claustro Docente**, **nunca al CEO** ni a otros socios, para preservar el anonimato y que sea el profesorado quien dé el toque de atención.

---

## 1. 📊 Matriz Global del Termómetro de Aula (Todos los Roles)

Puntuaciones sobre `5.0` otorgadas en el **Test de los 5 Segundos** por cada arquetipo en aislamiento estricto:

| Arquetipo de Aula | 🔧 Técnico (I+D) | 💰 Finanzas (CFO)* | 📦 Operaciones e IA | 🎖️ Dirección (CEO) | 🎨 Marketing (CMO) | Media por Perfil |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 🐣 **Novato Digital** | `2.5` 🔴 | `2.5` 🟡 | `2.5` 🟡 | `2.0` 🔴 | `2.5` 🟡 | **2.4 / 5** |
| 🧩 **Neurodivergente / Foco** | `2.5` 🔴 | `2.0` 🟡 | `2.8` 🟡 | `2.5` 🟡 | `2.5` 🟡 | **2.5 / 5** |
| 📱 **Móvil BYOD (360px)** | `3.0` 🟡 | *Excluido* | `3.3` 🟡 | `3.0` 🟡 | `3.3` 🟡 | **3.2 / 5** |
| 🎮 **Nativo Digital / Gamer** | `3.0` 🟡 | `3.0` 🟡 | `2.8` 🟡 | `2.5` 🔴 | `3.0` 🟡 | **2.9 / 5** |
| 🥱 **Baja Motivación** | `3.0` 🟡 | `2.5` 🟡 | `2.5` 🔴 | `2.5` 🟡 | `2.5` 🔴 | **2.6 / 5** |
| ⏰ **Caótico de Última Hora** | `2.5` 🔴 | `2.5` 🟡 | `2.6` 🔴 | `2.5` 🔴 | `2.5` 🔴 | **2.5 / 5** |
| 🚀 **Entusiasta / Líder** | `3.5` 🟡 | `3.0` 🟡 | `3.0` 🟡 | `3.5` 🟡 | `3.0` 🟡 | **3.2 / 5** |
| 🕵️‍♂️ **Equipo Bloqueado** | `2.5` 🔴 | `3.0` 🟡 | `2.5` 🔴 | `2.5` 🟡 | `2.0` 🔴 | **2.5 / 5** |
| 🤝 **Socio Auxiliar (Paridad)** | `4.0` 🟡 | `4.0` 🟡 | `3.5` 🟡 | `3.5` 🟡 | `3.5` 🟡 | **3.7 / 5** |
| **Media Global del Rol** | **2.9 / 5** | **2.8 / 5** | **2.8 / 5** | **2.7 / 5** | **2.8 / 5** | **2.8 / 5** |

*\*Nota: En la auditoría de Finanzas se excluyó expresamente el perfil `MOVIL_BYOD` a petición del coordinador.*

---

## 2. 🚨 Hallazgos Transversales y Revisión de Concordancia Pedagógica

Al cruzar los informes de los 5 roles con tus directrices pedagógicas, destacan **7 hallazgos clave** en el código actual:

> [!WARNING]
> **Hallazgo Crítico #1 — Crash de Pantalla en Blanco para el CEO en Fase I (`ReferenceError` TDZ):**
> En [ui-empresa-core.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-core.js#L966), dentro de `viewDashboard()`, se evalúa `curPhaseKey === 'I' && !isMasterOrAdmin` **antes** de que la variable `const curPhaseKey` sea declarada en la línea [1055](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-core.js#L1055). Cuando un CEO real (no `TEST-0000`) entra en Fase I antes de entregarse el Informe Preliminar, JavaScript lanza `ReferenceError: Cannot access 'curPhaseKey' before initialization` y rompe la Sala de Mando.

### 2.1. Revisión de Concordancia: Hoja de Taller (`DOC_10` / `hoja_taller_fyq`) como Canal e Histórico de Montaje
Al revisar [config.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/config.js#L861-L873), [ui-empresa-tech.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-tech.js#L5-L18), [ui-empresa-ops.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-ops.js#L112-L244) y [state.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/state.js#L2143-L2260), **el código actual NO concuerda todavía con tu idea pedagógica por dos motivos**:
1. **Está cerrada con candado total hasta el `15/02/2027` (Fase III):** Como `isDeliverableLocked('hoja_taller_fyq', co)` devuelve `true` durante las Fases I y II, Técnico ve `"🔒 Hoja de Taller no habilitada en esta fase"` ([ui-empresa-tech.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-tech.js#L520)) y **no puede enviar ninguna configuración del cohete al Taller durante la Fase II** (cuando precisamente están comprando piezas, montando el prototipo y haciendo ensayos).
2. **Sobrescribe cada envío en vez de guardar el Histórico de Montaje:** `sendHojaTallerToWorkshop()` ([state.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/state.js#L2163-L2169)) y `validateHojaTallerByOperator()` ([L2199-2203](file:///c:/Users/aiban/OneDrive/MARSKET/js/state.js#L2199-L2203)) pisan el estado anterior y borran `returnReason`, funcionando como un trámite de un solo uso en lugar de acumular todas las comunicaciones e iteraciones del cohete.
* **Adaptación exacta a implementar:**
  - **Desbloquear el canal iterativo Técnico ↔ Operaciones desde Fase I/II** (en cuanto configuren BOM), manteniendo bloqueado por fecha de **Fase III** únicamente el botón final `[ 📤 Elevar Hoja de Taller Definitiva al CEO (Fase III) ]`.
  - **Crear el «Histórico de Montaje del Cohete» (`hoja_taller_fyq.history = []`):** Cada vez que Técnico envía una versión de configuración/BOM a Taller o que Operaciones registra una validación de montaje o una incidencia tipificada (`WORKSHOP_INCIDENCE_REASONS` + enlace Drive), se añade una entrada cronológica inmutable (`Iteración #1`, `#2`... con fecha, rol, piezas en BOM, dictamen/incidencia y enlace Drive) visible en una línea de tiempo tanto en Técnico como en Operaciones, para que con ese histórico elaboren el entregable de Fase III.

### 2.2. Revisión de Concordancia: Buzón HR (`DOC_2`) Anónimo (Fuga Actual al CEO)
* **Bug actual detectado en código:** En `submitInactivityReport()` ([ui-empresa-gov-brand.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js#L802-L810)), las líneas `802-804` ejecutan:
  `ui.pushNotification(state.user.coId, 'CEO', '⚠️ ALERTA HR: ' + roleLabel + ' ha reportado inactividad en el departamento ' + dept, ...)`
  y el mensaje de confirmación (`L810`) dice *"enviado al Claustro Docente y a Dirección General"*.
* **Impacto:** Eso **rompe el anonimato** ante el CEO (le chiva exactamente qué socio ha puesto la queja, e incluso le avisa si le han reportado a él mismo).
* **Adaptación exacta a implementar:** Suprimir por completo el aviso al CEO en `L802-804`, enviar la alerta **exclusivamente a `'ADMIN'` (Claustro Docente)**, mantener `co.inactivityReports` 100% oculto en las pantallas de alumnos y permitir que cualquier socio (incluido el Auxiliar) pueda enviar un reporte confidencial al profesorado.

### 2.3. Revisión de Concordancia: Costes Reales (`€` en tienda `> 0 €`) y Fin de `"0.00 € si es reciclado"`
* **Fricción actual en código:** En [ui-empresa-ops.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-ops.js#L57-L60), la interfaz dice `"Material donado o reciclado: registrar 0.00 €"` y permite meter `0` en compras B2C (`valEur < 0` en [L296](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-ops.js#L296)).
* **Adaptación exacta a implementar:**
  - En compras B2C de tienda/catálogo, **exigir siempre `valEur > 0`** y cambiar el texto orientativo para indicar que, aunque el material se tenga en casa o sea reutilizado, debe anotarse su **precio real de compra en comercio** (`> 0.00 €`). *(Solo las recepciones B2B de 2ª mano entre empresas mantienen `0.00 €` porque el gasto en tienda ya lo registró la empresa vendedora).*
  - **No mostrar `totalRealCost` (`€`) en las vistas de alumnos** (Finanzas, Operaciones ni CEO): el dato queda reservado exclusivamente para las tablas de control del **profesorado/coordinación**.

### 2.4. Escudo Anti-Plantilla (`/copy`) Incompleto Fuera de `role_deliverables`
`ui.isTemplateDriveUrl(url)` ([ui-core.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-core.js#L222-L264)) protege hoy las entregas curriculares estándar, pero falta aplicarlo en los **21 formularios operativos restantes** de los 5 roles:
* **Técnico:** Carrito y compras B2B `DOC_9`, Hoja de Taller `DOC_10`, Material Especial I+D `DOC_13` y Venta B2B `DOC_7`.
* **Finanzas:** Balances de Cierre `DOC_17` ([ui-empresa-finance.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-finance.js#L1446)), aprobaciones parciales ([L1691](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-finance.js#L1691)) y denegaciones ([L1755](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-finance.js#L1755)).
* **Operaciones e IA:** Declaración de uso de IA `DOC_4` ([ui-empresa-ops.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-ops.js#L601)) y devolución de Hoja de Taller ([L532](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-ops.js#L532)).
* **CEO:** Licencia AESA `DOC_14` ([ui-empresa-core.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-core.js#L2508)), Notas de Prensa `DOC_15` ([L2646](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-core.js#L2646)), Actas `DOC_16` ([ui-empresa-gov-brand.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js#L643)), Cambio de Nombre `DOC_1` ([L528](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js#L528)), Buzón HR `DOC_2` ([L768](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js#L768)), Mociones `DOC_6` ([L848](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js#L848)), Crisis `DOC_3` y devoluciones de visado.
* **Marketing:** Propuesta de Eslogan `DOC_11` ([ui-empresa-gov-brand.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js#L1804)), solicitud de Pack `DOC_5` ([L1446](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js#L1446)), publicación de acción `DOC_12` ([L1585](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js#L1585)) y subsanación ([L1740](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js#L1740)).

### 2.5. Colisión de Notificaciones en `SOCIO_AUXILIAR` y Pérdida de «Modo Calma» al Salir
* **Borrado mutuo de avisos (`read` / `readBy`):** En [ui-empresa-core.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-core.js#L180-L270), cuando un `AUXILIAR` está vinculado a un departamento (`co.auxRoleDept`), al descartar o abrir una notificación del departamento se marca `notif.read = true` global (e incluso en `'ALL'` se indexa por `effectiveRole` en vez de `state.user.role`), **borrándole el aviso al compañero titular**.
* **Persistencia de accesibilidad:** En [auth.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/auth.js#L589-L595), `auth.logout()` ejecuta `localStorage.clear()` y borra `marsket_focus_mode` (`Modo Calma`) y `marsket_text_zoom` (`110%/120%`).

### 2.6. Dobles Clics Destructivos, Saldo Comprometido y Estados Desincronizados
* **Doble clic y saldo comprometido:** Faltan cerrojos anti-doble clic en `confirmCart`, `executePhysicalOrder`, AESA/Estatutos (`-50 €v`) y packs MKT; y cuando Finanzas aprueba una orden B2C, conviene mostrar el **Saldo Comprometido pendiente de Taller** y avisar si una operación deja la cuenta en `<= 0 €v` (Números Rojos).
* **Estados desincronizados:** Los packs MKT rechazados (`DENEGADO`) no aparecen en la pestaña `Denegadas` de `viewOrders` (que filtra `RECHAZADO`); el Eslogan de Marketing nace con `status: 'APROBADO'` en verde el día 1 ([ui-empresa-gov-brand.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js#L1164)) sin mostrar `brandApprovalAlert`; y `DEVUELTO_A_TECNICO` en la Hoja de Taller enciende por error una alerta roja a Operaciones en `badge-deliverables`.

---

## 3. 🔍 Resumen de Mejoras Filtradas por Rol

### Rol 1 — 🔧 Departamento Técnico (`Banco I+D`, `Taller & BOM`, `SUPER-MARSKET`, `Carrito`)
* **Blindaje y Carrito:** Escudo `isTemplateDriveUrl()` en `DOC_9`, `DOC_10`, `DOC_13`, `DOC_7` y vídeo de vuelos; botones rápidos **`+5`** y **`+10`** para reactivos (`g` y `10 ml`); actualización sin salto de scroll en `+` y buscador persistente; anti-doble clic en `confirmCart`; aceptar coma decimal y exigir altura/coste `> 0`.
* **Hoja de Taller Viva + Turnos:** Habilitar el envío de iteraciones de configuración a Taller desde Fase I/II con **Línea de Tiempo / Histórico de Montaje del Cohete (`hoja.history`)**; plegar los 6 inputs de vuelo en `<details>` cuando no haya Licencia AESA mostrando el **mini-tracker de 4 pasos** (`Preliminar ➔ Visado CEO ➔ AESA 50 €v ➔ Claustro`); mostrar en Taller las órdenes *«En tránsito»*; y aclarar que el Coste de Ensayo/BOM *"solo calcula E, no descuenta €v"*.
* **Telemetría Científica y Móvil:** 3 mini-KPIs sobre la tabla de vuelos (`🏆 Mejor E`, `🚀 Altura Récord`, `🧪 Ratio g/10ml`), pre-cálculo en vivo de `E = H / C` y vista de tarjetas en móvil (`< 640px`).

### Rol 2 — 💰 Departamento de Finanzas (`Finanzas & ECO`, `Bandeja`, `Bóveda de Órdenes`, `Libro Mayor`, `DOC_17`)
* **Blindaje Contable:** Escudo `isTemplateDriveUrl()` en `DOC_17`, recortes parciales y denegaciones (con `<select>` de motivo tipificado Zero-Text); unificar `DENEGADO` / `RECHAZADO` en packs MKT; validar `offer.status === 'PENDIENTE_FINANZAS'` en `approveB2BSell`; y avisar antes de aprobar si `Saldo Libre Real - gasto <= 0 €v`.
* **Claridad de Turnos y Cero Callejones:** Tarjeta fija superior de estado (`"👉 Tienes N solicitudes pendientes"` vs `"🟢 Todo al día en Finanzas"`); sustituir en `viewOrders` el botón vacío `Explorar SUPER-MARSKET` por acceso a `Entregables` / `Finanzas`; mostrar los nombres de las piezas y enlaces `[Docs ↗]` en la Bandeja; y traducir jerga contable (`Ledger` ➔ `Historial de cobros y pagos`, `Asientos` ➔ `Movimientos`).
* **Velocidad y Solvencia (`€v`):** Botón `[✓ Aprobar Todo]` junto a `[⚙️ Revisar Partidas]`; sustituir la tarjeta repetida de `Coste Neto` / `Gasto Acumulado` por **Saldo Disponible**, **Comprometido en Taller (`€v`)** y **Coste Operativo Neto (`€v`)**; y añadir chips de filtro en el Libro Mayor (`Todos`, `Ingresos +`, `Gastos -`, por departamento). *(Sin mostrar `€` reales al alumno).*

### Rol 3 — 📦 Departamento de Operaciones e IA (`Taller Ensamble`, `Bitácora & Ética IA`)
* **Blindaje de Taller, Coste Real `> 0 €` y Bitácora:** Escudo `isTemplateDriveUrl()`, `[🔗 Probar enlace]` y check de permisos en `modalReportAI` y `modalTallerReturnReason`; exigir **coste real `> 0 €` en compras B2C** y retirar el texto `"0.00 € si es reciclado"`; anti-doble clic en `executePhysicalOrder` y aviso si quedan casillas desmarcadas (sin borrar piezas en silencio); en `validateAIPrompt`, usar estado `'RECHAZADO'` con motivo tipificado (`<select>`); y quitar la falsa alerta roja de `DEVUELTO_A_TECNICO` para Operaciones en `badge-deliverables`.
* **Canal de Montaje `DOC_10`, Cero Duplicidades y Móvil:** Permitir a Operaciones validar o devolver con incidencia cada iteración de la Hoja de Taller alimentando el **Histórico de Montaje del Cohete (`hoja.history`)** (bloqueando solo la elevación final al CEO hasta Fase III); dejar una sola tarjeta de misión `DOC_4` por vista; corregir la guía de bienvenida de `OPERACIONES_IA`; mostrar diagnóstico de *"¿Quién tiene la pelota?"* cuando Taller está vacío; y añadir `inputmode="decimal"`, borde neutro en `€`, `min-h-[44px]` en enlaces de Docs y selector *"Aplicar comercio a toda la orden"*.
* **Trazabilidad Operativa:** Mostrar un resumen plegable (`<details>`) de recepciones físicas completadas en taller (piezas e historial de ensamble, sin usar `€` como KPI competitivo) y en Bitácora IA añadir 5 chips de cobertura departamental (`CEO`, `I+D`, `FIN`, `MKT`, `OPS`).

### Rol 4 — 🎖️ Dirección General (`CEO`: `Sala de Mando`, `Contratos`, `Trámites`, `Supervisión`)
* **Urgente (Crash, Escudos `/copy`, Contadores y Buzón HR Anónimo):** Declarar `curPhaseKey` al inicio del bloque `isCEO` ([ui-empresa-core.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-core.js#L966)); eliminar la notificación al CEO en `submitInactivityReport()` ([ui-empresa-gov-brand.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js#L802-L804)) para que el **Buzón HR (`DOC_2`) llegue exclusivamente y de forma anónima al docente**; aplicar `isTemplateDriveUrl()` + `[🔗 Probar enlace]` + anti-doble clic en todos los trámites y devoluciones del CEO (`DOC_1`, `DOC_2`, `DOC_3`, `DOC_6`, `DOC_14`, `DOC_15`, `DOC_16`); restar `phaseReturnedCount` en el Radar; incluir `specialItemRequests` en `badge-dashboard` y KPI; y arreglar la tarjeta de Slogan en Bandeja.
* **Claridad Ejecutiva, Asamblea y Móvil:** En Bandeja vacía, mostrar la **siguiente acción prioritaria del CEO**; confirmación ligera al pulsar `[ ✓ VISAR ]` si aún no abrió el enlace Drive en la sesión; mostrar en Asamblea qué roles ya votaron y cuáles faltan; renombrar `"Mis Entregables"` del CEO a `"Supervisión de Entregas"`; y añadir `flex-wrap` + `90dvh` en móvil.
* **Telemetría de Mando:** Permitir al CEO abrir el Libro Mayor (`€v`) en lectura al pulsar el KPI `Tesorería Virtual`, mostrar la `Nota Acumulada` en la tarjeta Dossier, chip de cumplimiento en la tarjeta de Contrato activo (`Coste BOM` / `Mejor E`), y abrir el cajón de detalle al tocar cualquier ficha del Radar.

### Rol 5 — 🎨 Departamento de Marketing (`Marca & MKT`, `Campañas`, `Tablón de Noticias`)
* **Blindaje, Estado Real de Marca y Logo:** Mostrar estado real `SIN PROPUESTA` cuando aún no se ha enviado `DOC_11`, inyectar `brandApprovalAlert` y proteger el formulario `Paso 1` mientras esté en revisión; activar `isTemplateDriveUrl()`, `[🔗 Probar enlace]`, check de permisos y anti-doble clic en los 4 envíos de Marketing; corregir el texto `(Hacer copia)` del botón de vista previa; bloquear `+ Contratar Paquete` en `viewBrand` cuando haya Números Rojos; y auto-convertir enlaces `drive.google.com/file/d/{ID}/view` para que el Logo cargue bien en el HUD.
* **Claridad de Flujo, Badges y Móvil:** Aclarar en 1 línea la relación entre `DOC_11` (Registro de Eslogan/Logo en HUD) y `1A. Marca Dic` (entregable LYE); corregir el tracker de acciones `DOC_12`; avisar en `#badge-campaigns` cuando Finanzas active o deniegue un pack; añadir `min-h-[44px]` a los enlaces Drive y a la lupa `🔍`; y agrupar los filtros de `viewNewsBoard` en 2 `<select>` compactos en móvil (`sm:hidden`).
* **Tracción de Marca y Conexión con Patrocinios/Fase V:** Mostrar en `viewBrand` el contador de acciones `DOC_12` validadas y los `€v` invertidos en Marketing, desglosar `I+D vs Marketing` en Inteligencia de Mercado, mostrar previsualización de saldo en `modalRequestMktPackage`, e incluir acceso directo a Patrocinios (Fase I) y al Premio de Marketing (Fase V).

---

## 4. 🗺️ Hoja de Ruta Actualizada (`Metodología en Dos Tiempos`)

### ✅ Fase A (Versión `v2.0.13` — COMPLETADA: Bugs Críticos, Reglas Pedagógicas, Escudos `/copy` y Paridad Auxiliar)
> **Estado:** ✅ **COMPLETADA Y VALIDADA (`v2.0.13`)** por `@feature-reviewer` (`[APROBADO_FUNCIONAL]`), `@qa-validator` (`[PASS]`) y `node tools/audit-integrity.mjs` (`PASS`).

1. **[x] Hotfix CEO Fase I (`curPhaseKey`) y Contadores Exactos:**
   - Corregido el `ReferenceError` de `curPhaseKey` en `viewDashboard` ([ui-empresa-core.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-core.js)) y separado `totalTrayPendingItems` de `totalPendingCeoItems`.
   - Restado `phaseReturnedCount` en el contador de `Pendientes` del Radar CEO e incluido `specialItemRequests` (`PENDIENTE_CEO`) en `badge-dashboard` y KPI.
2. **[x] Alineación Pedagógica de Buzón HR (`DOC_2`), Costes Reales (`€ > 0`) y Hoja de Taller (`DOC_10`):**
   - **Buzón HR 100% Anónimo hacia el Docente:** Eliminada la notificación al CEO en `submitInactivityReport()` ([ui-empresa-gov-brand.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-gov-brand.js)) y ajustado el filtro para que Auxiliar también pueda reportar; solo llega a `'ADMIN'`.
   - **Costes Reales `> 0 €` en Tienda (Uso Exclusivo Docente):** Retirado el texto de `0.00 € reciclado` en [ui-empresa-ops.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/ui-empresa-ops.js) exigiendo `valEur > 0` en B2C (solo B2B `0.00 €`), manteniendo los `€` reales ocultos al alumnado.
   - **Hoja de Taller (`DOC_10`) con Canal Vivo + Histórico de Montaje (`hoja.history`):** Técnico y Operaciones ya intercambian iteraciones y devuelven incidencias antes de Fase III registrando la línea temporal inmutable en cliente ([state.js](file:///c:/Users/aiban/OneDrive/MARSKET/js/state.js)), PHP ([api/index.php](file:///c:/Users/aiban/OneDrive/MARSKET/api/index.php)) y D1 ([action.js](file:///c:/Users/aiban/OneDrive/MARSKET/functions/api/company/%5Bcid%5D/action.js)), reservando hasta Fase III la elevación final al CEO/FyQ.
3. **[x] Escudo Universal Drive (`isTemplateDriveUrl()` + `[🔗 Probar enlace ↗]` + anti-doble clic):**
   - Aplicado a todos los formularios restantes de Técnico (`DOC_10`, ensayos, I+D especial, B2B `DOC_7`), Operaciones (`DOC_10`, IA), Market (`DOC_9`), Finanzas (`DOC_17`, devoluciones, crisis), CEO y Gobierno/Marca (AESA, Prensa, Actas `DOC_16`, Estatutos), más coma decimal y altura `> 0` en el Banco de Pruebas.
4. **[x] Blindaje Contable (`€v`), Estados de Marca/Campañas y Paridad `SOCIO_AUXILIAR`:**
   - Packs de Marketing rechazados (`DENEGADO` / `RECHAZADO`) visibles en Órdenes con motivo tipificado; estado real `SIN_PROPUESTA` en Eslogan; confirmación previa en Taller parcial; rechazo IA sin borrado; previsualización de **Saldo Libre (`€v`)** en Finanzas + candados preventivos por bancarrota (`<= 0 €v`).
   - Lectura individual por credencial (`readBy[rawRole]`) entre titular y Auxiliar, etiqueta legible en Login, firma `getActorRoleLabel(co)` en AESA/Prensa/Estatutos, y conservación de `Modo Calma` + `Zoom` tras `auth.logout()`.

### ✅ Fase B — Bloque B1 (Versión `v2.0.14` — COMPLETADA: Claridad en 5 Segundos y Atajos de Velocidad)
> **Estado:** ✅ **COMPLETADA Y VALIDADA (`v2.0.14`)** por `@feature-reviewer` (`[APROBADO_FUNCIONAL]`), `@qa-validator` (`[PASS]`) y `node tools/audit-integrity.mjs` (`PASS`).

1. **[x] Claridad "¿Quién tiene la pelota?" y Cero Duplicidades:**
   - Tarjeta de estado en `Finanzas` (`0` vs `N` pendientes), eliminación del botón trampa a `SUPER-MARSKET` en Bóveda vacía y traducción de jerga (`Historial de Cobros y Pagos` / `Movimientos`).
   - Diagnóstico de turno en `Taller` vacío (Operaciones y Técnico), tira de «Órdenes en Tránsito» en Taller Técnico, eliminación de la doble tarjeta `DOC_4` en Operaciones, mini-tracker de 4 pasos AESA + plegado en `<details>` en `Banco I+D` + nota de que `Coste Ensayo` solo calcula `E = H / C`.
   - Siguiente acción sugerida en Bandeja CEO vacía, confirmación anti-visado a ciegas (`markDocOpened` con `data-doc-url`), pestaña `'📋 Supervisión Entregas'` para el CEO, quórum nominal (`✓ Votaron` / `⏳ Faltan`) en Asamblea (`Trámites`), aclaración entre `DOC_11` y `1A. Marca Dic`, tracker `DOC_12` corregido y avisos en `#badge-campaigns`.
2. **[x] Atajos de Velocidad Operativa:**
   - Botones **`+1` / `+5` / `+10`** solo en reactivos y consumibles (`isConsumableCatalogItem`) tanto en tarjeta del catálogo como `+5` dentro del Carrito, sin salto de scroll ni pérdida del buscador (`catalogSearchQuery`).
   - Botón `[✓ Aprobar Todo]` en 1 clic junto a `[⚙️ Revisar Partidas]` en Finanzas + desglose de piezas en la tarjeta de la Bandeja.
   - Selector maestro *"Aplicar comercio a toda la orden"* (`applyShopToOrder`) en Taller de Operaciones *(sin botón de `0.00 €` reciclado, manteniendo coste real `> 0 €`)*.

### ✨ Fase B — Bloque B2 (Versión `v2.0.15` — Telemetría `€v`/`E` y Pulido Móvil `360px`)
3. **Telemetría Científica/Estratégica (en `€v` y `E`) + Pulido Móvil `360px`:**
   - Mini-KPIs de vuelo (`Mejor E`, `Altura Récord`, `Ratio g/10ml` y pre-cálculo en vivo de `E`), `Saldo Comprometido en Taller (€v)` y filtros en el Historial de Movimientos, chips de cobertura IA por departamento, marcador de acciones `DOC_12` + `€v` MKT + desglose `I+D vs MKT` + previsualización de saldo + acceso Patrocinios/Fase V + auto-ajuste de URL Drive del Logo para el HUD, clic Tesorería CEO ➔ Historial, `Nota Acumulada` en Dossier, chip cumplimiento Contrato y detalle al tocar ficha Radar.
   - Ajustes móviles `360px`: `max-h-[90dvh]` en modales, `.mars-checkbox-label`, `flex-wrap` en cabeceras, `min-h-[44px]` en todos los enlaces Drive y lupa de Noticias, 2 `<select>` compactos en Noticias móvil y vista de tarjetas para la tabla de vuelos en móvil.
