/**
 * ====================================================================
 * MARS-KET OS (v1.1.38) — FICHAS OPERATIVAS POR PERFIL DOCENTE (7 ROLES)
 * GENERADOR DE GOOGLE DOCS CON DISEÑO REAL MADRID C.F.
 * 
 * Generado por: @apps-script-doc-architect
 * Paleta Oficial: Azul Real Marino (#001A4E), Oro Corona (#D4AF37),
 *                 Blanco Puro (#FFFFFF) y Grafito (#1E293B).
 * ====================================================================
 */

// 1. DESIGN TOKENS Y CONFIGURACIÓN EDITORIAL
const THEME = {
  font: {
    heading: 'Montserrat',
    body: 'Inter',
    mono: 'Roboto Mono'
  },
  colors: {
    primary: '#001A4E',       // Azul Real Marino
    primaryLight: '#0A2D74',  // Azul Real Acento
    gold: '#D4AF37',          // Oro Corona
    goldLight: '#F5E6AB',     // Oro Suave
    text: '#1E293B',          // Gris Grafito Lectura
    textMuted: '#64748B',     // Gris Secundario
    white: '#FFFFFF',         // Blanco Puro
    border: '#CBD5E1',        // Borde Suave Tabla
    zebra: '#F8FAFC',         // Fila Alterna Tabla
    calloutWarning: {
      bg: '#FFFBEB',
      border: '#D4AF37',
      title: '#78350F',
      text: '#92400E'
    },
    calloutInfo: {
      bg: '#F0F4FF',
      border: '#001A4E',
      title: '#001A4E',
      text: '#1E293B'
    }
  },
  spacing: {
    margin: 54 // ~1.9 cm márgenes de página (ancho imprimible: 504 pt)
  }
};

/**
 * Función Principal para Ejecutar en Apps Script
 */
