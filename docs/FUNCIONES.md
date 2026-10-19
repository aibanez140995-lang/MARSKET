# MARS-KET 2.0 // ESPECIFICACIÓN TÉCNICA DE FUNCIONES (v1.0.19b)

Documento normativo de referencia para la arquitectura de interfaces, enrutamiento, validación y seguridad de MARS-KET 2.0.

---

## 1. Inventario de Funciones Nuevas y Modificadas (Ronda 2b, v1.0.19 & v1.0.19b)

| Módulo | Función | Firma | Async | Parámetros | Retorno | Propósito y Comportamiento |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `auth` | `generateAuthProof` | `(role, coId, exp, credential)` | **Sí** | `role: string`, `coId: string|null`, `exp: number`, `credential: string` | `Promise<string>` | Genera prueba SHA-256 (`role|coId|exp|credential|SALT`) mediante Web Crypto (`crypto.subtle`) para almacenamiento transitorio en `sessionStorage` (G4a). |
| `auth` | `verify` | `()` | **Sí** | Ninguno | `Promise<void>` | Valida el PIN de 4 dígitos (docente o startup), invoca `completeLogin` con la credencial verificada y maneja bloqueo de intentos. |
| `auth` | `completeLogin` | `(userObj, entityName, roleName, verifiedCredential)` | **Sí** | `userObj: Object`, `entityName: string`, `roleName: string`, `verifiedCredential: string` | `Promise<void>` | Orquesta transición Zero-Shift: renderiza app subyacente bajo velo opaco (t=120ms), fade-out (200ms) y oculta `#login-screen` en t=320ms. Persiste token en `sessionStorage`. |
| `auth` | `logout` | `()` | No | Ninguno | `void` | Revoca sesión, restaura inmediatamente la capa fija `#login-screen` (`opacity: 1; display: flex;`), oculta HUD y resetea vista de acceso. |
| `state` | `getAuthToken` | `(userObj, dataRoot)` | No | `userObj: Object`, `dataRoot: Object` | `string` | Genera token criptográfico del rol **sin incluir el PIN** en claro ni codificado (blindaje G4a). |
| `state` | `verifySessionIntegrity`| `(serverOrMergedData)` | No | `serverOrMergedData: Object` | `boolean` | Fiscaliza la vigencia de la sesión: comprueba expiración (8 h), existencia de la entidad y validez del token. Si falla, revoca con modal informativo. |
| `state` | `revokeSession` | `(reason)` | No | `reason: string` | `void` | Finaliza de forma controlada la sesión, limpia `sessionStorage`, oculta el HUD y presenta aviso de seguridad en modal. |
| `state` | `init` | `()` | **Sí** | Ninguno | `Promise<void>` | Inicializa el simulador: migra almacenamiento local, fiscaliza la sesión en `sessionStorage` recalculando `authProof` con la credencial del estado (0 auto-asignación). |
| `state` | `fetchFromCloud` | `()` | **Sí** | Ninguno | `Promise<boolean>` | Sincroniza con `/api/state`: errores de red esperados (offline) emiten `console.warn` una sola vez con limitador; errores HTTP 5xx emiten `console.error`. |
| `ui` | `setHUDVisibility` | `(isLoggedIn)` | No | `isLoggedIn: boolean` | `void` | Conmuta visibilidad atómica de `#hud-header`, `#hud-nav` y `#hud-footer` mediante clase `.hidden`. Blindado ante encuestas en segundo plano (`updateHUD`). |
| `ui` | `escapeHTML` | `(str)` | No | `str: any` | `string` | Sanitiza texto plano para inyección segura en HTML (`&`, `<`, `>`, `"`, `'`). Elimina invisibles U+200B–U+200F y U+FEFF. |
| `ui` | `escapeAttr` | `(str)` | No | `str: any` | `string` | Escapa atributos HTML (comillas dobles, simples y ampersands) para evitar quiebres de sintaxis en atributos. |
| `ui` | `toast` | `(message, tone, duration)` | No | `message: string`, `tone: string`, `duration: number` | `void` | Envoltorio unificado para notificaciones no bloqueantes con duración configurable (por defecto 4000 ms) y roles ARIA. |
| `ui` | `confirmHUD` | `(title, message, onConfirm, confirmLabel, isDanger)` | **Sí** | `title: string`, `message: string`, `onConfirm: Function`, `confirmLabel: string`, `isDanger: boolean` | `Promise<boolean>` | Sustituto cyberpunk de `window.confirm`: modal HUD accesible con trampa de foco y confirmación explícita. |
| `ui` | `setupNavigationHistory`| `()` | No | Ninguno | `void` | Inicializa la pila de capas del navegador (`pushState`/`popstate`), limpia estados huérfanos al recargar y enlaza atajos de teclado. |
| `ui` | `pushLayer` | `(type, closeFn)` | No | `type: string`, `closeFn: Function` | `void` | Registra una capa modal o panel deslizante en la pila de navegación e inserta entrada en `history.pushState`. |
| `ui` | `closeLayer` | `(type, skipHistory)` | No | `type: string`, `skipHistory: boolean` | `void` | Cierra la capa activa y sincroniza con el historial del navegador (`history.back()`) sin bucles infinitos. |
| `ui` | `normalizeTextPipeline` | `(text)` | No | `text: string` | `Object` | Ejecuta el pipeline normativo de 9 fases: NFKC → invisibles → minúsculas → mapa homoglifos cirílico/griego → NFD → leet → colapso de letras sueltas → borrado no alfanumérico → colapso de repeticiones. |
| `ui` | `validateSafeText` | `(text)` | No | `text: string` | `Object` | Motor LOPD y anti-insultos: inspección contextual con límites de palabra para raíces cortas, whitelist de epónimos científicos y retención no destructiva del campo. |
| `ui` | `setSubView` | `(subView, skipHistory)` | No | `subView: string|null`, `skipHistory: boolean` | `void` | Activa una sub-vista en móvil integrándola en la pila de capas del botón Atrás. |
| `ui` | `openDrawer` | `(title, bodyHtml)` | No | `title: string`, `bodyHtml: string` | `void` | Despliega el bottom-sheet HUD con retención de foco, unidades dvh e inserción en la pila de navegación. |
| `ui` | `closeDrawer` | `(skipHistory)` | No | `skipHistory: boolean` | `void` | Cierra el bottom-sheet HUD devolviendo el foco al elemento de origen y sincronizando capas. |
| `ui` | `cancelNameChangeRequest` | `()` | No | Ninguno | `void` | Permite al CEO retirar/cancelar una solicitud de cambio de denominación social pendiente, marcándola como CANCELADO con marca temporal y sincronización. |
| `ui` | `dismissNameChangeRejection` | `()` | No | Ninguno | `void` | Permite al CEO acusar recibo del aviso de denegación de nombre del Registro Mercantil y archivar la solicitud para permitir un nuevo trámite. |
| `ui` | `render` | `()` | No | Ninguno | `void` | Renderiza la vista activa. Si no hay sesión, delega en `#login-screen` y oculta todo el HUD sin desplazamiento vertical ni CLS. |

