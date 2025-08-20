# **App Name**: AquaCast

## Core Features:

- Current Conditions & Hourly Forecast: Display current weather conditions (temperature, wind, humidity, pressure trend, cloud cover) and an hourly mini-forecast for the next 4 hours with a 'Now' pill.
- Location Selection & Search: Allow users to select a location using GPS or manual input and search for spots, lakes, or rivers; persist recent queries and let users pin a default 'home water'.
- Fishing Success Score & Recommendation: Generate a species-aware fishing success score (Bream/Bass/Carp) and highlight a recommended time window based on current and recent conditions, using a scoring tool/module.
- Interactive Map: Present an interactive map with pins for access points, ramps, swims/pegs, depth notes, and user-added photos; enable offline tiles for saved areas.
- Forecast Graphs: Show an hourly fishing-success forecast graph for the next 24 hours and a daily outlook for 7 days, including sunrise/sunset, UV, and moon phase overlays.
- Favorites and Recent Locations: Allow users to save favorite spots and species presets; sync across devices and surface a 'Recently viewed' rail.
- Offline Caching: Cache last-known conditions, forecast, and map tiles for saved spots to work without internet; auto-refresh when connectivity returns.
- MObile first design. with device aware layout for mobile and web.: Mobile first design. with device aware layout for mobile and web.
- Modular Architecture: Use a feature-first folder structure (`features/weather/`, `features/success/`, `features/map/`, `features/favorites/`) with clear boundaries and shared `core/` utilities.
- Strong Typing & Contracts: Define TypeScript interfaces/schemas (e.g., `WeatherSample`, `SuccessScore`, `Spot`) and validate external data with a runtime schema library (e.g., Zod) at API boundaries.
- Scoring Engine as a Pure Module: Implement the “Fishing Success” tool as a deterministic, side-effect-free package with species configs (JSON), unit tests, and a public API like `score({ species, met, hydro, sunmoon, clock })`.
- State Management Strategy: Centralize cross-feature state (auth, settings, favorites, cache indexes) in a predictable store (Redux Toolkit/Zustand), keep screen-local UI state inside components, and use RTK Query/TanStack Query for server cache + revalidation.
- API Layer Abstraction: Encapsulate all network calls (weather, hydrology, maps) behind service adapters with retry, backoff, and response normalization; never call `fetch` in components.
- Caching & Offline Policy: Adopt a consistent strategy: - forecasts: *stale-while-revalidate* with versioned keys - maps: tile cache with LRU eviction - user content: optimistic updates + background sync.

## Style Guidelines:

- Aqua Teal `#3CC7B7` → Highlights & primary actions (buttons, success badges).
- Deep Blue `#2A2E3F` → Background panels, top nav.
- Sky Blue `#A5D8FF` → Weather/forecast accents.
- Sunset Orange `#FF8C42` → Alerts, critical notifications.
- Light Gray `#F5F7FA` → Background.
- Medium Gray `#A0A4A8` → Secondary text/icons.
- Dark Gray `#2C2C2C` → Headlines & key text.
- Success (Good fishing): Green `#27AE60`
- Fair/Poor fishing: Amber `#F2C94C`, Red `#EB5757`
- Maintain a clean and intuitive layout, prioritizing **Fishing Success Scores** and **Recommended Time Windows**.
- Each info block (weather, species, map, UV) lives in a rounded card with soft shadow.
- Fishing success card always topmost; supporting weather and forecast details below.
- Bottom nav bar with **Home, Favorites, Search, Maps**; sticky for quick access.
- Ample margins and padding to prevent clutter, especially around graphs.
- *Space Grotesk* (sans-serif), weight 600–700, slightly condensed.
- *Inter* (sans-serif), weight 400–500, highly legible on light and dark backgrounds.
- Use monospaced variant of Inter for consistent alignment.
- Headlines: 20–24px
- Body: 14–16px
- Caption/labels: 12px
- Modern, line-based icons with subtle fills (cloud, rain, sun, wind).
- Flat, minimal silhouettes (bream, bass, carp) in outline with optional color fill when active.
- Standard map pins, docks, boat, and walking icons—consistent stroke weight.
- Rounded, minimal icons for search, favorites, settings.
- Smooth number rolling for temperature, success % changes.
- Skeleton shimmer placeholders for cards.
- Slide-in for detailed spot views; fade for overlays.
- Button press → subtle scale/bounce; favorite toggle → heart pulse animation.
- Calm, natural, and modern—reflects both tech accuracy and outdoor fishing serenity.
- Rounded corners (12–20px radius), soft shadows, layered depth for cards.
- Used sparingly—teal/blue for fishing success backgrounds, sunrise/sunset gradients for time dials.