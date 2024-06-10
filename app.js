class IndexedDBHandler {

  constructor(dbname) {
    this.dbname = dbname;
    this.db = null;
  }

  /**
   * Init the IndexedDB
   * ======================
   * 1. Create main IDB object
   * 2. Create ObjectStores to save JSON information
   * 3. Create indexes to store the info properly
   */
  init() {
    return new Promise((resolve, reject) => {
      // Init database
      const request = window.indexedDB.open(this.dbname, 1);

      request.onerror = (event) => {
        console.error(`[IndexedDB request error] ${event.target.errorCode}`);
      };
      request.onsuccess = (event) => {
        // Save DB instance
        this.db = event.target.result;
        // Test if ObjectStore are already created
        this.testIDB();
        resolve(this);
      };

      // IMPORTANT: This event is only implemented in recent browsers
      request.onupgradeneeded = (event) => {
        // Save the IDBDatabase interface
        this.db = event.target.result;

        // Create DB ObjectStores
        // Check the DB schema in the README.md file for details
        if (!this.db.objectStoreNames.contains('rows')) {
          const rowsOs = this.db.createObjectStore("rows", {
            keyPath: "id", autoIncrement: true, unique: true
          });

          // Define indexes to search rows by:
          rowsOs.createIndex("inventories_id", "inventories_id",
            { unique: false }
          );
          rowsOs.createIndex("sp_images_id", "sp_images_id",
            { unique: false }
          );
        }

        if (!this.db.objectStoreNames.contains('inventories')){
          const invsOs = this.db.createObjectStore("inventories", {
            keyPath: "id", autoIncrement: true, unique: true
          });
        }

        if (!this.db.objectStoreNames.contains("inventory_images")){
          const invImgsOs = this.db.createObjectStore("inventory_images", {
            keyPath: "id", autoIncrement: true, unique: true
          });
          // Define indexes to search rows by:
          invImgsOs.createIndex("inventories_id", "inventories_id",
            {unique: false}
          );
        }

        if (!this.db.objectStoreNames.contains('sp_images')){
          const spImgsOs = this.db.createObjectStore('sp_images', {
            keyPath: "id", autoIncrement: true, unique: true
          });
        }
      };
    })
  } // end of init()
    
  /** Make a test query to test that IDB is correctly open */
  testIDB(){
    const transaction = this.db.transaction(["rows"], "readonly");
    const objectStore = transaction.objectStore("rows");

    transaction.onerror = (event) => {
    console.error(`[IBD test fails] ${event.target.error}`);
    };

    const countRequest = objectStore.count();
    countRequest.onsuccess = () => {
      console.log('IBD test success');
    };
    countRequest.onerror = (event) => {
      console.error(`[IBD test fails] ${event.target.error}`);
    };
  }

  /**
   * Retrieve all the data inside an object store.
   * 
   * @param {String} os ObjectStore name
   * @returns {Array}
   */
  getAllData(os) {
    const transaction = this.db.transaction([os], "readonly");
    const objectStore = transaction.objectStore(os);
    // TODO: The error message is not returned
    transaction.onerror = (event) => {
      console.error(`[IBD transaction fails] ${event.target.error}`);
    };
    
    return new Promise((resolve, reject) => {
      const allRecords = objectStore.getAll();

      allRecords.onsuccess = (event) => {
          resolve(event.target.result);
      };

      allRecords.onerror = (event) => {
          console.error(`[IDBGetAll request error]: ${event.target.error}`);
          reject(event.target.error);
      };
    });
  }

  /**
   * Function prepared to add data inside a forEach method.
   * @param {*} data 
   * @param {*} os 
   */
  async addData(data, os) {
    try {
      const transaction = this.db.transaction([os], 'readwrite');
      const objectStore = transaction.objectStore(os);
      await this.addRecord(objectStore, data);

      transaction.onerror = (event) => {
          console.error(`[IDBTransaction error]: ${event.target.error}`);
      };
    } catch (error) {
      console.error(`Error in addData: ${error}`);
    }
  }

  /**
   * Delete a record inside an ObjectStore by its id.
   * 
   * @param {String || Integer} id Item to delete's ID
   * @param {String} os ObjectStore name
   * @returns 
   */
  deleteRecord(id, os) {
    const transaction = this.db.transaction([os], "readwrite");
    const objectStore = transaction.objectStore(os);
    // TODO: The error message is not returned
    transaction.onerror = (event) => {
      console.error(`[IBD transaction fails] ${event.target.error}`);
    };
    
    return new Promise((resolve, reject) => {
      const deleteKey = objectStore.delete(id);
      
      deleteKey.onsuccess = (event) => {
        console.log('[Delete action successfull]');
        resolve();
      };

      deleteKey.onerror = (event) => {
        console.error(`[IDBDeleteRecord error]: ${event.target.error}`);
      };
    })
  }

  /**
   * Get one record by id
   * @param {*} id 
   * @param {*} os 
   * @returns 
   */
  getRecord(id, os) {
    const transaction = this.db.transaction([os], "readwrite");
    const objectStore = transaction.objectStore(os);
    // TODO: The error message is not returned
    transaction.onerror = (event) => {
      console.error(`[IBD transaction fails] ${event.target.error}`);
    };
    
    return new Promise((resolve, reject) => {
      const retrievedObj = objectStore.get(id);
      
      retrievedObj.onsuccess = (event) => {
        resolve(event.target.result);
      };

      retrievedObj.onerror = (event) => {
        console.log(`[IDBDeleteRecord error]: ${event.target.error}`);
      };
    })
  }

  /**
   * Retrieve all the records that match with one id from index column.
   * 
   * @param {String} id The value that define selected objects
   * @param {String} index Column name in which the value is stored (an index)
   * @param {String} os Object store name
   * @returns 
   */
  getRecords(id, indexName, os){
    const transaction = this.db.transaction([os], "readwrite");
    const objectStore = transaction.objectStore(os);
    const index = objectStore.index(indexName);
    // Get all the data with the same ID base on index column
    const keyRange = IDBKeyRange.only(id);
    const cursorRequest = index.openCursor(keyRange);
    
    return new Promise((resolve, reject) => {
      // Store the results
      const results = [];
  
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue(); // Move to the next item
        } else {
          resolve(results);
        }
      };
  
      cursorRequest.onerror = function(event) {
          console.error('[getRecords request error]:', event.target.error);
      };
    })
  }

  addRecord(objectStore, data) {
    return new Promise((resolve, reject) => {
      const request = objectStore.put(data);

      request.onsuccess = () => {
          resolve();
      };

      request.onerror = (event) => {
          reject(event.target.error);
      };
    });
  }
}

