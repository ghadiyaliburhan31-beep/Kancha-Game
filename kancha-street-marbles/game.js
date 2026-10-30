// game.js - Clean Minimalist Kancha: 'Jahan Ruki Wahin Se' Physics, True Circle Knockout, Rainy Street Canvas & Store

class KanchaGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.arenaWidth = 480;
    this.arenaHeight = 800;

    this.physics = new PhysicsEngine();

    // Mode: 'SOLO', 'BOT', 'FRIEND'
    this.currentMode = 'SOLO';
    this.currentLevelIndex = (window.progress && window.progress.getLastPlayedLevel)
      ? window.progress.getLastPlayedLevel()
      : 1;
    this.levelData = null;

    // Multiplayer / Bot State
    this.activePlayer = 1;
    this.scores = { p1: 0, p2: 0 };
    this.targetWinScore = 4;
    this.isBotTurn = false;

    // Arena State
    this.marbles = [];
    this.striker = null;
    this.obstacles = [];
    this.holes = [];
    this.puddles = [];
    this.ring = null;
    this.leaves = []; // Fallen neem leaves

    this.shotsLeft = 0;
    this.shotsTaken = 0;
    this.state = 'AIMING'; // 'AIMING', 'ROLLING', 'BOT_THINKING', 'LEVEL_OVER'

    // Drag & Aim controls
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragCurrent = { x: 0, y: 0 };
    this.maxDragDist = 120;
    this.powerScale = 0.22;

    // 💡 Bulb Hint Guide
    this.activeGoldenHint = null;

    // Level 1 Animated Tutorial Onboarding State
    this.showLevel1Tutorial = false;

    // Store Tab
    this.activeStoreTab = 'galli';

    // Offscreen Ground Canvas Cache for Butter-Smooth 60 FPS
    this.groundCanvas = null;

    // Native Android APK / WebView Detection
    if (window.navigator.userAgent.includes('wv') || window.location.protocol === 'file:') {
      document.body.classList.add('native-app');
    }

    // Camera Transform & Dynamic Viewport (100% responsive on all devices)
    this.cameraScale = 1;
    this.cameraOffsetX = 0;
    this.cameraOffsetY = 0;
    this.dpr = 1;
    this.initViewport();

    this.initScreens();
    this.initHUD();
    this.initInput();
    this.initHeroMarble();
    this.initGuestProfileSystem();

    // Preload user's last played level immediately
    this.loadLevel(this.currentLevelIndex);

    // Check Daily Login Gift
    if (window.progress && window.progress.checkDailyReward && window.progress.checkDailyReward()) {
      setTimeout(() => {
        const giftModal = document.getElementById('modal-daily-gift');
        if (giftModal) giftModal.classList.add('active');
      }, 500);
    }

    // Direct navigation support (e.g. ?screen=game or ?mode=solo/bot/friend)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('screen') === 'game' || urlParams.get('mode') === 'solo') {
        this.startSoloMode();
      } else if (urlParams.get('screen') === 'mode-select') {
        this.showScreen('screen-mode-select');
      } else if (urlParams.get('mode') === 'bot') {
        this.startBotMode();
      } else if (urlParams.get('mode') === 'friend') {
        this.startFriendMode();
      }
      if (urlParams.get('level')) {
        const lvl = parseInt(urlParams.get('level'), 10);
        if (!isNaN(lvl)) this.loadLevel(lvl);
      }
      if (urlParams.get('hint') === 'bulb') {
        if (window.progress) window.progress.data.bulbs = 5;
        setTimeout(() => this.activateBulbHint(), 150);
      }
      if (urlParams.get('tutorial') === '1' || urlParams.get('tutorial') === 'true') {
        localStorage.removeItem('kancha_tutorial_completed');
        this.showLevel1Tutorial = true;
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.style.display = 'block';
      }
      if (urlParams.get('modal') === 'map') {
        setTimeout(() => this.openMapModal(), 80);
      } else if (urlParams.get('modal') === 'store') {
        setTimeout(() => this.openStoreModal(), 80);
      } else if (urlParams.get('modal') === 'guide') {
        setTimeout(() => this.openGuideModal(), 80);
      }
    } catch (e) {}

    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  // --- RESPONSIVE FULLSCREEN VIEWPORT ENGINE ---
  initViewport() {
    this.handleResize = () => {
      // Smart DPR: Cap at 1.5 on mobile/tablets to prevent excessive fillrate while remaining super crisp
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 600;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      const app = document.getElementById('game-app');
      const container = document.getElementById('canvas-container');

      // Accurately determine viewport dimensions from visible container or window
      let w = window.innerWidth;
      let h = window.innerHeight;

      if (container && container.clientWidth > 0 && container.clientHeight > 0) {
        w = container.clientWidth;
        h = container.clientHeight;
      } else if (app && app.clientWidth > 0 && app.clientHeight > 0) {
        w = app.clientWidth;
        h = app.clientHeight;
      }

      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
      this.dpr = dpr;

      // Fit virtual arena (480x800) into the canvas buffer with uniform aspect ratio
      this.cameraScale = Math.min(this.canvas.width / this.arenaWidth, this.canvas.height / this.arenaHeight);
      this.cameraOffsetX = (this.canvas.width - this.arenaWidth * this.cameraScale) / 2;
      this.cameraOffsetY = (this.canvas.height - this.arenaHeight * this.cameraScale) / 2;

      // Pre-render ground background to offscreen canvas for 60fps GPU blitting
      this.cacheGroundCanvas();
    };

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', () => setTimeout(this.handleResize, 150));
    this.handleResize();
  }

  // Pre-render earthy sand ground into offscreen canvas for single-pass GPU blitting
  cacheGroundCanvas() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w <= 0 || h <= 0) return;

    if (!this.groundCanvas) {
      this.groundCanvas = document.createElement('canvas');
    }
    this.groundCanvas.width = w;
    this.groundCanvas.height = h;
    const gctx = this.groundCanvas.getContext('2d');

    const grad = gctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, '#AD8156'); // Warm dry sand
    grad.addColorStop(0.65, '#8D633C'); // Earthy soil
    grad.addColorStop(1, '#664324'); // Darker damp ground
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, w, h);

    // Subtle natural sand speckles
    gctx.fillStyle = 'rgba(40, 24, 10, 0.07)';
    for (let i = 0; i < 70; i++) {
      const rx = (i * 97) % w;
      const ry = (i * 131) % h;
      gctx.fillRect(rx, ry, 3, 2);
    }
  }

  // --- SCREEN ROUTING ---
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
    if (this.handleResize) this.handleResize();
    setTimeout(() => {
      if (this.handleResize) this.handleResize();
    }, 40);
  }

  initScreens() {
    // Level 1 Interactive Tutorial Got-It / Dismiss Handler
    const btnSkipTutorial = document.getElementById('btn-skip-tutorial');
    if (btnSkipTutorial) {
      btnSkipTutorial.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.audio) window.audio.playClick();
        this.dismissTutorial();
      });
    }

    // Fullscreen Toggle Button (F11 / Mobile Fullscreen)
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (window.audio) window.audio.playClick();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Unlock Audio on any touch or click anywhere on Landing Screen
    document.getElementById('screen-landing').addEventListener('click', () => {
      window.audio.ensureContext();
      if (!window.audio.isPlayingMusic) {
        window.audio.startBackgroundMusic();
      }
    }, { once: false });

    // Landing Screen PLAY Button -> Starts music & directly resumes saved last level!
    document.getElementById('btn-landing-play').addEventListener('click', (e) => {
      e.stopPropagation();
      window.audio.ensureContext();
      window.audio.startBackgroundMusic();
      window.audio.playClick();
      this.startSoloMode();
    });

    // Secondary Modes Button on Landing -> Opens Mode Select Screen
    const btnLandingModes = document.getElementById('btn-landing-modes');
    if (btnLandingModes) {
      btnLandingModes.addEventListener('click', (e) => {
        e.stopPropagation();
        window.audio.ensureContext();
        window.audio.startBackgroundMusic();
        window.audio.playClick();
        this.showScreen('screen-mode-select');
      });
    }

    document.getElementById('btn-back-to-landing').addEventListener('click', () => {
      window.audio.playClick();
      this.updateLandingAndProfileUI();
      this.showScreen('screen-landing');
    });

    // 📖 Guide Modal Openers
    const btnLandingGuide = document.getElementById('btn-landing-guide');
    if (btnLandingGuide) {
      btnLandingGuide.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openGuideModal();
      });
    }

    const btnModeGuide = document.getElementById('btn-mode-guide');
    if (btnModeGuide) {
      btnModeGuide.addEventListener('click', () => this.openGuideModal());
    }

    const btnGuide = document.getElementById('btn-guide');
    if (btnGuide) {
      btnGuide.addEventListener('click', () => this.openGuideModal());
    }

    const btnSettingsGuide = document.getElementById('btn-settings-guide');
    if (btnSettingsGuide) {
      btnSettingsGuide.addEventListener('click', () => {
        this.closeModals();
        this.openGuideModal();
      });
    }

    const btnCloseGuide = document.getElementById('btn-close-guide');
    if (btnCloseGuide) {
      btnCloseGuide.addEventListener('click', () => this.closeModals());
    }

    const btnCloseGuideFooter = document.getElementById('btn-close-guide-footer');
    if (btnCloseGuideFooter) {
      btnCloseGuideFooter.addEventListener('click', () => this.closeModals());
    }

    // Guide Tab Switching
    document.querySelectorAll('.guide-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.audio.playClick();
        this.switchGuideTab(btn.dataset.tab);
      });
    });

    document.getElementById('btn-mode-settings').addEventListener('click', () => {
      window.audio.playClick();
      this.openSettingsModal();
    });

    document.getElementById('btn-home').addEventListener('click', () => {
      window.audio.playClick();
      this.closeModals();
      this.showScreen('screen-mode-select');
    });

    // 3 Mode Cards with Hover & Select Sounds
    const cards = [
      { id: 'mode-card-solo', action: () => this.startSoloMode() },
      { id: 'mode-card-bot', action: () => this.startBotMode() },
      { id: 'mode-card-friend', action: () => this.startFriendMode() }
    ];

    cards.forEach(c => {
      const el = document.getElementById(c.id);
      if (el) {
        el.addEventListener('mouseenter', () => window.audio.playCardHover());
        el.addEventListener('click', () => {
          window.audio.playCardSelect();
          c.action();
        });
      }
    });

    // Rematch
    document.getElementById('btn-rematch').addEventListener('click', () => {
      window.audio.playClick();
      this.closeModals();
      if (this.currentMode === 'BOT') this.startBotMode();
      else if (this.currentMode === 'FRIEND') this.startFriendMode();
    });

    document.getElementById('btn-match-menu').addEventListener('click', () => {
      window.audio.playClick();
      this.closeModals();
      this.showScreen('screen-mode-select');
    });

    // Daily Gift Collect
    document.getElementById('btn-claim-daily').addEventListener('click', () => {
      window.audio.playHintSound();
      this.closeModals();
      this.updateHUD();
    });
  }

  // Rotating Minimalist Hero Marble
  initHeroMarble() {
    const canvas = document.getElementById('hero-marble-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;
    const dummy = new Marble(60, 60, 42, 'classic_banta');

    const renderHero = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dummy.rotation = angle;
      dummy.render(ctx);
      angle += 0.015;
      requestAnimationFrame(renderHero);
    };
    renderHero();
  }

  // --- MODE INITIALIZERS ---
  startSoloMode(targetLevel = null) {
    this.currentMode = 'SOLO';
    this.showScreen('screen-game');

    window.audio.playStageIntro();
    window.audio.startBackgroundMusic();

    document.getElementById('hud-level-badge').style.display = 'flex';
    document.getElementById('btn-map').style.display = 'flex';
    document.getElementById('hud-multiplayer-scoreboard').style.display = 'none';
    document.getElementById('turn-banner').style.display = 'none';

    const hudPhoneLvl = document.getElementById('hud-level-badge-phone');
    if (hudPhoneLvl) hudPhoneLvl.style.display = 'flex';
    const hudPhoneScore = document.getElementById('hud-multiplayer-scoreboard-phone');
    if (hudPhoneScore) hudPhoneScore.style.display = 'none';

    if (targetLevel && targetLevel >= 1 && targetLevel <= GAME_LEVELS.length) {
      this.currentLevelIndex = targetLevel;
    } else if (window.progress && window.progress.getLastPlayedLevel) {
      this.currentLevelIndex = window.progress.getLastPlayedLevel();
    }

    this.loadLevel(this.currentLevelIndex);
  }

  startBotMode() {
    this.currentMode = 'BOT';
    this.showScreen('screen-game');

    window.audio.playStageIntro();
    window.audio.startBackgroundMusic();

    document.getElementById('hud-level-badge').style.display = 'none';
    document.getElementById('btn-map').style.display = 'none';
    document.getElementById('hud-multiplayer-scoreboard').style.display = 'flex';

    const hudPhoneLvl = document.getElementById('hud-level-badge-phone');
    if (hudPhoneLvl) hudPhoneLvl.style.display = 'none';
    const hudPhoneScore = document.getElementById('hud-multiplayer-scoreboard-phone');
    if (hudPhoneScore) hudPhoneScore.style.display = 'flex';

    document.getElementById('p1-score-tag').textContent = 'You: 0';
    document.getElementById('p2-score-tag').textContent = 'Chintu: 0';
    const p1ScorePhone = document.getElementById('p1-score-tag-phone');
    if (p1ScorePhone) p1ScorePhone.textContent = 'You: 0';
    const p2ScorePhone = document.getElementById('p2-score-tag-phone');
    if (p2ScorePhone) p2ScorePhone.textContent = 'Chintu: 0';

    this.scores = { p1: 0, p2: 0 };
    this.activePlayer = 1;
    this.isBotTurn = false;

    this.initArenaMatch('Vs AI Bot (First to 4 Marbles)');
  }

  startFriendMode() {
    this.currentMode = 'FRIEND';
    this.showScreen('screen-game');

    window.audio.playStageIntro();
    window.audio.startBackgroundMusic();

    document.getElementById('hud-level-badge').style.display = 'none';
    document.getElementById('btn-map').style.display = 'none';
    document.getElementById('hud-multiplayer-scoreboard').style.display = 'flex';

    const hudPhoneLvl = document.getElementById('hud-level-badge-phone');
    if (hudPhoneLvl) hudPhoneLvl.style.display = 'none';
    const hudPhoneScore = document.getElementById('hud-multiplayer-scoreboard-phone');
    if (hudPhoneScore) hudPhoneScore.style.display = 'flex';

    document.getElementById('p1-score-tag').textContent = 'P1: 0';
    document.getElementById('p2-score-tag').textContent = 'P2: 0';
    const p1ScorePhone = document.getElementById('p1-score-tag-phone');
    if (p1ScorePhone) p1ScorePhone.textContent = 'P1: 0';
    const p2ScorePhone = document.getElementById('p2-score-tag-phone');
    if (p2ScorePhone) p2ScorePhone.textContent = 'P2: 0';

    this.scores = { p1: 0, p2: 0 };
    this.activePlayer = 1;
    this.isBotTurn = false;

    this.initArenaMatch('2-Player Pass & Play (First to 4 Marbles)');
  }

  initArenaMatch(subtitle) {
    this.ring = { x: 240, y: 280, radius: 120 };
    this.obstacles = [
      { type: 'rect', x: 80, y: 440, width: 80, height: 16, bounce: 0.82, color: '#B23A22' },
      { type: 'rect', x: 320, y: 440, width: 80, height: 16, bounce: 0.82, color: '#B23A22' }
    ];
    this.holes = [];
    this.puddles = [{ x: 240, y: 460, radius: 42 }];
    this.generateNeemLeaves();

    const p1Skin = window.progress.data.equippedSkin || 'classic_banta';
    this.striker = new Marble(240, 680, 20, p1Skin, { isStriker: true });

    this.marbles = [this.striker];
    const skins = ['cats_eye', 'lal_angaar', 'doodhia', 'classic_banta'];
    this.marbles.push(new Marble(240, 280, 18, skins[0], { isTarget: true }));
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      this.marbles.push(new Marble(
        240 + Math.cos(angle) * 36,
        280 + Math.sin(angle) * 36,
        18,
        skins[(i + 1) % skins.length],
        { isTarget: true }
      ));
    }

    this.state = 'AIMING';
    this.showTurnBanner(this.activePlayer === 1 ? 'Player 1 (You)' : 'Chintu (AI Bot)');

    const hint = document.getElementById('aim-hint');
    if (hint) hint.textContent = subtitle;
  }

  showTurnBanner(text) {
    const banner = document.getElementById('turn-banner');
    const bannerText = document.getElementById('turn-banner-text');
    if (banner && bannerText) {
      bannerText.textContent = text;
      banner.style.display = 'block';
    }
  }

  generateNeemLeaves() {
    this.leaves = [
      { x: 190, y: 180, angle: 0.4, length: 22, width: 8 },
      { x: 380, y: 240, angle: -0.6, length: 24, width: 9 },
      { x: 120, y: 520, angle: 1.2, length: 20, width: 7 },
      { x: 360, y: 580, angle: -0.2, length: 25, width: 9 }
    ];
  }

  initHUD() {
    const mapBtn = document.getElementById('btn-map');
    if (mapBtn) {
      mapBtn.addEventListener('click', () => {
        window.audio.playClick();
        this.openMapModal();
      });
    }

    const levelBadge = document.getElementById('hud-level-badge');
    if (levelBadge) {
      levelBadge.style.cursor = 'pointer';
      levelBadge.title = 'Click to open 50-Level Map';
      levelBadge.addEventListener('click', () => {
        window.audio.playClick();
        this.openMapModal();
      });
    }

    const levelBadgePhone = document.getElementById('hud-level-badge-phone');
    if (levelBadgePhone) {
      levelBadgePhone.addEventListener('click', () => {
        window.audio.playClick();
        this.openMapModal();
      });
    }

    const storeBtn = document.getElementById('btn-store');
    if (storeBtn) {
      storeBtn.addEventListener('click', () => {
        window.audio.playClick();
        this.openStoreModal();
      });
    }

    document.getElementById('btn-open-store-coins').addEventListener('click', () => {
      window.audio.playClick();
      this.openStoreModal();
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
      window.audio.playClick();
      this.openSettingsModal();
    });

    const updateSoundIcons = (isMuted) => {
      const icon = isMuted ? '🔇' : '🔊';
      const btnSound = document.getElementById('btn-sound');
      if (btnSound) btnSound.textContent = icon;
      const btnSoundPhone = document.getElementById('btn-sound-phone');
      if (btnSoundPhone) btnSoundPhone.innerHTML = `<span>${icon}</span>`;
    };

    document.getElementById('btn-sound').addEventListener('click', () => {
      const isMuted = window.audio.toggleMute();
      updateSoundIcons(isMuted);
    });

    const btnSoundPhone = document.getElementById('btn-sound-phone');
    if (btnSoundPhone) {
      btnSoundPhone.addEventListener('click', () => {
        const isMuted = window.audio.toggleMute();
        updateSoundIcons(isMuted);
      });
    }

    const handleRestart = () => {
      window.audio.playClick();
      if (this.currentMode === 'SOLO') this.loadLevel(this.currentLevelIndex);
      else if (this.currentMode === 'BOT') this.startBotMode();
      else if (this.currentMode === 'FRIEND') this.startFriendMode();
    };

    document.getElementById('btn-restart').addEventListener('click', handleRestart);

    const btnRestartPhone = document.getElementById('btn-restart-phone');
    if (btnRestartPhone) {
      btnRestartPhone.addEventListener('click', handleRestart);
    }

    // 💡 Bulb Hint Button Handler
    document.getElementById('btn-bulb-hint').addEventListener('click', () => {
      this.activateBulbHint();
    });

    // Store Tab Buttons
    document.getElementById('tab-galli').addEventListener('click', () => {
      window.audio.playClick();
      this.activeStoreTab = 'galli';
      document.getElementById('tab-galli').classList.add('active');
      document.getElementById('tab-pro').classList.remove('active');
      this.renderStoreList();
    });

    document.getElementById('tab-pro').addEventListener('click', () => {
      window.audio.playClick();
      this.activeStoreTab = 'pro';
      document.getElementById('tab-pro').classList.add('active');
      document.getElementById('tab-galli').classList.remove('active');
      this.renderStoreList();
    });

    // Modal Close buttons
    document.getElementById('btn-close-map').addEventListener('click', () => this.closeModals());
    document.getElementById('btn-close-store').addEventListener('click', () => this.closeModals());
    document.getElementById('btn-close-settings').addEventListener('click', () => this.closeModals());
    document.getElementById('btn-play-current').addEventListener('click', () => this.closeModals());

    // Solo Victory
    document.getElementById('btn-next-level').addEventListener('click', () => {
      window.audio.playClick();
      this.closeModals();
      this.loadLevel(this.currentLevelIndex + 1);
    });

    document.getElementById('btn-victory-replay').addEventListener('click', () => {
      window.audio.playClick();
      this.closeModals();
      this.loadLevel(this.currentLevelIndex);
    });

    // Retry
    document.getElementById('btn-retry').addEventListener('click', () => {
      window.audio.playClick();
      this.closeModals();
      this.loadLevel(this.currentLevelIndex);
    });

    document.getElementById('btn-gameover-map').addEventListener('click', () => {
      window.audio.playClick();
      this.closeModals();
      this.openMapModal();
    });

    // Settings
    const sliderAmbience = document.getElementById('slider-ambience');
    if (sliderAmbience) {
      sliderAmbience.value = window.audio.ambienceVolume * 100;
      sliderAmbience.addEventListener('input', (e) => {
        window.audio.setAmbienceVolume(e.target.value / 100);
      });
    }

    const sliderVol = document.getElementById('slider-volume');
    if (sliderVol) {
      sliderVol.value = window.audio.sfxVolume * 100;
      sliderVol.addEventListener('input', (e) => {
        window.audio.setSFXVolume(e.target.value / 100);
        window.audio.playGlassClink(0.5);
      });
    }

    const inputName = document.getElementById('input-player-name');
    if (inputName) {
      inputName.value = window.progress.data.playerName || 'Raju (You)';
      inputName.addEventListener('change', (e) => {
        window.progress.setPlayerName(e.target.value);
      });
    }

    document.getElementById('btn-reset-data').addEventListener('click', () => {
      if (confirm("Reset game progress back to Level 1?")) {
        window.progress.resetProgress();
        this.updateHUD();
        this.loadLevel(1);
        this.closeModals();
      }
    });

    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('hud-coins').textContent = window.progress.data.coins;
    document.getElementById('hud-bulbs').textContent = window.progress.data.bulbs || 0;
    document.getElementById('hud-level-text').textContent = `Level ${this.currentLevelIndex}`;
    document.getElementById('hud-shots-text').textContent = `🎯 ${this.shotsLeft}`;

    const lvlPhone = document.getElementById('hud-level-text-phone');
    if (lvlPhone) lvlPhone.textContent = `Level ${this.currentLevelIndex}`;
    const shotsPhone = document.getElementById('hud-shots-text-phone');
    if (shotsPhone) shotsPhone.textContent = `🎯 ${this.shotsLeft} Shots Left`;
  }

  // --- GEOMETRY HELPERS FOR SMART AIM & BANK SHOTS ---
  distToSegment(p, a, b) {
    const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)));
  }

  segmentIntersectsBox(p1, p2, xmin, xmax, ymin, ymax) {
    let t0 = 0.0, t1 = 1.0;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const p = [-dx, dx, -dy, dy];
    const q = [p1.x - xmin, xmax - p1.x, p1.y - ymin, ymax - p1.y];

    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) {
        if (q[i] < 0) return false;
      } else {
        const r = q[i] / p[i];
        if (p[i] < 0) {
          if (r > t1) return false;
          if (r > t0) t0 = r;
        } else {
          if (r < t0) return false;
          if (r < t1) t1 = r;
        }
      }
    }
    return t0 <= t1;
  }

  isLineOfSightBlocked(p1, p2, ignoreMarble = null) {
    const clearance = 16;
    for (const obs of this.obstacles) {
      if (obs.type === 'rect') {
        if (this.segmentIntersectsBox(p1, p2, obs.x - clearance, obs.x + obs.width + clearance, obs.y - clearance, obs.y + obs.height + clearance)) {
          return true;
        }
      } else if (obs.type === 'circle') {
        if (this.distToSegment(obs, p1, p2) < obs.radius + clearance) {
          return true;
        }
      }
    }

    // Check Gucchu dirt pits/holes
    if (this.holes) {
      for (const h of this.holes) {
        if (this.distToSegment(h, p1, p2) < h.radius + 8) {
          return true;
        }
      }
    }

    // Check penalty marbles
    for (const m of this.marbles) {
      if (m === ignoreMarble || !m.active || m.inHole || m === this.striker) continue;
      if (m.isPenalty) {
        if (this.distToSegment(m, p1, p2) < m.radius + clearance) {
          return true;
        }
      }
    }

    return false;
  }

  calculateBankShot(striker, target) {
    const leftCushionX = 24;
    const rightCushionX = 480 - 24;
    const candidates = [];

    // Option A: Bounce off Left Cushion
    const tReflectLeftX = 2 * leftCushionX - target.x;
    const denomLeft = tReflectLeftX - striker.x;
    if (Math.abs(denomLeft) > 1) {
      const t = (leftCushionX - striker.x) / denomLeft;
      const bounceY = striker.y + t * (target.y - striker.y);
      if (bounceY >= 80 && bounceY <= 650) {
        const bouncePoint = { x: leftCushionX, y: bounceY };
        const blocked1 = this.isLineOfSightBlocked(striker, bouncePoint, target);
        const blocked2 = this.isLineOfSightBlocked(bouncePoint, target, target);
        if (!blocked1 && !blocked2) {
          const totalDist = Math.hypot(bouncePoint.x - striker.x, bouncePoint.y - striker.y) +
                            Math.hypot(target.x - bouncePoint.x, target.y - bouncePoint.y);
          candidates.push({ bouncePoint, totalDist, side: 'LEFT' });
        }
      }
    }

    // Option B: Bounce off Right Cushion
    const tReflectRightX = 2 * rightCushionX - target.x;
    const denomRight = tReflectRightX - striker.x;
    if (Math.abs(denomRight) > 1) {
      const t = (rightCushionX - striker.x) / denomRight;
      const bounceY = striker.y + t * (target.y - striker.y);
      if (bounceY >= 80 && bounceY <= 650) {
        const bouncePoint = { x: rightCushionX, y: bounceY };
        const blocked1 = this.isLineOfSightBlocked(striker, bouncePoint, target);
        const blocked2 = this.isLineOfSightBlocked(bouncePoint, target, target);
        if (!blocked1 && !blocked2) {
          const totalDist = Math.hypot(bouncePoint.x - striker.x, bouncePoint.y - striker.y) +
                            Math.hypot(target.x - bouncePoint.x, target.y - bouncePoint.y);
          candidates.push({ bouncePoint, totalDist, side: 'RIGHT' });
        }
      }
    }

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => a.totalDist - b.totalDist);
    return candidates[0];
  }

  // --- 💡 BULB HINT ACTIVATION (Permanent until shot, Smart Cross Hit / Bank Shot) ---
  activateBulbHint() {
    if (this.state !== 'AIMING' || !this.striker) return;

    if ((window.progress.data.bulbs || 0) <= 0) {
      if (confirm("No hint bulbs left! Buy 1 Bulb for 20 Coins?")) {
        if (window.progress.buyBulbWithCoins()) {
          window.audio.playHintSound();
          this.updateHUD();
        } else {
          alert("Not enough coins! Win levels to earn more coins.");
          return;
        }
      } else {
        return;
      }
    }

    if (window.progress.useBulb()) {
      window.audio.playHintSound();
      this.updateHUD();

      const validTargets = this.marbles.filter(m => m.isTarget && !m.isPenalty && !m.isKnockedOut && !m.inHole);
      if (validTargets.length === 0) return;

      // 1. Check for DIRECT clear line-of-sight targets (no wall or obstacle in front)
      const clearDirectTargets = [];
      for (const t of validTargets) {
        if (!this.isLineOfSightBlocked(this.striker, t, t)) {
          const dist = Math.hypot(t.x - this.striker.x, t.y - this.striker.y);
          clearDirectTargets.push({ target: t, dist });
        }
      }

      if (clearDirectTargets.length > 0) {
        clearDirectTargets.sort((a, b) => a.dist - b.dist);
        const best = clearDirectTargets[0];
        const dx = best.target.x - this.striker.x;
        const dy = best.target.y - this.striker.y;
        const angle = Math.atan2(dy, dx);
        const idealPower = Math.min(100, Math.max(65, best.dist * 0.28));

        this.activeGoldenHint = {
          isCrossHit: false,
          target: best.target,
          angle,
          idealPower
          // NO 10-second timer! Remains active until shot is fired.
        };
        return;
      }

      // 2. All direct paths are blocked by a wall or obstacle upfront!
      // Calculate a smart CROSS HIT (Bank Shot off the side cushion)
      let bestBank = null;
      let minBankDist = Infinity;
      let bankTarget = null;

      for (const t of validTargets) {
        const bank = this.calculateBankShot(this.striker, t);
        if (bank && bank.totalDist < minBankDist) {
          minBankDist = bank.totalDist;
          bestBank = bank;
          bankTarget = t;
        }
      }

      if (bestBank && bankTarget) {
        const dx = bestBank.bouncePoint.x - this.striker.x;
        const dy = bestBank.bouncePoint.y - this.striker.y;
        const angle = Math.atan2(dy, dx);
        const idealPower = Math.min(100, Math.max(75, bestBank.totalDist * 0.22));

        this.activeGoldenHint = {
          isCrossHit: true,
          target: bankTarget,
          bouncePoint: bestBank.bouncePoint,
          angle,
          idealPower
          // NO 10-second timer! Remains active until shot is fired.
        };
        return;
      }

      // 3. Fallback if even bank paths are blocked: choose closest target
      let bestTarget = validTargets[0];
      let minDist = Infinity;
      for (const t of validTargets) {
        const d = Math.hypot(t.x - this.striker.x, t.y - this.striker.y);
        if (d < minDist) {
          minDist = d;
          bestTarget = t;
        }
      }

      const dx = bestTarget.x - this.striker.x;
      const dy = bestTarget.y - this.striker.y;
      const angle = Math.atan2(dy, dx);

      this.activeGoldenHint = {
        isCrossHit: false,
        target: bestTarget,
        angle,
        idealPower: Math.min(100, Math.max(65, minDist * 0.28))
      };
    }
  }

  // --- INPUT HANDLING ---
  initInput() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const canvasX = (clientX - rect.left) * this.dpr;
      const canvasY = (clientY - rect.top) * this.dpr;

      return {
        x: (canvasX - this.cameraOffsetX) / this.cameraScale,
        y: (canvasY - this.cameraOffsetY) / this.cameraScale,
        screenX: clientX,
        screenY: clientY
      };
    };

    const startDrag = (pos) => {
      if (this.state !== 'AIMING' || !this.striker || (this.currentMode === 'BOT' && this.isBotTurn)) return;
      window.audio.ensureContext();

      const dist = Math.hypot(pos.x - this.striker.x, pos.y - this.striker.y);
      if (dist < this.striker.radius * 3.8 || (Math.abs(pos.x - this.striker.x) < 70 && Math.abs(pos.y - this.striker.y) < 70)) {
        this.isDragging = true;
        this.dragStart = { x: this.striker.x, y: this.striker.y };
        this.dragCurrent = { x: pos.x, y: pos.y };

        // Dismiss tutorial immediately when player touches and drags striker goti
        if (this.showLevel1Tutorial) {
          this.dismissTutorial();
        }
      }
    };

    const moveDrag = (pos) => {
      if (!this.isDragging) return;
      this.dragCurrent = { x: pos.x, y: pos.y };
    };

    const endDrag = () => {
      if (!this.isDragging) return;
      this.isDragging = false;

      const dx = this.dragStart.x - this.dragCurrent.x;
      const dy = this.dragStart.y - this.dragCurrent.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 10) {
        const power = Math.min(dist, this.maxDragDist);
        const angle = Math.atan2(dy, dx);
        const impulse = power * this.powerScale;

        this.striker.vx = Math.cos(angle) * impulse;
        this.striker.vy = Math.sin(angle) * impulse;

        if (this.currentMode === 'SOLO') {
          this.shotsLeft--;
          this.shotsTaken++;
          this.updateHUD();
        }

        window.audio.playFlickSound(power / this.maxDragDist);
        this.physics.particles.emitDust(this.striker.x, this.striker.y, 8, 'rgba(215, 185, 145, 0.8)', 2.5);

        this.activeGoldenHint = null; // Clear hint on shot
        this.state = 'ROLLING';
      }
    };

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.addEventListener('mousedown', (e) => startDrag(getPos(e)));
    window.addEventListener('mousemove', (e) => moveDrag(getPos(e)));
    window.addEventListener('mouseup', () => endDrag());

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrag(getPos(e));
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        e.preventDefault();
        moveDrag(getPos(e));
      }
    }, { passive: false });

    window.addEventListener('touchend', () => endDrag());
    window.addEventListener('touchcancel', () => endDrag());
  }

  // --- SOLO LEVEL LOADER ---
  loadLevel(levelId) {
    if (levelId > GAME_LEVELS.length) levelId = 1;
    this.currentLevelIndex = levelId;
    if (window.progress && this.currentMode === 'SOLO') {
      window.progress.setLastPlayedLevel(levelId);
    }
    this.levelData = GAME_LEVELS.find(l => l.id === levelId) || GAME_LEVELS[0];

    this.shotsLeft = this.levelData.shots;
    this.shotsTaken = 0;
    this.ring = this.levelData.ring;
    this.obstacles = this.levelData.obstacles || [];
    this.holes = this.levelData.holes || [];
    this.puddles = this.levelData.puddles || [];
    this.generateNeemLeaves();

    // Shot 1: Starts at center baseline
    const equippedSkin = window.progress.data.equippedSkin || 'classic_banta';
    this.striker = new Marble(this.levelData.strikerStart.x, this.levelData.strikerStart.y, 20, equippedSkin, { isStriker: true });

    this.marbles = [this.striker];
    for (const t of this.levelData.targets) {
      this.marbles.push(new Marble(t.x, t.y, t.radius || 18, t.skinId || 'classic_banta', {
        isTarget: true,
        isGolden: t.isGolden || false,
        isPenalty: t.isPenalty || false
      }));
    }

    this.activeGoldenHint = null;
    this.state = 'AIMING';
    this.updateHUD();
    this.updateLandingAndProfileUI();

    // Trigger Level 1 interactive guided arrow onboarding
    if (levelId === 1 && !localStorage.getItem('kancha_tutorial_completed')) {
      this.showLevel1Tutorial = true;
      const overlay = document.getElementById('tutorial-overlay');
      if (overlay) overlay.style.display = 'block';
    } else {
      this.showLevel1Tutorial = false;
      const overlay = document.getElementById('tutorial-overlay');
      if (overlay) overlay.style.display = 'none';
    }

    const hint = document.getElementById('aim-hint');
    if (hint) hint.textContent = this.levelData.subtitle;
  }

  dismissTutorial() {
    this.showLevel1Tutorial = false;
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.display = 'none';
    localStorage.setItem('kancha_tutorial_completed', 'true');
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    const bounds = { left: 10, right: this.arenaWidth - 10, top: 10, bottom: this.arenaHeight - 10 };
    this.physics.update(this.marbles, this.obstacles, this.holes, this.puddles, bounds, dt);

    if (this.state === 'ROLLING') {
      // RULE 2: We do NOT knock out marbles in real-time while they are still rolling!
      // We only evaluate rest positions when ALL marbles have completely stopped.
      if (this.physics.allStopped(this.marbles)) {
        this.evaluateRestKnockouts();
        this.checkTurnEnd();
      }
    }
  }

  // --- RULE 2: TRUE CIRCLE KNOCKOUT RULE (At Rest Only) ---
  evaluateRestKnockouts() {
    if (!this.ring) return;

    for (const m of this.marbles) {
      if (!m.isStriker && m.active && !m.isKnockedOut) {
        const distFromRingCenter = Math.hypot(m.x - this.ring.x, m.y - this.ring.y);

        // ONLY if it ended its roll outside the chalk ring!
        if (distFromRingCenter > this.ring.radius + m.radius) {
          m.isKnockedOut = true;
          this.physics.particles.emitSparks(m.x, m.y, 8, '#FFFFFF');
          window.audio.playGlassClink(1.2);

          if (this.currentMode !== 'SOLO') {
            if (this.activePlayer === 1) this.scores.p1++;
            else this.scores.p2++;
            this.updateScoreboard();
          }
        }
      }
    }
  }

  updateScoreboard() {
    const p1Phone = document.getElementById('p1-score-tag-phone');
    const p2Phone = document.getElementById('p2-score-tag-phone');
    if (this.currentMode === 'BOT') {
      const text1 = `You: ${this.scores.p1}`;
      const text2 = `Chintu: ${this.scores.p2}`;
      document.getElementById('p1-score-tag').textContent = text1;
      document.getElementById('p2-score-tag').textContent = text2;
      if (p1Phone) p1Phone.textContent = text1;
      if (p2Phone) p2Phone.textContent = text2;
    } else {
      const text1 = `P1: ${this.scores.p1}`;
      const text2 = `P2: ${this.scores.p2}`;
      document.getElementById('p1-score-tag').textContent = text1;
      document.getElementById('p2-score-tag').textContent = text2;
      if (p1Phone) p1Phone.textContent = text1;
      if (p2Phone) p2Phone.textContent = text2;
    }
  }

  checkTurnEnd() {
    if (this.currentMode === 'SOLO') {
      this.checkSoloTurnEnd();
    } else {
      this.checkMultiplayerTurnEnd();
    }
  }

  checkSoloTurnEnd() {
    let won = false;
    let failed = false;

    // Check penalty marble across all levels
    const penalty = this.marbles.find(m => m.isPenalty);
    if (penalty && (penalty.isKnockedOut || penalty.inHole)) {
      failed = true;
    } else if (this.levelData.winCondition === 'knock_out_golden') {
      const golden = this.marbles.find(m => m.isGolden);
      if (golden && (golden.isKnockedOut || golden.inHole)) won = true;
    } else {
      const remaining = this.marbles.filter(m => m.isTarget && !m.isPenalty && !m.isKnockedOut && !m.inHole);
      if (remaining.length === 0) won = true;
    }

    if (won) {
      this.state = 'LEVEL_OVER';
      this.handleVictory();
      return;
    }

    if (failed || this.shotsLeft <= 0) {
      this.state = 'LEVEL_OVER';
      this.handleGameOver(failed ? "Arey! Penalty goti knock out ho gayi!" : "Shots Finished!");
      return;
    }

    // --- RULE 1: JAHAN RUKI WAHIN SE (Shoot From Where It Stopped!) ---
    this.prepareStrikerForNextShot();
    this.state = 'AIMING';
  }

  // Next shot originates from where striker stopped
  prepareStrikerForNextShot() {
    // If striker rolled into the pit or out of bounds, reset to safe edge
    if (this.striker.inHole || this.striker.x < 20 || this.striker.x > this.arenaWidth - 20 || this.striker.y < 20 || this.striker.y > this.arenaHeight - 20) {
      this.striker.x = 240;
      this.striker.y = 680;
      this.striker.inHole = false;
      this.striker.holeScale = 1.0;
    }

    this.striker.vx = 0;
    this.striker.vy = 0;
    this.striker.active = true;
  }

  checkMultiplayerTurnEnd() {
    const remaining = this.marbles.filter(m => m.isTarget && !m.isKnockedOut && !m.inHole);

    if (this.scores.p1 >= this.targetWinScore || this.scores.p2 >= this.targetWinScore || remaining.length === 0) {
      this.state = 'LEVEL_OVER';
      let winnerText = '';
      if (this.scores.p1 > this.scores.p2) {
        winnerText = (this.currentMode === 'BOT') ? 'You Won!' : 'Player 1 Won!';
      } else if (this.scores.p2 > this.scores.p1) {
        winnerText = (this.currentMode === 'BOT') ? 'Chintu (Bot) Won!' : 'Player 2 Won!';
      } else {
        winnerText = 'Match Tied!';
      }

      window.audio.playWinJingle();
      document.getElementById('match-winner-title').textContent = winnerText;
      document.getElementById('match-winner-desc').textContent = `Final Score: ${this.scores.p1} - ${this.scores.p2}`;
      document.getElementById('modal-match-over').classList.add('active');
      return;
    }

    // Switch player
    this.activePlayer = (this.activePlayer === 1) ? 2 : 1;
    this.prepareStrikerForNextShot();

    // Alternate striker skin
    if (this.currentMode === 'FRIEND') {
      this.striker.setSkin(this.activePlayer === 1 ? 'classic_banta' : 'lal_angaar');
    }

    if (this.currentMode === 'BOT' && this.activePlayer === 2) {
      this.isBotTurn = true;
      this.state = 'BOT_THINKING';
      this.showTurnBanner('Chintu (AI Bot) is aiming...');
      setTimeout(() => this.executeBotShot(), 1100);
    } else {
      this.isBotTurn = false;
      this.state = 'AIMING';
      this.showTurnBanner(this.currentMode === 'BOT' ? 'Your Turn!' : `Player ${this.activePlayer}'s Turn`);
    }
  }

  executeBotShot() {
    const activeTargets = this.marbles.filter(m => m.isTarget && !m.isKnockedOut && !m.inHole);
    if (activeTargets.length === 0) return;

    const target = activeTargets[Math.floor(Math.random() * activeTargets.length)];

    const dx = target.x - this.striker.x;
    const dy = target.y - this.striker.y;
    const errorAngle = (Math.random() - 0.5) * 0.12;
    const baseAngle = Math.atan2(dy, dx) + errorAngle;

    const impulse = 15 + Math.random() * 5;
    this.striker.vx = Math.cos(baseAngle) * impulse;
    this.striker.vy = Math.sin(baseAngle) * impulse;

    window.audio.playFlickSound(0.85);
    this.physics.particles.emitDust(this.striker.x, this.striker.y, 8, 'rgba(215, 185, 145, 0.8)', 2.5);
    this.state = 'ROLLING';
  }

  handleVictory() {
    window.audio.playWinJingle();

    let stars = 1;
    const th = this.levelData.starThresholds;
    if (this.shotsTaken <= th[0]) stars = 3;
    else if (this.shotsTaken <= th[1]) stars = 2;

    const { nextLevel, coinsEarned } = window.progress.completeLevel(this.currentLevelIndex, stars);

    document.getElementById('victory-subtitle').textContent = `Cleared in ${this.shotsTaken} shots!`;
    document.getElementById('victory-coins').textContent = `+${coinsEarned}`;

    for (let i = 1; i <= 3; i++) {
      document.getElementById(`star-${i}`).classList.toggle('active', i <= stars);
    }

    const btnNext = document.getElementById('btn-next-level');
    if (nextLevel <= GAME_LEVELS.length) {
      btnNext.style.display = 'inline-flex';
      btnNext.textContent = `Next Level ${nextLevel} ➡`;
    } else {
      btnNext.style.display = 'inline-flex';
      btnNext.textContent = `All 50 Levels Complete!`;
    }

    document.getElementById('modal-victory').classList.add('active');
    this.updateHUD();
    this.updateLandingAndProfileUI();
  }

  handleGameOver(reason) {
    window.audio.playLoseSound();
    document.getElementById('gameover-reason').textContent = reason;
    document.getElementById('modal-gameover').classList.add('active');
  }

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active'));
  }

  // --- GUEST PROFILE & AVATAR SYSTEM (FREE FIRE / PUBG MOBILE STYLE) ---
  initGuestProfileSystem() {
    const streetAvatars = [
      { emoji: '🧒', name: 'Raju', skill: 'Aim +5%' },
      { emoji: '👦', name: 'Chintu', skill: 'Bank Shot +10%' },
      { emoji: '👧', name: 'Munni', skill: 'Precision +8%' },
      { emoji: '🧢', name: 'Bunty', skill: 'Bounce +7%' },
      { emoji: '🕶️', name: 'Ustaad', skill: 'Power +12%' },
      { emoji: '👑', name: 'Badshah', skill: 'All Stats +5%' },
      { emoji: '🦁', name: 'Shera', skill: 'Impact +15%' },
      { emoji: '⚡', name: 'Bijli', skill: 'Speed +10%' }
    ];

    const renderGrid = (containerId) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      const currentAvatar = (window.progress && window.progress.getAvatar) ? window.progress.getAvatar() : '🧒';

      streetAvatars.forEach(av => {
        const item = document.createElement('div');
        const isSelected = (av.emoji === currentAvatar);
        item.className = 'pubg-character-card' + (isSelected ? ' selected' : '');
        item.innerHTML = `
          ${isSelected ? '<span class="pubg-char-badge">ACTIVE</span>' : ''}
          <div class="pubg-char-avatar">${av.emoji}</div>
          <div class="pubg-char-name">${av.name}</div>
          <div class="pubg-char-skill">⚡ ${av.skill}</div>
        `;
        item.addEventListener('click', () => {
          if (window.audio) window.audio.playCardSelect();
          if (window.progress) window.progress.setAvatar(av.emoji);
          this.updateLandingAndProfileUI();
          renderGrid('avatars-grid');
          renderGrid('welcome-avatars-grid');
        });
        container.appendChild(item);
      });
    };

    renderGrid('avatars-grid');
    renderGrid('welcome-avatars-grid');

    // Free Fire / PUBG Style Navigation Tabs
    document.querySelectorAll('.pubg-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.audio) window.audio.playClick();
        document.querySelectorAll('.pubg-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.pubg-tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = document.getElementById(btn.dataset.tab);
        if (pane) pane.classList.add('active');
        if (btn.dataset.tab === 'pubg-tab-arsenal') {
          this.renderArsenalPreview();
        }
      });
    });

    // Profile card on landing
    const landingCard = document.getElementById('landing-guest-card');
    if (landingCard) {
      landingCard.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.audio) window.audio.playClick();
        this.openGuestProfileModal();
      });
    }

    // Profile button in HUD
    const hudBtn = document.getElementById('btn-hud-profile');
    if (hudBtn) {
      hudBtn.addEventListener('click', () => {
        if (window.audio) window.audio.playClick();
        this.openGuestProfileModal();
      });
    }

    // Close button (X)
    const closeBtn = document.getElementById('btn-close-guest-profile');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.audio) window.audio.playClick();
        this.closeModals();
      });
    }

    // Modal overlay background click closes profile safely
    const profileOverlay = document.getElementById('modal-guest-profile');
    if (profileOverlay) {
      profileOverlay.addEventListener('click', (e) => {
        if (e.target === profileOverlay) {
          this.closeModals();
        }
      });
    }

    // Edit Name Toggle & Input
    const btnEditName = document.getElementById('btn-edit-profile-name');
    const inputName = document.getElementById('input-profile-name');
    const displayName = document.getElementById('profile-display-name');

    if (btnEditName && inputName) {
      btnEditName.addEventListener('click', (e) => {
        e.stopPropagation();
        if (inputName.style.display === 'none' || !inputName.style.display) {
          inputName.style.display = 'inline-block';
          if (displayName) displayName.style.display = 'none';
          inputName.focus();
          inputName.select();
        } else {
          inputName.style.display = 'none';
          if (displayName) displayName.style.display = 'inline-block';
          if (window.progress && inputName.value.trim()) {
            window.progress.setPlayerName(inputName.value.trim());
            this.updateLandingAndProfileUI();
          }
        }
      });

      inputName.addEventListener('blur', () => {
        inputName.style.display = 'none';
        if (displayName) displayName.style.display = 'inline-block';
        if (window.progress && inputName.value.trim()) {
          window.progress.setPlayerName(inputName.value.trim());
          this.updateLandingAndProfileUI();
        }
      });

      inputName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          inputName.blur();
        }
      });
    }

    // Street Motto Bio Input
    const inputBio = document.getElementById('input-profile-bio');
    if (inputBio) {
      inputBio.addEventListener('change', (e) => {
        if (window.progress && window.progress.setBio) {
          window.progress.setBio(e.target.value.trim());
        }
      });
    }

    // Copy Guest ID button
    const copyBtn = document.getElementById('btn-copy-guest-id');
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (window.progress && window.progress.getGuestId) ? window.progress.getGuestId() : '74829103';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(id).then(() => {
            copyBtn.textContent = '✓ COPIED!';
            setTimeout(() => { copyBtn.textContent = '📋 COPY'; }, 2000);
          }).catch(() => {
            copyBtn.textContent = '✓ ' + id;
          });
        } else {
          copyBtn.textContent = '✓ ' + id;
        }
      });
    }

    // Store button inside Arsenal tab
    const btnProfileStore = document.getElementById('btn-profile-open-store');
    if (btnProfileStore) {
      btnProfileStore.addEventListener('click', () => {
        if (window.audio) window.audio.playClick();
        this.closeModals();
        this.openStoreModal();
      });
    }

    // Continue / Resume Battle button inside profile modal
    const continueBtn = document.getElementById('btn-profile-continue');
    if (continueBtn) {
      continueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.audio) window.audio.playClick();
        this.closeModals();
        this.startSoloMode();
      });
    }

    // First-Time Welcome Check
    if (!localStorage.getItem('kancha_guest_welcome_seen')) {
      setTimeout(() => {
        const welcomeModal = document.getElementById('modal-guest-welcome');
        if (welcomeModal) welcomeModal.classList.add('active');
      }, 350);

      const welcomeStartBtn = document.getElementById('btn-welcome-start');
      if (welcomeStartBtn) {
        welcomeStartBtn.addEventListener('click', () => {
          localStorage.setItem('kancha_guest_welcome_seen', 'true');
          this.closeModals();
          if (window.audio) window.audio.playClick();
          this.startSoloMode();
        });
      }
    }

    this.updateLandingAndProfileUI();
  }

  renderArsenalPreview() {
    const canvas = document.getElementById('pubg-arsenal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const strikerId = (window.progress && window.progress.data && window.progress.data.strikerSkin)
      ? window.progress.data.strikerSkin : 'classic_banta';
    const strikerInfo = (typeof STRIKER_ROSTER !== 'undefined' && STRIKER_ROSTER[strikerId])
      ? STRIKER_ROSTER[strikerId]
      : { name: 'Classic Banta', tier: 'Standard Gali Gotis', mass: 1.0, grip: 1.0, restitution: 0.95 };

    const dummy = new Marble(canvas.width / 2, canvas.height / 2, 22, strikerId);
    dummy.render(ctx);

    const nameEl = document.getElementById('pubg-arsenal-name');
    if (nameEl) nameEl.textContent = strikerInfo.name;
    const tierEl = document.getElementById('pubg-arsenal-tier');
    if (tierEl) tierEl.textContent = (strikerInfo.tier === 'pro') ? '🏆 Pro League Striker' : 'Street Gully Marble';

    const pBar = document.getElementById('pubg-stat-power');
    if (pBar) pBar.style.width = Math.min(100, Math.round(((strikerInfo.mass || 1.0) / 1.7) * 100)) + '%';
    const gBar = document.getElementById('pubg-stat-grip');
    if (gBar) gBar.style.width = Math.min(100, Math.round(((strikerInfo.grip || 1.0) / 1.5) * 100)) + '%';
    const rBar = document.getElementById('pubg-stat-rebound');
    if (rBar) rBar.style.width = Math.min(100, Math.round(((strikerInfo.restitution || 0.95) / 1.1) * 100)) + '%';
  }

  openGuestProfileModal() {
    this.closeModals();
    this.updateLandingAndProfileUI();
    const modal = document.getElementById('modal-guest-profile');
    if (modal) modal.classList.add('active');
  }

  updateLandingAndProfileUI() {
    if (!window.progress) return;
    const data = window.progress.data || {};
    const guestId = (window.progress.getGuestId) ? window.progress.getGuestId() : (data.guestId || 'GUEST#1000');
    const avatar = (window.progress.getAvatar) ? window.progress.getAvatar() : (data.avatar || '🧒');
    const name = (window.progress.getPlayerName) ? window.progress.getPlayerName() : (data.playerName || 'Raju');
    const currentLvl = (window.progress.getLastPlayedLevel) ? window.progress.getLastPlayedLevel() : 1;
    const totalStars = (window.progress.getTotalStars) ? window.progress.getTotalStars() : 0;
    const coins = data.coins || 0;
    const bulbs = data.bulbs || 0;

    // Calculate Tier Rank based on level (Esports Ranking)
    let tierName = 'BRONZE STREET ROOKIE';
    let honorTitle = '🥉 Gully Novice';
    if (currentLvl >= 46) {
      tierName = 'GRANDMASTER KANCHA SAMRAT';
      honorTitle = '👑 Maha Samrat';
    } else if (currentLvl >= 36) {
      tierName = 'DIAMOND APEX STRIKER';
      honorTitle = '💎 Apex Striker';
    } else if (currentLvl >= 26) {
      tierName = 'PLATINUM GULLY KING';
      honorTitle = '⚡ Gully King';
    } else if (currentLvl >= 16) {
      tierName = 'GOLD MOHALLA MASTER';
      honorTitle = '🏅 Mohalla Master';
    } else if (currentLvl >= 6) {
      tierName = 'SILVER CHAWL SNIPER';
      honorTitle = '🎯 Chawl Sniper';
    }

    // 1. Landing Screen Guest Card
    const elAvatar = document.getElementById('landing-guest-avatar');
    if (elAvatar) elAvatar.textContent = avatar;
    const elName = document.getElementById('landing-guest-name');
    if (elName) elName.textContent = name;
    const elId = document.getElementById('landing-guest-id');
    if (elId) elId.textContent = guestId;
    const elLevel = document.getElementById('landing-guest-level');
    if (elLevel) elLevel.textContent = `🎯 Level ${currentLvl}`;
    const elStars = document.getElementById('landing-guest-stars');
    if (elStars) elStars.textContent = `⭐ ${totalStars}`;
    const elCoins = document.getElementById('landing-guest-coins');
    if (elCoins) elCoins.textContent = `🪙 ${coins}`;

    // 2. Landing Main Play Button
    const elPlayText = document.getElementById('btn-landing-play-text');
    if (elPlayText) {
      if (currentLvl > 1 || totalStars > 0) {
        elPlayText.textContent = `CONTINUE LEVEL ${currentLvl}`;
      } else {
        elPlayText.textContent = `START LEVEL 1`;
      }
    }

    // 3. HUD Avatar
    const elHudAvatar = document.getElementById('hud-avatar-icon');
    if (elHudAvatar) elHudAvatar.textContent = avatar;

    // 4. Free Fire / PUBG Esports Profile Modal Elements
    const elTierName = document.getElementById('profile-tier-name');
    if (elTierName) elTierName.textContent = tierName;
    const elHonorTitle = document.getElementById('profile-honor-title');
    if (elHonorTitle) elHonorTitle.textContent = honorTitle;
    const elLevelBadge = document.getElementById('profile-level-badge');
    if (elLevelBadge) elLevelBadge.textContent = `LV.${currentLvl}`;

    const elDispName = document.getElementById('profile-display-name');
    if (elDispName) elDispName.textContent = name;
    const elInputName = document.getElementById('input-profile-name');
    if (elInputName && document.activeElement !== elInputName) elInputName.value = name;

    const elModalAvatar = document.getElementById('profile-modal-avatar');
    if (elModalAvatar) elModalAvatar.textContent = avatar;
    const elModalId = document.getElementById('profile-modal-guest-id');
    if (elModalId) elModalId.textContent = guestId;

    const xpPct = Math.min(100, Math.max(2, Math.round((currentLvl / 50) * 100)));
    const elXpText = document.getElementById('profile-xp-text');
    if (elXpText) elXpText.textContent = `Stage ${currentLvl} / 50 (${xpPct}%)`;
    const elXpFill = document.getElementById('profile-xp-fill');
    if (elXpFill) elXpFill.style.width = `${xpPct}%`;

    // Career Stats
    const elStatStage = document.getElementById('pubg-stat-stage');
    if (elStatStage) elStatStage.textContent = `${currentLvl} / 50`;
    const elStatStars = document.getElementById('pubg-stat-stars');
    if (elStatStars) elStatStars.textContent = `${totalStars} ★`;
    const elStatWinrate = document.getElementById('pubg-stat-winrate');
    if (elStatWinrate) {
      const winRate = Math.min(99.4, (82 + currentLvl * 0.35)).toFixed(1);
      elStatWinrate.textContent = `${winRate}%`;
    }

    // Inventory items
    const elInvCoins = document.getElementById('pubg-inv-coins');
    if (elInvCoins) elInvCoins.textContent = coins;
    const elInvBulbs = document.getElementById('pubg-inv-bulbs');
    if (elInvBulbs) elInvBulbs.textContent = bulbs;

    // Street Motto Bio
    const elBioInput = document.getElementById('input-profile-bio');
    if (elBioInput && document.activeElement !== elBioInput) {
      const bio = (window.progress && window.progress.getBio) ? window.progress.getBio() : 'Ek goli, ek nishana! Mohalla Champion.';
      elBioInput.value = bio;
    }

    const elBtnProfileContinue = document.getElementById('btn-profile-continue');
    if (elBtnProfileContinue) {
      elBtnProfileContinue.textContent = `▶ RESUME BATTLE (STAGE ${currentLvl})`;
    }

    // 5. Welcome Modal ID if present
    const elWelcomeId = document.getElementById('welcome-guest-id');
    if (elWelcomeId) elWelcomeId.textContent = guestId;

    // 6. Mode Select Solo Card Text
    const modeSoloBtn = document.querySelector('#mode-card-solo .mode-btn');
    if (modeSoloBtn) {
      modeSoloBtn.textContent = `Resume Level ${currentLvl} ➡`;
    }

    // 7. Render Arsenal
    this.renderArsenalPreview();
  }

  // --- CARROM-STYLE TWO-TIER STRIKER STORE ---
  openStoreModal() {
    this.renderStoreList();
    document.getElementById('modal-store').classList.add('active');
  }

  renderStoreList() {
    const listContainer = document.getElementById('store-strikers-list');
    listContainer.innerHTML = '';

    const tab = this.activeStoreTab; // 'galli' or 'pro'
    const filteredStrikers = Object.values(STRIKER_ROSTER).filter(s => s.tier === tab);

    filteredStrikers.forEach(striker => {
      const isOwned = window.progress.data.ownedSkins.includes(striker.id);
      const isEquipped = window.progress.data.equippedSkin === striker.id;

      const card = document.createElement('div');
      card.className = `striker-card ${isEquipped ? 'equipped' : ''}`;

      // Canvas preview
      const canvas = document.createElement('canvas');
      canvas.width = 54;
      canvas.height = 54;
      canvas.className = 'striker-preview';
      this.drawStrikerPreview(canvas, striker.id);

      // Info & Stat bars
      const info = document.createElement('div');
      info.className = 'striker-info';
      info.innerHTML = `
        <div class="striker-name">${striker.name}</div>
        <div class="stat-row">
          <span>Vazan (Power)</span>
          <div class="stat-bar"><div class="stat-fill" style="width: ${striker.stats.power}%;"></div></div>
        </div>
        <div class="stat-row">
          <span>Pakad (Grip)</span>
          <div class="stat-bar"><div class="stat-fill" style="width: ${striker.stats.grip}%; background: #4CAF50;"></div></div>
        </div>
        <div class="stat-row">
          <span>Lachak (Bounce)</span>
          <div class="stat-bar"><div class="stat-fill" style="width: ${striker.stats.rebound}%; background: #29B6F6;"></div></div>
        </div>
      `;

      // Action Button
      const btn = document.createElement('button');
      btn.style.padding = '8px 14px';
      btn.style.fontSize = '12px';
      btn.style.borderRadius = '6px';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';

      if (isEquipped) {
        btn.textContent = 'Equipped';
        btn.className = 'btn-secondary-clean';
        btn.disabled = true;
      } else if (isOwned) {
        btn.textContent = 'Equip';
        btn.className = 'btn-primary-clean';
        btn.addEventListener('click', () => {
          window.progress.equipSkin(striker.id);
          this.striker.setSkin(striker.id);
          window.audio.playClick();
          this.renderStoreList();
        });
      } else {
        if (striker.priceType === 'coins') {
          btn.textContent = `Buy 🪙${striker.price}`;
          btn.className = 'btn-primary-clean';
          btn.disabled = window.progress.data.coins < striker.price;
          btn.addEventListener('click', () => {
            if (window.progress.buySkinWithCoins(striker.id, striker.price)) {
              window.audio.playHintSound();
              this.striker.setSkin(striker.id);
              this.updateHUD();
              this.renderStoreList();
            }
          });
        } else {
          btn.textContent = `Unlock ${striker.priceDisplay}`;
          btn.className = 'btn-primary-clean';
          btn.style.background = '#2E7D32';
          btn.addEventListener('click', () => {
            if (confirm(`Unlock ${striker.name} for ${striker.priceDisplay}? (Play Store In-App Purchase)`)) {
              window.progress.buyProSkin(striker.id);
              window.audio.playHintSound();
              this.striker.setSkin(striker.id);
              this.renderStoreList();
            }
          });
        }
      }

      card.appendChild(canvas);
      card.appendChild(info);
      card.appendChild(btn);
      listContainer.appendChild(card);
    });
  }

  drawStrikerPreview(canvas, skinId) {
    const ctx = canvas.getContext('2d');
    const dummy = new Marble(27, 27, 20, skinId);
    dummy.render(ctx);
  }

  openMapModal() {
    const container = document.getElementById('map-board-container');
    container.innerHTML = '';

    const ladders = { 4: 14, 12: 22, 28: 37, 39: 48 };
    const snakes = { 19: 8, 33: 18, 44: 29, 49: 35 };

    for (let r = 10; r >= 1; r--) {
      const rowDiv = document.createElement('div');
      rowDiv.className = `map-row ${(r % 2 === 0) ? 'reverse' : ''}`;

      const startLvl = (r - 1) * 5 + 1;
      const endLvl = r * 5;

      for (let lvlId = startLvl; lvlId <= endLvl; lvlId++) {
        const node = document.createElement('div');
        const isUnlocked = window.progress.isLevelUnlocked(lvlId);
        const isCurrent = lvlId === this.currentLevelIndex;
        const stars = window.progress.getLevelStars(lvlId);

        node.className = `map-node ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;
        node.id = `map-node-${lvlId}`;

        let starsStr = stars > 0 ? '★'.repeat(stars) : '';
        let badge = '';
        if (ladders[lvlId]) badge = `<span class="map-badge">🪜</span>`;
        if (snakes[lvlId]) badge = `<span class="map-badge">🐍</span>`;

        node.innerHTML = `${badge}<span>${lvlId}</span><span class="node-stars">${starsStr}</span>`;

        if (isUnlocked) {
          node.addEventListener('click', () => {
            window.audio.playClick();
            this.closeModals();
            this.loadLevel(lvlId);
          });
        }
        rowDiv.appendChild(node);
      }
      container.appendChild(rowDiv);
    }

    document.getElementById('modal-map').classList.add('active');
    setTimeout(() => {
      const currentEl = document.getElementById(`map-node-${this.currentLevelIndex}`);
      if (currentEl) currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }

  openSettingsModal() {
    document.getElementById('modal-settings').classList.add('active');
  }

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  openGuideModal(tabId = 'guide-tab-controls') {
    if (window.audio) window.audio.playClick();
    const modal = document.getElementById('modal-guide');
    if (modal) {
      modal.classList.add('active');
      this.switchGuideTab(tabId);
    }
  }

  switchGuideTab(tabId) {
    const tabBtns = document.querySelectorAll('.guide-tab-btn');
    const tabPanes = document.querySelectorAll('.guide-tab-pane');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });
  }

  // --- RULE 4: AUTHENTIC RAINY KACHA STREET CANVAS RENDERING (Clean Carrom Pool View) ---
  // --- RULE 4: AUTHENTIC RAINY KACHA STREET CANVAS RENDERING (Universal Fullscreen View) ---
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // PASS 1: Full-Screen Earthy Sand & Mud Ground (fills 100% of display, zero black bars)
    this.renderKachaGround(ctx, w, h);

    // PASS 2: Centered Game Arena with Camera Scaling
    ctx.save();
    ctx.translate(this.cameraOffsetX, this.cameraOffsetY);
    ctx.scale(this.cameraScale, this.cameraScale);

    // Rainy Water Puddles (Glossy & Reflective)
    this.renderRainyPuddles(ctx);

    // Hand-Scraped Dusty Chalk Ring & Boundary
    this.renderHandScrapedRing(ctx, this.arenaWidth, this.arenaHeight);

    // Fallen Neem Leaves
    this.renderNeemLeaves(ctx);

    // Broken Red Clay Bricks (Laal Eent) & River Pebbles
    this.renderMohallaObstacles(ctx);

    // Gucchu (Dirt Pit)
    for (const hole of this.holes) {
      ctx.save();
      // Raised uneven mud lip around pit
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, hole.radius + 5, 0, Math.PI * 2);
      ctx.fillStyle = '#614125';
      ctx.fill();

      // Deep dark mud hole
      const holeGrad = ctx.createRadialGradient(hole.x, hole.y, 2, hole.x, hole.y, hole.radius);
      holeGrad.addColorStop(0, '#0A0603');
      holeGrad.addColorStop(0.8, '#1A1009');
      holeGrad.addColorStop(1, '#3E2512');
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
      ctx.fillStyle = holeGrad;
      ctx.fill();
      ctx.restore();
    }

    // Marbles
    for (const m of this.marbles) {
      m.render(ctx);
    }

    // Water Splash & Dust Particles
    this.physics.particles.render(ctx);

    // 💡 Level 1 Guided Animated Onboarding Tutorial (Pulsing Arrows)
    if (this.showLevel1Tutorial && this.striker && this.state === 'AIMING') {
      this.renderLevel1TutorialGuide(ctx);
    }

    // 💡 Golden Aim Path (if Bulb activated)
    if (this.activeGoldenHint && this.striker && this.state === 'AIMING') {
      this.renderGoldenHintGuide(ctx);
    }

    // Player Slingshot Aim Guide
    if (this.isDragging && this.striker && this.state === 'AIMING') {
      this.renderAimGuide(ctx);
    }

    ctx.restore();
  }

  // Textured Kacha Ground with dry sand and darker wet mud patches (Fast GPU blit)
  renderKachaGround(ctx, w, h) {
    if (this.groundCanvas && this.groundCanvas.width === w && this.groundCanvas.height === h) {
      ctx.drawImage(this.groundCanvas, 0, 0);
    } else {
      this.cacheGroundCanvas();
      if (this.groundCanvas) ctx.drawImage(this.groundCanvas, 0, 0);
    }
  }

  // Level 1 Animated Guidance (Pulsing arrows, target highlights, pull back preview)
  renderLevel1TutorialGuide(ctx) {
    if (!this.striker) return;
    const now = performance.now();
    const pulse = Math.sin(now * 0.005);
    const bounceOffset = Math.sin(now * 0.006) * 12;

    ctx.save();

    // 1. Target Area Highlight (Pulsing ring around chalk circle)
    if (this.ring) {
      ctx.beginPath();
      ctx.arc(this.ring.x, this.ring.y, this.ring.radius + 6 + pulse * 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(242, 186, 73, 0.7)';
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.setLineDash([]);

      // Target Label
      ctx.fillStyle = 'rgba(22, 16, 11, 0.9)';
      const labelW = 210;
      const labelH = 26;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(this.ring.x - labelW / 2, this.ring.y - this.ring.radius - 36, labelW, labelH, 13);
      } else {
        ctx.rect(this.ring.x - labelW / 2, this.ring.y - this.ring.radius - 36, labelW, labelH);
      }
      ctx.fill();
      ctx.strokeStyle = '#F2BA49';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#FFE082';
      ctx.font = 'bold 11px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎯 TARGET: Knock kanchas out!', this.ring.x, this.ring.y - this.ring.radius - 23);
    }

    // 2. Striker Halo
    ctx.beginPath();
    ctx.arc(this.striker.x, this.striker.y, this.striker.radius + 10 + pulse * 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(242, 186, 73, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Animated Pull-Back Guide Arrow
    const sx = this.striker.x;
    const sy = this.striker.y;
    const arrowLen = 50 + bounceOffset;
    const endY = sy + arrowLen;

    // Draw dashed drag vector
    ctx.beginPath();
    ctx.moveTo(sx, sy + 18);
    ctx.lineTo(sx, endY);
    ctx.strokeStyle = 'rgba(255, 220, 120, 0.85)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw arrowhead pointing down
    ctx.beginPath();
    ctx.moveTo(sx - 10, endY - 10);
    ctx.lineTo(sx, endY + 4);
    ctx.lineTo(sx + 10, endY - 10);
    ctx.fillStyle = '#F2BA49';
    ctx.fill();

    // Text Badge near pull-back arrow
    ctx.fillStyle = 'rgba(22, 16, 11, 0.92)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(sx - 105, endY + 14, 210, 28, 14);
    } else {
      ctx.rect(sx - 105, endY + 14, 210, 28);
    }
    ctx.fill();
    ctx.strokeStyle = '#F2BA49';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👇 PULL BACK & RELEASE TO FLICK', sx, endY + 28);

    ctx.restore();
  }

  // Rainy water puddles with soft sky reflection and water rim
  renderRainyPuddles(ctx) {
    for (const pud of this.puddles) {
      ctx.save();
      // Wet dark mud outline (GPU radial gradient with soft alpha falloff)
      const mudGrad = ctx.createRadialGradient(pud.x, pud.y, pud.radius * 0.7, pud.x, pud.y, pud.radius + 6);
      mudGrad.addColorStop(0, 'rgba(55, 35, 18, 0.85)');
      mudGrad.addColorStop(0.75, 'rgba(55, 35, 18, 0.45)');
      mudGrad.addColorStop(1, 'rgba(55, 35, 18, 0)');
      ctx.beginPath();
      ctx.ellipse(pud.x, pud.y, pud.radius + 6, pud.radius * 0.72 + 5, 0.15, 0, Math.PI * 2);
      ctx.fillStyle = mudGrad;
      ctx.fill();

      // Glossy water surface reflecting ambient sky
      ctx.beginPath();
      ctx.ellipse(pud.x, pud.y, pud.radius, pud.radius * 0.72, 0.15, 0, Math.PI * 2);
      const waterGrad = ctx.createRadialGradient(pud.x - 10, pud.y - 8, 2, pud.x, pud.y, pud.radius);
      waterGrad.addColorStop(0, 'rgba(165, 200, 220, 0.45)');
      waterGrad.addColorStop(0.5, 'rgba(80, 110, 130, 0.6)');
      waterGrad.addColorStop(1, 'rgba(45, 30, 15, 0.85)');
      ctx.fillStyle = waterGrad;
      ctx.fill();

      // Subtle water ripple reflection rim
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Hand-scraped dusty chalk circle
  renderHandScrapedRing(ctx, w, h) {
    ctx.save();

    if (this.ring) {
      // Rough chalk stroke
      ctx.beginPath();
      ctx.arc(this.ring.x, this.ring.y, this.ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 240, 230, 0.68)';
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 4, 8, 6, 22, 5]);
      ctx.stroke();

      // Powdery chalk scatter
      ctx.beginPath();
      ctx.arc(this.ring.x, this.ring.y, this.ring.radius + 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 5;
      ctx.setLineDash([6, 12, 10, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Pari baseline (scraped with broken brick at bottom)
    ctx.beginPath();
    ctx.moveTo(40, 680);
    ctx.lineTo(w - 40, 680);
    ctx.strokeStyle = 'rgba(240, 235, 225, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.stroke();

    ctx.restore();
  }

  // Broken red clay bricks & river pebbles
  renderMohallaObstacles(ctx) {
    for (const obs of this.obstacles) {
      if (obs.type === 'rect') {
        // Broken Red Clay Brick (Laal Eent)
        ctx.save();
        // Brick shadow
        ctx.fillStyle = 'rgba(25, 15, 8, 0.4)';
        ctx.fillRect(obs.x + 3, obs.y + 4, obs.width, obs.height);

        // Brick body
        ctx.fillStyle = obs.color || '#B23A22';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Chipped terracotta texture highlights
        ctx.strokeStyle = '#D9583B';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        ctx.fillStyle = 'rgba(80, 20, 10, 0.3)';
        ctx.fillRect(obs.x + 4, obs.y + 3, obs.width * 0.35, obs.height - 6);
        ctx.restore();
      } else if (obs.type === 'circle') {
        // River Pebble
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(obs.x + 2, obs.y + 3, obs.radius, obs.radius * 0.75, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20, 12, 6, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        const pGrad = ctx.createRadialGradient(obs.x - 4, obs.y - 4, 2, obs.x, obs.y, obs.radius);
        pGrad.addColorStop(0, '#9E8B7A');
        pGrad.addColorStop(0.7, obs.color || '#6E5C4E');
        pGrad.addColorStop(1, '#3D2F24');
        ctx.fillStyle = pGrad;
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // Fallen dry neem leaves
  renderNeemLeaves(ctx) {
    for (const leaf of this.leaves) {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.angle);

      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.length, leaf.width, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#6E5B38'; // Dried leaf brown-green
      ctx.fill();

      // Leaf midrib line
      ctx.beginPath();
      ctx.moveTo(-leaf.length + 2, 0);
      ctx.lineTo(leaf.length - 2, 0);
      ctx.strokeStyle = '#4A3B22';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  // 💡 Golden Aim Path (Bulb Hint Guide) - Smart Direct & Cross Hit (Bank Shot)
  renderGoldenHintGuide(ctx) {
    const hint = this.activeGoldenHint;
    if (!hint || !this.striker || !hint.target) return;

    const sx = this.striker.x;
    const sy = this.striker.y;

    ctx.save();

    if (hint.isCrossHit && hint.bouncePoint) {
      // --- CROSS HIT (BANK SHOT) OFF CUSHION ---
      const bx = hint.bouncePoint.x;
      const by = hint.bouncePoint.y;
      const tx = hint.target.x;
      const ty = hint.target.y;

      // 1. Ray 1: Striker -> Cushion Bounce Point (Thick Golden Pulsing Ray)
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([10, 6]);
      ctx.stroke();

      // 2. Cushion Ricochet Impact Marker (Pulsing Diamond/Ring)
      const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.22;
      
      // Outer glow circle
      ctx.beginPath();
      ctx.arc(bx, by, 13 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
      ctx.fill();

      // Sharp cushion impact diamond
      ctx.beginPath();
      ctx.moveTo(bx, by - 11 * pulse);
      ctx.lineTo(bx + (bx < 240 ? 9 : -9) * pulse, by);
      ctx.lineTo(bx, by + 11 * pulse);
      ctx.lineTo(bx - (bx < 240 ? 9 : -9) * pulse, by);
      ctx.closePath();
      ctx.fillStyle = '#FF9800';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label on the cushion: "⚡ CROSS HIT"
      ctx.setLineDash([]);
      ctx.font = 'bold 11px Montserrat, sans-serif';
      ctx.fillStyle = '#FFE082';
      ctx.textAlign = bx < 240 ? 'left' : 'right';
      ctx.textBaseline = 'middle';
      const labelX = bx < 240 ? bx + 16 : bx - 16;
      ctx.fillText('⚡ CROSS HIT', labelX, by);

      // 3. Ray 2: Cushion Bounce Point -> Target Goti
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = 'rgba(255, 235, 120, 0.95)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 5]);
      ctx.stroke();

      // 4. Knockout Projector Vector beyond target
      const ang2 = Math.atan2(ty - by, tx - bx);
      const projX = tx + Math.cos(ang2) * 90;
      const projY = ty + Math.sin(ang2) * 90;

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(projX, projY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

    } else {
      // --- DIRECT LINE HIT ---
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(hint.target.x, hint.target.y);
      // Project knockout vector beyond the target
      const projX = hint.target.x + Math.cos(hint.angle) * 120;
      const projY = hint.target.y + Math.sin(hint.angle) * 120;
      ctx.lineTo(projX, projY);

      ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([10, 6]);
      ctx.stroke();
    }

    // Golden Halo & Target Lock around the intended marble
    ctx.setLineDash([]);
    const targetPulse = 1 + Math.sin(Date.now() * 0.007) * 0.2;
    ctx.beginPath();
    ctx.arc(hint.target.x, hint.target.y, (hint.target.radius + 7) * targetPulse, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Subtle target crosshair ticks
    const tr = (hint.target.radius + 7) * targetPulse;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.5;
    const ticks = [[-tr - 4, 0, -tr + 2, 0], [tr - 2, 0, tr + 4, 0], [0, -tr - 4, 0, -tr + 2], [0, tr - 2, 0, tr + 4]];
    for (const [x1, y1, x2, y2] of ticks) {
      ctx.beginPath();
      ctx.moveTo(hint.target.x + x1, hint.target.y + y1);
      ctx.lineTo(hint.target.x + x2, hint.target.y + y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Player Aim Guide
  renderAimGuide(ctx) {
    const sx = this.striker.x;
    const sy = this.striker.y;
    const cx = this.dragCurrent.x;
    const cy = this.dragCurrent.y;

    const dx = sx - cx;
    const dy = sy - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < 5) return;

    const power = Math.min(dist, this.maxDragDist);
    const powerRatio = power / this.maxDragDist;
    const angle = Math.atan2(dy, dx);

    ctx.save();

    // Pull-back rubber band
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Minimal trajectory dots
    const numDots = 10;
    for (let i = 1; i <= numDots; i++) {
      const px = sx + Math.cos(angle) * (i * 20);
      const py = sy + Math.sin(angle) * (i * 20);

      ctx.beginPath();
      ctx.arc(px, py, Math.max(1.5, 3.5 - i * 0.18), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${1 - i / numDots * 0.8})`;
      ctx.fill();
    }

    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new KanchaGame();
});
