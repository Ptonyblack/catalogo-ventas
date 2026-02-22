# 🛍️ Catálogo de Ventas - Landing Page

Una plataforma moderna y profesional para vender tus productos (purés, vinagres, conservas, etc.) con un **landing page público** y un **dashboard administrativo privado**.

## ✨ Características

### Landing Page (Público)
- 🎠 **Carousel automático** con productos destacados
- 📱 **Diseño responsivo** (funciona en móviles, tablets y escritorio)
- 🏷️ **Categorización de productos** con filtros
- 💰 **Precios en USD y CUP**
- 📦 **Sistema de inventario** visible (cajas disponibles, unidades, etc.)
- 💬 **Integración con WhatsApp** para compras directas
- 🖼️ **Imágenes reales de productos** (no emojis)
- 🎨 **Interfaz moderna y profesional**

### Dashboard Administrativo (Privado)
- 📊 **Estadísticas en tiempo real** (productos, disponibilidad, stock)
- ➕ **Crear, editar y eliminar productos** fácilmente
- 🖼️ **Subida de imágenes** directamente desde el navegador
- 🏷️ **Gestionar categorías** de productos
- 💾 **Importar/Exportar datos** en formato JSON
- 🔥 **Integración con Firebase** (sincronización en tiempo real)
- 📞 **Configurar información de contacto**
- 🔄 **Restaurar datos a valores ejemplares**
- 🔐 **Interfaz intuitiva y fácil de usar**

## 🚀 Inicio Rápido

### Opción A: Con Firebase (Recomendado) ⭐
**Para sincronizar productos en tiempo real entre todos los dispositivos:**

1. Abre `FIREBASE_SETUP.md` para configurar tu proyecto Firebase (5 minutos)
2. Pega tus credenciales en `js/firebase-config.js`
3. Abre `admin.html` para crear productos
4. Abre `index.html` en otro dispositivo y verás los cambios en tiempo real

### Opción B: Sin Firebase (Solo localStorage)
**Para usar solo en tu navegador (sin sincronización en la nube):**

1. Simplemente abre `index.html` en tu navegador
2. Ve a `admin.html` para editar productos
3. Los datos se guardan en tu navegador automáticamente

### 3. Acceder al Dashboard
Da clic en el botón administrador o ve a `admin.html` directamente en tu navegador

## 📁 Estructura de Carpetas

```
catalogo-ventas/
├── index.html                  # Página principal (Landing Page)
├── admin.html                  # Panel administrativo
├── README.md                   # Documentación completa
├── FIREBASE_SETUP.md           # Guía de configuración de Firebase
├── css/
│   ├── styles.css              # Estilos del landing page
│   └── admin-styles.css        # Estilos del dashboard
├── js/
│   ├── main.js                 # Lógica del landing page
│   ├── admin.js                # Lógica del dashboard
│   ├── firebase-config.js      # Configuración de Firebase
│   └── firebase-init.js        # Inicialización de Firebase
├── data/
│   └── products.json           # Datos de ejemplo
└── .gitignore                  # Archivos a ignorar en Git
```

## ⚙️ Configuración Inicial

### Cambiar el Número de WhatsApp

1. **En el landing page:**
   - Abre `js/main.js`
   - Busca la línea: `let phoneNumber = '5351234567';`
   - Cambia `5351234567` por tu número (sin espacios ni caracteres especiales)

2. **En el dashboard:**
   - Ve a la sección "⚙️ Configuración"
   - Actualiza "📞 Información de Contacto"
   - Los cambios se guardan automáticamente

### Actualizar Productos

#### Opción 1: Usar el Dashboard (Recomendado)
1. Abre `admin.html`
2. Ve a "Productos"
3. Haz clic en "+ Nuevo Producto"
4. **Sube una imagen del producto** (jpg, png, webp)
5. Completa el formulario con los detalles
6. Haz clic en "Guardar Producto"
7. ¡Los cambios se guardan automáticamente en Firebase!

**Con Firebase:**
- Las imágenes se suben a la nube automáticamente
- El landing page verá los cambios inmediatamente
- Cualquier dispositivo/navegador verá los mismos productos

#### Opción 2: Editar JSON Manualmente (Sin Firebase)
1. Abre `data/products.json`
2. Edita directamente el JSON
3. Guarda el archivo

## 🔥 Firebase - Sincronización en Tiempo Real

### ¿Por qué Firebase?
- ✅ Las imágenes se guardan en la nube
- ✅ Los datos se sincronizan automáticamente
- ✅ El landing page siempre muestra datos actuales
- ✅ Funciona con GitHub Pages
- ✅ Gratis hasta cierto límite

### Configurar Firebase
**Ver archivo `FIREBASE_SETUP.md`** para instrucciones detalladas.

Si **NO** configuras Firebase, el sistema usa **localStorage** (solo en tu navegador).

## 💾 Guardar tus Datos

### Con Firebase:
- ✅ Se guarda automáticamente en la nube
- ✅ Imágenes en Firebase Storage
- ✅ Productos en Firebase Realtime Database

