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
function syncFaqHeights() {
  faqItems.forEach((item) => {
    const answer = item.querySelector('.faq-answer');
    if (!answer) return;

    if (item.classList.contains('active')) {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
      return;
    }

    answer.style.maxHeight = '0px';
  });
}

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  button?.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    faqItems.forEach((faq) => faq.classList.remove('active'));
    if (!isActive) item.classList.add('active');
    syncFaqHeights();
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
const heroSlider = document.querySelector('[data-hero-slider]');
const heroSlides = heroSlider ? [...heroSlider.querySelectorAll('[data-hero-slide]')] : [];
const heroPrev = heroSlider?.querySelector('[data-hero-arrow="prev"]') ?? null;
const heroNext = heroSlider?.querySelector('[data-hero-arrow="next"]') ?? null;
const heroDots = heroSlider ? [...heroSlider.querySelectorAll('[data-hero-dot]')] : [];
const heroCount = heroSlider?.querySelector('[data-hero-count]') ?? null;
const heroMediaTriggers = heroSlider ? [...heroSlider.querySelectorAll('.hero-slide-media')] : [];
const touchStoryViewport = document.querySelector('.touch-story-viewport');
const touchStoryRail = touchStoryViewport?.querySelector('.touch-story-rail') ?? null;
const touchStoryCards = touchStoryRail ? [...touchStoryRail.querySelectorAll('.touch-step-card')] : [];
const touchStoryPrev = document.querySelector('[data-touch-story-nav="prev"]');
const touchStoryNext = document.querySelector('[data-touch-story-nav="next"]');
const touchStoryCurrent = document.querySelector('[data-touch-story-current]');
const TERMS_CONSENT_CONFIG = {
  storageKey: 'moonline_terms_accepted',
  version: 'v1.0',
  termsSlug: 'termos-de-uso',
  privacySlug: 'politica-de-privacidade'
};
let latestY = 0;
let ticking = false;
let touchStoryTicking = false;
let heroCurrentIndex = Math.max(heroSlides.findIndex((slide) => slide.classList.contains('is-active')), 0);
let heroAutoplayId = 0;
let heroTouchStartX = 0;
let heroTouchStartY = 0;

function hasHeroSlider() {
  return Boolean(heroSlider && heroSlides.length);
}

function normalizeHeroIndex(index) {
  if (!hasHeroSlider()) return 0;
  if (index < 0) return heroSlides.length - 1;
  if (index >= heroSlides.length) return 0;
  return index;
}

function updateHeroSlider(index) {
  if (!hasHeroSlider()) return;

  heroCurrentIndex = normalizeHeroIndex(index);

  heroSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === heroCurrentIndex;
    const mediaTrigger = slide.querySelector('.hero-slide-media');
    slide.classList.toggle('is-active', isActive);
    slide.setAttribute('aria-hidden', String(!isActive));
    if (mediaTrigger) {
      mediaTrigger.tabIndex = isActive ? 0 : -1;
    }
  });

  heroDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === heroCurrentIndex;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-pressed', String(isActive));
  });

  if (heroCount) {
    heroCount.textContent = `${String(heroCurrentIndex + 1).padStart(2, '0')} / ${String(heroSlides.length).padStart(2, '0')}`;
  }
}

function stopHeroAutoplay() {
  if (!heroAutoplayId) return;

  window.clearInterval(heroAutoplayId);
  heroAutoplayId = 0;
}

