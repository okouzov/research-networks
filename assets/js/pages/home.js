/* Home page: section tiles, ISP-vs-NREN simulation, comparison table, architecture tiers, latest milestones */
(() => {
const { $, $$, L, C, cite } = RN;

/* ---------- tiles to every section ---------- */
const ICONS = {
  networks: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  europe: '<path d="M3 12c3-6 15-6 18 0M3 12c3 6 15 6 18 0"/><circle cx="12" cy="12" r="2.5"/>',
  science: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
  services: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
  history: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  data: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  bulgaria: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/>',
  sources: '<path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M8 8h8M8 12h8"/>',
};
$('#tiles').innerHTML = RN.PAGES.filter(p => p.id !== 'home').map((p, i) => `<a class="tile reveal" href="${p.href}">
  <span class="tn">0${i + 1}</span><h4>${L(p.bg, p.en)}</h4><p>${L(p.d.bg, p.d.en)}</p><span class="go">${L('Отвори', 'Open')} →</span>
  <svg class="bgic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">${ICONS[p.id] || ''}</svg></a>`).join('');

/* ---------- why cards ---------- */
const WHY = [
  ['<path d="M3 12h4l3-8 4 16 3-8h4"/>', ['Мащаб и предвидимост', 'Scale & predictability'], ['От наносекундни импулси от синхротрони до петабайти геномни и колизионни данни — със строги гаранции за латентност и джитер.', 'From nanosecond synchrotron pulses to petabytes of genomic and collision data — with strict latency and jitter guarantees.'], '6,11'],
  ['<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>', ['Полигон за нови технологии', 'A test-bed for new tech'], ['NREN изпитват нови протоколи, софтуерно дефинирани мрежи (SDN), квантово разпределение на ключове (QKD) и пренос на точно време и честота.', 'NRENs trial new protocols, software-defined networking (SDN), quantum key distribution (QKD) and precise time-and-frequency transfer.'], '7,8,10'],
  ['<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10v4M11 10v4M15 10v4"/>', ['Резервен капацитет', 'Headroom policy'], ['Умишлено поддържан свободен капацитет предотвратява загубата на пакети при внезапни пикове от големи научни съоръжения.', 'Deliberately spare capacity prevents packet loss during sudden bursts from large scientific facilities.'], '6'],
  ['<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>', ['Бърза адаптация', 'Fast adaptation'], ['Вместо дълги бизнес анализи — инфраструктурата се пригажда бързо към нуждите на новите научни проекти.', 'Instead of lengthy business cases, the infrastructure adapts quickly to the needs of new science projects.'], '4'],
];
$('#whyCards').innerHTML = WHY.map(([ic, t, d, c]) => `<div class="card reveal"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${ic}</svg></div><h4>${L(...t)}</h4><p>${L(...d)}${cite(c)}</p></div>`).join('');

/* ---------- comparison table ---------- */
const CMP = [
  [['Основна цел', 'Primary goal'], ['Максимална печалба и възвръщаемост (ROI)', 'Maximising profit and return on investment (ROI)'], ['Подкрепа за научните изследвания, образованието и иновациите', 'Supporting research, education and innovation'], '4|2,6'],
  [['Модел на трафика', 'Traffic model'], ['Агрегиран, асиметричен, с висока пренаселеност', 'Aggregated, asymmetric, heavily oversubscribed'], ['Симетричен, детерминистичен, с непрекъснати големи потоци', 'Symmetric, deterministic, with sustained large flows'], '5|6,40'],
  [['Гаранции', 'Guarantees'], ['Преобладава best effort; без персонализирано QoS за сурови данни', 'Mostly best effort; no tailored QoS for raw data'], ['Гарантирана латентност, без загуба на пакети, предвидимост', 'Guaranteed latency, no packet loss, predictability'], '6,11|6'],
  [['Оптичен слой', 'Optical layer'], ['Наети капацитети по стандартни трасета', 'Leased lit circuits on standard routes'], ['Собствено тъмно влакно и оптичен спектър (FlexGrid); дългосрочни IRU', 'Owned dark fibre and optical spectrum (FlexGrid); long-term IRUs'], '|12,13,72'],
  [['Бизнес модел', 'Business model'], ['Таксуване по консумация или абонамент с ограничения', 'Usage-based or capped subscription billing'], ['Публично финансиране и членски внос; научният трафик не се таксува по обем', 'Public funding and membership fees; no per-volume charging for research traffic'], '7|7,8'],
];
$('#cmpBody').innerHTML = CMP.map(([p, a, b, c]) => { const [ca, cb] = c.split('|'); return `<tr><td>${L(...p)}</td><td>${L(...a)}${cite(ca)}</td><td>${L(...b)}${cite(cb)}</td></tr>`; }).join('');

/* ---------- ISP vs NREN lanes ---------- */
const lanes = [
  { cv: $('#laneIsp'), out: $('#lossIsp'), cap: 9, base: 7.2, qmax: 9, pipeW: .35 },
  { cv: $('#laneNren'), out: $('#lossNren'), cap: 30, base: 7.2, qmax: 9, pipeW: 1 },
];
let burstUntil = 0;
lanes.forEach(l => Object.assign(l, { q: [], fly: [], drop: [], acc: 0, tok: 0, sent: 0, lost: 0, g: RN.fitCanvas(l.cv) }));
addEventListener('resize', () => lanes.forEach(l => l.g = RN.fitCanvas(l.cv)));
$('#burstBtn').addEventListener('click', () => { burstUntil = performance.now() + 3200; lanes.forEach(l => { l.sent = 0; l.lost = 0; }); });
function laneStep(l, dt, now) {
  const { ctx, w, h } = l.g, burst = now < burstUntil, mid = h / 2;
  const x0 = w * .42, x1 = w * .92, ph = 14 + 54 * l.pipeW;
  l.acc += (l.base + (burst ? 16 : 0) + Math.sin(now / 700) * 1.2) * dt;
  while (l.acc >= 1) {
    l.acc -= 1; l.sent++;
    if (l.q.length >= l.qmax) { l.lost++; l.drop.push({ x: x0 - 14 - l.qmax * 9, y: mid + (Math.random() - .5) * 20, vy: -40 }); }
    else l.q.push({ b: burst, x: 52 });
  }
  l.tok = Math.min(l.tok + l.cap * dt, 3);
  while (l.tok >= 1 && l.q.length) { l.tok -= 1; const p = l.q.shift(); l.fly.push({ x: x0, y: mid + (Math.random() - .5) * (ph - 8), b: p.b }); }
  ctx.clearRect(0, 0, w, h); ctx.font = '600 10px JetBrains Mono';
  ctx.fillStyle = 'rgba(120,170,255,.08)'; ctx.fillRect(8, mid - 40, 40, 80); ctx.fillStyle = '#93a5c8'; ctx.fillText('SRC', 16, mid + 4);
  const pg = ctx.createLinearGradient(x0, 0, x1, 0); pg.addColorStop(0, 'rgba(62,230,255,.05)'); pg.addColorStop(1, 'rgba(143,125,255,.14)');
  ctx.fillStyle = pg; ctx.strokeStyle = 'rgba(120,170,255,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x0, mid - ph / 2, x1 - x0, ph, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5e7096'; ctx.fillText(l.cap > 20 ? 'headroom' : 'oversubscribed', x0 + 6, mid - ph / 2 - 6);
  l.q.forEach((p, i) => { const x = x0 - 10 - i * 9, y = mid + ((i % 3) - 1) * 9; p.x += (x - p.x) * .25; ctx.fillStyle = p.b ? C.am : C.cy; ctx.beginPath(); ctx.arc(p.x, y, 3.2, 0, 6.28); ctx.fill(); });
  const qx = x0 - 14 - l.qmax * 9; ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.setLineDash([3, 4]); ctx.strokeRect(qx, mid - 16, x0 - qx - 4, 32); ctx.setLineDash([]);
  ctx.fillStyle = '#5e7096'; ctx.fillText('queue', qx, mid + 30);
  l.fly = l.fly.filter(p => p.x < x1 + 30);
  l.fly.forEach(p => { p.x += 220 * dt; ctx.fillStyle = p.b ? C.am : C.cy; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0; });
  l.drop = l.drop.filter(p => p.y < h + 10);
  l.drop.forEach(p => { p.vy += 380 * dt; p.y += p.vy * dt; p.x -= 20 * dt; ctx.fillStyle = C.rd; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, 6.28); ctx.fill(); });
  ctx.fillStyle = 'rgba(71,240,162,.08)'; ctx.fillRect(w - 46, mid - 40, 40, 80); ctx.fillStyle = '#93a5c8'; ctx.fillText('DST', w - 38, mid + 4);
  if (burst) { ctx.fillStyle = C.am; ctx.fillText('BURST', 12, 16); }
  l.out.innerHTML = RN.NF(l.sent ? l.lost / l.sent * 100 : 0, 1) + '%';
}
RN.loop($('#why .lanes'), (dt, now) => lanes.forEach(l => laneStep(l, dt, now)));

/* ---------- architecture tiers ---------- */
(function arch() {
  const svg = $('#archSvg');
  const TIERS = [
    { id: 'rren', col: 'var(--vi)', t: ['Регионални мрежи (RREN)', 'Regional networks (RREN)'], d: ['Най-горното ниво свързва националните мрежи в общи географски зони — GÉANT в Европа, RedCLARA в Латинска Америка, APAN и TEIN/Asi@Connect в Азия, UbuntuNet Alliance, WACREN и ASREN в Африка и арабския свят. Те поддържат трансконтиненталните магистрали — като трансатлантическия спектър, който GÉANT държи с 15-годишен IRU.', 'The top tier joins national networks across shared geographic zones — GÉANT in Europe, RedCLARA in Latin America, APAN and TEIN/Asi@Connect in Asia, UbuntuNet Alliance, WACREN and ASREN in Africa and the Arab world. They run the transcontinental highways — such as the transatlantic spectrum GÉANT holds on a 15-year IRU.'], c: '14,15,16,42,72' },
    { id: 'nren', col: 'var(--cy)', t: ['Национални мрежи (NREN)', 'National networks (NREN)'], d: ['Всяка държава има своя национална изследователска и образователна мрежа. Тя събира трафика на университетите и институтите и гарантира равен достъп до суперкомпютри, дигитални библиотеки и отдалечени научни инструменти — така премахва дигиталното неравенство между институциите.', 'Each country has its own national research and education network. It aggregates traffic from universities and institutes and guarantees equal access to supercomputers, digital libraries and remote instruments — removing the digital divide between institutions.'], c: '4,6,13' },
    { id: 'campus', col: 'var(--gr)', t: ['Кампусни мрежи', 'Campus networks'], d: ['Основата: локалните мрежи на университети, научни институти, обсерватории и болници. Тук се раждат данните. Големите научни потоци се отделят на входа в Science DMZ, за да не минават през обикновените защитни стени.', 'The foundation: local networks of universities, research institutes, observatories and hospitals. This is where data is born. Large scientific flows are separated at the edge into a Science DMZ so they bypass ordinary firewalls.'], c: '12,40,43' },
  ];
  const tops = ['GÉANT', 'RedCLARA', 'Asi@Connect', 'UbuntuNet'], mids = ['NREN · A', 'NREN · B', 'NREN · C'];
  const bots = [['Университет', 'University'], ['Институт', 'Institute'], ['Обсерватория', 'Observatory'], ['Болница', 'Hospital'], ['Лаборатория', 'Laboratory'], ['Университет', 'University']];
  const tx = i => 30 + i * 142, mx = i => 55 + i * 185, bx = i => 12 + i * 98;
  let h = '';
  bots.forEach((b, i) => { const m = Math.min(2, Math.floor(i / 2)); h += `<path class="flow" d="M${bx(i) + 42} 330 C ${bx(i) + 42} 280, ${mx(m) + 70} 280, ${mx(m) + 70} 232" stroke="${C.gr}" stroke-width="1.6" fill="none" opacity=".7"/>`; });
  mids.forEach((_, i) => [i, i + 1].forEach(t => { if (t < 4) h += `<path class="flow" d="M${mx(i) + 70} 185 C ${mx(i) + 70} 135, ${tx(t) + 60} 135, ${tx(t) + 60} 86" stroke="${C.cy}" stroke-width="1.6" fill="none" opacity=".7"/>`; }));
  for (let i = 0; i < 3; i++) h += `<path class="flow" d="M${tx(i) + 120} 50 Q ${tx(i) + 131} 20 ${tx(i + 1)} 50" stroke="${C.vi}" stroke-width="2" fill="none"/>`;
  h += `<text x="300" y="16" text-anchor="middle" fill="${C.vi}" font-size="11" font-family="JetBrains Mono" lang="bg">междуконтинентални трасета</text><text x="300" y="16" text-anchor="middle" fill="${C.vi}" font-size="11" font-family="JetBrains Mono" lang="en">intercontinental links</text>`;
  h += `<g class="tier" data-t="rren">${tops.map((t, i) => `<rect x="${tx(i)}" y="40" width="120" height="46" rx="10" fill="rgba(143,125,255,.1)" stroke="${C.vi}" stroke-width="1.4"/><text x="${tx(i) + 60}" y="68" text-anchor="middle" fill="#e7efff" font-size="12.5" font-weight="600" font-family="Golos Text">${t}</text>`).join('')}</g>`;
  h += `<g class="tier" data-t="nren">${mids.map((t, i) => `<rect x="${mx(i)}" y="185" width="140" height="46" rx="10" fill="rgba(62,230,255,.08)" stroke="${C.cy}" stroke-width="1.4"/><text x="${mx(i) + 70}" y="213" text-anchor="middle" fill="#e7efff" font-size="13" font-weight="600" font-family="Golos Text">${t}</text>`).join('')}</g>`;
  h += `<g class="tier" data-t="campus">${bots.map((b, i) => `<rect x="${bx(i)}" y="330" width="84" height="40" rx="9" fill="rgba(71,240,162,.07)" stroke="${C.gr}" stroke-width="1.2"/><text lang="bg" x="${bx(i) + 42}" y="354" text-anchor="middle" fill="#cfe0ff" font-size="11" font-family="Golos Text">${b[0]}</text><text lang="en" x="${bx(i) + 42}" y="354" text-anchor="middle" fill="#cfe0ff" font-size="11" font-family="Golos Text">${b[1]}</text>`).join('')}</g>`;
  h += `<text x="300" y="405" text-anchor="middle" fill="#5e7096" font-size="11" font-family="JetBrains Mono">CAMPUS → NREN → RREN → WORLD</text>`;
  svg.innerHTML = h;
  const tabs = $('#tierTabs'), info = $('#tierInfo');
  tabs.innerHTML = TIERS.map(t => `<button class="chip" data-t="${t.id}">${L(...t.t)}</button>`).join('');
  const sel = id => { const t = TIERS.find(x => x.id === id);
    $$('.chip', tabs).forEach(b => b.classList.toggle('on', b.dataset.t === id)); $$('.tier', svg).forEach(g => g.classList.toggle('on', g.dataset.t === id));
    info.innerHTML = `<h3 style="color:${t.col}">${L(...t.t)}</h3><p style="color:var(--mut)">${L(...t.d)}${cite(t.c)}</p>`; RN.fillCites(info); };
  tabs.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) sel(b.dataset.t); });
  $$('.tier', svg).forEach(g => g.addEventListener('click', () => sel(g.dataset.t)));
  sel('nren');
})();

