/* R&E·NET core — shared shell, i18n, data layer and UI helpers.
   Every page loads this file first, then its own assets/js/pages/<page>.js.
   Public API lives on window.RN (see README.md). */
(() => {
'use strict';
const RN = window.RN = {};
const $ = RN.$ = (s, r = document) => r.querySelector(s);
const $$ = RN.$$ = (s, r = document) => [...r.querySelectorAll(s)];
RN.RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
RN.NS = 'http://www.w3.org/2000/svg';
RN.C = { cy: '#3ee6ff', vi: '#8f7dff', am: '#ffb547', gr: '#47f0a2', rd: '#ff5d7a', pk: '#ff6ad5', bl: '#5aa8ff', yl: '#ffd36a', gy: '#9fb0d0' };

/* ---------- i18n ---------- */
/* L(bg, en) returns both language variants; CSS shows only the active one. */
RN.L = (bg, en) => `<span lang="bg">${bg}</span><span lang="en">${en}</span>`;
/* T({bg,en}) — same for objects from JSON; 'a|b' strings split into bg|en */
RN.T = o => o == null ? '' : typeof o === 'string' ? (o.includes('|') ? RN.L(...o.split('|')) : o) : RN.L(o.bg, o.en);
RN.nf = (n, dec = 0, lg = 'bg') => {
  const s = Number(n).toFixed(dec); let [i, d] = s.split('.');
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, lg === 'bg' ? ' ' : ',');
  return d ? i + (lg === 'bg' ? ',' : '.') + d : i;
};
RN.NF = (n, dec = 0) => RN.L(RN.nf(n, dec, 'bg'), RN.nf(n, dec, 'en'));
RN.lang = 'bg';
RN.setLang = lg => {
  RN.lang = lg;
  document.documentElement.dataset.lang = lg;
  document.documentElement.lang = lg;
  const t = document.querySelector('meta[name="rn-title"]');
  if (t) document.title = (lg === 'bg' ? t.dataset.bg : t.dataset.en) + ' · R&E·NET';
  $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.set === lg));
  try { localStorage.setItem('renet-lang', lg); } catch (e) {}
  document.dispatchEvent(new CustomEvent('rn:lang', { detail: lg }));
};

/* ---------- theme: dark (default) / light; stored in localStorage, applied early by an inline <head> script ---------- */
RN.theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
RN.setTheme = th => {
  RN.theme = th;
  if (th === 'light') document.documentElement.dataset.theme = 'light'; else delete document.documentElement.dataset.theme;
  try { localStorage.setItem('renet-theme', th); } catch (e) {}
  const b = $('#themeBtn'); if (b) { const t = th === 'light' ? (RN.lang === 'bg' ? 'Тъмен режим' : 'Dark mode') : (RN.lang === 'bg' ? 'Светъл режим' : 'Light mode'); b.title = t; b.setAttribute('aria-label', t); }
  document.dispatchEvent(new CustomEvent('rn:theme', { detail: th }));
};
document.addEventListener('rn:lang', () => RN.setTheme(RN.theme));

