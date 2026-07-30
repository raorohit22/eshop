# 08 — Folder Structure & File Reference

> **Audience:** All Engineers  
> **Prerequisites:** None  
> **Related Docs:** [Architecture](./01-ARCHITECTURE.md)

---

## 1. Complete Project Tree

```
eshop/                                    # Monorepo root
│
├── .editorconfig                         # Editor formatting rules
├── .env                                  # Environment variables (SECRET — not committed)
├── .env.example                          # Environment template for onboarding
├── .gitignore                            # Git ignore patterns
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI pipeline
├── .nx/                                  # Nx cache and metadata (auto-generated)
├── .vscode/                              # VSCode workspace settings
│
├── package.json                          # Root package.json (workspaces, scripts, deps)
├── package-lock.json                     # Dependency lock file
├── nx.json                               # Nx workspace configuration
├── tsconfig.base.json                    # Shared TypeScript compiler options
├── tsconfig.json                         # Root TypeScript project references
├── jest.config.ts                        # Root Jest configuration
├── jest.preset.js                        # Shared Jest preset
├── eslint.config.mjs                     # ESLint flat config
├── prisma.config.ts                      # Prisma datasource configuration
│
├── prisma/
│   └── schema.prisma                     # Database schema (models, relations)
│
├── apps/                                 # Deployable applications
│   │
│   ├── api-gateway/                      # ─── Express.js Reverse Proxy ───
│   │   ├── package.json                  # Nx targets + deps
│   │   ├── webpack.config.js             # Webpack build config
│   │   ├── tsconfig.json                 # TS config (extends base)
│   │   ├── tsconfig.app.json             # App-specific TS config
│   │   ├── src/
│   │   │   ├── main.ts                   # ★ Entry point (CORS, proxy, rate-limit)
│   │   │   └── assets/                   # Static assets
│   │   └── dist/                         # Build output
│   │
│   ├── auth-service/                     # ─── Express.js Auth API ───
│   │   ├── .env                          # Service-level env vars
│   │   ├── Dockerfile                    # Container image definition
│   │   ├── package.json                  # Nx targets
│   │   ├── webpack.config.js             # Webpack build config
│   │   ├── jest.config.cts               # Jest test config
│   │   ├── tsconfig.json                 # TS config
│   │   ├── tsconfig.app.json             # App TS config
│   │   ├── tsconfig.spec.json            # Test TS config
│   │   ├── src/
│   │   │   ├── main.ts                   # ★ Entry point (Express app setup)
│   │   │   ├── swagger.js                # Swagger doc generator script
│   │   │   ├── swagger-output.json       # Generated Swagger spec
│   │   │   ├── controller/
│   │   │   │   └── auth.controller.ts    # ★ All auth handlers (542 lines)
│   │   │   ├── routes/
│   │   │   │   └── auth.router.ts        # Route definitions + middleware binding
│   │   │   ├── utils/
│   │   │   │   ├── auth.helper.ts        # ★ OTP, validation, forgot password logic
│   │   │   │   ├── cookies/
│   │   │   │   │   └── setCookie.ts      # Cookie configuration helper
│   │   │   │   ├── sendMail/
│   │   │   │   │   └── index.ts          # Nodemailer email sender
│   │   │   │   └── email-templates/
│   │   │   │       ├── user-activation-mail.ejs
│   │   │   │       ├── seller-activation-mail.ejs
│   │   │   │       └── forgot-password-user-mail.ejs
│   │   │   ├── types/                    # TypeScript type definitions (empty)
│   │   │   └── assets/                   # Static assets
│   │   ├── dist/                         # Build output
│   │   └── out-tsc/                      # TypeScript declaration output
│   │
│   ├── user-ui/                          # ─── Next.js Customer App ───
│   │   ├── .env                          # NEXT_PUBLIC_SERVER_URI
│   │   ├── .env.example                  # Env template
│   │   ├── package.json                  # App metadata
│   │   ├── next.config.js                # Next.js configuration
│   │   ├── tailwind.config.js            # Tailwind CSS config
│   │   ├── postcss.config.js             # PostCSS config
│   │   ├── tsconfig.json                 # TS config with path aliases
│   │   ├── index.d.ts                    # Global type declarations
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx            # ★ Root layout (fonts, header, providers)
│   │   │   │   ├── page.tsx              # Home page (/)
│   │   │   │   ├── providers.tsx         # React Query provider
│   │   │   │   ├── global.css            # Global styles + Tailwind imports
│   │   │   │   ├── (routes)/             # Route group (no URL segment)
│   │   │   │   │   ├── login/page.tsx    # /login page
│   │   │   │   │   ├── signup/page.tsx   # /signup page
│   │   │   │   │   └── forgot-password/page.tsx
│   │   │   │   ├── shared/
│   │   │   │   │   └── widgets/
│   │   │   │   │       ├── index.ts      # Re-exports Header
│   │   │   │   │       ├── header.tsx    # ★ Main header (search, user, cart)
│   │   │   │   │       ├── header-bottom.tsx  # Navigation bar
│   │   │   │   │       └── components/   # Header sub-components
│   │   │   │   └── api/                  # Next.js API routes
│   │   │   ├── assets/                   # SVGs and images
│   │   │   ├── configs/
│   │   │   │   ├── constants.tsx         # Nav items array
│   │   │   │   └── global.d.ts           # NavItemsType definition
│   │   │   ├── hooks/
│   │   │   │   └── useUser.ts            # ★ User session hook (React Query)
│   │   │   └── utils/
│   │   │       └── axiosInstance.ts       # ★ Axios + token refresh interceptor
│   │   ├── public/                       # Static public assets
│   │   └── .next/                        # Next.js build cache
│   │
│   ├── seller-ui/                        # ─── Next.js Seller Dashboard ───
│   │   ├── .env                          # NEXT_PUBLIC_SERVER_URI + Stripe key
│   │   ├── .env.example                  # Env template
│   │   ├── package.json                  # App metadata
│   │   ├── next.config.js                # Next.js configuration
│   │   ├── tailwind.config.js            # Tailwind CSS config
│   │   ├── postcss.config.js             # PostCSS config
│   │   ├── tsconfig.json                 # TS config with path aliases
│   │   ├── index.d.ts                    # Global type declarations
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx            # Root layout (Poppins font, providers)
│   │   │   │   ├── page.tsx              # Landing page
│   │   │   │   ├── providers.tsx         # React Query provider
│   │   │   │   ├── global.css            # Global styles + Tailwind
│   │   │   │   ├── assets/               # SVGs and icons
│   │   │   │   ├── (routes)/
│   │   │   │   │   ├── login/page.tsx    # /login (seller auth)
│   │   │   │   │   ├── signup/page.tsx   # /signup (seller registration)
│   │   │   │   │   ├── success/          # /success (Stripe callback)
│   │   │   │   │   └── dashboard/
│   │   │   │   │       ├── layout.tsx    # ★ Dashboard layout (sidebar + main)
│   │   │   │   │       ├── page.tsx      # Dashboard home
│   │   │   │   │       └── create-product/
│   │   │   │   └── api/                  # Next.js API routes
│   │   │   ├── configs/
│   │   │   │   └── constants.tsx         # Jotai atoms
│   │   │   ├── hooks/
│   │   │   │   ├── useSeller.tsx         # ★ Seller session hook
│   │   │   │   └── useSidebar.tsx        # Sidebar state hook
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   │   ├── box/             # Styled Box component
│   │   │   │   │   ├── image-placeholder/
│   │   │   │   │   └── sidebar/         # ★ Sidebar (4 files)
│   │   │   │   └── modules/
│   │   │   │       └── auth/
│   │   │   │           └── create-shop.tsx  # ★ Shop creation form
│   │   │   └── utils/
│   │   │       ├── axiosInstance.ts       # Axios + token refresh
│   │   │       ├── categories.tsx        # Shop category list
│   │   │       └── countries.tsx         # Country list
│   │   ├── public/                       # Static public assets
│   │   └── .next/                        # Next.js build cache
│   │
│   └── auth-service-e2e/                 # End-to-end tests for auth service
│
├── packages/                             # ─── Shared Libraries ───
│   ├── components/
│   │   └── input/
│   │       └── index.tsx                 # Shared Input component
│   ├── error-handler/
│   │   ├── index.ts                      # ★ Error class hierarchy
│   │   └── error-middleware.ts           # Express error middleware
│   ├── libs/
│   │   ├── prisma/
│   │   │   └── index.ts                  # PrismaClient singleton
│   │   └── redis/
│   │       └── index.ts                  # ioredis singleton
│   └── middleware/
│       ├── isAuthenticated.ts            # ★ JWT verification middleware
│       └── authorizeRoles.ts             # Role guard middleware
│
├── docs/                                 # Project documentation (existing)
├── tech-docs/                            # ★ Technical documentation (this folder)
├── tmp/                                  # Temporary build artifacts
└── node_modules/                         # Dependencies (not committed)
```

**Legend:**  
★ = Key files that contain critical business logic

---

## 2. Key File Quick Reference

| File | Lines | Purpose |
|------|-------|---------|
| `apps/auth-service/src/controller/auth.controller.ts` | 542 | All authentication handlers |
| `apps/auth-service/src/utils/auth.helper.ts` | 171 | OTP logic, validation, forgot password |
| `apps/auth-service/src/main.ts` | 41 | Auth service Express setup |
| `apps/api-gateway/src/main.ts` | 50 | Gateway with CORS, proxy, rate limit |
| `packages/error-handler/index.ts` | 61 | 6 custom error classes |
| `packages/middleware/isAuthenticated.ts` | 63 | JWT verification |
| `apps/user-ui/src/utils/axiosInstance.ts` | 74 | Token refresh interceptor |
| `apps/seller-ui/src/shared/components/sidebar/sidebar.tsx` | 210 | Full seller dashboard sidebar |
| `prisma/schema.prisma` | 75 | All database models |

---

*Next: [Configuration Reference](./09-CONFIGURATION.md)*
