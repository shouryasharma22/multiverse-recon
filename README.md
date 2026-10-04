# Silicon Maze: Multiverse Recon

A complete, browser-based TVA field-recon game. Identify five real-world landmark anomalies, place a map guess for each, and earn a final TVA rank from your accuracy.

## Run locally

No build tools, package installs, or API keys are required. Open `index.html` in a current browser, or serve the folder with any static web server for the most consistent map and browser-storage behavior. For example:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. The page loads Tailwind CSS, Leaflet, map tiles, fonts, and landmark photographs from their respective CDNs, so an internet connection is needed for those assets. Gameplay and the local leaderboard work in the browser without a backend.

## Stack and structure

- `index.html`: responsive TVA-inspired terminal, onboarding and difficulty selector, gameplay layout, results layout, and CDN dependencies.
- `app.js`: landmark data, random round selection, Leaflet maps, countdowns, scoring, streaks, result reporting, and leaderboard persistence.
- Tailwind CSS via its CDN plus a small set of custom CSS variables and responsive styles; no compilation step.
- Leaflet.js via CDN with OpenStreetMap tiles; no map key is needed.
- Wikimedia Commons `upload.wikimedia.org` image assets; no image key is needed.

## Gameplay and rubric coverage

- A first-load tour explains image reconnaissance, map placement, and the five-round operation. Easy, Medium, and Hard protocols can be selected before starting.
- Each session shuffles 12 iconic landmarks and selects five unique targets. The dataset covers North America, South America, Europe, Africa, Asia, and Oceania: Eiffel Tower, Taj Mahal, Statue of Liberty, Sydney Opera House, Colosseum, Christ the Redeemer, Machu Picchu, Great Wall of China, Mount Fuji, Pyramids of Giza, Big Ben, and Burj Khalifa.
- The location viewer shows the current Wikimedia Commons photograph. Easy mode offers one textual hint per round. Hard mode magnifies the evidence feed to 150%.
- The interactive Leaflet map accepts a single movable player marker. A guess enables the timeline submission control.
- Each submitted round reveals the actual marker, draws an amber dashed guess-to-target line, fits the map to the result, and reports the distance and points before the next anomaly.
- Round five opens a final report with all round outcomes, TVA rank, and a results map showing all guessed and actual locations and their connection lines. The map is explicitly invalidated after display to ensure it renders at its final size.
- Play Again returns to the briefing with the chosen protocol preselected and starts a fresh set of five distinct anomalies.

## Distance and scoring

The great-circle distance uses the Haversine formula, with Earth’s mean radius set to $R = 6371$ km. Given coordinates $(\phi_1, \lambda_1)$ and $(\phi_2, \lambda_2)$ in radians:

$$
a = \sin^2\left(\frac{\phi_2-\phi_1}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\lambda_2-\lambda_1}{2}\right)
$$

$$
d = 2R\arcsin(\sqrt{a})
$$

Distance is measured in kilometres. A guess within 5 km earns the full 5,000 base points, and a distance of 8,000 km or more earns zero. Between those bounds, a quadratic decay curve is used:

$$
P_{base} = 5000\left(\frac{8000-d}{8000-5}\right)^2
$$

A guess within 1,000 km advances the Nexus streak. Its round score is multiplied by $1 + 0.1s$, where $s$ is the updated streak length, and capped at 5,000 points per round. Missing a guess or exceeding the 1,000 km streak radius resets the streak. A timeout auto-submits for zero points and resets the streak. Time limits are 60 seconds for Easy, 30 for Medium, and 15 for Hard.

## Leaderboard

The final report includes a top-ten leaderboard seeded with sample TVA agent scores. Results are always stored in `localStorage` for same-browser persistence. For cross-device sharing, create a public KVdb bucket and enter its bucket ID in the leaderboard’s optional connection field; the app reads and writes the `leaderboard` key through KVdb’s REST API. A bucket ID is not an API key, but a public bucket allows anyone who knows its ID to alter its contents, so scores must be treated as untrusted. KVdb’s free buckets expire keys after a period of inactivity. Remote sync is best-effort, and local storage remains the fallback when no bucket is configured, the service is unavailable, or the browser blocks storage.

## External services and attribution

- Map display and geocoding tiles: OpenStreetMap contributors, attributed in the map controls.
- Landmark photographs: Wikimedia Commons, loaded directly from `upload.wikimedia.org`.
- Optional public leaderboard sync: JSONBlob REST API.
- Tailwind CSS, Leaflet, and Google Fonts are loaded from public CDNs.