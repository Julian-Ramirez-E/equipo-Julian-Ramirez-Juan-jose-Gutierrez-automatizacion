import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE CARRITO · US-04 a US-07.
 *
 *  - "Nivel" va de 1 (fácil) a 3 (reto). "CAZABUGS" = el criterio probablemente destapa un bug de la tienda.
 *  - Las pruebas marcadas con test.fail(...) fallan por un BUG DEL PRODUCTO ya reportado en Jira (fallo esperado).
 *    El día que lo corrijan, Playwright avisará "Expected to fail, but passed": ahí se quita la anotación.
 */

test.describe('US-04 · Agregar productos sin superar el stock', () => {
  // ─────────────── EJEMPLO GUIADO (resuelto) ───────────────
  test('CA1: se pueden agregar 15 cuadernos (stock 15)', async ({ page }) => {
    // ARRANGE: abrir la tienda
    await page.goto('/');

    // ACT: ubicar la tarjeta del cuaderno, escribir 15 en su cantidad y presionar "Agregar"
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Cuaderno universitario', level: 3 }) });
    await tarjeta.getByRole('spinbutton').fill('15');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    // ASSERT: en el carrito (la tarjeta con el encabezado "Carrito") aparece el cuaderno con cantidad 15
    const carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    const linea = carrito.getByRole('listitem').filter({ hasText: 'Cuaderno universitario' });
    await expect(linea.locator('span')).toHaveText('15');
  });

  test('CA2: no deja agregar 7 mochilas de una vez (stock 6) y avisa', async ({ page }) => {
    // ARRANGE
    await page.goto('/');
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });

    // El alert() bloquea la página: el manejador se registra ANTES del clic que lo dispara.
    let aviso = '';
    page.once('dialog', async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });

    // ACT
    await tarjeta.getByRole('spinbutton').fill('7');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    // ASSERT: (1) el aviso menciona el stock y (2) el carrito sigue vacío
    await expect.poll(() => aviso).toContain('Solo hay 6 unidades');
    const carrito = page.locator('.rounded-lg').filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    await expect(carrito).toContainText('Tu carrito está vacío.');
  });

  test('CA3: 4 + 4 mochilas supera el stock (6) y debe rechazarse', async ({ page }) => {
    test.fail(true, 'JIRA-XX · agregar la misma mochila en dos tandas supera el stock');
    // ARRANGE
    await page.goto('/');
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
    // Si la tienda avisa con un alert al rechazar la segunda tanda, se acepta para que no bloquee la prueba.
    page.on('dialog', (dialogo) => dialogo.accept());

    // ACT: dos tandas de 4
    await tarjeta.getByRole('spinbutton').fill('4');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();
    await tarjeta.getByRole('spinbutton').fill('4');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    // ASSERT: lo que exige el CRITERIO (no se supera el stock: se queda en 4), no lo que la tienda hace hoy
    const carrito = page.locator('.rounded-lg').filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    const linea = carrito.getByRole('listitem').filter({ hasText: 'Mochila escolar' });
    await expect(linea.locator('span')).toHaveText('4');
  });
});

test.describe('US-05 · Aumentar la cantidad desde el carrito', () => {
  test('CA2: "+" no pasa del stock (6 mochilas)', async ({ page }) => {
    test.fail(true, 'JIRA-XX · el botón "+" del carrito permite superar el stock');
    // ARRANGE: las 6 mochilas del stock en el carrito
    await page.goto('/');
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
    await tarjeta.getByRole('spinbutton').fill('6');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();
    const carrito = page.locator('.rounded-lg').filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    const cantidad = carrito.getByRole('listitem').filter({ hasText: 'Mochila escolar' }).locator('span');
    await expect(cantidad).toHaveText('6');
    page.on('dialog', (dialogo) => dialogo.accept());

    // ACT
    await carrito.getByRole('button', { name: 'Aumentar cantidad de Mochila escolar' }).click();

    // ASSERT
    await expect(cantidad).toHaveText('6');
  });
});

test.describe('US-06 · Disminuir la cantidad desde el carrito', () => {
  // Elegimos la salida "se queda en 1" (el criterio también aceptaría que el producto se elimine).
  test('CA2: con cantidad 1, "−" no la deja en 0 ni en negativo (se queda en 1)', async ({ page }) => {
    test.fail(true, 'JIRA-XX · el botón "−" deja la cantidad en 0 y luego en negativo');
    // ARRANGE
    await page.goto('/');
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();
    const carrito = page.locator('.rounded-lg').filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    const cantidad = carrito.getByRole('listitem').filter({ hasText: 'Mochila escolar' }).locator('span');
    await expect(cantidad).toHaveText('1');

    // ACT
    await carrito.getByRole('button', { name: 'Disminuir cantidad de Mochila escolar' }).click();

    // ASSERT
    await expect(cantidad).toHaveText('1');
  });
});

test.describe('US-07 · Quitar un producto del carrito', () => {
  // Migrada al Page Object (Parte 5).
  test('CA2: quitar el único producto deja el carrito vacío y el total en $ 0', async ({ page }) => {
    // ARRANGE
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await expect(tienda.linea('Esfero azul')).toBeVisible();

    // ACT
    await tienda.eliminar('Esfero azul');

    // ASSERT
    await expect(tienda.carrito).toContainText('Tu carrito está vacío.');
    await expect(tienda.total('Total')).toHaveText('$ 0');
  });
});
