/**
 * ====================================================================
 * MARS-KET 2.0 — MANUAL EXHAUSTIVO Y GUÍA RÁPIDA DEL CLAUSTRO DOCENTE
 * Código para Google Apps Script (motor V8)
 * Generado por @apps-script-doc-architect & @teacher-evaluator
 * Versión Oficial: v1.1.66 (Noviembre 2026)
 * ====================================================================
 * 
 * INSTRUCCIONES DE USO:
 * 1. Abre https://script.new (o tu consola de Google Apps Script).
 * 2. Pega este código completo en el archivo Code.gs (reemplazando cualquier contenido previo).
 * 3. En la barra superior, asegúrate de que esté seleccionada la función "generarManualDocenteMarsket" y pulsa "Ejecutar" (Run).
 * 4. Otorga los permisos habituales de Google Drive y DocumentApp la primera vez.
 * 5. Abre el enlace del documento generado que aparecerá en el Registro de Ejecución (Execution Log).
 * ====================================================================
 */

// 1. SISTEMA DE DISEÑO EDITORIAL Y PALETA DE COLORES INSTITUCIONAL
const MARSKET_TEACHER_THEME = {
  fonts: {
    title: 'Montserrat',
    heading: 'Montserrat',
    body: 'Inter',
    mono: 'Roboto Mono'
  },
  colors: {
    primaryDark: '#0A0F1D',    // Cosmos oscuro
    primaryNavy: '#0F172A',    // Azul marino institucional
    cyanAccent: '#0284C7',     // Cian técnico aeroespacial
    cyanDark: '#0369A1',       // Cian oscuro de alto contraste
    amberAlert: '#D97706',     // Ámbar finanzas y advertencias
    greenSuccess: '#16A34A',   // Verde validación y saldos
    crimsonDanger: '#DC2626',  // Carmesí subsanación y alertas
    textDark: '#1E293B',       // Grafito oscuro lectura
    textMuted: '#64748B',      // Gris descriptores
    cardBg: '#F8FAFC',         // Fondo neutro suave
    cardBorder: '#CBD5E1',     // Bordes de tarjetas
    tableHeaderBg: '#0F172A',  // Fondo cabeceras tablas
    tableHeaderTxt: '#FFFFFF', // Texto cabeceras tablas
    tableRowEven: '#FFFFFF',
    tableRowOdd: '#F1F5F9',
    calloutInfoBg: '#F0F9FF',
    calloutInfoBorder: '#0284C7',
    calloutWarnBg: '#FFFBEB',
    calloutWarnBorder: '#D97706',
    calloutAlertBg: '#FEF2F2',
    calloutAlertBorder: '#DC2626',
    calloutSuccessBg: '#F0FDF4',
    calloutSuccessBorder: '#16A34A'
  }
};

/**
 * Función principal que crea y maqueta el Documento Oficial para Profesores
 */
