---
slug: build-and-deployment
title: "Build and Deployment"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader, ops]
optional: false
order-hint: 290
---

## 19. Build and Deployment

### 19.1 Build Process

```bash
# Create optimized production build
npm run build

# Output: dist/ folder with:
# - Minified JavaScript
# - Optimized images
# - Source maps (for debugging in production)
# - Static assets

# Build size analysis (optional)
npm run build -- --analyze
```

**Build Output:**

| File | Size | Purpose |
|------|------|---------|
| `main.[hash].js` | ~250KB | Main application code |
| `vendor.[hash].js` | ~150KB | Third-party libraries |
| `styles.[hash].css` | ~50KB | Global and component styles |
| `index.html` | ~2KB | HTML entry point |

### 19.2 Deployment Environments

**Development:**
- URL: http://localhost:3000
- API: http://localhost:3001
- Build: `npm start` (watch mode, sourcemaps)

**Staging:**
- URL: https://staging-app.company.com
- API: https://api-staging.company.com
- Build: Production build, deployed to staging bucket/server

**Production:**
- URL: https://app.company.com
- API: https://api.company.com
- Build: Production build, deployed to CDN + S3 + CloudFront

**Deployment Process:**

1. Developer pushes code to GitHub
2. CI/CD pipeline (GitHub Actions) runs:
   - Install dependencies
   - Lint and format checks
   - Run tests (unit + E2E)
   - Build production bundle
   - Upload to S3 (staging/production based on branch)
   - Invalidate CloudFront cache
3. App is live
