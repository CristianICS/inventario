// Reference: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
let db;

// Init database
const request = window.indexedDB.open("testdb", 1);

request.onerror = (event) => {
    consoloe.error(`[IndexedDB request error]: ${event.target.errorCode}`);
    document.querySelector(".indexeddb").style = "background-color: red;";
};
request.onsuccess = (event) => {
    document.querySelector(".indexeddb").style = "background-color: green;";
    //   Save DB instance
    db = event.target.result;
};

// IMPORTANT: This event is only implemented in recent browsers
request.onupgradeneeded = (event) => {
    // Save the IDBDatabase interface
    db = event.target.result;

    // Create an objectStore for this database
    // It will store form rows as JSON objects
    const objectStore = db.createObjectStore("rows", {
        keyPath: "row_id"
    });

  // Create an index to search customers by name. We may have duplicates
  // so we can't use a unique index.
  objectStore.createIndex("name", "name", { unique: false });

  // Create an index to search customers by email. We want to ensure that
  // no two customers have the same email, so use a unique index.
  objectStore.createIndex("email", "email", { unique: true });

  // Use transaction oncomplete to make sure the objectStore creation is
  // finished before adding data into it.
  objectStore.transaction.oncomplete = (event) => {
    // Store values in the newly created objectStore.
    const customerObjectStore = db
      .transaction("customers", "readwrite")
      .objectStore("customers");
    customerData.forEach((customer) => {
      customerObjectStore.add(customer);
    });
  };
};
