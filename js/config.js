// js/config.js
// --- CONFIGURACIÓN GLOBAL, CATÁLOGO, PONDERACIONES Y CRONOGRAMA MAESTRO (v2.0.02) ---

const APP_VERSION = "2.0.02";

const SPONSOR_TIERS_DEF = Object.freeze({
    ORO: { id: 'ORO', name: 'Nivel ORO', amount: 500, colorHex: '#FFD700', badgeClass: 'text-[#ffd700] border-[#ffd700]', emoji: '🥇' },
    PLATA: { id: 'PLATA', name: 'Nivel PLATA', amount: 400, colorHex: '#E2E8F0', badgeClass: 'text-[#c0c0c0] border-[#c0c0c0]', emoji: '🥈' },
    BRONCE: { id: 'BRONCE', name: 'Nivel BRONCE', amount: 250, colorHex: '#CD7F32', badgeClass: 'text-[#cd7f32] border-[#cd7f32]', emoji: '🥉' },
    COBRE: { id: 'COBRE', name: 'Nivel COBRE', amount: 150, colorHex: '#B87333', badgeClass: 'text-[#b87333] border-[#b87333]', emoji: '🔶' },
    COLABORADOR: { id: 'COLABORADOR', name: 'Nivel COLABORADOR', amount: 100, colorHex: '#00F0FF', badgeClass: 'text-mars-cyan border-mars-cyan', emoji: '🤝' }
});

const AEE_SANCTION_ARTICLES_DEF = Object.freeze([
    {
        id: 'ART_09',
        code: 'Art. 09',
        title: 'Uso de lenguaje no profesional o vulneración del filtro léxico',
        shortTitle: 'Filtro Léxico y Tono Formal',
        desc: 'Expresiones inapropiadas o comunicaciones que no respeten el tono formal corporativo de la misión.',
        criteria: 'Falta Leve (-10 €v) o Moderada (-100 €v) según reiteración o gravedad del término empleado.',
        amounts: [-10, -100]
    },
    {
        id: 'ART_12',
        code: 'Art. 12',
        title: 'Incumplimiento de cronograma y plazos oficiales de entrega',
        shortTitle: 'Incumplimiento de Plazos',
        desc: 'Retraso en la entrega oficial de entregables curriculares (Google Drive) o en la presentación del micro-pitch.',
        scheduleBreakdown: [
            { tier: 'Leve (-10 €v)', condition: 'Retraso inferior a 24 horas respecto al límite oficial de entrega.' },
            { tier: 'Moderada (-100 €v)', condition: 'Retraso de entre 24 y 72 horas sin justificación previa validada.' },
            { tier: 'Grave (-200 €v)', condition: 'Retraso superior a 72 horas (bloquea certificaciones de fase hasta subsanación).' }
        ],
        amounts: [-10, -100, -200]
    },
    {
        id: 'ART_18',
        code: 'Art. 18',
        title: 'Inconsistencia o falta de justificación en la memoria técnica',
        shortTitle: 'Defecto en Memoria Técnica',
        desc: 'Presentar datos técnicos o cálculos sin justificar, omisión de unidades de medida o falta de rigor en la documentación técnica entregada.',
        criteria: 'Leve (-10 €v), Moderada (-100 €v) o Grave (-200 €v) según el impacto en la viabilidad del subsistema.',
        amounts: [-10, -100, -200]
    },
    {
        id: 'ART_24',
        code: 'Art. 24',
        title: 'Anomalía en balance o trazabilidad contable',
        shortTitle: 'Anomalía Contable',
        desc: 'Descuadre en el libro contable de Finanzas, transferencias no registradas o incurrir en saldo negativo sin autorización previa.',
        criteria: 'Moderada (-100 €v) o Grave (-200 €v) con obligación de subsanación de balance.',
        amounts: [-100, -200]
    },
    {
        id: 'ART_31',
        code: 'Art. 31',
        title: 'Falta de rigor en protocolos de seguridad técnica y de vuelo',
        shortTitle: 'Seguridad Técnica y de Vuelo',
        desc: 'Incumplimiento de las especificaciones y normativas de seguridad establecidas en la guía del proyecto aeroespacial.',
        criteria: 'Moderada (-100 €v) o Grave (-200 €v) por vulneración de parámetros de lanzamiento o carga útil.',
        amounts: [-100, -200]
    }
]);

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
        flow: 'Técnico ➔ Mercado B2B & Aduana Docente',
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
    },
    DOC_13_SOLICITUD_ID: {
        id: 'DOC_13_SOLICITUD_ID',
        title: 'SOLICITUD OFICIAL DE MATERIAL ESPECIAL I+D A COORDINACIÓN',
        flow: 'Técnico ➔ CEO ➔ Coordinación Docente',
        copyUrl: 'https://docs.google.com/document/d/1HigoiUvPfZQhMu67MR7cGyiW8XecIQlAW_29kp3LfDc/copy'
    },
    DOC_14_LICENCIA_AESA: {
        id: 'DOC_14_LICENCIA_AESA',
        title: 'SOLICITUD DE PERMISO OFICIAL DE LANZAMIENTO Y SEGURIDAD AESA',
        flow: 'CEO ➔ Claustro Docente / AESA',
        copyUrl: 'https://docs.google.com/document/d/1NZU7849Zts-fQEv4AhqbQdxrP0sAp44_PaYj2JOosOU/copy'
    },
    DOC_15_NOTA_PRENSA: {
        id: 'DOC_15_NOTA_PRENSA',
        title: 'NOTA DE PRENSA CORPORATIVA // COMUNICADO OFICIAL',
        flow: 'CEO ➔ Profesor de Lengua y Coordinación Docente',
        copyUrl: 'https://docs.google.com/document/d/1BQVeds2j0lCe4AG6N2ciYDv5XqrSxb5i3wlsyAMUm2Y/copy'
    },
    DOC_16_ACTA_COMITE: {
        id: 'DOC_16_ACTA_COMITE',
        title: 'ACTA DE COMITÉ DE DIRECCIÓN // DIARIO DE REUNIONES',
        flow: 'Todos los Dptos. ➔ Gobernanza y Claustro',
        copyUrl: 'https://docs.google.com/document/d/1lvpFHohpJPN-AlhU1jCLWYdx6tDYzljbTyKXcGBxmR0/copy'
    },
    DOC_17_BALANCE_FASE: {
        id: 'DOC_17_BALANCE_FASE',
        title: 'BALANCE CONTABLE Y ESTADO FINANCIERO DE CIERRE DE FASE',
        flow: 'Finanzas ➔ CEO / Coordinación de Economía',
        copyUrl: 'https://docs.google.com/document/d/1HigoiUvPfZQhMu67MR7cGyiW8XecIQlAW_29kp3LfDc/copy'
    }
});

const LAUNCH_LICENSE_FEE = 50;
const NAME_CHANGE_FEE = 50;

const PRESS_RELEASE_PHASES = Object.freeze([
    {
        phase: 'I',
        phaseName: 'Fase I: Fundación y Viabilidad',
        phaseCutoff: '2026-12-15T00:00',
        phaseCutoffLabel: '15/12/2026',
        deadline: '2026-12-22T23:59',
        deadlineLabel: '22/12/2026 (Corte: 15/12 + 7 días)',
        title: 'Nota de Prensa Oficial — Cierre Fase I',
        requiredContent: 'Presentación del concepto de cohete, capital obtenido por patrocinio y objetivos corporativos.',
        docKey: 'DOC_15_NOTA_PRENSA'
    },
    {
        phase: 'II',
        phaseName: 'Fase II: I+D y Prototipado Aeroespacial',
        phaseCutoff: '2027-02-15T00:00',
        phaseCutoffLabel: '15/02/2027',
        deadline: '2027-02-22T23:59',
        deadlineLabel: '22/02/2027 (Corte: 15/02 + 7 días)',
        title: 'Nota de Prensa Oficial — Cierre Fase II',
        requiredContent: 'Resultados preliminares de las pruebas de vuelo, mediciones angulares y estado financiero a mitad del proyecto.',
        docKey: 'DOC_15_NOTA_PRENSA'
    },
    {
        phase: 'III',
        phaseName: 'Fase III: Producción y Finanzas B2B',
        phaseCutoff: '2027-03-31T00:00',
        phaseCutoffLabel: '31/03/2027',
        deadline: '2027-04-07T23:59',
        deadlineLabel: '07/04/2027 (Corte: 31/03 + 7 días)',
        title: 'Nota de Prensa Oficial — Cierre Fase III',
        requiredContent: 'Conclusiones de taller, dificultades de montaje superadas y preparación para el Pitch final.',
        docKey: 'DOC_15_NOTA_PRENSA'
    },
    {
        phase: 'IV',
        phaseName: 'Fase IV: Validación Científica y Comercialización',
        phaseCutoff: '2027-04-23T00:00',
        phaseCutoffLabel: '23/04/2027',
        deadline: '2027-04-30T23:59',
        deadlineLabel: '30/04/2027 (Corte: 23/04 + 7 días)',
        title: 'Nota de Prensa Oficial — Cierre Fase IV',
        requiredContent: 'Validación científica final, rendimiento de propelentes y propuesta de valor para el Gran Concurso Aeroespacial.',
        docKey: 'DOC_15_NOTA_PRENSA'
    }
]);

// Ventanas temporales oficiales de selección de contratos (Fase I: 5 días lectivos)
const CONTRACTS_PHASE_WINDOWS = Object.freeze({
    'I': {
        phase: 'I',
        phaseName: 'Fase I: Fundación y Viabilidad',
        selectionStart: '2026-11-21T00:00',
        selectionEnd: '2026-11-27T23:59',
        windowLabel: '21/11/2026 – 27/11/2026 (5 días lectivos con Presupuesto Inicial entregado)',
        evalCutoff: '2026-12-15T23:59',
        evalCutoffLabel: '15/12/2026'
    },
    'II': {
        phase: 'II',
        phaseName: 'Fase II: I+D y Prototipado Aeroespacial',
        selectionStart: '2026-12-15T00:00',
        selectionEnd: '2026-12-17T23:59',
        windowLabel: '15/12/2026 – 17/12/2026 (Primeros 3 días lectivos de Fase II)',
        evalCutoff: '2027-02-15T23:59',
        evalCutoffLabel: '15/02/2027'
    },
    'III': {
        phase: 'III',
        phaseName: 'Fase III: Producción y Finanzas B2B',
        selectionStart: '2027-02-15T00:00',
        selectionEnd: '2027-02-17T23:59',
        windowLabel: '15/02/2027 – 17/02/2027 (Primeros 3 días lectivos de Fase III)',
        evalCutoff: '2027-03-31T23:59',
        evalCutoffLabel: '31/03/2027'
    },
    'IV': {
        phase: 'IV',
        phaseName: 'Fase IV: Validación Científica y Comercialización',
        selectionStart: '2027-03-31T00:00',
        selectionEnd: '2027-04-02T23:59',
        windowLabel: '31/03/2027 – 02/04/2027 (Primeros 3 días lectivos de Fase IV)',
        evalCutoff: '2027-04-23T23:59',
        evalCutoffLabel: '23/04/2027'
    }
});

