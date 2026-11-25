/* Services page: eduroam and eduGAIN flows (both directions), FAIR cards, Science DMZ and NOTED animations */
(() => {
const { $, $$, L, C } = RN;

/* Scenario switch shared by eduroam and eduGAIN:
   out = a Bulgarian researcher abroad, in = a visiting researcher in Bulgaria */
const SCN = [['out', ['Българин в чужбина', 'Bulgarian abroad']], ['in', ['Гост учен в България', 'Visiting researcher in Bulgaria']]];
function scenSwitch(el, pick) {
  el.innerHTML = SCN.map(([id, t], i) => `<button class="chip${i ? '' : ' on'}" data-s="${id}" aria-pressed="${!i}">${L(...t)}</button>`).join('');
  el.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b || b.classList.contains('on')) return;
    if (pick(b.dataset.s) === false) return; // busy: keep the current scenario
    $$('.chip', el).forEach(c => { const on = c === b; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
  });
}
/* node label shared by both diagrams: a = above, b = below, r = right, l = left; '|' breaks a label into lines */
function nodeLabel(x, y, t, s, lp, subBelow) {
  const side = lp === 'r' || lp === 'l', lines = Math.max(t[0].split('|').length, t[1].split('|').length);
  const ty = lp === 'a' ? y - 26 : side ? y + 4 - (lines - 1) * 6.5 - (s && !subBelow ? 6 : 0) : y + 32;
  const lx = lp === 'r' ? x + 26 : lp === 'l' ? x - 26 : x, an = lp === 'r' ? 'start' : lp === 'l' ? 'end' : 'middle';
  const ml = str => str.split('|').map((ln, i) => `<tspan x="${lx}" dy="${i ? 13 : 0}">${ln}</tspan>`).join('');
  let h = `<text lang="bg" x="${lx}" y="${ty}" text-anchor="${an}" fill="#cfe0ff" font-size="11" font-family="Golos Text">${ml(t[0])}</text><text lang="en" x="${lx}" y="${ty}" text-anchor="${an}" fill="#cfe0ff" font-size="11" font-family="Golos Text">${ml(t[1])}</text>`;
  if (s) h += subBelow ? `<text x="${x}" y="${y + 31}" text-anchor="middle" fill="#5e7096" font-size="9.5" font-family="JetBrains Mono">${s}</text>` : `<text x="${lx}" y="${lp === 'a' ? ty - 13 : ty + 13 * lines}" text-anchor="${an}" fill="#5e7096" font-size="9.5" font-family="JetBrains Mono">${s}</text>`;
  return h;
}
const boxLabel = (x, y, col, bg, en) => `<text x="${x}" y="${y}" fill="${col}" font-size="10.5" font-family="JetBrains Mono"><tspan lang="bg">${bg}</tspan><tspan lang="en">${en}</tspan></text>`;

/* ---------- eduroam ---------- */
(function eduroam() {
  const svg = $('#roamSvg'), ol = $('#roamSteps');
  const BASE = {
    ap: [60, 190, ['Точка за достъп', 'Access point'], '802.1X', 'b'],
    loc: [140, 100, ['Местен RADIUS', 'Local RADIUS'], '', 'l'],
    top: [280, 175, ['Европейски RADIUS', 'European top-level'], 'eduroam', 'b'],
    idp: [500, 176, ['Проверка на|паролата', 'Password|check'], 'IdP', 'b'],
  };
  /* what changes between the scenarios: who travels, which national server is Bulgarian, the realm */
  const SC = {
    out: {
      user: [60, 300, ['Учен в чужбина', 'Researcher abroad'], 'user@uni.bg', 'r'],
      nat1: [195, 42, ['Национален RADIUS', 'National RADIUS'], '', 'a'],
      nat2: [365, 42, ['Национален RADIUS (BG · НИМ)', 'National RADIUS (BG · NRN)'], '', 'a'],
      home: [400, 100, ['RADIUS в|собствената|институция', 'RADIUS of|own|institution'], 'uni.bg', 'r', 1],
      visited: ['ПОСЕТЕНА ИНСТИТУЦИЯ', 'VISITED INSTITUTION'], own: ['СОБСТВЕНА ИНСТИТУЦИЯ (BG)', 'OWN INSTITUTION (BG)'],
      steps: [
        ['Български учен отваря лаптопа в чужд университет и вижда мрежата „eduroam“.', 'A Bulgarian researcher opens a laptop at a foreign university and sees the “eduroam” network.'],
        ['Точката за достъп препраща заявката (802.1X) към местния RADIUS сървър.', 'The access point forwards the request (802.1X) to the local RADIUS server.'],
        ['По домейна в акаунта (напр. @uni.bg) заявката тръгва нагоре по йерархията от RADIUS проксита.', 'Based on the account’s realm (e.g. @uni.bg), the request travels up the hierarchy of RADIUS proxies.'],
        ['Европейският сървър я насочва към българския национален сървър.', 'The European server routes it to the Bulgarian national server.'],
        ['Българската институция на учения проверява паролата — посетената никога не я вижда.', 'The researcher’s Bulgarian institution checks the password — the visited one never sees it.'],
        ['Отговорът „Accept“ се връща по същия път и потребителят е онлайн.', 'The “Accept” reply returns along the same path and the user is online.'],
      ],
    },
    in: {
      user: [60, 300, ['Гост учен|в България', 'Visiting researcher|in Bulgaria'], 'user@uni.de', 'r'],
      nat1: [195, 42, ['Национален RADIUS (BG · НИМ)', 'National RADIUS (BG · NRN)'], '', 'a'],
      nat2: [365, 42, ['Национален RADIUS', 'National RADIUS'], '', 'a'],
      home: [400, 100, ['RADIUS в|собствената|институция', 'RADIUS of|own|institution'], 'uni.de', 'r', 1],
      visited: ['ПОСЕТЕНА ИНСТИТУЦИЯ (BG)', 'VISITED INSTITUTION (BG)'], own: ['СОБСТВЕНА ИНСТИТУЦИЯ', 'OWN INSTITUTION'],
      steps: [
        ['Гост учен от чужбина отваря лаптопа в български университет и вижда мрежата „eduroam“.', 'A visiting researcher from abroad opens a laptop at a Bulgarian university and sees the “eduroam” network.'],
        ['Точката за достъп препраща заявката (802.1X) към местния RADIUS сървър.', 'The access point forwards the request (802.1X) to the local RADIUS server.'],
        ['По домейна в акаунта (напр. @uni.de) заявката тръгва нагоре — през българския национален RADIUS сървър.', 'Based on the account’s realm (e.g. @uni.de), the request travels up — through the Bulgarian national RADIUS server.'],
        ['Европейският сървър я насочва към националния сървър на страната на учения.', 'The European server routes it to the national server of the researcher’s country.'],
        ['Институцията на учения в чужбина проверява паролата — българският университет никога не я вижда.', 'The researcher’s institution abroad checks the password — the Bulgarian university never sees it.'],
        ['Отговорът „Accept“ се връща по същия път и потребителят е онлайн.', 'The “Accept” reply returns along the same path and the user is online.'],
      ],
    },
  };
  const ORDER = ['user', 'ap', 'loc', 'nat1', 'top', 'nat2', 'home', 'idp'];
  let N, pk, ok, running = false;
  const mark = i => $$('li', ol).forEach((li, j) => li.classList.toggle('on', j === i));
  const build = id => {
    const S = SC[id]; N = { ...BASE, user: S.user, nat1: S.nat1, nat2: S.nat2, home: S.home };
    let h = '';
    for (let i = 0; i < ORDER.length - 1; i++) { const a = N[ORDER[i]], b = N[ORDER[i + 1]]; h += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="rgba(120,170,255,.28)" stroke-width="1.6" stroke-dasharray="4 5"/>`; }
    h += `<rect x="10" y="70" width="200" height="282" rx="12" fill="none" stroke="rgba(71,240,162,.25)" stroke-dasharray="5 5"/>` + boxLabel(20, 344, '#47f0a2', ...S.visited);
    h += `<rect x="372" y="70" width="178" height="196" rx="12" fill="none" stroke="rgba(143,125,255,.3)" stroke-dasharray="5 5"/>` + boxLabel(382, 258, '#8f7dff', ...S.own);
    ORDER.forEach(k => { const [x, y, t, s, lp, subBelow] = N[k];
      h += `<g><circle cx="${x}" cy="${y}" r="17" fill="#0b1834" stroke="${k === 'top' ? C.vi : C.cy}" stroke-width="1.6"/>`;
      h += k === 'user' ? `<rect x="${x - 8}" y="${y - 6}" width="16" height="10" rx="1.5" fill="none" stroke="#e7efff" stroke-width="1.4"/><path d="M${x - 10} ${y + 6}h20" stroke="#e7efff" stroke-width="1.4"/>`
        : k === 'ap' ? `<path d="M${x - 8} ${y - 2}a11 11 0 0 1 16 0M${x - 5} ${y + 1}a7 7 0 0 1 10 0" fill="none" stroke="#e7efff" stroke-width="1.4"/><circle cx="${x}" cy="${y + 5}" r="1.8" fill="#e7efff"/>`
        : k === 'idp' ? `<rect x="${x - 6}" y="${y - 2}" width="12" height="9" rx="1.5" fill="none" stroke="#e7efff" stroke-width="1.4"/><path d="M${x - 4} ${y - 2}v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#e7efff" stroke-width="1.4"/>`
        : `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="2" fill="none" stroke="#e7efff" stroke-width="1.4"/><path d="M${x - 4} ${y - 2}h8M${x - 4} ${y + 2}h8" stroke="#e7efff" stroke-width="1.2"/>`;
      h += nodeLabel(x, y, t, s, lp, subBelow) + '</g>'; });
    h += `<circle id="roamPk" r="6" fill="${C.am}" opacity="0" style="filter:drop-shadow(0 0 6px ${C.am})"/><text id="roamOk" x="60" y="250" text-anchor="middle" fill="${C.gr}" font-family="Geologica" font-weight="700" font-size="14" opacity="0">✓ ONLINE</text>`;
    svg.innerHTML = h; pk = $('#roamPk', svg); ok = $('#roamOk', svg);
    ol.innerHTML = S.steps.map(s => `<li>${L(...s)}</li>`).join(''); mark(0);
  };
  const stepOf = seg => [0, 1, 2, 2, 3, 3, 4][seg];
  $('#roamBtn').addEventListener('click', () => {
    if (running) return; running = true; ok.setAttribute('opacity', 0);
    const path = [...ORDER, ...ORDER.slice(0, -1).reverse()]; let t0 = null; pk.setAttribute('opacity', 1);
    const f = now => { if (!t0) t0 = now; const el = (now - t0) / (RN.RM ? 60 : 520), i = Math.floor(el);
      if (i >= path.length - 1) { pk.setAttribute('opacity', 0); ok.setAttribute('opacity', 1); mark(5); running = false; return; }
      const a = N[path[i]], b = N[path[i + 1]], k = el - i;
      pk.setAttribute('cx', a[0] + (b[0] - a[0]) * k); pk.setAttribute('cy', a[1] + (b[1] - a[1]) * k); pk.setAttribute('fill', i >= ORDER.length - 1 ? C.gr : C.am);
      mark(i < ORDER.length - 1 ? stepOf(i) : 5); requestAnimationFrame(f); };
    mark(0); requestAnimationFrame(f);
  });
  scenSwitch($('#roamScen'), id => { if (running) return false; build(id); });
  build('out');
})();

/* ---------- eduGAIN: SAML single sign-on through federations ---------- */
(function edugain() {
  const svg = $('#gainSvg'), ol = $('#gainSteps'); if (!svg) return;
  const BIF = ['BIF (БИОМ/НИМ)', 'BIF (BREN/NRN)'], FOREIGN = ['Чужда федерация', 'Foreign federation'];
  /* x, y, [label bg, en] ('|' = new line), sub, label side (a/b/l/r), colour.
     fedL = federation of the service (left), fedR = federation of the researcher's home institution (right) */
  const BASE = {
    sp: [125, 170, ['Научна|услуга', 'Research|service'], 'SP', 'l'],
    disc: [225, 255, ['Избор на|институция', 'Choose an|institution'], 'WAYF', 'b'],
    gain: [290, 55, ['eduGAIN', 'eduGAIN'], '', 'a', C.vi],
  };
  const SC = {
    out: {
      user: [70, 305, ['Учен', 'Researcher'], 'user@uni.bg', 'r'],
      idp: [470, 255, ['Вход в собствената|институция', 'Login at the|home institution'], 'IdP · uni.bg', 'b'],
      fedL: FOREIGN, fedR: BIF,
      left: ['УСЛУГА В ЧУЖБИНА', 'SERVICE ABROAD'], right: ['СОБСТВЕНА ИНСТИТУЦИЯ (BG)', 'HOME INSTITUTION (BG)'],
      steps: [
        ['Български учен отваря научна услуга в чужбина — база данни, библиотека или изчислителен портал.', 'A Bulgarian researcher opens a research service abroad — a database, a library or a computing portal.'],
        ['Услугата пита „От коя институция сте?“ и той избира своя университет от списъка.', 'The service asks “Which institution are you from?” and they pick their university from the list.'],
        ['Браузърът го пренасочва към входа на собствената му институция.', 'The browser redirects them to their home institution’s login page.'],
        ['Там въвежда паролата си — услугата в чужбина никога не я вижда.', 'They enter their password there — the service abroad never sees it.'],
        ['Институцията издава подписано потвърждение (SAML) само с нужните данни: кой е и какъв е статутът му.', 'The institution issues a signed assertion (SAML) with only the data needed: who they are and their role.'],
        ['Услугата проверява подписа по метаданните, които BIF и eduGAIN разпространяват до всички федерации.', 'The service checks the signature against the metadata that BIF and eduGAIN distribute to every federation.'],
        ['Ученият е вътре — без нов акаунт и без нова парола.', 'The researcher is in — no new account and no new password.'],
      ],
    },
    in: {
      user: [70, 305, ['Гост учен', 'Visiting researcher'], 'user@uni.de', 'r'],
      idp: [470, 255, ['Вход в собствената|институция', 'Login at the|home institution'], 'IdP · uni.de', 'b'],
      fedL: BIF, fedR: FOREIGN,
      left: ['УСЛУГА В БЪЛГАРИЯ', 'SERVICE IN BULGARIA'], right: ['СОБСТВЕНА ИНСТИТУЦИЯ', 'HOME INSTITUTION'],
      steps: [
        ['Учен от чужбина отваря научна услуга в България — например българска библиотека или учебна платформа.', 'A researcher from abroad opens a research service in Bulgaria — for example a Bulgarian library or learning platform.'],
        ['Услугата пита „От коя институция сте?“ и той избира своя университет в чужбина.', 'The service asks “Which institution are you from?” and they pick their university abroad.'],
        ['Браузърът го пренасочва към входа на собствената му институция.', 'The browser redirects them to their home institution’s login page.'],
        ['Там въвежда паролата си — българската услуга никога не я вижда.', 'They enter their password there — the Bulgarian service never sees it.'],
        ['Институцията издава подписано потвърждение (SAML) само с нужните данни: кой е и какъв е статутът му.', 'The institution issues a signed assertion (SAML) with only the data needed: who they are and their role.'],
        ['Българската услуга проверява подписа по метаданните, които чуждата федерация и eduGAIN разпространяват до BIF.', 'The Bulgarian service checks the signature against the metadata that the foreign federation and eduGAIN distribute to BIF.'],
        ['Ученият е вътре — без нов акаунт и без нова парола.', 'The researcher is in — no new account and no new password.'],
      ],
    },
  };
  /* timeline: [route id | 'pause', step, colour, reverse] */
  const SEQ = [['us', 0, C.am], ['sd', 1, C.am], ['di', 2, C.am], ['pause', 3], ['is', 4, C.gr], ['rg', 5, C.vi], ['gl', 5, C.vi], ['ls', 5, C.vi], ['us', 6, C.gr, true]];
  let pk, ok, lock, running = false;
  const mark = i => $$('li', ol).forEach((li, j) => li.classList.toggle('on', j === i));
  const build = id => {
    const S = SC[id];
    const N = { ...BASE, user: S.user, idp: S.idp, fedL: [125, 55, S.fedL, '', 'a', C.vi], fedR: [460, 55, S.fedR, '', 'a', C.vi] };
    const P = (a, b) => `M${N[a][0]},${N[a][1]} L${N[b][0]},${N[b][1]}`;
    /* routes: id -> [path, kind]; meta = trust/metadata chain, flow = browser redirects */
    const R = {
      us: [P('user', 'sp'), 'flow'], sd: [P('sp', 'disc'), 'flow'], di: [P('disc', 'idp'), 'flow'],
      is: [`M${N.idp[0]},${N.idp[1]} Q330,150 ${N.sp[0]},${N.sp[1]}`, 'flow'],
      rg: [P('fedR', 'gain'), 'meta'], gl: [P('gain', 'fedL'), 'meta'], ls: [P('fedL', 'sp'), 'meta'], ri: [P('fedR', 'idp'), 'meta'],
    };
    let h = `<text x="290" y="13" text-anchor="middle" fill="#8f7dff" font-size="9.5" font-family="JetBrains Mono" letter-spacing="1"><tspan lang="bg">МЕТАДАННИ · ВЕРИГА НА ДОВЕРИЕ</tspan><tspan lang="en">METADATA · CHAIN OF TRUST</tspan></text>`;
    h += `<rect x="10" y="112" width="275" height="240" rx="12" fill="none" stroke="rgba(71,240,162,.25)" stroke-dasharray="5 5"/>` + boxLabel(20, 344, '#47f0a2', ...S.left);
    h += `<rect x="372" y="178" width="178" height="174" rx="12" fill="none" stroke="rgba(143,125,255,.3)" stroke-dasharray="5 5"/>` + boxLabel(382, 344, '#8f7dff', ...S.right);
    Object.entries(R).forEach(([rid, [d, k]]) => {
      h += `<path id="gR_${rid}" d="${d}" fill="none" stroke="${k === 'meta' ? 'rgba(143,125,255,.45)' : 'rgba(120,170,255,.28)'}" stroke-width="1.6" stroke-dasharray="${k === 'meta' ? '2 4' : '4 5'}"/>`;
    });
    Object.entries(N).forEach(([k, [x, y, t, s, lp, col]]) => {
      h += `<g><circle cx="${x}" cy="${y}" r="17" fill="#0b1834" stroke="${col || C.cy}" stroke-width="1.6"/>`;
      h += k === 'user' ? `<rect x="${x - 8}" y="${y - 6}" width="16" height="10" rx="1.5" fill="none" stroke="#e7efff" stroke-width="1.4"/><path d="M${x - 10} ${y + 6}h20" stroke="#e7efff" stroke-width="1.4"/>`
        : k === 'sp' ? `<ellipse cx="${x}" cy="${y - 5}" rx="7" ry="2.6" fill="none" stroke="#e7efff" stroke-width="1.3"/><path d="M${x - 7} ${y - 5}v10a7 2.6 0 0 0 14 0v-10M${x - 7} ${y}a7 2.6 0 0 0 14 0" fill="none" stroke="#e7efff" stroke-width="1.3"/>`
        : k === 'disc' ? `<path d="M${x - 7} ${y - 5}h14M${x - 7} ${y}h14M${x - 7} ${y + 5}h9" stroke="#e7efff" stroke-width="1.4"/>`
        : k === 'idp' ? `<rect x="${x - 6}" y="${y - 2}" width="12" height="9" rx="1.5" fill="none" stroke="#e7efff" stroke-width="1.4"/><path d="M${x - 4} ${y - 2}v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#e7efff" stroke-width="1.4"/>`
        : k === 'gain' ? `<circle cx="${x}" cy="${y}" r="7.5" fill="none" stroke="#e7efff" stroke-width="1.3"/><path d="M${x - 7.5} ${y}h15M${x} ${y - 7.5}a11 11 0 0 1 0 15a11 11 0 0 1 0-15" fill="none" stroke="#e7efff" stroke-width="1.1"/>`
        : `<path d="M${x} ${y - 8}l6.5 3v4.5c0 4-2.8 6.4-6.5 7.3c-3.7-.9-6.5-3.3-6.5-7.3V${y - 5}z" fill="none" stroke="#e7efff" stroke-width="1.3"/>`;
      h += nodeLabel(x, y, t, s, lp) + '</g>';
    });
    h += `<circle id="gainLock" cx="${N.idp[0]}" cy="${N.idp[1]}" r="17" fill="none" stroke="${C.am}" stroke-width="3" opacity="0"/>`;
    h += `<circle id="gainPk" r="6" fill="${C.am}" opacity="0" style="filter:drop-shadow(0 0 6px ${C.am})"/><text id="gainOk" x="${N.user[0] + 24}" y="${N.user[1] - 24}" fill="${C.gr}" font-family="Geologica" font-weight="700" font-size="14" opacity="0"><tspan lang="bg">✓ ВЪТРЕ</tspan><tspan lang="en">✓ SIGNED IN</tspan></text>`;
    svg.innerHTML = h; pk = $('#gainPk', svg); ok = $('#gainOk', svg); lock = $('#gainLock', svg);
    ol.innerHTML = S.steps.map(s => `<li>${L(...s)}</li>`).join(''); mark(0);
  };
  $('#gainBtn').addEventListener('click', () => {
    if (running) return; running = true; ok.setAttribute('opacity', 0);
    const dur = s => RN.RM ? 60 : s[0] === 'pause' ? 1100 : 650;
    let i = 0, t0 = null;
    const f = now => {
      if (t0 === null) t0 = now;
      const s = SEQ[i], k = Math.min(1, (now - t0) / dur(s));
      mark(s[1]);
      if (s[0] === 'pause') { pk.setAttribute('opacity', 0); lock.setAttribute('opacity', (Math.sin(k * Math.PI * 3) * .5 + .5).toFixed(2)); }
      else {
        lock.setAttribute('opacity', 0);
        const p = $('#gR_' + s[0], svg), L0 = p.getTotalLength(), q = p.getPointAtLength((s[3] ? 1 - k : k) * L0);
        pk.setAttribute('opacity', 1); pk.setAttribute('fill', s[2]); pk.style.filter = `drop-shadow(0 0 6px ${s[2]})`;
        pk.setAttribute('cx', q.x); pk.setAttribute('cy', q.y);
      }
      if (k >= 1) { i++; t0 = now; if (i >= SEQ.length) { pk.setAttribute('opacity', 0); ok.setAttribute('opacity', 1); running = false; return; } }
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
  scenSwitch($('#gainScen'), id => { if (running) return false; build(id); });
  build('out');
})();

/* ---------- eduroam in Bulgaria (data/eduroam.json) ----------
   Shows the snapshot of the eduroam.bg monitoring table (refreshed by tools/update_eduroam.py).
   It also tries to read the monitoring page directly: that only works if eduroam.bg allows it
   (Access-Control-Allow-Origin). Then the list is live and gets a status dot per institution. */
RN.data('eduroam').then(D => {
  const MB = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
  const ME = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const date = d => L(`${d.getDate()} ${MB[d.getMonth()]} ${d.getFullYear()}`, `${d.getDate()} ${ME[d.getMonth()]} ${d.getFullYear()}`);
  const link = `<a href="${D.live.page}" target="_blank" rel="noopener">${L('мониторинг на eduroam.bg', 'eduroam.bg monitoring')} ↗</a>`;
  let servers = D.servers, live = false;

  /* group servers by institution; the national top-level servers form one entry */
  const groups = () => {
    const G = new Map();
    servers.forEach(s => {
      const n = D.names[s.inst] || { bg: s.inst, en: s.inst }, key = n.top ? '__top' : s.inst;
      if (!G.has(key)) G.set(key, { ...n, top: !!n.top, list: [] });
      G.get(key).list.push(s);
    });
    return [...G.values()];
  };
  const stOf = g => { const up = g.list.filter(s => s.status === 'Up').length;
    return up === g.list.length ? 'up' : g.list.some(s => /Up/.test(s.status)) ? 'part' : 'down'; };
  const list = () => {
    const lg = RN.lang === 'en' ? 'en' : 'bg', G = groups();
    $('#eduInst').textContent = G.filter(g => !g.top).length; $('#eduSrv').textContent = servers.length;
    $('#eduList').innerHTML = G.sort((a, b) => b.top - a.top || a[lg].localeCompare(b[lg], lg)).map(g => {
      const n = g.list.length, more = n > 1 ? ` <small>· ${n} ${L('сървъра', 'servers')}</small>` : '';
      const tag = g.top ? `<i class="top">${L('НИМ', 'NRN')}</i>` : '<i>RADIUS</i>';
      const st = live ? `<span class="st ${stOf(g)}" title="${g.list.map(s => s.host + ': ' + s.status).join('\n')}"></span>` : '';
      return `<li>${tag}<span>${L(g.bg, g.en)}${more}</span>${st}</li>`;
    }).join('');
  };
  document.addEventListener('rn:lang', list);
  const setSrc = (d, isLive) => { $('#eduSrc').innerHTML = `<span class="dot${isLive ? ' live' : ''}"></span>${isLive ? L('Данни от eduroam.bg · ', 'Data from eduroam.bg · ') : L('Към ', 'As of ')}${date(d)} · ${link}`; };
  setSrc(new Date(D.asof + 'T12:00'), false); list();

  /* live attempt: parse the monitoring table if eduroam.bg allows cross-site reading */
  const c = new AbortController(); setTimeout(() => c.abort(), 8000);
  fetch(D.live.page, { signal: c.signal }).then(r => r.ok ? r.text() : Promise.reject()).then(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html'), t = doc.querySelector('table'); if (!t) return;
    const rows = [...t.querySelectorAll('tbody tr')].map(tr => [...tr.cells].map(td => td.querySelector('img')?.getAttribute('description') || td.textContent.trim()))
      .filter(r => r.length >= 6 && r[1]);
    if (!rows.length) return;
    servers = rows.map(r => ({ inst: r[0], host: r[1], status: r[5] })); live = true;
    setSrc(new Date(), true); list();
  }).catch(() => {});
}).catch(() => {});

/* ---------- BIF: the Bulgarian federation in eduGAIN ----------
   Shows data/bif.json at once, then replaces it with the live list from the eduGAIN API.
   Known members keep the polished names from bif.json (matched by entityID); new ones use the
   name registered in eduGAIN. If the API is unreachable the bif.json snapshot stays. */
RN.data('bif').then(D => {
  const MB = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
  const ME = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const link = `<a href="${D.live.page}" target="_blank" rel="noopener">technical.edugain.org ↗</a>`;
  let members = D.members.map(m => ({ ...m, types: [m.type] }));

  const render = (feds, src) => {
    const idp = members.filter(m => m.types.includes('idp')), sp = members.filter(m => m.types.includes('sp'));
    $('#bifIdp').textContent = idp.length; $('#bifSp').textContent = sp.length;
    $('#bifFeds').textContent = $('#bifFeds2').textContent = feds;
    $('#bifSrc').innerHTML = src + ' · ' + link;
    list();
  };
  /* alphabetical in the current language: IdPs first, then services */
  const list = () => {
    const lg = RN.lang === 'en' ? 'en' : 'bg', by = (a, b) => a[lg].localeCompare(b[lg], lg);
    const rank = m => m.types.includes('idp') ? 0 : 1;
    $('#bifList').innerHTML = [...members].sort((a, b) => rank(a) - rank(b) || by(a, b))
      .map(x => `<li class="${x.types.includes('idp') ? 'idp' : 'sp'}">${x.types.map(t => `<i class="${t}">${t === 'idp' ? 'IdP' : 'SP'}</i>`).join('')}${L(x.bg, x.en)}</li>`).join('');
  };
  document.addEventListener('rn:lang', list);

  const [y, m] = D.asof.split('-').map(Number);
  render(D.feds, `<span class="dot"></span>${L(`Към ${MB[m - 1]} ${y}`, `As of ${ME[m - 1]} ${y}`)}`);

  /* live data from eduGAIN */
  const get = url => { const c = new AbortController(); const t = setTimeout(() => c.abort(), 8000);
    return fetch(url, { signal: c.signal }).then(r => { clearTimeout(t); if (!r.ok) throw new Error(r.status); return r.json(); }); };
  /* "bg;Име==en;Name" -> { bg, en } */
  const names = s => Object.fromEntries((s || '').split('==').map(p => { const i = p.indexOf(';'); return [p.slice(0, i), p.slice(i + 1).trim()]; }).filter(([k, v]) => k && v));
  const KNOWN = Object.fromEntries(D.members.map(x => [x.entityid, x]));
  Promise.all([get(D.live.entities), get(D.live.feds).catch(() => null)]).then(([ents, feds]) => {
    const live = ents.map(roles => {
      const types = [...new Set(roles.map(r => r.roledesc === 'IDPSSODescriptor' ? 'idp' : r.roledesc === 'SPSSODescriptor' ? 'sp' : '').filter(Boolean))];
      if (!types.length) return null;
      const id = roles[0].entityid, k = KNOWN[id];
      if (k) return { ...k, types };
      const main = roles.find(r => r.r_displayname) || roles[0], n = { ...names(roles[0].e_displayname), ...names(main.r_displayname) };
      return { entityid: id, types, bg: n.bg || n.en || id, en: n.en || n.bg || id };
    }).filter(Boolean);
    if (!live.length) return;
    members = live;
    const d = new Date();
    render(feds ? Object.keys(feds).length : D.feds,
      `<span class="dot live"></span>${L(`Данни от eduGAIN · ${d.getDate()} ${MB[d.getMonth()]} ${d.getFullYear()}`, `Data from eduGAIN · ${d.getDate()} ${ME[d.getMonth()]} ${d.getFullYear()}`)}`);
  }).catch(() => {});
}).catch(() => {});

/* ---------- FAIR ---------- */
$('#fair').innerHTML = [
  ['F', ['Откриваеми', 'Findable'], ['Данните имат постоянни идентификатори и описания, по които се намират.', 'Data has persistent identifiers and metadata so it can be found.']],
  ['A', ['Достъпни', 'Accessible'], ['Достъпът минава през стандартни протоколи и федеративна идентичност.', 'Access goes through standard protocols and federated identity.']],
  ['I', ['Оперативно съвместими', 'Interoperable'], ['Общи формати и речници позволяват данните да се комбинират.', 'Shared formats and vocabularies let data be combined.']],
  ['R', ['Многократно използваеми', 'Reusable'], ['Ясни лицензи и произход позволяват повторна употреба.', 'Clear licences and provenance enable reuse.']],
].map(([l, t, d]) => `<div class="flip" tabindex="0"><div class="in"><div class="f"><b class="grad">${l}</b><span>${L(...t)}</span></div><div class="b">${L(...d)}</div></div></div>`).join('');
$$('#fair .flip').forEach(f => { f.addEventListener('click', () => f.classList.toggle('on')); f.addEventListener('keydown', e => { if (e.key === 'Enter') f.classList.toggle('on'); }); });

/* ---------- Science DMZ ---------- */
(function dmz() {
  const s = $('#dmzSvg');
  s.innerHTML = `<rect x="14" y="70" width="70" height="60" rx="10" fill="#0b1834" stroke="${C.vi}"/><text x="49" y="104" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="11">NREN</text>
  <path d="M84 100 C 140 100, 150 50, 200 50 L 420 50" fill="none" stroke="rgba(255,93,122,.35)" stroke-width="10"/><path d="M84 100 C 140 100, 150 150, 200 150 L 420 150" fill="none" stroke="rgba(71,240,162,.3)" stroke-width="14"/>
  <rect x="240" y="30" width="40" height="40" rx="6" fill="#2a1420" stroke="${C.rd}"/><text x="260" y="55" text-anchor="middle" fill="${C.rd}" font-size="16">🔥</text>
  <text x="300" y="30" fill="${C.rd}" font-family="JetBrains Mono" font-size="10" lang="bg">обща мрежа · защитна стена</text><text x="300" y="30" fill="${C.rd}" font-family="JetBrains Mono" font-size="10" lang="en">general network · firewall</text>
  <text x="230" y="185" fill="${C.gr}" font-family="JetBrains Mono" font-size="10">SCIENCE DMZ · data transfer nodes</text>
  <rect x="420" y="30" width="86" height="40" rx="8" fill="#0b1834" stroke="#5e7096"/><text x="463" y="55" text-anchor="middle" fill="#cfe0ff" font-family="Golos Text" font-size="11" lang="bg">офиси, Wi-Fi</text><text x="463" y="55" text-anchor="middle" fill="#cfe0ff" font-family="Golos Text" font-size="11" lang="en">offices, Wi-Fi</text>
  <rect x="420" y="130" width="86" height="40" rx="8" fill="#0b1834" stroke="${C.gr}"/><text x="463" y="155" text-anchor="middle" fill="#cfe0ff" font-family="Golos Text" font-size="11" lang="bg">хранилище</text><text x="463" y="155" text-anchor="middle" fill="#cfe0ff" font-family="Golos Text" font-size="11" lang="en">storage</text><g id="dmzP"></g>`;
  const g = $('#dmzP', s), P = [];
  for (let i = 0; i < 14; i++) { const c = document.createElementNS(RN.NS, 'circle'); c.setAttribute('r', i < 4 ? 3.5 : 4); c.setAttribute('fill', i < 4 ? C.rd : C.gr); g.appendChild(c); P.push({ c, slow: i < 4, k: i / 14 }); }
  RN.loop(s, dt => P.forEach(p => {
    p.k = (p.k + dt * (p.slow ? .12 : .45)) % 1; let x, y; const k = p.k;
    if (p.slow) { const stuck = k > .42 && k < .62; x = stuck ? 236 + (k - .42) * 20 : 84 + k * 336; y = 50 + (k < .3 ? (1 - k / .3) * 50 : 0); }
    else { x = 84 + k * 336; y = 150 - (k < .3 ? (1 - k / .3) * 50 : 0); }
    p.c.setAttribute('cx', x); p.c.setAttribute('cy', y);
  }));
})();

/* ---------- NOTED ---------- */
(function noted() {
  const s = $('#notedSvg');
  s.innerHTML = `<rect x="14" y="78" width="70" height="44" rx="10" fill="#0b1834" stroke="${C.cy}"/><text x="49" y="104" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="11">FTS</text>
  <rect x="436" y="78" width="70" height="44" rx="10" fill="#0b1834" stroke="${C.cy}"/><text x="471" y="104" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="11">Tier-1</text>
  <path id="nA" d="M84 100 C 180 100, 200 40, 260 40 S 360 100, 436 100" fill="none" stroke="rgba(143,125,255,.5)" stroke-width="6"/>
  <path id="nB" d="M84 100 C 180 100, 200 165, 260 165 S 360 100, 436 100" fill="none" stroke="rgba(120,170,255,.12)" stroke-width="6"/>
  <text x="260" y="26" text-anchor="middle" fill="#93a5c8" font-family="JetBrains Mono" font-size="10">route A</text><text x="260" y="192" text-anchor="middle" fill="#93a5c8" font-family="JetBrains Mono" font-size="10">route B · spare</text>
  <text id="nState" x="260" y="108" text-anchor="middle" fill="#5e7096" font-family="JetBrains Mono" font-size="10">monitoring FTS…</text><g id="nP"></g>`;
  const A = $('#nA', s), B = $('#nB', s), g = $('#nP', s), st = $('#nState', s), LA = A.getTotalLength(), LB = B.getTotalLength();
  let big = 0; const P = [];
  for (let i = 0; i < 22; i++) { const c = document.createElementNS(RN.NS, 'circle'); c.setAttribute('r', 3.2); g.appendChild(c); P.push({ c, k: i / 22, alt: i % 2 }); }
  $('#notedBtn').addEventListener('click', () => { big = performance.now(); });
  RN.loop(s, (dt, now) => {
    const t = big ? (now - big) / 1000 : 99, steering = t > 1.2 && t < 9;
    st.textContent = t < 1.2 ? 'large transfer detected' : steering ? 'VRF steering → route B' : 'monitoring FTS…';
    st.setAttribute('fill', t < 9 ? C.am : '#5e7096');
    B.setAttribute('stroke', steering ? 'rgba(62,230,255,.55)' : 'rgba(120,170,255,.12)');
    P.forEach(p => { const active = p.alt ? steering : true, path = p.alt && steering ? B : A, len = p.alt && steering ? LB : LA;
      p.k = (p.k + dt * (t < 9 ? .5 : .3)) % 1; const pt = path.getPointAtLength(p.k * len);
      p.c.setAttribute('cx', pt.x); p.c.setAttribute('cy', pt.y); p.c.setAttribute('fill', p.alt && steering ? C.cy : t < 9 ? C.am : C.vi); p.c.setAttribute('opacity', active || !p.alt ? 1 : (t < 9 ? .9 : .5)); });
  });
})();
RN.enhance();
})();
