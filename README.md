# Car Gallery Dashboard

Full-stack car dealership management system built with Next.js 16, Prisma, PostgreSQL, and Shadcn/ui.

## Features

- **Auth** — Role-based access (Admin / Sales Rep) with NextAuth.js
- **Vehicles** — Inventory management with image uploads
- **Sales** — 2-step sale form, installment tracking, payment status
- **Customers** — CRM with contact history timeline
- **Reports** — Analytics with Recharts charts + Excel export
- **Market** — External listing scraper

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma ORM + PostgreSQL
- NextAuth.js v5
- Shadcn/ui + Tailwind CSS v4
- Recharts
- Cloudinary (image storage)
- xlsx (Excel export)

---

## Deployment (Vercel + Neon)

### 1. Database — Neon (free PostgreSQL)

1. Go to [neon.tech](https://neon.tech) → create project
2. Copy the connection string (with `?sslmode=require`)

### 2. Image Storage — Cloudinary (free tier)

1. Go to [cloudinary.com](https://cloudinary.com) → create account
2. Copy **Cloud Name**, **API Key**, **API Secret** from the dashboard

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From the phase-5 directory:
vercel
```

Or connect via [vercel.com](https://vercel.com) → Import Git Repository.

### 4. Environment Variables

Set these in Vercel dashboard → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://...?sslmode=require` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `Car Gallery` |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | from Cloudinary dashboard |

### 5. Database Setup

After first deploy, run migrations and seed:

```bash
# Set DATABASE_URL in your local .env.local, then:
npx prisma migrate dev --name init
npx prisma db seed
```

---

## Local Development

```bash
cp .env.example .env.local
# Fill in .env.local

npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Test accounts:**
- Admin: `admin@cargallery.com` / `admin123`
- Sales Rep: `sales@cargallery.com` / `sales123`

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema (dev only) |
| `npm run db:migrate` | Run migrations (production) |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |
