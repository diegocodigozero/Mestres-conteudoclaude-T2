/* Aula 04 · Squads — interações leves (copiar prompt + reveal on scroll) */
(function () {
  'use strict';

  /* marca que o JS está ativo (ativa as animações de entrada) */
  document.documentElement.classList.add('js');

  /* ---- Copiar para a área de transferência ---- */
  document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-copy-target'));
      if (!target) return;
      var text = target.innerText;
      var done = function () {
        var label = btn.querySelector('.copy-label');
        var prev = label ? label.textContent : '';
        btn.classList.add('copied');
        if (label) label.textContent = 'Copiado!';
        window.setTimeout(function () {
          btn.classList.remove('copied');
          if (label) label.textContent = prev;
        }, 1900);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
  });

  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }

  /* ---- Reveal on scroll ---- */
  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(function (el) { io.observe(el); });
})();
