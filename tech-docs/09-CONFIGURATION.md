# 09 — Configuration Reference

> **Audience:** All Engineers, DevOps  
> **Prerequisites:** [Architecture](./01-ARCHITECTURE.md)

---

## 1. Environment Variables

### Root `.env` (Required)

| Variable | Type | Required | Example | Used By |
|----------|------|----------|---------|---------|
| `DATABASE_URL` | String | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/eshop` | Prisma |
| `DB_USERNAME` | String | ✅ | `myuser` | Reference |
| `DB_PASSWORD` | String | ✅ | `mypassword` | Reference |
| `REDIS_DATABASE_URI` | String | ✅ | `rediss://default:pass@host:port` | ioredis |
| `SMTP_USER` | String | ✅ | `app@gmail.com` | Nodemailer |
| `SMTP_PORT` | Number | ✅ | `465` | Nodemailer |
| `SMTP_PASSWORD` | String | ✅ | `xxxx-xxxx-xxxx-xxxx` (App Password) | Nodemailer |
| `SMTP_SERVICE` | String | ✅ | `gmail` | Nodemailer |
| `SMTP_HOST` | String | ✅ | `smtp.gmail.com` | Nodemailer |
| `ACCESS_TOKEN_SECRET` | String | ✅ | `your-secret-key-min-32-chars` | JWT sign/verify |
| `REFRESH_TOKEN_SECRET` | String | ✅ | `another-secret-key-min-32-chars` | JWT sign/verify |
| `STRIPE_SECRET_KEY` | String | ✅ | `sk_test_...` | Stripe SDK |
| `CLIENT_URL` | String | ⚠️ | `http://localhost:3000` | Stripe redirect URLs |

### User UI `.env`

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_SERVER_URI` | ✅ | `http://localhost:8080` |

### Seller UI `.env`

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_SERVER_URI` | ✅ | `http://localhost:8080` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | `pk_test_...` |

> **Security:** Never commit `.env` files. Use `.env.example` as a template.

---

## 2. Nx Configuration (`nx.json`)

### Workspace Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| `defaultBase` | `master` | Base branch for affected calculations |
| `analytics` | `false` | Disable Nx analytics |

### Plugins

| Plugin | Purpose |
|--------|---------|
| `@nx/js/typescript` | TypeScript build + typecheck targets |
| `@nx/jest/plugin` | Test targets (excludes e2e projects) |
| `@nx/docker` | Docker build + run targets |
| `@nx/webpack/plugin` | Build/serve targets for Node apps |
| `@nx/eslint/plugin` | Lint targets |
| `@nx/next/plugin` | Dev/build/start targets for Next.js apps |

### Target Defaults

- **esbuild targets:** Cached, depend on `^build`, use production inputs
- **test targets:** Depend on `^build`

### Generator Defaults

```json
{
  "@nx/next": {
    "application": {
      "style": "tailwind",
      "linter": "none"
    }
  }
}
```

---

## 3. TypeScript Configuration

### Base Config (`tsconfig.base.json`)

| Option | Value | Purpose |
|--------|-------|---------|
| `composite` | `true` | Project references support |
| `strict` | `true` | All strict type checks enabled |
| `target` | `es2022` | Modern JavaScript output |
| `module` | `nodenext` | Node.js module resolution |
| `moduleResolution` | `nodenext` | Follows Node.js rules |
| `isolatedModules` | `true` | Required for SWC/esbuild |
| `noImplicitReturns` | `true` | All code paths must return |
| `noUnusedLocals` | `true` | Error on unused variables |
| `skipLibCheck` | `true` | Skip type checking of .d.ts files |

### Path Aliases

```json
{
  "paths": {
    "@packages/*": ["packages/*"]
  }
}
```

---

## 4. Webpack Configuration

### API Gateway / Auth Service

```javascript
// webpack.config.js
module.exports = {
  output: { path: join(__dirname, 'dist') },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',           // Node.js target
      compiler: 'tsc',          // TypeScript compiler
      main: './src/main.ts',    // Entry point
      tsConfig: './tsconfig.app.json',
      assets: ["./src/assets"],
      optimization: false,      // No minification
      outputHashing: 'none',    // No file hashing
      generatePackageJson: false,
      sourceMap: true,
    })
  ],
};
```

---

## 5. ESLint Configuration

### Flat Config (`eslint.config.mjs`)

Uses Nx's flat config presets with module boundary enforcement:

```javascript
{
  rules: {
    "@nx/enforce-module-boundaries": [
      "error",
      {
        enforceBuildableLibDependency: true,
        allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
        depConstraints: [
          { sourceTag: "*", onlyDependOnLibsWithTags: ["*"] }
        ]
      }
    ]
  }
}
```

**What this enforces:**
- Projects must respect defined dependency boundaries
- Libraries must have proper build configurations
- No circular dependencies between projects

---

## 6. Docker Configuration

### Auth Service Dockerfile

```dockerfile
FROM docker.io/node:lts-alpine    # Lightweight base image
ENV HOST=0.0.0.0                  # Bind to all interfaces
ENV PORT=3000                     # Internal port
WORKDIR /app                      # Working directory
COPY dist .                       # Copy build output
RUN npm --omit=dev -f install     # Install production deps
CMD [ "node", "main.js" ]         # Start server
```

### Nx Docker Targets

```bash
# Build image
npx nx docker:build auth-service

# Run container
npx nx docker:run auth-service -p 6001:3000
```

---

## 7. CI/CD Configuration (`.github/workflows/ci.yml`)

```yaml
name: CI
on:
  push:
    branches: [master]
  pull_request:

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx nx run-many -t lint test build typecheck
      - run: npx nx fix-ci
        if: always()
```

**Targets Executed:**
1. `lint` — ESLint checks
2. `test` — Jest unit tests
3. `build` — Webpack/Next.js builds
4. `typecheck` — TypeScript strict checks

---

## 8. Next.js Configuration

Both frontend apps share similar configs:

```javascript
// next.config.js
const { composePlugins, withNx } = require('@nx/next');
const nextConfig = {};
const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
```

### Tailwind CSS

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    // Seller UI also includes shared components:
    '../../packages/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
};
```

---

## 9. NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `npx nx run-many --target=serve --all` | Start all services |
| `auth-docs` | `node apps/auth-service/src/swagger.js` | Regenerate Swagger docs |
| `user-ui` | `npx nx run-many --target=dev --all --projects=user-ui` | Start user UI only |
| `seller-ui` | `npx nx run-many --target=dev --all --projects=seller-ui` | Start seller UI only |

---

## 10. Port Allocation

| Port | Service | Protocol |
|------|---------|----------|
| 3000 | User UI (Next.js) | HTTP |
| 3001 | Seller UI (Next.js) | HTTP |
| 6001 | Auth Service (Express) | HTTP |
| 8080 | API Gateway (Express) | HTTP |

---

*Next: [Development Guide](./10-DEVELOPMENT-GUIDE.md)*