---

## 2. Tabla de Reemplazo de Diálogos Nativos (Cero alert/confirm/prompt)

| Ocurrencia Original (v1.0.16/17) | Ubicación / Contexto | Sustitución Implementada (v1.0.19) | Mecanismo de Interfaz |
| :--- | :--- | :--- | :--- |
| `alert("PIN incorrecto")` | `js/auth.js` (login) | `ui.notify("❌ PIN incorrecto.", "error")` | Toast HUD con código de color magenta y auto-cierre. |
| `alert("Código requerido")` | `js/auth.js` (pasarela docente) | `ui.notify("❌ CÓDIGO DE AUTORIZACIÓN REQUERIDO.", "error")` | Toast HUD con resaltado de campo en rojo neón. |
| `confirm("¿Eliminar startup?")` | `js/ui-docente-management.js` | `ui.confirmAction("Eliminar Startup", "¿Borrar startup irreversiblemente?", onConfirm, "Eliminar", true)` | Modal HUD con botón de peligro magenta y foco atrapado. |
| `confirm("¿Aprobar campaña?")` | `js/ui-empresa-market.js` | `ui.confirmHUD("Aprobar Campaña", "...", onConfirm)` | Modal HUD con promesa asíncrona. |
| `confirm("¿Firmar contrato B2B?")` | `js/ui-empresa-market.js` | `ui.confirmAction("Contrato B2B", "...", onConfirm)` | Modal HUD temático cian. |
| `prompt("Motivo de rechazo")` | `js/ui-docente-management.js` | `ui.promptDenyBrand(cid)` | Modal formulario con input accesible y validación. |
| `prompt("Nuevo nombre startup")` | `js/ui-docente-management.js` | `ui.promptRenameStartup(cid)` | Modal HUD con input sanitizado y confirmación. |
| `prompt("Moción de censura")` | `js/ui-empresa-gov-brand.js` | `ui.modalMotion()` | Bottom-sheet / modal interactivo con opciones preconfiguradas. |

---

## 3. Estado de Puertas de Seguridad: G4a y G4b

- **G4a · Sesión Segura Transitoria (ESTADO: RESUELTA Y BLINDADA)**:
  - Eliminada la auto-asignación de tokens en `state.init()`.
  - La sesión se guarda exclusivamente en `sessionStorage` (desaparece al cerrar la pestaña) y se limpia cualquier resto en `localStorage`.
  - El token de autorización (`authToken`) no contiene el PIN.
  - La prueba de sesión (`authProof`) se genera con Web Crypto (`SHA-256`) combinando rol, entidad, caducidad (8 horas), credencial y sal de la app.
  - Al iniciar, `state.init()` recalcula la prueba con las credenciales del estado actual; si hay discrepancia o caducidad, revoca inmediatamente.
