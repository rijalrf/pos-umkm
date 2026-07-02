# Panduan Konfigurasi Google Drive API - POS UMKM

Dokumen ini menjelaskan langkah-langkah untuk mengonfigurasi integrasi Google Drive pada aplikasi POS UMKM. Integrasi Google Drive digunakan untuk menyimpan dan menyajikan berkas media secara aman (seperti logo toko, gambar produk, dan gambar QRIS) menggunakan Google Drive merchant.

---

## Ringkasan Konfigurasi

Untuk mempermudah dan mengamankan aplikasi, kredensial Google Drive dikonfigurasi melalui variabel lingkungan (Environment Variables) pada berkas `.env` di server, bukan melalui form input di antarmuka halaman Pengaturan Toko. 

Terdapat 2 cara konfigurasi:
1. **Melalui Otorisasi Otomatis (OAuth Flow):** Mengisi Client ID dan Client Secret di `.env`, lalu melakukan otorisasi satu kali melalui tombol di Dashboard Pengaturan Toko.
2. **Tanpa Otorisasi Dashboard (Direct Env Token):** Memasukkan langsung `GDRIVE_REFRESH_TOKEN` di `.env` (untuk skenario server-side murni tanpa redirect url).

---

## Langkah 1: Registrasi Google Drive API & Kredensial

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru atau pilih proyek yang sudah ada.
3. Di bilah pencarian atas, cari **Google Drive API** dan klik **Enable (Aktifkan)**.
4. Buat halaman persetujuan pengguna (OAuth consent screen):
   * Pilih tipe **External**.
   * Isi informasi wajib seperti nama aplikasi dan email dukungan.
   * Pada bagian **Scopes**, tambahkan scope berikut:
     `https://www.googleapis.com/auth/drive.file` (akses terbatas hanya untuk berkas yang diunggah oleh aplikasi ini).
   * Pada bagian **Test Users**, tambahkan alamat email Google yang akan digunakan sebagai akun penyimpanan toko.
5. Buat Kredensial Klien:
   * Masuk ke menu **Credentials** di sebelah kiri.
   * Klik tombol **Create Credentials** → **OAuth client ID**.
   * Pilih tipe aplikasi: **Web application**.
   * Di bagian **Authorized redirect URIs**, tambahkan alamat callback lokal atau produksi Anda:
     ```text
     http://localhost:3000/api/settings/gdrive/callback
     ```
   * Klik **Create** dan salin **Client ID** serta **Client Secret** yang diberikan.

---

## Langkah 2: Mengisi Berkas `.env` di Backend

Buka berkas `.env` pada folder `packages/backend/.env`, lalu tambahkan variabel berikut di bagian paling bawah:

```env
# Google Drive API
GDRIVE_CLIENT_ID=masukkan_client_id_anda_disini
GDRIVE_CLIENT_SECRET=masukkan_client_secret_anda_disini
GDRIVE_REDIRECT_URI=http://localhost:3000/api/settings/gdrive/callback
```

> [!NOTE]
> Jika Anda menggunakan konfigurasi direct token dan sudah memiliki refresh token dari OAuth Playground, Anda bisa langsung mengisi variabel di bawah ini untuk bypass otorisasi web:
> ```env
> GDRIVE_REFRESH_TOKEN=masukkan_refresh_token_anda_disini
> ```

---

## Langkah 3: Melakukan Otorisasi Melalui Dashboard Admin

Setelah berkas `.env` berhasil disimpan dan server backend dijalankan ulang (`npm run dev` atau di-restart):

1. Masuk ke Dashboard Admin POS UMKM.
2. Navigasikan ke menu **Pengaturan** → tab **Integrasi Google Drive**.
3. Di bawah bagian **Aksi Integrasi**, Anda akan melihat status **BELUM TERHUBUNG**.
4. Klik tombol **Hubungkan Google Drive**. Anda akan dialihkan ke halaman login akun Google.
5. Login menggunakan email yang telah didaftarkan sebagai *Test User* pada Google Cloud Console.
6. Berikan persetujuan akses aplikasi ke Google Drive Anda.
7. Setelah berhasil, Anda akan dialihkan kembali ke Dashboard dengan notifikasi sukses dan status koneksi berubah menjadi **TERHUBUNG**.
8. Anda dapat mengetuk tombol **Uji Koneksi** untuk memastikan integrasi berjalan dengan lancar.

---

## Troubleshooting & Tips

* **Error: Redirect URI Mismatch**
  Pastikan tautan yang Anda masukkan di Google Cloud Console pada bagian *Authorized redirect URIs* sama persis dengan variabel `GDRIVE_REDIRECT_URI` di `.env` (termasuk port dan slash akhir).
* **Error: Access Blocked (App Not Verified)**
  Ini wajar jika status proyek Google Cloud masih dalam tahap pengembangan (Testing). Cukup klik **Advanced** → **Go to pos-umkm (unsafe)** untuk melanjutkan otorisasi.
* **Membatasi Ukuran Berkas**
  Unggahan logo toko dan QRIS dibatasi maksimum **2MB** secara otomatis oleh server demi menghemat bandwidth dan kuota penyimpanan Google Drive Anda.
