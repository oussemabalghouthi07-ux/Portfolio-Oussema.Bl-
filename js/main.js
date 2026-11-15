/* ==========================================================================
   main.js | Portfolio d'Oussema Balghouthi

   Sommaire
    1. CONFIGURATION  (c'est ici que vous remplacez les liens manquants)
    2. Outils communs
    3. Apparition au défilement, skills animés
    4. En-tête : progression, navigation active, menu mobile
    5. Hero : machine à écrire, portrait 3D, étiquettes flottantes
    6. Cartes qui s'inclinent
    7. Liens des projets, du badge et du CV
    8. Certificat : agrandissement
    9. Contact : copie de l'e-mail et formulaire
   10. Sélecteur de couleurs
   11. Son d'ambiance
   ========================================================================== */
'use strict';

/* 1. CONFIGURATION --------------------------------------------------------
   Laissez '' tant qu'un lien n'existe pas : le bouton reste grisé avec
   la mention « bientôt ». Dès qu'une adresse https:// est renseignée,
   le bouton devient actif et s'ouvre dans un nouvel onglet. */
const SITE_CONFIG = {
  email: 'oussemabalghouthi07@gmail.com',
  cvFileName: 'Oussema-Balghouthi-CV.pdf',

  projects: {
    'gym-powerfit': { demo: '', code: '' },   // ex. demo: 'https://...', code: 'https://github.com/...'
    'smart-prix':   { demo: '', code: '' },
  },

  certificate: { badge: 'https://www.credly.com/badges/55b46f80-7c06-4ab8-9df2-19bf04b40928' },                 // lien public du badge, si vous en avez un

  // Service d'envoi du formulaire (par exemple l'adresse fournie par Formspree).
  // Vide : le formulaire prépare un e-mail dans la messagerie du visiteur.
  formEndpoint: 'https://formsubmit.co/ajax/oussemabalghouthi07@gmail.com', // service gratuit FormSubmit ; vider ('') pour revenir au mode mailto
};

/* 2. OUTILS COMMUNS ------------------------------------------------------- */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasObserver = 'IntersectionObserver' in window;
const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch (err) {
    return false;
  }
};

/* 3. APPARITION AU DÉFILEMENT, SKILLS ANIMÉS ------------------------------ */
/** Décale l'apparition des enfants d'un conteneur [data-stagger]. */
function initStagger() {
  $$('[data-stagger]').forEach((box) => {
    $$('.reveal', box).forEach((el, i) => el.style.setProperty('--d', `${(i % 4) * 90}ms`));
  });
}

/** Lit data-level de chaque carte skill : largeur de la barre et pourcentage. */
function initSkillCards() {
  $$('.skill-card').forEach((card) => {
    const level = parseInt(card.dataset.level, 10) || 0;
    card.style.setProperty('--lv', `${level}%`);
    $('.pct', card).textContent = `${level}%`;
  });
}