class Inventory {
  /** Represent an inventory with its metadata */
  constructor(name, creator, init_point, stop_point, id = false) {
    this.id = id;
    this.name = name;
    this.creator = creator;
    this.init_point = init_point;
    this.stop_point = stop_point;
  }

  /** Transform current object into an array to store inside the IDB. */
  parseIdb() {
    let idbArray = {
      'name': this.name,
      'creator': this.creator,
      'init_point': this.init_point,
      'stop_point': this.stop_point
    }
    if (this.id){
      idbArray['id'] = this.id;
    }
    return idbArray;
  }
  /**
   * 
   * @returns {HTMLLIElement}
   */
  toHtml(){
    // Init li element
    const invEl = document.createElement("li");
    invEl.textContent = `Inventory ${this.name}`;
    // Update style
    invEl.classList.add('savedinv');
    // Store the inv id
    invEl.id = this.id;

    // Include options to handle the saved inventories (inside a span element)
    const invControls = document.createElement("span");
    // Create options
    const openBtn = document.createElement("a");
    openBtn.textContent = "open";
    openBtn.id = `open-${this.id}`;
    const downBtn = document.createElement("a");
    downBtn.textContent = "download";
    downBtn.id = `download-${this.id}`;
    const delBtn = document.createElement("a");
    delBtn.textContent = "delete";
    delBtn.id = `delete-${this.id}`;

    invControls.appendChild(openBtn);
    invControls.appendChild(downBtn);
    invControls.appendChild(delBtn);
    // Add controls to the inventory item
    invEl.appendChild(invControls);
    return invEl;
  }

