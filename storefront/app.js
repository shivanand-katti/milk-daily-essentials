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
  const clearSearch = document.querySelector('#clear-search');
  const cartDrawer = document.querySelector('#cart-drawer');
  const backdrop = document.querySelector('#drawer-backdrop');
  const cartItems = document.querySelector('#cart-items');
  const cartCount = document.querySelector('#cart-count');
  const subtotal = document.querySelector('#cart-subtotal');
  const drawerItemCount = document.querySelector('#drawer-item-count');
  const toast = document.querySelector('#toast');
  const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
  const cart = new Map();
  let products = [];
  let activeCategory = 'All';
  let toastTimeout;

  const text = (value) => String(value ?? '').trim();
  const categoryFor = (product) => {
    const value = [product.name, product.sku, product.description].join(' ').toLowerCase();
    if (/buffalo milk|cow milk|milk/.test(value)) return 'Milk';
    if (/curd|yogurt|yoghurt/.test(value)) return 'Curd';
    if (/paneer/.test(value)) return 'Paneer';
    if (/ghee/.test(value)) return 'Ghee';
    if (/butter/.test(value)) return 'Butter';
    if (/egg/.test(value)) return 'Eggs';
    if (/fruit|apple|orange|banana|grape|mango/.test(value)) return 'Fruits';
    if (/vegetable|tomato|onion|potato|carrot|spinach|greens/.test(value)) return 'Vegetables';
    if (/cheese|dairy/.test(value)) return 'Dairy';
    if (/rice|atta|flour|dal|lentil|oil|sugar|salt|grain|pulses|wheat|masala|spice/.test(value)) return 'Pantry';
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
    if (/onion|potato|vegetable|tomato/.test(value)) return '🥬';
    return '🛍️';
  };
  const imageUrlFor = (value) => {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  // Use real product photography when the admin/API record has no image URL.
  // API-provided imageUrl always takes priority.
  const fallbackPhotoFor = (product) => {
    const value = [product.name, product.sku, product.description].join(' ').toLowerCase();
    if (/buffalo milk|cow milk|milk/.test(value)) return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=85';
    if (/curd|yogurt|yoghurt/.test(value)) return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=85';
    if (/paneer|cheese/.test(value)) return 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=700&q=85';
    if (/egg/.test(value)) return 'https://images.unsplash.com/photo-1506976785307-8732e783aee6?auto=format&fit=crop&w=700&q=85';
    if (/rice|grain|atta|flour|wheat|dal|lentil|pulses/.test(value)) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=85';
    if (/fruit|apple|orange|banana|grape|mango/.test(value)) return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=85';
    if (/vegetable|tomato|onion|potato|carrot|spinach|greens/.test(value)) return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=85';
    if (/ghee|butter/.test(value)) return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=700&q=85';
    return '';
  };
  const availableStock = (product) => product.stockQuantity === null || product.stockQuantity === undefined ? Infinity : Math.max(0, Number(product.stockQuantity) || 0);
  const cartQuantity = (id) => cart.get(id)?.quantity || 0;
  const cartTotal = () => [...cart.values()].reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);
  const cartCountTotal = () => [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2300);
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    backdrop.hidden = false;
    document.body.classList.add('drawer-open');
    document.querySelector('#close-cart').focus();
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
    document.body.classList.remove('drawer-open');
    document.querySelector('#open-cart').focus();
  }

  function renderFilters() {
    const categories = ['All', ...new Set(products.map(categoryFor))];
    filters.replaceChildren();
    categories.forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-chip' + (category === activeCategory ? ' active' : '');
      button.textContent = category === 'All' ? 'Everything' : category;
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
    tag.textContent = categoryFor(product) === 'Essentials' ? 'EVERYDAY PICK' : categoryFor(product).toUpperCase();
    visual.append(tag);
    const imageUrl = imageUrlFor(product.imageUrl) || fallbackPhotoFor(product);
    if (imageUrl) {
      const image = document.createElement('img');
      image.src = imageUrl;
      image.alt = text(product.name);
      image.loading = 'lazy';
      image.addEventListener('error', () => {
        image.remove();
        addEmojiFallback(visual, product);
      }, { once: true });
      visual.append(image);
    } else addEmojiFallback(visual, product);

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
    const quantity = availableStock(product);
    if (quantity <= 0) {
      stock.textContent = 'Out of stock';
      stock.classList.add('low');
    } else if (quantity <= 10) {
      stock.textContent = quantity === Infinity ? 'Available' : 'Only ' + quantity + ' left';
      stock.classList.add('low');
    } else stock.textContent = 'Available';
    bottom.append(price, stock);
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'add-button';
    add.disabled = quantity <= 0;
    add.setAttribute('aria-label', 'Add ' + text(product.name) + ' to basket');
    const addLabel = document.createElement('span');
    addLabel.textContent = quantity <= 0 ? 'Out of stock' : cartQuantity(product.id) ? 'Add another · ' + cartQuantity(product.id) + ' in basket' : 'Add to basket';
    const addIcon = document.createElement('span');
    addIcon.textContent = quantity <= 0 ? '—' : '+';
    add.append(addLabel, addIcon);
    add.addEventListener('click', () => addToCart(product));
    content.append(category, name, description, bottom, add);
    card.append(visual, content);
    return card;
  }

  function addEmojiFallback(visual, product) {
    const fallback = document.createElement('span');
    fallback.className = 'product-emoji';
    fallback.setAttribute('aria-hidden', 'true');
    fallback.textContent = emojiFor(product);
    visual.append(fallback);
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
    count.textContent = filtered.length + (filtered.length === 1 ? ' item shown' : ' items shown') + ' · ' + products.length + ' available';
    clearSearch.hidden = !search.value;
  }

  function addToCart(product, amount = 1) {
    const id = product.id ?? product.sku ?? product.name;
    const existing = cart.get(id);
    const nextQuantity = (existing?.quantity || 0) + amount;
    if (nextQuantity < 1) cart.delete(id);
    else {
      if (nextQuantity > availableStock(product)) {
        showToast('That is all the stock currently available for ' + text(product.name) + '.');
        return;
      }
      cart.set(id, { product, quantity: nextQuantity });
    }
    renderCart();
    renderProducts();
    if (amount > 0) showToast(text(product.name) + ' added to your basket.');
  }

  function renderCart() {
    const totalCount = cartCountTotal();
    const total = cartTotal();
    cartCount.textContent = totalCount;
    drawerItemCount.textContent = '(' + totalCount + ')';
    subtotal.textContent = currency.format(total);
    const target = 499;
    const progress = Math.min(100, total / target * 100);
    document.querySelector('#progress-fill').style.width = progress + '%';
    document.querySelector('#progress-amount').textContent = currency.format(total);
    document.querySelector('#progress-message').textContent = total === 0 ? 'Your basket starts here.' : total >= target ? 'A basket full of everyday good.' : currency.format(target - total) + ' more to reach ₹499';
    cartItems.replaceChildren();
    if (!totalCount) {
      const blank = document.createElement('div');
      blank.className = 'cart-empty';
      const icon = document.createElement('span'); icon.textContent = '🧺';
      const title = document.createElement('b'); title.textContent = 'A little room for good things.';
      const message = document.createElement('p'); message.textContent = 'Add a few everyday favourites to get started.';
      const button = document.createElement('button'); button.id = 'start-shopping'; button.className = 'primary-button'; button.type = 'button'; button.textContent = 'Explore products ↘'; button.addEventListener('click', closeCart);
      blank.append(icon, title, message, button);
      cartItems.append(blank);
      return;
    }
    [...cart.entries()].forEach(([id, item]) => {
      const line = document.createElement('div'); line.className = 'cart-line';
      const visual = document.createElement('div'); visual.className = 'cart-line-visual'; visual.textContent = emojiFor(item.product);
      const info = document.createElement('div');
      const name = document.createElement('div'); name.className = 'cart-line-name'; name.textContent = text(item.product.name);
      const unit = document.createElement('div'); unit.className = 'cart-line-unit'; unit.textContent = text(item.product.unit) || 'per pack';
      const controls = document.createElement('div'); controls.className = 'quantity-control';
      const minus = document.createElement('button'); minus.type = 'button'; minus.textContent = '−'; minus.setAttribute('aria-label', 'Remove one ' + text(item.product.name)); minus.addEventListener('click', () => changeQuantity(id, -1));
      const qty = document.createElement('span'); qty.textContent = item.quantity;
      const plus = document.createElement('button'); plus.type = 'button'; plus.textContent = '+'; plus.setAttribute('aria-label', 'Add one ' + text(item.product.name)); plus.disabled = item.quantity >= availableStock(item.product); plus.addEventListener('click', () => changeQuantity(id, 1));
      controls.append(minus, qty, plus); info.append(name, unit, controls);
      const price = document.createElement('div'); price.className = 'cart-line-price'; price.textContent = currency.format(Number(item.product.price || 0) * item.quantity);
      line.append(visual, info, price); cartItems.append(line);
    });
  }

  function changeQuantity(id, delta) {
    const item = cart.get(id);
    if (!item) return;
    addToCart(item.product, delta);
  }

  function buildMorningBasket() {
    const preferred = products.filter((product) => /milk|egg|bread|curd|yogurt|banana|rice/.test([product.name, product.sku].join(' ').toLowerCase()) && availableStock(product) > 0).slice(0, 4);
    if (!preferred.length) {
      showToast('Browse the catalog and add your own everyday favourites.');
      document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    preferred.forEach((product) => {
      const id = product.id ?? product.sku ?? product.name;
      if (!cart.has(id)) addToCart(product);
    });
    openCart();
    showToast('Your starter basket is ready to personalise.');
  }

  async function loadProducts() {
    state.hidden = false;
    state.replaceChildren();
    const spinner = document.createElement('span'); spinner.className = 'loader'; spinner.setAttribute('aria-hidden', 'true');
    const message = document.createElement('span'); message.textContent = 'Getting the good stuff ready…';
    state.append(spinner, message); grid.replaceChildren(); empty.hidden = true; retry.hidden = true; count.textContent = 'Connecting to store…';
    try {
      const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Catalog service returned HTTP ' + response.status);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Catalog response was not a product list');
      products = data.filter((product) => product && product.available !== false);
      activeCategory = 'All';
      renderFilters(); renderProducts(); state.hidden = true;
      if (!products.length) { state.hidden = false; state.textContent = 'The shelves are taking a breather. Please check back soon.'; }
    } catch (error) {
      state.hidden = false; state.replaceChildren();
      const message = document.createElement('span'); message.textContent = 'Our shelves are taking a moment to wake up. Please try again shortly.';
      state.append(message); count.textContent = 'Catalog temporarily unavailable'; retry.hidden = false;
      console.error('Unable to load product catalog:', error);
    }
  }

  search.addEventListener('input', renderProducts);
  clearSearch.addEventListener('click', () => { search.value = ''; renderProducts(); search.focus(); });
  retry.addEventListener('click', loadProducts);
  clear.addEventListener('click', () => { search.value = ''; activeCategory = 'All'; renderFilters(); renderProducts(); });
  document.querySelector('#open-cart').addEventListener('click', openCart);
  document.querySelector('#close-cart').addEventListener('click', closeCart);
  backdrop.addEventListener('click', closeCart);
  document.querySelector('#start-shopping').addEventListener('click', closeCart);
  document.querySelector('#build-morning').addEventListener('click', buildMorningBasket);
  document.querySelector('#checkout-preview').addEventListener('click', () => showToast('Checkout and delivery scheduling are the next development milestone.'));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && cartDrawer.classList.contains('open')) closeCart(); });
  document.querySelector('#year').textContent = new Date().getFullYear();
  renderCart();
  loadProducts();
})();
