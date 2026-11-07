const byId = id => document.getElementById(id);
const languages = {
  pl: "🇵🇱 Polski", tr: "🇹🇷 Türkçe", ro: "🇷🇴 Română", de: "🇩🇪 Deutsch",
  it: "🇮🇹 Italiano", en: "🇬🇧 English", cs: "🇨🇿 Čeština", hu: "🇭🇺 Magyar"
};
const words = {
  pl: { title:"Discord Translator",uiLanguage:"Język dodatku",enabled:"Włącz tłumaczenia",target:"Język docelowy",channel:"Język tego kanału",automatic:"🌐 Automatycznie / wybierz",save:"Zapisz dla kanału",saved:"Zapisano język kanału.",prepare:"Przygotuj tłumaczenie kanału",note:"Pakiety tłumaczeń są pobierane osobno od pakietów językowych Chrome. Pierwsze przygotowanie może potrwać.",choose:"Najpierw wybierz język kanału.",same:"Język kanału i docelowy są takie same.",noApi:"Brak Translator API. Zaktualizuj Chrome do wersji desktopowej 138 lub nowszej.",checking:"Sprawdzam {from} → {to}…",unavailable:"Chrome nie obsługuje pary {from} → {to}.",creating:"Przygotowuję {from} → {to}…",downloading:"Pobieram pakiet {from} → {to}…",progress:"Pobieram {from} → {to}: {percent}%",empty:"Chrome utworzył model {from} → {to}, ale zwrócił pusty wynik.",ready:"Gotowe. Możesz wrócić do Discorda.",failed:"Nie udało się przygotować: {error}" },
  tr: { title:"Discord Çevirmeni",uiLanguage:"Eklenti dili",enabled:"Çeviriyi etkinleştir",target:"Hedef dil",channel:"Bu kanalın dili",automatic:"🌐 Otomatik / seçin",save:"Kanal için kaydet",saved:"Kanal dili kaydedildi.",prepare:"Kanal çevirisini hazırla",note:"Çeviri paketleri Chrome dil paketlerinden ayrı indirilir. İlk hazırlık biraz sürebilir.",choose:"Önce kanal dilini seçin.",same:"Kanal ve hedef diller aynı.",noApi:"Translator API kullanılamıyor. Chrome 138 veya daha yeni masaüstü sürümünü kullanın.",checking:"{from} → {to} kontrol ediliyor…",unavailable:"Chrome {from} → {to} çiftini desteklemiyor.",creating:"{from} → {to} hazırlanıyor…",downloading:"{from} → {to} paketi indiriliyor…",progress:"{from} → {to} indiriliyor: %{percent}",empty:"Chrome {from} → {to} modelini oluşturdu ancak boş sonuç döndürdü.",ready:"Hazır. Discord'a dönebilirsiniz.",failed:"Hazırlanamadı: {error}" },
  ro: { title:"Traducător Discord",uiLanguage:"Limba extensiei",enabled:"Activează traducerea",target:"Limba țintă",channel:"Limba acestui canal",automatic:"🌐 Automat / selectează",save:"Salvează pentru canal",saved:"Limba canalului a fost salvată.",prepare:"Pregătește traducerea canalului",note:"Pachetele de traducere se descarcă separat de pachetele lingvistice Chrome. Prima pregătire poate dura.",choose:"Selectează mai întâi limba canalului.",same:"Limba canalului și cea țintă sunt identice.",noApi:"Translator API nu este disponibil. Actualizează Chrome la versiunea desktop 138 sau mai nouă.",checking:"Verific {from} → {to}…",unavailable:"Chrome nu acceptă perechea {from} → {to}.",creating:"Pregătesc {from} → {to}…",downloading:"Descarc pachetul {from} → {to}…",progress:"Descarc {from} → {to}: {percent}%",empty:"Chrome a creat modelul {from} → {to}, dar a returnat un rezultat gol.",ready:"Gata. Poți reveni la Discord.",failed:"Pregătirea a eșuat: {error}" },
  de: { title:"Discord-Übersetzer",uiLanguage:"Sprache der Erweiterung",enabled:"Übersetzungen aktivieren",target:"Zielsprache",channel:"Sprache dieses Kanals",automatic:"🌐 Automatisch / auswählen",save:"Für diesen Kanal speichern",saved:"Kanalsprache gespeichert.",prepare:"Übersetzung für Kanal vorbereiten",note:"Übersetzungspakete werden getrennt von Chrome-Sprachpaketen geladen. Die erste Vorbereitung kann dauern.",choose:"Wähle zuerst die Kanalsprache aus.",same:"Kanal- und Zielsprache sind identisch.",noApi:"Translator API ist nicht verfügbar. Aktualisiere Chrome auf Desktopversion 138 oder höher.",checking:"Prüfe {from} → {to}…",unavailable:"Chrome unterstützt {from} → {to} nicht.",creating:"Bereite {from} → {to} vor…",downloading:"Lade Paket {from} → {to}…",progress:"Lade {from} → {to}: {percent}%",empty:"Chrome hat das Modell {from} → {to} erstellt, aber ein leeres Ergebnis geliefert.",ready:"Fertig. Du kannst zu Discord zurückkehren.",failed:"Vorbereitung fehlgeschlagen: {error}" },
  it: { title:"Traduttore Discord",uiLanguage:"Lingua dell'estensione",enabled:"Attiva traduzioni",target:"Lingua di destinazione",channel:"Lingua di questo canale",automatic:"🌐 Automatico / scegli",save:"Salva per il canale",saved:"Lingua del canale salvata.",prepare:"Prepara la traduzione del canale",note:"I pacchetti di traduzione si scaricano separatamente dai pacchetti lingua di Chrome. La prima preparazione può richiedere tempo.",choose:"Seleziona prima la lingua del canale.",same:"La lingua del canale e quella di destinazione coincidono.",noApi:"Translator API non disponibile. Aggiorna Chrome desktop alla versione 138 o successiva.",checking:"Controllo {from} → {to}…",unavailable:"Chrome non supporta la coppia {from} → {to}.",creating:"Preparo {from} → {to}…",downloading:"Scarico il pacchetto {from} → {to}…",progress:"Download {from} → {to}: {percent}%",empty:"Chrome ha creato il modello {from} → {to}, ma ha restituito un risultato vuoto.",ready:"Pronto. Puoi tornare a Discord.",failed:"Preparazione non riuscita: {error}" },
  en: { title:"Discord Translator",uiLanguage:"Extension language",enabled:"Enable translations",target:"Target language",channel:"This channel's language",automatic:"🌐 Automatic / choose",save:"Save for this channel",saved:"Channel language saved.",prepare:"Prepare channel translation",note:"Translation packs download separately from Chrome language packs. Initial setup may take a while.",choose:"Choose the channel language first.",same:"The channel and target languages are the same.",noApi:"Translator API is unavailable. Update to Chrome desktop 138 or later.",checking:"Checking {from} → {to}…",unavailable:"Chrome does not support {from} → {to}.",creating:"Preparing {from} → {to}…",downloading:"Downloading {from} → {to} pack…",progress:"Downloading {from} → {to}: {percent}%",empty:"Chrome created the {from} → {to} model but returned an empty result.",ready:"Ready. You can return to Discord.",failed:"Could not prepare: {error}" },
  cs: { title:"Překladač Discordu",uiLanguage:"Jazyk rozšíření",enabled:"Zapnout překlady",target:"Cílový jazyk",channel:"Jazyk tohoto kanálu",automatic:"🌐 Automaticky / vybrat",save:"Uložit pro kanál",saved:"Jazyk kanálu byl uložen.",prepare:"Připravit překlad kanálu",note:"Překladové balíčky se stahují zvlášť od jazykových balíčků Chrome. První příprava může chvíli trvat.",choose:"Nejprve vyber jazyk kanálu.",same:"Jazyk kanálu a cílový jazyk jsou stejné.",noApi:"Translator API není k dispozici. Aktualizuj Chrome pro počítač na verzi 138 nebo novější.",checking:"Ověřuji {from} → {to}…",unavailable:"Chrome nepodporuje dvojici {from} → {to}.",creating:"Připravuji {from} → {to}…",downloading:"Stahuji balíček {from} → {to}…",progress:"Stahuji {from} → {to}: {percent}%",empty:"Chrome vytvořil model {from} → {to}, ale vrátil prázdný výsledek.",ready:"Hotovo. Můžeš se vrátit na Discord.",failed:"Příprava se nezdařila: {error}" },
  hu: { title:"Discord-fordító",uiLanguage:"A bővítmény nyelve",enabled:"Fordítások bekapcsolása",target:"Célnyelv",channel:"A csatorna nyelve",automatic:"🌐 Automatikus / választás",save:"Mentés ehhez a csatornához",saved:"A csatorna nyelve mentve.",prepare:"Csatorna fordításának előkészítése",note:"A fordítási csomagok külön töltődnek le a Chrome nyelvi csomagjaitól. Az első előkészítés eltarthat egy ideig.",choose:"Először válaszd ki a csatorna nyelvét.",same:"A csatorna és a célnyelv megegyezik.",noApi:"A Translator API nem érhető el. Frissítsd a Chrome asztali verzióját 138-ra vagy újabbra.",checking:"Ellenőrzés: {from} → {to}…",unavailable:"A Chrome nem támogatja ezt: {from} → {to}.",creating:"Előkészítés: {from} → {to}…",downloading:"Fordítási csomag letöltése: {from} → {to}…",progress:"Letöltés {from} → {to}: {percent}%",empty:"A Chrome létrehozta a(z) {from} → {to} modellt, de üres eredményt adott.",ready:"Kész. Visszatérhetsz a Discordhoz.",failed:"Nem sikerült előkészíteni: {error}" }
};
let tabId, channelId;
let settings = { target: "pl", skip: ["pl", "en"], channels: {}, enabled: true, uiLang: "pl" };
const t = (key, values = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), (words[settings.uiLang] || words.pl)[key]);
const persist = () => chrome.storage.local.set({ settings });
function applyLanguage() {
  const lang = settings.uiLang in words ? settings.uiLang : "pl";
  settings.uiLang = lang;
  document.documentElement.lang = lang;
  document.title = t("title");
  for (const element of document.querySelectorAll("[data-i18n]")) element.textContent = t(element.dataset.i18n);
}

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const tab = tabs[0]; tabId = tab?.id;
  if (tab?.id != null && tab.url?.startsWith("https://discord.com/channels/")) {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"], injectImmediately: true }).catch(() => {});
  }
  const pieces = new URL(tab?.url || "https://discord.com").pathname.split("/");
  channelId = pieces.at(-1);
  chrome.storage.local.get("settings", data => {
    settings = { ...settings, ...(data.settings || {}) };
    applyLanguage();
    byId("enabled").checked = settings.enabled;
    byId("target").value = settings.target;
    byId("channel").value = settings.channels?.[channelId] || "";
    byId("uiLanguage").value = settings.uiLang;
  });
});