  /** Save inventory info inside the inventory pannel */
  populate() {
    const info = ['name', 'creator', 'init_point', 'stop_point'];
    info.forEach((prop) => {
      // Get input to display the information
      const el = document.querySelector(`#inventory-${prop}`);
      el.value = this[prop];
    });
  }

  delete(dbHandler) {
    // Show a confirm message
    let msg = `Are you sure you want to delete the inventory "${this.name}"`
    if (confirm(msg)){
      dbHandler.deleteRecord(this.id, 'inventories');
    }
  }
}

class Inventories {
  constructor() {
    // Variable to store inventories metadata
    this.metadata = [];
    // Store the active inventory id
    this.activeid = NaN;
    // Message to display if there is a duplicated inventory name
    this.confMsg = 'There is an inv with the same name. ' +
    'If you continue the inventory metadata will be overwritten.';
  }

  async load(dbHandler) {
    // Reset variable
    this.metadata = [];
    // Get stored inventories inside IDB.
    const idbInventories = await dbHandler.getAllData('inventories');
    idbInventories.forEach((inv) => {
      const inventory = this.initInv(inv, inv.id);
      // Update past inventories and store them inside current class
      this.metadata.push(inventory);
    });
  }

  /**
   * Transform object with inventory metadata in Inventory class object.
   * 
   * Why is the id property separated? To allow init an Inventory object
   * without ID (which is only added when an Inventory is added to the IDB).
   * 
   * @param {Object} metadata One inventory metadata
   * @param {String} id Inventory IDB index
   */
  initInv(metadata, id = false) {
    try {
      return new Inventory(
        metadata.name,
        metadata.creator,
        metadata.init_point,
        metadata.stop_point,
        id
      );
    } catch (error) {
      console.log(`[Inventories.storeInv error]${error}`);
    }
  }

  show() {
    // Save HTML object to store the inventories
    const savedInvEl = document.getElementById("saved-inventories");
    // Clear the list of past invents, since we're going to re-render it.
    savedInvEl.innerHTML = "";

    // Define saved inventory's container
    const pastInvHeader = document.createElement("h2");
    pastInvHeader.textContent = "Saved inventories";

    const pastInvList = document.createElement("ul");
    // Append inventories inside the global variable to above list
    this.metadata.forEach((inv) => {
      pastInvList.appendChild(inv.toHtml());
    });

    // Append inside the saved inventory pannel all the inventories
    savedInvEl.appendChild(pastInvHeader);
    savedInvEl.appendChild(pastInvList);

    // Make "init new inventory" form inputs empty
    document.querySelectorAll('#inventory-form input')
    .forEach((inp) => {inp.value = ""});
    // Close the row panel
    document.querySelector('#rows-form').style.display = 'none';
    // Reset displayed rows
    let rows = new Rows();
    rows.ls();
    // Reset show inventory variable
    this.activeid = NaN;
  }

  /**
   * 
   * @param {HTMLInputElementArray} metadata 
   * @param {*} dbHandler 
   */
  async save(metadata, dbHandler) {
    // Handle inputs form elements with the inventory metadata
    var metadataDict = {};
    metadata.forEach((inp) => {
      // Get the key (column name from "inventories" form)
      let key = inp.id.split('-')[1];
      let value = inp.value;
      metadataDict[key] = value;
    });
    let inventory = this.initInv(metadataDict);

    // Check if there is a stored inventory with the same name + diffrnt. props
    let duplicatedInv = this.selectByName(inventory.name);

    if (duplicatedInv) {
      // Check if the duplicated metadata has duplicated properties
      if (this.checkProperties(inventory, duplicatedInv) == 0) {
        // Overwrite the inv metadata
        if (confirm(this.confMsg)){
          // Replace duplicated inventory metadata by switching the ids
          inventory['id'] = duplicatedInv['id'];
          await dbHandler.addData(inventory.parseIdb(), 'inventories');
        }
      }
    } else {
      await dbHandler.addData(inventory.parseIdb(), 'inventories');
    }
  }

