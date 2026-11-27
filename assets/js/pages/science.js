/* Mega-science page: LHC tiers, HL-LHC chart, Copernicus orbit + pipeline, EHT globe, e-VLBI, SKA, ITER, climate */
(() => {
const { $, $$, L, C } = RN;
const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" fill="${o.f || '#cfe0ff'}" font-size="${o.s || 11}" font-family="${o.ff || 'Golos Text'}"${o.w ? ` font-weight="${o.w}"` : ''}>${s}</text>`;
const tl = (x, y, bg, en, o = {}) => txt(x, y, bg, o).replace('<text', '<text lang="bg"') + txt(x, y, en, o).replace('<text', '<text lang="en"');
const chips = (id, fn) => $(`#${id} .ucCtl`).addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; $$(`#${id} .ucCtl .chip`).forEach(x => x.classList.toggle('on', x === b)); fn(b.dataset.m); });

/* ---------- LHC tiers ---------- */
(function lhc() {
  const s = $('#art-lhc'), cx = 260, cy = 190;
  let h = `<defs><radialGradient id="cern"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="${C.cy}"/><stop offset="1" stop-color="${C.cy}" stop-opacity="0"/></radialGradient></defs>`;
  const t1 = [...Array(12)].map((_, i) => { const a = i / 12 * 6.283 - 1.2; return [cx + Math.cos(a) * 105, cy + Math.sin(a) * 92]; });
  const t2 = [...Array(30)].map((_, i) => { const a = i / 30 * 6.283 + .1, r = 160 + (i % 3) * 12; return [cx + Math.cos(a) * r * 1.35, cy + Math.sin(a) * r * .95]; }).filter(p => p[0] > 10 && p[0] < 510 && p[1] > 10 && p[1] < 370);
  let one = '', opn = '';
  t2.forEach((p, i) => [t2[(i + 1) % t2.length], t2[(i + 4) % t2.length], t1[i % 12]].forEach(q => { one += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${C.vi}" stroke-width=".9" opacity=".45" class="flow"/>`; }));
  t1.forEach(p => { opn += `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="${C.cy}" stroke-width="2.4" class="flow" style="animation-duration:.7s"/>`; });
  h += `<g id="lone">${one}</g><g id="lopn">${opn}</g>`;
  t2.forEach(p => h += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${C.vi}"/>`);
  t1.forEach(p => h += `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="#081226" stroke="${C.cy}" stroke-width="2"/>`);
  h += `<circle cx="${cx}" cy="${cy}" r="44" fill="url(#cern)" opacity=".55"><animate attributeName="r" values="38;50;38" dur="3s" repeatCount="indefinite"/></circle><circle cx="${cx}" cy="${cy}" r="20" fill="#081226" stroke="#fff" stroke-width="2"/>` + txt(cx, cy + 4, 'T0', { f: '#fff', s: 10, w: 700, ff: 'JetBrains Mono' });
  h += tl(cx, cy + 38, 'ЦЕРН, Женева', 'CERN, Geneva');
  h += `<g font-family="JetBrains Mono" font-size="10"><text x="14" y="22" fill="${C.cy}">● Tier-1 · LHCOPN</text><text x="14" y="38" fill="${C.vi}">● Tier-2/3 · LHCONE</text></g>`;
  s.innerHTML = h;
  chips('lhc', m => { $('#lone', s).style.opacity = m === 'opn' ? .08 : 1; $('#lopn', s).style.opacity = m === 'one' ? .1 : 1; });
})();

/* ---------- HL-LHC readiness ---------- */
RN.bars($('#hlChart'), [
  { label: `<b>DC24 · ${L('устойчив', 'sustained')}</b>2024`, v: 2.4, txt: '2.4 Tbps', color: 'linear-gradient(90deg,#8f7dff,#5aa8ff)' },
  { label: `<b>DC24 · ${L('пик', 'peak')}</b>2024`, v: 3, txt: '>3 Tbps', color: 'linear-gradient(90deg,#8f7dff,#5aa8ff)' },
  { label: `<b>HL-LHC · ${L('минимален модел', 'minimal model')}</b>~2030`, v: 4.8, txt: '4.8 Tbps', color: 'linear-gradient(90deg,#ffb547,#ff6ad5)' },
  { label: `<b>HL-LHC · ${L('гъвкав модел', 'flexible model')}</b>~2030`, v: 9.6, txt: '9.6 Tbps', color: 'linear-gradient(90deg,#ffb547,#ff6ad5)' },
], { max: 10 });

/* ---------- Copernicus: orbit + downlink ---------- */
(function orbit() {
  const s = $('#orbitSvg');
  const ST = [['Kiruna', 'Кируна', 'SE', 250], ['Redu', 'Реду', 'BE', 480], ['Santa Maria', 'Санта Мария', 'PT', 710]];
  let h = `<path d="M-40 330 Q480 170 1000 330 Z" fill="#0f2a4f" stroke="#1d3466"/><path d="M-40 330 Q480 190 1000 330" fill="none" stroke="rgba(62,230,255,.2)" stroke-width="6"/>`;
  for (let i = 0; i < 60; i++) h += `<circle cx="${(i * 97) % 960}" cy="${(i * 37) % 150}" r="${i % 5 ? .7 : 1.3}" fill="#fff" opacity="${.15 + (i % 4) / 8}"/>`;
  h += `<path d="M40 150 Q480 20 920 150" fill="none" stroke="rgba(255,255,255,.12)" stroke-dasharray="3 6"/>`;
  h += `<g transform="translate(870,40)"><rect x="-14" y="-8" width="28" height="16" rx="3" fill="#e7efff"/><rect x="-40" y="-5" width="22" height="10" fill="${C.am}"/><rect x="18" y="-5" width="22" height="10" fill="${C.am}"/></g>` + txt(870, 72, 'EDRS', { f: C.am, ff: 'JetBrains Mono', s: 11 }) + tl(870, 86, 'лазерно реле', 'laser relay', { f: '#93a5c8', s: 10 });
  h += `<line id="laser" x1="0" y1="0" x2="870" y2="40" stroke="${C.rd}" stroke-width="1.4" stroke-dasharray="6 4" opacity=".8"/><line x1="870" y1="48" x2="480" y2="236" stroke="${C.rd}" stroke-width="1" stroke-dasharray="3 5" opacity=".4"/>`;
  ST.forEach(([en, bg, cc, x]) => { const y = 330 - (1 - Math.pow((x - 480) / 520, 2)) * 80 - 12;
    h += `<path id="beam-${cc}" d="" fill="${C.cy}" opacity="0"/><g transform="translate(${x},${y})"><path d="M-12 -2 Q0 -22 12 -2" fill="none" stroke="#e7efff" stroke-width="2"/><line x1="0" y1="-10" x2="0" y2="4" stroke="#e7efff" stroke-width="1.6"/></g>` + tl(x, y + 22, `${bg} · ${cc}`, `${en} · ${cc}`, { s: 11 }); });
  h += `<g id="sat"><rect x="-9" y="-6" width="18" height="12" rx="2" fill="#e7efff"/><rect x="-32" y="-4" width="20" height="8" fill="${C.bl}"/><rect x="12" y="-4" width="20" height="8" fill="${C.bl}"/></g>` + `<text id="satL" font-family="JetBrains Mono" font-size="10" fill="${C.cy}">SENTINEL</text>`;
  h += txt(20, 24, 'X-BAND DOWNLINK · CSC GROUND SEGMENT', { a: 'start', f: '#5e7096', ff: 'JetBrains Mono', s: 10 });
  s.innerHTML = h;
  const sat = $('#sat', s), lab = $('#satL', s), laser = $('#laser', s);
  const stations = ST.map(([, , cc, x]) => ({ x, y: 330 - (1 - Math.pow((x - 480) / 520, 2)) * 80 - 12, el: $(`#beam-${cc}`, s) }));
  RN.loop(s, (dt, now) => {
    const k = (now / 12000) % 1, x = 40 + k * 880, y = 150 - (1 - Math.pow(2 * k - 1, 2)) * 65;
    sat.setAttribute('transform', `translate(${x},${y})`); lab.setAttribute('x', x + 36); lab.setAttribute('y', y + 4);
    laser.setAttribute('x1', x); laser.setAttribute('y1', y);
    stations.forEach(st => { const d = Math.abs(st.x - x), on = d < 90; st.el.setAttribute('opacity', on ? (.28 * (1 - d / 90)).toFixed(2) : 0); st.el.setAttribute('d', `M${x - 6} ${y + 6} L${x + 6} ${y + 6} L${st.x + 16} ${st.y} L${st.x - 16} ${st.y} Z`); });
  });
})();
$('#copPipe').innerHTML = [
  ['<path d="M5 12h4M15 12h4M9 8h6v8H9z"/>', ['Спътници Sentinel', 'Sentinel satellites'], ['Copernicus Space Component', 'Copernicus Space Component'], '55,56'],
  ['<path d="M4 18 Q12 4 20 18"/><path d="M12 11v9"/>', ['Приемни станции + EDRS', 'Ground stations + EDRS'], ['Кируна · Реду · Санта Мария', 'Kiruna · Redu · Santa Maria'], '44,57'],
  ['<rect x="4" y="5" width="16" height="5" rx="1"/><rect x="4" y="14" width="16" height="5" rx="1"/>', ['Обработка и архив (PAC)', 'Processing & archive (PAC)'], ['вкл. DLR, Германия', 'incl. DLR, Germany'], '44,59'],
  ['<path d="M2 12c4-6 16-6 20 0M2 12c4 6 16 6 20 0"/>', ['CSC WAN · GÉANT', 'CSC WAN · GÉANT'], ['мрежата на Copernicus', 'the Copernicus network'], '44,60,61'],
  ['<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', ['Copernicus Data Space', 'Copernicus Data Space'], ['глобален достъп за потребителите', 'global user access'], '58'],
].map(([ic, t, d, c]) => `<div class="stage"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${ic}</svg></div><div><b>${L(...t)}</b><span>${L(...d)}${RN.cite(c)}</span></div></div>`).join('');

/* ---------- EHT globe ---------- */
(function globe() {
  const svg = $('#globe');
  if (!window.d3 || !window.topojson) { svg.outerHTML = `<div class="mapFail">${L('Глобусът не можа да се зареди.', 'The globe could not load.')}</div>`; return; }
  const ST = [['ALMA · APEX', -67.75, -23.02], ['LMT', -97.31, 18.99], ['SMA · JCMT', -155.48, 19.82], ['SMT · Kitt Peak', -110.7, 32.3], ['IRAM 30 m', -3.39, 37.07], ['NOEMA', 5.91, 44.63], ['GLT', -68.69, 76.53], ['SPT', -45, -89.9]];
  const CO = [['MIT Haystack', -71.49, 42.62], ['MPIfR Bonn', 7.07, 50.73]];
  const proj = d3.geoOrthographic().scale(235).translate([260, 260]).clipAngle(90), path = d3.geoPath(proj), S = d3.select(svg);
  S.append('circle').attr('cx', 260).attr('cy', 260).attr('r', 235).attr('fill', '#0a1a3a').attr('stroke', 'rgba(62,230,255,.35)');
  const grat = S.append('path').attr('fill', 'none').attr('stroke', 'rgba(120,170,255,.08)');
  const land = S.append('path').attr('fill', '#16305c').attr('stroke', '#22407a').attr('stroke-width', .5);
  const gL = S.append('g'), gS = S.append('g');
  let landF = null, draw = () => {};
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json').then(r => r.json()).then(t => { landF = topojson.feature(t, t.objects.land); draw(0); }).catch(() => {});
  /* European stations -> Bonn, all others -> Haystack (schematic) */
  const links = ST.map(s => ({ s, c: ['IRAM 30 m', 'NOEMA'].includes(s[0]) ? CO[1] : CO[0] }));
  const lp = links.map(() => gL.append('path').attr('fill', 'none').attr('stroke', C.cy).attr('stroke-width', 1.4).attr('stroke-dasharray', '4 5').attr('opacity', .8));
  const sNodes = ST.map(s => { const g = gS.append('g'); g.append('circle').attr('r', 5).attr('fill', C.am).attr('stroke', '#fff'); g.append('text').attr('x', 8).attr('y', 4).attr('fill', '#ffe2b5').attr('font-size', 11).attr('font-family', 'JetBrains Mono').text(s[0]); return g; });
  const cNodes = CO.map(c => { const g = gS.append('g'); g.append('rect').attr('x', -6).attr('y', -6).attr('width', 12).attr('height', 12).attr('fill', C.vi).attr('stroke', '#fff'); g.append('text').attr('x', 10).attr('y', 4).attr('fill', '#d9d2ff').attr('font-size', 11).attr('font-weight', 700).attr('font-family', 'JetBrains Mono').text(c[0]); return g; });
  let lam = 60, dash = 0;
  const vis = (lon, lat) => d3.geoDistance([lon, lat], [-proj.rotate()[0], -proj.rotate()[1]]) < Math.PI / 2;
  draw = dt => {
    lam -= dt * 9; dash -= dt * 30; proj.rotate([lam, -18]);
    grat.attr('d', path(d3.geoGraticule10())); if (landF) land.attr('d', path(landF));
    links.forEach((l, i) => lp[i].attr('d', path({ type: 'LineString', coordinates: [[l.s[1], l.s[2]], [l.c[1], l.c[2]]] })).attr('stroke-dashoffset', dash));
    [[ST, sNodes], [CO, cNodes]].forEach(([arr, nodes]) => arr.forEach((s, i) => { const v = vis(s[1], s[2]); nodes[i].style('display', v ? null : 'none'); if (v) { const [x, y] = proj([s[1], s[2]]); nodes[i].attr('transform', `translate(${x},${y})`); } }));
  };
  RN.loop(svg, draw);
})();

/* ---------- e-VLBI ---------- */
(function vlbi() {
  const s = $('#art-vlbi'); let h = `<path d="M-20 400 Q260 230 540 400" fill="#0c2244" stroke="#1d3466"/>`;
  const T = [['Jodrell Bank', 70, 336], ['Onsala', 145, 304], ['Toruń', 218, 290], ['Medicina', 300, 291], ['Asia', 378, 304], ['Africa', 450, 332]], jx = 260, jy = 70;
  h += `<g id="vlive">${T.map((t, i) => `<path d="M${t[1]} ${t[2] - 18} Q ${(t[1] + jx) / 2} ${t[2] - 120} ${jx} ${jy + 22}" fill="none" stroke="${C.cy}" stroke-width="1.6" class="flow" style="animation-duration:${.8 + i * .07}s"/>`).join('')}</g>`;
  h += `<g id="vmail" style="opacity:0"><g id="truck"><rect x="-20" y="-11" width="30" height="20" rx="3" fill="${C.am}"/><rect x="10" y="-5" width="12" height="14" rx="2" fill="#d48f2a"/><circle cx="-12" cy="11" r="4" fill="#222"/><circle cx="14" cy="11" r="4" fill="#222"/>${txt(-5, 3, 'HDD', { f: '#151515', s: 9, ff: 'JetBrains Mono', w: 700 })}<text id="hddN" x="-5" y="-17" text-anchor="middle" fill="${C.am}" font-size="10" font-family="JetBrains Mono" font-weight="700"></text></g><rect id="disk" x="-5" y="-4" width="10" height="8" rx="1.5" fill="${C.am}" style="opacity:0"/></g>`;
  T.forEach(([n, x, y]) => { h += `<g transform="translate(${x},${y})"><path d="M-14 -24 Q0 -2 14 -24" fill="none" stroke="#e7efff" stroke-width="2.2"/><line x1="0" y1="-12" x2="0" y2="-30" stroke="#e7efff" stroke-width="1.4"/><circle cx="0" cy="-31" r="2" fill="${C.cy}"/><path d="M-5 -8 L0 -16 L5 -8 Z" fill="#93a5c8"/></g>` + txt(x, y + 14, n, { s: 10, ff: 'JetBrains Mono' }); });
  h += `<rect x="${jx - 58}" y="${jy - 22}" width="116" height="44" rx="10" fill="#081226" stroke="${C.vi}" stroke-width="1.8"/>` + txt(jx, jy - 2, 'JIVE', { f: '#fff', ff: 'Geologica', w: 700, s: 14 }) + txt(jx, jy + 13, 'correlator · NL', { f: '#93a5c8', ff: 'JetBrains Mono', s: 9.5 });
  for (let i = 0; i < 40; i++) h += `<circle cx="${(i * 97) % 520}" cy="${(i * 53) % 200}" r="${i % 4 ? .8 : 1.4}" fill="#fff" opacity="${.2 + (i % 5) / 8}"/>`;
  h += `<g id="sn" transform="translate(440,60)"><circle r="6" fill="${C.pk}"><animate attributeName="r" values="3;9;3" dur="2s" repeatCount="indefinite"/></circle>${tl(12, 4, 'свръхнова', 'supernova', { a: 'start', f: C.pk, s: 10, ff: 'JetBrains Mono' })}</g>`;
  h += `<text id="vlab" x="14" y="22" fill="${C.cy}" font-size="11" font-family="JetBrains Mono">LIVE · 1–2.5 Gbps / telescope</text>`;
  s.innerHTML = h;
  let mode = 'live', t0 = 0; const truck = $('#truck', s), disk = $('#disk', s), hddN = $('#hddN', s), jive = s.querySelector(`rect[stroke="${C.vi}"]`);
  /* "by post": the truck drives along the ground from telescope to telescope, picks up a disk at each, then leaves for the correlator */
  const gy = x => { const P = [[-40, T[0][2]], ...T.map(t => [t[1], t[2]]), [560, T[5][2]]]; for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const [x0, y0] = P[i - 1], [x1, y1] = P[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return P[P.length - 1][1]; };
  const V = 80, DW = 0.9, OFF = 34, plan = []; { let x = -40, t = 0; T.forEach((tt, i) => { const sx = tt[1] - OFF, d = (sx - x) / V; plan.push({ t0: t, t1: t + d, x0: x, x1: sx }); t += d; plan.push({ t0: t, t1: t + DW, x0: sx, x1: sx, pick: i }); t += DW; x = sx; }); const d = (580 - x) / V; plan.push({ t0: t, t1: t + d, x0: x, x1: 580 }); t += d; plan.push({ t0: t, t1: t + 2.2, x0: 580, x1: 580, deliver: true }); }
  const CYC = plan[plan.length - 1].t1;
  RN.loop(s, (dt, now) => {
    if (mode !== 'mail') return;
    const t = ((now - t0) / 1000) % CYC, p = plan.find(q => t < q.t1) || plan[plan.length - 1], k = Math.min(1, (t - p.t0) / (p.t1 - p.t0));
    const ease = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2, x = p.x0 + (p.x1 - p.x0) * ease, y = gy(x + OFF * 0) - 15;
    truck.setAttribute('transform', `translate(${x},${y})`);
    const got = plan.filter(q => q.pick !== undefined && (q.t1 <= t || q === p)).length - (p.pick !== undefined && k < .6 ? 1 : 0);
    hddN.textContent = got > 0 ? `${got}/6` : '';
    if (p.pick !== undefined) { const [, tx, ty] = T[p.pick], q = Math.min(1, k / .6); disk.style.opacity = q < 1 ? 1 : 0; disk.setAttribute('transform', `translate(${tx + (x - 5 - tx) * q},${ty - 20 + (y - 6 - (ty - 20)) * q - Math.sin(q * Math.PI) * 18})`); } else disk.style.opacity = 0;
    jive.setAttribute('stroke', p.deliver ? C.am : C.vi); jive.setAttribute('stroke-width', p.deliver ? 3 : 1.8);
  });
  chips('uc-vlbi', m => { mode = m; t0 = performance.now();
    $('#vlive', s).style.opacity = m === 'live' ? 1 : .05; $('#vmail', s).style.opacity = m === 'mail' ? 1 : 0; $('#sn', s).style.opacity = m === 'live' ? 1 : .15;
    $('#vlab', s).textContent = m === 'live' ? 'LIVE · 1–2.5 Gbps / telescope' : 'BY POST · weeks → months'; $('#vlab', s).setAttribute('fill', m === 'live' ? C.cy : C.am); if (m === 'live') { jive.setAttribute('stroke', C.vi); jive.setAttribute('stroke-width', 1.8); } });
})();

/* ---------- SKA ---------- */
(function ska() {
  const s = $('#skaSvg');
  let h = `<rect x="20" y="200" width="200" height="110" rx="14" fill="#0b1834" stroke="${C.pk}"/>` + txt(120, 226, 'SKA-Low', { f: '#fff', ff: 'Geologica', w: 700, s: 15 }) + tl(120, 244, 'Австралия · AARNet', 'Australia · AARNet', { f: '#93a5c8', s: 11 });
  for (let i = 0; i < 12; i++) { const x = 40 + (i % 6) * 30, y = 268 + Math.floor(i / 6) * 22; h += `<path d="M${x} ${y + 10} L${x + 6} ${y} L${x + 12} ${y + 10}" fill="none" stroke="${C.pk}" stroke-width="1.4"/>`; }
  h += `<rect x="420" y="200" width="200" height="110" rx="14" fill="#0b1834" stroke="${C.am}"/>` + txt(520, 226, 'SKA-Mid', { f: '#fff', ff: 'Geologica', w: 700, s: 15 }) + tl(520, 244, 'Южна Африка · SANReN', 'South Africa · SANReN', { f: '#93a5c8', s: 11 });
  for (let i = 0; i < 6; i++) { const x = 445 + i * 28; h += `<path d="M${x - 9} ${270} Q${x} ${288} ${x + 9} ${270}" fill="none" stroke="${C.am}" stroke-width="1.6"/><line x1="${x}" y1="280" x2="${x}" y2="296" stroke="${C.am}" stroke-width="1.2"/>`; }
  h += `<rect x="220" y="96" width="200" height="50" rx="12" fill="#0b1834" stroke="${C.cy}" stroke-width="1.6"/>` + txt(320, 118, 'GÉANT', { f: '#fff', ff: 'Geologica', w: 700, s: 15 }) + tl(320, 136, 'междуконтинентална опорна мрежа', 'intercontinental backbone', { f: '#93a5c8', s: 10.5 });
  h += `<path d="M120 200 C 120 150, 200 121, 220 121" fill="none" stroke="${C.pk}" stroke-width="2" class="flow"/><path d="M520 200 C 520 150, 440 121, 420 121" fill="none" stroke="${C.am}" stroke-width="2" class="flow"/>`;
  const src = [[120, 40], [250, 26], [390, 26], [520, 40]];
  src.forEach(([x, y]) => { h += `<path d="M320 96 Q ${(x + 320) / 2} ${y + 20} ${x} ${y + 12}" fill="none" stroke="${C.vi}" stroke-width="1.5" class="flow" style="animation-duration:.9s"/><circle cx="${x}" cy="${y}" r="13" fill="#081226" stroke="${C.vi}" stroke-width="1.6"/>` + txt(x, y + 4, 'SRC', { f: '#d9d2ff', s: 9, ff: 'JetBrains Mono', w: 700 }); });
  h += tl(320, 172, 'SKA Regional Centres (SRC) — научна обработка', 'SKA Regional Centres (SRC) — scientific processing', { f: C.vi, s: 11, ff: 'JetBrains Mono' });
  s.innerHTML = h;
})();

/* ---------- ITER ---------- */
(function iter() {
  const s = $('#iterSvg'), cx = 260, cy = 135;
  const R = [['САЩ', 'USA', 'Internet2', 60, 40], ['Япония', 'Japan', 'SINET', 460, 40], ['Корея', 'Korea', 'KREONET', 470, 180], ['Китай', 'China', '', 360, 228], ['Индия', 'India', '', 150, 228]];
  let h = '';
  R.forEach(([bg, en, net, x, y], i) => { h += `<path d="M${cx} ${cy} Q ${(cx + x) / 2} ${(cy + y) / 2 - 30} ${x} ${y}" fill="none" stroke="${C.cy}" stroke-width="1.6" class="flow" style="animation-duration:${.8 + i * .15}s"/><circle cx="${x}" cy="${y}" r="16" fill="#081226" stroke="${C.cy}" stroke-width="1.4"/>` + tl(x, y + 34, bg, en, { s: 11 }) + (net ? txt(x, y + 47, net, { f: '#5e7096', s: 9.5, ff: 'JetBrains Mono' }) : ''); });
  h += `<ellipse cx="${cx}" cy="${cy}" rx="48" ry="26" fill="none" stroke="${C.pk}" stroke-width="7" opacity=".85"><animate attributeName="opacity" values=".55;1;.55" dur="1.6s" repeatCount="indefinite"/></ellipse><ellipse cx="${cx}" cy="${cy}" rx="48" ry="26" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="5 9" class="flow"/>` + txt(cx, cy + 50, 'ITER · Cadarache', { f: '#fff', ff: 'JetBrains Mono', s: 11, w: 700 }) + txt(cx, cy + 64, 'GÉANT · L2/L3 VPN', { f: '#93a5c8', ff: 'JetBrains Mono', s: 10 });
  s.innerHTML = h;
})();

/* ---------- climate ---------- */
(function clim() {
  const s = $('#art-clim'), hx = 440, hy = 230;
  let h = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1a3a"/><stop offset="1" stop-color="#1a2a3a"/></linearGradient></defs><rect width="520" height="380" fill="url(#sky)"/>`;
  h += `<circle cx="450" cy="70" r="26" fill="${C.am}" opacity=".9"><animate attributeName="r" values="24;28;24" dur="4s" repeatCount="indefinite"/></circle><path d="M30 120 Q260 -20 490 120" fill="none" stroke="rgba(255,255,255,.12)" stroke-dasharray="3 6"/>`;
  h += `<g id="sat"><rect x="-8" y="-6" width="16" height="12" rx="2" fill="#e7efff"/><rect x="-30" y="-4" width="18" height="8" fill="${C.bl}"/><rect x="12" y="-4" width="18" height="8" fill="${C.bl}"/></g><path id="beam" d="" fill="${C.cy}" opacity=".12"/>`;
  h += `<path d="M0 290 Q130 270 260 288 T520 284 V380 H0Z" fill="#2a3a1e"/><path d="M0 310 Q140 296 270 312 T520 306 V380 H0Z" fill="#33481f"/>`;
  for (let i = 0; i < 26; i++) h += `<path d="M${20 + i * 19} 340 l4 -14 l4 14" fill="none" stroke="#6f9a3a" stroke-width="1.6"/>`;
  [[70, 282], [170, 278], [240, 286], [330, 284]].forEach(([x, y], i) => { h += `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-30" stroke="#cfe0ff" stroke-width="1.6"/><path d="M0 -30 l12 4 l-12 4" fill="${C.am}"/><circle cx="0" cy="-34" r="3" fill="${C.gr}"><animate attributeName="opacity" values="1;.2;1" dur="${1.2 + i * .3}s" repeatCount="indefinite"/></circle></g>`; });
  h += `<path d="M70 252 Q160 214 240 252 T${hx - 30} ${hy}" fill="none" stroke="${C.gr}" stroke-width="2" class="flow"/><path d="M260 100 Q400 120 ${hx} ${hy - 30}" fill="none" stroke="${C.cy}" stroke-width="2" class="flow"/>`;
  h += `<rect x="${hx - 30}" y="${hy - 30}" width="60" height="64" rx="6" fill="#081226" stroke="${C.vi}" stroke-width="1.6"/>`;
  for (let i = 0; i < 4; i++) h += `<rect x="${hx - 22}" y="${hy - 22 + i * 14}" width="44" height="9" rx="2" fill="none" stroke="#5e7096"/><circle cx="${hx + 15}" cy="${hy - 17 + i * 14}" r="1.8" fill="${C.gr}"><animate attributeName="opacity" values="1;.1;1" dur="${.6 + i * .2}s" repeatCount="indefinite"/></circle>`;
  h += txt(hx, hy + 50, 'HPC · climate model', { s: 10, ff: 'JetBrains Mono' }) + txt(14, 22, 'WACREN · WMO stations + satellite data', { a: 'start', f: C.gr, s: 11, ff: 'JetBrains Mono' }) + tl(200, 372, '→ данни за земеделието и адаптация', '→ data for agriculture and adaptation', { s: 10 });
  s.innerHTML = h;
  const sat = $('#sat', s), beam = $('#beam', s);
  RN.loop(s, (dt, now) => { const k = (now / 14000) % 1, x = 30 + k * 460, y = 120 - (1 - Math.pow(2 * k - 1, 2)) * 70; sat.setAttribute('transform', `translate(${x},${y})`); beam.setAttribute('d', `M${x} ${y + 6} L${x - 40} 290 L${x + 40} 290 Z`); });
})();
RN.enhance();
})();
