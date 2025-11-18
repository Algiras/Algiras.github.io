export type Personality = 'Cheerful' | 'Lazy' | 'Hyper' | 'Moody' | 'Shy';

export type AnimationState =
  | 'Idle'
  | 'Eating'
  | 'Playing'
  | 'Sleeping'
  | 'Sick'
  | 'Hungry'
  | 'Happy'
  | 'Sad'
  | 'LowEnergy'
  | 'Crying';

export type ActionKey = 'feed' | 'play' | 'sleep' | 'clean' | 'heal' | 'scold';

export type PetMachineState =
  | 'Idle'
  | 'Feeding'
  | 'Playing'
  | 'Sleeping'
  | 'Cleaning'
  | 'Healing'
  | 'Scolded'
  | 'Dead';

export type GrowthStage = 'Baby' | 'Child' | 'Teen' | 'Adult' | 'Elder';

export interface AkotchiDNA {
  bodyHue: number; // 0-360
  eye: number; // 1..5
  mouth: number; // 1..5
  accessory: number; // 0 none, 1..9 (extended)
  markings: number; // 0 none, 1..7 (extended)
  ear: number; // 0 none, 1..3
  tail: number; // 0 none, 1..3
  horns: number; // 0 none, 1..2
  wings: number; // 0 none, 1..2
  line: number; // 1..3 evolution line (leaf/fire/water-inspired)
}

export interface AkotchiState {
  id: string;
  name: string;
  dna: AkotchiDNA;
  personality: Personality;
  createdAt: number; // ms
  lastUpdated: number; // ms
  hunger: number; // 0-100
  happiness: number; // 0-100
  energy: number; // 0-100
  health: number; // 0-100
  ageHours: number; // real hours
  sick: boolean;
  isDead?: boolean;
  deadAt?: number;
  cooldowns?: Partial<Record<ActionKey, number>>; // epoch ms when action becomes available
  busyUntil?: number; // epoch ms until any action is locked
  petState?: PetMachineState;
  lastInteractionAt?: number;
  recentActions?: { action: ActionKey; at: number }[];
  stage?: GrowthStage;
  lastStageUpAt?: number;
  lastStageUpStage?: GrowthStage;
  messCount?: number; // Number of poops/messes that need cleaning
  lastPoopAt?: number; // When last poop occurred
}
