# PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Technical Implementation - Aplikasi POS UMKM**

---

## 1. Executive Summary

**Nama Produk:** POS UMKM  
**Jenis Produk:** Point of Sale berbasis Web untuk UMKM (Responsive: Desktop & Mobile)  
**Target Pengguna:** Admin, Kasir, Customer (Member & Guest)  
**Tanggal:** 30 Juni 2026  
**Version:** 2.0 (Technical Implementation)

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

**Backend:**
- Express.js dengan TypeScript (strict mode, NO `any`)
- Prisma ORM
- PostgreSQL
- Zod (validation)
- Winston (logging)
- JWT (jsonwebtoken) + bcrypt

**Infrastructure:**
- **Local Development:** Docker Compose
- **Production:** Vercel (Frontend + Serverless Functions)
- **Database Production:** Vercel Postgres (Prisma)
- **Storage:** Google Drive API (OAuth2)

**Email Service:**
- Resend / SendGrid / Nodemailer (untuk verifikasi email)

### 1.3 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         PRODUCTION                          │
│                      (Vercel Deployment)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Static Files)     Backend API (Serverless)      │
│  ┌──────────────────────┐    ┌──────────────────────┐     │
│  │  React + Vite + TS   │    │  Express + TS        │     │
│  │  Ant Design          │───▶│  /api/*              │     │
│  │  Zustand             │    │  Zod Validation      │     │
│  └──────────────────────┘    │  Winston Logging     │     │
│                               └──────────┬───────────┘     │
│                                          │                  │
│                                          ▼                  │
│                               ┌──────────────────────┐     │
│                               │  Vercel Postgres     │     │
│                               │  (Prisma ORM)        │     │
│                               └──────────────────────┘     │
│                                          │                  │
│                                          ▼                  │
│                               ┌──────────────────────┐     │
│                               │  Google Drive API    │     │
│                               │  (Image Storage)     │     │
│                               └──────────────────────┘     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                        │
│                    (Docker Compose)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────┐  │
│  │  Frontend        │  │  Backend         │  │  Postgres│  │
│  │  Container       │  │  Container       │  │  (Host)  │  │
│  │  :5173           │──│  :3000           │──│  :5432   │  │
│  └──────────────────┘  └──────────────────┘  └─────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

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

### 2.2 Migration Strategy

```bash
# Initial migration
npx prisma migrate dev --name init

# Seed admin user
npx prisma db seed
```

### 2.3 Seed Data

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

  const category = await prisma.category.upsert({
    where: { name: 'Makanan' },
    update: {},
    create: {
      name: 'Makanan',
      description: 'Kategori makanan',
    },
  });

  const storeSetting = await prisma.storeSetting.create({
    data: {
      storeName: 'Toko Demo',
      address: 'Jl. Contoh No. 123',
      phone: '081234567890',
      email: 'toko@example.com',
    },
  });

  console.log({ admin, cashier, category, storeSetting });
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

## 3. API Specification & Contract

### 3.1 Base URL

- **Local Development:** `http://localhost:3000/api`
- **Production:** `https://pos-umkm.vercel.app/api`

### 3.2 Authentication Flow

#### A. Admin/Kasir Authentication (JWT)

**POST `/api/auth/login`**

Request:
```typescript
{
  username: string;
  password: string;
}
```

Response (200):
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

**GET `/api/auth/me`** (requires Bearer token)

Response (200):
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

**POST `/api/auth/logout`** (requires Bearer token)

Response (200):
```typescript
{
  success: true;
  message: "Logged out successfully"
}
```

#### B. Customer Authentication (Email + Password)

**POST `/api/customer/register`**

Request:
```typescript
{
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}
```

Response (201):
```typescript
{
  success: true;
  message: "Registration successful. Please check your email to verify your account.",
  data: {
    customerId: string;
  }
}
```

**GET `/api/customer/verify-email?token=<token>`**

Response (200):
```typescript
{
  success: true;
  message: "Email verified successfully. You can now login."
}
```

**POST `/api/customer/login`**

Request:
```typescript
{
  email: string;
  password: string;
}
```

Response (200):
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

**POST `/api/customer/resend-verification`**

Request:
```typescript
{
  email: string;
}
```

Response (200):
```typescript
{
  success: true;
  message: "Verification email sent"
}
```

### 3.3 Products Endpoints (Admin Only)

**GET `/api/products`**

Query Params:
```typescript
{
  page?: number;       // default: 1
  limit?: number;      // default: 10
  search?: string;     // search by name or SKU
  categoryId?: string;
}
```

Response (200):
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

**GET `/api/products/:id`**

Response (200):
```typescript
{
  success: true;
  data: Product;
}
```

**POST `/api/products`**

Request:
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

Response (201):
```typescript
{
  success: true;
  data: Product;
}
```

**PUT `/api/products/:id`**

Request: Partial<Product>

Response (200):
```typescript
{
  success: true;
  data: Product;
}
```

**DELETE `/api/products/:id`**

Response (200):
```typescript
{
  success: true;
  message: "Product deleted successfully"
}
```

**POST `/api/products/:id/upload-image`**

Request: `multipart/form-data`
```typescript
{
  image: File; // max 5MB, JPEG/PNG
}
```

Response (200):
```typescript
{
  success: true;
  data: {
    imageUrl: string; // Google Drive URL
  }
}
```

### 3.4 Categories Endpoints (Admin Only)

**GET `/api/categories`**

Response (200):
```typescript
{
  success: true;
  data: Category[];
}
```

**POST `/api/categories`**

Request:
```typescript
{
  name: string;
  description?: string;
}
```

Response (201):
```typescript
{
  success: true;
  data: Category;
}
```

**PUT `/api/categories/:id`**

Request:
```typescript
{
  name?: string;
  description?: string;
}
```

Response (200):
```typescript
{
  success: true;
  data: Category;
}
```

**DELETE `/api/categories/:id`**

Response (200):
```typescript
{
  success: true;
  message: "Category deleted successfully"
}
```

### 3.5 Transactions Endpoints (Kasir)

**POST `/api/transactions`**

Request:
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

Response (201):
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

**GET `/api/transactions/:id`**

Response (200):
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

**GET `/api/transactions/:id/receipt`**

Response (200): HTML string for printing

### 3.6 Reports Endpoints (Admin Only)

**GET `/api/reports/sales`**

Query Params:
```typescript
{
  startDate?: string;  // ISO format
  endDate?: string;    // ISO format
  cashierId?: string;
  categoryId?: string;
}
```

Response (200):
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

**GET `/api/reports/export`**

Query Params:
```typescript
{
  format: "csv" | "pdf";
  startDate?: string;
  endDate?: string;
}
```

Response (200): File download

### 3.7 Customers Endpoints (Admin Only)

**GET `/api/customers`**

Query Params:
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
}
```

Response (200):
```typescript
{
  success: true;
  data: {
    customers: Customer[];
    pagination: {...}
  }
}
```

**GET `/api/customers/:id`**

Response (200):
```typescript
{
  success: true;
  data: Customer;
}
```

**POST `/api/customers`**

Request:
```typescript
{
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}
```

Response (201):
```typescript
{
  success: true;
  data: Customer;
}
```

**PUT `/api/customers/:id`**

Request: Partial<Customer> (exclude password)

Response (200):
```typescript
{
  success: true;
  data: Customer;
}
```

**DELETE `/api/customers/:id`**

Response (200):
```typescript
{
  success: true;
  message: "Customer deleted successfully"
}
```

**GET `/api/customers/:id/transactions`**

Response (200):
```typescript
{
  success: true;
  data: Transaction[];
}
```

### 3.8 Users Endpoints (Admin Only)

**GET `/api/users`**

Response (200):
```typescript
{
  success: true;
  data: User[];
}
```

**POST `/api/users`**

Request:
```typescript
{
  username: string;
  password: string;
  fullName: string;
  role: "ADMIN" | "CASHIER";
}
```

Response (201):
```typescript
{
  success: true;
  data: User;
}
```

**PUT `/api/users/:id`**

Request: Partial<User> (exclude password)

Response (200):
```typescript
{
  success: true;
  data: User;
}
```

**PUT `/api/users/:id/password`**

Request:
```typescript
{
  newPassword: string;
}
```

Response (200):
```typescript
{
  success: true;
  message: "Password updated successfully"
}
```

**DELETE `/api/users/:id`**

Response (200):
```typescript
{
  success: true;
  message: "User deleted successfully"
}
```

### 3.9 Settings Endpoints (Admin Only)

**GET `/api/settings/store`**

Response (200):
```typescript
{
  success: true;
  data: StoreSetting;
}
```

**PUT `/api/settings/store`**

Request: Partial<StoreSetting>

Response (200):
```typescript
{
  success: true;
  data: StoreSetting;
}
```

**POST `/api/settings/store/upload-logo`**

Request: `multipart/form-data`
```typescript
{
  logo: File;
}
```

Response (200):
```typescript
{
  success: true;
  data: {
    logoUrl: string;
  }
}
```

**GET `/api/settings/gdrive`**

Response (200):
```typescript
{
  success: true;
  data: {
    isConnected: boolean;
    lastUpdated?: string;
  }
}
```

**POST `/api/settings/gdrive/authorize`**

Request:
```typescript
{
  clientId: string;
  clientSecret: string;
}
```

Response (200):
```typescript
{
  success: true;
  data: {
    authUrl: string;
  }
}
```

**POST `/api/settings/gdrive/callback`**

Request:
```typescript
{
  code: string;
}
```

Response (200):
```typescript
{
  success: true;
  message: "Google Drive connected successfully"
}
```

**POST `/api/settings/gdrive/test`**

Response (200):
```typescript
{
  success: true;
  message: "Connection successful"
}
```

### 3.10 Public Endpoints (Customer Frontend)

**GET `/api/public/products`**

Query Params:
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

Response (200):
```typescript
{
  success: true;
  data: {
    products: Product[];
    pagination: {...}
  }
}
```

**GET `/api/public/products/:id`**

Response (200):
```typescript
{
  success: true;
  data: Product;
}
```

**GET `/api/public/categories`**

Response (200):
```typescript
{
  success: true;
  data: Category[];
}
```

**GET `/api/customer/transactions`** (requires customer token)

Response (200):
```typescript
{
  success: true;
  data: Transaction[];
}
```


---

## 4. Zod Validation Schemas

### 4.1 Validation Strategy

**File:** `packages/backend/src/validators/schemas.ts`

```typescript
import { z } from 'zod';

// ==================== AUTH SCHEMAS ====================
export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(100),
  }),
});

export const customerRegisterSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    name: z.string().min(2).max(100),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const customerLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  }),
});

// ==================== PRODUCT SCHEMAS ====================
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

// ==================== CATEGORY SCHEMAS ====================
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ==================== TRANSACTION SCHEMAS ====================
export const createTransactionSchema = z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    customerName: z.string().min(1).max(200).optional(),
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    ).min(1),
    cashReceived: z.number().positive(),
  }).refine(
    (data) => data.customerId || data.customerName,
    {
      message: "Either customerId or customerName must be provided",
    }
  ),
});

// ==================== USER SCHEMAS ====================
export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(100),
    fullName: z.string().min(2).max(100),
    role: z.enum(['ADMIN', 'CASHIER']),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50).optional(),
    fullName: z.string().min(2).max(100).optional(),
    role: z.enum(['ADMIN', 'CASHIER']).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(6).max(100),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ==================== CUSTOMER SCHEMAS ====================
export const createCustomerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    name: z.string().min(2).max(100),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ==================== STORE SETTINGS SCHEMAS ====================
export const updateStoreSettingSchema = z.object({
  body: z.object({
    storeName: z.string().min(1).max(200).optional(),
    address: z.string().min(1).max(500).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    currency: z.string().optional(),
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
  }),
});

// ==================== GDRIVE CONFIG SCHEMAS ====================
export const authorizeGDriveSchema = z.object({
  body: z.object({
    clientId: z.string().min(1),
    clientSecret: z.string().min(1),
  }),
});

export const gdriveCallbackSchema = z.object({
  body: z.object({
    code: z.string().min(1),
  }),
});

// ==================== REPORT SCHEMAS ====================
export const getSalesReportSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    cashierId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
  }),
});

export const exportReportSchema = z.object({
  query: z.object({
    format: z.enum(['csv', 'pdf']),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});
```

### 4.2 Validation Middleware

**File:** `packages/backend/src/middleware/validateRequest.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../utils/logger';

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

## 5. Project Structure (Monorepo)

```
pos-umkm/
├── .gitignore
├── .env.example
├── docker-compose.yml
├── README.md
├── vercel.json                     # Vercel configuration
├── package.json                    # Root package.json (workspace)
│
├── api/                            # Vercel Serverless Functions
│   └── index.ts                    # Entry point (wraps Express app)
│
└── packages/
    ├── frontend/
    │   ├── .env.example
    │   ├── .gitignore
    │   ├── Dockerfile
    │   ├── index.html
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── tsconfig.node.json
    │   ├── vite.config.ts
    │   ├── nginx.conf               # For production build
    │   │
    │   ├── public/
    │   │   └── favicon.ico
    │   │
    │   └── src/
    │       ├── main.tsx
    │       ├── App.tsx
    │       ├── vite-env.d.ts
    │       │
    │       ├── assets/              # Static assets
    │       │   └── logo.svg
    │       │
    │       ├── components/
    │       │   ├── common/          # Reusable components
    │       │   │   ├── Loading.tsx
    │       │   │   ├── ErrorBoundary.tsx
    │       │   │   └── ProtectedRoute.tsx
    │       │   │
    │       │   ├── layouts/
    │       │   │   ├── BackofficeLayout.tsx
    │       │   │   ├── CustomerLayout.tsx
    │       │   │   └── AuthLayout.tsx
    │       │   │
    │       │   ├── backoffice/
    │       │   │   ├── Sidebar.tsx
    │       │   │   ├── Header.tsx
    │       │   │   ├── ProductForm.tsx
    │       │   │   ├── SalesCart.tsx
    │       │   │   └── ReportCharts.tsx
    │       │   │
    │       │   └── customer/
    │       │       ├── ProductCard.tsx
    │       │       ├── ProductFilter.tsx
    │       │       └── TransactionCard.tsx
    │       │
    │       ├── pages/
    │       │   ├── auth/
    │       │   │   └── Login.tsx
    │       │   │
    │       │   ├── backoffice/
    │       │   │   ├── Dashboard.tsx
    │       │   │   ├── products/
    │       │   │   │   ├── ProductList.tsx
    │       │   │   │   ├── ProductCreate.tsx
    │       │   │   │   └── ProductEdit.tsx
    │       │   │   ├── sales/
    │       │   │   │   └── SalesPage.tsx
    │       │   │   ├── reports/
    │       │   │   │   └── ReportsPage.tsx
    │       │   │   ├── customers/
    │       │   │   │   ├── CustomerList.tsx
    │       │   │   │   └── CustomerDetail.tsx
    │       │   │   ├── users/
    │       │   │   │   ├── UserList.tsx
    │       │   │   │   └── UserForm.tsx
    │       │   │   └── settings/
    │       │   │       ├── StoreSettings.tsx
    │       │   │       └── GDriveConfig.tsx
    │       │   │
    │       │   └── customer/
    │       │       ├── Catalog.tsx
    │       │       ├── ProductDetail.tsx
    │       │       ├── Login.tsx
    │       │       ├── Register.tsx
    │       │       ├── VerifyEmail.tsx
    │       │       └── TransactionHistory.tsx
    │       │
    │       ├── hooks/
    │       │   ├── useAuth.ts
    │       │   ├── useProducts.ts
    │       │   ├── useTransactions.ts
    │       │   └── useDebounce.ts
    │       │
    │       ├── services/
    │       │   ├── api.ts            # Axios instance
    │       │   ├── auth.service.ts
    │       │   ├── product.service.ts
    │       │   ├── transaction.service.ts
    │       │   ├── customer.service.ts
    │       │   └── report.service.ts
    │       │
    │       ├── stores/
    │       │   ├── authStore.ts      # Zustand store
    │       │   ├── cartStore.ts
    │       │   └── customerStore.ts
    │       │
    │       ├── types/
    │       │   ├── api.types.ts
    │       │   ├── models.types.ts
    │       │   └── index.ts
    │       │
    │       ├── utils/
    │       │   ├── format.ts
    │       │   ├── constants.ts
    │       │   └── storage.ts        # localStorage helper
    │       │
    │       └── routes/
    │           └── index.tsx          # React Router setup
    │
    └── backend/
        ├── .env.example
        ├── .gitignore
        ├── Dockerfile
        ├── package.json
        ├── tsconfig.json
        │
        ├── prisma/
        │   ├── schema.prisma
        │   ├── seed.ts
        │   └── migrations/
        │
        └── src/
            ├── index.ts              # Local development entry
            ├── app.ts                # Express app (exported for Vercel)
            ├── server.ts             # Server setup (local only)
            │
            ├── config/
            │   ├── env.ts            # Environment variables
            │   ├── database.ts       # Prisma client
            │   └── gdrive.ts         # Google Drive config
            │
            ├── middleware/
            │   ├── auth.ts           # JWT verification
            │   ├── roleGuard.ts      # Role-based access control
            │   ├── errorHandler.ts   # Global error handler
            │   ├── validateRequest.ts # Zod validation
            │   └── cors.ts           # CORS config
            │
            ├── routes/
            │   ├── index.ts
            │   ├── auth.routes.ts
            │   ├── products.routes.ts
            │   ├── categories.routes.ts
            │   ├── transactions.routes.ts
            │   ├── reports.routes.ts
            │   ├── customers.routes.ts
            │   ├── users.routes.ts
            │   ├── settings.routes.ts
            │   ├── customer.routes.ts
            │   └── public.routes.ts
            │
            ├── controllers/
            │   ├── auth.controller.ts
            │   ├── products.controller.ts
            │   ├── categories.controller.ts
            │   ├── transactions.controller.ts
            │   ├── reports.controller.ts
            │   ├── customers.controller.ts
            │   ├── users.controller.ts
            │   ├── settings.controller.ts
            │   ├── customer.controller.ts
            │   └── public.controller.ts
            │
            ├── services/
            │   ├── auth.service.ts
            │   ├── products.service.ts
            │   ├── categories.service.ts
            │   ├── transactions.service.ts
            │   ├── reports.service.ts
            │   ├── customers.service.ts
            │   ├── users.service.ts
            │   ├── settings.service.ts
            │   ├── gdrive.service.ts
            │   ├── upload.service.ts
            │   └── email.service.ts
            │
            ├── repositories/
            │   ├── user.repository.ts
            │   ├── customer.repository.ts
            │   ├── product.repository.ts
            │   ├── category.repository.ts
            │   ├── transaction.repository.ts
            │   └── settings.repository.ts
            │
            ├── types/
            │   ├── express.d.ts      # Express type extensions
            │   ├── models.ts         # Prisma model types
            │   └── api.ts            # API request/response types
            │
            ├── utils/
            │   ├── jwt.ts            # JWT utilities
            │   ├── bcrypt.ts         # Password hashing
            │   ├── encryption.ts     # AES-256 encryption
            │   ├── validators.ts     # Custom validators
            │   ├── fileNaming.ts     # File naming utility
            │   ├── logger.ts         # Winston logger
            │   └── errors.ts         # Custom error classes
            │
            └── validators/
                └── schemas.ts        # Zod schemas
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
    container_name: pos-backend
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
    depends_on:
      - frontend
    networks:
      - pos-network
    command: npm run dev

  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
    container_name: pos-frontend
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

networks:
  pos-network:
    driver: bridge
```

### 6.2 Backend Dockerfile

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

### 6.3 Frontend Dockerfile

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

# Development command (will be overridden by docker-compose)
CMD ["npm", "run", "dev"]
```

### 6.4 Environment Variables

**File:** `.env.example` (root)

```bash
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENCRYPTION_KEY=your-32-char-encryption-key-here!!

# Email Service (Resend)
EMAIL_API_KEY=re_your_resend_api_key_here
```

**File:** `packages/backend/.env.example`

```bash
# Database
DATABASE_URL=postgresql://pos_user:pos_password@localhost:5432/pos_umkm

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Encryption (for Google Drive tokens)
ENCRYPTION_KEY=your-32-char-encryption-key-here!!

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Service
EMAIL_FROM=noreply@pos-umkm.com
EMAIL_SERVICE=resend
EMAIL_API_KEY=re_your_resend_api_key_here

# Google Drive (akan diisi dari UI)
GDRIVE_CLIENT_ID=
GDRIVE_CLIENT_SECRET=
GDRIVE_REDIRECT_URI=http://localhost:3000/api/settings/gdrive/callback
```

**File:** `packages/frontend/.env.example`

```bash
VITE_API_URL=http://localhost:3000/api
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
    "typeRoots": ["./node_modules/@types", "./src/types"]
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
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**File:** `packages/frontend/tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 7.3 Express Type Extensions

**File:** `packages/backend/src/types/express.d.ts`

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

## 8. Winston Logging Strategy

### 8.1 Logger Configuration

**File:** `packages/backend/src/utils/logger.ts`

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

### 8.2 Logging Usage Examples

```typescript
import { logger } from '../utils/logger';

// Info logging
logger.info('User logged in', { userId: user.id, username: user.username });

// Error logging
logger.error('Failed to upload image to Google Drive', {
  error: error.message,
  stack: error.stack,
  productId: product.id,
});

// Debug logging (development only)
logger.debug('Product validation passed', { product });

// Warning logging
logger.warn('Stock below threshold', {
  productId: product.id,
  currentStock: product.stock,
  threshold: product.stockAlertThreshold,
});
```

### 8.3 Request Logging Middleware

**File:** `packages/backend/src/middleware/requestLogger.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

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

## 9. Authentication Implementation

### 9.1 JWT Utilities

**File:** `packages/backend/src/utils/jwt.ts`

```typescript
import jwt from 'jsonwebtoken';
import { logger } from './logger';

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

### 9.2 Password Hashing Utilities

**File:** `packages/backend/src/utils/bcrypt.ts`

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

### 9.3 Auth Middleware

**File:** `packages/backend/src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

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
      name: '', // Will be fetched from DB if needed
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

### 9.4 Role Guard Middleware

**File:** `packages/backend/src/middleware/roleGuard.ts`

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

## 10. Email Verification Implementation

### 10.1 Email Service

**File:** `packages/backend/src/services/email.service.ts`

```typescript
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

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

### 10.2 Email Verification Flow

**File:** `packages/backend/src/services/customer.service.ts` (excerpt)

```typescript
import { randomBytes } from 'crypto';
import { hashPassword } from '../utils/bcrypt';
import { sendVerificationEmail } from './email.service';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export const registerCustomer = async (data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}) => {
  const existingCustomer = await prisma.customer.findUnique({
    where: { email: data.email },
  });

  if (existingCustomer) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(data.password);
  const emailVerifyToken = randomBytes(32).toString('hex');
  const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const customer = await prisma.customer.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      phone: data.phone,
      address: data.address,
      isEmailVerified: false,
      emailVerifyToken,
      emailVerifyExpiry,
    },
  });

  await sendVerificationEmail(customer.email, customer.name, emailVerifyToken);

  logger.info('Customer registered', { customerId: customer.id, email: customer.email });

  return customer;
};

export const verifyEmail = async (token: string) => {
  const customer = await prisma.customer.findUnique({
    where: { emailVerifyToken: token },
  });

  if (!customer) {
    throw new Error('Invalid verification token');
  }

  if (customer.emailVerifyExpiry && customer.emailVerifyExpiry < new Date()) {
    throw new Error('Verification token expired');
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpiry: null,
    },
  });

  logger.info('Email verified', { customerId: customer.id });

  return customer;
};
```

---

## 11. Google Drive Upload Implementation

### 11.1 File Naming Utility

**File:** `packages/backend/src/utils/fileNaming.ts`

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

### 11.2 Google Drive Service

**File:** `packages/backend/src/services/gdrive.service.ts`

```typescript
import { google } from 'googleapis';
import { Readable } from 'stream';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { decrypt, encrypt } from '../utils/encryption';

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
      parents: ['root'], // Upload to root folder, can be configured
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

    // Make file publicly accessible (optional)
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

### 11.3 Encryption Utilities (for Google Drive tokens)

**File:** `packages/backend/src/utils/encryption.ts`

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

### 11.4 Upload Service (Product Image)

**File:** `packages/backend/src/services/upload.service.ts`

```typescript
import { generateDriveFileName } from '../utils/fileNaming';
import { uploadToDrive } from './gdrive.service';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

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

## 12. Vercel Deployment Configuration

### 12.1 Vercel Configuration

**File:** `vercel.json` (root)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "packages/frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/packages/frontend/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 12.2 Serverless Function Entry Point

**File:** `api/index.ts`

```typescript
import { app } from '../packages/backend/src/app';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
```

### 12.3 Express App (Exportable for Vercel)

**File:** `packages/backend/src/app.ts`

```typescript
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { logger } from './utils/logger';

export const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

logger.info('Express app initialized');

export default app;
```

### 12.4 Local Server (Development Only)

**File:** `packages/backend/src/server.ts`

```typescript
import { app } from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL}`);
});
```

### 12.5 Package.json Scripts

**File:** `packages/backend/package.json`

```json
{
  "name": "pos-umkm-backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "dependencies": {
    "@prisma/client": "^5.14.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "googleapis": "^140.0.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.13",
    "winston": "^3.13.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.14.2",
    "@types/nodemailer": "^6.4.15",
    "@typescript-eslint/eslint-plugin": "^7.13.0",
    "@typescript-eslint/parser": "^7.13.0",
    "eslint": "^8.57.0",
    "prettier": "^3.3.2",
    "prisma": "^5.14.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.5"
  }
}
```

**File:** `packages/frontend/package.json`

```json
{
  "name": "pos-umkm-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "antd": "^5.18.1",
    "axios": "^1.7.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.13.0",
    "@typescript-eslint/parser": "^7.13.0",
    "@vitejs/plugin-react": "^4.3.1",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "prettier": "^3.3.2",
    "typescript": "^5.4.5",
    "vite": "^5.3.1"
  }
}
```

### 12.6 Vite Configuration

**File:** `packages/frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

### 12.7 Environment Variables for Vercel

**Vercel Dashboard → Project Settings → Environment Variables:**

```bash
# Backend
DATABASE_URL=postgresql://user:pass@host.vercel-postgres.com:5432/dbname
JWT_SECRET=your-production-jwt-secret-here
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=your-32-char-encryption-key-prod
FRONTEND_URL=https://pos-umkm.vercel.app
EMAIL_FROM=noreply@pos-umkm.com
EMAIL_SERVICE=resend
EMAIL_API_KEY=re_your_production_resend_key
NODE_ENV=production

# Google Drive (will be configured via UI)
GDRIVE_REDIRECT_URI=https://pos-umkm.vercel.app/api/settings/gdrive/callback
```

**Frontend Environment Variables:**

```bash
VITE_API_URL=https://pos-umkm.vercel.app/api
```

### 12.8 Deployment Steps

#### Local Development:

```bash
# 1. Setup PostgreSQL di host
sudo -u postgres psql
CREATE DATABASE pos_umkm;
CREATE USER pos_user WITH PASSWORD 'pos_password';
GRANT ALL PRIVILEGES ON DATABASE pos_umkm TO pos_user;

# 2. Clone & install dependencies
git clone <repo-url>
cd pos-umkm
npm install --workspaces

# 3. Setup environment variables
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env

# Edit .env files with your values

# 4. Run Prisma migrations
cd packages/backend
npx prisma migrate dev
npx prisma db seed

# 5. Start Docker Compose
cd ../..
docker-compose up
```

#### Production Deployment (Vercel):

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project
vercel link

# 4. Setup Vercel Postgres
# Go to Vercel Dashboard → Storage → Create Database → Postgres
# Copy DATABASE_URL

# 5. Set environment variables
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
# ... (add all env vars)

# 6. Deploy
vercel --prod

# 7. Run migrations on production
# Option A: Use Vercel CLI
vercel exec -- npx prisma migrate deploy

# Option B: Manually via Prisma Studio
# Connect to production DB and run migrations
```

---

## 13. Implementation Checklist

### Sprint 1: Foundation & Setup (Week 1-2)

**Backend:**
- [ ] Setup monorepo structure
- [ ] Setup Docker Compose
- [ ] Setup PostgreSQL di host
- [ ] Create Prisma schema
- [ ] Run initial migration
- [ ] Create seed data (admin, kasir, categories)
- [ ] Setup Express app with TypeScript (strict)
- [ ] Setup Winston logger
- [ ] Implement JWT utilities
- [ ] Implement bcrypt utilities
- [ ] Implement auth middleware
- [ ] Implement role guard middleware
- [ ] Implement error handler middleware
- [ ] Implement Zod validation middleware
- [ ] Create auth routes (login, logout, me)
- [ ] Test auth endpoints via Postman/Thunder Client

**Frontend:**
- [ ] Setup React + Vite + TypeScript (strict)
- [ ] Install Ant Design
- [ ] Setup React Router
- [ ] Setup Zustand store (auth)
- [ ] Create Axios instance with interceptors
- [ ] Create auth service
- [ ] Create login page (Admin/Kasir)
- [ ] Create protected route component
- [ ] Create backoffice layout (Sidebar + Header)
- [ ] Test login flow

**Dependencies to Install:**

Backend:
```bash
cd packages/backend
npm install express cors helmet jsonwebtoken bcrypt zod winston multer googleapis nodemailer @prisma/client
npm install -D typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcrypt @types/multer @types/nodemailer ts-node-dev prisma
```

Frontend:
```bash
cd packages/frontend
npm install react react-dom react-router-dom antd axios zustand
npm install -D typescript @types/react @types/react-dom @vitejs/plugin-react vite
```

---

### Sprint 2: Products & Categories (Week 3-4)

**Backend:**
- [ ] Create product repository
- [ ] Create product service (CRUD)
- [ ] Create category repository
- [ ] Create category service (CRUD)
- [ ] Create product validation schemas (Zod)
- [ ] Create category validation schemas (Zod)
- [ ] Create product routes (with role guard: ADMIN only)
- [ ] Create category routes (with role guard: ADMIN only)
- [ ] Create product controller
- [ ] Create category controller
- [ ] Test CRUD endpoints

**Frontend:**
- [ ] Create product list page (table with pagination)
- [ ] Create product form (create/edit)
- [ ] Create category management modal
- [ ] Create product service
- [ ] Create category service
- [ ] Integrate with backend API
- [ ] Add search & filter functionality
- [ ] Test product CRUD operations

---

### Sprint 3: Google Drive Integration (Week 5-6)

**Backend:**
- [ ] Create encryption utilities (AES-256)
- [ ] Create file naming utility
- [ ] Create Google Drive service (OAuth2)
- [ ] Create upload service
- [ ] Create GDrive config routes
- [ ] Create GDrive config controller
- [ ] Setup multer middleware for file upload
- [ ] Create upload endpoint (POST /api/products/:id/upload-image)
- [ ] Test OAuth2 flow
- [ ] Test file upload

**Frontend:**
- [ ] Create Google Drive configuration page
- [ ] Create step-by-step setup guide (UI)
- [ ] Create authorization flow
- [ ] Create test connection button
- [ ] Add image upload to product form (drag & drop)
- [ ] Show upload progress
- [ ] Display image preview
- [ ] Test end-to-end upload flow

---

### Sprint 4: Sales/Transactions (Week 7-8)

**Backend:**
- [ ] Create transaction repository
- [ ] Create transaction service
- [ ] Create transaction validation schema (Zod)
- [ ] Create transaction routes (CASHIER only)
- [ ] Create transaction controller
- [ ] Implement stock reduction logic
- [ ] Generate transaction code (auto-increment)
- [ ] Calculate total, cash received, cash return
- [ ] Create receipt generation (HTML template)
- [ ] Test transaction creation

**Frontend:**
- [ ] Create sales page (Kasir)
- [ ] Create product search/selection
- [ ] Create cart component (Zustand store)
- [ ] Create customer selection (Member dropdown / Guest input)
- [ ] Create payment input (cash received)
- [ ] Show kembalian calculation
- [ ] Create receipt modal (HTML, printable)
- [ ] Implement print functionality
- [ ] Test complete sales flow

---

### Sprint 5: Reports & Dashboard (Week 9-10)

**Backend:**
- [ ] Create report service
- [ ] Implement sales report query (Prisma aggregations)
- [ ] Calculate metrics (total sales, top products, etc.)
- [ ] Create CSV export utility
- [ ] Create PDF export utility (puppeteer or jsPDF)
- [ ] Create report routes (ADMIN only)
- [ ] Create report controller
- [ ] Test report endpoints

**Frontend:**
- [ ] Create dashboard page (Admin)
- [ ] Display key metrics (cards)
- [ ] Create sales chart (Ant Design Charts or Recharts)
- [ ] Create top products chart
- [ ] Create reports page with filters
- [ ] Implement date range picker
- [ ] Implement export buttons (CSV, PDF)
- [ ] Test reports generation

---

### Sprint 6: Customer Management & Authentication (Week 11-12)

**Backend:**
- [ ] Create customer repository
- [ ] Create customer service (CRUD + auth)
- [ ] Create email service (Nodemailer + Resend)
- [ ] Implement customer registration
- [ ] Implement email verification flow
- [ ] Implement customer login
- [ ] Create customer routes
- [ ] Create customer controller
- [ ] Create public routes (catalog, product detail)
- [ ] Test customer auth flow

**Frontend:**
- [ ] Create customer frontend layout
- [ ] Create customer registration page
- [ ] Create email verification page
- [ ] Create customer login page
- [ ] Create product catalog page (responsive grid)
- [ ] Create product detail page
- [ ] Create transaction history page (member only)
- [ ] Create customer profile page
- [ ] Test customer flows (register, verify, login, browse)

---

### Sprint 7: User Management & Store Settings (Week 13-14)

**Backend:**
- [ ] Create user service (CRUD)
- [ ] Create user validation schemas
- [ ] Create user routes (ADMIN only)
- [ ] Create user controller
- [ ] Create store settings service
- [ ] Create store settings routes
- [ ] Create store settings controller
- [ ] Test user management
- [ ] Test store settings

**Frontend:**
- [ ] Create user list page (Admin)
- [ ] Create user form (create/edit)
- [ ] Create password change modal
- [ ] Create store settings page
- [ ] Implement logo upload
- [ ] Test user management
- [ ] Test store settings

---

### Sprint 8: Testing & Bug Fixes (Week 15)

- [ ] Unit tests for critical services (Jest)
- [ ] Integration tests for API endpoints (Supertest)
- [ ] E2E tests for critical flows (Cypress/Playwright)
- [ ] Fix bugs found during testing
- [ ] Performance optimization
- [ ] Security audit (check for SQL injection, XSS, etc.)
- [ ] Code review & refactoring

---

### Sprint 9: Deployment & Documentation (Week 16)

- [ ] Prepare Vercel configuration
- [ ] Setup Vercel Postgres
- [ ] Deploy backend to Vercel
- [ ] Deploy frontend to Vercel
- [ ] Setup environment variables
- [ ] Run production migrations
- [ ] Seed production data (admin user)
- [ ] Test production environment
- [ ] Setup error monitoring (Sentry)
- [ ] Write README.md
- [ ] Write API documentation
- [ ] Write user manual (for Admin/Kasir)
- [ ] Create video tutorial (optional)

---

## 14. Error Handling Strategy

### 14.1 Custom Error Classes

**File:** `packages/backend/src/utils/errors.ts`

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

### 14.2 Global Error Handler

**File:** `packages/backend/src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

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

## 15. Cost Estimation & Free Tier Limits

### 15.1 Vercel

**Free Tier (Hobby):**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth per month
- ✅ Serverless Functions: 100GB-hours execution time
- ✅ 10s execution timeout (for free tier)
- ❌ Commercial use not allowed (need Pro: $20/month)

**Pro Tier ($20/month):**
- ✅ Commercial use allowed
- ✅ 1TB bandwidth
- ✅ 1000GB-hours execution time
- ✅ 60s execution timeout

### 15.2 Vercel Postgres (Powered by Neon)

**Free Tier (Hobby):**
- ✅ 256MB storage
- ✅ 60 hours compute time per month
- ❌ Not suitable for production (limited storage)

**Pro Tier ($20/month):**
- ✅ 512MB storage
- ✅ 100 hours compute time
- Still limited for growing app

**Recommendation:** Use external PostgreSQL
- **Supabase:** Free tier 500MB storage (better)
- **Neon:** Free tier 3GB storage (best for free)
- **Railway:** $5/month for 1GB storage

### 15.3 Email Service (Resend)

**Free Tier:**
- ✅ 100 emails per day
- ✅ 3,000 emails per month
- ✅ Good for MVP

**Pro Tier ($20/month):**
- ✅ 50,000 emails per month

### 15.4 Google Drive API

**Free Tier:**
- ✅ 15GB storage per Google account
- ✅ Unlimited API requests (with rate limits)
- ✅ 1000 requests per 100 seconds per user

### 15.5 Total Cost Estimation

**MVP (Free Tier):**
- Vercel: $0 (Hobby, non-commercial)
- PostgreSQL: $0 (Neon free tier 3GB)
- Resend: $0 (100 emails/day)
- Google Drive: $0 (15GB storage)
- **Total: $0/month**

**Production (Minimal):**
- Vercel Pro: $20/month
- PostgreSQL (Neon Pro): $19/month (or Supabase Pro $25/month)
- Resend: $0 (if <100 emails/day) or $20/month
- Google Drive: $0
- **Total: $39-59/month**

**Alternative (More Affordable):**
- Railway: $5/month (backend + PostgreSQL)
- Netlify: $0 (frontend static hosting)
- Resend: $0 or $20/month
- Google Drive: $0
- **Total: $5-25/month**

---

## 16. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Vercel cold start (serverless) | Medium | High | Use Vercel Pro for lower cold start, or use Railway for traditional hosting |
| Vercel 10s timeout (free tier) | High | Medium | Optimize queries, use background jobs for heavy tasks, or upgrade to Pro |
| Google Drive API quota limit | High | Medium | Implement rate limiting, consider CDN caching for images |
| Google OAuth token expired | High | Low | Auto-refresh token before expiry with googleapis library |
| Email delivery failure | Medium | Low | Implement retry mechanism, log failures, use reliable provider (Resend) |
| PostgreSQL connection limit | High | Medium | Use connection pooling (Prisma default), optimize queries |
| Image upload size limit | Low | Medium | Validate file size on frontend & backend (max 5MB) |
| TypeScript strict mode errors | Low | High | Proper type definitions, avoid `any`, use Zod for runtime validation |
| Security vulnerabilities | Critical | Low | Regular dependency updates, use Helmet, input validation, prepared statements (Prisma) |
| Data loss | Critical | Low | Automated daily backups, transaction logs, disaster recovery plan |

---

## 17. Best Practices & Guidelines

### 17.1 Code Style

- **TypeScript:** Strict mode enabled, NO `any` type
- **Naming:** camelCase for variables/functions, PascalCase for components/classes
- **File naming:** kebab-case for files (e.g., `user.service.ts`)
- **Imports:** Absolute imports using `@/` alias for frontend
- **Comments:** JSDoc for public functions, inline comments for complex logic

### 17.2 Git Workflow

```bash
main              # Production branch
├── develop       # Development branch
    ├── feature/product-crud
    ├── feature/google-drive
    └── feature/sales-module
```

**Commit Message Convention:**
```
feat: add product CRUD endpoints
fix: resolve image upload timeout issue
docs: update API documentation
refactor: simplify transaction service logic
test: add unit tests for auth service
```

### 17.3 Security Checklist

- [ ] All passwords hashed with bcrypt (salt rounds: 10)
- [ ] JWT tokens with expiration (24h)
- [ ] Sensitive data encrypted (Google Drive tokens: AES-256)
- [ ] Input validation with Zod on all endpoints
- [ ] SQL injection prevention (Prisma prepared statements)
- [ ] XSS prevention (sanitize user input)
- [ ] CSRF protection (SameSite cookies, CORS config)
- [ ] Rate limiting on auth endpoints
- [ ] HTTPS only in production
- [ ] Environment variables for secrets (never commit .env)
- [ ] Helmet.js for security headers
- [ ] Regular dependency updates (npm audit)

### 17.4 Performance Optimization

- [ ] Database indexing on frequently queried columns (email, username, sku)
- [ ] Pagination for large datasets (products, transactions)
- [ ] Lazy loading for images (frontend)
- [ ] Debounce for search inputs (frontend)
- [ ] Query optimization (select only needed fields)
- [ ] Connection pooling (Prisma default)
- [ ] Image compression before upload (frontend)
- [ ] CDN for static assets (Vercel default)

---

## 18. Post-MVP Enhancements

### Phase 2 (Optional Features):

1. **Barcode Scanner Support:**
   - Integrate with camera/scanner hardware
   - Auto-fill product by scanning barcode

2. **Multi-Store Support:**
   - One admin manage multiple stores
   - Separate inventory per store

3. **Advanced Inventory:**
   - Purchase orders
   - Supplier management
   - Stock opname
   - Low stock notifications (email/WhatsApp)

4. **Payment Gateway Integration:**
   - QRIS (DANA, OVO, GoPay)
   - Credit/Debit card (Midtrans, Xendit)

5. **Promo & Discount:**
   - Voucher codes
   - Percentage/fixed discount
   - Buy 1 Get 1 promotions

6. **Customer Loyalty Program:**
   - Points system
   - Membership tiers
   - Rewards

7. **WhatsApp Integration:**
   - Order notifications
   - Receipt via WhatsApp
   - Low stock alerts

8. **Mobile App (Native):**
   - React Native or Flutter
   - Better offline support
   - Push notifications

9. **Advanced Analytics:**
   - Profit margin analysis
   - Predictive analytics (sales forecasting)
   - Customer behavior analysis

10. **Export to Accounting Software:**
    - Integrate with QuickBooks, Xero, etc.

---

## 19. Support & Maintenance

### 19.1 Monitoring

**Tools:**
- **Sentry:** Error tracking & performance monitoring
- **Vercel Analytics:** Page views, performance metrics
- **Winston Logs:** Backend logs (local development)
- **Prisma Studio:** Database inspection

### 19.2 Backup Strategy

**Database Backup:**
- Automated daily backups (Vercel Postgres/Neon)
- Manual backup before major migrations
- Backup retention: 30 days

**Google Drive Config Backup:**
- Encrypted tokens stored in database
- Export config before deployment

### 19.3 Update Strategy

**Dependencies:**
- Monthly: Check for security updates (`npm audit`)
- Quarterly: Update all dependencies to latest stable

**Database Migrations:**
- Always test migrations in staging first
- Use Prisma migrate with rollback plan

---

## 20. Glossary

- **POS:** Point of Sale (sistem kasir)
- **UMKM:** Usaha Mikro Kecil Menengah
- **SKU:** Stock Keeping Unit (kode unik produk)
- **OAuth2:** Open Authorization protocol
- **JWT:** JSON Web Token
- **BCrypt:** Password hashing library
- **Zod:** TypeScript-first schema validation
- **Prisma:** Next-generation ORM
- **Vercel:** Serverless deployment platform
- **Serverless Functions:** Functions as a Service (FaaS)
- **Monorepo:** Single repository containing multiple packages
- **Zustand:** Minimal state management library
- **Winston:** Logging library
- **RBAC:** Role-Based Access Control
- **AES-256:** Advanced Encryption Standard (256-bit)

---

## 21. Contact & Resources

### Documentation Links:

- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Ant Design:** https://ant.design/
- **Prisma:** https://www.prisma.io/docs
- **Express:** https://expressjs.com/
- **Zod:** https://zod.dev/
- **Winston:** https://github.com/winstonjs/winston
- **Google Drive API:** https://developers.google.com/drive/api/guides/about-sdk
- **Vercel:** https://vercel.com/docs
- **Resend:** https://resend.com/docs

### Support:

- **GitHub Issues:** [Your repo issues URL]
- **Email:** support@pos-umkm.com
- **Documentation:** [Your docs URL]

---

**END OF TECHNICAL PRD**

**Version:** 2.0  
**Last Updated:** 30 Juni 2026  
**Status:** Ready for Implementation  
**Estimated Duration:** 16 Weeks (4 Months)  

**Sign-off:**
- [ ] Product Owner
- [ ] Tech Lead
- [ ] Backend Developer
- [ ] Frontend Developer
- [ ] QA Engineer