/** Fait monter le pourcentage de 0 à sa valeur quand la carte apparaît. */
function countUp(card) {
  const pct = $('.pct', card);
  if (!pct || pct.dataset.done) return;
  pct.dataset.done = '1';
  const target = parseInt(card.dataset.level, 10) || 0;
  if (reduceMotion) return;
  const duration = 1300;
  let start = null;
  const tick = (now) => {
    if (start === null) start = now;
    const k = Math.min(1, (now - start) / duration);
    pct.textContent = `${Math.round(target * (1 - Math.pow(1 - k, 3)))}%`;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initReveal() {
  const items = $$('.reveal');
  const show = (el) => {
    el.classList.add('in');
    if (el.classList.contains('skill-card')) countUp(el);
  };
  if (reduceMotion || !hasObserver) {
    items.forEach(show);
    return;
  }
  let shown = 0;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      show(entry.target);
      shown += 1;
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  items.forEach((el) => observer.observe(el));
  // Filet de sécurité : si l'observateur ne réagit pas, tout devient visible
  setTimeout(() => { if (shown === 0) items.forEach(show); }, 2000);
}

/* 4. EN-TÊTE -------------------------------------------------------------- */
function initHeader() {
  const header = $('.site-header');
  const bar = $('#progress');
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 8);
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Lien actif selon la section visible
  const links = new Map($$('.nav a').map((a) => [a.getAttribute('href').slice(1), a]));
  if (hasObserver) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a, id) => a.classList.toggle('active', id === entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((a, id) => { const section = document.getElementById(id); if (section) spy.observe(section); });
  }

  // Pastille qui glisse sous le lien survolé, puis revient sur le lien de la section en cours
  const nav0 = $('#site-nav');
  const pill = $('.nav-pill', nav0);
  if (pill) {
    const plain = $$('a:not(.nav-cta)', nav0);
    const moveTo = (a) => {
      if (!a || window.innerWidth < 900) { pill.classList.remove('show'); return; }
      pill.style.setProperty('--x', `${a.offsetLeft}px`);
      pill.style.setProperty('--w', `${a.offsetWidth}px`);
      pill.classList.add('show');
    };
    const rest = () => moveTo(plain.find((a) => a.classList.contains('active')));
    plain.forEach((a) => {
      a.addEventListener('pointerenter', () => moveTo(a));
      a.addEventListener('focus', () => moveTo(a));
    });
    nav0.addEventListener('pointerleave', rest);
    nav0.addEventListener('focusout', rest);
    // Quand la section active change (et que la souris n'est pas sur le menu), la pastille suit
    new MutationObserver((records) => {
      if (records.some((r) => r.target !== pill) && !nav0.matches(':hover')) rest();
    }).observe(nav0, { attributes: true, subtree: true, attributeFilter: ['class'] });
    window.addEventListener('resize', rest);
  }

  // Menu déroulant sur téléphone et tablette
  const button = $('#menu-btn');
  const nav = $('#site-nav');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  button.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => { if (!header.contains(e.target)) setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 900) setMenu(false); });
}

/* 5. HERO ----------------------------------------------------------------- */
/** Le mot en couleur change tout seul sous le nom. */
function initTypewriter() {
  const target = $('#typed');
  if (!target || reduceMotion) return;
  const words = ['Développement web', 'Python et C', 'Linux', 'Cybersécurité'];
  let wordIndex = 0;
  let length = words[0].length;
  let deleting = true;
  const step = () => {
    if (deleting) {
      length -= 1;
      target.textContent = words[wordIndex].slice(0, length);
      if (length <= 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(step, 260);
        return;
      }
      setTimeout(step, 38);
    } else {
      length += 1;
      target.textContent = words[wordIndex].slice(0, length);
      if (length >= words[wordIndex].length) {
        deleting = true;
        setTimeout(step, 1700);
        return;
      }
      setTimeout(step, 70);
    }
  };
  setTimeout(step, 2200);
}

/** Portrait en 3D : suit le pointeur, se balance doucement sinon. */
function initPortrait3D() {
  const stage = $('#stage');
  const card = $('#card3d');
  if (!stage || !card || reduceMotion) return;
  let targetX = 0, targetY = 0, x = 0, y = 0;
  let hover = false, visible = true, frame = 0;
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    targetX = (e.clientX - r.left) / r.width - 0.5;
    targetY = (e.clientY - r.top) / r.height - 0.5;
    hover = true;
  });
  stage.addEventListener('pointerleave', () => { hover = false; });
  const tick = (t) => {
    if (!visible) { frame = 0; return; }
    const goalX = hover ? targetX : Math.sin(t / 1700) * 0.32;
    const goalY = hover ? targetY : Math.cos(t / 2100) * 0.2;
    x += (goalX - x) * 0.08;
    y += (goalY - y) * 0.08;
    card.style.transform = `rotateY(${(x * 18).toFixed(2)}deg) rotateX(${(-y * 14).toFixed(2)}deg)`;
    frame = requestAnimationFrame(tick);
  };
  if (hasObserver) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(tick);
    }).observe(stage);
  }
  frame = requestAnimationFrame(tick);
}

/** Les trois étiquettes autour du portrait changent de mot à tour de rôle. */
function initFloatingTags() {
  const tags = $$('.tag .w');
  if (!tags.length || reduceMotion) return;
  const pool = ['html', 'css', 'php', 'python', 'c', 'linux', '</>'];
  const shown = tags.map((el) => el.textContent);
  let next = 0;
  let turn = 0;
  setInterval(() => {
    if (document.hidden) return;
    const i = turn % tags.length;
    turn += 1;
    let word;
    let guard = 0;
    do { word = pool[next % pool.length]; next += 1; guard += 1; } while (shown.includes(word) && guard < 20);
    const el = tags[i];
    el.classList.add('out');
    setTimeout(() => { el.textContent = word; shown[i] = word; el.classList.remove('out'); }, 270);
  }, 1500);
}

