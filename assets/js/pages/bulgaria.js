/* NRN BG page: animated backbone map, timeline, member growth, uplinks.
   Data: data/bulgaria.json (nodes, links, exits, timeline, founders). Texts live in bulgaria.html. */
(() => {
const { $, L, C } = RN;
const NS = 'http://www.w3.org/2000/svg';
const T2 = (bg, en) => `<tspan lang="bg">${bg}</tspan><tspan lang="en">${en}</tspan>`;

RN.data('bulgaria').then(D => {
  backbone(D);
  timeline(D.timeline);
  founders(D.founders);
}).catch(() => { RN.dataFail && RN.dataFail($('#bgNet').parentNode); });
growth();
uplinks();

/* member login: not available yet */
$('#memberBtn')?.addEventListener('click', e => RN.toast(`<b>⚠</b>${L('Временно недостъпен', 'Temporarily unavailable')}`, 2600, e.currentTarget));

/* ---------- 1. backbone map ---------- */
function backbone(D) {
  const svg = $('#bgNet');
  if (!window.d3) { svg.innerHTML = `<text x="500" y="320" text-anchor="middle" fill="${C.gy}" font-size="18">d3 ✗</text>`; return; }
  const BBOX = { type: 'MultiPoint', coordinates: [[22.36, 41.24], [28.61, 44.22]] };
  const proj = d3.geoMercator().fitExtent([[110, 80], [900, 575]], BBOX);
  const P = ([lo, la]) => proj([lo, la]);
  const N = Object.fromEntries(D.nodes.map(n => { const [x, y] = P([n.lon, n.lat]); return [n.id, { ...n, x, y }]; }));
  const line = d3.line().curve(d3.curveCatmullRom.alpha(.5));
  const links = D.links.map((k, i) => {
    const a = N[k.a], b = N[k.b];
    let d;
    if (k.via) d = line([[a.x, a.y], ...k.via.map(P), [b.x, b.y]]);
    else if (k.px) d = line([[a.x, a.y], ...k.px, [b.x, b.y]]); // via points given in map pixels
    else if (k.bend) { const [cx, cy] = P(k.bend); d = `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`; }
    else d = `M${a.x},${a.y} L${b.x},${b.y}`;
    return { ...k, i, d, cut: false };
  });

  let h = `<defs>
    <radialGradient id="bgnGlow"><stop offset="0" stop-color="#3ee6ff" stop-opacity=".35"/><stop offset="1" stop-color="#3ee6ff" stop-opacity="0"/></radialGradient>
    <pattern id="bgnGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(120,170,255,.06)"/></pattern></defs>
    <rect width="1000" height="640" fill="url(#bgnGrid)"/>
    <g id="bgnLand"></g><g id="bgnExits"></g><g id="bgnLinks"></g><g id="bgnPk"></g><g id="bgnNodes"></g>`;
  svg.innerHTML = h;

  /* land outline (optional: the map works without it) */
  if (window.topojson) fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json').then(r => r.json()).then(t => {
    const f = topojson.feature(t, t.objects.countries).features.find(x => x.id === '100'); if (!f) return;
    $('#bgnLand').innerHTML = `<path class="bgnLand" d="${d3.geoPath(proj)(f)}"/>`;
    fitTicker(); setTimeout(fitTicker, 1000); // again once the map has finished sliding into place
  }).catch(() => {});

  /* cross-border routes to GÉANT */
  $('#bgnExits').innerHTML = D.exits.map(e => {
    const a = N[e.from], x = a.x + e.dx, y = a.y + e.dy, up = e.dy < 0;
    // two links (2 × 100 Gb) drawn as half-ellipses on either side of the chord Sofia → GÉANT
    const rx = Math.hypot(e.dx, e.dy) / 2, ry = rx * 0.3, rot = Math.atan2(e.dy, e.dx) * 180 / Math.PI;
    const arcs = [0, 1].map(sw => `M${a.x},${a.y} A${rx},${ry} ${rot} 0 ${sw} ${x},${y}`);
    return arcs.map(d => `<path class="bgnExitB" d="${d}"/><path class="bgnExit" d="${d}"/>`).join('') + `<circle cx="${x}" cy="${y}" r="6" fill="${C.vi}" stroke="#fff" stroke-width="2"/>
      <text class="bgnExT" x="${x}" y="${y + (up ? -12 : 20)}" text-anchor="middle">${e.bg ? T2('GÉANT · ' + e.bg, 'GÉANT · ' + e.en) : 'GÉANT'}</text>`;
  }).join('');

  /* legend, bottom-right corner of the map */
  const LG = [['dot', 'точка на присъствие', 'point of presence'], ['ln', '100 Gb свързаност', '100 Gb connectivity'], ['spur', '10 Gb (основно за бекъп)', '10 Gb (mainly for backup)'], ['ext', 'връзки към GÉANT', 'links to GÉANT']];
  svg.insertAdjacentHTML('beforeend', `<g class="bgnLegS" transform="translate(709,487)"><rect x="0" y="0" width="235" height="120" rx="12"/>${LG.map(([k, b, e], i) => {
    const y = 24 + i * 25;
    const sym = k === 'dot' ? `<circle cx="26" cy="${y}" r="10" fill="rgba(79,140,255,.18)"/><circle cx="26" cy="${y}" r="5.5" fill="#4f8cff" stroke="#fff" stroke-width="1.6"/>`
      : `<line x1="12" y1="${y}" x2="40" y2="${y}" class="${k}"/>`;
    return sym + `<text x="54" y="${y + 5}">${T2(b, e)}</text>`;
  }).join('')}</g>`);

  const nm = t => t.replace(/\n/g, ' ');
  /* links: glow band + flowing dashes + wide transparent hit area */
  $('#bgnLinks').innerHTML = links.map(k => `<g class="bgnL${k.spur || k.bak ? ' spur' : ''}" data-i="${k.i}">
      <path class="band" d="${k.d}"/><path class="wire" d="${k.d}"/><path class="hit" d="${k.d}"><title>${nm(N[k.a].bg)} — ${nm(N[k.b].bg)} / ${nm(N[k.a].en)} — ${nm(N[k.b].en)}${k.bak ? ' · 10 Gb' : ''}</title></path>
      <text class="scis" text-anchor="middle">✂</text></g>`).join('');
  const gEls = [...svg.querySelectorAll('.bgnL')];
  gEls.forEach((g, i) => {
    const p = g.querySelector('.wire'), len = p.getTotalLength(), m = p.getPointAtLength(len / 2);
    links[i].el = p; links[i].len = len; links[i].g = g;
    const s = g.querySelector('.scis'); s.setAttribute('x', m.x); s.setAttribute('y', m.y + 7);
  });

  /* nodes */
  const LBL = { n: [0, -16, 'middle'], s: [0, 26, 'middle'], e: [14, 5, 'start'], w: [-14, 5, 'end'], nw: [-6, -16, 'end'] };
  $('#bgnNodes').innerHTML = Object.values(N).map(n => {
    const [dx, dy, an] = Array.isArray(n.lab) ? n.lab : LBL[n.lab || 'n'];
    /* a name may break over two lines ("\n") */
    const ln = t => t.split('\n').map((w, i) => `<tspan x="${dx}" dy="${i ? '1.1em' : 0}">${w}</tspan>`).join('');
    return `<g class="bgnN" data-id="${n.id}" transform="translate(${n.x},${n.y})">
      <circle class="halo" r="13"/><circle class="ring" r="13"/><circle class="c" r="6.5"/>
      <text x="${dx}" y="${dy}" text-anchor="${an}">${T2(ln(n.bg), ln(n.en))}</text></g>`;
  }).join('');

  /* packets: pool of circles moving along live links in both directions */
  const pk = [];
  links.forEach(k => { const n = k.spur || k.bak ? 2 : 4; for (let j = 0; j < n; j++) pk.push({ k, t: Math.random(), dir: j % 2 ? -1 : 1, v: 70 + Math.random() * 60 }); });
  $('#bgnPk').innerHTML = pk.map(p => `<circle r="${p.k.spur || p.k.bak ? 2.6 : 3.2}" fill="${p.k.spur || p.k.bak ? C.cy : (p.dir > 0 ? '#4f8cff' : '#c4d8ff')}"/>`).join('');
  const pkEls = [...$('#bgnPk').children];

  RN.loop(svg, dt => {
    pk.forEach((p, i) => {
      const el = pkEls[i];
      if (p.k.cut || p.k.dead) { el.style.display = 'none'; return; }
      el.style.display = '';
      p.t += p.dir * p.v * dt / p.k.len; if (p.t > 1) p.t -= 1; if (p.t < 0) p.t += 1;
      const q = p.k.el.getPointAtLength(p.t * p.k.len); el.setAttribute('cx', q.x); el.setAttribute('cy', q.y);
    });
  });

}

