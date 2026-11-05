/**
 * ====================================================================
 * MARS-KET 2.0 — GENERADOR MAESTRO DEL MANUAL DE USO Y GUÍAS DE ROL
 * Código para Google Apps Script (motor V8)
 * Generado por @apps-script-doc-architect
 * ====================================================================
 * 
 * INSTRUCCIONES DE USO:
 * 1. Abre https://script.new (o tu consola de Google Apps Script).
 * 2. Pega este código completo en el archivo Code.gs (reemplazando cualquier contenido previo).
 * 3. En la barra superior, asegúrate de que esté seleccionada la función "generarManualMarsket" y pulsa "Ejecutar" (Run).
 * 4. Otorga los permisos habituales de Google Drive y DocumentApp la primera vez.
 * 5. Abre el enlace que aparecerá en el Registro de Ejecución (Execution Log).
 * ====================================================================
 */

// 1. SISTEMA DE DISEÑO EDITORIAL Y PALETA DE COLORES
const MARSKET_THEME = {
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
    crimsonDanger: '#DC2626',  // Carmesí sanciones y alertas
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
 * Función principal que crea y maqueta el Documento Oficial
 */
function generarManualMarsket() {
  const docTitle = "MARS-KET 2.0 — Manual Exhaustivo de Uso y Guías Rápidas de Rol";
  const doc = DocumentApp.create(docTitle);
  const body = doc.getBody();

  // Configuración de página y márgenes (54 pt = 1.9 cm)
  body.setMarginTop(54);
  body.setMarginBottom(54);
  body.setMarginLeft(54);
  body.setMarginRight(54);

  setupHeaderAndFooter(doc);

  // -------------------------------------------------------------
  // PORTADA INSTITUCIONAL EDITORIAL
  // -------------------------------------------------------------
  addCoverPage(body);
  body.appendPageBreak();

  // -------------------------------------------------------------
  // ÍNDICE GENERAL ESTRUCTURADO
  // -------------------------------------------------------------
  addHeading1(body, "Índice General de Contenidos");
  addMutedParagraph(body, "Este documento integra tanto el manual de procedimientos detallado paso a paso para el aula, como las fichas de consulta rápida de una sola página por cada perfil de usuario.");

  addCallout(body, 
    "ESTRUCTURA DEL DOCUMENTO",
    "El presente manual se divide en tres bloques operativos independientes para facilitar la consulta rápida en clase:\n" +
    "• Bloque I (Alumnado): Circuitos de uso, interfaces por rol y entregables evaluables.\n" +
    "• Bloque II (Docentes): Validación aduanera, rúbricas LOMLOE y monitor de integridad.\n" +
    "• Bloque III (Fichas de Rol): Resúmenes ejecutivos de 1 página por puesto de trabajo.",
    "info"
  );

  const tocHeaders = ["Sección / Bloque Operativo", "Destinatarios y Alcance"];
  const tocRows = [
    ["BLOQUE I: Manual de Uso Exhaustivo para el Alumnado", "Startup, Departamentos, Compras I+D, Vuelo y Entregables"],
    ["  1. Acceso al Sistema y Entorno de Trabajo (HUD)", "Toda la plantilla (CEO, FIN, TEC, OPS, MKT)"],
    ["  2. Coordinación y Gestión Estratégica (CEO)", "Dirección General (Estatutos, Actas y Prensa)"],
    ["  3. Finanzas, Tesorería y Contabilidad B2B", "Finanzas (Facturas, Ledger, Nóminas e Impuestos)"],
    ["  4. Dirección Técnica, I+D y Banco de Pruebas", "Técnico (Compras/Ventas B2B y Registro de Vuelos)"],
    ["  5. Operaciones, Verificación Física y Taller", "Operaciones (Tienda física, Recibos y Montaje)"],
    ["  6. Marketing, Marca y Comunicación Oficial", "Marketing (Campañas, Canvas, Brief y Branding)"],
    ["  7. Bitácora de Inteligencia Artificial (AI Hub)", "Toda la empresa (Registro ético de prompts)"],
    ["  8. Circuito Curricular Oficial (18 Entregables)", "100% Ponderado LOMLOE (Drive Oficial)"],
    ["BLOQUE II: Manual de Gestión y Supervisión Docente", "Claustro Interdisciplinar y Coordinación de Misión"],
    ["  1. Acceso a Coordinación y Monitor Global de Misión", "Supervisión en tiempo real de 6 clases (A-F + TEST)"],
    ["  2. Gestión de Estados de Fase y Bloqueos de Trámites", "Apertura progresiva y control de licencias AESA"],
    ["  3. Validación Aduanera y Mercado Secundario B2B", "Aprobación de transacciones y reembolso automático"],
    ["  4. Rúbricas Curriculares LOMLOE y Evaluación Continua", "Calificación por descriptores operativos LOMLOE"],
    ["  5. Acta General Oficial y Concurso Aeroespacial", "Cálculo global ponderado al 100% y ranking final"],
    ["  6. Panel de Integridad, Llavero Maestro y Soporte", "Reseteo de PINs, auditoría de logs y contingencias"],
    ["BLOQUE III: Cuadernillo de Guías Rápidas de Rol (1 Pág)", "Hojas de referencia rápida para imprimir o consultar"],
    ["  • Ficha 1: CEO / Dirección General", "Checklist de 3 minutos, responsabilidades y entregables"],
    ["  • Ficha 2: Director/a de Finanzas", "Checklist de 3 minutos, contabilidad y ledger"],
    ["  • Ficha 3: Director/a Técnico (I+D)", "Checklist de 3 minutos, compras B2B y banco de pruebas"],
    ["  • Ficha 4: Director/a de Operaciones", "Checklist de 3 minutos, taller físico y verificación"],
    ["  • Ficha 5: Director/a de Marketing", "Checklist de 3 minutos, campañas y business model"],
    ["  • Ficha 6: Claustro Docente y Coordinador", "Checklist de supervisión de clase y trámites aduaneros"]
  ];
  addStyledTable(body, tocHeaders, tocRows, [240, 264]);

  body.appendPageBreak();

  // =============================================================
  // BLOQUE I: MANUAL DE USO EXHAUSTIVO PARA EL ALUMNADO
  // =============================================================
  addHeading1(body, "BLOQUE I: Manual de Uso Exhaustivo para el Alumnado");
  addLeadParagraph(body, "Guía operativa completa para la gestión de la startup aeroespacial en MARS-KET 2.0, flujos interdepartamentales y circuito curricular de entregas.");

  addCallout(body, 
    "POLÍTICA ZERO-TEXT Y PROTECCIÓN DEL MENOR (RGPD / LOPDGDD ART. 7)",
    "En cumplimiento estricto del RGPD para entornos escolares, está terminantemente prohibido escribir nombres propios, apellidos, teléfonos o datos personales en cualquier campo de la plataforma. Todo intercambio y justificación se canaliza mediante selectores tipificados y enlaces a documentos oficiales de Google Docs / Google Drive configurados con permisos de lectura.",
    "alert"
  );

  // Sección 1: Acceso y HUD
  addHeading2(body, "1. Acceso al Sistema y Entorno de Trabajo");
  addParagraph(body, "El acceso de los alumnos a la plataforma se realiza en dos etapas mediante verificación de credenciales seguras:");
  addBulletPoint(body, "Paso 1 — Código Privado de Empresa: En la pantalla 'SECURE_GATEWAY', introduce el código alfanumérico asignado por Coordinación a tu startup y pulsa [ VALIDAR CÓDIGO ].");
  addBulletPoint(body, "Paso 2 — Puesto y PIN Departamental: Selecciona tu departamento en el desplegable y marca tu PIN de 4 dígitos en el teclado virtual o teclado físico. Al cuarto dígito, la plataforma abrirá directamente la pantalla de tu especialidad.");

  addParagraph(body, "Elementos clave de la Cabecera Superior (HUD):");
  addBulletPoint(body, "Estado de Sincronización [D1: SYNCED] (o nube verde en móviles): Indica que los datos contables y trámites están sincronizados en tiempo real con la nube. Si la conexión se interrumpe, la terminal se bloqueará por seguridad hasta que pulses [ REINTENTAR ENLACE D1 ].");
  addBulletPoint(body, "Barra Táctica: Botón [ NOVEDADES ] (mejoras de versión), [ SUGERENCIA ] (buzón de consultas tipificadas a Coordinación), [ GUÍA ] (ayuda contextual en pantalla) y [ SALIR ] (cierre seguro de sesión con purga de memoria local).");

  // Sección 2: Circuito de Entrega y Ponderaciones
  addHeading2(body, "2. Plantillas Oficiales y Circuito de Entrega en 4 Pasos");
  addParagraph(body, "Todo entregable curricular de la misión parte de una plantilla institucional en Google Docs. El proceso consta de cuatro fases inalterables:");
  addBulletPoint(body, "Paso 1 (Plantilla Oficial): Pulsa 'Ver Plantilla Oficial ↗' para abrir automáticamente una copia en blanco (/copy) en el Google Drive de vuestro equipo.");
  addBulletPoint(body, "Paso 2 (Redacción y Permisos): Trabajad el documento en equipo asegurando que en 'Compartir' esté configurado como 'Cualquier persona con el enlace: Lector' (o acceso para el claustro docente).");
  addBulletPoint(body, "Paso 3 (Envío al CEO en 'Mis Entregables'): El departamento responsable pulsa [ SUBIR ENLACE DRIVE Y ENVIAR AL CEO ] pegando la URL de Drive. (Caso especial de la Hoja de Taller DOC_10: Técnico diseña el BOM ➔ Operaciones comprueba el montaje físico en taller y valida ➔ CEO revisa).");
  addBulletPoint(body, "Paso 4 (Visado del CEO y Evaluación): El CEO examina el documento en su Bandeja de Visado y pulsa [ VISAR Y ENTREGAR AL DOCENTE ] o lo devuelve a su departamento con correcciones tipificadas.");

  addCallout(body,
    "DISTRIBUCIÓN DEL ACTA GENERAL PONDERADA (100% NOTA GLOBAL)",
    "Física y Química (25%) + Liderazgo y Emprendimiento (40%) + Lengua Castellana (15%) + Economía (10%) + Matemáticas (5%) + Inglés (5%).",
    "info"
  );

  // Tabla con los 18 Entregables Oficiales
  addHeading3(body, "Matriz Oficial de los 18 Entregables Curriculares");
  const delivHeaders = ["Materia", "Hito / Entregable Oficial", "Fase", "Dpto. Responsable", "Peso en Materia"];
  const delivRows = [
    ["FYQ (25%)", "1. Informe Técnico Preliminar, Boceto y Foto", "Fase I", "TÉCNICO", "10% FYQ"],
    ["FYQ (25%)", "2. Hoja Oficial de Taller, BOM y Calidad (DOC_10)", "Fase III", "TÉCNICO + OPERACIONES", "10% FYQ"],
    ["FYQ (25%)", "3. Informe Técnico Final Exhaustivo", "Fase IV", "TÉCNICO", "30% FYQ"],
    ["FYQ (25%)", "4. Prototipo Físico y Prueba de Lanzamiento", "Fases II-V", "EQUIPO", "30% FYQ (Directa)"],
    ["FYQ (25%)", "5. Test de Rol y Defensa Q&A", "Fases I-IV", "EQUIPO", "20% FYQ (Directa)"],
    ["LYE (40%)", "1A. Nombre, Logo, Tagline e Imagen (Diciembre)", "Fase I", "MARKETING", "10% LYE"],
    ["LYE (40%)", "1B. Identidad de Marca y Manual (Abril)", "Fase III", "MARKETING", "10% LYE"],
    ["LYE (40%)", "2. Business Model — Documento Escrito", "Fase III", "MARKETING", "25% LYE"],
    ["LYE (40%)", "3. Business Model Canvas (Lienzo Estratégico)", "Fase IV", "MARKETING", "15% LYE"],
    ["LYE (40%)", "4A. Diario de Decisiones y Bitácora IA (Dic, DOC_4)", "Fase I", "OPERACIONES_IA", "10% LYE"],
    ["LYE (40%)", "4B. Diario de Decisiones y Bitácora IA (Abr, DOC_4)", "Fase IV", "OPERACIONES_IA", "10% LYE"],
    ["LYE (40%)", "Defensas Orales de Emprendimiento", "Fases I-V", "EQUIPO", "20% LYE (Directa)"],
    ["LEN (15%)", "1. Producción Oral (Pitch y Exposiciones)", "Fases I-V", "EQUIPO", "50% LEN (Directa)"],
    ["LEN (15%)", "2. Dossier para Inversores (Texto Argumentativo)", "Fase IV", "MARKETING", "40% LEN"],
    ["LEN (15%)", "3. Conjunto de Notas de Prensa (DOC_15, F1 a F4)", "Fases I-IV", "CEO (a Lengua y Coord.)", "10% LEN"],
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

  // Sección 3: Manual por Departamentos
  addHeading2(body, "3. Manual de Operaciones por Departamento");

  addHeading3(body, "A. Dirección General (CEO)");
  addParagraph(body, "El CEO coordina el avance global de la startup, la gobernanza interna y el visado de toda la documentación corporativa.");
  addBulletPoint(body, "Bandeja de Visado Ejecutivo ('Sala de Mando'): Revisa borradores de entregables de todos los departamentos, avala propuestas de slogan (DOC_11), autoriza solicitudes de material I+D (DOC_13) y visa fichas de campaña (DOC_12).");
  addBulletPoint(body, "Firma de Contratos Comerciales ('Contratos & Patrocinios'): Durante los primeros 3 días lectivos de cada fase (I a IV), el CEO puede firmar exactamente un (1) contrato comercial por fase de entre los 6 ofertados. Cumplir las condiciones otorga recompensa en €v; incumplirlas acarrea penalización.");
  addBulletPoint(body, "Escala de Patrocinios de Fase I: Consulta los cinco niveles de patrocinio (Oro +500 €v, Plata +400 €v, Bronce +250 €v, Cobre +150 €v, Colaborador +100 €v) otorgados tras el Micro-Pitch en inglés, que reducen la factura operativa neta.");
  addBulletPoint(body, "Licencia de Lanzamiento AESA (DOC_14, tasa 50 €v): Permanece estrictamente bloqueada hasta que el Informe Técnico Preliminar de FYQ ha sido visado y entregado al docente. Una vez desbloqueada, el CEO adjunta el DOC_14 y abona 50 €v para que el claustro autorice los ensayos en el Banco de Pruebas.");
  addBulletPoint(body, "Notas de Prensa Oficiales (DOC_15 — 10% de Lengua Castellana): Al cierre de cada fase (I, II, III y IV), el CEO dispone de 7 días para redactar y publicar la Nota de Prensa en el Tablón de Noticias. Estas notas se entregan al profesor de Lengua y al Coordinador Docente para su calificación (10% de LEN).");
  addBulletPoint(body, "Gobernanza y Trámites ('Trámites'): Tramita modificaciones de denominación social (DOC_1, 50 €v), convoca mociones asamblearias (DOC_6), registra actas de comité (DOC_16), consulta el historial de multas AEE y emite comunicados de crisis (DOC_3) si reciben una sanción.");

  addHeading3(body, "B. Departamento Técnico e I+D (TÉCNICO)");
  addParagraph(body, "El Técnico es el responsable del diseño aerodinámico, el banco de pruebas de vuelo y la adquisición y venta de materiales.");
  addCallout(body, 
    "EXCLUSIVIDAD TOTAL EN COMPRAS Y VENTAS DE MATERIALES",
    "El Técnico es el ÚNICO rol de la empresa autorizado para comprar componentes en el Catálogo B2C, adquirir piezas de 2ª mano en el Mercado B2B y poner a la venta excedentes de inventario desde el Taller. Operaciones NO compra ni vende piezas.",
    "warning"
  );
  addBulletPoint(body, "Compras en Catálogo Oficial B2C ('SUPER-MARSKET'): Añade botellas, alerones, ojivas y válvulas al Carrito. En el Carrito, adjunta la Orden de Adquisición (DOC_9) y la transmite a Finanzas para su pago.");
  addBulletPoint(body, "Mercado de Segunda Mano B2B ('SUPER-MARSKET' -> B2B): Puede adquirir excedentes publicados por otras startups de la clase. Al pulsar comprar, la pieza se bloquea de inmediato para evitar dobles ventas y se remite a la Aduana Docente.");
  addBulletPoint(body, "Venta de Excedentes B2B ('Taller'): En la lista de inventario ejecutado, pulsa [VENDER B2B] en piezas sobrantes que no estén montadas en el BOM, fijando precio en €v y adjuntando la Memoria de Desinversión (DOC_7).");
  addBulletPoint(body, "Solicitud de Material Especial I+D (DOC_13): Si requiere piezas especiales fuera de catálogo, las solicita al CEO mediante el modelo DOC_13 en el Banco I+D.");
  addBulletPoint(body, "Banco de Pruebas de Vuelo ('Banco I+D'): Sirve exclusivamente para registrar los vuelos de prueba (requiere Licencia AESA concedida). Selecciona fuselaje/botella, anota gramos de NaHCO3, mililitros de vinagre, coste del ensayo (€v) y altura alcanzada en milímetros (mm). La app calcula automáticamente la Eficiencia (E = Altura / Coste).");
  addBulletPoint(body, "Configuración del BOM y Hoja de Taller ('Taller'): Marca qué piezas forman el escandallo activo (BOM), redacta la Hoja de Taller (DOC_10) y la envía a Operaciones para su montaje físico.");
  addBulletPoint(body, "Entregables FYQ: Redacta y sube el Informe Técnico Preliminar (Fase I) y el Informe Técnico Final Exhaustivo (Fase IV).");

  addHeading3(body, "C. Departamento Financiero (FINANZAS)");
  addParagraph(body, "Finanzas custodia la liquidez, autoriza presupuestos y audita la contabilidad corporativa.");
  addBulletPoint(body, "Bóveda de Autorización Presupuestaria: Audita las órdenes de compra de materiales de Técnico (DOC_9) y las solicitudes de paquetes publicitarios de Marketing (DOC_5). Pulsa Autorizar (descontando €v de tesorería) o Rechazar.");
  addBulletPoint(body, "Libro Mayor (Ledger Contable): Supervisa en tiempo real todos los asientos contables para evitar saldos críticos (< 300 €v) o descuadres en las memorias de Economía.");
  addBulletPoint(body, "Balances Contables de Cierre de Fase (DOC_17): Al término de cada una de las 4 fases, emite el balance formal de cierre seleccionando el dictamen de auditoría interna y adjuntando el DOC_17.");
  addBulletPoint(body, "Entregables de Economía: Elabora y entrega el Presupuesto Inicial (F1), Presupuesto Post-Prototipo (F2), Balance de Situación (F3) y Cuenta de Resultados (F4).");

  addHeading3(body, "D. Departamento de Marketing (MARKETING)");
  addParagraph(body, "Marketing lidera la identidad de marca, las campañas publicitarias y la formulación del modelo de negocio.");
  addBulletPoint(body, "Logotipo y Slogan Oficial ('Marca & MKT'): Registra el escudo en Drive y presenta la propuesta de slogan corporativo mediante el DOC_11 para que el CEO la avale y Coordinación la inscriba oficialmente en el HUD.");
  addBulletPoint(body, "Contratación de Paquetes de Campaña ('Campañas'): Elige entre Pack Satélite (200 €v, 3 acc.), Prensa Tradicional (300 €v, 3 acc.), Despegue Híbrido (450 €v, 4 acc.) o Cobertura Supernova (750 €v, 6 acc.). Al pulsar [Contratar], adjunta obligatoriamente en ese momento el Brief Creativo y Justificación ROI (DOC_5) para que Finanzas apruebe el gasto.");
  addBulletPoint(body, "Ejecución de Acciones Publicitarias: Con el paquete activo en Finanzas, pulsa [+ Publicar Acción] por cada creatividad ejecutada, adjuntando la Ficha Técnica oficial (DOC_12) para validación del CEO y del docente de Liderazgo.");
  addBulletPoint(body, "Los 5 Entregables Curriculares de Marketing: Identidad de Marca Diciembre (10% LYE), Identidad de Marca Abril (10% LYE), Business Model Escrito (25% LYE), Business Model Canvas (15% LYE) y Dossier para Inversores (40% Lengua Castellana).");

  addHeading3(body, "E. Departamento de Operaciones e IA (OPERACIONES_IA)");
  addParagraph(body, "Operaciones garantiza la logística física de taller, la comprobación de montajes, la bitácora ética de IA y los cálculos trigonométricos.");
  addBulletPoint(body, "Registro de Compra Física y Montaje ('Taller Ensamble'): Cuando Finanzas aprueba una compra del Técnico, Operaciones anota el coste real en euros (€), el comercio físico (Mercadona, Carrefour, Ferretería, etc.) y la URL del ticket en Drive, y pulsa [ CONFIRMAR COMPRA FÍSICA Y ENSAMBLAJE ]. (Operaciones no compra ni vende en la app).");
  addBulletPoint(body, "Control de Calidad en Hoja de Taller (DOC_10 — 10% FYQ): Recibe la Hoja de Taller enviada por Técnico, revisa en el taller físico que las piezas coincidan con el BOM y pulsa [ VALIDAR ENSAMBLE Y REMITIR A CEO ].");
  addBulletPoint(body, "Cuaderno de Bitácora y Auditoría Ética de IA (DOC_4): Registra cada consulta a herramientas de IA autorizadas (Gemini, ChatGPT, Claude, Copilot, Perplexity, DeepSeek) indicando propósito y método de contraste empírico.");
  addBulletPoint(body, "Entregables de Matemáticas (Fase II) y Liderazgo: Sube el Goniómetro y los 3 informes trigonométricos de apogeo para Matemáticas (25% c/u), además de los Diarios de Decisiones de Diciembre y Abril para LYE (10% c/u).");

  body.appendPageBreak();

  // =============================================================
  // BLOQUE II: MANUAL EXHAUSTIVO PARA EL PROFESORADO Y COORDINACIÓN
  // =============================================================
  addHeading1(body, "BLOQUE II: Manual Exhaustivo para el Claustro Docente y Coordinación");
  addLeadParagraph(body, "Guía de supervisión, evaluación por rúbricas LOMLOE, aduanas operativas y herramientas de administración central para profesores y coordinadores.");

  addHeading2(body, "1. Acceso a la Consola Restringida del Claustro");
  addBulletPoint(body, "Doble Clic en Logotipo: En la pantalla de login principal de la aplicación, haz doble clic (o doble toque táctil) sobre el escudo central de MARS-KET 2.0.");
  addBulletPoint(body, "Terminal de Acceso Nivel AEE: Introduce el Código de Autorización de Misión (facilitado por Coordinación) y pulsa [ VERIFICAR AUTORIZACIÓN ].");
  addBulletPoint(body, "Selección de Perfil y PIN: Selecciona tu especialidad docente (FYQ, ECO, LYE, LEN, MAT, ING, COORD_MARIO o COORD_ALEX) y marca tu PIN de 4 dígitos.");

  addHeading2(body, "2. El Radar de Misión por Clases (Sincronización en 1 Clic)");
  addParagraph(body, "Ubicado en la parte superior del panel docente, permite alternar entre TODAS, CLASE A a CLASE F y TEST. Al seleccionar una clase, todas las pantallas (Rúbricas, Aduana, Contratos y Llavero Maestro) se filtran de forma coordinada, mostrando alertas de trámites pendientes (⚠️), entregas recibidas (📄) y empresas con saldo crítico < 300 €v (💸).");

  addHeading2(body, "3. Modo Aula // Calificación y Gestión Diaria");
  addBulletPoint(body, "Pestaña 'Rúbricas y Entregas': Calificación numérica (0 a 10) de cada criterio oficial de la asignatura con cálculo automático de la nota ponderada. Permite abrir los enlaces de Google Drive de los alumnos y devolver documentos para subsanación si los permisos están cerrados o faltan apartados.");
  addBulletPoint(body, "Evaluación de Lengua Castellana (LEN) y Coordinación: Califican la Producción Oral (50%), el Dossier para Inversores entregado por Marketing (40%) y el Conjunto de las 4 Notas de Prensa Corporativas DOC_15 publicadas por el CEO (10%).");
  addBulletPoint(body, "Pestaña 'Validaciones y Aduana': Resolución inmediata de licencias AESA (DOC_14), tasación de materiales especiales I+D (DOC_13), validación de fichas de campaña (DOC_12), aprobación de contratos B2B entre empresas (con reembolso automático de fondos a compradores competidores), inyección de patrocinios de Fase I y aplicación de sanciones normativas AEE.");
  addBulletPoint(body, "Pestaña 'Contratos & Misiones': Verificación de cumplimiento del contrato comercial firmado por el CEO al cierre de cada fase para autorizar la recompensa en €v o aplicar la penalización.");
  addBulletPoint(body, "Pestaña 'Tablón de Noticias': Publicación y edición de crónicas oficiales con editor enriquecido (negrita, cursiva, párrafos, viñetas) e imágenes generadas mediante IA Nano Banana 3.");

  addHeading2(body, "4. Modo Administración del Centro (TIC) — Exclusivo Coordinación");
  addParagraph(body, "Los coordinadores disponen del conmutador superior '⚙️ ADMINISTRACIÓN DEL CENTRO (TIC)' con 7 herramientas maestras:");
  addBulletPoint(body, "Startups & Llavero Maestro: Creación de empresas, regeneración de Códigos de Acceso y PINs de roles, e impresión de credenciales en PDF A4.");
  addBulletPoint(body, "Cronograma Maestro: Ajuste de fechas de apertura/límite de entregables y gestión del Buzón de Sugerencias de los alumnos.");
  addBulletPoint(body, "Copias de Seguridad (D1): Exportación e importación de snapshots JSON completos de la base de datos y forzado de sincronización cloud.");
  addBulletPoint(body, "Gestión de Catálogo Oficial: Edición de stock y descarga directa del Catálogo Oficial en PDF A4 (filtrando automáticamente componentes I+D) y en CSV.");
  addBulletPoint(body, "Monitor Léxico, Telemetría y Auditoría de Contratos: Supervisión de alertas LOPD, estadísticas de acceso por rol y control global de contratos suscritos.");

  body.appendPageBreak();

  // =============================================================
  // BLOQUE III: GUÍAS RÁPIDAS DE 1 PÁGINA (ONE-PAGERS IMPRIMIBLES)
  // =============================================================
  addHeading1(body, "BLOQUE III: Cuadernillo de Guías Rápidas por Perfil");
  addLeadParagraph(body, "Fichas sintéticas de una sola página por cada rol de alumno y docente, diseñadas para su consulta rápida en el aula o impresión individual.");

  // Ficha 1: CEO
  body.appendPageBreak();
  addHeading2(body, "GUÍA RÁPIDA // DIRECCIÓN GENERAL (CEO)");
  addMutedParagraph(body, "Misión: Liderazgo institucional, gobernanza, supervisión de entregas y comunicación corporativa.");
  addCallout(body, "TU PANTALLA PRINCIPAL: 🎖️ Sala de Mando", "Entra directamente a tu panel directivo con el indicador de tesorería, bandeja de visado y licencias.", "info");
  
  addHeading3(body, "Tus 5 Tareas Clave durante el Proyecto:");
  addNumberedPoint(body, 1, "Firmar 1 Contrato Comercial por Fase ('Contratos & Patrocinios'): Durante los primeros 3 días lectivos de cada fase (I a IV), selecciona y firma exactamente un (1) contrato comercial.");
  addNumberedPoint(body, 2, "Bandeja de Visado Ejecutivo: Revisa los borradores de entregables de tu equipo. Pulsa [ VISAR Y ENTREGAR AL DOCENTE ] para remitirlos al profesor o [ DEVOLVER ] indicando motivo tipificado.");
  addNumberedPoint(body, 3, "Licencia de Lanzamiento AESA (DOC_14, 50 €v): Cuando Técnico haya entregado el Informe Preliminar de FYQ, tramita la Licencia AESA en la Sala de Mando para desbloquear los vuelos.");
  addNumberedPoint(body, 4, "Publicar las 4 Notas de Prensa (DOC_15 — 10% Lengua): Al cierre de cada fase, dispones de 7 días para publicar la Nota de Prensa en el Tablón de Noticias (evaluada por el profesor de Lengua y Coordinación).");
  addNumberedPoint(body, 5, "Gobernanza y Asambleas ('Trámites'): Convoca mociones (DOC_6), registra actas de comité (DOC_16), solicita cambio de nombre si procede (DOC_1, 50 €v) y avala el Slogan (DOC_11).");

  // Ficha 2: TÉCNICO
  body.appendPageBreak();
  addHeading2(body, "GUÍA RÁPIDA // DPTO. TÉCNICO E I+D (TÉCNICO)");
  addMutedParagraph(body, "Misión: Ingeniería de propulsión, compras y ventas exclusivas de piezas, banco de pruebas y memorias FYQ.");
  addCallout(body, "TU PANTALLA PRINCIPAL: 🛒 SUPER-MARSKET, 🔧 Taller y 🧪 Banco I+D", "Controlas el aprovisionamiento, los excedentes B2B y el registro de ensayos de vuelo.", "info");

  addHeading3(body, "Tus 5 Tareas Clave durante el Proyecto:");
  addNumberedPoint(body, 1, "Único Rol Autorizado en Compras y Ventas: Eres el único que añade piezas al Carrito B2C con la Orden DOC_9, adquiere piezas de 2ª mano en B2B y pone en venta excedentes de inventario desde el Taller con el botón [VENDER B2B] y la plantilla DOC_7.");
  addNumberedPoint(body, 2, "Solicitud de Material Especial I+D (DOC_13): Si necesitas componentes que no están en el catálogo, solicítalos al CEO en el Banco I+D para que los eleve a Coordinación.");
  addNumberedPoint(body, 3, "Banco de Pruebas de Vuelo ('Banco I+D'): Cuando tengáis Licencia AESA, registra cada vuelo real (botella, bicarbonato en g, vinagre en ml, coste €v y altura en mm). La app calcula la Eficiencia (E = H/C).");
  addNumberedPoint(body, 4, "Configurar el BOM y Hoja de Taller ('Taller'): Marca las piezas montadas en el prototipo y envía la Hoja de Taller (DOC_10) a Operaciones para que verifique el ensamble físico.");
  addNumberedPoint(body, 5, "Entregables de Física y Química: Redacta y sube en 'Mis Entregables' el Informe Técnico Preliminar (Fase I) y el Informe Técnico Final Exhaustivo (Fase IV).");

  // Ficha 3: FINANZAS
  body.appendPageBreak();
  addHeading2(body, "GUÍA RÁPIDA // DPTO. FINANCIERO (FINANZAS)");
  addMutedParagraph(body, "Misión: Custodia de la tesorería virtual (€v), auditoría contable y entregables de Economía.");
  addCallout(body, "TU PANTALLA PRINCIPAL: 💰 Finanzas & ECO", "Supervisas la tesorería, el Libro Mayor y la autorización de todas las partidas de gasto.", "info");

  addHeading3(body, "Tus 4 Tareas Clave durante el Proyecto:");
  addNumberedPoint(body, 1, "Bóveda de Autorización Presupuestaria: Revisa en la Bóveda las órdenes de compra de materiales de Técnico (DOC_9) y los paquetes publicitarios de Marketing (DOC_5). Examina el documento en Drive y autoriza el pago o recházalo.");
  addNumberedPoint(body, 2, "Vigilancia del Libro Mayor (Ledger): Audita que todos los cobros y pagos cuadren y que la tesorería nunca caiga en el umbral crítico de alerta (< 300 €v).");
  addNumberedPoint(body, 3, "Balances de Cierre de Fase (DOC_17): Al término de cada una de las 4 fases, emite el balance contable oficial seleccionando el dictamen de auditoría y adjuntando el DOC_17.");
  addNumberedPoint(body, 4, "Los 4 Entregables de Economía: Elabora y sube el Presupuesto Inicial (Fase I), Presupuesto Post-Prototipo (Fase II), Balance de Situación (Fase III) y Cuenta de Resultados (Fase IV).");

  // Ficha 4: MARKETING
  body.appendPageBreak();
  addHeading2(body, "GUÍA RÁPIDA // DPTO. DE MARKETING (MARKETING)");
  addMutedParagraph(body, "Misión: Identidad de marca, contratación de campañas, modelo de negocio y dossier para inversores.");
  addCallout(body, "TU PANTALLA PRINCIPAL: 🎨 Marca & MKT y 📢 Campañas", "Configuras la identidad gráfica, contratas paquetes publicitarios y lideras los entregables de negocio.", "info");

  addHeading3(body, "Tus 4 Tareas Clave durante el Proyecto:");
  addNumberedPoint(body, 1, "Logotipo y Slogan Oficial ('Marca & MKT'): Vincula el logotipo corporativo y presenta la propuesta de slogan oficial mediante el DOC_11 para que el CEO la avale y Coordinación la registre en el HUD.");
  addNumberedPoint(body, 2, "Contratación de Campañas ('Campañas'): Selecciona el paquete publicitario deseado y, al pulsar [Contratar], adjunta obligatoriamente el Brief Creativo y ROI (DOC_5) para que Finanzas lo apruebe.");
  addNumberedPoint(body, 3, "Publicar Acciones Publicitarias: Con el paquete activo, pulsa [+ Publicar Acción] por cada creatividad ejecutada, adjuntando la Ficha Técnica (DOC_12) para que el CEO y Liderazgo la validen.");
  addNumberedPoint(body, 4, "Tus 5 Entregables Curriculares: Sube en 'Mis Entregables' la Identidad de Marca Dic. (10% LYE), Identidad de Marca Abr. (10% LYE), Business Model Escrito (25% LYE), Business Model Canvas (15% LYE) y el Dossier para Inversores (40% Lengua Castellana).");

  // Ficha 5: OPERACIONES E IA
  body.appendPageBreak();
  addHeading2(body, "GUÍA RÁPIDA // DPTO. OPERACIONES E IA (OPERACIONES_IA)");
  addMutedParagraph(body, "Misión: Comprobación física de taller, cuaderno de bitácora ética de IA e informes de Matemáticas.");
  addCallout(body, "TU PANTALLA PRINCIPAL: 📦 Taller Ensamble y 🤖 Bitácora IA", "Registras las compras físicas en tienda real, validas el montaje del cohete y auditas el uso de IA.", "info");

  addHeading3(body, "Tus 4 Tareas Clave durante el Proyecto:");
  addNumberedPoint(body, 1, "Registro de Compra Física Real ('Taller Ensamble'): (Recuerda: tú no compras en la app, lo hace Técnico). Cuando Finanzas aprueba un pedido de Técnico, anota el coste real (€), la tienda física y la URL del ticket en Drive, y confirma el ensamble.");
  addNumberedPoint(body, 2, "Validar Montaje de la Hoja de Taller (DOC_10 — 10% FYQ): Recibe el documento enviado por Técnico, comprueba físicamente el cohete en el aula y pulsa [ VALIDAR ENSAMBLE Y REMITIR A CEO ].");
  addNumberedPoint(body, 3, "Cuaderno de Bitácora Ética de IA (DOC_4): Registra en 'Bitácora IA' cada consulta a modelos de IA realizada por el equipo, indicando prompt, justificación y contraste empírico.");
  addNumberedPoint(body, 4, "Entregables de Matemáticas y Liderazgo: Sube el Goniómetro y los 3 informes trigonométricos de la Fase II (25% c/u de MAT), además de los Diarios de Decisiones de Diciembre y Abril para LYE (10% c/u).");

  // Ficha 6: PROFESOR DE AULA
  body.appendPageBreak();
  addHeading2(body, "GUÍA RÁPIDA // PROFESOR DE ASIGNATURA (MODO AULA)");
  addMutedParagraph(body, "Misión: Calificación formativa diaria, validación ágil de aduanas y seguimiento por clases.");
  addCallout(body, "ACCESO EN 3 PASOS: Doble clic en Logo ➔ Código Maestro AEE ➔ Tu Asignatura + PIN", "Entrada directa al Centro de Mando Docente.", "info");

  addHeading3(body, "Tu Rutina de Trabajo en 3 Clics:");
  addNumberedPoint(body, 1, "Filtro de Clase en el Radar de Misión: Pulsa tu clase (CLASE A a F) en la barra superior para sincronizar al instante rúbricas, aduana y contratos.");
  addNumberedPoint(body, 2, "Pestaña 'Rúbricas y Entregas': Selecciona la startup, abre directamente sus documentos de Google Drive, califica los criterios oficiales de tu materia y añade observaciones cualitativas. (El docente de Lengua califica el Dossier al 40% y las Notas de Prensa al 10%).");
  addNumberedPoint(body, 3, "Pestañas 'Validaciones y Aduana' y 'Contratos': Resuelve trámites pendientes marcados con ⚠️ (licencias AESA para FYQ, fichas DOC_12 para LYE, aduana B2B) y valida o penaliza el contrato comercial de la fase.");

  // Ficha 7: COORDINACIÓN DOCENTE
  body.appendPageBreak();
  addHeading2(body, "GUÍA RÁPIDA // COORDINACIÓN DOCENTE (MODO TIC)");
  addMutedParagraph(body, "Misión: Administración global del centro, control de plazos, sincronización D1 y crónicas oficiales.");
  addCallout(body, "CONMUTADOR: ⚙️ ADMINISTRACIÓN DEL CENTRO (TIC)", "Panel exclusivo para coordinadores (COORD_MARIO / COORD_ALEX).", "info");

  addHeading3(body, "Tus Herramientas Clave de Coordinación:");
  addNumberedPoint(body, 1, "Startups & Llavero Maestro: Alta de empresas, regeneración de Códigos de Acceso y PINs de los 6 roles, e impresión de credenciales PDF en A4.");
  addNumberedPoint(body, 2, "Cronograma Maestro y Sugerencias: Apertura y cierre de fechas límite para los 18 hitos y respuesta a consultas del alumnado.");
  addNumberedPoint(body, 3, "Gestión de Catálogo y Exportación Oficial: Modificación de artículos y descarga de [ DESCARGAR CATÁLOGO OFICIAL PDF (SIN I+D) ] y CSV para compartir con los alumnos.");
  addNumberedPoint(body, 4, "Tablón de Noticias y Crónicas AEE: Publicación y edición de crónicas oficiales con texto enriquecido y portadas generadas con Nano Banana 3.");
  addNumberedPoint(body, 5, "Copias de Seguridad (D1): Exportación de snapshots JSON de seguridad y reconciliación optimista con Cloudflare D1.");

  doc.saveAndClose();
  Logger.log("====================================================================");
  Logger.log("✅ DOCUMENTO GENERADO CON ÉXITO");
  Logger.log("URL de acceso: " + doc.getUrl());
  Logger.log("====================================================================");
  return doc.getUrl();
}

// -------------------------------------------------------------
// HELPERS REUTILIZABLES DE MAQUETACIÓN EDITORIAL Y ESTILOS
// -------------------------------------------------------------

function setupHeaderAndFooter(doc) {
  // Encabezado
  const header = doc.addHeader();
  const headerP = header.appendParagraph("MARS-KET 2.0 // Manual Oficial de Operaciones Aeroespaciales");
  headerP.setFontFamily(MARSKET_THEME.fonts.heading)
         .setFontSize(8.5)
         .setForegroundColor(MARSKET_THEME.colors.textMuted)
         .setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

  // Pie de página oficial
  const footer = doc.addFooter();
  const footerP = footer.appendParagraph("Miravalles-El Redín Simulación Académica • Protocolo Zero-Text • Documento Oficial");
  footerP.setFontFamily(MARSKET_THEME.fonts.body)
         .setFontSize(8.5)
         .setForegroundColor(MARSKET_THEME.colors.textMuted)
         .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
}

function addCoverPage(body) {
  // Espaciador superior
  const spacer = body.appendParagraph("");
  spacer.setSpacingBefore(120);

  const kicker = body.appendParagraph("PROGRAMA DE SIMULACIÓN AEROESPACIAL // LOMLOE 2026-2027");
  kicker.setFontFamily(MARSKET_THEME.fonts.heading)
        .setFontSize(11)
        .setBold(true)
        .setForegroundColor(MARSKET_THEME.colors.cyanDark)
        .setSpacingAfter(10);

  const title = body.appendParagraph("MARS-KET 2.0");
  title.setFontFamily(MARSKET_THEME.fonts.title)
       .setFontSize(32)
       .setBold(true)
       .setForegroundColor(MARSKET_THEME.colors.primaryDark)
       .setSpacingAfter(6);

  const subtitle = body.appendParagraph("Manual Integral de Operaciones y Cuadernillo de Guías Rápidas");
  subtitle.setFontFamily(MARSKET_THEME.fonts.heading)
          .setFontSize(16)
          .setForegroundColor(MARSKET_THEME.colors.textDark)
          .setSpacingAfter(16);

  const desc = body.appendParagraph("Guía exhaustiva de navegación, compras y ventas exclusivas de I+D, banco de pruebas de vuelo, gestión de tesorería, marketing de marca, bitácora de IA y rúbricas oficiales de calificación (100% ponderado) para alumnado y claustro docente.");
  desc.setFontFamily(MARSKET_THEME.fonts.body)
      .setFontSize(10.5)
      .setForegroundColor(MARSKET_THEME.colors.textMuted)
      .setLineSpacing(1.35)
      .setSpacingAfter(40);

  // Ficha técnica en caja destacada
  const metaTable = body.appendTable([
    ["Centro Educativo:", "Colegio Miravalles-El Redín (Simulación Interdisciplinar)"],
    ["Nivel y Materias:", "4º ESO / Bachillerato (FYQ, LYE, LEN, ECO, MAT, ING)"],
    ["Marco Legal:", "Protocolo Zero-Text y Privacidad de Menores (RGPD / AEPD)"],
    ["Versión de App:", "MARS-KET OS v1.1.66 Oficial (Noviembre 2026)"],
    ["Edición:", "Oficial para Alumnado y Claustro Docente (Noviembre 2026)"]
  ]);
  metaTable.setBorderWidth(1);
  metaTable.setBorderColor(MARSKET_THEME.colors.cardBorder);
  for (let r = 0; r < metaTable.getNumRows(); r++) {
    const row = metaTable.getRow(r);
    row.getCell(0).setWidth(130).setBackgroundColor(MARSKET_THEME.colors.cardBg);
    row.getCell(1).setWidth(340).setBackgroundColor('#FFFFFF');
    for (let c = 0; c < 2; c++) {
      const cell = row.getCell(c);
      cell.setPaddingTop(5).setPaddingBottom(5).setPaddingLeft(10).setPaddingRight(10);
      const p = cell.getChild(0).asParagraph();
      p.setFontFamily(MARSKET_THEME.fonts.body).setFontSize(9).setForegroundColor(MARSKET_THEME.colors.textDark);
      if (c === 0) p.setBold(true);
    }
  }
}

function addHeading1(body, text) {
  const p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  p.setFontFamily(MARSKET_THEME.fonts.heading)
   .setFontSize(18)
   .setBold(true)
   .setForegroundColor(MARSKET_THEME.colors.primaryDark)
   .setSpacingBefore(18)
   .setSpacingAfter(6);
  return p;
}

function addHeading2(body, text) {
  const p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  p.setFontFamily(MARSKET_THEME.fonts.heading)
   .setFontSize(13)
   .setBold(true)
   .setForegroundColor(MARSKET_THEME.colors.cyanDark)
   .setSpacingBefore(14)
   .setSpacingAfter(4);
  return p;
}

function addHeading3(body, text) {
  const p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING3);
  p.setFontFamily(MARSKET_THEME.fonts.heading)
   .setFontSize(11)
   .setBold(true)
   .setForegroundColor(MARSKET_THEME.colors.textDark)
   .setSpacingBefore(10)
   .setSpacingAfter(3);
  return p;
}

function addParagraph(body, text) {
  const p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.NORMAL);
  p.setFontFamily(MARSKET_THEME.fonts.body)
   .setFontSize(10)
   .setForegroundColor(MARSKET_THEME.colors.textDark)
   .setLineSpacing(1.3)
   .setSpacingAfter(6);
  return p;
}

