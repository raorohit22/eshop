# 06 — Frontend Architecture

> **Audience:** Frontend Engineers  
> **Prerequisites:** [Architecture](./01-ARCHITECTURE.md) · [API Reference](./04-API-REFERENCE.md)  
> **Related Docs:** [Shared Packages](./07-SHARED-PACKAGES.md)

---

## 1. Frontend Overview

The platform has **two independent Next.js applications**, each serving a distinct user persona:

| App | Directory | Port | Framework | Target Audience |
|-----|-----------|------|-----------|----------------|
| **User UI** | `apps/user-ui/` | 3000 | Next.js 16 (App Router) | Customers / Shoppers |
| **Seller UI** | `apps/seller-ui/` | 3001 | Next.js 16 (App Router) | Merchants / Vendors |

Both apps share:
- TanStack React Query for server state
- Axios with interceptor-based token refresh
- Tailwind CSS for styling
- Shared components from `packages/components/`

---

## 2. User UI Architecture

### 2.1 Directory Structure

```
apps/user-ui/src/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout (fonts, providers, header)
│   ├── page.tsx                 # Home page (/)
│   ├── providers.tsx            # React Query provider
│   ├── global.css               # Global styles + Tailwind
│   ├── (routes)/                # Route groups
│   │   ├── login/page.tsx       # /login
│   │   ├── signup/page.tsx      # /signup
│   │   └── forgot-password/page.tsx  # /forgot-password
│   ├── shared/
│   │   └── widgets/             # Layout widgets
│   │       ├── index.ts         # Re-exports Header
│   │       ├── header.tsx       # Main header with search, nav
│   │       ├── header-bottom.tsx # Navigation bar below header
│   │       └── components/      # Header sub-components
│   └── api/                     # Next.js API routes (if any)
├── assets/                      # SVGs and static assets
├── configs/
│   ├── constants.tsx            # Navigation items
│   └── global.d.ts              # Global TypeScript types
├── hooks/
│   └── useUser.ts               # User session hook
└── utils/
    └── axiosInstance.ts          # Axios with token refresh
```

### 2.2 Root Layout

```typescript
// apps/user-ui/src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${poppins.variable}`}>
        <Providers>
          <Header />       {/* Persistent header */}
          {children}       {/* Page content */}
        </Providers>
      </body>
    </html>
  );
}
```

**Fonts:**
- **Roboto** — Primary text font (`--font-roboto`)
- **Poppins** — Accent/heading font (`--font-poppins`)

### 2.3 Navigation Structure

| Title | Route | Description |
|-------|-------|-------------|
| Home | `/` | Landing page |
| Products | `/products` | Product catalog |
| Shops | `/shops` | Shop directory |
| Offers | `/offers` | Deals and promotions |
| Become a Seller | `/become-seller` | Seller recruitment |
| Login | `/login` | User authentication |
| Signup | `/signup` | User registration |
| Forgot Password | `/forgot-password` | Password recovery |

### 2.4 Header Component

The header has three sections:

```
┌─────────────────────────────────────────────────────────┐
│  [Eshop Logo]  │  [────── Search Bar ──────] [🔍]  │  [👤 Hello, User]  │ [♥ 0] [🛒 9] │
├─────────────────────────────────────────────────────────┤
│  Home   Products   Shops   Offers   Become a Seller     │ ← HeaderBottom
└─────────────────────────────────────────────────────────┘
```

**Conditional rendering:**
- If `user` exists → Show greeting with name + profile link
- If loading → Show "..."
- If not authenticated → Show "Sign In" link

### 2.5 State Management

#### Server State: TanStack React Query

```typescript
// hooks/useUser.ts
const useUser = () => {
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,        // GET /api/logged-in-user
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,                  // Retry once on failure
  });
  return { user, isLoading, isError, refetch };
};
```

**Query Provider:**
```typescript
// providers.tsx
const Providers = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

---

## 3. Seller UI Architecture

### 3.1 Directory Structure

```
apps/seller-ui/src/
├── app/
│   ├── layout.tsx               # Root layout (font, providers)
│   ├── page.tsx                 # Landing page
│   ├── providers.tsx            # React Query provider
│   ├── global.css               # Global styles + Tailwind
│   ├── assets/
│   │   ├── svgs/                # SVG components (logo)
│   │   └── icons/               # Icon components (home, payment)
│   ├── (routes)/
│   │   ├── login/page.tsx       # /login (seller auth)
│   │   ├── signup/page.tsx      # /signup (seller registration)
│   │   ├── success/             # /success (Stripe callback)
│   │   └── dashboard/
│   │       ├── layout.tsx       # Dashboard layout (sidebar + main)
│   │       ├── page.tsx         # /dashboard (main dashboard)
│   │       └── create-product/  # /dashboard/create-product
│   └── api/                     # Next.js API routes
├── configs/
│   └── constants.tsx            # Jotai atoms (activeSideBarItem)
├── hooks/
│   ├── useSeller.tsx            # Seller session hook
│   └── useSidebar.tsx           # Sidebar state hook
├── shared/
│   ├── components/
│   │   ├── box/                 # Styled Box component
│   │   ├── image-placeholder/   # Image placeholder
│   │   └── sidebar/             # Sidebar components
│   │       ├── sidebar.tsx      # Main sidebar wrapper
│   │       ├── sidebar.item.tsx # Individual menu item
│   │       ├── sidebar.menu.tsx # Menu section grouping
│   │       └── sidebar.styles.tsx # Styled-components styles
│   └── modules/
│       └── auth/
│           └── create-shop.tsx  # Shop creation form
└── utils/
    ├── axiosInstance.ts          # Axios with token refresh
    ├── categories.tsx            # Shop category options
    └── countries.tsx             # Country list for registration
```

