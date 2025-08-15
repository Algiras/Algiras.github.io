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
  // Stage-based sizing and line-specific silhouette tweaks
  let bw = 48;
  let bh = 40;
  if (s.stage === 'Baby') { bw = 40; bh = 32; }
  else if (s.stage === 'Teen') { bw = 50; bh = 42; }
  else if (s.stage === 'Adult') { bw = 56; bh = 46; }
  else if (s.stage === 'Elder') { bw = 54; bh = 44; }

  // Species line modifiers: 1=Leaf (rounder), 2=Ember (spikier), 3=Ripple (wavier)
  const line = s.dna.line || 1;
  if (line === 1) { bw += 0; bh += 2; } // rounder, squat
  if (line === 2) { bw += 2; bh -= 0; } // a bit wider
  if (line === 3) { bw -= 0; bh += 0; } // neutral
  ctx.fillStyle = isDark ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.06)';
  ctx.fillRect(cx - bw / 2 + 6, cy + bh / 2 - 2, bw - 12, 3);
  // Elder slightly desaturated
  const sat = s.stage === 'Elder' ? 45 : 70;
  const light = s.stage === 'Elder' ? 60 : 55;
  ctx.fillStyle = `hsl(${s.dna.bodyHue}, ${sat}%, ${light}%)`;
  ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
  // Corners by line: round (leaf), spikes (ember), waves (ripple)
  if (line === 1) {
    // Rounded corners using cutouts
    ctx.clearRect(cx - bw / 2, cy - bh / 2, 4, 4);
    ctx.clearRect(cx + bw / 2 - 4, cy - bh / 2, 4, 4);
    ctx.clearRect(cx - bw / 2, cy + bh / 2 - 4, 4, 4);
    ctx.clearRect(cx + bw / 2 - 4, cy + bh / 2 - 4, 4, 4);
  } else if (line === 2) {
    // Small spikes on top and sides
    ctx.fillStyle = `hsl(${s.dna.bodyHue}, ${sat}%, ${light - 6}%)`;
    for (let i = -bw / 2 + 6; i <= bw / 2 - 6; i += 10) {
      ctx.fillRect(cx + i, cy - bh / 2 - 4, 4, 4);
    }
  } else {
    // Ripple edges
    ctx.fillStyle = `hsl(${s.dna.bodyHue}, ${sat}%, ${light - 6}%)`;
    for (let i = -bw / 2 + 6; i <= bw / 2 - 6; i += 12) {
      ctx.fillRect(cx + i, cy - bh / 2 - 2, 2, 2);
      ctx.fillRect(cx + i, cy + bh / 2, 2, 2);
    }
  }

  // Markings + line-specific overlays
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
  } else if (s.dna.markings === 6 && line === 1) {
    // Leaf veins
    ctx.fillStyle = 'rgba(0, 80, 0, 0.25)';
    for (let i = -12; i <= 12; i += 6) ctx.fillRect(cx + i, cy, 2, 12);
  } else if (s.dna.markings === 7 && line === 3) {
    // Water ripple bands
    ctx.fillStyle = 'rgba(50, 120, 255, 0.15)';
    ctx.fillRect(cx - 16, cy - 12, 32, 3);
    ctx.fillRect(cx - 12, cy - 2, 24, 3);
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

  // Extra features: ears, horns, wings, tail
  // Ears
  if (s.dna.ear === 1) {
    ctx.fillStyle = `hsl(${s.dna.bodyHue}, ${sat}%, ${light - 8}%)`;
    ctx.fillRect(cx - bw / 2 + 4, cy - bh / 2 - 6, 6, 6);
    ctx.fillRect(cx + bw / 2 - 10, cy - bh / 2 - 6, 6, 6);
  } else if (s.dna.ear === 2) {
    ctx.fillStyle = `hsl(${s.dna.bodyHue}, ${sat}%, ${light - 8}%)`;
    ctx.fillRect(cx - bw / 2 + 2, cy - bh / 2 - 10, 8, 10);
    ctx.fillRect(cx + bw / 2 - 10, cy - bh / 2 - 10, 8, 10);
  } else if (s.dna.ear === 3) {
    ctx.fillStyle = '#333';
    ctx.fillRect(cx - bw / 2 + 6, cy - bh / 2 - 8, 4, 8);
    ctx.fillRect(cx + bw / 2 - 10, cy - bh / 2 - 8, 4, 8);
  }
  // Horns
  if (s.dna.horns === 1) {
    ctx.fillStyle = '#c9c2a3';
    ctx.fillRect(cx - 10, cy - bh / 2 - 10, 4, 10);
    ctx.fillRect(cx + 6, cy - bh / 2 - 10, 4, 10);
  } else if (s.dna.horns === 2) {
    ctx.fillStyle = '#a88c5c';
    ctx.fillRect(cx - 12, cy - bh / 2 - 12, 4, 12);
    ctx.fillRect(cx + 8, cy - bh / 2 - 12, 4, 12);
  }
  // Wings (line-specific tint)
  if (s.dna.wings === 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(cx - bw / 2 - 10, cy - 6, 10, 12);
    ctx.fillRect(cx + bw / 2, cy - 6, 10, 12);
  } else if (s.dna.wings === 2) {
    ctx.fillStyle = line === 2 ? 'rgba(255,200,160,0.7)' : 'rgba(200,220,255,0.7)';
    ctx.fillRect(cx - bw / 2 - 12, cy - 10, 12, 16);
    ctx.fillRect(cx + bw / 2, cy - 10, 12, 16);
  }
  // Tail
  if (s.dna.tail === 1) {
    ctx.fillStyle = `hsl(${s.dna.bodyHue}, ${sat}%, ${light - 8}%)`;
    ctx.fillRect(cx + bw / 2, cy + 4, 8, 4);
  } else if (s.dna.tail === 2) {
    ctx.fillStyle = `hsl(${s.dna.bodyHue}, ${sat}%, ${light - 12}%)`;
    ctx.fillRect(cx + bw / 2, cy + 2, 10, 6);
  } else if (s.dna.tail === 3) {
    ctx.fillStyle = '#333';
    ctx.fillRect(cx + bw / 2, cy + 2, 2, 10);
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
  } else if (s.dna.accessory === 6) {
    // headphones
    ctx.fillStyle = '#444';
    ctx.fillRect(cx - 22, cy - 10, 6, 16);
    ctx.fillRect(cx + 16, cy - 10, 6, 16);
    ctx.fillRect(cx - 16, cy - 14, 32, 4);
  } else if (s.dna.accessory === 7) {
    // crown
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(cx - 14, cy - bh / 2 - 8, 28, 6);
    ctx.fillRect(cx - 10, cy - bh / 2 - 14, 6, 6);
    ctx.fillRect(cx + 4, cy - bh / 2 - 14, 6, 6);
  } else if (s.dna.accessory === 8) {
    // monocle
    ctx.fillStyle = '#222';
    ctx.fillRect(cx + 6, cy - 6, 12, 10);
    ctx.fillRect(cx + 12, cy + 4, 2, 8);
  } else if (s.dna.accessory === 9) {
    // tie
    ctx.fillStyle = '#b30000';
    ctx.fillRect(cx - 2, cy + 10, 4, 8);
    ctx.fillRect(cx - 4, cy + 18, 8, 8);
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

  // Draw poop/mess
  const messCount = s.messCount || 0;
  if (messCount > 0) {
    for (let i = 0; i < Math.min(messCount, 3); i++) {
      const poopX = cx - 25 + (i * 15) + Math.sin(t * 0.001 + i) * 2;
      const poopY = cy + 35 + Math.cos(t * 0.0015 + i) * 1;
      
      // Poop shape (brown pile)
      ctx.fillStyle = '#8B4513';
      
      // Bottom part (wider)
      ctx.beginPath();
      ctx.ellipse(poopX, poopY + 2, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Middle part
      ctx.beginPath();
      ctx.ellipse(poopX, poopY, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Top part (smaller)
      ctx.beginPath();
      ctx.ellipse(poopX, poopY - 2, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Stink lines (optional visual effect)
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.6)';
      ctx.lineWidth = 1;
      const stinkOffset = Math.sin(t * 0.003 + i) * 2;
      
      // Three small wavy lines above the poop
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.moveTo(poopX - 2 + j * 2, poopY - 8);
        ctx.lineTo(poopX - 2 + j * 2 + stinkOffset, poopY - 12);
        ctx.stroke();
      }
    }
  }
}


