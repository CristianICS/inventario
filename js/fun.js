class Row {

  constructor(rn) { // Row number
    this.especie = '<input type="text" id="inv-esp-' + rn + '" name="esp">';
    this.N = '<input type="number" id="inv-n-' + rn + '" name="N" onchange="writeEsp(this)">';
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


/**
 * Create dropdown with veg list
 * ===================================================
 * @param {*} json JSON veg list
 */
var renderJSONDropdown = function(json) {
  var dropdown = document.getElementById('especies');
  for (var i = 0; i < json.length; i++) {
    var record = json[i];
    var entry = document.createElement('option')
    entry.value = record.N;
    entry.text = String(record.N) + ' - ' + record.especie;
    dropdown.append(entry);
  }
};

/**
 * Collapse/expand subsontent chunks
 * ===========================
 * @param {String} id Identifier from DIV to collapse/expand
 * @param {HTMLElement} arrow Arrow html object
 */
var acordeon = function(id, arrow){
  // Get div to collapse/expand
  let d = document.getElementById('sub-' + id);
  if (d.classList.contains('expand')){
    // COLLAPSE
    d.classList.remove('expand');
    // Modify arrow direction
    arrow.childNodes[0].classList.remove('up');
    arrow.childNodes[0].classList.add('down');
  } else {
    // EXPAND
    d.classList.add('expand');
    // Modify arrow direction
    arrow.childNodes[0].classList.remove('down');
    arrow.childNodes[0].classList.add('up');
  }
}

/**
 * Write veg name when N is chosen
 * ================================
 * Function inside the onchange tag on every
 * N rows.
 * @param {HTMLElement} selected_element
 */
var writeEsp = function(selected_element){
  // Get row ID
  let rid = selected_element.id.split('-')[2];
  // Select the Especie input
  let especie = document.getElementById('inv-esp-' + rid);
  // Write esp inside above container
  especie.value = search.filter(Number(selected_element.value));
}

/**
 * Count the number of rows inside Ficha table
 * ===========================================
 * @returns Number of rows inside Ficha
 */
var countRows = function(){
  let rows = document.getElementsByClassName("inv-rows");
  let nrows = rows.length;
  return(nrows);
}

/**
 * Create new Row
 * ===============
 * Initialize a new Row class and include it
 * inside a tr element. Then appen it to the
 * Ficha table.
 */
var addRow = function(){
  // Count existing rows
  let nrows = countRows() + 1;
  // Create new row
  let newr = document.createElement('tr');
  newr.classList.add('inv-rows');
  newr.dataset.rowid = nrows;
  newr.setAttribute("onclick", "selectRow(this)");

  let row_content = new Row(nrows).createHTML();
  newr.innerHTML = row_content;

  // Append row to the table
  let table = document.getElementById("inventario");
  table.appendChild(newr);
}

/**
 * Modifiy the classList of a tr element
 * ======================================
 * This function is inside onclick tag on <tr> element.
 * @param {HTMLElement} r <tr> element to select
 */
var selectRow = function(r){
  // if selected is set remove it, otherwise add it
  r.classList.toggle('selected');
}

/**
 * Remove row/rows
 * ===============
 * The row/rows must have been selected.
 */
var removeRow = function(){
  // Get selected row/rows
  let rows = document.querySelectorAll('.selected');
  if(rows.length > 0){
    if(confirm("Do you want to delete selected row/rows?")){
      for(let i = 0; i < rows.length; i++){
        rows[i].remove();
      }
    }
  } else {
    alert("Select one row to delete.")
  }
}

/**
 * Convert image into base64 URL
 * ============================
 * Get the file uploaded into the
 * input type 'file' from the form
 * and transfom its into base64 URL.
 *
 * Then add this URL in an `<img>`
 * object to preview the image.
 *
 * The transformation is done by readAsDataURL
 * method applied to a new FileReader Object.
 *
 * @param {String} inputID: The input type file ID that contain the image file
 */
var previewFile = function(inputID) {
  let preview = document.getElementById('img-preview');
  let file_input = document.getElementById(inputID);
  let file = file_input.files[0];

  // Get the extension and save it
  let extension = file.name.split('.')[1];
  preview.setAttribute('data-extension', extension);
  // Add cature time in miliseconds since midnight, 1 Jan 1970
  preview.setAttribute('data-time', new Date().getTime()) 
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
  }
}

/**
* Create an object with image parameters
* ======================================
* Return an object with image parameters
* into a JSON object.
* 
* Plus: The image is COMPRESSED
*
* It creates this properties:
*  1: id (composed with the capture's date)
*  1: src (in base64)
*  2: extension
*  3: row_id (the row which the image is linked)
*  4: form_id 
*  4: capture_date
*  5: size (bit size)
*
*/
var digestImage = function() {
  let img = {};

  // Preview image object
  let img_div = document.getElementById("img-preview");
  let src_original = img_div.src

  // Check if there is an image
  if (src_original.length < 50) {
      alert("Atenci\u{00F3}n: Ninguna imagen seleccionada.")
      return false;
  }

  // 1. Create canvas and write preview image object
  let originalCanvas = document.createElement('canvas');

  // Save original image dimensions divided by 3 and resize the canvas with them
  let origiWidth = img_div.naturalWidth/3;
  let origiHeight = img_div.naturalHeight/3;
  originalCanvas.width = origiWidth;
  originalCanvas.height = origiHeight;

  // Draw Image
  let ctxOriginal = originalCanvas.getContext("2d");
  ctxOriginal.drawImage(img_div, 0, 0, origiWidth, origiHeight);

  // Save the extension in jsn object
  img.extension = img_div.dataset.extension;

  // 3. Save compressed original image in jsn object
  // (compress 50% relative to original image but with the same dimensions)
  if(img.extension === "png"){
      img.src = originalCanvas.toDataURL("image/png", 0.5);
  } else {
      img.src = originalCanvas.toDataURL("image/jpeg", 0.5);
      // Extensions != png, jpeg
      img.extension = 'jpeg';
  }

  // Get the byte size of compressed image
  let size = img.src.split(",")[1].split("=")[0];
  let strLength = size.length;
  let fileLength = strLength - (strLength / 8) * 2;
  img.size = Math.floor (fileLength);

  // 4. Remove canvas object
  originalCanvas.remove();

  // 5. Add remaining attributes
  img.id = Number(img_div.dataset.time);
  img.capture_date = new Date(img.id).toJSON();

  // Select the row_id inside the image is refered
  let row = document.querySelectorAll('.selected');
  if(row.length == 1){
    img.row_id = row[0].dataset.rowid
  } else {
    alert(`Atenci\u{00F3}n: Selecciona la fila a la que a\u{00F1}adir la imagen.`);
    return false;
  }

  // Select and save the form ID
  let form_id = document.getElementById('inv-id').value.toUpperCase();
  if(form_id.length == 0){
    alert("Atenci\u{00F3}n: El ID del inventario no puede estar vac\u{00ED}o.");
    return false;
  } else {
    img.inv_id = form_id
  }

  idb.addData([img], 'images', 'id');
}

var takePicture = function(){
  document.querySelector('.block-div').style.display = "block";
  document.querySelector('.picture-box').style.display = "block";
}

/**
 * Retrieve info from metadata table
 * ================================
 * @returns Metadata in JSON
 */
var collectMetadata = function(){
  let id = document.getElementById('inv-id').value.toUpperCase();
  let date = document.getElementById('inv-date').value;
  let pinit = document.getElementById('inv-init').value;
  let pend = document.getElementById('inv-end').value;
  let cmts = document.getElementById('inv-comments').value;

  return({
    inv_id: id.toUpperCase(),
    date: date,
    pinit: Number(pinit),
    pend: Number(pend),
    comments: cmts
  })
}

/**
 * Get data from a row inside Ficha
 * =================================
 *
 * @param {Text} rowid The row id from which the data must be retrieved
 * @returns Row data in JSON
 */
var collectRowData = function(rowid){

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

  return(
    {
      id: Number(new Date().getTime()),
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
  )
}

/**
 * Upload metadata to IndexedDB
 * ==========================
 */
var saveMetadata = function(){
  if(confirm("Si ya existe un inventario con el mismo ID se actualizará, continuar? ")) {
    let metadata = collectMetadata();
    // prevent to add blank metadata ID
    if(metadata.inv_id.length > 0){
      idb.addData([metadata], 'inv_metadata', 'inv_id');
    } else {
      alert("Atenci\u{00F3}n: El ID del inventario no puede estar vac\u{00ED}o.");
    }
  }
}

/**
 * Upload table rows to IndexedDB
 * ==========================
 */
var saveForm = function(){
  // Check the form ID
  let form_id = document.getElementById('inv-id').value.toUpperCase();
  if(form_id.length == 0){
    alert("Atenci\u{00F3}n: El ID del inventario no puede estar vac\u{00ED}o.");
    return false;
  }

  // 2. Rows
  let html_rows = document.querySelectorAll('.inv-rows');
  let json_rows = [];

  for(let i = 0; i < html_rows.length; i ++){
    let rowid = html_rows[i].dataset.rowid;
    let json_data = collectRowData(rowid);
    json_rows.push(json_data);
  }

  // Add data into the IndexedDB
  idb.addRows(json_rows);
}

/**
 * Transform Array of JSON rows into csv like array
 * ===============================================
 * Example data:
 * [{colnames in json}, {row1 in json}]
 *
 * Example output:
 * [[colnames sep by colons], [row1 values], [row2 values] ...]
 *
 * This formula is used inside downloadForm()
 *
 * @param {Array} json
 */
var jsonToArray = function(json){
  // Get colnames
  // IMPORTANT: All the keys stored in the json inside the array MUST BE EQUALS
  let array = [Object.keys(json[0])];
  // Get rownames
  json.forEach((row) => {
    let values = Object.values(row)
    array.push(values);
  });

  return(array)
}

/**
 * Save form data/metadata in two CSVs
 * ===================================
 *
 * Download metadata, form and images inside a zip folder:
 * 
 * 1. Transform IDB array (metadata and form) into csv
 * 2. Insert prior data into a function to compress files in a zip folder
 * 
 * Note: All IDB function reuturn the data in a callback, and
 * we retrieve that with a callback function.
 *
 */
var downloadForm = function(form_id){
  // 1. EXPORT METADATA
  idb.getAllData("inv_metadata", form_id, false, function(result){
    if(result.length > 0){

      // Transform data into an array
      let rows = jsonToArray(result);
      // Create csv (https://stackoverflow.com/a/14966131)
      var csvContent_metadata = rows.map(e => e.join(",")).join("\n");

      /*
      // Export with custom name (Prior version - outside zip folder)
      var encodedUri_metadata = encodeURI("data:text/csv;charset=utf-8," + csvContent_metadata);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${form_id}_metadata.csv`);
      document.body.appendChild(link); // Required for FF
      link.click(); // This will download the data
      */

      // 2. EXPORT FORM ROWS
      idb.getAllData("rows", form_id, 'inv_id', function(result){

        if(result.length > 0){

          // Transform data into an array
          let rows = jsonToArray(result);
          // Create csv (https://stackoverflow.com/a/14966131)
          var csvContent_form = rows.map(e => e.join(",")).join("\n");

          let download_data = 
          [
            {'name': 'inventario_' + form_id + '.csv', 'content': csvContent_form},
            {'name': 'metadatos_' + form_id + '.csv', 'content': csvContent_metadata}
          ]

          // Try to download images and then use function compressFiles()
          downloadImages(form_id, download_data, compressFiles)

          /*
          // Export with custom name (Prior version - outside zip folder)
          var encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent_form);
          var link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `${form_id}.csv`);
          document.body.appendChild(link); // Required for FF
          link.click(); // This will download the data
          */
        }
      })
    }

  });
}

/**
 * Fetch the content and return the associated promise.
 * @param {String} url the url of the content to fetch.
 * @return {Promise} the promise containing the data.
 * 
 * From FileSaver.js
 */
function urlToPromise(url) {
  return new Promise(function(resolve, reject) {
      JSZipUtils.getBinaryContent(url, function (err, data) {
          if(err) {
              reject(err);
          } else {
              resolve(data);
          }
      });
  });
}

/**
 * Compress images
 * =====================
 * Get all images inside the DB that link with inv_id to export.
 * 
 * @param {Text} form_id 
 * @param {Array} download_data
 * @param {Function} callback 
 */
var downloadImages = function(form_id, download_data, callback){

  // Retrieve data from IDB
  idb.getAllData("images", form_id, "inv_id", function(result){
    console.log('downloadImages result: ', result);
    if (result.length > 0) {
      callback(download_data, form_id, result);
    } else {
      callback(download_data, form_id, false);
    }
  });
}

compressFiles = function(files, form_id, images = false){
  // Create zip foldername
  let zip_filename = form_id + '.zip';
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
      
      zip.file('images/' + name, urlToPromise(i.src), {binary: true});
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
}

var downloadImagesByOne = function(){
  var a = document.createElement("a"); //Create <a>
  a.href = "data:image/png;base64," + ImageBase64; //Image Base64 Goes here
  a.download = "Image.png"; //File name Here
  a.click(); //Downloaded file
}

// Object with functions to search inside JSON with list of species
var search = {
  auto(){
    let search_val = document.getElementById('searchbar').value;
    search_val = search_val.toLowerCase();

    let searchField = "especie"

    // Construct as list elements as search matches
    let x = document.querySelector('#list-holder');
    x.innerHTML = ""

    for (i = 0; i < listado_especies.length; i++) {
      let obj = listado_especies[i];

      if (obj[searchField].toLowerCase().includes(search_val)) {
        const elem = document.createElement("li")
        elem.innerHTML = `${obj.N} - ${obj.especie}`
        x.appendChild(elem)
      }
    }
  },
  // Delete all search matches
  clear(){
    let x = document.querySelector('#list-holder');
    x.innerHTML = "";
  },
  filter(esp_id){
    var result = listado_especies.filter(function(e){
      return e.N == esp_id;
    });
    return result[0].especie;
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
