import { createMachine } from 'xstate';
import { clamp, updateByElapsed } from './state';
import { ActionKey, AkotchiState } from './types';

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
  | { type: 'DIE' }
  | { type: 'TICK' };

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

export const petMachine = createMachine(
  {
    id: 'akotchi',
    types: {} as { context: PetContext; events: PetEvent },
    context: ({ input }: { input: PetContext }) => input,
    initial: 'idle',
    on: {
      TICK: { actions: 'applyTick' },
    },
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
  },
  {
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
      applyTick: ({ context }) => {
        // Apply elapsed time decay using existing updateByElapsed logic
        const now = Date.now();
        context.setPet(prev => {
          const elapsed = Math.max(0, now - prev.lastUpdated);
          if (elapsed <= 0) return prev;
          // Allow larger time chunks for proper poop generation, but limit to reasonable max to avoid huge jumps
          const next = updateByElapsed(prev, Math.min(elapsed, 60000)); // Max 1 minute per tick
          if (prev.stage !== next.stage) {
            return {
              ...next,
              lastStageUpAt: now,
              lastStageUpStage: next.stage,
            } as AkotchiState;
          }
          return next;
        });
      },
      doFeed: ({ context }) => {
        const now = Date.now();
        context.setPet(prev => {
          const windowMs = 10 * 60 * 1000;
          const recent = (prev.recentActions || []).filter(
            r => now - r.at <= windowMs
          );
          const countSame = recent.filter(r => r.action === 'feed').length;
          const factors = [1, 0.7, 0.4, 0.2];
          const f = factors[Math.min(countSame, factors.length - 1)];
          return {
            ...prev,
            hunger: clamp(prev.hunger + 18 * f),
            energy: clamp(prev.energy - 4),
            happiness: clamp(prev.happiness + 2 * f),
            lastUpdated: now,
            busyUntil: now + ACTION_BUSY_MS.feed,
            cooldowns: {
              ...(prev.cooldowns || {}),
              feed: now + ACTION_COOLDOWN_MS.feed,
            },
            petState: 'Feeding',
            lastInteractionAt: now,
            recentActions: [...recent, { action: 'feed', at: now }],
          } as AkotchiState;
        });
      },
      doPlay: ({ context }) => {
        const now = Date.now();
        context.setPet(prev => {
          const windowMs = 10 * 60 * 1000;
          const recent = (prev.recentActions || []).filter(
            r => now - r.at <= windowMs
          );
          const countSame = recent.filter(r => r.action === 'play').length;
          const factors = [1, 0.7, 0.4, 0.2];
          const f = factors[Math.min(countSame, factors.length - 1)];
          return {
            ...prev,
            happiness: clamp(prev.happiness + 16 * f),
            energy: clamp(prev.energy - 8),
            hunger: clamp(prev.hunger - 6),
            lastUpdated: now,
            busyUntil: now + ACTION_BUSY_MS.play,
            cooldowns: {
              ...(prev.cooldowns || {}),
              play: now + ACTION_COOLDOWN_MS.play,
            },
            petState: 'Playing',
            lastInteractionAt: now,
            recentActions: [...recent, { action: 'play', at: now }],
          } as AkotchiState;
        });
      },
      doSleep: ({ context }) => {
        const now = Date.now();
        context.setPet(prev => {
          const windowMs = 10 * 60 * 1000;
          const recent = (prev.recentActions || []).filter(
            r => now - r.at <= windowMs
          );
          const countSame = recent.filter(r => r.action === 'sleep').length;
          const factors = [1, 0.8, 0.5, 0.3];
          const f = factors[Math.min(countSame, factors.length - 1)];
          return {
            ...prev,
            energy: clamp(prev.energy + 20 * f),
            hunger: clamp(prev.hunger - 6),
            lastUpdated: now,
            busyUntil: now + ACTION_BUSY_MS.sleep,
            cooldowns: {
              ...(prev.cooldowns || {}),
              sleep: now + ACTION_COOLDOWN_MS.sleep,
            },
            petState: 'Sleeping',
            lastInteractionAt: now,
            recentActions: [...recent, { action: 'sleep', at: now }],
          } as AkotchiState;
        });
      },
      doClean: ({ context }) => {
        const now = Date.now();
        context.setPet(prev => {
          const windowMs = 10 * 60 * 1000;
          const recent = (prev.recentActions || []).filter(
            r => now - r.at <= windowMs
          );
          const countSame = recent.filter(r => r.action === 'clean').length;
          const factors = [1, 0.8, 0.6, 0.4];
          const f = factors[Math.min(countSame, factors.length - 1)];

          // Clear messes and give extra happiness if there were messes to clean
          const messCount = prev.messCount || 0;
          const extraHappiness = messCount > 0 ? messCount * 5 : 0; // +5 happiness per mess cleaned

          return {
            ...prev,
            happiness: clamp(prev.happiness + 4 * f + extraHappiness),
            health: clamp(prev.health + (messCount > 0 ? messCount * 2 : 0)), // +2 health per mess cleaned
            messCount: 0, // Clear all messes
            lastUpdated: now,
            busyUntil: now + ACTION_BUSY_MS.clean,
            cooldowns: {
              ...(prev.cooldowns || {}),
              clean: now + ACTION_COOLDOWN_MS.clean,
            },
            petState: 'Cleaning',
            lastInteractionAt: now,
            recentActions: [...recent, { action: 'clean', at: now }],
          } as AkotchiState;
        });
      },
      doHeal: ({ context }) => {
        const now = Date.now();
        context.setPet(prev => {
          const windowMs = 10 * 60 * 1000;
          const recent = (prev.recentActions || []).filter(
            r => now - r.at <= windowMs
          );
          const countSame = recent.filter(r => r.action === 'heal').length;
          const factors = [1, 0.7, 0.5, 0.3];
          const f = factors[Math.min(countSame, factors.length - 1)];
          const nextHealth = clamp(prev.health + 18 * f);
          return {
            ...prev,
            health: nextHealth,
            sick: nextHealth > 45 ? false : prev.sick,
            lastUpdated: now,
            busyUntil: now + ACTION_BUSY_MS.heal,
            cooldowns: {
              ...(prev.cooldowns || {}),
              heal: now + ACTION_COOLDOWN_MS.heal,
            },
            petState: 'Healing',
            lastInteractionAt: now,
            recentActions: [...recent, { action: 'heal', at: now }],
          } as AkotchiState;
        });
      },
      doScold: ({ context }) => {
        const now = Date.now();
        context.setPet(
          prev =>
            ({
              ...prev,
              health: clamp(prev.health - 12),
              happiness: clamp(prev.happiness - 10),
              lastUpdated: now,
              busyUntil: now + ACTION_BUSY_MS.scold,
              cooldowns: {
                ...(prev.cooldowns || {}),
                scold: now + ACTION_COOLDOWN_MS.scold,
              },
              petState: 'Scolded',
              lastInteractionAt: now,
              recentActions: [
                ...(prev.recentActions || []).filter(
                  r => now - r.at <= 10 * 60 * 1000
                ),
                { action: 'scold', at: now },
              ],
            }) as AkotchiState
        );
      },
    },
    // Note: Full periodic tick can be integrated later using xstate actors
  }
);
