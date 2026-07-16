# 🌐 Next.js Application - Ummeed Platform

This directory contains the Next.js frontend and API backend for the **Ummeed Platform Online Judge**.

> [!TIP]
> For the complete system architecture, folder layouts, and multi-service installation instructions (including Docker-compose, Redis, and Judge0 setup), please refer to the main **[Root README.md](../README.md)**.

## 🔑 Local Configuration (`.env`)

Configure the following environment variables in `ummeed-platform/.env`:

| Key | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://ummeed_admin:ummeed_secure_password@localhost:5432/ummeed_db?schema=public` |
| `BETTER_AUTH_SECRET` | Secret key for session encryption | `your-long-random-secret` |
| `BETTER_AUTH_URL` | Base URL for auth operations | `http://localhost:3000` |
| `ADMIN_USERNAME` | Admin login identifier | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `admin-secure-pass` |
| `JUDGE0_API_URL` | Sandbox compiler endpoint | `http://localhost:2358` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |

---

## 🛠️ CLI Operations

Run the following commands inside this directory:

### Run Development Server
```bash
pnpm dev
```

### Sync Database Schema
```bash
npx prisma db push
```

### Run Seeder
```bash
npx prisma db seed
```

### Database Purge (Production Reset)
```bash
npx tsx prisma/clear-live.ts
```
