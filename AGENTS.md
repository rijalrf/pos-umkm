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

---

## 4. UI/UX and Styling (Frontend)

1. **Aesthetic Excellence:**
   - Leverage **Ant Design (antd)** components as the foundational UI kit.
   - Use high-quality CSS for transitions, card styling, gradients, and custom components.
   - Ensure layouts are fully responsive (handling Desktop & Mobile gracefully).
2. **State & Logic Separation:**
   - Keep views (`*.view.tsx`) focused on layout, Ant Design composition, and styling.
   - Move state management, API interaction logic, and events into `*.presenter.ts` files or Zustand stores.
3. **No Placeholders:**
   - Do not use placeholders for final elements. If visual assets are needed, generate or implement clean SVG/CSS graphics.

---

## 5. Collaboration and Rules of Engagement

- **Ask Before Destructive Operations:** Always seek user confirmation before deleting databases, tables, major files, or running heavy system scripts.
- **Maintain Comments:** Preserve existing comments and docstrings unless they are outdated or explicitly requested to be removed.
- **Testing:** Ensure mock data or seed scripts are updated whenever DB schema changes.

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
- **Test Before Push:** Always execute `npm run test` locally and verify that all test suites pass.
- **Coverage Target:** Aim for at least 70% line coverage on services and controllers.
- **Clean Mocking:** Do not perform actual network requests or write dirty state to production/dev databases during unit tests. Always mock database calls using jest mock utilities.
