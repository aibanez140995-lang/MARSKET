/**
 * MARS-KET 2.0 // MODELOS RESTANTES (autónomo, sin dependencias externas)
 * Genera: DOC-IA (Bitácora IA), DOC-CRISIS (Gabinete de Crisis AEE),
 *         DOC-HR (Reporte de Inactividad), DOC-REGISTRO (Cambio de denominación / Rol Auxiliar).
 * Ejecuta generarModelosRestantes() para crearlos todos y ver los enlaces /copy en el registro.
 */

function generarModelosRestantes() {
  var urls = {
    'DOC-IA': generarModelo_DOC_IA_BITACORA(),
    'DOC-CRISIS': generarModelo_DOC_CRISIS_AEE(),
    'DOC-HR': generarModelo_DOC_HR_INACTIVIDAD(),
    'DOC-REGISTRO': generarModelo_DOC_REGISTRO_MERCANTIL()
  };
  for (var k in urls) Logger.log(k + ': ' + urls[k]);
}

// ---------------------------------------------------------------------------
// DOC-IA — Cuaderno de Bitácora y Auditoría Ética de IA (Cualquier rol -> Operaciones IA)
// ---------------------------------------------------------------------------
function generarModelo_DOC_IA_BITACORA() {
  var doc = mkNuevoDoc_("MODELO_DOC_IA_Bitacora_AstraDynamics");
  var body = doc.getBody();
  mkCabecera_(body, "OPERACIONES E IA // MARS-KET 2.0",
    "CUADERNO DE BITÁCORA Y AUDITORÍA ÉTICA DE IA",
    "EXPEDIENTE: IA-ST04-003 | EMPRESA: Astra Dynamics (ST-04) | ESTADO: PENDIENTE_VALIDACION");
  mkInstrucciones_(body, "INSTRUCCIONES PARA EL EQUIPO: Todo uso de IA generativa debe registrarse aquí ANTES de integrarse en el proyecto. Copia el prompt tal cual, pega el resultado y documenta la verificación humana. Prohibido incluir nombres reales, correos o teléfonos: usad solo alias de equipo.");

  mkTitulo_(body, "1. DATOS DE LA DECLARACIÓN");
  mkTabla_(body, [
    ["Parámetro", "Detalle"],
    ["Herramienta IA utilizada", "Google Gemini"],
    ["Autor (alias de rol)", "Dpto. Técnico (Téc_Alex_ST04)"],
    ["Fecha de uso", "20/11/2026"],
    ["Finalidad", "Revisar la coherencia del cálculo estequiométrico NaHCO₃ / ácido acético"]
  ]);

  mkTitulo_(body, "2. REGISTRO DE INTERACCIONES (Prompt y Respuesta)");
  mkTabla_(body, [
    ["#", "Prompt introducido (literal)", "Resumen de la respuesta de la IA"],
    ["1", "Explícame cómo calcular los gramos de bicarbonato necesarios para neutralizar 320 ml de vinagre al 6%.", "Planteó la reacción NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂ y propuso el cálculo con masas molares."],
    ["2", "¿Qué volumen de CO₂ se genera en condiciones normales con 80 g de bicarbonato?", "Estimó ≈ 21 L de CO₂ en condiciones normales, indicando que es un valor teórico máximo."]
  ]);

  mkTitulo_(body, "3. VERIFICACIÓN HUMANA CRÍTICA");
  mkParrafo_(body,
    "• Contraste con fuentes: Se comprobaron las masas molares en el libro de texto de FYQ (NaHCO₃ = 84 g/mol; CH₃COOH = 60 g/mol).\n" +
    "• Errores o alucinaciones detectadas: La IA asumió vinagre al 5% en el primer cálculo; se corrigió manualmente al 6% real del envase.\n" +
    "• Qué se ha aceptado y qué se ha descartado: Se aceptó el planteamiento de la reacción; se descartó el valor de empuje, no verificable en el banco de pruebas.\n" +
    "• Aprendizaje del equipo: La IA sirve de apoyo, pero los datos finales deben medirse y comprobarse en taller.");

  mkTitulo_(body, "4. DICTAMEN DE OPERACIONES E IA");
  mkTabla_(body, [
    ["Criterio", "Resultado"],
    ["Uso transparente y declarado", "[X] Conforme"],
    ["Verificación humana suficiente", "[X] Conforme"],
    ["Sin datos personales introducidos", "[X] Conforme"],
    ["Dictamen final", "[X] APROBADO Y SELLADO EN BITÁCORA   [ ] RECHAZADO"]
  ]);

  mkTitulo_(body, "5. FIRMAS");
  mkTabla_(body, [
    ["Autor del uso de IA", "Dpto. Operaciones e IA (Auditor)"],
    ["Firma: [Téc_Alex_ST04]\nFecha: 20/11/2026\nDeclaración: He verificado el contenido generado.",
     "Firma: [Ops_Mario_ST04]\nFecha: 21/11/2026\nResolución: Registro validado."]
  ]);
  return mkFinalizar_(doc);
}

