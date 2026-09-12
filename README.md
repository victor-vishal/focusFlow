<p align="center">
  <img src="assets/favicon.svg" width="80" height="80" alt="FocusFlow Logo">
</p>

<h1 align="center">FocusFlow</h1>

<p align="center">
  <strong>A premium Pomodoro timer & deep work studio — ambient sounds, task management, session tracking, and motivational quotes — all in one beautiful, installable PWA.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PWA-Installable-blue?style=for-the-badge&logo=pwa" alt="PWA Badge">
  <img src="https://img.shields.io/badge/Vanilla_JS-ES_Modules-yellow?style=for-the-badge&logo=javascript" alt="JavaScript Badge">
  <img src="https://img.shields.io/badge/Tailwind_CSS-CDN-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS Badge">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License Badge">
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works — Core Mechanics](#how-it-works--core-mechanics)
  - [Pomodoro Timer Engine](#1-pomodoro-timer-engine)
  - [Ambient Sound Mixer (Web Audio API)](#2-ambient-sound-mixer-web-audio-api)
  - [Task Management System](#3-task-management-system)
  - [Session Tracker & Streak Calculator](#4-session-tracker--streak-calculator)
  - [Motivational Quotes](#5-motivational-quotes)
  - [Settings & Configuration](#6-settings--configuration)
  - [Theme System](#7-theme-system)
  - [Module Communication (Event Bus)](#8-module-communication-event-bus)
  - [Progressive Web App (Offline Support)](#9-progressive-web-app-offline-support)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**FocusFlow** is a feature-rich Pomodoro-technique productivity app built as a fully client-side Progressive Web App (PWA). It combines a precision timer, synthesized ambient soundscapes, task tracking, session analytics, and motivational quotes into a single glassmorphism-styled interface — all without a backend, login, or external dependencies beyond fonts and Tailwind CSS from CDN.

Everything persists in `localStorage`, runs offline via a Service Worker, and can be installed to your home screen on any device.

---

## Features

| Category | Feature | Details |
|---|---|---|
| ⏱️ **Timer** | Pomodoro / Short Break / Long Break modes | Configurable durations, auto-switch between work & break modes |
| ⏱️ **Timer** | Circular SVG progress ring | Animated gradient ring with glow filter shows remaining time visually |
| ⏱️ **Timer** | Drift-proof timing | Uses `Date.now()` wall-clock comparison instead of trusting `setInterval` alone |
| ⏱️ **Timer** | Desktop notifications | Alerts you when a session ends (with permission) |
| 🎵 **Sounds** | 4-channel ambient mixer | Rain, Wind, Campfire, White Noise — all procedurally generated |
| 🎵 **Sounds** | Web Audio API synthesis | Zero audio file downloads; sounds are created from noise buffers + biquad filters |
| 🎵 **Sounds** | Per-channel volume control | Exponential volume curve for natural loudness feel |
| ✅ **Tasks** | Add, complete, delete tasks | Keyboard (Enter) and button input |
| ✅ **Tasks** | Active task tracking | Click a task to set it as "current"; shown inside the timer ring |
| 📊 **Tracker** | Daily session counter | Tracks completed work sessions per day |
| 📊 **Tracker** | Streak calculator | Consecutive-day streak, counted backwards from today |
| 📊 **Tracker** | 7-day bar chart | CSS-rendered activity distribution chart |
| 💬 **Quotes** | Motivational quote banner | Randomly displayed after each session completion |
| ⚙️ **Settings** | Configurable durations | Work, short break, long break — persisted to localStorage |
| 🎨 **Theme** | Dark / Light mode toggle | Instant theme switch with system preference fallback |
| 📱 **PWA** | Installable & offline | Service Worker with network-first caching strategy |

---

## How It Works — Core Mechanics

FocusFlow is built as a **modular ES Module architecture** where each feature is an isolated, self-contained class. All modules are instantiated in [`app.js`](js/app.js) and communicate through **custom DOM events** dispatched on the `document` object — there is no shared mutable state between modules.

### 1. Pomodoro Timer Engine

**File:** [`js/timer.js`](js/timer.js)

The timer is the central module. It implements the classic Pomodoro Technique:

```
[25 min WORK] → [5 min SHORT BREAK] → [25 min WORK] → [5 min SHORT BREAK]
       → [25 min WORK] → [5 min SHORT BREAK] → [25 min WORK] → [15 min LONG BREAK]
                                                                  ↑ every 4th session
```

**Timing Accuracy:**

Instead of naively decrementing a counter each `setInterval` tick (which drifts due to JavaScript's single-threaded event loop), FocusFlow uses **wall-clock comparison**:

```javascript
// On start: record when the timer SHOULD end
this.expectedEndTime = Date.now() + (this.timeLeft * 1000);

// Each tick: calculate remaining from the real clock
this.timeLeft = Math.round((this.expectedEndTime - now) / 1000);
```

This ensures the timer stays accurate even if the browser tab is throttled or the device sleeps.

**SVG Progress Ring:**

The circular progress indicator uses an SVG `<circle>` element with `stroke-dasharray` and `stroke-dashoffset`. The offset is calculated as:

```
offset = circumference - (progress × circumference)
```

Where `progress = timeLeft / totalDuration`. As the timer counts down, the stroke progressively retracts around the ring, creating a smooth countdown animation. A gradient fill (`#38bdf8 → #6366f1`) and a glow filter (`feDropShadow`) give it a neon aesthetic.

**Auto Mode Switching:**

When a session completes, the timer automatically transitions:
- After a **work** session → switch to **short break** (or **long break** every 4th work session)
- After any **break** → switch back to **work**

A `timer:complete` custom event is dispatched to notify other modules (tracker, quotes).

---

### 2. Ambient Sound Mixer (Web Audio API)

**File:** [`js/sounds.js`](js/sounds.js)

All ambient sounds are **procedurally synthesized** using the Web Audio API — no audio files are downloaded or bundled.

**Sound Generation Pipeline:**

```
Noise Buffer (white / brown)
        ↓
  BufferSource (looped)
        ↓
  BiquadFilter (bandpass / lowpass / highpass)
        ↓
    GainNode (volume control)
        ↓
  AudioContext.destination (speakers)
```

Each of the 4 channels uses a different combination:

| Channel | Noise Type | Filter | Filter Freq | Character |
|---|---|---|---|---|
| 🌧️ Rain & Thunder | White noise | Bandpass | 800 Hz, Q=1.5 | Hissing, rain-like patter |
| 🌬️ Breeze & Wind | Brown noise | Lowpass | 300 Hz | Deep, rumbling wind |
| 🔥 Campfire Ember | Brown noise | Highpass | 1000 Hz | Crackling, warm hiss |
| ⚡ White Noise | White noise | Lowpass | 5000 Hz | Classic, gentle static |

**Brown Noise Algorithm:**

Brown (Brownian) noise is generated by integrating white noise samples over time:

```javascript
data[i] = (lastOut + (0.02 * white)) / 1.02;
lastOut = data[i];
data[i] *= 3.5; // Gain compensation
```

This creates a softer, deeper sound compared to pure white noise.

**Volume Curve:**

Raw linear volume sliders sound unnatural to human ears. FocusFlow applies an **exponential curve** for perceptually even volume control:

```javascript
const curved = Math.pow(normalized, 1.5);
```

Each channel also has a safety-capped maximum volume to prevent speaker damage:
- Rain: 80%, Wind: 60%, Fire: 70%, White Noise: 20%

**Lazy Initialization:**

The `AudioContext` is only created on the first user interaction (toggle), complying with browser autoplay policies that require a user gesture before audio can play.

---

### 3. Task Management System

**File:** [`js/tasks.js`](js/tasks.js)

Tasks are stored as an array of objects in `localStorage` under the key `focusflow-tasks`:

```javascript
{ id: "1694523456789", text: "Write documentation", completed: false }
```

**Active Task Concept:**

One task can be set as "active" by clicking on it. The active task:
- Gets a highlighted border and a "Current" badge in the task list
- Is displayed inside the timer ring as a pulsing indicator, so you always know what you're working on
- Automatically deactivates when marked as complete

When the first task is added to an empty list, it is **auto-promoted** to active status.

**Persistence:** All task state (list + active task ID) is persisted to `localStorage` immediately on every mutation.

---

### 4. Session Tracker & Streak Calculator

**File:** [`js/tracker.js`](js/tracker.js)

The tracker listens for `timer:complete` events and only counts **work sessions** (breaks are ignored).

**Data Structure:**

Session history is stored as a date-keyed object in `localStorage`:

```json
{
  "2026-09-10": 4,
  "2026-09-11": 6,
  "2026-09-12": 2
}
```

**Streak Algorithm:**

The streak counts consecutive days (backwards from today) that have at least one completed session:

```
Today (2 sessions) → Yesterday (6 sessions) → Day before (4 sessions) → Day before (0) → STOP
Streak = 3 days
```

If today has zero sessions, it still checks yesterday before breaking — so your streak doesn't reset until you've truly missed a full day.

**7-Day Bar Chart:**

The last 7 days of activity are rendered as a CSS bar chart. Each bar's height is proportional to:

```
heightPercent = max(sessionCount / chartMax × 100, 5%)
```

The minimum 5% ensures even zero-session days have a visible bar. Today's bar gets a gradient fill and glow effect for visual emphasis.

---

### 5. Motivational Quotes

**File:** [`js/quotes.js`](js/quotes.js)

After every timer completion, a random motivational quote is displayed in a banner. The system ensures **no consecutive repeats** by tracking the last shown index:

```javascript
do {
    index = Math.floor(Math.random() * this.quotes.length);
} while (index === this.lastQuoteIndex && this.quotes.length > 1);
```

The banner auto-hides after 10 seconds. The quote pool includes 10 curated quotes from productivity and creative thought leaders.

---

### 6. Settings & Configuration

**File:** [`js/settings.js`](js/settings.js)

Settings are managed through a modal dialog that lets users configure:
- **Work session duration** (1–90 minutes, default: 25)
- **Short break duration** (1–30 minutes, default: 5)
- **Long break duration** (1–60 minutes, default: 15)

**Communication Flow:**

```
User saves settings → SettingsManager stores to localStorage
                     → dispatches 'settings:updated' CustomEvent
                     → Timer receives event → updates DURATIONS map
                     → if timer is paused, resets to new duration
```

On app load, `SettingsManager` dispatches the saved settings via a `setTimeout(…, 0)` to ensure all other modules have finished constructing and attached their event listeners first.

---

### 7. Theme System

**File:** [`js/theme.js`](js/theme.js)

FocusFlow supports **Dark** and **Light** modes with three layers of detection:

1. **localStorage** (`color-scheme` key) — highest priority, stores user's explicit choice
2. **System preference** — `prefers-color-scheme: dark` media query as fallback
3. **Default** — dark mode if no preference detected

**Flash Prevention:**

Theme is applied in a blocking `<script>` in the `<head>` (before render) to prevent a flash of wrong-theme content:

```javascript
const colorScheme = localStorage.getItem("color-scheme");
if (colorScheme === 'light') {
    document.documentElement.classList.remove('dark');
}
```

The theme toggle button swaps between sun/moon icons and live-listens for system preference changes.

---

### 8. Module Communication (Event Bus)

Modules are fully decoupled and communicate through **custom DOM events** on the `document` object:

```
┌──────────┐   timer:complete    ┌──────────────────┐
│  Timer   │ ──────────────────→ │ SessionTracker   │
│          │                     │ (counts sessions)│
│          │   timer:complete    ├──────────────────┤
│          │ ──────────────────→ │ QuoteManager     │
│          │                     │ (shows quote)    │
└──────────┘                     └──────────────────┘
      ↑
      │ settings:updated
      │
┌─────────────────┐
│ SettingsManager  │
│ (updates durations)
└─────────────────┘
```

This pattern keeps each module independently testable and avoids tight coupling.

---

### 9. Progressive Web App (Offline Support)

**Files:** [`manifest.json`](manifest.json) · [`service-worker.js`](service-worker.js)

FocusFlow is a fully installable PWA:

- **Manifest** declares the app name, icons, theme color, and `standalone` display mode
- **Service Worker** uses a **network-first** caching strategy:
  1. Try fetching from the network
  2. If successful, cache the fresh response and serve it
  3. If the network fails (offline), serve from cache

On install, all core assets are pre-cached. Old caches are cleaned up on activation. The app works completely offline after the first visit.

---

## Project Structure

```
focusflow/
├── index.html              # Main SPA entry point (dashboard layout)
├── manifest.json           # PWA manifest (name, icons, display mode)
├── service-worker.js       # Offline caching with network-first strategy
│
├── assets/
│   └── favicon.svg         # Clock icon used as favicon and PWA icon
│
├── css/
│   └── style.css           # Design tokens, glassmorphism, range sliders,
│                           # progress ring animation, modal overlay
│
└── js/
    ├── app.js              # Entry point — initializes all modules
    ├── timer.js            # Pomodoro timer engine & SVG ring
    ├── sounds.js           # Web Audio API ambient sound synthesizer
    ├── tasks.js            # Task CRUD & active task tracking
    ├── tracker.js          # Session history, streak, 7-day chart
    ├── quotes.js           # Motivational quote display system
    ├── settings.js         # Timer duration settings modal
    └── theme.js            # Dark/Light theme toggle
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | HTML5, Semantic elements |
| **Styling** | Tailwind CSS (CDN), Custom CSS (glassmorphism, animations) |
| **Logic** | Vanilla JavaScript (ES Modules) |
| **Typography** | Plus Jakarta Sans, JetBrains Mono (Google Fonts) |
| **Audio** | Web Audio API (procedural synthesis, no audio files) |
| **Storage** | localStorage (tasks, settings, history, theme) |
| **PWA** | Service Worker, Web App Manifest |
| **Notifications** | Web Notifications API |

---

## Getting Started

### Prerequisites

A modern web browser (Chrome, Firefox, Edge, Safari) and a local HTTP server (ES modules require serving over HTTP, not `file://`).

### Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/focusflow.git
   cd focusflow
   ```

2. **Serve with any static server:**

   Using Python:
   ```bash
   python -m http.server 8080
   ```

   Using Node.js:
   ```bash
   npx serve .
   ```

   Using VS Code: Install the "Live Server" extension and click **Go Live**.

3. **Open in browser:**
   ```
   http://localhost:8080
   ```

4. **Install as PWA** *(optional)*: Click the install icon in the browser address bar to add FocusFlow to your desktop or home screen.

---

## Usage Guide

| Action | How |
|---|---|
| **Start a Pomodoro** | Click the **Start** button or switch modes with the Pomodoro / Short Break / Long Break tabs |
| **Pause / Resume** | Click the **Pause** button (same button toggles) |
| **Reset timer** | Click the **Reset** button |
| **Add a task** | Type in the task input and press **Enter** or click **Add** |
| **Set active task** | Click on any uncompleted task in the list |
| **Complete a task** | Click the circular checkbox next to the task |
| **Delete a task** | Hover over a task and click the trash icon |
| **Enable ambient sound** | Toggle any sound channel on and adjust the volume slider |
| **Change durations** | Click the ⚙️ gear icon, adjust values, and save |
| **Toggle theme** | Click the 🌙/☀️ icon in the header |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with focus. ⏱️
</p>
