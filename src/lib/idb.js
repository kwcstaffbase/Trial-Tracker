// Minimal IndexedDB wrapper. We avoid pulling in `idb` (Jake Archibald's
// library) because two functions is all we need and a smaller bundle helps
// the first-load size.
//
// We store ONE object per session under a fixed key. The object holds the
// raw parsed rows + headers + clinicHeaders + the timestamp it was fetched.
// Maps and Sets aren't serialized — the index Maps are cheap to rebuild from
// the rows array (< 100ms for 50k rows), so we cache the inputs to the
// indexer, not the outputs.

const DB_NAME = 'trial-tracker'
const STORE_NAME = 'cache'
const DB_VERSION = 1

let dbPromise = null
function openDB() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    req.onblocked = () => reject(new Error('IndexedDB open blocked'))
  })
  return dbPromise
}

export async function idbGet(key) {
  try {
    const db = await openDB()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn('[idb] get failed:', err)
    return null
  }
}

export async function idbSet(key, value) {
  try {
    const db = await openDB()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    return true
  } catch (err) {
    console.warn('[idb] set failed:', err)
    return false
  }
}

export async function idbDel(key) {
  try {
    const db = await openDB()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    return true
  } catch (err) {
    console.warn('[idb] del failed:', err)
    return false
  }
}
