// tests/e2e/circuit.spec.js
import { test, expect } from '@playwright/test';

test.describe('Circuito Crítico: I+D a Finanzas', () => {
    
    test('El Técnico debe poder añadir propulsante y transmitir la orden a Finanzas', async ({ page }) => {
        // 1. Interceptar los alerts nativos de la app y aceptarlos automáticamente
        page.on('dialog', dialog => dialog.accept());

        await page.goto('/');

        // 2. Proceso de Login (Astra Dynamics - Técnico)
        await page.locator('#login-co').selectOption('astra');
        await page.locator('#login-role').selectOption('TECNICO');
        
        // El PIN por defecto de Astra en INITIAL_DATA es 1111
        await page.locator('button', { hasText: '1' }).click();
        await page.locator('button', { hasText: '1' }).click();
        await page.locator('button', { hasText: '1' }).click();
        await page.locator('button', { hasText: '1' }).click();
        await page.locator('button', { hasText: 'ENT' }).click();

        // 3. Verificar que entramos al HUD
        await expect(page.locator('#hud-header')).toBeVisible();

        // 4. Navegar al SUPERMARS-KET
        await page.locator('button.nav-tab', { hasText: 'SUPERMARS-KET' }).click();

        // 5. Añadir Bicarbonato (P01) al carrito (botón de +10g)
        // Buscamos el contenedor del Bicarbonato y hacemos clic en +10g
        const itemCard = page.locator('.terminal-border', { hasText: 'Bicarbonato de Sodio' });
        await itemCard.locator('button', { hasText: '+10g' }).click();

        // 6. Abrir modal de transmisión a finanzas
        await page.locator('button', { hasText: '[ REVISAR Y ENVIAR A FINANZAS ]' }).click();
        
        // 7. Rellenar justificación técnica (obligatoria)
        await page.locator('#tech-order-just').fill('Requerido para la prueba de vuelo estequiométrica #1');
        
        // 8. Transmitir la orden
        await page.locator('button', { hasText: 'Transmitir a Finanzas' }).click();

        // 9. Navegar a Órdenes I+D para verificar el estado
        await page.locator('button.nav-tab', { hasText: 'Órdenes I+D' }).click();

        // 10. Validar que la orden aparece con el estado correcto en la UI
        const orderCard = page.locator('.terminal-border', { hasText: '[STATUS: PENDIENTE_FINANZAS]' }).first();
        await expect(orderCard).toBeVisible();
        await expect(orderCard).toContainText('Requerido para la prueba de vuelo estequiométrica #1');

        // 11. (Opcional pero recomendado) Validar la persistencia en localStorage
        const localStorageData = await page.evaluate(() => window.localStorage.getItem('marsket_v10_PWA'));
        const state = JSON.parse(localStorageData);
        const latestOrder = state.companies.astra.orders[0];
        
        expect(latestOrder.status).toBe('PENDIENTE_FINANZAS');
        expect(latestOrder.items[0].id).toBe('P01');
        expect(latestOrder.items[0].qty).toBe(10);
    });
});