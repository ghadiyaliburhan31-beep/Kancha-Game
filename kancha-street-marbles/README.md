# 🎯 KANCHA - The Indian Street Marble Championship

An authentic, physics-driven web and mobile game celebrating traditional Indian street marbles (*Goli / Kancha / Banta*). Built with pure HTML5 Canvas, modular vanilla JavaScript, and modern Web Audio.

---

## 📁 Project Architecture & File Guide

```
kancha-street-marbles/
├── index.html        # Main HTML5 game UI, HUD, Modals, Free Fire / PUBG Profile
├── styles.css        # Responsive design, theme variables, esports styling, animations
├── game.js           # Core Game Controller, game loop, aim controls, UI handlers
├── levels.js         # All 50 progressive campaign levels, ProgressManager & storage
├── physics.js        # 2D continuous collision, marble momentum transfer, bank shots
├── marble.js         # Striker & marble rendering, STRIKER_ROSTER with physics stats
├── audio.js          # Calming light-theme soundscape, phone-speaker protection, lifecycle pause
├── server.js         # Zero-dependency local Node.js HTTP server
├── package.json      # Project metadata & npm start scripts
└── README.md         # Project documentation & quickstart guide
```

### Detailed File Responsibilities:
* **`index.html`**:
  * Clean semantic layout without external UI libraries.
  * Complete HUD with dynamic shots counter, coin balance, and hint bulb counters.
  * Free Fire / PUBG Mobile style esports profile card with 3 interactive tabs: *Career Stats*, *Characters*, and *Arsenal*.
  * 50-Level Mohalla Map modal, Carrom-style two-tier Striker Store, and Settings modal.
* **`styles.css`**:
  * Mobile-first responsive layout (optimized for all screen ratios: phones, tablets, desktops).
  * Carbon-fiber textures, glowing tier badge ribbons, and animated buttons.
  * Native touch-action handling to prevent accidental scrolling or pinch-zoom during play.
* **`game.js`**:
  * Orchestrates game states (`AIMING`, `MOVING`, `RESOLVING`, `ROUND_OVER`).
  * Smooth touch and drag pull-back rubber-band aiming mechanism.
  * Smart Bulb Hint system with line-of-sight raycasting and cushion bank-shot calculations.
  * Multi-mode support: **Solo Campaign (50 Levels)**, **Vs AI Bot**, and **2-Player Pass & Play**.
* **`levels.js`**:
  * 50 hand-crafted, mathematically verified solvable levels with progressive obstacles:
    * Level 1–10: Gully Street Foundations
    * Level 11–25: Brick Obstacles & Mud Puddles
    * Level 26–40: Angled Cushions & Bank Shots
    * Level 41–50: Master Chambers & The Level 50 Boss Ring
  * `ProgressManager`: Automatic guest UID generation, persistent level progression, and star ratings via `localStorage`.
* **`physics.js`**:
  * Circle-to-circle elastic collision resolution with mass ratios and restitution.
  * Cushion ricochet reflection and box obstacle sliding vectors.
  * Gucchu hole gravitational capture dynamics and water puddle drag friction.
* **`marble.js`**:
  * GPU canvas procedural marble rendering (glass reflections, inner swirls, steel metallic shine).
  * `STRIKER_ROSTER`: Detailed catalogue of unlockable strikers with real gameplay attributes (*Mass/Vazan*, *Grip/Pakad*, *Bounce/Lachak*).
* **`audio.js`**:
  * Calming, relaxing light-theme soundscape composed in the peaceful **Raag Bhupali / Yaman** pentatonic scale.
  * **Phone-Speaker Protection**: 160Hz high-pass filter cuts sub-bass over-excursion and 3400Hz low-pass filter eliminates piercing treble.
  * **Background Lifecycle Safety**: Immediately suspends Web Audio output when switching apps or minimizing tabs.
* **`server.js`**:
  * Lightweight static web server built using native Node.js `http` and `fs` modules (no `node_modules` required).

---

## 🚀 How to Run the Game

### Method 1: Instant Local Server (Recommended)
Make sure you have Node.js installed, open a terminal in this folder, and run:
```bash
npm start
# OR:
node server.js
```
Then open your browser at:
👉 **http://localhost:8080/**

### Method 2: Direct Browser Launch
You can also directly double-click `index.html` to open it in Chrome, Edge, Safari, or Firefox!

### Method 3: VS Code Live Server
If you have the **Live Server** extension in VS Code, right-click `index.html` and click **"Open with Live Server"**.

---

## 🎮 Game Controls
* **Aim & Power**: Tap/click on your Striker marble, drag backwards to set direction and power, then release to shoot.
* **Hint Bulb (💡)**: Tap the bulb icon in the HUD to reveal the exact trajectory ray for a direct hit or cushion bank shot.
* **Map (🗺️)**: Tap the level badge in the HUD to jump to any unlocked level.
* **Store (🛒)**: Unlock heavier and grippier striker marbles with earned coins.
* **Profile (👤)**: Tap your avatar card on the landing screen to customize your nickname, choose from 8 street characters, and check your career stats.

---

## 📱 Mobile App (Android APK)
This game has also been bundled as a native Android application using an Android WebView wrapper with edge-to-edge fullscreen immersive mode and notification retention reminders.
