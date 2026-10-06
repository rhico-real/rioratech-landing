(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mesh = document.getElementById('network-field');
  const fallback = document.querySelector('.hero-mesh-fallback');

  const startNetwork = () => {
    if (reducedMotion || !mesh || !window.VANTA?.NET || !window.THREE) return;
    try {
      window.VANTA.NET({
        el: mesh,
        THREE: window.THREE,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        color: 0xf07404,
        backgroundColor: 0xfdfdfb,
        backgroundAlpha: 1,
        points: 10,
        maxDistance: 20,
        spacing: 15,
        showDots: false
      });
      fallback?.setAttribute('hidden', '');
    } catch (error) {
      // The static mesh fallback remains visible if a remote animation library is unavailable.
    }
  };

  if (document.readyState === 'complete') startNetwork();
  else window.addEventListener('load', startNetwork, { once: true });

  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navLinks?.classList.toggle('is-open', open);
  });
  navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
    navLinks.classList.remove('is-open');
  }));

  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (feedback) feedback.textContent = 'Thanks for sharing. This preview form is not connected yet, so your message has not been sent.';
    form.reset();
  });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
