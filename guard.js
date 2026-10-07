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
  const isGrades = () => location.pathname.startsWith('/cijfers');
  const active = () => root.classList.contains('som-guard');
  const off = () => { root.classList.remove('som-guard'); clearTimeout(failsafe); };
  const on = () => {
    if (active()) return;
    start = Date.now(); root.classList.add('som-guard');
    failsafe = setTimeout(off, 8000);               // nooit langer dan 8 s geblokkeerd
  };
  // Buiten /cijfers (bv. de startpagina) worden getoonde cijfers vervangen door 🎁
  const refreshHome = () => chrome.storage.local.get({ hideHomepageGrade: true, enabled: true })
    .then(s => root.classList.toggle('som-hide-grades', s.enabled && s.hideHomepageGrade && !isGrades()))
    .catch(() => {});
  if (!isGrades()) root.classList.add('som-hide-grades');   // meteen, voordat de instelling is gelezen
  refreshHome();
  state.guard = { on, off, active, isGrades, refreshHome, age: () => Date.now() - start };
  if (isGrades()) {
    on();
    chrome.storage.local.get({ enabled: true, spoilerProtection: true })
      .then(s => { if (!s.enabled || !s.spoilerProtection) off(); }).catch(off);
  }
})();
