import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE CONFIRMACIÓN · US-16 a US-19.
 * Un pedido completo son varios pasos: aquí se escribe una sola vez, en TiendaPage.comprar() (Page Object).
 * Cada prueba arranca con el navegador limpio (carrito vacío, sin memoria de la anterior).
 */

test.describe('US-16 · Que mis datos no queden a la vista de otra persona', () => {
  test('CA1: tras confirmar y empezar otra compra, el formulario aparece vacío', async ({ page }) => {
    test.fail(true, 'JIRA-XX · el formulario de envío conserva los datos del comprador anterior');
    // ARRANGE: una compra completa
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');

    // ACT: empezar otra compra
    await tienda.volverALaTienda();
    await tienda.agregar('Cuaderno universitario');
    await tienda.irAPagar();

    // ASSERT
    await expect(tienda.campo('Nombre completo')).toHaveValue('');
    await expect(tienda.campo('Correo electrónico')).toHaveValue('');
    await expect(tienda.campo('Dirección de entrega')).toHaveValue('');
  });
});

test.describe('US-17 · Confirmar mi pedido', () => {
  test('CA1: con datos válidos veo "¡Pedido confirmado!" y un número de pedido', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();

    await tienda.comprar('Esfero azul');

    await expect(tienda.pedidoConfirmado()).toBeVisible();
    await expect(page.getByText(/Número de pedido:/)).toHaveText(/#\d+/);
  });

  test('CA2: un segundo pedido (sin recargar) tiene otro número', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');
    const primero = await tienda.numeroDePedido();

    await tienda.volverALaTienda();
    await tienda.comprar('Esfero azul');
    const segundo = await tienda.numeroDePedido();

    expect(primero).not.toBe('');
    expect(segundo).not.toBe(primero);
  });

  // Predicción antes de ejecutar: fallará, porque el contador de pedidos vive en memoria y se reinicia al recargar.
  test('CA3: un pedido hecho después de recargar la página no repite un número anterior', async ({ page }) => {
    test.fail(true, 'JIRA-XX · el número de pedido se repite después de recargar la página');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');
    const primero = await tienda.numeroDePedido();

    await page.reload();
    await tienda.comprar('Esfero azul');
    const segundo = await tienda.numeroDePedido();

    expect(primero).not.toBe('');
    expect(segundo).not.toBe(primero);
  });
});

test.describe('US-19 · Empezar una compra nueva con el carrito limpio', () => {
  test('CA1: tras confirmar, el carrito está vacío y el contador marca 0', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');

    await tienda.volverALaTienda();

    await expect(tienda.carrito).toContainText('Tu carrito está vacío.');
    await expect(tienda.contador()).toContainText('0 artículo(s)');
  });
});