function generarManualDocenteMarsket() {
  const docTitle = "MARS-KET 2.0 — Manual Exhaustivo y Guía Rápida del Claustro Docente (v1.1.66)";
  const doc = DocumentApp.create(docTitle);
  const body = doc.getBody();

  // Configuración de página y márgenes (54 pt = 1.9 cm)
  body.setMarginTop(54);
  body.setMarginBottom(54);
  body.setMarginLeft(54);
  body.setMarginRight(54);

  setupTeacherHeaderAndFooter(doc);

  // -------------------------------------------------------------
  // PORTADA INSTITUCIONAL EXCLUSIVA DEL CLAUSTRO
  // -------------------------------------------------------------
  addTeacherCoverPage(body);
  body.appendPageBreak();

  // -------------------------------------------------------------
  // ÍNDICE Y MAPA DEL MANUAL
  // -------------------------------------------------------------
  addHeading1(body, "Estructura del Manual Docente");
  addMutedParagraph(body, "Este manual ha sido diseñado para que cualquier profesor de las 6 materias interdisciplinares pueda calificar y resolver trámites en el aula en menos de 3 minutos, sin necesidad de formación técnica previa.");

  addCallout(body,
    "LOS TRES NIVELES DE CONSULTA",
    "• NIVEL 1: Guía Rápida de 1 Página (La Rutina en 3 Clics, semáforos e indicadores 🟡 N).\n" +
    "• NIVEL 2: Fichas Específicas por Materia (FYQ, LYE, LEN, ECO, MAT, ING) con qué califica cada profesor, en qué fase y con qué porcentaje.\n" +
    "• NIVEL 3: Manual Exhaustivo de Procedimientos (Subsanaciones [↩ Subsanar], Aduanas B2B, Contratos y Coordinación TIC).",
    "info"
  );

  const tocHeaders = ["Sección / Guía Docente", "Alcance y Destinatarios"];
  const tocRows = [
    ["1. Guía Rápida de Aula (La Rutina en 3 Clics)", "Todo el profesorado (Acceso, Asistente y Semáforos)"],
    ["2. Matriz Curricular Oficial de los 18 Entregables (100%)", "Desglose por asignaturas, fases y pesos LOMLOE"],
    ["3. Fichas Específicas de Calificación por Asignatura", "FYQ (25%), LYE (40%), LEN (15%), ECO (10%), MAT (5%), ING (5%)"],
    ["4. Procedimiento de Subsanación [↩ Subsanar]", "Requerimiento docente sin notas provisionales a 0"],
    ["5. Trámites de Aduana, Licencias AESA y Mercado B2B", "Circuitos de autorización, anti-doble venta y reembolsos"],
    ["6. Liquidación de Contratos Comerciales de Fase", "Verificación de cumplimiento y recompensas en €v"],
    ["7. Manual de Coordinación y TIC (Modo TIC)", "Llavero Maestro, Catálogo PDF/CSV, Crónicas y Copias D1"]
  ];
  addStyledTable(body, tocHeaders, tocRows, [260, 244]);

  body.appendPageBreak();

  // =============================================================
  // SECCIÓN 1: GUÍA RÁPIDA DE AULA (ONE-PAGER IMPRIMIBLE)
  // =============================================================
  addHeading1(body, "1. Guía Rápida de Aula // La Rutina en 3 Clics");
  addLeadParagraph(body, "Todo lo que necesitas saber para calificar a tus grupos en menos de 3 minutos durante una sesión de clase.");

  addCallout(body,
    "CÓMO ACCEDER AL PANEL DOCENTE EN 3 PASOS",
    "1. En la pantalla principal de MARS-KET, haz doble clic (o doble toque) en el escudo central.\n" +
    "2. Introduce el Código de Autorización de Misión del centro (proporcionado por Coordinación).\n" +
    "3. Selecciona tu Asignatura (FYQ, LYE, LEN, ECO, MAT, ING) o Coordinación e introduce tu PIN de 4 dígitos.",
    "info"
  );

  addHeading2(body, "El Semáforo de Startups y los Avisos Pulsantes 🟡 N");
  addParagraph(body, "Al entrar en 📝 Rúbricas y Entregas encontrarás dos ayudas visuales inmediatas:");
  addBulletPoint(body, "Avisos Amarillos en los Filtros de Clase (🟡 N): Los botones superiores (TODAS, CLASE A a F) muestran un contador amarillo pulsante (ej. [ CLASE A ] 🟡 2) si hay startups de esa clase con entregas listas esperando tu nota.");
  addBulletPoint(body, "Semáforos en las Tarjetas de Empresa: Las empresas se identifican al instante:");
  addBulletPoint(body, "  • 🟢 Verde [ Nota: X.XX ]: La empresa ya tiene nota final registrada para tu materia.");
  addBulletPoint(body, "  • 🟡 Amarillo [ N doc(s) listos ]: Hay entregables subidos por la startup pendientes de evaluar.");
  addBulletPoint(body, "  • ⚪ Gris [ Sin entregas ]: La empresa aún no ha presentado documentos para tu asignatura.");

  addHeading2(body, "La Rutina Diaria en 3 Clics:");
  addNumberedPoint(body, 1, "Mira tu Asistente Contextual: En la parte superior de Rúbricas, el recuadro azul '¿Qué me toca hacer hoy?' detecta automáticamente tu materia y la fase en curso, explicándote qué entregable corresponde evaluar y ofreciéndote el botón [⚡ Evaluar siguiente pendiente ➔] para abrir la empresa en 1 solo clic.");
  addNumberedPoint(body, 2, "Abre el Documento y Califica: En la columna derecha de 'Evidencias Adjuntas', pulsa [ Abrir Doc ↗ ] para examinar el trabajo en Google Drive. Introduce la nota numérica de 0 a 10 en cada criterio de la rúbrica oficial (la app calcula el porcentaje automáticamente).");
  addNumberedPoint(body, 3, "Devuelve con [↩ Subsanar] si es necesario: Si el enlace está privado ('Pedir acceso') o faltan apartados, pulsa el botón rojo [↩ Subsanar] junto al documento, selecciona el motivo tipificado y la startup recibirá el aviso para corregirlo de inmediato.");

  body.appendPageBreak();

  // =============================================================
  // SECCIÓN 2: MATRIZ CURRICULAR DE LOS 18 ENTREGABLES
  // =============================================================
  addHeading1(body, "2. Matriz Curricular Oficial de los 18 Entregables (100% Ponderado)");
  addLeadParagraph(body, "Desglose oficial de las 6 materias LOMLOE, los 18 hitos evaluables, departamentos responsables y ponderación en el Acta General Oficial.");

  addCallout(body,
    "COMPOSICIÓN DEL ACTA GENERAL PONDERADA (100%)",
    "Física y Química (25%) + Liderazgo y Emprendimiento (40%) + Lengua Castellana (15%) + Economía (10%) + Matemáticas (5%) + Inglés (5%).",
    "success"
  );

  const delivHeaders = ["Materia (% Global)", "Criterio / Entregable Oficial", "Fase", "Dpto. Alumno", "Peso en Materia"];
  const delivRows = [
    ["FYQ (25%)", "1. Informe Técnico Preliminar, Boceto y Foto", "Fase I", "TÉCNICO", "10% FYQ"],
    ["FYQ (25%)", "2. Hoja Oficial de Taller, BOM y Calidad (DOC_10)", "Fase III", "TÉCNICO + OPS", "10% FYQ"],
    ["FYQ (25%)", "3. Informe Técnico Final Exhaustivo", "Fase IV", "TÉCNICO", "30% FYQ"],
    ["FYQ (25%)", "4. Prototipo Físico y Prueba de Lanzamiento", "Fases II-V", "EQUIPO", "30% FYQ (Directa)"],
    ["FYQ (25%)", "5. Media de Test de Rol y Defensa Q&A", "Fases I-IV", "EQUIPO", "20% FYQ (Directa)"],
    ["LYE (40%)", "1A. Nombre, Logo, Tagline e Imagen (Diciembre)", "Fase I", "MARKETING", "10% LYE"],
    ["LYE (40%)", "1B. Identidad de Marca y Manual (Abril)", "Fase III", "MARKETING", "10% LYE"],
    ["LYE (40%)", "2. Business Model — Documento Escrito", "Fase III", "MARKETING", "25% LYE"],
    ["LYE (40%)", "3. Business Model Canvas (Lienzo Estratégico)", "Fase IV", "MARKETING", "15% LYE"],
    ["LYE (40%)", "4A. Diario de Decisiones e IA Dic (DOC_4)", "Fase I", "OPERACIONES_IA", "10% LYE"],
    ["LYE (40%)", "4B. Diario de Decisiones e IA Abr (DOC_4)", "Fase IV", "OPERACIONES_IA", "10% LYE"],
    ["LYE (40%)", "Defensas Orales de Emprendimiento", "Fases I-V", "EQUIPO", "20% LYE (Directa)"],
    ["LEN (15%)", "1. Producción Oral (Pitch y Exposiciones)", "Fases I-V", "EQUIPO", "50% LEN (Directa)"],
    ["LEN (15%)", "2. Dossier para Inversores (Texto Argumentativo)", "Fase IV", "MARKETING", "40% LEN"],
    ["LEN (15%)", "3. Conjunto de Notas de Prensa (DOC_15, F1-F4)", "Fases I-IV", "CEO a Lengua y Coord.", "10% LEN"],
    ["ECO (10%)", "1. Presupuesto Inicial", "Fase I", "FINANZAS", "20% ECO"],
    ["ECO (10%)", "2. Presupuesto tras Presentación de Prototipo", "Fase II", "FINANZAS", "20% ECO"],
    ["ECO (10%)", "3. Balance de Situación", "Fase III", "FINANZAS", "20% ECO"],
    ["ECO (10%)", "4. Cuenta de Resultados", "Fase IV", "FINANZAS", "20% ECO"],
    ["ECO (10%)", "Test Evaluativo de Economía", "Fases I-IV", "EQUIPO", "20% ECO (Directa)"],
    ["MAT (5%)", "1. Elaboración del Goniómetro", "Fase II", "OPERACIONES_IA", "25% MAT"],
    ["MAT (5%)", "2. Informe Técnico: Distancia Fija Conocida", "Fase II", "OPERACIONES_IA", "25% MAT"],
    ["MAT (5%)", "3. Informe Técnico: Dos Mediciones Angulares", "Fase II", "OPERACIONES_IA", "25% MAT"],
    ["MAT (5%)", "4. Informe Técnico Final Comparativo", "Fase II", "OPERACIONES_IA", "25% MAT"],
    ["ING (5%)", "1. Expresión Oral (Presentación / Micro-Pitch)", "Fases I-V", "EQUIPO", "70% ING (Directa)"],
    ["ING (5%)", "2. Expresión Escrita (Fichas Técnicas)", "Fases I-IV", "EQUIPO", "30% ING (Directa)"]
  ];
  addStyledTable(body, delivHeaders, delivRows, [75, 160, 55, 110, 80]);

  body.appendPageBreak();

  // =============================================================
  // SECCIÓN 3: FICHAS ESPECÍFICAS POR ASIGNATURA
  // =============================================================
  addHeading1(body, "3. Fichas Específicas de Calificación por Asignatura");

  addHeading2(body, "🧪 Ficha 1: Física y Química (FYQ — 25% del Proyecto)");
  addParagraph(body, "Responsable: Profesor de Física y Química. Califica el diseño técnico, la experimentación química y los lanzamientos.");
  addBulletPoint(body, "Criterio 1 — Informe Preliminar (10% FYQ, Fase I): Enlace Docs entregado por Técnico. Boceto aerodinámico, dimensiones y cálculo teórico.");
  addBulletPoint(body, "Criterio 2 — Hoja Oficial de Taller DOC_10 y BOM (10% FYQ, Fase III): Diseñado por Técnico y verificado físicamente por Operaciones.");
  addBulletPoint(body, "Criterio 3 — Informe Técnico Final (30% FYQ, Fase IV): Documento exhaustivo con justificación de fluidos, centro de gravedad y apogeo.");
  addBulletPoint(body, "Criterio 4 — Prototipo Físico y Vuelo (30% FYQ, Fases II-V): Calificación directa en aula/campo basada en la estabilidad y altura real alcanzada.");
  addBulletPoint(body, "Criterio 5 — Test de Rol y Q&A (20% FYQ, Fases I-IV): Evaluación continua de conceptos teóricos y defensas del prototipo.");
  addBulletPoint(body, "Trámite en Aduana FYQ — Licencia AESA (DOC_14, 50 €v): Se solicita cuando el Informe Preliminar está entregado. En 'Validaciones y Aduana', pulsa [ Aprobar Licencia AESA ] para desbloquear el Banco de Pruebas de vuelo.");

  addHeading2(body, "💼 Ficha 2: Liderazgo y Emprendimiento (LYE — 40% del Proyecto)");
  addParagraph(body, "Responsable: Profesor de Liderazgo y Emprendimiento. Califica la viabilidad empresarial, modelo de negocio e identidad.");
  addBulletPoint(body, "Criterios 1A y 1B — Identidad de Marca (10% Dic, 10% Abr): Manual corporativo, logotipo, valores y aplicación en soportes.");
  addBulletPoint(body, "Criterio 2 — Business Model Escrito (25% LYE, Fase III): Documento formal de plan de negocio entregado por Marketing.");
  addBulletPoint(body, "Criterio 3 — Business Model Canvas (15% LYE, Fase IV): Lienzo estratégico de los 9 bloques entregado por Marketing.");
  addBulletPoint(body, "Criterios 4A y 4B — Diario de Decisiones e IA DOC_4 (10% Dic, 10% Abr): Registro ético de prompts y trazabilidad de IA entregado por Operaciones e IA.");
  addBulletPoint(body, "Defensas Orales (20% LYE, Fases I-V): Evaluación directa de pitch de emprendimiento y asambleas.");
  addBulletPoint(body, "Trámite en Aduana LYE — Fichas de Campaña (DOC_12): Revisa las creatividades publicitarias enviadas por Marketing y pulsa [ Aprobar Campaña ].");

  addHeading2(body, "📚 Ficha 3: Lengua Castellana (LEN — 15% del Proyecto)");
  addParagraph(body, "Responsable: Profesor de Lengua Castellana y Coordinación. Califica la comunicación oral, el dossier inversor y las notas de prensa.");
  addBulletPoint(body, "Criterio 1 — Producción Oral / Pitch (50% LEN, Fases I-V): Evaluación directa de la elocución, claridad argumentativa y rigor oratorio.");
  addBulletPoint(body, "Criterio 2 — Dossier para Inversores (40% LEN, Fase IV): Texto argumentativo y persuasivo entregado por Marketing en Google Docs.");
  addBulletPoint(body, "Criterio 3 — Conjunto de Notas de Prensa DOC_15 (10% LEN, Fases I-IV): Visualizador directo de los 4 comunicados de prensa redactados y publicados por el CEO de la empresa al cierre de cada fase.");

  addHeading2(body, "📈 Ficha 4: Economía (ECO — 10% del Proyecto)");
  addParagraph(body, "Responsable: Profesor de Economía. Califica la salud financiera, control presupuestario y balances.");
  addBulletPoint(body, "Criterios 1 y 2 — Presupuestos (20% Inicial en F1, 20% Post-Prototipo en F2): Hojas de cálculo en Google Sheets entregadas por Finanzas.");
  addBulletPoint(body, "Criterios 3 y 4 — Estados Contables (20% Balance en F3, 20% Cuenta de Resultados en F4): Estados de situación y rentabilidad.");
  addBulletPoint(body, "Test Evaluativo de Economía (20% ECO, Fases I-IV): Prueba de conceptos contables y tesorería evaluada directamente.");

  addHeading2(body, "📐 Ficha 5: Matemáticas (MAT — 5% del Proyecto)");
  addParagraph(body, "Responsable: Profesor de Matemáticas. Califica la trigonometría aplicada al apogeo aeroespacial durante la Fase II.");
  addBulletPoint(body, "Criterios 1 a 4 (25% cada uno, Fase II): 1. Goniómetro casero, 2. Distancia Fija, 3. Dos Mediciones Angulares, 4. Informe Comparativo Final de Altura (tangentes, triángulos y propagación de errores). Entregados por Operaciones e IA.");

  addHeading2(body, "🇬🇧 Ficha 6: Lengua Extranjera: Inglés (ING — 5% del Proyecto)");
  addParagraph(body, "Responsable: Profesor de Inglés. Califica el Micro-Pitch en inglés y las fichas técnicas corporativas.");
  addBulletPoint(body, "Expresión Oral / Micro-Pitch (70% ING, Fases I-V): Pitch oral en inglés ante posibles patrocinadores internacionales.");
  addBulletPoint(body, "Expresión Escrita (30% ING, Fases I-IV): Fichas técnicas aeroespaciales en inglés (vocabulario técnico).");

  body.appendPageBreak();

  // =============================================================
  // SECCIÓN 4: PROCEDIMIENTOS DE GESTIÓN Y ADUANA
  // =============================================================
  addHeading1(body, "4. Procedimientos de Gestión, Subsanaciones y Aduana");

  addHeading2(body, "Procedimiento de Subsanación [↩ Subsanar]");
  addParagraph(body, "Nunca califiques con un 0 una entrega que tiene los permisos cerrados o está incompleta:");
  addNumberedPoint(body, 1, "En la columna derecha de evidencias adjuntas, pulsa el botón rojo [↩ Subsanar].");
  addNumberedPoint(body, 2, "Selecciona el motivo tipificado en el desplegable (ej. 'Enlace privado sin permisos de lectura', 'Faltan apartados obligatorios de la rúbrica', 'Plantilla incorrecta').");
  addNumberedPoint(body, 3, "Pulsa Confirmar Subsanación: La plataforma marcará el documento con la etiqueta [⚠️ SUBSANACIÓN DOCENTE], alertará al CEO de la startup y abrirá de nuevo el campo para que reenvíen la URL corregida.");

  addHeading2(body, "Trámites en Aduana y Mercado B2B (Circuito Anti-Doble Venta)");
  addParagraph(body, "En la pestaña 🛃 Validaciones y Aduana, el docente supervisa:");
  addBulletPoint(body, "Compraventas B2B de 2ª Mano: El material sigue el circuito Técnico propone ➔ Finanzas aprueba ➔ Aduana valida. Al pulsar [ Aprobar Contrato B2B ], la app transfiere los €v del comprador al vendedor y deposita la pieza en su inventario.");
  addBulletPoint(body, "Blindaje Anti-Doble Venta: Si varias empresas intentaron adquirir la misma pieza única a la vez, al validar una de ellas, el sistema cancela automáticamente todas las demás solicitudes competidoras y reembolsa de inmediato el 100% de los €v en los balances de los otros compradores.");
  addBulletPoint(body, "Patrocinios de Fase I: Asignación de los premios de patrocinio (Oro +500 €v, Plata +400 €v, Bronce +250 €v, Cobre +150 €v, Colaborador +100 €v) que inyectan liquidez y reducen la factura operativa neta.");
  addBulletPoint(body, "Sanciones Disciplinarias AEE: Aplicación de expedientes por entregas tardías (Art. 12: <24h Leve -10 €v, 24-72h Moderada -100 €v, >72h Grave -200 €v) o uso no declarado de IA.");

  body.appendPageBreak();

  // =============================================================
  // SECCIÓN 5: MANUAL DE COORDINACIÓN Y TIC (MODO TIC)
  // =============================================================
  addHeading1(body, "5. Manual de Coordinación y TIC (Modo TIC)");
  addLeadParagraph(body, "Herramientas maestras reservadas a los coordinadores generales del proyecto (COORD_MARIO y COORD_ALEX) en el conmutador '⚙️ ADMINISTRACIÓN DEL CENTRO (TIC)'.");

  addHeading2(body, "Las 7 Herramientas del Panel de Coordinación:");
  addNumberedPoint(body, 1, "🚀 Startups & Llavero Maestro: Creación y reseteo de startups, regeneración de Códigos de Empresa y PINs de los 6 roles, e impresión directa de tarjetas de credenciales en PDF A4.");
  addNumberedPoint(body, 2, "⏳ Cronograma Maestro: Configuración de fechas de apertura y cierre para los 18 hitos curriculares, y gestión del Buzón de Sugerencias y Reportes de Alumnos.");
  addNumberedPoint(body, 3, "🛒 Gestión de Catálogo Oficial: Edición de stock y descarga en 1 clic del [ DESCARGAR CATÁLOGO OFICIAL PDF (SIN I+D) ] en formato vertical A4 limpio y CSV para entregar a los alumnos.");
  addNumberedPoint(body, 4, "📰 Tablón de Noticias y Crónicas AEE: Publicación de noticias oficiales con formato enriquecido (negrita, cursiva, viñetas) y generación de portadas con IA Nano Banana 3.");
  addNumberedPoint(body, 5, "🤝 Auditoría de Contratos Comerciales: Supervisión global del cumplimiento de contratos suscritos por las 30 startups en cada fase.");
  addNumberedPoint(body, 6, "🚨 Monitor de Infracciones Léxicas: Detección y moderación de intentos de introducir nombres propios, palabras ofensivas o datos personales (política Zero-PII).");
  addNumberedPoint(body, 7, "💾 Copias de Seguridad (Cloudflare D1): Exportación e importación de snapshots JSON completos de la base de datos y forzado de sincronización cloud.");

  doc.saveAndClose();
  Logger.log("====================================================================");
  Logger.log("✅ MANUAL DOCENTE GENERADO CON ÉXITO");
  Logger.log("URL de acceso: " + doc.getUrl());
  Logger.log("====================================================================");
  return doc.getUrl();
}

