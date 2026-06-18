# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Marketing site + admin "intranet" for Lavandería El Cobre, a laundry business in Calama, Chile. Built with Next.js (App Router), React 19, TypeScript, and Tailwind CSS v4. A Firebase Data Connect (PostgreSQL) schema exists to model the eventual data layer, but **no backend is wired up yet** — every page and component currently uses hardcoded arrays or `setTimeout`-simulated async calls instead of real data fetching.

## Commands

Package manager is **pnpm** (not npm/yarn — see `pnpm-lock.yaml` / `pnpm-workspace.yaml`; ignore the npm/yarn/bun alternatives mentioned in README.md).

```bash
pnpm dev      # start dev server (http://localhost:3000)
pnpm build    # production build
pnpm start    # serve production build
pnpm lint     # eslint
```

There is no test suite/framework configured in this repo.

### Firebase Data Connect (local emulator)

The `dataconnect/` schema is managed via the Firebase CLI and the `firebase-data-connect` skill in `.agents/skills/`. The emulator persists data to `dataconnect/.dataconnect/pgliteData` (PGLite) per `firebase.json`. `dataconnect-debug.log` and `pglite-debug.log` are emulator-run artifacts, not source.

## Architecture

### Two independent surfaces under `app/`

1. **Public landing page** (`app/page.tsx`) — single page composed of section components from `components/landing/*` (Hero, Services, Machinery, Reception, ContactForm) wrapped by `components/layout/Navbar.tsx` and `Footer.tsx`. The root `app/layout.tsx` sets global metadata/fonts (Outfit for display, Inter for body) and a shared light background (`bg-[#fdfcfb]`).
2. **Admin intranet** (`app/intranet/*`) — separate layout (`app/intranet/layout.tsx`) with its own dark sidebar shell (`components/intranet/Sidebar.tsx`) and no shared chrome with the landing page. Routes: `/intranet` (dashboard), `comandas` (orders), `seguimiento` (production tracking), `inventario` (stock), `usuarios`, `configuracion`.

There's no auth/route guarding yet — `Navbar.tsx`'s login modal just simulates a delay and `router.push("/intranet")` if the typed email is `administrador@gmail.com`; the intranet itself does not check auth state.

### Data model is defined but not connected

`dataconnect/schema/schema.gql` is the source of truth for the intended domain model (orders/`Comanda`, production stages/`EtapaProduccion`, inventory/`Insumo`, users/`Usuario`+`Rol`, AI consumption prediction module, etc.) — read the header comments in that file for the naming conventions in use (PascalCase types, camelCase fields, `Usuario.id` bound to Firebase Auth UID, composite keys via `@table(key: [...])`). `dataconnect/example/connector.yaml` points its generated JS/React SDK output at `src/dataconnect-generated`, but that SDK has not been generated and nothing in `app/` or `components/` imports it. When wiring real data into a page, the schema is the contract to build against — don't invent a different shape.

All current pages (landing + intranet) hold their "data" as local literals/`useState` inside the component file (e.g. `orders` array in `app/intranet/comandas/page.tsx`, simulated tracking/auth in `components/layout/Navbar.tsx`). When replacing these with real data, follow the existing component-local pattern unless asked to introduce shared data-fetching.

### Styling conventions

- Tailwind v4 CSS-first config: the brand palette, fonts, and custom utility classes (`.glass-card`, `.glass-modal`, `.text-gradient`, `.bg-gradient-brand`, `.shadow-premium`, etc.) are all defined in `app/globals.css` under `@theme` / plain CSS — there is no `tailwind.config.js`.
- Landing-page components use a light, warm theme (`brand`/`copper` oranges on off-white); intranet components use a dark theme (`bg-stone-950` + same brand accent).
- Most interactive components are client components (`"use client"`) using `framer-motion` for animation and `lucide-react` for icons — match this stack rather than introducing alternatives.
- Path alias `@/*` maps to the repo root (see `tsconfig.json`), e.g. `import Navbar from "@/components/layout/Navbar"`.
