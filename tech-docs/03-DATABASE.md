# 03 — Database & Schema Reference

> **Audience:** All Engineers  
> **Prerequisites:** Basic understanding of MongoDB and ORMs  
> **Related Docs:** [Architecture](./01-ARCHITECTURE.md) · [API Reference](./04-API-REFERENCE.md)

---

## 1. Database Overview

| Property | Value |
|----------|-------|
| Database Engine | MongoDB |
| Hosting | MongoDB Atlas (cloud) |
| ORM | Prisma v6.19.0 |
| Connection | Via `DATABASE_URL` env var (MongoDB connection string) |
| Schema Location | `prisma/schema.prisma` |
| Config Location | `prisma.config.ts` |
| Client Singleton | `packages/libs/prisma/index.ts` |

### Prisma Client Singleton Pattern

```typescript
// packages/libs/prisma/index.ts
import { PrismaClient } from "@prisma/client";

declare global {
  namespace globalThis {
    var prismadb: PrismaClient;
  }
}

const prisma = new PrismaClient();

// Prevent multiple instances in production
if (process.env.NODE_ENV === "production") global.prismadb = prisma;

export default prisma;
```

> **Note:** In development, Nx's hot-reloading may create multiple PrismaClient instances. The global pattern prevents connection pool exhaustion in production.

---

## 2. Entity-Relationship Diagram (ERD)

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      users       │       │     sellers       │       │      shops       │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ _id    ObjectId  │       │ _id    ObjectId  │       │ _id    ObjectId  │
│ name   String    │       │ name   String    │       │ name   String    │
│ email  String ◄──┼──┐    │ email  String    │  1:1  │ bio    String?   │
│ password String? │  │    │ phone  String    │◄─────►│ category String  │
│ following []     │  │    │ country String   │       │ address  String? │
│ createdAt Date   │  │    │ password String  │       │ opening  String? │
│ updatedAt Date   │  │    │ stripeId String? │       │ website  String? │
└─────────┬────────┘  │    │ createdAt Date   │       │ socialLinks Json[]│
          │           │    │ updatedAt Date   │       │ ratings  Float   │
          │           │    └──────────────────┘       │ coverBanner Str? │
          │  1:1      │                               │ sellerId ObjId?  │
          ▼           │                               │ createdAt Date   │
┌──────────────────┐  │                               │ updatedAt Date   │
│     images       │  │                               └────────┬─────────┘
├──────────────────┤  │                                        │
│ _id    ObjectId  │  │                                        │
│ file_id String   │  │         ┌──────────────────┐           │
│ url    String    │  │         │   ShopReviews     │           │
│ userId ObjectId? │──┘         ├──────────────────┤           │
│ shopId ObjectId? │──────┐     │ _id    ObjectId  │           │
└──────────────────┘      │     │ userId ObjectId  │───────────┘
                          │     │ rating Float     │    1:N
                          │     │ reviews String?  │
                          └────►│ shopsId ObjectId?│
                                │ createdAt Date   │
                                │ updatedAt Date   │
                                └──────────────────┘
