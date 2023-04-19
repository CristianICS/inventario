# inventario (development stage)
PWA (Progressive Web Application) to collect vegetation data at field.

[Link to the site](https://cristianics.github.io/inventario/)

## todo

- Cuando se eliminen filas, que es eliminen tambien de la IDB
- Add an option to catch an image
- Make style responsive to mobile devices
- Button to diselect all rows
- Store array buffer instead URLbase64
- Cuando no haya datos en una celda el valor no puede ser 0
- Mostrar inventarios guardados en local (indexeddb)
- Actualmente no puede haber datos de dos inventarios distintos: Cuando se reemplazan
los valores de las filas en la IDB solo se tiene en cuenta el valor del ID_ROW.
Si se empieza otro inventario las filas se irian reemplazando.

https://web.dev/indexeddb-best-practices/