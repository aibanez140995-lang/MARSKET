# ORBITAL REPORT & Edición Impresa A3 — Fase 2 (Portada Dinámica, Directorios Opcionales y Acceso VIP-0000)

*   **Author:** Alex
*   **Status:** Proposed
*   **Date:** 2026-11-22
*   **Architecture & Constraints Reference:** [MARS-KET OS Architecture & Constraints](../../.agents/skills/marsket-elephant/SKILL.md)

--------------------------------------------------------------------------------

## Overview

Esta especificación detalla la Fase 2 de **ORBITAL REPORT** (periódico digital de MARS-KET 2.0 y su Estudio de Edición Impresa A3 para Coordinación). Amplía el periódico web con una estructura jerárquica de 3 niveles (Portada, bloque *Debajo de la portada* con hasta 3 noticias y Hemeroteca) sin exponer enlaces a Google Drive, convierte las páginas 7 (*Quién es quién*) y 8 (*Más allá del cohete*) del ejemplar impreso A3 en modos opcionales con contenido seleccionable y sincronizable en español, e introduce un acceso de invitado aislado (`VIP-0000` / PIN `0000`) para que familias, profesorado y alumnado lean únicamente el periódico digital desde el código QR impreso.

## The Problem

La versión inicial (`v2.0.38`) presenta cuatro limitaciones operativas tras su primera prueba real:
1. **Rigidez en la portada web y gestión de errores:** El periódico digital solo muestra 1 noticia en portada y envía el resto directamente a la Hemeroteca, sin permitir destacar 2–3 noticias secundarias debajo de la portada ni retirar noticias añadidas por error desde la Hemeroteca. Además, las tarjetas `DOC_15` muestran enlaces a Google Drive que no deben publicarse ni en el periódico web ni en papel.
2. **Falta de secciones de directorio configurables en el A3:** El formato impreso requiere poder activar o sustituir de forma opcional en cada edición mensual la Pág. 7 (*Quién es quién*, alternando empresas reales y startups escolares de las clases `A`–`F` con su prototipo) y la Pág. 8 (*Más allá del cohete*, integrando faldón publicitario `DOC_12`, datos públicos aeroespaciales traducidos y código QR hacia la web).
3. **Ausencia de acceso público acotado:** Al repartir el periódico impreso con código QR y claves `VIP-0000` / `0000`, el sistema necesita una puerta de entrada de solo lectura que impida por completo ver o recibir datos internos de empresas, finanzas o contratos de los alumnos.

## Goals

*   **G1 — Jerarquía editorial de 3 niveles en web:** Incorporar un bloque *Debajo de la portada* (2–3 noticias en espacio compacto) con rotación automática al pulsar `⭐ Portada` (la portada saliente pasa al puesto 1 debajo de la portada y, si se superan 3, la más antigua pasa a Hemeroteca).
*   **G2 — Acciones diferenciadas y seguras:** Distinguir explícitamente entre **Bajar a Hemeroteca** (despromover sin borrar) y **Eliminar (`✕`)** (retirar con confirmación y *tombstone* persistente) en Portada, Debajo de la portada y Hemeroteca.
*   **G3 — Cero enlaces a Google Drive en el periódico:** Eliminar cualquier enlace directo o botón hacia Google Drive / Docs en `ORBITAL REPORT` (web e impreso); las notas de prensa se redactan o copian manualmente por Coordinación.
*   **G4 — Páginas 7 y 8 opcionales en el Estudio Impreso A3:** Permitir alternar Pág. 7 (*Quién es quién* vs. noticias) y Pág. 8 (*Más allá del cohete* vs. noticias) por edición mensual sin alterar la imposición dúplex A3 (`[8|1]`, `[2|7]`, `[6|3]`, `[4|5]`).
*   **G5 — Selector «Quién es quién» Zero-PII y directorio «Más allá del cohete»:** Permitir mezclar startups escolares (`A`–`F`, mostrando `Nombre · España` + nombre del prototipo) con empresas reales en Pág. 7, y en Pág. 8 combinar hueco publicitario `DOC_12` (recortando fichas automáticamente), QR SVG local + claves `VIP-0000`/`0000` y sincronización bajo demanda con Launch Library 2 traducida al español.
*   **G6 — Aislamiento total de `VIP-0000` (PIN `0000`):** Garantizar en servidor (`api/index.php`) y cliente (`auth.js`, `state.js`, `ui-core.js`) que el usuario `VIP-0000` reciba únicamente datos de noticias y entre directamente en la vista de Noticias sin pestañas ni acceso a startups.