/* the ticker under the map title runs only in the free gap above the country's outline:
   find the widest stretch of its line that the land shape does not cover, end it at the highest point of the outline
   on the right, and fit the ticker window to it */
function fitTicker() {
  const sub = $('.kSub.ticker'), land = $('#bgNet .bgnLand'), svg = $('#bgNet');
  if (!sub || !land) return;
  sub.style.marginLeft = sub.style.width = '';
  const col = sub.getBoundingClientRect(), m = svg.getScreenCTM().inverse(), pad = 10;
  if (getComputedStyle(sub).display === 'none' || !col.width) return;
  setPace(col.width);
  let best = [0, 0], start = null;
  for (let x = col.left; x <= col.right; x += 2) {
    let free = true;
    for (let y = col.top; free && y <= col.bottom; y += 2) if (land.isPointInFill(new DOMPoint(x, y).matrixTransform(m))) free = false;
    if (free && start === null) start = x;
    if (!free && start !== null) { if (x - start > best[1] - best[0]) best = [start, x]; start = null; }
  }
  if (start !== null && col.right - start > best[1] - best[0]) best = [start, col.right]; // a stretch that runs to the right end
  /* the ticker enters from the right at the highest point of the outline on the right-hand side (by Ruse), not at the map's edge */
  const ctm = svg.getScreenCTM(), L = land.getTotalLength(), mid = (best[0] + best[1]) / 2;
  let peak = null;
  for (let i = 0; i <= 3000; i++) { const p = land.getPointAtLength(L * i / 3000).matrixTransform(ctm); if (p.x > mid && p.x < best[1] + 400 && (!peak || p.y < peak.y)) peak = p; }
  if (peak && peak.x < best[1]) best[1] = peak.x;
  const w = best[1] - best[0] - 2 * pad;
  if (w < 160) return setPace(col.width); // too narrow: keep the full title width
  sub.style.marginLeft = (best[0] + pad - col.left) + 'px';
  sub.style.width = w + 'px';
  setPace(w);
}
/* the gap between the two copies = 90% of the window: while one copy fades out over the left 10%, the next fades in over the right 10%
   (the duration keeps the speed at ~58 px/s) */
