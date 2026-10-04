# Silicon Maze: Multiverse Recon

**Live Demo:** [https://multiverse-recon.onrender.com/](https://multiverse-recon.onrender.com/)

**Multiverse Recon** is a responsive, web-based geospatial location-guessing game inspired by *Avengers: Doomsday* and the Time Variance Authority (TVA). Players act as TVA field agents dropped into random location anomalies across the globe and must stabilize the timeline by pinpointing their exact coordinates on an interactive world map before time runs out.

---

## Tech Stack

- **Structure & Logic:** HTML5, Vanilla JavaScript (ES6+)
- **Styling & Theme:** Tailwind CSS (via CDN), Custom CSS Glassmorphism, Google Fonts (`Montserrat` & `Inter`)
- **Interactive Mapping:** Leaflet.js (`v1.9.4`) + OpenStreetMap Tiles
- **Geospatial Math:** Custom Great-Circle Haversine Formula implementation
- **Persistence & Shared Leaderboard:** Browser `localStorage` + `KVdb.io` REST API integration for cross-player score syncing
- **Deployment:** Render

---

## Task & Rubric Implementation Breakdown

### Task 1: The Observation Deck (UI & Map Setup)
- **Subtask 1.1 – Location Viewer:**
  - Full-viewport, responsive anomaly viewer with dynamic aspect-ratio fitting (`object-cover` / `object-contain`), ambient backdrop blur, and graceful fallback states.
  - Styled with a modern GeoGuessr-inspired glassmorphic HUD combined with *Avengers: Doomsday* / TVA cosmic-amber visual theming.
  - **Interactive Spotlight Tour:** Features a 6-step interactive walkthrough on first launch with dynamic element spotlighting, keyboard navigation (`ArrowLeft`, `ArrowRight`, `Escape`), and a **Skip Tour** option that remembers the user's preference via `localStorage`. Can be re-triggered anytime via the `?` Help button in the HUD.
- **Subtask 1.2 – Interactive Nexus Map:**
  - Powered by **Leaflet.js** and OpenStreetMap.
  - Features a hover-expandable (and pin-able) mini-map dock on desktop and a slide-up drawer on mobile/touch devices, complete with continuous `invalidateSize()` frame syncing.
  - Players can click/tap anywhere on the globe to drop and freely reposition their custom SVG guess marker prior to locking in their coordinates.

### Task 2: Timeline Stabilization (Core Logic)
- **Subtask 2.1 – Anomaly Generation:**
  - Curated dataset of 12 iconic global landmarks across 6 continents with exact latitude/longitude coordinates, high-resolution Wikimedia Commons imagery, and contextual hints.
  - Uses a Fisher-Yates shuffle (`shuffledCopy`) at the start of each game session to select 5 unique, non-repeating anomalies per run.
- **Subtask 2.2 – Convergence Calculation:**
  - Implements the **Haversine Formula** (`haversineDistanceKm`) using Earth's mean radius ($R = 6371\text{ km}$) to compute the exact great-circle distance between the player's marker and the actual anomaly coordinates:
    $$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cdot\cos(\phi_2)\cdot\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
    $$d = 2R \cdot \arcsin\left(\min(1, \sqrt{a})\right)$$

### Task 3: The TVA Assessment (Scoring & Progression)
- **Subtask 3.1 – Scoring System:**
  - **Maximum Threshold:** `5,000 points` per round (awarded for pinpoint guesses within $\le 5\text{ km}$).
  - **Zero-Point Cutoff:** `0 points` for guesses $\ge 8,000\text{ km}$ away (or when the timer expires).
  - **Decay Curve:** Smooth quadratic distance decay for intermediate guesses:
    $$\text{Points} = \text{round}\left(5000 \times \left(\frac{8000 - d}{8000 - 5}\right)^2\right)$$
- **Subtask 3.2 – Multi-Round Gameplay & Results:**
  - **5-Round Game Loop:** Tracks round progression (`1 / 5` to `5 / 5`), cumulative score, and active streaks in the top-right HUD.
  - **Post-Round Assessment:** Reveals the true location pin, draws a dashed amber trajectory polyline between the player's guess and the actual target, auto-fits the map bounds, and animates the points earned. Supports `Spacebar` hotkeys for rapid guessing and round progression.
  - **Final Results Screen:** Displays final score out of `25,000`, assigns a TVA Agent Rank (*Temporal Director*, *Senior Hunter*, *Field Agent*, etc.), presents a 5-round breakdown table, renders a master summary map containing all 5 guess-to-actual polylines simultaneously, and provides a **Play Again** button.

### Task 4: Multiversal Anomalies (Bonus Features Implemented)
- **Time Dilation (Countdown Timers):** Circular SVG progress ring + digital countdown timer in the top HUD. Pulses red during the final 10 seconds and auto-submits the round if time expires.
- **Nexus Streaks:** Consecutive guesses within `1,000 km` increment the player's Nexus Streak counter (`1x`, `2x`, etc.) and illuminate the HUD lightning badge.
- **Difficulty Levels:**
  - **Easy:** `60s` timer + **Reveal Hint** button unlocked (`1 clue` per round).
  - **Medium:** `30s` timer, no hints.
  - **Hard:** `15s` timer, no hints, and applies a `1.5x` magnification zoom (`hard-zoom`) on the anomaly image to restrict visual context.
- **Shared & Local Leaderboards:** Players can log their Agent Name on the final screen. Scores persist locally and support optional cross-device public syncing via a shared **KVdb.io** bucket ID.

---

## Project Structure

```text
├── index.html        # Application markup, Tailwind config, custom styles, and HUD overlays
├── app.js            # Core game loop, Haversine math, Leaflet controllers, tour, and leaderboard
├── public/
│   └── logo.png      # Multiverse / Doctor Doom ambient background artwork
└── README.md         # Project documentation