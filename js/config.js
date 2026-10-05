// js/config.js

const APP_VERSION = "1.0.08";
const ROLES_EXTRA = { AUXILIAR: 'AUXILIAR' };

const RUBRIC_CONFIG = {
    FYQ: { name: "Física y Química", criteria: [{id: 'c1', name: 'Informe Científico Estequiometría', weight: 0.4}, {id: 'c2', name: 'Lanzamiento, Apogeo y Optimización', weight: 0.4}, {id: 'c3', name: 'Rol Técnico y Q&A', weight: 0.2}] },
    ECO: { name: "Economía", criteria: [{id: 'c1', name: 'Hojas de Cálculo y Trazabilidad', weight: 0.4}, {id: 'c2', name: 'Balances, ROI y Ledger', weight: 0.4}, {id: 'c3', name: 'Desempeño Rol Financiero', weight: 0.2}] },
    LYE: { name: "Liderazgo y Emprend.", criteria: [{id: 'c1', name: 'Project Management y Plazos', weight: 0.4}, {id: 'c2', name: 'Business Plan e I+D', weight: 0.4}, {id: 'c3', name: 'Desempeño Equipo y Conflictos', weight: 0.2}] },
    LEN: { name: "Lengua Castellana", criteria: [{id: 'c1', name: 'Pitch Final y Q&A (Oratoria)', weight: 0.8}, {id: 'c2', name: 'Estructura y Rigor del Dossier', weight: 0.2}] },
    MAT: { name: "Matemáticas", criteria: [{id: 'c1', name: 'Trigonometría y Altitud', weight: 0.7}, {id: 'c2', name: 'Construcción Goniómetro', weight: 0.3}] },
    ING: { name: "Inglés", criteria: [{id: 'c1', name: 'Presentación Prototipo (Micro-Pitch)', weight: 1.0}] }
};

const INITIAL_DATA = {
    config: { 
        nextOrderId: 1000,
        deadlines: { 
            techReport: "2026-11-15T23:59", presPhase1: "2026-10-30T23:59", 
            presPhase3: "2026-12-05T23:59", financeBook: "2026-12-01T23:59", valuePropDoc: "2026-11-10T23:59" 
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
            name: "Astra Dynamics", balance: 1500, logo: null, sponsorAwarded: null, classGroup: 'A',
            slogan: "", valueProposition: "", aiPrompts: [], executiveResolutions: [], 
            flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [],
            roles: { CEO:'1111', TECNICO:'1111', FINANZAS:'1111', MARKETING:'1111', OPERACIONES_IA:'1111' }, 
            loginStats: {totalLogins: 0, roles: {CEO:{count:0}, TECNICO:{count:0}, FINANZAS:{count:0}, MARKETING:{count:0}, OPERACIONES_IA:{count:0}}},
            deliverables: { technicalReport: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null }
        },
        orion: { 
            name: "Orion Labs", balance: 1500, logo: null, sponsorAwarded: null, classGroup: 'B',
            slogan: "", valueProposition: "", aiPrompts: [], executiveResolutions: [], 
            flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [],
            roles: { CEO:'2222', TECNICO:'2222', FINANZAS:'2222', MARKETING:'2222', OPERACIONES_IA:'2222' }, 
            loginStats: {totalLogins: 0, roles: {CEO:{count:0}, TECNICO:{count:0}, FINANZAS:{count:0}, MARKETING:{count:0}, OPERACIONES_IA:{count:0}}},
            deliverables: { technicalReport: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null }
        },
        stellar: { 
            name: "Stellar Solutions", balance: 1500, logo: null, sponsorAwarded: null, classGroup: 'C',
            slogan: "", valueProposition: "", aiPrompts: [], executiveResolutions: [], 
            flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [],
            roles: { CEO:'3333', TECNICO:'3333', FINANZAS:'3333', MARKETING:'3333', OPERACIONES_IA:'3333' }, 
            loginStats: {totalLogins: 0, roles: {CEO:{count:0}, TECNICO:{count:0}, FINANZAS:{count:0}, MARKETING:{count:0}, OPERACIONES_IA:{count:0}}},
            deliverables: { technicalReport: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null }
        }
    }
};