/* ---------- site map (single place to add a page) ---------- */
RN.PAGES = [
  { id: 'home', href: 'home.html', bg: 'Начало', en: 'Home', d: { bg: 'Какво са изследователските мрежи и защо са нужни', en: 'What research networks are and why they matter' } },
  { id: 'networks', href: 'networks.html', bg: 'Мрежи по света', en: 'World networks', d: { bg: 'Карта, каталог и профили на регионалните мрежи', en: 'Map, directory and profiles of regional networks' } },
  { id: 'europe', href: 'europe.html', bg: 'GÉANT в цифри', en: 'GÉANT in numbers', d: { bg: '30 000 km опорна мрежа, 800Gb миграция, калкулатор', en: '30,000 km backbone, 800Gb migration, calculator' } },
  { id: 'science', href: 'science.html', bg: 'Мега-наука', en: 'Mega-science', d: { bg: 'LHC, Copernicus, EHT, SKA, e-VLBI, климат', en: 'LHC, Copernicus, EHT, SKA, e-VLBI, climate' } },
  { id: 'services', href: 'services.html', bg: 'GÉANT услуги', en: 'GÉANT services', d: { bg: 'eduroam, eduGAIN, облак, EOSC, квантови мрежи', en: 'eduroam, eduGAIN, cloud, EOSC, quantum networks' } },
  { id: 'history', href: 'history.html', bg: 'История', en: 'History', d: { bg: 'От ARPANET до 800Gb — 60 години в хронология', en: 'From ARPANET to 800Gb — 60 years on a timeline' } },
  { id: 'data', href: 'data.html', bg: 'Данни', en: 'Data', d: { bg: 'Търсими таблици с числа, мрежи и събития', en: 'Searchable tables of figures, networks and events' } },
  { id: 'bulgaria', href: 'bulgaria.html', bg: 'NRN BG', en: 'NRN BG', d: { bg: 'Българската национална изследователска мрежа: карта, история, услуги', en: 'The Bulgarian national research network: map, history, services' } },
  { id: 'sources', href: 'sources.html', bg: 'Източници', en: 'Sources', d: { bg: '75 източника от двата доклада + проверени адреси', en: '75 sources from the two reports + verified links' } },
];
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 22 Q16 0 28 22" stroke="#3ee6ff" stroke-width="2.2" fill="none"/><path d="M4 22 L28 22" stroke="#8f7dff" stroke-width="1.4" stroke-dasharray="2 3"/><circle cx="4" cy="22" r="3.2" fill="#8f7dff"/><circle cx="28" cy="22" r="3.2" fill="#ff6ad5"/><circle cx="16" cy="11" r="3.2" fill="#3ee6ff"/></svg>`;
/* RN.latch('unlock' | 'lock'): a short synthesized cash-register sound (Web Audio, no files) */
let ACX = null;
RN.latch = kind => {
  try {
    ACX = ACX || new (window.AudioContext || window.webkitAudioContext)();
    if (ACX.state === 'suspended') ACX.resume();
    const t0 = ACX.currentTime + .01, out = ACX.createGain(); out.gain.value = .55; out.connect(ACX.destination);
    /* cash register: a mechanical "ka" (lever + drawer: filtered noise and a low knock), then the "ching" bell
       with bright inharmonic partials, and a short jingle of coins */
    const noise = (at, dur, freq, q, vol, type = 'bandpass') => {
      const len = Math.floor(ACX.sampleRate * dur), buf = ACX.createBuffer(1, len, ACX.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = ACX.createBufferSource(), f = ACX.createBiquadFilter(), g = ACX.createGain();
      src.buffer = buf; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol;
      src.connect(f).connect(g).connect(out); src.start(at);
    };
    const knock = (at, f, vol, dur = .09) => {
      const o = ACX.createOscillator(), g = ACX.createGain(); o.type = 'triangle';
      o.frequency.setValueAtTime(f, at); o.frequency.exponentialRampToValueAtTime(f * .45, at + dur);
      g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(.001, at + dur); o.connect(g).connect(out); o.start(at); o.stop(at + dur + .02);
    };
    const ching = (at, f0, vol) => [[1, 1, 1.4], [2.32, .7, 1.1], [3.9, .45, .8], [5.27, .3, .55], [7.1, .18, .35]].forEach(([r, a, dec]) => {
      const o = ACX.createOscillator(), g = ACX.createGain(); o.type = 'sine'; o.frequency.value = f0 * r;
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol * a, at + .003); g.gain.exponentialRampToValueAtTime(.0006, at + dec);
      o.connect(g).connect(out); o.start(at); o.stop(at + dec + .05);
    });
    const coins = (at, n) => { for (let i = 0; i < n; i++) { const t = at + i * .045 + Math.random() * .02; noise(t, .025, 5200 + Math.random() * 2600, 14, .35); } };
    if (kind === 'unlock') {            /* "ka-ching!" — the drawer opens */
      noise(t0, .05, 900, 1.2, .9); knock(t0, 180, .55);
      noise(t0 + .07, .04, 2400, 3, .6);
      ching(t0 + .12, 1975, .26); ching(t0 + .125, 2637, .14);
      coins(t0 + .2, 5);
    } else {                            /* the drawer slides shut: a slide, a thump and a small latch tick */
      noise(t0, .16, 600, .8, .45, 'lowpass');
      knock(t0 + .15, 140, .7, .12); noise(t0 + .15, .05, 1200, 1.5, .8);
      noise(t0 + .23, .02, 4200, 8, .4);
    }
  } catch (e) { /* no audio: silent */ }
};