// Catálogo Oficial de los 24 Contratos Comerciales y Misiones del CEO (6 por fase)
const CONTRACTS_CATALOG_DEF = Object.freeze([
    // --- FASE 1: Concepto de Negocio, Presupuesto y Captación (02/11/2026 – 15/12/2026) ---
    {
        id: 'F1-C01',
        phase: 'I',
        company: 'Siemens Energy',
        title: 'Iniciativa Aero-Eco Sostenible',
        requirements: 'Diseñar un prototipo con coste de catálogo menor o igual a 280 €v.',
        reward: 150,
        penalty: 50,
        verification: 'Validación de Hoja de Registro y Presupuesto por FyQ y Economía.',
        dept: 'TECNICO'
    },
    {
        id: 'F1-C02',
        phase: 'I',
        company: 'PLD Space',
        title: 'Fondo Semilla NewSpace DeepTech',
        requirements: 'Obtener el nivel Oro (+500 €v) o Plata (+400 €v) en el micro-pitch de patrocinio en lengua inglesa.',
        reward: 200,
        penalty: 75,
        verification: 'Rúbrica oficial de expresión oral en Inglés y LyE.',
        dept: 'CEO'
    },
    {
        id: 'F1-C03',
        phase: 'I',
        company: 'Airbus Defence and Space',
        title: 'Licitación Industrial Speed-to-Market',
        requirements: 'Registrar la Identidad Corporativa inicial completa (Logo, Misión, Visión, Valores) al menos 48 horas antes de la fecha límite oficial (antes del 13/12/2026).',
        reward: 120,
        penalty: 40,
        verification: 'Marca temporal de registro de Marketing en la app MARS-KET.',
        dept: 'MARKETING'
    },
    {
        id: 'F1-C04',
        phase: 'I',
        company: 'Microsoft Azure AI',
        title: 'Certificación de Transparencia Algorítmica',
        requirements: 'Registrar un mínimo de 4 consultas a IA completas en la Bitácora de Diciembre, con prompt, output y método explícito de contrastación teórica y empírica.',
        reward: 100,
        penalty: 50,
        verification: 'Auditoría docente de la Bitácora Central de IA (Operaciones).',
        dept: 'OPERACIONES'
    },
    {
        id: 'F1-C05',
        phase: 'I',
        company: 'Deimos Space',
        title: 'Reto de Precisión Presupuestaria Previa',
        requirements: 'Desviación inferior al 5% entre el presupuesto inicial del 20/11/2026 y los costes reales computados en el prototipo del 15/12/2026.',
        reward: 140,
        penalty: 60,
        verification: 'Comparativa de hojas de cálculo de costes en Economía.',
        dept: 'FINANZAS'
    },
    {
        id: 'F1-C06',
        phase: 'I',
        company: 'Financial Times',
        title: 'Difusión Global: Top 3 Notas de Prensa F1',
        requirements: 'La nota de prensa emitida por el CEO al cierre de la Fase 1 es seleccionada por el jurado entre las 3 mejores del curso y publicada en la edición internacional.',
        reward: 180,
        penalty: 60,
        verification: 'Selección del comité docente y publicación en el tablón oficial de MARS-KET.',
        dept: 'CEO'
    },

    // --- FASE 2: Medición Trigonométrica, Ajuste y Banco de Pruebas (15/12/2026 – 15/02/2027) ---
    {
        id: 'F2-C01',
        phase: 'II',
        company: 'Hispasat',
        title: 'Misión Telecom Apogeo 8 Metros',
        requirements: 'Alcanzar o superar los 8 metros de altura real en al menos un lanzamiento registrado en vídeo continuo y medido con goniómetro.',
        reward: 250,
        penalty: 100,
        verification: 'Altura calculada en informe de Matemáticas respaldada por metraje audiovisual.',
        dept: 'TECNICO'
    },
    {
        id: 'F2-C02',
        phase: 'II',
        company: 'GMV Aerospace',
        title: 'Triangulación Geodésica y Telemetría',
        requirements: 'Registrar un mínimo de 3 lanzamientos de prueba completos, tabulando los ángulos medidos desde dos estaciones terrestres independientes con distancia conocida.',
        reward: 200,
        penalty: 80,
        verification: 'Datos brutos y cálculos trigonométricos en informe técnico de Matemáticas.',
        dept: 'TECNICO'
    },
    {
        id: 'F2-C03',
        phase: 'II',
        company: 'DJI Technologies',
        title: 'Registro Audiovisual y Análisis Fotogramétrico',
        requirements: 'Adjuntar al informe técnico grabaciones completas en plano continuo (despegue, apogeo y aterrizaje) de al menos 2 vuelos, con análisis segundo a segundo.',
        reward: 160,
        penalty: 70,
        verification: 'Validación de enlaces de vídeo y marcas de tiempo por docente de FyQ.',
        dept: 'OPERACIONES'
    },
    {
        id: 'F2-C04',
        phase: 'II',
        company: 'SAP Enterprise',
        title: 'Rebalanceo Presupuestario Post-Prototipo',
        requirements: 'Entregar a tiempo el Presupuesto post-prototipo (09/01/2027) reflejando de forma exacta la inyección del patrocinio obtenido y compras sin descuadres.',
        reward: 100,
        penalty: 20,
        verification: 'Auditoría de la entrega de Economía por el profesorado.',
        dept: 'FINANZAS'
    },
    {
        id: 'F2-C05',
        phase: 'II',
        company: 'Dassault Systèmes',
        title: 'Modelado Cinemático de Vuelo',
        requirements: 'Incluir en el informe comparativo final el cálculo analítico de velocidad media de ascenso y aceleración inicial a partir del análisis del metraje de vídeo.',
        reward: 170,
        penalty: 60,
        verification: 'Parámetros complementarios evaluados en informe de Matemáticas y FyQ.',
        dept: 'TECNICO'
    },
    {
        id: 'F2-C06',
        phase: 'II',
        company: 'MIT Technology Review',
        title: 'Crónica Científica: Top 3 Notas de Prensa F2',
        requirements: 'La nota de prensa de la Fase 2 (análisis de pruebas de vuelo y avances técnicos) es elegida entre las 3 mejores de la promoción para portada internacional.',
        reward: 200,
        penalty: 70,
        verification: 'Rúbrica de comunicación y selección en el Top 3 por el profesorado.',
        dept: 'CEO'
    },

    // --- FASE 3: Taller de Montaje, Balance y Modelo de Negocio (15/02/2027 – 31/03/2027) ---
    {
        id: 'F3-C01',
        phase: 'III',
        company: 'Aernnova Aerospace',
        title: 'Certificación Aeronáutica Taller Cero Defectos',
        requirements: 'Completar la Hoja de Taller conjunta justificando tolerancias mecánicas, centro de gravedad y seguridad estructural sin devoluciones del docente.',
        reward: 80,
        penalty: 20,
        verification: 'Calificación mayor o igual a 8/10 en el entregable de Taller para FyQ.',
        dept: 'TECNICO'
    },
    {
        id: 'F3-C02',
        phase: 'III',
        company: 'BBVA Spark',
        title: 'Línea de Liquidez y Solvencia Corporativa',
        requirements: 'Presentar el Balance de Situación al 31/03/2027 con Fondo de Maniobra positivo y tesorería disponible superior a 650 €v libres en caja.',
        reward: 150,
        penalty: 45,
        verification: 'Cuadre contable y ratios auditados por el profesor de Economía.',
        dept: 'FINANZAS'
    },
    {
        id: 'F3-C03',
        phase: 'III',
        company: 'Wallapop PRO',
        title: 'Licitación de Logística y Economía Circular',
        requirements: 'Ingresar un mínimo de 90 €v vendiendo componentes o excedentes de stock a otras empresas de la clase mediante transferencias de la app.',
        reward: 150,
        penalty: 50,
        verification: 'Registro oficial de transferencias B2B auditadas en Aduana.',
        dept: 'TECNICO'
    },
    {
        id: 'F3-C04',
        phase: 'III',
        company: 'Wayra Telefónica',
        title: 'Programa de Escalamiento Corporativo',
        requirements: 'Entregar el Business Model Doc integrando un modelo de negocio con escalabilidad y un organigrama ejecutivo donde cada miembro haya cumplido sus misiones.',
        reward: 180,
        penalty: 60,
        verification: 'Evaluación docente de la memoria de emprendimiento en LyE.',
        dept: 'CEO'
    },
    {
        id: 'F3-C05',
        phase: 'III',
        company: 'Meta / Google Marketing',
        title: 'Campaña de Alto Impacto Auditada',
        requirements: 'Contratar el Pack \'Prensa Tradicional\' (300 €v) o \'Despegue Híbrido\' (450 €v / 400 €v) y justificar en un documento de Drive la ejecución del 100% de las acciones antes del 31/03/2027.',
        reward: 90,
        penalty: 30,
        verification: 'Aprobación de la Ficha Técnica de Campaña por el docente de Marketing.',
        dept: 'MARKETING'
    },
    {
        id: 'F3-C06',
        phase: 'III',
        company: 'The Wall Street Journal',
        title: 'Reporte Corporativo: Top 3 Notas de Prensa F3',
        requirements: 'La nota de prensa de la Fase 3 (economía circular y preparación comercial) es elegida entre las 3 mejores para la sección global de mercados.',
        reward: 220,
        penalty: 80,
        verification: 'Selección del jurado docente evaluador de comunicación (LEN/ING).',
        dept: 'CEO'
    },

    // --- FASE 4: Validación Científica y Comercialización (31/03/2027 – 23/04/2027) ---
    {
        id: 'F4-C01',
        phase: 'IV',
        company: 'BASF Chemical',
        title: 'Optimización Estequiométrica Avanzada',
        requirements: 'Obtener una calificación superior a 8,5 en el informe técnico final de FyQ, justificando la relación molar y rendimiento de propelentes.',
        reward: 300,
        penalty: 120,
        verification: 'Nota asignada por el profesor de Física y Química en el entregable.',
        dept: 'TECNICO'
    },
    {
        id: 'F4-C02',
        phase: 'IV',
        company: 'KPMG / PwC',
        title: 'Auditoría y Cierre Fiscal Pulcro',
        requirements: 'Obtener una calificación superior a 8,5 en la Cuenta de Resultados y Balance final presentado al profesor de Economía, con cero descuadres.',
        reward: 250,
        penalty: 100,
        verification: 'Auditoría contable y calificación oficial en Economía.',
        dept: 'FINANZAS'
    },
    {
        id: 'F4-C03',
        phase: 'IV',
        company: 'Kibo Ventures',
        title: 'Inversión Serie A para Startups Tecnológicas',
        requirements: 'Obtener al menos un 85% de la puntuación máxima en el Dossier de Inversores evaluado por Lengua Castellana y Literatura (mínimo 8,5/10).',
        reward: 280,
        penalty: 110,
        verification: 'Acta de evaluación de Lengua del documento final.',
        dept: 'CEO'
    },
    {
        id: 'F4-C04',
        phase: 'IV',
        company: 'Amazon Web Services (AWS)',
        title: 'Despliegue de Business Model Canvas Cuantitativo',
        requirements: 'Presentar el Canvas de Modelo de Negocio el 23/04/2027 con métricas clave cuantitativas y calificación igual o superior a 8,5/10.',
        reward: 220,
        penalty: 80,
        verification: 'Rúbrica de modelo de negocio evaluada por LyE/Economía.',
        dept: 'OPERACIONES'
    },
    {
        id: 'F4-C05',
        phase: 'IV',
        company: 'Apple Enterprise',
        title: 'Campaña Publicitaria de Calidad Máxima',
        requirements: 'Alcanzar una media ponderada superior a 8,5 en todas las campañas de Marketing y contenido audiovisual entregado.',
        reward: 240,
        penalty: 80,
        verification: 'Puntuación de Marketing auditada por el Coordinador.',
        dept: 'MARKETING'
    },
    {
        id: 'F4-C06',
        phase: 'IV',
        company: 'The New York Times (Science & Tech)',
        title: 'Exclusiva Aeroespacial: Top 3 Notas de Prensa F4',
        requirements: 'La nota de prensa final de la Fase 4 es clasificada entre las 3 mejores de la promoción por el jurado del Pitch y publicada en primera plana.',
        reward: 250,
        penalty: 90,
        verification: 'Votación del jurado del Concurso Final.',
        dept: 'CEO'
    }
]);

const FINANCIAL_PHASE_BALANCES_DEF = Object.freeze([
    {
        phase: 'I',
        phaseName: 'Fase I: Fundación y Viabilidad',
        cutoffDate: '2026-12-15T23:59',
        cutoffLabel: '15/12/2026',
        windowEndLabel: '29/12/2026',
        deadlineLabel: '29/12/2026 (Corte: 15/12 + 14 días)',
        title: 'Balance Contable de Cierre — Fase I',
        desc: 'Cierre de tesorería, registro de patrocinios captados y gastos iniciales de constitución.',
        docKey: 'DOC_17_BALANCE_FASE'
    },
    {
        phase: 'II',
        phaseName: 'Fase II: I+D y Prototipado Aeroespacial',
        cutoffDate: '2027-02-15T23:59',
        cutoffLabel: '15/02/2027',
        windowEndLabel: '01/03/2027',
        deadlineLabel: '01/03/2027 (Corte: 15/02 + 14 días)',
        title: 'Balance Contable de Cierre — Fase II',
        desc: 'Inversión en prototipado, materiales I+D, tasa de licencia AESA y telemetría de costes.',
        docKey: 'DOC_17_BALANCE_FASE'
    },
    {
        phase: 'III',
        phaseName: 'Fase III: Producción y Finanzas B2B',
        cutoffDate: '2027-03-31T23:59',
        cutoffLabel: '31/03/2027',
        windowEndLabel: '14/04/2027',
        deadlineLabel: '14/04/2027 (Corte: 31/03 + 14 días)',
        title: 'Balance Contable de Cierre — Fase III',
        desc: 'Costes de taller, transacciones del mercado B2B, campañas publicitarias y balance de situación.',
        docKey: 'DOC_17_BALANCE_FASE'
    },
    {
        phase: 'IV',
        phaseName: 'Fase IV: Validación Científica y Comercialización',
        cutoffDate: '2027-04-23T23:59',
        cutoffLabel: '23/04/2027',
        windowEndLabel: '07/05/2027',
        deadlineLabel: '07/05/2027 (Corte: 23/04 + 14 días)',
        title: 'Balance Contable de Cierre — Fase IV',
        desc: 'Liquidación final, cuenta de pérdidas y ganancias provisional, solvencia y preparación del Pitch.',
        docKey: 'DOC_17_BALANCE_FASE'
    }
]);

const FINANCIAL_AUDIT_VERDICTS_DEF = Object.freeze([
    { id: 'SUPERAVIT_ESTABLE', label: 'Superávit Financiero y Tesorería Estable' },
    { id: 'EQUILIBRIO_PRESUPUESTARIO', label: 'Equilibrio Presupuestario según Previsiones' },
    { id: 'DEFICIT_CONTROLADO', label: 'Déficit Controlado por Inversión en I+D/Materiales' },
    { id: 'REAJUSTE_GASTOS', label: 'Reajuste Operativo Necesario para Próxima Fase' },
    { id: 'AUDITORIA_CONFORME', label: 'Auditoría Interna Conforme sin Desviaciones Significativas' }
]);

const MEETING_MINUTE_SESSIONS_DEF = Object.freeze([
    { id: 'ORD_1_FASE_I', label: 'Sesión Ordinaria nº 1 — Planificación y Constitución (Fase I)' },
    { id: 'ORD_2_FASE_I', label: 'Sesión Ordinaria nº 2 — Asignación de Roles y Presupuesto (Fase I)' },
    { id: 'CIERRE_FASE_I', label: 'Sesión de Cierre de Fase I — Evaluación de Hitos y Patrocinios' },
    { id: 'ORD_3_FASE_II', label: 'Sesión Ordinaria nº 3 — Planificación de Ensayos I+D (Fase II)' },
    { id: 'ORD_4_FASE_II', label: 'Sesión Ordinaria nº 4 — Análisis Matemático y Licencia AESA (Fase II)' },
    { id: 'CIERRE_FASE_II', label: 'Sesión de Cierre de Fase II — Estado Financiero y Pruebas de Vuelo' },
    { id: 'ORD_5_FASE_III', label: 'Sesión Ordinaria nº 5 — Coordinación de Taller y Montaje (Fase III)' },
    { id: 'ORD_6_FASE_III', label: 'Sesión Ordinaria nº 6 — Negociación y Mercado B2B (Fase III)' },
    { id: 'CIERRE_FASE_III', label: 'Sesión de Cierre de Fase III — Balance de Taller y Cuentas' },
    { id: 'ORD_7_FASE_IV', label: 'Sesión Ordinaria nº 7 — Ensayo General del Pitch Final (Fase IV)' },
    { id: 'EXTRA_INTERDEPT', label: 'Sesión Extraordinaria de Coordinación Interdepartamental' },
    { id: 'EXTRA_GOBERNANZA', label: 'Sesión Extraordinaria de Mediación y Acuerdos de Gobernanza' }
]);

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
        {id: 'c1', name: '1. Informe Preliminar, Boceto y Foto', weight: 0.10}, 
        {id: 'c_ws', name: '2. Hoja Oficial de Taller, BOM y Control de Calidad', weight: 0.10},
        {id: 'c2', name: '3. Informe Técnico Final Exhaustivo', weight: 0.30}, 
        {id: 'c3', name: '4. Prototipo Físico y Lanzamiento', weight: 0.30}, 
        {id: 'c4', name: '5. Media de Test Rol y Defensa Q&A', weight: 0.20}
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
        {id: 'c1', name: '1. Producción Oral', weight: 0.50}, 
        {id: 'c2', name: '2. Producción Escrita (Dossier Inversores)', weight: 0.40},
        {id: 'c3', name: '3. Conjunto de Notas de Prensa', weight: 0.10}
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

