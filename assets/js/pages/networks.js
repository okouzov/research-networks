/* World networks page: map + directory (data/networks.json), Internet2 NGI, TEIN/Asi@Connect, South, ANA */
(() => {
const { $, $$, L, T, C, cite } = RN;
const host = u => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const extB = () => '<span class="badge">' + L('ВЪНШЕН', 'EXTERNAL') + '</span>';

RN.data('networks').then(D => {
  const REG = D.regions, NETS = D.networks, by = Object.fromEntries(NETS.map(n => [n.id, n]));
  const kpis = n => n.kpi ? `<div class="kp">${n.kpi.map(k => `<span class="pill"><b style="color:var(--tx)">${T(k.v)}</b> ${T(k.l)}</span>`).join('')}</div>` : '';
  const card = n => `<div class="reg">${T(REG[n.reg].n)} · ${T(n.sub)}</div><h3>${n.name}${n.ext ? extB() : ''}</h3>${kpis(n)}<p>${T(n.d)}${cite(n.c)}</p><a class="go" href="${n.url}" target="_blank" rel="noopener">${host(n.url)} ↗</a>`;

  /* directory */
  const grid = $('#netGrid'), fl = $('#filters');
  fl.innerHTML = ['all', ...Object.keys(REG)].map(k => `<button class="chip${k === 'all' ? ' on' : ''}" data-r="${k}">${k === 'all' ? L('Всички', 'All') : T(REG[k].n)}</button>`).join('');
  grid.innerHTML = NETS.map(n => `<div class="card net reveal" data-r="${n.reg}" data-id="${n.id}" tabindex="0"><div class="top"><span class="dot" style="color:${REG[n.reg].color}"></span><div><h4>${n.name}</h4><div class="reg">${T(REG[n.reg].n)} · ${T(n.sub)}</div></div></div>
    <p>${T(n.d)}${cite(n.c)}${n.ext ? extB() : ''}</p><a class="go" href="${n.url}" target="_blank" rel="noopener">${L('Официален сайт', 'Official site')}: ${host(n.url)} ↗</a></div>`).join('');
  RN.enhance(grid);

  /* map */
  const svg = $('#map'), panel = $('#mapPanel'), body = $('#mapPanelBody');
  $('#mapX').addEventListener('click', () => panel.classList.remove('on'));
  let hl = () => {};
  const open = n => { body.innerHTML = card(n); RN.fillCites(body); panel.classList.add('on'); };
  if (window.d3 && window.topojson) {
    const W = 960, H = 505, proj = d3.geoNaturalEarth1().fitExtent([[10, 10], [W - 10, H - 10]], { type: 'Sphere' }), path = d3.geoPath(proj), S = d3.select(svg);
    S.append('path').attr('class', 'grat').attr('d', path(d3.geoGraticule10()));
    const gLand = S.append('g'), gArc = S.append('g'), gNode = S.append('g');
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json').then(r => r.json()).then(t => gLand.append('path').attr('class', 'land').attr('d', path(topojson.feature(t, t.objects.land)))).catch(() => {});
    const st = document.createElement('style'); st.textContent = '@keyframes mapflow{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}'; document.head.appendChild(st);
    const arcs = [];
    D.links.forEach(([a, b], i) => {
      const A = by[a], B = by[b], ls = { type: 'LineString', coordinates: [A.ll, B.ll] }, col = REG[B.reg === 'eu' ? A.reg : B.reg].color;
      const e1 = gArc.append('path').attr('class', 'arc').attr('d', path(ls)).attr('stroke', col).attr('opacity', .28);
      const e2 = gArc.append('path').attr('class', 'arc').attr('d', path(ls)).attr('stroke', col).attr('pathLength', 100).attr('stroke-dasharray', '4 96')
        .style('animation', RN.RM ? 'none' : `mapflow ${3 + (i % 5) * .7}s linear infinite`).style('animation-delay', `-${i * .37}s`);
      arcs.push({ regs: [A.reg, B.reg], els: [e1, e2] });
    });
    D.special.forEach((s, i) => {
      const ls = { type: 'LineString', coordinates: [s.a, s.b] };
      const e1 = gArc.append('path').attr('class', 'arc hl').attr('d', path(ls)).attr('stroke', s.color).attr('opacity', .5).attr('stroke-dasharray', s.dashed ? '3 5' : null);
      const e2 = gArc.append('path').attr('class', 'arc hl').attr('d', path(ls)).attr('stroke', '#fff').attr('pathLength', 100).attr('stroke-dasharray', '6 94').style('animation', RN.RM ? 'none' : `mapflow ${2.6 + i * .4}s linear infinite`);
      const m = proj(d3.geoInterpolate(s.a, s.b)(.5));
      const t = gArc.append('text').attr('x', m[0] - 8).attr('y', m[1] + (s.dashed ? -10 : 0)).attr('text-anchor', 'end').attr('fill', s.color).attr('font-size', 11).attr('font-family', 'JetBrains Mono').attr('font-weight', 600).text(s.label);
      arcs.push({ regs: [s.reg, 'eu'], els: [e1, e2, t] });
    });
    /* end points of the special routes (BELLA, ZAOXI, ANA): a small dot in the route's colour; a click opens a short note */
    const tip = document.createElement('div'); tip.className = 'mapTip'; tip.setAttribute('role', 'dialog'); svg.parentElement.appendChild(tip);
    const closeTip = () => tip.classList.remove('on');
    const gEnd = S.append('g');
    D.special.filter(s => s.ends).forEach(s => [s.a, s.b].forEach((ll, k) => {
      const [x, y] = proj(ll), here = s.ends[k], there = s.ends[1 - k];
      const g = gEnd.append('g').attr('class', 'endPt').attr('transform', `translate(${x},${y})`).attr('tabindex', 0).attr('role', 'button').attr('aria-label', `${s.label}: ${here.en}`);
      g.append('circle').attr('r', 9).attr('fill', 'transparent');
      g.append('circle').attr('r', 3.6).attr('fill', s.color).attr('stroke', '#050b18').attr('stroke-width', 1.2);
      const show = ev => {
        ev.stopPropagation();
        tip.innerHTML = `<button class="x" aria-label="Close">✕</button><b style="color:${s.color === '#ffffff' ? 'var(--tx)' : s.color}">${s.label}</b>
          <div class="ends">${L(here.bg, here.en)} ↔ ${L(there.bg, there.en)}</div><p>${L(s.note.bg, s.note.en)}</p>`;
        $('.x', tip).addEventListener('click', closeTip);
        /* place the note next to the dot, inside the map */
        const box = svg.parentElement.getBoundingClientRect(), r = g.node().getBoundingClientRect();
        const cx = r.left + r.width / 2 - box.left, cy = r.top + r.height / 2 - box.top;
        tip.classList.add('on');
        const w = tip.offsetWidth, h = tip.offsetHeight;
        tip.style.left = Math.max(8, Math.min(box.width - w - 8, cx + 14)) + 'px';
        tip.style.top = Math.max(8, Math.min(box.height - h - 8, cy - h / 2)) + 'px';
      };
      g.on('click', show).on('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(e); } });
    }));
    document.addEventListener('click', e => { if (!tip.contains(e.target)) closeTip(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTip(); });
    const placed = NETS.filter(n => n.ll);
    placed.forEach((n, i) => {
      const [x, y] = proj(n.ll), col = REG[n.reg].color;
      const g = gNode.append('g').attr('class', 'node').attr('transform', `translate(${x},${y})`).attr('tabindex', 0).attr('role', 'button').attr('aria-label', n.name);
      g.append('circle').attr('class', 'pulse').attr('r', 6).attr('stroke', col).style('animation-delay', `${-i * .3}s`);
      g.append('circle').attr('class', 'c').attr('r', n.id === 'geant' ? 7 : 5).attr('fill', col);
      const left = ['esnet', 'redclara', 'wacren', 'nordunet', 'tein'].includes(n.id);
      g.append('text').attr('x', left ? -10 : 10).attr('y', n.id === 'nordunet' ? -8 : 4).attr('text-anchor', left ? 'end' : 'start').text(n.name.split(' ')[0]);
      const go = () => { open(n); arcs.forEach(a => a.els.forEach(e => e.classed('hl', a.regs.includes(n.reg)))); };
      g.on('click', go).on('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    hl = r => {
      gNode.selectAll('.node').style('opacity', (d, i) => r === 'all' || placed[i].reg === r ? 1 : .2);
      arcs.forEach(a => a.els.forEach(e => e.style('opacity', r === 'all' || a.regs.includes(r) ? null : .06)));
    };
  } else svg.outerHTML = `<div class="mapFail">${L('Картата не можа да се зареди (няма връзка с CDN). Каталогът по-долу работи.', 'The map could not load (no CDN connection). The directory below still works.')}</div>`;
  fl.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', fl).forEach(x => x.classList.toggle('on', x === b));
    $$('.net', grid).forEach(c => c.style.display = (b.dataset.r === 'all' || c.dataset.r === b.dataset.r) ? '' : 'none'); hl(b.dataset.r); });
  const fromCard = e => { const c = e.target.closest('.net'); if (!c || e.target.closest('a')) return; const n = by[c.dataset.id]; if (!n.ll) return; open(n); /* the map lives in its own tab: switching the #hash opens it */ if (location.hash !== '#map-sec') location.hash = 'map-sec'; else $('#map-sec').scrollIntoView({ behavior: RN.RM ? 'auto' : 'smooth' }); };
  grid.addEventListener('click', fromCard); grid.addEventListener('keydown', e => { if (e.key === 'Enter') fromCard(e); });
  const ANA_URL = { 'GÉANT': 'https://geant.org', ESnet: 'https://www.es.net', Internet2: 'https://internet2.edu', CANARIE: 'https://www.canarie.ca', NORDUnet: 'https://nordu.net', SURF: 'https://www.surf.nl', SINET: 'https://www.sinet.ad.jp', KREONET: 'https://www.kreonet.net' };
  $('#anaGrid').innerHTML = D.ana.map(a => ANA_URL[a] ? `<a href="${ANA_URL[a]}" target="_blank" rel="noopener">${a}</a>` : `<span>${a}</span>`).join('');
}).catch(() => RN.dataFail($('#netGrid')));

/* ---------- Internet2 NGI stack animation ---------- */
(function ngi() {
  const s = $('#ngiSvg');
  const B = [
    { x: 20, t: 'Cisco 8201', s: ['рутер · 400GE', 'router · 400GE'], c: C.vi },
    { x: 255, t: '400 Gb AOC', s: ['активен оптичен кабел', 'active optical cable'], c: C.bl },
    { x: 490, t: 'Ciena Waveserver 5', s: ['кохерентна вълна 600–800 Gb', 'coherent wave 600–800 Gb'], c: C.cy },
    { x: 725, t: 'Ciena 6500 Flex-Grid', s: ['оптична линия', 'optical line system'], c: C.pk },
  ];
  let h = `<defs><linearGradient id="wv" x1="0" x2="1"><stop offset="0" stop-color="${C.cy}"/><stop offset="1" stop-color="${C.pk}"/></linearGradient></defs>`;
  B.forEach((b, i) => {
    h += `<rect x="${b.x}" y="70" width="210" height="84" rx="14" fill="#0b1834" stroke="${b.c}" stroke-width="1.6"/>`;
    h += `<text x="${b.x + 105}" y="104" text-anchor="middle" fill="#fff" font-family="Geologica" font-weight="700" font-size="16">${b.t}</text>`;
    h += `<text lang="bg" x="${b.x + 105}" y="128" text-anchor="middle" fill="#93a5c8" font-family="Golos Text" font-size="12.5">${b.s[0]}</text><text lang="en" x="${b.x + 105}" y="128" text-anchor="middle" fill="#93a5c8" font-family="Golos Text" font-size="12.5">${b.s[1]}</text>`;
    h += `<text x="${b.x + 105}" y="56" text-anchor="middle" fill="${b.c}" font-family="JetBrains Mono" font-size="11">0${i + 1}</text>`;
  });
  h += `<g id="pk"></g><path id="wave" d="" fill="none" stroke="url(#wv)" stroke-width="2.4"/>`;
  h += `<text x="20" y="200" fill="#5e7096" font-family="JetBrains Mono" font-size="11">PACKETS · 400 GbE</text><text x="940" y="200" text-anchor="end" fill="#5e7096" font-family="JetBrains Mono" font-size="11">LIGHT · 600–800 Gbps / λ</text>`;
  s.innerHTML = h;
  const pk = $('#pk', s), wave = $('#wave', s);
  const dots = [...Array(10)].map((_, i) => { const r = document.createElementNS(RN.NS, 'rect'); r.setAttribute('width', 10); r.setAttribute('height', 6); r.setAttribute('rx', 1.5); r.setAttribute('fill', i % 3 ? C.vi : C.bl); pk.appendChild(r); return { r, o: i / 10 }; });
  RN.loop(s, (dt, now) => {
    const t = now / 1000;
    dots.forEach(d => { const k = (t * .35 + d.o) % 1, x = 230 + k * 260; d.r.setAttribute('x', x); d.r.setAttribute('y', 109 + Math.sin(d.o * 20) * 6); d.r.setAttribute('opacity', x > 480 ? 0 : 1); });
    let p = 'M700 112'; for (let x = 700; x <= 960; x += 4) p += ` L${x} ${112 + Math.sin(x / 9 - t * 9) * 12}`; wave.setAttribute('d', p);
  });
})();

/* NGI segments grouped chart */
(function ngiChart() {
  const SEG = [['Albany – Hartford', 549, null, 700, 600], ['Ashburn – Pittsburgh', 453, 600, 800, 600], ['Dallas – Kansas City', 928, 550, 700, 600], ['El Paso – Tucson', 518, 650, 800, 600], ['Phoenix – Tucson', 202, 700, 800, 600], ['Las Vegas – Salt Lake City', 731, 550, 700, 600], ['Reno – Salt Lake City', 876, 550, 700, 700]];
  const el = $('#ngiChart');
  el.innerHTML = SEG.map(([n, km, m, v, d]) => `<div class="capRow" style="grid-template-columns:230px 1fr 70px"><div class="lbl"><b>${n}</b>${RN.NF(km)} km</div>
    <div style="display:flex;flex-direction:column;gap:4px">${[[m, '#5e7096'], [v, 'var(--vi)'], [d, 'var(--cy)']].map(([x, c]) => `<div class="capBar" style="height:8px"><i data-w="${x ? x / 8 : 0}" style="background:${c}"></i></div>`).join('')}</div>
    <div class="v" style="font-size:12px;line-height:1.35">${m ?? '—'}<br>${v}<br><b style="color:var(--cy)">${d}</b></div></div>`).join('') + `<p class="note" style="margin-top:10px">${L('Стойности в Gbps. Ден 1: 400GE + 100GE + OTL4.4 (OTN); Рено – Солт Лейк Сити работи само с Ethernet: 400GE + 3 × 100GE.', 'Values in Gbps. Day 1: 400GE + 100GE + OTL4.4 (OTN); Reno – Salt Lake City runs Ethernet-only: 400GE + 3 × 100GE.')}</p>`;
  RN.whenNear(el, () => $$('.capBar i', el).forEach((b, i) => setTimeout(() => b.style.width = b.dataset.w + '%', RN.RM ? 0 : i * 60)));
})();

/* ---------- TEIN stages ---------- */
RN.bars($('#teinSteps'), [
  { label: `<b>TEIN1</b>2001 · RENATER ↔ KOREN`, v: 2e6, txt: '2 Mbps' },
  { label: `<b>TEIN2</b>2004–2008 · ${L('10 държави', '10 countries')}`, v: null, txt: L('регионална опорна мрежа', 'regional backbone') },
  { label: `<b>TEIN3</b>2008–2012 · ${L('Южна Азия', 'South Asia')}`, v: null, txt: L('+7 държави', '+7 countries') },
  { label: `<b>TEIN4</b>2012–2016 · TEIN*CC`, v: null, txt: L('управление от Сеул', 'run from Seoul') },
  { label: `<b>Asi@Connect</b>2016– · ${L('22 държави', '22 countries')}`, v: 1e11, txt: '100 Gbps' },
], { log: true, min: 1e6, max: 1e11 });
$('#teinSteps').insertAdjacentHTML('beforeend', `<p class="note" style="margin-top:10px">${L('Логаритмична скала. Капацитетът е посочен в източника само за първия и последния етап.', 'Logarithmic scale. The source gives capacity only for the first and last stage.')}${cite('42')}</p>`);
RN.donut($('#donut1'), [{ v: 20, color: C.cy }, { v: 17.15, color: C.pk }], [L('37,15 млн. €', '€37.15M'), L('ФАЗА 1 · 2016–26', 'PHASE 1 · 2016–26')]);
RN.donut($('#donut2'), [{ v: 10.72, color: C.cy }, { v: 3.28, color: C.pk }], [L('14 млн. €', '€14M'), L('ФАЗА 2 · 2026–31', 'PHASE 2 · 2026–31')]);
$('#teinUses').innerHTML = [
  ['⚠', ['Ранно предупреждение при бедствия', 'Disaster early warning']], ['🛰', ['Наблюдение на Земята', 'Earth observation']],
  ['🌾', ['Продоволствена сигурност', 'Food security']], ['🩺', ['Дигитално здравеопазване', 'Digital health']],
  ['🎓', ['Дистанционно обучение', 'Distance learning']], ['🧪', ['SDN и M2M полигон', 'SDN and M2M test-bed']],
].map(([i, t]) => `<div class="kpi" style="padding:12px;display:flex;gap:10px;align-items:center"><span style="font-size:20px">${i}</span><span style="font-size:14px;color:var(--tx)">${L(...t)}</span></div>`).join('');

/* ---------- South ---------- */
$('#southCards').innerHTML = [
  [C.gr, 'RedCLARA', ['Латинска Америка', 'Latin America'], ['Създадена през 2003 г. с проекта ALICE на Европейската комисия. Кабелът BELLA (Building the Europe Link with Latin America) ѝ дава пряка оптична връзка с Европа без транзит през Северна Америка.', 'Created in 2003 through the European Commission’s ALICE project. The BELLA cable (Building the Europe Link with Latin America) gives it a direct optical link to Europe with no transit via North America.'], '15,18,20', 'https://www.redclara.net'],
  [C.am, 'UbuntuNet · WACREN', ['Африка на юг от Сахара', 'Sub-Saharan Africa'], ['Континентът има три регионални зони. Трасето ZAOXI от 10 Gbps между Лагос и Кейптаун позволи директна размяна на трафик между WACREN и SANReN/UbuntuNet Alliance — без европейски сървъри по пътя.', 'The continent has three regional zones. The 10 Gbps ZAOXI route between Lagos and Cape Town enabled direct traffic exchange between WACREN and SANReN/UbuntuNet Alliance — with no European servers on the way.'], '2,14,19', 'https://wacren.net'],
  [C.yl, 'ASREN', ['Арабски свят', 'Arab region'], ['Обединява NREN на арабските държави и Северна Африка; регистрирана в Дюселдорф (2011) под егидата на Лигата на арабските държави.', 'Unites the NRENs of the Arab states and North Africa; registered in Düsseldorf (2011) under the umbrella of the League of Arab States.'], '2,16', 'https://asren.net'],
].map(([c, n, r, d, ci, u]) => `<div class="card reveal" style="border-top:3px solid ${c}"><div class="reg" style="font-family:var(--fm);font-size:12px;color:${c}">${L(...r)}</div><h3 style="margin-top:6px">${n}</h3><p>${L(...d)}${cite(ci)}</p><p style="margin-top:12px"><a href="${u}" target="_blank" rel="noopener">${host(u)} ↗</a></p></div>`).join('');

/* ---------- ANA transatlantic animation ---------- */
(function ana() {
  const s = $('#anaSvg');
  let h = `<rect width="640" height="340" fill="url(#ocean)"/><defs><linearGradient id="ocean" x1="0" x2="1"><stop offset="0" stop-color="#0a1836"/><stop offset=".5" stop-color="#071226"/><stop offset="1" stop-color="#0a1836"/></linearGradient></defs>`;
  h += `<path d="M0 30 Q60 60 70 140 Q60 230 0 320 Z" fill="#13254a"/><path d="M640 20 Q575 70 570 150 Q585 250 640 330 Z" fill="#13254a"/>`;
  h += `<text x="18" y="175" fill="#cfe0ff" font-family="Geologica" font-weight="700" font-size="14" lang="bg">Сев. Америка</text><text x="18" y="175" fill="#cfe0ff" font-family="Geologica" font-weight="700" font-size="14" lang="en">N. America</text><text x="622" y="175" text-anchor="end" fill="#cfe0ff" font-family="Geologica" font-weight="700" font-size="14" lang="bg">Европа</text><text x="622" y="175" text-anchor="end" fill="#cfe0ff" font-family="Geologica" font-weight="700" font-size="14" lang="en">Europe</text>`;
  const P1 = 'M70 110 C 220 40, 420 40, 572 100', P2 = 'M70 220 C 230 300, 420 300, 575 230';
  [[P1, C.cy, 'EXA · system A'], [P2, C.vi, 'EXA · system B']].forEach(([p, c, t], i) => {
    h += `<path d="${p}" fill="none" stroke="${c}" stroke-width="3" opacity=".35"/><path d="${p}" fill="none" stroke="${c}" stroke-width="3" pathLength="100" stroke-dasharray="3 7" class="anaflow" style="animation-duration:${1.6 + i * .5}s"/>`;
    h += `<text x="320" y="${i ? 296 : 50}" text-anchor="middle" fill="${c}" font-family="JetBrains Mono" font-size="11">${t} · 15-yr IRU</text>`;
  });
  h += `<text x="320" y="176" text-anchor="middle" fill="#ffb547" font-family="Geologica" font-weight="800" font-size="34">&gt;75%</text><text x="320" y="198" text-anchor="middle" fill="#93a5c8" font-family="Golos Text" font-size="12" lang="bg">от външния трафик на Европа</text><text x="320" y="198" text-anchor="middle" fill="#93a5c8" font-family="Golos Text" font-size="12" lang="en">of Europe’s external traffic</text>`;
  s.innerHTML = h;
  const st = document.createElement('style'); st.textContent = '.anaflow{animation:anaf 2s linear infinite}@keyframes anaf{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}'; document.head.appendChild(st);
})();

/* ---------- Europe: how the continent got connected (data/europe-growth.json) ----------
   Countries light up in the year their national research network appeared; schematic backbone
   links (each new country to the nearest one already lit) thicken with every GÉANT generation. */
(function europe() {
  const svg = $('#euSvg'); if (!svg || !window.d3 || !window.topojson) return;
  RN.data('europe-growth').then(D => {
    const S = d3.select(svg), W = 640, H = 520;
    const proj = d3.geoConicConformal().parallels([35, 65]).rotate([-15, 0])
      .fitExtent([[14, 10], [W - 14, H - 10]], { type: 'MultiPoint', coordinates: [[-24, 36], [48, 36], [-10, 70], [40, 70], [-12, 34], [50, 39]] });
    const path = d3.geoPath(proj);
    const byNum = new Map(D.countries.map(c => [c.num, c]));
    const LAST = 2026;
    const yOf = c => c.y == null ? LAST : c.y;
    /* order countries by year; each new one links to the nearest country lit before it */
    const order = [...D.countries].sort((a, b) => yOf(a) - yOf(b) || (a.y == null) - (b.y == null));
    const pt = c => proj(c.ll);
    const links = [];
    order.forEach((c, i) => { if (!i) return; let best = null, bd = 1e9; const [x, y] = pt(c);
      for (let j = 0; j < i; j++) { const [a, b] = pt(order[j]), d = (a - x) ** 2 + (b - y) ** 2; if (d < bd) { bd = d; best = order[j]; } }
      links.push({ a: best, b: c, y: yOf(c) }); });
    S.append('defs').html(`<pattern id="euHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="rgba(143,125,255,.12)"/><line x1="0" y1="0" x2="0" y2="6" stroke="rgba(143,125,255,.55)" stroke-width="2"/></pattern>`);
    const gC = S.append('g'), gL = S.append('g'), gN = S.append('g');
    let year = LAST, sel = null, playing = null;
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json').then(r => r.json()).then(t => {
      const feats = topojson.feature(t, t.objects.countries).features.filter(f => {
        const b = d3.geoBounds(f); return b[1][0] > -32 && b[0][0] < 60 && b[1][1] > 28 && b[0][1] < 75; });
      gC.selectAll('path').data(feats).join('path').attr('d', path).attr('class', f => byNum.has(f.id) ? 'euC' : 'euC off')
        .on('click', (e, f) => { const c = byNum.get(f.id); if (c) pick(c); });
      draw();
    }).catch(() => {});
    gL.selectAll('line').data(links).join('line').attr('class', 'euL')
      .attr('x1', d => pt(d.a)[0]).attr('y1', d => pt(d.a)[1]).attr('x2', d => pt(d.b)[0]).attr('y2', d => pt(d.b)[1]);
    gN.selectAll('circle').data(D.countries).join('circle').attr('class', 'euN').attr('r', 3.2)
      .attr('cx', c => pt(c)[0]).attr('cy', c => pt(c)[1]).on('click', (e, c) => pick(c));
    const eraOf = y => [...D.eras].reverse().find(e => y >= e.y) || null;
    const host = u => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    function pick(c) {
      sel = c; const b = c.y == null ? null : (c.bt || D.basis[c.b]);
      const site = /^https?:/.test(c.url) ? `<a href="${c.url}" target="_blank" rel="noopener">${host(c.url)} ↗</a>` : `<a href="${c.url}">${L('страницата NRN BG', 'the NRN BG page')}</a>`;
      const src = c.src ? (/^https?:/.test(c.src) ? `<a href="${c.src}" target="_blank" rel="noopener">${L('източник', 'source')} ↗</a>` : `<a href="${c.src}">${L('източник', 'source')}</a>`) : '';
      $('#euCard').innerHTML = `<div class="euCardHead"><b>${L(c.bg, c.en)}</b><span>${c.iso}</span></div><div class="euNren">${T(c.nren)}</div>`
        + `<div class="euWhen">${c.y == null ? L('Годината не е потвърдена в източник.', 'No year confirmed in a source.') : `<b>${c.y}</b> · ${L(b.bg, b.en)}`}</div>`
        + `<div class="euLinks">${site}${src ? ' · ' + src : ''}</div>`;
      draw();
    }
    function draw() {
      const e = eraOf(year), lit = c => c.y != null ? c.y <= year : year >= LAST;
      gC.selectAll('path.euC:not(.off)').attr('class', f => { const c = byNum.get(f.id); return 'euC' + (lit(c) ? ' on' : '') + (c.y == null ? ' unk' : '') + (sel === c ? ' sel' : ''); })
        .attr('fill', f => { const c = byNum.get(f.id); return c.y == null && lit(c) ? 'url(#euHatch)' : null; });
      gL.selectAll('line').attr('opacity', d => d.y <= year ? (e ? e.c : .5) : 0).attr('stroke-width', e ? e.w : .8);
      gN.selectAll('circle').attr('opacity', c => lit(c) ? 1 : .18).classed('sel', c => sel === c);
      $('#euYearBig').textContent = year;
      $('#euCount').textContent = D.countries.filter(lit).length;
      $('#euEra').innerHTML = e ? T(e.n) : '—';
      $('#euCap').innerHTML = e ? L(e.cap.replace('.', ',').replace(/ /g, ' '), e.cap.replace(/ /g, ' ')) : '—';
      $('#euYear').value = year;
    }
    $('#euYear').addEventListener('input', ev => { stop(); year = +ev.target.value; draw(); });
    const stop = () => { if (playing) { clearInterval(playing); playing = null; $('#euPlay').classList.remove('on'); } };
    $('#euPlay').addEventListener('click', () => {
      if (playing) return stop();
      if (year >= LAST) year = 1976;
      $('#euPlay').classList.add('on');
      playing = setInterval(() => { year++; draw(); if (year >= LAST) stop(); }, RN.RM ? 60 : 380);
      draw();
    });
    document.addEventListener('rn:lang', () => { if (sel) pick(sel); else draw(); });
    draw();
  }).catch(() => {});
})();

/* ---------- Video library (data/videos.json): own player with play/pause, seek, volume, BG/EN subtitles, full screen ----------
   Subtitles are read from .vtt or .srt files and drawn in our own overlay, so both formats work and look the same everywhere. */
(function videos() {
  const lib = $('#vidLib'); if (!lib) return;
  const v = $('#vpVideo'), sub = $('#vpSub'), seek = $('#vpSeek'), vol = $('#vpVol'), menu = $('#vpMenu');
  const IC = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>',
    vol: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    mute: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };
  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`; };
  /* SRT or VTT -> [{a, b, t}] */
  const ts = x => { const p = x.trim().replace(',', '.').split(':').map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; };
  const parse = txt => txt.replace(/\r/g, '').split(/\n{2,}/).map(b => {
    const ls = b.split('\n'), k = ls.findIndex(l => l.includes('-->')); if (k < 0) return null;
    const [a, z] = ls[k].split('-->'); return { a: ts(a), b: ts(z.trim().split(/\s+/)[0]), t: ls.slice(k + 1).join('\n').replace(/<[^>]+>/g, '') };
  }).filter(Boolean);
  let list = [], cur = null, cues = { bg: null, en: null }, track = 'off', userTrack = false;
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const showSub = () => {
    const cs = track !== 'off' && cues[track]; if (!cs) { sub.innerHTML = ''; return; }
    const t = v.currentTime, c = cs.find(q => t >= q.a && t <= q.b);
    sub.innerHTML = c ? `<span>${esc(c.t).replace(/\n/g, '<br>')}</span>` : '';
  };
  const menuHtml = () => {
    const opts = [['off', L('Без субтитри', 'Off')], ...['bg', 'en'].filter(l => cur && cur.subs && cur.subs[l]).map(l => [l, l === 'bg' ? 'Български' : 'English'])];
    menu.innerHTML = opts.map(([k, t]) => `<button data-k="${k}" class="${k === track ? 'on' : ''}">${t}</button>`).join('');
    $('#vpCC').classList.toggle('on', track !== 'off');
    $('#vpCC').disabled = opts.length < 2;
  };
  const setTrack = k => { track = k; menuHtml(); showSub(); };
  /* seeking in a large clip needs HTTP range requests. If the server does not answer them (206),
     the clip still starts streaming at once, and the whole file is fetched in the background;
     when it arrives, the player switches to the local copy at the same moment and seeking works everywhere. */
  const blobs = {};
  const ensureSeekable = item => {
    if (blobs[item.src]) return;
    blobs[item.src] = 'checking';
    fetch(item.src, { headers: { Range: 'bytes=0-1' } }).then(r => {
      if (r.status === 206) { blobs[item.src] = 'range'; r.body && r.body.cancel && r.body.cancel(); return; }
      if (r.body && r.body.cancel) r.body.cancel();
      return fetch(item.src).then(x => x.blob()).then(b => {
        const url = URL.createObjectURL(b); blobs[item.src] = url;
        if (cur === item) { const t = v.currentTime, playing = !v.paused; v.src = url; v.currentTime = t; if (playing) v.play().catch(() => {}); }
      });
    }).catch(() => { delete blobs[item.src]; });
  };
  const load = (item, autoplay) => {
    const wasOff = tvEl.classList.contains('off'); tvEl.classList.remove('off');
    if (wasOff) { tvEl.classList.remove('switchOn'); void tvEl.offsetWidth; tvEl.classList.add('switchOn'); }
    cur = item; cues = { bg: null, en: null };
    const b = blobs[item.src]; v.src = b && b.startsWith && b.startsWith('blob:') ? b : item.src;
    if (item.poster) v.poster = item.poster; else v.removeAttribute('poster');
    $('#vpTitle').innerHTML = T(item.t); $('#vpDesc').innerHTML = item.d ? T(item.d) : '';
    $$('.vpItem', lib).forEach(b => b.classList.toggle('on', b.dataset.id === item.id));
    ['bg', 'en'].forEach(l => { const u = item.subs && item.subs[l]; if (u) fetch(u).then(r => r.ok ? r.text() : '').then(t => { if (cur === item) { cues[l] = parse(t); showSub(); } }).catch(() => {}); });
    if (!userTrack) track = 'off';
    if (track !== 'off' && !(item.subs && item.subs[track])) track = 'off';
    menuHtml(); sub.innerHTML = ''; seek.value = 0;
    if (autoplay) v.play().catch(() => {});
  };
  const ui = () => {
    const p = !v.paused && !v.ended;
    $('#vpPlay').innerHTML = p ? IC.pause : IC.play; $('#vpBig').hidden = p; lib.querySelector('.vp').classList.toggle('playing', p);
    $('#vpMute').innerHTML = v.muted || v.volume === 0 ? IC.mute : IC.vol;
    $('#vpTime').textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`;
    if (v.duration) { seek.value = Math.round(v.currentTime / v.duration * 1000); seek.style.setProperty('--p', (v.currentTime / v.duration * 100) + '%'); }
    vol.style.setProperty('--p', ((v.muted ? 0 : v.volume) * 100) + '%');
  };
  const toggle = () => { if (!cur) return; v.paused || v.ended ? v.play().catch(() => {}) : v.pause(); };
  $('#vpPlay').addEventListener('click', toggle); $('#vpBig').addEventListener('click', toggle); v.addEventListener('click', toggle);
  ['play', 'pause', 'ended', 'loadedmetadata', 'volumechange', 'durationchange'].forEach(e => v.addEventListener(e, ui));
  v.addEventListener('play', () => { if (cur) ensureSeekable(cur); $('#vpList').classList.add('picked'); });
  v.addEventListener('timeupdate', () => { ui(); showSub(); });
  seek.addEventListener('input', () => { if (v.duration) { v.currentTime = seek.value / 1000 * v.duration; showSub(); } });
  vol.addEventListener('input', () => { v.volume = +vol.value; v.muted = v.volume === 0; });
  $('#vpMute').addEventListener('click', () => { if (v.muted || v.volume === 0) { v.muted = false; if (v.volume === 0) v.volume = .6; vol.value = v.volume; } else v.muted = true; });
  $('#vpCC').addEventListener('click', e => { e.stopPropagation(); menu.hidden = !menu.hidden; });
  menu.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; userTrack = true; setTrack(b.dataset.k); menu.hidden = true; });
  document.addEventListener('click', e => { if (!e.target.closest('.vpCC')) menu.hidden = true; });
  /* full screen: the browser's Fullscreen API where it is allowed; otherwise (embedded views, iOS, blocked)
     a "big screen" mode that fills the window. Esc or the same button leaves either. */
  const tvEl = lib.querySelector('.vp');
  const setBig = on => { tvEl.classList.toggle('big', on); document.documentElement.classList.toggle('vpBigOn', on); };
  $('#vpFull').addEventListener('click', () => {
    if (document.fullscreenElement || document.webkitFullscreenElement) return (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    if (tvEl.classList.contains('big')) return setBig(false);
    const req = tvEl.requestFullscreen || tvEl.webkitRequestFullscreen;
    let p; try { p = req && req.call(tvEl); } catch (e) { p = null; }
    if (p && p.catch) p.catch(() => setBig(true));
    else if (!req) setBig(true);
    setTimeout(() => { if (!document.fullscreenElement && !document.webkitFullscreenElement && !tvEl.classList.contains('big')) setBig(true); }, 350);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && tvEl.classList.contains('big')) setBig(false); });
  /* keyboard while the player has focus: space/k play, ←/→ 5 s, ↑/↓ volume, m mute, c subtitles, f full screen */
  lib.querySelector('.vp').addEventListener('keydown', e => {
    if (e.target.matches('input[type=range]') && /Arrow/.test(e.key)) return;
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') { e.preventDefault(); toggle(); }
    else if (k === 'arrowright') v.currentTime = Math.min(v.duration || 0, v.currentTime + 5);
    else if (k === 'arrowleft') v.currentTime = Math.max(0, v.currentTime - 5);
    else if (k === 'arrowup') { e.preventDefault(); v.volume = Math.min(1, v.volume + .1); vol.value = v.volume; }
    else if (k === 'arrowdown') { e.preventDefault(); v.volume = Math.max(0, v.volume - .1); vol.value = v.volume; }
    else if (k === 'm') $('#vpMute').click();
    else if (k === 'c') { const ks = ['off', ...['bg', 'en'].filter(l => cur && cur.subs && cur.subs[l])]; userTrack = true; setTrack(ks[(ks.indexOf(track) + 1) % ks.length]); }
    else if (k === 'f') $('#vpFull').click();
  });
  lib.querySelector('.vp').tabIndex = 0;
  /* pause when the visitor leaves the tab */
  document.addEventListener('rn:tab', e => { if (e.detail !== 'videos') v.pause(); });
  document.addEventListener('rn:lang', () => { menuHtml(); if (cur) { $('#vpTitle').innerHTML = T(cur.t); } });
  /* title with the network in brackets drawn in the clip's own colour (optionally on its own line) */
  const vTitle = x => { const one = str => { const m = String(str).match(/^(.*?)\s*\((.+)\)\s*$/); return m ? `${esc(m[1])} <span class="vpNet${x.nl ? ' nl' : ''}"${x.c ? ` style="color:${x.c}"` : ''}>(${esc(m[2])})</span>` : esc(str); };
    return x.t && typeof x.t === 'object' ? L(one(x.t.bg), one(x.t.en)) : one(x.t); };
  RN.data('videos').then(D => {
    list = (D.videos || []).filter(x => x && x.src); if (!list.length) return;
    $('#vidWip').hidden = true; lib.hidden = false; const vh = $('.vidHead'); if (vh) vh.hidden = true;
    $('#vpList').innerHTML = list.map((x, i) => `<button class="vpItem" data-id="${x.id || i}"><span class="vpThumb">${x.poster ? `<img src="${x.poster}" alt="" loading="lazy">` : `<video src="${x.src}#t=1" preload="metadata" muted playsinline></video>`}<i>${IC.play}</i></span><span class="vpMeta"><b>${vTitle(x)}</b>${x.d ? `<small>${T(x.d)}</small>` : ''}</span></button>`).join('');
    list.forEach((x, i) => { if (!x.id) x.id = String(i); });
    $('#vpList').addEventListener('click', e => { const b = e.target.closest('.vpItem'); if (!b) return; const it = list.find(x => x.id === b.dataset.id); $('#vpList').classList.add('picked'); if (it && it !== cur) load(it, true); });
    /* the screen starts switched off; a click on a clip in the list switches it on and plays at once */
    tvEl.classList.add('off'); ui();
    /* the list on the left is never taller than the TV; with more clips it scrolls */
    const fitList = () => { const lst = $('#vpList'); lst.style.maxHeight = innerWidth > 900 ? tvEl.offsetHeight + 'px' : ''; };
    new ResizeObserver(fitList).observe(tvEl); fitList();
  }).catch(() => {});
})();

RN.enhance();
})();