/* ---------- latest milestones ---------- */
const NEWS = [
  ['01 · 2026', ['GÉANT мина на 800Gb без нито минута прекъсване', 'GÉANT moved to 800Gb without a minute of downtime'], ['От юни 2024 до януари 2026 г. 1240 услуги в 32 обекта бяха пренесени на нов IP/MPLS слой на Nokia по цялата 30 000-километрова опорна мрежа — с автоматизация вместо ръчни настройки.', 'Between June 2024 and January 2026, 1,240 services across 32 sites moved to a new Nokia IP/MPLS layer along the whole 30,000 km backbone — with automation instead of manual configuration.'], '74', 'europe.html#migration'],
  ['06 · 2025', ['Терабитов мост през Атлантика', 'A terabit bridge across the Atlantic'], ['GÉANT и EXA Infrastructure подписаха 15-годишен IRU за спектър в две трансатлантически кабелни системи. Северна Америка генерира над три четвърти от външния трафик на Европа.', 'GÉANT and EXA Infrastructure signed a 15-year IRU for spectrum on two transatlantic cable systems. North America generates over three quarters of Europe’s external traffic.'], '72,75', 'networks.html#ana'],
  ['06 · 2025', ['Метеорологичните данни на EUMETSAT', 'EUMETSAT’s weather data'], ['Петгодишно споразумение прави GÉANT единна точка за контакт на NREN за EUMETCast Terrestrial — услугата, която разпространява данни за прогнозите за времето.', 'A five-year agreement makes GÉANT the single point of contact for the NRENs for EUMETCast Terrestrial — the service that distributes data for weather forecasting.'], '64', 'science.html#copernicus'],
  ['04 · 2026', ['Asi@Connect влиза във втора фаза', 'Asi@Connect enters phase two'], ['След фаза 1 (2016–2026, 37,15 млн. €) азиатската мрежа получава нови 14 млн. € до 2031 г. за 22 държави и територии.', 'After phase one (2016–2026, €37.15M), the Asian network gets another €14M until 2031 for 22 countries and territories.'], '42', 'networks.html#asia'],
  ['2024', ['Генерална репетиция за HL-LHC', 'A dress rehearsal for HL-LHC'], ['В Data Challenge 2024 мрежите на WLCG надхвърлиха 3 Tbps при едва 25% от бъдещото натоварване — подготовка за 350 PB годишно на експеримент.', 'In Data Challenge 2024 the WLCG networks exceeded 3 Tbps at just 25% of the future load — preparing for 350 PB a year per experiment.'], '40,43', 'science.html#lhc'],
  ['2026', ['Мрежовият слой на EOSC', 'The network layer of EOSC'], ['Хартата на GÉANT EOSC Node (версии 1.0 и 1.1) определя мрежовия и идентификационния слой на европейския облак за отворена наука.', 'The GÉANT EOSC Node charter (versions 1.0 and 1.1) defines the network and identity layer of the European Open Science Cloud.'], '33,34', 'services.html#cloud'],
];
$('#newsGrid').innerHTML = NEWS.map(([dt, t, d, c, href]) => `<div class="card newsc reveal"><span class="dt">${dt}</span><h4>${L(...t)}</h4><p>${L(...d)}${cite(c)}</p><a class="go" href="${href}">${L('Подробно', 'Read more')} →</a></div>`).join('');
RN.enhance();
})();