```

---

## 3. Model Reference

### 3.1 `users`

The core customer entity.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | `@id @default(auto()) @db.ObjectId` | Primary key (MongoDB ObjectId) |
| `name` | `String` | Required | User's display name |
| `email` | `String` | `@unique`, Required | Login identifier |
| `password` | `String?` | Optional | Bcrypt-hashed (10 rounds). Nullable for future OAuth |
| `following` | `String[]` | Default: `[]` | Array of followed shop/user IDs |
| `avatar` | `images?` | Optional, 1:1 relation | Profile picture |
| `reviews` | `ShopReviews[]` | 1:N relation | Reviews written by this user |
| `createdAt` | `DateTime` | `@default(now())` | Auto-set on creation |
| `updatedAt` | `DateTime` | `@updatedAt` | Auto-updated on modification |

### 3.2 `sellers`

The merchant/vendor entity.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | `@id @default(auto()) @db.ObjectId` | Primary key |
| `name` | `String` | Required | Seller's display name |
| `email` | `String` | `@unique`, Required | Login identifier |
| `phone_number` | `String` | Required | Contact number |
| `country` | `String` | Required | Seller's country |
| `password` | `String` | Required | Bcrypt-hashed (10 rounds) |
| `stripeId` | `String?` | Optional | Stripe Connect account ID |
| `shop` | `shops?` | Optional, 1:1 relation | The seller's shop |
| `createdAt` | `DateTime` | `@default(now())` | Auto-set on creation |
| `updatedAt` | `DateTime` | `@updatedAt` | Auto-updated on modification |

### 3.3 `shops`

The storefront entity — each seller has at most one shop.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | `@id @default(auto()) @db.ObjectId` | Primary key |
| `name` | `String` | Required | Shop display name |
| `bio` | `String?` | Optional | Short description (max 100 words enforced in UI) |
| `category` | `String` | Required | Business category (e.g., "Electronics") |
| `avatar` | `images?` | Optional, 1:1 relation | Shop logo |
| `coverBanner` | `String?` | Optional | Banner image URL |
| `address` | `String?` | Optional | Physical location |
| `opening_hours` | `String?` | Optional | Business hours text |
| `website` | `String?` | Optional | Shop website URL |
| `socialLinks` | `Json[]` | Default: `[]` | Array of social media objects |
| `ratings` | `Float` | `@default(0)` | Aggregate rating (0-5) |
| `reviews` | `ShopReviews[]` | 1:N relation | Reviews for this shop |
| `sellerId` | `String?` | `@unique @db.ObjectId` | FK to sellers |
| `sellers` | `sellers?` | Optional, 1:1 relation | Owner reference |
| `createdAt` | `DateTime` | `@default(now())` | Auto-set on creation |
| `updatedAt` | `DateTime` | `@updatedAt` | Auto-updated on modification |

### 3.4 `ShopReviews`

User reviews for shops.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | `@id @default(auto()) @db.ObjectId` | Primary key |
| `userId` | `String` | `@db.ObjectId`, Required | FK to users |
| `user` | `users` | 1:1 relation | Review author |
| `rating` | `Float` | Required | Numeric rating |
| `reviews` | `String?` | Optional | Review text body |
| `shopsId` | `String?` | `@db.ObjectId`, Optional | FK to shops |
| `shops` | `shops?` | Optional relation | Reviewed shop |
| `createdAt` | `DateTime` | `@default(now())` | Auto-set on creation |
| `updatedAt` | `DateTime` | `@updatedAt` | Auto-updated on modification |

### 3.5 `images`

Polymorphic image storage linked to users or shops.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | `@id @default(auto()) @db.ObjectId` | Primary key |
| `file_id` | `String` | Required | External file storage ID |
| `url` | `String` | Required | Image URL |
| `userId` | `String?` | `@unique @db.ObjectId` | FK to users (1:1) |
| `shopId` | `String?` | `@unique @db.ObjectId` | FK to shops (1:1) |
| `users` | `users?` | Optional relation | Linked user |
| `shops` | `shops?` | Optional relation | Linked shop |

---

## 4. Relationship Map

| Relationship | Type | From | To | FK Field |
|-------------|------|------|----|----------|
| User → Avatar | 1:1 | `users` | `images` | `images.userId` |
| Shop → Avatar | 1:1 | `shops` | `images` | `images.shopId` |
| Seller → Shop | 1:1 | `sellers` | `shops` | `shops.sellerId` |
| User → Reviews | 1:N | `users` | `ShopReviews` | `ShopReviews.userId` |
| Shop → Reviews | 1:N | `shops` | `ShopReviews` | `ShopReviews.shopsId` |

### Cascade Behavior
Prisma with MongoDB does **not** support referential actions (`onDelete`, `onUpdate`) at the database level. Cascading deletes must be handled **in application code**.

---

## 5. Indexes

### Implicit Indexes (Auto-created by Prisma)

| Model | Field | Type | Created By |
|-------|-------|------|-----------|
| `users` | `email` | Unique | `@unique` |
| `sellers` | `email` | Unique | `@unique` |
| `images` | `userId` | Unique | `@unique` |
| `images` | `shopId` | Unique | `@unique` |
| `shops` | `sellerId` | Unique | `@unique` |

All `@id` fields automatically have primary key indexes via `_id` in MongoDB.

---

## 6. Common Query Patterns

### Find User by Email (Login)
```typescript
const user = await prisma.users.findUnique({ where: { email } });
```

### Find Seller with Shop (Auth Check)
```typescript
const seller = await prisma.sellers.findUnique({
  where: { id: decoded.id },
  include: { shop: true },
});
```

### Create User (Registration)
```typescript
await prisma.users.create({
  data: { name, email, password: hashedPassword },
});
```

### Create Shop (Seller Onboarding)
```typescript
await prisma.shops.create({
  data: { name, bio, address, opening_hours, category, sellerId },
});
```

### Update Seller Stripe ID
```typescript
await prisma.sellers.update({
  where: { id: sellerId },
  data: { stripeId: account.id },
});
```

---

## 7. Database Configuration

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
```

### Prisma Config (`prisma.config.ts`)
```typescript
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### Key Commands

| Command | Purpose |
|---------|---------|
| `npx prisma generate` | Regenerate Prisma Client from schema |
| `npx prisma db push` | Push schema changes to MongoDB (no migration files) |
| `npx prisma studio` | Open visual database browser |
| `npx prisma format` | Format schema file |

> **Note:** MongoDB with Prisma uses `db push` instead of migrations for schema changes. The `migrations` config is present but not actively used with MongoDB.

---

*Next: [API Reference](./04-API-REFERENCE.md)*
