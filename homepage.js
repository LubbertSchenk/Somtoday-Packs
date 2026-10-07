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
  const gradeLeaf = /^\d{1,2}[,.]\d{1,2}$/;
  function apply() {
    if (location.pathname.startsWith('/cijfers')) return;
    chrome.storage.local.get({ hideHomepageGrade: true, enabled: true }).then(s => {
      if (!s.enabled || !s.hideHomepageGrade) { document.querySelectorAll('.som-home-hide').forEach(e => e.classList.remove('som-home-hide')); return; }
      const titles = [...document.querySelectorAll('h1,h2,h3,h4,h5,span,p,div,a,button')]
        .filter(e => e.children.length === 0 && /^\s*laatste cijfers?\s*$/i.test(e.textContent || ''));
      for (const t of titles) {
        let box = t;
        for (let i = 0; i < 6 && box.parentElement; i++) {
          box = box.parentElement;
          const leaves = [...box.querySelectorAll('*')].filter(e => e.children.length === 0 && gradeLeaf.test((e.textContent || '').trim()));
          if (leaves.length) { leaves.forEach(e => e.classList.add('som-home-hide')); break; }
        }
      }
    });
  }
  state.homepage = { apply };
})();
