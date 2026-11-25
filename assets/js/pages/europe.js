/* GÉANT & Europe page: rings, 800Gb migration simulation, transfer calculator */
(() => {
const { $, $$, L, C } = RN;

/* ---------- rings ---------- */
(function rings() {
  const svg = $('#ringSvg');
  const R = [
    { id: 'w', cx: 140, cy: 235, r: 115, col: C.cy, cap: 800, t: ['Западен пръстен', 'Western ring'], v: '2×400 → 800Gb', d: ['надграден до 2×400 Gbps, с преход към 800 Gbps трасета', 'upgraded to 2×400 Gbps, moving to 800 Gbps paths'] },
    { id: 'c', cx: 300, cy: 125, r: 85, col: C.vi, cap: 300, t: ['Централен пръстен', 'Central ring'], v: '≥300Gb', d: ['минимум 300 Gbps', 'a minimum of 300 Gbps'] },
    { id: 'e', cx: 415, cy: 290, r: 80, col: C.pk, cap: 200, t: ['Източен пръстен', 'Eastern ring'], v: '200Gb', d: ['стабилизиран на 200 Gbps', 'stabilised at 200 Gbps'] },
  ];
  let h = '';
  R.forEach(r => {
    h += `<circle class="rg" data-id="${r.id}" cx="${r.cx}" cy="${r.cy}" r="${r.r}" fill="none" stroke="${r.col}" stroke-width="${2 + r.cap / 160}" opacity=".35"/>`;
    for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283 + r.r; h += `<circle cx="${(r.cx + Math.cos(a) * r.r).toFixed(1)}" cy="${(r.cy + Math.sin(a) * r.r).toFixed(1)}" r="4.5" fill="#081226" stroke="${r.col}" stroke-width="1.6"/>`; }
    h += `<text x="${r.cx}" y="${r.cy - 4}" text-anchor="middle" fill="${r.col}" font-family="Geologica" font-weight="700" font-size="${r.id === 'w' ? 22 : 18}">${r.v}</text>`;
    h += `<text lang="bg" x="${r.cx}" y="${r.cy + 16}" text-anchor="middle" fill="#93a5c8" font-family="Golos Text" font-size="12">${r.t[0]}</text><text lang="en" x="${r.cx}" y="${r.cy + 16}" text-anchor="middle" fill="#93a5c8" font-family="Golos Text" font-size="12">${r.t[1]}</text>`;
  });
  h += `<g id="ringDots"></g><text x="260" y="430" text-anchor="middle" fill="#5e7096" font-family="JetBrains Mono" font-size="11">GÉANT · 12 Tbps aggregate core</text>`;
  svg.innerHTML = h;
  const dots = $('#ringDots', svg), P = [];
  R.forEach(r => { const n = 3 + Math.round(r.cap / 160); for (let i = 0; i < n; i++) { const c = document.createElementNS(RN.NS, 'circle'); c.setAttribute('r', 3); c.setAttribute('fill', r.col); c.style.filter = `drop-shadow(0 0 5px ${r.col})`; dots.appendChild(c); P.push({ r, a: i / n * 6.283, c }); } });
  const leg = $('#ringLeg'); let hl = null;
  leg.innerHTML = R.map(r => `<div class="rl" data-id="${r.id}"><span class="sw" style="background:${r.col}"></span><div>${L(...r.t)}<div class="note">${L(...r.d)}</div></div><b style="color:${r.col}">${r.v}</b></div>`).join('');
  leg.addEventListener('click', e => { const b = e.target.closest('.rl'); if (!b) return; hl = hl === b.dataset.id ? null : b.dataset.id;
    $$('.rl', leg).forEach(x => x.classList.toggle('on', x.dataset.id === hl));
    $$('.rg', svg).forEach(c => c.setAttribute('opacity', !hl || c.dataset.id === hl ? (hl ? .8 : .35) : .1)); });
  RN.loop(svg, dt => P.forEach(p => { p.a += dt * p.r.cap / 520; p.c.setAttribute('cx', p.r.cx + Math.cos(p.a) * p.r.r); p.c.setAttribute('cy', p.r.cy + Math.sin(p.a) * p.r.r); p.c.setAttribute('opacity', !hl || p.r.id === hl ? 1 : .15); }));
})();

/* ---------- migration simulation: 32 sites, 1240 services, June 2024 -> January 2026 ---------- */
(function migration() {
  const grid = $('#migGrid');
  grid.innerHTML = [...Array(32)].map((_, i) => `<div class="msite" style="aspect-ratio:1;border-radius:8px;border:1px solid var(--line2);background:var(--solid);display:grid;place-items:center;font:600 10px var(--fm);color:var(--dim);transition:all .4s">${String(i + 1).padStart(2, '0')}</div>`).join('');
  const sites = $$('.msite', grid);
  const months = ['06.2024', '07.2024', '08.2024', '09.2024', '10.2024', '11.2024', '12.2024', '01.2025', '02.2025', '03.2025', '04.2025', '05.2025', '06.2025', '07.2025', '08.2025', '09.2025', '10.2025', '11.2025', '12.2025', '01.2026'];
  let raf = 0;
  const run = () => {
    cancelAnimationFrame(raf); sites.forEach(s => { s.style.background = 'var(--solid)'; s.style.color = 'var(--dim)'; s.style.borderColor = 'var(--line2)'; s.style.boxShadow = 'none'; });
    const t0 = performance.now(), dur = RN.RM ? 1 : 9000;
    const f = now => {
      const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const done = Math.round(e * 32);
      sites.forEach((s, i) => { if (i < done) { const core = i < 10; s.style.background = core ? 'rgba(143,125,255,.35)' : 'rgba(62,230,255,.25)'; s.style.borderColor = core ? C.vi : C.cy; s.style.color = 'var(--tx)'; s.style.boxShadow = `0 0 14px ${core ? 'rgba(143,125,255,.5)' : 'rgba(62,230,255,.4)'}`; } });
      $('#migSvc').innerHTML = RN.NF(Math.round(e * 1240)); $('#migSite').textContent = done;
      const m = months[Math.min(months.length - 1, Math.floor(k * months.length))];
      $('#migDate').innerHTML = `${m} · ${k < .35 ? L('интеграция на ядрото (лилаво)', 'core integration (violet)') : k < 1 ? L('миграция на крайните услуги (синьо)', 'edge service migration (cyan)') : L('завършено — януари 2026 г.', 'complete — January 2026')}`;
      if (k < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
  };
  $('#migBtn').addEventListener('click', run);
  RN.whenNear(grid, run);
})();

/* ---------- calculator ---------- */
(function calc() {
  const DS = [
    { b: 1e12, t: ['Голям геномен набор', 'A large genomics dataset'], s: '1 TB' },
    { b: 1.08e13, t: ['Денонощие e-VLBI от един телескоп при 1 Gbps', 'One day of e-VLBI from a telescope at 1 Gbps'], s: '10.8 TB' },
    { b: 5.76e13, t: ['Един час от модул ngBackend на EHT (128 Gbps)', 'One hour from an EHT ngBackend module (128 Gbps)'], s: '57.6 TB' },
    { b: 1e15, t: ['Един петабайт научни данни', 'One petabyte of research data'], s: '1 PB' },
    { b: 3.5e17, t: ['Година сурови данни на ATLAS при HL-LHC', 'A year of ATLAS raw data at HL-LHC'], s: '350 PB' },
    { b: 3.6e18, t: ['Целият трафик на GÉANT за 2025 г.', 'All of GÉANT’s 2025 traffic'], s: '3.6 EB' },
  ];
  const LK = [
    { r: 1e8, t: ['Домашен интернет', 'Home broadband'], s: '100 Mbps' },
    { r: 1e10, t: ['Кампусна връзка', 'Campus uplink'], s: '10 Gbps' },
    { r: 1e11, t: ['Гръбнак на Asi@Connect', 'Asi@Connect backbone'], s: '100 Gbps' },
    { r: 4e11, t: ['Средният поток, нужен за HL-LHC', 'The average flow HL-LHC needs'], s: '400 Gbps' },
    { r: 8e11, t: ['Единична вълна 800Gb', 'A single 800Gb wave'], s: '800 Gbps' },
    { r: 2.4e12, t: ['Устойчив поток при Data Challenge 2024', 'Sustained flow in Data Challenge 2024'], s: '2.4 Tbps' },
    { r: 1.2e13, t: ['Цялото ядро на GÉANT', 'The whole GÉANT core'], s: '12 Tbps' },
  ];
  let di = 3, li = 2;
  const mk = (el, arr, set) => { el.innerHTML = arr.map((o, i) => `<button class="opt" data-i="${i}">${L(...o.t)}<small>${o.s}</small></button>`).join(''); el.addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) { set(+b.dataset.i); upd(); } }); };
  mk($('#dsOpts'), DS, v => di = v); mk($('#lkOpts'), LK, v => li = v);
  const durT = (s, lg) => {
    const U = [[31557600, 'г.', 'yr'], [86400, 'дни', 'days'], [3600, 'ч', 'h'], [60, 'мин', 'min'], [1, 'с', 's']];
    if (s < 1) return RN.nf(s * 1000, 0, lg) + (lg === 'bg' ? ' мс' : ' ms');
    for (const [k, bg, en] of U) if (s >= k) { const v = s / k; return RN.nf(v, v < 10 ? 1 : 0, lg) + ' ' + (lg === 'bg' ? bg : en); }
  };
  function upd() {
    $$('#dsOpts .opt').forEach((b, i) => b.classList.toggle('on', i === di)); $$('#lkOpts .opt').forEach((b, i) => b.classList.toggle('on', i === li));
    const s = DS[di].b * 8 / LK[li].r, home = DS[di].b * 8 / 1e8;
    $('#calcTime').innerHTML = L(durT(s, 'bg'), durT(s, 'en'));
    const k = Math.log10(LK[li].r / 1e8) / Math.log10(1.2e13 / 1e8), p = $('#calcPipe');
    p.style.transition = 'none'; p.style.width = '0';
    requestAnimationFrame(() => { p.style.transition = RN.RM ? 'none' : 'width 1.2s cubic-bezier(.2,.8,.2,1)'; p.style.width = (8 + k * 92) + '%'; });
    const x = LK[li].r / 1e8;
    $('#calcCmp').innerHTML = x > 1 ? L(`${RN.nf(x, 0, 'bg')}× по-бързо от домашна връзка (там: ${durT(home, 'bg')})`, `${RN.nf(x, 0, 'en')}× faster than home broadband (there: ${durT(home, 'en')})`) : L('Базова линия: домашна връзка', 'Baseline: home broadband');
  }
  upd();
})();
RN.enhance();
})();
