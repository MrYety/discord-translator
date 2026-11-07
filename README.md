# Discord Translator

> An unofficial Chrome extension prototype that translates visible Discord messages in real time and prepares translated replies for copy and paste.

**Short GitHub description:** Translate visible Discord chat locally in Chrome, with per-channel language settings and copy-ready translated replies.

## Overview

Discord Translator adds inline translations to messages in Discord Web. It can also translate a Polish draft into the language configured for the current channel, copy the result to the clipboard, and show it in an editable preview above the composer.

The extension uses Chrome's built-in Translator API. Translation runs on the device; this project does not send message text to a project-operated server and does not require an API key. Chrome may download a language model the first time a language pair is prepared.

## Features

- **Live, progressive chat translation.** Translates messages as they appear in the viewport and while scrolling through loaded history. Newly loaded history is observed as Discord adds it to the page.
- **Per-channel source language.** Save a language for each channel ID, or let the extension try to read a language suffix from the channel header.
- **Configurable target language.** Polish is the default target. Incoming Polish and English channels are skipped by default.
- **Reply-aware extraction.** Reply previews are excluded so the extension translates the current reply rather than the quoted message.
- **Emoji and attachment handling.** Emoji-only messages, common text emoticons, and links are skipped. Text messages that contain emoji are still translated; images themselves are not processed.
- **Local translation cache.** Keeps up to 500 source/target translation results in `chrome.storage.local` to avoid repeating work.
- **Scroll stability.** Compensates for message-height changes when an inline translation appears, reducing jumps during scrolling.
- **Copy-ready outgoing translations.** The `PL→TR` button (language code changes with the selected channel) translates the current Polish draft, opens an editable preview above the composer, and copies the translation. The Discord draft is left untouched; paste the result with `Ctrl+V` and send it manually.
- **Eight interface languages.** The popup and in-chat controls can be displayed in Polish, Turkish, Romanian, German, Italian, English, Czech, or Hungarian. Language selectors include flags.
- **No automatic sending.** The extension never sends messages for the user.

## How it works

1. The content script reads visible Discord message elements and the source language configured for the current channel.
2. A `MutationObserver` collects only changed message content. An `IntersectionObserver` watches message rows and starts work as they approach the viewport, including while scrolling.
3. Before inserting or updating an inline translation, the script records a nearby visible message and compensates for layout changes to keep the scroll position steady.
4. The content script sends translation requests to the extension service worker. The service worker creates an offscreen extension document when needed and forwards the request to the Translator API running there.
5. Results are added below their source messages and cached locally. Errors appear inline instead of leaving an endless loading label.
6. For outgoing text, the extension translates the draft and displays the result in a separate editable preview. It copies the preview text to the clipboard and returns focus to the Discord composer for manual paste and send.

## Chrome APIs and browser features

| API | Purpose |
|---|---|
| `Translator.availability()` | Checks whether Chrome can provide a requested source/target language pair. |
| `Translator.create()` | Creates a Chrome on-device translator for that pair. |
| `translator.translate()` | Translates incoming message text, outgoing drafts, and a small setup sample. |
| `chrome.storage.local` | Stores user settings and a bounded cache of translation results locally. |
| `chrome.storage.onChanged` | Applies setting changes to an already-open Discord tab. |
| `chrome.runtime.onMessage` / `sendMessage()` | Passes translation requests between the content script, service worker, and offscreen document. |
| `chrome.runtime.getContexts()` | Checks whether the offscreen translation document already exists. |
| `chrome.runtime.getURL()` | Resolves the extension URL for the offscreen document. |
| `chrome.offscreen.createDocument()` | Hosts the Translator API in an extension document outside the Discord page context. |
| `chrome.scripting.executeScript()` | Injects the updated content script into already-open Discord tabs after an extension update or when the popup is opened on Discord. |
| `chrome.tabs.query()` | Finds open Discord channel tabs for content-script injection. |
| `MutationObserver` | Detects new or changed message DOM without repeatedly scanning the whole page. |
| `IntersectionObserver` | Detects message rows entering the viewport during scrolling. |
| `navigator.clipboard.writeText()` | Copies a translated outgoing draft to the clipboard. |
| `requestAnimationFrame()` | Batches DOM work and applies scroll-position compensation after layout changes. |

## Permissions

| Permission | Why it is used |
|---|---|
| `storage` | Persist channel/language settings and the local translation cache. |
| `offscreen` | Run Translator API in a hidden extension document. |
| `scripting` | Inject the content script into open Discord channel tabs. |
| `clipboardWrite` | Copy the outgoing translation to the clipboard. |
| `https://discord.com/*` host access | Read visible chat text and add translations to Discord Web. |

## Supported languages

The interface and built-in language selectors include:

- Polish (`pl`)
- Turkish (`tr`)
- Romanian (`ro`)
- German (`de`)
- Italian (`it`)
- English (`en`)
- Czech (`cs`)
- Hungarian (`hu`)

Actual translation availability depends on Chrome's Translator API and the selected language pair. Chrome downloads its translation models separately from ordinary browser language packs.

## Requirements

- Google Chrome **138 or later** on desktop.
- Discord Web at `https://discord.com`.
- A supported Translator API language pair and enough available device resources for Chrome's model.

## Install for development

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the extension project folder containing `manifest.json`.
5. Open Discord Web and click the extension icon.
6. Choose the interface language, target language, and source language for the current channel.
7. Select **Prepare channel translation** and wait for Chrome to prepare the required language pair, then save the channel setting.

When reloading an unpacked extension after code changes, use **Reload** on its card in `chrome://extensions`. The extension attempts to inject the updated content script into already-open Discord tabs, so a channel refresh should not normally be needed.

## Privacy and limitations

- Chat text is processed with Chrome's on-device Translator API. This extension has no translation server and no API key.
- Chrome downloads and manages the translation models. Review Chrome's own behavior and policies for those models.
- The extension reads visible Discord Web message text and modifies the page DOM to display translations. Discord can change its interface, so selectors may need maintenance.
- This is an unofficial prototype and is not affiliated with Discord or Google. Review the services' current terms before distributing or using it broadly.
- Translation quality and supported language pairs depend on Chrome's implementation and the downloaded models.

## Project status

Experimental prototype. The extension has been syntax-checked, but behavior can vary with Chrome, Discord's current DOM, device performance, and model availability.

## License

This project is available under the **PolyForm Noncommercial License 1.0.0**. You may use, modify, and share it for noncommercial purposes under the terms in [`LICENSE`](./LICENSE). Commercial use requires separate permission from the licensor.

This is a **source-available, noncommercial** project, not an OSI-approved open-source project: the license restricts commercial use. See the [official PolyForm license text](https://polyformproject.org/licenses/noncommercial/1.0.0) for the complete terms.
