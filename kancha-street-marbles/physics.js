// physics.js - 2D Physics, Water Puddle Hydro-Drag, Water Splash Particles & Obstacle Collisions

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // Dust puff on dry sand
  emitDust(x, y, count = 8, color = 'rgba(215, 185, 145, 0.7)', speedRange = 2.4) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * speedRange + 0.4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1.5,
        alpha: 0.75,
        decay: Math.random() * 0.03 + 0.02,
        color
      });
    }
  }

  // Water splash droplets when a kancha rolls through a rainy puddle
  emitSplash(x, y, count = 7) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.8 + 0.8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0, // slight upward spray
        radius: Math.random() * 2.2 + 1.2,
        alpha: 0.85,
        decay: Math.random() * 0.04 + 0.03,
        color: 'rgba(210, 240, 255, 0.8)'
      });
    }
  }

  // Crystalline glass sparks on high-velocity strike
  emitSparks(x, y, count = 6, color = '#FFFFFF') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.8 + 1.2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 1.8 + 0.8,
        alpha: 1.0,
        decay: Math.random() * 0.06 + 0.04,
        color
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.alpha -= p.decay * dt * 60;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }
  }

  render(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fill();
    }
    ctx.restore();
  }
}

class PhysicsEngine {
  constructor() {
    this.particles = new ParticleSystem();
    this.baseFriction = 0.984; // Dry sand friction
  }

