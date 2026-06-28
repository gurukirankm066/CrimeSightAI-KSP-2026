# CrimeSight AI — Operational Intelligence Platform

A desktop-first enterprise intelligence application styled after Palantir Gotham / Motorola Command Central. Five core modules plus persistent AI assistant, universal search, notifications, and officer profile. Fully simulated (no backend) with realistic synthetic Karnataka Police data, real interactive Leaflet maps, and a force-directed network graph.

## Visual Direction (STRICT)
- Reference screenshots are the visual source of truth; do not redesign the product.
- No gradients, glassmorphism, neumorphism, colorful dashboards, rounded consumer UI, floating cards, or startup aesthetics.
- Maintain the same visual hierarchy, spacing, typography, proportions, colors, and enterprise look as the reference. Only improve consistency and implementation quality.

## Definition of Done
- No placeholder boxes, empty charts, TODO comments, "Coming Soon" sections, unfinished components, or blank pages.
- Every route fully navigable using synthetic data.
- All tables, graphs, maps, AI panels, filters, search, notifications, and interactions appear complete and production-ready on mock data.
- If a visualization cannot be fully implemented, ship the closest fully working alternative — never an empty placeholder.

## Design System

**Palette (enterprise dark, no gradients/glassmorphism)**
```text
Background      #0B0D10
Panel           #11141A
Elevated        #161A21
Border          subtle ~ #232833
Accent          Signal Cyan  #2DD4DE
Alert Red       #E5484D   (alerts only)
Alert Amber     #F5A623   (alerts only)
Text primary    #E6EAF0
Text muted      #8A93A3
```
- Radius small (4–6px), 8px spacing grid, subtle 1px borders, fast/minimal transitions (120–180ms).
- Typography: **Inter** (UI) + **IBM Plex Mono** (FIR numbers, IDs, timestamps, metrics) via `@fontsource` packages.
- Semantic tokens in `src/styles.css` (`@theme inline` + `:root`); dark only. No `text-white`/`bg-black` literals.
- Density-first: compact tables, live pulse indicators, monospaced data fields.

## Backend Constraints
No Supabase, Firebase, database, auth, APIs, edge functions, or backend code. Everything runs entirely from deterministic in-memory mock data.

## Architecture & Routing (TanStack Start)

Shared app shell in `__root.tsx`: sticky top nav (Command Center, Morning Intelligence, Investigation Hub, Criminal Network, Crime Analytics) + global utilities (Search ⌘K, Notifications, CrimeSight AI, Officer Profile). Administration lives only inside Officer Profile.

```text
src/routes/
  __root.tsx              shell: TopNav + utilities + AI slide-over + search + notifications
  index.tsx               -> /  (Command Center)
  morning-intelligence.tsx
  investigation.tsx       case table + detail
  criminal-network.tsx    full-screen graph
  analytics.tsx           drill-down map + charts
  profile.tsx             officer profile + administration
```

## Component Reuse

Build a reusable enterprise component library; avoid duplicated JSX, prefer composition:
`MetricCard`, `IntelligenceCard`, `InvestigationTable`, `AlertFeed`, `HeatMapPanel`, `GraphPanel`, `SectionHeader`, `AIRecommendationCard`, `OfficerCard`, `SearchPalette`, `Timeline`, `EvidenceCard` (plus shell pieces: `TopNav`, `UtilityBar`, `LiveBadge`, `SeverityTag`).

## Shared Data Layer

`src/data/` — deterministic seeded synthetic generators: districts (Bengaluru, Mysuru, Mangaluru, Hubballi, Kalaburagi, Belagavi, Tumakuru, Shivamogga), FIRs, vehicles, officers, suspects, cases, alerts, network nodes/edges, time-series crime stats. Stable seed so data is consistent across pages.

## Maps (GeoJSON-resilient)

