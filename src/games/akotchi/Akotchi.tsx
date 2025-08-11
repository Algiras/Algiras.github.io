import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Container, Group, Progress, Stack, Text, Title, Switch, Select, Modal, Textarea, Loader } from '@mantine/core';
import { QRCodeCanvas } from 'qrcode.react';
import { notifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';
import { useMachine } from '@xstate/react';
import { useSearchParams } from 'react-router-dom';
import { petMachine } from './machine';
import { useDocumentTitle } from '../../utils/documentUtils';
import { AkotchiState, AnimationState } from './types';
import { createNewAkotchi, updateByElapsed, PETS_KEY, SELECTED_KEY, STORAGE_KEY } from './state';
// use draw from render module
import { drawAkotchi as renderDrawAkotchi } from './render';
import { useTheme } from '../../context/ThemeContext';
import { msRemaining, formatSeconds } from './utils';
import { Howl, Howler } from 'howler';

type PetsStore = { pets: AkotchiState[]; selectedId: string };

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
  const [animState, setAnimState] = useState<AnimationState>('Idle');
  const [animUntil, setAnimUntil] = useState<number>(0);
  const [showThoughtBubble, setShowThoughtBubble] = useState<boolean>(false);
  const [thoughtBubbleUntil, setThoughtBubbleUntil] = useState<number>(0);
  // Removed unused modal state
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('akotchi_notify_enabled_v1') === '1'; } catch { return false; }
  });
  const [muted, setMuted] = useState<boolean>(() => {
    try { return localStorage.getItem('akotchi_sfx_muted_v1') === '1'; } catch { return false; }
  });
  
  useEffect(() => {
    Howler.mute(muted);
  }, [muted]);

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
    sfxRef.current = {
      feed: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.3 }),
      play: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.3 }),
      sleep: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.25 }),
      clean: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.2 }),
      heal: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.3 }),
      scold: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.35 }),
      crying: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.4 })
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
          
          // Surface as Notification if enabled, also subtle UI toast via alert as fallback
          if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            try { new Notification(`${state.name} requests ${data.request.toLowerCase()}!`, { body: data.reason }); } catch { /* ignore */ }
          } else {
            notifications.show({
              color: 'yellow',
              title: `${state.name} needs ${data.request.toLowerCase()}`,
              message: data.reason,
              withCloseButton: true,
              autoClose: 4000,
            });
          }
        } else if (data?.type === 'SUGGEST_MESSAGE') {
          // Ask the on-device LLM to compose something friendly
          requestPetMessage();
          // Show thought bubble briefly
          setShowThoughtBubble(true);
          setThoughtBubbleUntil(Date.now() + 3000);
        } else if (data?.type === 'CRYING') {
          // Handle crying notifications with higher priority
          if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            try { 
              new Notification(`${state.name} is crying! 😢`, { 
                body: data.reason,
                icon: '/favicon.ico', // Add icon if available
                tag: 'akotchi-crying', // Group crying notifications
                requireInteraction: true, // Keep notification visible
                silent: false // Allow sound
              }); 
            } catch { /* ignore */ }
          }
          
          // Show in-app notification as well
          notifications.show({
            color: 'red',
            title: `${state.name} is crying! 😢`,
            message: data.reason,
            withCloseButton: true,
            autoClose: 8000, // Keep crying notifications visible longer
            icon: '😢'
          });
          
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

  // Simple 8-12 FPS loop
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
      if (text) notifications.show({ color: 'blue', title: `${next.name} says`, message: text, autoClose: 6000 });
    } catch {
      // ignore
    } finally { setLlmBusy(false); }
  }, [ensureLlm, llmBusy]);

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
        notifications.show({ color: 'blue', title: `${s.name} says`, message: text, autoClose: 6000 });
      }
    } catch {
      // ignore
    } finally { setLlmBusy(false); }
  }, [ensureLlm, state, llmBusy]);

  

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
        notifications.show({ 
          color: 'yellow', 
          title: `${s.name} needs something!`, 
          message: text, 
          autoClose: 7000,
          icon: '💭'
        });
        // Show thought bubble briefly
        setShowThoughtBubble(true);
        setThoughtBubbleUntil(Date.now() + 4000);
      }
    } catch {
      // ignore
    } finally { setLlmBusy(false); }
  }, [ensureLlm, state, llmBusy]);

  const talk = useCallback(() => {
    requestPetMessage();
  }, [requestPetMessage]);

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

  // Notifications: hungry reminders
  const canNotify = typeof window !== 'undefined' && 'Notification' in window;
  const requestEnableNotifications = useCallback(async () => {
    if (!canNotify) return;
    try {
      const permission = await Notification.requestPermission();
      const ok = permission === 'granted';
      setNotificationsEnabled(ok);
      try { localStorage.setItem('akotchi_notify_enabled_v1', ok ? '1' : '0'); } catch { /* ignore */ }
    } catch { /* ignore */ }
  }, [canNotify]);

  useEffect(() => {
    if (!notificationsEnabled || !canNotify) return;
    if (document.visibilityState !== 'hidden') return; // only notify when not visible
    const now = Date.now();
    if (state.hunger < 25) {
      let last = 0;
      try { last = parseInt(localStorage.getItem('akotchi_notify_hungry_last_v1') || '0', 10); } catch { /* ignore */ }
      if (isNaN(last)) last = 0;
      if (now - last > 30 * 60 * 1000) { // 30 minutes
        try { new Notification('Akotchi is hungry! 🍎', { body: 'Come back and feed your Akotchi.' }); } catch { /* ignore */ }
        try { localStorage.setItem('akotchi_notify_hungry_last_v1', String(now)); } catch { /* ignore */ }
      }
    }
  }, [notificationsEnabled, canNotify, state.hunger]);

  // Toast on stage-up
  useEffect(() => {
    if (!state.lastStageUpAt || !state.lastStageUpStage) return;
    const now = Date.now();
    // Only show once within a few seconds of update
    if (now - state.lastStageUpAt < 5000) {
      notifications.show({
        color: 'teal',
        title: `${state.name} advanced to ${state.lastStageUpStage}!`,
        message: 'A new cosmetic has been unlocked.',
        autoClose: 5000,
      });
      ensureSfx();
      sfxRef.current?.play?.play();
    }
  }, [state.lastStageUpAt, state.lastStageUpStage, state.name, ensureSfx]);

  const hoursStr = useMemo(() => `${Math.floor(state.ageHours)}h ${Math.floor((state.ageHours % 1) * 60)}m`, [state.ageHours]);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [exportOpen, setExportOpen] = useState(false);

  const exportPayload = useMemo(() => {
    const payload = { version: 1, pet: state };
    try { return JSON.stringify(payload); } catch { return ''; }
  }, [state]);

  // Generate shareable URL
  const shareableUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedPet = encodeURIComponent(exportPayload);
    return `${baseUrl}?pet=${encodedPet}`;
  }, [exportPayload]);

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
    const petParam = searchParams.get('pet');
    if (petParam) {
      try {
        const decodedPet = decodeURIComponent(petParam);
        const parsed = JSON.parse(decodedPet);
        const sanitized = sanitizeImportedPet(parsed, state.id);
        if (sanitized) {
          setState(() => ({ ...sanitized, id: state.id, lastUpdated: Date.now() }));
          notifications.show({ 
            color: 'teal', 
            title: 'Imported from URL', 
            message: 'Akotchi state loaded from shared link.', 
            autoClose: 3000 
          });
          // Clear the URL parameter after successful import
          setSearchParams({});
        }
      } catch (error) {
        console.error('Failed to import pet from URL:', error);
        notifications.show({ 
          color: 'red', 
          title: 'Import failed', 
          message: 'Could not parse pet data from URL.', 
          autoClose: 4000 
        });
        // Clear the invalid URL parameter
        setSearchParams({});
      }
    }
  }, [searchParams, setSearchParams, sanitizeImportedPet, setState, state.id]);

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
          <Group align="start" gap={isMobile ? 'md' : 'xl'} wrap={isMobile ? 'wrap' : 'nowrap'}>
            <Box style={{
              width: isMobile ? '100%' : 320,
              height: isMobile ? 'auto' : 240,
              border: '3px solid var(--mantine-color-default-border)',
              background: theme === 'dark' ? 'var(--mantine-color-dark-8)' : 'var(--mantine-color-gray-0)',
              imageRendering: 'pixelated' as any,
            }}>
              <canvas ref={canvasRef} width={320} height={240} style={{ width: '100%', height: '100%' }} />
            </Box>

            <Stack gap={isMobile ? 'sm' : 'md'} style={{ flex: 1, minWidth: isMobile ? '100%' : 260 }}>
              <Group justify="space-between" align="center">
                <Button size={isMobile ? 'xs' : 'xs'} variant="light" onClick={() => setExportOpen(true)}>Share</Button>
                <Button size={isMobile ? 'xs' : 'xs'} variant="light" component="a" href={shareableUrl} target="_blank" rel="noopener noreferrer">Open Link</Button>
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
                  const name = prompt('Give your new Akotchi a name:') || '';
                  createPet(name);
                }}>New</Button>
              </Group>

              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">Reminders</Text>
                <Switch
                  size="sm"
                  checked={notificationsEnabled}
                  onChange={(e) => {
                    const next = e.currentTarget.checked;
                    if (next && Notification?.permission !== 'granted') {
                      requestEnableNotifications();
                    } else {
                      setNotificationsEnabled(next);
                      try { localStorage.setItem('akotchi_notify_enabled_v1', next ? '1' : '0'); } catch { /* ignore */ }
                    }
                  }}
                  onClick={(e) => {
                    const target = e.currentTarget as HTMLInputElement;
                    if (!notificationsEnabled && target.checked) {
                      // Ensure we request permission on user gesture
                      requestEnableNotifications();
                    }
                  }}
                  disabled={!canNotify}
                  label={canNotify ? (notificationsEnabled ? 'On' : 'Off') : 'Unavailable'}
                />
              </Group>
              {notificationsEnabled && (
                <Text size="xs" c="dimmed" ta="center">
                  💡 You&apos;ll get notifications when {state.name} is hungry, tired, sick, or crying
                </Text>
              )}
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
                  Clean {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.clean || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.clean || 0)))})` : ''}
                </Button>
                <Button onClick={heal} variant="light" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.heal || 0)}
                  style={{ minWidth: isMobile ? 140 : 160, whiteSpace: 'nowrap' }}>
                  Heal {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.heal || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.heal || 0)))})` : ''}
                </Button>
                <Button onClick={scold} variant="outline" color="red" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.scold || 0)}
                  style={{ minWidth: isMobile ? 140 : 160, whiteSpace: 'nowrap' }}>
                  Scold {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.scold || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.scold || 0)))})` : ''}
                </Button>
                <Button onClick={talk} variant="light" fullWidth={isMobile}
                  disabled={llmBusy}
                  style={{ minWidth: isMobile ? 140 : 160, whiteSpace: 'nowrap' }}>
                  {llmBusy ? (
                    <Group gap={6} align="center">
                      <Loader size="xs" />
                      <Text size="sm">Composing…</Text>
                    </Group>
                  ) : 'Talk'}
                </Button>
                <Button onClick={() => generateProactiveMessage('something')} variant="light" fullWidth={isMobile}
                  disabled={llmBusy}
                  style={{ minWidth: isMobile ? 180 : 220, whiteSpace: 'nowrap' }}>
                  {llmBusy ? (
                    <Group gap={6} align="center">
                      <Loader size="xs" />
                      <Text size="sm">Thinking…</Text>
                    </Group>
                  ) : 'What do you think?'}
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
        </Card>
        )}

        <Card withBorder radius="md" padding={isMobile ? 'sm' : 'md'}>
          <Title order={isMobile ? 5 : 4} mb="xs">About Akotchi</Title>
          <Text size={isMobile ? 'xs' : 'sm'} c="dimmed">
            A retro Tamagotchi-inspired pet. Stats decay in real time with personality-based modifiers. Actions update stats and persist in localStorage. Pixel art is rendered directly on canvas for a clean, dependency-free experience.
          </Text>
        </Card>

        {/* Export Modal */}
        <Modal opened={exportOpen} onClose={() => setExportOpen(false)} title="Export Akotchi" centered>
          <Stack gap="md" align="center">
            <Text size="sm" c="dimmed">Share your Akotchi via QR code or link.</Text>
            <Box>
              <QRExporter value={shareableUrl} />
            </Box>
            <Group gap="xs" align="end">
              <Textarea 
                readOnly 
                value={shareableUrl} 
                autosize 
                minRows={2} 
                label="Shareable URL" 
                styles={{ input: { fontFamily: 'monospace', fontSize: '12px' } }}
                style={{ flex: 1 }}
              />
              <Button 
                size="xs" 
                variant="light" 
                onClick={() => {
                  navigator.clipboard.writeText(shareableUrl);
                  notifications.show({ 
                    color: 'green', 
                    title: 'Copied!', 
                    message: 'Shareable URL copied to clipboard', 
                    autoClose: 2000 
                  });
                }}
              >
                Copy
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Import Modal removed – importing happens via opening the shared link */}
      </Stack>
    </Container>
  );
};

export default Akotchi;


