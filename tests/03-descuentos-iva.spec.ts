import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE DESCUENTOS E IMPUESTOS · US-09 a US-12.
 * Valores útiles (producto: Mochila escolar, $ 65.000): DESC10 → descuento $ 6.500 · DESC20 → $ 13.000.
 */

/** Formatea un número como la tienda (oráculo: el valor esperado se calcula aquí, no se copia de la pantalla). */
const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

test.describe('US-09 · Aplicar un código de descuento', () => {
  // Migrada al Page Object (Parte 5).
  test('CA1: DESC10 descuenta el 10% del subtotal', async ({ page }) => {
    // ARRANGE
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');

    // ACT
    await tienda.aplicarCodigo('DESC10');

    // ASSERT
    await expect(tienda.total('Descuento')).toContainText('$ 6.500');
  });

  // PRUEBAS DIRIGIDAS POR DATOS (Parte 4a): una prueba por variante. Solo fallan las que traen bug.
  const VARIANTES = [
    { codigo: 'desc10', bug: 'JIRA-XX · el código de descuento distingue mayúsculas y minúsculas' },
    { codigo: 'Desc10', bug: 'JIRA-XX · el código de descuento distingue mayúsculas y minúsculas' },
    { codigo: ' DESC10 ', bug: '' },
  ];
  for (const { codigo, bug } of VARIANTES) {
    test(`CA3: el código "${codigo}" se reconoce igual que DESC10`, async ({ page }) => {
      test.fail(bug !== '', bug);
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Mochila escolar');

      await tienda.aplicarCodigo(codigo);

      await expect(tienda.total('Descuento')).toContainText('$ 6.500');
    });
  }
});

test.describe('US-10 · Recibir aviso si el código no es válido', () => {
  // Migrada al Page Object (Parte 5).
  test('CA1: un código inexistente muestra el aviso y el total no cambia', async ({ page }) => {
    // ARRANGE: 1 mochila → total $ 77.350
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await expect(tienda.total('Total')).toHaveText('$ 77.350');

    // ACT
    await tienda.aplicarCodigo('ABC123');

    // ASSERT
    await expect(tienda.carrito.getByText('Código de descuento no válido.', { exact: true })).toBeVisible();
    await expect(tienda.total('Total')).toHaveText('$ 77.350');
  });

  test('CA2: un código inválido NO borra un descuento válido ya aplicado', async ({ page }) => {
    test.fail(true, 'JIRA-XX · un código inválido borra el descuento válido ya aplicado');
    // ARRANGE: DESC10 aplicado y comprobado
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');
    await expect(tienda.total('Descuento')).toContainText('$ 6.500');

    // ACT
    await tienda.aplicarCodigo('ABC123');

    // ASSERT: el descuento se mantiene
    await expect(tienda.total('Descuento')).toContainText('$ 6.500');
  });
});

test.describe('US-11 · Ver el IVA correcto', () => {
  test('CA2: con descuento, el IVA se calcula sobre el valor descontado', async ({ page }) => {
    test.fail(true, 'JIRA-XX · el IVA se calcula sobre el subtotal sin descontar');
    // ORÁCULO: el esperado sale del requisito (IVA = 19% de (subtotal − descuento)), no de la pantalla.
    const subtotal = 65000;
    const descuento = subtotal * 0.1;
    const ivaEsperado = (subtotal - descuento) * 0.19; // 11.115

    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');
    await expect(tienda.total('Descuento')).toContainText(cop(descuento));

    await expect(tienda.total('IVA')).toHaveText(cop(ivaEsperado));
  });
});

test.describe('US-12 · Ver el total a pagar correcto', () => {
  test('CA2: con descuento, el total es subtotal − descuento + IVA (IVA sobre lo descontado)', async ({ page }) => {
    test.fail(true, 'JIRA-XX · el IVA se calcula sobre el subtotal sin descontar (el total sale mayor)');
    const subtotal = 65000;
    const descuento = subtotal * 0.1;
    const iva = (subtotal - descuento) * 0.19;
    const totalEsperado = subtotal - descuento + iva; // 69.615

    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');
    await expect(tienda.total('Descuento')).toContainText(cop(descuento));

    await expect(tienda.total('Total')).toHaveText(cop(totalEsperado));
  });
});
