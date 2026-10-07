/**
 * Somtoday Packs
 * 
 * @description     This extension allows you to open new grades like EA FC packs. Not affiliated with Somtoday or EA Sports.
 * @author          LubbertSchenk <info@lubbertschenk.nl>
 * @copyright       2026 (C) LubbertSchenk
 * @see             https://lubbertschenk.nl
 * 
 * Released under the MIT License.
 * See: https://opensource.org/licenses/MIT
 */

(() => {
  const NS = '__SOM_ULTIMATE__'; const state = window[NS] ||= {};
  let info = { detected: 0, fresh: 0 };
  let timer = 0, lastSig = '', running = false, rerun = false;
  const schedule = ms => { clearTimeout(timer); timer = setTimeout(run, ms); };

  async function process() {
    state.homepage?.apply();
    const settings = await chrome.storage.local.get({ enabled: true, spoilerProtection: true });
    const guard = state.guard;
    if (!settings.enabled) { state.spoiler.clear(); state.queue.sync([]); guard.off(); return; }
    if (!settings.spoilerProtection) guard.off();
    const grades = state.gradeDetector.detect();
    info.detected = grades.length;
    if (!grades.length) {
      lastSig = ''; state.queue.sync([]);
      // lijst nog niet geladen: blijf afgedekt; pas loslaten als dit geen cijferroute is of het te lang duurt
      if (guard.active() && (!guard.isGrades() || guard.age() > 3000)) guard.off(); else if (guard.active()) schedule(400);
      return;
    }
    // Pas verwerken als de lijst twee scans achter elkaar gelijk is (voorkomt half geladen lijsten).
    const sig = grades.map(g => g.key).join('~');
    if (sig !== lastSig) { lastSig = sig; schedule(state.guard.active() ? 350 : 700); return; }
    const { fresh } = await state.gradeTracker.reconcile(grades);
    info.fresh = fresh.length;
    state.queue.sync(fresh);
    settings.spoilerProtection ? state.spoiler.apply(fresh) : state.spoiler.clear();
    state.guard.off();   // pop-up staat er (of er is niets nieuws): pas nu de pagina vrijgeven
  }

  async function run() {
    if (running) { rerun = true; return; }
    running = true;
    try { await process(); } catch (e) { console.warn('[SOM Pack] scan failed', e); }
    running = false;
    if (rerun) { rerun = false; schedule(300); }
  }

  const ours = n => n.nodeType === 1 ? n.closest?.('#som-pack-root,#som-tray-root') : n.parentElement?.closest?.('#som-pack-root,#som-tray-root');
  let lastPath = location.pathname;
  const routeCheck = () => {
    if (location.pathname === lastPath) return;
    lastPath = location.pathname; lastSig = '';
    state.guard.isGrades() ? state.guard.on() : state.guard.off();
  };
  new MutationObserver(muts => { routeCheck(); if (muts.some(m => !ours(m.target))) schedule(state.guard.active() ? 150 : 500); })
    .observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  chrome.storage.onChanged.addListener(() => { lastSig = ''; schedule(200); });
  chrome.runtime.onMessage.addListener((m, _s, reply) => {
    if (m?.type === 'status') reply({ ...info, pending: state.queue.pending.size, busy: state.queue.busy });
    if (m?.type === 'test-pack') {
      const v = Number(m.value) || 7.8;
      state.pack.open({ value: v, display: String(v).replace('.', ','), subject: 'Testvak', assessment: 'Testpack', date: 'vandaag', weight: '1x' }, 0)
        .catch(e => console.error('[SOM Pack] test mislukt', e));
    }
  });
  console.log('[SOM Pack] 1.4.0 geladen');
  schedule(500);
})();
