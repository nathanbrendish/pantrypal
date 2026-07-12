# ShelfLife

AI-powered pantry management, meal planning and smart shopping lists to reduce food waste.

**Live:** [https://myshelflife.co.uk](https://myshelflife.co.uk)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `NEXT_PUBLIC_SITE_URL=https://myshelflife.co.uk` in production (and your local `.env.local` when testing auth redirects).

## Auth emails (Supabase)

Configure Supabase Auth email templates to use the ShelfLife brand, for example:

- Welcome to ShelfLife
- Verify your ShelfLife account
- Reset your ShelfLife password

Site URL / redirect URLs should use `https://myshelflife.co.uk`.

## Deploy

Deployed on Vercel from the `main` branch.
