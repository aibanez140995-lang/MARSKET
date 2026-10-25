# Workflow: Ciclo Completo de Desarrollo y Validación
1. **Fase 0: Viabilidad y Adecuación (Orchestrator)**
   - Evaluación contra el código real y el estándar premium. Convocatoria de consultores si fueron solicitados.
2. **Fase 1: Planificación Técnica (Orchestrator)**
   - Plan de Acción Técnico con archivos afectados, migraciones y contratos de datos.
3. **Fase 2: Construcción (Builder)**
   - Modificación directa en disco con guardas de DOM, bump +0.0.01 y actualización de Novedades y Guía.
4. **Fase 3: Auditoría Paralela (Núcleo Cíclico Obligatorio)**
   - @qa-validator (integridad técnica y persistencia).
   - @user-tester (flujos interdepartamentales y cadenas de aprobación).
   - @domain-auditor (rigor científico y pedagógico).
   - *Si fueron solicitados expresamente:* @ui-ux-designer y @privacy-security.
5. **Fase 4: Consolidación o Corrección**
   - Con [PASS] unánime: @orchestrator certifica la entrega.
   - Con algún [REJECT]: reenvío a @builder con el fallo exacto (máximo 3 ciclos; al tercero [HALT_HUMANO]).
