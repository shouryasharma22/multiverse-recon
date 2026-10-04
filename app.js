(() => {
  'use strict';

  const LOCATIONS = [
    { name: 'Eiffel Tower', city: 'Paris, France', lat: 48.8584, lng: 2.2945, image: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg', hint: 'A wrought-iron icon rises above the Seine in the French capital, built for a world exposition.' },
    { name: 'Taj Mahal', city: 'Agra, India', lat: 27.1751, lng: 78.0421, image: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Taj-Mahal.jpg', hint: 'A white-marble mausoleum commissioned by an emperor sits beside the Yamuna River.' },
    { name: 'Statue of Liberty', city: 'New York, USA', lat: 40.6892, lng: -74.0445, image: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Statue_of_Liberty_7.jpg', hint: 'A copper neoclassical colossus stands on Liberty Island at the entrance to New York Harbor.' },
    { name: 'Sydney Opera House', city: 'Sydney, Australia', lat: -33.8568, lng: 151.2153, image: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Sydney_Opera_House_Sails.jpg', hint: 'Sail-like shells frame a performing arts centre on the edge of a famous Pacific harbour.' },
    { name: 'Colosseum', city: 'Rome, Italy', lat: 41.8902, lng: 12.4922, image: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Colosseum_in_Rome%2C_Italy_-_April_2007.jpg', hint: 'An immense ancient amphitheatre anchors the historic centre of Italy’s capital.' },
    { name: 'Christ the Redeemer', city: 'Rio de Janeiro, Brazil', lat: -22.9519, lng: -43.2105, image: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg', hint: 'An Art Deco statue with outstretched arms overlooks a Brazilian city from Corcovado mountain.' },
    { name: 'Machu Picchu', city: 'Cusco Region, Peru', lat: -13.1631, lng: -72.545, image: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Machu_Picchu%2C_Peru.jpg', hint: 'Inca stone terraces perch high in the Andes above a winding river valley.' },
{ name: 'Great Wall of China', city: 'Jinshanling, China', lat: 40.6769, lng: 117.2319, image: 'https://commons.wikimedia.org/wiki/Special:FilePath/The_Great_Wall_of_China_at_Jinshanling-edit.jpg?width=1600', hint: 'A fortified stone ridge snakes across the mountains north of Beijing.' },    { name: 'Mount Fuji', city: 'Shizuoka, Japan', lat: 35.3606, lng: 138.7274, image: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/080103_hakkai_fuji.jpg', hint: 'A near-perfect volcanic cone, often snow-capped, is Japan’s highest peak.' },
    { name: 'Pyramids of Giza', city: 'Giza, Egypt', lat: 29.9792, lng: 31.1342, image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg', hint: 'Three monumental pyramids stand on a desert plateau beside the Nile and the Great Sphinx.' },
    { name: 'Big Ben', city: 'London, United Kingdom', lat: 51.5007, lng: -0.1246, image: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Big_Ben_Elizabeth_Tower_London_2023_01.jpg', hint: 'The clock tower at the Palace of Westminster keeps time beside the River Thames.' },
    { name: 'Burj Khalifa', city: 'Dubai, United Arab Emirates', lat: 25.1972, lng: 55.2744, image: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Burj_Khalifa_-_Dubai_Mall_Metro_Station_-_panoramio.jpg', hint: 'The world’s tallest building rises above a modern desert metropolis on the Persian Gulf.' }
  ];

  const ROUND_COUNT = 5;
  const EARTH_RADIUS_KM = 6371;
  const ROUND_SECONDS = { easy: 60, medium: 30, hard: 15 };
  const LEADERBOARD_STORAGE_KEY = 'silicon-maze-leaderboard-v1';
  const REMOTE_BUCKET_KEY = 'silicon-maze-leaderboard-kvdb-bucket-v1';
  const MOCK_LEADERS = [
    { name: 'Hunter B-15', score: 23860 },
    { name: 'Agent Mobius', score: 22440 },
    { name: 'Casey 19', score: 21175 },
    { name: 'Ravonna Renslayer', score: 19720 },
    { name: 'Ouroboros', score: 18460 }
  ];

  const elements = Object.fromEntries([
    'hud-round', 'hud-score', 'hud-streak', 'hud-mode', 'hud-timer', 'play-screen', 'results-screen',
    'image-title', 'location-image', 'location-backdrop', 'image-fallback', 'image-caption', 'image-code', 'hint-button',
    'hint-box', 'guess-coordinates', 'map-status-text', 'submit-guess', 'round-report', 'tour-overlay',
    'start-game', 'final-score', 'rank-copy', 'round-table-body', 'results-map', 'leader-form',
    'agent-name', 'remote-form', 'remote-bucket', 'leader-notice', 'leaderboard-list', 'play-again',
    'hud-timer-ring', 'hud-timer-pill', 'streak-bolt', 'submit-guess-label', 'map-dock', 'map-frame',
    'map-pin-toggle', 'map-toggle', 'result-points', 'result-bar', 'result-sentence', 'next-round',
    'tour-button', 'hud-brand-pill', 'hud-stats-card', 'walkthrough-root', 'walkthrough-spotlight',
    'walkthrough-card', 'walkthrough-count', 'walkthrough-title', 'walkthrough-text', 'walkthrough-dots',
    'walkthrough-skip', 'walkthrough-back', 'walkthrough-next', 'home-button', 'results-home-button'
  ].map((id) => [id, document.getElementById(id)]));

  const state = {
    difficulty: 'easy',
    rounds: [],
    roundIndex: 0,
    score: 0,
    streak: 0,
    guess: null,
    secondsLeft: 0,
    timerId: null,
    submitted: false,
    guessMap: null,
    resultsMap: null,
    guessMarker: null,
    actualMarker: null,
    roundLine: null,
    resultLayers: [],
    paused: false
  };

  let dockInitialized = false;
  let dockResizeFrame = null;
  let fitRoundFallback = null;
  let roundViewFitted = false;
  let mapDragging = false;
  let walkthroughSeenInMemory = false;
  let walkthroughSteps = [];
  let walkthroughIndex = 0;
  let walkthroughPreviousFocus = null;
  let walkthroughMapForced = false;

  function shuffledCopy(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function haversineDistanceKm(first, second) {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const latitudeDelta = toRadians(second.lat - first.lat);
    const longitudeDelta = toRadians(second.lng - first.lng);
    const firstLatitude = toRadians(first.lat);
    const secondLatitude = toRadians(second.lat);
    const haversine = Math.sin(latitudeDelta / 2) ** 2
      + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, haversine)));
  }

  function pointsForDistance(distanceKm) {
    if (distanceKm <= 5) return 5000;
    if (distanceKm >= 8000) return 0;
    return Math.round(5000 * ((8000 - distanceKm) / (8000 - 5)) ** 2);
  }

  function formatDistance(distanceKm) {
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
    return `${Math.round(distanceKm).toLocaleString()} km`;
  }

  function formatTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  function updateHud() {
    elements['hud-round'].textContent = `${state.rounds.length ? state.roundIndex + 1 : 1} / 5`;
    elements['hud-score'].textContent = state.score.toLocaleString();
    elements['hud-streak'].textContent = `${state.streak}x`;
    elements['hud-mode'].textContent = state.difficulty.toUpperCase();
    elements['hud-timer'].textContent = state.rounds.length ? formatTimer(state.secondsLeft) : '--:--';
    const timerLow = state.secondsLeft <= 10 && state.rounds.length > 0 && !state.submitted;
    const timerDuration = ROUND_SECONDS[state.difficulty];
    const timerProgress = state.rounds.length ? state.secondsLeft / timerDuration : 1;
    elements['hud-timer-ring'].style.strokeDashoffset = String(87.96 * (1 - timerProgress));
    elements['hud-timer-ring'].setAttribute('stroke', timerLow ? '#ef4444' : '#f59e0b');
    elements['hud-timer'].classList.toggle('text-red-400', timerLow);
    elements['hud-timer'].classList.toggle('text-amber-500', !timerLow);
    elements['hud-timer-pill'].classList.toggle('animate-pulse', timerLow);
    elements['streak-bolt'].classList.toggle('text-amber-400', state.streak > 0);
    elements['streak-bolt'].classList.toggle('text-amber-500/35', state.streak === 0);
    elements['streak-bolt'].classList.toggle('drop-shadow-[0_0_7px_rgba(245,158,11,0.9)]', state.streak > 0);
  }

  function createMap(container, zoom = 2) {
    const map = L.map(container, { worldCopyJump: true, minZoom: 2, maxZoom: 18, zoomControl: true, attributionControl: true }).setView([20, 0], zoom);
    map.attributionControl.setPrefix(false);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    return map;
  }

  function guessPinIcon() {
    return L.divIcon({
      className: 'guess-pin-icon',
      html: '<svg width="34" height="42" viewBox="0 0 34 42" aria-hidden="true"><path d="M17 1C8.7 1 2 7.7 2 16c0 10.2 15 25 15 25s15-14.8 15-25C32 7.7 25.3 1 17 1Z" fill="#8b5cf6" stroke="#fff" stroke-width="2"/><circle cx="17" cy="16" r="5" fill="#fff"/></svg>',
      iconSize: [34, 42],
      iconAnchor: [17, 40]
    });
  }

  function actualPinIcon() {
    return L.divIcon({
      className: 'actual-pin-icon',
      html: '<svg width="38" height="44" viewBox="0 0 38 44" aria-hidden="true"><path d="M19 1C9.6 1 2 8.6 2 18c0 11.5 17 25 17 25s17-13.5 17-25C36 8.6 28.4 1 19 1Z" fill="#22c55e" stroke="#f59e0b" stroke-width="2"/><path d="m19 8 2.2 6.4 6.8.1-5.4 4 2 6.5-5.6-3.9-5.6 3.9 2-6.5-5.4-4 6.8-.1L19 8Z" fill="#fff"/></svg>',
      iconSize: [38, 44],
      iconAnchor: [19, 42]
    });
  }

  function setGuessButtonState(hasPin) {
    const button = elements['submit-guess'];
    button.disabled = !hasPin;
    elements['submit-guess-label'].textContent = hasPin ? 'GUESS' : 'PLACE YOUR PIN ON THE MAP';
    button.classList.toggle('bg-slate-700/70', !hasPin);
    button.classList.toggle('text-slate-300', !hasPin);
    button.classList.toggle('cursor-not-allowed', !hasPin);
    button.classList.toggle('bg-emerald-500', hasPin);
    button.classList.toggle('hover:bg-emerald-400', hasPin);
    button.classList.toggle('text-white', hasPin);
  }

  function invalidateWhileDockMoves() {
    if (!state.guessMap) return;
    if (dockResizeFrame !== null) cancelAnimationFrame(dockResizeFrame);
    const deadline = performance.now() + 350;
    const invalidate = (timestamp) => {
      state.guessMap.invalidateSize({ pan: false });
      if (timestamp < deadline) dockResizeFrame = requestAnimationFrame(invalidate);
      else dockResizeFrame = null;
    };
    dockResizeFrame = requestAnimationFrame(invalidate);
  }

  function setDockExpanded(expanded) {
    const dock = elements['map-dock'];
    if (dock.classList.contains('is-result')) return;
    if (expanded) dock.classList.add('is-expanded');
    else if (!dock.classList.contains('is-pinned')) dock.classList.remove('is-expanded');
    const isExpanded = dock.classList.contains('is-expanded');
    elements['map-toggle'].setAttribute('aria-expanded', String(isExpanded));
    elements['map-toggle'].setAttribute('aria-label', isExpanded ? 'Close map' : 'Open map');
    invalidateWhileDockMoves();
  }

  function initMapDock() {
    if (dockInitialized) return;
    dockInitialized = true;
    const dock = elements['map-dock'];
    const mapFrame = elements['map-frame'];
    const touchMode = () => matchMedia('(hover: none)').matches || window.innerWidth < 768;
    dock.addEventListener('mouseenter', () => {
      if (!touchMode()) setDockExpanded(true);
      state.guessMap.invalidateSize({ pan: false });
    });
    dock.addEventListener('mouseleave', () => {
      if (!touchMode() && !dock.classList.contains('is-pinned') && !mapDragging) setDockExpanded(false);
      state.guessMap.invalidateSize({ pan: false });
    });
    dock.addEventListener('focusin', () => setDockExpanded(true));
    dock.addEventListener('focusout', (event) => {
      if (!dock.contains(event.relatedTarget) && !dock.classList.contains('is-pinned') && !state.submitted) setDockExpanded(false);
    });
    mapFrame.addEventListener('transitionend', (event) => {
      if (event.propertyName !== 'width' && event.propertyName !== 'height') return;
      state.guessMap.invalidateSize({ pan: false });
      if (dock.classList.contains('is-result') && !roundViewFitted) {
        if (fitRoundFallback !== null) window.clearTimeout(fitRoundFallback);
        fitRoundView();
      }
    });
    elements['map-pin-toggle'].addEventListener('click', () => {
      if (touchMode() && dock.classList.contains('is-expanded')) {
        dock.classList.remove('is-pinned');
        elements['map-pin-toggle'].setAttribute('aria-pressed', 'false');
        setDockExpanded(false);
        return;
      }
      const pinned = !dock.classList.contains('is-pinned');
      dock.classList.toggle('is-pinned', pinned);
      elements['map-pin-toggle'].setAttribute('aria-pressed', String(pinned));
      setDockExpanded(pinned);
    });
    elements['map-toggle'].addEventListener('click', () => {
      if (dock.classList.contains('is-expanded')) {
        dock.classList.remove('is-pinned');
        elements['map-pin-toggle'].setAttribute('aria-pressed', 'false');
        setDockExpanded(false);
      } else {
        setDockExpanded(true);
      }
    });
    state.guessMap.on('dragstart', () => { mapDragging = true; });
    state.guessMap.on('dragend', () => { mapDragging = false; });
    window.addEventListener('resize', () => {
      state.guessMap.invalidateSize({ pan: false });
      invalidateWhileDockMoves();
    });
  }

  function fitRoundView() {
    if (!state.guessMap || !state.submitted || roundViewFitted) return;
    roundViewFitted = true;
    if (fitRoundFallback !== null) window.clearTimeout(fitRoundFallback);
    state.guessMap.invalidateSize();
    const location = state.rounds[state.roundIndex];
    const actualLatLng = [location.lat, location.lng];
    if (state.guess) {
      const bounds = L.latLngBounds([[state.guess.lat, state.guess.lng], actualLatLng]);
      state.guessMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 7 });
    } else {
      state.guessMap.setView(actualLatLng, 4);
    }
  }

  function exitResultMode() {
    if (fitRoundFallback !== null) window.clearTimeout(fitRoundFallback);
    fitRoundFallback = null;
    roundViewFitted = false;
    elements['map-dock'].classList.remove('is-result', 'is-expanded', 'is-pinned');
    elements['map-pin-toggle'].setAttribute('aria-pressed', 'false');
    elements['map-toggle'].classList.remove('hidden');
    elements['map-toggle'].setAttribute('aria-expanded', 'false');
    setGuessButtonState(Boolean(state.guess));
    invalidateWhileDockMoves();
  }

  function initGuessMap() {
    if (!state.guessMap) {
      state.guessMap = createMap('guess-map');
      state.guessMap.on('click', (event) => {
        if (state.submitted) return;
        state.guess = { lat: event.latlng.lat, lng: event.latlng.lng };
        if (state.guessMarker) state.guessMarker.setLatLng(event.latlng);
        else state.guessMarker = L.marker(event.latlng, { title: 'Your guess', alt: 'Your location guess', icon: guessPinIcon() }).addTo(state.guessMap);
        elements['guess-coordinates'].textContent = `${state.guess.lat.toFixed(2)} / ${state.guess.lng.toFixed(2)}`;
        elements['map-status-text'].textContent = 'Fix acquired. Reposition or stabilize.';
        setGuessButtonState(true);
        if (matchMedia('(hover: none)').matches || window.innerWidth < 768) {
          elements['map-dock'].classList.add('is-pinned', 'is-expanded');
          elements['map-pin-toggle'].setAttribute('aria-pressed', 'true');
          elements['map-toggle'].setAttribute('aria-expanded', 'true');
          invalidateWhileDockMoves();
        }
      });
      initMapDock();
    }
    requestAnimationFrame(() => state.guessMap.invalidateSize());
  }

  function setImage(location) {
    elements['image-fallback'].classList.add('hidden');
    elements['location-image'].classList.remove('hidden');
    elements['location-backdrop'].classList.remove('hidden');
    elements['location-image'].classList.toggle('hard-zoom', state.difficulty === 'hard');
    elements['location-backdrop'].onerror = () => elements['location-backdrop'].classList.add('hidden');
    elements['location-image'].onerror = () => {
      elements['location-image'].classList.add('hidden');
      elements['location-backdrop'].classList.add('hidden');
      elements['image-fallback'].classList.remove('hidden');
    };
    elements['location-backdrop'].src = location.image;
    elements['location-image'].src = location.image;
    elements['location-image'].alt = 'Mystery location photograph';
    elements['image-title'].textContent = `Anomaly ${String(state.roundIndex + 1).padStart(2, '0')} // Visual evidence`;
    elements['image-caption'].textContent = 'UNIDENTIFIED LOCATION';
    elements['image-code'].textContent = `BRANCH ID ${String(184 + state.roundIndex * 37).padStart(4, '0')} · VARIANCE ACTIVE`;
  }

  function fitLocationImage() {
    const image = elements['location-image'];
    if (!image.naturalWidth || !image.naturalHeight) return;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const viewportRatio = window.innerWidth / window.innerHeight;
    const useCover = imageRatio / viewportRatio >= 0.8 && imageRatio / viewportRatio <= 1.25;
    image.classList.toggle('object-cover', useCover);
    image.classList.toggle('object-contain', !useCover);
  }

  elements['location-image'].addEventListener('load', fitLocationImage);
  if (elements['location-image'].complete) fitLocationImage();
  let imageResizeTimeout = null;
  const scheduleImageFit = () => {
    if (imageResizeTimeout !== null) window.clearTimeout(imageResizeTimeout);
    imageResizeTimeout = window.setTimeout(fitLocationImage, 120);
  };
  window.addEventListener('resize', scheduleImageFit);
  window.addEventListener('orientationchange', scheduleImageFit);

  function stopTimer() {
    if (state.timerId !== null) window.clearInterval(state.timerId);
    state.timerId = null;
  }

  function beginRound() {
    exitResultMode();
    state.submitted = false;
    state.guess = null;
    state.paused = false;
    state.secondsLeft = ROUND_SECONDS[state.difficulty];
    if (state.guessMarker) state.guessMap.removeLayer(state.guessMarker);
    if (state.actualMarker) state.guessMap.removeLayer(state.actualMarker);
    if (state.roundLine) state.guessMap.removeLayer(state.roundLine);
    state.guessMarker = null;
    state.actualMarker = null;
    state.roundLine = null;
    state.guessMap.setView([20, 0], 2);
    state.guessMap.invalidateSize({ pan: false });
    elements['guess-coordinates'].textContent = 'NO FIX';
    elements['map-status-text'].textContent = 'Waiting for map fix…';
    setGuessButtonState(false);
    elements['round-report'].classList.add('hidden');
    elements['hint-box'].classList.add('hidden');
    elements['hint-box'].textContent = '';
    elements['hint-button'].classList.toggle('hidden', state.difficulty !== 'easy');
    elements['hint-button'].disabled = state.difficulty !== 'easy';
    setImage(state.rounds[state.roundIndex]);
    updateHud();
    stopTimer();
    state.timerId = window.setInterval(() => {
      if (state.submitted || state.paused) return;
      state.secondsLeft = Math.max(0, state.secondsLeft - 1);
      updateHud();
      if (state.secondsLeft === 0) submitGuess(true);
    }, 1000);
  }

  function startGame() {
    const selected = document.querySelector('input[name="difficulty"]:checked');
    state.difficulty = selected ? selected.value : 'easy';
    state.rounds = shuffledCopy(LOCATIONS).slice(0, ROUND_COUNT);
    state.roundIndex = 0;
    state.score = 0;
    state.streak = 0;
    state.resultLayers = [];
    elements['tour-overlay'].classList.add('hidden');
    elements['play-screen'].classList.remove('hidden');
    elements['results-screen'].classList.add('hidden');
    updateHud();
    initGuessMap();
    beginRound();
    maybeStartWalkthrough();
  }

  function revealHint() {
    if (state.difficulty !== 'easy' || state.submitted) return;
    elements['hint-box'].textContent = ` ${state.rounds[state.roundIndex].hint}`;
    elements['hint-box'].classList.remove('hidden');
    elements['hint-button'].disabled = true;
  }

  function animateResultPoints(points) {
    const duration = 900;
    const startTime = performance.now();
    elements['result-points'].textContent = '+0 PTS';
    elements['result-bar'].style.width = '0%';
    requestAnimationFrame(() => {
      elements['result-bar'].style.width = `${Math.min(1, points / 5000) * 100}%`;
    });
    const animate = (timestamp) => {
      const progress = Math.min(1, (timestamp - startTime) / duration);
      const eased = 1 - (1 - progress) ** 3;
      elements['result-points'].textContent = `+${Math.round(points * eased).toLocaleString()} PTS`;
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  function submitGuess(timedOut = false) {
    if (state.submitted) return;
    state.submitted = true;
    stopTimer();
    const location = state.rounds[state.roundIndex];
    const distanceKm = state.guess ? haversineDistanceKm(state.guess, location) : Infinity;
    let awardedPoints = 0;
    if (state.guess && !timedOut) {
      if (distanceKm <= 1000) state.streak += 1;
      else state.streak = 0;
      awardedPoints = pointsForDistance(distanceKm);
    } else {
      state.streak = 0;
    }
    state.score += awardedPoints;
    const result = {
      location,
      guess: state.guess ? { ...state.guess } : null,
      distanceKm,
      points: awardedPoints,
      timedOut
    };
    state.rounds[state.roundIndex] = { ...location, result };

    const actualLatLng = [location.lat, location.lng];
    state.actualMarker = L.marker(actualLatLng, { title: location.name, alt: `Actual location: ${location.name}`, icon: actualPinIcon() }).addTo(state.guessMap);
    state.actualMarker.bindPopup(`<strong>${location.name}</strong><br>${location.city}`);
    if (state.guess) {
      state.roundLine = L.polyline([[state.guess.lat, state.guess.lng], actualLatLng], { color: '#f59e0b', weight: 3, opacity: .9, dashArray: '8 8' }).addTo(state.guessMap);
    }
    const distanceText = Number.isFinite(distanceKm) ? formatDistance(distanceKm) : 'No fix';
    elements['image-caption'].textContent = location.name.toUpperCase();
    elements['image-code'].textContent = `${location.city.toUpperCase()} · TIMELINE ANCHORED`;
    elements['location-image'].alt = `Photograph of ${location.name}, ${location.city}`;
    elements['map-status-text'].textContent = timedOut ? 'Time dilation expired. Timeline stabilized with no fix.' : 'Timeline stabilized. Review the actual coordinates.';
    setGuessButtonState(false);
    elements['hint-button'].disabled = true;
    elements['result-sentence'].textContent = timedOut || !state.guess
      ? `Time's up. No guess placed. It was ${location.name}.`
      : `Your guess was ${distanceText} from ${location.name}.`;
    elements['next-round'].textContent = state.roundIndex === ROUND_COUNT - 1 ? 'VIEW RESULTS' : 'NEXT ROUND';
    elements['round-report'].classList.add('result-drawer');
    elements['round-report'].classList.remove('hidden');
    elements['map-dock'].classList.add('is-result', 'is-expanded');
    elements['map-toggle'].classList.add('hidden');
    roundViewFitted = false;
    if (fitRoundFallback !== null) window.clearTimeout(fitRoundFallback);
    fitRoundFallback = window.setTimeout(fitRoundView, 400);
    invalidateWhileDockMoves();
    animateResultPoints(awardedPoints);
    updateHud();
  }

  function rankForScore(score) {
    if (score >= 23000) return 'Temporal Director: exceptional branch accuracy. The TVA notices.';
    if (score >= 18000) return 'Senior Hunter: this timeline is under excellent control.';
    if (score >= 12000) return 'Field Agent: branch contained, with room to sharpen your coordinates.';
    if (score >= 6000) return 'Probationary Analyst: your recon file is improving.';
    return 'Variant in Training: the timeline survives. Study the map before your next deployment.';
  }

  function initResultsMap() {
    if (!state.resultsMap) state.resultsMap = createMap('results-map', 2);
    state.resultLayers.forEach((layer) => state.resultsMap.removeLayer(layer));
    state.resultLayers = [];
    const allCoordinates = [];
    state.rounds.forEach((round, index) => {
      const { location, guess } = round.result;
      const actualLatLng = [location.lat, location.lng];
      allCoordinates.push(actualLatLng);
      const actualMarker = L.marker(actualLatLng, { title: `${location.name} actual`, alt: `Round ${index + 1}: actual location ${location.name}`, icon: actualPinIcon() }).bindPopup(`Round ${index + 1}: ${location.name} (actual)`);
      actualMarker.addTo(state.resultsMap);
      state.resultLayers.push(actualMarker);
      if (guess) {
        const guessLatLng = [guess.lat, guess.lng];
        allCoordinates.push(guessLatLng);
        const guessMarker = L.marker(guessLatLng, { title: `Round ${index + 1} guess`, alt: `Round ${index + 1}: your location guess`, icon: guessPinIcon() }).bindPopup(`Round ${index + 1}: Your guess`);
        const line = L.polyline([guessLatLng, actualLatLng], { color: '#f59e0b', weight: 2, opacity: .75, dashArray: '6 7' });
        guessMarker.addTo(state.resultsMap);
        line.addTo(state.resultsMap);
        state.resultLayers.push(guessMarker, line);
      }
    });
    requestAnimationFrame(() => {
      state.resultsMap.invalidateSize();
      if (allCoordinates.length) state.resultsMap.fitBounds(L.latLngBounds(allCoordinates), { padding: [36, 36], maxZoom: 4 });
    });
  }

  function showResults() {
    stopTimer();
    elements['play-screen'].classList.add('hidden');
    elements['results-screen'].classList.remove('hidden');
    elements['final-score'].textContent = state.score.toLocaleString();
    elements['rank-copy'].textContent = rankForScore(state.score);
    elements['round-table-body'].innerHTML = state.rounds.map((round, index) => {
      const result = round.result;
      const distance = Number.isFinite(result.distanceKm) ? formatDistance(result.distanceKm) : 'No fix';
      return `<tr><td class="text-amber-300">${String(index + 1).padStart(2, '0')}</td><td>${escapeHtml(result.location.name)}</td><td>${distance}</td><td class="text-[#f2ead9]">${result.points.toLocaleString()}</td></tr>`;
    }).join('');
    initResultsMap();
    loadLeaderboard();
    elements['results-screen'].scrollTop = 0;
  }

  function nextRound() {
    if (state.roundIndex >= ROUND_COUNT - 1) {
      showResults();
      return;
    }
    state.roundIndex += 1;
    beginRound();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function getLocalLeaderboard() {
    try {
      const stored = JSON.parse(localStorage.getItem(LEADERBOARD_STORAGE_KEY) || 'null');
      return Array.isArray(stored) ? stored : [...MOCK_LEADERS];
    } catch {
      return [...MOCK_LEADERS];
    }
  }

  function saveLocalLeaderboard(scores) {
    try { localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(scores)); } catch {}
  }

  function renderLeaderboard(scores) {
    const ranked = [...scores].sort((left, right) => right.score - left.score).slice(0, 10);
    elements['leaderboard-list'].innerHTML = ranked.map((entry, index) => `<div class="leader-row"><span class="leader-rank">${String(index + 1).padStart(2, '0')}</span><span>${escapeHtml(entry.name)}</span><strong class="text-amber-300">${Number(entry.score).toLocaleString()}</strong></div>`).join('');
  }

  function getRemoteBucket() {
    try {
      return (window.SILICON_MAZE_KVDB_BUCKET || localStorage.getItem(REMOTE_BUCKET_KEY) || '').trim();
    } catch {
      return '';
    }
  }

  async function syncRemoteLeaderboard(scores) {
    const bucket = getRemoteBucket();
    if (!bucket) return false;
    try {
      const response = await fetch(`https://kvdb.io/${encodeURIComponent(bucket)}/leaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async function loadLeaderboard() {
    const scores = getLocalLeaderboard();
    renderLeaderboard(scores);
    const bucket = getRemoteBucket();
    elements['remote-bucket'].value = bucket;
    if (!bucket) return;
    try {
      const response = await fetch(`https://kvdb.io/${encodeURIComponent(bucket)}/leaderboard`, { headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const payload = await response.json();
      const remoteScores = Array.isArray(payload) ? payload : payload.scores;
      if (Array.isArray(remoteScores)) {
        const merged = [...remoteScores, ...scores].reduce((unique, entry) => {
          const signature = `${entry.name}:${entry.score}`;
          if (!unique.some((candidate) => `${candidate.name}:${candidate.score}` === signature)) unique.push(entry);
          return unique;
        }, []);
        saveLocalLeaderboard(merged);
        renderLeaderboard(merged);
      }
    } catch { return; }
  }

  async function submitLeaderboardScore(event) {
    event.preventDefault();
    const name = elements['agent-name'].value.trim().slice(0, 24);
    if (!name) return;
    const scores = [...getLocalLeaderboard(), { name, score: state.score, difficulty: state.difficulty, date: new Date().toISOString() }];
    saveLocalLeaderboard(scores);
    renderLeaderboard(scores);
    elements['leader-notice'].textContent = getRemoteBucket() ? 'Score saved locally. Attempting shared bucket sync…' : 'Score saved locally. Connect a shared public bucket for cross-device sync.';
    const synced = await syncRemoteLeaderboard(scores);
    elements['leader-notice'].textContent = synced
      ? 'Score saved locally and synced to the shared public leaderboard.'
      : getRemoteBucket()
        ? 'Score saved locally. Remote sync was unavailable; your score is safe on this device.'
        : 'Score saved locally. Connect a shared public bucket for cross-device sync.';
    elements['agent-name'].value = '';
  }

  async function connectRemoteBucket(event) {
    event.preventDefault();
    const bucket = elements['remote-bucket'].value.trim();
    try {
      if (bucket) localStorage.setItem(REMOTE_BUCKET_KEY, bucket);
      else localStorage.removeItem(REMOTE_BUCKET_KEY);
    } catch {
      elements['leader-notice'].textContent = 'Browser storage is unavailable. The shared bucket cannot be remembered.';
      return;
    }
    elements['leader-notice'].textContent = bucket ? 'Connecting to the shared public bucket…' : 'Remote sync disconnected. Scores remain stored locally.';
    if (bucket) await loadLeaderboard();
    if (bucket) elements['leader-notice'].textContent = 'Shared bucket saved. Future scores will sync when the public service is available.';
  }

  function playAgain() {
    stopTimer();
    if (state.resultsMap) {
      state.resultsMap.remove();
      state.resultsMap = null;
    }
    state.resultLayers = [];
    elements['results-screen'].classList.add('hidden');
    elements['play-screen'].classList.remove('hidden');
    elements['tour-overlay'].classList.remove('hidden');
    const preferred = document.querySelector(`input[name="difficulty"][value="${state.difficulty}"]`);
    if (preferred) preferred.checked = true;
    updateHud();
  }

  function isElementVisible(element) {
    if (!element || element.classList.contains('hidden')) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  }

  function walkthroughHasBeenSeen() {
    if (walkthroughSeenInMemory) return true;
    try {
      walkthroughSeenInMemory = localStorage.getItem('multiverse-recon-tour-seen-v1') === 'true';
    } catch {
      return walkthroughSeenInMemory;
    }
    return walkthroughSeenInMemory;
  }

  function markWalkthroughSeen() {
    walkthroughSeenInMemory = true;
    try { localStorage.setItem('multiverse-recon-tour-seen-v1', 'true'); } catch {}
  }

  function maybeStartWalkthrough() {
    if (!walkthroughHasBeenSeen()) startWalkthrough();
  }

  function buildWalkthroughSteps() {
    const steps = [
      { title: 'Find the anomaly', text: 'Study the photo. Where in the world is this?', target: null },
      { title: 'Beat the clock', text: 'Beat the clock. It turns red in the last 10 seconds.', target: elements['hud-timer-pill'] },
      { title: 'Track your run', text: 'Track your round, score, and nexus streak.', target: elements['hud-stats-card'] }
    ];
    if (isElementVisible(elements['hint-button'])) {
      steps.push({ title: 'Need a clue?', text: 'Stuck? Tap the bulb for one clue.', target: elements['hint-button'] });
    }
    const mapTarget = [elements['map-toggle'], elements['map-frame']].find(isElementVisible);
    if (mapTarget) {
      steps.push({
        title: 'Drop your pin',
        text: mapTarget === elements['map-toggle']
          ? 'Tap the map button, then tap to drop your pin.'
          : 'Hover to expand the map, then click to drop your pin.',
        target: mapTarget,
        map: true
      });
    }
    if (isElementVisible(elements['submit-guess'])) {
      steps.push({ title: 'Make your guess', text: 'Lock it in. Closer guesses earn up to 5,000 points. Press Space as a shortcut.', target: elements['submit-guess'] });
    }
    return steps;
  }

  function leaveWalkthroughStep() {
    if (!walkthroughMapForced) return;
    walkthroughMapForced = false;
    if (!elements['map-dock'].classList.contains('is-pinned')) elements['map-dock'].classList.remove('is-expanded');
    if (state.guessMap) {
      state.guessMap.invalidateSize({ pan: false });
      invalidateWhileDockMoves();
    }
  }

  function positionWalkthrough() {
    if (elements['walkthrough-root'].classList.contains('hidden')) return;
    const step = walkthroughSteps[walkthroughIndex];
    const card = elements['walkthrough-card'];
    const spotlight = elements['walkthrough-spotlight'];
    const target = step.target;
    card.style.transform = 'none';
    if (!target) {
      elements['walkthrough-root'].classList.add('is-centered');
      spotlight.classList.add('hidden');
      card.style.left = '50%';
      card.style.top = '50%';
      card.style.transform = 'translate(-50%, -50%)';
      return;
    }
    elements['walkthrough-root'].classList.remove('is-centered');
    const rect = target.getBoundingClientRect();
    const padding = 8;
    spotlight.classList.remove('hidden');
    spotlight.style.left = `${rect.left - padding}px`;
    spotlight.style.top = `${rect.top - padding}px`;
    spotlight.style.width = `${rect.width + padding * 2}px`;
    spotlight.style.height = `${rect.height + padding * 2}px`;
    const cardWidth = card.offsetWidth;
    const cardHeight = card.offsetHeight;
    const margin = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const horizontalPosition = Math.max(margin, Math.min(viewportWidth - cardWidth - margin, rect.left + rect.width / 2 - cardWidth / 2));
    const belowTop = rect.bottom + padding * 2;
    const aboveTop = rect.top - cardHeight - padding * 2;
    let verticalPosition;
    if (belowTop + cardHeight <= viewportHeight - margin) verticalPosition = belowTop;
    else if (aboveTop >= margin) verticalPosition = aboveTop;
    else verticalPosition = Math.max(margin, (viewportHeight - cardHeight) / 2);
    card.style.left = `${horizontalPosition}px`;
    card.style.top = `${verticalPosition}px`;
  }

  function renderWalkthroughStep() {
    leaveWalkthroughStep();
    const step = walkthroughSteps[walkthroughIndex];
    elements['walkthrough-count'].textContent = `${walkthroughIndex + 1} of ${walkthroughSteps.length}`;
    elements['walkthrough-title'].textContent = step.title;
    elements['walkthrough-text'].textContent = step.text;
    elements['walkthrough-back'].classList.toggle('hidden', walkthroughIndex === 0);
    elements['walkthrough-next'].textContent = walkthroughIndex === walkthroughSteps.length - 1 ? 'Start recon' : 'Next';
    elements['walkthrough-dots'].innerHTML = walkthroughSteps.map((_, index) => `<span class="walkthrough-dot${index === walkthroughIndex ? ' is-active' : ''}"></span>`).join('');
    if (step.map) {
      walkthroughMapForced = true;
      elements['map-dock'].classList.add('is-expanded');
      state.guessMap.invalidateSize({ pan: false });
      invalidateWhileDockMoves();
    }
    requestAnimationFrame(positionWalkthrough);
    if (step.map) window.setTimeout(positionWalkthrough, 340);
    elements['walkthrough-next'].focus();
  }

  function closeWalkthrough() {
    if (elements['walkthrough-root'].classList.contains('hidden')) return;
    leaveWalkthroughStep();
    elements['walkthrough-root'].classList.add('hidden');
    elements['walkthrough-root'].setAttribute('aria-hidden', 'true');
    state.paused = false;
    markWalkthroughSeen();
    if (walkthroughPreviousFocus && document.contains(walkthroughPreviousFocus) && isElementVisible(walkthroughPreviousFocus)) walkthroughPreviousFocus.focus();
    else elements['tour-button'].focus();
    walkthroughPreviousFocus = null;
  }

  function startWalkthrough() {
    if (state.submitted || !elements['results-screen'].classList.contains('hidden') || !elements['walkthrough-root'].classList.contains('hidden')) return;
    walkthroughSteps = buildWalkthroughSteps();
    if (!walkthroughSteps.length) return;
    walkthroughIndex = 0;
    walkthroughPreviousFocus = document.activeElement;
    state.paused = true;
    elements['walkthrough-root'].classList.remove('hidden');
    elements['walkthrough-root'].setAttribute('aria-hidden', 'false');
    renderWalkthroughStep();
  }

  function advanceWalkthrough(direction) {
    const nextIndex = walkthroughIndex + direction;
    if (nextIndex < 0) return;
    if (nextIndex >= walkthroughSteps.length) {
      closeWalkthrough();
      return;
    }
    walkthroughIndex = nextIndex;
    renderWalkthroughStep();
  }

  function trapWalkthroughFocus(event) {
    const focusable = [elements['walkthrough-skip'], elements['walkthrough-back'], elements['walkthrough-next']]
      .filter((element) => !element.classList.contains('hidden') && !element.disabled);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  elements['start-game'].addEventListener('click', startGame);
  elements['home-button'].addEventListener('click', playAgain);
  elements['results-home-button'].addEventListener('click', playAgain);
  elements['hint-button'].addEventListener('click', revealHint);
  elements['submit-guess'].addEventListener('click', () => submitGuess(false));
  elements['next-round'].addEventListener('click', nextRound);
  elements['tour-button'].addEventListener('click', startWalkthrough);
  elements['walkthrough-next'].addEventListener('click', () => advanceWalkthrough(1));
  elements['walkthrough-back'].addEventListener('click', () => advanceWalkthrough(-1));
  elements['walkthrough-skip'].addEventListener('click', closeWalkthrough);
  elements['map-frame'].addEventListener('transitionend', () => {
    if (walkthroughMapForced) requestAnimationFrame(positionWalkthrough);
  });
  window.addEventListener('resize', () => requestAnimationFrame(positionWalkthrough));
  window.addEventListener('orientationchange', () => requestAnimationFrame(positionWalkthrough));
  elements['leader-form'].addEventListener('submit', submitLeaderboardScore);
  elements['remote-form'].addEventListener('submit', connectRemoteBucket);
  elements['play-again'].addEventListener('click', playAgain);
  document.addEventListener('keydown', (event) => {
    if (!elements['walkthrough-root'].classList.contains('hidden')) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeWalkthrough();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        advanceWalkthrough(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        advanceWalkthrough(-1);
      } else if (event.key === 'Tab') {
        trapWalkthroughFocus(event);
      }
      return;
    }
    if (event.code !== 'Space' || event.target.closest('input, textarea')) return;
    if (!elements['walkthrough-root'].classList.contains('hidden') || !elements['tour-overlay'].classList.contains('hidden') || !elements['results-screen'].classList.contains('hidden')) return;
    if (state.submitted) {
      event.preventDefault();
      nextRound();
    } else if (state.guess) {
      event.preventDefault();
      submitGuess(false);
    }
  });

  updateHud();
})();