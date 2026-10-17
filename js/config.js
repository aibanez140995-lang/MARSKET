// js/config.js

const APP_VERSION = "1.0.15";
const ROLES_EXTRA = { AUXILIAR: 'AUXILIAR' };

// Mapeo de Agencias Reguladoras (Sistema Sancionador)
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

// Ponderación Institucional Oficial (100%)
const GLOBAL_WEIGHTS = {
    FYQ: 0.25,
    LYE: 0.40,
    LEN: 0.15,
    ECO: 0.10,
    MAT: 0.05,
    ING: 0.05
};

// Configuración de Rúbricas (Sincronizado con Nueva Tabla de Evaluación)
const RUBRIC_CONFIG = {
    FYQ: { name: "Física y Química", criteria: [{id: 'c1', name: 'Informe Técnico', weight: 0.50}, {id: 'c2', name: 'Prototipo / Cohete', weight: 0.30}, {id: 'c3', name: 'Rol Técnico y Q&A', weight: 0.20}] },
    ECO: { name: "Economía", criteria: [{id: 'c1', name: 'Test Evaluación', weight: 0.20}, {id: 'c2', name: 'Presupuesto Inicial', weight: 0.20}, {id: 'c3', name: 'Cuenta Resultados', weight: 0.20}, {id: 'c4', name: 'Presupuesto Post-Prototipo', weight: 0.20}, {id: 'c5', name: 'Balance Situación', weight: 0.20}] },
    LYE: { name: "Liderazgo y Emprend.", criteria: [{id: 'c1', name: 'Documentos Escritos', weight: 0.80}, {id: 'c2', name: 'Presentaciones Orales', weight: 0.20}] },
    LEN: { name: "Lengua Castellana", criteria: [{id: 'c1', name: 'Producción Oral', weight: 0.50}, {id: 'c2', name: 'Producción Escrita', weight: 0.50}] },
    MAT: { name: "Matemáticas", criteria: [{id: 'c1', name: 'Elaboración Goniómetro', weight: 0.25}, {id: 'c2', name: 'Informe Dist. Conocida', weight: 0.25}, {id: 'c3', name: 'Informe Dos Puntos', weight: 0.25}, {id: 'c4', name: 'Informe Final', weight: 0.25}] },
    ING: { name: "Inglés", criteria: [{id: 'c1', name: 'Expresión Oral (Presentación)', weight: 0.70}, {id: 'c2', name: 'Redacciones', weight: 0.30}] }
};

// Catálogo de Paquetes de Marketing (Precios ajustados a 2400 €v)
const MARKETING_PACKAGES = [
    { id: 'MK-SAT', name: 'Pack Satélite', type: '100% Online', price: 200, actions: 3, desc: 'Alcance digital rápido (Redes sociales, Banners, Mailing).' },
    { id: 'MK-TRA', name: 'Prensa Tradicional', type: '100% Físico', price: 300, actions: 3, desc: 'Impacto tangible (Diseño de pósters, flyers físicos, prensa).' },
    { id: 'MK-HYB', name: 'Despegue Híbrido', type: 'Mixto Básico', price: 450, actions: 4, desc: 'Estrategia estándar (2 Acciones Online + 2 Físicas).' },
    { id: 'MK-SUP', name: 'Cobertura Supernova', type: 'Premium', price: 750, actions: 6, desc: 'Saturación publicitaria máxima. Requiere fuerte justificación financiera.' }
];

// Diccionario de Saneamiento y Moderación (Filtro Léxico)
const FORBIDDEN_WORDS = [
    'puta', 'puto', 'mierda', 'joder', 'cabron', 'cabrón', 'gilipollas', 
    'polla', 'cojones', 'follar', 'hostia', 'maricon', 'maricón', 'zorra', 
    'capullo', 'pendejo', 'idiota', 'subnormal', 'imbecil', 'imbécil', 
    'hitler', 'nazi', 'pene', 'vagina', 'culo', 'teta', 'retrasado', 'retrasada'
];

// Novedades de Plataforma (Changelog Interactivo)
const APP_CHANGELOG = [
    {
        version: "1.0.15",
        date: "Octubre 2026",
        title: "Política Cloud, Moderación de Marca y Filtros de Entorno Escolar",
        highlights: [
            { type: "SISTEMA", text: "Prohibición de subida de archivos físicos. Todos los entregables exigen estrictamente un enlace a Google Drive/OneDrive." },
            { type: "NUEVO", text: "Aduana de Marca: Los logotipos y eslóganes requieren validación por parte de Coordinación Docente antes de ser públicos." },
            { type: "NUEVO", text: "Filtro Léxico Automático que bloquea palabras malsonantes en formularios, nombres y mociones." },
            { type: "MEJORA", text: "Auditoría exhaustiva del Dossier Académico con mapeo estricto de los 19 casilleros documentales." }
        ]
    },
    {
        version: "1.0.14",
        date: "Octubre 2026",
        title: "Sincronización Curricular, B2B y Expansión de Marketing",
        highlights: [
            { type: "MEJORA", text: "Ponderación del 100% en Acta Docente y expansión a 19 casilleros (con LyE Diciembre/Abril)." },
            { type: "NUEVO", text: "Mercado de Segunda Mano (B2B) y 4 Paquetes Publicitarios de Marketing." }
        ]
    }
];

