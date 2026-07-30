# 12 — Design Patterns

> **Audience:** Mid → Senior Engineers  
> **Prerequisites:** [Architecture](./01-ARCHITECTURE.md) · [Shared Packages](./07-SHARED-PACKAGES.md)

---

## 1. Patterns Catalog

| # | Pattern | Where Used | Purpose |
|---|---------|-----------|---------|
| 1 | API Gateway / Reverse Proxy | `api-gateway` | Single entry point, cross-cutting concerns |
| 2 | Singleton | `libs/prisma`, `libs/redis` | Shared resource instances |
| 3 | Error Hierarchy | `error-handler` | Typed, structured error handling |
| 4 | Middleware Chain | Express pipeline | Separation of cross-cutting concerns |
| 5 | Interceptor / Retry | Axios interceptor | Transparent token refresh |
| 6 | Repository (implicit) | Prisma usage in controllers | Data access abstraction |
| 7 | Factory | Error classes | Create domain-specific error objects |
| 8 | Observer / Queue | Token refresh subscribers | Coordinate concurrent refreshes |
| 9 | Module / Package | `packages/` | Code sharing across apps |
| 10 | Atomic State | Jotai atoms | Bottom-up client state management |

---

## 2. Pattern Details

### 2.1 API Gateway Pattern

**Category:** Structural / Microservices  
**Location:** `apps/api-gateway/src/main.ts`

**What:** A single entry point that routes all client requests to backend services, applying cross-cutting concerns (CORS, rate limiting, logging) at the edge.

**Implementation:**
```typescript
// Cross-cutting concerns applied once
app.use(cors({ origin, credentials }));
app.use(morgan('dev'));
app.use(limiter);
app.use(cookieParser());

// Route everything to auth service
app.use("/", proxy("http://127.0.0.1:6001"));
```

**Benefits:**
- Clients only know one URL
- Security policies applied uniformly
- Easy to add new backend services behind the proxy
- Rate limiting happens before reaching business logic

---

### 2.2 Singleton Pattern

**Category:** Creational  
**Location:** `packages/libs/prisma/index.ts`, `packages/libs/redis/index.ts`

**What:** Ensures only one instance of expensive resources (database connections, cache clients) exists throughout the application lifecycle.

**Implementation (Prisma):**
```typescript
const prisma = new PrismaClient();
if (process.env.NODE_ENV === "production") global.prismadb = prisma;
export default prisma;
```

**Why:** MongoDB connection pools are expensive. Multiple PrismaClient instances lead to connection exhaustion. The global pattern survives hot module replacement in development.

---

### 2.3 Error Hierarchy Pattern

**Category:** Behavioral  
**Location:** `packages/error-handler/index.ts`

**What:** A class hierarchy where each error type carries its own HTTP status code and semantics, enabling the error middleware to handle all errors uniformly.

```
AppError (base: statusCode, isOperational, details)
├── NotFoundError (404)
├── ValidationError (400)
├── AuthError (401)
├── ForbiddenError (403)
├── DatabaseError (500)
└── RateLimitError (429)
```

**Benefits:**
- Controllers `throw` without worrying about response formatting
- Error middleware produces consistent API responses
- `isOperational` flag distinguishes expected errors from bugs
- Extensible — new error types just extend `AppError`

---

### 2.4 Middleware Chain Pattern

**Category:** Behavioral / Pipeline  
**Location:** Express middleware stack, route middleware

**What:** A chain of responsibility where each middleware function processes the request and either handles it or passes to the next handler.

**Example (Protected Seller Route):**
```typescript
router.get('/logged-in-seller', isAuthenticated, isSeller, getSeller);
//                                    ↓              ↓          ↓
//                              Verify JWT     Check role   Handle request
```

**Pipeline:**
```
Request → isAuthenticated → isSeller → Controller → Response
              │                 │
              └── 401 ──────────└── 403 (short-circuit)
```

---

### 2.5 Interceptor Pattern (Axios)

**Category:** Behavioral  
**Location:** `apps/*/src/utils/axiosInstance.ts`

**What:** Transparently intercepts HTTP responses and handles 401 errors by refreshing the JWT token, then retrying the original request — completely invisible to the calling code.

**Key Techniques:**
1. **`_retry` flag:** Prevents infinite retry loops
2. **Subscriber queue:** Multiple concurrent 401s share one refresh
3. **Automatic replay:** Original requests are replayed with new token

```typescript
axiosInstance.interceptors.response.use(
  (response) => response,     // Pass through success
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Refresh and retry logic
    }
    return Promise.reject(error);
  }
);
```

---

### 2.6 Observer / Queue Pattern (Token Refresh)

**Category:** Behavioral  
**Location:** `apps/*/src/utils/axiosInstance.ts`

**What:** When multiple API calls fail with 401 simultaneously, only one refresh request is made. Other failed requests subscribe to a callback queue and are replayed once the refresh succeeds.

```typescript
let refreshSubscribers: (() => void)[] = [];

const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};
```

**This prevents the "thundering herd" problem** where 10 parallel 401s would trigger 10 refresh requests.

---

### 2.7 Atomic State Pattern (Jotai)

**Category:** State Management  
**Location:** `apps/seller-ui/src/configs/constants.tsx`

**What:** Instead of a top-down global store (Redux), state is managed as independent atoms that components subscribe to individually.

```typescript
// Define atom
export const activeSideBarItem = atom<string>("/dashboard");

// Use atom (only re-renders components that use it)
const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem);
```

**Benefits over Redux:**
- No boilerplate (reducers, actions, selectors)
- Granular re-renders (only subscribed components update)
- TypeScript-first API
- Works naturally with React's component model

---

## 3. Anti-Patterns to Avoid

| Anti-Pattern | Current Risk | Mitigation |
|-------------|-------------|------------|
| **God Controller** | `auth.controller.ts` (542 lines) | Split into `user.controller.ts`, `seller.controller.ts`, `shop.controller.ts` |
| **Implicit Dependencies** | `req.seller`, `req.role` attached dynamically | Define typed Request interfaces |
| **Missing Input Validation** | Manual checks per endpoint | Use Zod/Joi schema validation |
| **Hardcoded URLs** | `proxy("http://127.0.0.1:6001")` | Use environment variables |
| **Mixed Concerns** | Auth controller handles Stripe | Separate into `payment.controller.ts` |
| **`any` Types** | `req: any` in handlers | Use typed Request generics |

---

## 4. Recommended Refactoring Patterns

### Controller → Service → Repository

```
Current:
  Route → Controller (validation + business logic + DB queries)

Recommended:
  Route → Controller (input/output) → Service (business logic) → Repository (data access)
```

### Typed Request Objects

```typescript
// Instead of req: any
interface AuthenticatedRequest extends Request {
  role: "user" | "seller";
  seller?: SellerWithShop;
  user?: User;
}
```

---

*Next: [Performance & Scalability](./13-PERFORMANCE.md)*