/* 6. CARTES QUI S'INCLINENT ---------------------------------------------- */
function initTilt() {
  if (reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
  $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

/* 7. LIENS DES PROJETS, DU BADGE ET DU CV --------------------------------- */
/** Un bouton [data-config="projects.gym-powerfit.demo"] lit son lien dans SITE_CONFIG. */
function initConfigLinks() {
  $$('[data-config]').forEach((link) => {
    const url = link.dataset.config.split('.').reduce((obj, key) => (obj ? obj[key] : undefined), SITE_CONFIG);
    if (isHttpUrl(url)) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.classList.remove('is-pending');
      link.removeAttribute('aria-disabled');
      link.removeAttribute('title');
      const soon = $('.soon', link);
      if (soon) soon.remove();
    } else {
      link.setAttribute('aria-disabled', 'true');
      link.title = 'Lien à ajouter dans js/main.js (SITE_CONFIG)';
      link.addEventListener('click', (e) => e.preventDefault());
    }
  });
}

/** Si une capture d'écran de projet est introuvable, on garde le visuel de remplacement. */
function initProjectImages() {
  $$('.shot img').forEach((img) => {
    const drop = () => img.remove();
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop, { once: true });
  });
}

/** Téléchargement direct du CV sur le site publié.
    Dans un aperçu intégré (iframe) le téléchargement est bloqué : le PDF s'ouvre alors dans un nouvel onglet. */
function initCvLinks() {
  if (window.self !== window.top) return;
  $$('[data-cv]').forEach((a) => a.setAttribute('download', SITE_CONFIG.cvFileName));
}

/* 8. CERTIFICAT : AGRANDISSEMENT ------------------------------------------ */
function initCertificate() {
  const box = $('#lightbox');
  const image = $('#lb-img');
  const close = $('#lb-close');
  const triggers = $$('[data-open-cert]');
  const thumb = $('#cert-open img');
  if (!box || !image || !close || !thumb || !triggers.length) return;
  let opener = null;
  const open = (from) => {
    opener = from;
    image.src = thumb.src;
    image.alt = thumb.alt;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('open')));
    close.focus();
  };
  const shut = () => {
    box.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { box.hidden = true; }, reduceMotion ? 0 : 260);
    if (opener) opener.focus();
  };
  triggers.forEach((t) => t.addEventListener('click', () => open(t)));
  close.addEventListener('click', shut);
  box.addEventListener('click', (e) => { if (e.target === box) shut(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) shut(); });
}

/* 9. CONTACT -------------------------------------------------------------- */
function initCopyEmail() {
  const button = $('#copy-email');
  const address = $('#email-text');
  const status = $('#copy-status');
  if (!button || !address || !status) return;
  const selectText = () => {
    try {
      const range = document.createRange();
      range.selectNodeContents(address);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Adresse sélectionnée. Copiez-la avec Ctrl+C.';
    } catch (err) {
      status.textContent = 'Sélectionnez l’adresse pour la copier.';
    }
  };
  button.addEventListener('click', () => {
    const text = address.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => { status.textContent = 'Adresse copiée.'; }, selectText);
    } else {
      selectText();
    }
  });
}

