// Shared scripts for interview prep HTML

// Theme toggle
function toggleTheme() {
  const html = document.documentElement;
  const curr = html.getAttribute('data-theme');
  const next = curr === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  const icon = document.getElementById('themeIcon');
  const text = document.getElementById('themeText');
  if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
  if (text) text.textContent = next === 'dark' ? 'Light' : 'Dark';
  try { localStorage.setItem('theme', next); } catch (e) {}
}

// Restore saved theme on load
(function() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      window.addEventListener('DOMContentLoaded', () => {
        const icon = document.getElementById('themeIcon');
        const text = document.getElementById('themeText');
        if (icon) icon.textContent = saved === 'dark' ? '☀️' : '🌙';
        if (text) text.textContent = saved === 'dark' ? 'Light' : 'Dark';
      });
    }
  } catch (e) {}
})();

// TOC scrollspy
window.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id], h3[id], h2[id]');
  const links = document.querySelectorAll('aside .toc a');

  function updateActive() {
    let curr = '';
    sections.forEach(s => {
      const t = s.getBoundingClientRect().top;
      if (t < 120) curr = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + curr);
    });
  }
  window.addEventListener('scroll', updateActive);
  updateActive();

  // Close sidebar on mobile after click
  links.forEach(a => a.addEventListener('click', () => {
    if (window.innerWidth < 980) {
      document.querySelector('.sidebar').classList.remove('open');
    }
  }));

  // Menu toggle (mobile)
  const menuBtn = document.querySelector('.menu-toggle');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('open');
    });
  }
});
