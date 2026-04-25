---
slug: troubleshooting
title: "Troubleshooting"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 310
---

## 21. Troubleshooting

### 21.1 Common Issues and Solutions

**Issue: Blank page after build**
- Cause: Missing base URL or asset paths
- Solution: Check `.env` variables, verify `PUBLIC_URL` if needed

**Issue: State not updating after API call**
- Cause: Action not dispatched, or reducer not handling action
- Solution: Check Redux DevTools, verify action type matches

**Issue: Infinite loading spinner**
- Cause: API call not completing (error or hanging)
- Solution: Check network tab, verify API endpoint is working

**Issue: Form validation errors not showing**
- Cause: Validation schema doesn't match form fields
- Solution: Check Zod/Yup schema vs form field names

**Issue: Styles not applying to component**
- Cause: CSS Module not imported, class name mismatch
- Solution: Check import, verify `className={styles.name}` matches SCSS