// -------------------------------------------------------------
// HELPERS REUTILIZABLES DE MAQUETACIÓN EDITORIAL
// -------------------------------------------------------------

function setupTeacherHeaderAndFooter(doc) {
  const header = doc.addHeader();
  const headerP = header.appendParagraph("MARS-KET 2.0 // Manual del Claustro Docente y Rúbricas Oficiales");
  headerP.setFontFamily(MARSKET_TEACHER_THEME.fonts.heading)
         .setFontSize(8.5)
         .setForegroundColor(MARSKET_TEACHER_THEME.colors.textMuted)
         .setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

  const footer = doc.addFooter();
  const footerP = footer.appendParagraph("Miravalles-El Redín • Simulación Académica LOMLOE • Protocolo Zero-Text • Documento Oficial");
  footerP.setFontFamily(MARSKET_TEACHER_THEME.fonts.body)
         .setFontSize(8.5)
         .setForegroundColor(MARSKET_TEACHER_THEME.colors.textMuted)
         .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
}

function addTeacherCoverPage(body) {
  const spacer = body.appendParagraph("");
  spacer.setSpacingBefore(120);

  const kicker = body.appendParagraph("CLAUSTRO INTERDISCIPLINAR // LOMLOE 2026-2027");
  kicker.setFontFamily(MARSKET_TEACHER_THEME.fonts.heading)
        .setFontSize(11)
        .setBold(true)
        .setForegroundColor(MARSKET_TEACHER_THEME.colors.cyanDark)
        .setSpacingAfter(10);

  const title = body.appendParagraph("MARS-KET 2.0");
  title.setFontFamily(MARSKET_TEACHER_THEME.fonts.title)
       .setFontSize(32)
       .setBold(true)
       .setForegroundColor(MARSKET_TEACHER_THEME.colors.primaryDark)
       .setSpacingAfter(6);

  const subtitle = body.appendParagraph("Manual Exhaustivo y Guía Rápida del Claustro Docente");
  subtitle.setFontFamily(MARSKET_TEACHER_THEME.fonts.heading)
          .setFontSize(16)
          .setForegroundColor(MARSKET_TEACHER_THEME.colors.textDark)
          .setSpacingAfter(16);

  const desc = body.appendParagraph("Guía integral para profesores evaluadores y coordinadores de misión: Asistente contextual '¿Qué me toca hacer hoy?', radar de misión por clases, matriz de 18 entregables LOMLOE (100% ponderado), aduana B2B y panel de coordinación TIC.");
  desc.setFontFamily(MARSKET_TEACHER_THEME.fonts.body)
      .setFontSize(10.5)
      .setForegroundColor(MARSKET_TEACHER_THEME.colors.textMuted)
      .setLineSpacing(1.35)
      .setSpacingAfter(40);

  const metaTable = body.appendTable([
    ["Destinatarios:", "Claustro Docente (FYQ, LYE, LEN, ECO, MAT, ING) y Coordinación TIC"],
    ["Centro Educativo:", "Colegio Miravalles-El Redín (Simulación Aeroespacial)"],
    ["Marco Evaluativo:", "Rúbricas LOMLOE Ponderadas (Acta General Oficial al 100%)"],
    ["Versión de App:", "MARS-KET OS v1.1.66 Oficial (Noviembre 2026)"],
    ["Protocolo:", "Política Zero-Text y Privacidad de Menores (RGPD / AEPD)"]
  ]);
  metaTable.setBorderWidth(1);
  metaTable.setBorderColor(MARSKET_TEACHER_THEME.colors.cardBorder);
  for (let r = 0; r < metaTable.getNumRows(); r++) {
    const row = metaTable.getRow(r);
    row.getCell(0).setWidth(130).setBackgroundColor(MARSKET_TEACHER_THEME.colors.cardBg);
    row.getCell(1).setWidth(340).setBackgroundColor('#FFFFFF');
    for (let c = 0; c < 2; c++) {
      const cell = row.getCell(c);
      cell.setPaddingTop(5).setPaddingBottom(5).setPaddingLeft(10).setPaddingRight(10);
      const p = cell.getChild(0).asParagraph();
      p.setFontFamily(MARSKET_TEACHER_THEME.fonts.body).setFontSize(9).setForegroundColor(MARSKET_TEACHER_THEME.colors.textDark);
      if (c === 0) p.setBold(true);
    }
  }
}

