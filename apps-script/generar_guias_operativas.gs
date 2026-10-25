/**
 * ============================================================================
 * 🚀 MARS-KET 2.0 (v1.1.27) — GENERADOR AUTOMÁTICO DE GUÍAS OPERATIVAS (GOOGLE DOCS)
 * ============================================================================
 * Genera dos manuales operativos actualizados con maquetación corporativa:
 *   1. MANUAL OPERATIVO MARS-KET 2.0: Guía para Startups y Roles (Alumnado)
 *   2. MANUAL OPERATIVO MARS-KET 2.0: Guía para el Claustro Docente y Coordinación
 *
 * INSTRUCCIONES DE USO EN GOOGLE APPS SCRIPT:
 * 1. Abre https://script.google.com y crea un "Nuevo proyecto".
 * 2. Borra el código de ejemplo y pega este archivo íntegro.
 * 3. Selecciona la función `generarGuiasOperativasMarsket` en la barra superior.
 * 4. Pulsa "Ejecutar" (Run) y acepta los permisos de Google Docs y Google Drive.
 * 5. En el "Registro de ejecución" (Execution log) obtendrás los enlaces directos
 *    de visualización (/edit) y de copia (/copy) de ambos documentos.
 * ============================================================================
 */

function generarGuiasOperativasMarsket() {
  var resultados = [];
  resultados.push(generarGuiaAlumnosMarsket());
  resultados.push(generarGuiaProfesoresMarsket());

  Logger.log("=================================================================");
  Logger.log("✅ GUÍAS OPERATIVAS MARS-KET 2.0 (v1.1.27) GENERADAS CON ÉXITO");
  Logger.log("=================================================================");
  for (var i = 0; i < resultados.length; i++) {
    Logger.log("📘 " + resultados[i].nombre);
    Logger.log("   🔗 Ver / Editar : " + resultados[i].urlView);
    Logger.log("   📋 Hacer Copia  : " + resultados[i].urlCopy);
  }
  Logger.log("=================================================================");
  return resultados;
}

/* ============================================================================
 * UTILIDADES DE MAQUETACIÓN CORPORATIVA (GOOGLE DOCS)
 * ============================================================================ */

function mkGuiaDoc_(nombre) {
  var doc = DocumentApp.create(nombre);
  var body = doc.getBody();
  body.setMarginTop(36);
  body.setMarginBottom(36);
  body.setMarginLeft(40);
  body.setMarginRight(40);
  return { doc: doc, body: body, nombre: nombre };
}

function mkGuiaCabecera_(body, subtituloDoc, codigoDoc, destinatario, urlApp) {
  var pBrand = body.getParagraphs()[0];
  pBrand.setText("🚀 AGENCIA ESPACIAL ESCOLAR (AEE) — PLATAFORMA MARS-KET 2.0 (v1.1.27)");
  pBrand.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  pBrand.editAsText()
    .setFontFamily("Arial")
    .setFontSize(9)
    .setBold(true)
    .setForegroundColor("#64748b");

  var pTitle = body.appendParagraph(subtituloDoc);
  pTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  pTitle.setSpacingBefore(4).setSpacingAfter(6);
  pTitle.editAsText()
    .setFontFamily("Arial")
    .setFontSize(17)
    .setBold(true)
    .setForegroundColor("#0f172a");

  var meta = body.appendTable([
    [
      "CÓDIGO DOCUMENTAL: " + codigoDoc,
      "DESTINATARIO: " + destinatario,
      "TERMINAL OFICIAL: " + urlApp
    ]
  ]);
  meta.setBorderColor("#cbd5e1").setBorderWidth(1);
  for (var c = 0; c < 3; c++) {
    var cell = meta.getRow(0).getCell(c);
    cell.setBackgroundColor("#f1f5f9")
      .setPaddingTop(5)
      .setPaddingBottom(5)
      .setPaddingLeft(8)
      .setPaddingRight(8);
    var p = cell.getChild(0).asParagraph();
    p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    p.editAsText()
      .setFontFamily("Consolas")
      .setFontSize(8)
      .setBold(true)
      .setForegroundColor("#334155");
  }
  body.appendParagraph("").setSpacingAfter(4);
}

function mkGuiaAviso_(body, tituloAviso, textoAviso, bgColor, borderColor, textColor) {
  var headerText = "ℹ️ " + tituloAviso;
  var fullText = headerText + "\n" + textoAviso;
  var box = body.appendTable([
    [fullText]
  ]);
  box.setBorderColor(borderColor || "#0284c7").setBorderWidth(1.5);
  var cell = box.getRow(0).getCell(0);
  cell.setBackgroundColor(bgColor || "#e0f2fe")
    .setPaddingTop(8)
    .setPaddingBottom(8)
    .setPaddingLeft(10)
    .setPaddingRight(10);
  var txt = cell.getChild(0).asParagraph().editAsText();
  txt.setFontFamily("Arial")
    .setFontSize(9.5)
    .setBold(false)
    .setForegroundColor(textColor || "#0369a1");
  var endIdx = Math.min(headerText.length - 1, txt.getText().length - 1);
  if (endIdx >= 0) {
    txt.setBold(0, endIdx, true);
  }
  body.appendParagraph("").setSpacingAfter(4);
}

function mkGuiaSeccion_(body, texto) {
  var p = body.appendParagraph(texto);
  p.setSpacingBefore(12).setSpacingAfter(4);
  p.editAsText()
    .setFontFamily("Arial")
    .setFontSize(12.5)
    .setBold(true)
    .setForegroundColor("#0f172a");
  return p;
}

function mkGuiaSubtitulo_(body, texto) {
  var p = body.appendParagraph(texto);
  p.setSpacingBefore(8).setSpacingAfter(3);
  p.editAsText()
    .setFontFamily("Arial")
    .setFontSize(10.5)
    .setBold(true)
    .setForegroundColor("#0369a1");
  return p;
}

function mkGuiaParrafo_(body, texto, boldPrefix) {
  var p = body.appendParagraph(texto);
  p.setSpacingBefore(2).setSpacingAfter(4);
  var t = p.editAsText()
    .setFontFamily("Arial")
    .setFontSize(10)
    .setBold(false)
    .setForegroundColor("#1e293b");
  if (boldPrefix && texto.indexOf(boldPrefix) === 0) {
    t.setBold(0, boldPrefix.length - 1, true);
  }
  return p;
}

function mkGuiaLista_(body, items) {
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var textoCompleto = item.titulo ? (item.titulo + " " + item.texto) : item.texto;
    var li = body.appendListItem(textoCompleto);
    li.setGlyphType(DocumentApp.GlyphType.BULLET);
    li.setSpacingBefore(2).setSpacingAfter(3);
    var t = li.editAsText()
      .setFontFamily("Arial")
      .setFontSize(9.5)
      .setBold(false)
      .setForegroundColor("#1e293b");
    if (item.titulo) {
      t.setBold(0, item.titulo.length - 1, true);
      t.setForegroundColor(0, item.titulo.length - 1, "#0f172a");
    }
  }
}

function mkGuiaTabla_(body, filas, headerBg) {
  var table = body.appendTable(filas);
  table.setBorderColor("#94a3b8").setBorderWidth(1);
  var bgCabecera = headerBg || "#0f172a";

  for (var r = 0; r < filas.length; r++) {
    var row = table.getRow(r);
    var isHeader = (r === 0);
    for (var c = 0; c < filas[r].length; c++) {
      var cell = row.getCell(c);
      cell.setPaddingTop(5).setPaddingBottom(5).setPaddingLeft(7).setPaddingRight(7);
      if (isHeader) {
        cell.setBackgroundColor(bgCabecera);
      } else {
        cell.setBackgroundColor(r % 2 === 1 ? "#ffffff" : "#f8fafc");
      }
      var p = cell.getChild(0).asParagraph();
      var txt = p.editAsText();
      txt.setFontFamily("Arial")
        .setFontSize(isHeader ? 9 : 9)
        .setBold(isHeader || c === 0)
        .setForegroundColor(isHeader ? "#ffffff" : (c === 0 ? "#0f172a" : "#334155"));
    }
  }
  body.appendParagraph("").setSpacingAfter(4);
  return table;
}

