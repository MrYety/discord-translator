(() => {
  const VERSION = "0.1.6";
  if (globalThis.__dctVersion === VERSION) return;
  globalThis.__dctVersion = VERSION;
  document.querySelectorAll(".dct-translation").forEach(node => node.remove());
  document.querySelectorAll(".dct-button").forEach(node => node.remove());
  document.querySelectorAll(".dct-preview").forEach(node => node.remove());
  const defaults = { target: "pl", skip: ["pl", "en"], channels: {}, enabled: true, uiLang: "pl" };
  let settings = defaults;
  const inFlight = new Set();
  const cache = new Map();
  const MAX_CACHE = 500;
  const languageLabels = {
    pl: { pl:"polski",tr:"turecki",ro:"rumuński",de:"niemiecki",it:"włoski",en:"angielski",cs:"czeski",hu:"węgierski" },
    tr: { pl:"Lehçe",tr:"Türkçe",ro:"Romence",de:"Almanca",it:"İtalyanca",en:"İngilizce",cs:"Çekçe",hu:"Macarca" },
    ro: { pl:"poloneză",tr:"turcă",ro:"română",de:"germană",it:"italiană",en:"engleză",cs:"cehă",hu:"maghiară" },
    de: { pl:"Polnisch",tr:"Türkisch",ro:"Rumänisch",de:"Deutsch",it:"Italienisch",en:"Englisch",cs:"Tschechisch",hu:"Ungarisch" },
    it: { pl:"polacco",tr:"turco",ro:"rumeno",de:"tedesco",it:"italiano",en:"inglese",cs:"ceco",hu:"ungherese" },
    en: { pl:"Polish",tr:"Turkish",ro:"Romanian",de:"German",it:"Italian",en:"English",cs:"Czech",hu:"Hungarian" },
    cs: { pl:"polština",tr:"turečtina",ro:"rumunština",de:"němčina",it:"italština",en:"angličtina",cs:"čeština",hu:"maďarština" },
    hu: { pl:"lengyel",tr:"török",ro:"román",de:"német",it:"olasz",en:"angol",cs:"cseh",hu:"magyar" }
  };
  const uiText = {
    pl:{loading:"Tłumaczenie na {lang}…",failed:"Nie udało się przetłumaczyć: {error}",needChannel:"Nie udało się rozpoznać języka kanału. Ustaw go w popupie rozszerzenia.",changed:"Szkic zmienił się w trakcie tłumaczenia. Zostawiłem go bez zmian; kliknij ponownie.",preview:"Tłumaczenie PL → {lang}",aria:"Przetłumaczona wiadomość",copying:"Kopiuję tłumaczenie…",copied:"Skopiowano — wróć do czatu i wklej Ctrl+V.",copyFailed:"Automatyczne kopiowanie nie powiodło się. Zaznacz tekst i skopiuj ręcznie.",copy:"Kopiuj",close:"Zamknij",button:"Przetłumacz szkic z polskiego na {lang}",channelSetting:"Ustaw język kanału w popupie rozszerzenia"},
    tr:{loading:"{lang} diline çevriliyor…",failed:"Çeviri başarısız: {error}",needChannel:"Kanal dili belirlenemedi. Eklenti penceresinden ayarlayın.",changed:"Taslak çeviri sırasında değişti. Değiştirmedim; tekrar deneyin.",preview:"PL → {lang} çevirisi",aria:"Çevrilmiş mesaj",copying:"Çeviri kopyalanıyor…",copied:"Kopyalandı — sohbete dönüp Ctrl+V ile yapıştırın.",copyFailed:"Otomatik kopyalama başarısız. Metni seçip elle kopyalayın.",copy:"Kopyala",close:"Kapat",button:"Taslağı Lehçeden {lang} diline çevir",channelSetting:"Eklenti penceresinden kanal dilini seçin"},
    ro:{loading:"Traducere în {lang}…",failed:"Traducerea a eșuat: {error}",needChannel:"Limba canalului nu a fost detectată. Seteaz-o în fereastra extensiei.",changed:"Ciorna s-a schimbat în timpul traducerii. Am păstrat-o; încearcă din nou.",preview:"Traducere PL → {lang}",aria:"Mesaj tradus",copying:"Se copiază traducerea…",copied:"Copiat — revino la chat și lipește cu Ctrl+V.",copyFailed:"Copierea automată a eșuat. Selectează și copiază textul manual.",copy:"Copiază",close:"Închide",button:"Tradu ciorna din poloneză în {lang}",channelSetting:"Setează limba canalului din fereastra extensiei"},
    de:{loading:"Übersetze ins {lang}…",failed:"Übersetzung fehlgeschlagen: {error}",needChannel:"Kanalsprache nicht erkannt. Lege sie im Erweiterungsfenster fest.",changed:"Der Entwurf wurde während der Übersetzung geändert. Er blieb unverändert; bitte erneut versuchen.",preview:"Übersetzung PL → {lang}",aria:"Übersetzte Nachricht",copying:"Übersetzung wird kopiert…",copied:"Kopiert — zurück zum Chat und mit Strg+V einfügen.",copyFailed:"Automatisches Kopieren fehlgeschlagen. Text markieren und manuell kopieren.",copy:"Kopieren",close:"Schließen",button:"Entwurf von Polnisch nach {lang} übersetzen",channelSetting:"Kanalsprache im Erweiterungsfenster festlegen"},
    it:{loading:"Traduzione in {lang}…",failed:"Traduzione non riuscita: {error}",needChannel:"Lingua del canale non rilevata. Impostala nel popup dell'estensione.",changed:"La bozza è cambiata durante la traduzione. Non l'ho modificata; riprova.",preview:"Traduzione PL → {lang}",aria:"Messaggio tradotto",copying:"Copio la traduzione…",copied:"Copiato — torna alla chat e incolla con Ctrl+V.",copyFailed:"Copia automatica non riuscita. Seleziona e copia il testo manualmente.",copy:"Copia",close:"Chiudi",button:"Traduci la bozza dal polacco a {lang}",channelSetting:"Imposta la lingua del canale nel popup dell'estensione"},
    en:{loading:"Translating to {lang}…",failed:"Translation failed: {error}",needChannel:"Could not detect the channel language. Set it in the extension popup.",changed:"The draft changed during translation. It was left untouched; try again.",preview:"Translation PL → {lang}",aria:"Translated message",copying:"Copying translation…",copied:"Copied — return to chat and paste with Ctrl+V.",copyFailed:"Auto-copy failed. Select the text and copy it manually.",copy:"Copy",close:"Close",button:"Translate draft from Polish to {lang}",channelSetting:"Set the channel language in the extension popup"},
    cs:{loading:"Překládám do jazyka {lang}…",failed:"Překlad se nezdařil: {error}",needChannel:"Jazyk kanálu nebyl rozpoznán. Nastav ho v popupu rozšíření.",changed:"Koncept se během překladu změnil. Nechal jsem ho beze změny; zkus to znovu.",preview:"Překlad PL → {lang}",aria:"Přeložená zpráva",copying:"Kopíruji překlad…",copied:"Zkopírováno — vrať se do chatu a vlož Ctrl+V.",copyFailed:"Automatické kopírování selhalo. Označ text a zkopíruj ho ručně.",copy:"Kopírovat",close:"Zavřít",button:"Přeložit koncept z polštiny do jazyka {lang}",channelSetting:"Nastav jazyk kanálu v popupu rozšíření"},
    hu:{loading:"Fordítás erre: {lang}…",failed:"A fordítás nem sikerült: {error}",needChannel:"A csatorna nyelve nem ismerhető fel. Állítsd be a bővítmény ablakában.",changed:"A piszkozat fordítás közben megváltozott. Érintetlenül hagytam; próbáld újra.",preview:"Fordítás PL → {lang}",aria:"Lefordított üzenet",copying:"Fordítás másolása…",copied:"Másolva — térj vissza a csevegéshez, majd Ctrl+V.",copyFailed:"Az automatikus másolás nem sikerült. Jelöld ki és másold a szöveget kézzel.",copy:"Másolás",close:"Bezárás",button:"Piszkozat fordítása lengyelről erre: {lang}",channelSetting:"Állítsd be a csatorna nyelvét a bővítmény ablakában"}
  };
  function ui(key, values = {}) {
    let result = (uiText[settings.uiLang] || uiText.pl)[key] || uiText.pl[key] || key;
    for (const [name, value] of Object.entries(values)) result = result.replaceAll(`{${name}}`, value);
    return result;
  }
  function languageName(code) { return (languageLabels[settings.uiLang] || languageLabels.pl)[code] || code; }
  const key = (text, from, to) => `${from}|${to}|${text.trim()}`;

  chrome.storage.local.get(["settings", "translations"], data => {
    settings = { ...defaults, ...(data.settings || {}) };
    for (const [k, v] of Object.entries(data.translations || {})) cache.set(k, v);
    scan();
  });
  chrome.storage.onChanged.addListener(changes => {
    if (changes.settings) {
      settings = { ...defaults, ...(changes.settings.newValue || {}) };
      scan();
      injectComposerButton();
    }
  });

  function channelInfo() {
    const path = location.pathname.split("/");
    const channelId = path[path.length - 1];
    const saved = settings.channels?.[channelId];
    if (saved) return { id: channelId, lang: saved };
    // Read only the active channel header; sidebar entries include many languages.
    const name = [...document.querySelectorAll('header [class*="channelName"], [class*="title"] [class*="channelName"]')]
      .map(n => n.textContent || "").join(" ").toLowerCase();
    const suffix = name.match(/[•·|_-](pl|tr|ro|de|it|en|cz|cs|hu)\b/);
    const slug = location.pathname.toLowerCase();
    const match = suffix?.[1] || slug.match(/(?:general|genel|ogólny|allgemein)[-_](pl|tr|ro|de|it|en|cz|cs|hu)(?:\b|$)/)?.[1];
    const normalized = match === "cz" ? "cs" : match;
    return { id: channelId, lang: normalized || null };
  }

  async function translate(text, from, to) {
    const k = key(text, from, to);
    if (cache.has(k)) return cache.get(k);
    if (inFlight.has(k)) return null;
    inFlight.add(k);
    try {
      const result = await chrome.runtime.sendMessage({ type: "translate", text, from, to });
      if (!result?.ok) throw new Error(result?.error || "Błąd tłumaczenia.");
      cache.set(k, result.text);
      while (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
      const persisted = Object.fromEntries(cache);
      chrome.storage.local.set({ translations: persisted });
      return result.text;
    } finally { inFlight.delete(k); }
  }

  function getMessages(root = document, nearViewport = false) {
    const nodes = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches('[id^="message-content-"]')) nodes.push(root);
    if (root.querySelectorAll) nodes.push(...root.querySelectorAll('[id^="message-content-"]'));
    return nodes.flatMap(content => {
      const row = content.closest('li[id^="chat-messages-"]');
      if (!row) return [];
      const rect = row.getBoundingClientRect();
      const margin = nearViewport ? 120 : 0;
      if (rect.bottom <= -margin || rect.top >= window.innerHeight + margin || rect.width === 0 || rect.height === 0) return [];
      // Discord renders a replied-to message with its own message-content-* node
      // inside the reply card. It is context, not the body of the current message.
      const replyCard = content.closest('[class*="repliedMessage"], [class*="replyPreview"], [class*="repliedTextPreview"]');
      if (replyCard && row.contains(replyCard)) return [];
      return [{ content, row }];
    });
  }

  function shouldTranslate(text, content) {
    if (!text || text.length > 4000 || /^https?:\/\//i.test(text)) return false;
    // Skip custom Discord emoji tokens and common text-only kaomoji/emoticons.
    if (/^(?:<a?:[\w~]+:\d+>|:[\w+-]+:|[:;=8xX][-^']?[)D(Pp\/\\]|¯\\_\(ツ\)_\/¯)(?:\s|$)+$/u.test(text)) return false;
    // Ignore a message whose visible characters are entirely emoji/symbol components.
    const remainder = text.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Regional_Indicator}\uFE0F\u200D\u20E3\s0-9#*]/gu, "").trim();
    if (!remainder) return false;
    // Attachments and embeds are outside the text node; leave them alone if no text exists.
    if (!content.innerText?.trim()) return false;
    return true;
  }

  function preserveScrollAnchor(row, updateDom) {
    let scroller = row.parentElement;
    while (scroller && scroller !== document.body && scroller !== document.documentElement) {
      const style = getComputedStyle(scroller);
      if (/(auto|scroll|overlay)/.test(style.overflowY) && scroller.scrollHeight > scroller.clientHeight + 1) break;
      scroller = scroller.parentElement;
    }
    if (!scroller || scroller === document.body || scroller === document.documentElement) scroller = document.scrollingElement;

    let anchor = null;
    let anchorTop = 0;
    if (scroller && scroller !== row) {
      const bounds = scroller === document.scrollingElement
        ? { top: 0, bottom: window.innerHeight }
        : scroller.getBoundingClientRect();
      const findSiblingAnchor = direction => {
        let candidate = direction > 0 ? row.nextElementSibling : row.previousElementSibling;
        while (candidate) {
          if (candidate.matches('li[id^="chat-messages-"]')) {
            const rect = candidate.getBoundingClientRect();
            if (rect.bottom > bounds.top && rect.top < bounds.bottom) return candidate;
          }
          candidate = direction > 0 ? candidate.nextElementSibling : candidate.previousElementSibling;
        }
        return null;
      };
      anchor = findSiblingAnchor(1) || findSiblingAnchor(-1);
      if (anchor) anchorTop = anchor.getBoundingClientRect().top;
    }
    const beforeScroll = scroller?.scrollTop || 0;

    updateDom();
    if (!anchor?.isConnected || !scroller) return;
    requestAnimationFrame(() => {
      const afterTop = anchor.getBoundingClientRect().top;
      const afterScroll = scroller.scrollTop || 0;
      // Remove browser/user scroll movement from the measurement; compensate only
      // for the layout height added by the translation above the visual anchor.
      const layoutShift = (afterTop - anchorTop) + (afterScroll - beforeScroll);
      if (Number.isFinite(layoutShift) && Math.abs(layoutShift) > 0.5) {
        scroller.scrollTop = afterScroll + layoutShift;
      }
    });
  }

  function scan(roots = [document], nearViewport = false) {
    if (!settings.enabled) return;
    const channel = channelInfo();
    const from = channel.lang;
    if (!from || settings.skip.includes(from) || from === settings.target) return;
    const candidates = new Map();
    for (const root of roots) {
      for (const item of getMessages(root, nearViewport)) candidates.set(item.content, item);
    }
    for (const { content, row } of candidates.values()) {
      if (!row) continue;
      const sourceId = content.id;
      const alreadyTranslated = [...row.querySelectorAll(":scope > .dct-translation")]
        .some(panel => panel.dataset.sourceId === sourceId);
      if (alreadyTranslated) continue;
      const text = content.innerText?.trim();
      if (!shouldTranslate(text, content)) continue;
      const cached = cache.get(key(text, from, settings.target));
      if (cached) {
        preserveScrollAnchor(row, () => addTranslation(row, cached, sourceId));
        continue;
      }
      const panel = document.createElement("div");
      panel.className = "dct-translation";
      panel.dataset.sourceId = sourceId;
      panel.textContent = ui("loading", { lang: languageName(settings.target) });
      preserveScrollAnchor(row, () => row.append(panel));
      translate(text, from, settings.target).then(value => {
        if (!panel.isConnected) return;
        if (value) preserveScrollAnchor(row, () => { panel.textContent = value; });
      }).catch(error => {
        if (panel.isConnected) preserveScrollAnchor(row, () => {
          panel.textContent = ui("failed", { error: error.message });
          panel.classList.add("dct-error");
        });
      });
    }
  }

  function addTranslation(row, value, sourceId) {
    const panel = document.createElement("div");
    panel.className = "dct-translation";
    panel.dataset.sourceId = sourceId;
    panel.textContent = value;
    row.append(panel);
  }

  async function copyText(text, textarea, status) {
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = ui("copied");
      return true;
    } catch {
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      status.textContent = copied ? ui("copied") : ui("copyFailed");
      return copied;
    }
  }

  async function showTranslationPreview(box, value) {
    document.querySelectorAll(".dct-preview").forEach(node => node.remove());
    const panel = document.createElement("section");
    panel.className = "dct-preview";
    const heading = document.createElement("div");
    heading.className = "dct-preview-heading";
    heading.textContent = ui("preview", { lang: languageName(channelInfo().lang) });
    const textarea = document.createElement("textarea");
    textarea.className = "dct-preview-text";
    textarea.value = value;
    textarea.setAttribute("aria-label", ui("aria"));
    const footer = document.createElement("div");
    footer.className = "dct-preview-footer";
    const status = document.createElement("span");
    status.textContent = ui("copying");
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "dct-preview-copy";
    copy.textContent = ui("copy");
    const close = document.createElement("button");
    close.type = "button";
    close.className = "dct-preview-close";
    close.textContent = ui("close");
    footer.append(status, copy, close);
    panel.append(heading, textarea, footer);
    document.body.append(panel);

    const rect = box.getBoundingClientRect();
    panel.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - Math.min(rect.width, window.innerWidth - 24) - 12))}px`;
    panel.style.width = `${Math.max(280, Math.min(rect.width, window.innerWidth - 24))}px`;
    panel.style.bottom = `${Math.max(12, window.innerHeight - rect.top + 8)}px`;
    copy.addEventListener("click", async () => {
      await copyText(textarea.value, textarea, status);
      box.focus();
    });
    close.addEventListener("click", () => panel.remove());
    await copyText(value, textarea, status);
    box.focus();
  }

  function injectComposerButton() {
    const box = document.querySelector('[role="textbox"][contenteditable="true"]');
    if (!box) return;
    if (box.dataset.dctReady) {
      const existing = document.querySelector(".dct-button");
      if (existing?.isConnected) { updateComposerButton(existing); return; }
      delete box.dataset.dctReady;
    }
    box.dataset.dctReady = "1";
    const button = document.createElement("button");
    button.type = "button"; button.className = "dct-button"; button.textContent = "Przetłumacz szkic";
    button.title = ui("button", { lang: languageName(channelInfo().lang) });
    button.addEventListener("click", async () => {
      const { lang } = channelInfo();
      const text = box.innerText.trim();
      if (!lang) return alert(ui("needChannel"));
      if (!text) return;
      button.disabled = true; button.textContent = "Tłumaczę…";
      try {
        const value = await translate(text, "pl", lang);
        if (value) {
          if (box.innerText.trim() !== text) {
            alert(ui("changed"));
            return;
          }
          await showTranslationPreview(box, value);
        }
      } catch (error) { alert(`Błąd tłumaczenia: ${error.message}`); }
      finally { button.disabled = false; updateComposerButton(button); }
    });
    const mount = box.closest('[class*="channelTextArea"]') || box.parentElement;
    const controls = mount.querySelector('[class*="buttons"]');
    if (controls) {
      button.classList.add("dct-button-compact");
      controls.prepend(button);
    } else {
      mount.append(button);
    }
    updateComposerButton(button);
  }

  function updateComposerButton(button) {
    const lang = channelInfo().lang;
    const short = { pl: "PL", tr: "TR", ro: "RO", de: "DE", it: "IT", en: "EN", cs: "CS", hu: "HU" };
    button.textContent = `PL→${short[lang] || "?"}`;
    button.title = lang ? ui("button", { lang: languageName(lang) }) : ui("channelSetting");
  }

  const style = document.createElement("style");
  style.id = "dct-style";
  style.textContent = `.dct-translation{margin:3px 0 2px 58px;color:#65a879;font-size:0.9em;white-space:pre-wrap}.dct-error{color:#ed4245}.dct-button{margin:4px 0;padding:5px 9px;border:0;border-radius:4px;background:#5865f2;color:white;cursor:pointer}.dct-button-compact{margin:0 4px;padding:4px 6px;font-size:11px;line-height:18px;white-space:nowrap;flex:none}.dct-button:disabled{opacity:.6}.dct-preview{position:fixed;z-index:1000000;box-sizing:border-box;padding:12px;border:1px solid #3f4147;border-radius:8px;background:#1e1f22;color:#f2f3f5;box-shadow:0 8px 28px #0009;font:13px/1.4 system-ui,sans-serif}.dct-preview-heading{margin-bottom:8px;font-weight:600;color:#65a879}.dct-preview-text{display:block;box-sizing:border-box;width:100%;min-height:64px;max-height:180px;resize:vertical;padding:8px;border:1px solid #4e5058;border-radius:5px;background:#2b2d31;color:#f2f3f5;font:inherit}.dct-preview-footer{display:flex;align-items:center;gap:7px;margin-top:8px}.dct-preview-footer span{flex:1;color:#b5bac1}.dct-preview-copy,.dct-preview-close{padding:5px 9px;border:0;border-radius:4px;cursor:pointer}.dct-preview-copy{background:#3c8050;color:#fff}.dct-preview-close{background:#383a40;color:#ddd}`;
  document.documentElement.append(style);
  const pendingMessages = new Set();
  let workScheduled = false;
  const observedRows = new WeakSet();
  let visibilityObserver;

  function observeRow(row) {
    if (!visibilityObserver || observedRows.has(row)) return;
    observedRows.add(row);
    visibilityObserver.observe(row);
  }

  function observeRowsIn(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!element) return;
    if (element.matches('li[id^="chat-messages-"]')) observeRow(element);
    for (const row of element.querySelectorAll?.('li[id^="chat-messages-"]') || []) observeRow(row);
  }

  function unobserveRowsIn(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!element) return;
    const rows = [];
    if (element.matches('li[id^="chat-messages-"]')) rows.push(element);
    rows.push(...(element.querySelectorAll?.('li[id^="chat-messages-"]') || []));
    for (const row of rows) {
      visibilityObserver?.unobserve(row);
      observedRows.delete(row);
    }
  }

  function isExtensionNode(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !!element?.closest(".dct-translation, .dct-button, .dct-preview, #dct-style");
  }

  function collectNearestMessageContent(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!element) return;
    const nearest = element.closest('[id^="message-content-"]');
    if (nearest) pendingMessages.add(nearest);
    if (element.matches('[id^="message-content-"]')) pendingMessages.add(element);
    const row = element.closest('li[id^="chat-messages-"]');
    if (row) observeRow(row);
  }

  function collectAddedMessageContent(node) {
    collectNearestMessageContent(node);
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!element) return;
    for (const content of element.querySelectorAll?.('[id^="message-content-"]') || []) pendingMessages.add(content);
  }

  function scheduleWork() {
    if (workScheduled) return;
    workScheduled = true;
    requestAnimationFrame(() => {
      workScheduled = false;
      if (pendingMessages.size) {
        const roots = [...pendingMessages];
        pendingMessages.clear();
        scan(roots);
      }
      injectComposerButton();
    });
  }

  visibilityObserver = new IntersectionObserver(entries => {
    const visibleRows = entries.filter(entry => entry.isIntersecting).map(entry => entry.target);
    if (visibleRows.length) scan(visibleRows, true);
  }, { root: null, rootMargin: "120px 0px", threshold: 0 });
  observeRowsIn(document);

  new MutationObserver(records => {
    let relevant = false;
    for (const record of records) {
      if (isExtensionNode(record.target)) continue;
      const changedNodes = [...record.addedNodes, ...record.removedNodes];
      if (changedNodes.length && changedNodes.every(isExtensionNode)) continue;
      relevant = true;
      collectNearestMessageContent(record.target);
      for (const node of record.addedNodes) {
        collectAddedMessageContent(node);
        observeRowsIn(node);
      }
      for (const node of record.removedNodes) unobserveRowsIn(node);
    }
    if (relevant) scheduleWork();
  }).observe(document.body, { childList: true, characterData: true, subtree: true });
  scan();
  injectComposerButton();
})();
