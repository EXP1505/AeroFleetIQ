# AeroFleetIQ

Frontend-only demo prototype for **SIH26249 — Air Power: Predictive Maintenance & Fleet Availability** (Team Leviathan).

There is no real backend or ML model. All fleet, sensor, spares, and maintenance data comes from a deterministic, seeded mock data layer in [`src/lib/mock`](src/lib/mock), served through async functions in [`src/lib/api.ts`](src/lib/api.ts) that mimic REST responses (300–600ms simulated latency) so a FastAPI backend could later be dropped in without changing any page code.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui-style primitives + Recharts + Framer Motion + lucide-react.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Deploying

The app is a standard Next.js project and deploys to Vercel with no extra configuration — connect the repo and deploy.

## Pages

- **Fleet Overview** (`/`) — KPIs, fleet health heatmap, 30-day availability forecast, priority list
- **Aircraft Detail** (`/aircraft/[tail]`) — component tree, sensor telemetry, RUL chart, explainability panel
- **Recommendations** (`/recommendations`) — Inspect/Monitor/Replace actions with approve/defer/override + audit log
- **Spares & Resources** (`/spares`) — inventory, lead times, technicians, facilities
- **Decision Engine** (`/decision-engine`) — what-if comparison for the AF-107 hero scenario
- **Digital Thread** (`/digital-thread`) — sensor → aircraft → component → maintenance → spare → outcome graph
- **Closed-Loop Learning** (`/learning`) — prediction vs. actual finding feedback, model drift monitor
- **KPI & Methodology** (`/methodology`) — formulas, tracked KPIs, pipeline architecture, tech stack

## Guided demo

Click **Start Guided Demo** in the top bar for a ~2.5 minute scripted walkthrough that navigates the hero scenario (AF-107's degrading gearbox bearing) end to end. Keyboard shortcuts while running: `Space` pause/resume, `→` next step, `Esc` exit.

A scripted "live alert" toast also fires ~20 seconds after each page load to simulate a new anomaly arriving.

## Data story

The hero scenario: **AF-107** has a degrading gearbox bearing (vibration trending up, RUL ≈ 38 cycles ±9), the only spare is at an OEM depot with a 21-day lead time, and the next maintenance window opens in 12 days — a conflict the Decision Engine page walks through with three mitigation options. Three other aircraft (AF-112, AF-119, AF-123) carry similar injected degradation patterns for variety.

All data is synthetic and seeded for reproducibility — the same values appear on every load. No invented accuracy or impact figures are shown; every number on screen is derived from the mock data model.
