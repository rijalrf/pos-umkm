# AGENTS.md — POS UMKM

Monorepo dua paket mandiri (tanpa root package.json). Semua komunikasi dalam **Bahasa Indonesia**.

## Perintah Penting

| Package | Dev | Build | Test | Lain |
|---|---|---|---|---|
| `packages/backend` | `npm run dev` (ts-node-dev) | `npm run build` (tsc) | `npm test` (Jest+supertest) | `npm run seed`, `npm run prisma:generate`, `npm run prisma:migrate` |
| `packages/frontend` | `npm run dev` (Vite) | `npm run build` (tsc && vite build) | — | — |

- Backend entry: `packages/backend/src/server.ts` → `app.ts`
- Frontend entry: `packages/frontend/src/main.tsx`
- Tidak ada ESLint/Prettier. Type-check: `npx tsc --noEmit` (di masing-masing paket).

## Arsitektur

**Feature-driven** — semua file satu domain di satu folder:

```
packages/backend/src/features/<feature>/
├── *.routes.ts       # Router + middleware auth/role
├── *.controller.ts   # instance class, panggil service
├── *.service.ts      # instance class, business logic
├── *.repository.ts   # instance class, Prisma queries
├── *.schema.ts       # Zod validation + derived types
└── *.types.ts        # feature-specific types

packages/frontend/src/features/<feature>/
├── *.view.tsx        # UI only (Ant Design + CSS class)
├── *.presenter.ts    # state management + panggil service
├── *.service.ts      # static methods, Axios via api.lib
├── *.columns.tsx     # TableColumnsType<T> (jika perlu)
└── *.types.ts        # feature-specific types
```

Backend routes terdaftar di `app.ts:42-51` dengan prefix `/api/...`.

## Aturan Kode (Frontend)

- **Presenter → Object pattern WAJIB** `const presenter = useXPresenter()` lalu `presenter.loading`, bukan destructuring.
- **View DILARANG import service** langsung. Semua lewat presenter.
- **DILARANG inline CSS** (`style={{}}`). Pakai CSS class + CSS variables dari `index.css`.
- **DILARANG `any`**. Untuk error: `catch (err: unknown)` + `instanceof AxiosError`.
- **Table columns**: `TableColumnsType<T>` dari antd, render kompleks ekstrak ke komponen terpisah.
- **Pagination**: pakai `DEFAULT_PAGINATION` dari `libs/pagination.lib`.
- **Design system**: lihat `DESIGN.md` dan `App.tsx` (ConfigProvider token).

## Aturan Kode (Backend)

- **DILARANG `new Error()` + `statusCode`**. WAJIB `NotFoundError`, `BadRequestError`, dll dari `shared/utils/errors.util.ts`.
- **Service DILARANG akses Prisma langsung**. Harus lewat Repository.
- **DILARANG `console.log`**. WAJIB `logger` dari `shared/utils/logger.util.ts`.
- **DILARANG `process.env` langsung**. WAJIB `env` dari `config/env.config.ts`.
- **Zod validation** untuk semua request body/params/query via `validate` middleware.
- **Response format**: `{ success: true, data }` atau `{ success: false, message }`.

## Catatan Penting

- Database: PostgreSQL via Prisma (`packages/backend/prisma/schema.prisma`). Jalanin `prisma:migrate` setiap schema berubah.
- Frontend API base: `VITE_API_URL` env var (default `http://localhost:3000/api`).
- Token auth dikirim otomatis via Axios interceptor (`api.lib.ts`).
- Service di `categories.service.ts` **masih melanggar** aturan 8.1 (masih pakai `new Error()` + `statusCode`). Jika disentuh, perbaiki ke shared errors.
- Frontend service pakai **static methods**, backend service pakai **instance methods**.