## Non-Goals

*   Web scraping HTML genérico desde PHP/CDMON de webs de terceros sin API pública estructurada.
*   Publicación de datos personales de alumnos (Zero-PII), notas académicas o enlaces a Google Drive dentro del periódico o para usuarios `VIP-0000`.
*   Apertura de campos de texto libre para alumnos (toda redacción manual del periódico y edición de directorios es exclusiva de Coordinación `COORD_*`).

## Open Questions

*   Ninguna abierta en esta fase; los esquemas de datos exactos, límites de fichas por página y el protocolo `VIP-0000` se detallan en la sección `Technical Plan`.

## Critical User Journeys (CUJs)

### CUJ 1: Rotación y limpieza editorial en `ORBITAL REPORT` web (Coordinación)
*   **Given**: Coordinación ha iniciado sesión y está en la vista `news` con 1 noticia en Portada y 3 debajo de la portada.
*   **When**: Pulsa `⭐ Portada` sobre un artículo de Hemeroteca (o pulsa `📥 Hemeroteca` / `✕` sobre una noticia de Portada o Debajo de portada).
*   **Then**: Al promover con `⭐`, el nuevo artículo pasa a Portada, la portada anterior baja al primer puesto de Debajo de portada y el 4.º artículo pasa a Hemeroteca. Al pulsar `📥 Hemeroteca`, baja a Hemeroteca sin borrarse; al pulsar `✕` y confirmar, desaparece y queda registrado en *tombstones*.

### CUJ 2: Configuración opcional de Pág. 7 y Pág. 8 e impresión A3 (Coordinación)
*   **Given**: Coordinación abre `🖨️ Edición Impresa A3` en una edición mensual.
*   **When**: Activa el modo *Quién es quién* en Pág. 7 (eligiendo una mezcla de startups de las clases `A`–`F` con nombre de prototipo y empresas reales), activa *Más allá del cohete* en Pág. 8 (asignando opcionalmente un faldón `DOC_12` y pulsando sincronizar Launch Library 2 en español) y genera el PDF A3.
*   **Then**: El maquetador conserva los 4 pliegos A3 dúplex, recorta las fichas de Pág. 8 si hay anuncio para que no desborde los `297 mm`, e imprime el QR SVG junto a las claves `VIP-0000` / `0000`.

### CUJ 3: Lectura pública mediante QR y `VIP-0000` / `0000` (Familias / Invitados)
*   **Given**: Una familia o profesor escanea el QR de la Pág. 8 impresa y abre la pantalla de acceso de MARS-KET 2.0.
*   **When**: Introduce el código `VIP-0000` y el PIN `0000`.
*   **Then**: El servidor devuelve un token de lector `VIP`, entrega únicamente las noticias del periódico (cero datos de empresas) y la app abre directamente `ORBITAL REPORT` sin pestañas de navegación de empresa o administración.

--------------------------------------------------------------------------------

## Technical Plan (Architecture)

### 1. Diagrama de Flujo y Aislamiento