function startHeroAutoplay() {
  if (!hasHeroSlider() || heroSlides.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (heroAutoplayId) return;

  heroAutoplayId = window.setInterval(() => {
    updateHeroSlider(heroCurrentIndex + 1);
  }, 6500);
}

function restartHeroAutoplay() {
  stopHeroAutoplay();
  startHeroAutoplay();
}

function bindHeroSlider() {
  if (!hasHeroSlider()) return;

  heroPrev?.addEventListener('click', () => {
    updateHeroSlider(heroCurrentIndex - 1);
    restartHeroAutoplay();
  });

  heroNext?.addEventListener('click', () => {
    updateHeroSlider(heroCurrentIndex + 1);
    restartHeroAutoplay();
  });

  heroDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      updateHeroSlider(index);
      restartHeroAutoplay();
    });
  });

  heroSlider.addEventListener('mouseenter', stopHeroAutoplay);
  heroSlider.addEventListener('mouseleave', startHeroAutoplay);
  heroSlider.addEventListener('focusin', stopHeroAutoplay);
  heroSlider.addEventListener('focusout', (event) => {
    if (heroSlider.contains(event.relatedTarget)) return;
    startHeroAutoplay();
  });

  heroSlider.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    heroTouchStartX = touch.clientX;
    heroTouchStartY = touch.clientY;
    stopHeroAutoplay();
  }, { passive: true });

  heroSlider.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - heroTouchStartX;
    const deltaY = touch.clientY - heroTouchStartY;

    if (Math.abs(deltaX) > 54 && Math.abs(deltaX) > Math.abs(deltaY)) {
      updateHeroSlider(heroCurrentIndex + (deltaX < 0 ? 1 : -1));
    }

    startHeroAutoplay();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopHeroAutoplay();
      return;
    }

    startHeroAutoplay();
  });
}

const HeroImageLightbox = {
  element: null,
  image: null,
  closeButton: null,
  lastFocusedElement: null,
  previousBodyOverflow: '',
  ensureMounted() {
    if (this.element) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'hero-lightbox';
    lightbox.setAttribute('hidden', '');
    lightbox.setAttribute('aria-hidden', 'true');

    lightbox.innerHTML = `
      <div class="hero-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Imagem ampliada do hero Moon Line">
        <button class="hero-lightbox-close" type="button" aria-label="Fechar imagem ampliada">
          &times;
        </button>
        <div class="hero-lightbox-media">
          <img src="" alt="" />
        </div>
      </div>
    `;

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        this.close();
      }
    });

    const closeButton = lightbox.querySelector('.hero-lightbox-close');
    closeButton?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    document.body.appendChild(lightbox);
    this.element = lightbox;
    this.image = lightbox.querySelector('.hero-lightbox-media img');
    this.closeButton = closeButton;
  },
  isOpen() {
    return Boolean(this.element && !this.element.hasAttribute('hidden'));
  },
  openFromTrigger(trigger) {
    this.ensureMounted();
    if (this.isOpen()) return;

    const image = trigger?.querySelector('img');
    if (!image || !this.element || !this.image) return;

    this.lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.previousBodyOverflow = document.body.style.overflow;

    this.image.src = image.currentSrc || image.src;
    this.image.alt = image.alt || 'Imagem ampliada do hero Moon Line';

    this.element.removeAttribute('hidden');
    this.element.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    stopHeroAutoplay();

    window.requestAnimationFrame(() => {
      this.element?.classList.add('is-open');
      this.closeButton?.focus();
    });
  },
  close() {
    if (!this.element) return;

    this.element.classList.remove('is-open');
    this.element.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = this.previousBodyOverflow;

    window.setTimeout(() => {
      this.element?.setAttribute('hidden', '');
      if (this.image) {
        this.image.src = '';
        this.image.alt = '';
      }
    }, 220);

    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }

    startHeroAutoplay();
  },
  init() {
    if (!heroMediaTriggers.length) return;

    this.ensureMounted();

    heroMediaTriggers.forEach((trigger) => {
      let pointerStartX = 0;
      let pointerStartY = 0;

      trigger.addEventListener('pointerdown', (event) => {
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
      });

      trigger.addEventListener('pointerup', (event) => {
        if (event.pointerType !== 'touch') return;

        const deltaX = Math.abs(event.clientX - pointerStartX);
        const deltaY = Math.abs(event.clientY - pointerStartY);

        if (deltaX <= 10 && deltaY <= 10) {
          this.openFromTrigger(trigger);
        }
      });

      trigger.addEventListener('click', () => {
        this.openFromTrigger(trigger);
      });
    });
  }
};

