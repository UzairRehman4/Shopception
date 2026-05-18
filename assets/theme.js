const themeMoney = {
  format(cents, format = window.theme?.moneyFormat || '${{amount}}') {
    if (typeof cents === 'string') cents = cents.replace('.', '');

    const value = '';
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const formatWithDelimiters = (number, precision = 2, thousands = ',', decimal = '.') => {
      if (Number.isNaN(number) || number == null) return '0';

      const parts = (number / 100).toFixed(precision).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      return parts.join(decimal);
    };

    const match = format.match(placeholderRegex);
    if (!match) return value;

    switch (match[1]) {
      case 'amount':
        return format.replace(placeholderRegex, formatWithDelimiters(cents, 2));
      case 'amount_no_decimals':
        return format.replace(placeholderRegex, formatWithDelimiters(cents, 0));
      case 'amount_with_comma_separator':
        return format.replace(placeholderRegex, formatWithDelimiters(cents, 2, '.', ','));
      case 'amount_no_decimals_with_comma_separator':
        return format.replace(placeholderRegex, formatWithDelimiters(cents, 0, '.', ','));
      default:
        return format.replace(placeholderRegex, formatWithDelimiters(cents, 2));
    }
  }
};

class ProductInfo extends HTMLElement {
  connectedCallback() {
    const productJson = this.querySelector('[data-product-json]');
    if (!productJson) return;

    this.product = JSON.parse(productJson.textContent);
    this.variantInput = this.querySelector('[data-variant-id]');
    this.priceContainer = this.querySelector('[data-product-price]');
    this.stockStatus = this.querySelector('[data-stock-status]');
    this.addButton = this.querySelector('[data-add-to-cart]');
    this.optionGroups = this.querySelectorAll('[data-option-index]');

    this.querySelectorAll('[data-option-value]').forEach((button) => {
      button.addEventListener('click', () => this.onOptionSelect(button));
    });
  }

  onOptionSelect(button) {
    const group = button.closest('[data-option-index]');
    group.querySelectorAll('[data-option-value]').forEach((optionButton) => {
      optionButton.setAttribute('aria-pressed', String(optionButton === button));
    });

    this.updateVariant();
  }

  getSelectedOptions() {
    return [...this.optionGroups].map((group) => {
      return group.querySelector('[aria-pressed="true"]')?.getAttribute('data-option-value');
    });
  }

  updateVariant() {
    const selectedOptions = this.getSelectedOptions();
    const variant = this.product.variants.find((candidate) => {
      return candidate.options.every((option, index) => option === selectedOptions[index]);
    });

    this.currentVariant = variant;
    this.updateForm();
    this.updatePrice();
    this.updateMedia();
  }

  updateForm() {
    const strings = window.theme?.strings || {};

    if (!this.currentVariant) {
      this.addButton.disabled = true;
      this.addButton.textContent = strings.unavailable || 'Unavailable';
      this.stockStatus.textContent = strings.unavailable || 'Unavailable';
      return;
    }

    this.variantInput.value = this.currentVariant.id;
    this.addButton.disabled = !this.currentVariant.available;
    this.addButton.textContent = this.currentVariant.available
      ? strings.addToCart || 'Add to cart'
      : strings.soldOut || 'Sold out';
    this.stockStatus.textContent = this.currentVariant.available
      ? strings.inStock || 'In stock'
      : strings.soldOut || 'Sold out';

    const url = new URL(window.location.href);
    url.searchParams.set('variant', this.currentVariant.id);
    window.history.replaceState({}, '', url.toString());
  }

  updatePrice() {
    if (!this.priceContainer || !this.currentVariant) return;

    const price = themeMoney.format(this.currentVariant.price);
    const compareAtPrice = this.currentVariant.compare_at_price;

    this.priceContainer.innerHTML = compareAtPrice && compareAtPrice > this.currentVariant.price
      ? `<div class="price"><span class="visually-hidden">${window.theme?.strings?.salePrice || 'Sale price'}</span><span>${price}</span> <s>${themeMoney.format(compareAtPrice)}</s></div>`
      : `<div class="price">${price}</div>`;
  }

  updateMedia() {
    const mediaId = this.currentVariant?.featured_media?.id;
    if (!mediaId) return;

    const media = this.querySelector(`[data-product-media-id="${mediaId}"]`);
    media?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }
}

customElements.define('product-info', ProductInfo);

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
})[character]);