function addHeading1(body, text) {
  const p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  p.setFontFamily(MARSKET_TEACHER_THEME.fonts.heading)
   .setFontSize(17)
   .setBold(true)
   .setForegroundColor(MARSKET_TEACHER_THEME.colors.primaryDark)
   .setSpacingBefore(18)
   .setSpacingAfter(6);
  return p;
}

function addHeading2(body, text) {
  const p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  p.setFontFamily(MARSKET_TEACHER_THEME.fonts.heading)
   .setFontSize(12.5)
   .setBold(true)
   .setForegroundColor(MARSKET_TEACHER_THEME.colors.cyanDark)
   .setSpacingBefore(14)
   .setSpacingAfter(4);
  return p;
}

function addParagraph(body, text) {
  const p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.NORMAL);
  p.setFontFamily(MARSKET_TEACHER_THEME.fonts.body)
   .setFontSize(9.5)
   .setForegroundColor(MARSKET_TEACHER_THEME.colors.textDark)
   .setLineSpacing(1.3)
   .setSpacingAfter(6);
  return p;
}

function addLeadParagraph(body, text) {
  const p = body.appendParagraph(text);
  p.setFontFamily(MARSKET_TEACHER_THEME.fonts.body)
   .setFontSize(10.5)
   .setBold(true)
   .setForegroundColor(MARSKET_TEACHER_THEME.colors.primaryNavy)
   .setLineSpacing(1.3)
   .setSpacingAfter(8);
  return p;
}

