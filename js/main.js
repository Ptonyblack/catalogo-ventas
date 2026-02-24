// ==================== VARIABLES GLOBALES ====================

let allProducts = [];
let categories = [];
let currentCarouselIndex = 0;
let filteredProducts = [];
let currentFilter = 'all';
let phoneNumber = '5351234567'; // Cambiar por el número de WhatsApp

// ==================== CARGAR DATOS ====================

async function loadProducts() {
  try {
    let hasFirebaseData = false;
    
    // Cargar desde Firebase (esperar a que estén disponibles)
    if (window.loadProductsFromFirebase && window.firebaseActive) {
      try {
        console.log('📍 Intentando cargar de Firebase...');
        const fbProducts = await window.loadProductsFromFirebase();
        const fbCategories = await window.loadCategoriesFromFirebase();
        
        if (fbProducts && fbProducts.length > 0) {
          allProducts = fbProducts;
          categories = fbCategories || [];
          hasFirebaseData = true;
          console.log('✅ Productos cargados de Firebase:', fbProducts.length);
        } else {
          console.log('ℹ️ Firebase está vacío, usando fallback');
        }
      } catch (fbError) {
        console.error('⚠️ Error leyendo Firebase:', fbError.message);
      }
    } else {
      console.log('⚠️ Firebase no disponible, usando fallback');
    }
    
    // Si Firebase no tiene datos, cargar desde archivo local
    if (!hasFirebaseData) {
      console.log('📍 Cargando datos locales desde products.json...');
      const response = await fetch('data/products.json');
      const data = await response.json();
      allProducts = data.products || [];
      categories = data.categories || [];
      console.log('✅ Datos locales cargados:', allProducts.length, 'productos');
    }
    
    filteredProducts = allProducts;
    
    initializeCarousel();
    renderProducts();
    renderCategoryButtons();
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

// ==================== CAROUSEL ====================

function initializeCarousel() {
  const carouselProducts = allProducts.slice(0, 5);
  updateCarousel(0);
  
  // Auto-advance carousel cada 5 segundos
  setInterval(() => {
    currentCarouselIndex = (currentCarouselIndex + 1) % carouselProducts.length;
    updateCarousel(currentCarouselIndex);
  }, 5000);
}

function updateCarousel(index) {
  const carouselProducts = allProducts.slice(0, 5);
  if (carouselProducts.length === 0) return;
  
  const carousel = document.querySelector('.carousel');
  carousel.style.transform = `translateX(-${index * 100}%)`;
  
  // Actualizar puntos
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function nextSlide() {
  const carouselProducts = allProducts.slice(0, 5);
  currentCarouselIndex = (currentCarouselIndex + 1) % carouselProducts.length;
  updateCarousel(currentCarouselIndex);
}

function prevSlide() {
  const carouselProducts = allProducts.slice(0, 5);
  currentCarouselIndex = (currentCarouselIndex - 1 + carouselProducts.length) % carouselProducts.length;
  updateCarousel(currentCarouselIndex);
}

function currentSlide(index) {
  currentCarouselIndex = index;
  updateCarousel(currentCarouselIndex);
}

// ==================== CATEGORIAS Y FILTRADO ====================

function renderCategoryButtons() {
  const container = document.querySelector('.category-filters');
  container.innerHTML = '';
  
  // Botón "Todos"
  const allBtn = document.createElement('button');
  allBtn.className = 'category-btn active';
  allBtn.textContent = 'Todos los Productos';
  allBtn.onclick = () => filterByCategory('all');
  container.appendChild(allBtn);
  
  // Botones de categorías
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.textContent = `${cat.name}`;
    btn.onclick = () => filterByCategory(cat.id);
    container.appendChild(btn);
  });
}

function filterByCategory(categoryId) {
  currentFilter = categoryId;
  
  // Actualizar botones activos
  document.querySelectorAll('.category-btn').forEach((btn, index) => {
    btn.classList.remove('active');
    if (index === 0 && categoryId === 'all') btn.classList.add('active');
    else if (index > 0 && categories[index - 1]?.id === categoryId) btn.classList.add('active');
  });
  
  // Filtrar productos
  if (categoryId === 'all') {
    filteredProducts = allProducts;
  } else {
    filteredProducts = allProducts.filter(p => p.category === categoryId);
  }
  
  renderProducts();
}

// ==================== RENDERIZAR PRODUCTOS ====================

function renderProducts() {
  const grid = document.querySelector('.products-grid');
  grid.innerHTML = '';
  
  if (filteredProducts.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">No hay productos en esta categoría</div>';
    return;
  }
  
  filteredProducts.forEach(product => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  const isAvailable = product.available;
  const availabilityClass = isAvailable ? 'available' : 'unavailable';
  const availabilityText = isAvailable ? '✓ Disponible' : '✗ No Disponible';
  
  card.innerHTML = `
    <div class="availability-badge ${availabilityClass}">${availabilityText}</div>
    
    <div class="product-image"><img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"></div>
    
    <h3 class="product-name">${product.name}</h3>
    
    <p class="product-description">${product.description}</p>
    
    <div class="product-stock ${isAvailable ? '' : 'stock-unavailable'}">
      <div class="stock-item">
        <span class="stock-label">Cajas:</span>
        <span class="stock-value">${product.boxesAvailable}</span>
      </div>
      <div class="stock-item">
        <span class="stock-label">Por Caja:</span>
        <span class="stock-value">${product.unitsPerBox}</span>
      </div>
      <div class="stock-item">
        <span class="stock-label">Total:</span>
        <span class="stock-value">${product.totalUnits}</span>
      </div>
    </div>
    
    <div class="product-prices">
      <div class="price-box">
        <span class="price-label">USD</span>
        <span class="price-value">$${product.priceUSD.toFixed(2)}</span>
      </div>
      <div class="price-box">
        <span class="price-label">CUP</span>
        <span class="price-value">₱${product.priceCUP}</span>
      </div>
    </div>
    
    <div class="product-actions">
      <button class="whatsapp-btn ${!isAvailable ? 'disabled-btn' : ''}" 
              onclick="contactByWhatsApp('${product.name}', ${isAvailable})"
              ${!isAvailable ? 'disabled' : ''}>
        WhatsApp
      </button>
    </div>
  `;
  
  return card;
}

// ==================== WHATSAPP ====================

function contactByWhatsApp(productName, available) {
  if (!available) return;
  
  const message = `Hola, me interesa el producto: *${productName}*. ¿Me puedes dar más información?`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
}

// ==================== SOLICITAR COTIZACION ====================
// Función removida - Los clientes compran directamente por WhatsApp

// ==================== INICIALIZACIÓN ====================

// ESPERAR A QUE FIREBASE ESTÉ LISTO PRIMERO
document.addEventListener('firebaseReady', function() {
  console.log('✅ Firebase listo en main.js');
  // Cargar número de WhatsApp desde configuración
  const config = JSON.parse(localStorage.getItem('storeConfig') || '{}');
  if (config.whatsappNumber) {
    phoneNumber = config.whatsappNumber;
    console.log('✅ Número de WhatsApp cargado:', phoneNumber);
  }
  
  // Asegurarse de que las funciones están disponibles
  setTimeout(() => {
    loadProducts();
  }, 100);
});

// FALLBACK: Si Firebase no se inicializa en 3 segundos, cargar de todas formas
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    if (!document.firebaseInitialized) {
      console.log('⚠️ Cargando productos sin esperar a Firebase');
      const config = JSON.parse(localStorage.getItem('storeConfig') || '{}');
      if (config.whatsappNumber) {
        phoneNumber = config.whatsappNumber;
      }
      loadProducts();
      document.firebaseInitialized = true;
    }
  }, 3000);
});

// ==================== BUSCAR PRODUCTOS ====================

function searchProducts(query) {
  const searchQuery = query.toLowerCase();
  filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery) ||
    p.description.toLowerCase().includes(searchQuery) ||
    p.category.toLowerCase().includes(searchQuery)
  );
  renderProducts();
}
