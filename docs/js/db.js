const request = indexedDB.open('catalogue');
request.onupgradeneeded = () => {
    const db = request.result;
    db.createObjectStore('games', { keyPath: 'id' });
    db.createObjectStore('roms', { keyPath: 'id' });
};
await new Promise((resolve) => {
    request.onsuccess = resolve;
});
const db = request.result;
const resolveDbRequest = (request) => new Promise((resolve) => {
    request.onsuccess = () => resolve(request.result);
});
export const commitTransaction = (ref, data) => {
    return new Promise((resolve) => {
        const transaction = db.transaction(ref, 'readwrite');
        const objectStore = transaction.objectStore(ref);
        objectStore.put(data);
        transaction.oncomplete = resolve;
    });
};
export const getCatalogue = () => {
    const request = db.transaction('games', 'readonly').objectStore('games').getAll();
    return resolveDbRequest(request);
};
export const getGame = (id) => {
    const request = db.transaction('roms', 'readonly').objectStore('roms').get(id);
    return resolveDbRequest(request);
};
export const deleteByKey = (id) => {
    const romsRequest = db.transaction('roms', 'readwrite').objectStore('roms').delete(id);
    const gamesRequest = db.transaction('games', 'readwrite').objectStore('games').delete(id);
    return Promise.all([resolveDbRequest(romsRequest), resolveDbRequest(gamesRequest)]);
};
export const deleteBulk = (bulk) => {
    const deleteBulkByStore = (ref) => {
        const transaction = db.transaction(ref, 'readwrite');
        const objectStore = transaction.objectStore(ref);
        objectStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            let deletedGamesCount = 0;
            if (cursor) {
                const found = bulk.includes(cursor.key);
                if (found) {
                    deletedGamesCount ++;
                    cursor.delete();
                }
                if (bulk.length !== deletedGamesCount) {
                    cursor.continue();
                }
            } 
        };
    }
    deleteBulkByStore('roms');
    deleteBulkByStore('games');
};
export const deleteStores = () => {
    db.transaction('roms', 'readwrite').objectStore('roms').clear();
    db.transaction('games', 'readwrite').objectStore('games').clear();
}
export default db;