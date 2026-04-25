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

<!-- How translations are implemented. -->

- **Library:** [e.g., "react-i18next"]
- **Supported Languages:** English (en), Spanish (es), French (fr)
- **Translation Files:** Located in `src/i18n/locales/`

**Configuration:**

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

### 14.2 Using Translations in Components

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

### 14.3 Translation Keys

| Key | English | Spanish | Usage |
|-----|---------|---------|-------|
| `common.status` | Status | Estado | In ticket cards, lists |
| `common.edit` | Edit | Editar | Button labels |
| `tickets.create` | Create Ticket | Crear Ticket | Form heading |
| [key] | [en] | [es] | [usage] |
