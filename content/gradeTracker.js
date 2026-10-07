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
  const NS = '__SOM_ULTIMATE__';
  const state = window[NS] ||= {};
  const hash = async input => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  };
  const get = () => chrome.storage.local.get({ initialized: false, processed: {}, celebratedCount: 0 });

  async function reconcile(grades) {
    const data = await get();
    const all = [];
    for (const g of grades) all.push({ ...g, fingerprint: await hash(g.key) });
    if (!data.initialized) {
      if (!all.length) return { fresh: [], all, baselineCreated: false };   // wacht tot de lijst er echt staat
      const processed = { ...data.processed };
      all.forEach(g => { processed[g.fingerprint] = { seenAt: Date.now(), baseline: true }; });
      await chrome.storage.local.set({ initialized: true, processed });
      return { fresh: [], all, baselineCreated: true };
    }
    return { fresh: all.filter(g => !data.processed[g.fingerprint]), all, baselineCreated: false };
  }

  async function isProcessed(fingerprint) { return !!(await get()).processed[fingerprint]; }

  // Idempotent: een cijfer dat al is opgeslagen wordt niet nog eens geteld.
  async function markProcessed(grades, { celebrated = true } = {}) {
    if (!grades.length) return;
    const data = await get();
    const processed = { ...data.processed };
    let added = 0;
    grades.forEach(g => {
      if (!processed[g.fingerprint]) added++;
      processed[g.fingerprint] = { seenAt: Date.now(), baseline: false };
    });
    await chrome.storage.local.set({ processed, celebratedCount: (data.celebratedCount || 0) + (celebrated ? added : 0) });
  }

  const reset = () => chrome.storage.local.set({ initialized: false, processed: {}, celebratedCount: 0 });
  state.gradeTracker = { reconcile, isProcessed, markProcessed, reset };
})();
