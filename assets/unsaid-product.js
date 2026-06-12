/* ============================================================
   UNSAID — Product Detail JS
   Drop into: assets/unsaid-product.js
   ============================================================ */

(function () {
  'use strict';

  /* ── QTY STEPPER ─────────────────────────────────────── */
  const qtyDisplay = document.getElementById('QtyDisplay');
  const qtyInput   = document.getElementById('QtyInput');
  const decBtn     = document.querySelector('.qty-stepper .dec');
  const incBtn     = document.querySelector('.qty-stepper .inc');

  if (qtyDisplay && decBtn && incBtn) {
    const update = (val) => {
      qtyDisplay.textContent = val;
      if (qtyInput) qtyInput.value = val;
    };

    decBtn.addEventListener('click', () => {
      update(Math.max(1, parseInt(qtyDisplay.textContent, 10) - 1));
    });

    incBtn.addEventListener('click', () => {
      update(parseInt(qtyDisplay.textContent, 10) + 1);
    });
  }

  /* ── PRODUCT TABS ────────────────────────────────────── */
  const tabBtns = document.querySelectorAll('.product-tab-btn');

  if (tabBtns.length) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');

        document.querySelectorAll('.product-tab-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });

        document.querySelectorAll('.product-tab-panel').forEach(p => {
          p.classList.remove('active');
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const panel = document.querySelector(`.product-tab-panel[data-panel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ── GALLERY THUMB SWAP ──────────────────────────────── */
  const gallery = document.querySelector('.product-gallery');

  if (gallery) {
    const mainImg = gallery.querySelector('.product-gallery__main img');
    const thumbs  = gallery.querySelectorAll('.product-gallery__thumb');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const src       = thumb.getAttribute('data-full');
        const isContain = thumb.hasAttribute('data-contain');
        if (!src || !mainImg) return;

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

  /* ── NOTES STRIP SCROLL DOTS ─────────────────────────── */
  const notesTrack = document.querySelector('.notes-strip__track');
  const noteDots   = document.getElementById('NotesDots');

  if (notesTrack && noteDots) {
    const cards = notesTrack.querySelectorAll('.note-card');
    const total = cards.length;

    if (total > 0) {
      // build dots
      const dots = Array.from({ length: Math.min(total, 8) }, (_, i) => {
        const d = document.createElement('span');
        if (i === 0) d.classList.add('active');
        noteDots.appendChild(d);
        return d;
      });

      notesTrack.addEventListener('scroll', () => {
        const trackW = notesTrack.scrollWidth - notesTrack.clientWidth;
        const pct    = trackW > 0 ? notesTrack.scrollLeft / trackW : 0;
        const active = Math.round(pct * (dots.length - 1));
        dots.forEach((d, i) => d.classList.toggle('active', i === active));
      }, { passive: true });
    }
  }

  /* ── VARIANT SELECTOR (basic) ────────────────────────── */
  // Shopify theme default variant JS handles this via
  // the theme's variant_selects or variant_radios section.
  // If you have a custom section, hook into:
  //   document.addEventListener('variant:change', fn)

})();
