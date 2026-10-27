// js/config.js
// --- CONFIGURACIÓN GLOBAL, CATÁLOGO, PONDERACIONES Y CRONOGRAMA MAESTRO (v1.1.44) ---

const APP_VERSION = "1.1.44";

const SPONSOR_TIERS_DEF = Object.freeze({
    ORO: { id: 'ORO', name: 'Nivel ORO', amount: 500, badgeClass: 'text-[#ffd700] border-[#ffd700]', emoji: '🥇' },
    PLATA: { id: 'PLATA', name: 'Nivel PLATA', amount: 400, badgeClass: 'text-[#c0c0c0] border-[#c0c0c0]', emoji: '🥈' },
    BRONCE: { id: 'BRONCE', name: 'Nivel BRONCE', amount: 250, badgeClass: 'text-[#cd7f32] border-[#cd7f32]', emoji: '🥉' },
    COBRE: { id: 'COBRE', name: 'Nivel COBRE', amount: 150, badgeClass: 'text-[#b87333] border-[#b87333]', emoji: '🔶' },
    COLABORADOR: { id: 'COLABORADOR', name: 'Nivel COLABORADOR', amount: 100, badgeClass: 'text-mars-cyan border-mars-cyan', emoji: '🤝' }
});

const COMMERCIAL_SHOPS_DEF = [
  { id: 'mercadona', name: 'Mercadona' },
  { id: 'carrefour', name: 'Carrefour' },
  { id: 'eroski', name: 'Eroski' },
  { id: 'dia', name: 'Dia' },
  { id: 'ferreteria', name: 'Ferretería' },
  { id: 'bazar', name: 'Bazar' },
  { id: 'comercio_generico', name: 'Comercio genérico' }
];
const ROLES_EXTRA = { AUXILIAR: 'AUXILIAR' };

const GOOGLE_DRIVE_REGEX = /^https:\/\/(docs|drive)\.google\.com\/(document|spreadsheets|presentation|file|drive\/folders)\/(d\/)?[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_.-]+)*(\?[^"'\s<>]*)?(#[^"'\s<>]*)?$/;

// Diccionario Oficial Inmutable de los 12 Modelos de Google Docs (/copy)
const OFFICIAL_DOC_TEMPLATES = Object.freeze({
    DOC_1_DENOMINACION: {
        id: 'DOC_1_DENOMINACION',
        title: 'SOLICITUD DE CAMBIO DE DENOMINACIÓN SOCIAL',
        flow: 'CEO ➔ Coordinación Docente',
        copyUrl: 'https://docs.google.com/document/d/1nm5JLGaYqZCstS7NVyeHtnN3R1KTGO1Lgt8DdpetcCI/copy'
    },
    DOC_2_INACTIVIDAD_HR: {
        id: 'DOC_2_INACTIVIDAD_HR',
        title: 'EXPEDIENTE HR: REPORTE DE INACTIVIDAD DEPARTAMENTAL',
        flow: 'Cualquier Dpto. ➔ Coordinación Docente',
        copyUrl: 'https://docs.google.com/document/d/1ZZXK7bWALAII8XjB2hXyg4aLYzgDKxrEkNMklySDk4I/copy'
    },
    DOC_3_COMUNICADO_SANCION: {
        id: 'DOC_3_COMUNICADO_SANCION',
        title: 'COMUNICADO OFICIAL DE EXPEDIENTE SANCIONADOR',
        flow: 'CEO ➔ Resto de departamentos',
        copyUrl: 'https://docs.google.com/document/d/1kmJK4J2MvPyKKm9k6YhLtkoRb3ysoAcgFmMjgbUgZ1o/copy'
    },
    DOC_4_BITACORA_IA: {
        id: 'DOC_4_BITACORA_IA',
        title: 'CUADERNO DE BITÁCORA Y AUDITORÍA ÉTICA DE IA',
        flow: 'Todos los Dptos. ➔ Dpto. Operaciones e IA',
        copyUrl: 'https://docs.google.com/document/d/1QDzumCcDHLWcQJlkPSaA1Q16Kj0Ff9wsHiPf_clLau8/copy'
    },
    DOC_5_BRIEF_MKT: {
        id: 'DOC_5_BRIEF_MKT',
        title: 'BRIEF CREATIVO DE CAMPAÑA Y JUSTIFICACIÓN ROI',
        flow: 'Marketing ➔ Financiero',
        copyUrl: 'https://docs.google.com/document/d/1WA1dkWqsVmuwhXf2wnCvR4xWalJGIN3pi5WRH3h4XCo/copy'
    },
    DOC_6_MOCION_ASAMBLEA: {
        id: 'DOC_6_MOCION_ASAMBLEA',
        title: 'ACTA DE MOCIÓN ASAMBLEARIA',
        flow: 'Dptos. Proponentes ➔ Todos los departamentos',
        copyUrl: 'https://docs.google.com/document/d/1K6fmTDUxH7NNHsfoCIrB9vmMzhU0N0k7ROin13D6kvo/copy'
    },
    DOC_7_B2B_DESINVERSION: {
        id: 'DOC_7_B2B_DESINVERSION',
        title: 'ADUANA DOCENTE & MERCADO B2B — MEMORIA TÉCNICA DE DESINVERSIÓN Y DECLARACIÓN DE EXCEDENTES',
        flow: 'Técnico/Financiero ➔ Mercado B2B & Aduana Docente',
        copyUrl: 'https://docs.google.com/document/d/1V1amJQa0GkogTC2r8HPAJRUCVj3UlG0HIvjgHx4Csas/copy'
    },
    DOC_9_ORDEN_ADQUISICION: {
        id: 'DOC_9_ORDEN_ADQUISICION',
        title: 'ORDEN DE ADQUISICIÓN E INFORME TÉCNICO',
        flow: 'Técnico Solicitante ➔ Financiero Autorizador',
        copyUrl: 'https://docs.google.com/document/d/1WrkvVwEEi0uJ9pKNI6U2nlvRrxDbt75SU1oh6gUqM_o/copy'
    },
    DOC_10_HOJA_TALLER: {
        id: 'DOC_10_HOJA_TALLER',
        title: 'HOJA OFICIAL DE TALLER, BOM Y CONTROL DE CALIDAD [FYQ]',
        flow: 'Técnico, Operario de Taller, CEO ➔ Evaluación Docente',
        copyUrl: 'https://docs.google.com/document/d/1ehTeMTmHzY5Jl8dcVjvF-2AkfQQBNRR0tctTWdqSI1o/copy'
    },
    DOC_11_SLOGAN: {
        id: 'DOC_11_SLOGAN',
        title: 'REGISTRO MERCANTIL // SOLICITUD DE APROBACIÓN DE SLOGAN CORPORATIVO',
        flow: 'Marketing ➔ CEO ➔ Coordinación Docente',
        copyUrl: 'https://docs.google.com/document/d/1D_YeV9yiJX4Lr_yRA6fB8ew0DMCr54MYRXB0JXiDUdU/copy'
    },
    DOC_12_ACCION_MKT: {
        id: 'DOC_12_ACCION_MKT',
        title: 'FICHA TÉCNICA Y CONTROL DE ACCIÓN PUBLICITARIA',
        flow: 'Marketing ➔ CEO ➔ Docente de Liderazgo y Coordinación',
        copyUrl: 'https://docs.google.com/document/d/18ApF6IytTExv4wGGkID1W2w0W_iXAAgw5UxuLB41Mkc/copy'
    }
});

const NAME_CHANGE_REASONS_DEF = Object.freeze([
    { id: 'REORIENTACION_ESTRATEGICA', label: 'Reorientación estratégica y pivotaje del modelo de negocio' },
    { id: 'FUSION_DEPARTAMENTAL', label: 'Fusión o reestructuración de departamentos internos' },
    { id: 'ALINEACION_AEE', label: 'Alineación con nuevos objetivos de la misión aeroespacial AEE' },
    { id: 'MARCA_INTERNACIONAL', label: 'Homogeneización de identidad de marca y denominación internacional' },
    { id: 'ASAMBLEA_SOCIOS', label: 'Resolución aprobada por mayoría en Asamblea General de Socios' }
]);

const INACTIVITY_REASONS_DEF = Object.freeze([
    { id: 'AUSENCIA_SESIONES', label: 'Ausencia continuada o falta de conexión en sesiones de trabajo' },
    { id: 'BLOQUEO_ENTREGABLES', label: 'Bloqueo en la entrega de memorias y documentación obligatoria' },
    { id: 'FALTA_RESPUESTA_INTERNA', label: 'Falta de respuesta reiterada en canales internos de coordinación' },
    { id: 'RETRASO_PRESUPUESTO', label: 'Negativa o retraso injustificado en la aprobación de órdenes/presupuestos' },
    { id: 'INCUMPLIMIENTO_PLAZOS', label: 'Incumplimiento de los plazos establecidos en el cronograma maestro' }
]);

const BOTTLE_TYPES_DEF = Object.freeze([
    "PET 1.5L Lisa Cilíndrica",
    "PET 1.5L Acanalada Reforzada",
    "PET 2.0L Alta Capacidad",
    "PET 1.0L Estándar",
    "PET 0.5L Ligera Suborbital",
    "Fuselaje Bietapa / Empalmado"
]);

const STUDENT_SUGGESTION_TOPICS_DEF = Object.freeze([
    { id: 'TELEMETRIA_SIMULADOR', label: 'Incidencia o duda en el cálculo de telemetría y simulador' },
    { id: 'NORMATIVA_AEE', label: 'Consulta sobre normativa AEE, rúbricas o reglas de competición' },
    { id: 'DRIVE_DOCS', label: 'Problema al vincular o visualizar enlace de Google Drive / Docs' },
    { id: 'UI_ERGONOMIA', label: 'Propuesta de mejora en la interfaz o usabilidad de la plataforma' },
    { id: 'CONTABILIDAD_LEDGER', label: 'Duda sobre Libro Mayor, contabilidad o compras de materiales' },
    { id: 'BUG_SISTEMA', label: 'Reporte de error técnico o comportamiento inesperado del sistema' }
]);

const BRAND_CONCEPTS_DEF = Object.freeze([
    { id: 'TRANSPORTE_PLANETARIO', label: 'Exploración y Transporte Planetario Marte-Tierra' },
    { id: 'RECURSOS_ISRU', label: 'Minería de Recursos In Situ y Manufactura Espacial (ISRU)' },
    { id: 'PROPULSION_SOSTENIBLE', label: 'Sistemas de Propulsión Sostenible y Eficiencia de Combustible' },
    { id: 'SOPORTE_VITAL', label: 'Soporte Vital, Habitabilidad y Biología Marciana' },
    { id: 'TELECOMUNICACIONES_ORBITA', label: 'Telecomunicaciones Orbitales y Redes de Satélites' },
    { id: 'SENSORES_ATMOSFERICOS', label: 'Detección Remota, Sensores y Observación Atmosférica' }
]);

const BRAND_DENIAL_REASONS_DEF = Object.freeze([
    { id: "SIMILITUD_MARCA", label: "Similitud o conflicto con marcas comerciales existentes" },
    { id: "FILTRO_LEXICO", label: "Incumplimiento del filtro léxico o valores del centro educativo" },
    { id: "DOC_11_ACCESO", label: "Modelo oficial DOC_11 en Google Drive sin permisos o inaccesible" },
    { id: "DEFICIT_ARGUMENTAL", label: "Falta de justificación estratégica o lingüística en el dossier" },
    { id: "FORMATO_INADECUADO", label: "Resolución o formato gráfico del logotipo no apto para el HUD" }
]);

const CEO_RETURN_REASONS = [
  { id: "ENLACE_INVALIDO", label: "Enlace a Google Drive inexistente o con formato incorrecto" },
  { id: "PERMISOS_BLOQUEADOS", label: "Documento sin permisos de acceso/lectura para el equipo docente" },
  { id: "PLANTILLA_INCORRECTA", label: "No se ha utilizado la plantilla oficial corporativa/curricular" },
  { id: "CHECKLIST_INCOMPLETO", label: "Faltan apartados obligatorios según la guía de la materia" },
  { id: "DISCREPANCIA_DATOS", label: "Discrepancia entre datos de la app y el documento adjunto" },
  { id: "REVISION_PENDIENTE", label: "Requiere subsanación técnica interna antes de elevar a evaluación" }
];

const WORKSHOP_INCIDENCE_REASONS = Object.freeze([
  { id: "INCOMPATIBILIDAD_PIEZAS", label: "Incompatibilidad dimensional o mecánica de piezas" },
  { id: "FALLO_ESTRUCTURAL_PROPULSOR", label: "Fallo estructural en tobera o cámara de propulsión" },
  { id: "FALTA_ESTANQUEIDAD", label: "Falta de estanqueidad o fugas en sellado de presión" },
  { id: "DESVIACION_CENTRO_MASAS", label: "Desviación crítica en centro de gravedad / alerones" },
  { id: "BOM_DISCREPANTE", label: "Discrepancia entre piezas reales disponibles y el BOM diseñado" },
  { id: "RIESGO_SEGURIDAD_TALLER", label: "Incumplimiento de checklist de seguridad en banco de pruebas" }
]);

const AUTHORIZED_AI_PROVIDERS = [
  "Google Gemini", "OpenAI ChatGPT", "Anthropic Claude", "Microsoft Copilot", "Perplexity AI", "DeepSeek", "Otro autorizado por Coordinación"
];

const GOVERNANCE_MOTION_TYPES = Object.freeze([
  { id: "DISCREPANCIA_DEPT", label: "[DISCREPANCIA] Discrepancia de criterio entre departamentos" },
  { id: "CONSULTA_EQUIPO", label: "[CONSULTA] Consulta general al equipo para toma de decisión" },
  { id: "PROPUESTA_ALTERNATIVA", label: "[ALTERNATIVA] Propuesta alternativa de diseño, presupuesto o enfoque" },
  { id: "MODIFICAR_HOJA_RUTA", label: "[HOJA DE RUTA] Modificación de la hoja de ruta o plazos internos" },
  { id: "IDEA_DEBATIR", label: "[IDEA A DEBATIR] Nueva propuesta o mejora para debatir en asamblea" },
  { id: "REPARTO_TAREAS", label: "[ORGANIZACIÓN] Reajuste o apoyo en el reparto de tareas interdepartamentales" },
  { id: "SOLICITUD_MEDIACION", label: "[MEDIACIÓN] Solicitud de orientación o mediación al equipo docente" }
]);

const REGULATORY_AGENCIES = {
    FYQ: "Agencia Estatal de Seguridad Aérea (AESA)",
    ECO: "Ministerio de Hacienda",
    LYE: "Comisión Nacional de los Mercados y la Competencia (CNMC)",
    LEN: "Ministerio de Justicia",
    ING: "Asuntos Internos",
    MAT: "Agencia Espacial Española (AEE)",
    COORD_MARIO: "Tribunal Supremo de la AEE",
    COORD_ALEX: "Tribunal Supremo de la AEE"
};

const GLOBAL_WEIGHTS = {
    FYQ: 0.25, LYE: 0.40, LEN: 0.15, ECO: 0.10, MAT: 0.05, ING: 0.05
};

const RUBRIC_CONFIG = {
    FYQ: { name: "Física y Química", criteria: [
        {id: 'c1', name: '1. Informe Preliminar, Boceto y Foto (10%)', weight: 0.10}, 
        {id: 'c_ws', name: '2. Hoja Oficial de Taller, BOM y Control de Calidad (10%)', weight: 0.10},
        {id: 'c2', name: '3. Informe Técnico Final Exhaustivo (30%)', weight: 0.30}, 
        {id: 'c3', name: '4. Prototipo Físico y Lanzamiento (30%)', weight: 0.30}, 
        {id: 'c4', name: '5. Media de Test Rol y Defensa Q&A (20%)', weight: 0.20}
    ] },
    ECO: { name: "Economía", criteria: [
        {id: 'c1', name: 'Test Evaluación', weight: 0.20}, 
        {id: 'c2', name: 'Presupuesto Inicial', weight: 0.20}, 
        {id: 'c3', name: 'Cuenta Resultados', weight: 0.20}, 
        {id: 'c4', name: 'Presupuesto Post-Prototipo', weight: 0.20}, 
        {id: 'c5', name: 'Balance Situación', weight: 0.20}
    ] },
    LYE: { name: "Liderazgo y Emprend.", criteria: [
        {id: 'c1', name: 'Identidad y Misión Dic', weight: 0.10}, 
        {id: 'c2', name: 'Identidad y Misión Abr', weight: 0.10}, 
        {id: 'c3', name: 'Business Model Escrito', weight: 0.25}, 
        {id: 'c4', name: 'Business Model Canvas', weight: 0.15}, 
        {id: 'c5', name: 'Diario Decisiones e IA Dic', weight: 0.10}, 
        {id: 'c6', name: 'Diario Decisiones e IA Abr', weight: 0.10}, 
        {id: 'c7', name: 'Defensas Orales', weight: 0.20}
    ] },
    LEN: { name: "Lengua Castellana", criteria: [
        {id: 'c1', name: 'Producción Oral', weight: 0.50}, 
        {id: 'c2', name: 'Producción Escrita (Dossier Inversores)', weight: 0.50}
    ] },
    MAT: { name: "Matemáticas", criteria: [
        {id: 'c1', name: 'Elaboración Goniómetro', weight: 0.25}, 
        {id: 'c2', name: 'Informe Dist. Conocida', weight: 0.25}, 
        {id: 'c3', name: 'Informe Dos Puntos', weight: 0.25}, 
        {id: 'c4', name: 'Informe Final', weight: 0.25}
    ] },
    ING: { name: "Inglés", criteria: [
        {id: 'c1', name: 'Expresión Oral (Presentación)', weight: 0.70}, 
        {id: 'c2', name: 'Redacciones Escritas', weight: 0.30}
    ] }
};

// Definición Maestra Oficial de los 18 Entregables Curriculares en Google Drive
const DELIVERABLES_DEF = [
    // Física y Química (3)
    {
      key: "preliminaryReport",
      subject: "FYQ",
      name: "1. Informe Técnico Preliminar, Boceto y Foto",
      shortName: "Preliminar FYQ",
      desc: "Informe preliminar, boceto inicial y foto del diseño del cohete (Física y Química).",
      role: "TECNICO",
      defaultOpenDate: "2026-10-25T00:00",
      defaultDate: "2026-12-15T23:59",
      weight: "10% FYQ",
      defaultGuideDocUrl: ""
    },
    {
      key: "technicalReport",
      subject: "FYQ",
      name: "2. Informe Técnico Final Exhaustivo",
      shortName: "Técnico Final FYQ",
      desc: "Memoria técnica completa de rendimiento y física de vuelo (Física y Química).",
      role: "TECNICO",
      defaultOpenDate: "2026-10-25T00:00",
      defaultDate: "2027-04-10T23:59",
      weight: "30% FYQ",
      defaultGuideDocUrl: ""
    },
    {
      key: "hoja_taller_fyq",
      subject: "FYQ",
      title: "Hoja de Taller: BOM y Control de Ensamble",
      name: "3. Hoja de Taller: BOM y Control de Ensamble",
      shortName: "Hoja de Taller (FYQ)",
      desc: "Registro de desglose de materiales y control de calidad físico (Física y Química).",
      role: "OPERACIONES_IA",
      defaultOpenDate: "2026-10-25T00:00",
      defaultDate: "2027-04-10T23:59",
      weight: "10% FYQ",
      defaultGuideDocUrl: "https://docs.google.com/document/d/1ehTeMTmHzY5Jl8dcVjvF-2AkfQQBNRR0tctTWdqSI1o/copy"
    },
    
    // Liderazgo y Emprendimiento (6)
    {
      key: "brandIdentity_dec",
      subject: "LYE",
      name: "1A. Nombre, Logo, Tagline, Imagen de Marca — DICIEMBRE",
      shortName: "Marca Dic (LYE)",
      desc: "Identidad inicial de marca, logotipo y misión corporativa.",
      role: "MARKETING",
      defaultOpenDate: "2026-10-25T00:00",
      defaultDate: "2026-12-15T23:59",
      weight: "10% LYE",
      defaultGuideDocUrl: ""
    },
    {
      key: "brandIdentity_apr",
      subject: "LYE",
      name: "1B. Nombre, Logo, Tagline, Imagen de Marca — ABRIL",
      shortName: "Marca Abr (LYE)",
      desc: "Evolución y consolidación de la marca, manual de identidad y defensa.",
      role: "MARKETING",
      defaultOpenDate: "2027-01-15T00:00",
      defaultDate: "2027-04-10T23:59",
      weight: "10% LYE",
      defaultGuideDocUrl: ""
    },
    {
      key: "businessModelDoc",
      subject: "LYE",
      name: "2. Business Model — Documento Escrito",
      shortName: "Business Model (Doc)",
      desc: "Desarrollo argumentado del modelo de negocio de la startup.",
      role: "MARKETING",
      defaultOpenDate: "2027-01-15T00:00",
      defaultDate: "2027-04-10T23:59",
      weight: "25% LYE",
      defaultGuideDocUrl: ""
    },
    {
      key: "businessModelCanvas",
      subject: "LYE",
      name: "3. Business Model Canvas (Lienzo Estratégico)",
      shortName: "Canvas (LYE)",
      desc: "Lienzo de modelo de negocio con los 9 módulos estratégicos.",
      role: "MARKETING",
      defaultOpenDate: "2027-01-15T00:00",
      defaultDate: "2027-04-10T23:59",
      weight: "15% LYE",
      defaultGuideDocUrl: ""
    },
    {
      key: "decisionDiary_dec",
      subject: "LYE",
      name: "4A. Diario / Bitácora — DICIEMBRE",
      shortName: "Diario/Bitácora Dic (LYE)",
      desc: "Diario de decisiones, resolución de conflictos y registro ético de IA (Diciembre).",
      role: "OPERACIONES_IA",
      defaultOpenDate: "2026-10-25T00:00",
      defaultDate: "2026-12-15T23:59",
      weight: "10% LYE",
      defaultGuideDocUrl: "https://docs.google.com/document/d/1QDzumCcDHLWcQJlkPSaA1Q16Kj0Ff9wsHiPf_clLau8/copy"
    },
    {
      key: "decisionDiary_apr",
      subject: "LYE",
      name: "4B. Diario / Bitácora — ABRIL",
      shortName: "Diario/Bitácora Abr (LYE)",
      desc: "Diario de decisiones, resolución de conflictos y registro ético de IA (Abril).",
      role: "OPERACIONES_IA",
      defaultOpenDate: "2027-01-15T00:00",
      defaultDate: "2027-04-10T23:59",
      weight: "10% LYE",
      defaultGuideDocUrl: "https://docs.google.com/document/d/1QDzumCcDHLWcQJlkPSaA1Q16Kj0Ff9wsHiPf_clLau8/copy"
    },

    // Lengua Castellana (1)
    {
      key: "investorDossier",
      subject: "LEN",
      name: "1. Dossier para Inversores (Texto Argumentativo)",
      shortName: "Dossier Inversores (LEN)",
      desc: "Dossier argumentativo formal dirigido a inversores y patrocinadores.",
      role: "MARKETING",
      defaultOpenDate: "2027-01-15T00:00",
      defaultDate: "2027-04-10T23:59",
      weight: "50% LEN",
      defaultGuideDocUrl: ""
    },

    // Matemáticas (4)
    {
      key: "mathReportDist",
      subject: "MAT",
      name: "1. Informe Técnico con Datos Empíricos de Distancia Conocida",
      shortName: "Dist. Conocida (MAT)",
      desc: "Cálculo trigonométrico de apogeo con distancia base fija conocida.",
      role: "TECNICO",
      defaultOpenDate: "2027-01-15T00:00",
      defaultDate: "2027-02-10T23:59",
      weight: "25% MAT",
      defaultGuideDocUrl: ""
    },
    {
      key: "mathReportTwoPoints",
      subject: "MAT",
      name: "2. Informe Técnico con Dos Mediciones",
      shortName: "Dos Mediciones (MAT)",
      desc: "Triangulación matemática desde dos puntos de observación independientes.",
      role: "TECNICO",
      defaultOpenDate: "2027-01-15T00:00",
      defaultDate: "2027-02-10T23:59",
      weight: "25% MAT",
      defaultGuideDocUrl: ""
    },
    {
      key: "mathReportFinal",
      subject: "MAT",
      name: "3. Informe Técnico Final Comparativo",
      shortName: "Comparativo Final (MAT)",
      desc: "Análisis comparativo de modelos matemáticos y desviaciones reales de apogeo.",
      role: "TECNICO",
      defaultOpenDate: "2027-01-15T00:00",
      defaultDate: "2027-02-10T23:59",
      weight: "25% MAT",
      defaultGuideDocUrl: ""
    },
    {
      key: "goniometerEvidence",
      subject: "MAT",
      name: "4. Goniómetro (Evidencia y Construcción)",
      shortName: "Goniómetro (MAT)",
      desc: "Construcción física, calibración y registro fotográfico del goniómetro.",
      role: "TECNICO",
      defaultOpenDate: "2027-01-15T00:00",
      defaultDate: "2027-02-10T23:59",
      weight: "25% MAT",
      defaultGuideDocUrl: ""
    },

    // Economía (4)
    {
      key: "budgetInitial",
      subject: "ECO",
      name: "1. Presupuesto Inicial",
      shortName: "Presupuesto Inicial",
      desc: "Presupuesto inicial de aprovisionamiento y proyección financiera de la startup.",
      role: "FINANZAS",
      defaultOpenDate: "2026-10-25T00:00",
      defaultDate: "2026-12-15T23:59",
      weight: "20% ECO",
      defaultGuideDocUrl: ""
    },
    {
      key: "incomeStatement",
      subject: "ECO",
      name: "2. Cuenta de Resultados",
      shortName: "Cuenta de Resultados",
      desc: "Cuenta de pérdidas y ganancias provisional y control de márgenes.",
      role: "FINANZAS",
      defaultOpenDate: null,
      defaultDate: "2026-11-08T23:59",
      weight: "20% ECO",
      defaultGuideDocUrl: ""
    },
    {
      key: "budgetPostProto",
      subject: "ECO",
      name: "3. Presupuesto tras Presentación de Prototipo",
      shortName: "Presupuesto Post-Proto",
      desc: "Presupuesto recalculado tras las pruebas físicas de apogeo y taller.",
      role: "FINANZAS",
      defaultOpenDate: "2026-12-15T00:00",
      defaultDate: "2027-01-10T23:59",
      weight: "20% ECO",
      defaultGuideDocUrl: ""
    },
    {
      key: "balanceSheet",
      subject: "ECO",
      name: "4. Balance",
      shortName: "Balance de Situación",
      desc: "Balance de situación cerrado con activo, pasivo y patrimonio neto final.",
      role: "FINANZAS",
      defaultOpenDate: "2027-02-15T00:00",
      defaultDate: "2027-04-10T23:59",
      weight: "20% ECO",
      defaultGuideDocUrl: ""
    }
];

const MARKETING_PACKAGES = Object.freeze([
    { id: 'MK-SAT', name: 'Pack Satélite', type: '100% Online', price: 200, actions: 3, desc: 'Alcance digital rápido (Redes sociales, Banners, Mailing).' },
    { id: 'MK-TRA', name: 'Prensa Tradicional', type: '100% Físico', price: 300, actions: 3, desc: 'Impacto tangible (Diseño de pósters, flyers físicos, prensa).' },
    { id: 'MK-HYB', name: 'Despegue Híbrido', type: 'Mixto Básico', price: 450, actions: 4, desc: 'Estrategia estándar (2 Acciones Online + 2 Físicas).' },
    { id: 'MK-SUP', name: 'Cobertura Supernova', type: 'Premium', price: 750, actions: 6, desc: 'Saturación publicitaria máxima. Requiere fuerte justificación financiera.' }
]);

const FORBIDDEN_WORDS = [
    'puta', 'puto', 'mierda', 'joder', 'cabron', 'cabrón', 'gilipollas', 
    'polla', 'cojones', 'follar', 'hostia', 'maricon', 'maricón', 'zorra', 
    'capullo', 'pendejo', 'idiota', 'subnormal', 'imbecil', 'imbécil', 
    'hitler', 'nazi', 'pene', 'vagina', 'culo', 'teta', 'retrasado', 'retrasada',
    'mario', 'alex', 'alejandro', 'coordinador', 'director', 'profe', 'profesor'
];

// MÓDULO C (v1.0.19): Diccionarios LOPD Multiculturales y Lista Blanca Aeroespacial Contextual
const LOPD_FIRST_NAMES = [
    // Nombres de pila frecuentes en España
    'juana', 'maria', 'alejandro', 'pedro', 'lucia', 'carlos', 'sofia', 'mario', 'alex',
    'pablo', 'mateo', 'hugo', 'martin', 'daniel', 'alvaro', 'adrian', 'david', 'diego',
    'javier', 'manuel', 'antonio', 'jose', 'francisco', 'juan', 'carmen', 'ana', 'laura',
    'elena', 'paula', 'marta', 'sara', 'claudia', 'alba', 'irene', 'noa', 'valeria',
    'daniela', 'julia', 'marcos', 'ivan', 'jorge', 'ruben', 'sergio', 'miguel', 'angel',
    'raquel', 'beatriz', 'rocio', 'patricia', 'andrea', 'natalia', 'alicia', 'clara',
    'nuria', 'silvia', 'cristina', 'monica', 'ines', ' Marina', 'gonzalo', 'rodrigo',
    'nicolas', 'samuel', 'leo', 'izan', 'enzo', 'gael', 'bruno', 'oliver', 'thiago',
    'alberto', 'fernando',
    // Nombres multiculturales comunes en aulas diversas
    'john', 'mohammed', 'mohamed', 'muhammad', 'yan', 'fatima', 'ahmed', 'ali', 'omar',
    'youssef', 'amina', 'zainab', 'hassan', 'ibrahim', 'wei', 'chen', 'li', 'michael',
    'james', 'robert', 'william', 'richard', 'thomas', 'sarah', 'emily', 'jessica',
    'bogdan', 'andrei', 'mihai', 'tarik', 'khalid', 'hamza', 'ayoub', 'salma', 'nour',
    'malak', 'karim', 'mustapha', 'rachid', 'bilal', 'anas', 'soufiane', 'ilyas', 'rayan'
].map(s => s.trim().toLowerCase());

const LOPD_SURNAMES = [
    // Apellidos más frecuentes en España e internacionales
    'garcia', 'gonzalez', 'rodriguez', 'fernandez', 'lopez', 'martinez', 'sanchez', 'perez',
    'gomez', 'jimenez', 'ruiz', 'hernandez', 'diaz', 'moreno', 'alvarez', 'munoz', 'romero',
    'alonso', 'gutierrez', 'navarro', 'torres', 'dominguez', 'vazquez', 'ramos', 'gil',
    'ramirez', 'serrano', 'molina', 'morales', 'suarez', 'ortega', 'delgado', 'castro',
    'ortiz', 'rubio', 'marin', 'sanz', 'nunez', 'iglesias', 'medina', 'garrido', 'cortes',
    'castillo', 'santos', 'lozano', 'guerrero', 'cano', 'prieto', 'mendez', 'calvo', 'vidal',
    'herrera', 'marquez', 'pena', 'cabrera', 'carrasco', 'diez', 'caballero', 'reyes',
    'nieto', 'aguilar', 'pascual', 'herrero', 'santana', 'lorenzo', 'hidalgo', 'montero',
    'ibanez', 'gimenez', 'ferrer', 'duran', 'vicente', 'benitez', 'mora', 'santiago', 'arias',
    'vargas', 'carmona', 'crespo', 'pastor', 'soto', 'saez', 'velasco', 'soler', 'moya',
    'esteban', 'parra', 'bravo', 'gallardo', 'rojas',
    // Apellidos internacionales frecuentes en aula
    'smith', 'johnson', 'williams', 'brown', 'jones', 'miller', 'davis', 'wilson', 'anderson',
    'taylor', 'moore', 'wang', 'zhang', 'liu', 'singh', 'kumar', 'khan', 'patel', 'ivanov',
    'popescu', 'silva', 'ferreira', 'pereira', 'oliveira', 'costa', 'smirnov', 'muller',
    'schmidt', 'rossi', 'dupont',
    // Apellidos homónimos con términos técnicos (protegidos en solitario por AEROSPACE_WHITELIST)
    'luna', 'marte', 'roca', 'franco', 'sierra', 'corona', 'cruz', 'blanco', 'polo', 'vega',
    'sol', 'leon', 'roman', 'campos', 'fuentes', 'flores'
];

const AEROSPACE_WHITELIST = [
    'luna', 'marte', 'roca', 'franco', 'sierra', 'corona', 'cruz', 'blanco', 'polo', 'vega',
    'sol', 'carbon', 'silicio', 'leon', 'roman', 'campos', 'fuentes', 'flores', 'monte',
    'estrella', 'celeste', 'aurora', 'orion', 'astra', 'apolo', 'ares',
    'clara', 'angel', 'marcos', 'cortes', 'rojas', 'mora', 'torres', 'castillo'
];

// Changelog Oficial de Producción v1.1.06
const APP_CHANGELOG = [
    {
      version: "1.1.44",
      date: new Date().toISOString().split('T')[0],
      title: "Ocultación Global de Bloqueados, Pestaña Campañas MKT, 5ª Pestaña Taller Técnico y Guía de Incidencias",
      items: [
        "Ocultación global reactiva de entregables con fecha de apertura futura aún no entregados para perfiles de alumno en todos los departamentos, Dossier y Cronograma Maestro.",
        "Reestructuración de navegación en Marketing: nueva pestaña independiente '📢 Campañas' (catálogo de paquetes publicitarios e historial DOC_12 con workflow) y desvinculación de SUPERMARS-KET.",
        "5ª Pestaña exclusiva '🔧 Taller' para el rol Técnico: escandallo BOM, inventario físico, venta B2B y panel de Hoja de Taller (DOC_10) con workflow en 4 fases.",
        "Guía operativa contextual y campo obligatorio de enlace a Google Drive en la devolución de Hoja de Taller por incidencias de montaje por el Operario.",
        "Depuración definitiva del documento DOC_8_CONTROL_AERO de plantillas oficiales y vistas de logística."
      ],
      highlights: [
        { type: "ENTREGABLES", text: "Ocultación limpia y automática de entregables bloqueados según fecha de apertura docente." },
        { type: "MARKETING", text: "Pestaña dedicada '📢 Campañas' para contratación de paquetes publicitarios y publicación de acciones DOC_12." },
        { type: "TÉCNICO", text: "5ª Pestaña '🔧 Taller' con control total de piezas BOM, excedentes B2B y ciclo de vida de Hoja de Taller." },
        { type: "TALLER", text: "Informe obligatorio de incidencias en Google Docs para devoluciones de taller físico por Operaciones." }
      ]
    },
    {
      version: "1.1.43",
      date: new Date().toISOString().split('T')[0],
      title: "Trazabilidad de Flujo Interdepartamental, Panel Técnico I+D y Optimización de Guías de Usuario",
      items: [
        "Modal de Guía: Exclusión estricta del perfil Docente para cuentas de alumno y flexibilización de selector de roles en cuadrícula fluida.",
        "Panel de Seguimiento Técnico I+D (tech-orders-tracking-panel): Visualización de estado en 3 fases, enlace a DOC_9 y desglose de imputación real (€) de taller.",
        "Acceso directo [📡 Mis Órdenes] en Catálogo B2C hacia la terminal técnica.",
        "Panel de Seguimiento Logístico de Taller (ops-orders-tracking-panel): 3 pestañas operativas (Listas para Ensamble, En Cola Finanzas, Historial).",
        "Trazabilidad gráfica renderWorkflowTracker transversal en Órdenes de I+D, Paquetes de Marketing, Acciones Publicitarias y Hoja de Taller."
      ],
      highlights: [
        { type: "FLUJO_CRUZADO", text: "Trazabilidad end-to-end de órdenes y entregables con componentes visuales de progreso entre departamentos." },
        { type: "UI_UX", text: "Mejora ergonómica del modal de guía y acceso rápido desde el catálogo a órdenes activas." }
      ]
    },
    {
      version: "1.1.42",
      date: new Date().toISOString().split('T')[0],
      title: "Optimización de Branding, Presencia Visual de Logotipos y Sello Institucional Miravalles-El Redín",
      items: [
        "Ampliación del logo corporativo en la Pantalla de Acceso (Paso 1: Código de Empresa y Paso 2: Terminal PIN).",
        "Rediseño del Pie de Página Global (#hud-footer): Isotipo centrado con halo cyan y jerarquía tipográfica premium.",
        "Actualización de denominación institucional a Miravalles-El Redín Simulación Académica (2026-2027)."
      ],
      highlights: [
        { type: "BRANDING", text: "Mayor protagonismo visual de logo.png en pasarela de acceso y pie de página." },
        { type: "INSTITUCIONAL", text: "Identidad formal Miravalles-El Redín Simulación Académica en todas las vistas." }
      ]
    },
    {
      version: "1.1.41",
      date: new Date().toISOString().split('T')[0],
      title: "Simplificación Operativa de Guías, Enrutamiento de Notificaciones y Gabinete de Crisis AEE",
      items: [
        "Simplificación de la Guía de Usuario: erradicación del formato tutorial 'Paso a Paso' y de los 'Protocolos Maestros' para ofrecer una ficha operativa directa por rol.",
        "Corrección integral del enrutamiento de notificaciones [👁️ Ver Notificación ➔]: resolución contextual de vistas, filtros por departamento y scroll a elementos ancla.",
        "Espacio oficial de Comunicado de Crisis para el CEO: integración del modelo DOC_3_COMUNICADO_SANCION, campo obligatorio de enlace Google Drive y difusión en Gobernanza.",
        "Persistencia de Resoluciones Ejecutivas de Crisis en D1 y reconciliación atómica en state.mergeData."
      ],
      highlights: [
        { type: "NUEVO", text: "Fichas operativas directas por puesto de trabajo y erradicación de pasos tutoriales redundantes." },
        { type: "MEJORA", text: "Enrutamiento inteligente de notificaciones con auto-scroll a anclas y apertura directa de modales y filtros." },
        { type: "GOBERNANZA", text: "Gabinete de Crisis para el CEO con modelo DOC_3, enlace obligatorio a Google Drive y archivo inmutable." },
        { type: "SISTEMA", text: "Sincronización de resoluciones ejecutivas de crisis con Cloudflare D1 y fusión atómica local-servidor." }
      ]
    },
    {
      version: "1.1.40",
      date: new Date().toISOString().split('T')[0],
      title: "Optimización Integral de Ergonomía Táctil, Accesibilidad WCAG y Experiencia de Usuario",
      items: [
        "Ajuste estricto de touch-targets (>=44x44px) en botones tácticos, selectores de rol y acciones del drawer.",
        "Incorporación de buscador instantáneo en el catálogo B2C y separación ergonómica en carrito.",
        "Descongestión visual de la Bóveda de Finanzas: cronograma colapsable para priorizar auditoría de órdenes.",
        "Blindaje de gestos en el Drawer táctico inferior, limitando el cierre por arrastre a la zona del tirador.",
        "Mejora del andamiaje pedagógico: aclaración de costes reales en reciclaje (0.00 €v) y notas informativas de cálculo.",
        "Priorización inteligente en aduanas docentes: elevación superior de trámites pendientes de resolución.",
        "Filtro por clase en el Llavero Maestro y confirmaciones modales de seguridad en buzón."
      ],
      highlights: [
        { type: "MEJORA", text: "Touch targets de 44x44px en toda la interfaz táctil y selectores de rol para total cumplimiento WCAG AAA." },
        { type: "NUEVO", text: "Buscador instantáneo en catálogo de materiales B2C y filtro por clase en Llavero Maestro." },
        { type: "ERGONOMÍA", text: "Cronograma colapsable en Finanzas y blindaje contra swipe accidental en el drawer inferior." },
        { type: "FORMATIVO", text: "Notas formativas de cálculo de eficiencia e instrucción explícita de coste 0.00 €v para material reciclado." }
      ]
    },
    {
      version: "1.1.39",
      date: new Date().toISOString().split('T')[0],
      title: "Erradicación de Texto Libre en Devolución de Acciones Publicitarias y Blindaje Zero-Text",
      items: [
        "Eliminación del campo de texto libre en la devolución de acciones de marketing por el CEO, sustituyéndolo por selector tipificado y campo obligatorio de enlace a Google Drive con observaciones.",
        "Inspección integral de roles y blindaje de la directiva Zero-Text en toda la gobernanza y aduanas de la plataforma."
      ],
      highlights: [
        { type: "ZERO-TEXT", text: "Enlace obligatorio a Google Drive para observaciones del CEO al devolver acciones publicitarias." },
        { type: "SEGURIDAD", text: "Blindaje Zero-Text 100% en todos los roles y aduanas de la plataforma." }
      ]
    },
    {
      version: "1.1.38",
      date: new Date().toISOString().split('T')[0],
      title: "Blindaje Zero-Text 100%, Subsanación Docente en Rúbricas y Andamiaje de Acciones de Marketing",
      items: [
        "Blindaje Zero-Text / RGPD Art. 13 Estricto: Erradicación total de funciones prompt() nativas del navegador en el rechazo de marcas y confirmación de reset global, sustituyéndolas por modales tipificados.",
        "Flujo de Subsanación Docente en Evaluación Curricular: Nuevo botón interactivo '[ ↩ Subsanar ]' en cada evidencia de rúbrica para requerir subsanación inmediata con motivos cerrados y notificación dual (departamento + CEO).",
        "Andamiaje Didáctico en Marketing (DOC_12): Incorporación de banner explicativo sobre el circuito de contratación de paquetes publicitario y auditoría presupuestaria previa a la ejecución de acciones.",
        "Robustez en Aprobación de Slogan en Registro Mercantil: Mejora de la precedencia y fallback automático ante campos de texto de lema corporativo."
      ]
    },
    {
      version: "1.1.37",
      date: new Date().toISOString().split('T')[0],
      title: "Optimización Integral de Bóveda de Órdenes, Visado de Campañas MKT, Notificaciones Interactivas y Desacoplo de Entregables ECO",
      items: [
        "Bóveda de Órdenes Integral: Visibilidad completa de paquetes de Marketing y acciones publicitarias individuales (DOC_12) con botones directos de aprobación o devolución para el CEO.",
        "Pestañas de Estado Optimizadas: Reemplazo de Historial por 'Denegadas' y nuevo filtro por departamento (I+D, Marketing, Taller).",
        "Notificaciones Interactivas con Botón 'Ver Notificación': Enrutamiento contextual directo con un clic hacia el panel y pestaña correspondiente a cada aviso.",
        "Desacoplo de Entregables de Economía para el CEO: Reorganización de 'Finanzas & ECO' mostrando el Registro Auditado de Tickets Físicos (€) y centralizando el visado de entregables en el Dossier.",
        "Semáforo Fidedigno en Dossier y Cronograma: Diferenciación de 4 estados reales (Pendiente, En Taller, En Revisión CEO, Devuelto por Subsanación, Entregado a Docente) y gestión reactiva ante devoluciones del CEO."
      ]
    },
    {
      version: "1.1.36",
      date: new Date().toISOString().split('T')[0],
      title: "Flujo Oficial de Aprobación de Acciones Publicitarias (Marketing ➔ CEO ➔ Docente de Liderazgo y Coordinación)",
      items: [
        "Incorporación de la plantilla oficial DOC_12 (Ficha Técnica y Control de Acción Publicitaria) para reporte de campañas.",
        "Nuevo flujo de gobernanza publicitaria: las acciones consumidas de un paquete activo pasan obligatoriamente por validación o devolución del CEO con enlace a Google Drive.",
        "Panel de recepción docente en Validaciones y Aduana para el profesor de Liderazgo y Emprendimiento (LYE) y Coordinadores ante acciones publicitarias validadas."
      ]
    },
    {
      version: "1.1.35",
      date: new Date().toISOString().split('T')[0],
      title: "Desbloqueo Definitivo del Nombre de Empresa en Escritorio",
      items: [
        "Eliminación radical de la propiedad truncate y topes de ancho en el título corporativo, garantizando que el nombre completo de la empresa se muestre íntegro en pantallas de ordenador y tablet sin puntos suspensivos.",
        "Implementación de la clase dedicada .company-header-title con contención adaptativa por debajo de 480px y expansión total sin elipsis en escritorio."
      ]
    },
    {
      version: "1.1.34",
      date: new Date().toISOString().split('T')[0],
      title: "Optimización UI/UX, Icono PWA/Móvil y Comunicación Ejecutiva de Sanciones",
      items: [
        "Configuración del icono oficial logo.jpg en el manifiesto PWA y accesos directos de pantalla de inicio en dispositivos móviles (iOS/Android) y escritorio.",
        "Desbloqueo elástico del nombre de empresa en pantallas de ordenador eliminando el límite rígido de 150px para visualización completa.",
        "Reestructuración de la alerta disciplinaria AEE: comunicación ejecutiva directa del CEO a todos los departamentos de la empresa sin burocracia de alegaciones.",
        "Andamiaje didáctico en tarjetas de KPIs financieros: micro-indicadores explicativos de la deducción de costes netos.",
        "Refuerzo visual de pestaña de navegación activa con subrayado cian neón y botón de Bitácora IA integrado en estética Cyberpunk."
      ]
    },
    {
      version: "1.1.33",
      date: new Date().toISOString().split('T')[0],
      title: "Entropía Criptosegura CSPRNG y Certificación AEPD",
      items: [
        "Implementación de CSPRNG nativo (crypto.getRandomValues) con reducción sin sesgo (unbiased rejection sampling) para la generación de PINs y códigos de acceso corporativo, alineando la plataforma con las directrices de la AEPD (VALiDA Cripto RGPD).",
        "Blindaje de credenciales de aula y regeneración aleatoria de alta entropía para roles empresariales (CEO, Técnico, Finanzas, Marketing, Operaciones e IA).",
        "Garantía de uniformidad matemática en el espacio muestral de 4 dígitos (1000 - 9999) con fallback transparente en entornos restringidos."
      ]
    },
    {
      version: "1.1.32",
      date: new Date().toISOString().split('T')[0],
      title: "Generador Aleatorio de PINs Departamentales y Refuerzo de Credenciales de Flota",
      items: [
        "Incorporación de botones interactivos para generación rápida de PINs aleatorios (4 dígitos numéricos) individuales por rol y masivos por empresa.",
        "Botón de regeneración global en el Llavero Maestro de Coordinación para renovar credenciales y evitar claves por defecto.",
        "Sincronización atómica por lotes con persistencia inmediata en Cloudflare D1 y CDMON (SQLite).",
        "Alineación curricular del archivo documental de entregables y tolerancia a coma decimal en transacciones de mercado B2B."
      ]
    },
    {
      version: "1.1.31",
      date: new Date().toISOString().split('T')[0],
      title: "Actualización Integral del Catálogo Oficial del Super-Marsket",
      items: [
        "Incorporación del catálogo completo oficial de cohetería hidráulico-química con 24 artículos regulados en 6 categorías técnicas.",
        "Cuerpo del Cohete (Estructura Principal): Botella de 500 ml (97€v), 1 L (120€v), 1,5 L (165€v) y 2 L (200€v).",
        "Propulsión y Reactivos: Bicarbonato de Sodio (10€v / gramo) y Vinagre (5€v / 10 ml).",
        "Aerodinámica: Aletas de Cartulina (15€v), Cartón Básico (30€v), Plástico (45€v), PVC Rígido (85€v) y Plastificado (5€v); Puntas de Cartulina (25€v), Cartón Estándar (55€v), Plástico PET (75€v) y Plástico 3D (90€v).",
        "Sistema de Reacción: Papel de cocina (5€v / Hoja) e Hilo de algodón (2€v / Decímetro).",
        "Sellado y Unión: Corcho de vino estándar (25€v), Tapón de goma hermético (40€v), Cinta aislante (10€v / metro), Celo adhesivo (0,50€v / cm), Pegamento de barra (15€v) y Carga termofusible (1€v / uso).",
        "Elementos Extra: Pintura de rotulación y diseño corporativo (2€v / Color)."
      ]
    },
    {
      version: "1.1.30",
      date: new Date().toISOString().split('T')[0],
      title: "Actualización Oficial del Cronograma Maestro y Fechas de Apertura de los 18 Entregables Curriculares",
      items: [
        "Calibración de plazos oficiales de entrega y fechas de desbloqueo (apertura) para las 6 materias LOMLOE (FYQ, LYE, ECO, MAT, LEN)",
        "Física y Química: Preliminar (25/10/2026 - 15/12/2026), Técnico Final (25/10/2026 - 10/04/2027), Hoja de Taller (25/10/2026 - 10/04/2027)",
        "Liderazgo y Emprendimiento: Marca Dic (25/10/2026 - 15/12/2026), Marca Abr (15/01/2027 - 10/04/2027), Business Model (15/01/2027 - 10/04/2027), Canvas (15/01/2027 - 10/04/2027), Diario Dic (25/10/2026 - 15/12/2026), Diario Abr (15/01/2027 - 10/04/2027)",
        "Economía: Presupuesto Inicial (25/10/2026 - 15/12/2026), Cuenta de Resultados (Límite 08/11/2026), Presupuesto Post-Proto (15/12/2026 - 10/01/2027), Balance (15/02/2027 - 10/04/2027)",
        "Matemáticas: Goniómetro, Distancia Conocida, Dos Puntos y Comparativo Final fijados para apertura el 15/01/2027 y entrega el 10/02/2027",
        "Lengua Castellana: Dossier para Inversores fijado para apertura el 15/01/2027 y entrega el 10/04/2027",
        "Sincronización atómica inmediata en state.migrate() con scheduleBaselineVersion para actualizar cronograma y candados en clientes locales y Cloudflare D1"
      ],
      highlights: [
        { type: "CRONOGRAMA", text: "Fechas oficiales de apertura y entrega actualizadas en los 18 entregables curriculares." },
        { type: "MIGRACIÓN", text: "Propagación atómica de fechas sin desajustes en sesiones huérfanas o clientes cacheados." }
      ]
    },
    {
      version: "1.1.29",
      date: new Date().toISOString().split('T')[0],
      title: "Guía de Primeros Pasos Ultra-Escaneable, Onboarding Directo y Poda Integral de Ruido Técnico",
      items: [
        "Rediseño completo de la Guía de Usuario (ui.showGuide): formato estandarizado 'Primeros Pasos' en 4 fases (Acceso, Elementos en Pantalla, Primera Acción y Verificación) para los 7 perfiles operativos",
        "Poda del 80% de texto explicativo redundante, lore innecesario y códigos de documento internos en todas las fichas de departamento",
        "Desconexión entre el Mensaje de Entrada (ui.showOnboarding) y el Manual General: bienvenida ágil de <5 segundos con indicador de próximo hito y acceso a guía bajo demanda",
        "Eliminación total de jerga técnica y backend expuesta al usuario final en modales de bienvenida",
        "Compactación de directivas clave en 3 protocolos directos de una línea en la cabecera del manual táctico"
      ],
      highlights: [
        { type: "GUÍA", text: "Fichas 'Primeros Pasos' ultra-escaneables con checklists visuales para alumnado y profesorado." },
        { type: "ONBOARDING", text: "Mensaje de entrada directo sin saturación de texto ni jerga de backend." },
        { type: "CLARIDAD", text: "Poda del 80% de texto y eliminación de jerga técnica en modales informativos." }
      ]
    },
    {
      version: "1.1.28",
      date: new Date().toISOString().split('T')[0],
      title: "Sincronización Concurrente de Cronograma, 5 Niveles de Patrocinio y Corrección de Flujos Interdepartamentales",
      items: [
        "Sincronización robusta de cronograma y aperturas temporales: mergeData bidireccional de deliverableSchedule y mitigación de colisiones HTTP 409 con incremento incondicional de versión",
        "5 Niveles Oficiales de Patrocinio (ORO 500 €v, PLATA 400 €v, BRONCE 250 €v, COBRE 150 €v y COLABORADOR 100 €v) con reducción directa unificada de costes operativos totales",
        "Corrección de enlaces documentales en rúbricas docentes y dossier de entregas mediante fallback seguro a driveUrl, evitando URLs undefined",
        "Persistencia docente dirigida por ID de startup (cid) con actualización inmediata de timestamp updatedAt para evitar sobrescrituras de calificaciones y acuerdos",
        "Normalización de recuento de votaciones en gobernanza (A_FAVOR / EN_CONTRA) y corrección de cálculo por cantidad (qty) en ejecuciones físicas y BOM del prototipo",
        "Prevención de doble clic en contratación de paquetes de marketing y unificación de IDs en formularios de entrega Google Drive"
      ],
      highlights: [
        { type: "CRONOGRAMA", text: "Blindaje de apertura y plazos con sincronización pausada durante mutaciones docentes y protección Last-Write-Wins en servidor." },
        { type: "PATROCINIO", text: "5 Niveles tipificados de patrocinio con cálculo contable de reducción directa sobre costes operativos totales." },
        { type: "EVALUACIÓN", text: "Garantía de persistencia para calificaciones docentes (grades) y enlaces verificados de Google Drive sin enlaces rotos." },
        { type: "TALLER & BOM", text: "Multiplicador de cantidad (qty) corregido en BOM e inventario físico, y normalización de votos de asamblea." }
      ]
    },
    {
      version: "1.1.27",
      date: new Date().toISOString().split('T')[0],
      title: "Modelos Oficiales Google Docs (/copy), Política Zero-Text 100%, Registro de Slogan en 3 Pasos y Ajuste Curricular LOMLOE",
      items: [
        "Integración de los 11 Modelos Oficiales de Google Docs con botón de acción destacado '📄 Modelo de documento (Hacer copia)' con terminación /copy para forzar copia en Drive del alumno",
        "Política Zero-Text 100% en todos los formularios de alumnado: erradicación total de inputs de texto libre sustituidos por selectores tipificados y enlaces verificados a Google Drive",
        "Nuevo flujo oficial de Registro Mercantil para Slogan Corporativo en 3 pasos: Marketing formula y presenta al CEO ➔ CEO avala y eleva a Coordinación ➔ Coordinación Docente aprueba y registra oficialmente",
        "Nuevo procedimiento para cambio de denominación social: solicitud por CEO mediante modelo y motivos pregenerados, con asignación y bautizo oficial exclusivo por Coordinación Docente",
        "Reestructuración realista de mociones asamblearias (GOVERNANCE_MOTION_TYPES) adaptadas a discrepancias de criterio, consultas de equipo y alternativas de diseño",
        "Ajuste curricular oficial LOMLOE: evaluación presencial en aula para Inglés (sin entregables en Drive) y ponderación matemática exacta en FyQ (10% Preliminar + 10% Hoja Taller + 30% Final + 30% Prototipo + 20% Test/Q&A), consolidando 17 entregables de Drive"
      ],
      highlights: [
        { type: "DOCS", text: "11 Modelos oficiales de Google Docs con botón '/copy' para auto-creación de copias en el Drive del alumno." },
        { type: "ZERO-TEXT", text: "Cero campos de texto libre para alumnos: selectores predefinidos y enlaces a Google Drive con blindaje RGPD." },
        { type: "SLOGAN", text: "Trámite de Slogan en 3 fases: Dpto. Marketing ➔ Aval CEO ➔ Resolución y Registro por Coordinación Docente." },
        { type: "CURRÍCULO", text: "Consolidación de 17 entregables oficiales en Drive; rúbrica de Física y Química al 100% e Inglés en aula presencial." }
      ]
    },
    {
      version: "1.1.26",
      date: new Date().toISOString().split('T')[0],
      title: "Guía Táctica Interactiva 7 Roles, Blindaje RGPD en I+D y Neutralización de Salto de Scroll",
      items: [
        "Guía de usuario táctica rediseñada con Órdenes de Misión, Checklist de 3 minutos, acciones rápidas y avisos de errores frecuentes para los 7 roles",
        "Erradicación total de campos de texto libre en solicitud de ítems especiales I+D (rol Técnico): justificación exclusiva vía enlace Google Drive / Google Docs",
        "Panel docente de homologación de piezas I+D con visualización directa de memoria técnica en Drive y asignación oficial de precio y catálogo",
        "Neutralización absoluta del scroll jumping: erradicación de scrollIntoView en actualización HUD y contención de altura mínima en el ciclo de render",
        "Preservación estricta de posición vertical de scroll entre ciclos reactivos de sincronización y heartbeat"
      ],
      highlights: [
        { type: "GUÍA", text: "Manuales tácticos orientados a secundaria con checklist de 3 minutos, misión en 1 frase y avisos de error frecuente." },
        { type: "RGPD & I+D", text: "Supresión de texto libre en solicitud de piezas de I+D; canal exclusivo mediante Google Docs/Drive." },
        { type: "DOCENTE", text: "Inspección directa de memorias técnicas de piezas especiales en Google Drive y fijación de precios en catálogo." },
        { type: "ESTABILIDAD", text: "Eliminación de saltos indeseados de scroll hacia arriba durante el refresco automático y retención de viewport." }
      ]
    },
    {
      version: "1.1.25",
      date: new Date().toISOString().split('T')[0],
      title: "Estabilidad de Mutaciones Docentes, Retención de Scroll, Comercios Oficiales y Carrito Reactivo",
      items: [
        "Permisos de mutación docente ampliados por materia (FYQ, ECO, BIO, MAT, LEN, ING y COORD_*) para salvaguardar evaluaciones",
        "Retención estricta de posición de scroll en telemetría y ciclos de refresco automático reactivo",
        "Estandarización del catálogo oficial de comercios para registro de compras físicas (COMMERCIAL_SHOPS_DEF)",
        "Carrito de la compra reactivo in-situ sin parpadeos, actualizaciones numéricas atómicas y animaciones CSS",
        "Filtrado selectivo de ítems de mercado exclusivos por startup y solicitud de componentes especiales vía Google Drive"
      ],
      highlights: [
        { type: "DOCENCIA", text: "Desbloqueo de persistencia de estado para docentes de materia preservando el reseteo exclusivo para coordinación." },
        { type: "TELEMETRÍA", text: "Filtro dinámico de aula por clase con retención de scroll y actualización focalizada de tabla." },
        { type: "OPERACIONES", text: "Comercios oficiales estandarizados (Mercadona, Carrefour, Eroski, Dia, Ferretería, Bazar y genérico)." },
        { type: "MERCADO", text: "Carrito reactivo in-situ sin parpadeos y gestión de ítems exclusivos y especiales mediante Drive." }
      ]
    },
    {
      version: "1.1.24",
      date: new Date().toISOString().split('T')[0],
      title: "Despachador Contextual Zero-Leak, Drawer Táctil con Gestos 100dvh y Navegación Idempotente",
      items: [
        "Despachador contextual universal sobre #viewport con ciclo de desmontaje beforeRenderCleanup",
        "Bottom-sheet drawer táctil con física de arrastre swipe-to-dismiss, soporte 100dvh y safe-area",
        "Navegación HUD idempotente con persistencia de scroll horizontal y centrado suave en móviles",
        "Protección de temporizador persistente en reloj HUD mitigando duplicación de intervals en heap",
        "Blindaje de precaché en Service Worker con resolución de scope relativa para entornos de aula"
      ],
      highlights: [
        { type: "RENDIMIENTO", text: "Eliminación de fugas de memoria y reducción de INP a <90ms en móviles." },
        { type: "ERGONOMÍA", text: "Control gestual táctil nativo en panel de inspección y contención 100dvh." },
        { type: "HUD", text: "Navegación horizontal fluida sin saltos ni parpadeos al alternar departamentos." },
        { type: "OFFLINE", text: "Arquitectura de caché estricta desacoplada de fallos de red en servidor." }
      ]
    },
    {
      version: "1.1.23",
      date: new Date().toISOString().split('T')[0],
      title: "Navegación Operativa por Rol, Landing Prioritario, HUD Compacto <=64px y Flujo de Taller FyQ",
      items: [
        "Reingeniería de navegación de alumnos en 4 pestañas directas y específicas ordenadas por rol",
        "Aterrizaje automático al login en la herramienta operativa prioritaria de cada departamento",
        "HUD táctico ultra-compacto (<=64px) sticky con saldo corporativo neón y acceso directo a Bitácora IA",
        "Panel docente dual segmentado: Modo Aula (Rúbricas y Aduana) vs. Modo Coordinación TIC avanzado",
        "Pipeline de taller FyQ: Técnico (Planos/BOM) -> Operario (Validación/Incidencias) -> CEO (Visado) -> Docente",
        "Precios congelados inmutables en marketing y registro de compras físicas exclusivo de Operaciones"
      ],
      highlights: [
        { type: "NAVEGACIÓN", text: "Máximo 4 pestañas operativas directas por rol sin niveles intermedios redundantes." },
        { type: "LANDING", text: "Entrada directa a la herramienta operativa prioritaria de cada puesto tras el login." },
        { type: "HUD", text: "Barra táctica superior fija de 64px sticky con saldo y acceso instantáneo a IA." },
        { type: "TALLER", text: "Control de calidad físico para Física y Química con catálogo cerrado de incidencias." }
      ]
    },
    {
      version: "1.1.22",
      date: new Date().toISOString().split('T')[0],
      title: "Reestructuración UI: 3 Pestañas Alumnos, HUD Táctico <=64px y Panel Docente Dual",
      items: [
        "Reingeniería de navegación de alumnos en 3 pestañas principales: Mi Trabajo, Dossier & Rúbricas y Mi Empresa",
        "Modo HUD táctico ultra-compacto (<=64px) con saldo neón y botón de acceso directo a IA",
        "Panel docente dual segmentado: Modo Aula (Rúbricas y Aduana) vs. Modo Coordinación TIC avanzado",
        "Filtro reactivo por defecto en Dossier para entregables de la fase activa o próximos 15 días con histórico ampliable",
        "Sub-tabs modulares en Mi Empresa: Gobernanza y Asamblea, Historial de Órdenes y SUPERMARS-KET",
        "Blindaje de flujos: Taller FyQ, inmutabilidad de precios en marketing y compra física exclusiva de Operario"
      ],
      highlights: [
        { type: "UI/UX", text: "Navegación compacta y optimizada a 3 pestañas operativas para empresas." },
        { type: "HUD", text: "Hero Banner reducido a barra táctica horizontal fija de 64px." },
        { type: "DOCENTE", text: "División funcional entre calificación diaria de aula y administración avanzada TIC." },
        { type: "SEGURIDAD", text: "Cumplimiento estricto RGPD, validación Google Drive y trazabilidad curricular." }
      ]
    },
    {
      version: "1.1.21",
      date: new Date().toISOString().split('T')[0],
      title: "Workflow de Taller FyQ, Precios Inmutables MKT, Compra Física Exclusiva y Navegación Contextual",
      items: [
        "Máquina de estados de taller para Hoja de Taller (FyQ): Flujo Técnico -> Operario -> CEO -> Docente",
        "Catálogo tipificado de incidencias técnicas de taller (WORKSHOP_INCIDENCE_REASONS) sin texto libre",
        "Inmutabilidad de precios en paquetes de Marketing y justificaciones vía enlace Google Drive",
        "Reserva exclusiva de compra real física y escandallo en taller para el rol de Operaciones",
        "Retirada definitiva de texto libre en venta de excedentes B2B hacia informes técnicos en Google Drive",
        "Navegación contextual con salto directo por IDs canónicos y activación automática de rol en la Guía"
      ],
      highlights: [
        { type: "TALLER", text: "Pipeline bidireccional de control de calidad físico y BOM para Física y Química." },
        { type: "MARKETING", text: "Precios congelados inmutables y reporte de acciones publicitarias vía Google Drive." },
        { type: "LOGÍSTICA", text: "Gasto real en euros y comprobantes físicos restringidos a Operaciones." },
        { type: "RGPD", text: "Denominación legal oficial del Colegio Miravalles-El Redín como Responsable del Tratamiento." }
      ]
    },
    {
      version: "1.1.20",
      date: new Date().toISOString().split('T')[0],
      title: "Candado Temporal de Entregables, Plantillas Docentes y Guía en Acordeones Accesibles",
      items: [
        "Candado temporal en entregables con bloqueo de envíos hasta la fecha de apertura docente",
        "Asignación docente de enlaces a plantillas oficiales de Google Drive en entregables",
        "Botón de acceso directo a plantilla docente de preparación en tarjetas y drawer de entregas",
        "Rediseño accesible de la Guía de Usuario táctica y onboarding en acordeones semánticos (<details>)",
        "Controles docentes de configuración de fechas de apertura, cierre y plantilla en gestión curricular",
        "Control estricto de acceso por rol para opciones de backup D1 y telemetría (exclusivo COORD_*)"
      ],
      highlights: [
        { type: "CANDADO", text: "Bloqueo preventivo de envíos hasta la apertura oficial docente." },
        { type: "PLANTILLAS", text: "Acceso directo a plantillas Google Drive asignadas por el docente." },
        { type: "GUÍA", text: "Acordeones accesibles e interactivos segmentados por rol y flujo de trabajo." },
        { type: "SEGURIDAD", text: "Aislamiento estricto de backups y telemetría para roles de coordinación." }
      ]
    },
    {
      version: "1.1.19",
      date: new Date().toISOString().split('T')[0],
      title: "Contención de Precios B2B, Desacoplamiento de Bóveda y Validación Docente de Marca",
      items: [
        "Control numérico y validación estricta de precios en Mercado Secundario (B2B)",
        "Desacoplamiento del Cronograma Maestro hacia el Dossier Corporativo",
        "Circuito de aprobación docente de Eslogan y Misión en Coordinación",
        "Erradicación de campos de texto libre en contratación de Campañas Publicitarias hacia Google Drive",
        "Pipeline centralizado de descarte y purga de propuestas en staging",
        "Validación contractual estricta de evidencias publicitarias mediante GOOGLE_DRIVE_REGEX"
      ],
      highlights: [
        { type: "MERCADO", text: "Validación y sanitización numérica estricta en ofertas de mercado B2B." },
        { type: "DOSSIER", text: "Cronograma curricular reubicado como hoja de ruta en el Dossier Corporativo." },
        { type: "MARCA", text: "Circuito de aprobación previa de eslogan y misión en panel de Coordinador." },
        { type: "MARKETING", text: "Brief publicitario exclusivo vía Google Drive sin texto libre." }
      ]
    },
    {
      version: "1.1.18",
      date: new Date().toISOString().split('T')[0],
      title: "Pipeline Jerárquico de Entregables, Catálogos Enums y Votación Tripartita",
      items: [
        "Supervisión jerárquica del CEO en entregables hacia el equipo docente",
        "Catálogos cerrados de motivos de devolución, proveedores de IA y tipos de moción",
        "Votación de gobernanza tripartita (A Favor, En Contra, No estoy seguro)",
        "Nuevo entregable oficial Hoja de Taller BOM para Física y Química",
        "Expedientes disciplinarios inmutables y vinculación de logo corporativo a Google Drive"
      ],
      highlights: [
        { type: "PIPELINE", text: "Supervisión jerárquica del CEO previa a la elevación docente." },
        { type: "CATÁLOGOS", text: "Erradicación de texto libre con catálogos enums para IA, gobernanza y motivos CEO." },
        { type: "GOBERNANZA", text: "Votación tripartita de mociones (A Favor / En Contra / No estoy seguro)." },
        { type: "FYQ", text: "Integración de Hoja de Taller BOM y control de calidad físico." }
      ]
    },
    {
      version: "1.1.17",
      date: new Date().toISOString().split('T')[0],
      title: "Blindaje RGPD Integral & Enlaces Corporativos Drive",
      items: [
        "Despliegue de privacidad RGPD por capas en login mediante modal accesible",
        "Cuaderno de Bitácora y prompts IA migrados a enlaces de Google Docs/Drive",
        "Erradicación de campos de texto libre en Órdenes, Mociones y Marketing",
        "Ciclo de vida efímero con TTL de 72h para reportes de coordinación en D1"
      ],
      highlights: [
        { type: "RGPD", text: "Privacidad por capas en login con modal informativo accesible (Art. 13)." },
        { type: "DOCS", text: "Cuaderno de bitácora y prompts IA migrados a enlaces de Google Docs/Drive." },
        { type: "SEGURIDAD", text: "Erradicación de campos de texto libre en Órdenes, Mociones y Marketing." },
        { type: "SISTEMA", text: "Purga automática de reportes de coordinación con TTL efímero de 72h." }
      ]
    },
    {
      version: "1.1.16",
      date: new Date().toISOString().split('T')[0],
      title: "Restricción de Canal Google Drive & Mitigación RGPD de Fuga de Datos",
      items: [
        "Restricción estricta de canal de entregas a URLs corporativas verificadas de Google Drive",
        "Supresión de campos de texto libre en entregables mitigando riesgos de fuga de datos (RGPD)",
        "Validación contractual simétrica en cliente y backend Cloudflare D1 (GOOGLE_DRIVE_REGEX)",
        "Renderizado defensivo con inspección tipológica (Doc, Sheet, Slide, Carpeta) y neutralización de payloads legacy",
        "Protocolo obligatorio de permisos compartidos de solo lectura en recursos Drive"
      ],
      highlights: [
        { type: "RGPD", text: "Canal de entregas restringido exclusivamente a URLs verificadas de Google Drive." },
        { type: "SEGURIDAD", text: "Supresión de entradas de texto libre en entregables para evitar fuga de datos personales." },
        { type: "SISTEMA", text: "Validación estricta con GOOGLE_DRIVE_REGEX en frontend y backend D1." },
        { type: "DEFENSA", text: "Renderizado defensivo con detección de tipo y aislamiento de registros legacy no conformes." }
      ]
    },
    {
      version: "1.1.15",
      date: new Date().toISOString().split('T')[0],
      title: "Blindaje de Privacidad Zero-Trust, Anonimización de IP y Cumplimiento RGPD",
      items: [
        "Eliminación total de registro de direcciones IP y anonimización en capa de red",
        "Filtro activo anti-PII en formularios y cláusula informativa de 1ª capa (Art. 13)",
        "Aislamiento HTTP hermético (Referrer-Policy: no-referrer) y CSP estricta local",
        "Sellado de prototipos de autenticación y persistencia limpia de estado"
      ],
      highlights: [
        { type: "PRIVACIDAD", text: "Eliminación total de registro de direcciones IP y anonimización en capa de red." },
        { type: "RGPD", text: "Filtro activo anti-PII en formularios y cláusula informativa de 1ª capa (Art. 13)." },
        { type: "SEGURIDAD", text: "Aislamiento HTTP hermético (Referrer-Policy: no-referrer) y CSP estricta local." },
        { type: "ARQUITECTURA", text: "Sellado de prototipos de autenticación y persistencia limpia de estado." }
      ]
    },
    {
      version: "1.1.14",
      date: new Date().toISOString().split('T')[0],
      title: "Hardening Perimetral & Privacidad RGPD",
      items: [
        "Eliminación de dependencias de telemetría externa (Google Fonts)",
        "Supresión de snapshots no cifrados en almacenamiento local",
        "Políticas de Aislamiento HTTP y cabeceras CSP estrictas",
        "Micro-cláusula de 1ª capa para tratamiento educativo de datos",
        "Sellado e inmutabilidad de estados globales"
      ],
      highlights: [
        { type: "PRIVACIDAD", text: "Eliminación de dependencias de telemetría externa (Google Fonts)" },
        { type: "SEGURIDAD", text: "Supresión de snapshots no cifrados en almacenamiento local" },
        { type: "SEGURIDAD", text: "Políticas de Aislamiento HTTP y cabeceras CSP estrictas" },
        { type: "RGPD", text: "Micro-cláusula de 1ª capa para tratamiento educativo de datos" },
        { type: "INTEGRIDAD", text: "Sellado e inmutabilidad de estados globales" }
      ]
    },
    {
        version: "1.1.13beta",
        date: "Octubre 2026",
        title: "Hardening Perimetral HMAC-SHA256 y Blindaje de Mutaciones en Servidor",
        highlights: [
            { type: "SEGURIDAD", text: "Autenticación Zero-Trust con tokens de sesión firmados mediante HMAC-SHA256 (Web Crypto API) para docentes y empresas." },
            { type: "SISTEMA", text: "Resolución de referencias de sesión de coordinador en /api/state y desindexación de migraciones SQL en Git." },
            { type: "ESTABILIDAD", text: "Validación estricta de URLs seguras HTTPS en entregables de proyectos y sanitización de claves de entrega." }
        ]
    },
    {
        version: "1.1.12",
        date: "Octubre 2026",
        title: "Buzón Reactivo de Coordinación, Guía Táctica Interactiva y Optimización CDMON",
        highlights: [
            { type: "NUEVO", text: "Alerta Reactiva en Buzón de Coordinación: Notificación en tiempo real y contador pulsante en el HUD cuando los alumnos envían sugerencias, dudas o reporte de bugs." },
            { type: "NUEVO", text: "Guía de Usuario Interactiva: Acceso transversal mediante el botón [ ❓ GUÍA ] con selector dinámico de roles (CEO, Técnico, Finanzas, Marketing, Operaciones, Auxiliar y Docente)." },
            { type: "RENDIMIENTO", text: "Latido Calibrado para CDMON (12s + ETag): Optimización de concurrencia y ancho de banda con respuestas HTTP 304 (0 bytes) ante sondeos sin cambios." },
            { type: "SISTEMA", text: "Sincronización Concurrente Particionada: Desacoplamiento por startup (company_state) y blindaje del Libro Mayor (Ledger Event-Sourcing) protegiendo saldos de colisiones." },
            { type: "SEGURIDAD", text: "Integridad Criptográfica de Sesión: Registro y verificación de sesión protegida en memoria transitoria contra manipulaciones locales." }
        ]
    },
    {
        version: "1.1.07",
        date: "Octubre 2026",
        title: "Optimización Zero-Heap en Consultas SQLite y Eficiencia de Memoria",
        highlights: [
            { type: "RENDIMIENTO", text: "v1.1.07: Purga directa a nivel de motor SQLite (Zero-Heap) eliminando la instanciación innecesaria en memoria de servidor." },
            { type: "CONCURRENCIA", text: "Validaciones Atómicas Quirúrgicas: Verificación de acceso y roles con lecturas escalares directas sin carga de estructuras globales." },
            { type: "SISTEMA", text: "Estabilidad de Servidor: Reducción drástica del consumo de RAM por petición para soportar alta carga simultánea en hosting compartido." }
        ]
    },
    {
        version: "1.1.06",
        date: "Octubre 2026",
        title: "Infraestructura CDMON LAMP (Apache + PHP 8.x + SQLite3 WAL)",
        highlights: [
            { type: "SISTEMA", text: "v1.1.06: Despliegue directo en hosting CDMON (Apache + PHP 8.x + SQLite3 en modo WAL), eliminando dependencias de Cloudflare Workers/D1." },
            { type: "RENDIMIENTO", text: "Telemetría ETag y HTTP 304: Consulta sub-milisegundo de versión con respuesta 304 sin payload (0 bytes) ante sondeos idénticos." },
            { type: "CONCURRENCIA", text: "Soporte de Alta Concurrencia (180 alumnos): SQLite WAL con busy_timeout a 5000ms y serialización transaccional inmediata." },
            { type: "SEGURIDAD", text: "Aislamiento de Almacenamiento: Base de datos marsket.sqlite blindada por .htaccess con rechazo explícito Require all denied." }
        ]
    },

    {
        version: "1.1.05",
        date: "Octubre 2026",
        title: "Optimización de Telemetría HTTP 304, Mitigación de I/O y Acreditaciones Docentes",
        highlights: [
            { type: "SISTEMA", text: "v1.1.05: Optimización de telemetría de red bajo estándar HTTP 304, mitigación de I/O en almacenamiento y habilitación de terminal de acreditación para el claustro docente." },
            { type: "NUEVO", text: "Acreditaciones Claustro Docente PDF: Emisión de tarjetas de acceso físicas con avatar táctico, código de barras y protocolo AEE." },
            { type: "MEJORA", text: "Mitigación de Ancho de Banda y Concurrencia: Validación sub-milisegundo ETag/304 y reintento con backoff exponencial estocástico." }
        ]
    },
    {
        version: "1.1.03",
        date: "Octubre 2026",
        title: "Actualización de Seguridad Estructural y Optimización de Red",
        highlights: [
            { type: "SISTEMA", text: "Arquitectura de Seguridad Estructural: Blindaje de la capa de persistencia y verificación centralizada de operaciones en servidor." },
            { type: "MEJORA", text: "Optimización de Red y Telemetría: Eficiencia en la transferencia de datos operativos y sincronización robusta entre terminales." },
            { type: "SISTEMA", text: "Sesiones Cifradas: Protocolos reforzados de autenticación de canal con aislamiento de contexto operativo." }
        ]
    },
    {
        version: "1.1.02",
        date: "Octubre 2026",
        title: "Credenciales PDF Cyberpunk A4, Reseteo Transaccional D1 y Sincronización Concurrente",
        highlights: [
            { type: "NUEVO", text: "Credenciales PDF Cyberpunk A4: Emisión de tarjetas HUD de acceso de doble cara con avatar reticular neón, código de barras dinámico y bloque de advertencia CAUTION bajo guarda docente." },
            { type: "SISTEMA", text: "Reseteo Transaccional Global: Endpoint RPC /api/admin/reset en D1 con purga selectiva de clientes y broadcast multi-cliente." },
            { type: "SISTEMA", text: "Sincronización Concurrente: Control optimista de versiones en D1 con resolución no destructiva de colisiones HTTP 409." },
            { type: "FIX", text: "Persistencia SuperMARS-KET: Confirmación previa de D1 y suspensión de sondeos durante mutaciones de catálogo docente." },
            { type: "MEJORA", text: "Robustez y Controles Químicos: Redondeo financiero exacto en céntimos y validación estricta de reactivos químicos." },
            { type: "NUEVO", text: "HUD Plegable y Telemetría Léxica: Agrupación colapsable de dudas resueltas y reporte automático con badge pulsante de infracciones." }
        ]
    },
    {
        version: "1.1.01",
        date: "Octubre 2026",
        title: "Gestión de Catálogo, Fix de Precios y Tarjetas PDF de Acceso",
        highlights: [
            { type: "NUEVO", text: "Tarjetas PDF de Acceso AEE: Emisión e impresión de credenciales físicas/digitales por rol, flota por startup y baraja completa de aula." },
            { type: "FIX", text: "Purga de Artículos en Catálogo: Activación del botón de eliminación directa de ítems obsoletos o de prueba en SUPERMARS-KET." },
            { type: "FIX", text: "Edición y Persistencia de Precios: Actualización numérica inmediata y re-renderizado reactivo en la tabla de gestión de precios." }
        ]
    },
    {
        version: "1.1.00",
        date: "Octubre 2026",
        title: "Lanzamiento Oficial de Producción",
        highlights: [
            { type: "NUEVO", text: "Cronograma Maestro: Matriz curricular de 19 entregables con semáforos de plazo integrados para las 6 materias." },
            { type: "NUEVO", text: "Registro Mercantil: Flujo oficial de solicitud y aprobación de cambio de denominación social para startups." },
            { type: "SISTEMA", text: "Blindaje Léxico Universal: Intercepción anti-evasión en todos los formularios con distinción de avisos y sanciones AEE." },
            { type: "MEJORA", text: "Interfaz Adaptable y Scanline Láser: Experiencia visual HUD homogénea en móviles, iPad y monitores de escritorio sin desbordamiento." },
            { type: "SISTEMA", text: "Hardening de Credenciales: Enmascaramiento de PINs en Llavero Maestro y persistencia sincronizada en Cloudflare D1." }
        ]
    }
];

const DEFAULT_DEADLINES = {};
DELIVERABLES_DEF.forEach(d => {
    DEFAULT_DEADLINES[d.key] = d.defaultDate;
});