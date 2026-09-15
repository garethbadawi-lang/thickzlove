# Love Z Thick

Official website for **Love Z Thick** (`@ZLOVE_theGOAT`) — Atlanta-based adult entertainer, video vixen, dancer and content creator. 18+ Only.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)  
Set `ADMIN_PASSWORD` in `.env.local` before production use.

## Official links

- X: https://x.com/ZLOVE_theGOAT
- Telegram: https://t.me/thickzlove
- OnlyFans VIP: https://onlyfans.com/Thickzlove912
- OnlyFans FREE: https://onlyfans.com/thickzlovefree
- Cash App: https://cash.app/$thickzlov3
- Venmo: https://venmo.com/thickzlove94
- XVideos: https://www.xvideos.com/amateur-channels/thickzlove
- Pornhub: https://www.pornhub.com/pornstar/thick-z-love

## Configuration

| File | Purpose |
|------|---------|
| `src/data/site-config.ts` | Brand, copy, age gate, SEO |
| `src/data/services.ts` | Editable service menu |
| `src/data/availability.ts` | Indicative calendar data |
| `src/data/gallery.ts` | Gallery images and categories |
| `src/data/faqs.ts` | FAQ content |
| `src/data/etiquette.ts` | Etiquette sections |
| `src/data/navigation.ts` | Primary and footer navigation |
| `src/data/legal.ts` | Terms and privacy templates |
| `src/data/socials.ts` | Official social and content links |

Booking enquiries are stored privately in `.data/bookings.json` (gitignored). Identity documents are never accepted or stored by this site.

## Pages

Home, Services, Booking, Availability, Gallery, About, Etiquette, FAQ, Contact, Terms, Privacy, and a private `/admin` booking dashboard.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — lint