  selectById(id) {
    return this.metadata.find((inv) => inv.id == id);
  }
  selectByName(name) {
    return this.metadata.find((inv) => inv.name == name);
  }
  /**
   * Return true if the two inventories have the same property values
   * 
   * @param {Inventory} newinv
   * @param {Inventory} current
   * @returns 0 if inventories are not equal and 1 if both are equals.
   */
  checkProperties(newinv, current){
    // Properties to check
    let props = ['name', 'creator', 'init_point', 'stop_point'];
    let isequal = props.reduce((prev, key) => {
      return (newinv[key] == current[key]) * prev;
    }, 1)
    return isequal;
  }

  async delete(id, dbHandler) {
    // Delete inventory from IDB
    await this.selectById(id).delete(dbHandler);
    // Delete its rows too
    // Init a new Rows element to handle rows
    let rows = new Rows();
    // Get inventory's rows
    await rows.init(id, dbHandler);
    await rows.delete(dbHandler, false);
    // Remove from Inventories.metadata
    this.metadata = this.metadata.filter((mtd) => {return mtd.id != id});
  }
}

class Rows {

  constructor() {
    this.arrays = [];
  }
   
  /**
   * 
   * @param {Number} invid 
   * @param {IndexedDBHandler} dbH 
   */
  async init(invid, dbH) {
    this.arrays = [];
    // Get stored rows inside IDB
    const invRows = await dbH.getRecords(invid, 'inventories_id', 'rows');
    // Loop over all rows and init them
    invRows.forEach((row) => {
      // Create new row element
      let newR = new Row(this.arrays, row.id, row)
      this.arrays.push(newR)
    });
  }

  show() {
    this.arrays.forEach((row) => {row.display()});
    // Show the number of rows in the legend name
    let nrows = `Rows (${this.arrays.length})`;
    document.getElementById('rows-title').textContent = nrows;
  }

  /**
   * Instead of retrieve rows from IDB, collect them inside the HTML form
   * 
   * @param {Boolean} selected If true collect only the selected rows.
   */
  collect(selected = false) {
    // Reset arrays variable
    this.arrays = [];
    // Handle the rows to select
    let selectClass = selected ? '.inv-row.selected' : '.inv-row';
    // Select each <p> element with row inputs info
    let rowsPNodeList = document.querySelectorAll(selectClass);
    // Handle rows
    rowsPNodeList.forEach((p) => {
      // Get row id
      let id = !p.dataset.id ? false : parseInt(p.dataset.id);
      // Get current row number
      let rown = selected ? parseInt(p.id.split('-')[1]) : false;
      // Get values from inputs inside p element
      // Note: Frist select the id of the row to look for all inputs elements,
      // including the #especie inside the div .autocomplete
      let inputsNodeList = document.querySelectorAll(`#${p.id} input`);
      // Store each input key:val inside an object
      let inputsDict = {};
      inputsNodeList.forEach((input) => {
        // Get inputProperty
        let key = input.id.split('-')[0];
        let val = input.value;
        // Transform all but species into numeric values
        inputsDict[key] = key == 'especie' ? val : parseInt(val);
      });

      // Create new row element
      let newR = new Row(this.arrays, id, inputsDict, rown);
      this.arrays.push(newR);
    })
  }

  emptyRow() {
    let newRow = new Row(this.arrays);
    this.arrays.push(newRow);
  }

  /** Remove all the rows inside the form */
  ls() {
    let rows = document.querySelectorAll("#rows-fieldset p");
    rows.forEach((row) => {row.remove()});
  }