function addLeadParagraph(body, text) {
  const p = body.appendParagraph(text);
  p.setFontFamily(MARSKET_THEME.fonts.body)
   .setFontSize(11)
   .setBold(true)
   .setForegroundColor(MARSKET_THEME.colors.primaryNavy)
   .setLineSpacing(1.3)
   .setSpacingAfter(8);
  return p;
}

function addMutedParagraph(body, text) {
  const p = body.appendParagraph(text);
  p.setFontFamily(MARSKET_THEME.fonts.body)
   .setFontSize(9.5)
   .setForegroundColor(MARSKET_THEME.colors.textMuted)
   .setLineSpacing(1.25)
   .setSpacingAfter(8);
  return p;
}

function addBulletPoint(body, text) {
  const item = body.appendListItem(text);
  item.setGlyphType(DocumentApp.GlyphType.BULLET);
  item.setFontFamily(MARSKET_THEME.fonts.body)
      .setFontSize(9.5)
      .setForegroundColor(MARSKET_THEME.colors.textDark)
      .setLineSpacing(1.25)
      .setSpacingAfter(3);
  return item;
}

function addNumberedPoint(body, num, text) {
  const item = body.appendListItem(text);
  item.setGlyphType(DocumentApp.GlyphType.NUMBER);
  item.setFontFamily(MARSKET_THEME.fonts.body)
      .setFontSize(9.5)
      .setForegroundColor(MARSKET_THEME.colors.textDark)
      .setLineSpacing(1.25)
      .setSpacingAfter(4);
  return item;
}

