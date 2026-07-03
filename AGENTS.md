# AI Coding Agent Guidelines - POS UMKM

Welcome! To maintain code quality, consistency, and structural integrity across the POS UMKM project, all AI agents (and human developers) must adhere to the following rules and standards.

---

## 1. Project Architecture (Feature-Driven)

This project uses a **Feature-Driven Architecture** instead of a layer-first structure. All files related to a single domain/feature must live in the same folder.

### 1.1 Backend Feature Module Structure
Every feature module in `packages/backend/src/features/<feature>/` should contain:
- `*.routes.ts`: Router configuration & endpoints.
- `*.controller.ts`: Request/response handling, input mapping.
- `*.service.ts`: Core business logic, transactional operations.
- `*.repository.ts`: Database interactions via Prisma.
- `*.schema.ts`: Request payload validation via Zod.
- `*.types.ts`: TypeScript interfaces/types specific to the feature.

*Example structure:*
```
src/features/auth/
├── auth.routes.ts
├── auth.controller.ts
├── auth.service.ts
├── auth.repository.ts
├── auth.schema.ts
└── auth.types.ts
```

### 1.2 Frontend Feature Module Structure
Every feature module in `packages/frontend/src/features/<feature>/` should contain:
- `*.view.tsx`: Pure or thin UI views using Ant Design components.
- `*.presenter.ts`: State management and business logic for the views.
- `*.service.ts`: HTTP request client interactions (Axios).
- `*.store.ts` (if needed): Zustand state stores.

*Example structure:*
```
src/features/products/
├── product-list.view.tsx
├── product-form.view.tsx
├── products.presenter.ts
└── products.service.ts
```

---

## 2. Naming Conventions (Dot Notation)

Files must be named using camelCase or kebab-case combined with the layer type, separated by dots:
- **Backend:** `[feature].[layer].ts` (e.g., `auth.controller.ts`, `products.routes.ts`)
- **Frontend Views:** `[component-name].view.tsx` (e.g., `product-list.view.tsx`, `login.view.tsx`)
- **Frontend Presenters:** `[feature].presenter.ts` (e.g., `products.presenter.ts`)
- **Frontend Services:** `[feature].service.ts`
- **Hooks:** `use-[name].hook.ts` (e.g., `use-auth.hook.ts`)
- **Zustand Stores:** `[feature].store.ts` (e.g., `auth.store.ts`)
- **Shared Utilities:** `[name].util.ts` or `[name].lib.ts`

---

## 3. Strict TypeScript & Code Quality Rules

1. **Strict Type Safety:**
   - Strict mode is enabled (`strict: true`).
   - Do **NOT** use `any`. Use custom types, interfaces, `unknown`, or generic parameters.
   - Run type checks (`tsc --noEmit`) before completing any major feature.

2. **Zod Validation:**
   - Every request body, query parameter, or route parameter on the Backend must be validated using Zod schemas via the custom `validate` middleware.
   - Use Zod schemas to infer TypeScript types where applicable (e.g. `type LoginInput = z.infer<typeof loginSchema>['body']`).

3. **Error Handling & Response Format:**
   - Backend APIs must return responses in a standard JSON format:
     - Success: `{ success: true, data: ... }` or `{ success: true, message: "..." }`
     - Failure: `{ success: false, message: "...", errors?: [...] }`
   - Use Express error-handling middleware (`error-handler.middleware.ts`) to catch unhandled errors and format them safely.
   - Do **NOT** expose database error stack traces in production. Use the Winston logger to log details on the server, and return generic messages to the client.

4. **Winston Logging:**
   - Use the custom Winston logger (`logger.util.ts`) for all application logs.
   - Use descriptive log levels: `error` for system failures, `warn` for validation issues/client errors, `info` for startup/connections, and `debug` for temporary troubleshooting.

