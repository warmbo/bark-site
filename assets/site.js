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
