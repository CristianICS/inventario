class Row {

  constructor(rn) { // Row number
    
    this.especie = '<input type="text" id="inv-esp-' + rn + '" name="esp">';
    this.N = '<input type="number" id="inv-n-' + rn + '" name="N" onchange="main.writeEsp(this)">';
    this.D = '<input type="number" id="inv-d-' + rn + '" name="D">';
    this.di = '<input type="number" id="inv-di-' + rn + '" name="di">';
    this.dd = '<input type="number" id="inv-dd-' + rn + '" name="dd">';
    this.h = '<input type="number" id="inv-h-' + rn + '" name="h">';
    this.dmay = '<input type="number" id="inv-dmay-' + rn + '" name="DM">';
    this.dmen = '<input type="number" id="inv-dmen-' + rn + '" name="Dm">';
    this.rmay = '<input type="number" id="inv-rmay-' + rn + '" name="rmay">';
    this.rmen = '<input type="number" id="inv-rmen-' + rn + '" name="rmen">';
    this.dbh = '<input type="number" id="inv-dbh-' + rn + '" name="dbh">';
  }

  createHTML(){
    let new_r = [];
    let elements = Object.values(this);
    for(var i = 0; i < elements.length; i++){
      // Print 5 last column with background color
      if (i >= 6 & i < 8){
        new_r.push('<td class="lt2cm">' + elements[i] + '</td>');
      } else if (i >= 8) {
        new_r.push('<td class="mt2cm">' + elements[i] + '</td>');
      } else {
        new_r.push('<td>' + elements[i] + '</td>');
      }
    }
    return(new_r.join(""));
  }
}

// Functions to handle the app basic behaviour
var main = {

  /**
   * Collapse/expand subsontent chunks
   * ===================================
   * The APP frame is divided between some subcontent blocks. This function
   * expand/collapse each of these blocks.
   * 
   * The function is inserted in HTML subcontend block arrows, inside its
   * 'onclick' attribute.
   * 
   * @param {String} id Identifier from DIV to collapse/expand
   * @param {HTMLElement} arrow Arrow html object
   */
  acordeon(id, arrow){
    // Get div which info will collapse/expand
    let div = document.getElementById('sub-' + id);
    if (div.classList.contains('expand')){
     
      // COLLAPSE
      div.classList.remove('expand');
      // Modify arrow direction
      arrow.childNodes[0].classList.remove('up');
      arrow.childNodes[0].classList.add('down');
    
    } else {
      // EXPAND
      div.classList.add('expand');
      // Modify arrow direction
      arrow.childNodes[0].classList.remove('down');
      arrow.childNodes[0].classList.add('up');
    }
  },

  /**
   * Write veg name when N is chosen
   * ================================
   * Function inside the onchange attribute on every N rows. Search the species
   * that match with N ID and write its name inside 'Especie' row. 
   * 
   * @param {HTMLElement} selected_element input element inside a td tag
   * @param {String} rid Use when the function is called inside inv.write
   * @param {String} n veg code uses when the function is called inside inv.write
   */
  writeEsp(selected_element, rid = false, n = false){
    
    if (!rid & !n) {
      // Get row ID
      var rid = selected_element.id.split('-')[2];
      // Get N
      var n = selected_element.value;
    }

    // Select the input inside 'Especie' row
    let especie = document.getElementById('inv-esp-' + rid);
    // Search species name and write it inside above container
    especie.value = search.filter(Number(n));

  }

}

