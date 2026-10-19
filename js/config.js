// js/config.js
// --- CONFIGURACIÓN GLOBAL, CATÁLOGO, PONDERACIONES Y CRONOGRAMA MAESTRO (v1.1.00) ---

const APP_VERSION = "1.1.01";
const ROLES_EXTRA = { AUXILIAR: 'AUXILIAR' };

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
        {id: 'c1', name: 'Informe Preliminar / Prototipo (Dic)', weight: 0.20}, 
        {id: 'c2', name: 'Informe Técnico Final Exhaustivo (Abr)', weight: 0.30}, 
        {id: 'c3', name: 'Prototipo Físico / Ensayos Cohete', weight: 0.30}, 
        {id: 'c4', name: 'Defensa Técnica, Roles y Q&A', weight: 0.20}
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

// Definición Maestra Oficial de los 19 Entregables Curriculares
const DELIVERABLES_DEF = [
    // Física y Química (2)
    { key: 'preliminaryReport', subject: 'FYQ', name: '1. Informe Preliminar / Prototipo (Dic)', shortName: 'Preliminar FYQ (Dic)', role: 'TECNICO', defaultDate: '2026-12-15T23:59', weight: '20% FYQ' },
    { key: 'technicalReport', subject: 'FYQ', name: '2. Informe Técnico Final Exhaustivo (Abr)', shortName: 'Técnico FYQ (Abr)', role: 'TECNICO', defaultDate: '2027-04-20T23:59', weight: '30% FYQ' },
    
    // Liderazgo y Emprendimiento (6)
    { key: 'brandIdentity_dec', subject: 'LYE', name: '1A. Identidad de Marca y Misión — DICIEMBRE', shortName: 'Marca Dic (LYE)', role: 'MARKETING', defaultDate: '2026-12-10T23:59', weight: '10% LYE' },
    { key: 'brandIdentity_apr', subject: 'LYE', name: '1B. Identidad de Marca y Misión — ABRIL', shortName: 'Marca Abr (LYE)', role: 'MARKETING', defaultDate: '2027-04-10T23:59', weight: '10% LYE' },
    { key: 'businessModelDoc', subject: 'LYE', name: '2. Business Model — Documento Escrito', shortName: 'Business Model (Doc)', role: 'MARKETING', defaultDate: '2026-11-20T23:59', weight: '25% LYE' },
    { key: 'businessModelCanvas', subject: 'LYE', name: '3. Business Model Canvas (Lienzo Estratégico)', shortName: 'Canvas (LYE)', role: 'MARKETING', defaultDate: '2026-11-25T23:59', weight: '15% LYE' },
    { key: 'decisionDiary_dec', subject: 'LYE', name: '4A. Diario Decisiones, Conflictos e IA — DICIEMBRE', shortName: 'Diario IA Dic (LYE)', role: 'OPERACIONES_IA', defaultDate: '2026-12-15T23:59', weight: '10% LYE' },
    { key: 'decisionDiary_apr', subject: 'LYE', name: '4B. Diario Decisiones, Conflictos e IA — ABRIL', shortName: 'Diario IA Abr (LYE)', role: 'OPERACIONES_IA', defaultDate: '2027-04-20T23:59', weight: '10% LYE' },

    // Economía (4)
    { key: 'budgetInitial', subject: 'ECO', name: '1. Presupuesto Inicial de Lanzamiento', shortName: 'Presupuesto Inicial', role: 'FINANZAS', defaultDate: '2026-11-10T23:59', weight: '20% ECO' },
    { key: 'incomeStatement', subject: 'ECO', name: '2. Cuenta de Resultados Provisional', shortName: 'Cuenta Resultados', role: 'FINANZAS', defaultDate: '2026-12-18T23:59', weight: '20% ECO' },
    { key: 'budgetPostProto', subject: 'ECO', name: '3. Presupuesto Post-Prototipo Ajustado', shortName: 'Presupuesto Post-Proto', role: 'FINANZAS', defaultDate: '2027-02-15T23:59', weight: '20% ECO' },
    { key: 'balanceSheet', subject: 'ECO', name: '4. Balance de Situación Simplificado', shortName: 'Balance de Situación', role: 'FINANZAS', defaultDate: '2027-04-15T23:59', weight: '20% ECO' },

    // Matemáticas (4)
    { key: 'goniometerEvidence', subject: 'MAT', name: '1. Evidencia Fotográfica / Elaboración Goniómetro', shortName: 'Goniómetro (MAT)', role: 'TECNICO', defaultDate: '2026-11-15T23:59', weight: '25% MAT' },
    { key: 'mathReportDist', subject: 'MAT', name: '2. Informe: Distancia Conocida a Base de Lanzamiento', shortName: 'Dist. Conocida (MAT)', role: 'TECNICO', defaultDate: '2026-12-01T23:59', weight: '25% MAT' },
    { key: 'mathReportTwoPoints', subject: 'MAT', name: '3. Informe: Dos Mediciones Separadas y Ángulo', shortName: 'Dos Puntos (MAT)', role: 'TECNICO', defaultDate: '2027-02-20T23:59', weight: '25% MAT' },
    { key: 'mathReportFinal', subject: 'MAT', name: '4. Informe Técnico Final Comparativo de Apogeo', shortName: 'Informe Final (MAT)', role: 'TECNICO', defaultDate: '2027-04-15T23:59', weight: '25% MAT' },

    // Lengua Castellana (1)
    { key: 'investorDossier', subject: 'LEN', name: '1. Dossier para Inversores (Texto Argumentativo)', shortName: 'Dossier Inversores (LEN)', role: 'MARKETING', defaultDate: '2026-12-05T23:59', weight: '50% LEN' },

    // Inglés (2)
    { key: 'oralPresentation', subject: 'ING', name: '1. Expresión Oral: Presentación Prototipo (Slides/Vídeo)', shortName: 'Oral Pitch (ING)', role: 'MARKETING', defaultDate: '2027-04-25T23:59', weight: '70% ING' },
    { key: 'writtenEssays', subject: 'ING', name: '2. Redacciones Escritas y Ensayos Técnicos en Inglés', shortName: 'Essays (ING)', role: 'MARKETING', defaultDate: '2027-04-25T23:59', weight: '30% ING' }
];

