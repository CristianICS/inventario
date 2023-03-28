// Read CSV with vegetation legend and create dropdown
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

renderJSONDropdown(listado_especies);

var searchESP = function(esp_id){
  var result = listado_especies.filter(function(e){
    return e.N == esp_id;
  });
  return result[0].especie;
}

// Write veg name when N is chosen
var writeEsp = function(selected_element){
  // Get row ID
  let rid = selected_element.id.split('-')[2];
  // Select the ESP container of the row
  let especie = document.getElementById('inv-esp-' + rid);
  // Write esp inside above container
  especie.innerText = searchESP(Number(selected_element.value));
}

// Count rows
var countRows = function(){
  let rows = document.getElementsByClassName("inv-rows");
  let nrows = rows.length;
  return(nrows);
}

// Add another row
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

// Select a row by click in "Especie"
var selectRow = function(r){
  // if selected is set remove it, otherwise add it
  r.classList.toggle('selected');
}

// Remove row (prior must be a selected row)
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

// Collect row data
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
  
  return(
    {
      row_id: Number(rowid),
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

var saveForm = function(){
  /*
   * Upload row by row inside indexedDB
   * 
   */

  let html_rows = document.querySelectorAll('.inv-rows');
  
  for(let i = 0; i < html_rows.length; i ++){
    let rowid = html_rows[i].dataset.rowid;
    let json_data = collectRowData(rowid);
    // Add data into the IndexedDB
    idb.add(json_data);
  }
}

class Row {
  constructor(rn) { // Row number
    this.especie = '<span onclick="selectRow()" id="inv-esp-' + rn + '" class="especie">';
    this.N = '<input type="text" id="inv-n-' + rn + '" name="N" onchange="writeEsp(this)">';
    this.D = '<input type="text" id="inv-d-' + rn + '" name="D">';
    this.di = '<input type="text" id="inv-di-' + rn + '" name="di">';
    this.dd = '<input type="text" id="inv-dd-' + rn + '" name="dd">';
    this.h = '<input type="text" id="inv-h-' + rn + '" name="h">';
    this.dmay = '<input type="text" id="inv-dmay-' + rn + '" name="DM">';
    this.dmen = '<input type="text" id="inv-dmen-' + rn + '" name="Dm">';
    this.rmay = '<input type="text" id="inv-rmay-' + rn + '" name="rmay">';
    this.rmen = '<input type="text" id="inv-rmen-' + rn + '" name="rmen">';
    this.dbh = '<input type="text" id="inv-dbh-' + rn + '" name="dbh">';
  }

  createHTML(){
    let new_r = [];
    let elements = Object.values(this);
    for(var i = 0; i < elements.length; i++){
      new_r.push('<td>' + elements[i] + '</td>');
    }
    return(new_r.join(""));
  }
}

var sw = {
  available: false,
  init(){
      // Init Service Worker
      if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register("/sw.js").then(()=>{
              this.available = true;
              document.querySelector('.service-worker').style = "background-color: green;"
          })
      }
  }
}
