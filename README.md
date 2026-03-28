# LagunApp Admin

Admin dashboard for the **LagunApp** platform — a Mexican entertainment & hospitality app.

Built with **React 19**, **Vite**, and **Tailwind CSS** using a desert dark theme.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI |
| Data Fetching | TanStack Query |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Routing | React Router DOM 7 |
| Real-time | Socket.io Client |

## Features

- **Analytics** — Dashboard with charts and KPIs
- **Events** — Create, edit, and manage events
- **Restaurants** — Restaurant listings and management
- **Tickets** — Ticket sales and bookings
- **Tours** — Tour management
- **Blog** — Content management
- **Coupons** — Discount code management
- **Users** — User management and moderation
- **Wallet** — Payment and wallet oversight
- **Advertising** — Ad campaigns
- **Subscriptions** — Subscription plan management
- **Clans (ClanCity)** — Clan management and moderation
- **Settings** — Platform configuration

## Prerequisites

- **Node.js** >= 20

## Getting Started

### 1. Configure Environment

```bash
cp .env.debug .env
```

Edit `.env` with your API URL and service keys. See `.env.example` for all variables.

| File | Purpose |
|------|---------|
| `.env.debug` | Development values (localhost API) |
| `.env.release` | Production values (env var references) |
| `.env.example` | Template with placeholders |

### 2. Install Dependencies

```bash
npm install
```

### 3. Run

```bash
npm run dev
```

Opens at **http://localhost:5173**

## Building

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

## Linting

```bash
npm run lint
```

## Project Structure

```
lagunapp-admin/
├── src/
│   ├── components/          # Shared UI components
│   │   ├── ui/             # Base UI primitives (Radix-based)
│   │   ├── tables/         # Table components
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout (sidebar, header, etc.)
│   │   └── charts/         # Chart components
│   ├── features/           # Feature modules
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── restaurants/
│   │   ├── tickets/
│   │   ├── tours/
│   │   ├── blog/
│   │   ├── coupons/
│   │   ├── users/
│   │   ├── wallet/
│   │   ├── advertising/
│   │   ├── moderation/
│   │   ├── subscriptions/
│   │   └── settings/
│   ├── core/               # Core utilities
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── hooks/
│   │   └── api/
│   ├── pages/              # Page components
│   ├── styles/             # Additional styles
│   ├── assets/             # Static assets
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global CSS + desert dark theme variables
└── public/                 # Public assets
```

## Theme

Uses a **desert dark color palette** (Mexican-inspired):

| Role | Color | Hex |
|------|-------|-----|
| Background | Dark warm brown | `#1A1412` |
| Surface | Dark brown | `#2D2422` |
| Primary | Terracotta | `#C2542D` |
| Secondary | Desert gold | `#D4A843` |
| Accent | Mexican turquoise | `#2A9D8F` |
| Text | Warm cream | `#F5E6D3` |
| Error | Cactus red | `#E63946` |
| Success | Sage green | `#4A7C59` |
| Warning | Amber | `#E9A23B` |

All colors are defined as CSS variables in `src/index.css`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_WS_URL` | WebSocket URL |
| `VITE_APP_NAME` | Application name |
| `VITE_APP_ENV` | Environment (`development` / `production`) |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key |
| `VITE_GOOGLE_MAPS_KEY` | Google Maps API key |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |

## Related Repositories

- **lagunapp-backend** — Backend microservices (NestJS + Nx)
- **lagunapp_user** — User mobile app (Flutter)
- **lagunapp_organizer** — Organizer mobile app (Flutter)
- **lagunapp_restaurant** — Restaurant mobile app (Flutter)
- **lagunapp_scanner** — Scanner mobile app (Flutter)
- **lagunapp-infra** — Infrastructure (Docker Compose)

## License

Private — All rights reserved.
