# Periódico «Órbita.» — Rediseño Editorial Digital e Impreso A3

*   **Author:** Alex
*   **Status:** Approved
*   **Date:** 2026-11-23
*   **Contexto Arquitectónico Obligatorio:** [MARS-KET OS Architecture & Constraints](../../.agents/skills/marsket-elephant/SKILL.md)
*   **Documento Predecesor:** [concepts_brief.md](file:///C:/Users/aiban/.gemini/antigravity/brain/adcd42b4-ff74-4d45-abaa-4c21f9b81c89/concepts_brief.md)

--------------------------------------------------------------------------------

## Overview

**«Órbita.»** (*EL DIARIO AEROESPACIAL · Lanzamientos, ciencia e industria*) es el rediseño editorial del periódico escolar de MARS-KET OS (antes *ORBITAL REPORT*), tanto en su edición digital para alumnado de 4º ESO, profesorado e invitados externos (`VIP-0000`) como en su estudio de maquetación impresa en papel A3 (8 páginas en 4 pliegos dúplex).

Conserva la estética clásica de prensa en papel estilo *Washington Post* (`#FAF8F5`, tinta `#111111`, acento `#8B0000`) modernizada con tipografía serifa editorial alojada en el propio servidor (*Newsreader* en `.woff2`), elimina todos los emojis de la superficie lectora en favor de iconos vectoriales SVG monocromos, organiza el contenido en **11 secciones editoriales**, introduce **ediciones digitales numeradas desde `Edición N.º 0 · Piloto Inaugural`** con borradores privados para Coordinación, añade una **Hemeroteca con calendario mensual**, incorpora un recuadro de **«Las 10 más leídas»** y lleva los artículos largos del papel A3 a **doble columna automática**.

**Glosario rápido de siglas del proyecto:** `VIP-0000` (acceso de solo lectura con PIN `0000` para familias y profesorado externo) · `DOC_12` (campañas de publicidad contratadas en Marketing) · `DOC_15` (notas de prensa entregadas por startups para revisión) · `SNAPI` (Spaceflight News API v4, teletipo aeroespacial externo) · `MKT2` (token de sesión firmado HMAC-SHA256) · `LWW` (Last-Write-Wins, resolución de sincronización) · `BYOD` (móviles y portátiles propios del alumnado en aula, mínimo táctil `44px`) · `CDMON` (servidor PHP/SQLite de producción; Cloudflare D1 está retirado).

## The Problem

La versión actual del periódico presenta siete limitaciones concretas que reducen su utilidad en el aula, su claridad ante familias (`VIP-0000`) y la carga de trabajo sostenible del coordinador:

1. **Identidad híbrida y saturación de emojis:** El nombre *ORBITAL REPORT* y la presencia de emojis en pestañas, botones, tarjetas y en el propio papel A3 rompen la coherencia tipográfica de prensa y provocan pies de foto erróneos (como etiquetar fotos reales de la NASA como generadas por IA).
2. **Secciones insuficientes y falta de separación temática:** Toda la actualidad se mezcla en una sola pestaña (`Actualidad`), sin distinguir noticias de la `NASA`, `Lanzamientos`, `Tecnología` ni `Industria`, ni ofrecer espacios para `Juguetes y el espacio` o `Entrevistas`.
3. **Botón de recarga de actualidad inoperante:** El botón de actualizar teletipos no envía parámetro de recarga al servidor ni muestra estado de carga, y la caché de 30 minutos devuelve siempre la misma búsqueda fija (`rocket`).
4. **Ausencia de borradores y control de edición digital:** Cualquier artículo guardado por Coordinación se vuelve visible al instante para alumnado e invitados, y el número de edición digital se calcula de forma artificial sumando artículos.
5. **Confusión potencial entre noticias reales y simulación escolar:** Con diseño de diario clásico, las familias (`VIP-0000`) y el alumnado necesitan distinguir de inmediato qué artículos son periodismo aeroespacial real y cuáles pertenecen a la simulación MARS-KET, sin mostrar etiquetas internas de clase (`4º A–F`) en tarjetas o anuncios `DOC_12`.
6. **Hemeroteca sin navegación temporal clara y fechas desfasadas:** No existe un calendario mensual para explorar lo publicado en cada fecha, y las semillas actuales arrastran desfase de fechas internas respecto a noviembre de 2026.
7. **Edición impresa A3 en una sola columna rígida:** Los reportajes largos impresos en A3 no fluyen en doble columna como un periódico impreso ni vigilan posibles recortes horizontales.

## Goals

*   **G1 — Rebrand íntegro y compatibilidad:** Renombrar toda la experiencia lectora (digital, `VIP-0000`, notificaciones, semillas SVG y estudio A3) a **«Órbita.»**, conservando el renderizado de campañas `DOC_12` previas (`'Periódico Impreso'`, `'ORBITAL REPORT'`, `'Órbita'`), ediciones A3 guardadas y artículos heredados (`actualidad` → `industria`, `historia`, `inventos`).
*   **G2 — Edición tipográfica sin emojis:** Sustituir todos los emojis visibles para el lector (digital y papel A3) por iconos SVG monocromos y tipografía *Newsreader* local (`.woff2`, sin CDNs externos), manteniendo `min-h-[44px]` táctil en móvil de `360px`.
*   **G3 — 11 secciones sin solapes y con contenido desde el día 1:** Desplegar `Portada`, `NASA`, `Lanzamientos`, `Tecnología`, `Industria`, `Quién es quién`, `Del espacio a tu casa` (`inventos`), `Industria aeroespacial en la historia` (`historia`), `Juguetes y el espacio`, `Entrevistas` (estado vacío informativo inicial) y `Hemeroteca` (solo digital), precargando los 18 reportajes verificados nuevos junto con las semillas preservadas de `inventos` e `historia` en `Edición N.º 0`.
*   **G4 — Flujo editorial exclusivo de Coordinación (`Edición N.º 0` → borradores → publicar):** Garantizar desde el servidor (`api/index.php`) que ningún borrador llega al alumnado ni a `VIP-0000`, y unificar en Coordinación la redacción y publicación de noticias basadas en los documentos `DOC_15` entregados por las startups.
*   **G5 — Teletipo funcional en `< 30 s` en CDMON:** Reparar la recarga manual del teletipo para las 4 secciones de actualidad usando traducción agrupada en lote (`< 1.400` caracteres) y caché de respaldo sin exceder el límite de 30 s de PHP en CDMON.
*   **G6 — Transparencia editorial y cero clases públicas:** Añadir etiquetas inline (`ACTUALIDAD REAL` / `SIMULACIÓN MARS-KET`), colofón «Sobre esta edición» al pie y suprimir `• CLASE X` de tarjetas del periódico y pies de anuncios `DOC_12`.
*   **G7 — Hemeroteca mensual y «Las 10 más leídas»:** Ofrecer calendario mensual interactivo (abierto en el último mes activo) y un ranking Top 10 (Top 5 en móvil desplegable a 10) sobre artículos propios publicados, aislado de `state.version` en `marsket.sqlite`, Zero-PII, compatible con `VIP-0000` y con orden aleatorio estable por sesión mientras haya `< 3` artículos con lecturas.
*   **G8 — Impresión A3 en 2 columnas automáticas sin desbordamientos:** Maquetar automáticamente en 2 columnas los cuerpos largos/principales en papel A3, con detección de desbordamiento tanto vertical como horizontal y exportación PDF A3 válida en Chrome y Edge.

## Non-Goals

*   **NG1 — Emisión en directo de vídeo (`youtube-nocookie.com`):** Descartado por el autor; no se incrustarán reproductores en directo ni chats en el periódico.
*   **NG2 — Publicación directa de notas por alumnado o Lengua:** Los alumnos entregan su documento `DOC_15`, pero solo Coordinación redacta y publica la noticia final dentro de Órbita.
*   **NG3 — Tema oscuro azul marino tipo SaaS:** Se mantiene el estilo papel prensa *Washington Post* (`#FAF8F5`, `#111111`, `#8B0000`).
*   **NG4 — Selector manual de columnas en papel A3:** Las columnas serán automáticas según rol y longitud del texto.
*   **NG5 — Analítica individual de lectura:** Prohibido almacenar IP, cookies de seguimiento o identidad del alumno que abre cada artículo (política Zero-PII).
*   **NG6 — Retirar emojis fuera del periódico:** El resto de paneles Cyberpunk de MARS-KET OS conservan su estilo actual.
*   **NG7 — Integración con Launch Library 2 (`ll.thespacedevs.com`):** Descartado por YAGNI; la agenda/tira de `Lanzamientos` en A3 se nutre del teletipo SNAPI y de ranuras editoriales sin abrir `connect-src` en `.htaccess`.

## Open Questions

*(Sin preguntas abiertas bloqueantes; todas las decisiones de alcance, arquitectura y partición en 2 fases están cerradas.)*

## Critical User Journeys (CUJs)

### CUJ 1: Lectura en móvil (`360px`) por alumnado o invitado `VIP-0000`
*   **Given:** La `Edición N.º 0 · Piloto Inaugural` está publicada en CDMON y el usuario accede como alumno o con código `VIP-0000` / PIN `0000`.
*   **When:** Navega con scroll vertical por `Portada`, recorre la barra horizontal de 11 secciones, abre «Las 10 más leídas», consulta `Entrevistas` (vacía) o `Juguetes y el espacio`, y pulsa «Sobre esta edición» en la cabecera.
*   **Then:** Lee titulares en tipografía *Newsreader* sin un solo emoji, distingue mediante etiquetas qué noticias son `ACTUALIDAD REAL` y cuáles `SIMULACIÓN MARS-KET` sin ver clases escolares (`4º A–F`), registra como máximo 1 lectura anónima por sesión al abrir un artículo propio, y el enlace «Sobre esta edición» lo lleva al colofón explicativo al pie.

### CUJ 2: Preparación de borrador (`Edición N.º 1`), notas `DOC_15` y recarga de actualidad por Coordinación
*   **Given:** El coordinador ha recibido un entregable `DOC_15` de una startup y quiere preparar la `Edición N.º 1` sin publicarla aún.
*   **When:** Redacta la noticia basada en `DOC_15` y una entrevista nueva marcándolas como **Borrador**, pulsa el botón de recarga de teletipo en `Tecnología`, previsualiza el borrador y finalmente pulsa **Publicar Edición N.º 1**.
*   **Then:** Mientras están en borrador, ni el alumnado ni `VIP-0000` reciben esos artículos en la respuesta del servidor ni pierden la portada de la `Edición N.º 0`; la recarga del teletipo actualiza y traduce en lote en pocos segundos; y al publicar la `Edición N.º 1`, los borradores pasan a visibles de forma atómica con una sola notificación.

### CUJ 3: Consulta histórica en `Hemeroteca` con calendario mensual
*   **Given:** Existen artículos y ediciones publicados en distintas fechas del curso.
*   **When:** Un lector abre `Hemeroteca`, pulsa un día marcado en el calendario mensual o cambia el filtro por edición (`Edición N.º 0`, `Edición N.º 1`…).
*   **Then:** El calendario abre directamente en el último mes con publicaciones, los días sin artículos no estorban la navegación táctil en `360px` y al seleccionar un día o edición se muestran exactamente las noticias publicadas correspondientes.

### CUJ 4: Maquetación e impresión PDF A3 en doble columna automática
*   **Given:** Coordinación abre el Estudio de Edición Impresa A3 de **Órbita.** con anuncios `DOC_12` (nuevos y heredados de `ORBITAL REPORT`) y artículos largos de las 11 secciones.
*   **When:** Asigna o autogenera las 8 páginas, ajusta anuncios hasta `160 mm` y genera el PDF A3.
*   **Then:** Los cuerpos largos se reparten automáticamente en 2 columnas con filete divisor y guionado español sin desbordar ni vertical ni horizontalmente, los anuncios no muestran `• CLASE X`, la Pág. 7 muestra las 32+ startups con `· Navarra` en rojo y las 8 páginas salen sin ningún emoji ni referencias a `ORBITAL REPORT`.

--------------------------------------------------------------------------------

## Technical Plan (Architecture)

### 1. Diagrama de Flujo y Separación de Responsabilidades

*Nota de infraestructura: Producción opera exclusivamente sobre CDMON (`api/index.php` + SQLite WAL en `data/marsket.sqlite`); Cloudflare D1 está retirado.*

```text
+-----------------------------------------------------------------------------+
| NAVEGADOR (Alumnado / Docentes / Invitados VIP-0000 / Coordinación)          |
|                                                                             |
|  js/config.js             js/ui-orbita.js          js/ui-print-newspaper.js |
|  - ORBITA_SECTIONS (11)   - Cabecera Órbita.       - A3 8 págs. dúplex      |
|  - ORBITA_ICONS (SVG)     - Newsreader (.woff2)    - 2 cols automáticas     |
|                           - Hemeroteca calendario  - Detector H+V por bloque|
|  js/state.js              - Colofón + Top 5/10     - DOC_12 sin clase       |
|  - normalizeNewsItem()    - Borradores (solo Coord)                         |
+-------------+------------------------+--------------------------------------+
              |                        |
   GET/POST /api/state      POST /api/news/view  (1x sesión, Zero-PII)
   GET /api/news/wire       GET  /api/news/top   (caché HTTP 60s)
              |                        |
              v                        v
+-----------------------------------------------------------------------------+
| BACKEND CDMON (api/index.php + api/db.php) — data/marsket.sqlite (WAL)      |
|                                                                             |
|  - Tabla state ('current'):                                                 |
|      * news[] (DRAFT filtrados en servidor si !Coord)                       |
|      * config.orbita { currentEditionNumber } (preservado si !Coord)        |
|  - Tabla news_cache (SNAPI + trad. en lote < 1400 chars + lock anti-avalancha)|
|  - Tabla news_views (article_id, views, updated_at — sin tocar state.version)|
+-----------------------------------------------------------------------------+
```

### 2. Fuente Única de Verdad (`ORBITA_SECTIONS` y `ORBITA_ICONS`)

*   **Registro maestro en `js/config.js`:** `ORBITA_SECTIONS` define las 11 secciones en orden fijo (`portada`, `nasa`, `lanzamientos`, `tecnologia`, `industria`, `quien`, `inventos`, `historia`, `juguetes`, `entrevistas`, `hemeroteca`). Cada objeto declara: `id`, `shortLabelEs`, `shortLabelEn`, `titleEs`, `titleEn`, `subtitleEs`, `subtitleEn`, `kind` (`'front' | 'articles' | 'directory' | 'archive'`), `wireQuery` (`'nasa' | 'launches' | 'technology' | 'industry' | null`), `allowDrafts` (booleano) e `iconKey`.
*   **Iconos vectoriales monocromos:** `ORBITA_ICONS` en `js/config.js` (expuesto vía `ui.getOrbitaIcon(key)`) contiene trazos SVG de `16×16` (`stroke="currentColor"`, `aria-hidden="true"`) para todas las secciones y acciones lectoras. Cero emojis dentro de `js/ui-orbita.js` y de la salida impresa de `js/ui-print-newspaper.js`.
*   **Tipografía local:** Se alojan los 3 archivos literales en `css/fonts/` (`newsreader-latin-400-normal.woff2`, `newsreader-latin-700-normal.woff2`, `newsreader-latin-400-italic.woff2`) y se declaran con `@font-face` en `css/input.css`, compilando `css/tailwind.css` sin CDNs externos.
*   **Extracción modular:** Toda la vista digital del periódico (`viewNewsBoard`, lector completo, calendario, Top 10, colofón, teletipo y editor de Coordinación) se extrae de `js/ui-empresa-core.js` hacia `js/ui-orbita.js` adjuntando los métodos a `ui` (`Object.assign(ui, ...)` y conservando todas las firmas de `BASELINE_FUNCTIONS.ui`). Se desactivan repintados destructivos de `#viewport` cada 20 s mientras el lector del periódico esté abierto.

### 3. Modelo de Datos, Ediciones Numeradas (`N.º 0`) y Migración Segura

*   **Metadatos editoriales mínimos en `state.data.config.orbita`:**
    *   `{ currentEditionNumber: 0 }` (inicial `0` para `Edición N.º 0 · Piloto Inaugural`). No se guarda un diccionario paralelo `editions` ni `newsUpdatedAt`; la lista de ediciones (`0..currentEditionNumber`) y sus fechas se derivan directamente de los artículos publicados en `news[]`.
*   **Campos en cada elemento de `state.data.news[]`:**
    *   `section`: uno de los 8 slugs de artículos (`nasa`, `lanzamientos`, `tecnologia`, `industria`, `inventos`, `historia`, `juguetes`, `entrevistas`). Migración automática en `normalizeNewsItem()`: `'actualidad'` pasa a `'industria'`, conservando `'inventos'` (*Del espacio a tu casa*) e `'historia'` (*Industria aeroespacial en la historia*).
    *   `status`: `'PUBLISHED' | 'DRAFT'` (por defecto `'PUBLISHED'` en artículos heredados).
    *   `editionNumber`: entero (`0` por defecto en artículos existentes; los borradores nuevos toman `currentEditionNumber + 1`). Editar un artículo ya `PUBLISHED` lo actualiza in-situ sin cambiar `editionNumber` ni `currentEditionNumber`.
    *   `origin`: `'REAL' | 'SIMULATION'` (muestra la etiqueta inline `ACTUALIDAD REAL` o `SIMULACIÓN MARS-KET`).
    *   `publishedIsoDate`: `'YYYY-MM-DD'` en zona `Europe/Madrid` (derivada de `publishedAt` o parseando `DD/MM/YYYY` heredado, con fallback seguro a fecha actual si falta).
    *   `userEdited`: booleano (`false` en semillas).
*   **Corrección de semillas (`applyEditorialSeeds`):** Sustituir el tope de tiempo `<= 1763750000000` por `!cur.userEdited && curSeedVer < 3` (conservando fotos no-SVG ya subidas), actualizar cabeceras SVG y `sourceName` de `ORBITAL REPORT` a `Órbita.`, corregir `publishedAt` de 2025 a noviembre de 2026 y precargar los 18 reportajes verificados (`6` en *Juguetes y el espacio*, `3` en *NASA*, `3` en *Lanzamientos*, `3` en *Tecnología*, `3` en *Industria*, preservando las semillas previas de *Del espacio a tu casa* e *Industria aeroespacial en la historia*, y dejando *Entrevistas* vacía con estado informativo).
*   **Separación de portada y borradores:** `resolveFeaturedNews()` calcula `front` y `sub` exclusivamente sobre artículos `status === 'PUBLISHED'`. Al pulsar **`Publicar Edición N.º X`**, Coordinación convierte atómicamente los borradores en `'PUBLISHED'`, incrementa `currentEditionNumber` (si hay borradores pendientes) y envía una única notificación global. Al cerrar sesión o hidratar en `!auth.isCoordinator()`, `js/state.js` purga cualquier borrador residual de `localStorage` en PCs compartidos.

### 4. Seguridad en Backend (`api/index.php`), `VIP-0000` y Contador «Las 10 más leídas»

*   **Filtrado y protección estricta en servidor (`!$isCoord`):**
    *   En `GET /api/state` (`sanitizeStateForClient` y rama `$isVipReader`), si `!$isCoordReader`, el servidor elimina del array `news` todo artículo con `status === 'DRAFT'` y oculta `config.orbita`.
    *   En `POST /api/state`, si **`!$isCoord`** (cubriendo tanto alumnos como docentes de materia `FYQ`/`LEN`/`ECO`), el servidor preserva intactos `$currentState['news']` y `$currentState['config']['orbita']`. Dejar de duplicar `officialNews` en SQLite y en cliente.
*   **`ETag` de `VIP-0000` sin estado extra:** Mantener `config.orbita` (solo lectura de `currentEditionNumber`) en `$vipState`, eliminar filtros públicos de clase (`4º A–F`) y calcular el `ETag` de `VIP-0000` directamente en PHP como `md5($vipJson)`.
*   **Notas `DOC_15`:** Desaparece cualquier subida o publicación directa del alumno al periódico; Coordinación redacta y publica la noticia manualmente desde su panel basándose en el documento `DOC_15` entregado.
*   **Tabla independiente `news_views` dentro de `marsket.sqlite`:**
    *   Creada de forma idempotente en `api/db.php` (fuera de `if ($isNewDb)`, igual que `moderation_alerts`): `CREATE TABLE IF NOT EXISTS news_views (article_id TEXT PRIMARY KEY, views INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL)`. No toca `state.version` ni dispara LWW.
    *   `POST /api/news/view`: acepta cualquier token `MKT2` válido (alumnado, docentes y `VIP-0000`), valida formato de `article_id` (`^[A-Za-z0-9_-]{3,80}$`), ejecuta upsert atómico (`ON CONFLICT DO UPDATE SET views = views + 1`) y devuelve `200 { ok: true, articleId, views }` (`401` si sin sesión, `400` si ID inválido). La deduplicación 1x por sesión se gestiona en `sessionStorage` sin guardar PII en servidor.
    *   `GET /api/news/top`: devuelve `200 { items: [{ articleId, views }, ...] }` (top 20) con `Cache-Control: public, max-age=60`. El cliente cruza los IDs con sus `news[]` propios publicados (descartando borradores, eliminados y teletipos); mientras haya `< 3` artículos con lecturas, completa el recuadro con una selección aleatoria cacheada en `sessionStorage` durante la sesión (mostrando 5 en móvil `360px` desplegables a 10). `POST /api/admin/reset` ejecuta `DELETE FROM news_views` y reinicia `config.orbita`.

### 5. Teletipo en Vivo (4 Secciones) y Calendario de Hemeroteca

*   **Teletipo rápido y anti-estampida (`GET /api/news/wire`):**
    *   Parámetros: `?section=nasa|lanzamientos|tecnologia|industria&force=0|1`. Mapeo fijo en servidor (`nasa`→`nasa`, `lanzamientos`→`launches`, `tecnologia`→`technology`, `industria`→`industry`).
    *   Traducción en lote troceada bajo **`~1.400` caracteres** por llamada (respetando el límite de `1.800` de `translate.googleapis.com` y nunca enviando lotes al respaldo de `480` de `mymemory`); si el conteo de segmentos devueltos difiere del enviado, aplica respaldo por ítem o en inglés sin cruzar titulares.
    *   Caché de 30 min en `news_cache` con clave de bloqueo corto (*single-flight*, 20 s) y respaldo *stale-while-revalidate* si SNAPI falla. `?force=1` requiere Coordinación autenticada con enfriamiento de 60 s (`429` con `retryAfterSec` si se repite antes). Devuelve `{ results: [...], cachedAt, source: 'live'|'cache'|'stale_fallback', section }`.
*   **Hemeroteca mensual:** Agrupa artículos propios publicados por `publishedIsoDate` (`YYYY-MM-DD`). Abre automáticamente en el **último mes con publicaciones**, muestra la lista del mes/día junto a un selector de **Edición (`N.º 0`, `N.º 1`…)** y usa celdas `.orbita-cal-day` exentas del `min-width: 44px` en `index.html` (conservando `min-height: 44px`) para caber en `360px`.

### 6. Estudio de Impresión A3 «Órbita.» (Mapa 11 → 8 y 2 Columnas Automáticas)

*   **Mapa canónico (10 secciones editoriales + Hemeroteca solo digital → 8 páginas dúplex `[8|1]`, `[2|7]`, `[6|3]`, `[4|5]`):** Pág. 1 *Portada* · Pág. 2 *NASA* · Pág. 3 *Lanzamientos* (+ tira editorial/SNAPI) · Pág. 4 *Tecnología* · Pág. 5 *Industria* (+ noticias MARS-KET de Coordinación) · Pág. 6 *Historia & Del espacio a tu casa* (o *Entrevistas* desde el selector) · Pág. 7 *Quién es quién* (32+ Startups Navarras con `· Navarra` en rojo, 0 clases) · Pág. 8 *Contraportada: Juguetes y el espacio* + QR `VIP-0000` + colofón `Sobre esta edición` (manteniendo compatibilidad con ediciones previas *Más allá del cohete*).
*   **2 columnas automáticas seguras:** Titular, entradilla y foto van siempre a ancho completo arriba; solo el contenedor de párrafos del cuerpo aplica `column-count: 2; column-gap: 4.5mm; column-rule: 0.4pt solid #d6d3d1; column-fill: balance; hyphens: auto;` cuando el artículo es principal (`lead`) o tiene `>= 450` caracteres de texto plano (breves en 1 columna). `checkPrintPagesOverflow()` vigila `scrollHeight` y `scrollWidth` tanto en `.a3-sheet` como en cada bloque de 2 columnas; `.a3-sheet` usa `height: 296.5mm` en `@media print`; `printA3NewspaperPDF()` carga `css/tailwind.css?v=${APP_VERSION}` y espera `img.decode().catch(() => {})` con timeout de 2,5 s antes de `window.print()`. Retrocompatibilidad `DOC_12` detectando `'Periódico Impreso'`, `'ORBITAL REPORT'` y `'Órbita'` sin mostrar `• CLASE X`.

--------------------------------------------------------------------------------

## Alternatives Considered

### Alternativa A: Reproductor puntual «En directo» (`youtube-nocookie.com`) para lanzamientos
*   **Pros:** Permitiría seguir lanzamientos espaciales en vivo dentro de la portada del periódico.
*   **Cons:** Exigía abrir `frame-src` en `.htaccess` y relajar `Referrer-Policy` (riesgo de Error 153 en YouTube), requería proteger el reproductor frente al repintado cada 20 s de `#viewport` y quedaba expuesto a bloqueos por el cortafuegos Wi-Fi del centro.
*   **Reason for Rejection:** Descartado por el autor — se elimina la emisión en directo del alcance para simplificar seguridad, privacidad y mantenimiento.

### Alternativa B: Publicación directa de notas de prensa `DOC_15` por alumnado o Lengua
*   **Pros:** Automatizaba la aparición en *Industria* en cuanto se evaluaba el entregable.
*   **Cons:** Generaba colisiones de visibilidad cuando había un borrador de nueva edición abierto y obligaba a proyectar un array separado (`vipPressReleases`) en `$vipState`.
*   **Reason for Rejection:** Descartado por el autor — el alumnado entrega su documento `DOC_15` y es exclusivamente Coordinación quien redacta y publica la noticia dentro del flujo editorial único de Órbita.

### Alternativa C: Tema oscuro azul marino tipo SaaS (de las capturas de referencia)
*   **Pros:** Contraste alto de barra superior oscura como algunas ediciones digitales modernas.
*   **Cons:** Rompía la continuidad visual con la edición impresa A3 estilo *Washington Post*.
*   **Reason for Rejection:** Descartado por el autor — se mantiene la identidad *Washington Post* en papel `#FAF8F5` con tipografía editorial *Newsreader* local y cero emojis.

### Alternativa D: Selector manual de columnas por noticia en el Estudio A3
*   **Pros:** Control manual absoluto del coordinador en cada ranura.
*   **Cons:** Multiplicaba la fricción de maquetación antes de clase y añadía riesgo de que artículos breves quedasen partidos en columnas incómodas.
*   **Reason for Rejection:** Descartado por el autor — las columnas serán automáticas según rol (`lead`) y umbral de longitud del texto.

### Alternativa E: Segundo archivo SQLite (`news_analytics.sqlite`) + `jti` + `news_view_dedup`
*   **Pros:** Aislaba físicamente las escrituras de lecturas en otro fichero.
*   **Cons:** Duplicaba conexiones PDO, obligaba a validar artículos entre dos BDs y añadía tokens `jti` + purgas TTL innecesarias para un ranking escolar no evaluable (~180 alumnos), cuando `marsket.sqlite` ya alberga tablas independientes (`news_cache`, `moderation_alerts`) sin tocar `state.version`.
*   **Reason for Rejection:** Descartado tras auditoría Zoom-Out — se usa una única tabla independiente `news_views` dentro de `marsket.sqlite` con deduplicación en `sessionStorage`.

### Alternativa F: Clonar copias completas de todos los artículos al cerrar cada Edición Digital
*   **Pros:** Instantáneas históricas autocontenidas por edición.
*   **Cons:** Multiplicaría el tamaño del JSON frente al límite de 8 MB en `api/index.php` y complicaría la sincronización LWW en `js/state.js`.
*   **Reason for Rejection:** Descartado por simplicidad (YAGNI) y límites de almacenamiento — basta etiquetar cada artículo con `status` (`DRAFT`/`PUBLISHED`) y `editionNumber`, y `{ currentEditionNumber }` en `config.orbita`.

--------------------------------------------------------------------------------

## Non-Functional Requirements

*   **Seguridad y Privacidad (RGPD / Zero-PII / Zero-Text):** Sin campos de texto libre, sin comentarios ni chats; las lecturas en `news_views` no almacenan IP, cookies de rastreo ni identidad del alumno; los borradores `DRAFT` y `config.orbita` se eliminan en el servidor antes de responder a alumnado, docentes de materia o `VIP-0000`.
*   **Rendimiento y Cuota en CDMON:** Traducción en lote `< 1.400` caracteres para mantenerse por debajo del límite de 30 s en PHP; `VIP-0000` con `ETag` calculado por `md5($vipJson)`; tipografía *Newsreader* en `.woff2` cacheada por `sw.js` sin peticiones externas.
*   **Despliegue y Compatibilidad:** Se mantiene el renderizado de anuncios `DOC_12` previos (`'Periódico Impreso'`, `'ORBITAL REPORT'`, `'Órbita'`), ediciones A3 guardadas y artículos legacy (`actualidad` → `industria`, `historia`, `inventos`), ejecutado en **2 fases explícitas** reversibles sin pérdida de datos en SQLite.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

La ejecución se divide en **2 fases explícitas** (cumpliendo la regla de división de carga técnica y manteniendo `node tools/audit-integrity.mjs` en `PASS` tras cada fase):
*   **Fase A (Backend, Configuración y Estado):** `api/db.php`, `api/index.php`, `js/config.js` y `js/state.js` (con bump de versión coordinado en los 5 archivos obligatorios: `js/config.js`, `index.html`, `sw.js`, `.htaccess`, `api/index.php`).
*   **Fase B (Tipografía, UI Digital «Órbita.», Estudio A3 y Manifiestos):** `css/fonts/*`, `css/input.css`, `css/tailwind.css`, `js/ui-orbita.js`, `js/ui-empresa-core.js`, `js/ui-print-newspaper.js`, `js/auth.js`, `js/ui-core.js`, `js/ui-docente-eval.js`, `js/ui-docente-management.js`, `js/ui-docente-contest.js`, `js/ui-empresa-gov-brand.js`, `tools/deploy-cdmon.mjs`, `tools/audit-integrity.mjs` y bump de versión en los 5 archivos obligatorios.

### Lista Unificada de Archivos Nuevos y Modificados

#### 1. `api/db.php` y `api/index.php` (Modify — Fase A)
*   **Type / Scope:** Backend PHP, SQLite `marsket.sqlite`, seguridad de borradores, teletipo en lote y `news_views`.
*   **Proposed Changes:**
    *   En `api/db.php`: crear de forma idempotente (fuera de `if ($isNewDb)`) `CREATE TABLE IF NOT EXISTS news_views (article_id TEXT PRIMARY KEY, views INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL)`.
    *   En `api/index.php`:
        *   Filtrar `status === 'DRAFT'` fuera de `news[]` y ocultar `config.orbita` en `sanitizeStateForClient()` y en `$vipState` cuando `!$isCoordReader`.
        *   En `POST /api/state`, si `!$isCoord` (incluyendo docentes de materia), preservar intactos `$currentState['news']` y `$currentState['config']['orbita']`. Dejar de duplicar `officialNews` al guardar.
        *   Calcular el `ETag` de `VIP-0000` directamente en PHP como `md5($vipJson)` y renombrar cadenas `ORBITAL REPORT` del perfil `VIP-0000` y del SVG fallback (`/api/news/image`) a `Órbita.`.
        *   Actualizar `GET /api/news/wire`: aceptar `?section=nasa|lanzamientos|tecnologia|industria&force=0|1`, traducir en lote troceado bajo `1.400` caracteres (sin `mymemory` en lote) con validación de conteo y respaldo por ítem/inglés, bloqueo corto *single-flight* en `news_cache` y enfriamiento de 60 s en `?force=1` solo para Coordinación.
        *   Crear `POST /api/news/view` (token `MKT2` válido incluyendo `VIP-0000`, validación `^[A-Za-z0-9_-]{3,80}$`, upsert en `news_views`, respuesta `{ ok, articleId, views }`) y `GET /api/news/top` (top 20 `{ items }`, `Cache-Control: public, max-age=60`). Limpiar `news_views` y reiniciar `config.orbita` en `POST /api/admin/reset`.
*   **Rationale:** Proteger borradores en origen, evitar timeouts de 30 s en CDMON, aislar lecturas de `state.version` y evitar un segundo archivo SQLite.

#### 2. `js/config.js` (Modify — Fase A)
*   **Type / Scope:** Registro único de secciones, iconos SVG y versionado.
*   **Proposed Changes:** Añadir `ORBITA_SECTIONS` (las 11 secciones con `id, shortLabelEs, shortLabelEn, titleEs, titleEn, subtitleEs, subtitleEn, kind, wireQuery, allowDrafts, iconKey`) y `ORBITA_ICONS` (`portada, nasa, lanzamientos, tecnologia, industria, quien, inventos, historia, juguetes, entrevistas, hemeroteca, refresh, search, calendar, book, star, edit`). Actualizar `APP_VERSION` y `APP_CHANGELOG`.
*   **Rationale:** Fuente única de verdad compartida entre lector digital, `state.js` y selector A3.

#### 3. `js/state.js` (Modify — Fase A)
*   **Type / Scope:** Normalización, semillas v3, fusión LWW y purga de borradores en cliente.
*   **Proposed Changes:**
    *   En `normalizeNewsItem()`: validar `section` contra `ORBITA_SECTIONS`, migrar `'actualidad'` → `'industria'`, conservar `'inventos'` e `'historia'`, preservar `status`, `editionNumber`, `origin`, `publishedIsoDate`, `userEdited`, y calcular `publishedIsoDate` (`YYYY-MM-DD` en `Europe/Madrid`).
    *   En `applyEditorialSeeds()` (`seedVersion: 3`): sustituir `<= 1763750000000` por `!cur.userEdited`, actualizar SVGs y `sourceName` a `Órbita.`, corregir `publishedAt` a noviembre de 2026 e inyectar los 18 reportajes verificados definidos en `concepts_brief.md` (`6` en *Juguetes y el espacio*, `3` en *NASA*, `3` en *Lanzamientos*, `3` en *Tecnología*, `3` en *Industria*, preservando `inventos` e `historia` y dejando *Entrevistas* vacía).
    *   Aislar `resolveFeaturedNews()` sobre `status === 'PUBLISHED'`; añadir `config.orbita` (`{ currentEditionNumber: 0 }`) en `migrate()` y `mergeData()` (resolución `Math.max`); eliminar escrituras de `officialNews`; purgar artículos `DRAFT` en `migrate()`/`mergeData()` cuando `!auth.isCoordinator()` y al cerrar sesión.
*   **Rationale:** Evitar pérdida de datos legacy, saltos de semillas v3, fechas rotas y fugas en PCs compartidos.

#### 4. `css/fonts/*.woff2` (Create) y `css/input.css` / `css/tailwind.css` (Modify — Fase B)
*   **Type / Scope:** Tipografía editorial local y estilos compilados.
*   **Proposed Changes:** Alojar `css/fonts/newsreader-latin-400-normal.woff2`, `css/fonts/newsreader-latin-700-normal.woff2` y `css/fonts/newsreader-latin-400-italic.woff2`; declarar `@font-face` en `css/input.css` con utilidad `.font-orbita-serif` y recompilar `css/tailwind.css`.
*   **Rationale:** Servir la tipografía *Newsreader* localmente bajo CSP `'self'`.

#### 5. `js/ui-orbita.js` (Create) y `js/ui-empresa-core.js` (Modify — Fase B)
*   **Type / Scope:** Módulo dedicado del periódico digital **Órbita.** y limpieza de `ui-empresa-core.js`.
*   **Proposed Changes:**
    *   Extraer toda la vista digital del periódico a `js/ui-orbita.js` (`Object.assign(ui, ...)`, preservando `ui.viewNewsBoard` y todos los métodos `BASELINE_FUNCTIONS.ui`). Eliminar escrituras residuales de `state.data.officialNews` y actualizar `ORBITAL REPORT` en `viewLogin` (`js/ui-empresa-core.js:100`).
    *   Implementar cabecera `Órbita.` con punto carmesí, selector `ES | EN`, enlace `Sobre esta edición` (scroll con `scroll-mt-24` a `#orbita-colophon`), barra horizontal de 11 secciones con etiquetas cortas móviles + título/subtítulo completo dentro de cada sección y cero emojis (`ui.getOrbitaIcon()`).
    *   Añadir etiquetas `ACTUALIDAD REAL` / `SIMULACIÓN MARS-KET`, eliminar filtros/badges públicos `CLASE A–F`, corregir `modalViewNewsImage` (fuente real, sin pie fijo de IA), añadir estado vacío informativo en *Entrevistas*, teletipo por sección (`_snapiWireBySection[sec]` con guarda anti-carrera), flujo de borradores (`Guardar borrador`, cinta `BORRADOR OCULTO`, `Publicar Edición N.º X`, edición in-situ), «Las 10 más leídas» (Top 5→10, relleno aleatorio `< 3` estable por sesión, beacon 1x en `openSavedArticleFullReader`), *Hemeroteca* con calendario mensual (`.orbita-cal-day`) y pausa de repintados destructivos cada 20 s sobre el lector activo.
*   **Rationale:** Reducir la complejidad de `js/ui-empresa-core.js` y evitar parpadeos de lectura cada 20 s.

#### 6. `js/ui-print-newspaper.js` (Modify — Fase B)
*   **Type / Scope:** Estudio de Edición Impresa A3 «Órbita.».
*   **Proposed Changes:** Rebrand a `Órbita.`, retirada de emojis residuales en papel y de `• CLASE X` en pies de anuncios `DOC_12`, compatibilidad en `getPendingPrintAdRequests()` con `'Periódico Impreso'`, `'ORBITAL REPORT'` y `'Órbita'`, mapa canónico 11 → 8 páginas (incluyendo *Entrevistas* y *Juguetes y el espacio* en contraportada, manteniendo compatibilidad *Más allá del cohete*), 2 columnas automáticas (`column-count: 2`, `hyphens: auto`) en cuerpos principales o `>= 450` caracteres de texto plano, chequeo `scrollHeight` + `scrollWidth` por página y por bloque de columnas, `.a3-sheet` a `296.5mm`, `<link>` a `css/tailwind.css?v=${APP_VERSION}` en `printA3NewspaperPDF()`, y `img.decode().catch(() => {})` con timeout de 2,5 s.
*   **Rationale:** Maquetar en doble columna automática sin desbordamientos, pérdida de campañas `DOC_12` previas ni cachés CSS obsoletas.

#### 7. `js/auth.js`, `js/ui-core.js`, `js/ui-empresa-gov-brand.js`, `js/ui-docente-eval.js`, `js/ui-docente-management.js` y `js/ui-docente-contest.js` (Modify — Fase B)
*   **Type / Scope:** Rebrand transversal, enrutamiento y flujo único `DOC_15`.
*   **Proposed Changes:** Renombrar `ORBITAL REPORT` a `Órbita.` en `js/auth.js`, `js/ui-core.js:3357` y opciones nuevas `DOC_12` en `js/ui-empresa-gov-brand.js`; coincidir `'órbita.'`/`'periódico órbita'` en `resolveNotificationTarget()` (`js/ui-core.js:1599–1601`); sustituir `ui.approvePressReleaseForNewspaper(...)` en `js/ui-docente-eval.js:848–850` y `js/ui-docente-management.js` por un botón de redacción de borrador en `Órbita.`; añadir variante sin emojis en `renderContestNewsShowcase()` (`js/ui-docente-contest.js`).
*   **Rationale:** Mantener coherencia de marca, sin handlers rotos en `audit-integrity.mjs`.

#### 8. `index.html`, `sw.js`, `.htaccess`, `tools/deploy-cdmon.mjs` y `tools/audit-integrity.mjs` (Modify — Fase A y Fase B)
*   **Type / Scope:** Manifiestos, excepción CSS calendario, Service Worker, cache-busting y auditoría.
*   **Proposed Changes:** En `index.html:341–361`, añadir `:not(.orbita-cal-day)` en la regla `min-width: 44px` de `<style>`. Registrar `js/ui-orbita.js` y los 3 `.woff2` literales de `Newsreader` en `index.html`, `sw.js` (`STATIC_ASSETS`), `tools/deploy-cdmon.mjs` (`filesToUpload`) y `tools/audit-integrity.mjs` (`FILES`). Sincronizar el bump de `APP_VERSION` en los 5 archivos obligatorios (`js/config.js`, `index.html`, `sw.js`, `.htaccess`, `api/index.php`) al cerrar Fase A y Fase B.
*   **Rationale:** Evitar 404s en CDMON, sobrescritura de celdas del calendario y fallos de caché offline.

---

### Verification Plan

*   **Compilación y Sintaxis (tras Fase A y Fase B):**
    *   `node --check` sobre todos los `js/*.js` modificados/creados y `php -l api/db.php api/index.php`.
    *   Recompilación local de Tailwind (`css/tailwind.css`) comprobando `@font-face` para *Newsreader*.
*   **Suite de Integridad:**
    *   `node tools/audit-integrity.mjs` con resultado `PASS` (`0` referencias rotas, `0` IDs faltantes, `0` omisiones en `sw.js`/`deploy-cdmon.mjs`, `BASELINE_FUNCTIONS.ui` íntegras).
*   **Pruebas Funcionales, Migración y Seguridad (sobre copia de `marsket.sqlite` existente):**
    *   Verificar que `$isNewDb === false` crea `news_views`, migra `actualidad` → `industria` y semillas v3 conservando fotos propias.
    *   Verificar que `POST /api/state` llamado por Alumno o Docente no-coordinador (`FYQ`) preserva intactos `news` y `config.orbita`, y que `GET /api/state` para Alumno y `VIP-0000` devuelve `0` artículos `DRAFT`, `0` etiquetas `CLASE X` y `ETag` válido.
    *   Probar `GET /api/news/wire` en las 4 secciones (`?force=1` Coordinación vs caché normal, respaldo cuando falla traducción/conteo de segmentos en lote) sin exceder 30 s.
    *   Probar `POST /api/news/view`, `GET /api/news/top`, `POST /api/admin/reset` (limpieza de `news_views` y `config.orbita`) y reconocimiento `DOC_12` con los 3 textos (`'Periódico Impreso'`, `'ORBITAL REPORT'`, `'Órbita'`).
*   **Verificación Visual BYOD (`360px`) e Impresión A3 (Chrome y Edge):**
    *   Comprobar en `360px`: barra de 11 secciones, *Entrevistas* vacía, calendario de *Hemeroteca* sin desbordamiento horizontal, colofón *Sobre esta edición* y ausencia total de emojis en `Órbita.`.
    *   Exportar PDF A3 apaisado en Chrome y Edge: 4 hojas dúplex (`[8|1], [2|7], [6|3], [4|5]`), 2 columnas balanceadas en textos largos, detector de desbordamiento `scrollHeight` + `scrollWidth`, fuente *Newsreader* aplicada vía `?v=${APP_VERSION}`, anuncios `DOC_12` sin clase y Pág. 7 con las 32+ startups.

--------------------------------------------------------------------------------

*Drafted with EGM*