function addCallout(body, title, text, type) {
  let bgColor = MARSKET_THEME.colors.calloutInfoBg;
  let borderColor = MARSKET_THEME.colors.calloutInfoBorder;

  if (type === 'warning') {
    bgColor = MARSKET_THEME.colors.calloutWarnBg;
    borderColor = MARSKET_THEME.colors.calloutWarnBorder;
  } else if (type === 'alert') {
    bgColor = MARSKET_THEME.colors.calloutAlertBg;
    borderColor = MARSKET_THEME.colors.calloutAlertBorder;
  } else if (type === 'success') {
    bgColor = MARSKET_THEME.colors.calloutSuccessBg;
    borderColor = MARSKET_THEME.colors.calloutSuccessBorder;
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
    tSpan.setFontFamily(MARSKET_THEME.fonts.heading)
         .setFontSize(9.5)
         .setBold(true)
         .setForegroundColor(borderColor);
  }

  const bSpan = p.appendText(text);
  bSpan.setFontFamily(MARSKET_THEME.fonts.body)
       .setFontSize(9)
       .setForegroundColor(MARSKET_THEME.colors.textDark);
  p.setLineSpacing(1.25);
  
  // Espaciador posterior sutil
  const spacer = body.appendParagraph("");
  spacer.setSpacingAfter(6);
}

