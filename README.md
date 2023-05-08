# inventario (development stage)
PWA (Progressive Web Application) to collect vegetation data at field.

[Link to the site](https://cristianics.github.io/inventario/)

## todo

- Cuando se eliminen filas, que es eliminen tambien de la IDB
- Cuando no haya datos en una celda el valor no puede ser 0
- Add an option to catch an image
- Button to diselect all rows
- Make style responsive to mobile devices
- Store array buffer instead URLbase64
- Actualmente no puede haber datos de dos inventarios distintos: Cuando se reemplazan
los valores de las filas en la IDB solo se tiene en cuenta el valor del ID_ROW.
Si se empieza otro inventario las filas se irian reemplazando.
- Cuando se corriga el punto anterior, opción para eliminar los inventarios guardados
en la IDB.

https://web.dev/indexeddb-best-practices/