```text
+-------------------------------------------------------------------------+
|                       SERVIDOR CDMON (api/index.php)                    |
|                                                                         |
|  [POST validate_company_code: "VIP-0000"] -> { matchedCoId:"vip_reader" }|
|  [POST verify_vip_login / pin "0000"]     -> Token MKT2 { typ: "V" }    |
|  [GET /api/state con typ:"V"]             -> ETag "...-vip"             |
|     Solo proyecta: news, officialNews, printEditions + tombstones       |
|     (companies: {}, sin contratos/finanzas/PII)                         |
|  [POST/PATCH/DELETE con typ:"V"]          -> 403 Forbidden              |
+-----------------------------------+-------------------------------------+
                                    |
         +--------------------------+--------------------------+
         v                                                     v
+-----------------------------+               +-----------------------------+
|  CLIENTE VIP-0000 (Solo     |               |  COORDINACIÓN (COORD_*)     |
|  lectura, sin localStorage) |               |  Edición Web + Estudio A3   |
|  auth.js -> ui.current='news'|              +--------------+--------------+
|  buildNav -> solo Noticias  |                              |
+-----------------------------+         +--------------------+--------------------+
                                        v                                         v
                     +----------------------------------+      +----------------------------------+
                     | ORBITAL REPORT Web (3 Niveles)   |      | Estudio Impreso A3 (Pág. 7 y 8)  |
                     | 1. Portada (1)                   |      | Pág 7: 'who_is_who' | 'news'     |
                     | 2. Debajo de portada (máx. 3)    |      |   Modal mixto Reales + Startups  |
                     | 3. Hemeroteca (archivo)          |      |   (Nombre · España + Prototipo)  |
                     | Acciones: ⭐ Portada | 📥 Hemer. |      | Pág 8: 'beyond_rocket' | 'news'  |
                     |           ✕ Borrar (tombstone)   |      |   LL2 (ES bajo demanda) + Ad     |
                     | Cero enlaces a Google Drive      |      |   + QR SVG local + VIP-0000/0000 |
                     +----------------------------------+      +----------------------------------+
```

### 2. Periódico Web en 3 Niveles y Cero Enlaces Drive (`js/state.js`, `js/ui-empresa-core.js`)

*   **Modelo de ubicación en noticias (`news`):**
    Cada noticia normalizada en `state.normalizeNewsItem()` añadirá `placement` (`'front' | 'sub' | 'archive'`), `subOrder` (entero `1..3` o `0`) y `placementUpdatedAt` (timestamp ms). Para compatibilidad hacia atrás en `state.migrate()`, una noticia con `featured: true` sin `placement` se normaliza como `placement: 'front'`.
*   **Algoritmo de rotación al pulsar `⭐ Portada` (`setNewsFeatured(id)`):**
    1. La portada actual (si existe y es distinta) cambia a `placement: 'sub'`, `subOrder: 1`.
    2. Las noticias existentes con `placement: 'sub'` incrementan `subOrder` (`+1`).
    3. Toda noticia en `'sub'` con `subOrder > 3` pasa automáticamente a `placement: 'archive'`, `subOrder: 0`.
    4. La noticia seleccionada pasa a `placement: 'front'`, `featured: true`, `subOrder: 0` y actualiza `placementUpdatedAt = Date.now()`.
*   **Separación explícita de acciones para Coordinación:**
    *   `demoteNewsToArchive(id)` (**`📥 Hemeroteca`**): disponible en la noticia de Portada y en las 2–3 tarjetas de *Debajo de la portada*. Cambia `placement = 'archive'`, `featured = false`, `subOrder = 0`, `placementUpdatedAt = Date.now()`, compacta `subOrder` de las restantes y conserva la noticia en Hemeroteca sin añadirla a *tombstones*.
    *   `deleteOfficialNews(id)` (**`✕ Eliminar`**): disponible en **Portada**, **Debajo de la portada** y **Hemeroteca** (y para notas `DOC_15` ya publicadas en el periódico, con su propio tombstone o retirada). Pide confirmación modal y añade el ID a `deletedNewsIds` / `deletedOfficialNewsIds`.
*   **Fusión LWW (`mergeData`):** Para cada artículo, la ubicación (`placement`, `subOrder`, `featured`) se resuelve comparando `placementUpdatedAt` (y `updatedAt`), asegurando que las rotaciones y despromociones entre dos navegadores converjan sin perder el estado más reciente ni resucitar IDs en `deletedNewsIds`.
*   **Cero enlaces a Google Drive:** En `viewNewsBoard()` y `ui-print-newspaper.js` se elimina cualquier renderizado de `driveUrl` / botón `Leer Nota ↗` hacia Drive. Las notas de prensa que Coordinación quiera destacar en el periódico se redactan o copian manualmente como artículos/crónicas dentro de la redacción editorial.