function mkGuiaFinalizar_(ctx) {
  var pFoot = ctx.body.appendParagraph(
    "Documento oficial generado automáticamente por MARS-KET OS v1.1.27 · Agencia Espacial Escolar (AEE) · https://marsket.pages.dev/"
  );
  pFoot.setSpacingBefore(14);
  pFoot.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  pFoot.editAsText()
    .setFontFamily("Consolas")
    .setFontSize(8)
    .setItalic(true)
    .setForegroundColor("#64748b");

  ctx.doc.saveAndClose();
  var file = DriveApp.getFileById(ctx.doc.getId());
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var id = ctx.doc.getId();
  return {
    id: id,
    nombre: ctx.nombre,
    urlView: "https://docs.google.com/document/d/" + id + "/edit?usp=sharing",
    urlCopy: "https://docs.google.com/document/d/" + id + "/copy"
  };
}

/* ============================================================================
 * 1. GUÍA DE ALUMNOS: MANUAL OPERATIVO PARA STARTUPS Y ROLES (v1.1.27)
 * ============================================================================ */

function generarGuiaAlumnosMarsket() {
  var ctx = mkGuiaDoc_("MANUAL OPERATIVO MARS-KET 2.0 — Guía para Startups y Roles (Alumnado v1.1.27)");
  var b = ctx.body;

  mkGuiaCabecera_(
    b,
    "MANUAL OPERATIVO MARS-KET 2.0: Guía para Startups y Roles",
    "MKT-MAN-ALU-1127",
    "STARTUPS Y ROLES DE ALUMNADO",
    "https://marsket.pages.dev/"
  );

  mkGuiaAviso_(
    b,
    "PLATAFORMA AEROESPACIAL CON BLINDAJE RGPD Y POLÍTICA ZERO-TEXT 100%",
    "Este manual detalla el funcionamiento interno de las startups espaciales dentro de MARS-KET 2.0 (v1.1.27). Cada estudiante asume un rol departamental con permisos y responsabilidades interdependientes. Por normativa de privacidad escolar (RGPD / Art. 13), está ESTRICTAMENTE PROHIBIDO escribir nombres reales, apellidos, correos o teléfonos en la plataforma: toda la documentación extensa se redacta en los 11 Modelos Oficiales de Google Docs y se vincula mediante enlaces de Google Drive con permiso 'Cualquier persona con el enlace puede ver'.",
    "#e0f2fe",
    "#0284c7",
    "#0369a1"
  );

  // SECCIÓN 0: ACCESO Y HUD TÁCTICO
  mkGuiaSeccion_(b, "0. Acceso en 2 Pasos (Zero-Knowledge) y HUD Táctico Compacto");
  mkGuiaParrafo_(
    b,
    "La plataforma utiliza un protocolo de autenticación en dos pasos para proteger el secreto industrial de cada startup y evitar accesos accidentales a otras empresas:"
  );
  mkGuiaLista_(b, [
    {
      titulo: "Paso 1 — Código Privado de Empresa:",
      texto: "Al entrar en https://marsket.pages.dev/, introduce el código alfanumérico de tu startup (ej. AST-1010) proporcionado en vuestra hoja de credenciales y pulsa [ VALIDAR CÓDIGO ]. En esta pantalla también puedes consultar el [ 🛡️ PROTOCOLO RGPD / ART. 13 ]."
    },
    {
      titulo: "Paso 2 — Selección de Departamento y PIN de 4 dígitos:",
      texto: "Una vez verificada tu empresa, selecciona tu tarjeta de rol (CEO, Técnico, Finanzas, Operaciones e IA, Marketing o Auxiliar) e introduce tu PIN privado de 4 dígitos usando el teclado en pantalla o tu teclado físico. La sesión se mantiene activa durante 8 horas en el navegador."
    },
    {
      titulo: "HUD Táctico Superior (Cabecera Compacta):",
      texto: "Muestra en tiempo real el escudo y nombre oficial de la startup, su Slogan Corporativo (cuando ha sido aprobado en el Registro Mercantil), tu rol activo, el Saldo Corporativo en Euro-créditos virtuales (€v) (con capital inicial de 2.400 €v) y el botón directo [ 🤖 IA ] para abrir la Bitácora de Inteligencia Artificial."
    },
    {
      titulo: "Barra de Estado y Utilidades:",
      texto: "Incluye el indicador de sincronización en la nube [D1: SYNCED], el botón [ ❓ GUÍA ] (con tu Checklist de rol de 3 minutos), el botón [ 💡 SUGERENCIA ] (Buzón directo para enviar consultas, ideas o reportar bugs a Coordinación Docente mediante selector tipificado + enlace a Drive) y el botón [ SALIR ]."
    }
  ]);

  // SECCIÓN 1: PERFILES Y RESPONSABILIDADES
  mkGuiaSeccion_(b, "1. Perfiles, Navegación en 4 Pestañas y Responsabilidades por Departamento");
  mkGuiaParrafo_(
    b,
    "Para maximizar la agilidad en el aula, cada departamento aterriza automáticamente en su espacio de trabajo prioritario y cuenta con una barra de navegación simplificada de 4 pestañas clave:"
  );

  mkGuiaTabla_(b, [
    ["ROL / DEPARTAMENTO", "PESTAÑA DE ATERRIZAJE", "LAS 4 PESTAÑAS DEL ROL", "MISIÓN PRINCIPAL"],
    ["🚀 CEO (Dirección General)", "🔐 Bóveda Órdenes", "1. 🔐 Bóveda Órdenes\n2. 💰 Finanzas & ECO\n3. 📋 Dossier\n4. ⚖️ Gobernanza", "Supervisión de plazos, visado jerárquico de entregables, desempate de mociones, trámites mercantiles y gabinete de crisis."],
    ["🧪 Técnico (I+D)", "🛒 SUPERMARS-KET", "1. 🛒 SUPERMARS-KET\n2. 🧪 Banco I+D\n3. 📋 Dossier\n4. ⚖️ Gobernanza", "Adquisición de componentes B2C/B2B, ensayos de vuelo en mm, Hoja de Taller (BOM) e informes de FyQ y Matemáticas."],
    ["💰 Finanzas", "🔐 Bóveda Órdenes", "1. 🔐 Bóveda Órdenes\n2. 💰 Finanzas & ECO\n3. 📋 Dossier\n4. ⚖️ Gobernanza", "Auditoría y aprobación de órdenes de I+D y campañas de Marketing, control del Libro Mayor (€v / €) y entregables de Economía."],
    ["📦 Operaciones e IA", "📦 Taller Ensamble", "1. 📦 Taller Ensamble\n2. 🤖 Bitácora IA\n3. 📋 Dossier\n4. ⚖️ Gobernanza", "Recepción física y montaje en taller, registro de tickets reales (€), validación de BOM y auditoría ética de IA (LyE 4A/4B)."],
    ["🎨 Marketing", "🎨 Marca & MKT", "1. 🎨 Marca & MKT\n2. 🛒 SUPERMARS-KET\n3. 📋 Dossier\n4. ⚖️ Gobernanza", "Identidad visual y Slogan en 3 pasos, contratación de paquetes publicitarios con ROI y entregables de LyE y Lengua."],
    ["👁️ Auxiliar (Observador)", "Según Dpto. vinculado", "Hereda las 4 pestañas del departamento asignado por el CEO", "Miembro de apoyo vinculado a un departamento específico (previa autorización docente). Participa en la Asamblea de Gobernanza."]
  ]);

  // Subsección CEO
  mkGuiaSubtitulo_(b, "🚀 CEO (Dirección General)");
  mkGuiaParrafo_(b, "El CEO es el responsable último de que la misión cumpla los hitos del cronograma, de visar la calidad académica antes de entregar al profesorado y de que el equipo no se bloquee.");
  mkGuiaLista_(b, [
    {
      titulo: "Visado Jerárquico de Entregables (Filtro de Calidad Pre-Docente):",
      texto: "Ningún entregable curricular llega directamente al profesor. Cuando un departamento sube su enlace de Drive al Dossier, pasa a estado 'En Revisión CEO'. El CEO debe abrir el enlace, auditar su calidad y elegir entre [ ✅ Visar y Elevar al Docente ] o [ ↩️ Devolver para Subsanación ] seleccionando un motivo tipificado (Enlace sin permisos públicos, Documento incompleto, Errores de formato, Desviación de rúbrica, Falta verificación IA o Datos incoherentes con el Ledger)."
    },
    {
      titulo: "Supervisión de la Bóveda de Órdenes y Slogan Corporativo (Paso 2):",
      texto: "Vigila que Finanzas y Operaciones no acumulen cuellos de botella. Además, revisa la propuesta de Slogan Corporativo formulada por Marketing (DOC_11) y decide si la avala y eleva a Coordinación Docente o la devuelve a Marketing."
    },
    {
      titulo: "Registro Mercantil (Cambio de Denominación Social):",
      texto: "Puede solicitar el cambio del nombre oficial de la startup seleccionando un motivo tipificado y adjuntando la Solicitud de Cambio de Denominación Social (DOC_1) en Drive para su aprobación por Coordinación."
    },
    {
      titulo: "Voto de Calidad y Cierre de Mociones:",
      texto: "En la pestaña de Gobernanza, el CEO cierra formalmente las votaciones de la asamblea y, en caso de empate numérico entre votos 'A Favor' y 'En Contra', ejerce el voto de calidad."
    },
    {
      titulo: "Solicitud de Rol Auxiliar (Observador) y Gabinete de Crisis AEE:",
      texto: "Puede solicitar la activación del Rol Auxiliar indicando a qué departamento irá vinculado y definiendo su PIN de 4 dígitos (se activa tras el visto bueno de Coordinación). Si la startup recibe una sanción de una Agencia Reguladora, el CEO debe emitir un Comunicado Oficial de Sanción Inmutable adjuntando el DOC_3 en Drive para desbloquear la operativa departamental."
    }
  ]);

  // Subsección Técnico
  mkGuiaSubtitulo_(b, "🧪 Técnico (Departamento de I+D)");
  mkGuiaParrafo_(b, "Encargado del diseño estructural del cohete, la propulsión química, la telemetría de ensayos y la coordinación técnica con el Taller de Ensamble.");
  mkGuiaLista_(b, [
    {
      titulo: "SUPERMARS-KET (Catálogo Oficial B2C):",
      texto: "Es el único rol autorizado para iniciar pedidos de componentes (Fuselaje, Propulsión, Aerodinámica y Sellado). Para tramitar el carrito debe seleccionar un motivo técnico tipificado y adjuntar el enlace de Drive con la Orden de Adquisición e Informe Técnico (DOC_9)."
    },
    {
      titulo: "Mercado Secundario B2B (Compraventa entre Startups):",
      texto: "Permite poner a la venta piezas excedentes del inventario propio (adjuntando la Memoria Técnica de Desinversión DOC_7) o adquirir componentes publicados por otras startups. Toda transacción B2B pasa por la Aduana Aeroespacial Docente antes de transferir la pieza y los €v."
    },
    {
      titulo: "Homologación de Ítems Especiales / Fuera de Mercado (I+D):",
      texto: "Si el prototipo requiere un material que no existe en el catálogo oficial, el Técnico envía una solicitud adjuntando la memoria técnica en Drive. Cuando el Claustro la aprueba, el artículo aparece en el catálogo con la etiqueta [ESP] en exclusiva para esa startup."
    },
    {
      titulo: "Banco de Pruebas de Vuelo (Medición en Milímetros):",
      texto: "Registra cada ensayo seleccionando el Tipo de Fuselaje mediante desplegable cerrado (Botella 1.5L Estándar, 2.0L Alta Presión, Bicámara Tándem, Geometría Cónica o Compuesto Experimental), los gramos de Bicarbonato (NaHCO3), mililitros de Vinagre (CH3COOH), Coste (€v) y la Altura Apogeo H medida en milímetros (mm). El sistema calcula automáticamente el KPI de Eficiencia: E = H (mm) / Coste (€v)."
    },
    {
      titulo: "Hoja Oficial de Taller y BOM (Bill of Materials) [FYQ]:",
      texto: "Configura qué piezas compradas conforman el cohete definitivo, adjunta el DOC_10 en Drive y lo transmite a Operaciones para la verificación de montaje físico en taller."
    },
    {
      titulo: "Entregables de Física y Química (FYQ) y Matemáticas (MAT):",
      texto: "Responsable de subir al Dossier los informes técnicos de FYQ y los 4 entregables trigonométricos de Matemáticas (Goniómetro, Distancia Conocida, Dos Puntos e Informe Final)."
    }
  ]);

  // Subsección Finanzas
  mkGuiaSubtitulo_(b, "💰 Finanzas (Departamento Financiero)");
  mkGuiaParrafo_(b, "Responsable de auditar la tesorería virtual (€v), garantizar la solvencia de la startup, autorizar el gasto de I+D y Marketing, y llevar la contabilidad oficial.");
  mkGuiaLista_(b, [
    {
      titulo: "Auditoría en la Bóveda de Órdenes (I+D y Marketing):",
      texto: "Recibe tanto las Órdenes de Materiales del Técnico (con su DOC_9) como las Solicitudes de Paquetes Publicitarios de Marketing (con su DOC_5). Revisa el enlace de Drive justificativo y el saldo disponible, y decide si Aprueba la orden (pasándola a Taller o activando la campaña) o la Rechaza."
    },
    {
      titulo: "Libro Mayor Inmutable (Ledger) y Control Dual (€v vs. €):",
      texto: "Supervisa en tiempo real cada movimiento de caja: capital social inicial (2.400 €v), compras de catálogo, ventas/compras B2B, contratación de campañas publicitarias, inyecciones de patrocinios (Oro, Plata, Bronce) y deducciones por sanciones de las Agencias Reguladoras, además del seguimiento del gasto real físico en euros (€)."
    },
    {
      titulo: "Documentación Contable (Economía - 10% Global):",
      texto: "Elabora y sube al Dossier (para visado del CEO) los 4 entregables oficiales de Economía: Presupuesto Inicial, Cuenta de Resultados Provisional, Presupuesto Post-Prototipo y Balance de Situación Final."
    }
  ]);

  // Subsección Operaciones e IA
  mkGuiaSubtitulo_(b, "📦 Operaciones e IA (Logística de Taller y Ética Tecnológica)");
  mkGuiaParrafo_(b, "Actúa como puente entre el diseño digital y la manufactura física en el taller, además de ejercer como auditor interno del uso ético de la Inteligencia Artificial.");
  mkGuiaLista_(b, [
    {
      titulo: "Taller de Ensamble y Liquidación de Compras Reales:",
      texto: "Recibe en exclusiva las órdenes de materiales que ya han sido aprobadas por Finanzas. A medida que el equipo construye el cohete, Operaciones marca los componentes ensamblados, introduce el Coste Real pagado en tienda física (€), selecciona el Comercio Oficial en el desplegable estandarizado (Mercadona, Carrefour, Eroski, Dia, Ferretería, Bazar o Comercio genérico) y pega el enlace de Drive con la foto del ticket y el protocolo DOC_8. Al pulsar [ Confirmar Compra y Ensamblaje ], se descuenta el saldo virtual (€v) del Ledger."
    },
    {
      titulo: "Control de Calidad de la Hoja de Taller (BOM - Paso 2):",
      texto: "Recibe la Hoja de Taller (DOC_10) enviada por el Técnico, comprueba que las piezas físicas instaladas en el cohete coinciden exactamente con el BOM digital y decide entre [ ✅ Validar Montaje y Enviar al CEO ] o [ ⚠️ Devolver al Técnico por Incidencia ] seleccionando un motivo técnico tipificado (Discrepancia física de componentes, Fuga de presión/estanqueidad, Asimetría en aletas, Exceso de masa o Enlace Drive inaccesible)."
    },
    {
      titulo: "Auditoría de la Bitácora de IA y Diario de Decisiones (LyE 4A y 4B):",
      texto: "Revisa los reportes de uso de IA registrados por cualquier miembro del equipo (que incluyen el proveedor utilizado y el enlace al cuaderno DOC_4), verifica que haya existido contraste humano y los aprueba para el expediente. Además, sube al Dossier los entregables 4A (Diciembre) y 4B (Abril) del Diario de Decisiones, Conflictos e IA."
    }
  ]);

  // Subsección Marketing
  mkGuiaSubtitulo_(b, "🎨 Marketing (Identidad Corporativa, Mercado y Comunicación)");
  mkGuiaParrafo_(b, "Responsable de la identidad de marca, la estrategia comercial, las campañas de comunicación para captar patrocinios y los entregables de emprendimiento y oratoria.");
  mkGuiaLista_(b, [
    {
      titulo: "Identidad Visual y Trámite de Slogan en 3 Pasos:",
      texto: "Configura el escudo/logo corporativo mediante enlace público de Drive y formula la propuesta de Slogan Corporativo seleccionando su enfoque conceptual aeroespacial y adjuntando el DOC_11. El Slogan sigue un flujo oficial de 3 pasos: 1) Marketing lo propone ➔ 2) El CEO lo avala ➔ 3) Coordinación Docente lo aprueba e inscribe en el HUD."
    },
    {
      titulo: "Inteligencia de Mercado y Paquetes Publicitarios con Precios Congelados:",
      texto: "Consulta en su panel el KPI de Eficiencia del mejor ensayo del Técnico y la inversión acumulada en I+D para argumentar ante inversores. Para lanzar publicidad, contrata uno de los 4 Paquetes Oficiales (Pack Satélite: 200 €v / 3 acciones; Prensa Tradicional: 300 €v / 3 acciones; Despegue Híbrido: 450 €v / 4 acciones; Cobertura Supernova: 750 €v / 6 acciones) adjuntando el Brief ROI (DOC_5). Una vez aprobado el presupuesto por Finanzas, publica cada acción seleccionando el formato en el desplegable y pegando el enlace de Drive de la creatividad."
    },
    {
      titulo: "Entregables de LyE y Lengua Castellana:",
      texto: "Gestiona y envía al CEO los entregables de Liderazgo y Emprendimiento (Identidad y Misión Dic/Abr, Business Model Escrito y Business Model Canvas) y el Dossier para Inversores de Lengua Castellana."
    }
  ]);

  // Subsección Auxiliar
  mkGuiaSubtitulo_(b, "👁️ Auxiliar (Observador / Apoyo Departamental)");
  mkGuiaParrafo_(b, "Rol asignado a miembros adicionales del equipo, vinculado formalmente a un departamento concreto previa solicitud del CEO y aprobación de Coordinación Docente.");
  mkGuiaLista_(b, [
    {
      titulo: "Veeduría Departamental y Asamblea:",
      texto: "Visualiza las 4 pestañas del departamento al que está adscrito para apoyar en la elaboración de documentos en Google Drive, consulta del catálogo y seguimiento del Dossier. Además, tiene derecho de participación y voto en las Mociones de la Asamblea de Gobernanza."
    }
  ]);

  // SECCIÓN 2: POLÍTICA ZERO-TEXT Y LOS 11 MODELOS OFICIALES
  mkGuiaSeccion_(b, "2. Política Zero-Text 100% y Catálogo de los 11 Modelos Oficiales de Google Docs");
  mkGuiaParrafo_(
    b,
    "En MARS-KET 2.0 ningún formulario admite texto libre escrito por teclado. Toda solicitud, informe, acta o justificación se realiza combinando desplegables estandarizados con un enlace a Google Drive o Google Docs. En cada panel de la aplicación encontrarás un botón directo [ 📄 Modelo de documento (Hacer copia) ] que genera automáticamente la plantilla oficial en tu Google Drive:"
  );

  mkGuiaTabla_(b, [
    ["CÓDIGO", "MODELO OFICIAL DE DOCUMENTO", "FLUJO / DEPARTAMENTOS", "DÓNDE SE UTILIZA"],
    ["DOC_1", "Solicitud de Cambio de Denominación Social", "CEO ➔ Coordinación Docente", "Pestaña Gobernanza (Registro Mercantil)"],
    ["DOC_2", "Expediente HR de Reporte de Inactividad", "Cualquier Dpto. ➔ Coordinación", "Pestaña Gobernanza (Alertas HR)"],
    ["DOC_3", "Comunicado Oficial de Expediente Sancionador", "CEO ➔ Todos los Departamentos", "HUD / Gabinete de Crisis AEE"],
    ["DOC_4", "Cuaderno de Bitácora y Auditoría Ética de IA", "Todos los Roles ➔ Operaciones IA", "Botón superior [ 🤖 IA ] / Bitácora IA"],
    ["DOC_5", "Brief Creativo de Campaña y Justificación ROI", "Marketing ➔ Finanzas", "Pestaña Marca & MKT (Paquetes Publicitarios)"],
    ["DOC_6", "Acta Oficial de Moción Asamblearia", "Proponente ➔ Asamblea (Todos)", "Pestaña Gobernanza (Nueva Moción)"],
    ["DOC_7", "Memoria Técnica de Desinversión y Excedentes", "Técnico ➔ Mercado B2B & Aduana", "Pestaña SUPERMARS-KET (Mercado B2B)"],
    ["DOC_8", "Protocolo de Adquisición y Control Aero-estructura", "Operaciones & Finanzas", "Pestaña Taller Ensamble (Liquidación Real €)"],
    ["DOC_9", "Orden de Adquisición e Informe Técnico", "Técnico ➔ Finanzas", "Pestaña SUPERMARS-KET (Carrito Oficial B2C)"],
    ["DOC_10", "Hoja Oficial de Taller, BOM y Control de Calidad [FYQ]", "Técnico ➔ Operaciones ➔ CEO ➔ FyQ", "Pestaña Banco I+D / Taller Ensamble / Dossier"],
    ["DOC_11", "Solicitud de Aprobación de Slogan Corporativo", "Marketing ➔ CEO ➔ Coordinación", "Pestaña Marca & MKT (Identidad Corporativa)"]
  ]);

  mkGuiaAviso_(
    b,
    "REQUISITO OBLIGATORIO DE PERMISOS EN GOOGLE DRIVE",
    "Antes de pegar cualquier enlace en MARS-KET 2.0, pulsa el botón 'Compartir' en tu documento de Google Docs/Drive y configura el Acceso General como 'Cualquier persona con el enlace: Lector'. Si el enlace está restringido, el CEO o el Profesorado no podrán abrirlo y el entregable será devuelto automáticamente.",
    "#fef3c7",
    "#d97706",
    "#92400e"
  );

  // SECCIÓN 3: DIAGRAMAS DE INTERACCIÓN Y FLUJOS DE TRABAJO
  mkGuiaSeccion_(b, "3. Flujos de Trabajo Interdepartamentales (Cadenas de Mando)");
  mkGuiaParrafo_(
    b,
    "El éxito de la startup depende de la coordinación entre roles. Ningún departamento puede actuar como un monopolio aislado; todas las operaciones críticas requieren validación cruzada y quedan registradas con sello de tiempo en la base de datos inmutable Cloudflare D1."
  );

  mkGuiaSubtitulo_(b, "A. Flujo de Aprovisionamiento en 4 Fases y Mercado B2B");
  mkGuiaLista_(b, [
    {
      titulo: "Fase 1 — Petición Técnica (Técnico):",
      texto: "El Técnico selecciona los componentes en el SUPERMARS-KET, elige la categoría técnica de la compra, adjunta el enlace de Drive con el DOC_9 y pulsa [ Transmitir Orden a Finanzas ]."
    },
    {
      titulo: "Fase 2 — Auditoría Presupuestaria (Finanzas):",
      texto: "Finanzas recibe la orden en la Bóveda de Órdenes, inspecciona el DOC_9 y verifica la liquidez en €v. Si es viable, pulsa [ Aprobar Orden ]; si no está justificada, la rechaza."
    },
    {
      titulo: "Fase 3 — Compra Física y Taller de Ensamble (Operaciones):",
      texto: "Operaciones recibe en el Taller de Ensamble las órdenes aprobadas por Finanzas, marca las piezas instaladas físicamente, registra el coste real en euros (€), elige el comercio físico en el desplegable, adjunta el enlace del ticket/DOC_8 y pulsa [ Confirmar Compra y Ensamblaje ]. En ese instante se descuentan los €v del Libro Mayor."
    },
    {
      titulo: "Fase 4 — Integración en el BOM y Mercado Secundario B2B (Técnico):",
      texto: "Las piezas adquiridas pasan al inventario de la startup. Si sobran piezas, el Técnico puede publicarlas en el Mercado B2B (adjuntando el DOC_7) para venderlas a otra startup bajo supervisión de la Aduana Docente."
    }
  ]);

  mkGuiaSubtitulo_(b, "B. Pipeline de la Hoja Oficial de Taller y Control de Calidad [FYQ]");
  mkGuiaLista_(b, [
    {
      titulo: "1. Redacción del BOM (Técnico):",
      texto: "El Técnico selecciona los componentes definitivos del cohete, completa el DOC_10 en Drive y lo envía al Taller (estado: EN_TALLER_OPERARIO)."
    },
    {
      titulo: "2. Verificación Física (Operaciones):",
      texto: "Operaciones inspecciona el cohete físico frente al DOC_10. Si todo coincide, valida el montaje y lo eleva al CEO (SUBMITTED_TO_CEO). Si detecta fallos (fugas, asimetría, exceso de masa), lo devuelve al Técnico con un motivo de incidencia tipificado (DEVUELTO_TALLER)."
    },
    {
      titulo: "3. Visado Ejecutivo (CEO) y Calificación (Docente FyQ):",
      texto: "El CEO revisa la Hoja de Taller validada por Operaciones y la eleva al Docente de Física y Química (DELIVERED_TO_TEACHER) para su calificación oficial (10% de la nota de FyQ)."
    }
  ]);

  mkGuiaSubtitulo_(b, "C. Flujo de Supervisión Jerárquica de Entregables Curriculares (Dossier)");
  mkGuiaLista_(b, [
    {
      titulo: "1. Subida Departamental:",
      texto: "Cuando el candado temporal de una fase está abierto, el departamento responsable (Técnico, Finanzas, Operaciones o Marketing) pega el enlace de Google Drive del entregable y pulsa [ Enviar al CEO ]."
    },
    {
      titulo: "2. Auditoría del CEO:",
      texto: "El CEO recibe una alerta en el Dossier, abre el documento mediante el inspector lateral (Drawer) y comprueba permisos y rúbrica. Si es correcto, pulsa [ Visar y Entregar al Profesor ]; si tiene carencias, lo devuelve al departamento con un motivo tipificado para que lo corrijan antes de la fecha límite."
    }
  ]);

  mkGuiaSubtitulo_(b, "D. Flujo de Identidad Corporativa y Slogan en 3 Pasos (Registro Mercantil)");
  mkGuiaLista_(b, [
    {
      titulo: "Paso 1 (Marketing):",
      texto: "Sube el enlace del logotipo en Drive, selecciona el eje conceptual de la marca, adjunta la memoria DOC_11 y envía la propuesta de Slogan al CEO."
    },
    {
      titulo: "Paso 2 (CEO):",
      texto: "Revisa la coherencia corporativa del DOC_11 y lo avala para elevarlo al Registro Mercantil Docente (o lo devuelve a Marketing)."
    },
    {
      titulo: "Paso 3 (Coordinación Docente):",
      texto: "Audita el expediente y aprueba e inscribe el Slogan Oficial, que pasa a lucir de forma permanente en la cabecera (HUD) de la startup."
    }
  ]);

  mkGuiaSubtitulo_(b, "E. Flujo de Gobernanza (Votación Tripartita) y Alertas HR de Inactividad");
  mkGuiaLista_(b, [
    {
      titulo: "Mociones de Asamblea:",
      texto: "Cualquier miembro selecciona el tipo de moción en el desplegable (Reasignación presupuestaria, Cambio de diseño estructural, Contratación publicitaria, Resolución de conflicto, etc.) y adjunta el Acta DOC_6. Todos los roles (incluido Auxiliar) votan [ 👍 A Favor ], [ 👎 En Contra ] o [ 🤔 No estoy seguro ]. El CEO cierra el escrutinio y desempata si es necesario."
    },
    {
      titulo: "Reporte HR de Inactividad:",
      texto: "Si un departamento bloquea el avance de la misión, cualquier integrante puede emitir una Alerta HR desde Gobernanza seleccionando el departamento afectado, el motivo tipificado y el enlace al expediente DOC_2. La alerta llega de forma confidencial a Coordinación Docente."
    }
  ]);

  mkGuiaSubtitulo_(b, "F. Flujo de Auditoría Ética de Inteligencia Artificial");
  mkGuiaLista_(b, [
    {
      titulo: "Declaración de Uso de IA:",
      texto: "Siempre que un estudiante utilice una IA generativa, debe pulsar el botón superior [ 🤖 IA ], elegir el proveedor en el desplegable oficial (Google Gemini, OpenAI ChatGPT, Anthropic Claude, Microsoft Copilot, Perplexity AI, DeepSeek u Otro) y pegar el enlace a su Cuaderno de Bitácora IA (DOC_4) donde documenta el prompt y la verificación humana."
    },
    {
      titulo: "Validación por Operaciones IA:",
      texto: "Operaciones IA audita cada registro en su pestaña 🤖 Bitácora IA y aprueba aquellos que cumplen el protocolo ético para integrarlos en los entregables 4A y 4B de Liderazgo y Emprendimiento."
    }
  ]);

  mkGuiaSubtitulo_(b, "G. Sistema Sancionador de Agencias Reguladoras y Gabinete de Crisis");
  mkGuiaLista_(b, [
    {
      titulo: "Expedientes de las Agencias Reguladoras:",
      texto: "Los incumplimientos de seguridad, retrasos, contabilidad irregular o infracciones del filtro léxico generan multas automáticas (-10 €v, -100 €v o -200 €v) emitidas por la agencia de cada materia: AESA (FyQ), Ministerio de Hacienda (Economía), CNMC (LyE), Ministerio de Justicia (Lengua), Asuntos Internos (Inglés), AEE (Matemáticas) o el Tribunal Supremo de la AEE (Coordinación)."
    },
    {
      titulo: "Desbloqueo mediante Comunicado Oficial del CEO:",
      texto: "Cuando recae una sanción, el HUD muestra una alerta prioritaria. El CEO debe redactar el Comunicado Oficial de Sanción (DOC_3) en Drive y registrarlo en el Gabinete de Crisis para informar a todos los departamentos de las medidas correctoras."
    }
  ]);

  // SECCIÓN 4: DOSSIER ACADÉMICO Y PONDERACIÓN LOMLOE
  mkGuiaSeccion_(b, "4. Dossier Académico, Fases del Cronograma y Ponderación Curricular (100%)");
  mkGuiaParrafo_(
    b,
    "La pestaña 📋 Dossier se divide en dos vistas: 📊 Evaluación Continua (100%) (donde el equipo consulta en tiempo real sus calificaciones ponderadas y el feedback docente) y 📁 Bóveda de Entregables (organizada en 3 Fases temporales: Fase 1 Nov-Dic, Fase 2 Febrero y Fase 3 Abril, con candados automáticos de apertura y cierre)."
  );

  mkGuiaTabla_(b, [
    ["MATERIA", "PESO GLOBAL", "ENTREGABLES Y PRUEBAS EVALUABLES (DESGLOSE INTERNO 100%)", "ROL RESPONSABLE EN DOSSIER"],
    ["🧪 Física y Química (FYQ)", "25%", "• 1. Informe Preliminar (10%)\n• 2. Hoja Oficial de Taller, BOM y Control de Calidad (10%)\n• 3. Informe Técnico Final Exhaustivo (30%)\n• 4. Prototipo Físico y Lanzamiento (30% - Eval. directa)\n• 5. Media Test de Rol y Defensa Q&A (20% - Eval. directa)", "Técnico (con Operaciones en Hoja de Taller) ➔ Visado CEO"],
    ["🚀 Liderazgo y Emprendimiento (LYE)", "40%", "• 1A. Identidad y Misión Diciembre (10%)\n• 1B. Identidad y Misión Abril (10%)\n• 2. Business Model Escrito (25%)\n• 3. Business Model Canvas (15%)\n• 4A. Diario Decisiones, Conflictos e IA Dic (10%)\n• 4B. Diario Decisiones, Conflictos e IA Abr (10%)\n• 5. Defensas Orales (20% - Eval. directa)", "Marketing (1A, 1B, 2, 3) y Operaciones IA (4A, 4B) ➔ Visado CEO"],
    ["🗣️ Lengua Castellana (LEN)", "15%", "• 1. Producción Oral / Pitch (50% - Eval. directa)\n• 2. Producción Escrita: Dossier Inversores (50%)", "Marketing ➔ Visado CEO"],
    ["💰 Economía (ECO)", "10%", "• 1. Test de Evaluación Financiera (20% - Eval. directa)\n• 2. Presupuesto Inicial (20%)\n• 3. Cuenta de Resultados Provisional (20%)\n• 4. Presupuesto Post-Prototipo (20%)\n• 5. Balance de Situación Final (20%)", "Finanzas ➔ Visado CEO"],
    ["📐 Matemáticas (MAT)", "5%", "• 1. Elaboración de Goniómetro (25%)\n• 2. Informe Distancia Conocida (25%)\n• 3. Informe Dos Puntos (25%)\n• 4. Informe Final Comparativo (25%)", "Técnico ➔ Visado CEO"],
    ["🇬🇧 Inglés (ING)", "5%", "• 1. Expresión Oral / Presentación (70% - Eval. directa en aula)\n• 2. Redacciones Escritas (30% - Eval. directa en aula)\n*(Sin subida de enlaces a Drive en la plataforma)*", "Todo el equipo (Evaluación directa en aula)"]
  ]);

  return mkGuiaFinalizar_(ctx);
}

