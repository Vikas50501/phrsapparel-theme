/* ===== PHARELIGIONS COLLECTION PAGE JS ===== */
(function () {
  'use strict';

  /* ---- Collapsible filter groups ---- */
  window.kcolToggle = function (head) {
    var group = head.closest('.kc-group');
    if (!group) return;
    var open = group.getAttribute('data-open') !== 'false';
    group.setAttribute('data-open', open ? 'false' : 'true');
    var icon = head.querySelector('.kc-group__icon');
    if (icon) icon.textContent = open ? '+' : '–';
  };

  /* ---- Mobile: collapse the filter sidebar behind the "Filter" bar ---- */
  (function () {
    var sidebar = document.querySelector('.template-collection .kc-sidebar');
    if (!sidebar) return;
    var header = sidebar.querySelector('.kc-filter-header');
    var mq = window.matchMedia('(max-width: 989px)');
    var userToggled = false;

    function apply() {
      if (mq.matches) {
        sidebar.classList.add('kc-collapsible');
        /* Default open only when filters are already active, so users see them */
        if (!userToggled) {
          var hasActive = !!sidebar.querySelector('.kc-active-tags');
          sidebar.classList.toggle('is-open', hasActive);
        }
      } else {
        sidebar.classList.remove('kc-collapsible', 'is-open');
      }
    }

    if (header) {
      header.addEventListener('click', function (e) {
        if (!mq.matches) return;
        /* Let the "Remove all" link work without toggling */
        if (e.target.closest('.kc-remove-all')) return;
        userToggled = true;
        sidebar.classList.toggle('is-open');
      });
    }

    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq.addListener) mq.addListener(apply);
  })();

  /* ---- Sort: update sort_by param, keep all other filters ---- */
  window.kcolSort = function (value) {
    var u = new URL(window.location.href);
    u.searchParams.set('sort_by', value);
    u.searchParams.delete('page');
    window.location.href = u.toString();
  };

  /* ---- View toggle (2 / 3 / 4 columns) ---- */
  (function () {
    var grid = document.getElementById('kc-grid');
    var btns = document.querySelectorAll('.kc-views button');
    if (!grid || !btns.length) return;

    var stored = null;
    try { stored = localStorage.getItem('kcol_cols'); } catch (e) {}
    if (stored) {
      grid.setAttribute('data-cols', stored);
      btns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-cols') === stored); });
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var cols = this.getAttribute('data-cols');
        grid.setAttribute('data-cols', cols);
        btns.forEach(function (x) { x.classList.remove('is-active'); });
        this.classList.add('is-active');
        try { localStorage.setItem('kcol_cols', cols); } catch (e) {}
      });
    });
  })();

  /* ---- Dual-handle price range slider ---- */
  (function () {
    var range = document.getElementById('kc-range');
    if (!range) return;
    var minR = range.querySelector('.kc-range__min');
    var maxR = range.querySelector('.kc-range__max');
    var fill = range.querySelector('.kc-range__fill');
    var minInput = document.getElementById('kc-price-min');
    var maxInput = document.getElementById('kc-price-max');
    if (!minR || !maxR) return;

    var floor = parseFloat(minR.min);
    var ceil = parseFloat(maxR.max);

    function clampOrder() {
      var lo = parseFloat(minR.value);
      var hi = parseFloat(maxR.value);
      if (lo > hi - 1) { minR.value = hi - 1; lo = parseFloat(minR.value); }
      if (hi < lo + 1) { maxR.value = lo + 1; hi = parseFloat(maxR.value); }
    }

    function paint() {
      var lo = parseFloat(minR.value);
      var hi = parseFloat(maxR.value);
      var span = ceil - floor || 1;
      var l = ((lo - floor) / span) * 100;
      var r = ((hi - floor) / span) * 100;
      if (fill) { fill.style.left = l + '%'; fill.style.width = (r - l) + '%'; }
      if (minInput) minInput.value = Math.round(lo);
      if (maxInput) maxInput.value = Math.round(hi);
    }

    function onSlide() { clampOrder(); paint(); }
    minR.addEventListener('input', onSlide);
    maxR.addEventListener('input', onSlide);

    /* number fields write back to sliders */
    if (minInput) minInput.addEventListener('change', function () {
      var v = parseFloat(this.value);
      if (isNaN(v)) v = floor;
      minR.value = Math.max(floor, Math.min(v, parseFloat(maxR.value) - 1));
      paint();
    });
    if (maxInput) maxInput.addEventListener('change', function () {
      var v = parseFloat(this.value);
      if (isNaN(v)) v = ceil;
      maxR.value = Math.min(ceil, Math.max(v, parseFloat(minR.value) + 1));
      paint();
    });

    paint();
  })();

  /* ---- Card interactions: swatch image swap, wishlist, quick add-to-cart ---- */
  (function () {
    var grid = document.getElementById('kc-grid');
    if (!grid) return;

    function cardImg(el) {
      var card = el.closest('.kc-card');
      return card ? { card: card, img: card.querySelector('.kc-card__img') } : null;
    }

    grid.addEventListener('mouseover', function (e) {
      var sw = e.target.closest('.kc-card__swatch');
      if (!sw || !sw.dataset.img) return;
      var c = cardImg(sw);
      if (c && c.img) c.img.src = sw.dataset.img;
    });

    grid.addEventListener('mouseout', function (e) {
      var sw = e.target.closest('.kc-card__swatch');
      if (!sw) return;
      var c = cardImg(sw);
      if (c && c.img) c.img.src = c.card.dataset.current || c.img.getAttribute('data-default');
    });

    grid.addEventListener('click', function (e) {
      var sw = e.target.closest('.kc-card__swatch');
      if (sw) {
        var group = sw.parentElement;
        if (group) {
          group.querySelectorAll('.kc-card__swatch').forEach(function (s) { s.classList.remove('is-active'); });
        }
        sw.classList.add('is-active');
        if (sw.dataset.img) {
          var c = cardImg(sw);
          if (c && c.img) { c.img.src = sw.dataset.img; c.card.dataset.current = sw.dataset.img; }
        }
        return;
      }
      var atc = e.target.closest('.kc-card__atc');
      if (atc) { e.preventDefault(); kcAdd(atc); }
    });

    function kcAdd(btn) {
      var id = btn.getAttribute('data-variant');
      if (!id) return;
      btn.disabled = true;

      var drawer = document.querySelector('cart-drawer');
      var body = { items: [{ id: parseInt(id, 10), quantity: 1 }] };

      /* Ask Shopify to also render the cart-drawer + cart bubble sections */
      var sectionIds = [];
      if (drawer && typeof drawer.getSectionsToRender === 'function') {
        try {
          drawer.getSectionsToRender().forEach(function (s) { sectionIds.push(s.id); });
        } catch (e) {}
      }
      if (sectionIds.length) {
        body.sections = sectionIds.join(',');
        body.sections_url = window.location.pathname;
      }

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/javascript' },
        body: JSON.stringify(body)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.status) { return; } /* error response */
          btn.classList.add('is-active');
          setTimeout(function () { btn.classList.remove('is-active'); }, 1500);
          if (drawer && res.sections && typeof drawer.renderContents === 'function') {
            drawer.classList.remove('is-empty');
            drawer.renderContents(res);
          } else {
            window.location.href = window.routes && window.routes.cart_url ? window.routes.cart_url : '/cart';
          }
        })
        .catch(function () {})
        .finally(function () { btn.disabled = false; });
    }
  })();
})();