const INITIAL_DATA = {
    version: 1,
    b2bMarket: [],
    b2bContracts: [],
    config: { 
        nextOrderId: 1000,
        deadlines: { 
            techReport: "2026-11-15T23:59", 
            brandIdentity_dec: "2026-12-10T23:59",
            brandIdentity_apr: "2027-04-10T23:59",
            businessModelDoc: "2026-11-20T23:59",
            investorDossier: "2026-12-05T23:59",
            balanceSheet: "2026-12-01T23:59" 
        },
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
    suggestionsToAlex: [],
    pendingCustom: [],
    telemetry: { totalLogins: 0, sessions: [] },
    catalog: [
        { id: 'F01', name: 'Botella PET 500ml', price: 97.0, unit: 'Unidad', category: 'Fuselaje', origin: 'China' },
        { id: 'F02', name: 'Botella PET 1L', price: 120.0, unit: 'Unidad', category: 'Fuselaje', origin: 'China' },
        { id: 'F03', name: 'Botella PET 1.25L', price: 145.0, unit: 'Unidad', category: 'Fuselaje', origin: 'Alemania' },
        { id: 'F04', name: 'Botella PET 1.5L', price: 165.0, unit: 'Unidad', category: 'Fuselaje', origin: 'España' },
        { id: 'F05', name: 'Botella PET 2L', price: 200.0, unit: 'Unidad', category: 'Fuselaje', origin: 'China' },
        { id: 'P01', name: 'Bicarbonato de Sodio', price: 10.0, unit: 'Gramo', category: 'Propulsión', origin: 'Turquía' },
        { id: 'P02', name: 'Vinagre', price: 5.0, unit: '10ml', category: 'Propulsión', origin: 'España' },
        { id: 'A01', name: 'Cartón Básico', price: 30.0, unit: 'Set', category: 'Aerodinámica', origin: 'Marruecos' },
        { id: 'A02', name: 'Aletas de Plástico', price: 50.0, unit: 'Set', category: 'Aerodinámica', origin: 'China' },
        { id: 'A03', name: 'Aletas PVC Rígido', price: 85.0, unit: 'Set', category: 'Aerodinámica', origin: 'Alemania' },
        { id: 'A04', name: 'Suplemento Plastificado', price: 15.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'ESA / Francia' },
        { id: 'A05', name: 'Punta Cartulina', price: 45.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'Marruecos' },
        { id: 'A06', name: 'Punta PET', price: 95.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'Polonia' },
        { id: 'A07', name: 'Punta Impresión 3D', price: 110.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'España' },
        { id: 'A08', name: 'Punta Lastrada', price: 135.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'Italia' },
        { id: 'S01', name: 'Papel de Cocina', price: 5.0, unit: 'Unidad', category: 'Sellado', origin: 'Portugal' },
        { id: 'S02', name: 'Hilo de Algodón', price: 2.0, unit: 'Decímetro', category: 'Sellado', origin: 'India' },
        { id: 'S03', name: 'Corcho de Vino', price: 25.0, unit: 'Unidad', category: 'Sellado', origin: 'España' },
        { id: 'S04', name: 'Tapón de Goma Hermético', price: 60.0, unit: 'Unidad', category: 'Sellado', origin: 'República Checa' },
        { id: 'S05', name: 'Cinta Aislante', price: 10.0, unit: 'Rollo', category: 'Sellado', origin: 'Alemania' },
        { id: 'S06', name: 'Celo Adhesivo', price: 5.0, unit: 'Rollo', category: 'Sellado', origin: 'China' },
        { id: 'S07', name: 'Pegamento Termofusible', price: 40.0, unit: 'Barra', category: 'Sellado', origin: 'Japón' },
        { id: 'S08', name: 'Refuerzo de Yeso', price: 18.0, unit: 'Dosis', category: 'Sellado', origin: 'España' }
    ],
    companies: {
        astra: { 
            name: "Astra Dynamics", balance: 2400, classGroup: 'A',
            logo: null, slogan: "", valueProposition: "",
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" },
            sponsorAwarded: null, sponsorData: { name: null, logo: null },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            roles: { CEO:'1111', TECNICO:'1111', FINANZAS:'1111', MARKETING:'1111', OPERACIONES_IA:'1111' }, 
            loginStats: {totalLogins: 0, roles: {CEO:{count:0}, TECNICO:{count:0}, FINANZAS:{count:0}, MARKETING:{count:0}, OPERACIONES_IA:{count:0}}},
            deliverables: {}
        },
        orion: { 
            name: "Orion Labs", balance: 2400, classGroup: 'B',
            logo: null, slogan: "", valueProposition: "",
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" },
            sponsorAwarded: null, sponsorData: { name: null, logo: null },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            roles: { CEO:'2222', TECNICO:'2222', FINANZAS:'2222', MARKETING:'2222', OPERACIONES_IA:'2222' }, 
            loginStats: {totalLogins: 0, roles: {CEO:{count:0}, TECNICO:{count:0}, FINANZAS:{count:0}, MARKETING:{count:0}, OPERACIONES_IA:{count:0}}},
            deliverables: {}
        },
        stellar: { 
            name: "Stellar Solutions", balance: 2400, classGroup: 'C',
            logo: null, slogan: "", valueProposition: "",
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" },
            sponsorAwarded: null, sponsorData: { name: null, logo: null },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            roles: { CEO:'3333', TECNICO:'3333', FINANZAS:'3333', MARKETING:'3333', OPERACIONES_IA:'3333' }, 
            loginStats: {totalLogins: 0, roles: {CEO:{count:0}, TECNICO:{count:0}, FINANZAS:{count:0}, MARKETING:{count:0}, OPERACIONES_IA:{count:0}}},
            deliverables: {}
        }
    }
};