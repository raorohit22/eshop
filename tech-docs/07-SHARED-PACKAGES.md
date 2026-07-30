# 07 — Shared Packages

> **Audience:** All Engineers  
> **Prerequisites:** [Architecture](./01-ARCHITECTURE.md)  
> **Related Docs:** [Auth & Security](./05-AUTH-SECURITY.md) · [Design Patterns](./12-DESIGN-PATTERNS.md)

---

## 1. Package Overview

The `packages/` directory contains **cross-cutting** code shared between applications. These are consumed via TypeScript path aliases (`@packages/*`), not published npm packages.

```
packages/
├── components/          # Shared React UI components
│   └── input/
│       └── index.tsx
├── error-handler/       # Custom error class hierarchy + middleware
│   ├── index.ts
│   └── error-middleware.ts
├── libs/                # Infrastructure client singletons
│   ├── prisma/
│   │   └── index.ts
│   └── redis/
│       └── index.ts
└── middleware/           # Express.js auth/authz middleware
    ├── isAuthenticated.ts
    └── authorizeRoles.ts
```

### Import Convention

```typescript
// Path alias configured in tsconfig.base.json
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { AppError, ValidationError } from "@packages/error-handler";
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller, isUser } from "@packages/middleware/authorizeRoles";
import Input from "@packages/components/input";
```

---

## 2. `error-handler` — Error Class Hierarchy

**Location:** `packages/error-handler/`

### 2.1 Error Classes (`index.ts`)

All custom errors extend `AppError`, which extends the native `Error`:

```
Error (built-in)
└── AppError
    ├── statusCode: number
    ├── isOperational: boolean
    ├── details?: any
    │
    ├── NotFoundError       (404)
    ├── ValidationError     (400, details?)
    ├── AuthError           (401)
    ├── ForbiddenError      (403)
    ├── DatabaseError       (500, details?)
    └── RateLimitError      (429)
```

#### Class Reference

| Class | Status Code | Default Message | Use Case |
|-------|-------------|-----------------|----------|
| `AppError` | configurable | — | Base class (rarely used directly) |
| `NotFoundError` | 404 | `"Resource not found"` | Missing entities |
| `ValidationError` | 400 | `"Invalid request data"` | Bad input, duplicate entries |
| `AuthError` | 401 | `"Unauthorized"` | Invalid credentials, missing token |
| `ForbiddenError` | 403 | `"Forbidden access"` | Insufficient permissions |
| `DatabaseError` | 500 | `"Database error"` | Prisma/MongoDB failures |
| `RateLimitError` | 429 | `"Too many requests..."` | Rate limit exceeded |

#### Usage Examples

```typescript
// Throw validation error with custom message
throw new ValidationError("User already exists with this email");

// Throw auth error
throw new AuthError("Invalid credentials");

// Throw with details (e.g., field-level validation)
throw new ValidationError("Invalid request data", {
  fields: { email: "Must be a valid email" }
});

// Pass to Express next()
return next(new AuthError("Forbidden! Access denied: Seller only"));
```

### 2.2 Error Middleware (`error-middleware.ts`)

Express error-handling middleware that catches all errors:

```typescript
export const errorMiddleware = (err, req, res, next) => {
  if (err instanceof AppError) {
    // Operational error — safe to show to client
    console.log(`Error ${req.method} ${req.url} - ${err.message}`);
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Unknown error — hide details from client
  console.log(`Unhandled Error ${err}`);
  return res.status(500).json({
    error: "Something went wrong, please try again later",
  });
};
```

**Registration:** Must be the **last middleware** in the Express pipeline:
```typescript
app.use('/api', router);
app.use(errorMiddleware); // ← Must be last
```

---

## 3. `libs` — Infrastructure Clients

### 3.1 Prisma Client (`libs/prisma/index.ts`)

Singleton PrismaClient instance:

```typescript
import { PrismaClient } from "@prisma/client";

declare global {
  namespace globalThis {
    var prismadb: PrismaClient;
  }
}

const prisma = new PrismaClient();

if (process.env.NODE_ENV === "production") global.prismadb = prisma;

export default prisma;
```

**Why Singleton?**
- Development: Nx hot-reload creates new module instances → new PrismaClient connections
- Production: Global ensures only one connection pool exists
- MongoDB has connection limits; excessive clients cause `MongoServerError: pool is draining`

**Usage:**
```typescript
import prisma from "@packages/libs/prisma";

const user = await prisma.users.findUnique({ where: { email } });
```

### 3.2 Redis Client (`libs/redis/index.ts`)

Singleton ioredis instance:

```typescript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_DATABASE_URI!);

export default redis;
```

**Connection String Format:**
```
rediss://default:<password>@<host>:<port>
```

> The `rediss://` protocol (with double 's') indicates TLS-encrypted Redis (used by managed services like Upstash, Redis Cloud).

**Usage:**
```typescript
import redis from "@packages/libs/redis";

// SET with TTL
await redis.set(`otp:${email}`, otp, "EX", 300);

// GET
const storedOtp = await redis.get(`otp:${email}`);

// DELETE multiple keys
await redis.del(`otp:${email}`, `otp_attempts:${email}`);
```

---

## 4. `middleware` — Express Middleware

### 4.1 `isAuthenticated`

JWT verification middleware that extracts and validates the access token:

**Source:** `packages/middleware/isAuthenticated.ts`

**Flow:**
1. Extract token from cookies (multiple name formats) or `Authorization` header
2. Verify JWT signature using `ACCESS_TOKEN_SECRET`
3. Decode payload: `{ id: string, role: "user" | "seller" }`
4. Fetch account from database based on role
5. Attach `req.role` and optionally `req.seller`

**Route Usage:**
```typescript
router.get('/logged-in-user', isAuthenticated, getUser);
router.get('/logged-in-seller', isAuthenticated, isSeller, getSeller);
```

### 4.2 `authorizeRoles` (isSeller / isUser)

Role-based access control guards:

**Source:** `packages/middleware/authorizeRoles.ts`

```typescript
// Only allow sellers
export const isSeller = (req, res, next) => {
  if (req.role !== "seller") {
    return next(new AuthError("Forbidden! Access denied: Seller only"));
  }
  next();
};

// Only allow users
export const isUser = (req, res, next) => {
  if (req.role !== "user") {
    return next(new AuthError("Forbidden! Access denied: User only"));
  }
  next();
};
```

**Middleware Chain:**
```
isAuthenticated → isSeller → controller
                └→ isUser → controller
```

---

## 5. `components` — Shared React Components

### 5.1 `Input` Component

**Source:** `packages/components/input/index.tsx`

A versatile, forwardRef-compatible form input that supports both `<input>` and `<textarea>` rendering:

```typescript
type Props = {
  label: string;
  type: "text" | "number" | "password" | "email" | "textarea";
  className?: string;
} & (InputHTMLAttributes | TextareaHTMLAttributes);
```

**Features:**
- Forward ref support (works with React Hook Form)
- Polymorphic rendering (`textarea` for `type="textarea"`)
- Dark theme styling (transparent bg, white text, gray-700 borders)
- Label rendering with `htmlFor` association

**Example:**
```tsx
<Input
  label="Shop Bio"
  type="textarea"
  {...register("bio", { required: "Bio is required" })}
/>
```

---

## 6. Path Alias Configuration

Defined in `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@packages/*": ["packages/*"]
    }
  }
}
```

This allows all apps to import from `@packages/` without relative paths.

---

*Next: [Folder Structure & File Reference](./08-FOLDER-STRUCTURE.md)*
