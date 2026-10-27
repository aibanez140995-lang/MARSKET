/**
 * ====================================================================
 * MARS-KET OS (v1.1.38) — MANUAL OPERATIVO PARA EL CLAUSTRO DOCENTE
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
function generarManualDocenteMarsket() {
  const docTitle = "MARS-KET 2.0 (v1.1.38) — Manual del Claustro Docente y Coordinación";
  const doc = DocumentApp.create(docTitle);
  const body = doc.getBody();

  // Configuración de lienzo y márgenes
  setupPageLayout(body);
  setupHeaderFooter(doc);

  // Portada / Encabezado Principal
  addHeaderBanner(body);

  // Alerta Institucional / Restricción de Acceso
  addCallout(
    body,
    "🔒 ACCESO EXCLUSIVO AL CLAUSTRO DOCENTE Y COORDINACIÓN TIC",
    "Este terminal está restringido al profesorado evaluador y auditores de la Agencia Espacial Escolar (AEE). Opera bajo la directiva de minimización de datos (RGPD Art. 13): todas las calificaciones, sanciones y devoluciones se ejecutan mediante motivos tipificados y enlaces de Google Drive sin recogida de PII.",
    "warning"
  );

  // Sección 1: Acceso y Navegación Superior
  addSectionHeading(body, "1. Acceso al Terminal Docente y Navegación Superior", 1);
  addParagraph(body, "El profesorado accede al sistema mediante un procedimiento simplificado en 2 pasos:");
  addCheckItem(body, "Paso 1: Validación Institucional", "Entra en https://www.proyectomarsket.es, escribe DOCENTE (o ADMIN) en el campo de código y pulsa [ VALIDAR CÓDIGO ].");
  addCheckItem(body, "Paso 2: Especialidad y PIN", "Selecciona tu materia en el desplegable (FYQ, ECO, LYE, LEN, MAT, ING o COORD) e introduce tu PIN de 4 dígitos.");
  addCheckItem(body, "Barra Superior de Navegación", "Desde cualquier punto puedes alternar entre [ 🎖️ Centro de Mando ] (gestión docente), [ 🛒 Inspeccionar Mercado ] (SUPERMARS-KET y B2B) y [ 📁 Inspeccionar Dossiers ] (consulta de los 19 entregables y notas de cada empresa).");

  // Sección 2: Matriz de Permisos (Docente vs Coordinación)
  addSectionHeading(body, "2. Estructura Jerárquica: Docente de Materia vs. Coordinación", 1);
  addParagraph(body, "La plataforma separa las responsabilidades de aula de la gestión técnica del centro para evitar saturación visual:");

  const permHeaders = ["Área de Control", "🧑‍🏫 Docente Especialista (Materia)", "🎖️ Coordinación General (COORD)"];
  const permRows = [
    ["Interfaz Visible", "🏫 MODO AULA (2 pestañas prioritarias y directas).", "Doble Modo: conmutador superior entre MODO AULA y ADMINISTRACIÓN TIC."],
    ["Evaluación y Rúbricas", "Acceso exclusivo a la rúbrica oficial de su asignatura (0-10) y devolución [ ↩ Subsanar ].", "Acceso a todas las rúbricas, visualización del Acta General Ponderada (100%) y exportación CSV."],
    ["Cronograma y Plazos", "Modificación granular de la fecha límite (deadline) de su propio entregable.", "Panel Maestro de Cronograma: fechas de apertura, cierre y URLs de plantillas de los 19 entregables."],
    ["Aduana y Validaciones", "Recepción de entregables técnicos de su materia y emisión de multas AEE sectoriales.", "Aprobación de Slogans (DOC_11), cambios de nombre (DOC_1), roles auxiliares y asignación de Patrocinios."],
    ["Administración TIC", "Oculto para máxima concentración docente.", "Llavero Maestro de PINs, impresión de credenciales, Catálogo de precios, Telemetría, Alertas HR y Backups D1."]
  ];
  addStyledTable(body, permHeaders, permRows, [110, 194, 200]);

  // Sección 3: Modo Aula (Calificación Diaria)
  addSectionHeading(body, "3. Modo Aula: Las 2 Pestañas de Gestión Diaria", 1);
  addParagraph(body, "El profesorado especialista trabaja en un entorno de dos pestañas diseñado para la evaluación ágil en clase:");

  addSectionHeading(body, "Pestaña A: 📝 Rúbricas y Entregas (Módulo Calificador)", 2);
  addParagraph(body, "Es el motor central de evaluación continua ponderada según el marco curricular LOMLOE:");
  addCheckItem(body, "Filtro de Grupo y Startup", "Filtra por clase (Clase A hasta F) y selecciona la empresa en el desplegable para cargar su expediente.");
  addCheckItem(body, "Bloque Izquierdo (Rúbrica Oficial)", "Muestra los criterios ponderados de tu materia. Introduce la nota numérica (0 a 10) en cada casilla y redacta la observación pedagógica.");
  addCheckItem(body, "Bloque Derecho (Evidencias Drive)", "Presenta los documentos oficiales visados y elevados por el CEO de la startup con botón directo [ Abrir Doc ↗ ].");
  addCheckItem(body, "Circuito [ ↩ Subsanar ] (Novedad v1.1.38)", "Si el documento tiene errores graves o permisos cerrados, pulsa [ ↩ Subsanar ] y selecciona un motivo tipificado (CEO_RETURN_REASONS). La app marcará el entregable como [⚠️ SUBSANACIÓN DOCENTE] y enviará notificación urgente al alumno emisor y al CEO.");
  addCheckItem(body, "Acta Ponderada 100% (Solo Coordinación)", "En el selector superior, Coordinación puede abrir el Acta General (25% FYQ + 40% LYE + 15% LEN + 10% ECO + 5% MAT + 5% ING) y pulsar [ Exportar Acta Ponderada CSV ].");

  addSectionHeading(body, "Pestaña B: 🛃 Validaciones y Aduana", 2);
  addParagraph(body, "Centraliza el control de suministros, la aprobación de propuestas corporativas y las sanciones regulatorias:");
  addCheckItem(body, "Bandeja de Slogans (Coordinación)", "Revisa las propuestas de lema (DOC_11) avaladas por el CEO. Permite verificar el texto oficial y pulsar [ ✅ APROBAR Y PUBLICAR SLOGAN ] o rechazarlo con motivo tipificado.");
  addCheckItem(body, "Bandeja de Hojas de Taller (FYQ / Coordinación)", "Audita las Hojas Oficiales de Taller BOM (DOC_10) visadas por Operaciones antes de autorizar las pruebas de vuelo.");
  addCheckItem(body, "Bandeja de Acciones Publicitarias (LYE / Coordinación)", "Revisa las Fichas Técnicas de Campaña (DOC_12) emitidas por Marketing y autorizadas por el CEO.");
  addCheckItem(body, "Tabla AEE & Finanzas", "Muestra la inversión física real (€) y el gasto virtual (€v) de cada equipo. Al hacer clic sobre el gasto virtual se abre el desglose línea por línea del Libro Mayor.");
  addCheckItem(body, "Sanciones AEE Automáticas", "Pulsa [ Sancionar AEE ] para emitir una multa en €v con tipificación oficial. El sistema firma el acta con la agencia correspondiente (AESA en FYQ, Ministerio de Hacienda en ECO, CNMC en LYE...).");
  addCheckItem(body, "Inyección de Patrocinios (Coordinación)", "Permite premiar a las mejores startups con 5 escalas oficiales: ORO (500 €v), PLATA (400 €v), BRONCE (250 €v), COBRE (150 €v) y COLABORADOR (100 €v), incorporando el logo al HUD de la empresa.");
  addCheckItem(body, "Aduana de Piezas Especiales (I+D)", "Si un alumno solicita un componente fuera de catálogo, el profesorado revisa su memoria en Drive, fija su precio en €v y lo desbloquea en SUPERMARS-KET con etiqueta [ESP].");

  // Sección 4: Modo Administración TIC (Coordinación)
  addSectionHeading(body, "4. Modo Administración del Centro TIC (Exclusivo Coordinación)", 1);
  addParagraph(body, "Accesible mediante el conmutador [ ⚙️ ADMINISTRACIÓN DEL CENTRO (TIC) ]. Contiene las 6 herramientas maestras del proyecto:");

  const adminHeaders = ["Módulo TIC", "Herramientas y Funciones Clave", "Impacto en la Simulación"];
  const adminRows = [
    ["🚀 Startups & PINs", "Creación de empresas (A-F), Llavero Maestro de 4 dígitos, regeneración masiva de claves y generación de Tarjetas de Credenciales Imprimibles (PDF).", "Garantiza el acceso seguro y la recuperación inmediata de contraseñas olvidadas."],
    ["⏳ Cronograma Maestro", "Configuración centralizada de fechas de apertura, deadlines y enlaces a plantillas oficiales Drive de los 19 entregables. Gestión del Buzón de Sugerencias.", "Regula el avance pedagógico coordinado entre todas las materias."],
    ["💾 Copias de Seguridad (D1)", "Descarga/restauración de copias completas en JSON, sincronización Cloudflare D1 y Reinicio Transaccional de Simulación con modal Zero-Prompt.", "Protección total contra pérdida de datos y preparación de nuevas convocatorias."],
    ["🚨 Infracciones Léxicas & HR", "Bandeja de Partes de Inactividad (DOC_2) emitidos por alumnos contra compañeros absentistas y auditoría del cortafuegos léxico Zero-PII.", "Resolución de conflictos de equipo y cumplimiento de la política de protección de datos."],
    ["📈 Telemetría y Accesos", "Matriz de conexiones por empresa/departamento (detección de polizones) y registro táctico inmutable de las últimas 100 operaciones.", "Monitorea la participación equitativa de todos los miembros del equipo."],
    ["🛒 Gestión Catálogo", "Modificación de precios en tiempo real para simular inflación/aranceles e incorporación de nuevos ítems con categoría y país de origen.", "Dinamiza la economía virtual y el análisis del comercio internacional."]
  ];
  addStyledTable(body, adminHeaders, adminRows, [110, 244, 150]);

  // Sección 5: Recetario de Operaciones Frecuentes
  addSectionHeading(body, "5. Recetario Paso a Paso: Operaciones Docentes Más Frecuentes", 1);

  addSectionHeading(body, "Caso A: Calificar un Entregable o Exigir Subsanación", 2);
  addCheckItem(body, "1. Selección", "En [ 📝 Rúbricas y Entregas ], filtra por tu Clase y selecciona la Startup en el desplegable.");
  addCheckItem(body, "2. Revisión", "En el bloque derecho de Evidencias, haz clic en [ Abrir Doc ↗ ] para auditar el documento en Google Drive.");
  addCheckItem(body, "3A. Nota Válida", "Rellena los criterios (0-10) en el panel izquierdo, añade la observación formativa y pulsa [ REGISTRAR CALIFICACIÓN ].");
  addCheckItem(body, "3B. Devolución", "Si faltan apartados o el enlace está bloqueado, pulsa [ ↩ Subsanar ], elige el motivo oficial y confirma. Se enviará una alerta urgente al autor y al CEO.");

  addSectionHeading(body, "Caso B: Aprobar una Pieza Especial de I+D Fuera de Catálogo", 2);
  addCheckItem(body, "1. Ubicación", "Entra en [ 🛃 Validaciones y Aduana ] y desplázate a la sección Solicitudes de Piezas Especiales (I+D).");
  addCheckItem(body, "2. Memoria", "Abre el enlace de Drive adjunto por el Director Técnico para comprobar la justificación física de la pieza.");
  addCheckItem(body, "3. Aprobación", "Introduce el precio asignado en Eurocréditos (€v) y pulsa [ Aprobar ]. La pieza se desbloqueará en su catálogo con etiqueta [ESP].");

  addSectionHeading(body, "Caso C: Imponer una Sanción Institucional AEE", 2);
  addCheckItem(body, "1. Tabla AEE", "En [ 🛃 Validaciones y Aduana ], localiza la empresa infractora en la tabla y pulsa [ Sancionar AEE ].");
  addCheckItem(body, "2. Tipificación", "Selecciona el motivo oficial de la sanción y marca el importe de la multa en €v.");
  addCheckItem(body, "3. Ejecución", "Al confirmar, los €v se descuentan del balance de la empresa y se emite la resolución firmada por la agencia de tu materia.");

  addSectionHeading(body, "Caso D: Asignar un Patrocinio Corporativo (Solo Coordinación)", 2);
  addCheckItem(body, "1. Selección", "En [ 🛃 Validaciones y Aduana ], pulsa [ Patrocinar ] en la fila de la startup premiada.");
  addCheckItem(body, "2. Escala", "Elige el nivel (ORO 500 €v, PLATA 400 €v, BRONCE 250 €v, COBRE 150 €v o COLABORADOR 100 €v).");
  addCheckItem(body, "3. Identidad", "Indica la entidad patrocinadora (ej. ESA, Airbus, CDTI) y confirma. El logo lucirá en el HUD de la empresa y los fondos se ingresarán en su cuenta.");

  addSectionHeading(body, "Caso E: Validar y Publicar el Slogan Oficial (Solo Coordinación)", 2);
  addCheckItem(body, "1. Tarjeta Activa", "En la parte superior de [ 🛃 Validaciones y Aduana ], localiza la propuesta de slogan avalada por el CEO.");
  addCheckItem(body, "2. Expediente", "Pulsa [ 📄 Abrir Expediente Slogan en Google Drive ↗ ] para revisar la plantilla DOC_11.");
  addCheckItem(body, "3. Resolución", "Confirma o ajusta el lema oficial en el campo de texto y pulsa [ ✅ APROBAR Y PUBLICAR SLOGAN ]. Aparecerá de inmediato en el HUD de la empresa.");

  addSectionHeading(body, "Caso F: Mediar en un Conflicto Interno de Equipo (Alertas HR)", 2);
  addCheckItem(body, "1. Monitoreo", "Cambia a [ ⚙️ ADMINISTRACIÓN DEL CENTRO (TIC) ] ➔ pestaña [ 🚨 Infracciones Léxicas & HR ].");
  addCheckItem(body, "2. Expediente HR", "Revisa la alerta de inactividad, abre el parte oficial DOC_2 en Drive y contrasta la asistencia con la Matriz de Conexiones.");
  addCheckItem(body, "3. Mediación", "Intervén presencialmente con el equipo en el aula y pulsa [ Marcar Resuelto ] para cerrar el expediente.");

  // Mensaje final
  addCallout(
    body,
    "📞 CANAL DE SOPORTE TÉCNICO Y DESARROLLO",
    "Para reportar incidencias de software, sugerencias de mejora o ajustes en la base de datos de la plataforma, utiliza el Buzón de Desarrollo dentro de [ Cronograma Maestro ] o escribe directamente al equipo de coordinación técnica.",
    "info"
  );

  doc.saveAndClose();
  Logger.log("✅ Manual Docente creado exitosamente: " + doc.getUrl());
  return doc.getUrl();
}

// ====================================================================
// HELPERS DE MAQUETACIÓN Y FORMATO (MOTOR V8)
// ====================================================================

function setupPageLayout(body) {
  body.setMarginTop(THEME.spacing.margin);
  body.setMarginBottom(THEME.spacing.margin);
  body.setMarginLeft(THEME.spacing.margin);
  body.setMarginRight(THEME.spacing.margin);
}

function setupHeaderFooter(doc) {
  const header = doc.addHeader();
  const headerPara = header.appendParagraph("MARS-KET 2.0 // CENTRO DE MANDO DOCENTE Y COORDINACIÓN TIC • CURSO 2026-2027");
  headerPara.setFontFamily(THEME.font.heading);
  headerPara.setFontSize(8.5);
  headerPara.setForegroundColor(THEME.colors.textMuted);
  headerPara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  headerPara.setSpacingAfter(6);

  const footer = doc.addFooter();
  const footerPara = footer.appendParagraph("Documento Oficial de Claustro • Terminal: www.proyectomarsket.es • Evaluación Competencial LOMLOE 100%");
  footerPara.setFontFamily(THEME.font.body);
  footerPara.setFontSize(8.5);
  footerPara.setForegroundColor(THEME.colors.textMuted);
  footerPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
}

function addHeaderBanner(body) {
  const table = body.appendTable([
    ["MARS-KET OS // MANUAL DEL CLAUSTRO DOCENTE\nGuía de Evaluación de Aula y Administración del Centro TIC (v1.1.38)"]
  ]);
  table.setColumnWidth(0, 504);
  table.setBorderColor(THEME.colors.gold);
  table.setBorderWidth(2);

  const cell = table.getCell(0, 0);
  cell.setBackgroundColor(THEME.colors.primary);
  cell.setPaddingTop(16);
  cell.setPaddingBottom(16);
  cell.setPaddingLeft(20);
  cell.setPaddingRight(20);

  const para = cell.getChild(0).asParagraph();
  para.setFontFamily(THEME.font.heading);
  para.setFontSize(15);
  para.setForegroundColor(THEME.colors.white);
  para.setBold(true);
  para.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  const subPara = cell.appendParagraph("PROGRAMA AEROESPACIAL EDUCATIVO (AEE / ESA) • MARCO CURRICULAR Y EVALUACIÓN LOMLOE");
  subPara.setFontFamily(THEME.font.heading);
  subPara.setFontSize(8.5);
  subPara.setForegroundColor(THEME.colors.gold);
  subPara.setBold(true);
  subPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  subPara.setSpacingBefore(6);

  body.appendParagraph("").setSpacingAfter(10);
}

function addSectionHeading(body, text, level) {
  const heading = body.appendParagraph(text);
  heading.setFontFamily(THEME.font.heading);
  heading.setBold(true);

  if (level === 1) {
    heading.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    heading.setFontSize(13.5);
    heading.setForegroundColor(THEME.colors.primary);
    heading.setSpacingBefore(16);
    heading.setSpacingAfter(5);
  } else if (level === 2) {
    heading.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    heading.setFontSize(11);
    heading.setForegroundColor(THEME.colors.primaryLight);
    heading.setSpacingBefore(11);
    heading.setSpacingAfter(3);
  }
}

function addParagraph(body, text) {
  const p = body.appendParagraph(text);
  p.setFontFamily(THEME.font.body);
  p.setFontSize(9.5);
  p.setForegroundColor(THEME.colors.text);
  p.setLineSpacing(1.15);
  p.setSpacingAfter(5);
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
  cell.setPaddingTop(8);
  cell.setPaddingBottom(8);
  cell.setPaddingLeft(14);
  cell.setPaddingRight(14);

  const titlePara = cell.getChild(0).asParagraph();
  titlePara.setText(title);
  titlePara.setFontFamily(THEME.font.heading);
  titlePara.setFontSize(9.5);
  titlePara.setBold(true);
  titlePara.setForegroundColor(cfg.title);
  titlePara.setSpacingAfter(3);

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
    cell.setPaddingLeft(7);
    cell.setPaddingRight(7);

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
      cell.setPaddingLeft(7);
      cell.setPaddingRight(7);

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