function addStyledTable(body, headers, rows, colWidths) {
  const tableData = [headers, ...rows];
  const table = body.appendTable(tableData);
  table.setBorderWidth(1);
  table.setBorderColor(MARSKET_THEME.colors.cardBorder);

  // Formato Cabecera
  const headerRow = table.getRow(0);
  for (let c = 0; c < headers.length; c++) {
    const cell = headerRow.getCell(c);
    cell.setBackgroundColor(MARSKET_THEME.colors.tableHeaderBg);
    cell.setPaddingTop(6).setPaddingBottom(6).setPaddingLeft(6).setPaddingRight(6);
    const p = cell.getChild(0).asParagraph();
    p.setFontFamily(MARSKET_THEME.fonts.heading)
     .setFontSize(8.5)
     .setBold(true)
     .setForegroundColor(MARSKET_THEME.colors.tableHeaderTxt);
  }

  // Formato Filas
  for (let r = 1; r < tableData.length; r++) {
    const row = table.getRow(r);
    const isEven = (r % 2 === 0);
    const rowBg = isEven ? MARSKET_THEME.colors.tableRowEven : MARSKET_THEME.colors.tableRowOdd;

    for (let c = 0; c < headers.length; c++) {
      const cell = row.getCell(c);
      cell.setBackgroundColor(rowBg);
      cell.setPaddingTop(4.5).setPaddingBottom(4.5).setPaddingLeft(6).setPaddingRight(6);
      const p = cell.getChild(0).asParagraph();
      p.setFontFamily(MARSKET_THEME.fonts.body)
       .setFontSize(8.5)
       .setForegroundColor(MARSKET_THEME.colors.textDark);
    }
  }

  // Anchos de columna si están definidos
  if (colWidths && colWidths.length === headers.length) {
    for (let c = 0; c < headers.length; c++) {
      table.setColumnWidth(c, colWidths[c]);
    }
  }

  const spacer = body.appendParagraph("");
  spacer.setSpacingAfter(6);
}