// Object with functions to search inside JSON with list of species
var search = {

  /**
   * Retrieve partial match filter
   * ================================
   * Return all the species names which match with the string inserted inside
   * Search species bar. Create a menu with all the matches.
   */
  species(){

    // Get the species name tap by the user
    let search_val = document.getElementById('searchbar').value;
    search_val = search_val.toLowerCase();

    let searchField = "especie";

    // HTML element to store the dropdown
    let div = document.querySelector('#list-holder');
    div.innerHTML = ""; // Reset prior search
    
    // Iterate through species JSON to search one by one
    for (i = 0; i < listado_especies.length; i++) {
      // Species to compare
      let species = listado_especies[i];

      // When the species contain the target string insert it inside the HTML dropdown
      if (species[searchField].toLowerCase().includes(search_val)) {
        const elem = document.createElement("li")
        elem.innerHTML = `${species.N} - ${species.especie}`
        div.appendChild(elem)
      }
    }
  },

  /**
   * Delete all search matches
   * ===========================
   * Function inside cross icon in the search species bar. When user click the
   * cross all the elements are deleted. 
   */
  clear(){
    let x = document.querySelector('#list-holder');
    x.innerHTML = "";
  },

  /**
   * Perform a filter that return the perfect match
   * ===============================================
   * Return the species name that match with species ID inserted inside
   * N row.
   * 
   * @param {String} esp_id 
   * @returns 
   */
  filter(esp_id){
    var result = listado_especies.filter(function(e){
      return e.N == esp_id;
    });
    return result[0].especie;
  }
}


