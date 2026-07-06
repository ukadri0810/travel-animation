const loader = document.getElementById('loader');
const page = document.getElementById('page');

window.addEventListener('load', () => {
  setTimeout(() => page.classList.add('is-visible'), 2800);
  setTimeout(() => loader.classList.add('is-gone'), 4300);
  setTimeout(() => loader.classList.add('is-hidden'), 5200);
});

// Subtle premium cursor-light motion on desktop only
if (window.matchMedia('(pointer:fine)').matches) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / innerWidth - .5) * 10;
    const y = (e.clientY / innerHeight - .5) * 10;
    document.documentElement.style.setProperty('--mx', `${x}px`);
    document.documentElement.style.setProperty('--my', `${y}px`);
  });
}