/* the "blind" over the top menu on the NRN BG page: click the padlock on it (or drag it up) to unlock, click the open padlock
   on the left (or drag it down) to lock again.
   It starts locked on each visit (sessionStorage remembers it while the tab is open). Other pages have no blind. */
function blind(nav) {
  const sh = $('#shade', nav), kn = $('#shadeKnob', nav), KEY = 'renet-blind';
  let open = false; try { open = sessionStorage.getItem(KEY) === 'open'; } catch (e) {}
  const set = (o, sound) => {
    open = o; sh.style.transition = ''; sh.style.transform = '';
    nav.classList.toggle('blindOpen', o); sh.setAttribute('aria-hidden', o); sh.tabIndex = o ? -1 : 0;
    if (sound) RN.latch(o ? 'unlock' : 'lock');
    try { sessionStorage.setItem(KEY, o ? 'open' : 'locked'); } catch (e) {}
  };
  const lk = $('.shLock', sh);
  const titles = () => { kn.title = kn.ariaLabel = RN.lang === 'en' ? 'Click to lock the menu' : 'Щракнете, за да заключите менюто';
    lk.title = RN.lang === 'en' ? 'Click to unlock the menu' : 'Щракнете, за да отключите менюто';
    sh.setAttribute('aria-label', RN.lang === 'en' ? 'Click the padlock (or drag up) to unlock the menu' : 'Щракнете върху катинара (или плъзнете нагоре), за да отключите менюто'); };
  document.addEventListener('rn:lang', titles); titles();
  /* drag helper: follows the pointer one way only, decides on release (35% of the height) */
  const drag = (el, dir, done) => {
    let y0 = null, h = 0, moved = 0, onLock = false;
    el.addEventListener('pointerdown', e => { onLock = !!e.target.closest('.shLock'); y0 = e.clientY; h = sh.offsetHeight; moved = 0; el.setPointerCapture(e.pointerId); sh.style.transition = 'none'; e.preventDefault(); });
    el.addEventListener('pointermove', e => {
      if (y0 === null) return; const dy = e.clientY - y0; moved = Math.max(moved, Math.abs(dy));
      const d = dir < 0 ? Math.min(0, dy) : Math.max(0, dy), base = open ? -h * 1.2 : 0;
      sh.style.transform = `translateY(${Math.max(-h * 1.2, Math.min(0, base + d))}px)`;
    });
    const end = e => { if (y0 === null) return; const dy = e.clientY - y0; y0 = null;
      if (dir * dy > h * .35 || (moved < 4 && (el === kn || onLock))) return done(); // a click on either padlock opens / locks
      sh.style.transition = ''; sh.style.transform = '';
      /* a plain click on the blind only hints that it slides up */
      if (moved < 4 && el === sh) { sh.classList.remove('nudge'); void sh.offsetWidth; sh.classList.add('nudge'); } };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  };
  drag(sh, -1, () => set(true, true));
  drag(kn, 1, () => set(false, true));
  sh.addEventListener('keydown', e => { if (['Enter', ' ', 'ArrowUp'].includes(e.key)) { e.preventDefault(); set(true, true); } });
  kn.addEventListener('keydown', e => { if (['Enter', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); set(false, true); } });
  set(open, false);
}

