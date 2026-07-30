# 04 — API Reference

> **Audience:** All Engineers  
> **Prerequisites:** [Architecture](./01-ARCHITECTURE.md) · [Auth & Security](./05-AUTH-SECURITY.md)  
> **Live Docs:** Swagger UI at `http://localhost:6001/api-docs`

---

## 1. API Overview

| Property | Value |
|----------|-------|
| Base URL (Gateway) | `http://localhost:8080/api` |
| Base URL (Direct) | `http://localhost:6001/api` |
| Protocol | HTTP (HTTPS in production) |
| Content Type | `application/json` |
| Authentication | JWT via HttpOnly cookies |
| Rate Limit | 100 req/15min (anonymous) · 1000 req/15min (authenticated) |
| Max Body Size | 100MB |

### Response Envelope

**Success:**
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Human-readable error description",
  "details": { }
}
```

---

## 2. Authentication Endpoints

### 2.1 User Registration

Initiates user registration by sending an OTP to the provided email.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/user-registration` |
| **Auth Required** | No |
| **Rate Limited** | Yes (OTP cooldown: 60s, max 2/hour) |

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `name` — Required, non-empty string
- `email` — Required, must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `password` — Required, non-empty string

**Success Response (200):**
```json
{
  "message": "OTP sent to email. Please verify your account."
}
```

**Error Responses:**

| Status | Condition | Message |
|--------|-----------|---------|
| 400 | Email already exists | `"User already exists with this email"` |
| 400 | Missing required fields | `"Missing required fields!"` |
| 400 | Invalid email format | `"Invalid email!"` |
| 400 | OTP cooldown active | `"Please wait 60 seconds before requesting another OTP."` |
| 400 | Spam locked | `"Too many OTP requests! Please wait 1hour before requesting again."` |
| 400 | Account locked | `"Account locked due to multiple failed attempts! Try again after 30 minutes!"` |

---

### 2.2 Verify User (OTP)

Completes user registration after OTP verification.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/verify-user` |
| **Auth Required** | No |

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "otp": "1234",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully!"
}
```

**Error Responses:**

| Status | Condition | Message |
|--------|-----------|---------|
| 400 | Missing fields | `"All fields are required!"` |
| 400 | Email exists | `"User already exists with this email"` |
| 400 | Invalid/expired OTP | `"OTP expired or invalid!"` |
| 400 | Wrong OTP (attempts remaining) | `"Invalid OTP! You have N attempts left."` |
| 400 | Too many failures | `"Account locked due to multiple failed attempts!"` |

---

### 2.3 User Login

Authenticates a user and sets JWT cookies.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/login-user` |
| **Auth Required** | No |

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully!",
  "user": {
    "id": "667a...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Cookies Set:**
| Cookie Name | Value | TTL | HttpOnly |
|------------|-------|-----|----------|
| `accessToken` | JWT | 15min | Yes |
| `refreshToken` | JWT | 7 days | Yes |

**Cookies Cleared:**
- `seller-refresh-token`
- `seller-access-token`

**Error Responses:**

| Status | Condition | Message |
|--------|-----------|---------|
| 400 | Missing fields | `"Email and password are required"` |
| 400 | User not found | `"User doesn't exist with this email"` |
| 401 | Wrong password | `"Invalid credentials"` |

---

### 2.4 Refresh Token

Generates a new access token using the refresh token cookie.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/refresh-token` |
| **Auth Required** | Refresh token cookie |

**Request Body:** Empty `{}`

**Success Response (201):**
```json
{
  "success": true
}
```

**Cookies Set:** New `accessToken` or `seller-access-token` (based on role)

**Error Responses:**

| Status | Condition | Message |
|--------|-----------|---------|
| 400 | No refresh token | `"Unauthenticated! No refresh token provided."` |
| 401 | Invalid token | `"Forbidden! Invalid refresh token."` |
| 401 | Account not found | `"Forbidden! User/Seller not found."` |

---

### 2.5 Get Logged-In User

Returns the currently authenticated user's profile.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/logged-in-user` |
| **Auth Required** | Yes (`isAuthenticated`) |

**Success Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "667a...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 2.6 Forgot Password (User)

Sends an OTP for password reset.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/forgot-password-user` |
| **Auth Required** | No |

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "OTP send to email. Please verify your account!"
}
```

---

### 2.7 Verify Forgot Password OTP

Verifies the OTP sent for password reset.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/verify-forgot-password-user` |
| **Auth Required** | No |

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "1234"
}
```

**Success Response (200):**
```json
{
  "message": "OTP verified! You can now reset password."
}
```

---

### 2.8 Reset Password (User)

Sets a new password after OTP verification.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/reset-password-user` |
| **Auth Required** | No |

**Request Body:**
```json
{
  "email": "john@example.com",
  "newPassword": "newSecurePassword456"
}
```

**Validation:**
- New password must differ from current password

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully!"
}
```

