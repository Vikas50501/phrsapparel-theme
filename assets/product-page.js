/* ===== KUSHI PRODUCT PAGE JS ===== */
(function() {
  'use strict';

  var productDataEl = document.getElementById('kushi-product-json');
  if (!productDataEl) return;

  var productData = JSON.parse(productDataEl.textContent);
  var variants = productData.variants;
  var currentVariant = null;

  function findVariantFromOptions() {
    var selected = {};
    document.querySelectorAll('.kushi-swatch-element.active').forEach(function(el) {
      var fieldset = el.closest('.kushi-form-input');
      if (fieldset) {
        var label = fieldset.querySelector('.kushi-form-label');
        if (label) {
          var optName = label.getAttribute('data-option-name');
          selected[optName] = el.getAttribute('data-value');
        }
      }
    });
    document.querySelectorAll('.kushi-variant-pill.active').forEach(function(el) {
      var fieldset = el.closest('.kushi-form-input');
      if (fieldset) {
        var label = fieldset.querySelector('.kushi-form-label');
        if (label) {
          var optName = label.getAttribute('data-option-name');
          selected[optName] = el.getAttribute('data-value');
        }
      }
    });
    return variants.find(function(v) {
      var match = true;
      productData.options.forEach(function(opt, i) {
        if (selected[opt] && v['option' + (i + 1)] !== selected[opt]) {
          match = false;
        }
      });
      return match;
    }) || null;
  }

  function formatMoney(cents) {
    return (window.kushiCurrencySymbol || '$') + (cents / 100).toFixed(2);
  }

  function updatePriceDisplay(variant) {
    var saleEl = document.getElementById('kushi-price-sale');
    var regularEl = document.getElementById('kushi-price-regular');
    var badgeEl = document.getElementById('kushi-price-badge');

    if (!variant) return;

    if (saleEl) saleEl.textContent = formatMoney(variant.price);

    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      if (regularEl) {
        regularEl.textContent = formatMoney(variant.compare_at_price);
        regularEl.style.display = '';
      }
      if (badgeEl) {
        var pct = Math.round((1 - variant.price / variant.compare_at_price) * 100);
        badgeEl.textContent = '-' + pct + '%';
        badgeEl.style.display = '';
      }
    } else {
      if (regularEl) regularEl.style.display = 'none';
      if (badgeEl) badgeEl.style.display = 'none';
    }
  }

  function updateVariantId(variant) {
    var input = document.getElementById('kushi-variant-id');
    if (input && variant) input.value = variant.id;
  }

  function updateSKU(variant) {
    var skuEl = document.getElementById('kushi-sku-value');
    if (skuEl && variant) skuEl.textContent = variant.sku || '';
  }

  function updateStock(variant) {
    var stockEl = document.getElementById('kushi-stock-label');
    var barFill = document.getElementById('kushi-inventory-fill');
    var atcBtn = document.getElementById('kushi-btn-atc');
    if (!variant) return;

    if (!variant.available) {
      if (stockEl) stockEl.textContent = 'Out Of Stock';
      if (barFill) barFill.style.width = '0%';
      if (atcBtn) atcBtn.disabled = true;
      return;
    }

    if (atcBtn) atcBtn.disabled = false;
    var info = (window.kushiInventory && window.kushiInventory[variant.id]) || null;

    if (info && info.tracked && info.qty > 0) {
      if (stockEl) stockEl.textContent = 'Hurry! Only ' + info.qty + ' Items Left In Stock';
      var w = info.qty > 100 ? 100 : info.qty;
      if (barFill) barFill.style.width = w + '%';
    } else {
      if (stockEl) stockEl.textContent = 'In Stock';
      if (barFill) barFill.style.width = '100%';
    }
  }

  function updateURL(variant) {
    if (variant && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
    }
  }

  function onVariantChange() {
    currentVariant = findVariantFromOptions();
    if (!currentVariant) return;
    updatePriceDisplay(currentVariant);
    updateVariantId(currentVariant);
    updateSKU(currentVariant);
    updateStock(currentVariant);
    updateURL(currentVariant);

    syncGalleryToVariant(currentVariant);
  }

  /* Sync the main gallery + thumbnails to the variant's image and scroll to it */
  function syncGalleryToVariant(variant) {
    if (!variant || !variant.featured_image) return;
    var mainImg = document.getElementById('kushi-main-image');
    var imgId = variant.featured_image.id;
    var thumbs = document.querySelectorAll('.kushi-thumbnail-slider__item');
    var matched = null;
    thumbs.forEach(function(t) {
      if (parseInt(t.getAttribute('data-image-id'), 10) === imgId) matched = t;
    });

    if (matched) {
      var full = matched.getAttribute('data-full');
      if (mainImg && full) {
        mainImg.src = full;
        mainImg.alt = variant.featured_image.alt || productData.title;
      }
      thumbs.forEach(function(t) { t.classList.remove('active'); });
      matched.classList.add('active');
      matched.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    } else if (mainImg) {
      /* No matching thumbnail (variant image not in gallery) — swap main image directly */
      mainImg.src = variant.featured_image.src;
      mainImg.alt = variant.featured_image.alt || productData.title;
    }
  }

  /* Image gallery */
  window.kushiChangeImage = function(thumb, src) {
    var mainImg = document.getElementById('kushi-main-image');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.kushi-thumbnail-slider__item').forEach(function(t) {
      t.classList.remove('active');
    });
    thumb.classList.add('active');
  };

  /* Prev/next arrows on the main image */
  window.kushiSlide = function(dir) {
    var items = Array.prototype.slice.call(document.querySelectorAll('.kushi-thumbnail-slider__item'));
    if (!items.length) return;
    var idx = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].classList.contains('active')) { idx = i; break; }
    }
    idx = (idx + dir + items.length) % items.length;
    var next = items[idx];
    var src = next.getAttribute('data-full');
    if (src) kushiChangeImage(next, src);
    try { next.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); } catch (e) {}
  };

  /* Color swatches */
  window.kushiActivateSwatch = function(el) {
    el.closest('.kushi-swatch-group').querySelectorAll('.kushi-swatch-element').forEach(function(s) {
      s.classList.remove('active');
    });
    el.classList.add('active');
    var colorName = el.getAttribute('data-value');
    var label = el.closest('.kushi-form-input').querySelector('.kushi-form-label span');
    if (label) label.textContent = colorName;
    onVariantChange();
  };

  /* Size pills */
  window.kushiActivatePill = function(el) {
    if (el.classList.contains('disabled')) return;
    el.closest('.kushi-variant-pills').querySelectorAll('.kushi-variant-pill').forEach(function(p) {
      p.classList.remove('active');
    });
    el.classList.add('active');
    var label = el.closest('.kushi-form-input').querySelector('.kushi-form-label span');
    if (label) label.textContent = el.getAttribute('data-value');
    onVariantChange();
  };

  /* Size chart modal */
  window.kushiOpenSizeChart = function() {
    var m = document.getElementById('kushi-size-chart-modal');
    if (m) { m.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
  };
  window.kushiCloseSizeChart = function() {
    var m = document.getElementById('kushi-size-chart-modal');
    if (m) { m.classList.remove('is-open'); document.body.style.overflow = ''; }
  };
  (function() {
    var m = document.getElementById('kushi-size-chart-modal');
    if (!m) return;
    m.addEventListener('click', function(e) { if (e.target === m) window.kushiCloseSizeChart(); });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && m.classList.contains('is-open')) window.kushiCloseSizeChart();
    });
  })();

  /* Quantity */
  window.kushiChangeQty = function(delta) {
    var input = document.getElementById('kushi-qty-input');
    if (!input) return;
    var val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    input.value = val;
  };

  /* Tabs */
  window.kushiSwitchTab = function(tabId, btn) {
    document.querySelectorAll('.kushi-tabs__panel').forEach(function(p) {
      p.classList.remove('active');
    });
    document.querySelectorAll('.kushi-tabs__btn').forEach(function(b) {
      b.classList.remove('active');
    });
    var panel = document.getElementById('kushi-tab-' + tabId);
    if (panel) panel.classList.add('active');
    btn.classList.add('active');
  };

  /* AJAX Add to Cart */
  window.kushiAddToCart = function() {
    var variantInput = document.getElementById('kushi-variant-id');
    var qtyInput = document.getElementById('kushi-qty-input');
    var btn = document.getElementById('kushi-btn-atc');
    if (!variantInput || !btn || btn.disabled) return;

    var variantId = parseInt(variantInput.value, 10);
    if (!variantId) {
      btn.textContent = 'Select options';
      setTimeout(function () { btn.textContent = btn.dataset.kushiLabel || 'Add to Cart'; }, 2000);
      return;
    }

    var originalText = btn.textContent;
    btn.dataset.kushiLabel = originalText;
    btn.textContent = 'Adding...';
    btn.disabled = true;

    var drawer = document.querySelector('cart-drawer');
    var body = {
      id: variantId,
      quantity: parseInt(qtyInput ? qtyInput.value : 1, 10) || 1
    };

    /* Ask Shopify to also render the cart drawer + cart bubble so they update */
    var sectionIds = [];
    if (drawer && typeof drawer.getSectionsToRender === 'function') {
      try { drawer.getSectionsToRender().forEach(function (s) { sectionIds.push(s.id); }); } catch (e) {}
    }
    if (sectionIds.length) {
      body.sections = sectionIds.join(',');
      body.sections_url = window.location.pathname;
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/javascript'
      },
      body: JSON.stringify(body)
    })
    .then(function(res) { return res.json(); })
    .then(function(res) {
      if (res.status) { /* error response (e.g. sold out / 422) */
        btn.textContent = res.description ? 'Unavailable' : 'Error - Try Again';
        setTimeout(function() { btn.textContent = originalText; btn.disabled = false; }, 2000);
        return;
      }

      btn.textContent = 'Added!';
      setTimeout(function() { btn.textContent = originalText; btn.disabled = false; }, 2000);

      if (drawer && res.sections && typeof drawer.renderContents === 'function') {
        drawer.classList.remove('is-empty');
        drawer.renderContents(res); /* updates drawer + bubble and opens the drawer */
      } else {
        /* No drawer on the page → go to the cart so the user sees the item */
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: res }));
        window.location.href = (window.routes && window.routes.cart_url) ? window.routes.cart_url : '/cart';
      }
    })
    .catch(function() {
      btn.textContent = 'Error - Try Again';
      setTimeout(function() { btn.textContent = originalText; btn.disabled = false; }, 2000);
    });
  };

  /* Recently Viewed */
  (function() {
    var KEY = 'kushi_recently_viewed';
    var MAX = 8;
    var grid = document.getElementById('kushi-recently-viewed-grid');
    var section = document.getElementById('kushi-recently-viewed-section');
    if (!grid || !section) return;

    var list = [];
    try { list = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) {}

    var current = {
      handle: productData.handle,
      title: productData.title,
      url: productData.url,
      price: productData.price,
      compare_at_price: productData.compare_at_price,
      image: productData.featured_image
    };

    list = list.filter(function(p) { return p.handle !== current.handle; });
    list.unshift(current);
    list = list.slice(0, MAX);
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch(e) {}

    var others = list.filter(function(p) { return p.handle !== current.handle; });
    if (others.length < 1) return;

    others.slice(0, 4).forEach(function(p) {
      var card = document.createElement('div');
      card.className = 'kushi-product-card';
      var priceHtml = formatMoney(p.price);
      if (p.compare_at_price && p.compare_at_price > p.price) {
        priceHtml += ' <s>' + formatMoney(p.compare_at_price) + '</s>';
      }
      card.innerHTML =
        '<a href="' + p.url + '">' +
        '<div class="kushi-product-card__image">' +
        (p.image ? '<img src="' + p.image + '" alt="' + (p.title || '').replace(/"/g, '&quot;') + '" loading="lazy">' : '') +
        '</div>' +
        '<div class="kushi-product-card__info">' +
        '<div class="kushi-product-card__title">' + p.title + '</div>' +
        '<div class="kushi-product-card__price">' + priceHtml + '</div>' +
        '</div></a>';
      grid.appendChild(card);
    });

    section.style.display = '';
  })();

  onVariantChange();
})();