  update(marbles, obstacles, holes, puddles, bounds, dt = 1/60) {
    this.particles.update(dt);

    // 1. Terrain Effects (Rainy Water Puddles & Holes)
    for (const m of marbles) {
      if (!m.active || m.inHole) continue;

      let friction = this.baseFriction;

      // Check Rainy Water Puddles (Hydro-Drag & Water Splash)
      for (const pud of puddles) {
        const dx = m.x - pud.x;
        const dy = m.y - pud.y;
        if (Math.hypot(dx, dy) < pud.radius + m.radius) {
          // Striker's grip factor reduces puddle drag
          friction = Math.min(friction, m.gripFactor || 0.89);

          if (m.getSpeed() > 1.2 && Math.random() > 0.6) {
            this.particles.emitSplash(m.x, m.y, 2);
            if (window.audio && Math.random() > 0.8) {
              window.audio.playSplashSound();
            }
          }
        }
      }

      m.update(dt, friction);

      // Check Gucchu / Dirt Hole Capture
      for (const h of holes) {
        const dist = Math.hypot(m.x - h.x, m.y - h.y);
        if (dist < h.radius * 0.8) {
          m.vx += (h.x - m.x) * 0.16;
          m.vy += (h.y - m.y) * 0.16;
          if (dist < h.radius * 0.35 && m.getSpeed() < 4) {
            m.inHole = true;
            m.vx = 0;
            m.vy = 0;
            if (window.audio) window.audio.playHoleDrop();
          }
        }
      }

      // Boundary Rebound
      if (bounds) {
        if (m.x - m.radius < bounds.left) {
          m.x = bounds.left + m.radius;
          m.vx = -m.vx * m.bounce;
          this.triggerBounce(m, Math.abs(m.vx));
        } else if (m.x + m.radius > bounds.right) {
          m.x = bounds.right - m.radius;
          m.vx = -m.vx * m.bounce;
          this.triggerBounce(m, Math.abs(m.vx));
        }

        if (m.y - m.radius < bounds.top) {
          m.y = bounds.top + m.radius;
          m.vy = -m.vy * m.bounce;
          this.triggerBounce(m, Math.abs(m.vy));
        } else if (m.y + m.radius > bounds.bottom) {
          m.y = bounds.bottom - m.radius;
          m.vy = -m.vy * m.bounce;
          this.triggerBounce(m, Math.abs(m.vy));
        }
      }
    }

    // 2. Marble-to-Marble Collisions (Conservation of Momentum)
    for (let i = 0; i < marbles.length; i++) {
      for (let j = i + 1; j < marbles.length; j++) {
        const m1 = marbles[i];
        const m2 = marbles[j];
        if (!m1.active || !m2.active || m1.inHole || m2.inHole) continue;

        const dx = m2.x - m1.x;
        const dy = m2.y - m1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = m1.radius + m2.radius;

        if (dist < minDist && dist > 0.001) {
          const nx = dx / dist;
          const ny = dy / dist;

          const overlap = minDist - dist;
          const totalMass = m1.mass + m2.mass;
          m1.x -= nx * overlap * (m2.mass / totalMass);
          m1.y -= ny * overlap * (m2.mass / totalMass);
          m2.x += nx * overlap * (m1.mass / totalMass);
          m2.y += ny * overlap * (m1.mass / totalMass);

          const rvx = m2.vx - m1.vx;
          const rvy = m2.vy - m1.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          if (velAlongNormal < 0) {
            const restitution = Math.min(m1.bounce, m2.bounce);
            const impulseMag = -(1 + restitution) * velAlongNormal / (1 / m1.mass + 1 / m2.mass);

            const ix = impulseMag * nx;
            const iy = impulseMag * ny;

            m1.vx -= ix / m1.mass;
            m1.vy -= iy / m1.mass;
            m2.vx += ix / m2.mass;
            m2.vy += iy / m2.mass;

            const impact = Math.abs(velAlongNormal);
            if (impact > 0.2 && window.audio) {
              window.audio.playGlassClink(impact);
            }

            const cx = m1.x + nx * m1.radius;
            const cy = m1.y + ny * m1.radius;
            this.particles.emitDust(cx, cy, Math.min(8, Math.floor(impact * 2.5)), 'rgba(215, 185, 145, 0.8)', 2.0);
            if (impact > 4.5) {
              this.particles.emitSparks(cx, cy, Math.min(6, Math.floor(impact)), '#FFFFFF');
            }
          }
        }
      }
    }

    // 3. Marble-to-Obstacle Collisions (Broken Red Bricks & River Pebbles)
    for (const m of marbles) {
      if (!m.active || m.inHole) continue;

      for (const obs of obstacles) {
        if (obs.type === 'circle') {
          // River Pebble
          const dx = m.x - obs.x;
          const dy = m.y - obs.y;
          const dist = Math.hypot(dx, dy);
          const minDist = m.radius + obs.radius;

          if (dist < minDist && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            m.x += nx * overlap;
            m.y += ny * overlap;

            const velAlongNormal = m.vx * nx + m.vy * ny;
            if (velAlongNormal < 0) {
              m.vx -= (1 + obs.bounce) * velAlongNormal * nx;
              m.vy -= (1 + obs.bounce) * velAlongNormal * ny;

              const impact = Math.abs(velAlongNormal);
              if (impact > 0.3 && window.audio) window.audio.playObstacleHit(impact);
              this.particles.emitDust(m.x - nx * m.radius, m.y - ny * m.radius, 4, 'rgba(150, 130, 110, 0.7)');
            }
          }
        } else if (obs.type === 'rect') {
          // Broken Red Clay Brick (Laal Eent)
          const closestX = Math.max(obs.x, Math.min(m.x, obs.x + obs.width));
          const closestY = Math.max(obs.y, Math.min(m.y, obs.y + obs.height));
          const dx = m.x - closestX;
          const dy = m.y - closestY;
          const dist = Math.hypot(dx, dy);

          if (dist < m.radius && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = m.radius - dist;

            m.x += nx * overlap;
            m.y += ny * overlap;

            const velAlongNormal = m.vx * nx + m.vy * ny;
            if (velAlongNormal < 0) {
              m.vx -= (1 + obs.bounce) * velAlongNormal * nx;
              m.vy -= (1 + obs.bounce) * velAlongNormal * ny;

              const impact = Math.abs(velAlongNormal);
              if (impact > 0.3 && window.audio) window.audio.playObstacleHit(impact);
              this.particles.emitDust(closestX, closestY, 5, 'rgba(195, 75, 50, 0.7)'); // Brick dust
            }
          }
        }
      }
    }
  }

  triggerBounce(marble, velocity) {
    if (velocity > 0.4 && window.audio) {
      window.audio.playObstacleHit(velocity * 0.6);
    }
  }

  allStopped(marbles) {
    return marbles.every(m => !m.active || m.isStopped());
  }
}