function generarFichasPerfilesDocentesMarsket() {
  const docTitle = "MARS-KET 2.0 (v1.1.38) — Fichas Operativas por Perfil Docente (7 Especialidades)";
  const doc = DocumentApp.create(docTitle);
  const body = doc.getBody();

  // Configuración de lienzo y márgenes
  setupPageLayout(body);
  setupHeaderFooter(doc);

  // ==================================================================
  // PÁGINA 1: PORTADA Y MAPA CURRICULAR DEL CLAUSTRO
  // ==================================================================
  addHeaderBanner(
    body,
    "MARS-KET OS // DOSSIER DE FICHAS POR PERFIL DOCENTE",
    "Guías Individualizadas por Asignatura y Coordinación TIC (v1.1.38)",
    "TERMINAL OFICIAL: WWW.PROYECTOMARSKET.ES • EVALUACIÓN COMPETENCIAL LOMLOE 100%"
  );

  addCallout(
    body,
    "📋 INSTRUCCIONES DE DISTRIBUCIÓN PARA EL CLAUSTRO",
    "Este documento contiene el mapa general del claustro seguido de 7 fichas individuales separadas por salto de página (FYQ, LYE, ECO, LEN, MAT, ING y COORD). Puedes imprimir o entregar a cada profesor únicamente la página de su especialidad.",
    "warning"
  );

  addSectionHeading(body, "Mapa Curricular, Ponderación Global y Agencias Sancionadoras", 1);
  addParagraph(body, "Al iniciar sesión con el código DOCENTE, la plataforma adapta automáticamente la rúbrica, la bandeja de recepción de documentos y la agencia sancionadora según la especialidad:");

  const mapHeaders = ["Rol", "Asignatura / Perfil", "Peso Global", "Agencia Reguladora (Sanciones)", "Entregables Drive"];
  const mapRows = [
    ["FYQ", "Física y Química", "25%", "Agencia Estatal de Seguridad Aérea (AESA)", "3 entregables (Técnico / Oper.)"],
    ["LYE", "Liderazgo y Emprend.", "40%", "Comisión Nal. Mercados y Competencia (CNMC)", "6 entregables + Acciones DOC_12"],
    ["LEN", "Lengua Castellana", "15%", "Ministerio de Justicia", "1 entregable (Dossier Inversores)"],
    ["ECO", "Economía", "10%", "Ministerio de Hacienda", "4 entregables (Finanzas)"],
    ["MAT", "Matemáticas", "5%", "Agencia Espacial Española (AEE)", "4 entregables (Técnico)"],
    ["ING", "Inglés", "5%", "Asuntos Internos", "Evaluación directa oral y escrita"],
    ["COORD", "Coordinación y TIC", "100% (Acta)", "Tribunal Supremo de la AEE", "Supervisión de los 19 entregables"]
  ];
  addStyledTable(body, mapHeaders, mapRows, [55, 115, 65, 155, 114]);

  addSectionHeading(body, "Procedimiento Común de Acceso (Todos los Perfiles)", 2);
  addCheckItem(body, "Paso 1: Terminal Oficial", "Entra en https://www.proyectomarsket.es, escribe DOCENTE en el campo de código y pulsa [ VALIDAR CÓDIGO ].");
  addCheckItem(body, "Paso 2: Especialidad y PIN", "Selecciona tu código de asignatura (FYQ, LYE, ECO, LEN, MAT, ING o COORD) e introduce tu PIN de 4 dígitos.");
  addCheckItem(body, "Paso 3: Botón [ ↩ Subsanar ]", "Si cualquier entregable de Google Drive está incompleto o sin permisos de lectura, pulsa [ ↩ Subsanar ] junto al enlace y elige el motivo oficial para devolverlo al alumno y a su CEO.");

  // ==================================================================
  // FICHA 1: FÍSICA Y QUÍMICA (FYQ)
  // ==================================================================
  body.appendPageBreak();
  addProfileHeader(body, "🧪 FICHA DOCENTE 1 // FÍSICA Y QUÍMICA (ROL: FYQ)", "Peso en Nota Global del Proyecto: 25% • Agencia Sancionadora: AESA");

  addSectionHeading(body, "1. Tu Rúbrica Oficial y Entregables Vinculados (📝 Rúbricas y Entregas)", 1);
  const fyqHeaders = ["Criterio de Evaluación", "Peso FYQ", "Evidencia / Entregable en Drive", "Rol Autor"];
  const fyqRows = [
    ["1. Informe Preliminar, Boceto y Foto", "10%", "1. Informe Técnico Preliminar (Diciembre)", "Técnico"],
    ["2. Hoja Oficial de Taller, BOM y Calidad", "10%", "3. Hoja de Taller BOM (DOC_10 - Abril)", "Operaciones / IA"],
    ["3. Informe Técnico Final Exhaustivo", "30%", "2. Informe Técnico Final (DOC_4 - Abril)", "Técnico"],
    ["4. Prototipo Físico y Lanzamiento", "30%", "Evaluación directa en campo de vuelo y Banco I+D", "Equipo Completo"],
    ["5. Media de Test Rol y Defensa Q&A", "20%", "Prueba individual y defensa técnica oral", "Individual / Equipo"]
  ];
  addStyledTable(body, fyqHeaders, fyqRows, [160, 55, 199, 90]);

  addSectionHeading(body, "2. Tus Funciones Específicas en 🛃 Validaciones y Aduana", 1);
  addCheckItem(body, "Bandeja de Recepción FyQ", "En la parte superior de Validaciones y Aduana dispones de una tabla exclusiva que lista en tiempo real todas las Hojas de Taller (DOC_10) e informes técnicos visados por el CEO.");
  addCheckItem(body, "Aduana de Piezas Especiales (I+D)", "Cuando un Director Técnico solicita un material fuera de catálogo, revisa su memoria técnica en Drive, comprueba la seguridad física, asígnale un precio en €v y pulsa [ Aprobar ].");
  addCheckItem(body, "Requerir Subsanación Técnica", "Si detectas cálculos erróneos de propulsión o falta de unidades del Sistema Internacional, pulsa [ ↩ Subsanar ] junto al entregable para devolverlo con alerta urgente.");
  addCheckItem(body, "Sanciones como AESA", "Pulsa [ Sancionar AEE ] en la fila de una startup para imponer multas por incumplimiento de seguridad en taller, fugas de presión o negligencia en el lanzamiento.");

  // ==================================================================
  // FICHA 2: LIDERAZGO Y EMPRENDIMIENTO (LYE)
  // ==================================================================
  body.appendPageBreak();
  addProfileHeader(body, "💼 FICHA DOCENTE 2 // LIDERAZGO Y EMPRENDIMIENTO (ROL: LYE)", "Peso en Nota Global del Proyecto: 40% • Agencia Sancionadora: CNMC");

  addSectionHeading(body, "1. Tu Rúbrica Oficial y Entregables Vinculados (📝 Rúbricas y Entregas)", 1);
  const lyeHeaders = ["Criterio de Evaluación", "Peso LYE", "Evidencia / Entregable en Drive", "Rol Autor"];
  const lyeRows = [
    ["1. Identidad y Misión Diciembre", "10%", "1A. Nombre, Logo, Tagline e Imagen (Diciembre)", "Marketing"],
    ["2. Identidad y Misión Abril", "10%", "1B. Consolidación de Marca (Abril)", "Marketing"],
    ["3. Business Model Escrito", "25%", "2. Business Model — Documento Escrito (Abril)", "Marketing"],
    ["4. Business Model Canvas", "15%", "3. Business Model Canvas — Lienzo 9 bloques (Abril)", "Marketing"],
    ["5. Diario Decisiones e IA Diciembre", "10%", "4A. Diario / Bitácora de Decisiones e IA (DOC_4 - Dic)", "Operaciones / IA"],
    ["6. Diario Decisiones e IA Abril", "10%", "4B. Diario / Bitácora de Decisiones e IA (DOC_4 - Abr)", "Operaciones / IA"],
    ["7. Defensas Orales", "20%", "Exposiciones ejecutivas y defensa de modelo de negocio", "Equipo Completo"]
  ];
  addStyledTable(body, lyeHeaders, lyeRows, [155, 55, 204, 90]);

  addSectionHeading(body, "2. Tus Funciones Específicas en 🛃 Validaciones y Aduana", 1);
  addCheckItem(body, "Bandeja de Acciones Publicitarias (DOC_12)", "Cuentas con un panel exclusivo que recibe todas las acciones comerciales (Posts, Reels, Pósters, Cuñas, Notas de Prensa) ejecutadas por Marketing dentro de sus paquetes de campaña y visadas por su CEO.");
  addCheckItem(body, "Auditoría Ética de IA", "Verifica en los entregables 4A y 4B que el departamento de Operaciones e IA haya registrado los prompts utilizados y su revisión crítica.");
  addCheckItem(body, "Devolución [ ↩ Subsanar ]", "Si un Canvas o Business Model carece de justificación estratégica, devuélvelo desde la rúbrica con motivo tipificado.");
  addCheckItem(body, "Sanciones como CNMC", "Pulsa [ Sancionar AEE ] para multar prácticas de publicidad engañosa, colusión de precios en el mercado B2B o incumplimiento de gobernanza.");

  // ==================================================================
  // FICHA 3: ECONOMÍA (ECO)
  // ==================================================================
  body.appendPageBreak();
  addProfileHeader(body, "💰 FICHA DOCENTE 3 // ECONOMÍA (ROL: ECO)", "Peso en Nota Global del Proyecto: 10% • Agencia Sancionadora: Ministerio de Hacienda");

  addSectionHeading(body, "1. Tu Rúbrica Oficial y Entregables Vinculados (📝 Rúbricas y Entregas)", 1);
  const ecoHeaders = ["Criterio de Evaluación", "Peso ECO", "Evidencia / Entregable en Drive", "Rol Autor"];
  const ecoRows = [
    ["1. Test Evaluación", "20%", "Prueba teórica/práctica individual de conceptos financieros", "Individual"],
    ["2. Presupuesto Inicial", "20%", "1. Presupuesto Inicial y Viabilidad (DOC_2 - Diciembre)", "Finanzas"],
    ["3. Cuenta de Resultados", "20%", "2. Cuenta de Pérdidas y Ganancias (Noviembre)", "Finanzas"],
    ["4. Presupuesto Post-Prototipo", "20%", "3. Presupuesto Recalculado tras Prototipo (Enero)", "Finanzas"],
    ["5. Balance de Situación", "20%", "4. Balance de Situación Final Cerrado (Abril)", "Finanzas"]
  ];
  addStyledTable(body, ecoHeaders, ecoRows, [155, 55, 204, 90]);

  addSectionHeading(body, "2. Tus Funciones Específicas en 🛃 Validaciones y Aduana", 1);
  addCheckItem(body, "Auditoría del Libro Mayor (Drill-down)", "En la tabla AEE & Finanzas, haz clic directamente sobre la cifra de Gasto Virtual (€v) de cualquier empresa para inspeccionar línea por línea sus compras B2C, paquetes de marketing, ventas B2B y multas.");
  addCheckItem(body, "Control de Coste Real (€) y Tickets", "Contrasta la columna de Inversión Física (€) respaldada por tickets reales de tienda (DOC_8) con las partidas anotadas por el Director Financiero.");
  addCheckItem(body, "Devolución Contable [ ↩ Subsanar ]", "Si el Balance no cuadra con el Libro Mayor de la aplicación, pulsa [ ↩ Subsanar ] seleccionando «Discrepancia entre datos de la app y el documento adjunto».");
  addCheckItem(body, "Sanciones como Ministerio de Hacienda", "Pulsa [ Sancionar AEE ] para multar desfases contables, compras físicas sin ticket justificativo o insolvencia patrimonial.");

  // ==================================================================
  // FICHA 4: LENGUA CASTELLANA Y LITERATURA (LEN)
  // ==================================================================
  body.appendPageBreak();
  addProfileHeader(body, "✍️ FICHA DOCENTE 4 // LENGUA CASTELLANA (ROL: LEN)", "Peso en Nota Global del Proyecto: 15% • Agencia Sancionadora: Ministerio de Justicia");

  addSectionHeading(body, "1. Tu Rúbrica Oficial y Entregables Vinculados (📝 Rúbricas y Entregas)", 1);
  const lenHeaders = ["Criterio de Evaluación", "Peso LEN", "Evidencia / Entregable en Drive", "Rol Autor"];
  const lenRows = [
    ["1. Producción Oral", "50%", "Oratoria, dicción, estructura argumentativa y defensa en el Pitch", "Equipo Completo"],
    ["2. Producción Escrita (Dossier Inversores)", "50%", "1. Dossier para Inversores — Texto Argumentativo (DOC_6 - Abril)", "Marketing / CEO"]
  ];
  addStyledTable(body, lenHeaders, lenRows, [160, 55, 199, 90]);

  addSectionHeading(body, "2. Tus Funciones Específicas de Supervisión Lingüística", 1);
  addCheckItem(body, "Auditoría del Dossier para Inversores", "En el panel derecho de Rúbricas y Entregas, abre el enlace de Google Drive del Dossier para Inversores (DOC_6) una vez visado por el CEO.");
  addCheckItem(body, "Inspección Transversal de Dossiers", "Desde el botón superior [ 📁 Inspeccionar Dossiers ], puedes revisar en modo lectura la calidad ortográfica y de redacción de cualquiera de los 19 entregables de la empresa.");
  addCheckItem(body, "Exigencia de Corrección Formal [ ↩ Subsanar ]", "Si el Dossier contiene faltas de ortografía o incoherencias graves de registro formal, pulsa [ ↩ Subsanar ] para obligar al equipo a reescribirlo antes de su calificación definitiva.");
  addCheckItem(body, "Sanciones como Ministerio de Justicia", "Pulsa [ Sancionar AEE ] en Validaciones y Aduana para penalizar incorrecciones lingüísticas graves en comunicados oficiales o vulneración de normas de citación.");

  // ==================================================================
  // FICHA 5: MATEMÁTICAS (MAT)
  // ==================================================================
  body.appendPageBreak();
  addProfileHeader(body, "📐 FICHA DOCENTE 5 // MATEMÁTICAS (ROL: MAT)", "Peso en Nota Global del Proyecto: 5% • Agencia Sancionadora: Agencia Espacial Española (AEE)");

  addSectionHeading(body, "1. Tu Rúbrica Oficial y Entregables Vinculados (📝 Rúbricas y Entregas)", 1);
  const matHeaders = ["Criterio de Evaluación", "Peso MAT", "Evidencia / Entregable en Drive", "Rol Autor"];
  const matRows = [
    ["1. Elaboración de Goniómetro/s", "25%", "4. Goniómetro: Evidencia de Construcción y Calibración (Febrero)", "Técnico"],
    ["2. Informe Distancia Conocida", "25%", "1. Informe Empírico de Distancia Conocida (DOC_10 - Febrero)", "Técnico"],
    ["3. Informe Dos Mediciones (Dos Puntos)", "25%", "2. Informe de Triangulación con Dos Observadores (DOC_10 - Feb)", "Técnico"],
    ["4. Informe Técnico Final Comparativo", "25%", "3. Informe Comparativo de Modelos y Error Relativo (DOC_10 - Feb)", "Técnico"]
  ];
  addStyledTable(body, matHeaders, matRows, [160, 55, 199, 90]);

  addSectionHeading(body, "2. Tus Funciones Específicas de Verificación Trigonométrica", 1);
  addCheckItem(body, "Revisión de los 4 Informes Empíricos", "En la vista de Rúbricas y Entregas encontrarás a la derecha los 4 enlaces de Google Drive entregados por el Director Técnico y visados por el CEO.");
  addCheckItem(body, "Contraste de Apogeo y Trigonometría", "Verifica la exactitud de las razones trigonométricas, el cálculo de alturas y la estimación del margen de error entre el método de una distancia y el de dos puntos.");
  addCheckItem(body, "Devolución por Errores de Cálculo [ ↩ Subsanar ]", "Si las fórmulas o mediciones angulares presentan errores metodológicos, pulsa [ ↩ Subsanar ] para que el Director Técnico recalcule y actualice el documento.");
  addCheckItem(body, "Sanciones como Agencia Espacial Española (AEE)", "Pulsa [ Sancionar AEE ] para penalizar la manipulación de datos empíricos de telemetría o la ausencia de rigor métrico.");

  // ==================================================================
  // FICHA 6: INGLÉS (ING)
  // ==================================================================
  body.appendPageBreak();
  addProfileHeader(body, "🌐 FICHA DOCENTE 6 // INGLÉS (ROL: ING)", "Peso en Nota Global del Proyecto: 5% • Agencia Sancionadora: Asuntos Internos");

  addSectionHeading(body, "1. Tu Rúbrica Oficial de Evaluación Directa (📝 Rúbricas y Entregas)", 1);
  const ingHeaders = ["Criterio de Evaluación", "Peso ING", "Modalidad de Evaluación", "Destinatarios"];
  const ingRows = [
    ["1. Expresión Oral (Presentación)", "70%", "Defensa oral en inglés (International Pitch), pronunciación y fluidez", "Equipo Completo"],
    ["2. Redacciones Escritas", "30%", "Executive Summary, Abstracts técnicos y eslóganes internacionales", "Equipo / Roles"]
  ];
  addStyledTable(body, ingHeaders, ingRows, [160, 55, 199, 90]);

  addSectionHeading(body, "2. Operativa Ágil en el Terminal Docente", 1);
  addCheckItem(body, "Calificación 100% Directa sin Bloqueos", "Tu asignatura no depende del desbloqueo previo de archivos en la Bóveda: puedes introducir las notas (0 a 10) en cualquier momento directamente en el panel izquierdo de la rúbrica.");
  addCheckItem(body, "Feedback Formativo en Lengua Inglesa", "Escribe tus observaciones sobre gramática, vocabulario técnico aeroespacial y puesta en escena en el cuadro de Feedback Docente y pulsa [ REGISTRAR CALIFICACIÓN ].");
  addCheckItem(body, "Consulta de Dossiers", "Desde [ 📁 Inspeccionar Dossiers ] puedes verificar el uso de terminología internacional en los documentos estratégicos de cada startup.");
  addCheckItem(body, "Sanciones como Asuntos Internos", "En [ 🛃 Validaciones y Aduana ], pulsa [ Sancionar AEE ] ante el uso abusivo de traducción automática sin revisión o incumplimiento de los estándares bilingües.");

  // ==================================================================
  // FICHA 7: COORDINACIÓN GENERAL Y TIC (COORD)
  // ==================================================================
  body.appendPageBreak();
  addProfileHeader(body, "🎖️ FICHA DOCENTE 7 // COORDINACIÓN GENERAL Y TIC (ROL: COORD)", "Control Global: 100% del Acta Ponderada • Agencia: Tribunal Supremo de la AEE");

  addSectionHeading(body, "1. Funciones Exclusivas en 🏫 MODO AULA", 1);
  addCheckItem(body, "Acta General Ponderada (100%) y CSV", "En [ 📝 Rúbricas y Entregas ], usa el selector superior izquierdo para visualizar la matriz global (25% FYQ + 40% LYE + 15% LEN + 10% ECO + 5% MAT + 5% ING), auditar el Archivo Documental Central o calificar cualquier materia. Pulsa [ Exportar Acta Ponderada CSV ] para descargar las notas oficiales.");
  addCheckItem(body, "Registro Mercantil de Slogans (DOC_11)", "En la cabecera de [ 🛃 Validaciones y Aduana ], revisa las propuestas de lema avaladas por los CEOs y pulsa [ ✅ APROBAR Y PUBLICAR SLOGAN ] para proyectarlo en el HUD de la empresa.");
  addCheckItem(body, "Inyección de los 5 Niveles de Patrocinio", "Pulsa [ Patrocinar ] en la fila de cualquier startup para otorgar premios financieros (ORO 500 €v, PLATA 400 €v, BRONCE 250 €v, COBRE 150 €v o COLABORADOR 100 €v) con logotipo en su HUD.");
  addCheckItem(body, "Denominación Social (DOC_1) y Rol Auxiliar", "Autoriza o deniega las solicitudes de cambio de nombre corporativo y la habilitación del 6º integrante (Auxiliar).");

  addSectionHeading(body, "2. Las 6 Herramientas de ⚙️ ADMINISTRACIÓN DEL CENTRO (TIC)", 1);
  const coordHeaders = ["Pestaña TIC", "Operativa Maestra de Coordinación"];
  const coordRows = [
    ["🚀 Startups & PINs", "Crea startups por clase (A-F), consulta el Llavero Maestro de PINs de 4 dígitos, regenera claves en 1 clic y pulsa [ Imprimir Tarjetas de Credenciales ] para repartirlas en papel."],
    ["⏳ Cronograma Maestro", "Fija las fechas de apertura, fechas de cierre (deadlines) y enlaces a las plantillas oficiales de Google Docs de los 19 entregables. Gestiona el Buzón de Sugerencias."],
    ["💾 Copias de Seguridad (D1)", "Descarga backups completos en .JSON, restaura estados previos, fuerza la sincronización Cloud D1 o ejecuta el Reinicio Transaccional de Simulación."],
    ["🚨 Infracciones Léxicas & HR", "Atiende los Partes de Inactividad (DOC_2) abiertos contra alumnos absentistas y audita las alertas del cortafuegos Zero-PII."],
    ["📈 Telemetría y Accesos", "Inspecciona la Matriz de Conexiones por rol para detectar al instante alumnos que no entran a la plataforma y revisa los últimos 100 eventos tácticos."],
    ["🛒 Gestión Catálogo", "Modifica precios de componentes en tiempo real para simular inflación o añade nuevos materiales al SUPERMARS-KET con categoría y país de origen."]
  ];
  addStyledTable(body, coordHeaders, coordRows, [140, 364]);

  doc.saveAndClose();
  Logger.log("✅ Dossier de 7 Fichas Docentes creado exitosamente: " + doc.getUrl());
  return doc.getUrl();
}

