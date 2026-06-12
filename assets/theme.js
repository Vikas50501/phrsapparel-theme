/* ============================================================
   UNSAID — Shopify Theme JS
   Modular, dependency-free, vanilla JS
   ============================================================ */

(function () {
  'use strict';

  // ── 1. Mobile menu toggle ────────────────────────────────────
  function initMobileMenu() {
    const toggle = document.querySelector('.site-nav__menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  // ── 2. Active nav link ───────────────────────────────────────
  function initActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('[data-nav]').forEach(link => {
      const target = link.getAttribute('data-nav');
      if (
        (target === 'home' && (path === '/' || path.endsWith('/') && path.split('/').length <= 2)) ||
        (target !== 'home' && path.includes('/' + target))
      ) {
        link.classList.add('active');
      }
    });
  }

  // ── 3. FAQ accordion ─────────────────────────────────────────
  function initFAQ() {
    document.querySelectorAll('.faq-item__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
      });
    });
  }

  // ── 4. Qty stepper(s) ────────────────────────────────────────
  function initQtyStepper(root) {
    const scope = root || document;
    scope.querySelectorAll('.qty-stepper').forEach(stepper => {
      const qtyEl = stepper.querySelector('.qty');
      const dec = stepper.querySelector('.dec');
      const inc = stepper.querySelector('.inc');
      if (!qtyEl || !dec || !inc) return;
      dec.addEventListener('click', () => {
        const v = parseInt(qtyEl.textContent, 10);
        qtyEl.textContent = Math.max(1, v - 1);
      });
      inc.addEventListener('click', () => {
        const v = parseInt(qtyEl.textContent, 10);
        qtyEl.textContent = v + 1;
      });
    });
  }

  // ── 5. Product gallery thumb swap ────────────────────────────
  function initProductGallery() {
    const gallery = document.querySelector('.product-gallery');
    if (!gallery) return;
    const mainImg = gallery.querySelector('.product-gallery__main img');
    const thumbs = gallery.querySelectorAll('.product-gallery__thumb');
    if (!mainImg) return;
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const src = thumb.getAttribute('data-full');
        const isContain = thumb.hasAttribute('data-contain');
        if (!src) return;
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = src;
          mainImg.classList.toggle('is-contain', isContain);
          mainImg.style.opacity = '1';
        }, 150);
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  // ── 6. Product tab panels ────────────────────────────────────
  function initProductTabs() {
    const tabBtns = document.querySelectorAll('.product-tab-btn');
    if (!tabBtns.length) return;
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        document.querySelectorAll('.product-tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.product-tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const panel = document.querySelector(`.product-tab-panel[data-panel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ── 7. Reels carousel + IntersectionObserver autoplay ────────
  function initReelsCarousel() {
    const reelsTrack = document.querySelector('.reels-track');
    if (!reelsTrack) return;
    const prev = document.querySelector('.reels-nav--prev');
    const next = document.querySelector('.reels-nav--next');

    function scrollAmount() {
      const card = reelsTrack.querySelector('.reel-card');
      if (!card) return 280;
      return card.getBoundingClientRect().width + 16;
    }

    if (prev) prev.addEventListener('click', () => reelsTrack.scrollBy({ left: -scrollAmount() * 2, behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => reelsTrack.scrollBy({ left: scrollAmount() * 2, behavior: 'smooth' }));

    if ('IntersectionObserver' in window) {
      const videos = reelsTrack.querySelectorAll('video');
      if (videos.length) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.intersectionRatio > 0.5) {
              entry.target.play().catch(() => {});
            } else {
              entry.target.pause();
            }
          });
        }, { root: reelsTrack, threshold: [0, 0.5, 1] });
        videos.forEach(v => io.observe(v));
      }
    }
  }

  // ── 8. Hero video sound toggle ───────────────────────────────
  function initHeroVideoSound() {
    const soundBtn = document.querySelector('.hero-video__sound');
    const heroVideo = document.querySelector('.hero-video__media video');
    if (!soundBtn || !heroVideo) return;
    soundBtn.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      soundBtn.innerHTML = heroVideo.muted
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    });
  }

  // ── 9. Recently viewed (sessionStorage + Shopify product JSON) ─
  function initRecentlyViewed() {
    const STORAGE_KEY = 'unsaid_recently_viewed';
    const MAX_RECENT = 4;

    function getList() {
      try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
    }
    function saveList(list) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
    }

    const section = document.querySelector('[data-recently-viewed]');
    const currentHandle = section ? section.getAttribute('data-current-handle') : null;

    // Track current product
    if (currentHandle) {
      const list = getList().filter(h => h !== currentHandle);
      list.unshift(currentHandle);
      saveList(list.slice(0, MAX_RECENT + 1));
    }

    if (!section) return;

    const grid = section.querySelector('[data-recently-viewed-grid]');
    if (!grid) return;

    const handles = getList().filter(h => h !== currentHandle).slice(0, MAX_RECENT);
    if (!handles.length) return;

    Promise.all(handles.map(handle =>
      fetch('/products/' + handle + '.js')
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    )).then(products => {
      const valid = products.filter(Boolean);
      if (!valid.length) return;
      grid.innerHTML = valid.map(p => `
        <a href="/products/${p.handle}" class="product-card">
          <div class="product-card__image">
            <img src="${p.featured_image}" alt="${p.title}" loading="lazy">
          </div>
          <div class="product-card__info">
            <h3>${p.title}</h3>
            <p class="text-eyebrow" style="margin-top:1rem;">${formatMoney(p.price)}</p>
          </div>
        </a>
      `).join('');
      section.removeAttribute('hidden');
    });
  }

  function formatMoney(cents) {
    return '₹' + (cents / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ── 10. Footer year ──────────────────────────────────────────
  function initFooterYear() {
    const el = document.querySelector('[data-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ── 11. AJAX Add to Cart ─────────────────────────────────────
  function initAjaxCart() {
    document.addEventListener('submit', function (e) {
      const form = e.target.closest('form[action="/cart/add"]');
      if (!form) return;
      e.preventDefault();

      const btn = form.querySelector('[type="submit"]');
      const origText = btn ? btn.innerHTML : '';
      if (btn) { btn.innerHTML = 'Adding…'; btn.disabled = true; }

      const data = new FormData(form);

      // Read qty from stepper if present
      const qtyEl = form.querySelector('.qty');
      if (qtyEl) data.set('quantity', qtyEl.textContent.trim());

      fetch('/cart/add.js', { method: 'POST', body: data })
        .then(r => r.json())
        .then(() => {
          if (btn) { btn.innerHTML = origText; btn.disabled = false; }
          updateCartCount();
          if (window.unsaidCartType === 'drawer') {
            openCartDrawer();
          }
        })
        .catch(() => {
          if (btn) { btn.innerHTML = origText; btn.disabled = false; }
        });
    });
  }

  // ── 12. AJAX Cart drawer ─────────────────────────────────────
  function updateCartCount() {
    fetch('/cart.js')
      .then(r => r.json())
      .then(cart => {
        const countEl = document.querySelector('.cart-count');
        if (countEl) {
          countEl.textContent = cart.item_count;
          countEl.hidden = cart.item_count === 0;
        }
        document.querySelectorAll('[data-cart-count]').forEach(el => {
          el.textContent = cart.item_count;
        });
      });
  }

  function openCartDrawer() {
    const drawer = document.querySelector('.cart-drawer');
    const overlay = document.querySelector('.cart-drawer-overlay');
    if (!drawer) return;
    renderCartDrawer();
    drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    drawer.querySelector('.cart-drawer__close')?.focus();
  }

  function closeCartDrawer() {
    const drawer = document.querySelector('.cart-drawer');
    const overlay = document.querySelector('.cart-drawer-overlay');
    if (!drawer) return;
    drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderCartDrawer() {
    fetch('/cart.js')
      .then(r => r.json())
      .then(cart => {
        const body = document.querySelector('.cart-drawer__body');
        const subtotalEl = document.querySelector('.cart-drawer__subtotal strong');
        if (!body) return;

        if (cart.item_count === 0) {
          body.innerHTML = `
            <div class="cart-drawer__empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <p>Your cart is empty.</p>
              <a href="/collections/all" onclick="closeCartDrawer()">Shop the album</a>
            </div>`;
          if (subtotalEl) subtotalEl.textContent = formatMoney(0);
          return;
        }

        body.innerHTML = cart.items.map(item => `
          <div class="drawer-line-item" data-line-key="${item.key}">
            <div class="drawer-line-item__image">
              <img src="${item.image}" alt="${item.product_title}" loading="lazy">
            </div>
            <div class="drawer-line-item__info">
              <p class="drawer-line-item__name">${item.product_title}</p>
              <p class="drawer-line-item__price">${formatMoney(item.final_line_price)}</p>
              <div class="drawer-line-item__qty">
                <button data-action="decrease" data-key="${item.key}" data-qty="${item.quantity}" aria-label="Decrease">−</button>
                <span>${item.quantity}</span>
                <button data-action="increase" data-key="${item.key}" data-qty="${item.quantity}" aria-label="Increase">+</button>
                <button data-action="remove" data-key="${item.key}" style="margin-left:auto;font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;" aria-label="Remove">Remove</button>
              </div>
            </div>
          </div>`).join('');

        if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
      });
  }

  function initCartDrawerEvents() {
    // Open drawer from cart icon (.site-nav__cart or .unav-cart)
    document.addEventListener('click', function (e) {
      if (e.target.closest('.site-nav__cart, .unav-cart')) {
        e.preventDefault();
        openCartDrawer();
      }
    });

    // Close drawer
    document.addEventListener('click', function (e) {
      if (e.target.closest('.cart-drawer__close') || e.target.closest('.cart-drawer-overlay')) {
        closeCartDrawer();
      }
    });

    // Esc key
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCartDrawer(); });

    // Qty update / remove within drawer
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-action]');
      if (!btn || !btn.closest('.cart-drawer')) return;
      const action = btn.getAttribute('data-action');
      const key = btn.getAttribute('data-key');
      const qty = parseInt(btn.getAttribute('data-qty') || '1', 10);

      let newQty;
      if (action === 'increase') newQty = qty + 1;
      else if (action === 'decrease') newQty = Math.max(0, qty - 1);
      else if (action === 'remove') newQty = 0;
      else return;

      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: newQty })
      })
        .then(r => r.json())
        .then(() => { renderCartDrawer(); updateCartCount(); });
    });
  }

  // ── 13. Predictive search ────────────────────────────────────
  function initPredictiveSearch() {
    const form = document.querySelector('.search-form');
    const input = form ? form.querySelector('input[name="q"]') : null;
    if (!input) return;

    let dropdown = document.querySelector('.predictive-search');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'predictive-search';
      dropdown.setAttribute('hidden', '');
      dropdown.setAttribute('role', 'listbox');
      const wrapper = input.closest('.search-input-wrapper');
      if (wrapper) { wrapper.style.position = 'relative'; wrapper.appendChild(dropdown); }
      else { input.parentNode.style.position = 'relative'; input.parentNode.appendChild(dropdown); }
    }

    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const q = input.value.trim();
      if (q.length < 2) { dropdown.hidden = true; return; }
      debounceTimer = setTimeout(() => {
        fetch('/search/suggest.json?q=' + encodeURIComponent(q) + '&resources[type]=product&resources[limit]=5')
          .then(r => r.json())
          .then(data => {
            const products = data?.resources?.results?.products || [];
            if (!products.length) { dropdown.hidden = true; return; }
            dropdown.innerHTML = products.map(p => `
              <a href="${p.url}" class="predictive-search__item" role="option">
                <div class="predictive-search__image"><img src="${p.featured_image?.url || ''}" alt="${p.title}" loading="lazy"></div>
                <div>
                  <p class="predictive-search__title">${p.title}</p>
                  <p class="predictive-search__price">${p.price}</p>
                </div>
              </a>`).join('');
            dropdown.hidden = false;
          });
      }, 250);
    });

    document.addEventListener('click', e => {
      if (!form.contains(e.target)) dropdown.hidden = true;
    });
  }

  // ── Nav transparency on video-hero homepage ──────────────────
  function initVideoNavScroll() {
    const nav = document.querySelector('.site-nav, .unav-header');
    if (!nav || !document.querySelector('.hero-video')) return;
    const threshold = 80;
    function update() {
      nav.classList.toggle('scrolled', window.scrollY > threshold);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ── Init ─────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initActiveNav();
    initVideoNavScroll();
    initFAQ();
    initQtyStepper();
    initProductGallery();
    initProductTabs();
    initReelsCarousel();
    initHeroVideoSound();
    initRecentlyViewed();
    initFooterYear();
    initAjaxCart();
    initCartDrawerEvents();
    initPredictiveSearch();
    updateCartCount();
  });

  // Expose close helper globally for inline links
  window.closeCartDrawer = closeCartDrawer;
  window.openCartDrawer = openCartDrawer;

})();
