const BASE_URL = 'https://dummyjson.com';

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    title: 'Alpha Tech Pro Laptop',
    price: 1299.99,
    category: 'laptops',
    stock: 15,
    rating: 4.89,
    thumbnail: 'https://images.unsplash.com/photo-1496181130204-7552cc1454e4?w=150&q=80',
    description: 'Next-generation dashboard workstation with 32GB RAM, 1TB SSD, and M3 Pro Equivalent processor.',
    brand: 'AlphaTech',
  },
  {
    id: 2,
    title: 'Omega Quantum Screen',
    price: 549.99,
    category: 'monitors',
    stock: 8,
    rating: 4.65,
    thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=150&q=80',
    description: '34-inch ultra-wide curved screen with 144Hz refresh rate, HDR 400 support, and USB-C power delivery.',
    brand: 'OmegaTech',
  },
  {
    id: 3,
    title: 'Sigma Touch Wireless Mouse',
    price: 89.99,
    category: 'accessories',
    stock: 50,
    rating: 4.5,
    thumbnail: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&q=80',
    description: 'Ergonomic multi-device Bluetooth mouse with silent clicks, gesture control, and 70-day battery life.',
    brand: 'SigmaLabs',
  },
  {
    id: 4,
    title: 'Hex Mechanical Keyboard Pro',
    price: 179.99,
    category: 'accessories',
    stock: 0,
    rating: 4.92,
    thumbnail: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=150&q=80',
    description: 'Hot-swappable tactile keyboard with custom lubricated switches, PBT keycaps, and aluminum case.',
    brand: 'HexDesign',
  },
  {
    id: 5,
    title: 'Neural Web Camera 4K',
    price: 220.00,
    category: 'accessories',
    stock: 22,
    rating: 4.3,
    thumbnail: 'https://images.unsplash.com/photo-1589330694653-ded6df53f6ee?w=150&q=80',
    description: 'Smart autofocus AI camera with dual stereo mics, active tracking, and automatic white balance.',
    brand: 'NeuralTech',
  },
];

let cachedProductsPromise = null;

export function getPersistedPublishedStates() {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.localStorage.getItem('alpha_products_published');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.warn('Error reading published states from LocalStorage:', e);
    return {};
  }
}

export function setProductPublishedState(productId, isPublished) {
  if (typeof window === 'undefined') return;
  try {
    const states = getPersistedPublishedStates();
    states[productId] = isPublished;
    window.localStorage.setItem('alpha_products_published', JSON.stringify(states));
    window.dispatchEvent(new Event('local-storage-update'));
  } catch (e) {
    console.warn('Error saving published state to LocalStorage:', e);
  }
}

function fetchAllProducts() {
  if (cachedProductsPromise) return cachedProductsPromise;

  cachedProductsPromise = fetch(`${BASE_URL}/products?limit=250`)
    .then((res) => {
      if (!res.ok) throw new Error('API server returned error');
      return res.json();
    })
    .then((data) => data.products || [])
    .catch((error) => {
      console.warn('DummyJSON fetch failed. Using local fallback catalog database.', error);
      cachedProductsPromise = null;
      return FALLBACK_PRODUCTS;
    });

  return cachedProductsPromise;
}

export async function getProducts(options = {}) {
  const { limit = 10, skip = 0, category, q, sortBy, order, role = 'user' } = options;
  
  let list = await fetchAllProducts();
  
  const publishedMap = getPersistedPublishedStates();
  list = list.map(item => {
    const customPub = publishedMap[item.id];
    return {
      ...item,
      isPublished: customPub !== undefined ? customPub : true,
    };
  });

  if (role !== 'admin') {
    list = list.filter(item => item.isPublished === true);
  }

  if (category) {
    const activeCategories = category
      .split(',')
      .map(c => c.trim().toLowerCase())
      .filter(Boolean);
      
    if (activeCategories.length > 0) {
      list = list.filter(item => activeCategories.includes(item.category.toLowerCase()));
    }
  }

  if (q) {
    const searchQ = q.trim().toLowerCase();
    list = list.filter(item => {
      const matchTitle = item.title ? item.title.toLowerCase().includes(searchQ) : false;
      const matchBrand = item.brand ? item.brand.toLowerCase().includes(searchQ) : false;
      const matchCategory = item.category ? item.category.toLowerCase().includes(searchQ) : false;
      return matchTitle || matchBrand || matchCategory;
    });
  }

  if (sortBy) {
    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'name') {
        valA = a.title || '';
        valB = b.title || '';
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return order === 'desc' ? valB - valA : valA - valB;
      }

      return order === 'desc'
        ? String(valB).localeCompare(String(valA))
        : String(valA).localeCompare(String(valB));
    });
  }

  const total = list.length;
  const paginatedList = list.slice(skip, skip + limit);

  return {
    products: paginatedList,
    total,
    skip,
    limit,
  };
}

export async function getProductById(id, role = 'user') {
  const list = await fetchAllProducts();
  const item = list.find(p => p.id === Number(id));
  
  if (!item) {
    throw new Error(`Product ID ${id} not found in catalog database`);
  }

  const publishedMap = getPersistedPublishedStates();
  const customPub = publishedMap[item.id];
  const isPublished = customPub !== undefined ? customPub : true;

  const enrichedProduct = {
    ...item,
    isPublished,
  };

  // Prevent non-admin users from accessing unpublished products directly
  if (role !== 'admin' && !isPublished) {
    throw new Error('Product not available. This resource is unpublished.');
  }

  return enrichedProduct;
}

export async function getCategories() {
  try {
    const res = await fetch(`${BASE_URL}/products/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories list');
    const data = await res.json();
    
    if (Array.isArray(data)) {
      return data.map(item => typeof item === 'object' ? item.slug : item);
    }
    return data;
  } catch (error) {
    console.warn('DummyJSON categories fetch failed. Relying on local mockups categories.', error);
    const list = await fetchAllProducts();
    return Array.from(new Set(list.map(p => p.category)));
  }
}

export async function getRelatedProducts(productId, category, role = 'user') {
  const result = await getProducts({ category, limit: 15, role });
  return result.products
    .filter(p => p.id !== Number(productId))
    .slice(0, 4);
}

export async function refreshProductsCache() {
  cachedProductsPromise = null;
  return fetchAllProducts();
}

const productsService = {
  getProducts,
  getProductById,
  getCategories,
  getPersistedPublishedStates,
  setProductPublishedState,
  getRelatedProducts,
  refreshProductsCache,
};

export default productsService;