byId("uiLanguage").addEventListener("change", () => {
  settings.uiLang = byId("uiLanguage").value;
  applyLanguage();
  persist();
});
byId("enabled").addEventListener("change", () => { settings.enabled = byId("enabled").checked; persist(); });
byId("target").addEventListener("change", () => { settings.target = byId("target").value; persist(); });
byId("save").addEventListener("click", () => {
  const lang = byId("channel").value;
  settings.channels ||= {};
  if (lang) settings.channels[channelId] = lang; else delete settings.channels[channelId];
  persist();
  byId("status").textContent = t("saved");
});
byId("prepare").addEventListener("click", async () => {
  const from = byId("channel").value;
  const to = byId("target").value;
  const status = byId("prepareStatus");
  if (!from) { status.textContent = t("choose"); return; }
  if (from === to) { status.textContent = t("same"); return; }
  if (!("Translator" in self)) { status.textContent = t("noApi"); return; }
  const button = byId("prepare"); button.disabled = true;
  try {
    const pairs = [...new Set([`${from}>${to}`, ...(from !== "pl" ? [`pl>${from}`] : [])])].map(pair => pair.split(">"));
    for (const [sourceLanguage, targetLanguage] of pairs) {
      const names = { from: languages[sourceLanguage], to: languages[targetLanguage] };
      status.textContent = t("checking", names);
      const availability = await Translator.availability({ sourceLanguage, targetLanguage });
      if (availability === "unavailable") throw new Error(t("unavailable", names));
      status.textContent = t(availability === "available" ? "creating" : "downloading", names);
      const translator = await Translator.create({ sourceLanguage, targetLanguage, monitor(m) {
        m.addEventListener("downloadprogress", event => { status.textContent = t("progress", { ...names, percent: Math.round(event.loaded * 100) }); });
      }});
      const sample = await translator.translate("Merhaba dünya");
      if (typeof sample !== "string" || !sample.trim()) throw new Error(t("empty", names));
    }
    status.textContent = t("ready");
  } catch (error) { status.textContent = t("failed", { error: error.message || String(error) }); }
  finally { button.disabled = false; }
});
