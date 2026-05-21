# Sistema de Facturación Telefónica

Este proyecto modela un sistema de facturación para una línea telefónica.

La idea principal fue representar el problema usando objetos del dominio:

- `PhoneLine`: representa la línea telefónica de un cliente.
- `Call`: clase base para las llamadas.
- `LocalCall`, `NationalCall`, `InternationalCall`: tipos concretos de llamadas.
- `MonthlyBill`: representa la factura mensual generada.

## Decisiones de diseño

Cada tipo de llamada sabe calcular su propio costo mediante el método `cost()`.  
De esta forma, la factura no necesita preguntar qué tipo de llamada está procesando, simplemente le pide a cada llamada su costo.

La línea telefónica se encarga de registrar llamadas y generar una factura mensual con las llamadas correspondientes al último mes.

La factura mensual se modeló como un objeto propio porque no solo representa un número final, sino también un resumen con mínimo mensual, totales por tipo de llamada y total general.

## Interpretaciones del enunciado

Se asumió que las llamadas no duran más de 24 horas, ya que no sería un caso realista para este dominio.

Para llamadas locales, la tarifa cambia según el horario:

- Tarifa baja fuera de la franja 08:00 - 20:00 en dias hábiles, y todo el dia para sabados y domingos.
- Tarifa alta dentro de la franja 08:00 - 20:00 en días hábiles.

Si una llamada local cruza de un día a otro, se calcula cuántos minutos caen dentro de la franja de tarifa alta y el resto se cobra como tarifa baja.

Para llamadas nacionales e internacionales se interpretó que el costo depende de una tarifa por minuto asociada al destino. Por eso estas llamadas reciben una duración y un valor de tarifa, y calculan su costo multiplicando ambos valores.

De esta manera, cada tipo de llamada resuelve su propia lógica de facturación mediante `cost()`, sin que la factura tenga que conocer los detalles internos de cada caso.

## Ejecución

Para correr el ejemplo por consola:
```bash
    npm start
    o
    bun start
 ```

Para correr tests:
 ```bash
    npm test
    o 
    bun test
 ```
