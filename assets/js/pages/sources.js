/* Sources page: both reports' references (data/sources.json) with search and #src-N anchors */
(() => {
const { $, $$, L, T } = RN;
RN.data('sources').then(D => {
  const body = $('#srcBody');
  const group = (r, title, items) => `<div class="mt"><div class="kicker">${L('Доклад', 'Report')} ${r}</div><h3>${T(title)}</h3><ol class="src" start="${items[0].id}">${items.map(i => `<li id="src-${i.id}" value="${i.id}" data-t="${i.t.toLowerCase()}"><a href="${i.u}" target="_blank" rel="noopener">${i.t}</a></li>`).join('')}</ol></div>`;
  body.innerHTML = D.reports.map(rp => group(rp.r, rp.t, D.items.filter(i => i.r === rp.r)))
    + `<div class="mt"><div class="kicker" style="color:var(--am)">${L('Външно проверени', 'Verified externally')}</div><h3>${L('Официални адреси, проверени извън докладите (ноември 2026)', 'Official addresses checked outside the reports (November 2026)')}</h3><ul class="src">${D.external.map(e => `<li data-t="${e.t.toLowerCase()}"><a href="${e.u}" target="_blank" rel="noopener">${e.t}</a> — ${T(e.note)}</li>`).join('')}</ul></div>`;
  const q = $('#q'), cnt = $('#cnt'), all = $$('li', body);
  const upd = () => { const v = q.value.trim().toLowerCase(); let n = 0; all.forEach(li => { const ok = !v || li.dataset.t.includes(v); li.style.display = ok ? '' : 'none'; if (ok) n++; }); cnt.innerHTML = L(`${n} източника`, `${n} sources`); };
  const ph = () => q.placeholder = RN.lang === 'bg' ? 'Търсене в източниците…' : 'Search sources…';
  q.addEventListener('input', upd); document.addEventListener('rn:lang', ph); ph(); upd();
  if (location.hash) { const t = $(location.hash); if (t) setTimeout(() => t.scrollIntoView({ block: 'center' }), 50); }
}).catch(() => RN.dataFail($('#srcBody')));
})();
