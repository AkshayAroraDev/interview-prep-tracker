# Interview Prep Tracker

A modern, frontend-only interview preparation tracker built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui. All data persists in the browser via LocalStorage.

## Features

- Dashboard with overall progress stats
- Technologies organized into sections and topics
- Topic status tracking (`not_started`, `in_progress`, `completed`, `needs_review`)
- Priority levels and notes/resources per topic
- Full CRUD for technologies, sections, and topics
- Seed demo data on first load

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- LocalStorage persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/              # App Router pages
components/       # Reusable UI components
  dashboard/
  layout/
  providers/
  section/
  shared/
  technology/
  topic/
  ui/             # shadcn/ui primitives
data/             # Seed data
hooks/            # Custom React hooks
lib/              # Storage, progress, constants, central topic catalog
types/            # TypeScript interfaces
```

## Data Model

- **Technology** — top-level stack or domain (e.g. React, System Design)
- **Section** — grouped study area within a technology
- **Topic** — individual item with status, priority, notes, and resources

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint
