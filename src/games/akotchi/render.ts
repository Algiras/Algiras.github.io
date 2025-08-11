import { AkotchiState, AnimationState } from './types';
import { updateAndDrawParticles } from './particles';

function drawZ(ctx: CanvasRenderingContext2D, x: number, y: number, size = 6) {
  ctx.fillRect(x, y, size, 2);
  ctx.fillRect(x + size - 2, y, 2, size);
  ctx.fillRect(x, y + size - 2, size, 2);
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size = 3) {
  ctx.fillRect(x, y, size, size);
  ctx.fillRect(x - size, y, size, size);
  ctx.fillRect(x + size, y, size, size);
  ctx.fillRect(x, y - size, size, size);
  ctx.fillRect(x, y + size, size, size);
}

export function drawAkotchi(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: AkotchiState,
  t: number,
  anim: AnimationState,
  theme: 'light' | 'dark' = 'light',
  showThoughtBubble: boolean = false
) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);

  // Background grid
  const isDark = theme === 'dark';
  ctx.fillStyle = isDark ? '#111' : '#fcfcfc';
  ctx.fillRect(0, 0, w, h);
  const gridStep = isDark ? 8 : 10;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
  for (let y = 0; y < h; y += gridStep) {
    for (let x = 0; x < w; x += gridStep) {
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Movement modifiers
  const happinessMod = 1 + (s.happiness - 50) / 200; // 0.75 .. 1.25
  const energyMod = 1 + (s.energy - 50) / 250; // 0.8 .. 1.2
  const personalityMod = s.personality === 'Hyper' ? 1.15 : s.personality === 'Lazy' ? 0.85 : 1.0;

  // Bobbing
  let bob = Math.floor(Math.sin(t / (400 / personalityMod)) * (2 * happinessMod));

  // Body
  ctx.save();
  // Dancing sway for Playing
  let swayX = 0;
  if (anim === 'Playing') {
    swayX = Math.floor(Math.sin(t / (140 / energyMod)) * 4);
    bob = Math.floor(Math.sin(t / (220 / energyMod)) * 3);
  } else if (anim === 'Sleeping') {
    bob = Math.floor(Math.sin(t / 900) * 1);
  } else if (anim === 'LowEnergy') {
    bob = Math.floor(Math.sin(t / 800) * 1);
  }
  ctx.translate(swayX, bob);
  // Subtle drop shadow (softer on light theme)
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  const bw = 48;
  const bh = 40;
  ctx.fillStyle = isDark ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.06)';
  ctx.fillRect(cx - bw / 2 + 6, cy + bh / 2 - 2, bw - 12, 3);
  ctx.fillStyle = `hsl(${s.dna.bodyHue}, 70%, 55%)`;
  ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
  // Rounded corners using cutouts
  ctx.clearRect(cx - bw / 2, cy - bh / 2, 4, 4);
  ctx.clearRect(cx + bw / 2 - 4, cy - bh / 2, 4, 4);
  ctx.clearRect(cx - bw / 2, cy + bh / 2 - 4, 4, 4);
  ctx.clearRect(cx + bw / 2 - 4, cy + bh / 2 - 4, 4, 4);

  // Markings
  if (s.dna.markings === 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(cx - 10, cy - 8, 6, 6);
    ctx.fillRect(cx + 8, cy + 6, 6, 6);
  } else if (s.dna.markings === 2) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let i = -16; i <= 16; i += 6) {
      ctx.fillRect(cx + i, cy - 10, 4, 4);
    }
  } else if (s.dna.markings === 3) {
    ctx.fillStyle = 'rgba(255, 100, 100, 0.25)';
    ctx.fillRect(cx - 14, cy - 2, 6, 3);
    ctx.fillRect(cx + 8, cy - 2, 6, 3);
  } else if (s.dna.markings === 4) {
    // freckles
    ctx.fillStyle = 'rgba(160, 90, 60, 0.35)';
    for (let i = -10; i <= 10; i += 5) {
      ctx.fillRect(cx + i, cy + 2, 2, 2);
    }
  } else if (s.dna.markings === 5) {
    // heart patch
    ctx.fillStyle = 'rgba(255, 80, 120, 0.4)';
    ctx.fillRect(cx - 2, cy - 8, 4, 4);
    ctx.fillRect(cx - 5, cy - 6, 4, 4);
    ctx.fillRect(cx + 1, cy - 6, 4, 4);
    ctx.fillRect(cx - 4, cy - 3, 8, 6);
  }

  // Eyes (blink)
  const blink = anim !== 'Sleeping' && Math.abs(Math.sin(t / 1500)) < 0.1;
  ctx.fillStyle = isDark ? '#111' : '#222';
  const eyeY = cy - 4;
  if (blink) {
    ctx.fillRect(cx - 10, eyeY, 8, 1);
    ctx.fillRect(cx + 2, eyeY, 8, 1);
  } else {
    if (anim === 'Sleeping') {
      ctx.fillRect(cx - 12, eyeY, 8, 2);
      ctx.fillRect(cx + 6, eyeY, 8, 2);
    } else if (anim === 'Sick') {
      // X-eyes
      ctx.fillRect(cx - 12, eyeY - 2, 6, 1);
      ctx.fillRect(cx - 12, eyeY + 2, 6, 1);
      ctx.fillRect(cx + 6, eyeY - 2, 6, 1);
      ctx.fillRect(cx + 6, eyeY + 2, 6, 1);
    } else if (s.dna.eye === 1) {
      ctx.fillRect(cx - 12, eyeY - 2, 6, 6);
      ctx.fillRect(cx + 6, eyeY - 2, 6, 6);
    } else if (s.dna.eye === 2) {
      ctx.fillRect(cx - 12, eyeY - 2, 6, 6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 10, eyeY, 2, 2);
      ctx.fillStyle = isDark ? '#111' : '#222';
      ctx.fillRect(cx + 6, eyeY - 2, 6, 6);
    } else if (s.dna.eye === 3) {
      ctx.fillRect(cx - 14, eyeY - 1, 8, 4);
      ctx.fillRect(cx + 6, eyeY - 1, 8, 4);
    } else if (s.dna.eye === 4) {
      // droopy eyes
      ctx.fillRect(cx - 12, eyeY, 6, 4);
      ctx.fillRect(cx + 6, eyeY, 6, 4);
    } else {
      // big shiny eyes
      ctx.fillRect(cx - 12, eyeY - 3, 7, 7);
      ctx.fillRect(cx + 5, eyeY - 3, 7, 7);
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 10, eyeY - 2, 2, 2);
      ctx.fillRect(cx + 7, eyeY - 2, 2, 2);
      ctx.fillStyle = isDark ? '#111' : '#222';
    }
  }

  // Mouth
  ctx.fillStyle = isDark ? '#111' : '#222';
  const mouthY = cy + 6;
  if (anim === 'Eating') {
    const chew = Math.floor((t / 120) % 2) === 0;
    if (chew) ctx.fillRect(cx - 6, mouthY - 1, 12, 6);
    else ctx.fillRect(cx - 4, mouthY, 8, 2);
    // Food pixel moves
    ctx.fillStyle = '#c8a15a';
    const foodX = cx + 18 - Math.floor((t / 100) % 24);
    ctx.fillRect(foodX, mouthY - 2, 4, 4);
    ctx.fillStyle = isDark ? '#111' : '#222';
  } else if (anim === 'Hungry' || anim === 'Sad' || anim === 'Sick' || anim === 'LowEnergy') {
    // Frown
    ctx.fillRect(cx - 6, mouthY + 2, 12, 2);
  } else if (s.dna.mouth === 1) {
    ctx.fillRect(cx - 4, mouthY, 8, 2);
  } else if (s.dna.mouth === 2) {
    ctx.fillRect(cx - 6, mouthY, 4, 2);
    ctx.fillRect(cx + 2, mouthY, 4, 2);
  } else if (s.dna.mouth === 3) {
    ctx.fillRect(cx - 3, mouthY - 2, 6, 6);
  } else if (s.dna.mouth === 4) {
    // cat mouth
    ctx.fillRect(cx - 6, mouthY, 4, 2);
    ctx.fillRect(cx + 2, mouthY, 4, 2);
    ctx.fillRect(cx - 1, mouthY - 1, 2, 2);
  } else {
    // big smile
    ctx.fillRect(cx - 8, mouthY, 16, 2);
    ctx.fillRect(cx - 8, mouthY + 2, 2, 2);
    ctx.fillRect(cx + 6, mouthY + 2, 2, 2);
  }

  // Accessory
  if (s.dna.accessory === 1) {
    // hat
    ctx.fillStyle = '#333';
    ctx.fillRect(cx - 18, cy - bh / 2 - 6, 36, 4);
    ctx.fillRect(cx - 12, cy - bh / 2 - 14, 24, 8);
  } else if (s.dna.accessory === 2) {
    // bow
    ctx.fillStyle = '#e255a1';
    ctx.fillRect(cx - 8, cy - bh / 2 - 4, 16, 6);
    ctx.fillRect(cx - 14, cy - bh / 2 - 2, 6, 6);
    ctx.fillRect(cx + 8, cy - bh / 2 - 2, 6, 6);
  } else if (s.dna.accessory === 3) {
    // scarf
    ctx.fillStyle = '#ffcf33';
    ctx.fillRect(cx - 20, cy + 10, 40, 6);
    ctx.fillRect(cx + 6, cy + 16, 8, 10);
  } else if (s.dna.accessory === 4) {
    // glasses
    ctx.fillStyle = '#222';
    ctx.fillRect(cx - 18, cy - 6, 12, 10);
    ctx.fillRect(cx + 6, cy - 6, 12, 10);
    ctx.fillRect(cx - 6, cy - 2, 12, 2);
  } else if (s.dna.accessory === 5) {
    // flower
    ctx.fillStyle = '#f2c94c';
    drawStar(ctx, cx + 18, cy - 22, 3);
    ctx.fillStyle = '#e255a1';
    drawStar(ctx, cx + 18, cy - 22, 2);
  }

  // Sick overlay
  if (s.sick) {
    ctx.fillStyle = 'rgba(0, 255, 120, 0.12)';
    ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
  }

  ctx.restore();

  // State-specific overlays
  if (anim === 'Sleeping') {
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    drawZ(ctx, cx + 30, cy - 40 - Math.floor((t / 12) % 20), 6);
    drawZ(ctx, cx + 45, cy - 60 - Math.floor((t / 9) % 30), 8);
    // dim screen
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, w, h);
  } else if (anim === 'Playing') {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    const seed = Math.floor(t / 120);
    for (let i = 0; i < 6; i++) {
      const px = cx - 40 + ((seed + i) * 17) % 80;
      const py = cy - 30 + ((seed + i * 7) % 50);
      drawStar(ctx, px, py, 2);
    }
  } else if (anim === 'Happy') {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
    for (let i = 0; i < 4; i++) {
      const a = i * (Math.PI / 2) + t / 500;
      drawStar(ctx, cx + Math.cos(a) * 36, cy + Math.sin(a) * 18, 2);
    }
  } else if (anim === 'Hungry') {
    ctx.fillStyle = 'rgba(255, 80, 80, 0.8)';
    ctx.fillRect(cx - 2, cy - 50, 4, 10);
    ctx.fillRect(cx - 6, cy - 40, 12, 4);
  } else if (anim === 'Crying') {
    // Crying animation with tears
    ctx.fillStyle = 'rgba(100, 150, 255, 0.8)';
    // Left tear
    ctx.fillRect(cx - 12, cy - 35, 2, 6);
    ctx.fillRect(cx - 11, cy - 29, 2, 2);
    // Right tear
    ctx.fillRect(cx + 10, cy - 35, 2, 6);
    ctx.fillRect(cx + 9, cy - 29, 2, 2);
    // Crying mouth (open, sad)
    ctx.fillStyle = isDark ? '#111' : '#222';
    ctx.fillRect(cx - 4, mouthY - 1, 8, 4);
    ctx.fillRect(cx - 2, mouthY + 3, 4, 2);
  }

  // Particles
  updateAndDrawParticles(ctx, anim);
  
  // Thought bubble when Akotchi is asking for something
  if (showThoughtBubble) {
    const bubbleX = cx + 25;
    const bubbleY = cy - 60;
    const bubbleSize = 20;
    
    // Main bubble
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(bubbleX, bubbleY, bubbleSize, bubbleSize);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bubbleX, bubbleY, bubbleSize, bubbleSize);
    
    // Small connecting bubble
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(bubbleX + 5, bubbleY + bubbleSize - 2, 8, 8);
    ctx.strokeRect(bubbleX + 5, bubbleY + bubbleSize - 2, 8, 8);
    
    // Question mark or thought dots
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('?', bubbleX + bubbleSize/2, bubbleY + bubbleSize/2 + 4);
  }
}