function shell() {
  const page = document.body.dataset.page;
  /* the NRN BG page is the site's lead page: it gets its own logo (white on dark, black on light) */
  const nrn = page === 'bulgaria';
  const BRAND = nrn
    ? `<a class="logo nrnBrand" href="bulgaria.html"><img class="nrnLogo onDark" src="assets/img/nrn-logo-white.svg" alt=""><img class="nrnLogo onLight" src="assets/img/nrn-logo.svg" alt=""><span>NRN BG</span></a>`
    : `<a class="logo" href="home.html">${LOGO}R&amp;E<span class="grad">·NET</span></a>`;
  /* NRN BG only: a "blind" over the world-network menu, unlocked by dragging it up and locked again by dragging down */
  /* silver triangle (up or down) for the blind and its knob */
  const TRI = up => `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="silver${up ? 'U' : 'D'}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6fa"/><stop offset=".45" stop-color="#aeb6c4"/><stop offset=".55" stop-color="#d9dee7"/><stop offset="1" stop-color="#7d8696"/></linearGradient></defs><path d="${up ? 'M12 5 L20.5 18.5 L3.5 18.5 Z' : 'M3.5 5.5 L20.5 5.5 L12 19 Z'}" fill="url(#silver${up ? 'U' : 'D'})" stroke="rgba(0,0,0,.35)" stroke-width=".8" stroke-linejoin="round"/></svg>`;
  /* silver padlock, closed (on the blind) or open (the knob that locks the menu again) */
  const LOCK = op => `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="lockG${op ? 'O' : 'C'}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6fa"/><stop offset=".45" stop-color="#aeb6c4"/><stop offset=".55" stop-color="#d9dee7"/><stop offset="1" stop-color="#7d8696"/></linearGradient></defs>`
    + `<path d="${op ? 'M7.6 11V7.2a4.4 4.4 0 0 1 8.6-1.3' : 'M7.6 11V8a4.4 4.4 0 0 1 8.8 0v3'}" fill="none" stroke="#c9d0dc" stroke-width="2.3" stroke-linecap="round"/>`
    + `<rect x="4.8" y="10.4" width="14.4" height="10.6" rx="2.2" fill="url(#lockG${op ? 'O' : 'C'})" stroke="rgba(0,0,0,.35)" stroke-width=".8"/>`
    + `<circle cx="12" cy="15" r="1.6" fill="#4a5468"/><path d="M12 15.8v2.4" stroke="#4a5468" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  const SHADE = `<div class="shade" id="shade" role="button" tabindex="0" aria-label="${RN.L('Плъзнете нагоре, за да отключите менюто', 'Drag up to unlock the menu').replace(/<[^>]+>/g, '')}"><span class="shAr shLock" title="">${LOCK(false)}</span><span class="shTx">${RN.L('Информация за световните изследователски мрежи – може да я отключите чрез катинара вляво', 'Information on the world’s research networks – unlock it with the padlock on the left')}</span></div>`;
  const KNOB = `<button class="shadeKnob" id="shadeKnob" type="button" title="${'Щракнете, за да заключите менюто'}">${LOCK(true)}</button>`;
  const nav = $('#shell-nav');
  if (nav) {
    nav.outerHTML = `<nav class="nav" id="nav"><div class="wrap">
      ${BRAND}
      <button class="burger" id="burger" aria-label="Menu" aria-expanded="false">☰</button>
      <div class="linksWrap" id="linksWrap">${nrn ? KNOB : ''}<div class="links" id="links">${RN.PAGES.filter(p => p.id !== 'home').map(p => `<a href="${p.href}"${(p.id === 'bulgaria' || p.id === page) ? ` class="${[p.id === 'bulgaria' ? 'nrn' : '', p.id === page ? 'on' : ''].join(' ').trim()}"` : ''}${p.id === page ? ' aria-current="page"' : ''}>${RN.L(p.bg, p.en)}</a>`).join('')}</div>${nrn ? SHADE : ''}</div>
      <button class="themeBtn" id="themeBtn" type="button"><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>
      <div class="lang" role="group" aria-label="Language"><button data-set="bg">BG</button><button data-set="en">EN</button></div>
    </div></nav>`;
    $('#themeBtn').addEventListener('click', () => RN.setTheme(RN.theme === 'light' ? 'dark' : 'light'));
    $('#burger').addEventListener('click', e => { const o = $('#links').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); });
    $$('.lang button').forEach(b => b.addEventListener('click', () => RN.setLang(b.dataset.set)));
    const n = $('#nav'); const f = () => n.classList.toggle('solid', scrollY > 30); addEventListener('scroll', f, { passive: true }); f();
    if (nrn) blind(n);
  }
  const ft = $('#shell-footer');
  if (ft) {
    ft.outerHTML = `<footer class="foot"><div class="wrap">
      <div class="footTop"><div>${BRAND}
      <p class="note" style="max-width:340px;margin-top:12px">${RN.L('Информационен сайт за изследователските и образователните мрежи по света. Данните са актуални към датата на източниците.', 'An information site about the world’s research and education networks. Figures are current as of the sources’ dates.')}</p></div>
      <div class="footLinks">${RN.PAGES.map(p => `<a href="${p.href}">${RN.L(p.bg, p.en)}</a>`).join('')}</div></div>
      <div class="footBot"><span>© 2026 R&amp;E·NET</span></div>
    </div></footer>`;
  }
}

/* ---------- data layer ---------- */
/* RN.data('networks') -> Promise of /data/networks.json (cached). Swap this for an API later. */
const cache = {};
RN.data = name => cache[name] || (cache[name] = fetch(`data/${name}.json`).then(r => { if (!r.ok) throw new Error(name); return r.json(); }));
RN.dataFail = el => { el.innerHTML = `<div class="card note">${RN.L('Данните не можаха да се заредят. Сайтът трябва да се отвори през уеб сървър (не като файл).', 'The data could not be loaded. The site must be opened through a web server (not as a local file).')}</div>`; };
/* RN.toast(html, ms, anchor): a short notice (one at a time); with an anchor element it appears right under it,
   otherwise at the top centre of the page */
RN.toast = (html, ms = 2600, anchor) => { let t = $('.rnToast'); if (!t) { t = document.createElement('div'); t.className = 'rnToast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.innerHTML = html; t.classList.toggle('anch', !!anchor);
  if (anchor) { const r = anchor.getBoundingClientRect(); t.style.top = (r.bottom + 10) + 'px'; t.style.left = ''; t.style.right = Math.max(12, innerWidth - r.right) + 'px'; }
  else { t.style.top = t.style.right = ''; }
  t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), ms); };

/* ---------- citations ---------- */
/* <sup class="cite" data-c="12,74"></sup> -> [12,74] links to sources.html#src-N with the title as tooltip */
let SRC = null;
RN.cite = c => c ? `<sup class="cite" data-c="${c}"></sup>` : '';
RN.fillCites = (root = document) => {
  $$('.cite[data-c]:not([data-done])', root).forEach(el => {
    el.dataset.done = 1;
    el.innerHTML = '[' + el.dataset.c.split(',').map(n => { n = n.trim(); const s = SRC && SRC[n]; return `<a href="sources.html#src-${n}"${s ? ` title="${s.t.replace(/"/g, '&quot;')}"` : ''}>${n}</a>`; }).join(',') + ']';
  });
};
RN.data('sources').then(d => { SRC = Object.fromEntries(d.items.map(i => [String(i.id), i])); $$('.cite[data-done]').forEach(e => e.removeAttribute('data-done')); RN.fillCites(); }).catch(() => {});

/* ---------- motion helpers ---------- */
const revIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revIO.unobserve(e.target); } }), { threshold: .1 });
function runCount(el) {
  const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suf || '', pre = el.dataset.pre || '';
  const t0 = performance.now(), dur = RN.RM ? 0 : 1700;
  const step = now => { const k = dur ? Math.min(1, (now - t0) / dur) : 1, v = to * (1 - Math.pow(1 - k, 3)); el.innerHTML = pre + RN.NF(v, dec) + suf; if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
const cntIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { runCount(e.target); cntIO.unobserve(e.target); } }), { threshold: .4 });
/* RN.enhance(root): reveal-on-scroll, counters, citations for freshly inserted HTML */
RN.enhance = (root = document) => { $$('.reveal:not(.in)', root).forEach(el => revIO.observe(el)); $$('[data-count]', root).forEach(el => cntIO.observe(el)); RN.fillCites(root); };
RN.onVisible = (el, cb = () => {}) => { let v = false; new IntersectionObserver(es => { v = es[0].isIntersecting; if (v) cb(); }).observe(el); return () => v; };
RN.whenNear = (el, cb) => { if (RN.RM) return cb(); const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { o.disconnect(); cb(); } }, { rootMargin: '300px' }); o.observe(el); };
RN.fitCanvas = cv => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); const ctx = cv.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0); return { ctx, w: r.width, h: r.height }; };
RN.loop = (el, fn) => { const vis = RN.onVisible(el); let last = performance.now(); const f = now => { const dt = Math.min(.05, (now - last) / 1000); last = now; if (vis()) fn(dt, now); requestAnimationFrame(f); }; if (RN.RM) fn(0, 0); else requestAnimationFrame(f); };

/* photonic network background used in every page hero */
RN.fiber = (cv, density = 15000) => {
  let g, nodes = [], edges = [], pulses = [], mx = 0, my = 0;
  const cols = [RN.C.cy, RN.C.vi, RN.C.pk, RN.C.bl];
  const build = () => {
    g = RN.fitCanvas(cv); nodes = []; edges = []; pulses = [];
    const n = Math.round(Math.min(110, g.w * g.h / density));
    for (let i = 0; i < n; i++) { const b = Math.random() < .65; nodes.push({ x: b ? g.w * (.42 + Math.random() * .6) : Math.random() * g.w, y: Math.random() * g.h, r: 1 + Math.random() * 2.2, c: cols[i % 4], ph: Math.random() * 6.28, z: .3 + Math.random() * .7 }); }
    nodes.forEach((a, i) => nodes.map((b, j) => [j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2]).filter(p => p[0] !== i).sort((p, q) => p[1] - q[1]).slice(0, 3).forEach(([j]) => { if (!edges.some(e => e[0] === j && e[1] === i)) edges.push([i, j]); }));
  };
  const frame = t => {
    const { ctx, w, h } = g; ctx.clearRect(0, 0, w, h);
    const ox = (mx - w / 2) * .015, oy = (my - h / 2) * .015, P = nd => [nd.x + ox * nd.z * 2, nd.y + oy * nd.z * 2];
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(120,170,255,.09)';
    edges.forEach(([i, j]) => { const [a, b] = P(nodes[i]), [c, d] = P(nodes[j]); ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); });
    if (pulses.length < 40 && Math.random() < .25 && edges.length) pulses.push({ e: edges[Math.random() * edges.length | 0], k: 0, s: .004 + Math.random() * .012, c: cols[Math.random() * 4 | 0], rev: Math.random() < .5 });
    pulses = pulses.filter(p => p.k <= 1);
    pulses.forEach(p => {
      p.k += p.s; const [x1, y1] = P(nodes[p.e[p.rev ? 1 : 0]]), [x2, y2] = P(nodes[p.e[p.rev ? 0 : 1]]);
      const x = x1 + (x2 - x1) * p.k, y = y1 + (y2 - y1) * p.k, tk = Math.max(0, p.k - .18), tx = x1 + (x2 - x1) * tk, ty = y1 + (y2 - y1) * tk;
      const gr = ctx.createLinearGradient(tx, ty, x, y); gr.addColorStop(0, 'transparent'); gr.addColorStop(1, p.c);
      ctx.strokeStyle = gr; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
    });
    nodes.forEach(nd => { const [x, y] = P(nd), a = .45 + .55 * Math.sin(t / 900 + nd.ph); ctx.globalAlpha = .35 + .65 * a * nd.z; ctx.fillStyle = nd.c; ctx.shadowColor = nd.c; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, nd.r * nd.z + .6, 0, 6.28); ctx.fill(); });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  };
  build(); addEventListener('resize', build);
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  const vis = RN.onVisible(cv);
  const loop = t => { if (vis() || t < 600) frame(t); requestAnimationFrame(loop); };
  if (RN.RM) frame(0); else requestAnimationFrame(loop);
};

/* animated SVG bar chart: rows [{label(html), v(number), txt(html), color}] ; opts {log, max, min} */
RN.bars = (el, rows, o = {}) => {
  const max = o.max || Math.max(...rows.map(r => r.v)), min = o.min || (o.log ? Math.min(...rows.map(r => r.v)) / 10 : 0);
  const w = v => o.log ? (Math.log10(v) - Math.log10(min)) / (Math.log10(max) - Math.log10(min)) * 100 : v / max * 100;
  el.innerHTML = rows.map(r => r.v == null
    ? `<div class="capRow"><div class="lbl">${r.label}</div><div class="capBar" style="background:repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 6px,transparent 6px 12px)"><i data-w="0"></i></div><div class="v">${r.txt}</div></div>`
    : `<div class="capRow"><div class="lbl">${r.label}</div><div class="capBar"><i data-w="${Math.max(1.5, w(r.v)).toFixed(1)}"${r.color ? ` style="background:${r.color}"` : ''}></i></div><div class="v">${r.txt}</div></div>`).join('');
  RN.whenNear(el, () => $$('.capBar i', el).forEach((b, i) => setTimeout(() => b.style.width = b.dataset.w + '%', RN.RM ? 0 : 150 + i * 120)));
};
/* donut: parts [{v, color, label}] */
RN.donut = (el, parts, center) => {
  center = center.map(c => String(c).replace(/<span /g, '<tspan ').replace(/<\/span>/g, '</tspan>'));
  const tot = parts.reduce((s, p) => s + p.v, 0), R = 80, C = 2 * Math.PI * R; let off = 0;
  el.innerHTML = `<svg viewBox="6 6 188 188" class="donut"><circle cx="100" cy="100" r="${R}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="18"/>${parts.map(p => { const len = p.v / tot * C, s = `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${p.color}" stroke-width="18" stroke-dasharray="0 ${C}" data-len="${len}" stroke-dashoffset="${-off}" transform="rotate(-90 100 100)" style="transition:stroke-dasharray 1.4s cubic-bezier(.2,.8,.2,1)"/>`; off += len; return s; }).join('')}<text x="100" y="98" text-anchor="middle" style="fill:var(--tx)" font-family="Geologica" font-weight="700" font-size="22">${center[0]}</text><text x="100" y="120" text-anchor="middle" style="fill:var(--mut)" font-family="JetBrains Mono" font-size="10">${center[1]}</text></svg>`;
  RN.whenNear(el, () => $$('circle[data-len]', el).forEach(c => c.setAttribute('stroke-dasharray', `${c.dataset.len} ${C}`)));
};

