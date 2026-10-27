/**
 * ====================================================================
 * MARS-KET OS (v1.1.38) — MANUAL OPERATIVO PARA ALUMNOS
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
    margin: 54 // ~1.9 cm márgenes de página
  }
};

/**
 * Función Principal para Ejecutar en Apps Script
 */
function generarGuiaAlumnosMarsket() {
  const docTitle = "MARS-KET 2.0 (v1.1.38) — Guía Operativa para Alumnos";
  const doc = DocumentApp.create(docTitle);
  const body = doc.getBody();

  // Configuración de lienzo y márgenes
  setupPageLayout(body);
  setupHeaderFooter(doc);

  // Portada / Encabezado Principal
  addHeaderBanner(body);

  // Alerta RGPD / Zero-Text
  addCallout(
    body,
    "🛡️ DIRECTIVA ZERO-TEXT Y PRIVACIDAD (RGPD ART. 13)",
    "Prohibido escribir nombres reales, apellidos, correos o teléfonos dentro de la plataforma. Toda la documentación se redacta exclusivamente en los Modelos Oficiales de Google Docs y se vincula mediante enlace público configurado como: «Cualquier persona con el enlace puede ver».",
    "warning"
  );

  // Sección 1: Acceso y HUD
  addSectionHeading(body, "1. Acceso en 2 Pasos y HUD Táctico", 1);
  addParagraph(body, "Sigue este procedimiento rápido para iniciar tu jornada de simulación:");
  addCheckItem(body, "Paso 1: Terminal Oficial", "Entra en https://www.proyectomarsket.es desde tu navegador.");
  addCheckItem(body, "Paso 2: Código de Empresa", "Escribe el código oficial de tu startup (ej. AST-1010) y pulsa [ VALIDAR CÓDIGO ].");
  addCheckItem(body, "Paso 3: Departamento y PIN", "Selecciona tu rol en el desplegable y marca tu PIN numérico de 4 dígitos en el teclado en pantalla.");
  addCheckItem(body, "Paso 4: HUD Táctico", "Comprueba en la barra superior tu saldo en Eurocréditos (€v), lema oficial, escudo y notificaciones.");

  // Sección 2: Mapa de Roles y 4 Pestañas
  addSectionHeading(body, "2. Cuadro de Mandos y Navegación en 4 Pestañas", 1);
  addParagraph(body, "Cada puesto cuenta con una interfaz optimizada de 4 pestañas para máxima concentración operativa:");

  const roleHeaders = ["Rol", "Pestaña Principal", "Las 4 Pestañas del Puesto", "Misión Operativa"];
  const roleRows = [
    ["🚀 CEO", "🔐 Bóveda Órdenes", "1. Bóveda • 2. Finanzas • 3. Dossier • 4. Gobernanza", "Supervisión general, visado de entregables y campañas, desempate y crisis."],
    ["🧪 Técnico", "🛒 SUPERMARS-KET", "1. SUPERMARS-KET • 2. Banco I+D • 3. Dossier • 4. Gobernanza", "Selección de piezas, memoria DOC_9, diseño de cohete y ensayos de vuelo."],
    ["💰 Finanzas", "🔐 Bóveda Órdenes", "1. Bóveda • 2. Finanzas • 3. Dossier • 4. Gobernanza", "Aprobación de presupuesto (€v), Libro Mayor, facturas reales (€) y entregables ECO."],
    ["📦 Operaciones/IA", "📦 Taller Ensamble", "1. Taller • 2. Bitácora IA • 3. Dossier • 4. Gobernanza", "Montaje físico, registro de tickets (€) con DOC_8, calidad y bitácora ética de IA."],
    ["🎨 Marketing", "🎨 Marca & MKT", "1. Marca & MKT • 2. SUPERMARS-KET • 3. Dossier • 4. Gobernanza", "Slogan oficial con DOC_11, contratación de campañas y acciones con DOC_12."],
    ["👁️ Auxiliar", "Según asignación", "Hereda las 4 pestañas de su departamento tutor", "Apoyo operativo asignado por el CEO con validación docente."]
  ];
  addStyledTable(body, roleHeaders, roleRows, [80, 110, 150, 164]);

  // Sección 3: Circuitos Operativos Paso a Paso
  addSectionHeading(body, "3. Circuitos de Trabajo Interdepartamentales", 1);
  addParagraph(body, "Cada acción en MARS-KET requiere coordinación entre departamentos. Sigue el circuito exacto para evitar bloqueos:");

  // Circuito A
  addSectionHeading(body, "Circuito A: Compra de Piezas de Taller (B2C)", 2);
  addCheckItem(body, "1. Técnico (Carrito)", "Entra en [ 🛒 SUPERMARS-KET ], añade los componentes necesarios y pulsa [ TRAMITAR CARRITO ].");
  addCheckItem(body, "2. Técnico (Memoria)", "Pega la URL de Google Drive de la memoria técnica DOC_9 y pulsa [ ENVIAR ORDEN A FINANZAS ].");
  addCheckItem(body, "3. Finanzas (Auditoría)", "Abre [ 🔐 Bóveda Órdenes ] con filtro [I+D (TÉCNICO)]. Revisa el DOC_9 y pulsa [ APROBAR PRESUPUESTO ].");
  addCheckItem(body, "4. Operaciones (Taller)", "En [ 📦 Taller Ensamble ], registra el comercio, importe real en € y ticket físico. Pulsa [ CONFIRMAR COMPRA FÍSICA Y ENSAMBLAJE ].");
  addCheckItem(body, "Resultado", "La orden pasa a la bandeja [COMPLETADAS] y el gasto se asienta en el Libro Mayor.");

  // Circuito B
  addSectionHeading(body, "Circuito B: Campañas Publicitarias y Acciones Comerciales", 2);
  addCheckItem(body, "1. Marketing (Paquete)", "En [ 🎨 Marca & MKT ], pulsa [ + Contratar Paquete ], adjunta el DOC_5 (Brief Creativo) y solicita presupuesto a Finanzas.");
  addCheckItem(body, "2. Finanzas (Validación)", "En [ 🔐 Bóveda Órdenes ] con filtro [MARKETING], audita el DOC_5 y pulsa [ APROBAR PAQUETE MKT ].");
  addCheckItem(body, "3. Marketing (Acción)", "Con el paquete ACTIVO, pulsa [ + Publicar Acción ], adjunta la Ficha Técnica DOC_12 y pulsa [ Entregar Acción al CEO ].");
  addCheckItem(body, "4. CEO (Filtro Calidad)", "Revisa el DOC_12. Si está correcto, pulsa [ ✅ APROBAR ACCIÓN ]; si no, pulsa [ ↩️ DEVOLVER ] con motivo tipificado.");
  addCheckItem(body, "Resultado", "La acción queda elevada formalmente para su calificación por el profesor de Liderazgo (LyE).");

  // Circuito C
  addSectionHeading(body, "Circuito C: Registro Oficial de Slogan Corporativo", 2);
  addCheckItem(body, "1. Marketing (Propuesta)", "En [ 🎨 Marca & MKT ], formula el lema, adjunta el DOC_11 y pulsa [ 📤 1. Presentar Propuesta al CEO ].");
  addCheckItem(body, "2. CEO (Aval)", "En [ ⚖️ Gobernanza ], revisa la justificación y pulsa [ ✅ 2. Avalar y Elevar a Coordinación Docente ].");
  addCheckItem(body, "3. Coordinación (Publicación)", "El profesorado inscribe el slogan en el Registro Mercantil; desde ese instante, se proyecta en el HUD de todo el equipo.");

  // Circuito D
  addSectionHeading(body, "Circuito D: Entrega y Subsanación de Documentos Curriculares", 2);
  addCheckItem(body, "1. Responsable (Dossier)", "En [ 📋 Dossier ] ➔ [ 📁 Bóveda de Entregables (19) ], despliega la Fase, pega el enlace Drive y pulsa [ 📤 ENTREGAR AL CEO ].");
  addCheckItem(body, "2. CEO (Visado Previo)", "Revisa la entrega. Si cumple la rúbrica, pulsa [ ✓ VISAR ]. Si no, pulsa [ ↩ DEVOLVER ] con motivo tipificado.");
  addCheckItem(body, "3. Profesor (Calificación)", "El docente evalúa el documento. Si detecta deficiencias graves, pulsa [ ↩ Subsanar ] indicando el motivo tipificado.");
  addCheckItem(body, "4. Subsanación Urgente", "Aparece la etiqueta [⚠️ SUBSANACIÓN DOCENTE] y tanto el autor como el CEO reciben notificación para corregirlo y reenviarlo.");

  // Circuito E
  addSectionHeading(body, "Circuito E: Compraventa B2B de Piezas entre Startups", 2);
  addCheckItem(body, "1. Técnico Vendedor", "En [ 🛒 SUPERMARS-KET ] (pestaña B2B), fija pieza, precio y adjunta el DOC_7 (Desinversión B2B).");
  addCheckItem(body, "2. CEO Vendedor", "Autoriza la oferta pública en el mercado interempresarial.");
  addCheckItem(body, "3. Compradora", "El técnico comprador adquiere el lote, Finanzas compradora aprueba el pago en Bóveda y Operaciones confirma la recepción física.");

  // Circuito F
  addSectionHeading(body, "Circuito F: Asambleas y Gobernanza Interna", 2);
  addCheckItem(body, "1. Proponer Moción", "Cualquier miembro del equipo puede presentar una moción en [ ⚖️ Gobernanza ] adjuntando justificación.");
  addCheckItem(body, "2. Votación", "Todos los integrantes emiten su voto: [ A FAVOR ], [ EN CONTRA ] o [ ABSTENCIÓN ].");
  addCheckItem(body, "3. Resolución", "El CEO cierra la votación. En caso de empate numérico, el sistema aplica automáticamente el Voto de Calidad del CEO.");

  // Sección 4: Cuadro de las 12 Plantillas Oficiales
  addSectionHeading(body, "4. Catálogo Oficial de Plantillas Google Docs", 1);
  addParagraph(body, "Cada documento debe crearse obligatoriamente haciendo una copia del modelo corporativo oficial:");

  const docHeaders = ["Código", "Documento Oficial", "Departamento", "Materia Calificadora"];
  const docRows = [
    ["DOC_1", "Solicitud de Cambio de Denominación Social", "CEO / Dirección", "Registro Mercantil"],
    ["DOC_2", "Plan de Empresa y Viabilidad Económica", "Finanzas", "Economía (ECO)"],
    ["DOC_3", "Cuaderno de Bitácora y Gestión de Crisis", "CEO / Operaciones", "Gobernanza / Dirección"],
    ["DOC_4", "Memoria Técnica y Ensayos de Propulsión", "Técnico / I+D", "Física y Química (FYQ)"],
    ["DOC_5", "Brief Creativo de Campaña y Justificación ROI", "Marketing", "Liderazgo y Emprend. (LYE)"],
    ["DOC_6", "Dossier para Inversores y Pitch Deck", "CEO / Marketing", "Lengua Castellana (LEN)"],
    ["DOC_7", "Memoria Técnica de Desinversión B2B", "Técnico / I+D", "SUPERMARS-KET B2B"],
    ["DOC_8", "Control de Gasto Real y Registro de Tickets", "Operaciones e IA", "Finanzas / Economía"],
    ["DOC_9", "Orden de Adquisición B2C y Justificación", "Técnico / I+D", "Tecnología / Taller"],
    ["DOC_10", "Memoria Matemática y Telemetría de Apogeo", "Técnico / I+D", "Matemáticas (MAT)"],
    ["DOC_11", "Solicitud Oficial de Slogan Corporativo", "Marketing / CEO", "Registro Mercantil"],
    ["DOC_12", "Ficha Técnica y Control de Acción Publicitaria", "Marketing / CEO", "Liderazgo y Emprend. (LYE)"]
  ];
  addStyledTable(body, docHeaders, docRows, [70, 204, 110, 120]);

  // Mensaje final
  addCallout(
    body,
    "💡 CANAL DE SOPORTE Y ASISTENCIA TÉCNICA",
    "Si encuentras alguna incidencia durante la sesión, utiliza el botón [ 💡 SUGERENCIA ] en el HUD superior para comunicarte directamente con el equipo de soporte y coordinación docente.",
    "info"
  );

  doc.saveAndClose();
  Logger.log("✅ Documento creado exitosamente: " + doc.getUrl());
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
  // Encabezado
  const header = doc.addHeader();
  const headerPara = header.appendParagraph("MARS-KET 2.0 // PROGRAMA AEROESPACIAL EDUCATIVO (AEE / ESA) • CURSO 2026-2027");
  headerPara.setFontFamily(THEME.font.heading);
  headerPara.setFontSize(8.5);
  headerPara.setForegroundColor(THEME.colors.textMuted);
  headerPara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  headerPara.setSpacingAfter(6);

  // Pie de Página con numeración dinámica
  const footer = doc.addFooter();
  const footerPara = footer.appendParagraph("Documento Oficial de Trabajo • Terminal: www.proyectomarsket.es • Página ");
  footerPara.setFontFamily(THEME.font.body);
  footerPara.setFontSize(9);
  footerPara.setForegroundColor(THEME.colors.textMuted);
  footerPara.appendPageNumber();
  footerPara.appendText(" de ");
  footerPara.appendPageCount();
  footerPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
}