function setPace(w) {
  const sub = $('.kSub.ticker'), txt = sub && sub.querySelector('.tkI');
  if (!txt) return;
  const gap = Math.round(w * 0.9);
  sub.style.setProperty('--tkGap', gap + 'px');
  sub.style.setProperty('--tkDur', ((txt.getBoundingClientRect().width + gap) / 58).toFixed(1) + 's');
}
addEventListener('resize', () => { clearTimeout(fitTicker.t); fitTicker.t = setTimeout(fitTicker, 150); });
document.addEventListener('rn:tab', () => setTimeout(fitTicker, 60));
document.addEventListener('rn:lang', () => setTimeout(fitTicker, 60)); // the English line has another length
$('.bgnet')?.addEventListener('transitionend', () => fitTicker());

/* ---------- 2. timeline ---------- */
function timeline(items) {
  /* the text is a paragraph, or a bullet list when the json gives an array of sentences */
  const body = e => Array.isArray(e.bg[1])
    ? `<ul class="bgTlL">${e.bg[1].map((b, i) => `<li>${L(b, e.en[1][i] || b)}</li>`).join('')}</ul>`
    : `<p>${L(e.bg[1], e.en[1])}</p>`;
  $('#bgTl').innerHTML = items.map(e => `<div class="bgTlI reveal${e.warn ? ' warn' : ''}${e.ok ? ' ok' : ''}${e.now ? ' now' : ''}">
    <div class="yy">${e.now ? L('Днес', 'Today') : e.y}</div><i class="pt"></i>
    <div class="bx"><h4>${L(e.bg[0], e.en[0])}</h4>${body(e)}</div></div>`).join('');
  RN.enhance($('#bgTl'));
}
function founders(list) {
  $('#founders').innerHTML = list.map(f => `<li class="reveal">${L(f.bg, f.en)}</li>`).join('');
  RN.enhance($('#founders'));
}