const themeCart = {
  async refresh(openDrawer = false) {
    const response = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Unable to refresh cart');

    const cart = await response.json();
    this.render(cart);

    if (openDrawer) {
      const trigger = document.querySelector('[data-cart-trigger]');
      const drawer = drawers.get('cart-drawer');
      drawer?.open(trigger);
    }
  },

  flash(title = '') {
    const oldToast = document.querySelector('[data-cart-toast]');
    oldToast?.remove();

    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.setAttribute('data-cart-toast', '');
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <span aria-hidden="true">+</span>
      <div>
        <strong>Added to cart</strong>
        ${title ? `<p>${escapeHtml(title)}</p>` : ''}
      </div>
    `;
    document.body.append(toast);

    requestAnimationFrame(() => toast.classList.add('is-visible'));
    window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => toast.remove(), 260);
    }, 1800);
  },

  render(cart) {
    document.querySelectorAll('[data-cart-count]').forEach((count) => {
      count.textContent = cart.item_count;
      const bubble = count.closest('.cart-bubble');
      bubble?.classList.remove('is-pulsing');
      requestAnimationFrame(() => bubble?.classList.add('is-pulsing'));
    });

    const itemsContainer = document.querySelector('[data-cart-drawer-items]');
    const subtotal = document.querySelector('[data-cart-subtotal]');
    const footer = document.querySelector('[data-cart-drawer-footer]');

    if (!itemsContainer || !subtotal || !footer) return;

    subtotal.textContent = themeMoney.format(cart.total_price);
    footer.hidden = cart.item_count === 0;

    if (cart.item_count === 0) {
      itemsContainer.innerHTML = `
        <div class="empty-state cart-drawer__empty premium-cart-empty">
          <p>${escapeHtml(window.theme?.strings?.cartEmpty || 'Your cart is empty')}</p>
          <a class="button" href="${window.theme?.routes?.allProducts || '/collections/all'}">${escapeHtml(window.theme?.strings?.continueShopping || 'Continue shopping')}</a>
        </div>
      `;
      return;
    }

    itemsContainer.innerHTML = cart.items.map((item) => {
      const image = item.image
        ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.product_title)}" loading="lazy">`
        : '';
      const variantTitle = item.variant_title
        ? `<p>${escapeHtml(item.variant_title)}</p>`
        : '';

      return `
        <article class="cart-drawer__item premium-cart-item">
          <a class="cart-drawer__image" href="${escapeHtml(item.url)}">${image}</a>
          <div>
            <a class="cart-drawer__title" href="${escapeHtml(item.url)}">${escapeHtml(item.product_title)}</a>
            ${variantTitle}
            <p>${escapeHtml(window.theme?.strings?.quantity || 'Quantity')}: ${item.quantity}</p>
          </div>
          <strong>${themeMoney.format(item.final_line_price)}</strong>
        </article>
      `;
    }).join('');
  }
};

const themeWishlist = {
  key: 'premiumDiamondWishlist',

  get() {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  },

  set(items) {
    localStorage.setItem(this.key, JSON.stringify([...new Set(items)].slice(0, 80)));
  },

  toggle(handle) {
    const items = this.get();
    const exists = items.includes(handle);
    this.set(exists ? items.filter((item) => item !== handle) : [handle, ...items]);
    return !exists;
  },

  init() {
    document.querySelectorAll('[data-wishlist-toggle]').forEach((button) => {
      const card = button.closest('[data-product-card]');
      const handle = button.dataset.productHandle || card?.dataset.productHandle || card?.dataset.productTitle;
      if (!handle) return;
      const active = this.get().includes(handle);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('span')?.replaceChildren(active ? '♥' : '♡');
    });
  }
};

const themeQuickView = {
  open(button) {
    const quickView = document.querySelector('[data-premium-quick-view]');
    if (!quickView || !button) {
      const url = button?.dataset.url;
      if (url) window.location.href = url;
      return;
    }

    const image = quickView.querySelector('[data-quick-view-image]');
    const title = quickView.querySelector('[data-quick-view-title]');
    const price = quickView.querySelector('[data-quick-view-price]');
    const type = quickView.querySelector('[data-quick-view-type]');
    const available = quickView.querySelector('[data-quick-view-available]');
    const link = quickView.querySelector('[data-quick-view-link]');
    const panel = quickView.querySelector('.premium-quick-view__panel');

    if (image) {
      image.src = button.dataset.image || '';
      image.alt = button.dataset.title || '';
    }
    title?.replaceChildren(button.dataset.title || '');
    price?.replaceChildren(button.dataset.price || '');
    type?.replaceChildren(button.dataset.type || 'Product');
    available?.replaceChildren(button.dataset.available || '');
    if (link) link.href = button.dataset.url || '#';
    quickView.hidden = false;
    document.body.classList.add('drawer-open');
    panel?.focus();
  },

  close() {
    const quickView = document.querySelector('[data-premium-quick-view]');
    if (!quickView) return;
    quickView.hidden = true;
    document.body.classList.remove('drawer-open');
  },

  init() {
    document.addEventListener('click', (event) => {
      const wishlist = event.target.closest('[data-wishlist-toggle]');
      if (wishlist) {
        const card = wishlist.closest('[data-product-card]');
        const handle = wishlist.dataset.productHandle || card?.dataset.productHandle || card?.dataset.productTitle;
        if (!handle) return;
        const active = themeWishlist.toggle(handle);
        wishlist.classList.toggle('is-active', active);
        wishlist.setAttribute('aria-pressed', String(active));
        wishlist.querySelector('span')?.replaceChildren(active ? '♥' : '♡');
        return;
      }

      const quick = event.target.closest('[data-quick-view]');
      if (quick) {
        this.open(quick);
        return;
      }

      if (event.target.closest('[data-quick-view-close]')) this.close();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.close();
    });

    themeWishlist.init();
  }
};

class ProductForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.button = this.querySelector('[data-add-to-cart]');

    if (!this.form || !this.button) return;

    this.variantSelect = this.form.querySelector('[data-card-variant-select]');
    this.defaultText = this.button.textContent.trim();
    this.variantSelect?.addEventListener('change', () => this.syncVariantState());
    this.syncVariantState();
    this.form.addEventListener('submit', this.onSubmit.bind(this));
  }

  syncVariantState() {
    if (!this.variantSelect || !this.button) return;
    const option = this.variantSelect.selectedOptions[0];
    const available = option?.dataset.available !== 'false' && !option?.disabled;
    this.button.disabled = !available;
    this.button.textContent = available
      ? this.defaultText || window.theme?.strings?.addToCart || 'Add to cart'
      : window.theme?.strings?.soldOut || 'Sold out';
  }

  async onSubmit(event) {
    event.preventDefault();

    this.syncVariantState();
    if (this.button.disabled) return;

    const originalText = this.defaultText || this.button.textContent;
    this.button.setAttribute('aria-busy', 'true');
    this.button.disabled = true;
    this.animateToCart();

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: new FormData(this.form)
      });

      if (!response.ok) throw new Error(`Unable to add item to cart (${response.status})`);

      const item = await response.json();
      this.button.textContent = 'Added';
      this.button.classList.add('is-added');
      themeCart.flash(item.product_title);
      try {
        await themeCart.refresh(true);
      } catch (refreshError) {
        console.warn(refreshError.message);
        document.querySelectorAll('[data-cart-count]').forEach((count) => {
          const current = Number(count.textContent || 0);
          if (!Number.isNaN(current)) count.textContent = current + Number(new FormData(this.form).get('quantity') || 1);
        });
      }
    } catch (error) {
      this.button.textContent = originalText;
      this.dispatchEvent(new CustomEvent('theme:error', {
        bubbles: true,
        detail: { message: error.message }
      }));
      console.warn(error.message);
      themeCart.flash('Could not add item. Please try again.');
    } finally {
      window.setTimeout(() => {
        this.button.textContent = originalText;
        this.button.classList.remove('is-added');
        this.button.removeAttribute('aria-busy');
        this.syncVariantState();
      }, 700);
    }
  }

  animateToCart() {
    const scope = this.closest('.product-card, .home-premium-slider__side-card, .premium-search-product, .product-page');
    const image = scope?.querySelector('img');
    const cart = document.querySelector('[data-cart-trigger]');
    if (!image || !cart || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const from = image.getBoundingClientRect();
    const to = cart.getBoundingClientRect();
    const ghost = image.cloneNode();
    ghost.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;object-fit:cover;z-index:2147482000;pointer-events:none;border-radius:0;box-shadow:0 18px 40px rgba(0,0,0,.22);`;
    document.body.appendChild(ghost);
    const animation = ghost.animate([
      { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
      { transform: `translate3d(${to.left - from.left}px,${to.top - from.top}px,0) scale(.08)`, opacity: .12 }
    ], { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)' });
    animation.onfinish = () => ghost.remove();
  }
}

customElements.define('product-form', ProductForm);

class ThemeDrawer {
  constructor(drawer) {
    this.drawer = drawer;
    this.closeButtons = drawer.querySelectorAll('[data-drawer-close]');
    this.panel = drawer.querySelector('.drawer__panel');
    this.trigger = null;

    this.closeButtons.forEach((button) => {
      button.addEventListener('click', this.close.bind(this));
    });

    this.drawer.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.close();
    });
  }

  open(trigger) {
    this.trigger = trigger;
    this.drawer.hidden = false;
    document.body.classList.add('drawer-open');
    trigger?.setAttribute('aria-expanded', 'true');

    requestAnimationFrame(() => {
      this.drawer.classList.add('is-open');
      this.panel?.focus();
    });
  }

  close() {
    this.drawer.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    this.trigger?.setAttribute('aria-expanded', 'false');
    this.trigger?.focus();

    window.setTimeout(() => {
      this.drawer.hidden = true;
    }, 650);
  }
}

const drawers = new Map();

document.querySelectorAll('[data-drawer]').forEach((drawer) => {
  drawers.set(drawer.id, new ThemeDrawer(drawer));
});

document.querySelectorAll('[data-drawer-open]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const drawer = drawers.get(trigger.getAttribute('data-drawer-open'));
    drawer?.open(trigger);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  themeQuickView.init();
});