// ---------------------------------------------------------------------------
// DOC-CRISIS — Comunicado de Mitigación y Descargo (CEO -> Reguladores AEE)
// ---------------------------------------------------------------------------
function generarModelo_DOC_CRISIS_AEE() {
  var doc = mkNuevoDoc_("MODELO_DOC_CRISIS_ComunicadoMitigacion_AstraDynamics");
  var body = doc.getBody();
  mkCabecera_(body, "GABINETE DE CRISIS // MARS-KET 2.0",
    "COMUNICADO OFICIAL DE MITIGACIÓN Y DESCARGO ANTE EXPEDIENTE SANCIONADOR",
    "EXPEDIENTE: CRI-ST04-001 | EMPRESA: Astra Dynamics (ST-04) | DESTINATARIO: Agencia Reguladora (AEE)");
  mkInstrucciones_(body, "INSTRUCCIONES PARA EL CEO: Cuando la empresa reciba una sanción o alerta disciplinaria, redacta este comunicado con tono formal y objetivo. Reconoce los hechos, explica las causas y propón medidas correctivas verificables. No señales a personas concretas: habla de departamentos.");

  mkTitulo_(body, "1. IDENTIFICACIÓN DEL EXPEDIENTE");
  mkTabla_(body, [
    ["Parámetro", "Detalle"],
    ["Organismo regulador", "Agencia Espacial Española (AEE)"],
    ["Artículo / infracción notificada", "Incumplimiento de plazo de entrega de la Hoja de Taller (FYQ)"],
    ["Penalización económica notificada", "-50,00 €v"],
    ["Fecha de recepción", "25/11/2026"]
  ]);

  mkTitulo_(body, "2. EXPOSICIÓN DE HECHOS Y ASUNCIÓN DE RESPONSABILIDAD");
  mkParrafo_(body,
    "La Dirección General reconoce que la Hoja de Taller no fue elevada al visado en la fecha prevista. La causa fue una incidencia tipificada de taller (desviación del centro de masas) que obligó a devolver la hoja al Dpto. Técnico y rehacer el ensamble.");

  mkTitulo_(body, "3. ALEGACIONES Y CIRCUNSTANCIAS ATENUANTES");
  mkParrafo_(body,
    "• La incidencia fue detectada por el control de calidad interno antes de cualquier ensayo, evitando un riesgo de seguridad.\n" +
    "• El retraso fue de 2 días lectivos y no afectó a otros equipos.\n" +
    "• Es la primera infracción de la empresa.");

  mkTitulo_(body, "4. PLAN DE MEDIDAS CORRECTIVAS");
  mkTabla_(body, [
    ["#", "Medida", "Responsable", "Plazo"],
    ["1", "Adelantar la revisión del BOM 5 días antes de cada entrega", "Dpto. Técnico", "Inmediato"],
    ["2", "Calendario interno de hitos visible para todos los roles", "CEO", "01/12/2026"],
    ["3", "Checklist de taller previo al visado del Operario", "Operaciones e IA", "01/12/2026"]
  ]);

  mkTitulo_(body, "5. SOLICITUD Y FIRMAS");
  mkParrafo_(body, "Se solicita la reconsideración parcial de la penalización, atendiendo a las medidas adoptadas.");
  mkTabla_(body, [
    ["Dirección General (CEO)", "Dpto. Financiero (Toma de razón)"],
    ["Firma: [CEO_Lucia_ST04]\nFecha: 26/11/2026\nDeclaración: Comunicado emitido en nombre de la empresa.",
     "Firma: [Fin_Clara_ST04]\nFecha: 26/11/2026\nToma de razón: sanción registrada en el Libro Mayor."]
  ]);
  return mkFinalizar_(doc);
}