/* ---------- boot ---------- */
let saved = null; try { saved = localStorage.getItem('renet-lang'); } catch (e) {}
const q = new URLSearchParams(location.search).get('lang');
shell();
RN.setLang((q || saved) === 'en' ? 'en' : 'bg');
/* in-page sub-navigation.
   Default: highlight the section in view while scrolling.
   <nav class="subnav" data-tabs>: tab mode, every item shows only its own section (the #hash keeps the tab). */
const sub = $('.subnav');
const TABS = !!(sub && sub.hasAttribute('data-tabs'));
if (TABS) {
  const links = $$('a[href^="#"]', sub), ids = links.map(a => a.getAttribute('href').slice(1)).filter(id => document.getElementById(id));
  /* data-tabs="id" picks the tab shown when the address has no #hash; otherwise the first one */
  const first = ids.includes(sub.dataset.tabs) ? sub.dataset.tabs : ids[0];
  /* a #hash may name a tab or any element inside one (e.g. services.html#identity or a card id):
     open the tab that contains it, then bring that element into view */
  const tabOf = h => { if (ids.includes(h)) return [h, null]; const el = h && document.getElementById(h); const sec = el && el.closest('section');
    return sec && ids.includes(sec.id) ? [sec.id, el] : [first, null]; };
  const show = (hash, scroll) => {
    const [id, inner] = tabOf(hash);
    ids.forEach(x => { const el = document.getElementById(x), on = x === id; el.hidden = !on; el.classList.toggle('tabIn', on); });
    links.forEach(a => { const on = a.getAttribute('href') === '#' + id; a.classList.toggle('on', on); a.setAttribute('aria-current', on ? 'page' : 'false');
      if (on) { const w = a.parentElement; w.scrollTo({ left: a.offsetLeft - w.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' }); } });
    /* keep the tab bar in view: if the page was scrolled past it, go back to just above the content */
    if (inner) setTimeout(() => inner.scrollIntoView({ behavior: RN.RM ? 'auto' : 'smooth', block: 'start' }), 60);
    else if (scroll) { const top = sub.offsetTop - 64; if (scrollY > top) scrollTo({ top, behavior: RN.RM ? 'auto' : 'smooth' }); }
    document.dispatchEvent(new CustomEvent('rn:tab', { detail: id }));
  };
  links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); const id = a.getAttribute('href').slice(1); history.replaceState(null, '', '#' + id); show(id, true); }));
  addEventListener('hashchange', () => show(location.hash.slice(1), true));
  show(location.hash.slice(1), false);
} else if (sub) {
  const links = $$('a[href^="#"]', sub);
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => { const on = a.getAttribute('href') === '#' + e.target.id; a.classList.toggle('on', on); if (on) { const w = a.parentElement; w.scrollTo({ left: a.offsetLeft - w.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' }); } }); }), { rootMargin: '-40% 0px -55% 0px' });
  links.forEach(a => { const t = $(a.getAttribute('href')); if (t) io.observe(t); });
}
const heroCv = $('#heroCanvas'); if (heroCv) RN.fiber(heroCv, +(heroCv.dataset.density || 15000));
document.addEventListener('DOMContentLoaded', () => RN.enhance());
/* content is partly rendered from JSON, so re-apply #hash scrolling once it has settled */
if (!TABS && location.hash && !/^#src-/.test(location.hash)) addEventListener('load', () => setTimeout(() => { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }, 350));
if (document.readyState !== 'loading') RN.enhance();
})();
