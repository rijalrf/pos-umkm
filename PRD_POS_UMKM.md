# PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Aplikasi POS UMKM (Web Responsive - Mobile & Desktop)**

## 1. Executive Summary
**Nama Produk:** POS UMKM
**Jenis Produk:** Aplikasi Point of Sale berbasis Web untuk UMKM (Responsive: Desktop & Mobile Web)
**Target Pengguna:** Admin (Pemilik Toko), Kasir, Customer (Member & Guest)
**Tujuan:**
- Memudahkan manajemen produk, penjualan, dan laporan untuk UMKM
- Mendukung operasional kasir dengan pembayaran tunai di tempat
- Memberikan akses customer untuk melihat produk dan riwayat transaksi
- Mendukung transaksi guest (tanpa login) dan member (dengan login)

**Arsitektur Aplikasi:**
- **Backoffice:** Interface untuk Admin dan Kasir (desktop-friendly)
- **Customer Frontend:** Interface untuk Customer (mobile-first, responsive)

**Key Features:**
- Manajemen produk dengan upload gambar ke Google Drive
- Penjualan tunai di kasir (in-store payment only)
- Laporan penjualan dan stok
- Manajemen customer dan user dengan role-based access
- Pengaturan profil toko
- Konfigurasi Google Drive untuk penyimpanan gambar
- Guest checkout (tanpa login) dan Member checkout (dengan login)

---

## 2. Tech Stack
**Frontend:**
- Framework: React.js (Next.js atau Vite)
- UI Framework: React Bootstrap / Ant Design / Material-UI (pilih salah satu, tidak membuat komponen custom)
- Styling: Bootstrap CSS (responsive by default)
- State Management: React Context / Zustand (minimal)

**Backend (Opsional - Jika Dibutuhkan):**
- API: Node.js (Express/NestJS) atau Firebase
- Database: PostgreSQL / Firebase Firestore
- Storage: Google Drive API (untuk gambar produk)

**Deployment:**
- Web: Vercel / Netlify
- PWA: Progressive Web App untuk mobile experience yang optimal

---

## 3. User Personas & Role-Based Access

### 3.1 Admin (Pemilik Toko)
- **Role:** ADMIN
- **Tugas:** Mengelola produk, user, customer, laporan, dan pengaturan toko
- **Akses Fitur:**
  - Dashboard ringkasan penjualan
  - CRUD produk dengan upload gambar
  - Laporan penjualan harian/mingguan/bulanan
  - Manajemen user (kasir)
  - Pengaturan profil toko
  - Konfigurasi Google Drive

### 3.2 Kasir
- **Role:** CASHIER
- **Tugas:** Melakukan transaksi penjualan di kasir
- **Akses Fitur:**
  - Pencarian produk cepat
  - Input jumlah barang
  - Pilih customer (member/guest)
  - Input nama customer (jika guest)
  - Pembayaran tunai (hanya di kasir)
  - Cetak struk
  - Lihat katalog produk

### 3.3 Customer - Member (Login)
- **Role:** CUSTOMER
- **Tugas:** Melihat produk dan riwayat transaksi
- **Akses Fitur:**
  - Katalog produk
  - Detail produk
  - Riwayat transaksi
  - Edit profil

### 3.4 Customer - Guest (Tanpa Login)
- **Role:** GUEST
- **Tugas:** Melihat produk saja
- **Akses Fitur:**
  - Katalog produk
  - Detail produk
  - Input nama sebagai tamu saat checkout

---

## 4. Fitur Utama (Overview)

### 4.1 Backoffice (Admin & Kasir)
| Fitur                     | Admin | Kasir |
|---------------------------|-------|-------|
| Dashboard                 | ✅    | ❌    |
| Manajemen Produk          | ✅    | ❌    |
| Upload Gambar             | ✅    | ❌    |
| Konfigurasi GDrive        | ✅    | ❌    |
| Penjualan                 | ❌    | ✅    |
| Pembayaran Tunai          | ❌    | ✅    |
| Laporan Penjualan         | ✅    | ❌    |
| Manajemen Customer        | ✅    | ❌    |
| Manajemen User            | ✅    | ❌    |
| Pengaturan Toko           | ✅    | ❌    |
| Katalog Produk            | ✅    | ✅    |

