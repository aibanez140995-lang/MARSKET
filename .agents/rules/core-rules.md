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
- **Núcleo Cíclico Obligatorio**: @orchestrator, @builder, @qa-validator, @user-tester, @domain-auditor, @student-actor, @teacher-evaluator, @ui-ux-designer y @privacy-security operan en bucle continuo de validación completa en cada mejora y desarrollo hasta obtener aprobación unánime [PASS].
- **Especializaciones de Validación en Cada Iteración**:
  - `@ui-ux-designer`: Comprueba que no se rompa la interfaz, asegura ergonomía táctil (<150ms), diseño sin CLS y aporta sugerencias de optimización visual.
  - `@student-actor`: Valida desde la perspectiva del alumno que todo funcione, cubriendo los 5 roles (`CEO`, `FINANZAS`, `TECNICO`, `OPERACIONES_IA`, `MARKETING`) y sus flujos cruzados.
  - `@teacher-evaluator`: Valida desde la perspectiva docente la recepción fluida de entregables, el Archivo Documental Central, las rúbricas y el Acta General (100%).
  - `@privacy-security`: Audita el cumplimiento estricto de la ley (RGPD, LOPDGDD, Zero-PII, prevención de XSS y seguridad de tokens) con cada mejora introducida.
## 4. Trazabilidad y Código
- **Bump de versión estricto (+0.0.01)**: Cada intervención completada por @builder debe incrementar APP_VERSION en exactamente +0.0.01 en constantes y cabeceras.
- **Novedades y Guía**: Obligatorio actualizar el changelog de novedades (#btn-novedades) y la Guía de Roles si hay cambios de flujo.
- **Guardas de DOM y Estado**: Comprobación estricta de existencia en DOM (`if (!el) return;`), fallbacks en `state.migrate()` y blindaje contra sesiones huérfanas (`state.data.companies[state.user.coId]`).