// Object that handle all the functios related with the main form (inventario)
var inv = {

  /**
   * Get data from inv rows
   * =================================
   *
   * @returns Row data in JSON
   */
  collect(){

    // Get all HTML inv rows
    let html_rows = document.querySelectorAll('.inv-rows');
    // Store rows in JSON format
    let json_rows = [];

    // Transform all rows in JSON
    for(let i = 0; i < html_rows.length; i ++){
      
      // Get row id from data-id attribute
      let rowid = html_rows[i].dataset.rowid;
      // Get the unique id to store the row inside IDB
      let idbid = html_rows[i].dataset.idbid;
      
      // Get row data
      let n = document.getElementById(`inv-n-${rowid}`).value;
      let d = document.getElementById(`inv-d-${rowid}`).value;
      let di = document.getElementById(`inv-di-${rowid}`).value;
      let dd = document.getElementById(`inv-dd-${rowid}`).value;
      let h = document.getElementById(`inv-h-${rowid}`).value;
      let dmay = document.getElementById(`inv-dmay-${rowid}`).value;
      let dmen = document.getElementById(`inv-dmen-${rowid}`).value;
      let rmay = document.getElementById(`inv-rmay-${rowid}`).value;
      let rmen = document.getElementById(`inv-rmen-${rowid}`).value;
      let dbh = document.getElementById(`inv-dbh-${rowid}`).value;
      let inv_id = document.getElementById('inv-id').value.toUpperCase();



      // Store inside a JSON dict with the same keys as IDB rows ObjectStore
      json_data = {
        id: idbid,
        row_id: Number(rowid),
        inv_id: inv_id,
        n: Number(n),
        d: Number(d),
        di: Number(di),
        dd: Number(dd),
        h: Number(h),
        dmay: Number(dmay),
        dmen: Number(dmen),
        rmay: Number(rmay),
        rmen: Number(rmen),
        dbh: Number(dbh)
      }

      json_rows.push(json_data);
    }

    return(json_rows);
  },

  /**
   * Upload rows to IndexedDB
   * ==========================
   */
  save(){
    // Check the form ID
    let form_id = document.getElementById('inv-id').value.toUpperCase();
    if(form_id.length == 0){
      alert("Atenci\u{00F3}n: El ID del inventario no puede estar vac\u{00ED}o.");
      return false;
    }

    // 2. Rows
    let json_rows = this.collect();

    // Add data into the IndexedDB
    idb.addData(json_rows, 'rows', 'id');
  },

  /**
   * Count the number of rows in inventario
   * ===========================================
   * @returns Number of rows
   */
  countRows(){
    let rows = document.getElementsByClassName("inv-rows");
    let nrows = rows.length;
    return(nrows);
  },
  
  /**
   * Create new Row
   * ===============
   * Initialize a new Row class and include it inside the main form tr element.
   * 
   * The optional argument is passed when the function is fired inside
   * the upload function.
   * 
   * @param {Strin} rid Row id
   */
  addRow(rid = false){
    
    if(!rid) {
      // Count existing rows and sum 1 to get the new id
      var rid = this.countRows() + 1;
    }
    // Create new tr element which contains the row
    let newr = document.createElement('tr');
    // Add an unique ID to store row inside IDB
    var idbid = new Date().getTime();
    newr.dataset.idbid = String(idbid);
    // Customize element
    newr.classList.add('inv-rows');
    // Add id row
    newr.dataset.rowid = rid;
    newr.setAttribute("onclick", "inv.selectRow(this)");

    // Add row contet
    let row_content = new Row(rid).createHTML();
    newr.innerHTML = row_content;

    // Append row to the table
    let table = document.getElementById("inventario");
    table.appendChild(newr);
  },

  /**
   * Select/Unselect a row
   * ======================================
   * Modifiy the classList of a tr element to change its background color.
   * This function is inside onclick tag on <tr> element.
   * 
   * @param {HTMLElement} row <tr> element to select
   */
  selectRow(row){
    // if selected is set, remove it. Otherwise add it
    row.classList.toggle('selected');
  },

  /**
   * Remove rows
   * ===============
   * Delete rows from main table. The row must have been selected, i.e, these
   * must contain .selected class.
   */
  removeRow(){
    // Get selected row/rows
    let rows = document.querySelectorAll('.selected');
    // Remove each row
    if(rows.length > 0){
      if(confirm("Do you want to delete selected row/rows?")){
        for(let i = 0; i < rows.length; i++){
          
          let id = rows[i].dataset.idbid;
          idb.removeRow(id, ()=> {
            // If transaction is completed, delete row
            rows[i].remove();
          })
        }
      }
    } else {
      alert("Select row(s) to delete.")
    }
  },

  /**
   * Display menu to insert images
   * ==============================
   */
  takePicture(){
    document.querySelector('.block-div').style.display = "block";
    document.querySelector('.picture-box').style.display = "block";
  },

  /**
   * Convert image into base64 URL and previsualize it
   * ===================================================
   * Transform the image into a base64 format and save its metadata inside a
   * div to retrieve its later if the user wants to insert the image inside IDB.
   *
   * The image conversion is made inside a FileReader object. The transformation 
   * is done by readAsDataURL method.
   *
   * @param {String} input_id: The input type file ID that contain the image file
   */
   previewFile(input_id) {

    // Input with image file
    let file_input = document.getElementById(input_id);
    let file = file_input.files[0];

    // Get the extension and save it
    let extension = file.name.split('.')[1];
    
    // Select the div in which the image will display
    let preview = document.getElementById('img-preview');
    preview.setAttribute('data-extension', extension);

    // Create file reader to handle image src
    let reader = new FileReader();

    // This code will activate when reader.readAsDataURL function is completed.
    reader.addEventListener("load", function () {
        preview.src = reader.result;
    }, false);

    // Make sure `file.name` matches extensions criteria
    if ( /\.(jpe?g|png)$/i.test(file.name)) {
        // convert image file to base64 string
        reader.readAsDataURL(file);
    } else {
      alert("Please, insert an image with a valid extension (jpg or png).")
    }
  },

  /**
  * Upload the image metadata inside IDB
  * ======================================
  * Create a JSON with image metadata plus its base64 src and upload data to
  * IndexedDB.
  * 
  * Plus: If compress is true, compress the image.
  *
  * Image metadata JSON contains this properties:
  *  1: id (composed with the capture's date)
  *  1: src (in base64)
  *  2: extension
  *  3: row_id (the row which the image is linked)
  *  4: inv_id (inventario inside the image is stored)
  *  4: capture_date
  *  5: size (bit size)
  *
  */
  digestImage(compress = false) {

    // Blank image metadata dictionary
    let img = {};

    // Select the preview image div inside all image metadata is stored
    let img_div = document.getElementById("img-preview");
    
    let src_original = img_div.src
    // Check if there is an image
    if (src_original.length < 50) {
        alert("Atenci\u{00F3}n: Ninguna imagen seleccionada.")
        return false;
    }
    
    // Save the extension in jsn object
    img.extension = img_div.dataset.extension;

    if (compress) {
      // 1. Create canvas and write original image src
      let originalCanvas = document.createElement('canvas');

      // Save original image dimensions divided by 2 and resize the canvas with them
      let origiWidth = img_div.naturalWidth/2;
      let origiHeight = img_div.naturalHeight/2;
      originalCanvas.width = origiWidth;
      originalCanvas.height = origiHeight;

      // 2. Draw Image
      let ctxOriginal = originalCanvas.getContext("2d");
      ctxOriginal.drawImage(img_div, 0, 0, origiWidth, origiHeight);

      // 3. Compress image (50% relative to original image but with the same dimensions)
      if(img.extension === "png"){
        img.src = originalCanvas.toDataURL("image/png", 0.5);
      } else {
          img.src = originalCanvas.toDataURL("image/jpeg", 0.5);
          // Extensions != png, jpeg
          img.extension = 'jpeg';
      }

      // 4. Remove canvas object
      originalCanvas.remove();

    } else {
      // If compress option is not selected, store original image
      img.src = src_original;
    }

    // Get the byte size of compressed image
    let size = img.src.split(",")[1].split("=")[0];
    let strLength = size.length;
    let fileLength = strLength - (strLength / 8) * 2;
    img.size = Math.floor (fileLength);

    // Add ID constructed by the inserted image time in miliseconds since midnight, 1 Jan 1970
    img.id = Number(new Date().getTime());
    img.capture_date = new Date(img.id).toJSON();

    // Select the row_id linked with the image
    let row = document.querySelectorAll('.selected');
    if(row.length == 1){
      // Get the unique key ID
      img.row_id = Number(row[0].dataset.idbid);
    } else {
      alert(`Atenci\u{00F3}n: Selecciona la fila (solo una) a la que a\u{00F1}adir la imagen.`);
      return false;
    }

    // Save the form ID
    let inv_id = document.getElementById('inv-id').value.toUpperCase();
    if(inv_id.length == 0){
      alert("Atenci\u{00F3}n: El ID del inventario no puede estar vac\u{00ED}o.");
      return false;
    } else {
      img.inv_id = inv_id
    }

    // Add image data inside IDB
    idb.addData([img], 'images', 'id');
  },

  /**
   * Write stored metadata
   * ========================
   * It is called inside idb.uploadInv() function.
   * 
   * @param {json} rows Dict with the rows to write which are stored in IDB 
   */
  write(rows) {
    if (rows.length > 0) {
      
      // Remove existing rows
      let ancient_rows = document.querySelectorAll('.inv-rows');
      ancient_rows.forEach((r)=>{r.remove()});

      rows.forEach((row) => {
        let rowid = row.row_id;
        let idbid = row.id;

        // Create a new row
        this.addRow(rowid);

        // Add stored elements
        main.writeEsp(false, rowid, row['n']);
        document.getElementById(`inv-n-${rowid}`).value = row['n'];
        document.getElementById(`inv-d-${rowid}`).value = row['d'];
        document.getElementById(`inv-di-${rowid}`).value = row['di'];
        document.getElementById(`inv-dd-${rowid}`).value = row['dd'];
        document.getElementById(`inv-h-${rowid}`).value = row['h'];
        document.getElementById(`inv-dmay-${rowid}`).value = row['dmay'];
        document.getElementById(`inv-dmen-${rowid}`).value = row['dmen'];
        document.getElementById(`inv-rmay-${rowid}`).value = row['rmay'];
        document.getElementById(`inv-rmen-${rowid}`).value = row['rmen'];
        document.getElementById(`inv-dbh-${rowid}`).value = row['dbh'];

        // Add unique id to the row
        let tr = document.getElementById(`inv-n-${rowid}`).parentElement.parentElement;
        tr.dataset.idbid = idbid;
      })
    }
  }
}

