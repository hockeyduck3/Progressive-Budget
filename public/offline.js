let db;

// Once the user comes back online run a DB check to see if anything was saved offline
window.addEventListener('online', runCheck);

const index = indexedDB.open('budget', 1);

index.onupgradeneeded = event => {
    const db = event.target.result;
    db.createObjectStore('pending', { autoIncrement: true });
}

index.onsuccess = event => {
    db = event.target.result;

    if (navigator.onLine) {
        // If the app is online run this function to see if there is anything saved in the database.
        runCheck();
    }
}

index.onerror = event => {
    console.log(`There was an error: ${event.target.errorCode}`)
}

function runCheck() {
    const transaction = db.transaction(['pending'], 'readwrite');

    const store = transaction.objectStore('pending');

    const getAll = store.getAll();

    getAll.onsuccess = () => {
        // This if statement will check and make sure that there is actually something within indexedDB
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'aplication/json, text/plain, */*', 'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(() => {
                const transaction = db.transaction(['pending'], 'readwrite');

                const store = transaction.objectStore('pending');
                
                store.clear();
            });
        }
    }
}

function saveRecord(data) {
    const transaction = db.transaction(['pending'], 'readwrite');

    const store = transaction.objectStore('pending');

    store.add(data);
}