import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Container, Group, Progress, Stack, Text, Title, Switch, Select, Modal, TextInput } from '@mantine/core';
import { QRCodeCanvas } from 'qrcode.react';


import { useMediaQuery } from '@mantine/hooks';
import { useMachine } from '@xstate/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { petMachine } from './machine';
import { useDocumentTitle } from '../../utils/documentUtils';
import { AkotchiState, AnimationState } from './types';
import { createNewAkotchi, updateByElapsed, PETS_KEY, SELECTED_KEY, STORAGE_KEY, clamp } from './state';
// use draw from render module
import { drawAkotchi as renderDrawAkotchi } from './render';

import { useTheme } from '../../context/ThemeContext';
import { msRemaining, formatSeconds } from './utils';
import { Howl, Howler } from 'howler';

type PetsStore = { pets: AkotchiState[]; selectedId: string };

function generateBeepDataUri(
  frequencyHz: number,
  durationMs: number,
  options?: { volume?: number; wave?: 'sine' | 'square' | 'triangle' | 'sawtooth'; attackMs?: number; decayMs?: number }
): string {
  const sampleRate = 44100;
  const channels = 1;
  const bitsPerSample = 16;
  const numSamples = Math.max(1, Math.floor((durationMs / 1000) * sampleRate));
  const volume = Math.max(0, Math.min(1, options?.volume ?? 0.35));
  const wave = options?.wave ?? 'sine';
  const attackSamples = Math.floor(((options?.attackMs ?? 5) / 1000) * sampleRate);
  const decaySamples = Math.floor(((options?.decayMs ?? 50) / 1000) * sampleRate);

  const data = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const phase = 2 * Math.PI * frequencyHz * t;
    let sample: number;
    switch (wave) {
      case 'square': sample = Math.sign(Math.sin(phase)) || 1; break;
      case 'triangle': sample = 2 * Math.asin(Math.sin(phase)) / Math.PI; break;
      case 'sawtooth': sample = 2 * (t * frequencyHz - Math.floor(0.5 + t * frequencyHz)); break;
      default: sample = Math.sin(phase); break;
    }
    // Simple AR envelope
    let env = 1;
    if (i < attackSamples) env = i / Math.max(1, attackSamples);
    if (numSamples - i < decaySamples) env = Math.min(env, (numSamples - i) / Math.max(1, decaySamples));
    const v = Math.max(-1, Math.min(1, sample * env * volume));
    data[i] = (v * 32767) | 0;
  }

  // WAV header
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = data.length * blockAlign;
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);
  let offset = 0;
  function writeString(s: string) { for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)); offset += s.length; }
  function writeUint32(v: number) { view.setUint32(offset, v, true); offset += 4; }
  function writeUint16(v: number) { view.setUint16(offset, v, true); offset += 2; }

  writeString('RIFF');
  writeUint32(36 + dataSize);
  writeString('WAVE');
  writeString('fmt ');
  writeUint32(16); // PCM
  writeUint16(1); // audio format = PCM
  writeUint16(channels);
  writeUint32(sampleRate);
  writeUint32(byteRate);
  writeUint16(blockAlign);
  writeUint16(bitsPerSample);
  writeString('data');
  writeUint32(dataSize);
  // PCM data
  const out = new Int16Array(buffer, headerSize);
  out.set(data);

  // To base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
  }
  const base64 = btoa(binary);
  return `data:audio/wav;base64,${base64}`;
}

function loadPetsStore(): PetsStore {
  // Try new multi-pet store
  try {
    const raw = localStorage.getItem(PETS_KEY);
    if (raw) {
      const pets: AkotchiState[] = JSON.parse(raw);
      let selectedId = '';
      try { selectedId = localStorage.getItem(SELECTED_KEY) || ''; } catch { /* ignore */ }
      if (!selectedId && pets.length > 0) selectedId = pets[0].id;
      return { pets, selectedId };
    }
  } catch { /* ignore */ }
  // Migrate legacy single-pet state
  try {
    const legacy = localStorage.getItem(STORAGE_KEY);
    if (legacy) {
      const pet = JSON.parse(legacy) as AkotchiState;
      if (!pet.name) pet.name = 'Akotchi';
      const pets = [pet];
      localStorage.setItem(PETS_KEY, JSON.stringify(pets));
      localStorage.setItem(SELECTED_KEY, pet.id);
      return { pets, selectedId: pet.id };
    }
  } catch { /* ignore */ }
  // Create first pet
  const first = createNewAkotchi();
  try {
    localStorage.setItem(PETS_KEY, JSON.stringify([first]));
    localStorage.setItem(SELECTED_KEY, first.id);
  } catch { /* ignore */ }
  return { pets: [first], selectedId: first.id };
}

function savePetsStore(store: PetsStore) {
  try { localStorage.setItem(PETS_KEY, JSON.stringify(store.pets)); } catch { /* ignore */ }
  try { localStorage.setItem(SELECTED_KEY, store.selectedId); } catch { /* ignore */ }
}

// moved to state.ts

function useAkotchiState() {
  const [store, setStore] = useState<PetsStore>(() => loadPetsStore());
  const selectedPet = useMemo(() => {
    const pet = store.pets.find((p) => p.id === store.selectedId) || store.pets[0];
    const elapsed = Date.now() - pet.lastUpdated;
    return updateByElapsed(pet, elapsed);
  }, [store]);

  // Persist store whenever pets change
  useEffect(() => { savePetsStore(store); }, [store]);

  const applyElapsedTick = useCallback((elapsedMs: number) => {
    setStore((prev) => {
      const idx = prev.pets.findIndex((p) => p.id === prev.selectedId);
      if (idx < 0) return prev;
      const updatedPet = updateByElapsed(prev.pets[idx], elapsedMs);
      const pets = prev.pets.slice();
      pets[idx] = updatedPet;
      return { ...prev, pets };
    });
  }, []);

  const setState = useCallback((updater: (prev: AkotchiState) => AkotchiState) => {
    setStore((prev) => {
      const idx = prev.pets.findIndex((p) => p.id === prev.selectedId);
      if (idx < 0) return prev;
      const next = updater(prev.pets[idx]);
      const pets = prev.pets.slice();
      pets[idx] = next;
      return { ...prev, pets };
    });
  }, []);

  const createPet = useCallback((name?: string) => {
    const pet = createNewAkotchi(name);
    setStore((prev) => ({ pets: [...prev.pets, pet], selectedId: pet.id }));
  }, []);

  const selectPet = useCallback((id: string) => {
    setStore((prev) => ({ ...prev, selectedId: id }));
  }, []);

  const renamePet = useCallback((id: string, name: string) => {
    setStore((prev) => {
      const pets = prev.pets.map((p) => (p.id === id ? { ...p, name } : p));
      return { ...prev, pets };
    });
  }, []);

  return { state: selectedPet, setState, applyElapsedTick, store, createPet, selectPet, renamePet } as const;
}