// Object to store functions related with inv metadata
var metadata = {

  id: false,
  date: false,
  p_init: false,
  p_end: false,
  comments: false,

  /**
   * Retrieve info from metadata table
   * ================================
   * @returns Metadata in JSON
   */
  collect(){
    this.id = document.getElementById('inv-id').value.toUpperCase();
    this.date = document.getElementById('inv-date').value;
    this.p_init = Number(document.getElementById('inv-init').value);
    this.p_end = Number(document.getElementById('inv-end').value);
    this.commentsmts = document.getElementById('inv-comments').value;
  },

  /**
   * Block the input elements inside metadata table
   * ===============================================
   * When the user save the inv metadata, this function is fired to avoid user
   * updates these parameters. The metadata.id is the key to classify rows inside
   * IDB. If this parameter changes during the session, inv rows will be classified
   * inside different invs.
   */
  blockInputs(all = false){
    
    document.getElementById('inv-id').setAttribute('disabled', 'true');
    
    if (all) {
      document.getElementById('inv-date').setAttribute('disabled', 'true');
      document.getElementById('inv-init').setAttribute('disabled', 'true');
      document.getElementById('inv-end').setAttribute('disabled', 'true');
      document.getElementById('inv-comments').setAttribute('disabled', 'true');
    }
  },

  /**
   * Upload metadata to IndexedDB
   * =============================
   * 
   */
  save(){
    if(confirm("Una vez se guarde el ID no se podr\u{00E1}n modificar.\nSi est\u{00E1} seguro pulse continuar.")) {
      
      // Add metadata rows inside this object
      this.collect();
      this.blockInputs();

      let data = {
        inv_id: this.id.toUpperCase(),
        date: this.date,
        pinit: this.p_init,
        pend: this.p_end,
        comments: this.comments
      }

      // prevent to add blank metadata ID
      if(data.inv_id.length > 0){
        // Store data inside IDB
        idb.addData([data], 'inv_metadata', 'inv_id');
      } else {
        alert("Atenci\u{00F3}n: El ID del inventario no puede estar vac\u{00ED}o.");
      }
    }
  },

  /**
   * Write stored metadata
   * ========================
   * It is called inside idb.uploadInv() function.
   * 
   * @param {json} metadata Dict with the metadata to write which is stored in IDB 
   */
  write(metadata) {
    console.log(metadata);
    document.getElementById('inv-id').value = metadata['inv_id'];
    document.getElementById('inv-date').value = metadata['date'];
    document.getElementById('inv-init').value = metadata['pinit'];
    document.getElementById('inv-end').value = metadata['pend'];
    document.getElementById('inv-comments').value = metadata['comments'];

    this.collect();
  }

}

