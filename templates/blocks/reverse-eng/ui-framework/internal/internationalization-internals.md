---
slug: internationalization-internals
title: "Internationalization Internals"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader]
optional: true
order-hint: 240
---

## 14. Internationalization Internals

<!-- Optional. The official i18n package's internals, if the framework
ships one. Apps that BYO an i18n library (formatjs, i18next) won't need
this section. -->

### 14.1 Architecture

- **Catalogues:** per-locale dictionaries `Record<MessageKey, ICU-string>`.
- **Loader:** lazy `() => import('./locales/{locale}.json')` per chunk.
- **Resolver:** walks `locale → fallbackLocale → 'en-US'`.
- **Reactive locale signal:** changing it triggers re-render of every component that reads via `t()`.

```
   t('greeting', { name }) ─►
      lookup catalogue (active locale)
        │ miss
        ▼
      walk fallback chain
        │
        ▼
      compile ICU MessageFormat (cached per key+locale)
        │
        ▼
      render with vars + plural / select rules
```

### 14.2 Translation Function

```typescript
function t(key: string, vars?: Record<string, unknown>, options?: TOptions): string {
  const msg = resolve(key, options?.locale ?? activeLocale.value);
  if (!msg) return options?.default ?? key;
  return formatICU(msg, vars, options?.locale ?? activeLocale.value);
}
```

- Tracks `activeLocale` so any component using `t()` re-renders on locale change.
- Dev mode logs missing keys once per (key, locale) pair.
- Production missing-key behavior: return the key string (configurable to throw or to call a reporter).

### 14.3 ICU MessageFormat

- Supports `plural`, `select`, `selectordinal`, and number/date/time formats with `Intl.*`.
- Compiled to AST once per (key, locale) and cached.
- Custom formatters registrable via `registerFormatter('uppercase', (v, locale) => …)`.

### 14.4 Pluralization

```
{count, plural,
  =0 {no items}
  one {one item}
  other {# items}
}
```

- Plural rules sourced from CLDR via `Intl.PluralRules`.
- `=0`, `=1` literal forms have priority over `one`/`other`.

### 14.5 Locale Switching

```typescript
async function setLocale(locale: string) {
  if (!isLoaded(locale)) {
    const messages = await loaders[locale]();
    register(locale, messages);
  }
  activeLocale.value = locale;
  document.documentElement.lang = locale;
  document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr';
}
```

- Locale changes are atomic — no flash of mixed-language UI.
- Lazy-loaded chunks for unused locales never enter the bundle.

### 14.6 Number, Date, Currency, RelativeTime

- Wrap `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`.
- Formatter instances cached per (locale, options).
- Currency code is required — framework refuses to infer.

### 14.7 Message Extraction

- Build-time tool scans source for `t('key')` calls and `<i18n>` SFC blocks.
- Outputs `messages.{locale}.json` skeletons; missing keys flagged in CI.
- Handles dynamic keys (`t(\`page.${name}.title\`)`) via opt-in registration helpers — fully dynamic keys must be declared.

### 14.8 SSR Notes

- The active locale is per-request; never use a module-level `activeLocale` in SSR.
- Catalogues can be preloaded server-side and serialized into the SSR output to avoid hydration locale flicker.

### 14.9 Pitfalls

- [e.g., "`t()` outside reactive scope (e.g., module init) snapshots the locale at call time — always call inside `setup` or `effect`."]
- [e.g., "Changing locale before its catalogue finishes loading races the resolver; the await in `setLocale` is critical."]
- [e.g., "ICU compilation caches keyed only by message text — translators changing punctuation between releases invalidates the cache, which is correct but invisible."]
