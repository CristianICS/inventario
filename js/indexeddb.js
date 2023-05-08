// Reference: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
var idb = {
    db: null,
    dbname: "inventario",
    init(){

      // Init database
      const request = window.indexedDB.open(this.dbname, 2);

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

        // Create DB ObjectStore
        // The DB is divided in three tables (Object Stores)

        // 1. Table to store form rows as JSON objects
        if (!this.db.objectStoreNames.contains('rows')){
          const r_objectStore = this.db.createObjectStore("rows", {
              keyPath: "id"
          });

          // Create an index to search rows by form id. We can have duplicates
          // so we can't use a unique index.
          r_objectStore.createIndex("inv_id", "inv_id", { unique: false });

          // Create an index to search by row_id, we can have duplicates too
          r_objectStore.createIndex("row_id", "row_id", { unique: false });
        }

        // 2. Create table to store form metadata
        if (!this.db.objectStoreNames.contains('inv_metadata')){
          const m_objectStore = this.db.createObjectStore("inv_metadata", {
            keyPath: "inv_id"
          });
        }

        // 3. Table to store images
        if (!this.db.objectStoreNames.contains('images')){
          const i_objectStore = this.db.createObjectStore("images", {
              keyPath: "id"
          });

          // Create an index to search images by form id. We have duplicates
          // so we can't use a unique index.
          i_objectStore.createIndex("inv_id", "inv_id", { unique: false });
        }
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
     * Put data into IndexedDB, i.e. **with replace** if data's key match
     * with an existing DB key).
     * 
     * This function is only valid for IMAGES and Form's METADATA. The form's rows
     * are more complex and it has a specific function.
     *
     * @param {Array} data Array with JSON objects [{...}]
     * @param {Text} os: Object Store's name where data is loaded
     * @param {Text} key: The data's id key to start a IDB get transaction
     *
     */
    addData(data_array, os, key, form_id = false){

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

      for (let i = 0; i < data_array.length; i++) {
        
        const data = data_array[i];
        
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
            console.log(`Saved item with key ${event.target.result}`);
          };

        };
      }
    },
    /**
     * Add rows to IDB
     * =========================
     * - If row_id from inserted data is not inside IDB: os.add()
     * - If row_id is inside IDB:
     *    + If inserted data[inv_id] != idb data['inv_id'] = os.add()
     *    + Else: inserted_data[id] == idb data['id'] & os.push()
     * 
     * @param {Array} data_array 
     * @param {Text} form_id 
     */
    addRows(data_array) {

      const transaction = this.db.transaction(['rows'], "readwrite");
      
      // Action to start when data is added to the database.
      transaction.oncomplete = (event) => {
        alert("Data is saved!");
      };
      
      transaction.onerror = (event) => {
        console.error(`[IDBTransaction error]: ${event.target.error}`);
        alert("Uups, something went wrong. Try it again!");
      };

      // Get objectStore
      const objectStore = transaction.objectStore('rows');

      for (let i = 0; i < data_array.length; i++) {
        
        const data = data_array[i];
        
        // Get row custom keys
        const idbRowIndex = objectStore.index('row_id');
        
        const request_get = idbRowIndex.get(data['row_id']);

        request_get.onerror = (event) => {
          console.error(`[IDBGetTransaction error]: ${event.target.error}`);
        };

        request_get.onsuccess = (event) => {

          const requested_data = request_get.result;
        
          // When row is not inside IDB
          if(typeof requested_data === 'undefined') {
            const request_add = objectStore.add(data);

            request_add.onerror = (event) => {
              console.error(`[IDBPut request error]: ${event.target.error}`);
            };
            request_add.onsuccess = (event) => {
              console.log(`Saved item with key ${event.target.result}`);
            };
          }
          // If IDB contains a row which the same row_id
          else if (data['row_id'] == requested_data['row_id']) {

            console.log('addRows() :: requested_data:', requested_data);

            // If both rows are inside on the same inv_id
            if (data['inv_id'] == requested_data['inv_id']) {

              // Update the row
              const updated_data = data;
              updated_data['id'] = requested_data['id'];
              
              const request_update = objectStore.put(data);

              request_update.onerror = (event) => {
                console.error(`[IDBPut request error]: ${event.target.error}`);
              };
              request_update.onsuccess = (event) => {
                console.log(`Saved item with key ${event.target.result}`);
              };
              
            } else {
              // Add row
              const request_add2 = objectStore.add(data);

              request_add2.onerror = (event) => {
                console.error(`[IDBPut request error]: ${event.target.error}`);
              };
              request_add2.onsuccess = (event) => {
                console.log(`Saved item with key ${event.target.result}`);
              };
            }
          }
        };
      }
    },
    /**
     * Get all the data in IDB by key
     * =================================
     *
     * @param {Text} os Object Store to get from IDB
     * @param {Text} key ID which all retrieved json data must contain
     * @param {Text | Boolean} index If it is not false, must be the
     * index name where key value is stored
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
        // Remove prior data
        container.textContent = '';
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
