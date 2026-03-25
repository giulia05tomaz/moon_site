const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  button?.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    faqItems.forEach((faq) => faq.classList.remove('active'));
    if (!isActive) item.classList.add('active');
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const moon = document.getElementById('moon');
const parallaxNodes = [...document.querySelectorAll('[data-parallax]')];
let latestY = 0;
let ticking = false;

function animateScene() {
  const scrollY = latestY;
  const rotationY = scrollY * -0.055;
  const translateY = Math.min(scrollY * 0.06, 72);
  const scale = 1 + Math.min(scrollY / 14000, 0.02);

  if (moon) {
    moon.style.transform = `translate3d(0, ${translateY}px, 0) rotateY(${rotationY}deg) scale(${scale})`;
  }

  const viewportCenter = window.innerHeight / 2;

  parallaxNodes.forEach((node) => {
    const speed = Number(node.dataset.parallax || 0.08);
    const rect = node.getBoundingClientRect();
    const nodeCenter = rect.top + rect.height / 2;
    const distanceFromCenter = nodeCenter - viewportCenter;

    const offset = Math.max(-24, Math.min(24, -distanceFromCenter * speed * 0.12));
    const sway = Math.max(-1.8, Math.min(1.8, -distanceFromCenter * speed * 0.004));

    node.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
    node.style.setProperty('--parallax-rotate', `${sway.toFixed(2)}deg`);
  });

  ticking = false;
}

function requestSceneUpdate() {
  latestY = window.scrollY || window.pageYOffset;
  if (!ticking) {
    window.requestAnimationFrame(animateScene);
    ticking = true;
  }
}

window.addEventListener('scroll', requestSceneUpdate, { passive: true });
window.addEventListener('load', requestSceneUpdate);
window.addEventListener('resize', requestSceneUpdate);


window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});



/* ===== TYPEWRITER_MOONLINE_VENTURI ===== */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sectionMap = [
    {
      section: '.hero',
      targets: ['h1', '.hero-copy']
    },
    {
      section: '#sobre',
      targets: ['h2', '.section-lead', '.quote-band p']
    },
    {
      section: '#funciona',
      targets: ['h2', '.section-lead', '.step-card h3 span', '.step-card p']
    },
    {
      section: '#recursos',
      targets: ['h2', '.section-lead', '.feature-card h3', '.feature-card p']
    },
    {
      section: '#publico',
      targets: ['h2', '.section-lead', '.audience-card h3 span', '.audience-card p']
    },
    {
      section: '#faq',
      targets: ['h2', '.section-lead']
    },
    {
      section: '.final-cta',
      targets: ['h2', '.section-lead']
    }
  ];

  const sections = [];

  function getDelay(char) {
    if (/[.,!?;:]/.test(char)) return 48;
    if (/\s/.test(char)) return 18;
    return 28;
  }

  function prepareElement(el) {
    if (!el || el.dataset.twPrepared === 'true') return;
    el.dataset.twPrepared = 'true';
    el.dataset.twOriginal = el.textContent.replace(/\s+/g, ' ').trim();
    el.classList.add('typewriter-target');

    if (!reduceMotion) {
      el.textContent = '';
      el.classList.add('typewriter-waiting');
    }
  }

  async function typeElement(el) {
    if (!el || el.dataset.twDone === 'true') return;
    const original = el.dataset.twOriginal || '';
    if (!original) return;

    el.dataset.twDone = 'true';
    el.classList.remove('typewriter-waiting');
    el.classList.add('typewriter-active');

    if (reduceMotion) {
      el.textContent = original;
      el.classList.remove('typewriter-active');
      el.classList.add('typewriter-done');
      return;
    }

    el.textContent = '';
    const textNode = document.createTextNode('');
    const caret = document.createElement('span');
    caret.className = 'typewriter-caret';
    caret.setAttribute('aria-hidden', 'true');
    el.appendChild(textNode);
    el.appendChild(caret);

    let acc = '';
    for (const char of original) {
      acc += char;
      textNode.nodeValue = acc;
      await new Promise((resolve) => setTimeout(resolve, getDelay(char)));
    }

    await new Promise((resolve) => setTimeout(resolve, 180));
    el.classList.remove('typewriter-active');
    el.classList.add('typewriter-done');
  }

  async function playSection(sectionObj) {
    if (!sectionObj || sectionObj.played) return;
    sectionObj.played = true;

    for (const el of sectionObj.elements) {
      await typeElement(el);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  }

  sectionMap.forEach((config) => {
    const sectionEl = document.querySelector(config.section);
    if (!sectionEl) return;

    const elements = [];
    config.targets.forEach((selector) => {
      sectionEl.querySelectorAll(selector).forEach((el) => {
        if (el.textContent.trim()) {
          prepareElement(el);
          elements.push(el);
        }
      });
    });

    if (elements.length) {
      sections.push({ sectionEl, elements, played: false });
    }
  });

  if (!sections.length) return;

  if (reduceMotion) {
    sections.forEach((item) => playSection(item));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const match = sections.find((item) => item.sectionEl === entry.target);
        if (match) playSection(match);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.22,
    rootMargin: '0px 0px -12% 0px'
  });

  sections.forEach((item, index) => {
    observer.observe(item.sectionEl);
    if (index === 0) {
      requestAnimationFrame(() => playSection(item));
      observer.unobserve(item.sectionEl);
    }
  });
})();
