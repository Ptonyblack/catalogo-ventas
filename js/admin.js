// ==================== VARIABLES GLOBALES ====================

let products = [];
let categories = [];
let editingProductId = null;

const STORAGE_KEY = 'catalog_products';
const STORAGE_KEY_CATEGORIES = 'catalog_categories';

// ==================== INICIALIZACIÓN ====================

async function initializeAdmin() {
  await loadDataFromStorage();
  renderProductsTable();
  updateStats();
  setupEventListeners();
  populateCategorySelect(); // Rellenar select DESPUÉS de cargar datos
  loadConfigSettings(); // Cargar configuraciones guardadas
  updateFirebaseStatusBanner(); // Mostrar estado de Firebase
}

// Actualizar el banner de estado de Firebase
function updateFirebaseStatusBanner() {
  const banner = document.getElementById('firebaseStatusBanner');
  const icon = document.getElementById('firebaseStatusIcon');
  const title = document.getElementById('firebaseStatusTitle');
  const text = document.getElementById('firebaseStatusText');
  
  if (window.firebaseActive) {
    // Firebase activo
    banner.style.display = 'flex';
    banner.style.background = '#f0fff4';
    banner.style.borderLeft = '4px solid #2ecc71';
    icon.textContent = '✅';
    title.textContent = 'Firebase conectado';
    text.textContent = 'Los productos se guardan en la nube y serán visibles en otros dispositivos';
  } else {
    // Firebase inactivo
    banner.style.display = 'flex';
    banner.style.background = '#fff5f5';
    banner.style.borderLeft = '4px solid #e74c3c';
    icon.textContent = '❌';
    title.textContent = 'Firebase NO activo';
    text.textContent = 'Abre DIAGNOSTICO_FIREBASE.html para configurar. Los cambios se guardan SOLO en tu PC.';
  }
}
// Esperar a que Firebase esté listo antes de inicializar
document.addEventListener('firebaseReady', async function() {
  console.log('✅ Firebase listo en admin.js, inicializando...');
  await initializeAdmin();
});

// Fallback: Si Firebase no está configurado, inicializar de todas formas
document.addEventListener('DOMContentLoaded', async function() {
  // Dar un tiempo para que firebase esté listo
  setTimeout(() => {
    if (!document.firebaseInitialized) {
      console.log('⚠️ Inicializando sin esperar a Firebase');
      initializeAdmin();
      document.firebaseInitialized = true;
    }
  }, 2000);
});

// Rellenar el select de categorías
function populateCategorySelect() {
  const select = document.getElementById('productCategory');
  if (!select) return;
  
  select.innerHTML = '<option value="">Seleccionar categoría</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = `${cat.icon} ${cat.name}`;
    select.appendChild(option);
  });
}

// ==================== CARGAR/GUARDAR DATOS ====================

async function loadDataFromStorage() {
  // SIEMPRE intentar cargar de Firebase primero, es la fuente de verdad
  if (window.firebaseActive) {
    try {
      console.log('📍 Cargando datos de Firebase...');
      const fbProducts = await window.loadProductsFromFirebase();
      const fbCategories = await window.loadCategoriesFromFirebase();
      
      // Usar lo que Firebase devuelva (aunque sea vacío)
      products = fbProducts || [];
      categories = fbCategories || [];
      
      console.log('✅ Datos cargados desde Firebase:');
      console.log('   - Productos:', products.length);
      console.log('   - Categorías:', categories.length);
      
    } catch (e) {
      console.error('❌ Error cargando de Firebase:', e);
      // Si hay error, empezar con datos vacíos
      products = [];
      categories = [];
    }
  } else {
    console.log('⚠️ Firebase no activo, iniciando con datos vacíos');
    products = [];
    categories = [];
  }
  
  // NOTA: localStorage se usa SOLO para guardar cambios, NO para cargar
}

async function saveDataToStorage() {
  await saveSyncedData();
}

async function saveSyncedData() {
  // Guardar SIEMPRE en localStorage como copia de seguridad
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  
  // Guardar en Firebase si está disponible
  if (window.firebaseActive) {
    try {
      const productosSaved = await window.saveProductsToFirebase(products);
      const categoriasSaved = await window.saveCategoriesFirebase(categories);
      
      if (productosSaved && categoriasSaved) {
        console.log('✅ Datos guardados en Firebase y localStorage');
        showMessage('✅ Cambios guardados en la nube (Firebase) y copia local', 'success');
      } else {
        console.log('⚠️ Datos guardados en localStorage (Firebase no disponible)');
        showMessage('⚠️ Cambios guardados localmente (Firebase sin disponibilidad)', 'warning');
      }
    } catch (e) {
      console.error('Error guardando en Firebase:', e);
      showMessage('⚠️ Cambios guardados localmente (error en Firebase)', 'warning');
    }
  } else {
    console.log('⚠️ Datos guardados en localStorage (Firebase inactivo)');
    showMessage('⚠️ ADVERTENCIA: Solo se guardan en tu PC. Abre DIAGNOSTICO_FIREBASE.html para activar Firebase', 'warning');
  }
}

