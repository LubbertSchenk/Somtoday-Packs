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
  // Draait op document_start: dekt de cijferpagina af voordat er ook maar één cijfer zichtbaar is.
  const NS = '__SOM_ULTIMATE__'; const state = window[NS] ||= {};
  const root = document.documentElement; let start = 0, failsafe = 0;
  const isGrades = () => {
    const route = `${location.pathname}${location.hash}`.toLowerCase();
    return /(^|[/#])(cijfers|resultaten|grades)([/#?]|$)/.test(route);
  };
  const active = () => root.classList.contains('som-guard');
  const off = () => { root.classList.remove('som-guard'); clearTimeout(failsafe); };
  const on = () => {
    if (active()) return;
    start = Date.now(); root.classList.add('som-guard');
    failsafe = setTimeout(off, 8000);               // nooit langer dan 8 s geblokkeerd
  };
  state.guard = { on, off, active, isGrades, age: () => Date.now() - start };
  const gradeLeaf = /^\d{1,2}[,.]\d{1,2}$/;
  const homeGradeTitles = () => [...document.querySelectorAll('h1,h2,h3,h4,h5,span,p,div,a,button')]
    .filter(e => /^laatste cijfers?$/i.test((e.textContent || '').replace(/\s+/g, ' ').trim()));
  const hideHomeGrade = () => {
    if (isGrades() || !root.classList.contains('som-home-guard')) return;
    for (const title of homeGradeTitles()) {
      let box = title;
      for (let i = 0; i < 8 && box.parentElement; i++) {
        box = box.parentElement;
        const grades = [...box.querySelectorAll('*')].filter(e => gradeLeaf.test((e.textContent || '').replace(/\s+/g, ' ').trim()));
        if (grades.length) {
          grades.forEach(e => e.classList.add('som-home-hide'));
          break;
        }
      }
    }
  };
  const clearHomeGrade = () => document.querySelectorAll('.som-home-hide').forEach(e => e.classList.remove('som-home-hide'));
  const refreshHome = () => chrome.storage.local.get({ hideHomepageGrade: true, enabled: true })
    .then(s => {
      const enabled = s.enabled && s.hideHomepageGrade && !isGrades();
      root.classList.toggle('som-home-guard', enabled);
      if (enabled) hideHomeGrade(); else clearHomeGrade();
    }).catch(() => { root.classList.remove('som-home-guard'); clearHomeGrade(); });
  state.guard.refreshHome = refreshHome;
  if (!isGrades()) root.classList.add('som-home-guard');
  refreshHome();
  new MutationObserver(hideHomeGrade).observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  if (isGrades()) {
    on();
    chrome.storage.local.get({ enabled: true, spoilerProtection: true })
      .then(s => { if (!s.enabled || !s.spoilerProtection) off(); }).catch(off);
  }
})();
