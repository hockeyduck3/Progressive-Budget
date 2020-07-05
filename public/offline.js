let db;

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