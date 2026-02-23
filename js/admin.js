// ==================== VARIABLES GLOBALES ====================

let products = [];
let categories = [];
let editingProductId = null;

const STORAGE_KEY = 'catalog_products';
const STORAGE_KEY_CATEGORIES = 'catalog_categories';

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', async function() {
  await loadDataFromStorage();
  renderProductsTable();
  updateStats();
  setupEventListeners();
  populateCategorySelect(); // Rellenar select DESPUÉS de cargar datos
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
  // Intentar cargar de Firebase primero
  if (firebaseActive) {
    try {
      const fbProducts = await loadProductsFromFirebase();
      const fbCategories = await loadCategoriesFromFirebase();
      
      if (fbProducts) {
        products = fbProducts;
      }
      if (fbCategories) {
        categories = fbCategories;
      }
      
      if (fbProducts && fbCategories) {
        return; // Datos cargados correctamente de Firebase
      }
    } catch (e) {
      console.error('Error cargando de Firebase:', e);
    }
  }
  
  // Fallback: Cargar desde localStorage si Firebase no tiene datos
  const storedProducts = localStorage.getItem(STORAGE_KEY);
  if (storedProducts) {
    try {
      products = JSON.parse(storedProducts);
    } catch (e) {
      console.error('Error cargando productos:', e);
      await loadDefaultData();
      return;
    }
  } else {
    await loadDefaultData();
    return;
  }
  
  // Cargar categorías desde localStorage
  const storedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
  if (storedCategories) {
    try {
      categories = JSON.parse(storedCategories);
    } catch (e) {
      console.error('Error cargando categorías:', e);
    }
  }
}

async function saveDataToStorage() {
  await saveSyncedData();
  showMessage('Cambios guardados correctamente', 'success');
}

async function saveSyncedData() {
  // Guardar en Firebase primero
  if (firebaseActive) {
    const productosSaved = await saveProductsToFirebase(products);
    const categoriasSaved = await saveCategoriesFirebase(categories);
    
    if (productosSaved && categoriasSaved) {
      console.log('✅ Datos guardados en Firebase');
      return;
    }
  }
  
  // Fallback: Guardar en localStorage si Firebase no está disponible
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  console.log('⚠️ Datos guardados en localStorage (Firebase no disponible)');
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
      if (firebaseActive) {
        await saveProductsToFirebase([]);
        await saveCategoriesFirebase([]);
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