// ---------------------------------------------------------------------------
// DOC-HR — Reporte de Inactividad / Buzón de Conflictos
// ---------------------------------------------------------------------------
function generarModelo_DOC_HR_INACTIVIDAD() {
  var doc = mkNuevoDoc_("MODELO_DOC_HR_ReporteInactividad_AstraDynamics");
  var body = doc.getBody();
  mkCabecera_(body, "RECURSOS HUMANOS // MARS-KET 2.0",
    "EXPEDIENTE HR: REPORTE DE INACTIVIDAD DEPARTAMENTAL",
    "EXPEDIENTE: HR-ST04-001 | EMPRESA: Astra Dynamics (ST-04) | ESTADO: ABIERTO");
  mkInstrucciones_(body, "INSTRUCCIONES PARA EL EQUIPO: Úsalo cuando un departamento bloquee el avance del proyecto. Describe hechos objetivos y fechas, sin juicios ni nombres reales. Antes de reportar, deja constancia de los intentos de comunicación previos.");

  mkTitulo_(body, "1. DATOS DEL REPORTE");
  mkTabla_(body, [
    ["Parámetro", "Detalle"],
    ["Departamento reportante", "Dpto. Técnico (I+D)"],
    ["Departamento reportado", "Dpto. Financiero"],
    ["Fecha del reporte", "22/11/2026"],
    ["Tarea bloqueada", "Aprobación de la orden ORD-1042"]
  ]);

  mkTitulo_(body, "2. CRONOLOGÍA DE HECHOS");
  mkTabla_(body, [
    ["Fecha", "Hecho objetivo", "Intento de resolución"],
    ["14/11/2026", "Orden ORD-1042 tramitada a Finanzas", "Notificación automática en la app"],
    ["17/11/2026", "Orden sin respuesta tras 3 días", "Recordatorio en reunión de equipo"],
    ["20/11/2026", "Orden sigue pendiente; ensayo de taller detenido", "Aviso directo al CEO"]
  ]);

  mkTitulo_(body, "3. IMPACTO EN EL PROYECTO");
  mkParrafo_(body, "El retraso impide la compra de materiales y compromete el plazo del Informe Preliminar de FYQ.");

  mkTitulo_(body, "4. SOLUCIÓN PROPUESTA");
  mkParrafo_(body, "Revisión de la orden en un máximo de 48 h y, si persiste el bloqueo, presentar una moción de auditoría a Tesorería.");

  mkTitulo_(body, "5. FIRMAS");
  mkTabla_(body, [
    ["Departamento reportante", "Dirección General (CEO)"],
    ["Firma: [Téc_Alex_ST04]\nFecha: 22/11/2026", "Firma: [CEO_Lucia_ST04]\nFecha: 22/11/2026\nAcuse de recibo del expediente."]
  ]);
  return mkFinalizar_(doc);
}