const termsConsentStore = {
  read() {
    try {
      const rawValue = window.localStorage.getItem(TERMS_CONSENT_CONFIG.storageKey);
      return rawValue ? JSON.parse(rawValue) : null;
    } catch (error) {
      return null;
    }
  },
  hasAcceptedCurrentVersion() {
    const payload = this.read();
    return Boolean(payload?.accepted === true && payload?.version === TERMS_CONSENT_CONFIG.version);
  },
  saveAcceptance() {
    const payload = {
      accepted: true,
      acceptedAt: new Date().toISOString(),
      version: TERMS_CONSENT_CONFIG.version
    };

    try {
      window.localStorage.setItem(TERMS_CONSENT_CONFIG.storageKey, JSON.stringify(payload));
    } catch (error) {
      return payload;
    }

    return payload;
  }
};

function isNestedLegalPage() {
  return /\/(termos-de-uso|politica-de-privacidade)(\/index\.html|\/?)$/i.test(window.location.pathname);
}

function getLegalHref(slug) {
  return isNestedLegalPage() ? `../${slug}/` : `${slug}/`;
}

const TermsConsentBanner = {
  element: null,
  hideTimeout: null,
  render() {
    const banner = document.createElement('aside');
    banner.className = 'terms-consent-banner glass-panel';
    banner.setAttribute('aria-label', 'Aviso de aceite dos Termos de Uso e Política de Privacidade');

    banner.innerHTML = `
      <div class="terms-consent-body">
        <p class="terms-consent-kicker">Moon Line</p>
        <p class="terms-consent-copy">
          Ao continuar, você concorda com os nossos Termos de Uso e Política de Privacidade. Sua privacidade é importante para a Moon Line.
        </p>
        <div class="terms-consent-actions">
          <button class="button primary terms-consent-accept" type="button" data-terms-consent-accept aria-label="Aceitar Termos de Uso e Política de Privacidade">
            Aceitar
          </button>
        </div>
      </div>
      <div class="terms-consent-links">
        <p class="terms-consent-links-title">Leitura completa</p>
        <div class="terms-consent-link-list">
          <a href="${getLegalHref(TERMS_CONSENT_CONFIG.termsSlug)}" aria-label="Ler Termos de Uso">
            Ler Termos de Uso
          </a>
          <a href="${getLegalHref(TERMS_CONSENT_CONFIG.privacySlug)}" aria-label="Ler Política de Privacidade">
            Política de Privacidade
          </a>
        </div>
      </div>
    `;

    banner.querySelector('[data-terms-consent-accept]')?.addEventListener('click', () => {
      termsConsentStore.saveAcceptance();
      this.hide();
    });

    return banner;
  },
  mount() {
    if (this.element || termsConsentStore.hasAcceptedCurrentVersion()) return;

    const banner = this.render();
    document.body.appendChild(banner);
    this.element = banner;

    window.requestAnimationFrame(() => {
      this.element?.classList.add('is-visible');
    });
  },
  hide() {
    if (!this.element) return;

    this.element.classList.remove('is-visible');

    if (this.hideTimeout) {
      window.clearTimeout(this.hideTimeout);
    }

    this.hideTimeout = window.setTimeout(() => {
      this.element?.remove();
      this.element = null;
      this.hideTimeout = null;
    }, 260);
  },
  init() {
    if (termsConsentStore.hasAcceptedCurrentVersion()) return;
    this.mount();
  }
};

window.MoonLineTermsConsent = termsConsentStore;
window.TermsConsentBanner = TermsConsentBanner;

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

function hasTouchStory() {
  return Boolean(touchStoryViewport && touchStoryRail && touchStoryCards.length);
}

function getTouchStoryGap() {
  if (!touchStoryRail) return 0;

  const { gap, columnGap } = window.getComputedStyle(touchStoryRail);
  return Number.parseFloat(columnGap || gap || '0') || 0;
}

