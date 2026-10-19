
# Entrega · Laboratorio 3.1 · Introducción a la automatización de pruebas

**Equipo:** `equipo-Julian-Ramirez-Juan-jose-Gutierrez` · **Integrantes:** Julián Ramírez, Juan José Gutiérrez · **Repositorio:** https://github.com/Julian-Ramirez-E/equipo-Julian-Ramirez-Juan-jose-Gutierrez-automatizacion

> Respondan aquí, en este archivo, y háganle commit. Sean breves y concretos: una frase buena vale más que un párrafo.

## 1. ¿Qué automatizamos y por qué? (decisión)

| Criterio (US-xx · CAy) | ¿Automatizamos? | Por qué (frecuencia · riesgo · estabilidad · facilidad de verificar) |
|---|---|---|
| US-04 · CA2 | Sí | Se prueba en cada versión; riesgo alto (vender lo que no hay); el aviso y el carrito vacío se verifican sin ambigüedad. |
| US-04 · CA3 | Sí | Riesgo alto de sobreventa; a mano es fácil olvidar el caso de "dos tandas"; resultado exacto (cantidad = 4). |
| US-05 · CA2 | Sí | Mismo riesgo de stock por otro camino (botón "+"); un clic y un número: muy fácil de verificar. |
| US-06 · CA2 | Sí | Una cantidad 0 o negativa rompe totales y cobro; es un valor límite que conviene vigilar siempre. |
| US-07 · CA2 | Sí | Flujo básico del carrito, se ejecuta en cada regresión; estable y rápido. |
| US-09 · CA1 / CA3 | Sí | Dinero en juego; el cálculo es exacto y las variantes (mayúsculas, espacios) se cubren con una tabla de datos. |
| US-10 · CA2 | Sí | Riesgo: el cliente pierde un descuento ya ganado; fácil de comprobar con el valor del descuento. |
| US-11 · CA2 / US-12 · CA2 | Sí | Riesgo alto (cobro e impuestos); con un oráculo calculado en la prueba la máquina verifica mejor que a ojo. |
| US-13 · CA3 | Sí | Evita cobrar $ 0; el estado del botón (deshabilitado) se verifica de forma exacta. |
| US-15 · CA1–CA4 | Sí | 12 correos: a mano es tedioso y repetitivo; ideal para pruebas dirigidas por datos. |
| US-16 · CA1 | Sí | Riesgo de privacidad; el flujo es largo (dos compras) y a mano cuesta minutos. |
| US-17 · CA3 | Sí | Números de pedido repetidos causan errores contables; con recarga incluida es difícil de notar a mano. |
| US-01 · CA4 (teléfono 375 px) | Más adelante | Se puede automatizar con un viewport, pero "se ve bien" exige además revisión visual humana. |
| US-20 (accesibilidad) | No (solo en parte) | Una herramienta como axe detecta problemas técnicos, pero la experiencia real con lector de pantalla requiere una persona. |

## 2. Bugs que nuestra suite detecta

> Reemplazar cada `JIRA-XX` (aquí y en las pruebas) por la clave real del issue en Jira, y comentar en cada issue el nombre de la prueba con una captura del reporte.

