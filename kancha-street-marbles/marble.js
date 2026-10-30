// marble.js - Two-Tier Carrom-Style Strikers with Power, Grip, and Rebound Stats

const STRIKER_ROSTER = {
  // --- TIER 1: GALLI STRIKERS (Coins) ---
  classic_banta: {
    id: 'classic_banta',
    tier: 'galli',
    name: 'Classic Banta (Green)',
    priceType: 'coins',
    price: 0,
    stats: { power: 60, grip: 50, rebound: 70 }, // Stats 0 - 100
    baseColor: 'rgba(34, 139, 34, 0.75)',
    swirlColor1: '#FFD700',
    swirlColor2: '#FF3D00',
    specular: '#FFFFFF',
    glow: 'rgba(76, 175, 80, 0.4)',
    mass: 1.0,
    gripFactor: 0.88, // Normal mud/puddle drag
    bounce: 0.90,
    desc: 'The iconic soda-bottle green marble of every mohalla street.'
  },
  doodhia: {
    id: 'doodhia',
    tier: 'galli',
    name: 'Doodhia (Milky White)',
    priceType: 'coins',
    price: 60,
    stats: { power: 55, grip: 65, rebound: 65 },
    baseColor: 'rgba(245, 245, 250, 0.95)',
    swirlColor1: '#E91E63',
    swirlColor2: '#3F51B5',
    specular: '#FFFFFF',
    glow: 'rgba(255, 255, 255, 0.3)',
    mass: 0.95,
    gripFactor: 0.91,
    bounce: 0.88,
    desc: 'Porcelain-smooth surface that glides softly across wet sand.'
  },
  cats_eye: {
    id: 'cats_eye',
    tier: 'galli',
    name: "Billi Ki Aankh (Cat's Eye)",
    priceType: 'coins',
    price: 120,
    stats: { power: 70, grip: 60, rebound: 82 },
    baseColor: 'rgba(225, 245, 255, 0.7)',
    swirlColor1: '#00E5FF',
    swirlColor2: '#FF1744',
    specular: '#FFFFFF',
    glow: 'rgba(0, 229, 255, 0.4)',
    mass: 1.1,
    gripFactor: 0.90,
    bounce: 0.93,
    desc: 'Crystal clear glass with triple ribbon core for sharp bank shots.'
  },
  lal_angaar: {
    id: 'lal_angaar',
    tier: 'galli',
    name: 'Lal Angaar (Fire Ruby)',
    priceType: 'coins',
    price: 250,
    stats: { power: 85, grip: 55, rebound: 75 },
    baseColor: 'rgba(180, 20, 20, 0.82)',
    swirlColor1: '#FFA000',
    swirlColor2: '#FFEB3B',
    specular: '#FFE082',
    glow: 'rgba(255, 87, 34, 0.5)',
    mass: 1.25,
    gripFactor: 0.89,
    bounce: 0.91,
    desc: 'Heavy molten striker that smashes clusters with pure force.'
  },

  // --- TIER 2: PRO STRIKERS (Premium / Real Money ₹) ---
  neelam: {
    id: 'neelam',
    tier: 'pro',
    name: 'Neelam (Royal Sapphire)',
    priceType: 'real',
    priceDisplay: '₹29',
    stats: { power: 75, grip: 70, rebound: 95 },
    baseColor: 'rgba(13, 71, 161, 0.85)',
    swirlColor1: '#00E676',
    swirlColor2: '#40C4FF',
    specular: '#E1F5FE',
    glow: 'rgba(33, 150, 243, 0.5)',
    mass: 1.18,
    gripFactor: 0.93,
    bounce: 0.96,
    desc: 'Precision engineered royal crystal. Master of long-distance ricochets.'
  },
  kohinoor: {
    id: 'kohinoor',
    tier: 'pro',
    name: 'Kohinoor (Diamond Glass)',
    priceType: 'real',
    priceDisplay: '₹49',
    stats: { power: 80, grip: 95, rebound: 85 },
    baseColor: 'rgba(240, 255, 255, 0.85)',
    swirlColor1: '#B388FF',
    swirlColor2: '#00E5FF',
    specular: '#FFFFFF',
    glow: 'rgba(179, 136, 255, 0.5)',
    mass: 1.2,
    gripFactor: 0.98, // Immune to puddle slowdown!
    bounce: 0.92,
    desc: 'Hydro-tread diamond glass. Slices through rainwater puddles with zero drag!'
  },
  maharaja_gold: {
    id: 'maharaja_gold',
    tier: 'pro',
    name: 'Sunehra Maharaja (Pure Gold)',
    priceType: 'real',
    priceDisplay: '₹99',
    stats: { power: 98, grip: 80, rebound: 90 },
    baseColor: 'rgba(218, 165, 32, 0.92)',
    swirlColor1: '#FFF8E1',
    swirlColor2: '#FF8F00',
    specular: '#FFFFFF',
    glow: 'rgba(255, 215, 0, 0.65)',
    mass: 1.45, // Heavy knockout power
    gripFactor: 0.95,
    bounce: 0.94,
    desc: 'The Grand Champion striker. Maximum weight to knock target marbles out instantly.'
  }
};

class Marble {
  constructor(x, y, radius = 18, skinId = 'classic_banta', options = {}) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = 0;
    this.vy = 0;
    this.rotation = Math.random() * Math.PI * 2;
    this.skinId = skinId;
    this.skin = STRIKER_ROSTER[skinId] || STRIKER_ROSTER.classic_banta;

