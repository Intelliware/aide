---
slug: forms-and-validation
title: "Forms and Validation"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 220
---

## 12. Forms and Validation

### 12.1 Form Handling Approach

<!-- How forms are structured and submitted. Discover and record the actual library
in use — the pattern (controlled vs uncontrolled, schema-driven validation, async
submit with loading + error states) is universal; the specific library is not. -->

- **Form Library:** [e.g., React Hook Form, Formik, TanStack Form, native `<form>` + `useState`; Vue VeeValidate, FormKit, vee-validate + `<form>`; Angular Reactive Forms, Template-driven Forms; Svelte `superforms`, `felte`, native bindings; Solid `solid-form`; SvelteKit form actions; Remix actions]
- **Validation:** [e.g., Zod, Yup, Valibot, AJV, Joi schema validation; class-validator (decorators); Angular Validators; manual validation; server-side validation]
- **Approach:** [Uncontrolled / controlled inputs, how data flows from input → state → submit]

**Form Structure (illustrative — React Hook Form + Zod):**

```typescript
// Example form using React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketSchema } from './ticketSchema';

const TicketForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ticketSchema),
    mode: 'onBlur', // Validate on blur, not on every keystroke
  });

  const onSubmit = async (data) => {
    try {
      const response = await ticketService.createTicket(data);
      showToast('Ticket created successfully', 'success');
      // Redirect or refresh
    } catch (error) {
      // Error already handled by httpClient interceptor
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} placeholder="Title" />
      {errors.title && <span className="error">{errors.title.message}</span>}

      <textarea {...register('description')} placeholder="Description" />
      {errors.description && <span className="error">{errors.description.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  );
};
```

### 12.2 Validation Rules

<!-- What validation is performed and where. -->

**Ticket Creation Validation:**

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| title | string | Required, 3-200 chars | "Title is required and must be 3-200 characters" |
| description | string | Required, 10-5000 chars | "Description must be 10-5000 characters" |
| priority | enum | One of: low, medium, high | "Invalid priority" |
| assignee_id | string | Optional, valid UUID | "Invalid assignee" |

**Client-Side vs. Server-Side:**
- **Client-side:** Format validation, required fields, length checks (fast feedback)
- **Server-side:** Business logic validation, uniqueness checks, authorization (source of truth)