// ---------------------------------------------------------------------------
// DOC-REGISTRO — Solicitud al Registro Mercantil (cambio de denominación / Rol Auxiliar)
// ---------------------------------------------------------------------------
function generarModelo_DOC_REGISTRO_MERCANTIL() {
  var doc = mkNuevoDoc_("MODELO_DOC_REGISTRO_Mercantil_AstraDynamics");
  var body = doc.getBody();
  mkCabecera_(body, "REGISTRO MERCANTIL // MARS-KET 2.0",
    "SOLICITUD DE CAMBIO DE DENOMINACIÓN SOCIAL / ALTA DE ROL AUXILIAR",
    "EXPEDIENTE: REG-ST04-001 | EMPRESA: Astra Dynamics (ST-04) | ESTADO: PENDIENTE_COORDINACION");
  mkInstrucciones_(body, "INSTRUCCIONES PARA EL CEO: Rellena la parte que corresponda (A: cambio de nombre, B: rol observador auxiliar). El nombre no puede contener nombres reales ni lenguaje ofensivo. Coordinación Docente resuelve la solicitud.");

  mkTitulo_(body, "A. CAMBIO DE DENOMINACIÓN SOCIAL");
  mkTabla_(body, [
    ["Parámetro", "Detalle"],
    ["Denominación actual", "Astra Dynamics"],
    ["Denominación propuesta", "Astra Orbital Systems"],
    ["Motivo del cambio", "Reorientación de la marca hacia lanzadores de órbita baja tras el pivote de producto."],
    ["Efectos", "El historial contable y el código de empresa permanecen intactos."]
  ]);

  mkTitulo_(body, "B. ALTA DE ROL OBSERVADOR (AUXILIAR)");
  mkTabla_(body, [
    ["Parámetro", "Detalle"],
    ["Departamento al que presta apoyo", "Dpto. Marketing"],
    ["Funciones previstas", "Apoyo en diseño de cartelería y redacción del dossier de inversores."],
    ["Acuerdo de la asamblea", "Aprobado por unanimidad (ver acta MOC-2026-ST04-01)"]
  ]);

  mkTitulo_(body, "FIRMAS Y RESOLUCIÓN");
  mkTabla_(body, [
    ["Dirección General (CEO)", "Coordinación Docente"],
    ["Firma: [CEO_Lucia_ST04]\nFecha: 27/11/2026\nSolicito el trámite descrito.", "Resolución: [ ] APROBADO   [ ] DENEGADO\nFecha: ____/____/______"]
  ]);
  return mkFinalizar_(doc);
}

// ---------------------------------------------------------------------------
// UTILIDADES (prefijo mk*_ para no chocar con funciones previas)
// ---------------------------------------------------------------------------
function mkNuevoDoc_(nombre) {
  var doc = DocumentApp.create(nombre);
  var b = doc.getBody();
  b.setMarginTop(36); b.setMarginBottom(36); b.setMarginLeft(40); b.setMarginRight(40);
  return doc;
}

function mkCabecera_(body, sub, titulo, meta) {
  body.appendParagraph(sub).setFontFamily("Consolas").setFontSize(9).setForegroundColor("#0284c7").setBold(true);
  body.appendParagraph(titulo).setFontFamily("Arial").setFontSize(14).setForegroundColor("#0f172a").setBold(true).setSpacingAfter(4);
  body.appendParagraph(meta).setFontFamily("Consolas").setFontSize(8.5).setForegroundColor("#64748b").setSpacingAfter(12);
}

function mkInstrucciones_(body, texto) {
  var t = body.appendTable([[texto]]);
  t.setBorderColor("#38bdf8").setBorderWidth(1);
  var c = t.getRow(0).getCell(0);
  c.setBackgroundColor("#f0f9ff");
  c.getChild(0).asParagraph().setFontFamily("Consolas").setFontSize(8.5).setForegroundColor("#0369a1");
  body.appendParagraph("").setSpacingAfter(6);
}

function mkTitulo_(body, texto) {
  body.appendParagraph(texto).setHeading(DocumentApp.ParagraphHeading.HEADING2);
}

function mkParrafo_(body, texto) {
  body.appendParagraph(texto).setFontFamily("Arial").setFontSize(9.5);
}

function mkTabla_(body, datos) {
  var tabla = body.appendTable(datos);
  tabla.setBorderColor("#cbd5e1").setBorderWidth(1);
  var h = tabla.getRow(0);
  for (var i = 0; i < h.getNumCells(); i++) {
    var c = h.getCell(i);
    c.setBackgroundColor("#0f172a");
    c.getChild(0).asParagraph().setFontFamily("Arial").setFontSize(9).setBold(true).setForegroundColor("#ffffff");
  }
  for (var r = 1; r < tabla.getNumRows(); r++) {
    var row = tabla.getRow(r);
    for (var j = 0; j < row.getNumCells(); j++) {
      var cell = row.getCell(j);
      if (r % 2 === 0) cell.setBackgroundColor("#f8fafc");
      cell.getChild(0).asParagraph().setFontFamily("Arial").setFontSize(8.5);
    }
  }
  body.appendParagraph("").setSpacingAfter(8);
}

function mkFinalizar_(doc) {
  doc.saveAndClose();
  DriveApp.getFileById(doc.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var url = "https://docs.google.com/document/d/" + doc.getId() + "/copy";
  Logger.log("✅ " + doc.getName() + ": " + url);
  return url;
}