### 4.2 Customer Frontend
| Fitur                     | Member | Guest |
|---------------------------|--------|-------|
| Katalog Produk            | ✅     | ✅    |
| Detail Produk             | ✅     | ✅    |
| Riwayat Transaksi         | ✅     | ❌    |
| Checkout (Input Nama)     | ✅     | ✅    |
| Login/Register            | ✅     | ❌    |

---

## 5. Non-Functional Requirements
- **Responsive:** Mendukung desktop, tablet, dan mobile
- **Performance:** Loading < 2s untuk halaman utama
- **Security:** Autentikasi user, enkripsi data sensitif
- **Storage:** Gambar produk disimpan di Google Drive pribadi user
- **Offline Mode:** Dukungan PWA untuk akses offline (opsional)
---

## 6. Detailed Feature Specifications

### 6.1 Manajemen Produk (Admin Only)
**Fitur:**
- **Create / Read / Update / Delete** produk
- **Upload Gambar Produk**: 
  - Form upload gambar (max 5MB per file, format: JPEG/PNG)
  - Gambar disimpan di Google Drive milik pemilik toko melalui OAuth2
  - URL gambar dari Google Drive disimpan di database
  - Preview gambar sebelum upload
- **Field Produk:**
  - Nama produk
  - Kategori (dropdown)
  - Harga jual
  - Stok
  - Deskripsi
  - SKU/Barcode
- **Stok Alert**: Notifikasi otomatis ketika stok < threshold yang ditentukan
- **Kategori Management**: CRUD kategori produk

### 6.2 Konfigurasi Google Drive (Admin Only)
**Halaman Konfigurasi:**
- **Form Input:**
  - Client ID (dari Google Cloud Console)
  - Client Secret
  - Redirect URI
  - Tombol "Authorize with Google" → membuka OAuth consent screen
- **Panduan Setup (Step-by-Step):**
  1. Buat project di Google Cloud Console
  2. Enable Google Drive API
  3. Buat OAuth 2.0 Credentials
  4. Copy Client ID & Client Secret
  5. Set Redirect URI
  6. Authorize aplikasi
  7. Test koneksi dengan upload dummy file
- **Fitur Tambahan:**
  - Tombol "Test Connection" untuk validasi koneksi ke Google Drive
  - Status koneksi (Connected/Disconnected)
  - Tombol "Re-authorize" jika token expired
- **Keamanan:** 
  - Token disimpan terenkripsi di database dengan AES-256
  - Refresh token otomatis sebelum expired

### 6.3 Penjualan (Kasir Only)
**Checkout Flow:**
1. **Pilih Produk:**
   - Search bar atau scan barcode
   - Grid produk dengan gambar & harga
   - Klik produk → tambahkan ke keranjang
2. **Keranjang:**
   - List produk yang dipilih
   - Adjust jumlah (+ / -)
   - Hapus item
   - Total otomatis
3. **Pilih Customer:**
   - Radio button: "Member" atau "Guest"
   - Jika Member: dropdown pilih dari database customer
   - Jika Guest: input field nama tamu
4. **Pembayaran Tunai:**
   - Display total belanja
   - Input uang diterima
   - Hitung kembalian otomatis
   - Tombol "Bayar"
5. **Struk:**
   - Generate struk (HTML atau PDF)
   - Info: Nama toko, alamat, tanggal, items, total, uang diterima, kembalian
   - Tombol "Cetak" atau "Kirim Email" (opsional)

### 6.4 Laporan Penjualan (Admin Only)
**Filter Laporan:**
- Periode: Hari Ini, Minggu Ini, Bulan Ini, Custom Date Range
- Kasir: Semua / Pilih Kasir Tertentu
- Kategori Produk: Semua / Pilih Kategori

