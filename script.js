const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
let scrollAnimationFrame = 0;
let previousScrollBehavior = '';

function cancelSmoothScroll() {
  if (!scrollAnimationFrame) return;
  window.cancelAnimationFrame(scrollAnimationFrame);
  scrollAnimationFrame = 0;
  document.documentElement.style.scrollBehavior = previousScrollBehavior;
}

function scrollToSection(link, event) {
  const target = document.querySelector(link.hash);
  if (!target) return;

  event.preventDefault();
  cancelSmoothScroll();
  if (window.location.hash !== link.hash) {
    window.history.pushState(null, '', link.hash);
  }

  const startY = window.scrollY;
  const targetY = link.hash === '#home'
    ? 0
    : Math.max(0, target.getBoundingClientRect().top + startY - 85);
  const distance = targetY - startY;
  const duration = Math.min(1100, Math.max(420, Math.abs(distance) * .45));
  const startTime = performance.now();
  previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';

  function animateScroll(time) {
    const progress = Math.min(1, (time - startTime) / duration);
    const eased = progress < .5
      ? 4 * progress * progress * progress
      : 1 - (Math.pow(-2 * progress + 2, 3) / 2);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      scrollAnimationFrame = window.requestAnimationFrame(animateScroll);
    } else {
      scrollAnimationFrame = 0;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    }
  }

  scrollAnimationFrame = window.requestAnimationFrame(animateScroll);
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  mainNav.classList.toggle('is-open', !isOpen);
});

mainNav.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    mainNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    scrollToSection(link, event);
  });
});

document.querySelector('#current-year').textContent = String(new Date().getFullYear());

document.querySelectorAll('a[href="#home"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    scrollToSection(link, event);
  });
});

const revealItems = document.querySelectorAll(
  '.section-heading, .work-card, .software-card, .skill-group, .strengths-panel, .editorial-card, .profile-detail, .about-copy',
);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

  revealItems.forEach((item, index) => {
    item.classList.add('reveal-ready');
    item.style.setProperty('--reveal-delay', `${(index % 4) * 65}ms`);
    revealObserver.observe(item);
  });
}

const posterPreview = document.querySelector('#poster-preview');
const posterPreviewImage = document.querySelector('#poster-preview-image');
const posterPreviewTitle = document.querySelector('#poster-preview-title');
const posterPreviewClose = document.querySelector('.poster-preview-close');

document.querySelectorAll('.poster-open').forEach((button) => {
  button.addEventListener('click', () => {
    const posterImage = button.querySelector('img');
    posterPreviewImage.src = posterImage.currentSrc || posterImage.src;
    posterPreviewImage.alt = `${button.dataset.title} poster artwork`;
    posterPreviewTitle.textContent = button.dataset.title;
    posterPreview.showModal();
  });
});

posterPreviewClose.addEventListener('click', () => posterPreview.close());
posterPreview.addEventListener('click', (event) => {
  if (event.target === posterPreview) posterPreview.close();
});