// Definición Oficial de las 5 Fases del Proyecto MARS-KET
const PROJECT_PHASES_DEF = Object.freeze({
    I: {
        id: "I",
        name: "Fase I: Preparación, Identidad y Presupuesto Inicial",
        startDate: "2026-11-02",
        desc: "Enfocada en la preparación inicial, el registro conceptual del cohete (Física y Química), la creación de la identidad de marca (Liderazgo y Emprendimiento) y la elaboración del presupuesto inicial (Economía). Las entregas se completarán entre noviembre y diciembre de 2026. Se hace la primera búsqueda de patrocinio con una presentación en inglés."
    },
    II: {
        id: "II",
        name: "Fase II: Análisis Matemático y Lanzamientos de Prueba",
        startDate: "2026-12-15",
        desc: "Centrada en el análisis matemático a través de informes técnicos con datos empíricos y la elaboración de un goniómetro (Matemáticas), además de la actualización del presupuesto tras la presentación del prototipo (Economía). Fase de lanzamientos de prueba."
    },
    III: {
        id: "III",
        name: "Fase III: Documentación Técnica, Balance y Modelo de Negocio",
        startDate: "2027-02-15",
        desc: "Consiste en la documentación técnica del montaje del prototipo definitivo mediante la hoja de taller (Física y Química), el balance económico (Economía), la definición de la imagen corporativa y la redacción del modelo de negocio (Liderazgo y Emprendimiento)."
    },
    IV: {
        id: "IV",
        name: "Fase IV: Cierre Formal, Dossier de Inversión y Cuenta de Resultados",
        startDate: "2027-03-31",
        desc: "Fase de síntesis y cierre formal que abarca el informe técnico exhaustivo (Física y Química), el Business Model Canvas y la bitácora de decisiones (Liderazgo y Emprendimiento), el dossier argumentativo para inversores (Lengua) y la cuenta de resultados (Economía). Se realiza la presentación de la Start-up ante inversores."
    },
    V: {
        id: "V",
        name: "Fase V: Concurso Final",
        startDate: "2027-05-19",
        desc: "Culminación del proyecto con la celebración del Concurso Final (19/05/2027)."
    }
});

