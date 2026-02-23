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
    dispatchFirebaseReady();
    return;
  }

  if (isFirebaseConfigured && isFirebaseConfigured()) {
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
  
  // Emitir evento para notificar que Firebase está listo
  dispatchFirebaseReady();
}

function dispatchFirebaseReady() {
  const event = new Event('firebaseReady', { bubbles: true });
  document.dispatchEvent(event);
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
    console.warn('⚠️ Firebase no está activo. Los datos no se guardaron.');
    return false;
  }

  try {
    const dbRef = ref(db, 'productos');
    await set(dbRef, products);
    console.log('✅ Productos guardados en Firebase');
    return true;
  } catch (error) {
    console.error('Error guardando en Firebase:', error);
    return false;
  }
}

async function loadProductsFromFirebase() {
  if (!firebaseActive) {
    console.warn('⚠️ Firebase no está activo.');
    return null;
  }

  try {
    const dbRef = ref(db, 'productos');
    const snapshot = await get(dbRef);
    return snapshot.val();
  } catch (error) {
    console.error('Error cargando de Firebase:', error);
    return null;
  }
}

async function saveCategoriesFirebase(categories) {
  if (!firebaseActive) {
    console.warn('⚠️ Firebase no está activo. Las categorías no se guardaron.');
    return false;
  }

  try {
    const dbRef = ref(db, 'categorias');
    await set(dbRef, categories);
    console.log('✅ Categorías guardadas en Firebase');
    return true;
  } catch (error) {
    console.error('Error guardando categorías:', error);
    return false;
  }
}

async function loadCategoriesFromFirebase() {
  if (!firebaseActive) {
    console.warn('⚠️ Firebase no está activo.');
    return null;
  }

  try {
    const dbRef = ref(db, 'categorias');
    const snapshot = await get(dbRef);
    return snapshot.val();
  } catch (error) {
    console.error('Error cargando categorías:', error);
    return null;
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
  initializeFirebase();
}

// Exponer funciones y estado globales para compatibilidad con scripts no-módulo
Object.defineProperty(window, 'firebaseActive', {
  get() { return firebaseActive; },
  configurable: true
});

Object.defineProperty(window, 'db', {
  get() { return db; },
  configurable: true
});

Object.defineProperty(window, 'storage', {
  get() { return storage; },
  configurable: true
});

window.initializeFirebase = initializeFirebase;
window.uploadProductImage = uploadProductImage;
window.saveProductsToFirebase = saveProductsToFirebase;
window.loadProductsFromFirebase = loadProductsFromFirebase;
window.saveCategoriesFirebase = saveCategoriesFirebase;
window.loadCategoriesFromFirebase = loadCategoriesFromFirebase;

