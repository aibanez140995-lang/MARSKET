// tests/unit/state.test.js
import { describe, it, expect } from 'vitest';
// Importamos el módulo gracias al export condicional que añadimos
const { state } = require('../../js/state.js'); 

describe('State Migration Engine (state.migrate)', () => {
    it('debe migrar una estructura antigua a la v1.0.05 sin pérdida de datos', () => {
        // Mock de datos de una versión anterior
        const oldData = {
            config: { teachers: {} },
            companies: {
                astra: {
                    name: "Astra Dynamics",
                    balance: 1500,
                    // Estructura de roles antigua
                    roles: { CEO: '1111', QUIMICA: '2222', FINANZAS: '3333', MARKETING: '4444', IA: '5555' },
                    loginStats: { roles: { QUIMICA: { count: 1 } } }
                    // Faltan classGroup, deliverables, etc.
                }
            }
        };

        // Ejecutamos la migración
        const migrated = state.migrate(oldData);
        const astra = migrated.companies.astra;

        // 1. Verificamos que se han añadido las nuevas propiedades por defecto
        expect(astra.classGroup).toBe('A');
        expect(astra.deliverables).toBeDefined();
        expect(astra.deliverables.technicalReport).toBeNull();
        expect(astra.flightTests).toEqual([]);

        // 2. Verificamos el remapeo crítico de roles (QUIMICA -> TECNICO, IA -> OPERACIONES_IA)
        expect(astra.roles.TECNICO).toBe('2222');
        expect(astra.roles.OPERACIONES_IA).toBe('5555');
        expect(astra.roles.QUIMICA).toBeUndefined(); // El rol antiguo ya no debe usarse

        // 3. Verificamos que las estadísticas de login también se hayan migrado
        expect(astra.loginStats.roles.TECNICO.count).toBe(1);
    });
});