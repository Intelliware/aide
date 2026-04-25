---
slug: forms-and-validation-internals
title: "Forms and Validation Internals"
applies-to: [re-ui-framework-internal]
requires-decision-from: [code-reader]
optional: true
order-hint: 190
---

## 9. Forms and Validation Internals

<!-- Optional. Frameworks that ship a form abstraction (Angular Forms,
Vue forms helpers, controlled-component patterns) document the
internal model here. -->

### 9.1 Form State Model

```typescript
interface FormControlState<T> {
  value: T;
  initialValue: T;
  dirty: boolean;        // value !== initialValue
  touched: boolean;      // user has blurred at least once
  pending: boolean;      // async validators in flight
  errors: Record<string, ValidationError> | null;
  status: 'valid' | 'invalid' | 'pending' | 'disabled';
}

interface FormGroupState<T extends object> {
  controls: { [K in keyof T]: FormControlState<T[K]> | FormGroupState<T[K]> };
  // Aggregated:
  value: T;
  dirty: boolean;
  touched: boolean;
  errors: Record<string, ValidationError> | null;
  status: 'valid' | 'invalid' | 'pending' | 'disabled';
}
```

- All fields are reactive; UI subscribes via the same primitives as application state.
- Aggregations (`dirty`, `errors`, `status`) are derived (`computed`) — never written directly.

### 9.2 Two-Way Binding

- The framework's `v-model` / equivalent compiles to a value binding + an update event handler.
- For form-state objects, the binding writes through the control wrapper so derived state stays consistent.
- Custom inputs implement a contract:

```typescript
interface FormControlValueAccessor<T> {
  writeValue(value: T): void;
  registerOnChange(fn: (value: T) => void): void;
  registerOnBlur(fn: () => void): void;
  setDisabledState?(disabled: boolean): void;
}
```

### 9.3 Validation Pipeline

```
   value change
        │
        ▼
   sync validators (in order)
        │
        ▼
   if any sync error → status='invalid', stop here
        │
        ▼
   async validators (parallel)
        │
        ▼
   collect all errors → status='valid' | 'invalid'
```

- Each control's pending count is decremented as async validators settle; status flips only when all are resolved.
- A new value invalidates in-flight async validators (cancellation token / generation counter).

### 9.4 Built-in Validators

| Validator | Behavior |
|-----------|----------|
| `required` | Non-empty (string trim, array length, etc.) |
| `minLength(n)` | String/array length |
| `maxLength(n)` | String/array length |
| `pattern(re)` | Regex match |
| `min(n)` / `max(n)` | Numeric bounds |
| `email` | RFC 5322 simple match |
| [Other] | [behavior] |

### 9.5 Custom Validators

```typescript
const matchOther = (otherKey: string): Validator =>
  (control) => {
    const other = control.parent?.controls[otherKey];
    return control.value === other?.value ? null : { mismatch: true };
  };

// Async
const usernameAvailable: AsyncValidator = async (control) => {
  const taken = await api.isUsernameTaken(control.value);
  return taken ? { taken: true } : null;
};
```

### 9.6 Cross-Field and Group-Level Validation

- A `FormGroup` accepts validators that receive the whole group state and return aggregated errors keyed at the group level (`group.errors.passwordMismatch`).
- Cross-field errors do NOT mark child controls invalid — UI must opt in to displaying them.

### 9.7 Submission Flow

```typescript
async function submit(form: FormGroupState<T>) {
  markAllTouched(form);
  if (form.status === 'pending') await waitForPending(form);
  if (form.status !== 'valid') return { ok: false };
  return await onSubmit(form.value);
}
```

- `markAllTouched` triggers any "show error after touch" UI rules.
- Submit handlers receive the typed `value` snapshot, not the live state.

### 9.8 Dynamic Forms

- `FormArray` is a list of controls with `push`, `removeAt`, `clear`, and reactive `length`.
- Insertion preserves keys so user-typed values aren't reshuffled.

### 9.9 Performance Notes

- Validation runs only for controls whose value or validator set changed.
- Large groups should split into nested groups so dirty propagation does not invalidate every sibling.
- Async validators should debounce upstream (e.g., 300ms typing) — the form layer does NOT debounce internally.
