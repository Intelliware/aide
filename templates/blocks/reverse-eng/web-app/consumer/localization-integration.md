---
slug: localization-integration
title: "Localization Integration"
applies-to: [re-web-app-consumer]
requires-decision-from: [code-reader]
optional: false
order-hint: 180
---

## 8. Localization Integration

<!-- How embedders pass locale through, how strings are sourced, and how
they can override translations or contribute new locales. -->

### 8.1 Supported Locales

| Locale | Code | Status |
|--------|------|--------|
| English (US) | `en-US` | Source |
| English (UK) | `en-GB` | Full |
| Spanish | `es` | Full |
| French | `fr` | Full |
| German | `de` | Full |
| Japanese | `ja` | Full |
| [Locale] | [code] | [Full / Partial / Beta] |

- **Fallback chain:** [e.g., "Requested locale → language-only fallback (e.g., `fr-CA` → `fr`) → source (`en-US`)."]
- **Automatic detection:** [e.g., "If no locale is set, the embed reads `navigator.language`. Iframe mode also reads `Accept-Language` from the initial navigation."]

### 8.2 Setting the Locale

**SDK / Web Component:**

```typescript
sdk.init({
  locale: 'fr-CA',
  // optional fallback override
  fallbackLocale: 'fr',
});

// Change at runtime
sdk.setLocale('ja');
```

**iframe (URL parameter):**

```
https://{{embed-host}}/embed?locale=de-DE
```

**iframe (postMessage at runtime):**

```typescript
iframe.contentWindow.postMessage(
  { type: 'request', id: '1', method: 'setLocale', params: { locale: 'es' } },
  TRUSTED_ORIGIN,
);
```

### 8.3 Date, Number, Currency Formatting

- All formatting uses `Intl.*` APIs against the active locale.
- **Time zones:** [e.g., "Dates are displayed in the user's IANA time zone. Override via `sdk.init({ timeZone: 'Europe/Paris' })`."]
- **Currency:** [e.g., "Currency code is always passed alongside the amount; the embed never infers currency from locale."]
- **First day of week:** [e.g., "Honors the locale calendar — Sunday for `en-US`, Monday for most others."]

### 8.4 Translation Overrides

<!-- The supported way an embedder substitutes strings. -->

```typescript
sdk.init({
  locale: 'en-US',
  translations: {
    'en-US': {
      'common.save':        'Update',
      '{{item}}.empty':     'No tickets yet — open one from your inbox.',
    },
    'fr':    { 'common.save': 'Mettre à jour' },
  },
});
```

- **Keys** are documented in the SDK reference. They are stable within a major version.
- **Pluralization** uses ICU MessageFormat: `{count, plural, one {# item} other {# items}}`.
- **Variables** use ICU placeholders: `Hello, {name}!`.

### 8.5 Right-to-Left (RTL) Support

- Locales with RTL scripts (`ar`, `he`, `fa`, `ur`) automatically apply `dir="rtl"` on the embed root.
- Layouts, icons, and direction-sensitive components mirror.
- **Embedder action required:** ensure the host page does not force `dir="ltr"` on the embed.

### 8.6 Adding a New Locale

If your team needs a locale that is not in the list:

1. [e.g., "Open a request via support-and-contact with the locale code."]
2. [e.g., "We provide an English source bundle (`messages.en-US.json`) for translation."]
3. [e.g., "Submit translated bundle; we add it to the next minor release."]
4. [e.g., "Self-service path: pass a full bundle via `sdk.init({ translations: { [locale]: bundle }, locale })` — the embed will use it as a first-class locale."]

### 8.7 Locale-Aware URL Patterns

- [e.g., "Deep-link URLs include `?locale=` so they can be shared without losing language context."]
- [e.g., "The embed never persists a locale in cookies or localStorage; the host owns the persistence."]
