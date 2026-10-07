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

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const defaults = {
    enabled: true,
    spoilerProtection: true,
    hideHomepageGrade: true,
    animations: true,
    reducedIntensity: false,
    skipReveals: true,
    initialized: false,
    processed: {},
    celebratedCount: 0
  };
  const current = await chrome.storage.local.get(defaults);
  if (reason === 'install') await chrome.storage.local.set(defaults);
  else await chrome.storage.local.set(current);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'open-settings') chrome.runtime.openOptionsPage();
  if (message?.type === 'status') sendResponse({ ok: true });
  return true;
});
