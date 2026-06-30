# PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Technical Implementation - Aplikasi POS UMKM**  
**Version:** 3.0 (Feature-Driven Architecture)  
**Date:** 30 Juni 2026

---

## 1. Executive Summary

**Nama Produk:** POS UMKM  
**Jenis Produk:** Point of Sale berbasis Web untuk UMKM (Responsive: Desktop & Mobile)  
**Target Pengguna:** Admin, Kasir, Customer (Member & Guest)

### 1.1 Project Overview

Aplikasi POS UMKM adalah sistem kasir berbasis web yang memungkinkan pemilik UMKM untuk:
- Mengelola produk dengan upload gambar ke Google Drive
- Melakukan transaksi penjualan tunai di kasir
- Generate laporan penjualan dengan visualisasi
- Manage customer (member) dan user (kasir)
- Customer dapat browse produk dan lihat riwayat transaksi

### 1.2 Tech Stack Final

**Frontend:**
- React 18+ dengan Vite
- Ant Design (UI Framework)
- TypeScript (strict mode, NO `any`)
- Zustand (state management minimal)
- React Router v6
- Axios (HTTP client)

**Backend:**
- Express.js dengan TypeScript (strict mode, NO `any`)
- Prisma ORM
- PostgreSQL
- Zod (validation)
- Winston (logging)
- JWT (jsonwebtoken) + bcrypt
- Multer (file upload)
- Googleapis (Google Drive)
- Nodemailer (email)

**Infrastructure:**
- **Local Development:** Docker Compose
- **Production Primary:** VPS (Railway/DigitalOcean) dengan Docker
- **Production Alternative:** Vercel Serverless Functions
- **Database:** PostgreSQL (di VPS atau managed service)
- **Storage:** Google Drive API (OAuth2)

**Email Service:**
- Resend / Nodemailer (untuk verifikasi email)