function addMutedParagraph(body, text) {
  const p = body.appendParagraph(text);
  p.setFontFamily(MARSKET_TEACHER_THEME.fonts.body)
   .setFontSize(9)
   .setForegroundColor(MARSKET_TEACHER_THEME.colors.textMuted)
   .setLineSpacing(1.25)
   .setSpacingAfter(8);
  return p;
}

function addBulletPoint(body, text) {
  const item = body.appendListItem(text);
  item.setGlyphType(DocumentApp.GlyphType.BULLET);
  item.setFontFamily(MARSKET_TEACHER_THEME.fonts.body)
      .setFontSize(9)
      .setForegroundColor(MARSKET_TEACHER_THEME.colors.textDark)
      .setLineSpacing(1.25)
      .setSpacingAfter(3);
  return item;
}

function addNumberedPoint(body, num, text) {
  const item = body.appendListItem(text);
  item.setGlyphType(DocumentApp.GlyphType.NUMBER);
  item.setFontFamily(MARSKET_TEACHER_THEME.fonts.body)
      .setFontSize(9)
      .setForegroundColor(MARSKET_TEACHER_THEME.colors.textDark)
      .setLineSpacing(1.25)
      .setSpacingAfter(4);
  return item;
}

function addCallout(body, title, text, type) {
  let bgColor = MARSKET_TEACHER_THEME.colors.calloutInfoBg;
  let borderColor = MARSKET_TEACHER_THEME.colors.calloutInfoBorder;

  if (type === 'warning') {
    bgColor = MARSKET_TEACHER_THEME.colors.calloutWarnBg;
    borderColor = MARSKET_TEACHER_THEME.colors.calloutWarnBorder;
  } else if (type === 'alert') {
    bgColor = MARSKET_TEACHER_THEME.colors.calloutAlertBg;
    borderColor = MARSKET_TEACHER_THEME.colors.calloutAlertBorder;
  } else if (type === 'success') {
    bgColor = MARSKET_TEACHER_THEME.colors.calloutSuccessBg;
    borderColor = MARSKET_TEACHER_THEME.colors.calloutSuccessBorder;
  }

  const table = body.appendTable([[""]]);
  table.setBorderWidth(1.5);
  table.setBorderColor(borderColor);

  const cell = table.getCell(0, 0);
  cell.setBackgroundColor(bgColor);
  cell.setPaddingTop(8);
  cell.setPaddingBottom(8);
  cell.setPaddingLeft(12);
  cell.setPaddingRight(12);

  const p = cell.getChild(0).asParagraph();
  p.clear();

  if (title) {
    const tSpan = p.appendText(title + "\n");
    tSpan.setFontFamily(MARSKET_TEACHER_THEME.fonts.heading)
         .setFontSize(9.5)
         .setBold(true)
         .setForegroundColor(borderColor);
  }

  const bSpan = p.appendText(text);
  bSpan.setFontFamily(MARSKET_TEACHER_THEME.fonts.body)
       .setFontSize(9)
       .setForegroundColor(MARSKET_TEACHER_THEME.colors.textDark);
  p.setLineSpacing(1.25);
  
  const spacer = body.appendParagraph("");
  spacer.setSpacingAfter(6);
}