// Action timing config moved to machine actions; component only triggers events

// time helpers moved to utils.ts

// Minimal pixel renderer using canvas primitives to avoid external assets
// particles & glyph helpers moved to modules

// renderer moved to render.ts

const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <Stack gap={4} style={{ minWidth: 160 }}>
    <Group justify="space-between">
      <Text size="sm" c="dimmed">{label}</Text>
      <Text size="sm" fw={600}>{Math.round(value)}</Text>
    </Group>
    <Progress value={value} color={color as any} radius="md" size="md" />
  </Stack>
);

const QRExporter: React.FC<{ value: string }> = ({ value }) => {
  if (!value) return null;
  return (
    <QRCodeCanvas value={value} size={220} includeMargin style={{ imageRendering: 'pixelated' as any }} />
  );
};

// QR code scanner removed; imports now happen via opening a shared link only

const Akotchi: React.FC = () => {
  useDocumentTitle('Akotchi — Retro Tamagotchi-Inspired Game');
  const { state, setState, applyElapsedTick, store, createPet, selectPet } = useAkotchiState();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [animState, setAnimState] = useState<AnimationState>('Idle');
  const [animUntil, setAnimUntil] = useState<number>(0);
  const [showThoughtBubble, setShowThoughtBubble] = useState<boolean>(false);
  const [thoughtBubbleUntil, setThoughtBubbleUntil] = useState<number>(0);
  const lastPetAtRef = useRef<number>(0);

  // New pet modal state
  const [newPetModalOpened, setNewPetModalOpened] = useState<boolean>(false);
  const [newPetName, setNewPetName] = useState<string>('');
  
  // Periodic thought timer
  const lastThoughtTimeRef = useRef<number>(0);
  
  // Message display state
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [messageTitle, setMessageTitle] = useState<string>('');
  const [messageColor, setMessageColor] = useState<string>('blue');
  const messageTimeoutRef = useRef<number | null>(null);
  const [lastMessage, setLastMessage] = useState<string>('');
  const [lastMessageTitle, setLastMessageTitle] = useState<string>('');
  const [lastMessageColor, setLastMessageColor] = useState<string>('blue');
  const lastStatusUpdateRef = useRef<number>(0);
  const lastStatusRef = useRef<{hunger: number, energy: number, health: number, happiness: number, isDead: boolean}>({
    hunger: 100, energy: 100, health: 100, happiness: 100, isDead: false
  });
  const [muted, setMuted] = useState<boolean>(() => {
    try { return localStorage.getItem('akotchi_sfx_muted_v1') === '1'; } catch { return false; }
  });
  
  // Helper function to show messages under canvas
  const showMessage = useCallback((title: string, message: string, color: string = 'blue', duration: number = 6000) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    
    setMessageTitle(title);
    setCurrentMessage(message);
    setMessageColor(color);
    
    // Also update last message
    setLastMessage(message);
    setLastMessageTitle(title);
    setLastMessageColor(color);
    
    messageTimeoutRef.current = window.setTimeout(() => {
      setCurrentMessage('');
      setMessageTitle('');
      messageTimeoutRef.current = null;
    }, duration);
  }, []);

  // Generate default status message based on pet's current state
  const generateDefaultMessage = useCallback(() => {
    if (state.isDead) {
      return {
        title: `${state.name} has passed away`,
        message: "Thank you for taking care of me. I had a wonderful life!",
        color: 'gray'
      };
    }

    // Check for messes first (high priority)
    if ((state.messCount || 0) > 0) {
      const messCount = state.messCount || 0;
      if (messCount >= 3) {
        return {
          title: `${state.name} is embarrassed`,
          message: "This is so embarrassing! There's mess everywhere! Please clean it up!",
          color: 'orange'
        };
      } else if (messCount >= 2) {
        return {
          title: `${state.name} needs cleaning`,
          message: "It's getting pretty messy around here... Could you clean up please?",
          color: 'yellow'
        };
      } else {
        return {
          title: `${state.name} made a mess`,
          message: "Oops! I made a little mess. Could you clean it up for me?",
          color: 'yellow'
        };
      }
    }

    // Check for urgent needs
    if (state.health < 20) {
      return {
        title: `${state.name} is very sick`,
        message: "I really need medical attention! Please heal me soon.",
        color: 'red'
      };
    }
    
    if (state.happiness < 15) {
      return {
        title: `${state.name} is crying`,
        message: "I'm feeling so sad... Could you play with me or give me some attention?",
        color: 'red'
      };
    }
    
    if (state.hunger < 20) {
      return {
        title: `${state.name} is very hungry`,
        message: "My tummy is rumbling! I really need some food right now.",
        color: 'orange'
      };
    }
    
    if (state.energy < 20) {
      return {
        title: `${state.name} is exhausted`,
        message: "I'm so tired... I could really use some rest.",
        color: 'purple'
      };
    }

    // Check for moderate needs
    if (state.hunger < 50) {
      return {
        title: `${state.name} is getting hungry`,
        message: "I could go for some food soon!",
        color: 'yellow'
      };
    }
    
    if (state.energy < 50) {
      return {
        title: `${state.name} is feeling tired`,
        message: "A little nap would be nice.",
        color: 'blue'
      };
    }
    
    if (state.happiness < 50) {
      return {
        title: `${state.name} wants attention`,
        message: "I'd love to play or get some cuddles!",
        color: 'pink'
      };
    }

    // Happy states
    if (state.hunger > 80 && state.energy > 80 && state.health > 80 && state.happiness > 80) {
      const happyMessages = [
        "I'm feeling absolutely wonderful today!",
        "Life is great when you take such good care of me!",
        "I'm so happy and healthy! Thank you!",
        "Everything is perfect right now!",
        "I love spending time with you!"
      ];
      return {
        title: `${state.name} is very happy`,
        message: happyMessages[Math.floor(Math.random() * happyMessages.length)],
        color: 'green'
      };
    }

    // Default content state
    const contentMessages = [
      "I'm doing well, thanks for taking care of me!",
      "Just enjoying life one moment at a time.",
      "Everything seems pretty good right now.",
      "I'm content and peaceful.",
      "Just thinking about life and stuff."
    ];
    
    return {
      title: `${state.name} is content`,
      message: contentMessages[Math.floor(Math.random() * contentMessages.length)],
      color: 'blue'
    };
  }, [state]);

  useEffect(() => {
    Howler.mute(muted);
  }, [muted]);

  // Initialize default message on first load
  useEffect(() => {
    if (!lastMessage) {
      const defaultMsg = generateDefaultMessage();
      setLastMessage(defaultMsg.message);
      setLastMessageTitle(defaultMsg.title);
      setLastMessageColor(defaultMsg.color);
    }
  }, [lastMessage, generateDefaultMessage]);

  // Update default message when pet status changes significantly (only if no active message)
  useEffect(() => {
    if (currentMessage) return; // Don't update if there's an active message
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastStatusUpdateRef.current;
    
    // Only check for updates every 5 seconds minimum
    if (timeSinceLastUpdate < 5000) return;
    
    const lastStatus = lastStatusRef.current;
    const currentStatus = {
      hunger: state.hunger,
      energy: state.energy,
      health: state.health,
      happiness: state.happiness,
      isDead: Boolean(state.isDead)
    };
    
    // Check if there's a significant change (more than 10 points or death status change)
    const significantChange = 
      Math.abs(currentStatus.hunger - lastStatus.hunger) > 10 ||
      Math.abs(currentStatus.energy - lastStatus.energy) > 10 ||
      Math.abs(currentStatus.health - lastStatus.health) > 10 ||
      Math.abs(currentStatus.happiness - lastStatus.happiness) > 10 ||
      currentStatus.isDead !== lastStatus.isDead ||
      // Or if any stat crosses critical thresholds
      (currentStatus.hunger < 20 && lastStatus.hunger >= 20) ||
      (currentStatus.energy < 20 && lastStatus.energy >= 20) ||
      (currentStatus.health < 20 && lastStatus.health >= 20) ||
      (currentStatus.happiness < 15 && lastStatus.happiness >= 15) ||
      (currentStatus.hunger >= 20 && lastStatus.hunger < 20) ||
      (currentStatus.energy >= 20 && lastStatus.energy < 20) ||
      (currentStatus.health >= 20 && lastStatus.health < 20) ||
      (currentStatus.happiness >= 15 && lastStatus.happiness < 15);
    
    if (significantChange) {
      const defaultMsg = generateDefaultMessage();
      setLastMessage(defaultMsg.message);
      setLastMessageTitle(defaultMsg.title);
      setLastMessageColor(defaultMsg.color);
      
      // Update refs
      lastStatusUpdateRef.current = now;
      lastStatusRef.current = currentStatus;
    }
  }, [state.hunger, state.energy, state.health, state.happiness, state.isDead, currentMessage, generateDefaultMessage]);

  // Tiny in-web LLM to generate pet messages (runs on-device)
  const [llmReady, setLlmReady] = useState(false);
  const [llmBusy, setLlmBusy] = useState(false);
  const llmRef = useRef<any | null>(null);
  const ensureLlm = useCallback(async () => {
    if (llmRef.current || llmReady) return true;
    try {
      const webllm = await import('@mlc-ai/web-llm');
      const engine = await webllm.CreateMLCEngine('Qwen2-0.5B-Instruct-q4f16_1-MLC');
      llmRef.current = engine;
      setLlmReady(true);
      return true;
    } catch {
      return false;
    }
  }, [llmReady]);

  // Lazy init SFX after user gesture to comply with autoplay policies
  const sfxRef = useRef<{ feed?: Howl; play?: Howl; sleep?: Howl; clean?: Howl; heal?: Howl; scold?: Howl; crying?: Howl } | null>(null);
  const ensureSfx = useCallback(() => {
    if (sfxRef.current) return;
    // Distinct short UI/game cues generated at runtime and embedded as data URIs
    const feedUri = generateBeepDataUri(660, 160, { wave: 'sine', volume: 0.35, attackMs: 5, decayMs: 120 });
    const playUri = generateBeepDataUri(880, 200, { wave: 'triangle', volume: 0.35, attackMs: 5, decayMs: 120 });
    const sleepUri = generateBeepDataUri(330, 280, { wave: 'sine', volume: 0.25, attackMs: 10, decayMs: 160 });
    const cleanUri = generateBeepDataUri(1200, 140, { wave: 'sawtooth', volume: 0.25, attackMs: 2, decayMs: 80 });
    const healUri = generateBeepDataUri(520, 180, { wave: 'sine', volume: 0.3, attackMs: 6, decayMs: 140 });
    const scoldUri = generateBeepDataUri(200, 220, { wave: 'square', volume: 0.35, attackMs: 2, decayMs: 140 });
    const cryingUri = generateBeepDataUri(440, 500, { wave: 'triangle', volume: 0.35, attackMs: 10, decayMs: 280 });
    sfxRef.current = {
      feed: new Howl({ src: [feedUri], volume: 1.0 }),
      play: new Howl({ src: [playUri], volume: 1.0 }),
      sleep: new Howl({ src: [sleepUri], volume: 1.0 }),
      clean: new Howl({ src: [cleanUri], volume: 1.0 }),
      heal: new Howl({ src: [healUri], volume: 1.0 }),
      scold: new Howl({ src: [scoldUri], volume: 1.0 }),
      crying: new Howl({ src: [cryingUri], volume: 1.0 })
    };
  }, []);

  // TTS removed

  const deriveAnimFromStats = useCallback((s: AkotchiState): AnimationState => {
    if (s.sick || s.health < 35) return 'Sick';
    if (s.energy < 20) return 'LowEnergy';
    if (s.hunger < 25) return 'Hungry';
    if (s.happiness < 15) return 'Crying'; // Very low happiness triggers crying
    if (s.happiness < 25) return 'Sad';
    if (s.happiness > 80 && s.energy > 40) return 'Happy';
    return 'Idle';
  }, []);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const workerRef = useRef<Worker | null>(null);
  const latestStateRef = useRef<AkotchiState>(state);
  useEffect(() => { latestStateRef.current = state; }, [state]);

  // XState machine to track action states
  const [fsm, send] = useMachine(petMachine, {
    input: {
      getPet: () => state,
      setPet: (updater: (prev: AkotchiState) => AkotchiState) => setState(updater),
    },
  });

  // 1s tick for the machine to apply decay centrally
  useEffect(() => {
    const id = setInterval(() => {
      send({ type: 'TICK' } as any);
    }, 1000);
    return () => clearInterval(id);
  }, [send]);

  // Spawn background worker
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (workerRef.current) return;
    try {
      const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = w;
      w.postMessage({ type: 'INIT', petId: state.id, name: state.name });
      w.onmessage = (e: MessageEvent) => {
        const data = e.data as { type: 'REQUEST' | 'SUGGEST_MESSAGE' | 'CRYING'; petId: string; request?: string; reason?: string; at: number } | any;
        if (data?.type === 'REQUEST') {
          // Generate proactive message for what Akotchi needs
          generateProactiveMessage(data.reason || 'something');
          
          // Log request for debugging
          console.log(`${state.name} needs ${data.request.toLowerCase()}: ${data.reason}`);
        } else if (data?.type === 'SUGGEST_MESSAGE') {
          // Ask the on-device LLM to compose something friendly
          requestPetMessage();
          // Show thought bubble briefly
          setShowThoughtBubble(true);
          setThoughtBubbleUntil(Date.now() + 3000);
        } else if (data?.type === 'CRYING') {
          // Log crying status
          console.log(`${state.name} is crying: ${data.reason}`);
          
          // Trigger crying animation and play sound
          setTempAnim('Crying', 5000);
          ensureSfx();
          sfxRef.current?.crying?.play();
        }
      };
    } catch {
      // ignore
    }
    return () => {
      try { workerRef.current?.terminate(); } catch { /* ignore */ }
      workerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodically send state snapshots to worker (throttled by render loop cadence)
  useEffect(() => {
    const w = workerRef.current;
    if (!w) return;
    const snapshot = {
      petId: state.id,
      name: state.name,
      hunger: state.hunger,
      energy: state.energy,
      health: state.health,
      happiness: state.happiness,
      ageHours: state.ageHours,
      isDead: state.isDead,
      lastUpdated: state.lastUpdated,
    };
    try { w.postMessage({ type: 'STATE', snapshot }); } catch { /* ignore */ }
  }, [state.id, state.name, state.hunger, state.energy, state.health, state.happiness, state.ageHours, state.isDead, state.lastUpdated]);

  // Guards are now enforced inside the machine; component does not pre-check

  // Updates now happen inside machine actions; component only sends events and sets temp anim

  // Simple 8-12 FPS loop (disabled when Pixi is enabled)
  useEffect(() => {

    let raf = 0;
    let last = performance.now();
    const fpsInterval = 1000 / 10;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const elapsed = now - last;
      if (elapsed < fpsInterval) return;
      last = now - (elapsed % fpsInterval);
      applyElapsedTick(elapsed);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let effectiveAnim: AnimationState;
      if (animUntil > now) {
        effectiveAnim = animState;
      } else {
        // Prefer machine-driven animation if in active state
        const machineState = String(fsm.value);
        const byMachine: Record<string, AnimationState> = {
          feeding: 'Eating',
          playing: 'Playing',
          sleeping: 'Sleeping',
          cleaning: 'Happy',
          healing: 'Happy',
          scolded: 'Sad',
          dead: 'Sick',
        };
        effectiveAnim = (byMachine[machineState] as AnimationState) || deriveAnimFromStats(state);
      }
      // Spawn particles based on pet machine state occasionally (handled in render module)
      if (animUntil <= now && animState !== effectiveAnim) setAnimState(effectiveAnim);
      renderDrawAkotchi(ctx, canvas.width, canvas.height, state, now, effectiveAnim, theme, showThoughtBubble);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [applyElapsedTick, state, animState, animUntil, deriveAnimFromStats, fsm.value, theme, showThoughtBubble]);
  
  // Handle thought bubble timeout
  useEffect(() => {
    if (thoughtBubbleUntil > 0) {
      const timer = setTimeout(() => {
        if (Date.now() >= thoughtBubbleUntil) {
          setShowThoughtBubble(false);
          setThoughtBubbleUntil(0);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [thoughtBubbleUntil]);

  // Sync machine to death when needed
  useEffect(() => {
    if (state.isDead) send({ type: 'DIE' });
  }, [state.isDead, send]);

  // Enhanced LLM response acknowledging actions with personality-driven reactions
  const requestActionMessage = useCallback(async (
    action: 'FEED' | 'PLAY' | 'SLEEP' | 'CLEAN' | 'HEAL' | 'SCOLD',
    prev: AkotchiState,
    next: AkotchiState
  ) => {
    if (llmBusy) return;
    setLlmBusy(true);
    const ok = await ensureLlm();
    if (!ok || !llmRef.current) { setLlmBusy(false); return; }
    const ageStr = `${Math.floor(next.ageHours)}h ${Math.floor((next.ageHours % 1) * 60)}m`;
    const delta = (a: number, b: number) => Math.round(b - a);
    const statsLine = `hunger ${Math.round(prev.hunger)}→${Math.round(next.hunger)} (${delta(prev.hunger, next.hunger)}), ` +
      `energy ${Math.round(prev.energy)}→${Math.round(next.energy)} (${delta(prev.energy, next.energy)}), ` +
      `happiness ${Math.round(prev.happiness)}→${Math.round(next.happiness)} (${delta(prev.happiness, next.happiness)}), ` +
      `health ${Math.round(prev.health)}→${Math.round(next.health)} (${delta(prev.health, next.health)})`;
    
    // Enhanced system prompt with personality-driven responses
    const system = `You are ${next.name}, a wholesome retro virtual pet (age: ${ageStr}, personality: ${next.personality}). 

Personality traits:
- Cheerful: Very grateful, enthusiastic, loves to express joy
- Lazy: Appreciates comfort, gentle gratitude, prefers calm responses
- Hyper: Energetic thanks, wants more action, very expressive
- Moody: Emotional gratitude, needs reassurance, sensitive responses
- Shy: Quiet gratitude, gentle appreciation, modest responses

Style: playful, caring, concise, personality-driven, grateful.
Constraints: exactly one sentence under 20 words.
Express genuine appreciation for the care received.`;

    // More engaging user prompt for action responses
    const user = `Action: ${action}. Stats change: ${statsLine}. 

Respond to your human's care with personality-appropriate gratitude and express how you feel now. Be specific about what you enjoyed or how you feel!

Examples:
- FEED: "That was delicious! I feel so much better now, thank you!"
- PLAY: "That was so much fun! I love playing with you!"
- SLEEP: "I feel so rested and cozy now, that was perfect!"
- CLEAN: "I feel so fresh and clean! Thank you for taking care of me!"
- HEAL: "I'm feeling much better now! Your care really helps!"
- SCOLD: "I understand, I'll try to be better. Thank you for teaching me."`;

    try {
      const reply = await llmRef.current.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ] as any,
      });
      const text = (reply as any)?.choices?.[0]?.message?.content?.toString?.() || '';
      if (text) {
        showMessage(`${next.name} says`, text, 'blue', 6000);
      }
    } catch {
      // ignore
    } finally { setLlmBusy(false); }
  }, [ensureLlm, llmBusy, showMessage]);

  // Actions
  const setTempAnim = useCallback((anim: AnimationState, durationMs = 1800) => {
    const now = performance.now();
    setAnimState(anim);
    setAnimUntil(now + durationMs);
  }, []);

  const adoptNew = useCallback(() => {
    createPet('Akotchi');
  }, [createPet]);

  const feed = useCallback(() => {
    ensureSfx();
    sfxRef.current?.feed?.play();
    // Machine guards handle availability; component just sends
    setTempAnim('Eating', 8000);
    const prev = latestStateRef.current;
    send({ type: 'FEED' });
    setTimeout(() => requestActionMessage('FEED', prev, latestStateRef.current), 200);
  }, [send, setTempAnim, ensureSfx, requestActionMessage]);

  const play = useCallback(() => {
    ensureSfx();
    sfxRef.current?.play?.play();
    setTempAnim('Playing', 10000);
    const prev = latestStateRef.current;
    send({ type: 'PLAY' });
    setTimeout(() => requestActionMessage('PLAY', prev, latestStateRef.current), 200);
  }, [send, setTempAnim, ensureSfx, requestActionMessage]);

  const sleep = useCallback(() => {
    ensureSfx();
    sfxRef.current?.sleep?.play();
    setTempAnim('Sleeping', 12000);
    const prev = latestStateRef.current;
    send({ type: 'SLEEP' });
    setTimeout(() => requestActionMessage('SLEEP', prev, latestStateRef.current), 200);
  }, [send, setTempAnim, ensureSfx, requestActionMessage]);

  const clean = useCallback(() => {
    ensureSfx();
    sfxRef.current?.clean?.play();
    setTempAnim('Happy', 5000);
    const prev = latestStateRef.current;
    send({ type: 'CLEAN' });
    setTimeout(() => requestActionMessage('CLEAN', prev, latestStateRef.current), 200);
  }, [send, setTempAnim, ensureSfx, requestActionMessage]);

  const heal = useCallback(() => {
    ensureSfx();
    sfxRef.current?.heal?.play();
    setTempAnim('Happy', 8000);
    const prev = latestStateRef.current;
    send({ type: 'HEAL' });
    setTimeout(() => requestActionMessage('HEAL', prev, latestStateRef.current), 200);
  }, [send, setTempAnim, ensureSfx, requestActionMessage]);

  const scold = useCallback(() => {
    ensureSfx();
    sfxRef.current?.scold?.play();
    setTempAnim('Sad', 5000);
    const prev = latestStateRef.current;
    send({ type: 'SCOLD' });
    setTimeout(() => requestActionMessage('SCOLD', prev, latestStateRef.current), 200);
  }, [send, setTempAnim, ensureSfx, requestActionMessage]);

  // Enhanced LLM message generation with personality-driven requests
  const requestPetMessage = useCallback(async () => {
    if (llmBusy) return;
    setLlmBusy(true);
    const ok = await ensureLlm();
    if (!ok || !llmRef.current) { setLlmBusy(false); return; }
    const s = state;
    const ageStr = `${Math.floor(s.ageHours)}h ${Math.floor((s.ageHours % 1) * 60)}m`;
    
    // Enhanced system prompt with more personality and context
    const system = `You are ${s.name}, a wholesome retro virtual pet (age: ${ageStr}, personality: ${s.personality}). 

Personality traits:
- Cheerful: Always positive, loves activities, very social
- Lazy: Prefers rest, gentle requests, appreciates comfort
- Hyper: Energetic, wants action, very playful
- Moody: Emotional, needs reassurance, sensitive
- Shy: Gentle, quiet requests, appreciates patience

Style: playful, caring, concise, personality-driven. 
Constraints: exactly one sentence under 20 words. 
Never be manipulative; encourage healthy care and breaks.`;

    // More specific and engaging user prompt
    const user = `Current stats — hunger ${Math.round(s.hunger)}, energy ${Math.round(s.energy)}, happiness ${Math.round(s.happiness)}, health ${Math.round(s.health)}. 

Based on your personality and current needs, compose a friendly, specific request or message to your human. Be creative and engaging!

Examples:
- If hungry: "I'm craving some delicious food! Can you feed me?"
- If tired: "I'm getting sleepy and would love a cozy nap time"
- If sad: "I'm feeling a bit down and could use some playtime to cheer up"
- If happy: "I'm so happy you're here! Let's do something fun together"`;

    try {
      const reply = await llmRef.current.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ] as any,
      });
      const text = (reply as any)?.choices?.[0]?.message?.content?.toString?.() || '';
      if (text) {
        showMessage(`${s.name} says`, text, 'blue', 6000);
      }
    } catch {
      // ignore
    } finally { setLlmBusy(false); }
  }, [ensureLlm, state, llmBusy, showMessage]);

  

  // Generate proactive messages when Akotchi needs something
  const generateProactiveMessage = useCallback(async (reason: string) => {
    if (llmBusy) return;
    setLlmBusy(true);
    const ok = await ensureLlm();
    if (!ok || !llmRef.current) { setLlmBusy(false); return; }
    
    const s = state;
    const ageStr = `${Math.floor(s.ageHours)}h ${Math.floor((s.ageHours % 1) * 60)}m`;
    
    const system = `You are ${s.name}, a wholesome retro virtual pet (age: ${ageStr}, personality: ${s.personality}). 

Personality traits:
- Cheerful: Very positive, asks enthusiastically, very social
- Lazy: Gentle requests, appreciates comfort, prefers calm
- Hyper: Energetic requests, wants action, very playful
- Moody: Emotional requests, needs reassurance, sensitive
- Shy: Gentle, quiet requests, appreciates patience

Style: playful, caring, concise, personality-driven, polite.
Constraints: exactly one sentence under 20 words.
Ask for what you need in a friendly, personality-appropriate way.`;

    const user = `You need: ${reason}. Current stats — hunger ${Math.round(s.hunger)}, energy ${Math.round(s.energy)}, happiness ${Math.round(s.happiness)}, health ${Math.round(s.health)}.

Based on your personality, ask your human for what you need in a friendly, engaging way. Be specific and creative!

Examples:
- Hungry: "I'm getting hungry! Can you feed me something yummy?"
- Tired: "I'm feeling sleepy and would love a cozy nap"
- Sad: "I'm feeling a bit lonely, can we play together?"
- Sick: "I'm not feeling well, could you help me feel better?"`;

    try {
      const reply = await llmRef.current.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ] as any,
      });
      const text = (reply as any)?.choices?.[0]?.message?.content?.toString?.() || '';
      if (text) {
        showMessage(`${s.name} needs something!`, text, 'yellow', 7000);
        // Show thought bubble briefly
        setShowThoughtBubble(true);
        setThoughtBubbleUntil(Date.now() + 4000);
      }
    } catch {
      // ignore
    } finally { setLlmBusy(false); }
  }, [ensureLlm, state, llmBusy, showMessage]);

  // Generate periodic thoughts based on pet status
  const generatePeriodicThought = useCallback(async () => {
    if (llmBusy || state.isDead) return;
    
    const now = Date.now();
    if (now - lastThoughtTimeRef.current < 2 * 60 * 1000) return; // 2 minutes
    
    lastThoughtTimeRef.current = now;
    
    setLlmBusy(true);
    try {
      const ok = await ensureLlm();
      if (!ok || !llmRef.current) { setLlmBusy(false); return; }

      // Create a status summary for the LLM
      const statusSummary = [];
      if (state.hunger < 30) statusSummary.push('hungry');
      if (state.energy < 30) statusSummary.push('tired');
      if (state.health < 30) statusSummary.push('unwell');
      if (state.happiness < 30) statusSummary.push('sad');
      if (state.hunger > 80 && state.energy > 80 && state.health > 80 && state.happiness > 80) {
        statusSummary.push('very content');
      }
      
      const statusText = statusSummary.length > 0 
        ? `Currently feeling ${statusSummary.join(', ')}`
        : 'Feeling okay overall';

      const system = `You are ${state.name}, a virtual pet. Generate a brief, natural thought about what you're thinking or feeling right now. Keep it under 50 words. Be expressive and show personality. ${statusText}. Stage: ${state.stage}. Personality: ${state.personality}.`;
      
      const user = 'What are you thinking about right now?';

      const reply = await llmRef.current.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ] as any,
      });
      
      const text = (reply as any)?.choices?.[0]?.message?.content?.toString?.() || '';
      if (text) {
        showMessage(`${state.name} thinks`, text, 'cyan', 8000);
        
        // Show thought bubble
        setShowThoughtBubble(true);
        setThoughtBubbleUntil(Date.now() + 5000);
      }
    } catch {
      // ignore
    } finally { setLlmBusy(false); }
  }, [ensureLlm, llmBusy, state, showMessage]);

  // Timer for periodic thoughts
  useEffect(() => {
    const timer = setInterval(() => {
      generatePeriodicThought();
    }, 30000); // Check every 30 seconds (function has its own 2-minute cooldown)
    
    return () => clearInterval(timer);
  }, [generatePeriodicThought]);

  const handlePetClick = useCallback(() => {
    const now = Date.now();
    if (now - lastPetAtRef.current < 700) return;
    lastPetAtRef.current = now;
    setTempAnim('Happy', 800);
    ensureSfx();
    sfxRef.current?.play?.play();
    setState((current) => ({
      ...current,
      happiness: clamp((current.happiness ?? 0) + 2, 0, 100),
      lastInteractionAt: now,
    }));
  }, [setTempAnim, ensureSfx, setState]);

  // Canvas click handler only when using Canvas
  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) return;
    const onClick = () => handlePetClick();
    canvas.addEventListener('click', onClick);
    return () => { try { canvas.removeEventListener('click', onClick); } catch { /* ignore */ } };
  }, [handlePetClick]);

  // Optional: Auto-act on worker requests when idle and allowed
  const [autoCare, setAutoCare] = useState<boolean>(false);
  useEffect(() => {
    const w = workerRef.current;
    if (!w) return;
    const handler = (e: MessageEvent) => {
      const data = e.data as { type: 'REQUEST'; petId: string; request: 'FEED' | 'SLEEP' | 'HEAL'; reason: string; at: number } | any;
      if (data?.type !== 'REQUEST') return;
      if (!autoCare) return;
      const now = Date.now();
      const busy = state.busyUntil && state.busyUntil > now;
      if (state.isDead || busy) return;
      const cd = state.cooldowns || {};
      switch (data.request) {
        case 'FEED':
          if (!cd.feed || cd.feed <= now) send({ type: 'FEED' });
          break;
        case 'SLEEP':
          if (!cd.sleep || cd.sleep <= now) send({ type: 'SLEEP' });
          break;
        case 'HEAL':
          if (!cd.heal || cd.heal <= now) send({ type: 'HEAL' });
          break;
        default:
          break;
      }
    };
    w.addEventListener('message', handler);
    return () => {
      try { w.removeEventListener('message', handler); } catch { /* ignore */ }
    };
  }, [autoCare, state.busyUntil, state.isDead, state.cooldowns, send]);



  // Toast on stage-up
  useEffect(() => {
    if (!state.lastStageUpAt || !state.lastStageUpStage) return;
    const now = Date.now();
    // Only show once within a few seconds of update
    if (now - state.lastStageUpAt < 5000) {
      console.log(`${state.name} advanced to ${state.lastStageUpStage}!`);
      ensureSfx();
      sfxRef.current?.play?.play();
    }
  }, [state.lastStageUpAt, state.lastStageUpStage, state.name, ensureSfx]);

  const hoursStr = useMemo(() => `${Math.floor(state.ageHours)}h ${Math.floor((state.ageHours % 1) * 60)}m`, [state.ageHours]);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [exportOpen, setExportOpen] = useState(false);
  const [shareUrlFrozen, setShareUrlFrozen] = useState<string | null>(null);
  const importedFromUrlRef = useRef<boolean>(false);

  const exportPayload = useMemo(() => {
    const payload = { version: 1, pet: state };
    try { return JSON.stringify(payload); } catch { return ''; }
  }, [state]);

  // Generate shareable URL
  const shareableUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const originAndPath = window.location.origin + window.location.pathname;
    // Ensure we use HashRouter path for deep-linking
    const currentHash = (window.location.hash || '').split('?')[0];
    const akotchiHashPath = currentHash && currentHash.startsWith('#/games/akotchi')
      ? currentHash
      : '#/games/akotchi';
    const baseUrl = originAndPath + akotchiHashPath;
    const encodedPet = encodeURIComponent(exportPayload);
    return `${baseUrl}?pet=${encodedPet}`;
  }, [exportPayload]);

  // When opening Share, freeze the current URL so the QR doesn't keep changing
  const openShare = useCallback(() => {
    setShareUrlFrozen(shareableUrl);
    setExportOpen(true);
  }, [shareableUrl]);
  const closeShare = useCallback(() => {
    setExportOpen(false);
    // small delay to avoid flicker when reopening immediately
    setTimeout(() => setShareUrlFrozen(null), 0);
  }, []);

  const copyShareUrl = useCallback(async () => {
    const url = shareUrlFrozen || shareableUrl;
    if (!url) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      console.log('Link copied to clipboard');
    } catch {
      console.log('Failed to copy URL');
    }
  }, [shareUrlFrozen, shareableUrl]);

  const sanitizeImportedPet = useCallback((raw: any, currentId: string): AkotchiState | null => {
    try {
      const pet = raw?.pet ?? raw;
      if (!pet || typeof pet !== 'object') return null;
      const clamp01 = (v: any) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
      const now = Date.now();
      const next: AkotchiState = {
        ...pet,
        id: currentId,
        name: typeof pet.name === 'string' && pet.name.trim() ? pet.name.trim() : 'Akotchi',
        hunger: clamp01(pet.hunger),
        happiness: clamp01(pet.happiness),
        energy: clamp01(pet.energy),
        health: clamp01(pet.health),
        lastUpdated: Number.isFinite(pet.lastUpdated) ? pet.lastUpdated : now,
        busyUntil: undefined,
        cooldowns: pet.cooldowns || {},
        isDead: !!pet.isDead,
        sick: !!pet.sick,
        ageHours: Number.isFinite(pet.ageHours) ? pet.ageHours : 0,
        stage: pet.stage || 'Baby',
        lastStageUpAt: pet.lastStageUpAt || 0,
        lastStageUpStage: pet.lastStageUpStage,
        dna: pet.dna || state.dna,
        personality: pet.personality || state.personality,
      };
      // Clamp via updateByElapsed with zero to recalc internals
      return updateByElapsed(next, 0);
    } catch {
      return null;
    }
  }, [state.dna, state.personality]);

  // Handle URL parameters for importing pets
  useEffect(() => {
    if (importedFromUrlRef.current) return;
    const petParam = searchParams.get('pet');
    if (!petParam) return;
    importedFromUrlRef.current = true; // prevent re-processing
    try {
      const decodedPet = decodeURIComponent(petParam);
      const parsed = JSON.parse(decodedPet);
      const sanitized = sanitizeImportedPet(parsed, state.id);
      if (sanitized) {
        setState(() => ({ ...sanitized, id: state.id, lastUpdated: Date.now() }));
        console.log('Imported from URL: Akotchi state loaded from shared link.');
      }
    } catch (error) {
      console.error('Failed to import pet from URL:', error);
      console.log('Import failed: Could not parse pet data from URL.');
    } finally {
      // Clear the URL parameter and replace history to avoid loops
      try { setSearchParams({}, { replace: true }); } catch { /* ignore */ }
      try { navigate('/games/akotchi', { replace: true }); } catch { /* ignore */ }
    }
  }, [searchParams, setSearchParams, sanitizeImportedPet, setState, state.id, navigate]);

  // Import happens by opening a link with ?pet=... – no manual import function needed anymore

  return (
    <Container size={isMobile ? 'xs' : 'lg'} px={isMobile ? 'sm' : undefined}>
      <Stack gap={isMobile ? 'md' : 'lg'}>
        <Group justify="space-between" align="center" wrap={isMobile ? 'wrap' : 'nowrap'}>
          <Stack gap={2}>
            <Title order={isMobile ? 3 : 2}>{state.name}</Title>
              <Text size={isMobile ? 'xs' : 'sm'} c="dimmed">Your unique pet — Personality: {state.personality} • Stage: {state.stage || 'Baby'}</Text>
          </Stack>
          <Text size={isMobile ? 'xs' : 'sm'} c="dimmed">Age: {hoursStr}</Text>
        </Group>

        {state.isDead ? (
          <Card withBorder radius="md" padding="xl">
            <Stack gap="md" align="center">
              <Title order={3}>RIP 💔</Title>
              <Text c="dimmed" ta="center">{state.name} has passed away. Thank you for caring.</Text>
              <Button color="grape" onClick={adoptNew}>Adopt New Akotchi</Button>
            </Stack>
          </Card>
        ) : (
          <Card withBorder radius="md" padding={isMobile ? 'sm' : 'md'} style={{ overflow: 'hidden' }}>
            <Stack gap="md">
              <Group align="start" gap={isMobile ? 'md' : 'xl'} wrap={isMobile ? 'wrap' : 'nowrap'}>
                <Stack gap="xs" align="center">
                  <Box style={{
                    width: isMobile ? '100%' : 320,
                    height: 240,
                    border: '3px solid var(--mantine-color-default-border)',
                    background: theme === 'dark' ? 'var(--mantine-color-dark-8)' : 'var(--mantine-color-gray-0)',
                    imageRendering: 'pixelated' as any,
                  }}>
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={240}
                      style={{ imageRendering: 'pixelated' as any, width: '100%', height: '100%' }}
                    />
                  </Box>
                  
                  {/* Message display under canvas - always show a message */}
                  <Box style={{
                    width: isMobile ? '100%' : 320,
                    minHeight: 60,
                    padding: 12,
                    border: '2px solid var(--mantine-color-default-border)',
                    borderRadius: 8,
                    background: theme === 'dark' ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-gray-1)',
                    boxSizing: 'border-box'
                  }}>
                    <Text size="xs" fw={600} c={currentMessage ? messageColor : (lastMessageColor || 'blue')} mb={6}>
                      {currentMessage ? messageTitle : (lastMessageTitle || `${state.name} says`)}
                    </Text>
                    <Text size="sm" style={{ 
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {currentMessage || lastMessage || `Hi, I'm ${state.name}! Thanks for taking care of me.`}
                    </Text>
                  </Box>
                </Stack>

                <Stack gap={isMobile ? 'sm' : 'md'} style={{ flex: 1, minWidth: isMobile ? '100%' : 260 }}>
              <Group justify="space-between" align="center">
                <Button size={isMobile ? 'xs' : 'xs'} variant="light" onClick={openShare}>Share</Button>

              </Group>
              <Group justify="space-between" align="center" wrap={isMobile ? 'wrap' : 'nowrap'}>
                <Group gap="xs" wrap={isMobile ? 'wrap' : 'nowrap'}>
                  <Text size="sm" c="dimmed">Pet</Text>
                  <Select
                    size="sm"
                    data={store.pets.map((p) => ({ value: p.id, label: `${p.name}` }))}
                    value={store.selectedId}
                    onChange={(val) => val && selectPet(val)}
                    w={isMobile ? '100%' : 220}
                  />
                </Group>
                <Button size={isMobile ? 'sm' : 'xs'} variant="light" onClick={() => {
                  setNewPetName('');
                  setNewPetModalOpened(true);
                }}>New</Button>
              </Group>


              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">SFX</Text>
                <Switch
                  size="sm"
                  checked={!muted}
                  onChange={(e) => {
                    const next = !e.currentTarget.checked ? true : false;
                    setMuted(next);
                    try { localStorage.setItem('akotchi_sfx_muted_v1', next ? '1' : '0'); } catch { /* ignore */ }
                  }}
                  label={!muted ? 'On' : 'Off'}
                />
              </Group>
              {/* TTS removed */}
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">Auto care</Text>
                <Switch
                  size="sm"
                  checked={autoCare}
                  onChange={(e) => setAutoCare(e.currentTarget.checked)}
                  label={autoCare ? 'On' : 'Off'}
                />
              </Group>
              <Group wrap="wrap" gap={isMobile ? 'sm' : 'md'}>
                <StatBar label="Hunger" value={state.hunger} color="yellow" />
                <StatBar 
                  label={state.happiness < 15 ? "Happiness 😢" : "Happiness"} 
                  value={state.happiness} 
                  color={state.happiness < 15 ? "red" : "pink"} 
                />
                <StatBar label="Energy" value={state.energy} color="blue" />
                <StatBar label="Health" value={state.health} color="green" />
              </Group>

              <Group wrap={"wrap"} gap={isMobile ? 'sm' : 'md'} style={{ rowGap: isMobile ? 8 : 12 }}>
                <Button onClick={feed} variant="light" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.feed || 0)}
                  style={{ minWidth: isMobile ? 140 : 160, whiteSpace: 'nowrap' }}>
                  Feed {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.feed || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.feed || 0)))})` : ''}
                </Button>
                <Button onClick={play} variant="light" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.play || 0)}
                  style={{ minWidth: isMobile ? 140 : 160, whiteSpace: 'nowrap' }}>
                  Play {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.play || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.play || 0)))})` : ''}
                </Button>
                <Button onClick={sleep} variant="light" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.sleep || 0)}
                  style={{ minWidth: isMobile ? 140 : 160, whiteSpace: 'nowrap' }}>
                  Sleep {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.sleep || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.sleep || 0)))})` : ''}
                </Button>
                <Button onClick={clean} variant="light" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.clean || 0)}
                  style={{ minWidth: isMobile ? 140 : 160, whiteSpace: 'nowrap' }}>
                  Clean {(state.messCount || 0) > 0 ? `💩×${state.messCount}` : ''} {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.clean || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.clean || 0)))})` : ''}
                </Button>
                <Button onClick={heal} variant="light" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.heal || 0)}
                  style={{ minWidth: isMobile ? 140 : 160, whiteSpace: 'nowrap' }}>
                  Heal {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.heal || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.heal || 0)))})` : ''}
                </Button>
                <Button onClick={scold} variant="outline" color="red" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.scold || 0)}
                  style={{ minWidth: isMobile ? 140 : 160, whiteSpace: 'nowrap' }}>
                  Scold {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.scold || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.scold || 0)))})` : ''}
                </Button>

              </Group>
              <Text size={isMobile ? 'xs' : 'sm'} c="dimmed">
                {state.busyUntil && Date.now() < state.busyUntil ? `Busy: ${formatSeconds(msRemaining(state.busyUntil))}` : 'Ready for actions'}
              </Text>

              <Text size={isMobile ? 'xs' : 'sm'} c="dimmed">
                Tip: {state.name} keeps living even when you close the tab. Come back later to see how they&apos;re doing.
              </Text>
              
              {/* Crying warning */}
              {state.happiness < 15 && (
                <Text size={isMobile ? 'xs' : 'sm'} c="red" ta="center" fw={600}>
                  😢 {state.name} is crying and needs immediate attention!
                </Text>
              )}
                </Stack>
              </Group>
            </Stack>
          </Card>
        )}

        <Card withBorder radius="md" padding={isMobile ? 'sm' : 'md'}>
          <Title order={isMobile ? 5 : 4} mb="xs">About Akotchi</Title>
          <Text size={isMobile ? 'xs' : 'sm'} c="dimmed">
            A retro Tamagotchi-inspired pet. Stats decay in real time with personality-based modifiers. Actions update stats and persist in localStorage. Pixel art is rendered directly on canvas for a clean, dependency-free experience.
          </Text>
        </Card>

        {/* Export Modal */}
        <Modal opened={exportOpen} onClose={closeShare} title="Export Akotchi" centered>
          <Stack gap="md" align="center">
            <Text size="sm" c="dimmed">Scan this QR code on another device to import your Akotchi.</Text>
            <Box>
              <QRExporter value={shareUrlFrozen || shareableUrl} />
            </Box>
            <Group>
              <Button size="xs" variant="light" onClick={copyShareUrl}>Copy link</Button>
            </Group>
          </Stack>
        </Modal>

        {/* Import Modal removed – importing happens via opening the shared link */}
      </Stack>

      {/* New Pet Modal */}
      <Modal
        opened={newPetModalOpened}
        onClose={() => setNewPetModalOpened(false)}
        title="Create New Akotchi"
        centered
        size="sm"
      >
        <Stack gap="md">
          <TextInput
            label="Pet Name"
            placeholder="Enter a name for your new Akotchi..."
            value={newPetName}
            onChange={(e) => setNewPetName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newPetName.trim()) {
                createPet(newPetName.trim());
                setNewPetModalOpened(false);
              }
            }}
          />
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => setNewPetModalOpened(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newPetName.trim()) {
                  createPet(newPetName.trim());
                  setNewPetModalOpened(false);
                }
              }}
              disabled={!newPetName.trim()}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default Akotchi;


