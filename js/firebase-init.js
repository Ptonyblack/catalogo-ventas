// ==================== INICIALIZACIÓN FIREBASE (MODULAR) ====================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js";

// Variables globales para usarlas desde otros scripts
let db = null;
let storage = null;
let firebaseActive = false;

async function initializeFirebase() {
  // Verificar que el config esté disponible (viene de firebase-config.js)
  if (typeof firebaseConfig === 'undefined') {
    console.error("❌ firebaseConfig no está definido");
    firebaseActive = false;
    // Exponer firebaseActive INMEDIATAMENTE antes de cualquier evento
    window.firebaseActive = firebaseActive;
    dispatchFirebaseReady();
    return;
  }

  // Verificar si Firebase está configurado correctamente
  const isConfigured = isFirebaseConfigured();
  if (isConfigured) {
    try {
      // Inicializar Firebase con el config
      const app = initializeApp(firebaseConfig);
      
      // Obtener referencias a Database y Storage
      db = getDatabase(app);
      storage = getStorage(app);
      
      firebaseActive = true;
      console.log("✅ Firebase inicializado correctamente");
      
    } catch (error) {
      console.error("❌ Error inicializando Firebase:", error);
      firebaseActive = false;
    }
  } else {
    console.log("ℹ️ Firebase no configurado. Usando localStorage.");
    firebaseActive = false;
  }
  
  // Exponer firebaseActive ANTES de emitir el evento
  window.firebaseActive = firebaseActive;
  console.log('✅ firebaseActive expuesto:', window.firebaseActive);
  
  // Emitir evento para notificar que Firebase está listo
  dispatchFirebaseReady();
}

function dispatchFirebaseReady() {
  const event = new Event('firebaseReady', { bubbles: true });
  document.dispatchEvent(event);
  document.firebaseInitialized = true; // Marcar como inicializado
}

// ==================== FUNCIONES FIREBASE ====================

async function uploadProductImage(file) {
  // Usar siempre Base64 para imágenes
  // (Firebase Storage requiere plan de pago)
  return await uploadImageAsBase64(file);
}

function uploadImageAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function saveProductsToFirebase(products) {
  if (!firebaseActive) {
    console.warn('⚠️ Firebase no está activo. Los productos no se guardaron.');
    return false;
  }

  try {
    // Asegurarse de que es un array válido
    const productosToSave = Array.isArray(products) && products.length > 0 ? products : [];
    const dbRef = ref(db, 'productos');
    
    if (productosToSave.length > 0) {
      await set(dbRef, productosToSave);
      console.log('✅ Productos guardados en Firebase:', productosToSave.length);
    } else {
      // Si no hay productos, limpiar la rama
      await set(dbRef, null);
      console.log('✅ Datos de productos limpiados en Firebase');
    }
    return true;
  } catch (error) {
    console.error('Error guardando productos en Firebase:', error);
    return false;
  }
}

async function loadProductsFromFirebase() {
  if (!firebaseActive) {
    console.warn('⚠️ Firebase no está activo.');
    return [];  // Retornar array vacío, no null
  }

  try {
    // Timeout de 5 segundos para no bloquear indefinidamente
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout al cargar productos')), 5000)
    );
    
    const dbRef = ref(db, 'productos');
    const loadPromise = get(dbRef);
    const snapshot = await Promise.race([loadPromise, timeoutPromise]);
    
    const data = snapshot.val();
    // Si no hay datos o es null, retornar array vacío
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error cargando productos de Firebase:', error.message);
    return [];  // Retornar array vacío en caso de error
  }
}

async function saveCategoriesFirebase(categories) {
  if (!firebaseActive) {
    console.warn('⚠️ Firebase no está activo. Las categorías no se guardaron.');
    return false;
  }

  try {
    // Asegurarse de que es un array válido
    const categoriasToSave = Array.isArray(categories) && categories.length > 0 ? categories : [];
    const dbRef = ref(db, 'categorias');
    
    if (categoriasToSave.length > 0) {
      await set(dbRef, categoriasToSave);
      console.log('✅ Categorías guardadas en Firebase:', categoriasToSave.length);
    } else {
      // Si no hay categorías, limpiar la rama
      await set(dbRef, null);
      console.log('✅ Datos de categorías limpiados en Firebase');
    }
    return true;
  } catch (error) {
    console.error('Error guardando categorías en Firebase:', error);
    return false;
  }
}

async function loadCategoriesFromFirebase() {
  if (!firebaseActive) {
    console.warn('⚠️ Firebase no está activo.');
    return [];  // Retornar array vacío, no null
  }

  try {
    // Timeout de 5 segundos para no bloquear indefinidamente
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout al cargar categorías')), 5000)
    );
    
    const dbRef = ref(db, 'categorias');
    const loadPromise = get(dbRef);
    const snapshot = await Promise.race([loadPromise, timeoutPromise]);
    
    const data = snapshot.val();
    // Si no hay datos o es null, retornar array vacío
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error cargando categorías de Firebase:', error.message);
    return [];  // Retornar array vacío en caso de error
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('📍 DOMContentLoaded - Inicializando Firebase...');
    await initializeFirebase();
  });
} else {
  // Si el DOM ya está cargado, inicializar inmediatamente
  console.log('📍 DOM ya cargado - Inicializando Firebase...');
  initializeFirebase().catch(e => console.error('Error en inicializeFirebase:', e));
}

// Exponer funciones y estado globales para compatibilidad con scripts no-módulo
// NOTA: firebaseActive ya se expone en initializeFirebase() antes del evento firebaseReady

Object.defineProperty(window, 'db', {
  get() { return db; },
  configurable: true
});

Object.defineProperty(window, 'storage', {
  get() { return storage; },
  configurable: true
});

// Exponer funciones directamente
window.initializeFirebase = initializeFirebase;
window.uploadProductImage = uploadProductImage;
window.saveProductsToFirebase = saveProductsToFirebase;
window.loadProductsFromFirebase = loadProductsFromFirebase;
window.saveCategoriesFirebase = saveCategoriesFirebase;
window.loadCategoriesFromFirebase = loadCategoriesFromFirebase;

// Marcar que Firebase está listo
window.firebaseModuleReady = true;
console.log('✅ Funciones Firebase expuestas a window (firebaseActive ya disponible)');