// ====================================================================
// HELPERS DE MAQUETACIÓN Y FORMATO (MOTOR V8 — LIBRE DE ERRORES)
// ====================================================================

function setupPageLayout(body) {
  body.setMarginTop(THEME.spacing.margin);
  body.setMarginBottom(THEME.spacing.margin);
  body.setMarginLeft(THEME.spacing.margin);
  body.setMarginRight(THEME.spacing.margin);
}

function setupHeaderFooter(doc) {
  const header = doc.addHeader();
  const headerPara = header.appendParagraph("MARS-KET 2.0 // FICHAS OPERATIVAS POR PERFIL DOCENTE • CURSO 2026-2027");
  headerPara.setFontFamily(THEME.font.heading);
  headerPara.setFontSize(8);
  headerPara.setForegroundColor(THEME.colors.textMuted);
  headerPara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  headerPara.setSpacingAfter(4);

  const footer = doc.addFooter();
  const footerPara = footer.appendParagraph("Claustro Docente MARS-KET 2.0 • Terminal Oficial: www.proyectomarsket.es • Marco Curricular LOMLOE");
  footerPara.setFontFamily(THEME.font.body);
  footerPara.setFontSize(8.5);
  footerPara.setForegroundColor(THEME.colors.textMuted);
  footerPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
}