    this.isStriker = options.isStriker || false;
    this.isTarget = options.isTarget !== undefined ? options.isTarget : !this.isStriker;
    this.isGolden = options.isGolden || false;
    this.isPenalty = options.isPenalty || false;

    this.mass = options.mass || (this.skin.mass * (radius / 18));
    this.bounce = options.bounce || this.skin.bounce;
    this.gripFactor = this.skin.gripFactor || 0.88;

    this.active = true;
    this.inHole = false;
    this.holeScale = 1.0;
    this.isKnockedOut = false;
  }

  setSkin(skinId) {
    if (STRIKER_ROSTER[skinId]) {
      this.skinId = skinId;
      this.skin = STRIKER_ROSTER[skinId];
      this.mass = this.skin.mass * (this.radius / 18);
      this.bounce = this.skin.bounce;
      this.gripFactor = this.skin.gripFactor || 0.88;
    }
  }

  update(dt, friction = 0.985) {
    if (!this.active) return;

    if (this.inHole) {
      this.holeScale = Math.max(0, this.holeScale - 0.05);
      this.vx *= 0.8;
      this.vy *= 0.8;
      if (this.holeScale <= 0.05) this.active = false;
      return;
    }

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    this.vx *= friction;
    this.vy *= friction;

    if (Math.abs(this.vx) < 0.02) this.vx = 0;
    if (Math.abs(this.vy) < 0.02) this.vy = 0;

    const speed = Math.hypot(this.vx, this.vy);
    this.rotation += speed * 0.08;
  }

  getSpeed() {
    return Math.hypot(this.vx, this.vy);
  }

  isStopped() {
    return this.getSpeed() < 0.05;
  }

  render(ctx) {
    if (!this.active) return;

    const r = this.radius * this.holeScale;
    if (r <= 0.5) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // 1. Natural Dirt Shadow (Hardware-accelerated GPU radial gradient)
    const shadowGrad = ctx.createRadialGradient(r * 0.2, r * 0.35, 0, r * 0.2, r * 0.35, r * 0.95);
    shadowGrad.addColorStop(0, 'rgba(28, 16, 8, 0.45)');
    shadowGrad.addColorStop(0.65, 'rgba(28, 16, 8, 0.22)');
    shadowGrad.addColorStop(1, 'rgba(28, 16, 8, 0)');
    ctx.beginPath();
    ctx.ellipse(r * 0.2, r * 0.35, r * 0.95, r * 0.55, Math.PI / 10, 0, Math.PI * 2);
    ctx.fillStyle = shadowGrad;
    ctx.fill();

    // 2. Striker Subtle Indicator
    if (this.isStriker) {
      ctx.beginPath();
      ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (this.isGolden) {
      ctx.beginPath();
      ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    } else if (this.isPenalty) {
      ctx.beginPath();
      ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(220, 50, 50, 0.8)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // 3. Glass Sphere Body
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    grad.addColorStop(0, this.isGolden ? '#FFF59D' : (this.isPenalty ? '#2A2A2A' : '#FFFFFF'));
    grad.addColorStop(0.35, this.isPenalty ? '#151515' : this.skin.baseColor);
    grad.addColorStop(0.85, this.isPenalty ? '#000000' : this.darken(this.skin.baseColor, 0.45));
    grad.addColorStop(1.0, 'rgba(15, 10, 5, 0.85)');

    ctx.fillStyle = grad;
    ctx.fill();

    // 4. Internal Swirl Ribbons (Rolling rotation)
    ctx.save();
    ctx.rotate(this.rotation);

    ctx.beginPath();
    ctx.moveTo(-r * 0.75, -r * 0.15);
    ctx.bezierCurveTo(-r * 0.3, -r * 0.7, r * 0.3, r * 0.65, r * 0.75, r * 0.15);
    ctx.bezierCurveTo(r * 0.4, r * 0.3, -r * 0.4, -r * 0.3, -r * 0.75, -r * 0.15);
    ctx.fillStyle = this.isGolden ? '#FFB300' : (this.isPenalty ? '#E53935' : this.skin.swirlColor1);
    ctx.globalAlpha = 0.85;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-r * 0.55, r * 0.45);
    ctx.bezierCurveTo(-r * 0.1, r * 0.1, r * 0.2, -r * 0.5, r * 0.65, -r * 0.35);
    ctx.bezierCurveTo(r * 0.3, -r * 0.1, -r * 0.2, r * 0.3, -r * 0.55, r * 0.45);
    ctx.fillStyle = this.isGolden ? '#FF8F00' : (this.isPenalty ? '#FF5252' : this.skin.swirlColor2);
    ctx.globalAlpha = 0.75;
    ctx.fill();

    ctx.restore();

    // 5. Specular Highlights
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.38, r * 0.36, r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(r * 0.25, r * 0.3, r * 0.28, r * 0.1, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fill();

    ctx.restore();
  }

  darken(colorStr, factor) {
    if (colorStr.startsWith('rgba')) {
      return colorStr.replace(/rgba\((\d+),\s*(\d+),\s*(\d+)/, (m, r, g, b) => {
        return `rgba(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)}`;
      });
    }
    return 'rgba(20, 15, 10, 0.7)';
  }
}
