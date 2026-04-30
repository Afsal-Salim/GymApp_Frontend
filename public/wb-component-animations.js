/**
 * Visual-builder helpers: scroll reveal (.fade-up.show), testimonial carousel
 * ([data-wb-tcarousel]), design-system gallery ([data-wb-ds-gallery]),
 * slide enquiry drawer ([data-wb-enquiry-slide]), custom native dialogs ([data-wb-dialog-root]).
 * Uses IntersectionObserver so .fade-up works when the parent scrolls (GrapesJS
 * canvas) — iframe window scroll events often never fire.
 */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var MO_KEY = '__wbCompAnimMo';
  var FADE_ENGINE_KEY = '__wbFadeUpEngine';
  var FADE_SAFETY_KEY = '__wbFadeSafety';
  var FADE_LEGACY_KEY = '__wbFadeUpScrollBound';
  var fadeIo = null;

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function markFadeShown(el) {
    el.classList.add('show');
  }

  function revealFadeUps() {
    var vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (vh < 1) return;
    var nodes = document.querySelectorAll('.fade-up');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var rect = el.getBoundingClientRect();
      if (rect.bottom > 20 && rect.top < vh - 12) markFadeShown(el);
    }
  }

  function scheduleFadeUpSafety() {
    if (document.documentElement.getAttribute(FADE_SAFETY_KEY)) return;
    document.documentElement.setAttribute(FADE_SAFETY_KEY, '1');
    window.setTimeout(function () {
      var left = document.querySelectorAll('.fade-up:not(.show)');
      for (var j = 0; j < left.length; j++) markFadeShown(left[j]);
    }, 2400);
  }

  function bindFadeUpScrollLegacy() {
    if (document.documentElement.getAttribute(FADE_LEGACY_KEY)) return;
    document.documentElement.setAttribute(FADE_LEGACY_KEY, '1');
    revealFadeUps();
    window.addEventListener('scroll', revealFadeUps, { passive: true });
    window.addEventListener('resize', revealFadeUps, { passive: true });
  }

  function wireFadeObservers() {
    if (typeof IntersectionObserver === 'undefined') {
      bindFadeUpScrollLegacy();
      revealFadeUps();
      return;
    }

    if (!document.documentElement.getAttribute(FADE_ENGINE_KEY)) {
      document.documentElement.setAttribute(FADE_ENGINE_KEY, '1');
      fadeIo = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) markFadeShown(entries[i].target);
          }
        },
        { root: null, rootMargin: '14% 0px 14% 0px', threshold: 0.01 }
      );
      window.addEventListener('resize', revealFadeUps, { passive: true });
      window.addEventListener('scroll', revealFadeUps, { passive: true, capture: true });
      document.addEventListener('scroll', revealFadeUps, { passive: true, capture: true });
      scheduleFadeUpSafety();
    }

    var nodes = document.querySelectorAll('.fade-up');
    for (var n = 0; n < nodes.length; n++) {
      var el = nodes[n];
      if (el.getAttribute('data-wb-fade-obs')) continue;
      el.setAttribute('data-wb-fade-obs', '1');
      try {
        fadeIo.observe(el);
      } catch (e) {
        /* ignore */
      }
    }

    revealFadeUps();
    requestAnimationFrame(function () {
      requestAnimationFrame(revealFadeUps);
    });
  }

  function initTestimonialCarousels() {
    var roots = document.querySelectorAll('[data-wb-tcarousel]');
    for (var r = 0; r < roots.length; r++) {
      var root = roots[r];
      if (root.getAttribute('data-wb-tcarousel-init')) continue;
      root.setAttribute('data-wb-tcarousel-init', '1');
      var raw = root.getAttribute('data-wb-tcarousel') || '';
      var quotes = raw
        .split('|')
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      if (quotes.length < 2) continue;
      var el = root.querySelector('.wb-tcarousel__text');
      if (!el) continue;
      el.style.transition = 'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
      var i = 0;
      window.setInterval(function () {
        i = (i + 1) % quotes.length;
        el.style.opacity = '0';
        window.setTimeout(function () {
          el.textContent = quotes[i];
          el.style.opacity = '1';
        }, 280);
      }, 3000);
    }
  }

  function teardownDsGallery(root) {
    if (!root) return;
    try {
      var ac = root._wbGalleryAC;
      if (ac && typeof ac.abort === 'function') ac.abort();
    } catch (e0) {
      /* ignore */
    }
    root._wbGalleryAC = null;
    try {
      var tid = root._wbGalleryApT;
      if (tid) window.clearInterval(tid);
    } catch (e1) {
      /* ignore */
    }
    root._wbGalleryApT = 0;
    root.removeAttribute('data-wb-ds-gallery-init');
  }

  function bindOneDsGallery(root) {
    teardownDsGallery(root);

    var vp = root.querySelector('.wb-sys-carousel__viewport');
    var track = root.querySelector('.wb-sys-carousel__track');
    if (!vp || !track) return;

    var slidesLive = function () {
      return track.querySelectorAll('.wb-sys-carousel__slide');
    };
    var dotsLive = function () {
      return root.querySelectorAll('.wb-sys-carousel__dot[data-wb-ds-dot]');
    };
    var prev = root.querySelector('.wb-sys-carousel__btn--prev');
    var next = root.querySelector('.wb-sys-carousel__btn--next');
    var slides0 = slidesLive();
    if (slides0.length < 1) return;

    var ac = new AbortController();
    root._wbGalleryAC = ac;
    var signal = ac.signal;

    /**
     * Scroll offset for slide i: distance from track's left edge to slide's left edge.
     */
    function slideScrollTarget(i) {
      var slides = slidesLive();
      var s = slides[i];
      if (!s || !track) return 0;
      if (s.offsetParent === track) return s.offsetLeft;
      return s.offsetLeft - track.offsetLeft;
    }

    function activeIndex() {
      var slides = slidesLive();
      var x = vp.scrollLeft;
      var best = 0;
      var bestD = Infinity;
      for (var i = 0; i < slides.length; i++) {
        var t = slideScrollTarget(i);
        var d = Math.abs(t - x);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    }

    function setDots(i) {
      var dots = dotsLive();
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle('wb-sys-carousel__dot--active', j === i);
        dots[j].setAttribute('aria-current', j === i ? 'true' : 'false');
      }
    }

    function goTo(i) {
      var slides = slidesLive();
      if (slides.length < 1) return;
      if (i < 0) i = slides.length - 1;
      if (i >= slides.length) i = 0;
      var s = slides[i];
      if (!s) return;
      var left = slideScrollTarget(i);
      var maxLeft = Math.max(0, track.scrollWidth - vp.clientWidth);
      if (left < 0) left = 0;
      if (left > maxLeft) left = maxLeft;
      try {
        vp.scrollTo({ left: left, behavior: 'smooth' });
      } catch (e1) {
        try {
          vp.scrollLeft = left;
        } catch (e2) {
          try {
            s.scrollIntoView({ block: 'nearest', inline: 'start', behavior: 'smooth' });
          } catch (e3) {
            try {
              s.scrollIntoView(true);
            } catch (e4) {
              vp.scrollLeft = left;
            }
          }
        }
      }
      setDots(i);
    }

    function step(dir) {
      goTo(activeIndex() + dir);
    }

    var apMs = parseInt(String(root.getAttribute('data-wb-ds-gallery-autoplay') || '0'), 10);

    function clearAutoplay() {
      var t = root._wbGalleryApT;
      if (t) window.clearInterval(t);
      root._wbGalleryApT = 0;
    }

    function startAutoplay() {
      clearAutoplay();
      if (!(apMs >= 1200)) return;
      root._wbGalleryApT = window.setInterval(function () {
        var slides = slidesLive();
        if (slides.length < 2) return;
        var last = slides.length - 1;
        if (activeIndex() >= last) goTo(0);
        else step(1);
      }, apMs);
    }

    function resetAutoplay() {
      clearAutoplay();
      startAutoplay();
    }

    function pauseAutoplay() {
      clearAutoplay();
    }

    /* Capture + stopPropagation: GrapesJS can steal nav clicks in the canvas iframe. */
    function wireNav(btn, dir) {
      if (!btn) return;
      try {
        if (!btn.getAttribute('type')) btn.setAttribute('type', 'button');
      } catch (e0) {
        /* ignore */
      }
      var run = function (ev) {
        if (ev) {
          if (typeof ev.preventDefault === 'function') ev.preventDefault();
          if (typeof ev.stopPropagation === 'function') ev.stopPropagation();
        }
        step(dir);
        resetAutoplay();
      };
      btn.addEventListener('pointerdown', run, { capture: true, signal: signal });
      btn.addEventListener('click', run, { capture: true, signal: signal });
    }
    wireNav(prev, -1);
    wireNav(next, 1);

    var dots = dotsLive();
    for (var d = 0; d < dots.length; d++) {
      (function (dot, idx) {
        try {
          if (!dot.getAttribute('type')) dot.setAttribute('type', 'button');
        } catch (e0) {
          /* ignore */
        }
        var runDot = function (ev) {
          if (ev) {
            if (typeof ev.preventDefault === 'function') ev.preventDefault();
            if (typeof ev.stopPropagation === 'function') ev.stopPropagation();
          }
          goTo(idx);
          resetAutoplay();
        };
        dot.addEventListener('pointerdown', runDot, { capture: true, signal: signal });
        dot.addEventListener('click', runDot, { capture: true, signal: signal });
      })(dots[d], d);
    }

    var scrollTick = false;
    vp.addEventListener(
      'scroll',
      function () {
        if (scrollTick) return;
        scrollTick = true;
        window.requestAnimationFrame(function () {
          scrollTick = false;
          setDots(activeIndex());
        });
      },
      { passive: true, signal: signal }
    );

    startAutoplay();
    root.addEventListener('mouseenter', pauseAutoplay, { signal: signal });
    root.addEventListener('mouseleave', startAutoplay, { signal: signal });
    root.addEventListener('touchstart', pauseAutoplay, { passive: true, signal: signal });
    root.addEventListener('touchend', resetAutoplay, { passive: true, signal: signal });

    root.setAttribute('data-wb-ds-gallery-init', '1');
    setDots(0);
  }

  function ensureGalleryDotsMatchSlideCount(root) {
    var track = root.querySelector('.wb-sys-carousel__track');
    var dotsHost = root.querySelector('.wb-sys-carousel__dots');
    if (!track || !dotsHost) return;
    var slides = track.querySelectorAll('.wb-sys-carousel__slide');
    var n = slides.length;
    if (n < 1) return;
    var dots = dotsHost.querySelectorAll('.wb-sys-carousel__dot[data-wb-ds-dot]');
    if (dots.length === n) return;
    var doc = root.ownerDocument;
    if (!doc) return;
    while (dotsHost.firstChild) dotsHost.removeChild(dotsHost.firstChild);
    for (var i = 0; i < n; i++) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'wb-sys-carousel__dot' + (i === 0 ? ' wb-sys-carousel__dot--active' : '');
      b.setAttribute('data-wb-ds-dot', String(i));
      b.setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + n);
      b.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      dotsHost.appendChild(b);
    }
  }

  function initDesignSystemGalleries() {
    var roots = document.querySelectorAll('[data-wb-ds-gallery]');
    for (var r = 0; r < roots.length; r++) {
      var root = roots[r];
      var vp = root.querySelector('.wb-sys-carousel__viewport');
      var track = root.querySelector('.wb-sys-carousel__track');
      if (!vp || !track) continue;

      ensureGalleryDotsMatchSlideCount(root);

      var slides = track.querySelectorAll('.wb-sys-carousel__slide');
      var dots = root.querySelectorAll('.wb-sys-carousel__dot[data-wb-ds-dot]');
      if (slides.length < 1) continue;

      var prevN = root.getAttribute('data-wb-ds-bound-slides');
      var prevDn = root.getAttribute('data-wb-ds-bound-dots');
      var needRebind =
        !root.getAttribute('data-wb-ds-gallery-init') ||
        String(slides.length) !== prevN ||
        String(dots.length) !== prevDn;

      if (!needRebind) continue;

      bindOneDsGallery(root);
      root.setAttribute('data-wb-ds-bound-slides', String(slides.length));
      root.setAttribute('data-wb-ds-bound-dots', String(dots.length));
    }
  }

  /** After editor adds/removes slides, call from iframe to re-wire prev/next/dots. */
  window.__wbRefreshDsGalleries = function () {
    initDesignSystemGalleries();
  };

  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function smoothScrollDocumentTop(win) {
    var w = win || window;
    var doc = w.document;
    var behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    try {
      w.scrollTo({ top: 0, left: 0, behavior: behavior });
    } catch (e0) {
      /* ignore */
    }
    try {
      doc.documentElement.scrollTo({ top: 0, left: 0, behavior: behavior });
    } catch (e1) {
      /* ignore */
    }
    try {
      doc.body.scrollTo({ top: 0, left: 0, behavior: behavior });
    } catch (e2) {
      try {
        doc.documentElement.scrollTop = 0;
        doc.body.scrollTop = 0;
      } catch (e3) {
        /* ignore */
      }
    }
  }

  function initScrollTopButtons() {
    var roots = document.querySelectorAll('[data-wb-scroll-top]');
    for (var r = 0; r < roots.length; r++) {
      var root = roots[r];
      if (root.getAttribute('data-wb-scroll-top-init')) continue;
      root.setAttribute('data-wb-scroll-top-init', '1');
      root.addEventListener('click', function (ev) {
        if (ev) {
          if (typeof ev.preventDefault === 'function') ev.preventDefault();
          if (typeof ev.stopPropagation === 'function') ev.stopPropagation();
        }
        smoothScrollDocumentTop(window);
      });
    }
  }

  function initCustomNativeDialogs() {
    var roots = document.querySelectorAll('[data-wb-dialog-root]');
    for (var i = 0; i < roots.length; i++) {
      var root = roots[i];
      if (root.getAttribute('data-wb-dlg-init')) continue;
      root.setAttribute('data-wb-dlg-init', '1');
      var dlg = root.querySelector('dialog[data-wb-dialog-panel]');
      var opens = root.querySelectorAll('[data-wb-dialog-open]');
      function openFromBtn(ev) {
        var r = ev.currentTarget && ev.currentTarget.closest('[data-wb-dialog-root]');
        if (!r) return;
        var d = r.querySelector('dialog[data-wb-dialog-panel]');
        if (d && typeof d.showModal === 'function') {
          try {
            d.showModal();
          } catch (e) {
            /* ignore */
          }
        }
      }
      for (var j = 0; j < opens.length; j++) {
        opens[j].addEventListener('click', openFromBtn);
      }
      if (dlg) {
        (function (panel) {
          panel.addEventListener('click', function (ev) {
            if (ev.target === panel && typeof panel.close === 'function') panel.close();
          });
        })(dlg);
      }
    }
  }

  function initEnquirySlides() {
    var roots = document.querySelectorAll('[data-wb-enquiry-slide]');
    for (var r = 0; r < roots.length; r++) {
      var root = roots[r];
      if (root.getAttribute('data-wb-es-init')) continue;
      root.setAttribute('data-wb-es-init', '1');
      var btn = root.querySelector('.wb-enquiry-slide__toggle');
      var backdrop = root.querySelector('.wb-enquiry-slide__backdrop');
      var closers = root.querySelectorAll('[data-wb-enquiry-slide-close]');
      function close() {
        root.classList.remove('wb-enquiry-slide--open');
      }
      function toggle() {
        root.classList.toggle('wb-enquiry-slide--open');
      }
      if (btn) btn.addEventListener('click', toggle);
      if (backdrop) backdrop.addEventListener('click', close);
      for (var c = 0; c < closers.length; c++) {
        closers[c].addEventListener('click', close);
      }
    }
  }

  function refresh() {
    wireFadeObservers();
    initTestimonialCarousels();
    initDesignSystemGalleries();
    initCustomNativeDialogs();
    initEnquirySlides();
    initScrollTopButtons();
  }

  function mountMutationObserver() {
    if (document.documentElement.getAttribute(MO_KEY)) return;
    if (typeof MutationObserver === 'undefined') return;
    document.documentElement.setAttribute(MO_KEY, '1');
    var t = 0;
    var mo = new MutationObserver(function () {
      window.clearTimeout(t);
      t = window.setTimeout(function () {
        refresh();
      }, 80);
    });
    try {
      mo.observe(document.body, { childList: true, subtree: true });
    } catch (e) {
      /* ignore */
    }
  }

  onReady(function () {
    refresh();
    mountMutationObserver();
  });
})();
