/* Bark website — progressive enhancement only.
   Content is fully visible without JS; these add nav + reveal polish. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ── Mobile nav toggle ── */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close on outside click / escape
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ── Animated hero dashboard deck ── */
  var heroShowcase = document.querySelector('[data-hero-showcase]');
  if (heroShowcase) {
    var heroPages = Array.prototype.slice.call(heroShowcase.querySelectorAll('[data-hero-page]'));
    var heroControls = Array.prototype.slice.call(heroShowcase.querySelectorAll('[data-hero-control]'));
    var heroStatus = heroShowcase.querySelector('[data-hero-status]');

    var heroNames = heroPages.map(function (page) { return page.getAttribute('data-hero-page'); });
    var heroColors = {
      overview: '#3b82f6',
      members: '#22c55e',
      moderation: '#ef4444',
      stats: '#a78bfa',
      modules: '#f59e0b'
    };
    var heroLabels = {
      overview: 'Overview', members: 'Members', moderation: 'Moderation',
      stats: 'Statistics', modules: 'Modules'
    };
    var heroIndex = 0;
    var heroTimer = null;
    var heroDuration = 4600;
    var heroHovered = false;
    var heroFocused = false;
    var heroVisible = true;
    var heroReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


    function heroShouldRun() {
      return !heroReduced && heroVisible && !heroHovered && !heroFocused && !document.hidden;
    }

    function restartHeroBar() {
      var fill = heroShowcase.querySelector('.hero-page-dot.is-active .hero-page-bar > span');
      if (!fill || heroReduced) return;
      fill.style.animation = 'none';
      void fill.offsetWidth;
      fill.style.animation = '';
    }

    function scheduleHero() {
      clearTimeout(heroTimer);
      heroShowcase.classList.toggle('is-paused', !heroShouldRun());
      if (!heroShouldRun()) return;
      restartHeroBar();
      heroTimer = setTimeout(function () {
        showHeroPage((heroIndex + 1) % heroPages.length);
      }, heroDuration);
    }

    function showHeroPage(nextIndex) {
      if (nextIndex === heroIndex) { scheduleHero(); return; }
      var outgoing = heroPages[heroIndex];
      var incoming = heroPages[nextIndex];
      var name = heroNames[nextIndex];

      incoming.hidden = false;
      incoming.classList.remove('is-leaving');
      requestAnimationFrame(function () {
        outgoing.classList.remove('is-active');
        outgoing.classList.add('is-leaving');
        incoming.classList.add('is-active');
      });
      setTimeout(function () {
        outgoing.hidden = true;
        outgoing.classList.remove('is-leaving');
      }, 780);

      heroIndex = nextIndex;
      heroShowcase.style.setProperty('--hero-page-color', heroColors[name]);
      if (heroStatus) heroStatus.textContent = heroLabels[name];
      for (var i = 0; i < heroControls.length; i++) {
        var active = heroControls[i].getAttribute('data-hero-control') === name;
        heroControls[i].classList.toggle('is-active', active);
        heroControls[i].setAttribute('aria-pressed', active ? 'true' : 'false');
      }
      scheduleHero();
    }

    for (var hc = 0; hc < heroControls.length; hc++) {
      heroControls[hc].addEventListener('click', function () {
        showHeroPage(heroNames.indexOf(this.getAttribute('data-hero-control')));
      });
      heroControls[hc].addEventListener('focus', function () {
        heroFocused = true;
        scheduleHero();
      });
      heroControls[hc].addEventListener('blur', function () {
        setTimeout(function () {
          heroFocused = heroShowcase.contains(document.activeElement);
          scheduleHero();
        }, 0);
      });
    }
    heroShowcase.addEventListener('mouseenter', function () { heroHovered = true; scheduleHero(); });
    heroShowcase.addEventListener('mouseleave', function () { heroHovered = false; scheduleHero(); });
    heroShowcase.addEventListener('focusin', function () { heroFocused = true; scheduleHero(); });
    heroShowcase.addEventListener('focusout', function (e) {
      if (!heroShowcase.contains(e.relatedTarget)) { heroFocused = false; scheduleHero(); }
    });
    document.addEventListener('visibilitychange', scheduleHero);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        scheduleHero();
      }, { threshold: 0.12 }).observe(heroShowcase);
    }
    scheduleHero();
  }

  /* ── Login-state detection ──
     The site is served independently from the bot, but /auth/* is
     proxied to the Bark instance. Detect an existing session and
     switch the nav/hero CTAs to "Dashboard". */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var detectLogin = !prefersReduced; // light path only; skip on reduced motion
  if (detectLogin && window.fetch) {
    fetch('/auth/me', { credentials: 'include' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (me) {
        if (me && me.authenticated) {
          var links = document.querySelectorAll('a[href="/auth/login"]');
          for (var i = 0; i < links.length; i++) {
            var el = links[i];
            el.href = '/dashboard';
            // only change text if it's a login CTA, keep it accurate
            if (/sign in/i.test(el.textContent)) {
              el.textContent = 'Dashboard';
              if (el.classList.contains('nav-cta')) {
                // keep the visual as a solid button
              }
            }
          }
        }
      })
      .catch(function () { /* unauthenticated or unreachable — leave login CTAs */ });
  }

  /* ── Reveal-on-scroll (skip entirely under reduced motion) ── */
  if (prefersReduced || !('IntersectionObserver' in window)) {
    // Ensure reveals are visible if JS-gated but observer unavailable
    root.classList.remove('js');
    var revealAll = document.querySelectorAll('.reveal');
    for (var i = 0; i < revealAll.length; i++) revealAll[i].classList.add('in-view');
    return;
  }
  var items = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('in-view');
        io.unobserve(entries[i].target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  for (var j = 0; j < items.length; j++) io.observe(items[j]);
})();