### 3.2 Dashboard Layout

The dashboard uses a **sidebar + content** layout:

```
┌─────────────────────────────────────────────────────────┐
│  ┌──── Sidebar (280px) ────┐  ┌── Main Content ───────┐ │
│  │ [Logo] Shop Name        │  │                        │ │
│  │ Shop Address             │  │                        │ │
│  │                          │  │                        │ │
│  │ 🏠 Dashboard             │  │   Page Content         │ │
│  │                          │  │                        │ │
│  │ ── Main Menu ──          │  │                        │ │
│  │ 📋 Orders                │  │                        │ │
│  │ 💳 Payments              │  │                        │ │
│  │                          │  │                        │ │
│  │ ── Products ──           │  │                        │ │
│  │ ➕ Create Products       │  │                        │ │
│  │ 📦 All Products          │  │                        │ │
│  │                          │  │                        │ │
│  │ ── Events ──             │  │                        │ │
│  │ 📅 Create Event          │  │                        │ │
│  │ 🔔 All Events            │  │                        │ │
│  │                          │  │                        │ │
│  │ ── Controllers ──        │  │                        │ │
│  │ 📧 Inbox                 │  │                        │ │
│  │ ⚙️ Settings              │  │                        │ │
│  │ 🔔 Notifications         │  │                        │ │
│  │                          │  │                        │ │
│  │ ── Extras ──             │  │                        │ │
│  │ 🏷️ Discount Codes        │  │                        │ │
│  │ 🚪 Logout                │  │                        │ │
│  └──────────────────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3.3 State Management

#### Server State: TanStack React Query

```typescript
// hooks/useSeller.tsx
const useSeller = () => {
  const { data: seller, isLoading, isError, refetch } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,       // GET /api/logged-in-seller
    staleTime: 5 * 60 * 1000,  // 5 minutes
    retry: 1,
  });
  return { seller, isLoading, isError, refetch };
};
```

#### Client State: Jotai Atoms

```typescript
// configs/constants.tsx
export const activeSideBarItem = atom<string>("/dashboard");

// hooks/useSidebar.tsx
const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem);
  return { activeSidebar, setActiveSidebar };
};
```

The sidebar uses this atom to highlight the active menu item and syncs with `pathname` on route change.

#### Mutations: React Query + Axios

```typescript
// Login mutation
const loginMutation = useMutation({
  mutationFn: async (data) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-seller`,
      data,
      { withCredentials: true }
    );
    return response.data;
  },
  onSuccess: () => router.push("/"),
  onError: (error) => setServerError(error.response?.data?.message),
});
```

---

## 4. Axios Interceptor — Silent Token Refresh

Both UIs share identical Axios interceptor logic:

```typescript
// utils/axiosInstance.ts
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,  // Always send cookies
});
```

### Interceptor Flow

```
API Request
    │
    ▼
Response received
    │
    ├── 2xx Success → Return response
    │
    └── 401 Unauthorized
        │
        ├── Already retried (_retry flag)? → Reject
        │
        ├── Another refresh in progress?
        │   └── YES → Queue this request (subscriber pattern)
        │
        └── NO → Start refresh
            │
            ├── POST /api/refresh-token
            │
            ├── Success → Replay original + drain queue
            │
            └── Failure → Redirect to /login
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `_retry` flag | Prevents infinite 401 → refresh loops |
| Subscriber queue | Multiple concurrent 401s share a single refresh |
| Client-side redirect | No server-side redirect for SPAs |
| `withCredentials: true` | Required for cookie-based auth |

---

## 5. Form Handling

Both UIs use **React Hook Form** for form management:

```typescript
const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
```

### Validation Patterns

| Field | Validation | Example |
|-------|-----------|---------|
| Email | Regex pattern | `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/` |
| Password | Min length 6 | `minLength: { value: 6, message: "..." }` |
| Required fields | `required: true` | `required: "Name is required"` |
| URL | Regex pattern | `/^(https?:\/\/)?...$/` |
| Word count | Custom validate | `countWords(value) <= 100` |

---

## 6. Styling Architecture

### Tailwind CSS (Both Apps)

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',  // App source files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### Styled Components (Seller UI Sidebar)

The sidebar uses `styled-components` for complex, stateful styling:

```typescript
// sidebar.styles.tsx
export const Sidebar = {
  Header: styled(/* ... */),
  Body: styled(/* ... */),
};
```

### CSS Strategy

| App | Primary | Secondary | Usage |
|-----|---------|-----------|-------|
| User UI | Tailwind CSS | — | All components |
| Seller UI | Tailwind CSS | Styled Components | Layout + Sidebar |

---

## 7. Environment Configuration

### User UI

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SERVER_URI` | Backend API base URL | `http://localhost:8080` |

### Seller UI

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SERVER_URI` | Backend API base URL | `http://localhost:8080` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe frontend key | `pk_test_...` |

---

## 8. Component Library

### Shared Components (`packages/components/`)

#### `Input` Component

A polymorphic form input that renders either `<input>` or `<textarea>` based on `type`:

```typescript
<Input
  label="Email"
  type="email"
  className="custom-class"
  {...register("email")}
/>
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Input label text |
| `type` | `"text" \| "number" \| "password" \| "email" \| "textarea"` | Input type |
| `className` | `string?` | Additional CSS classes |
| `...rest` | `InputHTMLAttributes \| TextareaHTMLAttributes` | Standard HTML attributes |

**Styling:** Dark theme (gray-700 border, transparent bg, white text)

---

*Next: [Shared Packages](./07-SHARED-PACKAGES.md)*
