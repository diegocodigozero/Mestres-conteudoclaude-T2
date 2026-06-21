// =====================================================================
//  Mobile sidebar drawer
// =====================================================================
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  document.body.classList.add('sidebar-open');
  if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'true');
}
function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
}
if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    document.body.classList.contains('sidebar-open') ? closeSidebar() : openSidebar();
  });
}
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

// =====================================================================
//  Sidebar accordion — groups by Aula (expand / collapse)
// =====================================================================
function setGroupExpanded(group, expanded) {
  if (!group) return;
  group.classList.toggle('expanded', expanded);
  const header = group.querySelector('.nav-group-header');
  if (header) header.setAttribute('aria-expanded', String(expanded));
}

document.querySelectorAll('[data-group-toggle]').forEach((header) => {
  header.addEventListener('click', () => {
    const group = header.closest('.nav-group');
    setGroupExpanded(group, !group.classList.contains('expanded'));
  });
});

// =====================================================================
//  Topic navigation — single-page show/hide
// =====================================================================
const topics = document.querySelectorAll('.topic');

function markCurrentGroup(targetId, expand) {
  document.querySelectorAll('.nav-group').forEach((g) => g.classList.remove('is-current'));
  const link = document.querySelector(`[data-target="${targetId}"]`);
  if (!link) return;
  const group = link.closest('.nav-group');
  if (!group) return;
  group.classList.add('is-current');
  // Auto-expand the owning group only on user navigation, never on initial load
  if (expand && group.querySelector('.nav-sublist')) setGroupExpanded(group, true);
}

function activate(targetId, expand = true) {
  const exists = document.getElementById(targetId);
  if (!exists) return;
  topics.forEach((t) => t.classList.toggle('active', t.id === targetId));
  document.querySelectorAll('.nav-link').forEach((l) => {
    l.classList.toggle('active', l.dataset.target === targetId);
  });
  markCurrentGroup(targetId, expand);
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Every element carrying data-target navigates: nav links, locked aula
// headers, and in-content CTA buttons.
document.querySelectorAll('[data-target]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.dataset.target;
    activate(target);
    history.replaceState(null, '', `#${target}`);
  });
});

// Open the topic from the URL hash on load (default: a3-principios / Aula 01 — Funil)
const initial = window.location.hash.replace('#', '');
if (initial && document.getElementById(initial)) {
  activate(initial, false);
} else {
  markCurrentGroup('a3-principios', false);
}

// =====================================================================
//  Progressive card reveal — arrow advances to next card
// =====================================================================
document.querySelectorAll('.cards').forEach((stage) => {
  const btn = stage.querySelector('.reveal-next');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const nextCard = stage.querySelector('.card.hidden');
    if (!nextCard) return;

    nextCard.classList.remove('hidden');
    nextCard.classList.add('revealed');

    if (!stage.querySelector('.card.hidden')) {
      btn.classList.add('hidden');
    }
  });
});

// =====================================================================
//  Sidebar topic-check toggle (persisted in localStorage)
// =====================================================================
const TOPIC_CHECK_KEY = 'aula0106-topic-checks';

function loadChecks() {
  try {
    return JSON.parse(localStorage.getItem(TOPIC_CHECK_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function saveChecks(state) {
  localStorage.setItem(TOPIC_CHECK_KEY, JSON.stringify(state));
}

const checkState = loadChecks();

document.querySelectorAll('[data-topic-check]').forEach((btn) => {
  const key = btn.dataset.topicCheck;
  if (checkState[key]) btn.classList.add('checked');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isChecked = btn.classList.toggle('checked');
    checkState[key] = isChecked;
    saveChecks(checkState);
  });
});

// =====================================================================
//  Reveal section button (esforço, etc.)
// =====================================================================
document.querySelectorAll('[data-reveal-section]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.revealSection);
    if (!target) return;
    target.classList.remove('hidden');
    const wrap = btn.closest('[data-reveal-wrap]');
    if (wrap) wrap.classList.add('hidden');
  });
});

// =====================================================================
//  Copy-to-clipboard buttons
// =====================================================================
document.querySelectorAll('[data-copy-target]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const target = document.getElementById(btn.dataset.copyTarget);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.innerText);
      const label = btn.querySelector('.copy-label');
      const original = label ? label.textContent : '';
      btn.classList.add('copied');
      if (label) label.textContent = 'Copiado!';
      setTimeout(() => {
        btn.classList.remove('copied');
        if (label) label.textContent = original;
      }, 1800);
    } catch (e) {
      console.error('Falha ao copiar:', e);
    }
  });
});

// =====================================================================
//  Block carousel — one block visible at a time, arrows step
// =====================================================================
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const blocks = carousel.querySelectorAll('.topic-block');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  let current = 1;
  const total = blocks.length;

  function show(n) {
    if (n < 1 || n > total) return;
    current = n;
    blocks.forEach((b) => {
      const isActive = Number(b.dataset.block) === n;
      b.classList.toggle('active', isActive);
    });
    dots.forEach((d) => {
      d.classList.toggle('active', Number(d.dataset.goTo) === n);
    });
    if (prevBtn) prevBtn.disabled = n === 1;
    if (nextBtn) nextBtn.disabled = n === total;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => show(current + 1));
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => show(current - 1));
  }
  dots.forEach((d) => {
    d.addEventListener('click', () => show(Number(d.dataset.goTo)));
  });
});