/* ============================================================================
 * 2. GUÍA DE PROFESORES: MANUAL PARA EL CLAUSTRO Y COORDINACIÓN (v1.1.27)
 * ============================================================================ */

function generarGuiaProfesoresMarsket() {
  var ctx = mkGuiaDoc_("MANUAL OPERATIVO MARS-KET 2.0 — Guía para el Claustro Docente y Coordinación (v1.1.27)");
  var b = ctx.body;

  mkGuiaCabecera_(
    b,
    "MANUAL OPERATIVO MARS-KET 2.0: Guía para el Claustro Docente y Coordinación",
    "MKT-MAN-DOC-1127",
    "CLAUSTRO DOCENTE Y COORDINACIÓN TIC",
    "https://marsket.pages.dev/"
  );

  mkGuiaAviso_(
    b,
    "CENTRO DE MANDO DOCENTE Y AGENCIA ESPACIAL ESCOLAR (AEE)",
    "Este documento detalla el funcionamiento del Terminal Docente de MARS-KET 2.0 (v1.1.27). El acceso a esta interfaz está restringido al profesorado, que actúa simultáneamente como evaluador curricular LOMLOE, autoridad reguladora de la Agencia Espacial Escolar (AEE) y supervisor del ecosistema de startups.",
    "#f1f5f9",
    "#0f172a",
    "#0f172a"
  );

  // SECCIÓN 1: PROTOCOLO DE ACCESO OCULTO Y NIVELES JERÁRQUICOS
  mkGuiaSeccion_(b, "1. Protocolo de Acceso Docente y Niveles de Autorización");
  mkGuiaParrafo_(
    b,
    "Para evitar que el alumnado intente acceder al panel de administración, el acceso al Terminal Docente se encuentra oculto tras un gesto de seguridad en la pantalla principal de login (https://marsket.pages.dev/):"
  );
  mkGuiaLista_(b, [
    {
      titulo: "Paso 1 — Gesto Oculto (Doble Clic en el Escudo):",
      texto: "En la pantalla inicial de acceso, haz DOBLE CLIC (o doble tap en tablet/móvil) sobre el logotipo hexagonal central de MARS-KET. Se desplegará el modal 'TERMINAL DE ACCESO RESTRINGIDO // NIVEL AEE'."
    },
    {
      titulo: "Paso 2 — Código de Autorización de Misión:",
      texto: "Introduce la clave maestra de acceso al claustro (KetMars02) y pulsa [ DESBLOQUEAR TERMINAL ]."
    },
    {
      titulo: "Paso 3 — Selección de Perfil y PIN Docente (4 dígitos):",
      texto: "Selecciona tu tarjeta de materia (FYQ, ECO, LYE, LEN, MAT, ING) o de Coordinación (COORD_MARIO / COORD_ALEX) e introduce tu PIN personal de 4 dígitos."
    }
  ]);

  mkGuiaSubtitulo_(b, "Niveles Jerárquicos dentro del Claustro");
  mkGuiaTabla_(b, [
    ["NIVEL DE ACCESO", "PERFILES EN PLATAFORMA", "PERMISOS Y ÁMBITO DE ACTUACIÓN"],
    ["🧑‍🏫 Docente Especialista", "FYQ, ECO, LYE, LEN, MAT, ING", "• Acceso al Modo Aula (Rúbricas y Entregas + Validaciones y Aduana).\n• Calificación exclusiva de los ítems e informes de su propia asignatura (con bloqueo de edición cruzada).\n• Emisión de Patrocinios y Sanciones firmadas por la Agencia Reguladora de su departamento.\n• En el caso de FYQ: recepción específica de la Hoja Oficial de Taller (BOM) e informes técnicos.\n• Cambio de su propio PIN personal de 4 dígitos."],
    ["👑 Coordinación General (TIC / AEE)", "COORD_MARIO, COORD_ALEX", "• Acceso dual completo: Modo Aula + Modo Administración del Centro (TIC).\n• Supervisión y desbloqueo de todas las rúbricas, Acta General Ponderada (100%) exportable a CSV y Archivo Documental Central (18 columnas).\n• Control de Aduana B2B, Aduana de Identidad/Slogan, Registro Mercantil (Denominación Social) y Monitor de Infracciones Léxicas.\n• Gestión del Llavero Maestro de PINs, Generador PDF de Credenciales, Cronograma Maestro, Catálogo Oficial, Alertas HR y Copias de Seguridad D1."]
  ]);

  // SECCIÓN 2: ARQUITECTURA DUAL DEL PANEL DOCENTE
  mkGuiaSeccion_(b, "2. Arquitectura del Centro de Mando: Modo Aula vs. Modo Administración TIC");
  mkGuiaParrafo_(
    b,
    "Para evitar la sobrecarga visual durante las sesiones de clase, el Terminal Docente separa las herramientas cotidianas de evaluación de las herramientas de configuración estructural del centro mediante un conmutador superior:"
  );

  // 2.1 MODO AULA
  mkGuiaSubtitulo_(b, "2.1. 🏫 MODO AULA // CALIFICACIÓN DIARIA (Todos los Docentes y Coordinación)");
  mkGuiaParrafo_(b, "Contiene dos pestañas operativas diseñadas para evaluar y auditar a los equipos en tiempo real:");
  mkGuiaLista_(b, [
    {
      titulo: "Pestaña 1 — 📝 Rúbricas y Entregas (con Contador en Vivo):",
      texto: "Muestra un badge dinámico con el número de entregables que ya han sido visados por el CEO de cada startup y están listos para calificar. Permite filtrar las startups por Grupo/Clase (A, B, C, D, E, F) y seleccionar cualquier empresa para abrir su consola de evaluación."
    },
    {
      titulo: "Calificación Modular y Ponderación Automática:",
      texto: "Cada docente ve resaltados los ítems de su materia con acceso directo a la evidencia en Google Drive (sólo cuando el estado es DELIVERED_TO_TEACHER), selector de nota (0 a 10 con decimales) y selector de feedback pedagógico o comentario de evaluación. El sistema calcula al instante la nota ponderada de la asignatura y su aportación al 100% global del proyecto."
    },
    {
      titulo: "Vistas Exclusivas de Coordinación en 'Rúbricas y Entregas':",
      texto: "Los coordinadores disponen de tres sub-vistas en esta pestaña: 1) 🎯 Calificación Individual por Materia, 2) 📊 Acta General de Calificaciones (100% Ponderada) (tabla maestra con las notas de las 6 asignaturas de todas las startups y botón [ 📥 Exportar Acta Oficial CSV ]), y 3) 📁 Archivo Documental Central (matriz de auditoría con los enlaces directos a los 17 entregables en Drive + columna de Prompts IA de todas las empresas)."
    },
    {
      titulo: "Pestaña 2 — 🛃 Validaciones y Aduana:",
      texto: "Agrupa las ventanillas de intervención docente sobre la economía y las operaciones de las startups (Recepción FyQ, Patrocinios/Sanciones AEE, Slogan Corporativo, Registro Mercantil, Aduana B2B y Alertas del Filtro Léxico)."
    }
  ]);

  // 2.2 MODO ADMINISTRACIÓN TIC
  mkGuiaSubtitulo_(b, "2.2. ⚙️ MODO ADMINISTRACIÓN DEL CENTRO (TIC) (Exclusivo Coordinación)");
  mkGuiaParrafo_(b, "Al conmutar al Modo Administración TIC, Coordinación accede a 6 módulos de gobierno de la plataforma:");
  mkGuiaLista_(b, [
    {
      titulo: "1. 🚀 Startups & Llavero Maestro (PINs):",
      texto: "Permite dar de alta nuevas startups (asignando Clase A–F y capital inicial de 2.400 €v), aprobar o denegar las solicitudes de Rol Auxiliar (Observador) enviadas por los CEOs, consultar y editar los Códigos Privados de Empresa y los PINs de 4 dígitos de todos los roles y docentes (ocultos por defecto tras el botón [ 👁️ Revelar PINs ]), exportar el Llavero Maestro en CSV y generar los dossieres imprimibles con el Generador de Credenciales Cyberpunk en PDF (A4) (para una empresa individual, para toda la flota de startups o para el Claustro Docente)."
    },
    {
      titulo: "2. ⏳ Cronograma Maestro (Plazos) y 📬 Buzón de Coordinación:",
      texto: "Permite configurar para cada entregable la Fecha de Apertura (que desbloquea el candado en el Dossier de los alumnos), la Fecha Límite (Deadline) y el Enlace a la Plantilla Oficial Docente en Google Drive. Incluye además el Buzón de Coordinación donde se reciben las consultas, sugerencias y reportes de bugs enviados por el alumnado desde su HUD."
    },
    {
      titulo: "3. 💾 Copias de Seguridad (D1) y Protocolos de Reset:",
      texto: "Centro de seguridad de datos en Cloudflare D1. Permite descargar un Backup Manual Local (.JSON), ejecutar o restaurar un Snapshot Diario en la nube, guardar un Archivo Semanal Inmutable, realizar una Restauración de Emergencia (Rollback desde archivo JSON) o ejecutar el 🚨 Reset General Pre-Lanzamiento (Fábrica) (protegido mediante la clave de seguridad JOVE2025, que purga las pruebas y restaura los saldos a 2.400 €v manteniendo intactas las empresas, códigos y PINs creados)."
    },
    {
      titulo: "4. 🚨 Monitor de Infracciones Léxicas y Gestión de Alertas HR:",
      texto: "Muestra el panel centralizado de Reportes HR de Inactividad enviados por los alumnos (con acceso a su expediente DOC_2 en Drive y botón [ Marcar Resuelto por Claustro ]), así como el historial de intercepciones del filtro de seguridad Zero-PII."
    },
    {
      titulo: "5. 📈 Telemetría de Red y Accesos:",
      texto: "Monitor en tiempo real de sesiones activas, matriz de conexiones por departamento y empresa, y latencia de sincronización con la base de datos D1."
    },
    {
      titulo: "6. 🛒 Gestión Catálogo:",
      texto: "Permite modificar en caliente el precio en €v o el stock de cualquier componente del SUPERMARS-KET, dar de alta nuevos artículos y resolver las Solicitudes de Material Externo / I+D Especial."
    }
  ]);

  // SECCIÓN 3: FLUJOS DE INTERACCIÓN DOCENTE Y VENTANILLAS DE ADUANA
  mkGuiaSeccion_(b, "3. Flujos de Interacción Docente: Aduanas, Homologaciones y Sanciones");

  mkGuiaSubtitulo_(b, "A. Flujo de Calificación tras el Visado del CEO");
  mkGuiaParrafo_(
    b,
    "Para fomentar la responsabilidad ejecutiva dentro de cada startup, el profesorado sólo califica entregables que han superado el filtro interno del equipo:"
  );
  mkGuiaLista_(b, [
    {
      titulo: "1. Estado 'En Revisión CEO' (SUBMITTED_TO_CEO):",
      texto: "El departamento ha subido el enlace de Drive, pero el CEO aún no lo ha validado. En el panel docente aparece indicado como pendiente de visado interno."
    },
    {
      titulo: "2. Estado 'Entregado al Docente' (DELIVERED_TO_TEACHER):",
      texto: "El CEO ha auditado y visado el documento. El contador de la pestaña 📝 Rúbricas y Entregas se incrementa, se habilita el botón para abrir la evidencia en Drive y el docente asigna la calificación numérica y su feedback."
    },
    {
      titulo: "3. Recepción Específica de la Hoja de Taller BOM (Solo FYQ y COORD):",
      texto: "En la pestaña 🛃 Validaciones y Aduana, el docente de Física y Química dispone de una bandeja dedicada que muestra las Hojas de Taller (DOC_10) que ya han sido verificadas en el taller por Operaciones y visadas por el CEO."
    }
  ]);

  mkGuiaSubtitulo_(b, "B. Aduanas de Coordinación (Slogan, Registro Mercantil y Mercado B2B)");
  mkGuiaParrafo_(
    b,
    "Dentro de la pestaña 🛃 Validaciones y Aduana, Coordinación Docente resuelve tres trámites mercantiles y comerciales:"
  );
  mkGuiaLista_(b, [
    {
      titulo: "1. Aduana de Identidad Corporativa (Aprobación de Slogan — Paso 3):",
      texto: "Cuando el CEO avala la propuesta de Slogan de Marketing (DOC_11), aparece en esta bandeja. Coordinación abre el enlace de Drive, escribe en el campo de texto seguro el Slogan Oficial definitivo y pulsa [ ✅ Aprobar e Inscribir Slogan ] (actualizando el HUD de la startup) o [ ❌ Rechazar ]."
    },
    {
      titulo: "2. 🏛️ Registro Mercantil (Cambio de Denominación Social):",
      texto: "Cuando un CEO solicita cambiar el nombre de la empresa adjuntando el DOC_1, Coordinación revisa la memoria en Drive, introduce la nueva denominación social autorizada y aprueba o deniega el cambio registral."
    },
    {
      titulo: "3. 🛃 Aduana Aeroespacial B2B (Compraventa entre Startups):",
      texto: "Cuando una startup compra una pieza excedente a otra en el Mercado Secundario B2B, los fondos quedan retenidos en custodia (Escrow). Coordinación revisa la Memoria de Desinversión (DOC_7) y elige entre [ ✅ Aprobar Transacción ] (la pieza pasa al inventario del comprador y los €v se ingresan al vendedor) o [ ❌ Rechazar y Reembolsar ] (se devuelven los €v al comprador y la pieza regresa al vendedor)."
    }
  ]);

  mkGuiaSubtitulo_(b, "C. Homologación de Material Externo / I+D Especial (Gestión Catálogo)");
  mkGuiaLista_(b, [
    {
      titulo: "Auditoría de Solicitudes I+D:",
      texto: "Cuando el Técnico de una startup solicita un componente fuera de catálogo adjuntando su memoria técnica en Drive, Coordinación entra en Modo Administración TIC ➔ 🛒 Gestión Catálogo. Tras revisar el enlace de Drive, asigna el nombre catalogado del componente (que llevará el prefijo [ESP]) y su coste oficial en €v. Al aprobarlo, el artículo queda disponible en el SUPERMARS-KET exclusivamente para la startup solicitante."
    }
  ]);

  mkGuiaSubtitulo_(b, "D. Inyección de Patrocinios y Sistema Sancionador por Agencia Reguladora");
  mkGuiaParrafo_(
    b,
    "En la pestaña 🛃 Validaciones y Aduana, cualquier docente puede premiar la excelencia comercial o sancionar infracciones reglamentarias sobre el saldo virtual (€v) de una startup:"
  );
  mkGuiaLista_(b, [
    {
      titulo: "Inyección de Patrocinios (Ingresos Extraordinarios):",
      texto: "Selecciona la startup, elige el nivel de patrocinio (Patrocinio Bronce, Plata u Oro / Subvención I+D) y ejecuta el abono inmediato en el Ledger de la empresa."
    },
    {
      titulo: "Expedientes Sancionadores Tipificados:",
      texto: "Selecciona la startup, elige el artículo infringido del Reglamento Oficial (Art. 09: Entrega fuera de plazo; Art. 12: Vulneración de seguridad en taller; Art. 18: Desviación contable o fraude en tickets; Art. 24: Uso de IA sin registro ni verificación en Bitácora; Art. 31: Infracción de convivencia o bloqueo departamental) y selecciona la cuantía de la multa (-10 €v Leve, -100 €v Grave o -200 €v Muy Grave). La sanción queda firmada automáticamente por la Agencia Reguladora correspondiente a la materia del docente:"
    }
  ]);

  mkGuiaTabla_(b, [
    ["PERFIL DOCENTE", "AGENCIA REGULADORA FIRMANTE EN EL EXPEDIENTE", "ÁMBITO DE SUPERVISIÓN PRINCIPAL"],
    ["🧪 Física y Química (FYQ)", "Agencia Estatal de Seguridad Aérea (AESA)", "Seguridad en banco de pruebas, estanqueidad, BOM y telemetría."],
    ["💰 Economía (ECO)", "Ministerio de Hacienda y Función Pública", "Solvencia, fidelidad del Libro Mayor, tickets reales y balances."],
    ["🚀 Liderazgo y Emprendimiento (LYE)", "Comisión Nacional de los Mercados y la Competencia (CNMC)", "Gobernanza interna, ética de IA, modelo de negocio y campañas."],
    ["🗣️ Lengua Castellana (LEN)", "Ministerio de Justicia", "Rigor argumentativo, comunicación institucional y Dossier de Inversores."],
    ["🇬🇧 Inglés (ING)", "Departamento de Asuntos Internos Internacionales", "Presentaciones orales y documentación en lengua extranjera."],
    ["📐 Matemáticas (MAT)", "Agencia Espacial Escolar — División de Balística (AEE)", "Rigor trigonométrico, goniómetros y cálculos de apogeo."],
    ["👑 Coordinación (COORD)", "Tribunal Supremo de la Agencia Espacial Escolar (AEE)", "Cumplimiento RGPD, disciplina general, aduanas y plazos maestros."]
  ]);

  mkGuiaSubtitulo_(b, "E. Monitor de Alertas Disciplinarias del Filtro Léxico (Zero-PII)");
  mkGuiaParrafo_(
    b,
    "Aunque la interfaz de alumnado es 100% Zero-Text, cualquier intento técnico de inyectar nombres propios (NAME) o lenguaje inapropiado (PROFANITY) en parámetros o enlaces es interceptado automáticamente por el firewall léxico de la aplicación y registrado en el panel '🚨 Alertas Disciplinarias del Filtro Léxico' (en Validaciones y Aduana). Desde ahí, Coordinación puede pulsar un botón directo para abrir un expediente sancionador a la startup infractora o archivar la alerta."
  );

  // SECCIÓN 4: MATRIZ OFICIAL DE EVALUACIÓN LOMLOE (100%)
  mkGuiaSeccion_(b, "4. Matriz Oficial de Evaluación Curricular LOMLOE (100%)");
  mkGuiaParrafo_(
    b,
    "La nota global del proyecto interdisciplinar MARS-KET 2.0 se calcula de forma automática combinando las 6 materias participantes según la siguiente ponderación oficial:"
  );

  mkGuiaTabla_(b, [
    ["ASIGNATURA", "PESO PROYECTO", "DESGLOSE DE RÚBRICA EN EL TERMINAL DOCENTE", "TIPO DE EVIDENCIA"],
    ["Física y Química (FYQ)", "25%", "• 1. Informe Preliminar (10%)\n• 2. Hoja Oficial de Taller, BOM y Control de Calidad (10%)\n• 3. Informe Técnico Final Exhaustivo (30%)\n• 4. Prototipo Físico y Lanzamiento (30%)\n• 5. Media Test de Rol y Defensa Q&A (20%)", "Ítems 1, 2 y 3: Enlace Drive visado por CEO.\nÍtems 4 y 5: Calificación directa docente."],
    ["Liderazgo y Emprendimiento (LYE)", "40%", "• 1A. Identidad y Misión Diciembre (10%)\n• 1B. Identidad y Misión Abril (10%)\n• 2. Business Model Escrito (25%)\n• 3. Business Model Canvas (15%)\n• 4A. Diario Decisiones, Conflictos e IA Dic (10%)\n• 4B. Diario Decisiones, Conflictos e IA Abr (10%)\n• 5. Defensas Orales (20%)", "Ítems 1A a 4B: Enlace Drive visado por CEO.\nÍtem 5: Calificación directa docente."],
    ["Lengua Castellana (LEN)", "15%", "• 1. Producción Oral / Pitch (50%)\n• 2. Producción Escrita — Dossier Inversores (50%)", "Ítem 1: Calificación directa en aula.\nÍtem 2: Enlace Drive visado por CEO."],
    ["Economía (ECO)", "10%", "• 1. Test de Evaluación Financiera (20%)\n• 2. Presupuesto Inicial (20%)\n• 3. Cuenta de Resultados Provisional (20%)\n• 4. Presupuesto Post-Prototipo (20%)\n• 5. Balance de Situación Final (20%)", "Ítem 1: Calificación directa en aula.\nÍtems 2 a 5: Enlace Drive visado por CEO."],
    ["Matemáticas (MAT)", "5%", "• 1. Elaboración de Goniómetro (25%)\n• 2. Informe Distancia Conocida (25%)\n• 3. Informe Dos Puntos (25%)\n• 4. Informe Final Comparativo (25%)", "Ítems 1 a 4: Enlace Drive visado por CEO."],
    ["Inglés (ING)", "5%", "• 1. Expresión Oral / Presentación (70%)\n• 2. Redacciones Escritas (30%)", "100% Calificación directa en aula (sin enlaces en Drive)."]
  ]);

  return mkGuiaFinalizar_(ctx);
}
