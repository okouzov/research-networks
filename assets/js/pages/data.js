/* Data hub: generic searchable/sortable tables over the JSON datasets + CSV export */
(() => {
const { $, $$, L, T, cite } = RN;
const plain = o => o == null ? '' : typeof o === 'string' ? (o.includes('|') ? o.split('|')[RN.lang === 'bg' ? 0 : 1] : o) : o[RN.lang] || o.bg;

/* table({el, cols:[{k,label:[bg,en],get(row)->html,sort(row)->value,num}], rows, search, count, filter}) */
function table(o) {
  let key = null, dir = 1, q = '', f = () => true;
  const render = () => {
    let rows = o.rows.filter(r => f(r) && (!q || o.text(r).toLowerCase().includes(q)));
    if (key != null) { const c = o.cols[key]; rows = rows.slice().sort((a, b) => { const x = c.sort(a), y = c.sort(b); return (x > y ? 1 : x < y ? -1 : 0) * dir; }); }
    o.el.innerHTML = `<thead><tr>${o.cols.map((c, i) => `<th${c.sort ? ` data-sort="${i}"` : ''} class="${key === i ? (dir > 0 ? 'asc' : 'desc') : ''}">${L(...c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${o.cols.map(c => `<td${c.num ? ' class="num"' : ''}>${c.get(r)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    o.count.innerHTML = L(`${rows.length} от ${o.rows.length} реда`, `${rows.length} of ${o.rows.length} rows`);
    RN.fillCites(o.el);
  };
  o.el.addEventListener('click', e => { const th = e.target.closest('th[data-sort]'); if (!th) return; const i = +th.dataset.sort; dir = key === i ? -dir : 1; key = i; render(); });
  o.search.placeholder = RN.lang === 'bg' ? 'Търсене…' : 'Search…';
  document.addEventListener('rn:lang', () => { o.search.placeholder = RN.lang === 'bg' ? 'Търсене…' : 'Search…'; });
  o.search.addEventListener('input', () => { q = o.search.value.trim().toLowerCase(); render(); });
  render();
  return { setFilter: fn => { f = fn; render(); } };
}
function csv(name, header, rows) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const blob = new Blob(['﻿' + [header, ...rows].map(r => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const both = o => typeof o === 'string' ? o.replace('|', ' ') : `${o.bg} ${o.en}`;

/* facts */
RN.data('facts').then(D => {
  const t = table({ el: $('#tFacts'), search: $('#qFacts'), count: $('#cFacts'), rows: D.facts, text: r => both(r.v) + both(r.l) + both(D.categories[r.cat]) + r.asof,
    cols: [
      { label: ['Стойност', 'Value'], get: r => T(r.v), sort: r => r.n ?? 0, num: 1 },
      { label: ['Показател', 'Indicator'], get: r => T(r.l), sort: r => plain(r.l) },
      { label: ['Категория', 'Category'], get: r => T(D.categories[r.cat]), sort: r => r.cat },
      { label: ['Период', 'Period'], get: r => r.asof, sort: r => r.asof },
      { label: ['Източник', 'Source'], get: r => r.u ? `<a class="extSrc" href="${r.u}" target="_blank" rel="noopener">${new URL(r.u).hostname} ↗</a>` : cite(r.c) },
    ] });
  const fl = $('#fFacts');
  fl.innerHTML = `<button class="chip on" data-c="all">${L('Всички', 'All')}</button>` + Object.entries(D.categories).map(([k, v]) => `<button class="chip" data-c="${k}">${T(v)}</button>`).join('');
  fl.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; $$('.chip', fl).forEach(x => x.classList.toggle('on', x === b)); t.setFilter(b.dataset.c === 'all' ? () => true : r => r.cat === b.dataset.c); });
  $('#csvFacts').onclick = () => csv('renet-facts.csv', ['value_bg', 'value_en', 'label_bg', 'label_en', 'category', 'period', 'sources'], D.facts.map(r => { const [vb, ve] = r.v.includes('|') ? r.v.split('|') : [r.v, r.v]; return [vb, ve, r.l.bg, r.l.en, r.cat, r.asof, r.c]; }));
}).catch(() => RN.dataFail($('#tFacts')));

/* networks */
RN.data('networks').then(D => {
  const TYPE = { rren: ['Регионална', 'Regional'], nren: ['Национална', 'National'], forum: ['Форум', 'Forum'] };
  table({ el: $('#tNets'), search: $('#qNets'), count: $('#cNets'), rows: D.networks, text: r => r.name + both(r.sub) + both(D.regions[r.reg].n) + both(r.d),
    cols: [
      { label: ['Мрежа', 'Network'], get: r => `<b style="color:var(--tx)">${r.name}</b>${r.ana ? ' <span class="badge">ANA</span>' : ''}`, sort: r => r.name },
      { label: ['Регион', 'Region'], get: r => `<span style="color:${D.regions[r.reg].color}">●</span> ${T(D.regions[r.reg].n)}`, sort: r => r.reg },
      { label: ['Обхват', 'Scope'], get: r => T(r.sub), sort: r => plain(r.sub) },
      { label: ['Тип', 'Type'], get: r => L(...TYPE[r.type]), sort: r => r.type },
      { label: ['Сайт', 'Website'], get: r => `<a href="${r.url}" target="_blank" rel="noopener">${r.url.replace(/^https?:\/\/(www\.)?/, '')} ↗</a>` },
      { label: ['Източник', 'Source'], get: r => r.c ? cite(r.c) : `<span class="badge">${L('ВЪНШЕН', 'EXTERNAL')}</span>` },
    ] });
  $('#csvNets').onclick = () => csv('renet-networks.csv', ['name', 'region', 'scope_bg', 'scope_en', 'type', 'url', 'description_bg', 'description_en', 'sources', 'external'], D.networks.map(r => [r.name, r.reg, r.sub.bg, r.sub.en, r.type, r.url, r.d.bg, r.d.en, r.c || '', r.ext ? 1 : 0]));
}).catch(() => RN.dataFail($('#tNets')));

/* events */
RN.data('timeline').then(D => {
  const REG = { global: ['Глобално', 'Global'], us: ['САЩ', 'USA'], eu: ['Европа', 'Europe'], ap: ['Азия', 'Asia'], la: ['Лат. Америка', 'Latin America'] };
  table({ el: $('#tEv'), search: $('#qEv'), count: $('#cEv'), rows: D.events, text: r => both(r.y) + both(r.t) + both(r.d),
    cols: [
      { label: ['Година', 'Year'], get: r => T(r.y), sort: r => r.s, num: 1 },
      { label: ['Регион', 'Region'], get: r => L(...REG[r.reg]), sort: r => r.reg },
      { label: ['Събитие', 'Event'], get: r => `<b style="color:var(--tx)">${T(r.t)}</b><div style="font-size:13.5px">${T(r.d)}</div>`, sort: r => plain(r.t) },
      { label: ['Източник', 'Source'], get: r => cite(r.c) },
    ] });
  $('#csvEv').onclick = () => csv('renet-events.csv', ['year', 'sort', 'region', 'title_bg', 'title_en', 'text_bg', 'text_en', 'sources'], D.events.map(r => [r.y.replace('|', ' / '), r.s, r.reg, r.t.bg, r.t.en, r.d.bg, r.d.en, r.c]));
}).catch(() => RN.dataFail($('#tEv')));
})();