function getTouchStoryCardWidth() {
  if (!hasTouchStory()) return 0;

  return touchStoryCards[0].offsetWidth;
}

function syncTouchStoryInset() {
  if (!hasTouchStory()) return;

  const firstCardWidth = getTouchStoryCardWidth();
  const inset = Math.max((touchStoryViewport.clientWidth - firstCardWidth) / 2, 0);
  touchStoryViewport.style.setProperty('--touch-story-inset', `${inset}px`);
}

function getTouchStoryStep() {
  if (!hasTouchStory()) return 0;

  return getTouchStoryCardWidth() + getTouchStoryGap();
}

function scrollTouchStoryToIndex(index) {
  if (!hasTouchStory()) return;

  const targetIndex = Math.max(0, Math.min(index, touchStoryCards.length - 1));
  const targetCard = touchStoryCards[targetIndex];
  if (!targetCard) return;

  const inset = Math.max((touchStoryViewport.clientWidth - targetCard.offsetWidth) / 2, 0);
  const targetLeft = Math.max(0, targetCard.offsetLeft - inset);

  touchStoryViewport.scrollTo({
    left: targetLeft,
    behavior: 'smooth'
  });
}

function getActiveTouchStoryIndex() {
  if (!hasTouchStory()) return 0;

  const viewportCenter = touchStoryViewport.scrollLeft + touchStoryViewport.clientWidth / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  touchStoryCards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const distance = Math.abs(cardCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function updateTouchStoryUI() {
  if (!hasTouchStory()) return;

  syncTouchStoryInset();

  const activeIndex = getActiveTouchStoryIndex();
  touchStoryCards.forEach((card, index) => {
    const distance = Math.abs(index - activeIndex);
    card.classList.toggle('is-active', index === activeIndex);
    card.classList.toggle('is-near', distance === 1);
    card.classList.toggle('is-far', distance > 1);
  });

  if (touchStoryCurrent) {
    touchStoryCurrent.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(touchStoryCards.length).padStart(2, '0')}`;
  }

  const maxScroll = Math.max(touchStoryViewport.scrollWidth - touchStoryViewport.clientWidth, 0);

  if (touchStoryPrev) {
    touchStoryPrev.disabled = touchStoryViewport.scrollLeft <= 4;
  }

  if (touchStoryNext) {
    touchStoryNext.disabled = touchStoryViewport.scrollLeft >= maxScroll - 4;
  }
}

function requestTouchStoryUpdate() {
  if (!hasTouchStory() || touchStoryTicking) return;

  touchStoryTicking = true;
  window.requestAnimationFrame(() => {
    updateTouchStoryUI();
    touchStoryTicking = false;
  });
}

function scrollTouchStory(direction) {
  if (!hasTouchStory()) return;

  const activeIndex = getActiveTouchStoryIndex();
  scrollTouchStoryToIndex(activeIndex + direction);
}

if (hasTouchStory()) {
  // Future enhancement: add premium motion here after validating the base carousel.
  touchStoryPrev?.addEventListener('click', () => scrollTouchStory(-1));
  touchStoryNext?.addEventListener('click', () => scrollTouchStory(1));
  touchStoryViewport.addEventListener('scroll', requestTouchStoryUpdate, { passive: true });
}

if (hasHeroSlider()) {
  bindHeroSlider();
  updateHeroSlider(heroCurrentIndex);
}

window.addEventListener('scroll', requestSceneUpdate, { passive: true });
window.addEventListener('load', () => {
  requestSceneUpdate();
  startHeroAutoplay();
  updateTouchStoryUI();
});
window.addEventListener('resize', () => {
  requestSceneUpdate();
  requestTouchStoryUpdate();
  syncFaqHeights();
});

window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  updateHeroSlider(heroCurrentIndex);
  updateTouchStoryUI();
  syncFaqHeights();
  HeroImageLightbox.init();
  TermsConsentBanner.init();
});
