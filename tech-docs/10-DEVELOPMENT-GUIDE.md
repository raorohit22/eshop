# 10 — Development Guide

> **Audience:** Beginners → Mid-Level Engineers  
> **Prerequisites:** Node.js, npm, Git installed  
> **Goal:** Go from `git clone` to running all services in under 15 minutes

---

## 1. Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| Git | 2.x+ | `git --version` |

### External Services Required

| Service | Purpose | Setup |
|---------|---------|-------|
| MongoDB Atlas | Primary database | Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| Redis (Upstash/Redis Cloud) | OTP store, caching | Create instance at [upstash.com](https://upstash.com) or [redis.com](https://redis.com) |
| Gmail App Password | Email sending | [Google Account → Security → App Passwords](https://myaccount.google.com/apppasswords) |
| Stripe Account | Payment processing | Create at [stripe.com](https://stripe.com) |

---

## 2. Initial Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd eshop
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all dependencies for the monorepo (root + all apps via npm workspaces).

### Step 3: Configure Environment Variables

```bash
# Copy the template
cp .env.example .env

# Edit with your actual values
code .env    # or use any editor
```

**Required values to fill in:**

```env
DATABASE_URL = "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>"
REDIS_DATABASE_URI = "rediss://default:<password>@<host>:<port>"
SMTP_USER = "your-email@gmail.com"
SMTP_PASSWORD = "your-gmail-app-password"
ACCESS_TOKEN_SECRET = "generate-a-random-32-char-string"
REFRESH_TOKEN_SECRET = "generate-another-random-32-char-string"
STRIPE_SECRET_KEY = "sk_test_your_stripe_secret_key"
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Configure Frontend Environment

```bash
# User UI
echo "NEXT_PUBLIC_SERVER_URI=http://localhost:8080" > apps/user-ui/.env

# Seller UI
echo "NEXT_PUBLIC_SERVER_URI=http://localhost:8080" > apps/seller-ui/.env
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key" >> apps/seller-ui/.env
```

### Step 5: Generate Prisma Client

```bash
npx prisma generate
```

### Step 6: Push Schema to Database

```bash
npx prisma db push
```

---

## 3. Running the Application

### Option A: Start Everything

```bash
npm run dev
```

This runs `npx nx run-many --target=serve --all`, starting all services simultaneously.

### Option B: Start Individual Services

```bash
# API Gateway only
npx nx serve api-gateway

# Auth Service only
npx nx serve auth-service

# User UI only
npm run user-ui

# Seller UI only
npm run seller-ui
```

### Option C: Backend + One Frontend

```bash
# Terminal 1: Backend services
npx nx serve api-gateway
# Terminal 2:
npx nx serve auth-service
# Terminal 3: Frontend
npm run user-ui
```

### Service URLs

| Service | URL | Health Check |
|---------|-----|-------------|
| User UI | http://localhost:3000 | Open in browser |
| Seller UI | http://localhost:3001 | Open in browser |
| API Gateway | http://localhost:8080 | http://localhost:8080/gateway-health |
| Auth Service | http://localhost:6001 | http://localhost:6001/ |
| Swagger Docs | http://localhost:6001/api-docs | Open in browser |

---

## 4. Common Development Tasks

### Database Operations

```bash
# View data in browser
npx prisma studio

# Reset and re-push schema
npx prisma db push --force-reset

# Regenerate client after schema changes
npx prisma generate
```

### Regenerate Swagger Docs

```bash
npm run auth-docs
```

### Running Tests

```bash
# All tests
npx nx run-many -t test

# Specific service
npx nx test auth-service

# With coverage
npx nx test auth-service --coverage
```

### Linting

```bash
# All projects
npx nx run-many -t lint

# Specific project
npx nx lint auth-service
```

### Type Checking

```bash
npx nx run-many -t typecheck
```

### Build

```bash
# Build all
npx nx run-many -t build

# Build specific
npx nx build auth-service
```

### View Dependency Graph

```bash
npx nx graph
```

This opens an interactive visualization of project dependencies in your browser.

---

## 5. Testing API Endpoints

### Using cURL

```bash
# Register user
curl -X POST http://localhost:8080/api/user-registration \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'

# Login user (saves cookies)
curl -X POST http://localhost:8080/api/login-user \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c cookies.txt

# Get logged-in user (uses saved cookies)
curl -X GET http://localhost:8080/api/logged-in-user \
  -b cookies.txt
```

### Using Swagger UI

1. Start the auth service
2. Navigate to http://localhost:6001/api-docs
3. Use the interactive UI to test endpoints

---

## 6. Debugging

### Backend Debugging

1. **Console Logs:** Morgan logs all HTTP requests in dev mode
2. **Error Details:** The error middleware logs all errors to console
3. **Prisma Debugging:** Add logging to Prisma client:
   ```typescript
   const prisma = new PrismaClient({ log: ['query', 'error', 'warn'] });
   ```

### Frontend Debugging

1. **React Query DevTools:** Add to providers:
   ```typescript
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   // In provider: <ReactQueryDevtools initialIsOpen={false} />
   ```
2. **Network Tab:** Check cookies and auth headers in browser DevTools
3. **Jotai DevTools:** Use Jotai DevTools extension for seller-ui state

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| `prisma generate` fails | Missing `DATABASE_URL` | Set in `.env` |
| CORS errors | Wrong origin in gateway | Update `cors()` origin |
| Cookie not sent | `withCredentials: false` | Ensure `true` in axios |
| 401 on refresh | Expired refresh token | Re-login |
| Redis connection refused | Wrong URI or service down | Check `REDIS_DATABASE_URI` |

---

## 7. Adding New Features

### Add a New API Endpoint

1. Add handler in `apps/auth-service/src/controller/auth.controller.ts`
2. Add route in `apps/auth-service/src/routes/auth.router.ts`
3. Apply middleware as needed (`isAuthenticated`, `isSeller`)
4. Regenerate Swagger: `npm run auth-docs`

### Add a New Frontend Page

1. Create directory under `src/app/(routes)/your-page/`
2. Add `page.tsx` (automatically routed by Next.js)
3. Add to navigation in `configs/constants.tsx`

### Add a New Shared Package

1. Create directory under `packages/your-package/`
2. Import via `@packages/your-package`
3. No additional config needed (resolved by `tsconfig.base.json`)

### Add a New Prisma Model

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Run `npx prisma generate`
4. Import and use via `import prisma from "@packages/libs/prisma"`

---

*Next: [Dependency Graph](./11-DEPENDENCY-GRAPH.md)*
