(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealSelector = '.reveal, .reveal-right, .reveal-scale, .reveal-blur';
  var updateStickyBar = function () {};
  var updateHeroParallax = function () {};
  var updateAmbientParallax = function () {};

  var ageGate = document.getElementById('age-gate');
  var ageEnter = document.getElementById('age-enter');

  function initPage() {
    initReveal();
    initCounters();
    initHeroAnimations();
    initTilt();
    initAmbientParallax();
    initCompanionFilter();
    showVisibleSections();
  }

  function showVisibleSections() {
    document.querySelectorAll(revealSelector).forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }

  if (ageGate && ageEnter) {
    if (sessionStorage.getItem('valery-age-verified') === 'true') {
      ageGate.classList.add('hidden');
      ageGate.setAttribute('aria-hidden', 'true');
      initPage();
    } else {
      document.body.classList.add('age-gate-active');
      ageEnter.addEventListener('click', function () {
        sessionStorage.setItem('valery-age-verified', 'true');
        ageGate.classList.add('hidden');
        ageGate.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('age-gate-active');
        initPage();
      });
    }
  } else {
    initPage();
  }

  var header = document.getElementById('header');

  function onScroll() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }
  }

  // Sticky mobile bar — show after scrolling 400px
  var stickyBar = document.getElementById('sticky-bar');
  if (stickyBar) {
    updateStickyBar = function () {
      stickyBar.classList.toggle('visible', window.scrollY > 400);
      stickyBar.setAttribute('aria-hidden', window.scrollY <= 400 ? 'true' : 'false');
    };
    updateStickyBar();
  }

  var cursorGlow = document.getElementById('cursor-glow');

  if (cursorGlow && !prefersReducedMotion && window.innerWidth > 768) {
    document.addEventListener('mousemove', function (e) {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('.nav__link, .btn').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var sections = document.querySelectorAll('section[id]');

  function highlightNav() {
    if (!nav) return;
    var pos = window.scrollY + 160;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');
      var link = document.querySelector('.nav__link[href="#' + id + '"]');
      if (link && pos >= top && pos < top + height) {
        nav.querySelectorAll('.nav__link').forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      }
    });
  }

  var tickingScroll = false;

  function runScrollEffects() {
    onScroll();
    highlightNav();
    updateStickyBar();
    updateHeroParallax();
    updateAmbientParallax();
    tickingScroll = false;
  }

  window.addEventListener('scroll', function () {
    if (tickingScroll) return;
    tickingScroll = true;
    window.requestAnimationFrame(runScrollEffects);
  }, { passive: true });

  runScrollEffects();

  function initReveal() {
    var reveals = document.querySelectorAll(revealSelector);

    if (prefersReducedMotion) {
      reveals.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-delay') || '0', 10) * 120;
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('visible');
        observer.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { observer.observe(el); });

    document.querySelectorAll('.hero .reveal, .hero .reveal-right, .hero .reveal-blur').forEach(function (el) {
      var delay = parseInt(el.getAttribute('data-delay') || '0', 10) * 150;
      el.style.transitionDelay = (240 + delay) + 'ms';
      el.classList.add('visible');
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');

    if (prefersReducedMotion) {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute('data-count');
      });
      return;
    }

    var counted = new Set();

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || counted.has(entry.target)) return;
        counted.add(entry.target);
        animateCounter(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 2000;
    var start = performance.now();

    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function initHeroAnimations() {
    if (prefersReducedMotion) return;

    // Hero slideshow
    var slides = document.querySelectorAll('.hero__slide');
    if (slides.length > 1) {
      var current = 0;
      setInterval(function () {
        slides[current].style.opacity = '0';
        current = (current + 1) % slides.length;
        slides[current].style.opacity = '1';
      }, 4000);
    }

    var orbs = document.querySelectorAll('.hero .orb');
    updateHeroParallax = function () {
      var scroll = window.scrollY;
      orbs.forEach(function (orb, i) {
        var speed = 0.06 + i * 0.04;
        orb.style.transform = 'translateY(' + (scroll * speed) + 'px)';
      });
    };
    updateHeroParallax();
  }

  function initAmbientParallax() {
    if (prefersReducedMotion || window.innerWidth < 768) return;

    var ambientOrbs = document.querySelectorAll('.ambient-bg__orb');
    var glows = document.querySelectorAll('.section__glow');

    updateAmbientParallax = function () {
      var scroll = window.scrollY;
      ambientOrbs.forEach(function (orb, i) {
        orb.style.transform = 'translateY(' + (scroll * (0.02 + i * 0.015)) + 'px)';
      });
      glows.forEach(function (glow, i) {
        glow.style.transform = 'translateY(' + (scroll * (0.03 + i * 0.01)) + 'px)';
      });
    };
    updateAmbientParallax();

    document.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 30;
      var y = (e.clientY / window.innerHeight - 0.5) * 30;
      ambientOrbs.forEach(function (orb, i) {
        var factor = 0.5 + i * 0.25;
        orb.style.marginLeft = (x * factor) + 'px';
        orb.style.marginTop = (y * factor) + 'px';
      });
    });
  }

  function initTilt() {
    if (prefersReducedMotion || window.innerWidth < 768) return;

    var tiltCards = document.querySelectorAll('.glass-card, .service-card, .contact-action');

    tiltCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  function initCompanionFilter() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.companion-card');
    if (!filterBtns.length) return;
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var filter = this.dataset.filter;
        filterBtns.forEach(function(b) { b.classList.remove('filter-btn--active'); });
        this.classList.add('filter-btn--active');
        cards.forEach(function(card) {
          if (filter === 'all' || card.dataset.nationality === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightbox-image');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');

  if (lightbox && lightboxImage && lightboxClose) {
    document.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var img = item.querySelector('.gallery-item__img');
        if (img && img.src) {
          lightboxImage.src = img.src;
          lightboxImage.alt = img.alt || '';
          lightboxImage.style.background = '';
        } else if (img) {
          lightboxImage.removeAttribute('src');
          lightboxImage.style.background = getComputedStyle(img).background;
        }
        if (lightboxCaption) {
          lightboxCaption.textContent = item.getAttribute('data-caption') || '';
        }
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lightboxImage.removeAttribute('src');
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });
  }

  if (!prefersReducedMotion && window.innerWidth > 768) {
    document.querySelectorAll('.btn--gradient').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.1) + 'px, ' + (y * 0.1) + 'px) translateY(-2px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

})();
