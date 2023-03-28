// Reference: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
var idb = {
    db: null,
    dbname: "inv-rows",
    init(){
        // Init database
        const request = window.indexedDB.open(this.dbname, 1);

        request.onerror = (event) => {
            console.error(`[IndexedDB request error]: ${event.target.errorCode}`);
            document.querySelector(".indexeddb").style = "background-color: red;";
        };
        request.onsuccess = (event) => {
            document.querySelector(".indexeddb").style = "background-color: green;";
            //   Save DB instance
            this.db = event.target.result;
        };

        // IMPORTANT: This event is only implemented in recent browsers
        request.onupgradeneeded = (event) => {
            // Save the IDBDatabase interface
            this.db = event.target.result;

            // Create an objectStore for this database
            // It will store form rows as JSON objects
            const objectStore = this.db.createObjectStore("rows", {
                keyPath: "row_id"
            });

          // Create an index to search rows by N. We may have duplicates
          // so we can't use a unique index.
          objectStore.createIndex("N", "n", { unique: false });
        }
    },
    add(row){
        /*
         * :row: Row as JSON
         */
        const transaction = this.db.transaction([this.dbname], "readwrite");
        
        // Action to start when data is added to the database.
        transaction.oncomplete = (event) => {
            alert("Data is saved!");
        };

        transaction.onerror = (event) => {
          console.error(`[IDBTransaction error]: ${event.target.error}`);
          alert("Uups, something went wrong. Try it again!");
        };

        const objectStore = transaction.objectStore("rows");
            
        // Check if the row ID is already inside IndexedDB
        const request_get = objectStore.get(row.row_id);

        request_get.onerror = (event) => {
          console.error(`[IDBGetTransaction error]: ${event.target.error}`);
        };

        request_get.onsuccess = (event) => {

          // Put updated row back into the database.
          // Note that the add() function requires that no object
          // already be in the database with the same key.
          const request_update = objectStore.put(row);

          request_update.onerror = (event) => {
            console.error(`[IDBPut request error]: ${event.target.error}`);
          };
          request_update.onsuccess = (event) => {
            console.log(`Row saved - key ${event.target.result}`);
          };
        };
    }
}

// Init DB
idb.init();
