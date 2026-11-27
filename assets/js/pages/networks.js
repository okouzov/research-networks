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

RN.enhance();
})();
