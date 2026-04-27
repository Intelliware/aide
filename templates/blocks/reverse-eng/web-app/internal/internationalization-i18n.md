---
slug: internationalization-i18n
title: "Internationalization (i18n)"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 240
---

## 14. Internationalization (i18n)

### 14.1 i18n Setup

<!-- How translations are implemented. Capture the codebase's actual library and
locale-file convention. -->

- **Library:** [e.g., react-i18next / FormatJS react-intl / LinguiJS / Vue I18n / vue-i18n / @nuxtjs/i18n / @angular/localize / ngx-translate / svelte-i18n / @sveltejs/kit i18n / @solid-primitives/i18n / next-intl / next-i18next / Astro i18n / Lingui]
- **Supported Languages:** [e.g., English (en), Spanish (es), French (fr)]
- **Translation Files:** Located in [e.g., `src/i18n/locales/`, `src/locales/`, `messages/`, `i18n/`, `locales/`, `assets/i18n/`]

**Configuration (illustrative — react-i18next):**

```typescript
// src/i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    es: { translation: esTranslations },
  },
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

The shape — register a translation backend / resource bundle, set initial + fallback locales, expose a translation function — is universal across libraries. Equivalent setup in: Vue I18n (`createI18n({ locale, fallbackLocale, messages })`), Angular `provideRouter` + `loadTranslations`, Lingui `i18n.load + i18n.activate`, svelte-i18n `register + init`, etc.

### 14.2 Using Translations in Components (illustrative — react-i18next)

```typescript
import { useTranslation } from 'react-i18next';

const TicketCard: React.FC = ({ ticket }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{ticket.title}</h2>
      <p>{t('common.status')}: {ticket.status}</p>
      <button>{t('common.edit')}</button>
    </div>
  );
};
```

Equivalent shapes:
- **Vue I18n:** `const { t } = useI18n();` then `{{ t('common.status') }}` in templates.
- **Angular i18n:** `{{ 'common.status' | translate }}` (ngx-translate) or `i18n` template attribute (built-in).
- **Svelte:** `import { _ } from 'svelte-i18n'; $_('common.status')`.
- **Solid:** `const [t] = useI18n(); t('common.status')`.

### 14.3 Translation Keys

| Key | English | Spanish | Usage |
|-----|---------|---------|-------|
| `common.status` | Status | Estado | In ticket cards, lists |
| `common.edit` | Edit | Editar | Button labels |
| `tickets.create` | Create Ticket | Crear Ticket | Form heading |
| [key] | [en] | [es] | [usage] |
