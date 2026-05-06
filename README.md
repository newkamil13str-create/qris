# KAMIL SHOP — Dynamic QRIS Payment Platform

Platform Dynamic QRIS berbasis Next.js 14 dengan subscription plan, admin dashboard, dan Telegram bot.

## 🚀 Quick Start (Localhost)

### 1. Clone & Install
```bash
git clone https://github.com/youruser/kamilshop
cd kamilshop
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env.local
# Edit .env.local dengan kredensial kamu
```

### 3. Setup Database
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Jalankan
```bash
npm run dev
```

Buka http://localhost:3000

**Admin default:**
- Email: `admin@kamilshop.my.id`
- Password: `Admin@123456`

---

## 📱 Setup Android Termux

```bash
# Install dependencies di Termux
pkg update && pkg upgrade
pkg install nodejs-lts git postgresql

# Clone project
git clone https://github.com/youruser/kamilshop
cd kamilshop
npm install

# Setup env
cp .env.example .env.local
nano .env.local   # isi DATABASE_URL & kredensial lain

# Migrate & seed
npx prisma migrate dev --name init
npx prisma db seed

# Jalankan
npm run dev
```

> Untuk database di Termux, gunakan **Supabase** (gratis) agar tidak perlu setup PostgreSQL lokal.

---

## ☁️ Deploy ke Vercel

### 1. Push ke GitHub
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/youruser/kamilshop
git push -u origin main
```

### 2. Import ke Vercel
- Buka https://vercel.com/new
- Pilih repository kamu
- Tambahkan semua env vars dari `.env.example`
- Deploy!

### 3. Set Telegram Webhook (setelah deploy)
```bash
curl -X POST "https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://kamilshop.my.id/api/telegram/webhook"
```

---

## 🔑 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔲 Dynamic QRIS | Konversi statis → dinamis via Pakasir |
| 💰 Top Up | Tambah saldo via QRIS |
| 📦 Subscription | Plan Free/Basic/Premium/Max |
| 💸 Withdrawal | Tarik saldo ke rekening bank |
| 🤖 Telegram Bot | Notifikasi real-time |
| 🔑 REST API | Integrasi dengan API key |
| 🛡️ Admin Panel | Kelola users, transaksi, withdrawal |

---

## 📁 Struktur Project

```
kamilshop/
├── app/
│   ├── (auth)/          # Login, Register
│   ├── (public)/        # Landing, Pricing
│   ├── dashboard/       # User dashboard
│   ├── admin/           # Admin panel
│   └── api/             # API routes
├── components/
│   ├── ui/              # Base components
│   ├── layout/          # Sidebar, TopBar
│   └── qris/            # QR display components
├── lib/                 # Utils, Prisma, Pakasir, etc.
├── prisma/              # Schema & seed
└── types/               # TypeScript types
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Auth**: NextAuth.js v5
- **Payment**: Pakasir Gateway
- **Bot**: Telegraf.js
- **UI**: Tailwind CSS + shadcn/ui
- **Deploy**: Vercel

---

## 📞 Support

Untuk pertanyaan, hubungi admin@kamilshop.my.id