  /**
   * Remove a row for html container and try to delete it from the DB.
   * When this function is applied, all the Rows.arrays array will be deleted.
   * 
   * @param {Boolean} verbose If it shows a confirmation message or not
   */
  delete(dbHandler, verbose = true) {
    if (verbose) {
      // Display a confirmation message prior to the delete function
      // (its changes are irreversible).
      let confMsg = `Are you sure you want to delete ${this.arrays.length} rows?`;
      if (confirm(confMsg)){
        this.arrays.forEach((row) => {row.delete(dbHandler);});
      }
    } else {
      this.arrays.forEach((row) => {row.delete(dbHandler);});
    }
  }

  save(invId, dbHandler) {
    this.arrays.forEach((row) => {
      let rowDict = row.parseIdb();
      rowDict['inventories_id'] = invId;
      row.save(rowDict, dbHandler);
    });
  }
}

class Row {
  /**
   * Save inventory rows
   * 
   * Add the row number (inside the row's form) too. This is like the current
   * row's index inside the rows global variable array.
   * 
   * When the id and the values are null, the row is new (it has no been
   * stored inside IDB yet).
   * 
   * @param {Rows} rows The Row.arrays element in which rows will be stored.
   * @param {Number} id Row id unique identifier inside IDB
   * @param {Object} vals Row values for the attributes inside IndexedDB rows
   * @param {Number} rown Row number, passed if new row comes from HTML box.
   * ObjectStore
   */
  constructor(rows, id = false, vals = false, rown = false) {
    // Set a row number (to select the rows and get its parameters later)
    // When the row number value is not passed, guess it by the
    // length of the currently existing rows.
    this.rown = rown ? rown : rows.length + 1;
    // Database columns
    this.cols = [
      'especie', 'n', 'd', 'di', 'dd', 'h',
      'dmay', 'dmen', 'rmay', 'rmen', 'dbh'
    ];
    if (id) {
      this.id = id;
    }
    if (vals) {
      this.cols.forEach((key) => {
        this[key] = vals[key];
      });
    }
  }

  /**
   * Transform dict row in HTML format
   *
   * Each row is inside in a <p> element. Each column is inside in a
   * <label><input> pairs.
   * 
   * @returns {HTMLObject}
   */
  toHtml(){
    // Create UI element which contains the row columns
    let newr = document.createElement('p');
    // Add the row's position in the row list
    newr.id = `rown-${this.rown}`;
    // Add style
    newr.classList.add('inv-row');
    // Add idb id
    if (this.hasOwnProperty('id')){newr.setAttribute('data-id', this.id)};

    // Define the inputs (columns) inside the row
    this.cols.forEach((key, index) => {
      // Handle text type
      let inpType = key == 'especie' ? 'text' : 'number';
      // Define input id by appending the row number
      let inpId = key + '-' + this.rown;
      // Create input element in HTML format
      let inp = document.createElement('input');
      // Add elements based on row properties
      inp.type = inpType;
      inp.id = inpId;
      inp.name = key;
      if (this.hasOwnProperty(key)) {inp.value = this[key];}
      // Set tabindex taking into account the number of rows, i.e.,
      // Actual row = 3, Current input (index+1) = 1, number of props = 11
      // Tabindex = (ninputs * nrow) + (index + 1) = 34
      inp.setAttribute('tabindex', index+1+(this.rown * this.cols.length));
      // Create placeholder
      inp.setAttribute('placeholder', key);
      // Add class to retrieve inputs later
      inp.classList.add('row-input');

      // Insert the input inside a div to handle autocomplete
      if (key == 'especie') {
        // Get all the species name as an Array
        let species = listado_especies.map((i) => {return i.especie});
        autocomplete(inp, species, this.rown);
        let divAuto = document.createElement('div');
        divAuto.classList.add('autocomplete');
        divAuto.appendChild(inp);
        newr.appendChild(divAuto);
      } else if (key == 'n') {
        inp.addEventListener('change', (el) => {
          // Add a function to catch the species name from its code
          let spCode = el.target.value;
          let spName = listado_especies
          .filter((sp) => {return sp.N == spCode})[0].especie;
          // Get the row number to select the "especie" input
          let rowN = el.target.id.split('-')[1];
          document.querySelector(`#especie-${rowN}`).value = spName;
        });
        newr.appendChild(inp);
      } else {
        newr.appendChild(inp);
      }
    });
    return(newr);
  } // end toHtml

