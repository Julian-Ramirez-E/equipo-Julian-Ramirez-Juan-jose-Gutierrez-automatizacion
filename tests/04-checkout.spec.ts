import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE CHECKOUT · US-13 a US-15.
 *
 * Por qué page.getByLabel('Nombre completo') NO encuentra el campo: en el HTML el <label> no tiene atributo "for"
 * ni envuelve al <input>, así que no quedan asociados (tampoco para un lector de pantalla). Por eso se usa
 *     page.locator('label:text-is("Nombre completo") + input')
 * (dentro de TiendaPage.campo()).
 */

const CORREOS_VALIDOS = [
  { correo: 'juan@correo.com', bug: '' },
  { correo: 'ana_gomez@gmail.com', bug: '' },
  { correo: 'ana.gomez@gmail.com', bug: 'TD2HU-95 · el validador de correo rechaza correos válidos (".", "-", "+", subdominios)' },
  { correo: 'ana-gomez@gmail.com', bug: 'TD2HU-95 · el validador de correo rechaza correos válidos (".", "-", "+", subdominios)' },
  { correo: 'ana+tienda@gmail.com', bug: 'TD2HU-95 · el validador de correo rechaza correos válidos (".", "-", "+", subdominios)' },
  { correo: 'ana@universidad.edu.co', bug: 'TD2HU-95 · el validador de correo rechaza correos válidos (".", "-", "+", subdominios)' },
];
const CORREOS_MAL_FORMADOS = ['ana.gmail.com', 'ana@', '@gmail.com', 'ana gomez@gmail.com', 'ana@@gmail.com', 'ana@gmail'];

test.describe('US-13 · Ir a pagar desde el carrito', () => {
  test('CA3: con total cero o negativo no se puede ir a pagar', async ({ page }) => {
    test.fail(true, 'TD2HU-93 · se puede ir a pagar con total $ 0 (no se valida el total)');
    // ARRANGE: 1 mochila y "−" para llevar la cantidad a 0
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await expect(tienda.cantidad('Mochila escolar')).toHaveText('1');

    // ACT
    await tienda.disminuir('Mochila escolar');

    // ASSERT
    await expect(page.getByRole('button', { name: 'Ir a pagar' })).toBeDisabled();
  });
});

test.describe('US-14 · Completar mis datos de envío', () => {
  test('CA1: con el formulario vacío hay un error por cada campo obligatorio', async ({ page }) => {
    // ARRANGE
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await tienda.irAPagar();

    // ACT
    await tienda.confirmar();

    // ASSERT
    await expect(page.getByText('El nombre es obligatorio.')).toBeVisible();
    await expect(page.getByText('El correo es obligatorio.')).toBeVisible();
    await expect(page.getByText('La dirección es obligatoria.')).toBeVisible();
    await expect(tienda.pedidoConfirmado()).toHaveCount(0);
  });

  test('CA2: un nombre y una dirección de solo espacios se rechazan como vacíos', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await tienda.irAPagar();

    await tienda.llenarDatos({ nombre: '   ', correo: 'ana@correo.com', direccion: '   ' });
    await tienda.confirmar();

    await expect(page.getByText('El nombre es obligatorio.')).toBeVisible();
    await expect(page.getByText('La dirección es obligatoria.')).toBeVisible();
    await expect(tienda.pedidoConfirmado()).toHaveCount(0);
  });
});

test.describe('US-15 · Ingresar un correo electrónico válido', () => {
  // PRUEBAS DIRIGIDAS POR DATOS (Parte 4a): una prueba por correo. Solo las filas con bug quedan como fallo esperado.
  for (const { correo, bug } of CORREOS_VALIDOS) {
    test(`CA1-CA3: el correo válido "${correo}" se acepta`, async ({ page }) => {
      test.fail(bug !== '', bug);
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Esfero azul');
      await tienda.irAPagar();

      await tienda.llenarDatos({ nombre: 'Ana Gómez', correo, direccion: 'Calle 10 # 20-30' });
      await tienda.confirmar();

      await expect(tienda.pedidoConfirmado()).toBeVisible();
    });
  }

  for (const correo of CORREOS_MAL_FORMADOS) {
    test(`CA4: el correo mal formado "${correo}" se rechaza con un mensaje claro`, async ({ page }) => {
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Esfero azul');
      await tienda.irAPagar();

      await tienda.llenarDatos({ nombre: 'Ana Gómez', correo, direccion: 'Calle 10 # 20-30' });
      await tienda.confirmar();

      await expect(page.getByText('El correo no tiene un formato válido.')).toBeVisible();
      await expect(tienda.pedidoConfirmado()).toHaveCount(0);
    });
  }
});
