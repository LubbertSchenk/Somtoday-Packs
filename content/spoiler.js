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
  const NS = '__SOM_ULTIMATE__'; const state = window[NS] ||= {}; const cls = 'som-grade-spoiler';
  // Verbergt alleen cijfers die nog niet geopend zijn; geopende cijfers zie je gewoon.
  function apply(unopened) {
    const keep = new Set(unopened.map(g => g.gradeElement).filter(Boolean));
    document.querySelectorAll('.' + cls).forEach(el => { if (!keep.has(el)) el.classList.remove(cls); });
    keep.forEach(el => el.classList.add(cls));
  }
  const clear = () => document.querySelectorAll('.' + cls).forEach(el => el.classList.remove(cls));
  const release = g => g?.gradeElement?.classList.remove(cls);
  state.spoiler = { apply, clear, release };
})();