function addHeaderBanner(body, mainTitle, subTitle, goldTag) {
  const table = body.appendTable([
    [mainTitle + "\n" + subTitle]
  ]);
  table.setColumnWidth(0, 504);
  table.setBorderColor(THEME.colors.gold);
  table.setBorderWidth(2);

  const cell = table.getCell(0, 0);
  cell.setBackgroundColor(THEME.colors.primary);
  cell.setPaddingTop(14);
  cell.setPaddingBottom(14);
  cell.setPaddingLeft(18);
  cell.setPaddingRight(18);

  const para = cell.getChild(0).asParagraph();
  para.setFontFamily(THEME.font.heading);
  para.setFontSize(14);
  para.setForegroundColor(THEME.colors.white);
  para.setBold(true);
  para.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  const subPara = cell.appendParagraph(goldTag);
  subPara.setFontFamily(THEME.font.heading);
  subPara.setFontSize(8.5);
  subPara.setForegroundColor(THEME.colors.gold);
  subPara.setBold(true);
  subPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  subPara.setSpacingBefore(5);

  body.appendParagraph("").setSpacingAfter(6);
}

function addProfileHeader(body, profileTitle, profileMeta) {
  const table = body.appendTable([[profileTitle]]);
  table.setColumnWidth(0, 504);
  table.setBorderColor(THEME.colors.gold);
  table.setBorderWidth(1.5);

  const cell = table.getCell(0, 0);
  cell.setBackgroundColor(THEME.colors.primary);
  cell.setPaddingTop(10);
  cell.setPaddingBottom(10);
  cell.setPaddingLeft(14);
  cell.setPaddingRight(14);

  const para = cell.getChild(0).asParagraph();
  para.setFontFamily(THEME.font.heading);
  para.setFontSize(12.5);
  para.setForegroundColor(THEME.colors.white);
  para.setBold(true);

  const metaPara = cell.appendParagraph(profileMeta);
  metaPara.setFontFamily(THEME.font.heading);
  metaPara.setFontSize(8.5);
  metaPara.setForegroundColor(THEME.colors.gold);
  metaPara.setBold(true);
  metaPara.setSpacingBefore(3);

  body.appendParagraph("").setSpacingAfter(4);
}

