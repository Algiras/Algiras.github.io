import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Container, Group, Progress, Stack, Text, Title, Switch, Select } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useMachine } from '@xstate/react';
import { petMachine } from './machine';
import { useDocumentTitle } from '../../utils/documentUtils';
import { ActionKey, AkotchiState, AnimationState } from './types';
import { createNewAkotchi, updateByElapsed, clamp, PETS_KEY, SELECTED_KEY, STORAGE_KEY } from './state';
// use draw from render module
import { drawAkotchi as renderDrawAkotchi } from './render';
import { msRemaining, formatSeconds } from './utils';

// constants imported above

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

// Action timing configuration (ms)
const ACTION_COOLDOWN_MS: Record<ActionKey, number> = {
  feed: 60_000,
  play: 90_000,
  sleep: 120_000,
  clean: 45_000,
  heal: 180_000,
  scold: 60_000,
};

const ACTION_BUSY_MS: Record<ActionKey, number> = {
  feed: 8_000,
  play: 10_000,
  sleep: 12_000,
  clean: 5_000,
  heal: 8_000,
  scold: 5_000,
};

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

  const deriveAnimFromStats = useCallback((s: AkotchiState): AnimationState => {
    if (s.sick || s.health < 35) return 'Sick';
    if (s.energy < 20) return 'LowEnergy';
    if (s.hunger < 25) return 'Hungry';
    if (s.happiness < 25) return 'Sad';
    if (s.happiness > 80 && s.energy > 40) return 'Happy';
    return 'Idle';
  }, []);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // XState machine to track action states
  const [fsm, send] = useMachine(petMachine, {
    input: {},
    // Inline gate checks before sending; types for guards in xstate v5 via options aren't declared in our setup,
    // so we keep logic in component and let machine handle timing/labels.
  });

  // Derived guard helpers
  const guards = {
      canFeed: () => {
        const now = Date.now();
        return !state.isDead && (!state.busyUntil || state.busyUntil <= now) && (!state.cooldowns?.feed || state.cooldowns.feed <= now);
      },
      canPlay: () => {
        const now = Date.now();
        return !state.isDead && (!state.busyUntil || state.busyUntil <= now) && (!state.cooldowns?.play || state.cooldowns.play <= now);
      },
      canSleep: () => {
        const now = Date.now();
        return !state.isDead && (!state.busyUntil || state.busyUntil <= now) && (!state.cooldowns?.sleep || state.cooldowns.sleep <= now);
      },
      canClean: () => {
        const now = Date.now();
        return !state.isDead && (!state.busyUntil || state.busyUntil <= now) && (!state.cooldowns?.clean || state.cooldowns.clean <= now);
      },
      canHeal: () => {
        const now = Date.now();
        return !state.isDead && (!state.busyUntil || state.busyUntil <= now) && (!state.cooldowns?.heal || state.cooldowns.heal <= now);
      },
      canScold: () => {
        const now = Date.now();
        return !state.isDead && (!state.busyUntil || state.busyUntil <= now) && (!state.cooldowns?.scold || state.cooldowns.scold <= now);
      },
  } as const;

  const machineActions = {
      applyFeed: () => {
        const now = Date.now();
        setState((prev) => ({
          ...prev,
          hunger: clamp(prev.hunger + 18),
          energy: clamp(prev.energy - 4),
          happiness: clamp(prev.happiness + 2),
          lastUpdated: now,
          busyUntil: now + ACTION_BUSY_MS.feed,
          cooldowns: { ...(prev.cooldowns || {}), feed: now + ACTION_COOLDOWN_MS.feed },
          petState: 'Feeding',
        }));
      },
      applyPlay: () => {
        const now = Date.now();
        setState((prev) => ({
          ...prev,
          happiness: clamp(prev.happiness + 16),
          energy: clamp(prev.energy - 8),
          hunger: clamp(prev.hunger - 6),
          lastUpdated: now,
          busyUntil: now + ACTION_BUSY_MS.play,
          cooldowns: { ...(prev.cooldowns || {}), play: now + ACTION_COOLDOWN_MS.play },
          petState: 'Playing',
        }));
      },
      applySleep: () => {
        const now = Date.now();
        setState((prev) => ({
          ...prev,
          energy: clamp(prev.energy + 20),
          hunger: clamp(prev.hunger - 6),
          lastUpdated: now,
          busyUntil: now + ACTION_BUSY_MS.sleep,
          cooldowns: { ...(prev.cooldowns || {}), sleep: now + ACTION_COOLDOWN_MS.sleep },
          petState: 'Sleeping',
        }));
      },
      applyClean: () => {
        const now = Date.now();
        setState((prev) => ({
          ...prev,
          happiness: clamp(prev.happiness + 4),
          lastUpdated: now,
          busyUntil: now + ACTION_BUSY_MS.clean,
          cooldowns: { ...(prev.cooldowns || {}), clean: now + ACTION_COOLDOWN_MS.clean },
          petState: 'Cleaning',
        }));
      },
      applyHeal: () => {
        const now = Date.now();
        setState((prev) => ({
          ...prev,
          health: clamp(prev.health + 18),
          sick: prev.health + 18 > 45 ? false : prev.sick,
          lastUpdated: now,
          busyUntil: now + ACTION_BUSY_MS.heal,
          cooldowns: { ...(prev.cooldowns || {}), heal: now + ACTION_COOLDOWN_MS.heal },
          petState: 'Healing',
        }));
      },
      applyScold: () => {
        const now = Date.now();
        setState((prev) => ({
          ...prev,
          health: clamp(prev.health - 12),
          happiness: clamp(prev.happiness - 10),
          lastUpdated: now,
          busyUntil: now + ACTION_BUSY_MS.scold,
          cooldowns: { ...(prev.cooldowns || {}), scold: now + ACTION_COOLDOWN_MS.scold },
          petState: 'Scolded',
        }));
      },
  };

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
      renderDrawAkotchi(ctx, canvas.width, canvas.height, state, now, effectiveAnim);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [applyElapsedTick, state, animState, animUntil, deriveAnimFromStats, fsm.value]);

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
  }, [createPet]);

  const feed = useCallback(() => {
    if (!guards.canFeed()) return;
    machineActions.applyFeed();
    setTempAnim('Eating', ACTION_BUSY_MS.feed);
    send({ type: 'FEED' });
  }, [guards, machineActions, setTempAnim, send]);

  const play = useCallback(() => {
    if (!guards.canPlay()) return;
    machineActions.applyPlay();
    setTempAnim('Playing', ACTION_BUSY_MS.play);
    send({ type: 'PLAY' });
  }, [guards, machineActions, setTempAnim, send]);

  const sleep = useCallback(() => {
    if (!guards.canSleep()) return;
    machineActions.applySleep();
    setTempAnim('Sleeping', ACTION_BUSY_MS.sleep);
    send({ type: 'SLEEP' });
  }, [guards, machineActions, setTempAnim, send]);

  const clean = useCallback(() => {
    if (!guards.canClean()) return;
    machineActions.applyClean();
    setTempAnim('Happy', ACTION_BUSY_MS.clean);
    send({ type: 'CLEAN' });
  }, [guards, machineActions, setTempAnim, send]);

  const heal = useCallback(() => {
    if (!guards.canHeal()) return;
    machineActions.applyHeal();
    setTempAnim('Happy', ACTION_BUSY_MS.heal);
    send({ type: 'HEAL' });
  }, [guards, machineActions, setTempAnim, send]);

  const scold = useCallback(() => {
    if (!guards.canScold()) return;
    machineActions.applyScold();
    setTempAnim('Sad', ACTION_BUSY_MS.scold);
    send({ type: 'SCOLD' });
  }, [guards, machineActions, setTempAnim, send]);

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

  const hoursStr = useMemo(() => `${Math.floor(state.ageHours)}h ${Math.floor((state.ageHours % 1) * 60)}m`, [state.ageHours]);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Container size={isMobile ? 'xs' : 'lg'} px={isMobile ? 'sm' : undefined}>
      <Stack gap={isMobile ? 'md' : 'lg'}>
        <Group justify="space-between" align="center" wrap={isMobile ? 'wrap' : 'nowrap'}>
          <Stack gap={2}>
            <Title order={isMobile ? 3 : 2}>{state.name}</Title>
            <Text size={isMobile ? 'xs' : 'sm'} c="dimmed">Your unique pet — Personality: {state.personality}</Text>
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
              background: 'var(--mantine-color-dark-8)',
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


