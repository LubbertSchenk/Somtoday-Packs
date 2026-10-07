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

const defaults = {
    enabled: true,
    spoilerProtection: true,
    hideHomepageGrade: true,
    animations: true,
    reducedIntensity: false,
    celebratedCount: 0,
};
(async () => {
    const s = await chrome.storage.local.get(defaults);
    for (const k of ["enabled", "spoilerProtection", "hideHomepageGrade", "animations", "reducedIntensity"]) {
        const el = document.getElementById(k);
        el.checked = !!s[k];
        el.addEventListener("change", () => chrome.storage.local.set({ [k]: el.checked }));
    }
    document.getElementById("count").textContent = s.celebratedCount || 0;
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tabs[0]?.url || "";
    document.getElementById("status").textContent = /somtoday\.nl/i.test(url)
        ? "SOMtoday detected"
        : "Open SOMtoday to activate";
    const tab = tabs[0];
    const st = document.getElementById("status");
    if (tab && /somtoday\.nl/i.test(url)) {
        chrome.tabs.sendMessage(tab.id, { type: "status" }, (r) => {
            if (chrome.runtime.lastError || !r) {
                st.textContent = "Extension not active here: reload the SOMtoday page (F5)";
            } else st.textContent = `${r.detected} grades found · ${r.fresh} new`;
        });
    }
    document.getElementById("testpack").onclick = () => {
        if (!tab) return;
        chrome.tabs.sendMessage(tab.id, { type: "test-pack", value: 7.8 }, () => {
            if (chrome.runtime.lastError) st.textContent = "Reload the SOMtoday page (F5) first";
            else window.close();
        });
    };
    document.getElementById("reset").onclick = async () => {
        await chrome.storage.local.set({ initialized: false, processed: {}, celebratedCount: 0 });
        document.getElementById("count").textContent = "0";
    };
    document.getElementById("settings").onclick = () => chrome.runtime.openOptionsPage();
})();