function addSectionHeading(body, text, level) {
  const heading = body.appendParagraph(text);
  heading.setFontFamily(THEME.font.heading);
  heading.setBold(true);

  if (level === 1) {
    heading.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    heading.setFontSize(12);
    heading.setForegroundColor(THEME.colors.primary);
    heading.setSpacingBefore(12);
    heading.setSpacingAfter(4);
  } else if (level === 2) {
    heading.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    heading.setFontSize(10.5);
    heading.setForegroundColor(THEME.colors.primaryLight);
    heading.setSpacingBefore(8);
    heading.setSpacingAfter(3);
  }
}

function addParagraph(body, text) {
  const p = body.appendParagraph(text);
  p.setFontFamily(THEME.font.body);
  p.setFontSize(9);
  p.setForegroundColor(THEME.colors.text);
  p.setLineSpacing(1.15);
  p.setSpacingAfter(4);
  return p;
}

function addCheckItem(body, title, desc) {
  const p = body.appendParagraph("");
  p.setFontFamily(THEME.font.body);
  p.setFontSize(9);
  p.setSpacingBefore(2);
  p.setSpacingAfter(2.5);
  p.setLineSpacing(1.15);

  const check = p.appendText("☐ ");
  check.setFontFamily(THEME.font.mono);
  check.setBold(true);
  check.setForegroundColor(THEME.colors.gold);

  const strongTitle = p.appendText(title + ": ");
  strongTitle.setBold(true);
  strongTitle.setForegroundColor(THEME.colors.primary);

  const descText = p.appendText(desc);
  descText.setBold(false);
  descText.setForegroundColor(THEME.colors.text);
}