/** Formulaire : validation des champs, puis envoi réel ou préparation d'un e-mail.
    Sans service d'envoi configuré, le site n'envoie rien et le dit clairement. */
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;
  const status = $('#form-status');
  const note = $('#form-note');
  const submit = $('#form-submit');
  const endpoint = SITE_CONFIG.formEndpoint;

  note.textContent = endpoint
    ? 'Votre message est transmis au service d’envoi configuré sur ce site.'
    : 'Ce formulaire prépare un e-mail dans votre messagerie. Rien n’est envoyé automatiquement depuis ce site.';
  submit.textContent = endpoint ? 'Envoyer le message' : 'Préparer mon e-mail';

  const rules = {
    name: (v) => v.trim().length >= 2 || 'Entrez votre nom (2 caractères minimum).',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Entrez une adresse e-mail valide.',
    subject: (v) => v.trim().length >= 3 || 'Entrez un sujet (3 caractères minimum).',
    message: (v) => v.trim().length >= 10 || 'Votre message doit contenir au moins 10 caractères.',
  };
  const fields = $$('input, textarea', form);
  const validate = (field) => {
    const result = rules[field.name](field.value);
    const ok = result === true;
    field.setAttribute('aria-invalid', String(!ok));
    $(`#${field.id}-err`).textContent = ok ? '' : result;
    return ok;
  };
  const setStatus = (state, text) => {
    status.dataset.state = state;
    status.textContent = text;
  };

  fields.forEach((field) => {
    field.addEventListener('blur', () => validate(field));
    field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validate(field); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const results = fields.map(validate);
    const firstInvalid = fields[results.indexOf(false)];
    if (firstInvalid) {
      firstInvalid.focus();
      setStatus('error', 'Vérifiez les champs signalés en rouge.');
      return;
    }
    const data = Object.fromEntries(fields.map((f) => [f.name, f.value.trim()]));

    if (endpoint) {
      setStatus('info', 'Envoi en cours…');
      try {
        const payload = new FormData(form);
        payload.append('_subject', `Portfolio : ${data.subject}`);
        payload.append('_template', 'table');
        const response = await fetch(endpoint, { method: 'POST', body: payload, headers: { Accept: 'application/json' } });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success === false || result.success === 'false') throw new Error(result.message || 'bad status');
        setStatus('ok', 'Message envoyé. Merci !');
        form.reset();
      } catch (err) {
        setStatus('error', `L’envoi a échoué. Écrivez-moi directement à ${SITE_CONFIG.email}.`);
      }
      return;
    }

    const subject = data.subject.replace(/[\r\n]+/g, ' ');
    const body = `Nom : ${data.name}\nE-mail : ${data.email}\n\n${data.message}`;
    setStatus('info', `Votre e-mail est prêt mais il n’est pas encore envoyé. Si votre messagerie ne s’ouvre pas, écrivez à ${SITE_CONFIG.email}.`);
    window.location.href = `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

/* 11. SON D'AMBIANCE -------------------------------------------------------
   Son calme généré par le navigateur (aucun fichier audio).
   Les navigateurs interdisent le son avant un premier toucher ou clic :
   il démarre donc au premier geste du visiteur, doucement. */
function initSound() {
  const button = $('#sound-toggle');
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!button || !AudioCtx) return;

  const VOLUME = 0.5;
  let ctx = null, master = null, bus = null;
  let started = false, muted = false;

  const refreshButton = () => {
    const on = started && !muted;
    button.classList.toggle('on', on);
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', on ? 'Couper le son' : 'Activer le son');
  };

  const build = () => {
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0;
    bus = ctx.createGain();

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1400;
    lowpass.Q.value = 0.4;

    // Petite réverbération faite de bruit qui s'éteint
    const length = Math.floor(ctx.sampleRate * 3.2);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c += 1) {
      const data = impulse.getChannelData(c);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.6);
    }
    const reverb = ctx.createConvolver();
    reverb.buffer = impulse;
    const wet = ctx.createGain(); wet.gain.value = 0.45;
    const dry = ctx.createGain(); dry.gain.value = 0.7;

    bus.connect(lowpass);
    lowpass.connect(dry);
    lowpass.connect(reverb);
    reverb.connect(wet);
    dry.connect(master);
    wet.connect(master);
    master.connect(ctx.destination);

    // Le filtre s'ouvre et se ferme très lentement
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 500;
    lfo.connect(lfoDepth);
    lfoDepth.connect(lowpass.frequency);
    lfo.start();

    // Nappe douce : accord de neuvième majeure, chaque note doublée et légèrement désaccordée
    [130.81, 196.0, 261.63, 329.63, 493.88].forEach((freq, n) => {
      [-4, 4].forEach((cents) => {
        const osc = ctx.createOscillator();
        osc.type = n === 0 ? 'triangle' : 'sine';
        osc.frequency.value = freq;
        osc.detune.value = cents;
        const gain = ctx.createGain();
        gain.gain.value = 0.03;
        const swell = ctx.createOscillator();
        swell.frequency.value = 0.05 + n * 0.017;
        const swellDepth = ctx.createGain();
        swellDepth.gain.value = 0.02;
        swell.connect(swellDepth);
        swellDepth.connect(gain.gain);
        swell.start();
        osc.connect(gain);
        gain.connect(bus);
        osc.start();
      });
    });
  };

  // Notes de cloche douces, espacées de 3 à 6 secondes
  const pluck = () => {
    if (!ctx || ctx.state !== 'running' || muted) return;
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = scale[Math.floor(Math.random() * scale.length)];
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.07, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(t);
    osc.stop(t + 3.4);
  };
  const schedulePluck = () => setTimeout(() => { pluck(); schedulePluck(); }, 2800 + Math.random() * 3200);

  const gestures = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'];
  const onGesture = (e) => { if (!button.contains(e.target)) start(); };
  const stopListening = () => gestures.forEach((name) => document.removeEventListener(name, onGesture, true));

  function start() {
    if (started) return;
    try {
      if (!ctx) build();
      const finish = () => {
        if (started || ctx.state !== 'running') return;
        started = true;
        const t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(0, t);
        master.gain.linearRampToValueAtTime(VOLUME, t + 5);   // montée en 5 secondes
        schedulePluck();
        refreshButton();
        stopListening();
      };
      const result = ctx.resume();
      if (result && result.then) result.then(finish, () => {}); else finish();
    } catch (err) { /* son indisponible : le site fonctionne sans */ }
  }

  gestures.forEach((name) => document.addEventListener(name, onGesture, true));

  button.addEventListener('click', () => {
    if (!started) { start(); return; }
    muted = !muted;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(muted ? 0 : VOLUME, t + 0.8);
    refreshButton();
  });

  document.addEventListener('visibilitychange', () => {
    if (!ctx || !started) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });
  refreshButton();
}

/* DÉMARRAGE --------------------------------------------------------------- */
/* 11. ÉTOILES FILANTES (fond de toute la page) ---------------------------- */
/** Quelques étoiles filantes traversent le fond de la fenêtre en diagonale, même quand on
    descend dans la page (canvas fixe derrière le contenu). Couleur = accent du thème. */
function initMeteors() {
  if (reduceMotion) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'meteors';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, meteors = [], nextAt = 0, running = false, visible = true, raf = 0;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = () => {
    const speed = 5 + Math.random() * 4;                 // px par frame
    const angle = (Math.PI * 0.78) + Math.random() * 0.12; // vers le bas-gauche
    meteors.push({
      x: w * (0.3 + Math.random() * 0.8), y: -20 + Math.random() * h * 0.3,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      len: 90 + Math.random() * 90, life: 0, max: 90 + Math.random() * 40,
    });
  };
  const frame = (t) => {
    raf = 0;
    if (!running || !visible) return;
    ctx.clearRect(0, 0, w, h);
    if (t > nextAt && meteors.length < 3) { spawn(); nextAt = t + 1600 + Math.random() * 2600; }
    const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#a48bff';
    meteors = meteors.filter((m) => m.life < m.max);
    meteors.forEach((m) => {
      m.x += m.vx; m.y += m.vy; m.life++;
      const fade = Math.sin(Math.PI * (m.life / m.max));   // apparaît puis disparaît
      const k = Math.hypot(m.vx, m.vy);
      const tx = m.x - (m.vx / k) * m.len, ty = m.y - (m.vy / k) * m.len;
      const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, color); g.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.85 * fade;
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(m.x, m.y, 2.2, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };
  const update = () => {
    running = !document.hidden && visible;
    if (running && !raf) raf = requestAnimationFrame(frame);
  };
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', update);
  update();
}

/* 12. ÉCRAN D'ACCUEIL ("Get in") + ANIMATION DE CONSTRUCTION ------------- */
/** Au clic sur "Get in" : une fenêtre de "démarrage" affiche quelques lignes, puis une grille de
    blocs se dissout en vague et le site se construit derrière. Le clic sert aussi de premier
    geste pour démarrer le son. Avec "réduire les animations" : simple fondu. */
const BOOT_LINES = [
  '> initialisation du portfolio…',
  '> chargement des compétences… OK',
  '> compilation des projets… OK',
  '> mise en place du design… OK',
  '> prêt.',
];
function initWelcome() {
  const overlay = $('#welcome');
  const btn = $('#welcome-enter');
  if (!overlay || !btn) return;
  const root = document.documentElement;
  const body = document.body;
  body.classList.add('welcome-open');
  root.classList.add('welcome-open');
  setTimeout(() => btn.focus({ preventScroll: true }), 400);

  let stage = 0; // 0 = accueil, 1 = démarrage, 2 = construction, 3 = terminé
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  const finish = () => {
    stage = 3;
    timers.forEach(clearTimeout);
    document.removeEventListener('keydown', onKey);
    overlay.hidden = true;
    body.classList.remove('welcome-open');
    root.classList.remove('welcome-open');
  };

  // Étape 2 : grille de blocs qui se dissout en diagonale
  const build = () => {
    if (stage >= 2) return;
    stage = 2;
    const size = window.innerWidth < 700 ? 64 : 90;
    const cols = Math.ceil(window.innerWidth / size);
    const rows = Math.ceil(window.innerHeight / size);
    const tiles = document.createElement('div');
    tiles.className = 'tiles';
    tiles.setAttribute('aria-hidden', 'true');
    tiles.style.setProperty('--cols', cols);
    tiles.style.setProperty('--rows', rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = document.createElement('i');
        t.style.setProperty('--d', c + r);
        t.style.setProperty('--m', Math.random() < 0.18 ? 0.16 : 0);
        tiles.appendChild(t);
      }
    }
    overlay.appendChild(tiles);
    overlay.classList.add('is-building');
    root.classList.remove('welcome-open'); // le hero commence à se construire
    body.classList.remove('welcome-open');
    requestAnimationFrame(() => requestAnimationFrame(() => tiles.classList.add('go')));
    later(finish, (cols + rows) * 45 + 900);
  };

  // Étape 1 : fenêtre de démarrage
  const boot = () => {
    stage = 1;
    overlay.classList.add('is-booting');
    const box = document.createElement('div');
    box.className = 'boot';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<div class="boot-bar"><i></i><i></i><i></i></div><div class="boot-lines"></div><div class="boot-progress"><span></span></div>';
    overlay.appendChild(box);
    const lines = $('.boot-lines', box);
    BOOT_LINES.forEach((text, i) => later(() => {
      const p = document.createElement('p');
      p.textContent = text;
      if (i === BOOT_LINES.length - 1) p.className = 'done';
      lines.appendChild(p);
    }, 150 + i * 280));
    requestAnimationFrame(() => requestAnimationFrame(() => $('.boot-progress span', box).style.width = '100%'));
    later(build, 150 + BOOT_LINES.length * 280 + 350);
  };

  const enter = () => {
    if (stage !== 0) return;
    if (reduceMotion) {
      overlay.classList.add('is-leaving');
      root.classList.remove('welcome-open');
      body.classList.remove('welcome-open');
      later(finish, 800);
      return;
    }
    boot();
  };
  // Échap : entrer, ou passer directement à la construction
  const onKey = (e) => {
    if (e.key !== 'Escape') return;
    if (stage === 0) enter();
    else if (stage === 1) { timers.forEach(clearTimeout); build(); }
  };
  btn.addEventListener('click', enter);
  document.addEventListener('keydown', onKey);
}

/* 13. NOM INTERACTIF ------------------------------------------------------- */
/** Les lettres du nom (titre du hero) réagissent à la position du curseur / du doigt. */
function initNameHover() {
  const h1 = $('.hero h1');
  if (!h1 || reduceMotion) return;
  const text = h1.textContent.trim();
  h1.setAttribute('aria-label', text);
  h1.textContent = '';
  const chars = [];
  text.split(' ').forEach((wordText, i, words) => {
    const word = document.createElement('span');
    word.className = 'word';
    word.setAttribute('aria-hidden', 'true');
    [...wordText].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      word.appendChild(span);
      chars.push(span);
    });
    h1.appendChild(word);
    if (i < words.length - 1) h1.appendChild(document.createTextNode(' '));
  });
  const RADIUS = 120;
  const reset = () => chars.forEach((c) => c.style.setProperty('--s', 0));
  const move = (e) => {
    chars.forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      c.style.setProperty('--s', Math.max(0, 1 - d / RADIUS).toFixed(3));
    });
  };
  h1.addEventListener('pointermove', move);
  h1.addEventListener('pointerleave', reset);
  h1.addEventListener('pointerup', () => setTimeout(reset, 350));
}

/* 14. FOND 3D DE TOUTE LA PAGE ---------------------------------------------- */
/** Un nuage de points reliés en 3D (graphe / réseau) qui tourne lentement derrière toutes les
    sections. Le curseur l'incline, le défilement le fait pivoter, et les points proches
    paraissent plus gros et plus nets (perspective). Couleur = accent du thème.
    Statique si "réduire les animations". */
function initCodeRain() {
  const canvas = document.createElement('canvas');
  canvas.className = 'netbg';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, R = 0, pts = [], raf = 0, spin = 0;
  const mouse = { x: -999, y: -999, nx: 0, ny: 0 };
  let tiltX = 0, tiltY = 0;
  const rand = (a, b) => a + Math.random() * (b - a);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.max(w, h) * 0.62;
    const count = Math.min(80, Math.round((w * h) / 15000));
    pts = Array.from({ length: count }, () => ({ x: rand(-1, 1), y: rand(-1, 1), z: rand(-1, 1), r: rand(1.6, 3) }));
  };
  const draw = () => {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#a48bff';
    const scroll = window.scrollY || 0;
    const ay = spin + scroll * 0.0006 + tiltY;      // rotation autour de l'axe vertical
    const ax = 0.28 + tiltX;                         // inclinaison avant/arrière
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    const F = 1.6;                                   // distance de la caméra (perspective)
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1;
    const P = pts.map((p) => {
      const x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;       // tourne autour de Y
      const y2 = p.y * cx - z1 * sx, z2 = p.y * sx + z1 * cx;          // tourne autour de X
      const k = F / (F + z2);                                          // perspective
      return { X: w / 2 + x1 * R * k, Y: h / 2 + y2 * R * k, d: (z2 + 1) / 2, k, r: p.r, x: x1, y: y2, z: z2 };
    });
    for (let a = 0; a < P.length; a++) {
      const A = P[a];
      for (let b = a + 1; b < P.length; b++) {
        const B = P[b];
        const d3 = Math.hypot(A.x - B.x, A.y - B.y, A.z - B.z);
        if (d3 < 0.62) {
          ctx.globalAlpha = 0.3 * (1 - d3 / 0.62) * (1.15 - (A.d + B.d) / 2);   // les liens lointains s'estompent
          ctx.beginPath(); ctx.moveTo(A.X, A.Y); ctx.lineTo(B.X, B.Y); ctx.stroke();
        }
      }
      const dm = Math.hypot(A.X - mouse.x, A.Y - mouse.y);
      if (dm < 190) { ctx.globalAlpha = 0.5 * (1 - dm / 190); ctx.beginPath(); ctx.moveTo(A.X, A.Y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    P.forEach((A) => {                                // les points proches (d faible) sont plus gros et plus nets
      ctx.globalAlpha = 0.25 + 0.55 * (1 - A.d);
      ctx.beginPath(); ctx.arc(A.X, A.Y, A.r * A.k * 1.5, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
  };
  const step = () => {
    raf = 0;
    if (document.hidden) return;
    spin += 0.0016;
    tiltY += (mouse.nx * 0.5 - tiltY) * 0.04;          // suit le curseur en douceur
    tiltX += (mouse.ny * 0.35 - tiltX) * 0.04;
    draw();
    raf = requestAnimationFrame(step);
  };
  const update = () => { if (!reduceMotion && !document.hidden && !raf) raf = requestAnimationFrame(step); };
  resize(); draw();
  window.addEventListener('resize', () => { resize(); draw(); });
  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = e.clientX / w - 0.5; mouse.ny = e.clientY / h - 0.5;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; mouse.nx = mouse.ny = 0; });
  if (reduceMotion) window.addEventListener('scroll', draw, { passive: true });
  document.addEventListener('visibilitychange', update);
  update();
}

/* 14b. OBJETS 3D INFORMATIQUES DES SECTIONS -------------------------------- */
/** Un objet informatique 3D (en CSS, rien n'est téléchargé) par section, posé dans la colonne vide
    sous le titre : ordinateur portable, processeur, fenêtres de navigateur, serveurs, bouclier, enveloppe. */
function initSectionCubes() {
  const el = (cls, parent, text) => {
    const n = document.createElement('span');
    n.className = cls;
    if (text) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  };
  const withVar = (node, name, value) => { node.style.setProperty(name, value); return node; };
  const builders = {
    apropos(box) {                                       // ordinateur portable
      const g = el('sh-in sway', box);
      el('lt-screen', g); el('lt-base', g);
    },
    skills(box) {                                        // processeur
      const g = el('sh-in spin-z cpu', box);
      el('cpu-pins', g);
      [-1, 0, 1].forEach((z) => withVar(el('cpu-die', g, z === 1 ? 'CPU' : ''), '--z', z));
    },
    projets(box) {                                       // 3 fenêtres de navigateur empilées
      const g = el('sh-in sway', box);
      [0, 1, 2].forEach((k) => { const w = withVar(el('win', g), '--k', k); el('win-bar', w); });
    },
    formation(box) {                                     // pile de 3 serveurs
      const g = el('sh-in sway', box);
      [0, 1, 2].forEach((k) => {
        const u = withVar(el('unit', g), '--k', k);
        ['f', 'b', 'r', 'l', 't', 'u'].forEach((side) => el(`uf uf-${side}`, u));
      });
    },
    certifications(box) {                                // bouclier épais avec une coche
      const g = el('sh-in sway', box);
      for (let n = 0; n < 7; n++) withVar(el('shl', g, n === 6 ? '✓' : ''), '--i', n);
    },
    contact(box) {                                       // enveloppe dont le rabat s'ouvre
      const g = el('sh-in sway', box);
      el('env-body', g); el('env-at', g, '@'); el('env-flap', g);
    },
  };
  $$('.section').forEach((section, i) => {
    const build = builders[section.id];
    if (!build) return;
    const box = document.createElement('div');
    box.className = `shape3d shape-${section.id}`;
    box.setAttribute('aria-hidden', 'true');
    box.style.setProperty('--ph', `${-(i * 1.7)}s`);
    build(box);
    section.appendChild(box);
  });
}

/* 15. TITRES DE SECTIONS ANIMÉS ------------------------------------------- */
/** Chaque mot des titres (À propos, Skills, Projets…) monte dans son cadre quand la section
    apparaît, puis le petit trait d'accent se dessine dessous. */
function initSectionTitles() {
  const titles = $$('.section h2');
  if (!titles.length || reduceMotion) return;
  titles.forEach((h2) => {
    const text = h2.textContent.trim();
    h2.setAttribute('aria-label', text);
    h2.classList.add('split');
    h2.textContent = '';
    text.split(' ').forEach((word, i, all) => {
      const outer = document.createElement('span');
      outer.className = 'tw';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.style.setProperty('--w', i);
      inner.textContent = word;
      outer.appendChild(inner);
      h2.appendChild(outer);
      if (i < all.length - 1) h2.appendChild(document.createTextNode(' '));
    });
  });
  if (!hasObserver) { titles.forEach((h2) => h2.classList.add('t-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('t-in'); io.unobserve(e.target); } });
  }, { threshold: 0.6, rootMargin: '0px 0px -8% 0px' });
  titles.forEach((h2) => io.observe(h2));
  setTimeout(() => titles.forEach((h2) => h2.classList.add('t-in')), 6000); // sécurité
}

/* 17. THÈME CLAIR / SOMBRE + APPEL À L'ACTION DU CONTACT ------------------- */
function initThemeToggle() {
  const btn = $('#theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : !!(mq && mq.matches));
  const sync = () => { btn.classList.toggle('is-dark', isDark()); btn.setAttribute('aria-pressed', String(isDark())); };
  btn.addEventListener('click', () => { root.dataset.theme = isDark() ? 'light' : 'dark'; sync(); });
  if (mq && mq.addEventListener) mq.addEventListener('change', sync);
  sync();
}
/** Le bouton "Écrivez-moi" descend vers le formulaire et place le curseur dans le premier champ. */
function initContactCta() {
  const cta = $('[data-focus-form]');
  const field = $('#cf-name');
  if (!cta || !field) return;
  cta.addEventListener('click', (e) => {
    e.preventDefault();
    field.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => field.focus({ preventScroll: true }), reduceMotion ? 0 : 600);
  });
}

function init() {
  initStagger();
  initSkillCards();
  initReveal();
  initHeader();
  initTypewriter();
  initPortrait3D();
  initFloatingTags();
  initTilt();
  initConfigLinks();
  initProjectImages();
  initCvLinks();
  initCertificate();
  initCopyEmail();
  initContactForm();
  initSound();
  initCodeRain();
  initSectionCubes();
  initNameHover();
  initWelcome();
  initThemeToggle();
  initContactCta();
  initSectionTitles();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
