# MARS-KET OS: Constitución Técnica y Operativa
## 1. Stack Técnico y Arquitectura
- **Frontend**: Vanilla JavaScript (ES6+), HTML5 semántico y Tailwind CSS local. Prohibido añadir dependencias npm externas o librerías pesadas.
- **Persistencia**: Híbrida. LocalStorage como caché reactiva offline-first sincronizada con Cloudflare D1 (SQLite) mediante Worker /api/state.
- **Privacidad Escolar**: Política obligatoria de Cero Datos Personales (Zero-PII). Sin nombres, correos ni datos identificativos de menores.
## 2. Nivel de Calidad: Estándar SaaS Premium
- **Sensación de Producto Comercial**: Interfaz sólida, fluida y con acabado de software comercial de alta gama.
- **Estética Cyberpunk Marciana**: Paleta fija `#07090E` (fondo abisal), `#FF5722` (óxido marciano), `#00F0FF` (cian criogénico) y `#FFB300` (ámbar telemetría). Microinteracciones táctiles rápidas (<150ms), bordes milimétricos y cero CLS.
- **Aterrizaje Intuitivo para 15 Años**: Comprensible en menos de 5 segundos por un alumno de 4º ESO, preservando la inmersión técnica.
## 3. Dinámica Operativa de Agentes
- **Núcleo Cíclico Obligatorio**: @orchestrator, @builder, @qa-validator, @user-tester y @domain-auditor operan en bucle continuo en cada desarrollo hasta obtener aprobación unánime [PASS].
- **Agentes Consultores Bajo Demanda**: @ui-ux-designer y @privacy-security intervienen ÚNICAMENTE cuando el usuario lo solicite de forma explícita.
## 4. Trazabilidad y Código
- **Bump de versión estricto (+0.0.01)**: Cada intervención completada por @builder debe incrementar APP_VERSION en exactamente +0.0.01 en constantes y cabeceras.
- **Novedades y Guía**: Obligatorio actualizar el changelog de novedades (#btn-novedades) y la Guía de Roles si hay cambios de flujo.
- **Guardas de DOM y Estado**: Comprobación estricta de existencia en DOM (`if (!el) return;`), fallbacks en `state.migrate()` y blindaje contra sesiones huérfanas (`state.data.companies[state.user.coId]`).
