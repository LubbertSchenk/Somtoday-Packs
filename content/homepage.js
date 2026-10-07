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
  const text = el => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const clear = () => document.querySelectorAll('.som-home-hide').forEach(e => e.classList.remove('som-home-hide'));

  function apply() {
    if (state.guard?.isGrades()) { clear(); return; }
    chrome.storage.local.get({ hideHomepageGrade: true, enabled: true }).then(s => {
      if (!s.enabled || !s.hideHomepageGrade) { clear(); return; }
      const titles = [...document.querySelectorAll('h1,h2,h3,h4,h5,span,p,div,a,button')]
        .filter(e => /^laatste cijfers?$/i.test(text(e)));
      for (const title of titles) {
        let box = title;
        for (let i = 0; i < 8 && box.parentElement; i++) {
          box = box.parentElement;
          const grades = [...box.querySelectorAll('*')].filter(e => gradeLeaf.test(text(e)));
          if (grades.length) {
            grades.forEach(e => e.classList.add('som-home-hide'));
            break;
          }
        }
      }
    }).catch(error => console.warn('[SOM Pack] homepage grade hiding failed', error));
  }

  state.homepage = { apply };
})();