### Sin Firebase (localStorage):
El dashboard guarda automáticamente los cambios en el navegador. Para hacer un respaldo:

1. Abre `admin.html`
2. Ve a "Configuración"
3. Haz clic en "Descargar Datos"
4. Se descargará un archivo JSON con todos tus productos

Para restaurar:
1. Ve a "Restaurar Datos"
2. Selecciona tu archivo JSON
3. Los datos se cargarán automáticamente

## 🌐 Subir a GitHub Pages (Gratis)

### Paso 1: Crear un Repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre del repositorio: `mitienda` (o el que quieras)
3. Haz clic en "Create repository"

### Paso 2: Subir los Archivos
#### Opción A: Con Git (Línea de Comandos)
```bash
cd catalogo-ventas
git init
git add .
git commit -m "Primer commit: catálogo completado"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mitienda.git
git push -u origin main
```

#### Opción B: Interfaz Web de GitHub
1. Ve al repositorio que creaste
2. Haz clic en "Add file" → "Upload files"
3. Arrastra la carpeta `catalogo-ventas` o selecciona los archivos
4. Haz clic en "Commit changes"

### Paso 3: Activar GitHub Pages
1. Ve a Configuración (Settings) del repositorio
2. En el menú izquierdo, selecciona "Pages"
3. En "Source", selecciona "main"
4. Haz clic en "Save"
5. Tu sitio estará disponible en: `https://tu_usuario.github.io/mitienda/`

## 🔗 Compartir tu Landing Page

Una vez esté en GitHub Pages, puedes compartir el enlace:
- **Versión Pública:** `https://tu_usuario.github.io/mitienda/`
- **Acceso a Clientes:** Comparte solo el `index.html`
- **Panel Admin:** `https://tu_usuario.github.io/mitienda/admin.html` (solo para ti)

## 📱 Integración WhatsApp

### Para Clientes
- Cuando hacen clic en "💬 WhatsApp", se abre un chat directo
- El mensaje incluye el nombre del producto
- O pueden solicitar una cotización personalizada

### Personalizar Mensajes
Edita `js/main.js` y busca la función `contactByWhatsApp()` y `requestQuote()` para cambiar los textos

## 🎨 Personalizar el Diseño

### Cambiar Colores
1. Abre `css/styles.css`
2. Busca la sección `:root` al inicio
3. Cambia los valores de `--primary-color`, `--secondary-color`, etc.

Ejemplo:
```css
:root {
  --primary-color: #00FF00;  /* De verde a otro color */
  --secondary-color: #00CC00;
}
```

### Cambiar Logo/Título
1. Abre `index.html`
2. Busca `<div class="logo">`
3. Cambia el emoji (🛍️) y el texto

## 🐛 Solucionar Problemas

### Los datos no se guardan
- Verifica que estés usando el Dashboard (`admin.html`)
- Los datos se guardan en el navegador automáticamente
- Prueba limpiar el caché del navegador

### WhatsApp no abre
- Verifica que has configurado correctamente el número
- Asegúrate de tener WhatsApp instalado o tener cuenta web

### El sitio se ve roto en GitHub Pages
- Espera 5-10 minutos después de hacer push
- Actualiza la página con Ctrl+Shift+R (limpiar caché)
- Verifica que todos los archivos están en el repositorio

## 📝 Ejemplo de Producto

```json
{
  "id": 1,
  "name": "Puré de Tomate",
  "category": "purees",
  "description": "Puré de tomate casero, 100% natural sin conservantes",
  "image": "🍅",
  "priceUSD": 5.99,
  "priceCUP": 150,
  "available": true,
  "boxesAvailable": 25,
  "unitsPerBox": 6,
  "totalUnits": 150
}
```

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura
- **CSS3**: Diseño y animaciones
- **JavaScript Vanilla**: Funcionalidad (sin dependencias)
- **LocalStorage**: Base de datos en navegador
- **GitHub Pages**: Hosting gratuito

## 📋 Checklist de Configuración

- [ ] Cambiar número de WhatsApp
- [ ] Actualizar los productos
- [ ] Cambiar nombre de la tienda (si deseas)
- [ ] Personalizar colores/diseño
- [ ] Hacer respaldo de datos
- [ ] Subir a GitHub Pages
- [ ] Probar en móvil

## 💡 Tips Útiles

1. **Usa emojis apropiados** para cada producto
2. **Mantén descripciones cortas** pero informativas
3. **Actualiza inventario regularmente** en el dashboard
4. **Copia tu respaldo de datos** frecuentemente
5. **Prueba en móvil** antes de compartir

## 📞 Soporte

Para problemas:
1. Verifica la consola del navegador (F12 → Console)
2. Busca ejemplos en los archivos HTML/JS
3. Revisa que todos los archivos estén en su lugar

## 📄 Licencia

Esta plantilla es de uso libre. Personalízala como necesites.

## 🎉 ¡Listo!

Tu catálogo de ventas está listo. Ahora:
1. Personaliza con tus productos
2. Sube a GitHub Pages
3. ¡Comparte el link con tus clientes!

---

**Hecho con ❤️ para pequeños y medianos negocios**
