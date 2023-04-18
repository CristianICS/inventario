// Reference: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
var idb = {
    db: null,
    dbname: "inventario",
    init(){
        // Init database
        const request = window.indexedDB.open(this.dbname, 1);

        request.onerror = (event) => {
            console.error(`[IndexedDB request error]: ${event.target.errorCode}`);
            document.querySelector(".indexeddb").classList.add("error");
        };
        request.onsuccess = (event) => {
            document.querySelector(".indexeddb").classList.add("success");
            // Save DB instance
            this.db = event.target.result;

            // Test if ObjectStore are already created
            this.testIDB();
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
     * Make a test query to test that IDB is correctly open
     */
    testIDB(){
      const transaction = this.db.transaction(["rows"], "readonly");
      const objectStore = transaction.objectStore("rows");

      transaction.onerror = (event) => {
        document.querySelector(".indexeddb").classList.add("error");
        console.error(`IBD test fails: ${event.target.error}`);
      };

      const countRequest = objectStore.count();
      countRequest.onsuccess = () => {
        console.log('IBD test success');
      };
      countRequest.onerror = (event) => {
        console.error(`IBD test fails: ${event.target.error}`);
      };
    },

    /**
     * Add data inside Indexed DB
     * ==============================
     * Push data into IndexedDB, i.e. **with replace** if data's key match
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
            console.log("Data is saved!");
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
    },
    showSavedForms(){
      const transaction = this.db.transaction(['inv_metadata']);

      transaction.onerror = (event) => {
        console.error(`[IDBTransaction error]: ${event.target.error}`);
        alert("Uups, something went wrong. Try it again!");
      };

      const objectStore = transaction.objectStore('inv_metadata');

      var request = objectStore.getAll();

      request.onerror = (event) => {
        console.error(`[IDBPut request error]: ${event.target.error}`);
      }

      request.onsuccess = (event) => {
        let m = event.target.result;
        document.querySelector('.block-div').style.display = "block";
        document.querySelector('.saved-box').style.display = "block";
        var container = document.querySelector('#saved-forms-list');
        // Show metadata tags
        for(let i = 0; i < m.length; i++){
          var form_id = m[i].inv_id;
          var child = document.createElement('li');
          child.innerText = form_id
          child.setAttribute('onclick', 'downloadForm("' + form_id.toUpperCase() + '")');
          container.appendChild(child);
        }
      }
    }
}
