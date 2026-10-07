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

const keys = ["enabled", "spoilerProtection", "hideHomepageGrade", "animations", "reducedIntensity", "skipReveals"];
(async () => {
    const s = await chrome.storage.local.get({ processed: {}, celebratedCount: 0 });
    for (const k of keys) {
        const el = document.getElementById(k);
        el.checked = (await chrome.storage.local.get({ [k]: true }))[k];
        el.onchange = () => chrome.storage.local.set({ [k]: el.checked });
    }
    const update = () =>
        (document.getElementById("stats").textContent =
            `${s.celebratedCount || 0} grades celebrated · ${Object.keys(s.processed || {}).length} fingerprints stored locally.`);
    update();
    document.getElementById("allnew").onclick = async () => {
        await chrome.storage.local.set({ initialized: true, processed: {}, celebratedCount: 0 });
        s.processed = {};
        s.celebratedCount = 0;
        update();
    };
    document.getElementById("reset").onclick = async () => {
        await chrome.storage.local.set({ initialized: false, processed: {}, celebratedCount: 0 });
        s.processed = {};
        s.celebratedCount = 0;
        update();
    };
})();