**Metrics yang Ditampilkan:**
- Total Penjualan (Rupiah)
- Total Transaksi
- Produk Terlaris (Top 5)
- Penjualan per Kasir
- Stok akhir per produk
- Rata-rata nilai transaksi

**Visualisasi:**
- Bar Chart: Penjualan per hari/minggu/bulan
- Line Chart: Trend penjualan
- Pie Chart: Penjualan per kategori

**Export:**
- Format: CSV, PDF
- Include: Data tabel + chart (untuk PDF)

### 6.5 Manajemen Customer (Admin Only)
**Fitur:**
- **CRUD Customer:**
  - Nama
  - Nomor Telepon
  - Email (opsional)
  - Alamat (opsional)
- **Riwayat Transaksi Customer:**
  - List transaksi customer (khusus member)
  - Detail transaksi: tanggal, items, total
- **Import/Export:**
  - Import customer dari CSV
  - Export customer ke CSV

### 6.6 Manajemen User (Admin Only)
**Fitur:**
- **CRUD User (Kasir):**
  - Nama lengkap
  - Username
  - Password (hashed dengan BCrypt)
  - Role: ADMIN / CASHIER
  - Status: Aktif / Non-aktif
- **Role Permission:**
  - ADMIN: full access
  - CASHIER: hanya akses modul penjualan

### 6.7 Pengaturan Toko (Admin Only)
**Informasi Toko:**
- Nama toko
- Alamat lengkap
- Nomor telepon
- Email
- Logo toko (upload ke Google Drive)

**Preferensi:**
- Mata uang (IDR, USD, dll)
- Format tanggal (DD/MM/YYYY, MM/DD/YYYY)
- Zona waktu
- Threshold stok minimum

### 6.8 Customer Frontend (Member & Guest)
**Katalog Produk:**
- Grid layout responsive (mobile-first)
- Card produk: gambar, nama, harga
- Filter: Kategori, Harga (min-max)
- Search bar
- Sort by: Nama, Harga (asc/desc), Terbaru

**Detail Produk:**
- Gambar besar
- Nama produk
- Harga
- Deskripsi
- Stok tersedia
- Tombol "Pesan" (untuk informasi saja, bukan e-commerce)

**Checkout (untuk referensi kasir):**
- Guest: Input nama → submit
- Member: Login → lihat riwayat order

**Riwayat Transaksi (Member Only):**
- List transaksi
- Filter by date
- Detail transaksi (items, total, status)


---

## 7. User Flows

### 7.1 Flow Admin: Upload Produk dengan Gambar
1. Login sebagai Admin
2. Navigasi ke menu "Produk" → "Tambah Produk"
3. Isi form: nama, kategori, harga, stok, deskripsi
4. Klik "Upload Gambar" → pilih file dari komputer
5. Sistem upload ke Google Drive → tampilkan preview
6. Klik "Simpan"
7. Produk muncul di katalog dengan gambar

### 7.2 Flow Kasir: Transaksi Guest
1. Login sebagai Kasir
2. Navigasi ke menu "Penjualan"
3. Search/pilih produk → tambahkan ke keranjang
4. Adjust jumlah jika perlu
5. Pilih "Guest" → input nama tamu
6. Input uang diterima
7. Sistem hitung kembalian
8. Klik "Bayar" → generate struk
9. Cetak struk

### 7.3 Flow Kasir: Transaksi Member
1. Login sebagai Kasir
2. Navigasi ke menu "Penjualan"
3. Search/pilih produk → tambahkan ke keranjang
4. Pilih "Member" → pilih nama dari dropdown
5. Input uang diterima
6. Sistem hitung kembalian
7. Klik "Bayar" → generate struk
8. Cetak struk
9. Transaksi tersimpan di riwayat member

### 7.4 Flow Customer (Guest): Browse Produk
1. Buka halaman customer (tanpa login)
2. Lihat katalog produk (grid layout)
3. Filter by kategori atau search
4. Klik produk → lihat detail
5. (Opsional) Catat produk untuk dibeli di kasir