- **Leaflet + react-leaflet** with dark CARTO tiles, choropleth heat fill, hover tooltips.
- Architecture supports **Karnataka GeoJSON district overlays**, but does not block on the asset:
  - `src/data/geo/karnataka.ts` exports a typed `karnatakaDistricts` GeoJSON (bundled lightweight polygons if available; otherwise an empty `FeatureCollection` placeholder).
  - `HeatMapPanel` reads district heat values keyed by district name and renders the GeoJSON layer when features exist; falls back to district markers/circle heat over base tiles when the collection is empty — always a working map, never a blank box.
  - Dropping a richer GeoJSON into that one file later requires no component changes.
- `react-force-graph-2d` for the network graph (zoom/pan/drag/highlight/pin/edge-weight/timeline replay).

## Pages

**1. Command Center (flagship)** — Priority Intelligence strip; large dominant Karnataka heatmap; right sidebar = Live Intelligence Alerts (severity/district/timestamp/source/action) + AI Recommendation cards (summary/confidence/evidence/primary action); bottom row = Emerging Hotspots, Criminal Network preview, Recent Crime Activity. Live indicators, streaming-feel timestamps.

**2. Morning Intelligence** — "What happened overnight?" Overnight Summary (AI narrative), Crime Spikes, Emerging Trends, District Comparison, Suggested Actions (each ends with **Investigate**), **Export Briefing Pack** button.

**3. Investigation Hub** — professional `InvestigationTable` with filters (Priority/Status/Officer); case detail tabs: Overview, Timeline, Victims, Accused, Evidence, Related Cases, Relationship Graph (mini), AI Insights, **Generate Intelligence Report**. Minimal cards.

**4. Criminal Network** — full-screen force graph; node types Person/Vehicle/Location/FIR; zoom/pan/highlight/timeline replay/edge weight/pinned nodes; right dossier panel (Risk Score, Associates, Shared FIRs/Vehicles/Locations, Timeline) with **Send to Investigation**.

**5. Crime Analytics** — large Karnataka map with drill-down State → District → Station → FIR; map gets more visual emphasis than charts; visualizations: heatmap, clusters, crime trends, time heatmap, forecast, district comparison, prediction. Each chart annotated to explain the map.

## AI Assistant
Persistent right slide-over, context-aware per active route, scripted (no real model). Every answer renders Summary / Confidence / Evidence / Recommendation / Action button; shows **Insufficient Evidence** when data is missing. Never invents facts.

## Search & Notifications
- ⌘K command palette (cmdk) over FIR/Case/Person/Vehicle/Officer/District/Station/Evidence + recent searches.
- Operational notifications feed popover with live badge.

## UX Guarantees
- Every page answers: What happened? / Why it matters? / What next?
- ≤3 clicks to any investigation workflow; AI outputs always show evidence; role-based framing.
- Subtle micro-interactions only (hover, node highlight, map hover, live pulse).
- Responsive desktop-first at 1440 / 1280 / 1024 + tablet.

## Code Quality
- TypeScript throughout; modular files, components ~≤250 lines where practical; composition over duplication.
- TanStack Router conventions; **lazy loading** for heavy graph/map components (client-only, SSR-guarded to avoid `window` errors).
- Clean folder organization (`components/shell`, `components/ai`, `components/search`, `components/notifications`, `components/common`, `data`, `data/geo`).

## Dependencies to add
`leaflet`, `react-leaflet`, `react-force-graph-2d`, `cmdk`, `@fontsource/inter`, `@fontsource/ibm-plex-mono`. (Charts via Recharts, kept visually secondary to maps.)

## Build Order
1. Design tokens + fonts + app shell (nav, utility bar, AI slide-over, search, notifications).
2. Synthetic data layer + GeoJSON-resilient map architecture.
3. Reusable component library.
4. Command Center.
5. Morning Intelligence + Investigation Hub.
6. Criminal Network graph.
7. Crime Analytics drill-down.
8. Officer Profile + Administration, responsive polish, micro-interactions.
9. DoD pass: navigate every route, confirm no placeholders/empty states, fix any gaps with working alternatives.