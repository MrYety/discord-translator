const supported = new Set(["pl", "tr", "ro", "de", "it", "en", "cs", "hu"]);
const instances = new Map();

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg?.target !== "translator-document" || msg.type !== "translate") return;
  (async () => {
    const { text, from, to } = msg;
    if (typeof text !== "string" || !text.trim() || !supported.has(from) || !supported.has(to)) {
      throw new Error("Pusty tekst lub nieobsługiwany język.");
    }
    if (from === to) return text;
    if (!("Translator" in self)) throw new Error("Translator API nie jest dostępne. Zaktualizuj Chrome do obsługiwanej wersji desktopowej.");
    const key = `${from}>${to}`;
    let instancePromise = instances.get(key);
    if (!instancePromise) {
      instancePromise = (async () => {
        const availability = await Translator.availability({ sourceLanguage: from, targetLanguage: to });
        if (availability === "unavailable") throw new Error(`Chrome nie obsługuje pary ${from} → ${to}.`);
        return await Translator.create({ sourceLanguage: from, targetLanguage: to });
      })();
      instances.set(key, instancePromise);
      instancePromise.catch(() => instances.delete(key));
    }
    const translator = await instancePromise;
    const result = await translator.translate(text);
    if (typeof result !== "string" || !result.trim()) throw new Error("Chrome zwrócił pusty wynik tłumaczenia.");
    return result;
  })().then(text => respond({ ok: true, text })).catch(error => respond({ ok: false, error: error.message || String(error) }));
  return true;
});