function addHeaderBanner(body) {
  // Tabla de cabecera estilo Real Madrid (Azul Real Marino con acento dorado)
  const table = body.appendTable([
    ["MARS-KET OS // MANUAL OPERATIVO PARA ALUMNOS\nGuía Práctica de Trabajo y Circuitos Interdepartamentales (v1.1.38)"]
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
  para.setFontSize(16);
  para.setForegroundColor(THEME.colors.white);
  para.setBold(true);
  para.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  // Subtítulo dorado
  const subPara = cell.appendParagraph("TERMINAL OFICIAL: WWW.PROYECTOMARSKET.ES • EVALUACIÓN COMPETENCIAL LOMLOE 100%");
  subPara.setFontFamily(THEME.font.heading);
  subPara.setFontSize(9);
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
    heading.setFontSize(14);
    heading.setForegroundColor(THEME.colors.primary);
    heading.setSpacingBefore(18);
    heading.setSpacingAfter(6);
  } else if (level === 2) {
    heading.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    heading.setFontSize(11.5);
    heading.setForegroundColor(THEME.colors.primaryLight);
    heading.setSpacingBefore(12);
    heading.setSpacingAfter(4);
  }
}

function addParagraph(body, text) {
  const p = body.appendParagraph(text);
  p.setFontFamily(THEME.font.body);
  p.setFontSize(10);
  p.setForegroundColor(THEME.colors.text);
  p.setLineSpacing(1.15);
  p.setSpacingAfter(6);
  return p;
}

function addCheckItem(body, title, desc) {
  const p = body.appendParagraph("");
  p.setFontFamily(THEME.font.body);
  p.setFontSize(9.5);
  p.setSpacingBefore(2);
  p.setSpacingAfter(3);
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
  titlePara.setFontSize(10);
  titlePara.setBold(true);
  titlePara.setForegroundColor(cfg.title);
  titlePara.setSpacingAfter(3);

  const textPara = cell.appendParagraph(text);
  textPara.setFontFamily(THEME.font.body);
  textPara.setFontSize(9);
  textPara.setForegroundColor(cfg.text);
  textPara.setLineSpacing(1.15);

  body.appendParagraph("").setSpacingAfter(4);
}

function addStyledTable(body, headers, rows, colWidths) {
  const tableData = [headers, ...rows];
  const table = body.appendTable(tableData);
  table.setBorderColor(THEME.colors.border);
  table.setBorderWidth(0.75);

  // Configuración de anchos de columna
  colWidths.forEach((w, idx) => {
    table.setColumnWidth(idx, w);
  });

  // Fila de encabezado (Azul Real Marino con texto en blanco/dorado)
  const headerRow = table.getRow(0);
  for (let c = 0; c < headers.length; c++) {
    const cell = headerRow.getCell(c);
    cell.setBackgroundColor(THEME.colors.primary);
    cell.setPaddingTop(6);
    cell.setPaddingBottom(6);
    cell.setPaddingLeft(8);
    cell.setPaddingRight(8);

    const para = cell.getChild(0).asParagraph();
    para.setFontFamily(THEME.font.heading);
    para.setFontSize(9);
    para.setBold(true);
    para.setForegroundColor(THEME.colors.white);
  }

  // Filas de datos
  for (let r = 1; r < tableData.length; r++) {
    const row = table.getRow(r);
    const isEven = r % 2 === 0;
    const bg = isEven ? THEME.colors.zebra : THEME.colors.white;

    for (let c = 0; c < headers.length; c++) {
      const cell = row.getCell(c);
      cell.setBackgroundColor(bg);
      cell.setPaddingTop(5);
      cell.setPaddingBottom(5);
      cell.setPaddingLeft(8);
      cell.setPaddingRight(8);

      const para = cell.getChild(0).asParagraph();
      para.setFontFamily(THEME.font.body);
      para.setFontSize(8.5);
      para.setForegroundColor(THEME.colors.text);

      // Resaltar primera columna (Roles o Códigos DOC)
      if (c === 0) {
        para.setBold(true);
        para.setForegroundColor(THEME.colors.primary);
      }
    }
  }

  body.appendParagraph("").setSpacingAfter(6);
}