---

## 3. Seller Endpoints

### 3.1 Seller Registration

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/seller-registration` |
| **Auth Required** | No |

**Request Body:**
```json
{
  "name": "Jane Seller",
  "email": "jane@shop.com",
  "password": "sellerPass123",
  "phone_number": "+447911123456",
  "country": "United Kingdom"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent to email. Please verify your account."
}
```

---

### 3.2 Verify Seller (OTP)

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/verify-seller` |
| **Auth Required** | No |

**Request Body:**
```json
{
  "name": "Jane Seller",
  "email": "jane@shop.com",
  "otp": "5678",
  "password": "sellerPass123",
  "phone_number": "+447911123456",
  "country": "United Kingdom"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "seller": { "id": "...", "name": "...", "email": "..." },
  "message": "Seller registered successfully!"
}
```

---

### 3.3 Seller Login

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/login-seller` |
| **Auth Required** | No |

**Request Body:**
```json
{
  "email": "jane@shop.com",
  "password": "sellerPass123"
}
```

**Cookies Set:**
- `seller-access-token` (15min)
- `seller-refresh-token` (7 days)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully!",
  "seller": {
    "id": "...",
    "name": "Jane Seller",
    "email": "jane@shop.com"
  }
}
```

---

### 3.4 Get Logged-In Seller

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/logged-in-seller` |
| **Auth Required** | Yes (`isAuthenticated` + `isSeller`) |

**Success Response (201):**
```json
{
  "success": true,
  "seller": {
    "id": "...",
    "name": "Jane Seller",
    "email": "jane@shop.com",
    "shop": { "id": "...", "name": "Jane's Boutique", "..." }
  }
}
```

---

## 4. Shop Endpoints

### 4.1 Create Shop

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/create-shop` |
| **Auth Required** | No (should be protected — see notes) |

**Request Body:**
```json
{
  "name": "Jane's Boutique",
  "bio": "Premium fashion and accessories",
  "address": "123 High Street, London",
  "opening_hours": "Mon-Sat 9:00-18:00",
  "website": "https://janes-boutique.com",
  "category": "Fashion & Apparel",
  "sellerId": "667a..."
}
```

**Required Fields:** `name`, `bio`, `address`, `opening_hours`, `category`, `sellerId`  
**Optional Fields:** `website` (only included if non-empty)

**Success Response (201):**
```json
{
  "success": true,
  "shop": { "id": "...", "name": "Jane's Boutique", "..." },
  "message": "Shop created successfully!"
}
```

---

### 4.2 Create Stripe Connect Link

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/create-stripe-link` |
| **Auth Required** | No (should be protected — see notes) |

**Request Body:**
```json
{
  "sellerId": "667a..."
}
```

**Success Response (200):**
```json
{
  "url": "https://connect.stripe.com/setup/e/acct_xxx/..."
}
```

The client should redirect the seller to this URL.

**Error Responses:**

| Status | Condition | Message |
|--------|-----------|---------|
| 400 | Missing sellerId | `"Seller ID is required!"` |
| 400 | Invalid ObjectId | `"Invalid Seller ID format!"` |
| 400 | Seller not found | `"Seller not found!"` |
| 500 | Stripe API error | Stripe error message forwarded |

---

## 5. Gateway Endpoints

### 5.1 Health Check

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/gateway-health` |
| **Auth Required** | No |

**Response (200):**
```json
{
  "message": "Welcome to api-gateway!"
}
```

---

## 6. Middleware Chain Reference

### Route → Middleware Mapping

| Route | Middlewares |
|-------|-----------|
| `POST /api/user-registration` | None |
| `POST /api/verify-user` | None |
| `POST /api/login-user` | None |
| `POST /api/refresh-token` | None |
| `GET /api/logged-in-user` | `isAuthenticated` |
| `POST /api/forgot-password-user` | None |
| `POST /api/verify-forgot-password-user` | None |
| `POST /api/reset-password-user` | None |
| `POST /api/seller-registration` | None |
| `POST /api/verify-seller` | None |
| `POST /api/create-shop` | None |
| `POST /api/create-stripe-link` | None |
| `POST /api/login-seller` | None |
| `GET /api/logged-in-seller` | `isAuthenticated` → `isSeller` |

---

## 7. Swagger / OpenAPI

Auto-generated Swagger documentation is available at:

- **Swagger UI:** `http://localhost:6001/api-docs`
- **JSON Spec:** `http://localhost:6001/docs-json`

### Regenerating Swagger Docs

```bash
npm run auth-docs
# or
node apps/auth-service/src/swagger.js
```

This scans `auth.router.ts` and generates `swagger-output.json`.

---

*Next: [Authentication & Security](./05-AUTH-SECURITY.md)*
