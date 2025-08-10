import { AkotchiState, Personality, GrowthStage } from './types';

export const STORAGE_KEY = 'akotchi_state_v1'; // legacy
export const PETS_KEY = 'akotchi_pets_v1';
export const SELECTED_KEY = 'akotchi_selected_id_v1';

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(values: T[]): T {
  return values[randomInt(0, values.length - 1)];
}

export function createNewAkotchi(name?: string): AkotchiState {
  const now = Date.now();
  const dna = {
    bodyHue: randomInt(0, 360),
    eye: randomInt(1, 5),
    mouth: randomInt(1, 5),
    accessory: randomInt(0, 5),
    markings: randomInt(0, 5),
  };
  const personality: Personality = pick(['Cheerful', 'Lazy', 'Hyper', 'Moody', 'Shy']);
  return {
    id: crypto.randomUUID?.() ?? String(now),
    name: name && name.trim().length > 0 ? name.trim() : `Akotchi-${String(now).slice(-4)}`,
    dna,
    personality,
    createdAt: now,
    lastUpdated: now,
    hunger: 70,
    happiness: 60,
    energy: 70,
    health: 100,
    ageHours: 0,
    sick: false,
    cooldowns: {},
    busyUntil: 0,
    petState: 'Idle',
    lastInteractionAt: now,
    recentActions: [],
    stage: 'Baby',
  };
}

export function getDecayModifiers(personality: Personality) {
  switch (personality) {
    case 'Cheerful':
      return { hunger: 1.0, happiness: 0.8, energy: 1.0, health: 1.0 };
    case 'Lazy':
      return { hunger: 0.9, happiness: 1.0, energy: 1.2, health: 1.0 };
    case 'Hyper':
      return { hunger: 1.2, happiness: 1.1, energy: 1.3, health: 1.0 };
    case 'Moody':
      return { hunger: 1.0, happiness: 1.3, energy: 1.0, health: 1.0 };
    case 'Shy':
      return { hunger: 0.9, happiness: 1.1, energy: 1.0, health: 1.0 };
  }
}

// Non-linear helpers
function logistic(x: number, k = 1, x0 = 0): number {
  return 1 / (1 + Math.exp(-k * (x - x0)));
}

export function updateByElapsed(state: AkotchiState, elapsedMs: number): AkotchiState {
  if (state.isDead) return state;
  const hours = elapsedMs / (1000 * 60 * 60);
  if (hours <= 0) return state;
  const m = getDecayModifiers(state.personality);

  // Neglect multiplier (if no interaction > 6h)
  const now = Date.now();
  const neglectHours = state.lastInteractionAt ? (now - state.lastInteractionAt) / (1000 * 60 * 60) : 0;
  const neglectMult = neglectHours > 6 ? Math.min(1.5, 1 + (neglectHours - 6) * 0.05) : 1; // up to +50%

  // Base decays
  let hunger = state.hunger - 8 * m.hunger * hours * neglectMult;
  let happiness = state.happiness - 6 * m.happiness * hours * (state.sick ? 1.2 : 1);
  let energy = state.energy - 7 * m.energy * hours * (state.petState === 'Playing' ? 1.2 : 1);

  // Sleep recovery (logistic towards 100)
  if (state.petState === 'Sleeping') {
    const recovery = 22 * hours; // base recovery
    const factor = logistic((100 - state.energy) / 100, 4, 0.2);
    energy = state.energy + recovery * factor;
    hunger -= 3 * hours; // get hungry while sleeping
  }

  // Health dynamics
  let health = state.health;
  if (hunger < 20 || energy < 20) health -= 5 * hours * neglectMult;
  else health += 2 * hours * (state.happiness > 60 ? 1.2 : 1);
  if (state.sick) health -= 3 * hours;

  // Caps & clamps
  hunger = clamp(hunger);
  happiness = clamp(happiness);
  energy = clamp(energy);
  health = clamp(health);

  const sick = health < 40 || (hunger < 15 && energy < 15);

  if (health <= 0) {
    return {
      ...state,
      hunger,
      happiness,
      energy,
      health: 0,
      sick: true,
      ageHours: state.ageHours + hours,
      lastUpdated: state.lastUpdated + elapsedMs,
      isDead: true,
      deadAt: state.lastUpdated + elapsedMs,
      petState: 'Dead',
    };
  }

  const nextAge = state.ageHours + hours;

  // Growth stage thresholds (tweakable)
  const stage: GrowthStage = nextAge < 24
    ? 'Baby'
    : nextAge < 72
      ? 'Child'
      : nextAge < 168
        ? 'Teen'
        : nextAge < 360
          ? 'Adult'
          : 'Elder';

  return {
    ...state,
    hunger,
    happiness,
    energy,
    health,
    sick,
    ageHours: nextAge,
    lastUpdated: state.lastUpdated + elapsedMs,
    petState: state.petState && state.petState !== 'Dead' ? state.petState : 'Idle',
    stage,
  };
}