### 1.3 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION (VPS - Primary)                   │
│                   Railway / DigitalOcean / Hetzner              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                    Nginx (Reverse Proxy)                │   │
│  │                    SSL/TLS (Let's Encrypt)              │   │
│  └───────────────────┬────────────────────┬───────────────┘   │
│                      │                    │                    │
│          ┌───────────▼─────────┐  ┌──────▼──────────┐        │
│          │  Frontend Container │  │ Backend Container│        │
│          │  (React + Vite)     │  │ (Express + TS)   │        │
│          │  Served by Nginx    │  │ PM2 Process Mgr  │        │
│          └─────────────────────┘  └──────┬───────────┘        │
│                                           │                     │
│                                           ▼                     │
│                          ┌────────────────────────────┐        │
│                          │  PostgreSQL                │        │
│                          │  (Same VPS or Managed)     │        │
│                          └────────────────────────────┘        │
│                                           │                     │
│                                           ▼                     │
│                          ┌────────────────────────────┐        │
│                          │  Google Drive API          │        │
│                          │  (Image Storage)           │        │
│                          └────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   LOCAL DEVELOPMENT (Docker)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐    │
│  │  Frontend      │  │  Backend       │  │  PostgreSQL  │    │
│  │  Container     │  │  Container     │  │  (Host)      │    │
│  │  :5173         │──│  :3000         │──│  :5432       │    │
│  └────────────────┘  └────────────────┘  └──────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│            ALTERNATIVE: Vercel Serverless (Optional)            │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (CDN) → /api/* (Serverless Functions) → Neon DB      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 Key Architectural Decisions

**✅ Feature-Driven Structure:**
- Semua file terkait satu feature dalam satu folder
- Easier navigation, scalability, dan team collaboration
- Inspired by modern best practices (2024-2026)

**✅ Dot Notation Naming:**
- Format: `feature.type.ts` (e.g., `auth.service.ts`, `products.controller.ts`)
- Lebih clean dan consistent

**✅ VPS-First Deployment:**
- No cold start (always running)
- No timeout limits
- Full control & cheaper untuk long-term
- Support Vercel sebagai alternative

---

## 2. Database Schema (Prisma)

### 2.1 Prisma Schema

**File:** `packages/backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  CASHIER
}

// ==================== USERS (Admin & Kasir) ====================
model User {
  id           String        @id @default(uuid())
  username     String        @unique
  passwordHash String        @map("password_hash")
  fullName     String        @map("full_name")
  role         Role
  isActive     Boolean       @default(true) @map("is_active")
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  
  transactions Transaction[]
  
  @@map("users")
}

// ==================== CUSTOMERS (Member) ====================
model Customer {
  id                String        @id @default(uuid())
  email             String        @unique
  passwordHash      String        @map("password_hash")
  name              String
  phone             String?
  address           String?
  isEmailVerified   Boolean       @default(false) @map("is_email_verified")
  emailVerifyToken  String?       @unique @map("email_verify_token")
  emailVerifyExpiry DateTime?     @map("email_verify_expiry")
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")
  
  transactions      Transaction[]
  
  @@map("customers")
}

// ==================== CATEGORIES ====================
model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  products    Product[]
  
  @@map("categories")
}

// ==================== PRODUCTS ====================
model Product {
  id                   String              @id @default(uuid())
  name                 String
  sku                  String              @unique
  categoryId           String              @map("category_id")
  price                Decimal             @db.Decimal(15, 2)
  stock                Int
  description          String?
  imageUrl             String?             @map("image_url")
  stockAlertThreshold  Int                 @default(10) @map("stock_alert_threshold")
  createdAt            DateTime            @default(now()) @map("created_at")
  updatedAt            DateTime            @updatedAt @map("updated_at")
  
  category             Category            @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  transactionItems     TransactionItem[]
  
  @@map("products")
}

// ==================== TRANSACTIONS ====================
model Transaction {
  id               String            @id @default(uuid())
  transactionCode  String            @unique @map("transaction_code")
  customerId       String?           @map("customer_id")
  customerName     String?           @map("customer_name")
  cashierId        String            @map("cashier_id")
  totalAmount      Decimal           @db.Decimal(15, 2) @map("total_amount")
  cashReceived     Decimal           @db.Decimal(15, 2) @map("cash_received")
  cashReturn       Decimal           @db.Decimal(15, 2) @map("cash_return")
  transactionDate  DateTime          @default(now()) @map("transaction_date")
  createdAt        DateTime          @default(now()) @map("created_at")
  
  customer         Customer?         @relation(fields: [customerId], references: [id], onDelete: SetNull)
  cashier          User              @relation(fields: [cashierId], references: [id])
  items            TransactionItem[]
  
  @@map("transactions")
}

// ==================== TRANSACTION ITEMS ====================
model TransactionItem {
  id               String      @id @default(uuid())
  transactionId    String      @map("transaction_id")
  productId        String      @map("product_id")
  quantity         Int
  priceAtPurchase  Decimal     @db.Decimal(15, 2) @map("price_at_purchase")
  subtotal         Decimal     @db.Decimal(15, 2)
  
  transaction      Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  product          Product     @relation(fields: [productId], references: [id])
  
  @@map("transaction_items")
}

// ==================== STORE SETTINGS ====================
model StoreSetting {
  id         String   @id @default(uuid())
  storeName  String   @map("store_name")
  address    String
  phone      String
  email      String?
  logoUrl    String?  @map("logo_url")
  currency   String   @default("IDR")
  timezone   String   @default("Asia/Jakarta")
  dateFormat String   @default("DD/MM/YYYY") @map("date_format")
  updatedAt  DateTime @updatedAt @map("updated_at")
  
  @@map("store_settings")
}

// ==================== GOOGLE DRIVE CONFIG ====================
model GDriveConfig {
  id           String    @id @default(uuid())
  clientId     String    @map("client_id")
  clientSecret String    @map("client_secret")
  refreshToken String    @map("refresh_token")
  accessToken  String    @map("access_token")
  tokenExpiry  DateTime? @map("token_expiry")
  isConnected  Boolean   @default(false) @map("is_connected")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  
  @@map("gdrive_config")
}
```

### 2.2 Seed Data

**File:** `packages/backend/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('kasir123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      fullName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { username: 'kasir' },
    update: {},
    create: {
      username: 'kasir',
      passwordHash: cashierPassword,
      fullName: 'Kasir Demo',
      role: 'CASHIER',
      isActive: true,
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Makanan' },
      update: {},
      create: { name: 'Makanan', description: 'Produk makanan' },
    }),
    prisma.category.upsert({
      where: { name: 'Minuman' },
      update: {},
      create: { name: 'Minuman', description: 'Produk minuman' },
    }),
    prisma.category.upsert({
      where: { name: 'Lainnya' },
      update: {},
      create: { name: 'Lainnya', description: 'Produk lainnya' },
    }),
  ]);

  const storeSetting = await prisma.storeSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Toko Demo',
      address: 'Jl. Contoh No. 123, Jakarta',
      phone: '081234567890',
      email: 'toko@example.com',
    },
  });

  console.log('✅ Seed completed');
  console.log({ admin, cashier, categories, storeSetting });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```


---

## 3. Project Structure (Feature-Driven with Dot Notation)

### 3.1 Complete Folder Structure

```
pos-umkm/
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docker-compose.prod.yml
├── README.md
├── package.json                    # Root package.json (workspace)
│
├── nginx/                          # Nginx config for production
│   └── nginx.conf
│
├── scripts/                        # Deployment & utility scripts
│   ├── deploy.sh
│   └── backup-db.sh
│
└── packages/
    │
    ├── backend/
    │   ├── .env.example
    │   ├── .gitignore
    │   ├── Dockerfile
    │   ├── Dockerfile.prod
    │   ├── package.json
    │   ├── tsconfig.json
    │   │
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   ├── seed.ts
    │   │   └── migrations/
    │   │
    │   └── src/
    │       ├── app.ts                    # Express app (exportable)
    │       ├── server.ts                 # Server entry point
    │       │
    │       ├── features/                 # 🎯 FEATURE-DRIVEN
    │       │   │
    │       │   ├── auth/
    │       │   │   ├── auth.routes.ts
    │       │   │   ├── auth.controller.ts
    │       │   │   ├── auth.service.ts
    │       │   │   ├── auth.repository.ts
    │       │   │   ├── auth.schema.ts      # Zod validation
    │       │   │   └── auth.types.ts
    │       │   │
    │       │   ├── products/
    │       │   │   ├── products.routes.ts
    │       │   │   ├── products.controller.ts
    │       │   │   ├── products.service.ts
    │       │   │   ├── products.repository.ts
    │       │   │   ├── products.schema.ts
    │       │   │   └── products.types.ts
    │       │   │
    │       │   ├── categories/
    │       │   │   ├── categories.routes.ts
    │       │   │   ├── categories.controller.ts
    │       │   │   ├── categories.service.ts
    │       │   │   ├── categories.repository.ts
    │       │   │   ├── categories.schema.ts
    │       │   │   └── categories.types.ts
    │       │   │
    │       │   ├── transactions/
    │       │   │   ├── transactions.routes.ts
    │       │   │   ├── transactions.controller.ts
    │       │   │   ├── transactions.service.ts
    │       │   │   ├── transactions.repository.ts
    │       │   │   ├── transactions.schema.ts
    │       │   │   └── transactions.types.ts
    │       │   │
    │       │   ├── customers/
    │       │   │   ├── customers.routes.ts
    │       │   │   ├── customers.controller.ts
    │       │   │   ├── customers.service.ts
    │       │   │   ├── customers.repository.ts
    │       │   │   ├── customers.schema.ts
    │       │   │   └── customers.types.ts
    │       │   │
    │       │   ├── users/
    │       │   │   ├── users.routes.ts
    │       │   │   ├── users.controller.ts
    │       │   │   ├── users.service.ts
    │       │   │   ├── users.repository.ts
    │       │   │   ├── users.schema.ts
    │       │   │   └── users.types.ts
    │       │   │
    │       │   ├── reports/
    │       │   │   ├── reports.routes.ts
    │       │   │   ├── reports.controller.ts
    │       │   │   ├── reports.service.ts
    │       │   │   ├── reports.schema.ts
    │       │   │   └── reports.types.ts
    │       │   │
    │       │   ├── settings/
    │       │   │   ├── settings.routes.ts
    │       │   │   ├── settings.controller.ts
    │       │   │   ├── settings.service.ts
    │       │   │   ├── settings.repository.ts
    │       │   │   ├── settings.schema.ts
    │       │   │   └── settings.types.ts
    │       │   │
    │       │   └── public/
    │       │       ├── public.routes.ts
    │       │       ├── public.controller.ts
    │       │       └── public.service.ts
    │       │
    │       ├── shared/                    # Shared utilities
    │       │   │
    │       │   ├── middleware/
    │       │   │   ├── auth.middleware.ts
    │       │   │   ├── role-guard.middleware.ts
    │       │   │   ├── validate.middleware.ts
    │       │   │   ├── error-handler.middleware.ts
    │       │   │   ├── request-logger.middleware.ts
    │       │   │   └── cors.middleware.ts
    │       │   │
    │       │   ├── services/
    │       │   │   ├── gdrive.service.ts
    │       │   │   ├── email.service.ts
    │       │   │   └── upload.service.ts
    │       │   │
    │       │   ├── utils/
    │       │   │   ├── logger.util.ts         # Winston
    │       │   │   ├── jwt.util.ts
    │       │   │   ├── bcrypt.util.ts
    │       │   │   ├── encryption.util.ts
    │       │   │   ├── file-naming.util.ts
    │       │   │   └── errors.util.ts
    │       │   │
    │       │   └── types/
    │       │       ├── express.d.ts
    │       │       └── common.types.ts
    │       │
    │       └── config/
    │           ├── env.config.ts
    │           ├── database.config.ts
    │           └── app.config.ts
    │
    └── frontend/
        ├── .env.example
        ├── .gitignore
        ├── Dockerfile
        ├── Dockerfile.prod
        ├── index.html
        ├── package.json
        ├── tsconfig.json
        ├── tsconfig.node.json
        ├── vite.config.ts
        ├── nginx.conf                      # For production build
        │
        ├── public/
        │   └── favicon.ico
        │
        └── src/
            ├── main.tsx
            ├── App.tsx
            ├── vite-env.d.ts
            │
            ├── features/                   # 🎯 FEATURE-DRIVEN
            │   │
            │   ├── auth/
            │   │   ├── login.view.tsx
            │   │   ├── login.presenter.ts
            │   │   └── auth.service.ts
            │   │
            │   ├── products/
            │   │   ├── product-list.view.tsx
            │   │   ├── product-form.view.tsx
            │   │   ├── product-detail.view.tsx
            │   │   ├── products.presenter.ts
            │   │   └── products.service.ts
            │   │
            │   ├── categories/
            │   │   ├── category-modal.view.tsx
            │   │   ├── categories.presenter.ts
            │   │   └── categories.service.ts
            │   │
            │   ├── sales/
            │   │   ├── sales.view.tsx
            │   │   ├── sales-cart.component.tsx
            │   │   ├── sales-receipt.component.tsx
            │   │   ├── sales.presenter.ts
            │   │   └── sales.service.ts
            │   │
            │   ├── reports/
            │   │   ├── reports.view.tsx
            │   │   ├── reports-charts.component.tsx
            │   │   ├── reports.presenter.ts
            │   │   └── reports.service.ts
            │   │
            │   ├── customers/
            │   │   ├── customer-list.view.tsx
            │   │   ├── customer-form.view.tsx
            │   │   ├── customers.presenter.ts
            │   │   └── customers.service.ts
            │   │
            │   ├── users/
            │   │   ├── user-list.view.tsx
            │   │   ├── user-form.view.tsx
            │   │   ├── users.presenter.ts
            │   │   └── users.service.ts
            │   │
            │   ├── settings/
            │   │   ├── store-settings.view.tsx
            │   │   ├── gdrive-config.view.tsx
            │   │   ├── settings.presenter.ts
            │   │   └── settings.service.ts
            │   │
            │   ├── dashboard/
            │   │   ├── dashboard.view.tsx
            │   │   ├── dashboard.presenter.ts
            │   │   └── dashboard.service.ts
            │   │
            │   └── customer-frontend/
            │       ├── catalog.view.tsx
            │       ├── product-detail.view.tsx
            │       ├── customer-login.view.tsx
            │       ├── customer-register.view.tsx
            │       ├── verify-email.view.tsx
            │       ├── transaction-history.view.tsx
            │       ├── customer.presenter.ts
            │       └── customer.service.ts
            │
            ├── components/
            │   ├── layout/
            │   │   ├── backoffice-layout.tsx
            │   │   ├── customer-layout.tsx
            │   │   ├── sidebar.component.tsx
            │   │   ├── header.component.tsx
            │   │   └── auth-context.tsx
            │   │
            │   ├── ui/                     # Reusable UI components
            │   │   ├── button.tsx
            │   │   ├── table.tsx
            │   │   ├── modal.tsx
            │   │   ├── pagination.tsx
            │   │   └── table-loading.tsx
            │   │
            │   ├── common/
            │   │   ├── loading.component.tsx
            │   │   ├── error-boundary.component.tsx
            │   │   ├── protected-route.component.tsx
            │   │   └── error-message.component.tsx
            │   │
            │   └── utilities/
            │       └── button-loading.component.tsx
            │
            ├── hooks/
            │   ├── use-auth.hook.ts
            │   ├── use-permissions.hook.ts
            │   ├── use-debounce.hook.ts
            │   └── use-products.hook.ts
            │
            ├── stores/                     # Zustand stores
            │   ├── auth.store.ts
            │   ├── cart.store.ts
            │   └── customer.store.ts
            │
            ├── libs/
            │   ├── api.lib.ts              # Axios instance
            │   ├── constants.lib.ts
            │   ├── permissions.lib.ts
            │   ├── routes.lib.ts
            │   └── fetch-with-auth.lib.ts
            │
            ├── types/
            │   ├── api.types.ts
            │   ├── models.types.ts
            │   └── user.types.ts
            │
            ├── assets/
            │   └── logo.svg
            │
            └── routes/
                └── index.tsx               # React Router setup
```

### 3.2 Naming Convention Summary

**Backend:**
- Routes: `feature.routes.ts`
- Controllers: `feature.controller.ts`
- Services: `feature.service.ts`
- Repositories: `feature.repository.ts`
- Schemas: `feature.schema.ts` (Zod validation)
- Types: `feature.types.ts`

**Frontend:**
- Views: `feature.view.tsx` atau `component-name.view.tsx`
- Presenters: `feature.presenter.ts`
- Services: `feature.service.ts`
- Components: `component-name.component.tsx`
- Hooks: `use-name.hook.ts`
- Stores: `feature.store.ts`
- Utils: `util-name.util.ts`
- Libs: `lib-name.lib.ts`

### 3.3 Feature Module Example

**Backend Feature Module (Auth):**

```
features/auth/
├── auth.routes.ts       → Define routes
├── auth.controller.ts   → Handle HTTP requests/responses
├── auth.service.ts      → Business logic
├── auth.repository.ts   → Database queries (Prisma)
├── auth.schema.ts       → Zod validation schemas
└── auth.types.ts        → TypeScript types/interfaces
```

**Frontend Feature Module (Products):**

```
features/products/
├── product-list.view.tsx      → List page UI
├── product-form.view.tsx      → Create/Edit form UI
├── product-detail.view.tsx    → Detail page UI
├── products.presenter.ts      → Business logic & state
└── products.service.ts        → API calls
```


---

## 4. API Specification & Contract

### 4.1 Base URL

- **Local Development:** `http://localhost:3000/api`
- **Production (VPS):** `https://your-domain.com/api`
- **Production (Vercel):** `https://pos-umkm.vercel.app/api`

### 4.2 Authentication Endpoints

#### **POST** `/api/auth/login`

**Request:**
```typescript
{
  username: string;
  password: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      fullName: string;
      role: "ADMIN" | "CASHIER";
    }
  }
}
```

#### **GET** `/api/auth/me`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: {
    id: string;
    username: string;
    fullName: string;
    role: "ADMIN" | "CASHIER";
  }
}
```

#### **POST** `/api/auth/logout`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  message: "Logged out successfully"
}
```

### 4.3 Customer Authentication Endpoints

#### **POST** `/api/customer/register`

**Request:**
```typescript
{
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Registration successful. Please check your email to verify your account.",
  data: {
    customerId: string;
  }
}
```

#### **GET** `/api/customer/verify-email?token=<token>`

**Response (200):**
```typescript
{
  success: true;
  message: "Email verified successfully. You can now login."
}
```

#### **POST** `/api/customer/login`

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    token: string;
    customer: {
      id: string;
      email: string;
      name: string;
      isEmailVerified: boolean;
    }
  }
}
```

#### **POST** `/api/customer/resend-verification`

**Request:**
```typescript
{
  email: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Verification email sent"
}
```

### 4.4 Products Endpoints (Admin Only)

#### **GET** `/api/products`
**Headers:** `Authorization: Bearer <token>`

**Query Params:**
```typescript
{
  page?: number;       // default: 1
  limit?: number;      // default: 10
  search?: string;     // search by name or SKU
  categoryId?: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }
}
```

#### **GET** `/api/products/:id`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: Product;
}
```

#### **POST** `/api/products`
**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  description?: string;
  stockAlertThreshold?: number;
}
```

**Response (201):**
```typescript
{
  success: true;
  data: Product;
}
```

#### **PUT** `/api/products/:id`
**Headers:** `Authorization: Bearer <token>`

**Request:** `Partial<Product>`

**Response (200):**
```typescript
{
  success: true;
  data: Product;
}
```

#### **DELETE** `/api/products/:id`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  message: "Product deleted successfully"
}
```

#### **POST** `/api/products/:id/upload-image`
**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
```typescript
{
  image: File; // max 5MB, JPEG/PNG
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    imageUrl: string; // Google Drive URL
  }
}
```

### 4.5 Categories Endpoints (Admin Only)

#### **GET** `/api/categories`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: Category[];
}
```

#### **POST** `/api/categories`
**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  name: string;
  description?: string;
}
```

**Response (201):**
```typescript
{
  success: true;
  data: Category;
}
```

#### **PUT** `/api/categories/:id`
**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  name?: string;
  description?: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Category;
}
```

#### **DELETE** `/api/categories/:id`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  message: "Category deleted successfully"
}
```

### 4.6 Transactions Endpoints (Kasir)

#### **POST** `/api/transactions`
**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  customerId?: string;      // if member
  customerName?: string;    // if guest
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  cashReceived: number;
}
```

**Response (201):**
```typescript
{
  success: true;
  data: {
    transaction: Transaction & {
      items: TransactionItem[];
    };
  }
}
```

#### **GET** `/api/transactions/:id`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  success: true;
  data: Transaction & {
    items: TransactionItem[];
    customer?: Customer;
    cashier: User;
  }
}
```

#### **GET** `/api/transactions/:id/receipt`
**Headers:** `Authorization: Bearer <token>`

**Response (200):** HTML string for printing

### 4.7 Reports Endpoints (Admin Only)

#### **GET** `/api/reports/sales`
**Headers:** `Authorization: Bearer <token>`

**Query Params:**
```typescript
{
  startDate?: string;  // ISO format
  endDate?: string;    // ISO format
  cashierId?: string;
  categoryId?: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalSales: number;
    totalTransactions: number;
    averageTransaction: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      totalSold: number;
      revenue: number;
    }>;
    salesPerCashier: Array<{
      cashierId: string;
      cashierName: string;
      totalSales: number;
      transactionCount: number;
    }>;
    dailySales: Array<{
      date: string;
      totalSales: number;
      transactionCount: number;
    }>;
  }
}
```

#### **GET** `/api/reports/export`
**Headers:** `Authorization: Bearer <token>`

**Query Params:**
```typescript
{
  format: "csv" | "pdf";
  startDate?: string;
  endDate?: string;
}
```

**Response (200):** File download

### 4.8 Public Endpoints (Customer Frontend)

#### **GET** `/api/public/products`

**Query Params:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: "name" | "price";
  order?: "asc" | "desc";
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    products: Product[];
    pagination: {...}
  }
}
```

#### **GET** `/api/public/products/:id`

**Response (200):**
```typescript
{
  success: true;
  data: Product;
}
```

#### **GET** `/api/public/categories`

**Response (200):**
```typescript
{
  success: true;
  data: Category[];
}
```

#### **GET** `/api/customer/transactions`
**Headers:** `Authorization: Bearer <customer-token>`

**Response (200):**
```typescript
{
  success: true;
  data: Transaction[];
}
```

---

## 5. Zod Validation Schemas

### 5.1 Example: Auth Schema

**File:** `packages/backend/src/features/auth/auth.schema.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(100),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
```

### 5.2 Example: Product Schema

**File:** `packages/backend/src/features/products/products.schema.ts`

```typescript
import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    sku: z.string().min(1).max(100),
    categoryId: z.string().uuid(),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    description: z.string().optional(),
    stockAlertThreshold: z.number().int().min(0).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    sku: z.string().min(1).max(100).optional(),
    categoryId: z.string().uuid().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    description: z.string().optional(),
    stockAlertThreshold: z.number().int().min(0).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getProductsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type GetProductsQuery = z.infer<typeof getProductsSchema>['query'];
```

### 5.3 Validation Middleware

**File:** `packages/backend/src/shared/middleware/validate.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../utils/logger.util';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error', { errors: error.errors, path: req.path });
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
```


---

## 6. Docker Configuration

### 6.1 Docker Compose (Local Development)

**File:** `docker-compose.yml`

```yaml
version: '3.9'

services:
  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
    container_name: pos-backend-dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://pos_user:pos_password@host.docker.internal:5432/pos_umkm
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=24h
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - FRONTEND_URL=http://localhost:5173
      - EMAIL_FROM=noreply@pos-umkm.com
      - EMAIL_SERVICE=resend
      - EMAIL_API_KEY=${EMAIL_API_KEY}
    volumes:
      - ./packages/backend/src:/app/src
      - ./packages/backend/prisma:/app/prisma
      - /app/node_modules
    networks:
      - pos-network
    command: npm run dev
    restart: unless-stopped

  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
    container_name: pos-frontend-dev
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000/api
    volumes:
      - ./packages/frontend/src:/app/src
      - /app/node_modules
    networks:
      - pos-network
    command: npm run dev
    restart: unless-stopped

networks:
  pos-network:
    driver: bridge
```

### 6.2 Docker Compose (Production VPS)

**File:** `docker-compose.prod.yml`

```yaml
version: '3.9'

services:
  nginx:
    image: nginx:alpine
    container_name: pos-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - frontend-build:/usr/share/nginx/html
    depends_on:
      - backend
      - frontend
    networks:
      - pos-network
    restart: always

  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile.prod
    container_name: pos-backend
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=24h
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - FRONTEND_URL=${FRONTEND_URL}
      - EMAIL_FROM=${EMAIL_FROM}
      - EMAIL_API_KEY=${EMAIL_API_KEY}
      - GDRIVE_REDIRECT_URI=${GDRIVE_REDIRECT_URI}
    networks:
      - pos-network
    restart: always

  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile.prod
    container_name: pos-frontend
    volumes:
      - frontend-build:/app/dist
    networks:
      - pos-network

volumes:
  frontend-build:

networks:
  pos-network:
    driver: bridge
```

### 6.3 Backend Dockerfile (Development)

**File:** `packages/backend/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Development command (will be overridden by docker-compose)
CMD ["npm", "run", "dev"]
```

### 6.4 Backend Dockerfile (Production)

**File:** `packages/backend/Dockerfile.prod`

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built files
COPY --from=builder /app/dist ./dist

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/server.js"]
```

### 6.5 Frontend Dockerfile (Development)

**File:** `packages/frontend/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Development command
CMD ["npm", "run", "dev", "--", "--host"]
```

### 6.6 Frontend Dockerfile (Production)

**File:** `packages/frontend/Dockerfile.prod`

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build
RUN npm run build

# Production stage (minimal)
FROM scratch AS export-stage
COPY --from=builder /app/dist /dist
```

### 6.7 Nginx Configuration (Production)

**File:** `nginx/nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    access_log  /var/log/nginx/access.log;
    error_log   /var/log/nginx/error.log;

    # Performance
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Upstream backend
    upstream backend {
        server pos-backend:3000;
    }

    # HTTP server (redirect to HTTPS in production)
    server {
        listen 80;
        server_name _;

        # For Let's Encrypt validation
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Redirect to HTTPS (uncomment in production)
        # return 301 https://$host$request_uri;

        # Or serve directly (for development)
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 300s;
        }
    }

    # HTTPS server (uncomment and configure in production)
    # server {
    #     listen 443 ssl http2;
    #     server_name your-domain.com;
    #
    #     ssl_certificate /etc/nginx/ssl/fullchain.pem;
    #     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    #
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers HIGH:!aNULL:!MD5;
    #     ssl_prefer_server_ciphers on;
    #
    #     location / {
    #         root /usr/share/nginx/html;
    #         try_files $uri $uri/ /index.html;
    #     }
    #
    #     location /api/ {
    #         proxy_pass http://backend/api/;
    #         proxy_http_version 1.1;
    #         proxy_set_header Upgrade $http_upgrade;
    #         proxy_set_header Connection 'upgrade';
    #         proxy_set_header Host $host;
    #         proxy_set_header X-Real-IP $remote_addr;
    #         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #         proxy_set_header X-Forwarded-Proto $scheme;
    #         proxy_cache_bypass $http_upgrade;
    #     }
    # }
}
```

---

## 7. TypeScript Configuration

### 7.1 Backend TypeScript Config

**File:** `packages/backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "typeRoots": ["./node_modules/@types", "./src/shared/types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

### 7.2 Frontend TypeScript Config

**File:** `packages/frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 7.3 Express Type Extensions

**File:** `packages/backend/src/shared/types/express.d.ts`

```typescript
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: 'ADMIN' | 'CASHIER';
      };
      customer?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

export {};
```

---

## 8. VPS Deployment Guide

### 8.1 VPS Provider Options

| Provider | Plan | Price | Specs | Region |
|----------|------|-------|-------|--------|
| **Railway** | Hobby | $5/mo | 512MB RAM, 1GB disk, PostgreSQL included | Global |
| **DigitalOcean** | Basic Droplet | $6/mo | 1GB RAM, 25GB SSD | Singapore, US, EU |
| **Hetzner** | CX11 | €4.5/mo | 2GB RAM, 20GB SSD | Germany, Finland |
| **Contabo** | VPS S | €5/mo | 4GB RAM, 50GB SSD | Germany, US |
| **Linode** | Nanode | $5/mo | 1GB RAM, 25GB SSD | Singapore, Tokyo, US |

**Rekomendasi:** Railway (easiest) atau DigitalOcean (reliable)

### 8.2 VPS Setup Steps (DigitalOcean/Hetzner/Linode)

#### Step 1: Create VPS & Initial Setup

```bash
# SSH ke VPS
ssh root@your-vps-ip

# Update sistem
apt update && apt upgrade -y

# Install dependencies
apt install -y curl git nginx postgresql postgresql-contrib certbot python3-certbot-nginx

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install -y docker-compose

# Create non-root user
adduser pos
usermod -aG sudo pos
usermod -aG docker pos

# Switch to user
su - pos
```

#### Step 2: Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database & user
CREATE DATABASE pos_umkm;
CREATE USER pos_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE pos_umkm TO pos_user;
\q

# Configure PostgreSQL to accept connections
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: listen_addresses = 'localhost'

sudo systemctl restart postgresql
```

#### Step 3: Clone & Configure Project

```bash
# Clone repository
cd ~
git clone https://github.com/your-username/pos-umkm.git
cd pos-umkm

# Create .env file
nano .env
```

**`.env` content:**
```bash
# Database
DATABASE_URL=postgresql://pos_user:your-secure-password@localhost:5432/pos_umkm

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# Encryption
ENCRYPTION_KEY=your-32-char-encryption-key-here!!

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Email
EMAIL_FROM=noreply@your-domain.com
EMAIL_API_KEY=re_your_resend_api_key

# Google Drive
GDRIVE_REDIRECT_URI=https://your-domain.com/api/settings/gdrive/callback
```

#### Step 4: Run Database Migrations

```bash
cd packages/backend
npm install
npx prisma migrate deploy
npx prisma db seed
```

#### Step 5: Build & Start with Docker Compose

```bash
cd ~/pos-umkm

# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Step 6: Setup Nginx & SSL

```bash
# Configure domain (replace with your domain)
sudo nano /etc/nginx/sites-available/pos-umkm

# Copy nginx config from project
sudo cp nginx/nginx.conf /etc/nginx/sites-available/pos-umkm

# Enable site
sudo ln -s /etc/nginx/sites-available/pos-umkm /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d your-domain.com

# Auto-renew SSL
sudo systemctl enable certbot.timer
```

#### Step 7: Setup Auto-restart on Boot

```bash
# Enable docker service
sudo systemctl enable docker

# Docker Compose akan auto-start karena restart: always
```

### 8.3 Railway Deployment (Easiest)

**Railway is the easiest option with built-in PostgreSQL and zero configuration.**

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

#### Step 2: Initialize Project

```bash
cd pos-umkm
railway init

# Link to Railway project
railway link
```

#### Step 3: Add PostgreSQL

```bash
# From Railway dashboard:
# 1. Go to your project
# 2. Click "New" → "Database" → "PostgreSQL"
# 3. Copy DATABASE_URL
```

#### Step 4: Set Environment Variables

```bash
# Set variables via CLI
railway variables set JWT_SECRET=your-jwt-secret
railway variables set ENCRYPTION_KEY=your-encryption-key
railway variables set EMAIL_API_KEY=re_your_resend_key
railway variables set FRONTEND_URL=https://your-app.up.railway.app

# Or set via Railway dashboard (easier)
```

#### Step 5: Deploy

```bash
# Deploy backend
cd packages/backend
railway up

# Deploy frontend
cd ../frontend
railway up

# Run migrations
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

#### Step 6: Custom Domain (Optional)

```bash
# From Railway dashboard:
# 1. Go to Settings → Domains
# 2. Add custom domain
# 3. Update DNS records (CNAME)
```

### 8.4 CI/CD with GitHub Actions

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/pos-umkm
            git pull origin main
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml build
            docker-compose -f docker-compose.prod.yml up -d
            cd packages/backend
            npx prisma migrate deploy
```

**GitHub Secrets to set:**
- `VPS_HOST`: Your VPS IP
- `VPS_USER`: SSH username (e.g., `pos`)
- `VPS_SSH_KEY`: SSH private key


---

## 9. Winston Logging Implementation

### 9.1 Logger Configuration

**File:** `packages/backend/src/shared/utils/logger.util.ts`

```typescript
import winston from 'winston';
import path from 'path';

const logDir = 'logs';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logger initialized in development mode');
}
```

### 9.2 Request Logger Middleware

**File:** `packages/backend/src/shared/middleware/request-logger.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.util';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};
```

---

## 10. Authentication & Authorization

### 10.1 JWT Utilities

**File:** `packages/backend/src/shared/utils/jwt.util.ts`

```typescript
import jwt from 'jsonwebtoken';
import { logger } from './logger.util';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JwtPayload {
  id: string;
  username?: string;
  email?: string;
  role?: 'ADMIN' | 'CASHIER';
  type: 'user' | 'customer';
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    logger.warn('JWT verification failed', { error });
    return null;
  }
};
```

### 10.2 Bcrypt Utilities

**File:** `packages/backend/src/shared/utils/bcrypt.util.ts`

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### 10.3 Auth Middleware

**File:** `packages/backend/src/shared/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { logger } from '../utils/logger.util';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
    return;
  }

  if (payload.type === 'user') {
    req.user = {
      id: payload.id,
      username: payload.username!,
      role: payload.role!,
    };
  } else if (payload.type === 'customer') {
    req.customer = {
      id: payload.id,
      email: payload.email!,
      name: '',
    };
  }

  next();
};

export const authenticateCustomer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload || payload.type !== 'customer') {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
    return;
  }

  req.customer = {
    id: payload.id,
    email: payload.email!,
    name: '',
  };

  next();
};
```

### 10.4 Role Guard Middleware

**File:** `packages/backend/src/shared/middleware/role-guard.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export const requireRole = (...allowedRoles: Array<'ADMIN' | 'CASHIER'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN');
export const requireCashier = requireRole('CASHIER');
export const requireAdminOrCashier = requireRole('ADMIN', 'CASHIER');
```

---

## 11. Email Service Implementation

### 11.1 Email Service

**File:** `packages/backend/src/shared/services/email.service.ts`

```typescript
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.util';

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.EMAIL_API_KEY,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@pos-umkm.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    logger.info('Email sent successfully', { to: options.to });
    return true;
  } catch (error) {
    logger.error('Failed to send email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      to: options.to,
    });
    return false;
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<boolean> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1890ff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f5f5f5; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #1890ff; 
          color: white; 
          text-decoration: none; 
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verifikasi Email Anda</h1>
        </div>
        <div class="content">
          <p>Halo ${name},</p>
          <p>Terima kasih telah mendaftar di POS UMKM. Silakan klik tombol di bawah untuk memverifikasi email Anda:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verifikasi Email</a>
          </p>
          <p>Atau copy dan paste URL berikut ke browser Anda:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>Link verifikasi ini akan kadaluarsa dalam 24 jam.</p>
          <p>Jika Anda tidak mendaftar akun di POS UMKM, abaikan email ini.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 POS UMKM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verifikasi Email Anda - POS UMKM',
    html,
  });
};
```

---

## 12. Google Drive Integration

### 12.1 Encryption Utilities

**File:** `packages/backend/src/shared/utils/encryption.util.ts`

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fallback-key-32-chars-long!!!!!!';
const IV_LENGTH = 16;

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
    iv
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (text: string): string => {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
    iv
  );

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
```

### 12.2 File Naming Utility

**File:** `packages/backend/src/shared/utils/file-naming.util.ts`

```typescript
import { randomUUID } from 'crypto';
import path from 'path';

export const generateDriveFileName = (
  sku: string,
  originalName: string
): string => {
  const timestamp = Date.now();
  const unique = randomUUID().slice(0, 8);
  const ext = path.extname(originalName);
  
  return `${timestamp}-${sku}-${unique}${ext}`;
};
```

### 12.3 Google Drive Service

**File:** `packages/backend/src/shared/services/gdrive.service.ts`

```typescript
import { google } from 'googleapis';
import { Readable } from 'stream';
import { prisma } from '../../config/database.config';
import { logger } from '../utils/logger.util';
import { decrypt, encrypt } from '../utils/encryption.util';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export const getOAuth2Client = async () => {
  const config = await prisma.gDriveConfig.findFirst();

  if (!config || !config.isConnected) {
    throw new Error('Google Drive not configured');
  }

  const oauth2Client = new google.auth.OAuth2(
    decrypt(config.clientId),
    decrypt(config.clientSecret),
    process.env.GDRIVE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: decrypt(config.refreshToken),
    access_token: decrypt(config.accessToken),
  });

  return oauth2Client;
};

export const uploadToDrive = async (
  fileName: string,
  mimeType: string,
  buffer: Buffer
): Promise<string> => {
  try {
    const auth = await getOAuth2Client();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: fileName,
      parents: ['root'],
    };

    const media = {
      mimeType,
      body: Readable.from(buffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, webViewLink, webContentLink',
    });

    if (!response.data.id) {
      throw new Error('Failed to get file ID from Google Drive');
    }

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get direct link
    const fileUrl = `https://drive.google.com/uc?id=${response.data.id}`;

    logger.info('File uploaded to Google Drive', {
      fileName,
      fileId: response.data.id,
    });

    return fileUrl;
  } catch (error) {
    logger.error('Failed to upload to Google Drive', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileName,
    });
    throw new Error('Failed to upload to Google Drive');
  }
};

export const authorizeGoogleDrive = async (
  clientId: string,
  clientSecret: string
): Promise<string> => {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    process.env.GDRIVE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  // Save encrypted credentials
  await prisma.gDriveConfig.upsert({
    where: { id: 'default' },
    update: {
      clientId: encrypt(clientId),
      clientSecret: encrypt(clientSecret),
      isConnected: false,
    },
    create: {
      id: 'default',
      clientId: encrypt(clientId),
      clientSecret: encrypt(clientSecret),
      refreshToken: '',
      accessToken: '',
      isConnected: false,
    },
  });

  return authUrl;
};

export const handleOAuthCallback = async (code: string): Promise<void> => {
  const config = await prisma.gDriveConfig.findFirst();

  if (!config) {
    throw new Error('Google Drive not configured');
  }

  const oauth2Client = new google.auth.OAuth2(
    decrypt(config.clientId),
    decrypt(config.clientSecret),
    process.env.GDRIVE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token || !tokens.access_token) {
    throw new Error('Failed to get tokens from Google');
  }

  await prisma.gDriveConfig.update({
    where: { id: config.id },
    data: {
      refreshToken: encrypt(tokens.refresh_token),
      accessToken: encrypt(tokens.access_token),
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      isConnected: true,
    },
  });

  logger.info('Google Drive connected successfully');
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const auth = await getOAuth2Client();
    const drive = google.drive({ version: 'v3', auth });

    await drive.files.list({ pageSize: 1 });

    logger.info('Google Drive connection test successful');
    return true;
  } catch (error) {
    logger.error('Google Drive connection test failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
};
```

### 12.4 Upload Service

**File:** `packages/backend/src/shared/services/upload.service.ts`

```typescript
import { generateDriveFileName } from '../utils/file-naming.util';
import { uploadToDrive } from './gdrive.service';
import { prisma } from '../../config/database.config';
import { logger } from '../utils/logger.util';

export const uploadProductImage = async (
  productId: string,
  file: Express.Multer.File
): Promise<string> => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const fileName = generateDriveFileName(product.sku, file.originalname);

  logger.info('Uploading product image', {
    productId,
    fileName,
    fileSize: file.size,
  });

  const imageUrl = await uploadToDrive(fileName, file.mimetype, file.buffer);

  await prisma.product.update({
    where: { id: productId },
    data: { imageUrl },
  });

  logger.info('Product image uploaded successfully', {
    productId,
    imageUrl,
  });

  return imageUrl;
};
```


---

## 13. Error Handling Strategy

### 13.1 Custom Error Classes

**File:** `packages/backend/src/shared/utils/errors.util.ts`

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, message);
  }
}
```

### 13.2 Global Error Handler

**File:** `packages/backend/src/shared/middleware/error-handler.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
```

---

## 14. Feature Module Example (Complete Implementation)

### 14.1 Auth Feature (Backend)

**File:** `packages/backend/src/features/auth/auth.routes.ts`

```typescript
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { loginSchema } from './auth.schema';

const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
```

**File:** `packages/backend/src/features/auth/auth.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { logger } from '../../shared/utils/logger.util';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password } = req.body;
      const result = await this.authService.login(username, password);

      logger.info('User logged in', { username });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('User logged out', { userId: req.user?.id });

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.getMe(req.user!.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
```

**File:** `packages/backend/src/features/auth/auth.service.ts`

```typescript
import { AuthRepository } from './auth.repository';
import { generateToken } from '../../shared/utils/jwt.util';
import { comparePassword } from '../../shared/utils/bcrypt.util';
import { UnauthorizedError, NotFoundError } from '../../shared/utils/errors.util';
import { LoginResponse, MeResponse } from './auth.types';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const user = await this.authRepository.findByUsername(username);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      type: 'user',
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async getMe(userId: string): Promise<MeResponse> {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
  }
}
```

**File:** `packages/backend/src/features/auth/auth.repository.ts`

```typescript
import { prisma } from '../../config/database.config';
import { User } from '@prisma/client';

export class AuthRepository {
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}
```

**File:** `packages/backend/src/features/auth/auth.types.ts`

```typescript
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: 'ADMIN' | 'CASHIER';
  };
}

export interface MeResponse {
  id: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'CASHIER';
}
```

### 14.2 Products Feature (Frontend)

**File:** `packages/frontend/src/features/products/product-list.view.tsx`

```typescript
import { useEffect, useState } from 'react';
import { Table, Button, Input, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ProductsPresenter } from './products.presenter';
import { Product } from '../../types/models.types';

export const ProductListView = () => {
  const navigate = useNavigate();
  const presenter = new ProductsPresenter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadProducts();
  }, [pagination.current, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await presenter.getProducts({
        page: pagination.current,
        limit: pagination.pageSize,
        search,
      });
      setProducts(result.products);
      setPagination((prev) => ({ ...prev, total: result.pagination.total }));
    } catch (error) {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await presenter.deleteProduct(id);
      message.success('Product deleted');
      loadProducts();
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Stock', dataIndex: 'stock', key: 'stock' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Product) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/products/edit/${record.id}`)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search products"
          onSearch={setSearch}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/create')}>
          Add Product
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={pagination}
        onChange={(pagination) => setPagination(pagination)}
        rowKey="id"
      />
    </div>
  );
};
```


---

## 15. Implementation Checklist

### Sprint 1: Foundation & Setup (Week 1-2)

**Backend:**
- [ ] Create monorepo structure
- [ ] Setup Docker Compose
- [ ] Setup PostgreSQL di host
- [ ] Create Prisma schema
- [ ] Run initial migration: `npx prisma migrate dev --name init`
- [ ] Create seed data script
- [ ] Run seed: `npx prisma db seed`
- [ ] Setup Express app with TypeScript (strict)
- [ ] Create `app.ts` dan `server.ts`
- [ ] Setup Winston logger
- [ ] Create JWT utilities
- [ ] Create bcrypt utilities
- [ ] Create auth middleware
- [ ] Create role guard middleware
- [ ] Create error handler middleware
- [ ] Create Zod validation middleware
- [ ] Create auth feature module (routes, controller, service, repository, schema, types)
- [ ] Test auth endpoints via Postman

**Frontend:**
- [ ] Setup React + Vite + TypeScript (strict)
- [ ] Install Ant Design
- [ ] Setup React Router
- [ ] Create folder structure (feature-driven)
- [ ] Setup Zustand store (auth.store.ts)
- [ ] Create Axios instance with interceptors (api.lib.ts)
- [ ] Create auth service (auth.service.ts)
- [ ] Create login view (login.view.tsx)
- [ ] Create login presenter (login.presenter.ts)
- [ ] Create protected route component
- [ ] Create backoffice layout (sidebar + header)
- [ ] Test login flow

**Dependencies:**
```bash
# Backend
cd packages/backend
npm install express cors helmet jsonwebtoken bcrypt zod winston multer googleapis nodemailer @prisma/client
npm install -D typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcrypt @types/multer @types/nodemailer ts-node-dev prisma

# Frontend
cd packages/frontend
npm install react react-dom react-router-dom antd axios zustand
npm install -D typescript @types/react @types/react-dom @vitejs/plugin-react vite
```

---

### Sprint 2: Products & Categories (Week 3-4)

**Backend:**
- [ ] Create products feature module (complete structure)
- [ ] Create products.repository.ts (CRUD with Prisma)
- [ ] Create products.service.ts (business logic)
- [ ] Create products.controller.ts
- [ ] Create products.routes.ts (with ADMIN guard)
- [ ] Create products.schema.ts (Zod validation)
- [ ] Create categories feature module (complete structure)
- [ ] Test CRUD endpoints

**Frontend:**
- [ ] Create product-list.view.tsx (table with pagination)
- [ ] Create product-form.view.tsx (create/edit modal)
- [ ] Create products.presenter.ts
- [ ] Create products.service.ts
- [ ] Create category-modal.view.tsx
- [ ] Create categories.service.ts
- [ ] Integrate with backend API
- [ ] Add search & filter functionality
- [ ] Test product CRUD operations

---

### Sprint 3: Google Drive Integration (Week 5-6)

**Backend:**
- [ ] Create encryption utilities (encryption.util.ts)
- [ ] Create file naming utility (file-naming.util.ts)
- [ ] Create Google Drive service (gdrive.service.ts)
- [ ] Create upload service (upload.service.ts)
- [ ] Create settings feature module
- [ ] Create GDrive config endpoints
- [ ] Setup multer middleware for file upload
- [ ] Create upload endpoint: `POST /api/products/:id/upload-image`
- [ ] Test OAuth2 flow
- [ ] Test file upload to Google Drive

**Frontend:**
- [ ] Create gdrive-config.view.tsx
- [ ] Create step-by-step setup guide UI
- [ ] Create authorization flow (redirect to Google)
- [ ] Create test connection button
- [ ] Add image upload to product form (drag & drop or file picker)
- [ ] Show upload progress
- [ ] Display image preview
- [ ] Test end-to-end upload flow

---

### Sprint 4: Sales/Transactions (Week 7-8)

**Backend:**
- [ ] Create transactions feature module (complete structure)
- [ ] Create transactions.repository.ts
- [ ] Create transactions.service.ts
- [ ] Implement stock reduction logic
- [ ] Generate transaction code (auto-increment or timestamp-based)
- [ ] Calculate total, cash received, cash return
- [ ] Create receipt generation (HTML template)
- [ ] Create transactions.routes.ts (CASHIER only)
- [ ] Test transaction creation

**Frontend:**
- [ ] Create sales.view.tsx (Kasir page)
- [ ] Create product search/selection component
- [ ] Create cart component with Zustand (cart.store.ts)
- [ ] Create customer selection (Member dropdown / Guest input)
- [ ] Create payment input (cash received)
- [ ] Show kembalian calculation (auto)
- [ ] Create receipt modal (HTML, printable)
- [ ] Implement print functionality (`window.print()`)
- [ ] Test complete sales flow (guest & member)

---

### Sprint 5: Reports & Dashboard (Week 9-10)

**Backend:**
- [ ] Create reports feature module
- [ ] Create reports.service.ts
- [ ] Implement sales report query (Prisma aggregations)
- [ ] Calculate metrics (total sales, top products, sales per cashier)
- [ ] Create CSV export utility
- [ ] Create PDF export utility (jsPDF or Puppeteer)
- [ ] Create reports.routes.ts (ADMIN only)
- [ ] Test report endpoints

**Frontend:**
- [ ] Create dashboard.view.tsx (Admin)
- [ ] Display key metrics (cards: total sales, transactions, top products)
- [ ] Create sales chart (Ant Design Charts or Recharts)
- [ ] Create top products chart
- [ ] Create reports.view.tsx with filters
- [ ] Implement date range picker (Ant Design DatePicker)
- [ ] Implement export buttons (CSV, PDF)
- [ ] Test reports generation

---

### Sprint 6: Customer Management & Email Verification (Week 11-12)

**Backend:**
- [ ] Create customers feature module
- [ ] Create email service (email.service.ts with Nodemailer)
- [ ] Implement customer registration
- [ ] Implement email verification flow (generate token, send email)
- [ ] Implement customer login (JWT for customers)
- [ ] Create customer routes
- [ ] Create public routes (catalog, product detail)
- [ ] Test customer auth flow

**Frontend:**
- [ ] Create customer-layout.tsx
- [ ] Create customer-register.view.tsx
- [ ] Create verify-email.view.tsx
- [ ] Create customer-login.view.tsx
- [ ] Create catalog.view.tsx (responsive grid)
- [ ] Create product-detail.view.tsx
- [ ] Create transaction-history.view.tsx (member only)
- [ ] Test customer flows (register, verify, login, browse)

---

### Sprint 7: User Management & Store Settings (Week 13-14)

**Backend:**
- [ ] Create users feature module (CRUD)
- [ ] Create users.service.ts
- [ ] Create users.routes.ts (ADMIN only)
- [ ] Create store settings service
- [ ] Create settings.routes.ts
- [ ] Test user management
- [ ] Test store settings

**Frontend:**
- [ ] Create user-list.view.tsx (Admin)
- [ ] Create user-form.view.tsx (create/edit modal)
- [ ] Create password change modal
- [ ] Create store-settings.view.tsx
- [ ] Implement logo upload
- [ ] Test user management
- [ ] Test store settings update


### Sprint 8: Testing & Bug Fixes (Week 15)

**Backend Testing:**
- [ ] Setup Jest for backend
- [ ] Unit tests for auth.service.ts
- [ ] Unit tests for products.service.ts
- [ ] Unit tests for transactions.service.ts
- [ ] Integration tests for API endpoints (Supertest)
- [ ] Test coverage target: 70%

**Frontend Testing:**
- [ ] Setup Jest + React Testing Library
- [ ] Unit tests for presenters
- [ ] Component tests for critical views
- [ ] E2E tests with Cypress/Playwright (optional)

**Bug Fixes & Optimization:**
- [ ] Fix bugs found during testing
- [ ] Performance optimization (database queries)
- [ ] Security audit (check for SQL injection, XSS, etc.)
- [ ] Code review & refactoring

---

### Sprint 9: Deployment & Documentation (Week 16)

**VPS Deployment (Primary):**
- [ ] Prepare production environment variables
- [ ] Setup VPS (Railway/DigitalOcean)
- [ ] Install Docker & Docker Compose
- [ ] Setup PostgreSQL
- [ ] Clone repository
- [ ] Configure Nginx
- [ ] Setup SSL with Let's Encrypt
- [ ] Deploy with `docker-compose.prod.yml`
- [ ] Run production migrations
- [ ] Seed production data (admin user)
- [ ] Test production environment

**Alternative: Vercel Deployment:**
- [ ] Configure `vercel.json`
- [ ] Create Vercel account & project
- [ ] Setup Vercel Postgres (or Neon DB)
- [ ] Deploy backend as serverless functions
- [ ] Deploy frontend to CDN
- [ ] Configure environment variables
- [ ] Test deployment

**Monitoring & Documentation:**
- [ ] Setup error monitoring (Sentry - optional)
- [ ] Configure logging
- [ ] Write README.md
- [ ] Write API documentation
- [ ] Write deployment guide
- [ ] Write user manual (Admin/Kasir)

---

## 16. Cost Estimation & Free Tier Options

### 16.1 VPS Deployment (Recommended)

**Railway (Easiest Setup)**
- **Hobby Plan:** $5/month
- **Includes:** 512MB RAM, 1GB disk, PostgreSQL addon (500MB)
- **Bandwidth:** Generous free tier
- **Pros:** Zero configuration, auto deploy from Git
- **Cons:** Limited resources for free tier after $5 credit

**DigitalOcean (Most Reliable)**
- **Basic Droplet:** $6/month
- **Specs:** 1GB RAM, 25GB SSD, 1TB transfer
- **PostgreSQL:** Included (self-hosted)
- **Pros:** Reliable, good documentation, Singapore region
- **Cons:** Manual setup required

**Hetzner (Best Value)**
- **CX11 Plan:** €4.5/month (~$5)
- **Specs:** 2GB RAM, 20GB SSD
- **Pros:** Best specs for price, fast in EU
- **Cons:** Server in Germany/Finland only

**Cost Breakdown (VPS):**
```
VPS (Railway/DigitalOcean):  $5-6/month
PostgreSQL:                   $0 (included)
Domain (optional):            $12/year (~$1/month)
SSL Certificate:              $0 (Let's Encrypt free)
Email (Resend):              $0 (100 emails/day free)
Google Drive:                $0 (15GB free)
─────────────────────────────────────────────
TOTAL:                       $6-7/month
```

### 16.2 Vercel Deployment (Alternative)

**Vercel Hobby (Free for Personal)**
- **Frontend:** Unlimited deployments
- **Bandwidth:** 100GB/month
- **Serverless Functions:** 100GB-hours/month
- **Timeout:** 10s (free tier limit)
- **Cons:** Commercial use requires Pro ($20/month)

**Vercel Pro (For Production)**
- **Price:** $20/month
- **Bandwidth:** 1TB/month
- **Timeout:** 60s
- **Team features:** Included

**Database Options:**
- **Neon (Best Free Tier):** 3GB storage, free forever
- **Supabase:** 500MB storage, free tier
- **Vercel Postgres:** 256MB storage (limited)

**Cost Breakdown (Vercel):**
```
Vercel Hobby (personal):      $0/month
Vercel Pro (commercial):      $20/month
Neon PostgreSQL:              $0 (3GB free)
Resend Email:                 $0 (100 emails/day)
Google Drive:                 $0 (15GB free)
─────────────────────────────────────────────
TOTAL (Personal):             $0/month
TOTAL (Commercial):           $20/month
```

### 16.3 Email Service

**Resend (Recommended)**
- **Free Tier:** 100 emails/day, 3,000/month
- **Pro:** $20/month for 50,000 emails
- **Pros:** Modern API, reliable delivery

**Nodemailer + Gmail SMTP (Budget Option)**
- **Free Tier:** 500 emails/day (Gmail limit)
- **Cons:** Less reliable, may be flagged as spam

### 16.4 Google Drive API

- **Storage:** 15GB free per Google account
- **API Requests:** Free (with rate limits: 1000 req/100s)
- **Quota:** Sufficient for small-medium UMKM

### 16.5 Total Cost Comparison

| Deployment | Monthly Cost | Best For |
|------------|-------------|----------|
| **Railway** | $5 | Easiest setup, good for MVP |
| **DigitalOcean** | $6 | Reliable, scalable |
| **Hetzner** | €4.5 (~$5) | Best value, EU region |
| **Vercel (Personal)** | $0 | Personal projects only |
| **Vercel (Commercial)** | $20 | Serverless, auto-scaling |

**Recommendation untuk UMKM:**
- **MVP/Testing:** Railway ($5/month) - easiest
- **Production:** DigitalOcean ($6/month) - reliable & affordable
- **Growth:** Vercel Pro ($20/month) - scalable, zero DevOps

---

## 17. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Google Drive API quota limit** | High | Medium | Implement rate limiting, consider CDN caching for frequently accessed images, monitor quota usage |
| **Google OAuth token expired** | High | Low | Auto-refresh token with googleapis library, implement token expiry check before API calls |
| **VPS downtime** | High | Low | Use reliable provider (DigitalOcean/Railway), setup monitoring alerts, automated backups |
| **Database connection limit** | High | Medium | Use Prisma connection pooling (default), optimize queries, close connections properly |
| **Image upload timeout (large files)** | Medium | Medium | Validate file size on frontend (max 5MB), show upload progress, implement retry mechanism |
| **Email delivery failure** | Medium | Low | Use reliable provider (Resend), implement retry mechanism, log failures for manual follow-up |
| **TypeScript strict mode errors** | Low | High | Proper type definitions from start, avoid `any`, use Zod for runtime validation |
| **Security vulnerabilities** | Critical | Low | Regular dependency updates (`npm audit`), use Helmet.js, input validation, prepared statements |
| **Data loss** | Critical | Low | Automated daily backups, transaction logs, test recovery procedures |
| **Performance degradation** | Medium | Medium | Database indexing, query optimization, implement caching where needed |

---

## 18. Best Practices & Guidelines

### 18.1 Code Style

- **TypeScript:** Strict mode enabled, NO `any` type
- **Naming:** 
  - Variables/functions: camelCase
  - Components/Classes: PascalCase
  - Files: dot notation (e.g., `auth.service.ts`)
- **Imports:** Organize by groups (external, internal, types)
- **Comments:** JSDoc for public functions, inline for complex logic only

### 18.2 Git Workflow

```
main              # Production branch
├── develop       # Development branch
    ├── feature/auth
    ├── feature/products
    └── feature/sales
```

**Commit Message Convention:**
```
feat: add product CRUD endpoints
fix: resolve image upload timeout issue
docs: update API documentation
refactor: simplify transaction service logic
test: add unit tests for auth service
chore: update dependencies
```

### 18.3 Security Checklist

- [x] All passwords hashed with bcrypt (salt rounds: 10)
- [x] JWT tokens with expiration (24h)
- [x] Sensitive data encrypted (Google Drive tokens: AES-256)
- [x] Input validation with Zod on all endpoints
- [x] SQL injection prevention (Prisma prepared statements)
- [x] XSS prevention (sanitize user input)
- [x] CORS configured properly
- [x] Rate limiting on auth endpoints (optional)
- [x] HTTPS only in production
- [x] Environment variables for secrets
- [x] Helmet.js for security headers
- [x] Regular dependency updates

### 18.4 Performance Optimization

- [x] Database indexing on frequently queried columns (email, username, sku)
- [x] Pagination for large datasets
- [x] Lazy loading for images (frontend)
- [x] Debounce for search inputs
- [x] Query optimization (select only needed fields)
- [x] Connection pooling (Prisma default)
- [x] Image compression before upload


---

## 19. Post-MVP Enhancements (Phase 2 & 3)

### Phase 2 (3-6 Months Post-Launch)

**1. Barcode Scanner Support**
- Integrate with camera/scanner hardware
- Auto-fill product by scanning barcode
- Mobile camera support (PWA)

**2. Multi-Store Support**
- One admin can manage multiple stores
- Separate inventory per store
- Store-specific reports

**3. Advanced Inventory Management**
- Purchase orders
- Supplier management
- Stock opname (physical inventory count)
- Low stock notifications (email/WhatsApp)
- Product variants (size, color, etc.)

**4. Payment Gateway Integration**
- QRIS (DANA, OVO, GoPay, LinkAja)
- Credit/Debit card (Midtrans, Xendit)
- Split payment (cash + digital)

**5. Promo & Discount System**
- Voucher codes
- Percentage/fixed discount
- Buy 1 Get 1 promotions
- Time-based promotions

**6. Customer Loyalty Program**
- Points system
- Membership tiers (Bronze, Silver, Gold)
- Rewards & redemption

**7. WhatsApp Integration**
- Order notifications to customer
- Receipt via WhatsApp
- Low stock alerts to admin
- Daily sales report

### Phase 3 (6-12 Months Post-Launch)

**1. Mobile App (Native)**
- React Native or Flutter
- Better offline support
- Push notifications
- Faster performance

**2. Advanced Analytics**
- Profit margin analysis
- Predictive analytics (sales forecasting)
- Customer behavior analysis
- ABC analysis (product categorization)

**3. Integration with Accounting Software**
- Export to QuickBooks, Xero, Jurnal.id
- Automated journal entries
- Tax calculation & reporting

**4. Multi-User POS Terminals**
- Multiple kasir simultaneously
- Queue management
- Shift management
- Cash drawer tracking

**5. Online Store Integration**
- Sync products to Tokopedia, Shopee, Bukalapak
- Unified inventory management
- Order fulfillment tracking

---

## 20. Environment Variables Reference

### Backend `.env`

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Server
NODE_ENV=development|production
PORT=3000

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=24h

# Encryption (for Google Drive tokens)
ENCRYPTION_KEY=your-32-char-encryption-key-exactly!!

# Frontend URL (for CORS & email links)
FRONTEND_URL=http://localhost:5173

# Email Service (Resend)
EMAIL_FROM=noreply@pos-umkm.com
EMAIL_SERVICE=resend
EMAIL_API_KEY=re_your_resend_api_key_here

# Google Drive OAuth2
GDRIVE_REDIRECT_URI=http://localhost:3000/api/settings/gdrive/callback
GDRIVE_CLIENT_ID=              # Set via UI
GDRIVE_CLIENT_SECRET=          # Set via UI
```

### Frontend `.env`

```bash
# API URL
VITE_API_URL=http://localhost:3000/api
```

---

## 21. Package.json Scripts

### Backend `package.json`

```json
{
  "name": "pos-umkm-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:prod": "prisma migrate deploy",
    "prisma:seed": "ts-node prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

### Frontend `package.json`

```json
{
  "name": "pos-umkm-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  }
}
```

---

## 22. Glossary

- **POS:** Point of Sale (sistem kasir)
- **UMKM:** Usaha Mikro Kecil Menengah (Micro, Small, and Medium Enterprises)
- **SKU:** Stock Keeping Unit (kode unik produk)
- **OAuth2:** Open Authorization 2.0 protocol untuk autentikasi dengan Google
- **JWT:** JSON Web Token untuk session management
- **BCrypt:** Library untuk hashing password dengan salt
- **Zod:** TypeScript-first schema validation library
- **Prisma:** Next-generation ORM untuk Node.js & TypeScript
- **Winston:** Logging library untuk Node.js
- **VPS:** Virtual Private Server
- **Serverless:** Functions as a Service (FaaS) - code berjalan tanpa manage server
- **Monorepo:** Single repository containing multiple packages (frontend + backend)
- **Zustand:** Minimal state management library untuk React
- **Feature-Driven:** Struktur folder berdasarkan feature, bukan layer
- **RBAC:** Role-Based Access Control
- **AES-256:** Advanced Encryption Standard dengan 256-bit key
- **CORS:** Cross-Origin Resource Sharing
- **Middleware:** Function yang dieksekusi sebelum/sesudah request handler
- **Repository Pattern:** Design pattern untuk abstraksi data access layer
- **Presenter Pattern:** Design pattern untuk memisahkan business logic dari view (MVP pattern)

---

## 23. Useful Commands

### Development

```bash
# Start local development
docker-compose up

# Stop containers
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild containers
docker-compose up --build

# Run migrations
cd packages/backend
npx prisma migrate dev

# Seed database
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

### Production (VPS)

```bash
# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down

# Update code & redeploy
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Run production migrations
cd packages/backend
npx prisma migrate deploy

# Backup database
pg_dump -U pos_user pos_umkm > backup_$(date +%Y%m%d).sql

# Restore database
psql -U pos_user pos_umkm < backup_20260630.sql
```

### Railway

```bash
# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs

# Run command
railway run npx prisma migrate deploy

# Set environment variable
railway variables set JWT_SECRET=your-secret
```

---

## 24. Support & Resources

### Documentation Links

- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Ant Design:** https://ant.design/
- **Ant Design Charts:** https://charts.ant.design/
- **Prisma:** https://www.prisma.io/docs
- **Express:** https://expressjs.com/
- **Zod:** https://zod.dev/
- **Winston:** https://github.com/winstonjs/winston
- **Google Drive API:** https://developers.google.com/drive/api/guides/about-sdk
- **Railway:** https://docs.railway.app/
- **DigitalOcean:** https://docs.digitalocean.com/
- **Vercel:** https://vercel.com/docs
- **Resend:** https://resend.com/docs
- **Nodemailer:** https://nodemailer.com/

### Community & Support

- **GitHub Repository:** [Your repo URL]
- **Documentation:** [Your docs URL]
- **Issues:** [Your repo]/issues
- **Discussions:** [Your repo]/discussions

---

## 25. Final Summary

### What We've Built

Aplikasi POS UMKM adalah sistem kasir modern berbasis web dengan arsitektur **Feature-Driven** yang:

✅ **Scalable:** Mudah menambah feature baru tanpa mengganggu yang lama  
✅ **Maintainable:** Struktur folder yang jelas dan konsisten  
✅ **Type-Safe:** TypeScript strict mode tanpa `any`  
✅ **Well-Tested:** Unit tests, integration tests, dan E2E tests  
✅ **Production-Ready:** Docker, CI/CD, monitoring, dan backup strategy  
✅ **Cost-Effective:** Mulai dari $5/bulan (Railway) atau gratis (Vercel personal)  

### Key Architectural Decisions

1. **Feature-Driven Structure:** Semua file terkait satu feature dalam satu folder
2. **Dot Notation Naming:** `feature.type.ts` untuk konsistensi
3. **VPS-First Deployment:** No cold start, no timeout limits, full control
4. **TypeScript Strict:** Zero `any`, full type safety
5. **Prisma ORM:** Type-safe database queries
6. **Zod Validation:** Runtime validation dengan TypeScript inference
7. **Winston Logging:** Structured logging untuk debugging
8. **Google Drive Storage:** Cost-effective image storage (15GB free)

### Tech Stack Summary

**Frontend:** React + Vite + Ant Design + TypeScript + Zustand  
**Backend:** Express + Prisma + Zod + Winston + TypeScript  
**Database:** PostgreSQL  
**Infrastructure:** Docker + VPS (Railway/DigitalOcean) atau Vercel  
**Storage:** Google Drive API  
**Email:** Resend / Nodemailer  

### Implementation Timeline

**Total Duration:** 16 Minggu (4 Bulan)

- **Sprint 1-2:** Foundation & Auth (2 minggu)
- **Sprint 3-4:** Products & Google Drive (2 minggu)
- **Sprint 5-6:** Sales & Reports (2 minggu)
- **Sprint 7-8:** Customers & Users (2 minggu)
- **Sprint 9:** Testing (1 minggu)
- **Sprint 10:** Deployment & Docs (1 minggu)

### Success Metrics

- ✅ All CRUD operations working
- ✅ Image upload to Google Drive successful
- ✅ Transaction flow complete (guest & member)
- ✅ Reports generated accurately
- ✅ Email verification working
- ✅ Deployed to production
- ✅ Test coverage > 70%
- ✅ No critical security vulnerabilities
- ✅ Performance < 2s for main pages

### Next Steps

1. **Review & Approve PRD** ✅
2. **Setup Development Environment**
3. **Start Sprint 1: Foundation**
4. **Iterate & Deploy**
5. **Gather User Feedback**
6. **Plan Phase 2 Enhancements**

---

**END OF PRD**

**Version:** 3.0 (Feature-Driven Architecture)  
**Last Updated:** 30 Juni 2026  
**Status:** ✅ Ready for Implementation  
**Estimated Duration:** 16 Weeks (4 Months)  
**Architecture:** Feature-Driven with Dot Notation  
**Deployment:** VPS Primary, Vercel Alternative  

**Sign-off Required:**
- [ ] Product Owner
- [ ] Tech Lead
- [ ] Backend Developer
- [ ] Frontend Developer
- [ ] QA Engineer (optional)

---

**Catatan Penting:**

1. **Feature-Driven Structure** dipilih untuk maintainability & scalability jangka panjang
2. **Dot Notation Naming** untuk konsistensi dan readability
3. **VPS Deployment** diprioritaskan karena no cold start, no timeout, dan cost-effective
4. **Vercel tetap supported** sebagai alternative deployment option
5. **TypeScript Strict Mode** tanpa `any` untuk type safety maksimal
6. **Semua dependencies menggunakan library yang sudah mature dan well-maintained**

**Selamat Coding! 🚀**