// Definición Maestra Oficial de los 18 Entregables Curriculares en Google Drive
const DELIVERABLES_DEF = [
    // Física y Química (3)
    {
      key: "preliminaryReport",
      subject: "FYQ",
      phase: "I",
      name: "1. Informe Técnico Preliminar, Boceto y Foto",
      shortName: "Preliminar FYQ",
      desc: "Informe preliminar, boceto inicial y foto del diseño del cohete (Física y Química).",
      role: "TECNICO",
      defaultOpenDate: "2026-11-02T00:00",
      defaultDate: "2026-12-15T23:59",
      weight: "10% FYQ",
      defaultGuideDocUrl: ""
    },
    {
      key: "hoja_taller_fyq",
      subject: "FYQ",
      phase: "III",
      title: "Hoja de Taller: BOM y Control de Ensamble",
      name: "2. Hoja de Taller: BOM y Control de Ensamble",
      shortName: "Hoja de Taller (FYQ)",
      desc: "Registro de desglose de materiales y control de calidad físico (Física y Química).",
      role: "OPERACIONES_IA",
      defaultOpenDate: "2027-02-15T00:00",
      defaultDate: "2027-03-31T23:59",
      weight: "10% FYQ",
      defaultGuideDocUrl: "https://docs.google.com/document/d/1ehTeMTmHzY5Jl8dcVjvF-2AkfQQBNRR0tctTWdqSI1o/copy"
    },
    {
      key: "technicalReport",
      subject: "FYQ",
      phase: "IV",
      name: "3. Informe Técnico Final Exhaustivo",
      shortName: "Técnico Final FYQ",
      desc: "Memoria técnica completa de rendimiento y física de vuelo (Física y Química).",
      role: "TECNICO",
      defaultOpenDate: "2027-03-31T00:00",
      defaultDate: "2027-04-10T23:59",
      weight: "30% FYQ",
      defaultGuideDocUrl: ""
    },
    
    // Liderazgo y Emprendimiento (6)
    {
      key: "brandIdentity_dec",
      subject: "LYE",
      phase: "I",
      name: "1A. Nombre, Logo, Tagline, Imagen de Marca — DICIEMBRE",
      shortName: "Marca Dic (LYE)",
      desc: "Identidad inicial de marca, logotipo y misión corporativa.",
      role: "MARKETING",
      defaultOpenDate: "2026-11-02T00:00",
      defaultDate: "2026-12-15T23:59",
      weight: "10% LYE",
      defaultGuideDocUrl: ""
    },
    {
      key: "decisionDiary_dec",
      subject: "LYE",
      phase: "I",
      name: "4A. Diario / Bitácora — DICIEMBRE",
      shortName: "Diario/Bitácora Dic (LYE)",
      desc: "Diario de decisiones, resolución de conflictos y registro ético de IA (Diciembre).",
      role: "OPERACIONES_IA",
      defaultOpenDate: "2026-11-02T00:00",
      defaultDate: "2026-12-15T23:59",
      weight: "10% LYE",
      defaultGuideDocUrl: "https://docs.google.com/document/d/1QDzumCcDHLWcQJlkPSaA1Q16Kj0Ff9wsHiPf_clLau8/copy"
    },
    {
      key: "brandIdentity_apr",
      subject: "LYE",
      phase: "III",
      name: "1B. Nombre, Logo, Tagline, Imagen de Marca — ACTUALIZACIÓN",
      shortName: "Marca Act (LYE)",
      desc: "Evolución y consolidación de la marca, manual de identidad y defensa.",
      role: "MARKETING",
      defaultOpenDate: "2027-02-15T00:00",
      defaultDate: "2027-03-31T23:59",
      weight: "10% LYE",
      defaultGuideDocUrl: ""
    },
    {
      key: "businessModelDoc",
      subject: "LYE",
      phase: "III",
      name: "2. Business Model — Documento Escrito",
      shortName: "Business Model (Doc)",
      desc: "Desarrollo argumentado del modelo de negocio de la startup.",
      role: "MARKETING",
      defaultOpenDate: "2027-02-15T00:00",
      defaultDate: "2027-03-31T23:59",
      weight: "25% LYE",
      defaultGuideDocUrl: ""
    },
    {
      key: "businessModelCanvas",
      subject: "LYE",
      phase: "IV",
      name: "3. Business Model Canvas (Lienzo Estratégico)",
      shortName: "Canvas (LYE)",
      desc: "Lienzo de modelo de negocio con los 9 módulos estratégicos.",
      role: "MARKETING",
      defaultOpenDate: "2027-03-31T00:00",
      defaultDate: "2027-04-23T23:59",
      weight: "15% LYE",
      defaultGuideDocUrl: ""
    },
    {
      key: "decisionDiary_apr",
      subject: "LYE",
      phase: "IV",
      name: "4B. Diario / Bitácora — ABRIL",
      shortName: "Diario/Bitácora Abr (LYE)",
      desc: "Diario de decisiones, resolución de conflictos y registro ético de IA (Abril).",
      role: "OPERACIONES_IA",
      defaultOpenDate: "2027-03-31T00:00",
      defaultDate: "2027-04-23T23:59",
      weight: "10% LYE",
      defaultGuideDocUrl: "https://docs.google.com/document/d/1QDzumCcDHLWcQJlkPSaA1Q16Kj0Ff9wsHiPf_clLau8/copy"
    },

    // Lengua Castellana (1)
    {
      key: "investorDossier",
      subject: "LEN",
      phase: "IV",
      name: "1. Dossier para Inversores (Texto Argumentativo)",
      shortName: "Dossier Inversores (LEN)",
      desc: "Dossier argumentativo formal dirigido a inversores y patrocinadores.",
      role: "MARKETING",
      defaultOpenDate: "2027-03-31T00:00",
      defaultDate: "2027-04-23T23:59",
      weight: "40% LEN",
      defaultGuideDocUrl: ""
    },

    // Matemáticas (4)
    {
      key: "goniometerEvidence",
      subject: "MAT",
      phase: "II",
      name: "1. Goniómetro (Evidencia y Construcción)",
      shortName: "Goniómetro (MAT)",
      desc: "Construcción física, calibración y registro fotográfico del goniómetro.",
      role: "OPERACIONES_IA",
      defaultOpenDate: "2026-12-15T00:00",
      defaultDate: "2027-02-15T23:59",
      weight: "25% MAT",
      defaultGuideDocUrl: ""
    },
    {
      key: "mathReportDist",
      subject: "MAT",
      phase: "II",
      name: "2. Informe Técnico con Datos Empíricos de Distancia Conocida",
      shortName: "Dist. Conocida (MAT)",
      desc: "Cálculo trigonométrico de apogeo con distancia base fija conocida.",
      role: "OPERACIONES_IA",
      defaultOpenDate: "2026-12-15T00:00",
      defaultDate: "2027-02-15T23:59",
      weight: "25% MAT",
      defaultGuideDocUrl: ""
    },
    {
      key: "mathReportTwoPoints",
      subject: "MAT",
      phase: "II",
      name: "3. Informe Técnico con Dos Mediciones",
      shortName: "Dos Mediciones (MAT)",
      desc: "Triangulación matemática desde dos puntos de observación independientes.",
      role: "OPERACIONES_IA",
      defaultOpenDate: "2026-12-15T00:00",
      defaultDate: "2027-02-15T23:59",
      weight: "25% MAT",
      defaultGuideDocUrl: ""
    },
    {
      key: "mathReportFinal",
      subject: "MAT",
      phase: "II",
      name: "4. Informe Técnico Final Comparativo",
      shortName: "Comparativo Final (MAT)",
      desc: "Análisis comparativo de modelos matemáticos y desviaciones reales de apogeo.",
      role: "OPERACIONES_IA",
      defaultOpenDate: "2026-12-15T00:00",
      defaultDate: "2027-02-15T23:59",
      weight: "25% MAT",
      defaultGuideDocUrl: ""
    },

    // Economía (4)
    {
      key: "budgetInitial",
      subject: "ECO",
      phase: "I",
      name: "1. Presupuesto Inicial",
      shortName: "Presupuesto Inicial",
      desc: "Presupuesto inicial de aprovisionamiento y proyección financiera de la startup.",
      role: "FINANZAS",
      defaultOpenDate: "2026-11-02T00:00",
      defaultDate: "2026-11-20T23:59",
      weight: "20% ECO",
      defaultGuideDocUrl: ""
    },
    {
      key: "budgetPostProto",
      subject: "ECO",
      phase: "II",
      name: "2. Presupuesto tras Presentación de Prototipo",
      shortName: "Presupuesto Post-Proto",
      desc: "Presupuesto recalculado tras las pruebas físicas de apogeo y taller.",
      role: "FINANZAS",
      defaultOpenDate: "2026-12-15T00:00",
      defaultDate: "2027-01-09T23:59",
      weight: "20% ECO",
      defaultGuideDocUrl: ""
    },
    {
      key: "balanceSheet",
      subject: "ECO",
      phase: "III",
      name: "3. Balance",
      shortName: "Balance de Situación",
      desc: "Balance de situación cerrado con activo, pasivo y patrimonio neto final.",
      role: "FINANZAS",
      defaultOpenDate: "2027-02-15T00:00",
      defaultDate: "2027-03-31T23:59",
      weight: "20% ECO",
      defaultGuideDocUrl: ""
    },
    {
      key: "incomeStatement",
      subject: "ECO",
      phase: "IV",
      name: "4. Cuenta de Resultados",
      shortName: "Cuenta de Resultados",
      desc: "Cuenta de pérdidas y ganancias provisional y control de márgenes.",
      role: "FINANZAS",
      defaultOpenDate: "2027-03-31T00:00",
      defaultDate: "2027-04-23T23:59",
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

// Changelog Oficial de Producción v2.0.02
const APP_CHANGELOG = [
    {
      version: "2.0.02",
      date: new Date().toISOString().split('T')[0],
      title: "Paridad Operativa Total del Rol Auxiliar, Enrutamiento Exacto de Notificaciones y Auditoría Integral por Roles",
      items: [
        "Paridad Operativa del Rol Auxiliar (getEffectiveRole): Cuando el Rol Auxiliar está vinculado a un departamento, opera en igualdad funcional plena (UI, contadores, acciones B2B/I+D/Finanzas/Operaciones/Marketing/CEO, notificaciones y validaciones en servidor PHP/D1), conservando su PIN propio y su escaño individual de voto en Asamblea.",
        "Enrutamiento Exacto de [👁️ Ver Notificación ➔]: Redirección precisa y sin rebotes para avisos de Balances DOC_17, I+D Especial, Licencias AESA, Contratos/Patrocinios, Crónicas AEE, Entregables, Gobernanza, Campañas de Marketing, Hoja de Taller y Aduana B2B.",
        "Difusión Multi-Departamento de Avisos Globales ('ALL'): Desdoblamiento por destinatario al emitir avisos generales y soporte de lectura por rol efectivo (readBy), evitando que descartar un aviso lo borre para otros departamentos o startups.",
        "Bandeja de Visado Ejecutivo del CEO y Subsanaciones: Visibilidad directa en el Dashboard del CEO de propuestas de Eslogan y Acciones Publicitarias pendientes, además de reenvío directo para solicitudes de I+D Especial devueltas, informe de devolución en DOC_17 y enlace a dictamen en Eslogan/DOC_4.",
        "Blindaje AESA Anti-Doble Cargo y Depuración Docente: Exención automática de la segunda tasa de 50 €v al subsanar licencias AESA denegadas, limpieza del panel duplicado de Eslogan en Coordinación, sincronización del badge 🚀 AESA OK, histórico de cambios de denominación y corrección en PHP y Cloudflare Workers."
      ],
      highlights: [
        { type: "AUXILIAR", text: "Paridad operativa completa con su departamento vinculado sin perder su voto ni PIN individual." },
        { type: "NOTIFICACIONES", text: "Botón [👁️ Ver Notificación ➔] sincronizado con destino exacto en todos los roles y avisos globales." },
        { type: "AUDITORÍA", text: "Correcciones integrales en CEO, I+D, Finanzas, Operaciones, Marketing y Coordinación Docente." }
      ]
    },
    {
      version: "2.0.01",
      date: new Date().toISOString().split('T')[0],
      title: "Eliminación Integral de Startups, Purga en Cascada B2B y Reseteo Limpio de Fábrica para TEST",
      items: [
        "Eliminación Integral sin Residuos (Tombstones): Las empresas eliminadas por Coordinación se registran en una lista negra persistente (deletedCompanyIds) y se purgan de la base de datos (SQLite y D1), impidiendo su reaparición.",
        "Blindaje y Reembolso Transaccional B2B: Al eliminar una empresa o resetear TEST, cualquier venta en curso en Aduana B2B se cancela de inmediato y el 100% de los fondos (€v) se reembolsan automáticamente en el Ledger de los compradores.",
        "Limpieza en Cascada de Módulos Globales: Erradicación automática de ofertas B2B huérfanas, solicitudes de I+D, notas de prensa y referencias de evaluación docente asociadas a startups eliminadas.",
        "Reseteo de Fábrica para Empresa TEST (2.400 €v): Botón dedicado '🔄 Resetear' en el Llavero Maestro que devuelve la empresa de pruebas a su estado virgen con dotación completa de 2.400 €v, preservando código y PINs maestros sin contaminar el entorno de aula."
      ],
      highlights: [
        { type: "BORRADO", text: "Purga integral e irreversible de startups con erradicación de datos residuales." },
        { type: "SANDBOX", text: "Botón de reseteo de fábrica para TEST con dotación limpia de 2.400 €v." },
        { type: "B2B", text: "Reembolso automático inmediato de fondos retenidos en aduana al eliminar o resetear empresas." }
      ]
    },
    {
      version: "2.0.00",
      date: new Date().toISOString().split('T')[0],
      title: "Lanzamiento Mayor 2.0: Credenciales y Llavero Maestro Acoplados por Clase y Sincronización de Versión",
      items: [
        "Sincronización Dinámica de Versión en Tarjetas: Las credenciales Cyberpunk de alumnos y claustro docente reflejan en tiempo real la versión oficial del sistema (v2.0.00) eliminando versiones estáticas obsoletas.",
        "Emisión de Credenciales PDF Exclusiva por Clase: Sustitución de la descarga masiva por el generador segmentado por grupo de clase (A, B, C, D, E, F y TEST), optimizando la impresión para el aula.",
        "Exportación CSV de Llavero Maestro por Clase: Descarga de credenciales y PINs en CSV filtrado por la clase seleccionada para mayor seguridad y comodidad organizativa del docente.",
        "Blindaje de Regeneración de PINs por Grupo: El generador aleatorio de PINs actúa únicamente sobre la clase activa protegiendo las contraseñas del resto de grupos de alumnos."
      ],
      highlights: [
        { type: "LLAVERO", text: "Gestión y descarga de credenciales PDF y CSV segmentadas exclusivamente por clase." },
        { type: "VERSIONADO", text: "Sincronización global y automática de la versión v2.0.00 en todas las tarjetas físicas." }
      ]
    },
    {
      version: "1.1.77",
      date: new Date().toISOString().split('T')[0],
      title: "Desaturación de Botones I+D, Limpieza de Cabeceras en Mercado y Enfoque Operativo en Banco y Taller",
      items: [
        "Desaturación Visual en SUPER-MARSKET: Eliminación de los botones duplicados de 'Solicitar Material I+D' en las cabeceras internas del Catálogo B2C y del Mercado Secundario B2B. Se preserva un único botón maestro permanente y elegante en la barra superior junto a las pestañas de suministro.",
        "Limpieza en Cabecera de Catálogo B2C: El encabezado del catálogo aeroespacial concentra ahora toda la jerarquía operativa en los accesos tácticos de 'Mis Órdenes' y '🛒 Carrito', eliminando ruido cognitivo para el alumno.",
        "Despeje del Banco de Pruebas de Vuelo: Supresión del botón redundante de I+D en el encabezado de ensayos de vuelo, dejando como acción prioritaria el enlace '🔧 Ir a Taller y BOM'. La gestión de componentes especiales queda centralizada en la tarjeta dedicada contigua.",
        "Enfoque Operativo en Taller y BOM: Retirada del botón flotante de I+D en la cabecera del taller, delimitando el área exclusivamente a la supervisión del inventario de stock, escandallo BOM y venta de excedentes."
      ],
      highlights: [
        { type: "ERGONOMÍA", text: "Erradicación de botones apilados y duplicidades en las vistas de Técnico (Mercado, Banco y Taller)." },
        { type: "MERCADO", text: "Botón maestro único de I+D en la barra superior de SUPER-MARSKET y cabeceras limpias." }
      ]
    },
    {
      version: "1.1.76",
      date: new Date().toISOString().split('T')[0],
      title: "Circuito B2B con Aduana Docente, Orden de Adquisición DOC_9, Órdenes Correlativas y Contador Financiero",
      items: [
        "Circuito B2B Integral de 4 Fases con Validación Docente: La adquisición de piezas de 2ª mano requiere solicitud de I+D (PENDIENTE_FINANZAS), autorización de Finanzas con retención de fondos (PENDIENTE_DOCENTE), validación oficial del docente en Aduana Aeroespacial B2B (APROBADO_DOCENTE) y confirmación de recepción física en Taller por Operaciones (EJECUTADO).",
        "Justificación Obligatoria DOC_9 con Clonación Oficial en B2B: Al solicitar una pieza en el mercado secundario, el Técnico debe adjuntar obligatoriamente el enlace a Google Docs con la Orden de Adquisición (DOC_9), contando con botón de clonación directa de la plantilla oficial (política Zero-Text).",
        "Doble Auditoría Documental en Aduana Docente: El coordinador y profesorado disponen en la Aduana B2B de los accesos simultáneos tanto a la Orden de Adquisición del comprador (DOC_9) como a la Memoria de Venta del vendedor.",
        "Numeración Correlativa de Órdenes a Finanzas (001, 002...): Todas las solicitudes de compra a Finanzas se numeran correlativamente con formato de 3 dígitos (001, 002, 003...) para un seguimiento ordenado y profesional.",
        "Contador Numérico Reactivo en Pestaña de Finanzas (badge-finance): La cabecera de '💰 Finanzas & ECO' muestra en tiempo real un distintivo numérico con el total de órdenes de compra B2B, pedidos de I+D y packs de marketing pendientes de autorización.",
        "Blindaje Anti-Doble Cargo y Reembolsos Automáticos: Protección estricta del Libro Mayor para que la recepción física en taller no duplique el cargo previamente retenido en B2B, y reembolso inmediato del 100% ante denegaciones docentes o ventas a competidores."
      ],
      highlights: [
        { type: "B2B/ADUANA", text: "Circuito de 4 pasos para compras B2B: I+D ➔ Finanzas ➔ Aduana Docente ➔ Taller Operaciones." },
        { type: "DOC_9", text: "Orden de adquisición en Google Docs obligatoria para comprar material de segunda mano." },
        { type: "CONTROL", text: "Órdenes correlativas 001, 002... y contador numérico de trámites pendientes en Finanzas." }
      ]
    },
    {
      version: "1.1.75",
      date: new Date().toISOString().split('T')[0],
      title: "Bandeja de Autorizaciones en Finanzas, Visibilidad B2B, Botón I+D Universal y Purga Anti-Caché",
      items: [
        "Bandeja de Autorización Presupuestaria en Finanzas: Integración en la pantalla principal de Finanzas & ECO de un panel de gestión inmediata para órdenes de compra B2B de 2ª mano, pedidos de I+D, propuestas de venta y packs de marketing con botones de acción directa en 1 clic.",
        "Visibilidad de Estado B2B en Mercado Secundario: Indicador en tiempo real de 'Solicitado a Finanzas' en la tarjeta del artículo cuando el Técnico solicita la compra, y botón directo de autorización para Finanzas desde el propio mercado.",
        "Botón de Material I+D Universal en Mercado: El acceso táctico [+ Solicitar Material I+D] se ubica de forma fija en la cabecera superior del Mercado junto a las pestañas B2C y B2B, garantizando máxima visibilidad en todo momento.",
        "Depuración Total de Entregables de Matemáticas en Técnico: Supresión definitiva de residuos de entregables de Matemáticas y FyQ en la vista de vuelo técnico, centralizando la gestión en Mis Entregables y Operaciones.",
        "Paleta Metálica Real Universal e Inmune a Tailwind: Implementación de colores metálicos puros inline (#FFD700 Oro, #E2E8F0 Plata, #CD7F32 Bronce, #B87333 Cobre, #00F0FF Colaborador) en el panel docente, modal de asignación y tarjetas de KPI de todos los roles.",
        "Blindaje Anti-Caché y Actualización Automática: Configuración HTTP no-store para index.html y sw.js, con recarga automática sin parpadeo al detectar una nueva versión en producción."
      ],
      highlights: [
        { type: "FINANZAS", text: "Bandeja de autorizaciones presupuestarias directas para compras B2B y pedidos I+D en Finanzas & ECO." },
        { type: "B2B/I+D", text: "Botón permanente [+ Solicitar Material I+D] en la cabecera del mercado y estado de compra en tiempo real." },
        { type: "CACHÉ", text: "Purga de caché y recarga automática transparente para recibir siempre la última versión." }
      ]
    },
    {
      version: "1.1.74",
      date: new Date().toISOString().split('T')[0],
      title: "Ventana de Balances 14 Días con Visado CEO, Aprobación Parcial de Órdenes, Circuito B2B con Finanzas y Ergonomía Departamental",
      items: [
        "Ventana de 14 Días y Visado CEO para Balances Contables: Bloqueo de balances (DOC_17) hasta el cierre oficial de cada fase. Se abre una ventana de 14 días lectivos donde Finanzas envía el balance al CEO en estado PENDIENTE_CEO; el CEO lo visa elevándolo a Economía o lo devuelve a Finanzas con enlace Drive de subsanación.",
        "Aprobación Parcial y Justificación en Órdenes de Compra: Finanzas puede seleccionar qué artículos de la orden de I+D aprueba y cuáles rechaza con recálculo dinámico en tiempo real. En aprobaciones parciales o rechazos, se exige obligatoriamente enlace a Google Docs con la memoria justificativa (Zero-Text).",
        "Circuito B2B de Compra con Finanzas (Opción A): Al pulsar Adquirir B2B en el mercado secundario, el Técnico genera una petición interna a su Finanzas (PENDIENTE_FINANZAS). La pieza permanece EN_VENTA; el primer Finanzas que la aprueba la bloquea atómicamente en EN_ADUANA, descuenta fondos del ledger y cancela solicitudes competidoras.",
        "Paleta Real Metálica en Patrocinios: Asignación de colores y resplandores metálicos auténticos en insignias y banners (Oro #FFD700, Plata #E2E8F0, Bronce #CD7F32, Cobre #B87333 y Colaborador #00F0FF).",
        "Cuaderno de Bitácora e IA Operacional (DOC_4): Sustitución del entregable genérico en la pestaña Bitácora e IA por tarjeta dedicada con clonación oficial de plantilla de Google Docs y subida directa de evidencias.",
        "Máxima Visibilidad de Material I+D: Integración del botón táctico [+ Solicitar Material I+D] en el Banco de Pruebas de FYQ, cabecera de Catálogo B2C, pie de catálogo y Taller & BOM.",
        "Depuración de Entregables Redundantes y Tique en Operaciones: Supresión de tarjetas de entregables masivos en pantallas de inicio departamentales (reemplazadas por un banner horizontal compacto) y eliminación del campo innecesario de URL Tique Drive en compras físicas."
      ],
      highlights: [
        { type: "FINANZAS", text: "Aprobación parcial de compras con enlace a Google Docs y ventana de 14 días para balances." },
        { type: "B2B", text: "Circuito de compra de segunda mano supervisado por Finanzas con bloqueo atómico en Aduana." },
        { type: "ERGONOMÍA", text: "Banner horizontal de entregable activo por rol y solicitud directa de material I+D visible en 4 vistas." }
      ]
    },
    {
      version: "1.1.73",
      date: new Date().toISOString().split('T')[0],
      title: "Tarjeta de Contrato en Sala de Mando CEO, Corrección de Contraste y Banners Departamentales",
      items: [
        "Módulo de Contrato en Sala de Mando del CEO: División del espacio izquierdo del CEO bajo la Licencia AESA, integrando tarjeta en tiempo real del contrato en vigor de la fase activa con acceso directo a licitaciones.",
        "Contador Ejecutivo de Éxito en Contratos: Registro visual de contratos cumplidos respecto al total de contratos firmados (🏆 X / Y Cumplidos) en Sala de Mando y cabecera de Contratos.",
        "Erradicación del Fallo de Contraste en Contrato Cumplido: Implementación de estilos inline de alta prioridad (#00ff66 y #ff0055) en bordes, resplandor cósmico y badges, garantizando legibilidad perfecta (WCAG AAA) sin dependencia del compilador estático de Tailwind.",
        "Barra de Rendimiento Global en Contratos: Cuadrícula con métricas de Contratos Suscritos, Contratos Cumplidos con porcentaje de éxito, Licitaciones en Curso e Impacto Neto Acumulado en Tesorería (€v).",
        "Sincronización de Misión en Todos los Roles de Alumno: Incorporación del banner táctico de contrato activo en las vistas de Técnico (I+D), Operaciones (Logística) y Marketing (Marca y Negocio).",
        "Blindaje de Balances de Fases Futuras en Finanzas: Bloqueo de registro anticipado de balances (DOC_17) para fases no iniciadas, manteniendo el rigor cronológico del claustro."
      ],
      highlights: [
        { type: "CEO", text: "Tarjeta de contrato en vigor y contador de éxito (🏆 X / Y) en Sala de Mando." },
        { type: "DISEÑO", text: "Corrección de contraste (texto ilegible) con estilos inline de alto impacto #00ff66." },
        { type: "ROLES", text: "Banner táctico de misión activa integrado en Técnico, Operaciones y Marketing." }
      ]
    },
    {
      version: "1.1.72",
      date: new Date().toISOString().split('T')[0],
      title: "Radar Ejecutivo de Fase en CEO, Hitos Dinámicos, Ordenación por Urgencia y Blindaje B2B",
      items: [
        "Progreso de Hitos Adaptado a la Fase Activa (0/4): Ajuste en Sala de Mando del CEO y accesos al Dossier, sustituyendo el denominador anual de 18 hitos por los 4 entregables específicos de la Fase I en curso.",
        "Radar Ejecutivo de Fase y Doble Cronómetro (CEO): La Sala de Mando del CEO incorpora doble telemetría con barra de consumo temporal de fase (días restantes y porcentaje transcurrido con alerta dinámica de color) y barra de entregables completados.",
        "Cuadrícula Táctica de Entregables del CEO: Mini-fichas departamentales con fecha límite, departamento responsable (Finanzas, Técnico, Marketing, Operaciones) y estado en tiempo real con botón directo de visado en 1 clic.",
        "Ordenación Cronológica por Urgencia: En Mis Entregables y Dossier, los hitos se ordenan por proximidad de fecha límite (1º Presupuesto Inicial del 20 Noviembre, seguido de los del 15 Diciembre), situando además tareas pendientes y devueltas antes de las completadas.",
        "Contratos Comerciales Limpios (Anti-Sobrecarga): Al suscribir un contrato vinculante por fase, el catálogo inferior de las otras 5 opciones desaparece por completo para evitar dispersión cognitiva.",
        "Celebración Visual de Contrato Cumplido: Cuando el docente califica un contrato como CUMPLIDO, toda la tarjeta se ilumina en verde esmeralda brillante con resplandor cósmico (+150 €v) y en rojo si fuera penalizado."
      ],
      highlights: [
        { type: "RADAR CEO", text: "Doble barra de tiempo y entregables con mini-fichas tácticas de fase en Sala de Mando." },
        { type: "URGENCIA", text: "Ordenación de entregables por plazo inminente (20 Nov antes que 15 Dic)." },
        { type: "CONTRATOS", text: "Catálogo cerrado al suscribir y tarjeta en verde esmeralda al completarse." }
      ]
    },
    {
      version: "1.1.71",
      date: new Date().toISOString().split('T')[0],
      title: "Enfoque por Fase Activa, Blindaje de Fases Futuras y Radar de Subsanaciones Anteriores",
      items: [
        "Apertura Automática en Fase Activa: Al acceder a Mis Entregables, la vista selecciona por defecto la fase en curso (Fase I), mostrando únicamente los entregables de dicha fase y evitando la sobrecarga cognitiva de los 18 hitos del curso.",
        "Sincronización Total de Contadores y Alcance: Los 4 contadores de resumen (Entregados, En Revisión CEO, Requieren Acción y Pendientes) y los botones de alcance (Mis Entregables y Toda la Startup) se calculan en tiempo real sobre la fase seleccionada.",
        "Blindaje y Candado en Fases Futuras: Las fases no iniciadas (Fases II, III y IV) muestran candado con fecha corta de apertura (🔒 FASE II • Abre 15 Dic) y permanecen deshabilitadas para el alumnado. El filtro 'Todas las Fases' agrupa únicamente fases abiertas.",
        "Radar y Alerta de Deuda de Fase Anterior: Si la misión avanza y una startup tiene entregables pendientes o devueltos para subsanar de una fase anterior abierta, se muestra un aviso prioritario con acceso directo de 1 clic y señalización pulsante en la pestaña correspondiente.",
        "Candado Coherente en Bóveda General del Dossier: Las fases futuras en el Dossier General se muestran selladas y el contador general solo cuantifica entregables de fases activas."
      ],
      highlights: [
        { type: "FOCO 4º ESO", text: "Apertura directa en Fase I y contadores ajustados a la misión activa." },
        { type: "BLINDAJE", text: "Fases futuras selladas con candado y fecha estimada de apertura oficial." },
        { type: "SEGUIMIENTO", text: "Radar de subsanaciones anteriores para evitar pérdidas de notas por despistes." }
      ]
    },
    {
      version: "1.1.70",
      date: new Date().toISOString().split('T')[0],
      title: "Optimización Tipográfica de Alta Legibilidad y Accesibilidad con Selector de Zoom",
      items: [
        "Tipografía Técnica Moderna de Pantalla: Transición desde Courier New hacia una familia monoespaciada moderna de alta legibilidad (Cascadia Mono, Consolas, SF Mono y Segoe UI Mono) con glifos 25% más altos y trazo nítido sin alterar el ancho ni descuadrar tarjetas.",
        "Suelo Tipográfico Inteligente y Mayor Contraste: Elevación de fuentes mínimas (11px en microetiquetas, 12px en descripciones secundarias y 13.2px en textos estándar) con contraste optimizado en grises secundarios (plata suave WCAG AAA).",
        "Selector de Zoom de Texto Accesible [ 🔠 A+ ]: Botón táctil en el HUD superior con 3 niveles (100% Estándar, 110% Grande y 120% Extra) con persistencia en localStorage para adaptación individual BYOD sin desbordamientos."
      ],
      highlights: [
        { type: "ACCESIBILIDAD", text: "Selector de zoom de texto en HUD (100% ➔ 110% ➔ 120%) con memoria local." },
        { type: "LEGIBILIDAD", text: "Nueva tipografía técnica de pantalla de alto contraste y suelo de 11.5px/13px." }
      ]
    },
    {
      version: "1.1.69",
      date: new Date().toISOString().split('T')[0],
      title: "Brújula de Misión y Fase Activa, Semáforo de Plazos 4º ESO, Enfoque de Cronograma y Blindaje Departamental",
      items: [
        "Brújula de Misión y Fase Activa: Indicador permanente de la fase actual en la barra superior (HUD) y tarjeta ejecutiva en el panel principal con barra de progreso visual de entregables completados, fecha límite de fase y acceso rápido a entregas.",
        "Claridad Contextual en Cronograma Oficial: Carteles explicativos dinámicos al alternar entre el 'Modo Enfoque Próximos 15 Días' y el 'Catálogo Completo (5 Fases)', indicando el número exacto de documentos visibles y el propósito de cada vista.",
        "Semáforo de Plazos Graduado para 4º ESO: Escalado visual progresivo en fechas límite (En Plazo > 7d, Esta Semana <= 7d, Cierre Inminente <= 72h, ¡Últimas Horas! <= 24h) y eliminación del falso cartel 'Vencido' en tareas ya entregadas.",
        "Blindaje de Permisos Departamentales: En la vista de Toda la Startup, se restringe la subida de entregables al rol responsable de cada materia o al CEO, impidiendo sobrescrituras entre departamentos y protegiendo entregables ya enviados al docente.",
        "Limpieza y Sincronización en Subsanaciones: Al reenviar un documento corregido se depuran de forma limpia los motivos y banderas de devolución previa, preservando notas de Drive del CEO y sincronizando mediante endpoints particionados atómicos.",
        "Reconciliación de Contratos Comerciales en Servidor: Fusión LWW fase por fase de contratos comerciales en Cloudflare Functions y PHP, protegiendo las liquidaciones docentes frente a sobreescrituras.",
        "Ergonomía Docente y Gestión de Fases: Actualización dinámica de títulos oficiales en el Gestor de Fases del Coordinador y ordenación cronológica por fases de las píldoras rápidas de Economía en evaluación docente."
      ],
      highlights: [
        { type: "ALUMNOS UX", text: "Brújula de Fase Activa en HUD/Dashboard y semáforo de urgencia de plazos." },
        { type: "CRONOGRAMA", text: "Modo Enfoque 15 días con cartel explicativo y erradicación de falsos 'Vencido'." },
        { type: "SEGURIDAD", text: "Blindaje de roles en entregas y reconciliación LWW de contratos comerciales." }
      ]
    },
    {
      version: "1.1.68",
      date: new Date().toISOString().split('T')[0],
      title: "Actualización de Plazo de Contratos Fase I (5 Días Lectivos), Requisito de Presupuesto Inicial y Sincronización B2B",
      items: [
        "Ventana de Contratos Fase I y Plazos Oficiales: La fecha límite de entrega del Presupuesto Inicial de Economía se fija oficialmente para el 20/11/2026 a las 23:59. La suscripción de Contratos Comerciales de la Fase I se habilita el 21/11/2026 y permanece abierta durante 5 días lectivos (hasta el viernes 27/11/2026 a las 23:59).",
        "Requisito Previo Condicional: Es obligatorio haber entregado previamente el Presupuesto Inicial de Economía (DOC_4) para suscribir contratos comerciales en la Fase I. El plazo general finaliza de forma improrrogable el 27/11/2026 sin ampliación por fecha de entrega individual.",
        "Navegación Asistida para Startups: En el panel de Contratos Comerciales, si la ventana está abierta pero la empresa aún no ha presentado su presupuesto, un aviso contextual destacado guía directamente al CEO con un botón de acceso rápido hacia Mis Entregables.",
        "Auditoría y Rectificación Segura en Contratos Comerciales: La liquidación docente de contratos vincula el identificador de asiento en el Libro Mayor (Ledger) y anula de manera limpia transacciones previas en caso de rectificación docente, evitando cobros duplicados.",
        "Filtrado B2B y Radar de Aduana por Clases: Corrección en las comprobaciones de identificadores de comprador/vendedor en compras de segunda mano para reflejar con exactitud las alertas pendientes y las insignias de clase (A-F y TEST).",
        "Cronología Oficial de Rúbricas (Economía, Liderazgo y Matemáticas): Alineación exacta de las fases en la rúbrica docente de Economía (Fase I: Presupuesto Inicial, Fase II: Presupuesto Post-Prototipo, Fase III: Balance, Fase IV: Cuenta de Resultados), asignando las evidencias en orden cronológico, y corrección en la acción de devolución de entregables para subsanación."
      ],
      highlights: [
        { type: "CONTRATOS", text: "Ventana de 5 días lectivos (21/11 al 27/11 a las 23:59) supeditada a entrega del Presupuesto Inicial." },
        { type: "DOCENTE", text: "Cronología de rúbrica en Economía ajustada al ciclo de fases y rectificación limpia en Ledger." },
        { type: "ADUANA B2B", text: "Filtrado estricto por clase y detección infalible de contratos B2B." }
      ]
    },
    {
      version: "1.1.67",
      date: new Date().toISOString().split('T')[0],
      title: "Blindaje Integral de Calificaciones Docentes, Sincronización en la Nube y Resolución de Conflictos 409",
      items: [
        "Persistencia Fiable de Calificaciones: Corrección en la función de registro de notas para capturar dictámenes y evidencias antes del diálogo de confirmación parcial y escribir directamente sobre la entidad viva en memoria con guardado y sincronización inmediata a la nube.",
        "Resolución Definitiva de Conflictos HTTP 409: Eliminación de la contaminación de etiquetas de versión (ETag) durante la obtención de credenciales de coordinación, permitiendo a los docentes y coordinadores guardar notas y cambios sin bucles de rechazo.",
        "Fusión Inteligente Last-Write-Wins (LWW) en Notas: Sello de fecha y hora individual (updatedAt) en cada calificación por asignatura para que la sincronización en segundo plano respete siempre la nota más reciente y nunca sobreescriba una nueva nota con una versión anterior.",
        "Coherencia Bipartita Servidor-Partición: Sincronización bidireccional automática entre la tabla central de estado y las particiones individuales de empresa al registrar calificaciones, licencias o contratos, impidiendo que acciones de alumnos degraden los registros evaluativos del profesorado.",
        "Soporte Transaccional para Subsanación [↩ Subsanar]: Incorporación de la acción DOCENTE_REVIEW_DELIVERABLE en el servidor y preservación de los códigos PIN predeterminados del claustro docente."
      ],
      highlights: [
        { type: "DOCENTE", text: "Garantía total de guardado y persistencia en rúbricas y calificaciones parciales." },
        { type: "SINCRONIZACIÓN", text: "Erradicación de bucles de conflicto 409 y sobreescrituras en segundo plano." },
        { type: "SERVIDOR", text: "Blindaje de notas docentes frente a acciones concurrentes de startups." }
      ]
    },
    {
      version: "1.1.66",
      date: new Date().toISOString().split('T')[0],
      title: "Guía Rápida y Manual Exhaustivo del Claustro Docente, Matriz de 18 Entregables y Procedimientos de Aula",
      items: [
        "Manual Oficial del Claustro Docente: Rediseño completo de la guía de usuario docente ([❓ GUÍA]), estructurada en 3 niveles (Guía rápida de 3 minutos, fichas de calificación por materia y manual de procedimientos exhaustivo).",
        "Rutina de Aula en 3 Clics: Bienvenida docente actualizada con el protocolo ágil de evaluación (Asistente '¿Qué me toca hacer hoy?', radar de alertas 🟡 N y resolución de trámites).",
        "Fichas Específicas por Asignatura: Guía detallada con qué califica cada profesor (FYQ 25%, LYE 40%, LEN 15%, ECO 10%, MAT 5%, ING 5%), las fases y los pesos exactos de los 18 entregables oficiales.",
        "Guía de Subsanaciones [↩ Subsanar] y Aduanas B2B: Protocolo paso a paso para requerir correcciones en Google Docs y arbitraje del nuevo circuito B2B con blindaje anti-doble venta.",
        "Generador Maestro de Google Docs para Docentes: Nuevo script en tools/generate-teacher-manual-google-doc.gs para maquetar el manual del claustro en Google Docs listo para compartir o imprimir."
      ],
      highlights: [
        { type: "DOCENTE", text: "Nueva guía rápida de aula y manual exhaustivo específico para profesores en la app y Google Docs." },
        { type: "CURRICULAR", text: "Fichas paso a paso por materia con pesos oficiales (100% Acta General LOMLOE)." },
        { type: "ERGONOMÍA", text: "Acceso directo en 1 clic desde el manual a Rúbricas, Aduana, Contratos y Llavero Maestro." }
      ]
    },
    {
      version: "1.1.65",
      date: new Date().toISOString().split('T')[0],
      title: "Circuito B2B Técnico-Finanzas, Blindaje Visual de Evidencias e Indicadores de Entregas por Clase",
      items: [
        "Circuito B2B Técnico-Finanzas: El Dpto. Técnico propone la desinversión de piezas al Responsable Financiero indicando precio de venta sugerido y memoria técnica de excedente (DOC_7).",
        "Resolución Financiera de Ventas B2B: Finanzas puede aprobar y publicar la oferta en el mercado secundario o devolverla a Técnico mediante motivo tipificado y contraoferta de precio.",
        "Retirada de Oferta B2B por Finanzas: Botón para retirar ofertas activas de segunda mano si deciden conservar el material, reintegrándolo automáticamente al inventario del taller si no ha sido adquirido en Aduana.",
        "Indicadores Visuales de Entrega por Clase (🟡 N): Los botones de filtrado de clase en el panel de Rúbricas muestran badges pulsantes en tiempo real con el recuento de startups que tienen documentos listos pendientes de calificar.",
        "Blindaje Visual de Evidencias Adjuntas: Resuelto el estrechamiento a 0px de los títulos de documentos y el desbordamiento del botón [↩ Subsanar] en columnas compactas mediante un diseño en dos niveles envolventes."
      ],
      highlights: [
        { type: "B2B", text: "Circuito completo de gobernanza interna Técnico ➔ Finanzas para la venta y desinversión de piezas." },
        { type: "RETIRADA", text: "Retirada segura de ofertas B2B en 1 clic para Finanzas con reintegro al taller." },
        { type: "ERGONOMÍA", text: "Badges pulsantes 🟡 N en filtros de clase y corrección de maquetación en evidencias docentes." }
      ]
    },
    {
      version: "1.1.64",
      date: new Date().toISOString().split('T')[0],
      title: "Asistente Contextual Docente, Selector Visual por Clases, Cronograma de Fases y Rúbrica Ponderada Oficial",
      items: [
        "Asistente Contextual Docente ('¿Qué me toca hacer hoy?'): Monitor inteligente que identifica la asignatura del profesor y la fase activa de la misión, guiándole paso a paso sobre qué entregables evaluar y ofreciendo un botón de acción en 1 clic hacia la siguiente empresa pendiente.",
        "Guía Visual y Cronograma de las 5 Fases: Panel interactivo desplegable con el calendario de las Fases I a V (fechas y nombre oficial) y el desglose de criterios y pesos específicos evaluables para cada asignatura.",
        "Nuevo Selector Visual de Startups en Cascada: Sustitución del desplegable ciego por una cuadrícula interactiva con selector rápido por clase (A-F y TEST) y tarjetas de empresa con semáforos de estado (calificada, lista con entregas o sin entregas).",
        "Rúbrica Oficial de Lengua Castellana (LEN) y Notas de Prensa: Rebalanceo curricular con Producción Oral (50%), Dossier para Inversores (40% LEN) y Conjunto de Notas de Prensa DOC_15 (10% LEN), con visualizador directo de los 4 comunicados de prensa del CEO.",
        "Corrección de Porcentajes en Física y Química (FyQ): Eliminación de la duplicación de texto en los criterios de FyQ en el Dossier y modales, garantizando una visualización tipográfica limpia.",
        "Homogeneización de Flujos Oficiales B2B y Dpto. Técnico: Actualización del contrato F3-C03 (Wallapop PRO) a responsabilidad exclusiva del Técnico y alineación de las plantillas DOC_7 (Desinversión B2B) y DOC_15 (Notas de Prensa)."
      ],
      highlights: [
        { type: "DOCENTE", text: "Asistente '¿Qué me toca hacer hoy?' con guía paso a paso y salto directo en 1 clic a la empresa pendiente." },
        { type: "SELECTOR", text: "Cuadrícula visual de startups por clase con semáforos de estado de entrega y calificación." },
        { type: "CURRICULAR", text: "Pesos oficiales de Lengua (50/40/10), visualizador de Notas de Prensa DOC_15 y corrección del porcentaje en FyQ." }
      ]
    },
    {
      version: "1.1.63",
      date: new Date().toISOString().split('T')[0],
      title: "Transparencia Disciplinaria para Alumnado, Escala de Patrocinadores Fase I y Edición de Crónicas Oficiales",
      items: [
        "Ventanilla de Sanciones AEE para Alumnos: En Gobernanza, cualquier miembro de la empresa puede consultar el historial completo de expedientes disciplinarios de su startup con organismo sancionador, artículo infringido, dictamen exacto del docente y multa en €v.",
        "Cuadro Consultivo de Régimen Disciplinario: Desplegable oficial para alumnos con los 5 artículos normativos, incluyendo el desglose exacto de entregas tardías (Art. 12: <24h Leve -10 €v, 24-72h Moderada -100 €v, >72h Grave -200 €v) y definición constructiva de la memoria técnica (Art. 18).",
        "Escala Oficial de Premios de Patrocinio (Fase I): Exposición visual en Contratos de los 5 niveles posibles de inversor (Oro +500 €v, Plata +400 €v, Bronce +250 €v, Cobre +150 €v, Colaborador +100 €v), resaltando las ventajas en caja y la reducción de la factura de costes operativos.",
        "Edición de Crónicas Oficiales para Coordinación: Nuevo botón y modal para que el docente pueda editar el titular, cuerpo enriquecido, fase, clase y portada Nano Banana 3 de noticias oficiales ya publicadas sin tener que eliminarlas.",
        "Sincronización Cloud LWW con updatedAt: Conciliación optimista en tiempo real que asegura que las ediciones de noticias se propaguen al instante en todos los dispositivos de la misión."
      ],
      highlights: [
        { type: "ALUMNADO", text: "Visibilidad total del historial de sanciones y normativa disciplinaria AEE en Gobernanza." },
        { type: "PATROCINIOS", text: "Escaparate de premios de la Fase I con inyección en caja y reducción de la factura operativa." },
        { type: "DOCENTE", text: "Edición y actualización de Crónicas Oficiales y portadas Nano Banana 3 en el Tablón." }
      ]
    },
    {
      version: "1.1.62",
      date: new Date().toISOString().split('T')[0],
      title: "Generación y Descarga de Catálogo Oficial en PDF y CSV para Alumnado (Sin I+D)",
      items: [
        "Exportación Oficial a PDF Imprimible: Nueva herramienta institucional para Coordinación en la pestaña de Gestión Catálogo que genera un documento oficial A4 maquetado de alta legibilidad listo para imprimir o guardar en PDF.",
        "Filtrado Automático Sin I+D: Depuración inteligente que extrae exclusivamente componentes y precios oficiales de la misión, excluyendo solicitudes especiales, piezas exclusivas o materiales fuera de catálogo.",
        "Agrupación por Subsistemas Aeroespaciales: Organización estructurada por categorías canónicas (Estructura Principal, Propulsión, Aerodinámica, Sellado, etc.) con códigos de producto, procedencia y precios oficiales en €v.",
        "Exportación Complementaria en CSV: Descarga directa en formato de hoja de cálculo UTF-8 para presupuestos y balances en Google Sheets o Excel.",
        "Visor Seguro y Ahorro de Tinta: Diseño optimizado para consumo escolar con cabecera de la Agencia Espacial Escolar (AEE), cláusula normativa de compras y cajas de firma."
      ],
      highlights: [
        { type: "DOCENTE / TIC", text: "Generación de documento PDF oficial del catálogo para compartir con los alumnos en Drive/Classroom." },
        { type: "FILTRADO I+D", text: "Exclusión limpia de componentes a medida, mostrando solo referencias comerciales homologadas." },
        { type: "FORMATO", text: "Descarga dual en PDF imprimible A4 y en hoja de cálculo CSV con precios en €v actualizados." }
      ]
    },
    {
      version: "1.1.61",
      date: new Date().toISOString().split('T')[0],
      title: "Radar de Misión por Clases para Docentes y Formato Enriquecido en Noticias Oficiales",
      items: [
        "Radar de Misión por Clases: Nuevo monitor global superior en el panel docente (A-F y TEST) con indicadores en tiempo real de trámites aduaneros pendientes, volumen de entregas y empresas con saldo crítico (<300 €v).",
        "Sincronización Total de Filtros: Selección instantánea de clase a 1 clic que filtra coordinadamente Rúbricas y Actas (100%), Aduana, Contratos Comerciales y Llavero Maestro.",
        "Acción Rápida de Evaluación: Acceso directo desde la tabla de control financiero a la calificación y rúbricas de cada empresa.",
        "Formato Enriquecido en Noticias Oficiales: Barra de herramientas tipográfica con soporte para negrita (**texto**), cursiva (*texto*), saltos de párrafo y listas con viñetas en crónicas y notas de coordinación.",
        "Blindaje y Sanitización XSS: Renderizado seguro bajo directrices Zero-Text que preserva la seguridad del alumnado y la ergonomía de lectura."
      ],
      highlights: [
        { type: "DOCENTE", text: "Radar de Misión por Clases para supervisión instantánea de aduanas, finanzas y entregas de 30 empresas." },
        { type: "NOTICIAS", text: "Editor con formato enriquecido (negrita, cursiva, párrafos y viñetas) para crónicas oficiales." },
        { type: "ERGONOMÍA", text: "Filtrado unificado en 1 clic y botón directo de evaluación por empresa." }
      ]
    },
    {
      version: "1.1.60",
      date: new Date().toISOString().split('T')[0],
      title: "Blindaje Antiduplicados en Mercado B2B, Resolución en Aduana Docente y Crónicas Oficiales con Nano Banana 3",
      items: [
        "Blindaje Transaccional B2B: Escudo anti-doble compra que retiene la oferta al primer clic e impide adquisiciones concurrentes o duplicadas de piezas únicas en el Mercado Secundario.",
        "Resolución y Reembolso Automático en Aduana: Al aprobar una compraventa en la Aduana Docente, cualquier solicitud competidora o duplicada se cancela de inmediato reembolsando el 100% de los fondos en el Ledger contable del comprador.",
        "Persistencia Anti-Resurrección en Nube: Refuerzo del algoritmo de fusión de datos en state.js para respetar ofertas vendidas o en trámite aduanero, garantizando que no reaparezcan en venta tras sincronización.",
        "Crónicas Oficiales de la Misión AEE con Nano Banana 3: Módulo editorial exclusivo para Coordinación Docente en el Tablón de Noticias con soporte para subir imágenes generadas con IA, optimización y compresión ligera en el navegador (WebP/JPEG), y visor ampliado.",
        "Ilustración de Notas de Prensa (CEO): Capacidad del Claustro para adjuntar portadas generadas con Nano Banana 3 y apuntes editoriales a los comunicados oficiales (DOC_15) de las startups."
      ],
      highlights: [
        { type: "MERCADO B2B", text: "Blindaje de stock único y cancelación con reembolso automático de duplicados en Aduana." },
        { type: "IA // NANO BANANA 3", text: "Publicación de crónicas oficiales y portadas generadas con IA en el Tablón de Noticias." },
        { type: "DOCENTE", text: "Herramienta editorial para enriquecer la narrativa y visibilizar los hitos del proyecto." }
      ]
    },
    {
      version: "1.1.59",
      date: new Date().toISOString().split('T')[0],
      title: "Optimización de Despliegue Secuencial, Estrategia Network-First en Service Worker y Validación Robusta de Entregables",
      items: [
        "Despliegue Secuencial CDMON: Reordenación de tools/deploy-cdmon.mjs asegurando que todo el código JS, CSS y PHP se transfiera antes de actualizar index.html y sw.js, erradicando desincronizaciones en actualizaciones en caliente.",
        "Service Worker Network-First: Actualización de sw.js a estrategia de Red Primero con respaldo en caché, garantizando que el navegador siempre cargue la última versión sin requerir limpiezas manuales de datos.",
        "Validación Estricta de Informe Técnico Preliminar: Exigencia combinada de estado DELIVERED_TO_TEACHER y enlace Drive válido (driveUrl) para el desbloqueo de la Licencia de Vuelo AESA (DOC_14), evitando inconsistencias en empresas preexistentes.",
        "Purga de Caché v1.1.59: Registro de nuevo scope de caché para asegurar que todos los clientes reciban de inmediato los bloqueos temporales de notas de prensa y licencias de vuelo."
      ],
      highlights: [
        { type: "DEPLOY", text: "Despliegue atómico con subida de index.html y sw.js al final del pipeline." },
        { type: "SERVICE WORKER", text: "Estrategia Network-First con sincronización en tiempo real." },
        { type: "ROBUSTEZ", text: "Verificación de enlace Drive en entregables para desbloqueo de Licencia AESA." }
      ]
    },
    {
      version: "1.1.58",
      date: new Date().toISOString().split('T')[0],
      title: "Bloqueo Temporal de Notas de Prensa hasta Cierre de Fase y Habilitación de Licencia AESA por Informe Preliminar",
      items: [
        "Bloqueo Temporal de Notas de Prensa (DOC_15): Las notas de prensa corporativas del CEO permanecen bloqueadas e inaccesibles hasta la fecha oficial de cierre de cada fase (15/12 para Fase I, 15/02 para Fase II, 31/03 para Fase III y 23/04 para Fase IV), disponiendo de 7 días de cortesía para su redacción y publicación.",
        "Habilitación Condicionada de Licencia de Vuelo AESA (DOC_14): El trámite y pago de la tasa administrativa de 50 €v queda estrictamente condicionado a la entrega formal previa del 'Informe Técnico Preliminar, Boceto y Foto' (preliminaryReport) al Claustro Docente.",
        "Guía Visual en Sala de Mando del CEO: Indicador dinámico que alerta al CEO si el Informe Preliminar está pendiente de entrega por el Técnico o si se encuentra en su bandeja de visado pendiente de aprobación.",
        "Modo Sandbox Completo (TEST-0000): La empresa de pruebas y el perfil docente mantienen desbloqueadas tanto las Notas de Prensa como la Licencia AESA con distintivo visual para auditoría inmediata.",
        "Filtro de Fase IV en Tablón de Noticias: Incorporación del botón de filtro para Fase IV en el Tablón de Noticias de la Misión."
      ],
      highlights: [
        { type: "PRENSA", text: "Notas de prensa bloqueadas hasta el día de cierre oficial de cada fase." },
        { type: "AESA", text: "Licencia de vuelo vinculada a la entrega del Informe Técnico Preliminar." },
        { type: "SANDBOX", text: "Acceso total de pruebas garantizado para TEST-0000 y docentes." }
      ]
    },
    {
      version: "1.1.57",
      date: new Date().toISOString().split('T')[0],
      title: "Protección Anti-Spoilers en Contratos y Unificación Táctica de Entregables & Dossier",
      items: [
        "Ocultación Anti-Spoilers en Contratos Comerciales: Las licitaciones corporativas y las subpestañas por fase permanecen clasificadas e invisibles hasta la fecha oficial de activación de cada fase (11/11/2026 para Fase I y apertura respectiva para Fases II, III y IV).",
        "Banner Clasificado Informativo: Antes de la apertura oficial de Fase I (11/11/2026), los alumnos ven un panel táctico de seguridad indicando la fecha exacta de apertura sin revelar detalles previos.",
        "Soporte Permanente para Sandbox y Claustro: La empresa de pruebas TEST-0000 y el perfil Docente mantienen acceso completo e inmediato a las 4 fases y a los 24 contratos para auditoría y ensayos.",
        "Unificación Ergonómica de 'Entregables & Dossier': Integración del Dossier académico en la pestaña '📤 Entregables & Dossier' estructurada en 3 subpestañas tácticas ('Gestión de Entregables', 'Calificaciones & Rúbricas 100%' y 'Cronograma Oficial'), descongestionando la barra superior.",
        "Preservación de Vistas Docentes: El Claustro Docente conserva su pestaña directa 'Inspeccionar Dossiers' para auditar y calificar con comodidad las 6 clases del centro."
      ],
      highlights: [
        { type: "ANTI-SPOILER", text: "Licitaciones ocultas hasta el inicio oficial de cada fase (11/11/2026 para Fase I)." },
        { type: "SANDBOX", text: "Acceso total desbloqueado para empresa de pruebas TEST-0000 y claustro docente." },
        { type: "ERGONOMÍA", text: "Unificación de Dossier dentro de 'Entregables & Dossier' con 3 subpestañas tácticas." }
      ]
    },
    {
      version: "1.1.56",
      date: new Date().toISOString().split('T')[0],
      title: "Desbloqueo de Navegación en Contratos & Patrocinios, Restauración de Finanzas & ECO y Blindaje Ergonómico de Botones",
      items: [
        "Desbloqueo de Pestaña '🤝 Contratos & Patrocinios': Incorporación de 'contracts' a la lista blanca (roleAllowedMap) de todos los perfiles de alumno (CEO, Técnico, Finanzas, Marketing, Operaciones e IA, y Auxiliar), permitiendo la navegación fluida sin rebote.",
        "Restauración del Panel '💰 Finanzas & ECO': Subsanación de la variable isFinanzas en viewFinance(), permitiendo al departamento financiero acceder a su terminal contable y registrar los Balances de Cierre por Fase sin interrupciones.",
        "Blindaje Universal de Botones (Regla CSS Flexbox): Ajuste en las reglas globales de contención tipográfica de index.html excluyendo los botones y tabs de min-width: 0 y asignando flex-shrink: 0 por defecto, impidiendo que textos con nowrap se salgan de sus contenedores.",
        "Ergonomía Táctil en Cabeceras de Acción: Alineación con min-w-0 flex-1 y shrink-0 w-full sm:w-auto en los botones '🔧 Ir a Taller y BOM ➔', '📤 Gestionar en Mis Entregables ➔', '📡 Seguimiento Completo de Órdenes ↗', '+ Solicitar Material I+D', '+ Registrar Nueva Acta' y 'Ver Mis Entregables ➔'.",
        "Ampliación del Tablón de Noticias a 6 Clases (A-F y TEST): Inclusión de todas las cohortes del centro y armonización del contador de notas de prensa oficiales publicadas."
      ],
      highlights: [
        { type: "CONTRATOS", text: "Navegación directa y fluida a la pestaña de Contratos & Patrocinios para todos los roles." },
        { type: "FINANZAS", text: "Acceso inmediato al panel Finanzas & ECO y balances por fase restaurado." },
        { type: "UI/UX", text: "Eliminado el desbordamiento de texto en botones con blindaje flexbox universal." }
      ]
    },
    {
      version: "1.1.55",
      date: new Date().toISOString().split('T')[0],
      title: "Módulo Oficial de Contratos Comerciales y Misiones del CEO, Empresa Maestra Sandbox y Liquidación Docente en Ledger",
      items: [
        "Catálogo Oficial de 24 Contratos Comerciales (Fases I a IV): 6 licitaciones estratégicas por fase emitidas por corporaciones aeroespaciales y medios internacionales (Siemens Energy, PLD Space, Airbus, Microsoft Azure, Financial Times, Hispasat, GMV, DJI, SAP, Dassault, MIT Tech Review, Aernnova, BBVA Spark, Wallapop PRO, Wayra, Meta/Google, WSJ, BASF, KPMG/PwC, Kibo Ventures, AWS, Apple y NYT).",
        "Ventana Oficial de Selección y Bloqueo Inmutable: ventana de 3 días lectivos por fase (Fase I abierta del 11/11 al 13/11/2026; Fases II, III y IV en los primeros 3 días de cada fase). Compromiso vinculante y congelado tras la firma del CEO.",
        "Empresa Maestra Ficticia Sandbox (TEST-0000): startup de pruebas 'MARS-X SANDBOX (PRUEBAS)' asignada a Clase TEST con contratos desbloqueados permanentemente en las 4 fases para ensayos y auditoría de tesorería sin alterar clasificaciones.",
        "Doble Visibilidad Alumnos: nueva pestaña '🤝 Contratos & Patrocinios' con visualización del Patrocinador Oficial y licitaciones (con firma exclusiva para CEO y modo consulta para resto de departamentos), además de Banner Táctico activo en Dossier y Finanzas.",
        "Panel Docente de Auditoría de Contratos: gestión integral con filtros rápidos para las 6 clases del centro (A, B, C, D, E, F y TEST) y selector de fase con dictamen tipificado 100% Zero-Text.",
        "Liquidación Automática en el Libro Mayor ([CONTRATO_COMERCIAL]): inyección inmediata de abono (+€v) por cumplimiento o cargo extraordinario (-€v) por incumplimiento, con soporte oficial de Números Rojos / Deuda Corporativa en el Balance de Situación.",
        "Soporte de Prensa Fase IV: habilitación de la Nota de Prensa oficial para el cierre de Fase IV (23/04/2027 + 7 días extra de cortesía hasta el 30/04/2027)."
      ],
      highlights: [
        { type: "CONTRATOS", text: "24 contratos corporativos oficiales con recompensas y penalizaciones automáticas." },
        { type: "SANDBOX", text: "Empresa de pruebas TEST-0000 con contratos abiertos desde el primer día." },
        { type: "DOCENTE", text: "Auditoría en 1 clic para 6 clases (A-F y TEST) con liquidación en Ledger." },
        { type: "FINANZAS", text: "Contabilidad de Deuda Corporativa y números rojos ante penalizaciones." }
      ]
    },
    {
      version: "1.1.54",
      date: new Date().toISOString().split('T')[0],
      title: "Actas de Dirección Zero-Text, Balances Contables por Fase, Cortesía de 7 Días en Prensa y Fix Visual en Modificación Estatutaria",
      items: [
        "Blindaje Zero-Text en Actas de Comité de Dirección (DOC_16): erradicación total de cajas de texto libre en Gobernanza, reemplazándolas por catálogo cerrado de sesiones ordinarias y extraordinarias por fase.",
        "Blindaje Zero-Text y corrección de diseño en Modificación Estatutaria: eliminación de desbordamientos de botón en pantallas medianas y móviles, canalizando la propuesta exclusivamente por plantilla oficial DOC_1 en Google Drive.",
        "Extensión del plazo para Notas de Prensa Corporativas (DOC_15): margen adicional de 7 días naturales tras el corte de cada fase (Fase I hasta 22/12/2026, Fase II hasta 22/02/2027 y Fase III hasta 07/04/2027) para sincronizar datos reales.",
        "Módulo de Balances Contables de Cierre de Fase en Finanzas: panel de supervisión y registro del balance para Fases I a IV con dictamen contable tipificado y enlace oficial DOC_17 en Google Drive.",
        "Integración de telemetría financiera en la Sala de Mando del CEO: visibilidad inmediata del balance emitido por Finanzas al preparar la nota de prensa de cada fase."
      ],
      highlights: [
        { type: "ZERO-TEXT", text: "Actas de Comité con selector tipificado de sesiones cerradas y enlace oficial Drive." },
        { type: "UI/UX", text: "Diseño responsive corregido en Modificación Estatutaria sin desbordamiento de botón." },
        { type: "PRENSA", text: "Ventana de 7 días de cortesía tras cada cierre de fase para redacción corporativa." },
        { type: "FINANZAS", text: "Balances Contables de Cierre (DOC_17) para Fases I a IV con dictámenes tipificados." }
      ]
    },
    {
      version: "1.1.53",
      date: new Date().toISOString().split('T')[0],
      title: "Traspaso de Matemáticas a Operaciones, Circuito I+D con Visado CEO, Licencia AESA Gatekeeper, Tablón de Noticias y Modificación Estatutaria",
      items: [
        "Reasignación curricular oficial de los 4 entregables de Matemáticas (Goniómetro, Distancia Fija, 2 Puntos y Comparativo Final) al departamento de Operaciones e IA (OPERACIONES_IA).",
        "Circuito de Solicitudes Especiales de Material I+D: las peticiones fuera de catálogo del Técnico son revisadas y visadas por el CEO antes de elevarse a Coordinación Docente con notificación automática.",
        "Unificación ergonómica a botón único de acceso a plantillas de Google Docs en formato /copy directo, eliminando botones redundantes de clonación.",
        "Gatekeeper funcional de Licencia de Lanzamiento AESA (DOC_14): bloqueo preventivo de ensayos en el Banco de Pruebas de Fase II hasta su tramitación por el CEO (tasa de 50 €v) y validación por Claustro Docente.",
        "Notas de Prensa Corporativas de Cierre de Fase (DOC_15) con fechas de corte y estructura obligatoria, y despliegue del nuevo Tablón de Noticias con filtros por clase y fase.",
        "Diario de Reuniones de Departamento // Actas de Comité de Dirección (DOC_16) integrado en Gobernanza para registro recurrente de acuerdos.",
        "Modificación Estatutaria de Razón Social en Gobernanza: trámite exclusivo para CEO con justificación estratégica tipificada y cargo inmediato de tasa mercantil de 50 €v en el Libro Mayor.",
        "Actualización integral del Protocolo de Privacidad y Blindaje RGPD (Art. 13 RGPD / Art. 7 LOPDGDD para menores en entornos educativos, Zero-PII, Zero-Text libre y sin cookies de rastreo)."
      ],
      highlights: [
        { type: "MATEMÁTICAS", text: "Traspaso curricular de los 4 hitos de Matemáticas a Operaciones e IA." },
        { type: "I+D // CEO", text: "Visado previo del CEO para materiales fuera de catálogo antes de Coordinación." },
        { type: "AESA", text: "Gatekeeper de Licencia de Vuelo DOC_14 con tasa de 50 €v y validación docente." },
        { type: "PRENSA", text: "Tablón Oficial de Noticias con notas de prensa corporativas de corte de fase." },
        { type: "GOBERNANZA", text: "Modificación Estatutaria con tasa mercantil de 50 €v y Actas de Comité DOC_16." },
        { type: "RGPD", text: "Blindaje de privacidad escolar por capas, Zero-PII y Cero Cookies." }
      ]
    },
    {
      version: "1.1.52",
      date: new Date().toISOString().split('T')[0],
      title: "Píldoras de Categoría en Catálogo B2C, HUD Móvil Compacto, Empty States Tácticos, Contador en Archivo Docente y Guía 'Misión en 3 Minutos'",
      items: [
        "Barra de píldoras táctiles por categoría en el Catálogo Aeroespacial (B2C) con recuento dinámico de artículos por sección (Todas, Propulsión, Reactivos, Estructura, etc.) y filtrado inmediato.",
        "Telemetría compacta del HUD en dispositivos móviles: indicador de estado D1 optimizado con orbe pulsante que preserva el espacio horizontal y evita saltos de línea con el saldo en €v.",
        "Estados vacíos (Empty States) tácticos y guiados en Banco de Pruebas I+D y Bóveda de Órdenes, eliminando pantallas muertas e indicando al alumno qué acción realizar.",
        "Filtro rápido 'Solo Incompletos' y contador global de entregables recibidos en el Archivo Documental Central de Coordinación Docente.",
        "Rediseño pedagógico de la Guía de Roles por @guide-simplifier: 'Misión en 3 Minutos' con checklist de entrada, tarjeta de dependencias en equipo y acceso directo a plantillas Google Docs."
      ],
      highlights: [
        { type: "CATÁLOGO", text: "Barra deslizante de píldoras de categoría con recuento de piezas para filtrado en un clic." },
        { type: "MÓVIL", text: "HUD ultra-compacto con orbe de telemetría D1 para pantallas estrechas." },
        { type: "DOCENTE", text: "Archivo Documental con contador de entregables y filtro rápido de empresas pendientes." },
        { type: "GUÍA", text: "Estructura 'Misión en 3 Minutos', mapa de equipo y enlaces a plantillas Google Docs." }
      ]
    },
    {
      version: "1.1.51",
      date: new Date().toISOString().split('T')[0],
      title: "Plantillas Integradas en Entregables, Bandeja de Visado CEO, Banco I+D con Solicitud Oficial, Llavero Maestro Filtrable y 5 Fases Oficiales",
      items: [
        "Acceso directo y dual a plantillas de entregables (Ver Plantilla y Hacer Copia en Google Drive) para todos los roles, con persistencia y sincronización garantizada para el profesorado.",
        "Reordenación de navegación del Técnico: apertura directa en SUPER-MARSKET, seguido de Taller, Seguimiento de Órdenes, Banco I+D, Trámites, Mis Entregables y Dossier.",
        "Solicitud de material I+D trasladada al Banco de I+D con plantilla oficial para clonar (DOC_13) y circuito de resolución con Google Doc de dictamen docente.",
        "Bandeja de Visado Ejecutivo en la Sala de Mando del CEO con circuito de aprobación y devolución justificada con observaciones en Google Drive.",
        "Filtro rápido por clases (Clase A, Clase B, Todas) en el Llavero Maestro y panel de control de 30 empresas con scroll optimizado.",
        "Purga persistente de buzón y notificaciones mediante registro de eliminados (tombstones) que previene la reaparición tras la sincronización con la nube.",
        "Actualización oficial de las 5 Fases del proyecto, fechas de inicio y entrega de los 18 entregables curriculares y cierre con el Concurso Final (Fase V)."
      ],
      highlights: [
        { type: "ENTREGABLES", text: "Botones duales de plantilla oficial y clonación inmediata en Google Drive para todos los roles." },
        { type: "TÉCNICO", text: "Nueva secuencia ergonómica de pestañas con SUPER-MARSKET en primer lugar y Banco de I+D potenciado." },
        { type: "CEO", text: "Bandeja de Visado Ejecutivo en Sala de Mando con flujo de devolución documentado." },
        { type: "DOCENTE", text: "Llavero Maestro con selector por clase para gestión fluida de 30 empresas y purga real de buzón." },
        { type: "FASES", text: "Estructura oficial de 5 Fases con Concurso Final el 19/05/2027 y fechas calibradas de los 18 entregables." }
      ]
    },
    {
      version: "1.1.50",
      date: new Date().toISOString().split('T')[0],
      title: "Cronograma Integrado en Dossier, Pestaña Fija SUPER-MARSKET para Técnico y Aterrizaje Coherente por Rol",
      items: [
        "Nueva sub-pestaña '📅 Cronograma' en '📋 Dossier': reúne la hoja de ruta curricular completa al nivel de Evaluación Continua y Bóveda de Entregables, ordenada por Fases I a IV con insignias visibles.",
        "Despeje integral de '📡 Seguimiento de Órdenes': retirada del acordeón de cronograma para centrar la vista en KPIs de operaciones y trazabilidad de pedidos.",
        "Botón de navegación permanente '🛒 SUPER-MARSKET' para el rol Técnico: acceso garantizado tanto al Catálogo Oficial (B2C) como al Mercado Secundario (B2B).",
        "Globo interactivo de carrito pendiente ('badge-market'): alerta en tiempo real en la barra de navegación del Técnico cuando tiene componentes en el carrito pendientes de cursar.",
        "Aterrizaje coherente al iniciar sesión: cada rol entra de forma natural a su primera pestaña departamental de la izquierda (CEO a Sala de Mando, Finanzas a Finanzas & ECO, Técnico a Banco I+D, etc.)."
      ],
      highlights: [
        { type: "DOSSIER", text: "3ª sub-pestaña '📅 Cronograma' con insignias y ordenación por Fases I a IV." },
        { type: "ÓRDENES", text: "Vista '📡 Seguimiento de Órdenes' optimizada y directa para máxima claridad operativa." },
        { type: "TÉCNICO", text: "Botón permanente '🛒 SUPER-MARSKET' con globo de aviso de artículos en carrito." },
        { type: "ACCESIBILIDAD", text: "Aterrizaje al login unificado en el primer botón departamental para todos los roles." }
      ]
    },
    {
      version: "1.1.49",
      date: new Date().toISOString().split('T')[0],
      title: "Asignación Dinámica de Fases en Cronograma Maestro, Dossier Reorganizado al Cierre y Blindaje de Costes Reales",
      items: [
        "Modal selector de fase curricular en cada hito del Cronograma Maestro de Coordinación: botón táctil interactivo para reasignar dinámicamente entregables entre las Fases I, II, III y IV con sincronización en la nube.",
        "Erradicación definitiva de referencias a meses de calendario en Dossier, Mis Entregables y Cronograma Maestro, sustituyéndolas por una organización pedagógica 100% basada en Fases curriculares.",
        "Agrupación y ordenación dinámica por Fase asignada en todas las vistas corporativas (Dossier Académico y Mis Entregables) y docentes.",
        "Renombrado oficial del botón de navegación a '📋 Dossier' y reubicación al último lugar en la barra de pestañas para todos los roles departamentales (tras Mis Entregables).",
        "Retirada del Coste Real Físico (€) en las vistas de los alumnos (Finanzas, Seguimiento de Órdenes, Banco I+D y panel de inspección), preservando la concentración formativa en la tesorería virtual (€v).",
        "Modal interactivo de auditoría de compras físicas (ui.modalRealSpend) en el Panel Docente: acceso con un clic en la columna 'Físico(€)' al desglose de componentes, comercios, importes y tickets vinculados a Google Drive.",
        "Notificaciones financieras limpias: las ejecuciones de taller notifican a Finanzas exclusivamente el descuento del importe virtual en el Libro Mayor."
      ],
      highlights: [
        { type: "CRONOGRAMA", text: "Asignación táctil y dinámica de Fase (I a IV) en cada entregable del Cronograma Maestro." },
        { type: "PEDAGOGÍA", text: "Eliminación de meses de calendario y ordenación dinámica por fases curriculares." },
        { type: "NAVEGACIÓN", text: "Botón '📋 Dossier' reubicado al final de la barra de herramientas para todos los roles." },
        { type: "FINANZAS", text: "Costes reales físicos (€) reservados exclusivamente a auditoría docente vía modal de compras." }
      ]
    },
    {
      version: "1.1.48",
      date: new Date().toISOString().split('T')[0],
      title: "Arquitectura Departamental de 5 Botones, Pestaña Universal de Seguimiento de Órdenes, Control de Fases y UX Guiada de Entregables",
      items: [
        "Nueva barra de navegación por rol estructurada en 5 botones (6 para Técnico): accesos directos y fluidos para CEO (Sala de Mando), Técnico (Banco I+D y Taller), Finanzas, Operaciones IA, Marketing y Auxiliar.",
        "Descongestión integral de módulos: eliminación de bloques de entregables incrustados en Banco I+D, Finanzas, Bitácora IA y Marca, centralizándolos en 'Mis Entregables'.",
        "Pestaña universal 'Seguimiento de Órdenes' accesible a todos los roles, con 3 vistas unificadas (En Proceso, Completadas, Denegadas), permisos de aprobación para CEO y Finanzas y modo seguimiento para los demás.",
        "Ergonomía UX guiada en 'Mis Entregables': resumen superior con contadores, filtros por Fase (I a IV) y Estado, Stepper visual interactivo de 4 pasos por entregable y banners destacados de correcciones con enlace Drive.",
        "Control Rápido de Fases (I-IV) en el Cronograma Maestro del Panel Docente con desbloqueo y bloqueo en un clic, y reorganización dinámica del Dossier en 4 fases curriculares.",
        "Blindaje de Hoja de Taller (DOC_10): soporte oficial de CEO_REVISION, preservación de enlaces de devolución y corrección en Drive, y reenvío técnico continuo.",
        "Telemetría atómica por rol en SQLite y D1, fusión Math.max de sesiones y soporte para AUXILIAR en la matriz de conexiones del Claustro Docente.",
        "Globos inteligentes (badges) en la barra de navegación para Mis Entregables, Taller y Seguimiento de Órdenes."
      ],
      highlights: [
        { type: "ARQUITECTURA", text: "Navegación limpia y descongestionada: 5 botones por rol (6 para Técnico) y Seguimiento de Órdenes universal." },
        { type: "PEDAGOGÍA", text: "Fases I a IV: control docente centralizado del cronograma y visualización curricular por fases en Dossier y Entregables." },
        { type: "ERGONOMÍA", text: "Stepper visual de 4 pasos y banner de correcciones en 'Mis Entregables' para máxima claridad del alumno." },
        { type: "TELEMETRÍA", text: "Registro atómico en base de datos de inicios de sesión departamentales incluyendo AUXILIAR." }
      ]
    },
    {
      version: "1.1.47",
      date: new Date().toISOString().split('T')[0],
      title: "Habilitación Universal de Declaración de IA y Modal Oficial para Todos los Roles Departamentales",
      items: [
        "Apertura directa del modal oficial de Declaración de IA desde el botón de cabecera [ 🤖 IA ] para todos los roles (CEO, Técnico, Finanzas, Marketing, Operaciones y Auxiliar).",
        "Enlace automático con la plantilla oficial Google Docs DOC_4_BITACORA_IA y selector tipificado de proveedores de IA autorizados.",
        "Validación estricta de enlace Google Docs/Drive con permisos de lectura compartidos antes de registrar el prompt.",
        "Enrutamiento contextual del flujo: auto-aprobación inmediata para Operaciones e IA, y envío con notificación y estado pendiente para el resto de departamentos.",
        "Alineación visual del modal con la estética Cyberpunk oficial de MARS-KET OS y target táctil >= 44px."
      ],
      highlights: [
        { type: "CRÍTICO", text: "Acceso Universal a IA: todos los miembros de la empresa pueden declarar prompts y bitácoras de IA sin bloqueos de navegación." },
        { type: "DOCS", text: "Plantilla Oficial DOC_4: acceso directo al modelo de Google Docs con copia guiada." },
        { type: "TRAZABILIDAD", text: "Validación Ética: Operaciones e IA recibe alertas y visados pendientes en su panel de Bitácora." }
      ]
    },
    {
      version: "1.1.46",
      date: new Date().toISOString().split('T')[0],
      title: "Blindaje Atómico de Códigos de Empresa y PINs en CDMON, Saneamiento de Caché HTTP y Sincronización Llavero Maestro",
      items: [
        "Inmutabilidad absoluta de Códigos de Empresa y PINs departamentales modificados por Coordinación: eliminación de mutaciones por reconciliación o migración local.",
        "Auto-reparación determinista y persistente en SQLite de Códigos y PINs en /api/admin/credentials, con supresión de falsos positivos 'PROTECTED'.",
        "Control optimista estricto con versionado ETag sincronizado para evitar sobreescritura por sondeo reactivo de fondo.",
        "Corrección de pestaña activa en renderAdminStartups y pre-declaración de banderas de hidratación en Object.seal(state).",
        "Invalidación completa de Service Worker y caché HTTP de Apache (.htaccess) para garantizar ejecución de scripts actualizados en producción."
      ],
      highlights: [
        { type: "CRÍTICO", text: "Estabilidad Total en Aula: códigos de empresa y PINs no vuelven a mutar tras la asignación por Coordinación." },
        { type: "PERSISTENCIA", text: "Sincronización Bidireccional SQLite: credenciales respaldadas atómicamente en el backend CDMON." },
        { type: "CACHE_BUSTER", text: "Cero Caché Obsoleta: actualización transparente y obligatoria de scripts del cliente y Service Worker." }
      ]
    },
    {
      version: "1.1.45",
      date: new Date().toISOString().split('T')[0],
      title: "Blindaje Definitivo de Códigos de Empresa, PINs Departamentales y Sincronización Llavero Maestro",
      items: [
        "Erradicación de la generación aleatoria de Códigos de Empresa y PINs en migraciones locales: las credenciales asignadas son estables y permanentes.",
        "Sincronización bidireccional prioritaria del Llavero Maestro con el almacenamiento atómico D1/SQLite para roles de Coordinación (COORD_*).",
        "Unificación de claves de cifrado y aislamiento de particiones entre la tabla de estado global y company_state.",
        "Preservación inmutable de credenciales en exportación de carnets físicos de aula (PDF) y descarga de llavero CSV."
      ],
      highlights: [
        { type: "CRÍTICO", text: "Blindaje de Códigos de Empresa: estabilidad total en códigos de acceso para alumnos de secundaria sin mutaciones aleatorias." },
        { type: "SEGURIDAD", text: "Sincronización Segura D1: hidratación inmediata de credenciales para Coordinación Docente preservando Zero-Trust para alumnos." },
        { type: "CONCURRENCIA", text: "Protección de Particiones: las acciones de aula de los alumnos no pueden sobrescribir credenciales modificadas por el Claustro." }
      ]
    },
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