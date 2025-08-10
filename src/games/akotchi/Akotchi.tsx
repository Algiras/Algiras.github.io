import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Container, Group, Progress, Stack, Text, Title, Switch, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';
import { useMachine } from '@xstate/react';
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

const Akotchi: React.FC = () => {
  useDocumentTitle('Akotchi — Retro Tamagotchi-Inspired Game');
  const { state, setState, applyElapsedTick, store, createPet, selectPet } = useAkotchiState();
  const [animState, setAnimState] = useState<AnimationState>('Idle');
  const [animUntil, setAnimUntil] = useState<number>(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('akotchi_notify_enabled_v1') === '1'; } catch { return false; }
  });
  const [muted, setMuted] = useState<boolean>(() => {
    try { return localStorage.getItem('akotchi_sfx_muted_v1') === '1'; } catch { return false; }
  });
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('akotchi_tts_enabled_v1') === '1'; } catch { return false; }
  });
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  useEffect(() => {
    Howler.mute(muted);
  }, [muted]);

  // Tiny in-web LLM to generate pet messages (runs on-device)
  const [llmReady, setLlmReady] = useState(false);
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
  const sfxRef = useRef<{ feed?: Howl; play?: Howl; sleep?: Howl; clean?: Howl; heal?: Howl; scold?: Howl } | null>(null);
  const ensureSfx = useCallback(() => {
    if (sfxRef.current) return;
    sfxRef.current = {
      feed: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.3 }),
      play: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.3 }),
      sleep: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.25 }),
      clean: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.2 }),
      heal: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.3 }),
      scold: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA='], volume: 0.35 })
    };
  }, []);

  // Web Speech Synthesis (built-in browser TTS)
  const canTts = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const speak = useCallback((text: string) => {
    if (!canTts || !ttsEnabled || !text || !userInteracted) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      utter.pitch = 1.1;
      utter.volume = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch { /* ignore */ }
  }, [ttsEnabled, canTts, userInteracted]);

  const deriveAnimFromStats = useCallback((s: AkotchiState): AnimationState => {
    if (s.sick || s.health < 35) return 'Sick';
    if (s.energy < 20) return 'LowEnergy';
    if (s.hunger < 25) return 'Hungry';
    if (s.happiness < 25) return 'Sad';
    if (s.happiness > 80 && s.energy > 40) return 'Happy';
    return 'Idle';
  }, []);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const workerRef = useRef<Worker | null>(null);

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
        const data = e.data as { type: 'REQUEST' | 'SUGGEST_MESSAGE'; petId: string; request?: string; reason?: string; at: number } | any;
        if (data?.type === 'REQUEST') {
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
            speak(`${state.name} needs ${String(data.request || '').toLowerCase()}: ${data.reason}`);
          }
        } else if (data?.type === 'SUGGEST_MESSAGE') {
          // Ask the on-device LLM to compose something friendly
          requestPetMessage();
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
      isDead: state.isDead,
      lastUpdated: state.lastUpdated,
    };
    try { w.postMessage({ type: 'STATE', snapshot }); } catch { /* ignore */ }
  }, [state.id, state.name, state.hunger, state.energy, state.health, state.isDead, state.lastUpdated]);

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
      renderDrawAkotchi(ctx, canvas.width, canvas.height, state, now, effectiveAnim, theme);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [applyElapsedTick, state, animState, animUntil, deriveAnimFromStats, fsm.value, theme]);

  // Sync machine to death when needed
  useEffect(() => {
    if (state.isDead) send({ type: 'DIE' });
  }, [state.isDead, send]);

  // Actions
  const setTempAnim = useCallback((anim: AnimationState, durationMs = 1800) => {
    const now = performance.now();
    setAnimState(anim);
    setAnimUntil(now + durationMs);
  }, []);

  const adoptNew = useCallback(() => {
    const name = prompt('Give your new Akotchi a name:') || '';
    setAnimState('Idle');
    setAnimUntil(0);
    createPet(name);
    setUserInteracted(true);
  }, [createPet]);

  const feed = useCallback(() => {
    ensureSfx();
    sfxRef.current?.feed?.play();
    // Machine guards handle availability; component just sends
    setTempAnim('Eating', 8000);
    send({ type: 'FEED' });
    setUserInteracted(true);
  }, [send, setTempAnim, ensureSfx]);

  const play = useCallback(() => {
    ensureSfx();
    sfxRef.current?.play?.play();
    setTempAnim('Playing', 10000);
    send({ type: 'PLAY' });
    setUserInteracted(true);
  }, [send, setTempAnim, ensureSfx]);

  const sleep = useCallback(() => {
    ensureSfx();
    sfxRef.current?.sleep?.play();
    setTempAnim('Sleeping', 12000);
    send({ type: 'SLEEP' });
    setUserInteracted(true);
  }, [send, setTempAnim, ensureSfx]);

  const clean = useCallback(() => {
    ensureSfx();
    sfxRef.current?.clean?.play();
    setTempAnim('Happy', 5000);
    send({ type: 'CLEAN' });
    setUserInteracted(true);
  }, [send, setTempAnim, ensureSfx]);

  const heal = useCallback(() => {
    ensureSfx();
    sfxRef.current?.heal?.play();
    setTempAnim('Happy', 8000);
    send({ type: 'HEAL' });
    setUserInteracted(true);
  }, [send, setTempAnim, ensureSfx]);

  const scold = useCallback(() => {
    ensureSfx();
    sfxRef.current?.scold?.play();
    setTempAnim('Sad', 5000);
    send({ type: 'SCOLD' });
    setUserInteracted(true);
  }, [send, setTempAnim, ensureSfx]);

  // Ask LLM to compose a short message occasionally via worker requests or low needs
  const requestPetMessage = useCallback(async () => {
    const ok = await ensureLlm();
    if (!ok || !llmRef.current) return;
    const s = state;
    const system = `You are ${s.name}, a wholesome retro virtual pet (personality: ${s.personality}). Style: playful, caring, concise. Constraints: exactly one sentence under 18 words. Never be manipulative; encourage healthy care and breaks.`;
    const user = `Current stats — hunger ${Math.round(s.hunger)}, energy ${Math.round(s.energy)}, happiness ${Math.round(s.happiness)}, health ${Math.round(s.health)}. Compose a friendly message to your human about what you need.`;
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
        speak(text);
      }
    } catch {
      // ignore
    }
  }, [ensureLlm, state, speak]);

  const talk = useCallback(() => {
    setUserInteracted(true);
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
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">Voice (TTS)</Text>
                <Switch
                  size="sm"
                  checked={ttsEnabled}
                  onChange={(e) => {
                    const next = e.currentTarget.checked;
                    setTtsEnabled(next);
                    try { localStorage.setItem('akotchi_tts_enabled_v1', next ? '1' : '0'); } catch { /* ignore */ }
                  }}
                  disabled={!canTts}
                  label={canTts ? (ttsEnabled ? 'On' : 'Off') : 'Unavailable'}
                />
              </Group>
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
                <StatBar label="Happiness" value={state.happiness} color="pink" />
                <StatBar label="Energy" value={state.energy} color="blue" />
                <StatBar label="Health" value={state.health} color="green" />
              </Group>

              <Group wrap={isMobile ? 'wrap' : 'nowrap'} gap={isMobile ? 'sm' : 'md'}>
                <Button onClick={feed} variant="light" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.feed || 0)}>
                  Feed {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.feed || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.feed || 0)))})` : ''}
                </Button>
                <Button onClick={play} variant="light" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.play || 0)}>
                  Play {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.play || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.play || 0)))})` : ''}
                </Button>
                <Button onClick={sleep} variant="light" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.sleep || 0)}>
                  Sleep {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.sleep || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.sleep || 0)))})` : ''}
                </Button>
                <Button onClick={clean} variant="light" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.clean || 0)}>
                  Clean {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.clean || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.clean || 0)))})` : ''}
                </Button>
                <Button onClick={heal} variant="light" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.heal || 0)}>
                  Heal {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.heal || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.heal || 0)))})` : ''}
                </Button>
                <Button onClick={scold} variant="outline" color="red" fullWidth={isMobile} disabled={Date.now() < (state.busyUntil || 0) || Date.now() < (state.cooldowns?.scold || 0)}>
                  Scold {msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.scold || 0)) > 0 ? `(${formatSeconds(msRemaining(Math.max(state.busyUntil || 0, state.cooldowns?.scold || 0)))})` : ''}
                </Button>
                <Button onClick={talk} variant="subtle" fullWidth={isMobile}>
                  Talk
                </Button>
              </Group>
              <Text size={isMobile ? 'xs' : 'sm'} c="dimmed">
                {state.busyUntil && Date.now() < state.busyUntil ? `Busy: ${formatSeconds(msRemaining(state.busyUntil))}` : 'Ready for actions'}
              </Text>

              <Text size={isMobile ? 'xs' : 'sm'} c="dimmed">
                Tip: {state.name} keeps living even when you close the tab. Come back later to see how they&apos;re doing.
              </Text>
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
      </Stack>
    </Container>
  );
};

export default Akotchi;


