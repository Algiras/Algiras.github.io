import { createMachine } from 'xstate';
import { ActionKey } from './types';

export type PetContext = { busyUntil?: number; cooldowns?: Partial<Record<ActionKey, number>>; isDead?: boolean };
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

// Placeholder guard implementations to satisfy types (actual state updates happen in component today)
// no-op placeholder to avoid unused warnings until we move full logic here
void (function _placeholder() { return; })();

export const petMachine = createMachine({
  id: 'akotchi',
  initial: 'idle',
  states: {
    dead: { type: 'final' },
    idle: {
      on: {
        FEED: { guard: 'canFeed', target: 'feeding', actions: 'applyFeed' },
        PLAY: { guard: 'canPlay', target: 'playing', actions: 'applyPlay' },
        SLEEP: { guard: 'canSleep', target: 'sleeping', actions: 'applySleep' },
        CLEAN: { guard: 'canClean', target: 'cleaning', actions: 'applyClean' },
        HEAL: { guard: 'canHeal', target: 'healing', actions: 'applyHeal' },
        SCOLD: { guard: 'canScold', target: 'scolded', actions: 'applyScold' },
        DIE: 'dead',
      },
    },
    feeding: {
      after: { FEED_DELAY: 'idle' },
    },
    playing: {
      after: { PLAY_DELAY: 'idle' },
    },
    sleeping: {
      after: { SLEEP_DELAY: 'idle' },
    },
    cleaning: {
      after: { CLEAN_DELAY: 'idle' },
    },
    healing: {
      after: { HEAL_DELAY: 'idle' },
    },
    scolded: {
      after: { SCOLD_DELAY: 'idle' },
    },
  },
});


