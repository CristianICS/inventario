// Reference: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

// Object to store all functions related with IndexedDB API
var idb = {
    // IDB state
    db: null,
    // Main IDB instance name
    dbname: "inventario",

    /**
     * Init the IndexedDB
     * ======================
     * 1. Create main IDB object
     * 2. Create ObjectStores to save JSON information
     * 3. Create indexes to filter the information
     */
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
          // Create an index to search by row_id, we can have duplicates too
          i_objectStore.createIndex("row_id", "row_id", { unique: false });
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
     * Add data inside IDB
     * =================================
     * 
     * Update data in IDB with put() function. If there is no data with
     * required key, create a new one. 
     * 
     * @param {Array} data_array Array with dicts to insert
     * @param {Text} os Object Store to get the data from IDB
     * @param {Text} key String that inserted json data must contain
     * @param {Text | Boolean} index If it is not false, must be the
     * index name where key value is stored
     */
    addData(data_array, os, key, index = false) {

      const transaction = this.db.transaction([os], 'readwrite');
      
      transaction.oncomplete = (e) => {
        alert("Data is saved!");
      }

      transaction.onerror = (event) => {
        console.error(`[IDBTransaction error]: ${event.target.error}`);
        alert("Uups, something went wrong. Try it again!");
      }

      
      if(!index){
        var objectStore = transaction.objectStore(os);
      } else {
        var objectStore = transaction.objectStore(os).index(index);
      }

      for (let i = 0; i < data_array.length; i++) {
        
        const data = data_array[i];
        
        // Check if data is already inside IndexedDB
        const request_get = objectStore.get(data[key]);

        request_get.onerror = (event) => {
          console.error(`[IDBGetTransaction error]: ${event.target.error}`);
        };

        request_get.onsuccess = (event) => {

          // Put updated data back into the database.
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
     * Add metadata inside Indexed DB
     * ===================================
     * Put inv metadata into IndexedDB, i.e. **with replace**. If data's key
     * match with an existing DB key update the data with the new one.
     *
     * @param {Array} data Array with JSON objects [{...}]
     * @param {Text} os: Object Store's name where data is loaded
     * @param {Text} key: The data's id key to start a IDB get transaction
     *
     */
    addMetadata(data_array, os, key, form_id = false){

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
     * Add inv rows or images to IDB
     * ===============================
     * - If row_id/img_id from inserted data is not inside IDB: add()
     * - If row_id is inside IDB:
     *    + If inserted row[inv_id] == idb row['inv_id']: push() -> update
     *    + Else: add() -> the row_id is inside IDB but it does not link with the
     * inv_id from pending to insert's row.
     * 
     * @param {Array} data_array 
     * @param {Text} os Object Store from the data is retrieved 
     */
    addInvData(data_array, os) {

      const transaction = this.db.transaction([os], "readwrite");
      
      // Action to fire when data is added to the database.
      transaction.oncomplete = (event) => {
        alert("Data is saved!");
      };
      
      transaction.onerror = (event) => {
        console.error(`[IDBTransaction error]: ${event.target.error}`);
        alert("Uups, something went wrong. Try it again!");
      };

      // Get objectStore
      const objectStore = transaction.objectStore(os);

      // Iterate all rows/images
      for (let i = 0; i < data_array.length; i++) {
        
        const data = data_array[i];
        
        // Get RowIndex
        const idbRowIndex = objectStore.index('row_id');
        
        // Check if the pending to store's data ID is inside IDB
        const request_get = idbRowIndex.get(data['row_id']);

        request_get.onerror = (event) => {
          console.error(`[IDBGetTransaction error]: ${event.target.error}`);
        };

        request_get.onsuccess = (event) => {

          const requested_data = request_get.result;
        
          // When data is not inside IDB - get() method returns 'undefined'
          if(typeof requested_data === 'undefined') {

            // Add data into IDB
            const request_add = objectStore.add(data);

            request_add.onerror = (event) => {
              console.error(`[IDBPut request error]: ${event.target.error}`);
            };
            request_add.onsuccess = (event) => {
              console.log(`Saved item with key ${event.target.result}`);
            };
          }
          // IDB contains a data with the same row_id, so
          // If both are in the same inv
          else if (data['inv_id'] == requested_data['inv_id']) {

            // Update data - Write the same ID to update the one in the IDB
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
            // Add data
            const request_add2 = objectStore.add(data);

            request_add2.onerror = (event) => {
              console.error(`[IDBPut request error]: ${event.target.error}`);
            };
            request_add2.onsuccess = (event) => {
              console.log(`Saved item with key ${event.target.result}`);
            };
          }
        };
      }
    },

    /**
     * Remove images from IDB
     * ========================
     * 
     * @param {Array} images Dict of the images to delete 
     * @param {*} callback 
     */
    removeImages(images, callback) {
      // Start transaction with the IDB
      const transaction = this.db.transaction(['images'], 'readwrite');
      
      // Action to fire when data is removed to the database.
      transaction.oncomplete = (event) => {callback();};
      
      transaction.onerror = (event) => {
        console.error(`[IDBTransaction error]: ${event.target.error}`);
        alert("Uups, something went wrong. Try it again!");
      };
      
      // Remove the images linked to this row
      var img_os = transaction.objectStore('images');
      images.forEach((img) => {
        img_os.delete(Number(img.id));
      });

    },

    /**
     * Remove row from IBD
     * =========================
     * It is called inside inv.removeRow() function to delete a row from idb
     * 
     * @param {Number} id Unique ID which identifies the row inside IDB 
     * @param {Function} callback 
     */
    removeRow(id, callback) {
      
      // Start transaction with the IDB
      const transaction = this.db.transaction(['rows'], 'readwrite');
      
      // Action to fire when data is removed to the database.
      transaction.oncomplete = (event) => {

        console.log("Row with id " + id + ": deleted from IDB.");
        
        callback();
      };
      
      transaction.onerror = (event) => {
        console.error(`[IDBTransaction error]: ${event.target.error}`);
        alert("Uups, something went wrong. Try it again!");
      };

      // Lastly, delete selected row
      const request = transaction.objectStore('rows').delete(id);
    },

    /**
     * Remove the inv inside IDB
     * ===========================
     * Remove all the data stored in the IDB refered with inv_id.
     * 
     * @param {String} inv_id 
     */
    removeInv(inv_id) {

      // Remove images
      this.getAllData('images', inv_id, 'inv_id', (images) => {
        this.removeImages(images, ()=> {
          // Remove rows and metadata
          const transaction = this.db.transaction(['inv_metadata'], 'readwrite');

          // Action to fire when all the data is removed to the database.
          transaction.oncomplete = (event) => {
            console.log("Inv data with id " + inv_id + " have been deleted.");
          };
          
          transaction.onerror = (event) => {
            console.error(`[IDBTransaction error]: ${event.target.error}`);
            alert("Uups, something went wrong. Try it again!");
          };

          // Remove metadata
          transaction.objectStore('inv_metadata').delete(inv_id);
          
          // Remove rows
          this.getAllData('rows', inv_id, 'inv_id', (rows) => {
            rows.forEach((row) => {
              this.removeRow(row.id, ()=>{});
            });

            // Pass a function to reset the data inside the web forms
            metadata.reset();
            inv.reset();
          })


        })
      })

    },

    /**
     * Get all the data in IDB by key
     * =================================
     * 
     * Retrieve all the JSON dicts inside an ObjectStore by 
     * 
     * @param {Text} os Object Store to get the data from IDB
     * @param {Text} key String that all retrieved json data must contain
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

      var objectStore = transaction.objectStore(os);

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

    /**
     * Load the IDB stored inventarios inside the form
     * ==================================================
     * 
     * @param {String} inv_id 
     */
    uploadInv(inv_id){

      let confirm_text = "Al cargar un nuevo inventario los cambios sin guardar se perderan, continuar?";
      if (confirm(confirm_text)){
        // Get metadata from IDB
        this.getAllData('inv_metadata', inv_id, false, (inv_metadata)=>{
        
          // Write metadata
          metadata.write(inv_metadata[0]);
          
          metadata.blockInputs();
  
        });
        
        // Get rows from IDB
        this.getAllData('rows', inv_id, 'inv_id', (rows) => {
          
          // Write rows
          inv.write(rows);
        
        })
      }

    },

    /**
     * Show invs stored inside IDB
     * ==============================
     */
    showSavedForms(){
      const transaction = this.db.transaction(['inv_metadata']);

      transaction.onerror = (event) => {
        console.error(`[IDBTransaction error]: ${event.target.error}`);
        alert("Uups, something went wrong. Try it again!");
      };

      // Get the OS when inv metadata is stored
      const objectStore = transaction.objectStore('inv_metadata');

      // Retrieve all inv metadata
      var request = objectStore.getAll();

      request.onerror = (event) => {
        console.error(`[IDBPut request error]: ${event.target.error}`);
      }

      request.onsuccess = (event) => {
        
        let m = event.target.result; // metadata values
        
        // Block the app (only the saved-box will be available)
        document.querySelector('.block-div').style.display = "block";
        // Get the main HTML div when metadata is displayed
        document.querySelector('.saved-box').style.display = "block";
        
        // Get HTML div to display metadata
        var container = document.querySelector('#saved-forms-list');
        // Remove prior data
        container.textContent = '';
        
        // Iterate through invs and show all the ids in a HTML tag
        let html_content = []
        for(let i = 0; i < m.length; i++){
          var id = m[i].inv_id; // ID
          // Create the HTML object to display the stored inv
          let row_content = new Inventario(id).createHTML();
          html_content.push(row_content);
        }
        // Show stored invs
        container.innerHTML = html_content.join("\n");
      }
    }
}

// Construct HTML format to stored invs inside .saved-box
class Inventario {

  constructor(inv_id) {
    this.id = inv_id;
    this.upload_btn = `<a onclick="idb.uploadInv('${inv_id}')">upload</a>`;
    this.download_btn = `<a onclick="download_data.inv('${inv_id}')">download</a>`;
    this.delete_btn = `<a onclick="idb.removeInv('${inv_id}')">delete</a>`;
  }

  createHTML(){
    
    // Store the inv name and functions inside a li element
    let inner_html = [
      "<li>",
      this.id,
      this.upload_btn,
      this.download_btn,
      this.delete_btn,
      "</li>"
    ];
    return(inner_html.join("\n"))
  }

}