/* ---------- 3. member growth: 7 founders → 30+ members ---------- */
function growth() {
  const svg = $('#growSvg'), cx = 230, cy = 175, TOT = 30, F = 7;
  const pts = []; for (let i = 0; i < TOT; i++) { const a = i * 2.39996, r = 26 + 22 * Math.sqrt(i + 1) * 1.08; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a) * .86]); }
  svg.innerHTML = `<circle cx="${cx}" cy="${cy}" r="150" fill="url(#gGlow)"/><defs><radialGradient id="gGlow"><stop offset="0" stop-color="#8f7dff" stop-opacity=".18"/><stop offset="1" stop-color="#8f7dff" stop-opacity="0"/></radialGradient></defs>
    <g id="gLines">${pts.map(([x, y]) => `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(120,170,255,.25)" stroke-width="1"/>`).join('')}</g>
    <g id="gDots">${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i < F ? 8 : 6.5}" fill="${i < F ? C.am : C.cy}"/>`).join('')}</g>
    <circle cx="${pts[TOT - 1][0] + 34}" cy="${pts[TOT - 1][1] - 8}" r="9" fill="none" stroke="${C.cy}" stroke-dasharray="3 3" id="gPlus"/>
    <text x="${pts[TOT - 1][0] + 34}" y="${pts[TOT - 1][1] - 3.5}" text-anchor="middle" fill="${C.cy}" font-size="13" font-weight="700" id="gPlusT">+</text>
    <circle cx="${cx}" cy="${cy}" r="20" fill="#0b1834" stroke="${C.vi}" stroke-width="2"/><text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#e7efff" font-family="Geologica" font-weight="700" font-size="11">НИМ</text>
    <text x="22" y="40" fill="#e7efff" font-family="Geologica" font-weight="800" font-size="40" id="gNum">7</text>
    <text x="24" y="62" fill="#93a5c8" font-size="13" id="gYr"></text>`;
  const dots = [...svg.querySelectorAll('#gDots circle')], lines = [...svg.querySelectorAll('#gLines line')];
  const plus = [$('#gPlus'), $('#gPlusT')];
  const set = k => { // k: 0..1
    const n = Math.round(F + (TOT - F) * k);
    dots.forEach((d, i) => { const on = i < n; d.style.opacity = on ? 1 : 0; d.style.transform = on ? '' : 'scale(.2)'; });
    lines.forEach((l, i) => l.style.opacity = i < n ? 1 : 0);
    plus.forEach(p => p.style.opacity = k >= 1 ? 1 : 0);
    $('#gNum').textContent = n + (k >= 1 ? '+' : '');
    const yr = k <= 0 ? '2005' : k >= 1 ? '2026' : '…';
    $('#gYr').innerHTML = `${yr} · ${T2('члена', 'members')}`;
    $('#growLbl').innerHTML = L('Оранжево — учредителите от 2005 г.; синьо — членовете днес.', 'Orange — the 2005 founders; blue — today’s members.');
  };
  dots.forEach(d => { d.style.transformBox = 'fill-box'; d.style.transformOrigin = 'center'; d.style.transition = 'opacity .4s, transform .4s'; });
  lines.forEach(l => l.style.transition = 'opacity .4s');
  /* autoplay on a loop: grow 7 → 30+, hold, start again. The button stops it (showing today's state) and resumes it. */
  const DUR = 3200, HOLD = 2600, LEAD = 600;
  let raf = 0, stopped = false;
  const loop = t0 => now => {
    const k = Math.max(0, Math.min(1, (now - t0) / DUR)); set(k);
    raf = requestAnimationFrame(now - t0 > DUR + HOLD ? loop(now + LEAD) : loop(t0));
  };
  const play = () => { cancelAnimationFrame(raf); if (RN.RM || stopped) return set(1); set(0); raf = requestAnimationFrame(loop(performance.now() + LEAD)); };
  set(0); RN.whenNear(svg, play);
  const btn = $('#growBtn');
  btn.addEventListener('click', () => {
    stopped = !stopped; btn.setAttribute('aria-pressed', stopped);
    btn.innerHTML = stopped ? `▶ ${L('Пусни анимацията', 'Play the animation')}` : `⏸ ${L('Спри анимацията', 'Stop the animation')}`;
    if (stopped) { cancelAnimationFrame(raf); set(1); } else play();
  });
}

/* ---------- 4. uplinks ---------- */
function uplinks() {
  const svg = $('#upSvg'), hub = [190, 200];
  const U = [
    { y: 70, col: C.vi, w: [6, 6], cap: 200, t: ['GÉANT', 'GÉANT'], s: ['2 × 100 Gb · Европа и светът', '2 × 100 Gb · Europe and the world'] },
    { y: 200, col: C.cy, w: [7], cap: 100, t: ['BIX', 'BIX'], s: ['100 Gb · българският интернет', '100 Gb · the Bulgarian internet'] },
    { y: 330, col: C.am, w: [3], cap: 25, flo: true, t: ['Комерсиален интернет', 'Commercial internet'], s: ['10–40 Gb · плаващ капацитет', '10–40 Gb · flexible capacity'] },
  ];
  const tx = 400;
  let h = `<defs><radialGradient id="upG"><stop offset="0" stop-color="#3ee6ff" stop-opacity=".25"/><stop offset="1" stop-color="#3ee6ff" stop-opacity="0"/></radialGradient></defs>`;
  // members on the left
  for (let i = 0; i < 7; i++) { const y = 60 + i * 47; h += `<path d="M38 ${y} C110 ${y} 110 ${hub[1]} ${hub[0] - 40} ${hub[1]}" stroke="rgba(120,170,255,.22)" fill="none" class="upIn"/><circle cx="38" cy="${y}" r="5" fill="${C.gr}"/>`; }
  h += `<text x="30" y="30" fill="#93a5c8" font-size="12" font-family="JetBrains Mono">${T2('ЧЛЕНОВЕ', 'MEMBERS')}</text>`;
  U.forEach((u, i) => {
    u.d = u.w.map((w, j) => { const off = (j - (u.w.length - 1) / 2) * 10; return `M${hub[0]} ${hub[1] + off} C${hub[0] + 110} ${hub[1] + off} ${tx - 120} ${u.y + off} ${tx} ${u.y + off}`; });
    u.d.forEach((d, j) => h += `<path d="${d}" stroke="${u.col}" stroke-opacity=".28" stroke-width="${u.w[j] * 2.2}" fill="none" stroke-linecap="round" class="upW${i}"/><path d="${d}" stroke="${u.col}" stroke-width="1.4" fill="none" class="upP" data-u="${i}"/>`);
    h += `<g transform="translate(${tx + 14},${u.y})"><rect x="0" y="-26" width="206" height="52" rx="12" fill="#0b1834" stroke="${u.col}"/>
      <text x="12" y="-4" fill="#e7efff" font-family="Geologica" font-weight="700" font-size="14">${T2(u.t[0], u.t[1])}</text>
      <text x="12" y="14" fill="${u.col}" font-size="10.5" font-family="JetBrains Mono" id="upS${i}">${T2(u.s[0], u.s[1])}</text></g>`;
  });
  /* packets first, then the hub on top of them: the sphere is opaque, nothing shows through it */
  h += `<g id="upPk"></g><circle cx="${hub[0]}" cy="${hub[1]}" r="70" fill="url(#upG)"/><circle cx="${hub[0]}" cy="${hub[1]}" r="38" fill="#0b1834" stroke="${C.cy}" stroke-width="2"/>
    <text x="${hub[0]}" y="${hub[1] + 5}" text-anchor="middle" fill="#e7efff" font-family="Geologica" font-weight="800" font-size="15">NRN BG</text>
    <text x="${hub[0]}" y="${hub[1] + 60}" text-anchor="middle" fill="#93a5c8" font-size="10.5" font-family="JetBrains Mono">AS · 256 × /24</text>
    <text x="${tx + 117}" y="388" text-anchor="middle" fill="#93a5c8" font-size="11"><tspan lang="bg" id="upFloB"></tspan><tspan lang="en" id="upFloE"></tspan></text>`;
  svg.innerHTML = h;
  const paths = [...svg.querySelectorAll('.upP')].map(p => ({ p, u: +p.dataset.u, len: p.getTotalLength() }));
  const ins = [...svg.querySelectorAll('.upIn')].map(p => ({ p, len: p.getTotalLength() }));
  const pk = [];
  paths.forEach(o => { const n = Math.round(U[o.u].cap / 25) + 2; for (let j = 0; j < n; j++) pk.push({ o, t: Math.random(), dir: j % 3 ? 1 : -1, col: U[o.u].col }); });
  ins.forEach(o => { for (let j = 0; j < 2; j++) pk.push({ o, t: Math.random(), dir: 1, col: C.gr, inb: 1 }); });
  $('#upPk').innerHTML = pk.map(p => `<circle r="${p.inb ? 2.4 : 3}" fill="${p.col}"/>`).join('');
  const els = [...$('#upPk').children];
  const floW = svg.querySelectorAll('.upW2');
  let tt = 0, lastF = -1;
  RN.loop(svg, (dt, now) => {
    tt += dt;
    const flo = 25 + 15 * Math.sin(tt * .7); // demo of a flexible 10–40 Gb pipe
    floW.forEach(w => w.setAttribute('stroke-width', (flo / 40) * 12));
    const fv = Math.round(flo); if (fv !== lastF) { lastF = fv; $('#upFloB').textContent = `в момента ≈ ${fv} Gb (демонстрация)`; $('#upFloE').textContent = `now ≈ ${fv} Gb (demo)`; }
    pk.forEach((p, i) => {
      const sp = p.inb ? 90 : 60 + (U[p.o.u] ? U[p.o.u].cap : 50) * .5;
      p.t += p.dir * sp * dt / p.o.len; if (p.t > 1) p.t -= 1; if (p.t < 0) p.t += 1;
      const q = p.o.p.getPointAtLength(p.t * p.o.len); els[i].setAttribute('cx', q.x); els[i].setAttribute('cy', q.y);
    });
  });
}
})();

/* ---------- FAQ accordion + category filter ---------- */
(() => {
  const root = document.getElementById('faq'); if (!root) return;
  const items = [...root.querySelectorAll('.faqI')], all = root.querySelector('.faqAll');
  const set = (it, on) => { it.classList.toggle('open', on); it.querySelector('.faqQ').setAttribute('aria-expanded', on); };
  const sync = () => { const vis = items.filter(i => !i.hidden); all.setAttribute('aria-pressed', vis.length > 0 && vis.every(i => i.classList.contains('open'))); };
  items.forEach(it => it.querySelector('.faqQ').addEventListener('click', () => { set(it, !it.classList.contains('open')); sync(); }));
  all.addEventListener('click', () => { const on = all.getAttribute('aria-pressed') !== 'true'; items.filter(i => !i.hidden).forEach(i => set(i, on)); sync(); });
  const filter = f => { items.forEach(i => { i.hidden = f !== '*' && i.dataset.cat !== f; }); sync(); };
  root.querySelectorAll('.faqChips .chip').forEach(ch => ch.addEventListener('click', () => {
    root.querySelectorAll('.faqChips .chip').forEach(c => c.classList.toggle('on', c === ch)); filter(ch.dataset.f);
  }));
  /* start on the chip marked .on in the markup (Membership), all questions closed */
  filter((root.querySelector('.faqChips .chip.on') || {}).dataset?.f || '*');
})();

/* FAQ: the side card matches the height of the first visible question while it is open */
(() => {
  const root = document.getElementById('faq'); if (!root) return;
  const side = root.querySelector('.faqSide'), items = [...root.querySelectorAll('.faqI')];
  const fit = () => {
    side.style.minHeight = '';
    if (innerWidth <= 900) return;
    /* stretch the card down to the bottom edge of the first visible question that reaches below its natural height,
       so the card's top and bottom always line up with question edges */
    const vis = items.filter(i => !i.hidden); if (!vis.length) return;
    const top = vis[0].getBoundingClientRect().top, need = side.offsetHeight;
    const hit = vis.find(i => i.getBoundingClientRect().bottom - top >= need - 1);
    if (hit) side.style.minHeight = (hit.getBoundingClientRect().bottom - top) + 'px';
  };
  const ro = new ResizeObserver(fit); items.forEach(i => ro.observe(i));
  addEventListener('resize', fit); document.addEventListener('rn:tab', () => setTimeout(fit, 50)); fit();
})();

/* hero swap (experiment): h1 and lead take turns every 10 s, centred in the block's original height */
(() => {
  const box = document.querySelector('.heroSwap'); if (!box) return;
  const [a, b] = box.children; let cur = 0;
  const measure = () => {
    box.classList.remove('swapOn'); box.style.minHeight = '';
    const lh = parseFloat(getComputedStyle(b).lineHeight) || 20; /* keep the original 2-line block height even if the text grows */
    const h = Math.round(a.offsetHeight + parseFloat(getComputedStyle(a).marginBottom) + Math.min(b.offsetHeight, 2 * lh));
    box.classList.add('swapOn'); box.style.minHeight = h + 'px';
  };
  const show = i => {
    const on = i ? b : a, off = i ? a : b;
    off.classList.add('off', 'up'); on.classList.remove('off');
    on.classList.remove('up');
    setTimeout(() => { if (off.classList.contains('off')) off.classList.remove('up'); }, 950);
  };
  b.classList.add('off'); measure();
  addEventListener('resize', measure); document.addEventListener('rn:lang', measure);
  setInterval(() => { cur ^= 1; show(cur); }, 10000);
})();

/* section heading swap: a section's h2 and its paragraph take turns every 10 s (same 3D flip as the hero);
   the block keeps the height of the taller of the two, each one centred in it */
document.querySelectorAll('.secSwap').forEach(box => {
  const [a, b] = box.children; let cur = 0;
  const measure = () => {
    box.classList.remove('swapOn'); box.style.minHeight = '';
    a.style.display = 'block'; b.style.display = 'none'; const ha = a.offsetHeight;
    a.style.display = 'none'; b.style.display = 'block'; const hb = b.offsetHeight;
    a.style.display = b.style.display = '';
    box.classList.add('swapOn'); box.style.minHeight = Math.max(ha, hb) + 'px';
  };
  const show = i => {
    const on = i ? b : a, off = i ? a : b;
    off.classList.add('off', 'up'); on.classList.remove('off', 'up');
    setTimeout(() => { if (off.classList.contains('off')) off.classList.remove('up'); }, 950);
  };
  b.classList.add('off'); measure();
  addEventListener('resize', measure); document.addEventListener('rn:lang', measure); document.addEventListener('rn:tab', () => setTimeout(measure, 0));
  setInterval(() => { cur ^= 1; show(cur); }, 10000);
});