- **G4b · Falsificación de sesión leyendo `/api/state` (ESTADO: ABIERTA TRANSITORIAMENTE)**:
  - Debido a que en la arquitectura cliente actual `/api/state` expone el JSON de estado a cualquier cliente sin sesión de servidor, un actor malicioso que descargue el JSON podría simular el cálculo de `authProof` localmente.
  - Esta limitación está **abierta por diseño de forma temporal** y se cerrará de raíz en el **Módulo D2 (Seguridad de Servidor)** mediante cookies `HttpOnly`, filtrado de datos en el servidor y migración de credenciales a la tabla D1 cifrada con AES-GCM (fases a–f).

---

## 4. Especificación Técnica de Arquitectura de Login Inmersivo Zero-Shift (v1.0.19b)

### 4.1 Capa Independiente `#login-screen`
- **Ubicación y Estilo**: Contenedor de nivel raíz en `index.html` desacoplado del flujo de aplicación:
  ```css
  #login-screen {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100dvh;
    min-height: 100vh;
    overflow-y: auto;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: max(1rem, env(safe-area-inset-top));
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    background-color: #030712;
    background-image: linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
    background-size: 32px 32px;
  }
  ```
- **Aislamiento Total de Elementos HUD**: Mientras no existe sesión activa (`!state.user`), `#hud-header`, `#hud-nav`, `#hud-footer` y `#viewport` permanecen en `display: none` (`.hidden`). Cero cadenas de texto del HUD (`ENTITY: --`, `ROLE: --`, `[D1: SYNCED]`, etc.) son visibles ni ocupan espacio en el layout.
- **Protección contra Encuestas de Red**: En `ui.updateHUD()`, la llamada a `this.setHUDVisibility()` está condicionada estrictamente a `if (state.user)`. De este modo, los sondeos periódicos a `/api/state` no muestran accidentalmente la cabecera en la pantalla de login.

### 4.2 Orquestación de Transición Zero-Shift (CLS = 0.000)
- **Login Inmersivo**:
  1. Validación exitosa de credenciales en `auth.verify()`.
  2. Llamada a `auth.completeLogin()`: el DOM de la aplicación subyacente se renderiza en segundo plano mediante `ui.init()` y `ui.render()` mientras `#login-screen` permanece 100% opaco durante 120 ms.
  3. Transición de opacidad en `#login-screen` (`opacity: 1` a `opacity: 0`, duración 200 ms).
  4. En $t = 320\text{ ms}$, `#login-screen` recibe `display: none` y la clase `hidden`.
  5. **Métrica Medida**: Cumulative Layout Shift (CLS) = **0.000** ($\le 0.02$).
- **Cierre de Sesión (Logout)**:
  1. `auth.logout()` restaura inmediatamente `#login-screen` con `display: flex` y `opacity: 1`.
  2. Invoca `ui.setHUDVisibility(false)` para ocultar instantáneamente cabecera, navegación y pie.
  3. Limpia `sessionStorage` y reinicia el enrutador en la vista de acceso.

### 4.3 Encaje Móvil, Tipografía y Ergonomía Táctil (G8 & G16)
- **Viewport Estándar**: La tarjeta completa cabe sin scroll vertical en pantallas compactas de referencia (375×667, 390×844 y 393×852).
- **Botón y Texto a 320 px**:
  - Botón principal de acceso rotulado con `[ VALIDAR CÓDIGO ]` (`whitespace-nowrap`), garantizando una sola línea incluso a 320 px de ancho.
  - Altura física garantizada $\ge 48\text{ px}$ (`min-h-[48px]`, `py-3`) para superar cualquier tolerancia de subpíxel.
- **Input de Código y Teclado Virtual**:
  - `font-size: 16px` para eliminar el auto-zoom indeseado en navegadores iOS Safari.
  - Evento `onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })"` para garantizar visibilidad en teclados virtuales reducidos.
- **Eliminación del Doble Borde**:
  - Normalización CSS para `input:focus-visible` y `select:focus-visible` suprimiendo anillos externos (`ring`) duplicados y unificando el foco a borde cian cyberpunk con resplandor sutil.
- **Paso 2 (Teclado PIN)**:
  - Botones numéricos con altura mínima de $44\text{ px}$ (`min-h-[44px]`).
  - Botón de retroceso `[⬅ Cambiar]` para regresar al paso 1 sin recargar.
- **Aviso Offline Seguro**:
  - Notificación discreta `#login-offline-notice` integrada al pie de la tarjeta de login, con texto legible $\ge 12\text{ px}$ (`text-xs`) y atributo `aria-live="polite"`. Solo se hace visible si falla `/api/state`.