function addStyledTable(body, headers, rows, colWidths) {
  const tableData = [headers, ...rows];
  const table = body.appendTable(tableData);
  table.setBorderWidth(1);
  table.setBorderColor(MARSKET_TEACHER_THEME.colors.cardBorder);

  // Formato Cabecera
  const headerRow = table.getRow(0);
  for (let c = 0; c < headers.length; c++) {
    const cell = headerRow.getCell(c);
    cell.setBackgroundColor(MARSKET_TEACHER_THEME.colors.tableHeaderBg);
    cell.setPaddingTop(6).setPaddingBottom(6).setPaddingLeft(6).setPaddingRight(6);
    const p = cell.getChild(0).asParagraph();
    p.setFontFamily(MARSKET_TEACHER_THEME.fonts.heading)
     .setFontSize(8.5)
     .setBold(true)
     .setForegroundColor(MARSKET_TEACHER_THEME.colors.tableHeaderTxt);
  }

  // Formato Filas
  for (let r = 1; r < tableData.length; r++) {
    const row = table.getRow(r);
    const isEven = (r % 2 === 0);
    const rowBg = isEven ? MARSKET_TEACHER_THEME.colors.tableRowEven : MARSKET_TEACHER_THEME.colors.tableRowOdd;

    for (let c = 0; c < headers.length; c++) {
      const cell = row.getCell(c);
      cell.setBackgroundColor(rowBg);
      cell.setPaddingTop(4.5).setPaddingBottom(4.5).setPaddingLeft(6).setPaddingRight(6);
      const p = cell.getChild(0).asParagraph();
      p.setFontFamily(MARSKET_TEACHER_THEME.fonts.body)
       .setFontSize(8.5)
       .setForegroundColor(MARSKET_TEACHER_THEME.colors.textDark);
    }
  }

  if (colWidths && colWidths.length === headers.length) {
    for (let c = 0; c < headers.length; c++) {
      table.setColumnWidth(c, colWidths[c]);
    }
  }

  const spacer = body.appendParagraph("");
  spacer.setSpacingAfter(6);
}
