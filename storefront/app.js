(() => {
  'use strict';
  const API_URL = 'https://milk-daily-essentials.onrender.com/api/v1/products';
  const grid = document.querySelector('#product-grid');
  const state = document.querySelector('#catalog-state');
  const empty = document.querySelector('#empty-state');
  const search = document.querySelector('#product-search');
  const filters = document.querySelector('#category-filters');
  const count = document.querySelector('#catalog-count');
  const retry = document.querySelector('#retry-button');
  const clear = document.querySelector('#clear-filters');
  const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
  let products = [];
  let activeCategory = 'All';

  const text = (value) => String(value ?? '').trim();
  const categoryFor = (product) => {
    const value = [product.name, product.sku, product.description].join(' ').toLowerCase();
    if (/milk|curd|yogurt|paneer|cheese|butter|ghee|dairy/.test(value)) return 'Dairy';
    if (/egg/.test(value)) return 'Eggs';
    if (/rice|atta|flour|dal|lentil|oil|sugar|salt|grain|pulses|wheat/.test(value)) return 'Pantry';
    if (/soap|detergent|cleaner|tissue|household|dishwash/.test(value)) return 'Home care';
    return 'Essentials';
  };
  const emojiFor = (product) => {
    const value = [product.name, product.sku].join(' ').toLowerCase();
    if (/milk/.test(value)) return '🥛';
    if (/curd|yogurt/.test(value)) return '🥣';
    if (/paneer|cheese/.test(value)) return '🧀';
    if (/butter|ghee/.test(value)) return '🧈';
    if (/egg/.test(value)) return '🥚';
    if (/rice|grain/.test(value)) return '🍚';
    if (/atta|flour|wheat/.test(value)) return '🌾';
    if (/oil/.test(value)) return '🫒';
    if (/fruit|apple|orange|banana/.test(value)) return '🍎';
    if (/soap|detergent|cleaner|tissue|dishwash/.test(value)) return '🧼';
    if (/bread|bakery/.test(value)) return '🍞';
    return '🛍️';
  };
  const imageUrlFor = (value) => {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };

  function renderFilters() {
    const categories = ['All', ...new Set(products.map(categoryFor))];
    filters.replaceChildren();
    categories.forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-chip' + (category === activeCategory ? ' active' : '');
      button.textContent = category === 'All' ? 'All products' : category;
      button.setAttribute('aria-pressed', String(category === activeCategory));
      button.addEventListener('click', () => {
        activeCategory = category;
        renderFilters();
        renderProducts();
      });
      filters.append(button);
    });
  }

  function createCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';
    const visual = document.createElement('div');
    visual.className = 'product-visual';
    const tag = document.createElement('span');
    tag.className = 'product-tag';
    tag.textContent = 'IN STORE';
    visual.append(tag);
    const imageUrl = imageUrlFor(product.imageUrl);
    if (imageUrl) {
      const image = document.createElement('img');
      image.src = imageUrl;
      image.alt = text(product.name);
      image.loading = 'lazy';
      image.addEventListener('error', () => {
        image.remove();
        const fallback = document.createElement('span');
        fallback.className = 'product-emoji';
        fallback.setAttribute('aria-hidden', 'true');
        fallback.textContent = emojiFor(product);
        visual.append(fallback);
      }, { once: true });
      visual.append(image);
    } else {
      const fallback = document.createElement('span');
      fallback.className = 'product-emoji';
      fallback.setAttribute('aria-hidden', 'true');
      fallback.textContent = emojiFor(product);
      visual.append(fallback);
    }
    const content = document.createElement('div');
    content.className = 'product-content';
    const category = document.createElement('div');
    category.className = 'product-category';
    category.textContent = categoryFor(product);
    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = text(product.name) || 'Unnamed product';
    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = text(product.description) || 'A useful everyday essential, ready for your routine.';
    const bottom = document.createElement('div');
    bottom.className = 'product-bottom';
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = currency.format(Number(product.price) || 0);
    const unit = document.createElement('span');
    unit.className = 'product-unit';
    unit.textContent = text(product.unit) || 'per pack';
    price.append(unit);
    const stock = document.createElement('div');
    stock.className = 'stock-note';
    const quantity = product.stockQuantity;
    if (quantity !== null && quantity !== undefined && Number(quantity) <= 0) {
      stock.textContent = 'Out of stock';
      stock.classList.add('low');
    } else if (quantity !== null && quantity !== undefined && Number(quantity) <= 10) {
      stock.textContent = 'Limited stock';
      stock.classList.add('low');
    } else {
      stock.textContent = 'Available';
    }
    bottom.append(price, stock);
    content.append(category, name, description, bottom);
    card.append(visual, content);
    return card;
  }

  function renderProducts() {
    const term = search.value.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || categoryFor(product) === activeCategory;
      const haystack = [product.name, product.sku, product.description, product.unit].map(text).join(' ').toLowerCase();
      return matchesCategory && haystack.includes(term);
    });
    grid.replaceChildren(...filtered.map(createCard));
    empty.hidden = filtered.length !== 0;
    count.textContent = products.length + (products.length === 1 ? ' product available' : ' products available');
  }

  async function loadProducts() {
    state.hidden = false;
    state.replaceChildren();
    const spinner = document.createElement('span');
    spinner.className = 'loader';
    spinner.setAttribute('aria-hidden', 'true');
    const message = document.createElement('span');
    message.textContent = 'Loading fresh products…';
    state.append(spinner, message);
    grid.replaceChildren();
    empty.hidden = true;
    retry.hidden = true;
    count.textContent = 'Connecting…';
    try {
      const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Catalog service returned HTTP ' + response.status);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Catalog response was not a product list');
      products = data.filter((product) => product && product.available !== false);
      activeCategory = 'All';
      search.value = '';
      renderFilters();
      renderProducts();
      state.hidden = true;
      if (products.length === 0) {
        state.hidden = false;
        state.textContent = 'No products are available right now. Please check back soon.';
      }
    } catch (error) {
      state.hidden = false;
      state.replaceChildren();
      const message = document.createElement('span');
      message.textContent = 'We couldn’t load the catalog. The API may be waking up or temporarily unavailable. Please try again.';
      state.append(message);
      count.textContent = 'Catalog unavailable';
      retry.hidden = false;
      console.error('Unable to load product catalog:', error);
    }
  }
  search.addEventListener('input', renderProducts);
  retry.addEventListener('click', loadProducts);
  clear.addEventListener('click', () => {
    search.value = '';
    activeCategory = 'All';
    renderFilters();
    renderProducts();
  });
  document.querySelector('#year').textContent = new Date().getFullYear();
  loadProducts();
})();