### 3. Páginas 7 y 8 Opcionales en el Estudio Impreso A3 (`js/ui-print-newspaper.js`)

Los índices `6` (Pág. 7) y `7` (Pág. 8) del array `ed.pages` se mantienen intactos para preservar la imposición dúplex A3 (`[8|1]`, `[2|7]`, `[6|3]`, `[4|5]`), añadiendo un campo `pageMode`:

*   **Página 7 (`pageMode: 'who_is_who' | 'news'`):**
    *   Botón conmutador en la cabecera de la Pág. 7 dentro del Estudio Impreso: alterna entre *Modo Directorio «Quién es quién»* y *Modo Noticias estándar (2 huecos)*.
    *   **Modal Selector «Quién es quién» (`modalConfigureWhoIsWho(pageIdx)`):**
        *   Permite a Coordinación seleccionar libremente qué startups de las clases `A`–`F` (y `TEST` opcional) aparecen en la edición y combinarlas con empresas aeroespaciales reales del directorio base.
        *   Cada ficha escolar guarda `{ type: 'startup', coId, companyName, country: 'España', prototypeName }` (Zero-PII: sin nombres de alumnos ni saldos; el campo `prototypeName` es editable únicamente por Coordinación).
        *   Las empresas reales guardan `{ type: 'real', name, country, summary }`.
        *   El render A3 muestra el resumen regional (`Startups Escolares` / `Norteamérica` / `Europa` / `Asia` / `Oceanía`) y una cuadrícula de 2 columnas ajustada al alto de página A4 (`297 mm`).
*   **Página 8 (`pageMode: 'beyond_rocket' | 'news'`):**
    *   Botón conmutador entre *Contraportada «Más allá del cohete»* y *Contraportada de Noticias estándar*.
    *   **Estructura visual de «Más allá del cohete»:**
        *   Bloques de categorías (*Satélites y Datos*, *Logística Orbital*, *Luna y Estaciones*, *Aviación Avanzada*, *Agencias y Lanzamientos LL2*).
        *   **Regla de recorte para faldón publicitario `DOC_12`:** Si `page.adSlot.companyName` está asignado, el renderizador limita el total de fichas visibles (p. ej. máximo `14` fichas compactas frente a `22` sin anuncio) para garantizar que el faldón publicitario + el bloque QR quepan dentro de `297 mm` sin salto de página en `window.print()`.
        *   **Bloque QR + Claves `VIP-0000`:** Generador QR Vanilla JS en `<svg>` puro (~150 líneas, sin dependencias externas ni llamadas de red) que codifica `window.location.origin`, acompañado del recuadro impreso: **`Acceso Lectura Periódico: Código VIP-0000 · PIN 0000`**.
    *   **Sincronización bajo demanda con Launch Library 2 (The Space Devs):**
        *   Botón exclusivo de Coordinación: **`🛰️ Sincronizar Launch Library 2 (ES)`** que consulta `https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=8&mode=list`.
        *   Traduce determinísticamente en cliente al español los estados (`Go for Launch` -> `Confirmado`, `To Be Confirmed` -> `Por confirmar`, `To Be Determined` -> `Por determinar`), tipos de órbita y descripciones breves mediante diccionario aeroespacial + plantillas, guardando el resultado en `ed.pages[7].beyondRocketConfig.ll2Launches` (y con fallback al directorio local editable si hay offline o HTTP 429).

### 4. Aislamiento Total de `VIP-0000` / PIN `0000` (`api/index.php`, `js/auth.js`, `js/state.js`, `js/ui-core.js`)

