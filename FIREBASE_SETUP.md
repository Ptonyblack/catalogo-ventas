# 🔥 Configuración de Firebase - Guía Completa

Este proyecto usa **Firebase** para:
- 📦 Almacenar productos y categorías en la nube
- 🖼️ Guardar imágenes en Firebase Storage
- 🌐 Sincronizar datos entre el panel admin y el landing page
- 👥 Que todos los clientes vean los mismos productos en tiempo real

---

## 📋 ¿POR QUÉ FIREBASE?

**Sin Firebase (solo localStorage):**
- ❌ Los datos solo se guardan en TU navegador
- ❌ En otro navegador o dispositivo no ves los cambios
- ❌ GitHub Pages no puede guardar datos permanentemente

**Con Firebase:**
- ✅ Los datos se guardan en la nube
- ✅ Cualquier dispositivo ve los cambios
- ✅ GitHub Pages + Firebase = aplicación completa
- ✅ Imágenes se guardan en la nube automáticamente

---

## ⚡ CONFIGURACIÓN RÁPIDA (5 MINUTOS)

### PASO 1: Crear cuenta Firebase (Gratis)

1. Ve a **https://firebase.google.com**
2. Haz clic en **"Comienza"** (Get Started)
3. Inicia sesión con tu cuenta Google (o crea una)

---

### PASO 2: Crear un Proyecto

1. Haz clic en **"Crear un proyecto"** (Create a project)
2. Nombre: `ventas-catalogo` (o el que quieras)
3. Desactiva Google Analytics (opcional)
4. Haz clic en **"Crear proyecto"**
5. Espera 1-2 minutos a que se cree

---

### PASO 3: Obtener las Credenciales

1. En la pantalla del proyecto, haz clic en el ícono **"<>"** (Web)
2. Nombralo: `catalogo-ventas`
3. **Copiar TODO el objeto `firebaseConfig`**
4. Debería verse así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaS....",
  authDomain: "ventas-catalogo.firebaseapp.com",
  projectId: "ventas-catalogo",
  storageBucket: "ventas-catalogo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234567890"
};
```

5. Haz clic en **"Copiar"** y guarda este código

---

### PASO 4: Configurar la Base de Datos

1. En la izquierda, ve a **"Realtime Database"**
2. Haz clic en **"Crear base de datos"**
3. Ubicación: `us-central1` (o la más cercana a ti)
4. Modo: **Inicia en modo de prueba** (Start in test mode)
5. Haz clic en **"Crear"**

**Reglas de seguridad (importante):**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Esto permite que cualquiera lea y escriba (lo cambiarás después si quieres).

---

### PASO 5: Habilitar Storage (Almacenamiento de Imágenes)

1. En la izquierda, ve a **"Storage"**
2. Haz clic en **"Comenzar"** (Get Started)
3. Mode: **Inicia en modo de prueba**
4. Ubicación: `us-central1`
5. Haz clic en **"Crear"**

**Reglas de Storage:**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

---

### PASO 6: Pegar las Credenciales en tu Código

1. Abre tu proyecto en VS Code
2. Ve a: `js/firebase-config.js`
3. Reemplaza esto:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_AUTH_DOMAIN_AQUI",
  projectId: "TU_PROJECT_ID_AQUI",
  storageBucket: "TU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "TU_MESSAGING_SENDER_ID_AQUI",
  appId: "TU_APP_ID_AQUI"
};
```

Con tu información de Firebase (Paso 3).

4. **Guarda el archivo**

---

### PASO 7: Prueba en el Admin

1. Abre `admin.html` en tu navegador
2. Deberías ver un mensaje: ✅ Firebase inicializado correctamente
3. Agrega un producto con una imagen
4. ¡Guarda!

---

### PASO 8: Verifica en la Consola Firebase

1. Ve a https://console.firebase.google.com
2. Tu proyecto → Realtime Database
3. Deberías ver los productos que agregaste
4. Storage debería contener las imágenes

---

## ✅ ¿CÓMO SABER SI FUNCIONA?

### En el Panel Admin:
1. Abre `admin.html`
2. Abre la consola del navegador (F12)
3. Busca: ✅ **Firebase inicializado correctamente**
4. Si ves ese mensaje, ¡está funcionando!

### En el Landing Page:
1. Abre `index.html`
2. Los productos que creaste en admin deberían aparecer
3. Prueba en diferentes dispositivos/navegadores
4. Todos deben ver los MISMOS productos

---

## 🐛 ¿FIREBASE NO FUNCIONA?

**Error: "Firebase no está configurado"**
- Solución: Revisa que pegaste correctamente `firebase-config.js`
- Asegúrate de que no dice "TU_" en ningún campo

**Error: "Permission denied"**
- Solución: Ve a Firebase Console → Realtime Database → Reglas
- Asegúrate de que `.read` y `.write` están en `true`

**Las imágenes no se guardan**
- Solución: Ve a Firebase Console → Storage → Reglas
- Asegúrate de que permite `allow read, write`

---

## 🔐 SEGURIDAD DESPUÉS (Opcional)

Cuando tengas todo funcionando, puedes hacer las reglas más seguras:

**Realtime Database:**
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

**Storage:**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Pero esto requiere autenticación (más complejo).

---

## 📊 ESTRUCTURA EN FIREBASE

Cuando todo esté funcionando, verás esto en Firebase Realtime Database:

```
productos/
├── 0/
│   ├── id: 1
│   ├── name: "Puré de Tomate"
│   ├── imageUrl: "https://..."
│   └── ... más campos
├── 1/
│   ├── id: 2
│   └── ...

categorias/
├── 0/
│   ├── id: "purees"
│   ├── name: "Purés"
│   └── ...
└── 1/
    └── ...
```

---

## 🚀 PRÓXIMOS PASOS

### Ya configurado Firebase:
1. ✅ Sube tu proyecto a GitHub
2. ✅ Este ya funciona con GitHub Pages
3. ✅ Comparte el link del landing page
4. ✅ Edita desde admin.html
5. ✅ El landing page siempre verá los cambios

### Mejoras Futuras (Opcionales):
- Agregar autenticación para proteger el admin
- Sistema de múltiples usuarios
- Backup automático

---

## 📞 RESUMEN

| Paso | Qué hace | Duración |
|------|---------|----------|
| 1-3 | Crear Firebase + obtener config | 5 min |
| 4 | Realtime Database | 2 min |
| 5 | Storage para imágenes | 2 min |
| 6 | Pegar credenciales en código | 1 min |
| **Total** | **¡LISTO!** | **10 min** |

---

## 🎉 ¡LISTA!

Ya tienes:
- ✅ Almacenamiento de imágenes en la nube
- ✅ Base de datos sincronizada
- ✅ Admin panel que guarda cambia
- ✅ Landing page que ve los cambios en tiempo real
- ✅ Todo funcionando con GitHub Pages

**Solo falta subir a GitHub y compartir tu link** 🚀