async function loadDefaultData() {
  try {
    const response = await fetch('data/products.json');
    const data = await response.json();
    products = data.products;
    categories = data.categories;
    await saveSyncedData();
  } catch (error) {
    console.error('Error cargando datos por defecto:', error);
  }
}

// ==================== NAVEG ACIÓN ENTRE SECCIONES ====================

function showSection(sectionId) {
  // Ocultar todas las secciones
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Actualizar menú activo
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Mostrar sección seleccionada
  document.getElementById(sectionId).classList.add('active');
  event.currentTarget.classList.add('active');
}

// ==================== TABLA DE PRODUCTOS ====================

function renderProductsTable() {
  const tableBody = document.querySelector('table tbody');
  tableBody.innerHTML = '';
  
  if (products.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No hay productos. Agrega uno nuevo.</td></tr>';
    return;
  }
  
  products.forEach(product => {
    const row = document.createElement('tr');
    const categoryName = categories.find(c => c.id === product.category)?.name || product.category;
    const statusClass = product.available ? 'status-available' : 'status-unavailable';
    const statusText = product.available ? '✓ Disponible' : '✗ No disponible';
    
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${categoryName}</td>
      <td>$${product.priceUSD.toFixed(2)}</td>
      <td>₱${product.priceCUP}</td>
      <td>${product.boxesAvailable}</td>
      <td>${product.totalUnits}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td>
        <div class="action-buttons">
          <button class="edit-btn" onclick="editProduct(${product.id})">Editar</button>
          <button class="delete-btn" onclick="deleteProduct(${product.id})">Eliminar</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// ==================== FORMULARIO DE PRODUCTO ====================

function openProductForm(productId = null) {
  editingProductId = productId;
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  const title = document.querySelector('#productModal .modal-header h2');
  const previewImg = document.getElementById('previewImg');
  
  if (productId) {
    title.textContent = 'Editar Producto';
    const product = products.find(p => p.id === productId);
    if (product) {
      form.productName.value = product.name;
      form.productCategory.value = product.category;
      form.productDescription.value = product.description;
      form.priceUSD.value = product.priceUSD;
      form.priceCUP.value = product.priceCUP;
      form.boxesAvailable.value = product.boxesAvailable;
      form.unitsPerBox.value = product.unitsPerBox;
      form.available.checked = product.available;
      
      // Mostrar imagen actual como vista previa
      if (product.imageUrl) {
        previewImg.src = product.imageUrl;
        previewImg.style.display = 'block';
      }
      
      // No requerimos imagen en edición (puedes dejarla igual)
      form.productImage.required = false;
    }
  } else {
    title.textContent = 'Nuevo Producto';
    form.reset();
    editingProductId = null;
    previewImg.style.display = 'none';
    form.productImage.required = true;
  }
  
  modal.classList.add('active');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
  editingProductId = null;
}

function saveProduct(event) {
  event.preventDefault();
  
  const form = document.getElementById('productForm');
  const formData = new FormData(form);
  const imageFile = formData.get('productImage');
  
  // Mostrar loading
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';
  
  // Procesar imagen
  (async () => {
    try {
      let imageUrl = '';
      
      if (imageFile && imageFile.size > 0) {
        // Subir nueva imagen
        imageUrl = await uploadProductImage(imageFile);
      } else if (editingProductId) {
        // En edición sin nueva imagen, mantener la anterior
        const product = products.find(p => p.id === editingProductId);
        imageUrl = product.imageUrl;
      }
      
      if (editingProductId) {
        // Editar producto existente
        const product = products.find(p => p.id === editingProductId);
        if (product) {
          product.name = formData.get('productName');
          product.category = formData.get('productCategory');
          product.description = formData.get('productDescription');
          if (imageUrl) product.imageUrl = imageUrl;
          product.priceUSD = parseFloat(formData.get('priceUSD'));
          product.priceCUP = parseInt(formData.get('priceCUP'));
          product.boxesAvailable = parseInt(formData.get('boxesAvailable'));
          product.unitsPerBox = parseInt(formData.get('unitsPerBox'));
          product.totalUnits = product.boxesAvailable * product.unitsPerBox;
          product.available = formData.get('available') === 'on';
        }
        showMessage('Producto actualizado correctamente', 'success');
      } else {
        // Crear nuevo producto
        if (!imageUrl) {
          showMessage('Error: La imagen es requerida', 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          return;
        }
        
        const newProduct = {
          id: Math.max(...products.map(p => p.id), 0) + 1,
          name: formData.get('productName'),
          category: formData.get('productCategory'),
          description: formData.get('productDescription'),
          imageUrl: imageUrl,
          priceUSD: parseFloat(formData.get('priceUSD')),
          priceCUP: parseInt(formData.get('priceCUP')),
          boxesAvailable: parseInt(formData.get('boxesAvailable')),
          unitsPerBox: parseInt(formData.get('unitsPerBox')),
          totalUnits: parseInt(formData.get('boxesAvailable')) * parseInt(formData.get('unitsPerBox')),
          available: formData.get('available') === 'on'
        };
        products.push(newProduct);
        showMessage('Producto añadido correctamente', 'success');
      }
      
      await saveDataToStorage();
      renderProductsTable();
      updateStats();
      closeProductModal();
      
    } catch (error) {
      showMessage('Error al procesar imagen: ' + error.message, 'error');
      console.error(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  })();
}

function editProduct(productId) {
  openProductForm(productId);
}

function deleteProduct(productId) {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    products = products.filter(p => p.id !== productId);
    saveDataToStorage();
    renderProductsTable();
    updateStats();
    showMessage('Producto eliminado correctamente', 'success');
  }
}

// ==================== GESTIÓN DE CATEGORÍAS ====================

function renderCategoriesTable() {
  const tableBody = document.querySelector('#categoriesSection table tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (categories.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No hay categorías.</td></tr>';
    return;
  }
  
  categories.forEach(category => {
    const productCount = products.filter(p => p.category === category.id).length;
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${category.id}</td>
      <td>${category.name}</td>
      <td>${productCount}</td>
      <td>
        <div class="action-buttons">
          <button class="edit-btn" onclick="editCategory('${category.id}')">Editar</button>
          <button class="delete-btn" onclick="deleteCategory('${category.id}')">Eliminar</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function openCategoryForm(categoryId = null) {
  const modal = document.getElementById('categoryModal');
  const form = document.getElementById('categoryForm');
  const title = modal.querySelector('.modal-header h2');
  
  if (categoryId) {
    title.textContent = 'Editar Categoría';
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      form.categoryId.value = category.id;
      form.categoryName.value = category.name;
      form.categoryIcon.value = category.icon;
      form.categoryId.disabled = true;
    }
  } else {
    title.textContent = 'Nueva Categoría';
    form.reset();
    // Generar automáticamente un ID numérico
    const maxId = categories.length > 0 ? Math.max(...categories.map(c => parseInt(c.id) || 0)) : 0;
    form.categoryId.value = (maxId + 1).toString();
    form.categoryId.disabled = true; // Deshabilitado porque se genera automáticamente
  }
  
  modal.classList.add('active');
}

function closeCategoryModal() {
  document.getElementById('categoryModal').classList.remove('active');
}

function saveCategory(event) {
  event.preventDefault();
  
  const form = document.getElementById('categoryForm');
  const categoryId = form.categoryId.value;
  const categoryName = form.categoryName.value;
  const categoryIcon = form.categoryIcon.value;
  
  const existingCategory = categories.find(c => c.id === categoryId);
  
  if (existingCategory) {
    existingCategory.name = categoryName;
    existingCategory.icon = categoryIcon;
    showMessage('Categoría actualizada correctamente', 'success');
  } else {
    categories.push({
      id: categoryId,
      name: categoryName,
      icon: categoryIcon
    });
    showMessage('Categoría añadida correctamente', 'success');
  }
  
  saveDataToStorage();
  renderCategoriesTable();
  closeCategoryModal();
}

function editCategory(categoryId) {
  openCategoryForm(categoryId);
}

function deleteCategory(categoryId) {
  const productsInCategory = products.filter(p => p.category === categoryId).length;
  
  if (productsInCategory > 0) {
    alert(`No se puede eliminar esta categoría porque tiene ${productsInCategory} producto(s) asociado(s).`);
    return;
  }
  
  if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
    categories = categories.filter(c => c.id !== categoryId);
    saveDataToStorage();
    renderCategoriesTable();
    showMessage('Categoría eliminada correctamente', 'success');
  }
}

// ==================== ESTADÍSTICAS ====================

function updateStats() {
  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.available).length;
  const unavailableProducts = totalProducts - availableProducts;
  const totalUnits = products.reduce((sum, p) => sum + p.totalUnits, 0);
  
  document.querySelector('.stat-total .stat-number').textContent = totalProducts;
  document.querySelector('.stat-available .stat-number').textContent = availableProducts;
  document.querySelector('.stat-unavailable .stat-number').textContent = unavailableProducts;
  document.querySelector('.stat-units .stat-number').textContent = totalUnits;
}

// ==================== IMPORTAR/EXPORTAR ==================== 

function exportData() {
  const data = {
    products: products,
    categories: categories,
    exportDate: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `catalogo-${new Date().getTime()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showMessage('Datos exportados correctamente', 'success');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      products = data.products || [];
      categories = data.categories || [];
      saveDataToStorage();
      renderProductsTable();
      updateStats();
      showMessage('Datos importados correctamente', 'success');
    } catch (error) {
      showMessage('Error al importar los datos: ' + error.message, 'error');
    }
  };
  reader.readAsText(file);
}

// ==================== CONFIGURACIÓN ====================

function loadConfigSettings() {
  const config = JSON.parse(localStorage.getItem('storeConfig') || '{}');
  
  if (config.whatsappNumber) {
    document.getElementById('whatsappNumber').value = config.whatsappNumber;
  }
  if (config.email) {
    document.getElementById('email').value = config.email;
  }
  if (config.storeName) {
    document.getElementById('storeName').value = config.storeName;
  }
  if (config.storeLocation) {
    document.getElementById('storeLocation').value = config.storeLocation;
  }
}

function saveContactInfo() {
  const whatsappNumber = document.getElementById('whatsappNumber').value.trim();
  const email = document.getElementById('email').value.trim();
  
  if (!whatsappNumber) {
    showMessage('El número de WhatsApp es requerido', 'error');
    return;
  }
  
  const config = JSON.parse(localStorage.getItem('storeConfig') || '{}');
  config.whatsappNumber = whatsappNumber;
  config.email = email;
  
  localStorage.setItem('storeConfig', JSON.stringify(config));
  showMessage('Información de contacto guardada correctamente', 'success');
}

function saveStoreInfo() {
  const storeName = document.getElementById('storeName').value.trim();
  const storeLocation = document.getElementById('storeLocation').value.trim();
  
  const config = JSON.parse(localStorage.getItem('storeConfig') || '{}');
  config.storeName = storeName;
  config.storeLocation = storeLocation;
  
  localStorage.setItem('storeConfig', JSON.stringify(config));
  showMessage('Información de la tienda guardada correctamente', 'success');
}

// ==================== MENSAJES ====================

function showMessage(text, type = 'success') {
  const messagesContainer = document.getElementById('messagesContainer') || createMessagesContainer();
  
  const message = document.createElement('div');
  message.className = `message message-${type}`;
  message.innerHTML = `
    <strong>${type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'}</strong>
    ${text}
  `;
  
  messagesContainer.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 4000);
}

function createMessagesContainer() {
  const container = document.createElement('div');
  container.id = 'messagesContainer';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    max-width: 400px;
  `;
  document.body.appendChild(container);
  return container;
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Vista previa de imagen
  const imageInput = document.getElementById('productImage');
  if (imageInput) {
    imageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const previewImg = document.getElementById('previewImg');
          previewImg.src = event.target.result;
          previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Cerrar modales con Esc
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });
  
  // Cerrar modales al hacer click afuera
  document.querySelectorAll('.modal').forEach(modal => {
    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
  
  // Renderizar tabla de categorías
  renderCategoriesTable();
}

// ==================== OPCIONES ADICIONALES ====================

async function clearAllData() {
  if (confirm('⚠️ ADVERTENCIA: Esta acción eliminará TODOS los datos. ¿Estás completamente seguro?')) {
    if (confirm('Esta es tu última oportunidad. ¿Deseas continuar?')) {
      // Limpiar Firebase primero
      if (window.firebaseActive) {
        await window.saveProductsToFirebase([]);
        await window.saveCategoriesFirebase([]);
      }
      
      // Limpiar localStorage
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES);
      
      products = [];
      categories = [];
      await loadDefaultData();
      renderProductsTable();
      updateStats();
      showMessage('Datos restablecidos a valores por defecto', 'warning');
    }
  }
}
