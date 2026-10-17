import { test, expect } from '@playwright/test';

/**
 * PRUEBAS HEREDADAS (Parte 4).
 *
 * Las dejó otro equipo, y nadie sabe por qué fallan: están en CUARENTENA (test.fixme), que es lo que hacen los
 * equipos reales con pruebas rojas que no entienden, para no frenar a los demás.
 *
 * Su trabajo, una por una:
 *   1. Saquen la prueba de cuarentena (borren su línea test.fixme) y ejecútenla.
 *   2. Diagnostiquen QUÉ falla: ¿el PRODUCTO (bug), la PRUEBA (defecto de la prueba), la INESTABILIDAD o el ENTORNO?
 *      Para detectar inestabilidad ejecútenla muchas veces:  npx playwright test heredados -g H3 --repeat-each=10
 *   3. Dejen cada una en su estado correcto y anoten el veredicto en ENTREGA.md.
 * No las "arreglen" a ciegas: un rojo no siempre es un bug.
 */

// VEREDICTO H1: DEFECTO DE LA PRUEBA. Expected 6 / Received 8. A mano la tienda muestra 8 productos y el criterio
// US-01 · CA1 exige 8: el dato de la prueba estaba viejo. Se corrigió el dato (y el título).
test('H1 · el catálogo tiene 8 productos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(8);
});

// VEREDICTO H2: BUG DEL PRODUCTO. Oráculo: 2 × 65.000 = 130.000 − 20% (26.000) = 104.000 × 19% = 19.760.
// La tienda muestra $ 24.700 (19% de 130.000: calcula el IVA sin restar el descuento). Se reproduce a mano y falla
// siempre igual. Es el mismo bug de US-11 · CA2. La prueba estaba bien: queda como fallo esperado.
test('H2 · el IVA de 2 mochilas con DESC20 es $ 19.760', async ({ page }) => {
  test.fail(true, 'JIRA-XX · el IVA se calcula sobre el subtotal sin descontar');
  await page.goto('/');
  const tarjeta = page
    .locator('.rounded-lg')
    .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
  await tarjeta.getByRole('spinbutton').fill('2');
  await tarjeta.getByRole('button', { name: 'Agregar' }).click();
  await page.getByPlaceholder('Código de descuento').fill('DESC20');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('dt:text-is("IVA (19%)") + dd')).toHaveText('$ 19.760');
});

// VEREDICTO H3: PRUEBA INESTABLE. Con waitUntil: 'domcontentloaded' la prueba hace clic en "Agregar" ANTES de que
// React active la página (hidratación): el botón ya se ve, pero el clic se pierde. Con la red rápida pasa; con la red
// lenta falla (simulamos red lenta: 5 de 5 fallaron). Se quitó esa opción: page.goto espera el evento "load", cuando
// los scripts de la página ya corrieron. Sin pausas fijas (waitForTimeout). Verificada con --repeat-each=30.
test('H3 · agregar un cuaderno justo después de cargar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Agregar' }).first().click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Cuaderno universitario' })).toBeVisible();
});
