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
  // [ondergrens, naam, kleur, duur van pack-animatie]
  const tiers = [
    [0.1, 'Disaster', '#ff334f', 700], [1.1, 'Bronze', '#c8793b', 1000], [4, 'Silver', '#d9e3ee', 1300],
    [5.5, 'Gold', '#ffd34d', 1700], [7.5, 'Elite', '#329cff', 2100], [8.5, 'Special', '#b05cff', 2600], [9.1, 'Ultimate', '#54e06b', 3200]
  ];
  const rarity = v => tiers.filter(t => v >= t[0]).pop() || tiers[0];   // geen gaten tussen de grenzen
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  function ensureRoot() {
    let root = document.getElementById('som-pack-root');
    if (!root) { root = document.createElement('div'); root.id = 'som-pack-root'; document.body.appendChild(root); }
    return root;
  }
  function countUp(el, grade, ms) {
    const dec = /[.,]/.test(grade.display) ? grade.display.split(/[.,]/)[1].length : 0;
    const t0 = performance.now();
    const tick = now => {
      if (!el.isConnected) return;
      const p = Math.min((now - t0) / ms, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? (grade.value * e).toFixed(dec).replace('.', ',') : grade.display;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // open(grade, aantalAnderen, onReveal): onReveal wordt aangeroepen zodra het cijfer zichtbaar is.
  function open(grade, others, onReveal) {
    return new Promise(async (resolve, reject) => { try {
      const root = ensureRoot(); const [, name, color, duration] = rarity(grade.value);
      const s = await chrome.storage.local.get({ animations: true, reducedIntensity: false });
      const reduced = s.reducedIntensity || !s.animations || matchMedia('(prefers-reduced-motion: reduce)').matches;
      state.dom.set(root, `<div class="som-overlay" role="dialog" aria-modal="true"><div class="som-atmosphere"></div>
        <div class="som-top"><span>SOM ULTIMATE</span><span>${others ? `NOG ${others} IN DE LIJST` : 'LAATSTE CIJFER'}</span></div>
        <button class="som-skip" type="button">Overslaan <kbd>Esc</kbd></button>
        <div class="som-stage"><div class="som-pack-art"><div class="som-pack-shine"></div><div class="som-pack-mark">SOM</div><div class="som-pack-word">PACK</div></div>
          <div class="som-card" aria-live="polite"><div class="som-rarity">${name.toUpperCase()}</div><div class="som-grade">${reduced ? esc(grade.display) : '0'}</div>
            <div class="som-subject">${esc(grade.subject)}</div><div class="som-meta">${esc(grade.assessment)}${grade.date ? ` · ${esc(grade.date)}` : ''}${grade.weight ? ` · ${esc(grade.weight)}` : ''}</div></div></div>
        <div class="som-actions"><button class="som-next" type="button">${others ? 'Terug naar de lijst' : 'Sluiten'}</button></div></div>`);
      const overlay = root.querySelector('.som-overlay'), skip = root.querySelector('.som-skip'), next = root.querySelector('.som-next');
      overlay.style.setProperty('--rarity', color);
      let revealed = false, closed = false, timer;
      const finish = () => {
        if (closed) return; closed = true; clearTimeout(timer); document.removeEventListener('keydown', key, true);
        overlay.classList.add('closing'); setTimeout(() => { root.remove(); resolve(); }, reduced ? 0 : 220);
      };
      const reveal = () => {
        if (revealed) return; revealed = true; clearTimeout(timer);
        overlay.classList.add('revealed'); state.effects.burst(overlay, name, reduced);
        if (!reduced) countUp(root.querySelector('.som-grade'), grade, 1400);
        Promise.resolve(onReveal?.()).catch(() => {}); next.focus();
      };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); revealed ? finish() : reveal(); } };
      document.addEventListener('keydown', key, true);
      skip.onclick = () => (revealed ? finish() : reveal());
      next.onclick = finish;
      if (reduced) requestAnimationFrame(reveal); else timer = setTimeout(reveal, duration);
    } catch (e) { console.error('[SOM Pack] pack-animatie mislukt', e); reject(e); } });
  }
  state.pack = { open, rarity };
})();
