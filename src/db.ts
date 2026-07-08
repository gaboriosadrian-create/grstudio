import { PortfolioData } from './types';

export function savePortfolioData(data: PortfolioData): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB no está soportado en este entorno.'));
        return;
      }
      
      const request = indexedDB.open('PortfolioDatabase', 1);
      
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('portfolio')) {
          db.createObjectStore('portfolio');
        }
      };
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction('portfolio', 'readwrite');
        const store = transaction.objectStore('portfolio');
        const putRequest = store.put(data, 'user_data');
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

export function loadPortfolioData(): Promise<PortfolioData | null> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(null);
        return;
      }

      const request = indexedDB.open('PortfolioDatabase', 1);
      
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('portfolio')) {
          db.createObjectStore('portfolio');
        }
      };
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('portfolio')) {
          resolve(null);
          return;
        }
        const transaction = db.transaction('portfolio', 'readonly');
        const store = transaction.objectStore('portfolio');
        const getRequest = store.get('user_data');
        
        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

export function deletePortfolioData(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve();
        return;
      }

      const request = indexedDB.open('PortfolioDatabase', 1);
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('portfolio')) {
          resolve();
          return;
        }
        const transaction = db.transaction('portfolio', 'readwrite');
        const store = transaction.objectStore('portfolio');
        const deleteRequest = store.delete('user_data');
        
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}