| Prueba (archivo › título) | Bug en Jira (clave) | ¿Quedó con `test.fail(...)`? | Evidencia (captura o trace) |
|---|---|---|---|
| 02-carrito › US-04 · CA3: 4 + 4 mochilas supera el stock | JIRA-XX | Sí | Expected "4" · Received "8" |
| 02-carrito › US-05 · CA2: "+" no pasa del stock | JIRA-XX | Sí | Expected "6" · Received "7" |
| 02-carrito › US-06 · CA2: "−" no la deja en 0 | JIRA-XX | Sí | Expected "1" · Received "0" |
| 03-descuentos-iva › US-09 · CA3: "desc10" y "Desc10" | JIRA-XX | Sí (solo esas 2 filas; " DESC10 " pasa) | Descuento esperado $ 6.500 · recibido $ 0 |
| 03-descuentos-iva › US-10 · CA2: código inválido no borra el descuento | JIRA-XX | Sí | Descuento esperado $ 6.500 · recibido $ 0 |
| 03-descuentos-iva › US-11 · CA2: IVA sobre lo descontado | JIRA-XX (mismo bug que US-12 · CA2 y H2) | Sí | Expected $ 11.115 · Received $ 12.350 |
| 03-descuentos-iva › US-12 · CA2: total con descuento | JIRA-XX (mismo bug que US-11 · CA2) | Sí | Expected $ 69.615 · Received $ 70.850 |
| 04-checkout › US-13 · CA3: con total cero no se puede pagar | JIRA-XX | Sí | Expected disabled · Received enabled |
| 04-checkout › US-15 · CA1–CA3: correos válidos | JIRA-XX | Sí (solo 4 de 6 filas) | No aparece "¡Pedido confirmado!" |
| 05-confirmacion › US-16 · CA1: formulario vacío en la compra siguiente | JIRA-XX | Sí | Expected "" · Received "Ana Gómez" |
| 05-confirmacion › US-17 · CA3: número de pedido tras recargar | JIRA-XX | Sí | Ambos pedidos #1001 |

**Pruebas dirigidas por datos (Parte 4a), US-15 · CA1–CA3:** fallaron 4 de 6 filas: `ana.gomez@gmail.com`, `ana-gomez@gmail.com`, `ana+tienda@gmail.com` y `ana@universidad.edu.co`. Lo que tienen en común: usan caracteres válidos distintos de letras, números y "_" (punto, guion, "+") o un dominio con más de un punto. Es **un solo bug**: el validador de correo es demasiado estricto. Los 6 correos mal formados (CA4) sí se rechazan.

**US-11 · CA2 y US-12 · CA2:** es **un solo bug** (el IVA se calcula sobre el subtotal sin restar el descuento); el total sale mal como consecuencia. Por eso va un solo issue en Jira, con las dos pruebas (y H2) en el comentario.

## 3. Pruebas heredadas: nuestro diagnóstico

| Prueba | Veredicto (producto / prueba / inestable / entorno) | Cómo lo comprobamos | Qué hicimos |
|---|---|---|---|
| H1 · el catálogo tiene 6 productos | Defecto de la prueba | Expected 6 · Received 8. A mano la tienda muestra 8 productos y US-01 · CA1 exige 8: el dato de la prueba estaba viejo. | Corregimos el dato a 8 (y el título). Pasa. |
| H2 · el IVA de 2 mochilas con DESC20… | Bug del producto | Oráculo: 130.000 − 20% = 104.000 × 19% = 19.760. La tienda muestra $ 24.700 (19% de 130.000). Se reproduce a mano y falla siempre igual. Es el mismo bug de US-11 · CA2. | La dejamos como fallo esperado con `test.fail` y la clave de Jira. |
| H3 · agregar un cuaderno justo después de cargar | Inestable | Con la red rápida pasaba 30/30 (`--repeat-each=30`); simulando red lenta falló 5 de 5. Causa: `waitUntil: 'domcontentloaded'` hace clic antes de que React active la página, y el clic se pierde. | Quitamos esa opción (`page.goto` espera el evento `load`). Sin pausas fijas. Volvió a pasar 30/30. |

## 4. Medidas