### 7.5 Flow Customer (Member): Lihat Riwayat
1. Buka halaman customer → klik "Login"
2. Input email & password
3. Navigasi ke "Riwayat Transaksi"
4. Lihat list transaksi
5. Klik detail → lihat items yang dibeli

### 7.6 Flow Admin: Setup Google Drive (First Time)
1. Login sebagai Admin
2. Navigasi ke "Pengaturan" → "Konfigurasi Google Drive"
3. Baca panduan setup (step-by-step guide)
4. Buat project di Google Cloud Console (mengikuti panduan)
5. Copy Client ID & Client Secret
6. Paste ke form konfigurasi
7. Klik "Authorize with Google"
8. Login Google → berikan permission
9. Redirect kembali ke aplikasi
10. Klik "Test Connection" → upload dummy file
11. Jika berhasil, status "Connected"

---

## 8. Technical Architecture

### 8.1 Database Schema (Contoh - PostgreSQL)

**Table: users**
- id (PK)
- username (unique)
- password_hash
- full_name
- role (ADMIN/CASHIER)
- is_active
- created_at
- updated_at

**Table: customers**
- id (PK)
- name
- phone
- email (nullable)
- address (nullable)
- is_member (boolean)
- created_at
- updated_at

**Table: categories**
- id (PK)
- name
- description

**Table: products**
- id (PK)
- name
- category_id (FK)
- sku
- price
- stock
- description
- image_url (Google Drive URL)
- stock_alert_threshold
- created_at
- updated_at

**Table: transactions**
- id (PK)
- transaction_code (unique)
- customer_id (FK, nullable jika guest)
- customer_name (untuk guest)
- cashier_id (FK → users)
- total_amount
- cash_received
- cash_return
- transaction_date
- created_at

**Table: transaction_items**
- id (PK)
- transaction_id (FK)
- product_id (FK)
- quantity
- price_at_purchase
- subtotal

**Table: store_settings**
- id (PK)
- store_name
- address
- phone
- email
- logo_url (Google Drive URL)
- currency
- timezone
- date_format
- updated_at

**Table: gdrive_config**
- id (PK)
- client_id (encrypted)
- client_secret (encrypted)
- refresh_token (encrypted)
- access_token (encrypted)
- token_expiry
- is_connected (boolean)
- updated_at

### 8.2 API Endpoints (Contoh - REST)