5. **DRY (Don't Repeat Yourself) Principle:**
   - **CRITICAL:** Do **NOT** duplicate code, styles, or configuration. AI agents and developers must strictly reuse existing utility functions, component helpers, types, and configurations instead of rewriting them.
   - If a similar utility, service, helper function, or state store already exists in the project, you **MUST** import and reuse it.
   - Consolidate repeating patterns into shared components (under `src/components/common/`) or helper utilities when you notice duplicated code structure.

---

## 4. UI/UX and Styling (Frontend)

1. **Design System Source of Truth:**
   - **CRITICAL:** Always read and refer to `DESIGN.md` in the project root as the absolute source of truth for all design decisions, colors, typography, spacing, borders, elevation, component specs, and styling rules. All UI elements must strictly align with `DESIGN.md`.
2. **Aesthetic Excellence:**
   - Leverage **Ant Design (antd)** components as the foundational UI kit.
   - Use high-quality CSS for transitions, card styling, gradients, and custom components.
   - Ensure layouts are fully responsive (handling Desktop & Mobile gracefully).
3. **State & Logic Separation:**
   - Keep views (`*.view.tsx`) focused on layout, Ant Design composition, and styling.
   - Move state management, API interaction logic, and events into `*.presenter.ts` files or Zustand stores.
4. **No Placeholders:**
   - Do not use placeholders for final elements. If visual assets are needed, generate or implement clean SVG/CSS graphics.

---

## 5. Collaboration and Rules of Engagement

- **Ask Before Destructive Operations:** Always seek user confirmation before deleting databases, tables, major files, or running heavy system scripts.
- **Maintain Comments:** Preserve existing comments and docstrings unless they are outdated or explicitly requested to be removed.
- **Testing:** Ensure mock data or seed scripts are updated whenever DB schema changes.
- **Language Constraint:** AI agents must always respond, explain, and converse in Indonesian (Bahasa Indonesia).
- **Ask and Confirm Ambiguous Choices:** If there is any ambiguity or choices regarding requirements, design, structure, or implementation, AI agents **MUST** and **ARE OBLIGATED** to ask the user for confirmation (e.g. using `ask_question` tool) before proceeding.

---

## 6. Automated Testing Guidelines (Local Verification & CI/CD)

To detect errors immediately without manual browser E2E testing, developers and AI agents must write automated tests for all developed features.

### 6.1 Testing Architecture
1. **Backend Unit Testing:**
   - Focus on testing Service layers (`*.service.ts`) containing the core business logic.
   - Mock all external dependencies (e.g., Prisma repository/client database queries, bcrypt/bcryptjs helpers, JWT helpers, Winston logger).
2. **Backend Integration Testing:**
   - Test entire route endpoints (`*.routes.ts` via Express App) using `supertest`.
   - Use a dedicated test database (or transaction rollback) to keep the development database clean.
3. **Frontend Testing:**
   - Test Zustand stores (`*.store.ts`) and presenter logic (`*.presenter.ts`) using Jest.
   - Mock Axios API calls to return mock response data.

### 6.2 Test File Naming & Placement
- Keep test files next to the files they test inside the feature-driven folder.
- Name tests using the format: `[feature].[layer].spec.ts` (e.g., `auth.service.spec.ts`, `products.service.spec.ts`).

### 6.3 Rules of Engagement
- > [!CAUTION]
  > **AI AGENTS MUST NEVER RUN `npm test` OR `npm run test`.**
  > Running tests on the environment causes the Windows host CPU, memory, and disk to spike to 100%, causing the system and chat to hang. AI agents must verify code correctness statically (e.g. `npx tsc --noEmit` or manual inspection) and never execute test commands.
- **Test Before Push (Human Developers Only):** Human developers may execute test suites locally before pushing code.
- **Coverage Target:** Aim for at least 70% line coverage on services and controllers.
- **Clean Mocking:** Do not perform actual network requests or write dirty state to production/dev databases during unit tests. Always mock database calls using jest mock utilities.

### 6.4 Resource Optimization on Windows (CPU, Memory, & Disk)
To prevent local test execution (especially on Windows) from draining CPU, memory, and disk resources, human developers must adhere to these guidelines:
1. **Limit Worker Threads:** By default, Jest runs one worker per CPU core. On Windows, process spawning has high overhead, causing heavy CPU and memory spikes.
   - Use the `--runInBand` (or `-i`) flag to run tests serially in the same process, or restrict workers (e.g. `--maxWorkers=50%` or `--maxWorkers=2`).
   - Run tests locally with: `npm run test -- --runInBand` or `npx jest --runInBand`.
2. **Minimize Disk/File System I/O:**
   - Mock all repository and database operations. Never write/read from a physical database file (e.g., SQLite, local containers) in unit tests.
   - Mock Node's `fs` module or use in-memory streams rather than writing temporary files to the physical disk.
3. **Mute/Restrict Console Logging:**
   - Set the Winston logger to `error` level or silence it completely during test execution. Printing large amounts of log output to Windows terminals (stdout) causes heavy I/O and blocks thread execution.
4. **Prevent Memory Leaks:**
   - Clean up event listeners, timers, and database connections in hooks (`afterEach` / `afterAll`).
   - Call `jest.clearAllMocks()` or `jest.resetAllMocks()` between tests to prevent accumulated memory overhead.
5. **Optimize File Watching:**
   - Ensure Jest configurations explicitly ignore `node_modules`, `.git`, `.next`, `dist`, and coverage directories to prevent the file watcher from overloading disk I/O.

---

## 7. POS UMKM Design System (Modern & General Wirausaha Style)

> [!IMPORTANT]
> The absolute source of truth for the design system is [DESIGN.md](file:///home/rijal/projects/pos-umkm/DESIGN.md) in the project root. Refer to it for color codes, sizing, spacing, typography, and styling components.

POS UMKM is a clean, modern, and versatile design system suitable for restaurants, cafes, warungs, fashion stores, and other retail businesses. Spacing is generous, typography is legible, and components use a flat, border-driven aesthetic without drop shadows.

### 7.1 Visual Philosophy
- **Authenticity over Polish:** A flat, border-driven visual style that avoids corporate gloss.
- **Merchant focus:** Highlight product images, clean pricing, clear checkout actions, and categories.
- **Warm & friendly:** Use terracotta, sand, and forest green for organic food, drink, and retail accents.

### 7.2 Colors
- **Primary:** `#C2410C` (Terracotta) - Primary CTAs, active states, key interactive highlights.
- **Secondary:** `#D4A373` (Sand/Oat) - Featured accents, badges, decorative borders.
- **Tertiary:** `#365314` (Forest Green) - Eco-friendly badges, category tags, product labels.
- **Background:** `#FFFBF5` (Warm Cream) - Main app background.
- **Surface:** `#FFFFFF` (White) - Cards, lists, modals, menus, inputs.
- **Success:** `#22C55E`
- **Warning:** `#F59E0B`
- **Error:** `#DC2626`
- **Info:** `#3B82F6`

### 7.3 Typography
- **Headline Font:** Inter (Sans-Serif) - reinforce a premium, modern wirausaha layout.
- **Body Font:** Inter (Sans-Serif) - default clean body text.
- **Mono Font:** Source Code Pro - order numbers, tracking codes, technical data.

- **Display:** Inter 48px bold, 1.15 line height, 0.01em tracking (Hero headers).
- **Headline:** Inter 36px semibold, 1.25 line height, 0.005em tracking (Categories, collection titles).
- **Subhead:** Inter 26px semibold, 1.3 line height (Sections, seller names).
- **Body Large:** Inter 18px regular, 1.6 line height (Product details intro).
- **Body:** Inter 16px regular, 1.6 line height (Default body).
- **Body Small:** Inter 14px regular, 1.5 line height (Reviews, specs, ingredients).
- **Caption:** Inter 12px medium, 1.4 line height, 0.02em tracking (Shipping info, stocks).
- **Overline:** Inter 11px bold, 1.2 line height, 0.09em tracking (Category tags, UPPERCASE).
- **Code:** Source Code Pro 14px regular, 1.5 line height.


### 7.4 Spacing & Padding
- **Base Unit:** 8px
- **Scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
- **Component Padding:** Small = 8px, Medium = 16px, Large = 24px
- **Section Spacing:** Mobile = 56px, Tablet = 80px, Desktop = 112px

### 7.5 Border Radius & Borders
- **None:** 0px — Full-bleed hero images, dividers.
- **Small:** 4px — Badges, tags, chips.
- **Medium:** 8px — Cards, product images, modals.
- **Large:** 12px — Seller cards, banners.
- **XL:** 20px — Hero blocks, callouts.
- **Full:** 9999px — Avatars, badges, profile circles.

### 7.6 Elevation & Borders
- **No Drop Shadows:** POS UMKM uses warm background layering and deliberate border usage instead of shadows.
- **Borders:**
  - Subtle: `1px solid #E7E5E4`
  - Medium: `1px solid #D6D3D1`
  - Large (Elevated): `2px solid #D6D3D1`
- **Exceptions:** Modals and Popovers can use a subtle overlay shadow: `8px offset, 24px blur, #1C1917 at 10%`.
- **Focus Ring:** `3px solid rgba(194, 65, 12, 0.2)` (Terracotta-tinted).

### 7.7 Components
1. **Buttons:**
   - **Primary:** Background `#C2410C`, Text `#FFFFFF`, Open Sans 15px Semibold, Border-radius 4px. Hover: `#9A3412`, Active: `#7C2D12`.
   - **Secondary:** Background Transparent, Text `#C2410C`, Border `1.5px solid #C2410C`, Border-radius 4px. Hover: Background `#FDF6EC`.
   - **Ghost:** Background Transparent, Text `#57534E`. Hover: Background `#FDF6EC`.
   - **Destructive:** Background `#DC2626`, Text `#FFFFFF`, Border-radius 4px. Hover: `#B91C1C`.
   - **Sizes:** Small: Height 34px (padding 10px 16px); Medium: Height 42px (padding 12px 24px); Large: Height 50px (padding 14px 32px).
2. **Cards:**
   - **Default:** Background `#FFFFFF`, Border `1px solid #E7E5E4`, Border-radius 8px. Hover: Border `#D6D3D1`.
   - **Elevated:** Border `2px solid #D6D3D1`, Background `#FFFBF5`. Hover: Border `#A8A29E`.
3. **Inputs:**
   - **Text Input:** Background `#FFFFFF`, Border `1.5px solid #D6D3D1`, Text `#1C1917`, Placeholder `#A8A29E`, Border-radius 4px, Height 42px, Open Sans 16px/400. Focus: Border `#C2410C`, Ring `3px solid rgba(194, 65, 12, 0.15)`. Error: Border `#DC2626`, Ring `3px solid rgba(220, 38, 38, 0.15)`. Disabled: Background `#F5F5F4`, opacity 50%.
   - **Labels:** Top aligned, Open Sans 13px Semibold (600), `#1C1917`.
   - **Helper Text:** 12px, `#57534E`.
4. **Chips:**
   - **Filter Chip:** Height 32px, padding 0 14px, Border-radius 4px, Border `1px solid #D6D3D1`. Selected: Background `#C2410C`, Text `#FFFFFF`, Border `#C2410C`. Hover: Background `#FDF6EC`.
   - **Status Chip:**
     - Success: Background `#DCFCE7`, Text `#166534`.
     - Warning: Background `#FEF3C7`, Text `#92400E`.
     - Error: Background `#FEE2E2`, Text `#991B1B`.
5. **Lists:**
   - **Default List Item:** Height 48px, padding 0 16px, Open Sans 16px/400, Divider `1px solid #E7E5E4`, Hover: Background `#FFFBF5`. Selected: Background `#FDF6EC`, Text `#C2410C`. Icon Variant: 20px icon, 12px gap.
6. **Checkboxes & Radios:**
   - **Checkbox:** 18px size, Border `1.5px solid #D6D3D1`, Border-radius 3px. Checked: Background `#C2410C`, Border `#C2410C`, white checkmark.
   - **Radio Button:** 18px size, Border `1.5px solid #D6D3D1`. Selected: Border `#C2410C` with 6px inner dot `#C2410C`.
   - **Label:** Open Sans 14px/400 with 10px gap. Disabled: 40% opacity.
7. **Tooltips:**
   - Background `#1C1917`, Text `#FFFFFF`, Open Sans 12px/400, Padding 8px 12px, Border-radius 4px, Max-width 220px, Arrow 6px. Delay 300ms.

### 7.8 Do's and Don'ts
- **Do** use warm, natural photography/graphics; avoid stark white backgrounds.
- **Do** highlight product categories and states (e.g. food ingredients or size tags) using tertiary forest green (`#365314`) tags.
- **Do** use clean sans-serif/serif headers to reinforce a modern wirausaha layout.
- **Do** show real customer photos in reviews to build community trust.
- **Don't** use aggressive urgency tactics (e.g. countdown timers, pressure-selling text like "only 1 left!").
- **Don't** apply drop shadows to product cards; use borders instead.
- **Don't** use the terracotta primary for decorative borders; reserve it for interactive elements.
- **Don't** crop product images to strict squares if they are naturally tall or wide; respect original aspect ratios.
- **Don't** use nested Card components (e.g., Card inside another Card); use clean div wrappers with borders for layout panels instead.

---

## 8. Backend Code Rules (Strict — Hasil Code Review)

> [!CAUTION]
> Aturan ini **WAJIB** diikuti untuk semua perubahan backend. Pelanggaran = tidak lolos review.

### 8.1 Error Handling
- **DILARANG** membuat error dengan `new Error('...')` + `(err as any).statusCode = xxx`.
- **WAJIB** gunakan shared error classes dari `shared/utils/errors.util.ts`: `NotFoundError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`.
- Jika butuh status code baru, **tambahkan class baru** di `errors.util.ts`, jangan buat inline.

### 8.2 Penempatan Type/Interface
- Type yang **spesifik 1 feature** → `[feature].types.ts`.
- Type yang **dipakai lintas feature** → `shared/types/`.
- Type yang **di-derive dari Zod schema** → export dari `.schema.ts` saja, **JANGAN duplikasi** di `.types.ts`.
- **DILARANG** mendefinisikan type/interface di file `.repository.ts`, `.service.ts`, `.controller.ts`, atau `.util.ts` — kecuali type internal `private` yang tidak di-export.

### 8.3 Service TIDAK Boleh Akses Prisma Langsung
- Service **HANYA** boleh memanggil method dari repository.
- Jika butuh data dari domain lain, panggil **repository domain tersebut** atau **service domain tersebut** — BUKAN `prisma.xxx` langsung.
- Setiap feature **WAJIB** punya file `.repository.ts`.

### 8.4 Service Hanya Business Logic
- **DILARANG** menaruh HTML template, CSV generation, atau formatting presentasi di service layer.
- Pindahkan ke `shared/utils/` sebagai utility terpisah (contoh: `receipt-template.util.ts`, `report-template.util.ts`).

### 8.5 Satu Sumber Konfigurasi
- **DILARANG** akses `process.env` langsung di file mana pun selain `config/env.config.ts`.
- Semua file **WAJIB** import konfigurasi dari `env.config.ts`.

### 8.6 Tidak Ada Duplikasi Pola (DRY)
- Jika pola kode yang sama muncul **≥2 kali** (bahkan dalam 1 file), **WAJIB** diekstrak ke:
  - Private method (jika dalam 1 class).
  - Shared utility (jika lintas file).
- Contoh pola yang harus diekstrak: date parsing, entity-to-payload mapping, check-exist-then-throw.

### 8.7 Logging Konsisten
- **DILARANG** pakai `console.log`, `console.error`, `console.warn`.
- **WAJIB** pakai Winston logger dari `shared/utils/logger.util.ts`.

### 8.8 Import Order
- Semua `import` statement **WAJIB** di bagian atas file, sebelum kode apa pun.
- Urutan: (1) Node built-in → (2) External packages → (3) Internal/relative imports.

---

## 9. Frontend Code Rules (Strict — Hasil Code Review)

> [!CAUTION]
> Aturan ini **WAJIB** diikuti untuk semua perubahan frontend. Pelanggaran = tidak lolos review.

### 9.1 View Hanya UI — Wajib Pakai Presenter
- **DILARANG** menaruh business logic, API calls, atau data fetching langsung di file `.view.tsx`.
- View **HANYA** boleh berisi: layout JSX, Ant Design composition, event handler yang memanggil presenter, dan conditional rendering.
- Setiap feature yang memiliki logic (fetch, CRUD, computed state) **WAJIB** punya file `.presenter.ts` atau `.presenter.tsx`.
- **DILARANG** import service (`.service.ts`) langsung dari view — harus melalui presenter.
- **DILARANG** memanggil `api.get/post/put/delete` langsung dari view file.

### 9.2 Penempatan Type/Interface
- Type yang **spesifik 1 feature** → `[feature].types.ts` (buat file ini jika belum ada).
- Type yang **dipakai lintas feature** → `shared/types/` atau `libs/types.lib.ts`.
- **DILARANG** mendefinisikan type/interface di file `.service.ts`, `.presenter.ts`, atau `.view.tsx`.
- Jika ada type yang diimport cross-feature (misal `ProductItem` dipakai di `customer-cart.store.ts`), pindahkan ke shared types.

### 9.3 Shared Utilities — Tidak Ada Duplikasi (DRY)
- **DILARANG** menduplikasi pola yang sama di ≥2 file. Harus diekstrak ke shared utility:
  - **Currency formatter** (`Intl.NumberFormat` IDR) → buat satu di `libs/format.lib.ts` atau `shared/utils/`
  - **Print receipt** → buat satu di `libs/receipt-printer.lib.ts` atau `shared/utils/`
  - **Category filter chips** → buat shared component jika pola UI sama
- Jika store info (nama toko, logo, dll) dibutuhkan di ≥2 tempat, simpan di **Zustand store** — bukan state lokal per view.

### 9.4 Dilarang Pakai `any`
- **DILARANG** menggunakan `any` di mana pun — baik di `useState<any>`, parameter fungsi, maupun `catch (err: any)`.
- Untuk state, buat **interface/type yang tepat** di `.types.ts`.
- Untuk error catch, gunakan `unknown` dan narrow dengan type guard, atau gunakan `AxiosError` dari axios.
- Contoh:
  ```typescript
  // ❌ DILARANG
  const [data, setData] = useState<any[]>([]);
  catch (err: any) { message.error(err.message) }
  
  // ✅ BENAR
  const [data, setData] = useState<ProductItem[]>([]);
  catch (err: unknown) {
    const msg = err instanceof AxiosError ? err.response?.data?.message : 'Terjadi kesalahan';
    message.error(msg);
  }
  ```

### 9.5 DILARANG Keras Menggunakan Inline CSS (style={...})
- **DILARANG KERAS** menggunakan inline CSS (`style={{ ... }}`) pada elemen HTML maupun komponen React/Ant Design, kecuali untuk dynamic styling yang nilainya dihitung saat runtime (seperti penentuan posisi dinamis atau progress persentase).
- Semua styling statis harus didefinisikan menggunakan **CSS class** (baik di global `index.css` atau modul CSS per feature/komponen) atau memanfaatkan properti bawaan dari komponen **Ant Design** (seperti `<Flex gap="middle">`, `<Space>`, `<Col span={...}>`, dsb).
- Jika ada warna yang perlu digunakan dalam file CSS, **WAJIB** merujuk ke CSS variables yang ada di `index.css` (misalnya `var(--color-primary)`), bukan menuliskan kode hex langsung (`#C2410C`).
- Base CSS dari proyek ini **BUKAN Bootstrap CSS**, melainkan **Ant Design (antd)** dan **Custom Design System (Vanilla CSS + CSS Variables)** yang didesain khusus agar memberikan kesan hangat, natural, dan khas wirausaha lokal (sesuai spesifikasi di `DESIGN.md`).
- **Contoh Do's & Don'ts:**
  ```typescript
  // ❌ DILARANG: Menggunakan inline style statis dan hardcoded warna
  <div style={{ display: 'flex', gap: '16px', padding: '12px', backgroundColor: '#FFFBF5', border: '1px solid #D6D3D1' }}>
    <span style={{ color: '#C2410C', fontWeight: 'bold' }}>Nama Toko</span>
  </div>

  // ❌ DILARANG: Menggunakan inline style meskipun memakai CSS variables
  <div style={{ display: 'flex', gap: '16px', padding: '12px', backgroundColor: 'var(--color-background)', border: 'var(--border-medium)' }}>
    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Nama Toko</span>
  </div>

  // ✅ BENAR: Menggunakan komponen layout Ant Design & class CSS kustom
  // Di file CSS (misal: index.css):
  // .merchant-container { padding: 12px; background-color: var(--color-background); border: var(--border-medium); }
  // .merchant-title { color: var(--color-primary); font-weight: bold; }
  <Flex gap="middle" className="merchant-container">
    <span className="merchant-title">Nama Toko</span>
  </Flex>
  ```

### 9.6 Error Handling Konsisten
- Pilih **satu pola** error handling dan terapkan konsisten:
  - **Service** menangani HTTP request dan throw error.
  - **Presenter** catch error dari service dan tampilkan `message.error()`.
  - **View** tidak boleh punya try-catch sendiri untuk API calls.
- **DILARANG** double try-catch (service throw → presenter catch & re-throw → view catch lagi).
- **DILARANG** pakai `console.error` untuk error handling di production code. Gunakan `message.error()` dari Ant Design untuk menampilkan error ke user.

### 9.7 Naming Conventions
- File **WAJIB** menggunakan **plural** yang konsisten dengan nama folder fitur:
  - Folder `tables/` → `tables.presenter.ts`, `tables.service.ts` (bukan `table.*`)
  - Folder `sales/` → `sales.presenter.ts` (bukan `transactions.presenter.ts`)
- Konvensi file:
  - `[component-name].view.tsx` — UI view files
  - `[feature].presenter.ts` — State & logic management
  - `[feature].service.ts` — HTTP request layer
  - `[feature].types.ts` — TypeScript interfaces/types
  - `[feature].store.ts` — Zustand stores (jika perlu)

### 9.8 Batas Ukuran File View
- Jika file `.view.tsx` melebihi **300 baris**, itu indikasi kuat bahwa logic harus dipecah:
  - Pindahkan state & logic ke `.presenter.ts`
  - Pecah UI ke sub-komponen `.view.tsx` yang lebih kecil
- **Target:** View file idealnya ≤300 baris, fokus hanya pada rendering.
