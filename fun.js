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
  let row = document.querySelector('.selected');
  if(row){
    if(confirm("Do you want to delete selected row/rows?")){
      let selectedRows = document.querySelectorAll('.selected');
      for(let i = 0; i < selectedRows.length; i++){
        selectedRows[i].remove();
      }
    }
  } else {
    alert("Select one row to delete.")
  }
}

/**
 * Retrieve info from metadata table
 * ================================
 * @returns Metadata in JSON
 */
var collectMetadata = function(){
  let id = document.getElementById('inv-id').value;
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
 * Upload data to IndexedDB
 * ==========================
 * 1. Metadata
 * 2. Inv rows
 */
var saveForm = function(){

  // 1. Metadata
  let metadata = collectMetadata();
  // prevent to add blank metadata ID
  if(metadata.inv_id.length > 0){
    idb.addData(metadata, 'inv_metadata', 'inv_id');
  } else {
    alert("¡Atención!: El ID del inventario no puede estar vacío.");
  }

  // 2. Rows
  let html_rows = document.querySelectorAll('.inv-rows');

  for(let i = 0; i < html_rows.length; i ++){
    let rowid = html_rows[i].dataset.rowid;
    let json_data = collectRowData(rowid);
    // Add data into the IndexedDB
    idb.addData(json_data, 'rows', 'row_id');
  }
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
      let csvContent = "data:text/csv;charset=utf-8,"
      + rows.map(e => e.join(",")).join("\n");

      // Export with custom name
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${form_id}_metadata.csv`);
      document.body.appendChild(link); // Required for FF

      link.click(); // This will download the data

      // 2. EXPORT FORM ROWS
      idb.getAllData("rows", form_id, 'inv_id', function(result){
        console.log(result)
        if(result.length > 0){
          // Transform data into an array
          let rows = jsonToArray(result);
          // Create csv (https://stackoverflow.com/a/14966131)
          let csvContent = "data:text/csv;charset=utf-8,"
          + rows.map(e => e.join(",")).join("\n");

          // Export with custom name
          var encodedUri = encodeURI(csvContent);
          var link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `${form_id}.csv`);
          document.body.appendChild(link); // Required for FF

          link.click(); // This will download the data
        }
      })
    }
  });
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
