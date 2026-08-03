# Site Template

Site template for the SmartFlow multi-site platform. Forked automatically when provisioning new sites.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Drizzle ORM** + Supabase Postgres (postgres.js driver)
- **Auth0** authentication (@auth0/nextjs-auth0 v4)
- **Puck** block editor for visual page editing
- **Tailwind CSS** for styling

## Getting Started

```bash
cp .env.example .env.local
# Fill in your credentials
npm install
npm run dev
```

## Database

```bash
npm run db:generate   # Generate migration files from schema
npm run db:migrate    # Run migrations
npm run db:push       # Push schema directly (dev)
```