const MARKETING_PACKAGES = [
    { id: 'MK-SAT', name: 'Pack Satélite', type: '100% Online', price: 200, actions: 3, desc: 'Alcance digital rápido (Redes sociales, Banners, Mailing).' },
    { id: 'MK-TRA', name: 'Prensa Tradicional', type: '100% Físico', price: 300, actions: 3, desc: 'Impacto tangible (Diseño de pósters, flyers físicos, prensa).' },
    { id: 'MK-HYB', name: 'Despegue Híbrido', type: 'Mixto Básico', price: 450, actions: 4, desc: 'Estrategia estándar (2 Acciones Online + 2 Físicas).' },
    { id: 'MK-SUP', name: 'Cobertura Supernova', type: 'Premium', price: 750, actions: 6, desc: 'Saturación publicitaria máxima. Requiere fuerte justificación financiera.' }
];

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

// Changelog Oficial de Producción v1.1.01
const APP_CHANGELOG = [
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

const INITIAL_DATA = {
    version: 1,
    b2bMarket: [],
    b2bContracts: [],
    securityIncidents: [],
    config: { 
        nextOrderId: 1000,
        deadlines: DEFAULT_DEADLINES,
        guidelines: { techReportDocUrl: "", techReportNotes: "Guía oficial redactada por FYQ." },
        teachers: {
            FYQ: { name: "Física y Química", pin: "0101", canSponsor: false },
            ECO: { name: "Economía", pin: "0202", canSponsor: false },
            LYE: { name: "Liderazgo y Emprendimiento", pin: "0303", canSponsor: false },
            LEN: { name: "Lengua Castellana", pin: "0404", canSponsor: false },
            MAT: { name: "Matemáticas", pin: "0505", canSponsor: false },
            ING: { name: "Inglés", pin: "0606", canSponsor: false },
            COORD_MARIO: { name: "Coordinación - Mario", pin: "0001", canSponsor: true },
            COORD_ALEX: { name: "Coordinación - Alex", pin: "0002", canSponsor: true }
        }
    },
    suggestionsToAlex: [], pendingCustom: [],
    telemetry: { totalLogins: 0, sessions: [] },
    catalog: [
        { id: 'F01', name: 'Botella PET 500ml', price: 97.0, unit: 'Unidad', category: 'Fuselaje', origin: 'China' },
        { id: 'F02', name: 'Botella PET 1L', price: 120.0, unit: 'Unidad', category: 'Fuselaje', origin: 'China' },
        { id: 'P01', name: 'Bicarbonato de Sodio', price: 10.0, unit: 'Gramo', category: 'Propulsión', origin: 'Turquía' },
        { id: 'P02', name: 'Vinagre', price: 5.0, unit: '10ml', category: 'Propulsión', origin: 'España' },
        { id: 'A01', name: 'Cartón Básico', price: 30.0, unit: 'Set', category: 'Aerodinámica', origin: 'Marruecos' },
        { id: 'S01', name: 'Papel de Cocina', price: 5.0, unit: 'Unidad', category: 'Sellado', origin: 'Portugal' },
        { id: 'S05', name: 'Cinta Aislante', price: 10.0, unit: 'Rollo', category: 'Sellado', origin: 'Alemania' }
    ],
    companies: {
        astra: { 
            name: "Astra Dynamics", balance: 2400, classGroup: 'A', logo: null, slogan: "", valueProposition: "",
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" }, sponsorAwarded: null, sponsorData: { name: null, logo: null },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            roles: { CEO:'1111', TECNICO:'1111', FINANZAS:'1111', MARKETING:'1111', OPERACIONES_IA:'1111' }, 
            loginStats: {totalLogins: 0, roles: {CEO:{count:0}, TECNICO:{count:0}, FINANZAS:{count:0}, MARKETING:{count:0}, OPERACIONES_IA:{count:0}}}, deliverables: {}
        }
    }
};