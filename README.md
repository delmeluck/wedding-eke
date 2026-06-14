# Ekow & Ekua — Wedding Website

A full-stack wedding website built with Next.js 14, Prisma (SQLite), and NextAuth.

## Quick Start

```bash
# 1. Copy environment file
cp .env.local.example .env.local

# 2. Edit .env.local — set NEXTAUTH_SECRET (required)
#    openssl rand -base64 32

# 3. Run setup (installs deps, creates DB, seeds data)
bash setup.sh

# 4. Start dev server
npm run dev
```

Open http://localhost:3000

## Admin Dashboard

- URL: http://localhost:3000/admin
- Login: `admin@wedding.com` / `wedding2026!`
- **Change these before deploying!**

## Important: Fix route conflict

After installation, delete the empty placeholder file to avoid a Next.js build error:

```bash
rm src/app/\(public\)/page.tsx
```

## Features

### Public Website
| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, countdown, event details |
| RSVP | `/rsvp` | Guest response form (email or QR code) |
| Program | `/program` | Order of events with timeline |
| Dress Code | `/dress-code` | Colour palette & guidelines |
| Gifts | `/gifts` | Registry with donation links |
| Gallery | `/gallery` | Photos & videos |
| Contact | `/contact` | Contact persons + QR directions |

### Admin Dashboard
| Section | Features |
|---------|----------|
| **Invitees** | Add/edit guests, generate QR codes, download QR images |
| **Reservations** | View all RSVPs, filter by status, see plus-ones & dietary needs |
| **Agenda** | Manage order of events for both days |
| **Venues** | Add venues with map links |
| **Gifts** | Registry management, mark items as claimed |
| **Gallery** | Upload photos/videos or add by URL |
| **Emails** | Send personalised emails with QR codes to guests |
| **Site Content** | Edit contact persons, taglines, donation links |

## Auth

Two sign-in methods:
- **Magic Link** (passwordless) — sends a login link to the admin email
- **Email + Password** — set in seed or via Prisma Studio

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Prisma + SQLite (swap for Postgres in production)
- **Auth**: NextAuth v4 (magic link + credentials)
- **Styling**: Tailwind CSS (purple/lavender/earth palette)
- **Email**: Nodemailer (SMTP)
- **QR Codes**: `qrcode` library

## Deployment

For production:
1. Switch `DATABASE_URL` to a hosted Postgres (e.g. Supabase, Neon)
2. Set `NEXTAUTH_URL` to your domain
3. Generate a strong `NEXTAUTH_SECRET`
4. Configure SMTP credentials
5. Deploy to Vercel / Railway / any Node.js host

```bash
npm run build && npm start
```
