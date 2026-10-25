// js/config.js
// --- CONFIGURACIÓN GLOBAL, CATÁLOGO, PONDERACIONES Y CRONOGRAMA MAESTRO (v1.1.29) ---

const APP_VERSION = "1.1.29";

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

// Diccionario Oficial Inmutable de los 11 Modelos de Google Docs (/copy)
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
    DOC_8_CONTROL_AERO: {
        id: 'DOC_8_CONTROL_AERO',
        title: 'PROTOCOLO DE ADQUISICIÓN Y CONTROL DE AERO-ESTRUCTURA',
        flow: 'Financiero & Operaciones - Control de Calidad',
        copyUrl: 'https://docs.google.com/document/d/1Y5dAyCQ92Avft0_kVCrJmcamc-J8g7G2Z23Euj1TLso/copy'
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

// Definición Maestra Oficial de los 17 Entregables Curriculares en Google Drive
const DELIVERABLES_DEF = [
    // Física y Química (3)
    {
      key: "hoja_taller_fyq",
      subject: "FYQ",
      title: "Hoja de Taller: BOM y Control de Ensamble",
      name: "3. Hoja de Taller: BOM y Control de Ensamble",
      shortName: "Hoja de Taller (FYQ)",
      desc: "Registro de desglose de materiales y control de calidad físico (Física y Química).",
      role: "OPERACIONES_IA",
      defaultDate: "2027-04-10T23:59",
      weight: "10% FYQ",
      defaultOpenDate: null,
      defaultGuideDocUrl: "https://docs.google.com/document/d/1ehTeMTmHzY5Jl8dcVjvF-2AkfQQBNRR0tctTWdqSI1o/copy"
    },
    { key: 'preliminaryReport', subject: 'FYQ', name: '1. Informe Preliminar, Boceto y Foto (Dic)', shortName: 'Preliminar FYQ (Dic)', role: 'TECNICO', defaultDate: '2026-12-15T23:59', weight: '10% FYQ', defaultOpenDate: null, defaultGuideDocUrl: "" },
    { key: 'technicalReport', subject: 'FYQ', name: '2. Informe Técnico Final Exhaustivo (Abr)', shortName: 'Técnico FYQ (Abr)', role: 'TECNICO', defaultDate: '2027-04-20T23:59', weight: '30% FYQ', defaultOpenDate: null, defaultGuideDocUrl: "" },
    
    // Liderazgo y Emprendimiento (6)
    { key: 'brandIdentity_dec', subject: 'LYE', name: '1A. Identidad de Marca y Misión — DICIEMBRE', shortName: 'Marca Dic (LYE)', role: 'MARKETING', defaultDate: '2026-12-10T23:59', weight: '10% LYE', defaultOpenDate: null, defaultGuideDocUrl: "" },
    { key: 'brandIdentity_apr', subject: 'LYE', name: '1B. Identidad de Marca y Misión — ABRIL', shortName: 'Marca Abr (LYE)', role: 'MARKETING', defaultDate: '2027-04-10T23:59', weight: '10% LYE', defaultOpenDate: null, defaultGuideDocUrl: "" },
    { key: 'businessModelDoc', subject: 'LYE', name: '2. Business Model — Documento Escrito', shortName: 'Business Model (Doc)', role: 'MARKETING', defaultDate: '2026-11-20T23:59', weight: '25% LYE', defaultOpenDate: null, defaultGuideDocUrl: "" },
    { key: 'businessModelCanvas', subject: 'LYE', name: '3. Business Model Canvas (Lienzo Estratégico)', shortName: 'Canvas (LYE)', role: 'MARKETING', defaultDate: '2026-11-25T23:59', weight: '15% LYE', defaultOpenDate: null, defaultGuideDocUrl: "" },
    { key: 'decisionDiary_dec', subject: 'LYE', name: '4A. Diario Decisiones, Conflictos e IA — DICIEMBRE', shortName: 'Diario IA Dic (LYE)', role: 'OPERACIONES_IA', defaultDate: '2026-12-15T23:59', weight: '10% LYE', defaultOpenDate: null, defaultGuideDocUrl: "https://docs.google.com/document/d/1QDzumCcDHLWcQJlkPSaA1Q16Kj0Ff9wsHiPf_clLau8/copy" },
    { key: 'decisionDiary_apr', subject: 'LYE', name: '4B. Diario Decisiones, Conflictos e IA — ABRIL', shortName: 'Diario IA Abr (LYE)', role: 'OPERACIONES_IA', defaultDate: '2027-04-20T23:59', weight: '10% LYE', defaultOpenDate: null, defaultGuideDocUrl: "https://docs.google.com/document/d/1QDzumCcDHLWcQJlkPSaA1Q16Kj0Ff9wsHiPf_clLau8/copy" },

    // Economía (4)
    { key: 'budgetInitial', subject: 'ECO', name: '1. Presupuesto Inicial de Lanzamiento', shortName: 'Presupuesto Inicial', role: 'FINANZAS', defaultDate: '2026-11-10T23:59', weight: '20% ECO', defaultOpenDate: null, defaultGuideDocUrl: "" },
    { key: 'incomeStatement', subject: 'ECO', name: '2. Cuenta de Resultados Provisional', shortName: 'Cuenta Resultados', role: 'FINANZAS', defaultDate: '2026-12-18T23:59', weight: '20% ECO', defaultOpenDate: null, defaultGuideDocUrl: "" },
    { key: 'budgetPostProto', subject: 'ECO', name: '3. Presupuesto Post-Prototipo Ajustado', shortName: 'Presupuesto Post-Proto', role: 'FINANZAS', defaultDate: '2027-02-15T23:59', weight: '20% ECO', defaultOpenDate: null, defaultGuideDocUrl: "" },
    { key: 'balanceSheet', subject: 'ECO', name: '4. Balance de Situación Simplificado', shortName: 'Balance de Situación', role: 'FINANZAS', defaultDate: '2027-04-15T23:59', weight: '20% ECO', defaultOpenDate: null, defaultGuideDocUrl: "" },

    // Matemáticas (4)
    { key: 'goniometerEvidence', subject: 'MAT', name: '1. Evidencia Fotográfica / Elaboración Goniómetro', shortName: 'Goniómetro (MAT)', role: 'TECNICO', defaultDate: '2026-11-15T23:59', weight: '25% MAT', defaultOpenDate: null, defaultGuideDocUrl: "" },
    { key: 'mathReportDist', subject: 'MAT', name: '2. Informe: Distancia Conocida a Base de Lanzamiento', shortName: 'Dist. Conocida (MAT)', role: 'TECNICO', defaultDate: '2026-12-01T23:59', weight: '25% MAT', defaultOpenDate: null, defaultGuideDocUrl: "" },
    { key: 'mathReportTwoPoints', subject: 'MAT', name: '3. Informe: Dos Mediciones Separadas y Ángulo', shortName: 'Dos Puntos (MAT)', role: 'TECNICO', defaultDate: '2027-02-20T23:59', weight: '25% MAT', defaultOpenDate: null, defaultGuideDocUrl: "" },
    { key: 'mathReportFinal', subject: 'MAT', name: '4. Informe Técnico Final Comparativo de Apogeo', shortName: 'Informe Final (MAT)', role: 'TECNICO', defaultDate: '2027-04-15T23:59', weight: '25% MAT', defaultOpenDate: null, defaultGuideDocUrl: "" },

    // Lengua Castellana (1)
    { key: 'investorDossier', subject: 'LEN', name: '1. Dossier para Inversores (Texto Argumentativo)', shortName: 'Dossier Inversores (LEN)', role: 'MARKETING', defaultDate: '2026-12-05T23:59', weight: '50% LEN', defaultOpenDate: null, defaultGuideDocUrl: "" }
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