// Reference: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
var idb = {
    db: null,
    dbname: "inventario",
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
            
            // The DB is divided in two tables (Object Stores)
            // Table to store form rows as JSON objects
            const objectStore = this.db.createObjectStore("rows", {
                keyPath: "row_id"
            });

          // Create an index to search rows by form id. We have duplicates
          // so we can't use a unique index.
          objectStore.createIndex("inv_id", "inv_id", { unique: false });
            
          // Create table to store form metadata
          const metadata_objectStore = this.db.createObjectStore("inv_metadata", {
                keyPath: "inv_id"
          });
        }
    },
    
    /**
     * Add data inside Indexed DB
     * ==============================
     * Push data into IndexedDB (i.e. with replace if data's key match
     * with an existing DB key)
     * 
     * @param {JSON} data 
     * @param {Text} os: Object Store's name where data is loaded
     * @param {Text} key: The data's id to start a IDB get transaction
     * 
     */
    addData(data, os, key){

        const transaction = this.db.transaction([os], "readwrite");
        
        // Action to start when data is added to the database.
        transaction.oncomplete = (event) => {
            alert("Data is saved!");
        };

        transaction.onerror = (event) => {
          console.error(`[IDBTransaction error]: ${event.target.error}`);
          alert("Uups, something went wrong. Try it again!");
        };

        const objectStore = transaction.objectStore(os);
            
        // Check if data is already inside IndexedDB
        const request_get = objectStore.get(data[key]);

        request_get.onerror = (event) => {
          console.error(`[IDBGetTransaction error]: ${event.target.error}`);
        };

        request_get.onsuccess = (event) => {

          // Put updated data back into the database.
          // Note that the add() function requires that no object
          // already be in the database with the same key.
          const request_update = objectStore.put(data);

          request_update.onerror = (event) => {
            console.error(`[IDBPut request error]: ${event.target.error}`);
          };
          request_update.onsuccess = (event) => {
            console.log(`Row saved - key ${event.target.result}`);
          };
        };
    },
    /**
     * Get all the data in IDB by key
     * =================================
     * 
     * @param {Text} os Object Store to get from IDB
     * @param {Text} key ID which all retrieved json data must contain
     * @param {Text | Boolean} index If it is not false, must be the 
     * index name when key value is stored
     * @param {Function} callback Function to manage the result
     */
    getAllData(os, key, index = false, callback){
      const transaction = this.db.transaction([os]);

      transaction.onerror = (event) => {
        console.error(`[IDBTransaction error]: ${event.target.error}`);
        alert("Uups, something went wrong. Try it again!");
      };

      const objectStore = transaction.objectStore(os);

      if(!index){
        var request = objectStore.getAll(key);
      } else {
        const idbIndex = objectStore.index(index);
        var request = idbIndex.getAll(key);
      }

      request.onerror = (event) => {
        console.error(`[IDBPut request error]: ${event.target.error}`);
      }

      request.onsuccess = (event) => {
        callback(event.target.result);
      }
    }
}

// Init DB
idb.init();
