/*
  Akotchi background worker
  - Receives INIT and STATE snapshots
  - Periodically evaluates needs and posts REQUEST messages
  - Rate-limited so we don't spam
*/

type PetSnapshot = {
  petId: string;
  name?: string;
  hunger: number;
  energy: number;
  health: number;
  isDead?: boolean;
  lastUpdated: number;
};

type IncomingMessage =
  | { type: 'INIT'; petId: string; name?: string }
  | { type: 'STATE'; snapshot: PetSnapshot };

type OutgoingMessage =
  | { type: 'REQUEST'; petId: string; request: 'FEED' | 'SLEEP' | 'HEAL'; reason: string; at: number }
  | { type: 'SUGGEST_MESSAGE'; petId: string; reason: string; at: number };

const CHECK_INTERVAL_MS = 60 * 1000; // evaluate once per minute
const RATE_LIMIT_MS = 15 * 60 * 1000; // at most one message per need every 15 minutes

let latest: PetSnapshot | null = null;
type RequestType = 'FEED' | 'SLEEP' | 'HEAL';
let lastSent: Record<RequestType, number> = {
  FEED: 0,
  SLEEP: 0,
  HEAL: 0,
};

function maybeSend(request: RequestType, reason: string) {
  if (!latest || latest.isDead) return;
  const now = Date.now();
  if (now - lastSent[request] < RATE_LIMIT_MS) return;
  lastSent[request] = now;
  postMessage({ type: 'REQUEST', petId: latest.petId, request, reason, at: now } as OutgoingMessage);
}

setInterval(() => {
  if (!latest || latest.isDead) return;
  // Simple thresholds; main thread owns precise decay & state
  if (latest.hunger < 25) {
    maybeSend('FEED', 'Hunger is low');
    postMessage({ type: 'SUGGEST_MESSAGE', petId: latest.petId, reason: 'hungry', at: Date.now() } as OutgoingMessage);
  }
  if (latest.energy < 20) {
    maybeSend('SLEEP', 'Energy is low');
    postMessage({ type: 'SUGGEST_MESSAGE', petId: latest.petId, reason: 'tired', at: Date.now() } as OutgoingMessage);
  }
  if (latest.health < 35) {
    maybeSend('HEAL', 'Health is low');
    postMessage({ type: 'SUGGEST_MESSAGE', petId: latest.petId, reason: 'sick', at: Date.now() } as OutgoingMessage);
  }
}, CHECK_INTERVAL_MS);

self.onmessage = (e: MessageEvent<IncomingMessage>) => {
  const msg = e.data;
  if (!msg) return;
  switch (msg.type) {
    case 'INIT': {
      // Reset rate limiting window on a new pet
      lastSent = { FEED: 0, SLEEP: 0, HEAL: 0 };
      latest = {
        petId: msg.petId,
        name: msg.name,
        hunger: 100,
        energy: 100,
        health: 100,
        isDead: false,
        lastUpdated: Date.now(),
      };
      break;
    }
    case 'STATE': {
      latest = msg.snapshot;
      break;
    }
    default:
      break;
  }
};