*   **Servidor (`api/index.php`):**
    *   `validate_company_code`: si el código normalizado es `VIP-0000`, responde `{ valid: true, matchedCoId: 'vip_reader', companyName: 'Lector Invitado · ORBITAL REPORT', isVip: true }`.
    *   `verify_student_login` (cuando `coId === 'vip_reader'` y `role === 'VIP_READER'`): valida que el PIN sea `'0000'` y emite un token `MKT2` firmado con `{ typ: 'V', coId: 'vip_reader', role: 'VIP_READER', stamp: 1 }`.
    *   `verifySession()`: reconoce `typ === 'V'` y devuelve `['authenticated' => true, 'isVip' => true, 'isAdmin' => false, 'isTeacher' => false, 'isCoordinator' => false]`.
    *   `GET /api/state`: añade `'vip'` a `$readerScope`. Cuando `$readerScope === 'vip'`, construye un JSON mínimo con **solo**: `version`, `lastUpdated`, `news`, `deletedNewsIds`, `officialNews`, `deletedOfficialNewsIds`, `printEditions`, `deletedPrintEditionIds`, `companies: new stdClass()`, `b2bMarket: []`, `b2bContracts: []`, `suggestions: []`. El `ETag` incluye `-vip` para aislar la caché HTTP 304.
    *   Guardas de escritura: cualquier endpoint `POST`, `PATCH` o `DELETE` de estado/acciones rechaza inmediatamente tokens `isVip` con HTTP `403`.
*   **Cliente (`js/auth.js`, `js/state.js`, `js/ui-core.js`):**
    *   `auth.js`: al recibir `isVip: true`, `updateRoleOptions()` fija la única opción `VIP_READER` («Lector ORBITAL REPORT»); `_doCompleteLogin()` guarda `isVip: true` en `state.user`, establece `ui.current = 'news'` y `buildNav()` renderiza **únicamente** la pestaña `📰 Periódico` (más controles de lectura/logout).
    *   `state.js`: cuando `state.user?.isVip`, omite leer o escribir `localStorage` (`marsket_v10_PWA`) para que un navegador compartido en el colegio jamás mezcle datos locales de alumnos con la sesión `VIP-0000`, y bloquea `pushToCloud()` / `sendAction()`.

--------------------------------------------------------------------------------

## Alternatives Considered

### Alternative A: Implementar el acceso `VIP-0000` metiéndolo como una empresa más dentro de `state.data.companies` (Enfoque descartado; se mantiene `VIP-0000` como lector aislado `vip_reader`)
*   **Pros:** No requeriría crear un nuevo tipo de token `typ: 'V'` ni una proyección específica en `GET /api/state`.
*   **Cons:** Aunque la pantalla ocultara las pestañas, el servidor seguiría enviando en la respuesta JSON el estado completo de todas las empresas escolares (finanzas, contratos, log de IA, nombres de startups), quedando expuesto en las herramientas de red del navegador.
*   **Reason for Rejection:** Rejected by author (`egm-design` / privacidad escolar): **el acceso lector `VIP-0000` (PIN `0000`) para familias y colegio se mantiene intacto**, pero separado en el servidor (`api/index.php` bajo `vip_reader` / `typ: 'V'`) para garantizar cero filtración de datos internos.

### Alternative B: Generar el código QR mediante API externa (`api.qrserver.com`) o librería npm en cliente
*   **Pros:** Menos líneas de código propio para generar la matriz QR.
*   **Cons:** Viola la restricción del proyecto de cero dependencias npm externas en cliente (`marsket-elephant`), depende de conectividad de red y de cabeceras CSP en el momento de abrir la ventana `window.print()`, y genera imágenes rasterizadas de menor nitidez en PDF A3.
*   **Reason for Rejection:** Rejected by author (`egm-zoom-out` / `marsket-elephant`): se implementa un generador QR autónomo en Vanilla JS que dibuja directamente `<svg>` vectorial en local.

### Alternative C: Scraping HTML directo de páginas web espaciales externas desde CDMON
*   **Pros:** Permitiría intentar leer cualquier portal sin necesidad de que tenga API pública.
*   **Cons:** Alta fragilidad ante cambios de maquetación HTML, bloqueos anti-bot o caídas temporales, además de aumentar la latencia en el servidor compartido PHP/CDMON.
*   **Reason for Rejection:** Rejected by author (`egm-zoom-out`): se sustituye por sincronización bajo demanda con la API pública estructurada Launch Library 2 (The Space Devs), traducción determinista al español y directorio local editable de respaldo.

