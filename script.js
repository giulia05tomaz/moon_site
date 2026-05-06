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

function getLegalLandingHref() {
  return isNestedLegalPage() ? '../moon-line-legal-main/index.html' : 'moon-line-legal-main/index.html';
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
          <a href="${getLegalLandingHref()}" target="_blank" rel="noopener noreferrer" aria-label="Abrir documentos legais da Moon Line">
            Ler Termos de Uso
          </a>
          <a href="${getLegalLandingHref()}" target="_blank" rel="noopener noreferrer" aria-label="Abrir documentos legais da Moon Line">
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

const BillingCheckout = {
  apiBaseUrl: window.MOON_LINE_API_BASE_URL || 'https://guardian-backend-qw0j.onrender.com',
  modal: document.querySelector('[data-billing-modal]'),
  openButtons: [...document.querySelectorAll('[data-billing-open]')],
  manageButtons: [...document.querySelectorAll('[data-billing-manage]')],
  closeButtons: [...document.querySelectorAll('[data-billing-close]')],
  tabsShell: document.querySelector('[data-billing-tabs]'),
  tabs: [...document.querySelectorAll('[data-billing-tab]')],
  forms: [...document.querySelectorAll('[data-billing-form]')],
  title: document.querySelector('[data-billing-title]'),
  intro: document.querySelector('[data-billing-intro]'),
  status: document.querySelector('[data-billing-status]'),
  loginSubmit: document.querySelector('[data-billing-login-submit]'),
  manageSummary: document.querySelector('[data-billing-manage-summary]'),
  manageStatus: document.querySelector('[data-billing-manage-status]'),
  manageAccess: document.querySelector('[data-billing-manage-access]'),
  cancelButton: document.querySelector('[data-billing-cancel]'),
  logoutButton: document.querySelector('[data-billing-logout]'),
  cancelConfirm: document.querySelector('[data-billing-cancel-confirm]'),
  cancelConfirmDescription: document.querySelector('[data-billing-cancel-description]'),
  cancelConfirmAccess: document.querySelector('[data-billing-cancel-access]'),
  cancelConfirmDismissButtons: [...document.querySelectorAll('[data-billing-cancel-dismiss]')],
  cancelConfirmAction: document.querySelector('[data-billing-cancel-confirm-action]'),
  intent: 'checkout',
  currentManageData: null,
  previousBodyOverflow: '',
  defaultTitle: 'Entre para continuar',
  defaultIntro: 'Use sua conta Moon Line para gerar o checkout seguro no Mercado Pago. O cartão será informado somente lá.',
  formatCpfInput(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  },
  formatBirthDateInput(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  },
  isoDateToBr(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return value || '';
    return `${match[3]}/${match[2]}/${match[1]}`;
  },
  setStatus(message, tone = 'muted') {
    if (!this.status) return;
    this.status.textContent = message || '';
    this.status.dataset.tone = tone;
  },
  setModalCopy(title, intro) {
    if (this.title) this.title.textContent = title || this.defaultTitle;
    if (this.intro) this.intro.textContent = intro || this.defaultIntro;
  },
  resetModalCopy() {
    this.setModalCopy(this.defaultTitle, this.defaultIntro);
  },
  setSignupVisible(visible) {
    this.tabs.forEach((tab) => {
      if (tab.dataset.billingTab === 'signup') tab.hidden = !visible;
    });
  },
  setAuthTabsVisible(visible, { signupVisible = true } = {}) {
    if (this.tabsShell) this.tabsShell.hidden = !visible;
    if (visible) this.setSignupVisible(signupVisible);
  },
  setLoginSubmitLabel(label) {
    if (this.loginSubmit) this.loginSubmit.textContent = label || 'Ir para o Mercado Pago';
  },
  formatDateTime(value) {
    const date = new Date(value || '');
    if (!Number.isFinite(date.getTime())) return null;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  },
  open() {
    if (!this.modal) return;
    this.previousBodyOverflow = document.body.style.overflow;
    this.modal.hidden = false;
    document.body.style.overflow = 'hidden';
    this.setStatus('');
    window.setTimeout(() => {
      this.modal?.querySelector('input')?.focus();
    }, 50);
  },
  close() {
    if (!this.modal) return;
    this.closeCancelConfirm();
    this.modal.hidden = true;
    document.body.style.overflow = this.previousBodyOverflow;
    this.intent = 'checkout';
    this.setAuthTabsVisible(true, { signupVisible: true });
    this.setLoginSubmitLabel('Ir para o Mercado Pago');
    this.activateTab('login');
    this.resetModalCopy();
    this.setStatus('');
  },
  activateTab(name) {
    this.tabs.forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.billingTab === name);
    });
    this.forms.forEach((form) => {
      form.classList.toggle('is-active', form.dataset.billingForm === name);
    });
    this.setStatus('');
  },
  fillForm(formName, values = {}) {
    const form = this.forms.find((item) => item.dataset.billingForm === formName);
    if (!form) return;
    Object.entries(values).forEach(([name, value]) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input || value == null) return;
      if (name === 'cpf') {
        input.value = this.formatCpfInput(value);
      } else if (name === 'birth_date') {
        input.value = this.formatBirthDateInput(this.isoDateToBr(value));
      } else {
        input.value = value;
      }
    });
  },
  showProfileForm(user = null) {
    this.setAuthTabsVisible(false);
    this.activateTab('profile');
    this.fillForm('profile', {
      full_name: user?.fullName || '',
      username: user?.displayName || user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birth_date: user?.birthDate ? String(user.birthDate).slice(0, 10) : ''
    });
    this.setStatus('Complete seus dados para liberar a assinatura.', 'muted');
  },
  getFriendlyApiMessage(data, fallback = 'Não foi possível concluir a solicitação agora.') {
    const code = data?.error || data?.code || null;
    if (code === 'subscription_already_active') {
      return data?.subscription?.cancelAtPeriodEnd
        ? 'Sua assinatura já foi cancelada e continua ativa até o fim do período pago.'
        : 'Sua assinatura Protect já está ativa.';
    }
    if (code === 'profile_required') {
      return 'Complete seu perfil antes de iniciar a assinatura.';
    }
    if (code === 'subscription_not_found') {
      return 'Nenhuma assinatura ativa foi encontrada para cancelar.';
    }
    if (code === 'mercadopago_cancel_error') {
      return 'Não foi possível cancelar a renovação agora. Tente novamente em instantes.';
    }
    return data?.message || fallback;
  },
  getFriendlyRequestMessage({ path, status, data }) {
    if (status === 401 && path === '/login') {
      return 'E-mail, telefone ou senha inválidos.';
    }
    if (status === 401) {
      return 'Sua sessão expirou. Entre novamente para continuar.';
    }
    if (status === 403) {
      return data?.message || 'Você não tem permissão para concluir esta ação.';
    }
    return this.getFriendlyApiMessage(data);
  },
  getConnectionErrorMessage() {
    return 'Não foi possível conectar ao servidor agora. Atualize a página e tente novamente.';
  },
  async request(method, path, body, token) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };

    if (method !== 'GET') {
      options.body = JSON.stringify(body || {});
    }

    let response;
    try {
      response = await fetch(`${this.apiBaseUrl}${path}`, options);
    } catch (cause) {
      const error = new Error(this.getConnectionErrorMessage());
      error.code = 'network_error';
      error.cause = cause;
      throw error;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(this.getFriendlyRequestMessage({
        path,
        status: response.status,
        data
      }));
      error.code = data?.error || null;
      error.data = data;
      error.status = response.status;
      throw error;
    }
    return data;
  },
  async post(path, body, token) {
    return this.request('POST', path, body, token);
  },
  async get(path, token) {
    return this.request('GET', path, null, token);
  },
  async patch(path, body, token) {
    return this.request('PATCH', path, body, token);
  },
  async startCheckout(token) {
    this.setStatus('Gerando checkout seguro no Mercado Pago...');
    const checkout = await this.post('/billing/checkout', {}, token);
    const checkoutUrl = checkout?.checkoutUrl || checkout?.initPoint || checkout?.sandboxInitPoint;
    if (!checkoutUrl) {
      throw new Error('Checkout criado, mas o Mercado Pago não retornou um link.');
    }
    this.setStatus('Redirecionando para o Mercado Pago...');
    window.location.href = checkoutUrl;
  },
  async continueToCheckout(token, user = null) {
    if (user?.profileComplete === false) {
      this.showProfileForm(user);
      return;
    }

    try {
      await this.startCheckout(token);
    } catch (error) {
      if (error?.code === 'profile_required') {
        this.showProfileForm(user);
        return;
      }
      if (error?.code === 'subscription_already_active') {
        await this.showAlreadyActive(token, error?.data?.subscription || null);
        return;
      }
      throw error;
    }
  },
  async showAlreadyActive(token, subscription = null) {
    this.intent = 'manage';
    this.setAuthTabsVisible(false);
    const renewalCancelled = Boolean(subscription?.cancelAtPeriodEnd);
    this.setModalCopy(
      renewalCancelled ? 'Renovação cancelada' : 'Assinatura ativa',
      renewalCancelled
        ? 'Você já cancelou a renovação mensal. Seu Protect continua ativo até o fim do período pago.'
        : 'Você já está logado. Sua assinatura Protect está ativa e pode ser gerenciada por aqui.'
    );
    this.activateTab('manage');

    if (subscription) {
      this.renderManage({ subscription, plan: { hasProtect: true } });
      this.setStatus(
        renewalCancelled
          ? 'Renovação cancelada. O acesso continua até o fim do período pago.'
          : 'Você já está logado. Sua assinatura Protect está ativa.',
        'muted'
      );
      return;
    }

    await this.showManage(token, {
      title: 'Assinatura ativa',
      intro: 'Você já está logado. Sua assinatura Protect está ativa e pode ser gerenciada por aqui.',
      status: 'Você já está logado. Sua assinatura Protect está ativa.'
    });
  },
  getSubscriptionLabel(subscription) {
    const status = String(subscription?.status || '').toLowerCase();
    if (!subscription) return 'Nenhuma assinatura encontrada';
    if (subscription.cancelAtPeriodEnd) return 'Renovação cancelada';
    if (status === 'authorized') return 'Ativa';
    if (status === 'paused') return 'Pausada';
    if (status === 'cancelled' || status === 'canceled') return 'Cancelada';
    if (status === 'pending') return 'Pendente';
    return status || 'Indefinido';
  },
  updateCancelConfirmCopy(subscription) {
    const accessDate = this.formatDateTime(subscription?.currentPeriodEnd);
    if (this.cancelConfirmDescription) {
      this.cancelConfirmDescription.textContent = accessDate
        ? `A cobrança mensal será interrompida agora. Seu Protect continua ativo até ${accessDate}.`
        : 'A cobrança mensal será interrompida agora. Seu Protect continua ativo até o fim do período já pago.';
    }
    if (this.cancelConfirmAccess) {
      this.cancelConfirmAccess.textContent = accessDate
        ? `Ativo até ${accessDate}`
        : 'Continua ativo até o fim do período pago.';
    }
  },
  openCancelConfirm() {
    const token = window.localStorage.getItem('moonline_site_token');
    if (!token) {
      this.setAuthTabsVisible(false);
      this.setLoginSubmitLabel('Entrar para gerenciar');
      this.activateTab('login');
      this.setStatus('Entre novamente para cancelar a renovação.', 'error');
      return;
    }

    this.updateCancelConfirmCopy(this.currentManageData?.subscription || null);

    if (!this.cancelConfirm) {
      this.cancelSubscription().catch((error) => {
        this.setStatus(error?.message || 'Não foi possível cancelar a renovação agora.', 'error');
        if (this.cancelButton) this.cancelButton.disabled = false;
      });
      return;
    }

    this.setStatus('');
    this.cancelConfirm.hidden = false;
    if (this.cancelConfirmAction) {
      this.cancelConfirmAction.disabled = false;
      this.cancelConfirmAction.textContent = 'Cancelar renovação';
    }
    window.setTimeout(() => this.cancelConfirmAction?.focus(), 50);
  },
  closeCancelConfirm() {
    if (this.cancelConfirm) this.cancelConfirm.hidden = true;
    if (this.cancelConfirmAction) {
      this.cancelConfirmAction.disabled = false;
      this.cancelConfirmAction.textContent = 'Cancelar renovação';
    }
  },
  renderManage(data) {
    this.currentManageData = data || null;
    const subscription = data?.subscription || null;
    const plan = data?.plan || null;
    const accessDate = this.formatDateTime(subscription?.currentPeriodEnd);
    const statusLabel = this.getSubscriptionLabel(subscription);

    if (this.manageStatus) this.manageStatus.textContent = statusLabel;

    if (this.manageAccess) {
      if (subscription?.cancelAtPeriodEnd && accessDate) {
        this.manageAccess.textContent = `Ativo até ${accessDate}`;
      } else if (plan?.hasProtect && accessDate) {
        this.manageAccess.textContent = `Ativo, próxima renovação em ${accessDate}`;
      } else if (plan?.hasProtect) {
        this.manageAccess.textContent = 'Ativo';
      } else {
        this.manageAccess.textContent = 'Sem assinatura ativa';
      }
    }

    if (this.manageSummary) {
      if (!subscription?.providerSubscriptionId) {
        this.manageSummary.textContent = 'Nenhuma assinatura Mercado Pago ativa foi encontrada nesta conta.';
      } else if (subscription.cancelAtPeriodEnd) {
        this.manageSummary.textContent = accessDate
          ? `A renovação já foi cancelada. Seu Protect continua ativo até ${accessDate}.`
          : 'A renovação já foi cancelada.';
      } else {
        this.manageSummary.textContent = 'Você pode cancelar a renovação mensal. O acesso continua até o fim do período já pago.';
      }
    }

    if (this.cancelButton) {
      const canCancel = Boolean(
        subscription?.providerSubscriptionId &&
        !subscription?.cancelAtPeriodEnd &&
        String(subscription?.status || '').toLowerCase() === 'authorized'
      );
      this.cancelButton.disabled = !canCancel;
      this.cancelButton.textContent = subscription?.cancelAtPeriodEnd
        ? 'Renovação já cancelada'
        : 'Cancelar renovação';
    }

    this.updateCancelConfirmCopy(subscription);
  },
  async showManage(token, copy = {}) {
    this.intent = 'manage';
    this.setAuthTabsVisible(false);
    this.setModalCopy(
      copy.title || 'Gerenciar assinatura',
      copy.intro || 'Entre com a conta usada na assinatura para consultar ou cancelar a renovação.'
    );
    this.activateTab('manage');
    this.setStatus('Carregando sua assinatura...');
    const data = await this.get('/billing/me', token);
    this.renderManage(data);
    this.setStatus(copy.status || '', copy.status ? 'muted' : 'muted');
  },
  async openManage() {
    this.intent = 'manage';
    this.open();
    this.setAuthTabsVisible(false);
    this.setLoginSubmitLabel('Entrar para gerenciar');
    this.setModalCopy(
      'Gerenciar assinatura',
      'Entre com a conta usada na assinatura para consultar ou cancelar a renovação.'
    );

    const savedToken = window.localStorage.getItem('moonline_site_token');
    if (!savedToken) {
      this.activateTab('login');
      this.setStatus('Entre para gerenciar sua assinatura.', 'muted');
      return;
    }

    try {
      await this.showManage(savedToken);
    } catch (error) {
      window.localStorage.removeItem('moonline_site_token');
      this.setAuthTabsVisible(false);
      this.setLoginSubmitLabel('Entrar para gerenciar');
      this.activateTab('login');
      this.setStatus(error?.message || 'Entre novamente para gerenciar sua assinatura.', 'error');
    }
  },
  async cancelSubscription() {
    const token = window.localStorage.getItem('moonline_site_token');
    if (!token) {
      this.setAuthTabsVisible(false);
      this.setLoginSubmitLabel('Entrar para gerenciar');
      this.activateTab('login');
      throw new Error('Entre novamente para cancelar a renovação.');
    }

    if (this.cancelButton) this.cancelButton.disabled = true;
    if (this.cancelConfirmAction) {
      this.cancelConfirmAction.disabled = true;
      this.cancelConfirmAction.textContent = 'Cancelando...';
    }
    this.setStatus('Cancelando renovação no Mercado Pago...');
    const data = await this.post('/billing/cancel', {}, token);
    this.renderManage({ subscription: data.subscription, plan: { hasProtect: true } });
    this.closeCancelConfirm();
    this.setStatus('Renovação cancelada. O acesso continua até o fim do período pago.', 'muted');
  },
  logout() {
    window.localStorage.removeItem('moonline_site_token');
    this.currentManageData = null;
    this.closeCancelConfirm();
    this.setAuthTabsVisible(true, { signupVisible: true });
    this.setLoginSubmitLabel(this.intent === 'manage' ? 'Entrar para gerenciar' : 'Ir para o Mercado Pago');
    this.resetModalCopy();
    this.activateTab('login');
    this.setStatus('Você saiu desta conta. Entre com outra conta para continuar.', 'muted');
  },
  async handleLogin(form) {
    const payload = Object.fromEntries(new FormData(form).entries());
    const login = String(payload.login || '').trim();
    this.setStatus('Entrando na sua conta Moon Line...');
    const data = await this.post('/login', {
      login,
      password: payload.password
    });
    if (data?.token) {
      window.localStorage.setItem('moonline_site_token', data.token);
      if (this.intent === 'manage') {
        await this.showManage(data.token);
        return;
      }
      await this.continueToCheckout(data.token, data.user);
      return;
    }
    throw new Error('Login realizado, mas o token não foi retornado.');
  },
  async handleSignup(form) {
    const payload = Object.fromEntries(new FormData(form).entries());
    if (payload.accepted !== 'on') {
      throw new Error('É necessário aceitar os documentos legais para criar a conta.');
    }
    this.setStatus('Criando sua conta Moon Line...');
    const data = await this.post('/signup', {
      full_name: payload.full_name,
      username: payload.username,
      display_name: payload.username,
      birth_date: payload.birth_date,
      cpf: payload.cpf,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      accepted_privacy: true,
      accepted_terms: true
    });
    if (data?.token) {
      window.localStorage.setItem('moonline_site_token', data.token);
      await this.continueToCheckout(data.token, data.user);
      return;
    }
    throw new Error('Conta criada, mas o token não foi retornado.');
  },
  async handleProfile(form) {
    const token = window.localStorage.getItem('moonline_site_token');
    if (!token) {
      this.setAuthTabsVisible(false);
      this.setLoginSubmitLabel('Entrar novamente');
      this.activateTab('login');
      throw new Error('Entre novamente para completar seu perfil.');
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    this.setStatus('Atualizando seu perfil...');
    const data = await this.patch('/me/profile', {
      full_name: payload.full_name,
      username: payload.username,
      display_name: payload.username,
      birth_date: payload.birth_date,
      cpf: payload.cpf,
      email: payload.email,
      phone: payload.phone
    }, token);

    await this.continueToCheckout(token, data.user);
  },
  async handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;

    try {
      if (form.dataset.billingForm === 'login') {
        await this.handleLogin(form);
      } else if (form.dataset.billingForm === 'signup') {
        await this.handleSignup(form);
      } else {
        await this.handleProfile(form);
      }
    } catch (error) {
      this.setStatus(error?.message || 'Não foi possível iniciar o checkout agora.', 'error');
      submit.disabled = false;
    }
  },
  applyInputMasks() {
    this.forms.forEach((form) => {
      form.querySelectorAll('[name="cpf"]').forEach((input) => {
        input.addEventListener('input', () => {
          input.value = this.formatCpfInput(input.value);
        });
      });
      form.querySelectorAll('[name="birth_date"]').forEach((input) => {
        input.addEventListener('input', () => {
          input.value = this.formatBirthDateInput(input.value);
        });
      });
    });
  },
  init() {
    this.applyInputMasks();

    this.openButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.intent = 'checkout';
        this.setAuthTabsVisible(true, { signupVisible: true });
        this.setLoginSubmitLabel('Ir para o Mercado Pago');
        this.resetModalCopy();
        const savedToken = window.localStorage.getItem('moonline_site_token');
        if (savedToken) {
          this.startCheckout(savedToken).catch((error) => {
            this.open();
            if (error?.code === 'profile_required') {
              this.showProfileForm();
              return;
            }
            if (error?.code === 'subscription_already_active') {
              this.showAlreadyActive(savedToken, error?.data?.subscription || null);
              return;
            }
            window.localStorage.removeItem('moonline_site_token');
            this.setStatus(error?.message || 'Entre novamente para continuar.', 'error');
          });
          return;
        }
        this.open();
      });
    });

    this.manageButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.openManage();
      });
    });

    this.cancelButton?.addEventListener('click', () => {
      this.openCancelConfirm();
    });

    this.logoutButton?.addEventListener('click', () => {
      this.logout();
    });

    this.cancelConfirmDismissButtons.forEach((button) => {
      button.addEventListener('click', () => this.closeCancelConfirm());
    });

    this.cancelConfirmAction?.addEventListener('click', () => {
      this.cancelSubscription().catch((error) => {
        this.setStatus(error?.message || 'Não foi possível cancelar a renovação agora.', 'error');
        this.cancelButton.disabled = false;
        if (this.cancelConfirmAction) {
          this.cancelConfirmAction.disabled = false;
          this.cancelConfirmAction.textContent = 'Cancelar renovação';
        }
      });
    });

    this.closeButtons.forEach((button) => {
      button.addEventListener('click', () => this.close());
    });

    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => this.activateTab(tab.dataset.billingTab));
    });

    this.forms.forEach((form) => {
      form.addEventListener('submit', (event) => this.handleSubmit(event));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !this.modal || this.modal.hidden) return;
      if (this.cancelConfirm && !this.cancelConfirm.hidden) {
        this.closeCancelConfirm();
        return;
      }
      this.close();
    });
  }
};

