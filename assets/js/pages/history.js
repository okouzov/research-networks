/* History page: timeline (data/timeline.json) with region filter, capacity chart, eras table, full list */
(() => {
const { $, $$, L, T, cite } = RN;
const REGN = { all: ['Всички', 'All'], global: ['Глобално', 'Global'], us: ['САЩ', 'USA'], eu: ['Европа', 'Europe'], ap: ['Азия', 'Asia'], la: ['Латинска Америка', 'Latin America'] };
const REGC = { global: '#9fb0d0', us: '#8f7dff', eu: '#3ee6ff', ap: '#ff6ad5', la: '#47f0a2', af: '#ffb547' };

RN.data('timeline').then(D => {
  const ALL = D.events.slice().sort((a, b) => a.s - b.s);
  let EV = ALL, cur = 0, timer = null;
  const tr = $('#tlTrack'), det = $('#tlDetail'), fl = $('#tlFilters');
  fl.innerHTML = Object.entries(REGN).map(([k, n]) => `<button class="chip${k === 'all' ? ' on' : ''}" data-r="${k}">${L(...n)}</button>`).join('');
  const draw = () => {
    tr.innerHTML = EV.map((t, i) => `<button class="tlItem" data-i="${i}"><span class="y">${T(t.y)}</span><span class="p" style="border-color:${REGC[t.reg]}"></span><span class="t">${T(t.t)}</span></button>`).join('');
    show(0);
  };
  function show(i) {
    cur = (i + EV.length) % EV.length; const t = EV[cur];
    $$('.tlItem', tr).forEach((b, j) => b.classList.toggle('on', j === cur));
    det.innerHTML = `<div><div class="big grad">${T(t.y)}</div><span class="badge" style="margin:8px 0 0;border-color:${REGC[t.reg]};color:${REGC[t.reg]}">${L(...(REGN[t.reg] || REGN.global))}</span></div><div><h3>${T(t.t)}</h3><p style="color:var(--mut);margin:0">${T(t.d)}${cite(t.c)}</p></div>`;
    RN.fillCites(det);
    const b = tr.children[cur]; if (b) tr.scrollTo({ left: b.offsetLeft - tr.clientWidth / 2 + 59, behavior: RN.RM ? 'auto' : 'smooth' });
  }
  const stop = () => { clearInterval(timer); timer = null; $('#tlPlay').classList.remove('on'); };
  tr.addEventListener('click', e => { const b = e.target.closest('.tlItem'); if (b) { stop(); show(+b.dataset.i); } });
  $('#tlPrev').onclick = () => { stop(); show(cur - 1); };
  $('#tlNext').onclick = () => { stop(); show(cur + 1); };
  $('#tlPlay').onclick = () => { if (timer) return stop(); $('#tlPlay').classList.add('on'); show(cur + 1); timer = setInterval(() => show(cur + 1), 3400); };
  addEventListener('keydown', e => { if (e.target.closest('input,textarea')) return; if (e.key === 'ArrowRight') { stop(); show(cur + 1); } if (e.key === 'ArrowLeft') { stop(); show(cur - 1); } });
  fl.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; stop();
    $$('.chip', fl).forEach(x => x.classList.toggle('on', x === b));
    EV = b.dataset.r === 'all' ? ALL : ALL.filter(x => x.reg === b.dataset.r); draw(); });
  draw();
  $('#vlist').innerHTML = ALL.map(t => `<div class="vrow reveal"><div><div class="yy" style="color:${REGC[t.reg]}">${T(t.y)}</div><span class="rg">${L(...(REGN[t.reg] || REGN.global))}</span></div><div><h4>${T(t.t)}</h4><p>${T(t.d)}${cite(t.c)}</p></div></div>`).join('');
  RN.enhance($('#vlist'));
}).catch(() => RN.dataFail($('#tlDetail')));