--------------------------------------------------------------------------------

## Non-Functional Requirements

*   **Seguridad y Privacidad (Zero-PII & Zero-Drive):** Ninguna ficha de «Quién es quién» ni artículo de `ORBITAL REPORT` contiene datos personales de alumnos ni enlaces a Google Drive/Docs. El perfil `VIP-0000` tiene acceso estrictamente de solo lectura (`403` en mutaciones) y caché `ETag` aislada (`-vip`).
*   **Rendimiento y Cuotas Externas:** La consulta a Launch Library 2 es bajo demanda por Coordinación y se persiste en la edición, evitando superar el límite anónimo (~15 req/h) cuando todo el centro educativo comparte IP.
*   **Ergonomía BYOD e Impresión:** Todos los controles nuevos cumplen `min-h-[44px]` y la Pág. 8 impresa recorta automáticamente el directorio cuando hay faldón publicitario para no desbordar `297 mm` en A3 dúplex.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

### Target Files to Create/Modify

#### 1. `api/index.php` (Modify)
*   **Type / Scope:** Backend PHP + SQLite (Autenticación y Proyección de Estado)
*   **Proposed Changes:**
    *   En `validate_company_code`: reconocer el código `VIP-0000` y devolver `{ valid: true, matchedCoId: 'vip_reader', companyName: 'Lector Invitado · ORBITAL REPORT', isVip: true }`.
    *   En `verify_student_login`: aceptar `coId === 'vip_reader'` + `role === 'VIP_READER'` + `pin === '0000'` y emitir un token `MKT2` firmado con `{ typ: 'V', coId: 'vip_reader', role: 'VIP_READER', stamp: 1 }`.
    *   En `verifySession()`: decodificar `typ === 'V'` como `['authenticated' => true, 'isVip' => true, 'isAdmin' => false, 'isTeacher' => false, 'isCoordinator' => false]`.
    *   En `GET /api/state`: añadir `'vip'` a `$readerScope` (incluido en el `ETag`) y devolver una proyección estricta solo con `version`, `lastUpdated`, `news`, `deletedNewsIds`, `officialNews`, `deletedOfficialNewsIds`, `printEditions`, `deletedPrintEditionIds`, `companies: {}` y arrays operativos vacíos.
    *   En endpoints de escritura (`POST`/`PATCH`/`DELETE`): rechazar con HTTP `403` cualquier petición autenticada con `isVip === true`.

#### 2. `js/auth.js` (Modify)
*   **Type / Scope:** Cliente Auth / Login
*   **Proposed Changes:**
    *   Manejar la respuesta `isVip: true` de `validateCompanyCode()` para mostrar en `updateRoleOptions()` una única opción de rol: `VIP_READER` («Lector ORBITAL REPORT»).
    *   En `_doCompleteLogin()`: guardar `isVip: true` en `state.user` y dirigir siempre a `ui.current = 'news'`.

#### 3. `js/state.js` (Modify)
*   **Type / Scope:** Gestión de Estado, LWW y Aislamiento Local
*   **Proposed Changes:**
    *   Cuando `state.user?.isVip === true`: omitir lectura/escritura de `localStorage` (`marsket_v10_PWA`) y bloquear `pushToCloud()` / `sendAction()`.
    *   En `normalizeNewsItem()` y `migrate()`: soportar `placement` (`'front' | 'sub' | 'archive'`), `subOrder` (`0..3`) y `placementUpdatedAt` (migrando `featured: true` previo a `placement: 'front'`).
    *   En `mergeData()`: resolver la ubicación (`placement`, `subOrder`, `featured`) comparando `placementUpdatedAt` y respetar `deletedNewsIds` / `deletedOfficialNewsIds` sin resucitar artículos borrados.

