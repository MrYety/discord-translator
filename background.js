let creatingDocument;

// When an unpacked extension is reloaded, update already-open Discord tabs
// without asking the user to refresh each channel/page.
chrome.runtime.onInstalled.addListener(async () => {
  const tabs = await chrome.tabs.query({ url: "https://discord.com/channels/*" });
  await Promise.allSettled(tabs.filter(tab => tab.id != null).map(tab =>
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
      injectImmediately: true
    })
  ));
});

async function ensureTranslatorDocument() {
  const url = chrome.runtime.getURL("translator.html");
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [url]
  });
  if (contexts.length) return;
  if (!creatingDocument) {
    creatingDocument = chrome.offscreen.createDocument({
      url: "translator.html",
      reasons: ["DOM_PARSER"],
      justification: "Run Chrome's on-device Translator API in an extension document and keep translator instances available between visible messages."
    }).finally(() => { creatingDocument = null; });
  }
  await creatingDocument;
}

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg?.target === "translator-document") return;
  if (msg?.type !== "translate") return;
  (async () => {
    await ensureTranslatorDocument();
    return await chrome.runtime.sendMessage({ ...msg, target: "translator-document" });
  })().then(respond).catch(error => respond({ ok: false, error: error.message || String(error) }));
  return true;
});