**Authentication:**
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/me` - Get current user

**Products (Admin):**
- GET `/api/products` - List produk (dengan filter/search)
- GET `/api/products/:id` - Detail produk
- POST `/api/products` - Create produk
- PUT `/api/products/:id` - Update produk
- DELETE `/api/products/:id` - Delete produk
- POST `/api/products/:id/upload-image` - Upload gambar ke Google Drive

**Categories (Admin):**
- GET `/api/categories` - List kategori
- POST `/api/categories` - Create kategori
- PUT `/api/categories/:id` - Update kategori
- DELETE `/api/categories/:id` - Delete kategori

**Transactions (Kasir):**
- POST `/api/transactions` - Create transaksi baru
- GET `/api/transactions/:id` - Detail transaksi
- GET `/api/transactions/:id/receipt` - Generate struk

**Reports (Admin):**
- GET `/api/reports/sales` - Laporan penjualan (query params: start_date, end_date, cashier_id)
- GET `/api/reports/top-products` - Produk terlaris
- GET `/api/reports/export` - Export laporan (CSV/PDF)

**Customers (Admin):**
- GET `/api/customers` - List customer
- GET `/api/customers/:id` - Detail customer
- POST `/api/customers` - Create customer
- PUT `/api/customers/:id` - Update customer
- DELETE `/api/customers/:id` - Delete customer
- GET `/api/customers/:id/transactions` - Riwayat transaksi customer

**Users (Admin):**
- GET `/api/users` - List user (kasir)
- POST `/api/users` - Create user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

**Store Settings (Admin):**
- GET `/api/settings/store` - Get store info
- PUT `/api/settings/store` - Update store info
- POST `/api/settings/store/upload-logo` - Upload logo

**Google Drive Config (Admin):**
- GET `/api/settings/gdrive` - Get config status
- POST `/api/settings/gdrive/authorize` - Authorize dengan Google
- POST `/api/settings/gdrive/test` - Test koneksi
- PUT `/api/settings/gdrive` - Update config

**Customer Frontend (Public/Member):**
- GET `/api/public/products` - Katalog produk (public)
- GET `/api/public/products/:id` - Detail produk (public)
- POST `/api/customer/login` - Customer login
- GET `/api/customer/transactions` - Riwayat transaksi (member only)

### 8.3 Google Drive Integration

**OAuth2 Flow:**
1. Admin input Client ID & Secret
2. Klik "Authorize" → redirect ke Google consent screen
3. User approve permission (Google Drive scope)
4. Google redirect kembali dengan authorization code
5. Backend exchange code dengan access token & refresh token
6. Simpan token terenkripsi di database

**Upload Image Flow:**
1. Admin pilih gambar di form produk
2. Frontend kirim file ke backend (multipart/form-data)
3. Backend validasi file (size, format)
4. Backend upload ke Google Drive menggunakan Drive API v3
5. Google Drive return file ID & URL
6. Backend simpan URL ke database (products.image_url)
7. Frontend tampilkan preview gambar

**Library yang Digunakan:**
- Frontend: `react-dropzone` (untuk drag & drop upload)
- Backend: `googleapis` (Node.js client untuk Google APIs)

---

## 9. UI/UX Guidelines

### 9.1 Backoffice (Admin & Kasir)
**Layout:**
- Sidebar navigasi (fixed) dengan menu: Dashboard, Produk, Penjualan, Laporan, Customer, User, Pengaturan
- Top bar: Logo toko, nama user, tombol logout
- Main content area (responsive)

**Color Scheme:**
- Primary: #007bff (Bootstrap blue)
- Secondary: #6c757d (Gray)
- Success: #28a745 (Green)
- Danger: #dc3545 (Red)
- Warning: #ffc107 (Yellow)

**Components (dari UI Framework):**
- Buttons: Bootstrap Button / Ant Design Button
- Forms: Bootstrap Form / Ant Design Form
- Tables: Bootstrap Table / Ant Design Table dengan pagination
- Modals: Bootstrap Modal / Ant Design Modal
- Charts: Chart.js atau Recharts

### 9.2 Customer Frontend
**Layout:**
- Top bar: Logo toko, search bar, login/profile icon
- Grid produk (3-4 kolom di desktop, 2 kolom di tablet, 1-2 kolom di mobile)
- Filter sidebar (collapsible di mobile)

**Mobile-First Design:**
- Touch-friendly buttons (min 44x44px)
- Easy navigation dengan bottom tab bar (opsional)
- Fast loading dengan lazy loading gambar

**Components:**
- Product Card: Bootstrap Card / Ant Design Card
- Search: Bootstrap Input Group / Ant Design Input Search
- Filter: Bootstrap Dropdown / Ant Design Select

---

## 10. Security Requirements

1. **Authentication & Authorization:**
   - JWT token untuk session management
   - Token expiry: 24 jam (access token), 30 hari (refresh token)
   - Role-based access control (RBAC)
   
2. **Data Encryption:**
   - Password: BCrypt (salt rounds: 10)
   - Google Drive token: AES-256 encryption
   - HTTPS untuk semua request

3. **Input Validation:**
   - Server-side validation untuk semua input
   - Sanitize input untuk mencegah SQL Injection & XSS
   - File upload validation (MIME type, size, extension)

4. **Rate Limiting:**
   - Login endpoint: max 5 attempts per 15 menit
   - API endpoints: max 100 requests per menit per user

5. **Backup & Recovery:**
   - Database backup harian (automated)
   - Backup Google Drive token setiap update
   - Disaster recovery plan


---

## 11. Testing Strategy

### 11.1 Unit Testing
- Framework: Jest (untuk React & Node.js)
- Coverage target: minimal 70%
- Test untuk:
  - Business logic (kalkulasi total, kembalian)
  - Utility functions (validasi, formatting)
  - React components (dengan React Testing Library)

### 11.2 Integration Testing
- Test API endpoints dengan Supertest
- Test flow: Login → Create Product → Upload Image → Create Transaction
- Test Google Drive integration dengan mock

### 11.3 E2E Testing
- Framework: Cypress atau Playwright
- Test critical user flows:
  - Admin upload produk dengan gambar
  - Kasir melakukan transaksi guest & member
  - Customer browse dan lihat detail produk
  - Admin generate laporan penjualan

### 11.4 Performance Testing
- Load testing dengan k6 atau Artillery
- Target: 100 concurrent users tanpa degradasi performance
- Monitor response time untuk API endpoints

### 11.5 Security Testing
- Penetration testing untuk authentication & authorization
- Test SQL injection, XSS, CSRF
- Validate file upload security

---

## 12. Deployment & DevOps

### 12.1 CI/CD Pipeline
**Tools:** GitHub Actions / GitLab CI
**Pipeline Steps:**
1. Lint & format check
2. Run unit tests
3. Build production bundle
4. Run E2E tests
5. Deploy to staging
6. Manual approval
7. Deploy to production

### 12.2 Hosting
**Frontend:**
- Platform: Vercel / Netlify
- SSL: Auto-provisioned
- CDN: Built-in

**Backend:**
- Platform: Railway / Render / AWS EC2
- Database: PostgreSQL (managed service seperti Supabase atau AWS RDS)
- Environment variables untuk secrets

**Monitoring:**
- Error tracking: Sentry
- Analytics: Google Analytics atau Plausible
- Uptime monitoring: UptimeRobot

---

## 13. Acceptance Criteria

### AC-01: Manajemen Produk
- ✅ Admin dapat membuat produk baru dengan semua field terisi
- ✅ Admin dapat upload gambar produk (max 5MB, JPEG/PNG)
- ✅ Gambar berhasil tersimpan di Google Drive
- ✅ URL gambar tersimpan di database
- ✅ Gambar tampil di katalog produk
- ✅ Admin dapat edit dan delete produk
- ✅ Stok alert muncul ketika stok < threshold

### AC-02: Konfigurasi Google Drive
- ✅ Admin dapat mengakses halaman konfigurasi Google Drive
- ✅ Panduan setup tampil dengan jelas (step-by-step dengan screenshot)
- ✅ Admin dapat authorize dengan Google OAuth2
- ✅ Token tersimpan terenkripsi di database
- ✅ Test connection berhasil upload dummy file
- ✅ Status koneksi tampil (Connected/Disconnected)

### AC-03: Penjualan (Kasir)
- ✅ Kasir dapat search dan pilih produk
- ✅ Keranjang menampilkan produk yang dipilih dengan total otomatis
- ✅ Kasir dapat pilih customer (member dari dropdown atau guest dengan input nama)
- ✅ Sistem hitung kembalian otomatis setelah input uang diterima
- ✅ Transaksi tersimpan dengan benar di database
- ✅ Struk generate dengan format yang benar (info toko, items, total, kembalian)
- ✅ Kasir dapat cetak struk

### AC-04: Laporan Penjualan
- ✅ Admin dapat filter laporan by periode (hari, minggu, bulan, custom)
- ✅ Metrics tampil dengan akurat (total penjualan, total transaksi, top products)
- ✅ Chart tampil dengan benar (bar, line, pie)
- ✅ Admin dapat export laporan ke CSV dan PDF
- ✅ PDF include chart dan data tabel

### AC-05: Manajemen Customer
- ✅ Admin dapat CRUD customer (nama, telepon, email, alamat)
- ✅ Admin dapat melihat riwayat transaksi customer (member only)
- ✅ Admin dapat import customer dari CSV
- ✅ Admin dapat export customer ke CSV

### AC-06: Manajemen User
- ✅ Admin dapat CRUD user (kasir)
- ✅ Password di-hash dengan BCrypt
- ✅ Admin dapat assign role (ADMIN/CASHIER)
- ✅ Admin dapat set status (aktif/non-aktif)
- ✅ User non-aktif tidak dapat login

### AC-07: Customer Frontend (Guest)
- ✅ Guest dapat browse katalog produk tanpa login
- ✅ Guest dapat filter produk by kategori
- ✅ Guest dapat search produk by nama
- ✅ Guest dapat lihat detail produk (gambar, nama, harga, deskripsi, stok)
- ✅ Guest TIDAK dapat akses riwayat transaksi

### AC-08: Customer Frontend (Member)
- ✅ Member dapat login dengan email & password
- ✅ Member dapat browse katalog produk
- ✅ Member dapat lihat riwayat transaksi
- ✅ Member dapat filter riwayat by date
- ✅ Member dapat lihat detail transaksi (items, total, tanggal)

### AC-09: Responsive Design
- ✅ Semua halaman responsive pada viewport 320px – 1920px
- ✅ Backoffice optimal untuk desktop (min 1024px)
- ✅ Customer frontend optimal untuk mobile (320px – 768px)
- ✅ Touch-friendly untuk mobile (button min 44x44px)

### AC-10: Security
- ✅ Password di-hash dengan BCrypt
- ✅ Google Drive token terenkripsi dengan AES-256
- ✅ JWT token untuk authentication
- ✅ Role-based access control berfungsi dengan benar
- ✅ Input validation di server-side
- ✅ File upload validation (MIME type, size)
- ✅ HTTPS untuk semua request (production)

---

## 14. Timeline Pengembangan

### Sprint 1 (Week 1-2): Foundation
**Deliverables:**
- Setup repository (Git, .gitignore, README)
- Setup React project (Vite/Next.js + UI framework)
- Setup backend (Node.js + Express/NestJS)
- Setup database (PostgreSQL schema)
- Implement authentication (JWT)
- Implement role-based middleware
- Basic login/logout UI

**Acceptance:**
- Admin & Kasir dapat login dengan role masing-masing
- JWT token generated dan validated

---

### Sprint 2 (Week 3-4): Produk & Google Drive
**Deliverables:**
- CRUD produk (backend API + frontend UI)
- CRUD kategori
- Upload gambar ke Google Drive (OAuth2 integration)
- Konfigurasi Google Drive (form + panduan)
- Katalog produk (list view dengan gambar)

**Acceptance:**
- Admin dapat CRUD produk dengan upload gambar
- Gambar tersimpan di Google Drive dan tampil di katalog

---

### Sprint 3 (Week 5-6): Penjualan (Kasir)
**Deliverables:**
- UI penjualan (search produk, keranjang)
- Checkout flow (pilih customer, input uang, hitung kembalian)
- Generate struk (HTML/PDF)
- Simpan transaksi ke database

**Acceptance:**
- Kasir dapat melakukan transaksi guest & member
- Struk generate dengan benar

---

### Sprint 4 (Week 7-8): Laporan & Dashboard
**Deliverables:**
- Dashboard admin (metrics: total penjualan, transaksi, top products)
- Laporan penjualan (filter by periode, kasir, kategori)
- Chart (bar, line, pie) dengan Chart.js atau Recharts
- Export laporan (CSV, PDF)

**Acceptance:**
- Admin dapat generate laporan dengan filter
- Chart tampil dengan data yang akurat
- Export berhasil

---

### Sprint 5 (Week 9-10): Customer Frontend
**Deliverables:**
- Katalog produk (responsive grid, filter, search)
- Detail produk
- Customer login/register
- Riwayat transaksi (member only)
- Guest browse (tanpa login)

**Acceptance:**
- Guest dapat browse produk tanpa login
- Member dapat login dan lihat riwayat transaksi

---

### Sprint 6 (Week 11-12): Manajemen Customer & User
**Deliverables:**
- CRUD customer (admin)
- Import/export customer (CSV)
- CRUD user/kasir (admin)
- Role assignment
- Pengaturan toko (nama, alamat, logo)

**Acceptance:**
- Admin dapat CRUD customer & user
- Admin dapat update pengaturan toko

---

### Sprint 7 (Week 13-14): Testing & Bug Fixing
**Deliverables:**
- Unit tests (coverage 70%)
- Integration tests (API endpoints)
- E2E tests (critical flows)
- Bug fixing
- Performance optimization

**Acceptance:**
- All tests passed
- No critical bugs
- Performance < 2s untuk halaman utama

---

### Sprint 8 (Week 15-16): Deployment & Go-Live
**Deliverables:**
- Setup CI/CD pipeline
- Deploy ke staging
- User Acceptance Testing (UAT)
- Deploy ke production
- Monitoring setup (Sentry, Google Analytics)
- Documentation (user manual, API docs)

**Acceptance:**
- Aplikasi live di production
- Monitoring aktif
- Documentation lengkap

**Total Duration:** 16 Minggu (4 Bulan)

---

## 15. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Google Drive API quota limit | High | Medium | Implement caching, request throttling, consider alternative storage |
| Google OAuth token expired | High | Low | Auto-refresh token before expiry, notification ke admin |
| Performance degradasi pada high traffic | Medium | Medium | Load testing, caching strategy, CDN untuk gambar |
| Security breach (data leak) | Critical | Low | Encryption, regular security audit, penetration testing |
| Browser compatibility issue | Low | Medium | Cross-browser testing (Chrome, Firefox, Safari, Edge) |
| Database downtime | High | Low | Automated backup, failover strategy, managed DB service |

---

## 16. Future Enhancements (Post-MVP)

### Phase 2 (Optional):
- **Multi-store support:** Satu admin dapat manage multiple toko
- **Payment gateway integration:** Support QRIS, e-wallet (GoPay, OVO, Dana)
- **Inventory management:** Supplier, purchase order, stock opname
- **Promo & Discount:** Voucher, diskon kategori/produk, membership tier
- **Notification system:** WhatsApp/Email notification untuk low stock, daily report
- **Mobile App (Native):** React Native atau Flutter untuk experience yang lebih baik

### Phase 3 (Advanced):
- **Analytics dashboard:** Advanced reporting dengan BI tools
- **AI Recommendation:** Rekomendasi produk untuk upselling
- **Multi-currency & Multi-language:** Support internasional
- **Integration dengan e-commerce:** Sync produk ke Shopee, Tokopedia, dll

---

## 17. Glossary

- **POS:** Point of Sale (sistem kasir)
- **UMKM:** Usaha Mikro Kecil Menengah
- **SKU:** Stock Keeping Unit (kode unik produk)
- **OAuth2:** Open Authorization protocol untuk autentikasi dengan Google
- **JWT:** JSON Web Token untuk session management
- **BCrypt:** Library untuk hashing password
- **PWA:** Progressive Web App (web app yang bisa diinstall seperti native app)
- **CRUD:** Create, Read, Update, Delete
- **RBAC:** Role-Based Access Control
- **CI/CD:** Continuous Integration / Continuous Deployment

---

## 18. References & Resources

### UI Framework Options:
1. **React Bootstrap:** https://react-bootstrap.github.io/
2. **Ant Design:** https://ant.design/
3. **Material-UI (MUI):** https://mui.com/

### Google Drive API:
- **Documentation:** https://developers.google.com/drive/api/v3/about-sdk
- **OAuth2 Guide:** https://developers.google.com/identity/protocols/oauth2

### Tools & Libraries:
- **Chart.js:** https://www.chartjs.org/
- **Recharts:** https://recharts.org/
- **React Dropzone:** https://react-dropzone.js.org/
- **jsPDF:** https://github.com/parallax/jsPDF (untuk generate PDF)

---

**End of PRD**

**Version:** 1.0  
**Last Updated:** 30 Juni 2026  
**Author:** [Your Name / Team Name]  
**Status:** Draft / Review / Approved
