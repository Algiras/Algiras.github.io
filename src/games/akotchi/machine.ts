import { createMachine } from 'xstate';
import { ActionKey, AkotchiState } from './types';
import { clamp } from './state';

export type PetContext = {
  getPet: () => AkotchiState;
  setPet: (updater: (prev: AkotchiState) => AkotchiState) => void;
};

export type PetEvent =
  | { type: 'FEED' }
  | { type: 'PLAY' }
  | { type: 'SLEEP' }
  | { type: 'CLEAN' }
  | { type: 'HEAL' }
  | { type: 'SCOLD' }
  | { type: 'DIE' };

export const ACTION_BUSY_MS: Record<ActionKey, number> = {
  feed: 8000,
  play: 10000,
  sleep: 12000,
  clean: 5000,
  heal: 8000,
  scold: 5000,
};

export const ACTION_COOLDOWN_MS: Record<ActionKey, number> = {
  feed: 60_000,
  play: 90_000,
  sleep: 120_000,
  clean: 45_000,
  heal: 180_000,
  scold: 60_000,
};

export const petMachine = createMachine({
  id: 'akotchi',
  types: {} as { context: PetContext; events: PetEvent },
  context: ({ input }: { input: PetContext }) => input,
  initial: 'idle',
  states: {
    dead: { type: 'final' },
    idle: {
      on: {
        FEED: { guard: 'canFeed', target: 'feeding', actions: 'doFeed' },
        PLAY: { guard: 'canPlay', target: 'playing', actions: 'doPlay' },
        SLEEP: { guard: 'canSleep', target: 'sleeping', actions: 'doSleep' },
        CLEAN: { guard: 'canClean', target: 'cleaning', actions: 'doClean' },
        HEAL: { guard: 'canHeal', target: 'healing', actions: 'doHeal' },
        SCOLD: { guard: 'canScold', target: 'scolded', actions: 'doScold' },
        DIE: 'dead',
      },
    },
    feeding: { after: { FEED_DELAY: 'idle' } },
    playing: { after: { PLAY_DELAY: 'idle' } },
    sleeping: { after: { SLEEP_DELAY: 'idle' } },
    cleaning: { after: { CLEAN_DELAY: 'idle' } },
    healing: { after: { HEAL_DELAY: 'idle' } },
    scolded: { after: { SCOLD_DELAY: 'idle' } },
  },
}, {
  guards: {
    canFeed: ({ context }) => {
      const s = context.getPet();
      const now = Date.now();
      if (s.isDead) return false;
      if (s.busyUntil && s.busyUntil > now) return false;
      return !s.cooldowns?.feed || s.cooldowns.feed <= now;
    },
    canPlay: ({ context }) => {
      const s = context.getPet();
      const now = Date.now();
      if (s.isDead) return false;
      if (s.busyUntil && s.busyUntil > now) return false;
      return !s.cooldowns?.play || s.cooldowns.play <= now;
    },
    canSleep: ({ context }) => {
      const s = context.getPet();
      const now = Date.now();
      if (s.isDead) return false;
      if (s.busyUntil && s.busyUntil > now) return false;
      return !s.cooldowns?.sleep || s.cooldowns.sleep <= now;
    },
    canClean: ({ context }) => {
      const s = context.getPet();
      const now = Date.now();
      if (s.isDead) return false;
      if (s.busyUntil && s.busyUntil > now) return false;
      return !s.cooldowns?.clean || s.cooldowns.clean <= now;
    },
    canHeal: ({ context }) => {
      const s = context.getPet();
      const now = Date.now();
      if (s.isDead) return false;
      if (s.busyUntil && s.busyUntil > now) return false;
      return !s.cooldowns?.heal || s.cooldowns.heal <= now;
    },
    canScold: ({ context }) => {
      const s = context.getPet();
      const now = Date.now();
      if (s.isDead) return false;
      if (s.busyUntil && s.busyUntil > now) return false;
      return !s.cooldowns?.scold || s.cooldowns.scold <= now;
    },
  },
  delays: {
    FEED_DELAY: () => ACTION_BUSY_MS.feed,
    PLAY_DELAY: () => ACTION_BUSY_MS.play,
    SLEEP_DELAY: () => ACTION_BUSY_MS.sleep,
    CLEAN_DELAY: () => ACTION_BUSY_MS.clean,
    HEAL_DELAY: () => ACTION_BUSY_MS.heal,
    SCOLD_DELAY: () => ACTION_BUSY_MS.scold,
  },
  actions: {
    doFeed: ({ context }) => {
      const now = Date.now();
      context.setPet((prev) => ({
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
    doPlay: ({ context }) => {
      const now = Date.now();
      context.setPet((prev) => ({
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
    doSleep: ({ context }) => {
      const now = Date.now();
      context.setPet((prev) => ({
        ...prev,
        energy: clamp(prev.energy + 20),
        hunger: clamp(prev.hunger - 6),
        lastUpdated: now,
        busyUntil: now + ACTION_BUSY_MS.sleep,
        cooldowns: { ...(prev.cooldowns || {}), sleep: now + ACTION_COOLDOWN_MS.sleep },
        petState: 'Sleeping',
      }));
    },
    doClean: ({ context }) => {
      const now = Date.now();
      context.setPet((prev) => ({
        ...prev,
        happiness: clamp(prev.happiness + 4),
        lastUpdated: now,
        busyUntil: now + ACTION_BUSY_MS.clean,
        cooldowns: { ...(prev.cooldowns || {}), clean: now + ACTION_COOLDOWN_MS.clean },
        petState: 'Cleaning',
      }));
    },
    doHeal: ({ context }) => {
      const now = Date.now();
      context.setPet((prev) => ({
        ...prev,
        health: clamp(prev.health + 18),
        sick: prev.health + 18 > 45 ? false : prev.sick,
        lastUpdated: now,
        busyUntil: now + ACTION_BUSY_MS.heal,
        cooldowns: { ...(prev.cooldowns || {}), heal: now + ACTION_COOLDOWN_MS.heal },
        petState: 'Healing',
      }));
    },
    doScold: ({ context }) => {
      const now = Date.now();
      context.setPet((prev) => ({
        ...prev,
        health: clamp(prev.health - 12),
        happiness: clamp(prev.happiness - 10),
        lastUpdated: now,
        busyUntil: now + ACTION_BUSY_MS.scold,
        cooldowns: { ...(prev.cooldowns || {}), scold: now + ACTION_COOLDOWN_MS.scold },
        petState: 'Scolded',
      }));
    },
  },
});


