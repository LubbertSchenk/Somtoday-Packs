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
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

  // Toont de pop-up "Er zijn nieuwe cijfers gevonden" en opent één pack per cijfer.
  class Tray {
    constructor() { this.pending = new Map(); this.current = null; this.busy = false; this.dismissed = false; this.sig = ''; }
    get el() {
      let r = document.getElementById('som-tray-root');
      if (!r) { r = document.createElement('div'); r.id = 'som-tray-root'; document.body.appendChild(r); }
      return r;
    }
    sync(fresh) {
      const next = new Map(fresh.map(g => [g.fingerprint, g]));
      if (this.current) next.delete(this.current.fingerprint);
      if ([...next.keys()].some(k => !this.pending.has(k))) this.dismissed = false;
      this.pending = next;
      this.render();
    }
    render() {
      if (this.busy) return;   // tray blijft onder de pack staan, zodat je nooit de pagina met cijfers ziet
      const items = [...this.pending.values()];
      const sig = this.dismissed + '|' + items.map(g => g.fingerprint).join(',');
      if (sig === this.sig) return;
      this.sig = sig;
      if (!items.length) { document.getElementById('som-tray-root')?.remove(); return; }
      if (this.dismissed) {
        state.dom.set(this.el, `<button class="som-tray-fab" type="button">🎁 ${items.length} nieuwe cijfers</button>`);
        this.el.querySelector('.som-tray-fab').onclick = () => { this.dismissed = false; this.render(); };
        return;
      }
      state.dom.set(this.el, `<div class="som-tray" role="dialog" aria-modal="true">
        <button class="som-tray-close" type="button" aria-label="Sluiten">✕</button>
        <h2>Er zijn nieuwe cijfers gevonden</h2>
        <div class="som-tray-grid">${items.map((g, i) =>
          `<button class="som-tray-card" type="button" data-i="${i}"><b>?</b>${esc(g.subject)}</button>`).join('')}</div>
        <p>Klik op een cijfer om die pack te openen</p>
        <button class="som-tray-skip" type="button">Pack opening overslaan</button></div>`);
      this.el.querySelector('.som-tray-close').onclick = () => { this.dismissed = true; this.render(); };
      this.el.querySelector('.som-tray-skip').onclick = () => this.skipAll();
      this.el.querySelectorAll('.som-tray-card').forEach(b => b.onclick = () => this.open(items[+b.dataset.i]));
    }
    async skipAll() {
      const items = [...this.pending.values()];
      this.pending = new Map();
      await state.gradeTracker.markProcessed(items, { celebrated: false });
      this.render();
      state.spoiler?.clear();
    }
    async open(g) {
      if (this.busy) return;
      if (await state.gradeTracker.isProcessed(g.fingerprint)) { this.pending.delete(g.fingerprint); return this.render(); } // al geopend (bv. in ander tabblad)
      this.busy = true; this.current = g; this.pending.delete(g.fingerprint);
      console.log('[SOM Pack] pack openen:', g.subject, g.display);
      try {
        await state.pack.open(g, this.pending.size, () => state.gradeTracker.markProcessed([g]));
      } catch (e) { console.warn('[SOM Pack] opening failed', e); }
      this.busy = false; this.current = null;
      state.spoiler?.release(g);
      this.sig = ''; this.render();
    }
  }
  state.queue = new Tray();
})();
