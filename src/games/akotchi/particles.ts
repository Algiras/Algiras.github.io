export type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };

const MAX_PARTICLES = 60;
const particles: Particle[] = [];

export function spawnParticles(kind: 'crumbs' | 'sparkle' | 'dust', originX: number, originY: number) {
  const n = kind === 'sparkle' ? 12 : 8;
  for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = kind === 'sparkle' ? 1.6 + Math.random() * 1.2 : 0.8 + Math.random();
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (kind === 'dust' ? 0.2 : 0),
      life: 800 + Math.random() * 600,
      color: kind === 'crumbs' ? '#c8a15a' : kind === 'dust' ? 'rgba(255,255,255,0.25)' : 'rgba(255,215,0,0.9)'
    });
  }
}

export function updateAndDrawParticles(ctx: CanvasRenderingContext2D, anim: string) {
  const dt = 16;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    p.x += p.vx;
    p.y += p.vy;
    if (anim !== 'Sleeping') p.vy += 0.02;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.fillStyle = p.color;
    const size = p.color.includes('rgba(255,215,0') ? 3 : 2;
    ctx.fillRect(p.x, p.y, size, size);
  }
}