// Objects to store download functions
var download_data = {
  
  /**
   * Transform Array of JSON rows into csv like array
   * ===============================================
   * Example input data:
   * [{colnames in json}, {row1 in json}]
   *
   * Example output:
   * [[colnames sep by colons], [row1 values], [row2 values] ...]
   *
   * This formula is used inside download_data.inventario()
   *
   * @param {Array} json
   */
  jsonToArray(json){
    // Get colnames
    // IMPORTANT: All the keys stored in the json inside the array MUST BE EQUALS
    let array = [Object.keys(json[0])];
    
    // Get row values
    json.forEach((row) => {
      let values = Object.values(row)
      array.push(values);
    });

    return(array)
  },

  /**
   * Transform the downloaded zip url into a promise
   * ===============================================
   * From FileSaver.js
   * 
   * Fetch the content and return the associated promise.
   * 
   * @param {String} url the url of the content to fetch.
   * @return {Promise} the promise containing the data.
   */
  urlToPromise(url) {
    return new Promise(function(resolve, reject) {
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
  },

  /**
   * Save inventario info
   * ===========================================
   *
   * Download metadata, inv rows and images inside a zip folder:
   * 
   * 1. Transform IDB array (metadata and form) into csv
   * 2. Insert prior data into a function to compress files in a zip folder
   * 
   * Note: All IDB function reuturn the data in a callback, and
   * we retrieve that with a callback function.
   *
   */
  inv(inv_id){

    if (!inv_id) {
      alert("El ID del inventario no puede estar en blanco.");
      return;
    }
     
    // 1. EXPORT METADATA
    idb.getAllData("inv_metadata", inv_id, false, function(result){
      
      if(result.length > 0){

        // Transform data into an array
        let rows = download_data.jsonToArray(result);
        // Create csv (https://stackoverflow.com/a/14966131)
        var csvContent_metadata = rows.map(e => e.join(",")).join("\n");

        /*
        // Export with custom name (Prior version - outside zip folder)
        var encodedUri_metadata = encodeURI("data:text/csv;charset=utf-8," + csvContent_metadata);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download_data", `${inv_id}_metadata.csv`);
        document.body.appendChild(link); // Required for FF
        link.click(); // This will download the data
        */

        // 2. EXPORT INV ROWS
        idb.getAllData("rows", inv_id, 'inv_id', function(result){

          if(result.length > 0){

            // Transform data into an array
            let rows = download_data.jsonToArray(result);
            // Create csv (https://stackoverflow.com/a/14966131)
            var csvContent_form = rows.map(e => e.join(",")).join("\n");

            /*
            // Export with custom name (Prior version - outside zip folder)
            var encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent_form);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download_data", `${inv_id}.csv`);
            document.body.appendChild(link); // Required for FF
            link.click(); // This will download the data
            */

            // Prepare data to download
            let downloaded_data = [
              {'name': 'inventario_' + inv_id + '.csv', 'content': csvContent_form},
              {'name': 'metadatos_' + inv_id + '.csv', 'content': csvContent_metadata}
            ]

            // Try to download images and then use function compressFiles()
            download_data.images(inv_id, downloaded_data, download_data.compressFiles)

          }
        })
      }
    });
  },

  /**
   * Get images from IDB
   * =====================
   * Get all images inside the DB that link with inv_id to export.
   * 
   * @param {Text} inv_id 
   * @param {Array} downloaded_data
   * @param {Function} callback 
   */
  images(inv_id, downloaded_data, callback){

    // Retrieve data from IDB
    idb.getAllData("images", inv_id, "inv_id", function(result){
      console.log('downloadImages result: ', result);
      if (result.length > 0) {
        callback(downloaded_data, inv_id, result);
      } else {
        callback(downloaded_data, inv_id, false);
      }
    });
  },

  /**
   * Compress csv and images 
   * =========================
   * @param {*} files 
   * @param {*} inv_id
   * @param {*} images 
   */
  compressFiles(files, inv_id, images = false){
    // Create zip foldername
    let zip_filename = inv_id+ '.zip';
    var zip = new JSZip();
    
    files.forEach((file)=>{
      zip.file(file['name'], file['content']);
    })

    if(images){
      // All images are inside images/ subfolder
      zip.folder("images");

      // Download each image inside the folder
      images.forEach((i) => {
        let name = [i.row_id, i.capture_date.substr(0, 10), i.id];
        name = name.join('_') + '.' + i.extension;

        zip.file('images/' + name, download_data.urlToPromise(i.src), {binary: true});
      });
    }

    console.log('Generate download task...');
    zip.generateAsync({type: 'blob'}, (metadata) => {
        console.log(metadata);
        if(metadata.currentFile) {
          console.log("Current file = " + metadata.currentFile)
        }
    })
    .then(
      (blob) => {
        console.log('Downloading folder...')
        saveAs(blob, zip_filename);
      }, (e) => {
        console.log(e)
      }
    );
  },

  /**
   * Download images individually
   * =============================
   * (deprecated)
   */
  downloadImagesByOne(){
    var a = document.createElement("a"); //Create <a>
    a.href = "data:image/png;base64," + ImageBase64; //Image Base64 Goes here
    a.download = "Image.png"; //File name Here
    a.click(); //Downloaded file
  }
}


// Close the .float-box when user clicks outside its frame
addEventListener("click", (event) => {
  // Conditions to not show .float-box
  // 1. Click outside the box
  let out_box = !event.target.classList.contains('float-box')
  // 2. Not click in the buttons that display the boxes
  let btn_picture = !event.target.id == "img-btn" || event.target.id.length == 0;

  if(out_box && btn_picture){
    document.querySelectorAll('.float-box').forEach((item) => {
      item.style.display = 'none';
    })
    document.querySelector('.block-div').style.display = "none"
  }
});

var sw = {
  available: false,
  /**
   * Init Service Worker
   * ===================
   */
  init(){
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register("sw.js").then(()=>{
          this.available = true;
          document.querySelector('.service-worker').classList.add("success");
      })
      .catch((event)=>{
          console.error(event);
          document.querySelector('.service-worker').classList.add("error");
      })
    }
  }
}
