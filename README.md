# Forest Inventory PWA

## Estructura de la base de datos (IndexedDB)

```text
// Page https://dbdiagram.io/d
// DBML to define database structure
// Docs: https://dbml.dbdiagram.io/docs

// Store inventory rows
Table rows {
  id integer [primary key]
  inventories_id integer
  sp_images_id integer
  DN integer
  created_at timestamp 
}

Table inventories {
  id integer [primary key]
  name varchar
  creator varchar
  init_point integer
  stop_point integer
  created_at timestamp
}

Table inventory_images {
  id integer [primary key]
  inventories_id integer
  src varchar
  created_at timestamp
}

Table sp_images {
  id integer [primary key]
  name varchar
  src varchar
  created_at timestamp
}

Ref: rows.inventories_id > inventories.id // many-to-one

Ref: sp_images.id > rows.sp_images_id

Ref: inventory_images.inventories_id > inventories.id
```

Explanation of Improvements:

- Promises and async/await: The use of Promises and async/await makes the code more readable and easier to follow.
- Separated Data Handling: The addRecord function is separated out to handle individual record additions more cleanly.
- Transaction Handling: The transaction handling logic is simplified and moved to use async/await, which makes it easier to manage errors and transaction completion.

Class-based Structure: Using a class (IndexedDBHandler) provides a more modern, modular, and reusable structure. This aligns well with ES6+ JavaScript practices.

Improved Readability: The use of methods within a class improves code organization and readability. It separates concerns more clearly and can be extended easily.

## Aspectos del código

Init

- Start `Inventories` class
- Start `IndexedDBHandler` class
- Create the indexeddb instance inside an `IndexedDBHandler` object
- Init the above database
- Call `Inventories.load` to add the indexeddb stored inventories metadata.
- Call `Inventories.show` method to display the above inventories in html form.

Option to save inventory metadata

- Call `Inventories.save` function with the metadata (input types)
  - Transform metadata into `Inventory` object.
  - Check if the new metadata `name` is already stored inside IDB.
    - TRUE: Check if the other properties are different too.
      - TRUE: Display a message to confirm the overwrite
        - TRUE: Save metadata inside IndexedDB
    - FALSE: Save metadata inside IndexedDB
- Show the new inventories calling `Inventories.load`
- Check if there is an inventory active (`Inventories.activeid`)
  - TRUE: Save its rows inside IDB.
    - Collect the rows again from IDB with `Rows.init` to place their ids inside HTML.
    - Remove prior HTML rows with `Rows.ls`
    - Show the saved rows again.
  - FALSE: Show the saved inventories panel with `Inventories.show`

Open saved inventory:

- Save the opened inventory id inside a key inside `Inventories` class.
- Update the UI
- Create new `Rows` class
- Retrieve the stored rows inside indexedDB with `Rows.init`
- Display the stored rows with `Rows.show()`

Add new empty row:

- Save all the displayed rows inside the form with `Rows().collect`
- Create a new row with `Rows.emptyRow` and add to `Rows` object class.
- Delete displayed rows to then show the ones inside `Rows` object.

Delete a row:

- Retrieve selected rows with `Rows.collect(true)`. If parameter `selected` is set to `true`, the row number from the HTML is saved.
- Delete row from the IndexedDB and from the HTML panel with `Rows.delete`.
- Collect again the remaining rows with `Rows.collect` (this time with `selected` param set to `false`). This time the row number will be computed related with number of displayed rows (as always).
- Remove ancient rows in the screen with `Rows.ls`.
- Show new collected rows with `Rows.show`.

Delete inventory (metadata, rows (and images)):

- Get the inventory ID and delete it from IDB with `Inventories.delete`. This function deletes the inventories from `Inventories.metadata` array.
- Show again the stored inventories with `Inventories.show`. This function do the following actions:
  - Reset the UI to the initial state.
  - Store the inventories in `Inventories.metadata` inside "Saved inventories" panel.
  - **Remove displayed rows in the row panel**
  - Reset the `Inventories.activeid` variable.

Go home (reset the UI to the initial state when click on the main title):

- Trigger a confirmation message ("go home" action is made all the unsaved data is lost).
- Reset UI to the initial state.
- Show the saved inventories with `Inventories.show`.

The autocomplete input behaviour has been achieved with the code inside [How TO - Autocomplete](https://www.w3schools.com/howto/howto_js_autocomplete.asp) tutorial.

Cuando se elimina un inventario, se vuelven a cargar desde la IDB. Por eso la opción de eliminar un inventario no aparece al mostrar el formulario con las filas.

Cuando se abre un inventario, se actualiza una propiedad que marca si está o no activado.

Las filas solo se guardan en la IndexedDB cuando se pulsa el botón. Hasta entonces solo estarán en la variable global.

## Actualizaciones pendientes

Incluir los cambios en la UI en una nueva clase (o en varias funciones).

Mejorar las funciones que interactúan con la BBDD: Recoger las promesas con `reject`, avisar al usuario y parar la función que se está ejecutando.

## Referencias

[Guía sobre PWA](https://web.dev/learn/pwa/)

[PWA Icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/CycleTracker/Manifest_file#app_iconography)

[Instalar una PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing)

Referencias acerca de AndroidStudio:

[Información del contenido basado en la web](https://developer.android.com/develop/ui/views/layout/webapps)

[Cargar contenido en la APP](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content)

[Crear una app android con html y js](https://www.geeksforgeeks.org/build-an-android-app-with-html-css-and-javascript-in-android-studio/)
