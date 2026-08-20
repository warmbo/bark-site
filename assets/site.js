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

  /* ── Dashboard tour ──
     Progressive tab interface: without JS, all five screenshots remain visible.
     With JS, one full-size view is shown at a time. */
  var tour = document.querySelector('.dashboard-tour');
  if (tour) {
    var tourTabs = Array.prototype.slice.call(tour.querySelectorAll('[data-tour]'));
    var tourPanels = Array.prototype.slice.call(tour.querySelectorAll('[data-tour-panel]'));

    function selectTour(name, moveFocus) {
      for (var i = 0; i < tourTabs.length; i++) {
        var selected = tourTabs[i].getAttribute('data-tour') === name;
        tourTabs[i].setAttribute('aria-selected', selected ? 'true' : 'false');
        tourTabs[i].tabIndex = selected ? 0 : -1;
        if (selected && moveFocus) tourTabs[i].focus();
      }
      for (var j = 0; j < tourPanels.length; j++) {
        var active = tourPanels[j].getAttribute('data-tour-panel') === name;
        tourPanels[j].classList.toggle('is-active', active);
        tourPanels[j].hidden = !active;
      }
    }

    tour.classList.add('enhanced');
    selectTour('overview', false);
    for (var ti = 0; ti < tourTabs.length; ti++) {
      tourTabs[ti].addEventListener('click', function () {
        selectTour(this.getAttribute('data-tour'), false);
      });
      tourTabs[ti].addEventListener('keydown', function (e) {
        var index = tourTabs.indexOf(this);
        var next = index;
        if (e.key === 'ArrowRight') next = (index + 1) % tourTabs.length;
        else if (e.key === 'ArrowLeft') next = (index - 1 + tourTabs.length) % tourTabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tourTabs.length - 1;
        else return;
        e.preventDefault();
        selectTour(tourTabs[next].getAttribute('data-tour'), true);
      });
    }
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