function addCallout(body, title, text, type) {
  const cfg = type === 'warning' ? THEME.colors.calloutWarning : THEME.colors.calloutInfo;
  const table = body.appendTable([[""]]);
  table.setColumnWidth(0, 504);
  table.setBorderColor(cfg.border);
  table.setBorderWidth(1.5);

  const cell = table.getCell(0, 0);
  cell.setBackgroundColor(cfg.bg);
  cell.setPaddingTop(7);
  cell.setPaddingBottom(7);
  cell.setPaddingLeft(12);
  cell.setPaddingRight(12);

  const titlePara = cell.getChild(0).asParagraph();
  titlePara.setText(title);
  titlePara.setFontFamily(THEME.font.heading);
  titlePara.setFontSize(9);
  titlePara.setBold(true);
  titlePara.setForegroundColor(cfg.title);
  titlePara.setSpacingAfter(2);

  const textPara = cell.appendParagraph(text);
  textPara.setFontFamily(THEME.font.body);
  textPara.setFontSize(8.5);
  textPara.setForegroundColor(cfg.text);
  textPara.setLineSpacing(1.15);

  body.appendParagraph("").setSpacingAfter(4);
}

function addStyledTable(body, headers, rows, colWidths) {
  const tableData = [headers, ...rows];
  const table = body.appendTable(tableData);
  table.setBorderColor(THEME.colors.border);
  table.setBorderWidth(0.75);

  colWidths.forEach((w, idx) => {
    table.setColumnWidth(idx, w);
  });

  const headerRow = table.getRow(0);
  for (let c = 0; c < headers.length; c++) {
    const cell = headerRow.getCell(c);
    cell.setBackgroundColor(THEME.colors.primary);
    cell.setPaddingTop(5);
    cell.setPaddingBottom(5);
    cell.setPaddingLeft(6);
    cell.setPaddingRight(6);

    const para = cell.getChild(0).asParagraph();
    para.setFontFamily(THEME.font.heading);
    para.setFontSize(8.5);
    para.setBold(true);
    para.setForegroundColor(THEME.colors.white);
  }

  for (let r = 1; r < tableData.length; r++) {
    const row = table.getRow(r);
    const isEven = r % 2 === 0;
    const bg = isEven ? THEME.colors.zebra : THEME.colors.white;

    for (let c = 0; c < headers.length; c++) {
      const cell = row.getCell(c);
      cell.setBackgroundColor(bg);
      cell.setPaddingTop(4.5);
      cell.setPaddingBottom(4.5);
      cell.setPaddingLeft(6);
      cell.setPaddingRight(6);

      const para = cell.getChild(0).asParagraph();
      para.setFontFamily(THEME.font.body);
      para.setFontSize(8);
      para.setForegroundColor(THEME.colors.text);

      if (c === 0) {
        para.setBold(true);
        para.setForegroundColor(THEME.colors.primary);
      }
    }
  }

  body.appendParagraph("").setSpacingAfter(5);
}
