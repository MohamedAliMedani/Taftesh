# تفتيش وتوثيق — Taftesh

منصة التحقق العقاري الأولى في مصر. تساعد المستخدمين على تجنب الاحتيال العقاري عبر طلب فحص هندسي أو مراجعة قانونية من خبراء معتمدين.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth.js (JWT)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion

---

## Deploy to Vercel

### Step 1 — Push to GitHub

```bash
cd Taftesh
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/taftesh.git
git push -u origin main
```

### Step 2 — Create Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free project
2. Copy the connection string — it looks like:
   ```
   postgresql://user:pass@ep-xxx.region.neon.tech/neondb?sslmode=require
   ```

### Step 3 — Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set **Root Directory** to `Taftesh` (if your repo root is `TafteshApp`)
4. Add these **Environment Variables**:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Your Neon connection string | Yes |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Yes |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth app ID | No |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth app secret | No |
| `FAWATERK_VENDOR_KEY` | Fawaterk payment vendor key | No |
| `FAWATERK_PROVIDER_KEY` | Fawaterk payment provider key | No |
| `NEXT_PUBLIC_BUSINESS_PHONE` | Business phone (e.g. `01112489730`) | No |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp with country code (e.g. `201112489730`) | No |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | Contact email | No |
| `NEXT_PUBLIC_PRICE_TECHNICAL` | Engineering package price (default `5000`) | No |
| `NEXT_PUBLIC_PRICE_LEGAL` | Legal package price (default `5000`) | No |
| `NEXT_PUBLIC_PRICE_FULL` | Full package price (default `8000`) | No |

5. Click **Deploy**

Vercel will automatically run `prisma generate` via the `postinstall` script, then build.

### Step 4 — Initialize Database

After deploying, run these commands locally with your Neon `DATABASE_URL`:

```bash
# Set your database URL
export DATABASE_URL="postgresql://..."

# Push schema to database
npx prisma db push

# Create admin + test users
node prisma/seed.js
```

Or pull env from Vercel:
```bash
npx vercel env pull .env.local
npx prisma db push
node prisma/seed.js
```

### Step 5 — Update NEXTAUTH_URL

After your first deploy, copy the Vercel URL (e.g. `https://taftesh.vercel.app`) and update the `NEXTAUTH_URL` environment variable in the Vercel dashboard to match it. Redeploy.

---

## Important Notes for Vercel

### File Uploads
Vercel has a **read-only filesystem**. The national ID image upload (`/api/upload`) stores files locally which **will not persist** between deploys on Vercel.

For production on Vercel, replace with one of:
- **Vercel Blob** — `npm i @vercel/blob` (recommended for Vercel)
- **Cloudinary** — free tier, easy integration
- **AWS S3** — full control

Local file upload works fine for development and VPS deployments.

### Prisma on Vercel
The `postinstall` script in `package.json` runs `prisma generate` automatically. No extra config needed.

---

## Local Development

```bash
# Install
npm install

# Setup environment
cp .env.example .env
# Edit .env — set DATABASE_URL and NEXTAUTH_SECRET

# Setup database
npx prisma db push
npx prisma generate
node prisma/seed.js

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Test Accounts

| Role | Phone | Password |
|------|-------|----------|
| Admin | `01000000000` | `Admin@Taftesh2026!` |
| Engineer | `01111111111` | `Expert@2026!` |
| Lawyer | `01222222222` | `Expert@2026!` |
| Client | `01555555555` | `Client@2026!` |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/                      # Login
│   ├── register/                   # Registration (client + expert with ID upload)
│   ├── verify-email/               # Email verification
│   ├── checkout/                   # Booking + payment (online + cash)
│   ├── dashboard/                  # Client dashboard
│   │   └── requests/[id]/          # Request detail + rating
│   ├── provider/                   # Provider dashboard
│   │   ├── requests/[id]/          # Status update + report upload
│   │   └── profile/                # Profile management
│   ├── admin/                      # Admin dashboard
│   │   ├── requests/               # Request management + provider assignment
│   │   ├── users/                  # User management
│   │   ├── providers/              # Provider verification + national ID review
│   │   └── messages/               # Contact messages
│   └── api/                        # All API routes
├── components/ui/                  # Reusable UI components
├── lib/
│   ├── config.ts                   # Centralized config (prices, contact info)
│   ├── types.ts                    # TypeScript types + labels
│   ├── prisma.ts                   # Prisma client
│   ├── auth.ts                     # Auth helpers
│   └── notifications.ts            # Notification system
└── middleware.ts                    # Route protection + security headers
```

## User Roles

| Role | Capabilities |
|------|-------------|
| **Client** | Submit requests, track status, view reports, rate providers |
| **Expert** | View assigned work, update status, submit reports, manage profile |
| **Admin** | Manage users, verify experts (review national ID), assign requests, analytics |
