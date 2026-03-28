# LagunApp Admin

React admin dashboard for the LagunApp platform.

## Tech Stack

- **Framework:** React 19
- **Build:** Vite 8
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI
- **State/Data:** TanStack Query + TanStack Table
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Routing:** React Router DOM 7
- **Real-time:** Socket.io Client

## Project Structure

```
lagunapp-admin/
├── src/
│   ├── components/          # Shared UI components
│   │   ├── ui/             # Base UI primitives
│   │   ├── tables/         # Table components
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components
│   │   └── charts/         # Chart components
│   ├── features/           # Feature modules
│   │   ├── analytics/      # Dashboard analytics
│   │   ├── auth/           # Authentication
│   │   ├── events/         # Event management
│   │   ├── restaurants/    # Restaurant management
│   │   ├── tickets/        # Ticket management
│   │   ├── tours/          # Tours management
│   │   ├── blog/           # Blog management
│   │   ├── coupons/        # Coupon management
│   │   ├── users/          # User management
│   │   ├── wallet/         # Wallet management
│   │   ├── advertising/    # Ad management
│   │   ├── moderation/     # Content moderation
│   │   ├── subscriptions/  # Subscription management
│   │   └── settings/       # Admin settings
│   ├── core/               # Core utilities
│   │   ├── types/          # TypeScript types
│   │   ├── constants/      # Constants
│   │   ├── utils/          # Utility functions
│   │   ├── hooks/          # Custom hooks
│   │   └── api/            # API client
│   ├── styles/             # Global styles
│   ├── assets/             # Static assets
│   ├── pages/              # Page components
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global CSS + theme variables
└── public/                 # Public assets
```

## Prerequisites

- Node.js >= 20

## Environment Variables

```bash
# For development/debug
cp .env.debug .env

# For production/release
cp .env.release .env
```

See `.env.example` for all required variables.

## Install Dependencies

```bash
npm install
```

## Running (Development)

```bash
npm run dev
```

Opens at http://localhost:5173

## Building

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## Linting

```bash
npm run lint
```

## Theme

Uses a desert dark color palette (Mexican-inspired). CSS variables are defined in `src/index.css`. The palette uses warm browns, terracotta, desert gold, and turquoise accents.