RN.bars($('#capChart'), [
  { label: `<b>EARN / RARE</b>1984–1994`, v: 1e5, txt: 'kbps–Mbps' },
  { label: `<b>TEIN1</b>2001`, v: 2e6, txt: '2 Mbps', color: 'linear-gradient(90deg,#8f7dff,#ff6ad5)' },
  { label: `<b>TEN-34</b>1994–2000`, v: 34e6, txt: '34 Mbps' },
  { label: `<b>TEN-155</b>1994–2000`, v: 155e6, txt: '155 Mbps' },
  { label: `<b>${L('Ранен GÉANT', 'Early GÉANT')}</b>2000–`, v: 2.5e9, txt: '2.5 Gbps' },
  { label: `<b>GÉANT2 / GÉANT3</b>2004–2015`, v: 10e9, txt: '10 Gbps' },
  { label: `<b>${L('GÉANT, 100 Gb ера', 'GÉANT, 100 Gb era')}</b>–2015`, v: 100e9, txt: '100 Gbps' },
  { label: `<b>Asi@Connect</b>2016–`, v: 100e9, txt: '100 Gbps', color: 'linear-gradient(90deg,#8f7dff,#ff6ad5)' },
  { label: `<b>Internet2 NGI</b>2021`, v: 800e9, txt: '800 Gb λ', color: 'linear-gradient(90deg,#5aa8ff,#8f7dff)' },
  { label: `<b>${L('GÉANT, 800 Gb IP', 'GÉANT, 800 Gb IP')}</b>2026`, v: 800e9, txt: '800 Gb' },
  { label: `<b>${L('Ядро на GÉANT', 'GÉANT core')}</b>GN5`, v: 12e12, txt: '12 Tbps' },
], { log: true, min: 1e4, max: 1.2e13 });
$('#capChart').insertAdjacentHTML('beforeend', `<p class="note" style="margin-top:12px">${L('Източници', 'Sources')}${cite('3,12,13,21,22,27,41,42,74')}</p>`);

$('#eraBody').innerHTML = [
  [['EARN / RARE', 'EARN / RARE'], '1984–1994', ['SNA/NJE (EARN), X.25, „Coloured Book“, ранен IP', 'SNA/NJE (EARN), X.25, “Coloured Book”, early IP'], ['килобитови до мегабитови линии', 'kilobit to megabit lines'], ['Първата паневропейска академична общност', 'The first pan-European academic community'], '3,22,23'],
  [['DANTE / TERENA', 'DANTE / TERENA'], '1994–2000', ['ATM, SDH, преход към чист IP пренос', 'ATM, SDH, move to native IP'], ['34–155 Mbps', '34–155 Mbps'], ['Стандартизирано паневропейско IP рутиране за науката', 'Standardised pan-European IP routing for science'], '21,22'],
  [['Ранните GÉANT', 'Early GÉANT'], '2000–2015', ['WDM, MPLS, рутирани и комутирани светлинни пътища', 'WDM, MPLS, routed and switched lightpaths'], ['2,5 → 10 → 100 Gbps', '2.5 → 10 → 100 Gbps'], ['Автоматизирани светлинни пътища; глобално разширение', 'Automated lightpaths; global expansion'], '12,13,25'],
  [['GÉANT GN5', 'GÉANT GN5'], '2023–', ['FlexGrid спектър, Nokia FP5 IP/MPLS, 400 Gb/800 Gb ZR+', 'FlexGrid spectrum, Nokia FP5 IP/MPLS, 400 Gb/800 Gb ZR+'], ['12 Tbps ядро; 800 Gb IP слой', '12 Tbps core; 800 Gb IP layer'], ['Собствен спектър, квантова интеграция (EuroQCI), 3,6 EB годишно', 'Own spectrum, quantum integration (EuroQCI), 3.6 EB a year'], '10,12,13,27,29,74'],
].map(([e, y, a, c, s, ci]) => `<tr><td>${L(...e)}<div class="note">${y}</div></td><td>${L(...a)}</td><td>${L(...c)}</td><td>${L(...s)}${cite(ci)}</td></tr>`).join('');
RN.enhance();
})();
