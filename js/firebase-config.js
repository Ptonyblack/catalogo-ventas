// ==================== CONFIGURACIÓN FIREBASE ====================
// Reemplaza estos valores con los de tu proyecto Firebase
// Ver FIREBASE_SETUP.md para instrucciones

const firebaseConfig = {
  apiKey: "AIzaSyBtJKpw2xwEEoq0U5Ef8sP3AIvLxMd5qCY",
  authDomain: "ventas-catalogo-6eb6f.firebaseapp.com",
  projectId: "ventas-catalogo-6eb6f",
  databaseURL: "https://ventas-catalogo-6eb6f-default-rtdb.firebaseio.com",
  storageBucket: "ventas-catalogo-6eb6f.firebasestorage.app",
  messagingSenderId: "511897766778",
  appId: "1:511897766778:web:5b187ed8431f5b890d24c3"
};

// Bandera para saber si Firebase está configurado
let firebaseConfigured = false;

// Valida si Firebase está correctamente configurado
function isFirebaseConfigured() {
  const notConfigured = firebaseConfig.apiKey.includes("TU_");
  if (notConfigured && !firebaseConfigured) {
    console.warn("⚠️ Firebase no está configurado. Usando localStorage como fallback.");
    firebaseConfigured = false;
  } else if (!notConfigured) {
    firebaseConfigured = true;
  }
  return firebaseConfigured;
}