const CollarInterest = {
  button: document.querySelector('[data-collar-interest]'),
  message: document.querySelector('[data-collar-message]'),
  init() {
    this.button?.addEventListener('click', () => {
      if (!this.message) return;
      this.message.hidden = false;
      this.message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
};

const CheckoutReturnNotice = {
  shell: document.querySelector('[data-checkout-return]'),
  title: document.querySelector('[data-checkout-return-title]'),
  message: document.querySelector('[data-checkout-return-message]'),
  closeButton: document.querySelector('[data-checkout-return-close]'),
  paramsToClean: [
    'status',
    'collection_status',
    'payment_id',
    'preapproval_id',
    'merchant_order_id',
    'preference_id',
    'external_reference'
  ],
  hasReturnParams(params) {
    return this.paramsToClean.some((key) => params.has(key));
  },
  getHashParams() {
    const hash = window.location.hash || '';
    const queryIndex = hash.indexOf('?');
    const ampIndex = hash.indexOf('&');

    let hashQuery = '';
    if (queryIndex >= 0) {
      hashQuery = hash.slice(queryIndex + 1);
    } else if (ampIndex >= 0) {
      hashQuery = hash.slice(ampIndex + 1);
    }

    return new URLSearchParams(hashQuery);
  },
  getReturnParams() {
    const params = new URLSearchParams(window.location.search);
    const hashParams = this.getHashParams();
    hashParams.forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value);
      }
    });
    return params;
  },
  render(title, message) {
    if (!this.shell) return;
    if (this.title) this.title.textContent = title;
    if (this.message) this.message.textContent = message;
    this.shell.hidden = false;
    document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  cleanUrl() {
    try {
      const url = new URL(window.location.href);
      this.paramsToClean.forEach((key) => url.searchParams.delete(key));
      const search = url.searchParams.toString();
      const rawHash = url.hash || '#planos';
      const hashCutPoints = [rawHash.indexOf('?'), rawHash.indexOf('&')]
        .filter((index) => index >= 0);
      const cleanHash = hashCutPoints.length
        ? rawHash.slice(0, Math.min(...hashCutPoints))
        : rawHash;
      const nextUrl = `${url.pathname}${search ? `?${search}` : ''}${cleanHash || '#planos'}`;
      window.history.replaceState({}, '', nextUrl);
    } catch {}
  },
  init() {
    const params = this.getReturnParams();
    if (!this.hasReturnParams(params)) return;

    const status = String(params.get('status') || params.get('collection_status') || '').toLowerCase();
    if (status === 'approved' || status === 'authorized') {
      this.render(
        'Pagamento aprovado',
        'Recebemos o retorno do Mercado Pago. A assinatura Protect deve aparecer no app assim que a confirmação final atualizar sua conta.'
      );
    } else if (status === 'pending' || status === 'in_process') {
      this.render(
        'Pagamento em análise',
        'O Mercado Pago ainda está processando a assinatura. Assim que a confirmação chegar, o Protect será liberado automaticamente.'
      );
    } else if (status === 'rejected' || status === 'failure' || status === 'cancelled') {
      this.render(
        'Pagamento não confirmado',
        'Não conseguimos confirmar a assinatura. Você pode tentar novamente ou usar outro meio de pagamento no Mercado Pago.'
      );
    } else {
      this.render(
        'Assinatura em processamento',
        'Estamos confirmando o retorno do Mercado Pago. Se o pagamento foi aprovado, o app deve refletir o Protect assim que sua conta for atualizada.'
      );
    }

    this.closeButton?.addEventListener('click', () => {
      if (this.shell) this.shell.hidden = true;
      this.cleanUrl();
    });
  }
};

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
  BillingCheckout.init();
  CollarInterest.init();
  CheckoutReturnNotice.init();
});