#### 4. `js/ui-core.js` (Modify)
*   **Type / Scope:** Enrutador y Barra de Navegación
*   **Proposed Changes:**
    *   En `buildNav()` y `navigate(view)`: cuando `state.user?.isVip === true`, renderizar únicamente la pestaña `📰 Periódico` (más cerrar sesión / zoom) y redirigir cualquier intento de navegar a otra vista hacia `'news'`.

#### 5. `js/ui-empresa-core.js` (Modify)
*   **Type / Scope:** Periódico Web `ORBITAL REPORT`
*   **Proposed Changes:**
    *   En `viewNewsBoard(el)`: renderizar **Portada** (1 noticia), bloque **Debajo de la portada** (2–3 tarjetas compactas ordenadas por `subOrder`) y **Hemeroteca**.
    *   Actualizar `setNewsFeatured(id)` para rotar la portada saliente a `subOrder: 1` de *Debajo de la portada* y mover el exceso (`> 3`) a *Hemeroteca*.
    *   Añadir `demoteNewsToArchive(id)` (**`📥 Hemeroteca`**) en Portada y Debajo de la portada, y habilitar `deleteOfficialNews(id)` (**`✕ Eliminar`** con confirmación y *tombstone*) en Portada, Debajo de la portada y Hemeroteca.
    *   Eliminar todo enlace `driveUrl` / botón hacia Google Drive en las tarjetas `DOC_15` del periódico.

#### 6. `js/ui-print-newspaper.js` (Modify)
*   **Type / Scope:** Estudio de Edición Impresa A3 (Pág. 7, Pág. 8, QR SVG y LL2)
*   **Proposed Changes:**
    *   Añadir conmutador `pageMode` en Pág. 7 (`'who_is_who' | 'news'`) y Pág. 8 (`'beyond_rocket' | 'news'`) preservando los 8 índices y los 4 pliegos A3 dúplex.
    *   Implementar `modalConfigureWhoIsWho(pageIdx)` para mezclar empresas aeroespaciales reales con startups seleccionadas de las clases `A`–`F` (`Nombre · España` + `prototypeName` editable por Coordinación, Zero-PII).
    *   Implementar la plantilla «Más allá del cohete» para Pág. 8: directorio local editable, recorte automático de fichas cuando `adSlot.companyName` esté activo para mantener los `297 mm` de altura, generador QR Vanilla JS en `<svg>` puro apuntando a `window.location.origin` junto a `VIP-0000` / `0000`, y `syncLaunchLibrary2ForPrint()` bajo demanda con traductor determinista al español.
    *   Garantizar cero enlaces a Google Drive en las vistas y exportaciones PDF A3.

#### 7. `js/config.js`, `index.html`, `sw.js`, `.htaccess`, `css/tailwind.css` (Modify)
*   **Type / Scope:** Versionado, Changelog y Estilos Compilados
*   **Proposed Changes:**
    *   Recompilar `css/tailwind.css` desde `css/input.css`, actualizar `APP_VERSION` / `APP_CHANGELOG` en `js/config.js` y alinear la versión en `index.html`, `sw.js`, `.htaccess` y `api/index.php`.

### Verification Plan

*   **Compilation/Build:** `npx tailwindcss -i css/input.css -o css/tailwind.css --minify` sin errores.
*   **Syntax & Static Integrity Audit:** `node --check` en todos los archivos JS modificados y `node tools/audit-integrity.mjs` con `status: "PASS"` (0 referencias rotas, 0 handlers faltantes, 0 regresiones).
*   **Backend & VIP Isolation Check:** Verificar mediante prueba controlada que `VIP-0000` + `0000` devuelve token `typ: 'V'`, `GET /api/state` devuelve `companies: {}` y solo noticias, y cualquier `POST` de mutación responde `403`.
*   **Functional UI Checks:** Probar rotación `Portada -> Debajo de portada (máx. 3) -> Hemeroteca`, diferencia entre *Bajar a Hemeroteca* y *Eliminar (`✕`)*, ausencia de enlaces Drive, selector mixto de Pág. 7 y vista A3 de Pág. 8 con anuncio + QR SVG + sincronización LL2 traducida al español.

--------------------------------------------------------------------------------

*Drafted with EGM*