- Casos de prueba de nuestro plan en Jira: **61** (un caso por criterio de aceptación de las 20 historias) · automatizados en este laboratorio: **27** (**44 %**). Contando cada fila de las pruebas dirigidas por datos, la suite tiene **41 pruebas**.
- Tiempo que nos tomó escribir las pruebas automatizadas: **240 min** · tiempo de ejecutar toda la suite: **100 s** (41 pruebas)
- Tiempo estimado de ejecutar **a mano** esos mismos casos: **60 min** (≈ 1,5 min por prueba: abrir la tienda, armar el carrito, revisar el resultado)
- Con esos números, ¿en cuántas ejecuciones se paga la automatización? (inversión ÷ ahorro por ejecución): **240 ÷ (60 − 1,7) ≈ 4,1 → a partir de la 5.ª ejecución.** Como la suite corre sola en cada push, eso se alcanza en la primera semana.

## 5. Reflexión (máximo 5 líneas cada una)

**Parte 1 (ver pasar y ver fallar):**
- *¿Qué le pasa a la pestaña del navegador cuando termina la prueba, y por qué importa?* Se cierra y se descarta: cada prueba empieza con una pestaña nueva y limpia (sin carrito ni memoria). Importa porque así las pruebas son independientes y una no puede hacer pasar o fallar a otra.
- *¿Por qué la prueba no usa una espera fija?* Porque `expect(...)` reintenta solo hasta 5 s: espera exactamente lo necesario. Una pausa fija sería lenta cuando sobra y fallaría cuando la página tarda más.
- *¿Cómo supo la prueba que algo estaba mal?* Comparó el valor esperado (Expected: 9) con el que encontró en la página (Received: 8); al no coincidir durante los 5 s, falló y mostró el Call log.

1. **¿Qué casos de nuestro plan no automatizaríamos y por qué?**
   US-20 (uso con lector de pantalla) y la parte visual de US-01 · CA4 (teléfono de 375 px). Una herramienta detecta etiquetas faltantes o desbordes, pero juzgar si la experiencia es clara y usable necesita a una persona. Tampoco automatizaríamos casos que se ejecutan una sola vez o cuyo resultado cambia a menudo: cuesta más mantener la prueba de lo que ahorra.

2. **Si la tienda cambia el HTML de un botón, ¿qué se rompe y qué no? ¿Qué aportó el Page Object?**
   Se rompen los localizadores, no la lógica de las pruebas. Las pruebas que migramos (03, 04, 05 y US-07) solo llaman a `tienda.agregar()`, `tienda.aplicarCodigo()`, etc.; el cambio se arregla una sola vez en `TiendaPage.ts`. Las que aún escriben el localizador a mano (02-carrito) habría que corregirlas una por una. Como buscamos por rol y nombre visible (`getByRole('button', { name: 'Agregar' })`), cambiar clases o estructura no las afecta; cambiar el texto del botón sí.

3. **Una prueba roja nuestra que no era un bug del producto: ¿cómo nos dimos cuenta?**
   La heredada H1 esperaba 6 productos y recibía 8. La reprodujimos a mano: la tienda mostraba 8, y el criterio US-01 · CA1 pide 8. La tienda estaba bien; el dato de la prueba estaba viejo, así que corregimos la prueba. Lo mismo nos pasó en la Parte 1 cuando cambiamos 8 por 9 a propósito.

4. **¿Qué bug o riesgo no habría encontrado la automatización por sí sola?**
   La automatización solo comprueba lo que alguien decidió afirmar. Los bugs del IVA y del stock los encontró porque escribimos el oráculo a partir del criterio, no de la pantalla. No habría notado, por ejemplo, que `getByLabel` no encuentra los campos del formulario (un problema de accesibilidad: las etiquetas no están asociadas a los campos), ni textos confusos, ni problemas de diseño en pantallas pequeñas.

5. **¿Qué haríamos distinto en un proyecto real?**
   Crear el Page Object desde el principio, en vez de copiar localizadores y migrar después. Correr la suite contra un entorno de pruebas propio con datos controlados, no contra la tienda pública. Pedir al equipo de desarrollo atributos estables (`data-testid`, etiquetas `<label for>`). Y enlazar desde el inicio cada prueba con su caso y su bug en Jira, para tener trazabilidad sin trabajo extra al final.