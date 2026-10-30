// audio.js - High-Fidelity Mobile-Optimized Acoustic Soundscape & Real Kancha SFX
// Specifically Engineered for Smartphone Speakers & Mobile Browsers:
// 1. Instant Mobile Touch-Unlock (Full Web Audio context resumption on touch/click)
// 2. Realistic Indian Street Marble Acoustics (Crisp glass collision transient + resonant ring)
// 3. Phone Speaker Protection (110Hz Sub-Bass High-Pass Filter + 6800Hz Anti-Piercing Filter)
// 4. Studio Limiter Dynamics Compressor (Zero digital distortion / zero speaker break)
// 5. Rock-Solid Background Lifecycle (Pauses ONLY on app minimize/switch, no false blurs on touch)

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.highpassFilter = null;
    this.lowpassFilter = null;
    this.compressor = null;
    this.sfxGain = null;
    this.musicGain = null;

    // Mobile-optimized default volume staging (Clear, audible, with generous headroom)
    this.masterVolume = 0.75;
    this.userSFXLevel = 0.80;
    this.userMusicLevel = 0.60;
    this.internalSFXGain = 0.65;
    this.internalMusicGain = 0.30;
    this.isMuted = false;
    this.initialized = false;

    this.isPlayingMusic = false;
    this.isAppBackgrounded = false;
    this.wasPlayingBeforeBackground = false;
    this.musicTimer = null;
    this.step = 0;
  }

  get ambienceVolume() {
    return this.userMusicLevel;
  }

  set ambienceVolume(val) {
    this.setAmbienceVolume(val);
  }

  get sfxVolume() {
    return this.userSFXLevel;
  }

  set sfxVolume(val) {
    this.setSFXVolume(val);
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // 1. Phone Speaker Rumble Protection: High-Pass Filter @ 110Hz
      // Cuts out inaudible sub-100Hz rumble that causes small phone speaker diaphragms to buzz or rattle.
      this.highpassFilter = this.ctx.createBiquadFilter();
      this.highpassFilter.type = 'highpass';
      this.highpassFilter.frequency.setValueAtTime(110, this.ctx.currentTime);
      this.highpassFilter.Q.setValueAtTime(0.707, this.ctx.currentTime);

      // 2. Anti-Harshness Acoustic Warmth: Low-Pass Filter @ 6800Hz
      // Eliminates harsh digital screeching while preserving crisp, authentic glass marble clinks.
      this.lowpassFilter = this.ctx.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      this.lowpassFilter.frequency.setValueAtTime(6800, this.ctx.currentTime);
      this.lowpassFilter.Q.setValueAtTime(0.707, this.ctx.currentTime);

      // 3. Studio Dynamics Compressor (Transparent Limiter)
      // Prevents clipping or speaker distortion even during multi-marble chain collisions.
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-6, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      // 4. Master Gain Bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      // 5. Dedicated Sub-Buses
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.sfxGain.gain.setValueAtTime(this.internalSFXGain, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(this.internalMusicGain, this.ctx.currentTime);

      // Audio Routing Pipeline:
      // [sfxGain, musicGain] -> masterGain -> highpassFilter (110Hz) -> lowpassFilter (6800Hz) -> compressor -> destination
      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);

      this.masterGain.connect(this.highpassFilter);
      this.highpassFilter.connect(this.lowpassFilter);
      this.lowpassFilter.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API initialization error:", e);
    }
  }

  // Robust Mobile Audio Unlocker
  ensureContext(onReady) {
    if (!this.initialized) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended' && !this.isAppBackgrounded) {
      this.ctx.resume().then(() => {
        // Play silent 1-sample buffer to forcefully wake up mobile audio pump (iOS/Android)
        try {
          const silentBuf = this.ctx.createBuffer(1, 1, 22050);
          const src = this.ctx.createBufferSource();
          src.buffer = silentBuf;
          src.connect(this.ctx.destination);
          src.start(0);
        } catch (err) {}
        if (onReady) onReady();
      }).catch(e => console.warn("Audio resume error", e));
    } else if (onReady) {
      onReady();
    }
  }

  // --- LIFECYCLE MANAGEMENT (Stops audio when switching out to other apps) ---

  onAppPause() {
    this.isAppBackgrounded = true;
    if (this.isPlayingMusic) {
      this.wasPlayingBeforeBackground = true;
    }
    this.stopBackgroundMusic();

    // Immediately suspend Web Audio hardware stream to free up phone speaker & save battery
    if (this.ctx && this.ctx.state === 'running') {
      try {
        this.ctx.suspend().catch(() => {});
      } catch (e) {}
    }
  }

  onAppResume() {
    this.isAppBackgrounded = false;
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        if (this.wasPlayingBeforeBackground && !this.isMuted) {
          this.startBackgroundMusic();
        }
      }).catch(() => {});
    } else if (this.wasPlayingBeforeBackground && !this.isMuted) {
      this.startBackgroundMusic();
    }
  }

  setSFXVolume(val) {
    const raw = Math.max(0, Math.min(1, val));
    this.userSFXLevel = raw;
    this.internalSFXGain = raw * 0.70;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.internalSFXGain, this.ctx.currentTime, 0.05);
    }
  }

  setAmbienceVolume(val) {
    const raw = Math.max(0, Math.min(1, val));
    this.userMusicLevel = raw;
    this.internalMusicGain = raw * 0.35;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.internalMusicGain, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
    }
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else if (!this.isAppBackgrounded) {
      this.startBackgroundMusic();
    }
    return this.isMuted;
  }

  // --- CALMING, TRANQUIL LIGHT-THEME MUSIC (Soft Bansuri Flute & Acoustic Chimes) ---
  // Slow, meditative, unhurried tempo (52 BPM, 0.58s per step, spacious 16-step cycle)
  startBackgroundMusic() {
    if (this.isMuted || this.isAppBackgrounded) return;
    this.ensureContext(() => {
      if (this.isPlayingMusic || !this.ctx || this.isMuted || this.isAppBackgrounded) return;
      this.isPlayingMusic = true;
      this._runMusicLoop();
    });
  }

  _runMusicLoop() {
    if (!this.isPlayingMusic || !this.ctx || this.isAppBackgrounded || this.isMuted) return;

    // Peaceful Indian Pentatonic Raag Bhupali Scale (in Hz)
    const notes = [
      261.63, // 0: C4 (Sa)
      293.66, // 1: D4 (Re)
      329.63, // 2: E4 (Ga)
      392.00, // 3: G4 (Pa)
      440.00, // 4: A4 (Dha)
      523.25, // 5: C5 (High Sa)
      587.33, // 6: D5 (High Re)
      659.25  // 7: E5 (High Ga)
    ];

    // Spacious, unhurried melody: plenty of silence between notes
    const melodyScore = [
      0, -1, 2, -1,   // Bar 1: Sa ... Ga ...
      3, -1, 4, -1,   // Bar 2: Pa ... Dha ...
      5, -1, 4, -1,   // Bar 3: High Sa ... Dha ...
      3, -1, 2, -1    // Bar 4: Pa ... Ga ...
    ];

    const stepTime = 0.58; // 52 BPM

    const loopStep = () => {
      if (!this.isPlayingMusic || !this.ctx || this.isAppBackgrounded || this.isMuted) return;
      const t = this.ctx.currentTime;
      const currentStep = this.step % 16;
      const noteIdx = melodyScore[currentStep];

      if (noteIdx >= 0) {
        const freq = notes[noteIdx];

        // 1. Soft Warm Acoustic Bansuri / Flute Sine with 2nd Harmonic
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        // Subtle overtone for warm breathy flute timber
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, t);

        // Velvet-soft envelope: gentle fade-in (no pop/click) and smooth natural decay
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(t);
        osc2.start(t);
        osc.stop(t + 1.25);
        osc2.stop(t + 1.25);

        // 2. Sparkling Acoustic Bell / Chime on key bars
        if (currentStep === 0 || currentStep === 8) {
          const oscChime = this.ctx.createOscillator();
          const gainChime = this.ctx.createGain();
          const filterChime = this.ctx.createBiquadFilter();

          oscChime.type = 'sine';
          oscChime.frequency.setValueAtTime(freq * 2, t);

          filterChime.type = 'lowpass';
          filterChime.frequency.setValueAtTime(2600, t);

          gainChime.gain.setValueAtTime(0.0001, t);
          gainChime.gain.linearRampToValueAtTime(0.09, t + 0.03);
          gainChime.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

          oscChime.connect(filterChime);
          filterChime.connect(gainChime);
          gainChime.connect(this.musicGain);

          oscChime.start(t);
          oscChime.stop(t + 0.95);
        }
      }

      this.step++;
      this.musicTimer = setTimeout(loopStep, stepTime * 1000);
    };

    loopStep();
  }

  stopBackgroundMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  // --- AUTHENTIC, CRISP SOUND EFFECTS FOR MOBILE PHONES ---

  // 1. Realistic Polished Glass Marble Collision ("TUCK!" / "CLINK!")
  // Combines a high-frequency transient impact click + resonant crystal body ring
  playGlassClink(intensity = 1.0) {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const clampedIntensity = Math.min(Math.max(intensity, 0.2), 2.5);

    // Natural random pitch variation (+/- 60 Hz) so each marble hit sounds unique
    const detune = (Math.random() * 120 - 60);
    const baseFreq = 1850 + detune + (clampedIntensity * 80);

    // Part A: Instantaneous Contact Transient ("Click" / "Snap")
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    const clickFilter = this.ctx.createBiquadFilter();

    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(3200 + detune, t);
    clickOsc.frequency.exponentialRampToValueAtTime(1400, t + 0.018);

    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(2800, t);
    clickFilter.Q.setValueAtTime(1.8, t);

    const clickPeak = Math.min(0.42, 0.22 * clampedIntensity);
    clickGain.gain.setValueAtTime(0.001, t);
    clickGain.gain.linearRampToValueAtTime(clickPeak, t + 0.002);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.sfxGain);

    clickOsc.start(t);
    clickOsc.stop(t + 0.03);

    // Part B: Pure Glass Body Ring (The authentic marble chime)
    const ringOsc = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();
    const ringFilter = this.ctx.createBiquadFilter();

    ringOsc.type = 'sine';
    ringOsc.frequency.setValueAtTime(baseFreq, t);

    ringFilter.type = 'lowpass';
    ringFilter.frequency.setValueAtTime(3800, t);

    const ringPeak = Math.min(0.38, 0.20 * clampedIntensity);
    ringGain.gain.setValueAtTime(0.001, t);
    ringGain.gain.linearRampToValueAtTime(ringPeak, t + 0.003);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);

    ringOsc.connect(ringFilter);
    ringFilter.connect(ringGain);
    ringGain.connect(this.sfxGain);

    ringOsc.start(t);
    ringOsc.stop(t + 0.08);

    // Part C: Delicate High Glass Shimmer
    const highOsc = this.ctx.createOscillator();
    const highGain = this.ctx.createGain();

    highOsc.type = 'sine';
    highOsc.frequency.setValueAtTime(baseFreq * 1.45, t);

    const highPeak = Math.min(0.18, 0.09 * clampedIntensity);
    highGain.gain.setValueAtTime(0.001, t);
    highGain.gain.linearRampToValueAtTime(highPeak, t + 0.002);
    highGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

    highOsc.connect(highGain);
    highGain.connect(this.sfxGain);

    highOsc.start(t);
    highOsc.stop(t + 0.05);
  }

  // 2. Punchy Finger Flick (Authentic thumb-and-finger release snap)
  playFlickSound(power = 1.0) {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const clamped = Math.min(Math.max(power, 0.3), 1.5);

    // Deep thumb thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280 + clamped * 40, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.05);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.32 * clamped, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.065);

    // Crisp nail slip snap
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1100, t);
    snapOsc.frequency.exponentialRampToValueAtTime(300, t + 0.02);

    snapGain.gain.setValueAtTime(0.001, t);
    snapGain.gain.linearRampToValueAtTime(0.18 * clamped, t + 0.002);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

    snapOsc.connect(snapGain);
    snapGain.connect(this.sfxGain);
    snapOsc.start(t);
    snapOsc.stop(t + 0.03);
  }

  // 3. Relaxing Water Droplet Ripple
  playSplashSound() {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.06);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.10);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  // 4. Solid Terracotta Brick / River Stone Thud
  playObstacleHit(intensity = 1.0) {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.07);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(Math.min(0.35, intensity * 0.22), t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.085);
  }

  // 5. Gucchu Clay Pit Sink (Hollow clay drop)
  playHoleDrop() {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.14);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  // 6. Celebratory Victory Fanfare Chimes
  playWinJingle() {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Ascending celebratory pentatonic chime chords (C5, E5, G5, A5, C6)
    const notes = [523.25, 659.25, 783.99, 880.00, 1046.50];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = t + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.60);
    });
  }

  // 7. Gentle, Encouraging Level End Tone
  playLoseSound() {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.32);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.37);
  }

  // 8. Sparkling Soft Hint Chime
  playHintSound() {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [659.25, 987.77]; // E5, B5
    const t = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const startTime = t + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  }

  // 9. Tactile Wooden Button Click (Velvet-soft bubble tap)
  playClick() {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.035);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.20, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  // 10. Soft Kalimba Card Hover
  playCardHover() {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440.00, t); // A4
    osc.frequency.exponentialRampToValueAtTime(523.25, t + 0.05);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.16, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // 11. Warm Mode Selection Chord
  playCardSelect() {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [329.63, 392.00, 523.25]; // E4, G4, C5
    const t = this.ctx.currentTime;

    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.03);

      gain.gain.setValueAtTime(0.001, t + i * 0.03);
      gain.gain.linearRampToValueAtTime(0.22, t + i * 0.03 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.03 + 0.26);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.03);
      osc.stop(t + i * 0.03 + 0.29);
    });
  }

  // 12. Gentle Stage Entrance Chime
  playStageIntro() {
    if (this.isAppBackgrounded || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25];
    const t = this.ctx.currentTime;

    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.05);

      gain.gain.setValueAtTime(0.001, t + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.20, t + i * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.05 + 0.30);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.32);
    });
  }
}

window.audio = new AudioManager();

// Global Lifecycle Watchers: Pauses audio ONLY when app is minimized or switched away
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (window.audio) window.audio.onAppPause();
  } else {
    if (window.audio) window.audio.onAppResume();
  }
});

window.addEventListener('pagehide', () => {
  if (window.audio) window.audio.onAppPause();
});

// Auto-unlock Web Audio on user interaction (Only if not backgrounded and not muted)
const autoUnlockAudio = () => {
  if (window.audio && !window.audio.isAppBackgrounded && !window.audio.isMuted) {
    window.audio.ensureContext(() => {
      if (!window.audio.isPlayingMusic && !window.audio.isAppBackgrounded && !window.audio.isMuted) {
        window.audio.startBackgroundMusic();
      }
    });
  }
};

['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'].forEach(evt => {
  window.addEventListener(evt, autoUnlockAudio, { passive: true, capture: true });
});
