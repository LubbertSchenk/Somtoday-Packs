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
  function burst(root, rarity, reduced) {
    if (reduced) return;
    const colors = { Disaster:'#ff334f', Bronze:'#d17a31', Silver:'#dce6f2', Gold:'#ffd34d', Elite:'#3da8ff', Special:'#b06cff', Ultimate:'#54e06b' };
    const count = rarity === 'Ultimate' ? 80 : rarity === 'Special' ? 60 : rarity === 'Elite' ? 45 : 28;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('i'); p.className = 'som-particle'; p.style.setProperty('--x', `${(Math.random()-.5)*900}px`); p.style.setProperty('--y', `${(Math.random()-.5)*650}px`); p.style.setProperty('--r', `${Math.random()*720-360}deg`); p.style.background = colors[rarity]; p.style.animationDelay = `${Math.random()*250}ms`; frag.appendChild(p);
    }
    root.appendChild(frag);
  }
  // Zet HTML zonder innerHTML (werkt ook als de site Trusted Types/strenge CSP gebruikt)
  state.dom = { set(el, html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    el.replaceChildren(...[...doc.body.childNodes].map(n => document.importNode(n, true)));
  } };
  state.effects = { burst };
})();