  display() {
    const rowEl = this.toHtml();
    // Select the container to display the rows
    const box = document.querySelector('#rows-fieldset');
    box.appendChild(rowEl);
  }

  /**
   * Delete a row from the HTML container and IndexedDB.
   * 
   * @param {Number} id  The id of the row to be deleted
   * @param {IndexedDBHandler} dbHandler 
   */
  async delete(dbHandler) {
    if (this.hasOwnProperty('id')){
      await dbHandler.deleteRecord(this.id, 'rows');
    }
    // Delete the row inside HTML container (if it exists)
    let toDel = document.querySelector(`#rown-${this.rown}`)
    if (toDel){toDel.remove()};
  }

  /**
   * Create the dictionary to upload inside IndexedDB
   */
  parseIdb() {
    // Get only the DB columns (Destructuring)
    // https://stackoverflow.com/a/56592365/23551600
    let rowDict = this.cols
    .filter(key => key in this) // line can be removed to make it inclusive
    .reduce((obj2, key) => (obj2[key] = this[key], obj2), {});
    // Check for row id
    if (this.hasOwnProperty('id')){rowDict['id'] = this.id;}
    return rowDict;
  }

  save(rowDict, dbHandler) {
    dbHandler.addData(rowDict, 'rows');
  }
}

/**
 * Set autocomplete function in all the especie inputs
 * 
 * @param {HTMLInputElement} inp Text input element
 * @param {Array} arr Array of possible autocompleted values
 * @param {Number} rown Row number to select the input with the species code and fill in.
 */
function autocomplete(inp, arr, rown) {
  var currentFocus;
  // Execute a function when someone writes in the text field
  inp.addEventListener("input", function (e) {
    // Get the input values
    var a, b, i, val = this.value;
    // close any already open lists of autocompleted values
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
    // create a DIV element that will contain the items (values)
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    // append the DIV element as a child of the autocomplete container
    this.parentNode.appendChild(a);
    // for each item in the array...
    for (i = 0; i < arr.length; i++) {
      let arrItem = arr[i].substr(0, val.length);
      // check if the item starts with the same letters as the inp. val.
      if (arrItem.toUpperCase() == val.toUpperCase()) {
        // Create a DIV element for each matching element
        b = document.createElement("DIV");
        // make the matching letters bold
        b.innerHTML = "<strong>" + arrItem + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        // insert a input field that will hold the current array item's value
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        // execute a function when someone clicks on the item value (DIV element)
        b.addEventListener("click", function(e) {
          // insert the value for the autocomplete text field
          inp.value = this.getElementsByTagName("input")[0].value;
          // close the list of autocompleted values,
          // (or any other open lists of autocompleted values
          closeAllLists();
          // Get the code of the species
          let espCode = listado_especies
          .filter((esp) => {return esp.especie == inp.value})[0].N;
          document.querySelector(`#n-${rown}`).value = espCode;
        });
        a.appendChild(b);
      }
    }
  });
  // execute a function presses a key on the keyboard
  inp.addEventListener("keydown", function(e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40 || e.code == 'ArrowDown') {
      // If the arrow DOWN key is pressed,
      // increase the currentFocus variable
      currentFocus++;
      // and and make the current item more visible
      addActive(x);
    } else if (e.keyCode == 38 || e.code == 'ArrowUp') { //up
      /* If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13 || e.code == 'Enter') {
      // If ENTER key, prevent the form from being submitted
      e.preventDefault();
      if (currentFocus > -1) {
        // and simulate a click on the "active" item
        if (x) x[currentFocus].click();
      }
    }
  });
  /** Classify an item as "active" */
  function addActive(x) {
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  /** Remove the "active" class from all autocomplete items */
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  /** Close all autocomplete lists in the document, except the one
   * passed as argument.
  */
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}
