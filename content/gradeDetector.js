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
  const txt = el => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const parseGrade = t => {
    const v = Number(String(t).replace(',', '.'));
    return Number.isFinite(v) && v >= 0.1 && v <= 10 ? v : null;
  };

  const rowSelectors = [
    'sl-laatste-resultaat-item',
    'sl-resultaat-item',
    '[data-testid*="resultaat" i]',
    '[data-test*="resultaat" i]',
    '[class*="resultaat-item" i]'
  ].join(',');

  const first = (root, selectors) => root.querySelector(selectors);

  // Prefer the semantic result rows, but also support the equivalent rows used by
  // newer SOMtoday builds. Never scan the whole page: that would turn weights,
  // averages and years into grades.
  function detect() {
    const counts = new Map();
    const out = [];
    const seen = new Set();
    for (const row of document.querySelectorAll(rowSelectors)) {
      const root = row.querySelector('.root') || row;
      if (seen.has(root)) continue;
      seen.add(root);
      if (!root) continue;
      const gradeElement = first(root, '.cijfer,[class*="cijfer" i],[data-testid*="cijfer" i],[data-test*="cijfer" i]');
      const display = txt(gradeElement?.querySelector('span') || gradeElement);
      const value = parseGrade(display);
      if (value === null) continue;               // bv. "V" of "G": geen pack
      const subject = txt(first(root, '.titel,[class*="titel" i],[data-testid*="vak" i],[data-test*="vak" i]'));
      if (!subject) continue;
      const subtitle = txt(first(root, '.subtitel,[class*="subtitel" i],[class*="omschrijving" i]'));
      const [date = '', ...rest] = subtitle.split('•').map(s => s.trim());
      const assessment = rest.join(' • ');
      const weight = txt(first(root, '.weging,[class*="weging" i],[data-testid*="weging" i],[data-test*="weging" i]'));
      // Stabiele sleutel: alleen vak, omschrijving, datum, cijfer, weging (geen paginatekst).
      const base = [subject, assessment, date, display, weight].join('|').toLowerCase();
      const n = (counts.get(base) || 0) + 1;      // twee echt identieke cijfers blijven los van elkaar
      counts.set(base, n);
      out.push({ value, display, subject, assessment, date, weight, key: `${base}#${n}`, gradeElement });
    }
    return out;
  }
  state.gradeDetector = { detect };
})();
