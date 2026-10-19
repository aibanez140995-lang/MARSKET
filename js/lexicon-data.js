// js/lexicon-data.js
// --- DICCIONARIOS Y CONFIGURACIÓN LÉXICA LOPD / ANTI-IMPROPIOS (v1.0.19) ---

const LEXICON_HOMOGLYPHS = {
    // Cirílico confusable reducido -> latino
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x', 
    'к': 'k', 'м': 'm', 'н': 'h', 'т': 't', 'в': 'b', 'і': 'i', 'ј': 'j', 
    'ѕ': 's', 'ё': 'e', 'п': 'n',
    // Griego confusable reducido -> latino
    'ο': 'o', 'α': 'a', 'ν': 'v', 'ρ': 'p', 'ι': 'i', 'κ': 'k', 'τ': 't', 
    'υ': 'u', 'χ': 'x', 'β': 'b'
};

const LEXICON_SAFE_WORDS = [
    'calculo', 'vehiculo', 'obstaculo', 'espectaculo', 'computo', 'computadora', 
    'disputa', 'penetracion', 'metal exterior', 'asombro', 'dispuesto'
];

const SCIENTIFIC_EPONYMS = [
    'newton', 'kepler', 'hubble', 'gagarin', 'armstrong', 'tsiolkovsky', 'goddard', 
    'bernoulli', 'reynolds', 'hooke', 'coriolis', 'kennedy', 'johnson', 'curie', 
    'einstein', 'hawking', 'galileo', 'copernico', 'brahe', 'sagan', 'huygens', 
    'cassini', 'planck', 'faraday', 'tesla', 'maxwell', 'bohr', 'fermi'
];
