---
slug: quick-reference
title: "Quick Reference"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 330
---

## 23. Quick Reference

### 23.1 Command Cheat Sheet

```bash
# Development
npm start                    # Start dev server with hot reload
npm test                     # Run tests in watch mode
npm run lint                 # Check code style
npm run format               # Auto-fix code style

# Production
npm run build                # Create optimized build
npm run build -- --analyze   # Analyze bundle size

# Testing
npm test -- TicketCard.test  # Run specific test
npm test -- --coverage       # Show coverage report
npm run e2e                  # Run E2E tests
npm run e2e -- --ui          # Run E2E with UI

# Other
npm run type-check           # TypeScript checking
npm install                  # Install dependencies
npm outdated                 # Check for outdated packages
```

### 23.2 Component Development Checklist

When creating a new component:

- [ ] Create component file and styles file in appropriate folder
- [ ] Define prop types as TypeScript interface
- [ ] Write component with JSDoc comments
- [ ] Use design tokens for all colors, spacing, fonts
- [ ] Make component responsive (mobile-first)
- [ ] Add ARIA attributes for accessibility
- [ ] Write unit tests (at least happy path + error case)
- [ ] Document in this guide if it's a new shared component

### 23.3 Feature Development Checklist

When creating a new feature:

- [ ] Create feature folder in `src/features/[name]/`
- [ ] Create routes, pages, components folders
- [ ] Define Redux slice (state, reducers, actions, selectors)
- [ ] Create API service methods in service file
- [ ] Create page components
- [ ] Create reusable feature components
- [ ] Add internationalization keys for all user-facing text
- [ ] Write tests (unit + integration)
- [ ] Add error handling and loading states
- [ ] Document the feature in this guide
- [ ] Review for accessibility, performance, security
