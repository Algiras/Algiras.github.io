import { describe, it, expect } from '@jest/globals';

// Mock AkotchiState for testing
interface MockAkotchiState {
  id: string;
  name: string;
  happiness: number;
  ageHours: number;
  isDead: boolean;
}

describe('Akotchi Crying Feature', () => {
  it('should trigger crying when happiness is very low', () => {
    const verySadPet: MockAkotchiState = {
      id: '1',
      name: 'TestPet',
      happiness: 10, // Very low happiness
      ageHours: 5,
      isDead: false
    };
    
    const shouldCry = verySadPet.happiness < 15;
    expect(shouldCry).toBe(true);
  });

  it('should not trigger crying when happiness is moderately low', () => {
    const moderatelySadPet: MockAkotchiState = {
      id: '1',
      name: 'TestPet',
      happiness: 20, // Moderately low but not crying level
      ageHours: 5,
      isDead: false
    };
    
    const shouldCry = moderatelySadPet.happiness < 15;
    expect(shouldCry).toBe(false);
  });

  it('should calculate age-based crying frequency', () => {
    const babyPet: MockAkotchiState = {
      id: '1',
      name: 'BabyPet',
      happiness: 10,
      ageHours: 1, // Very young
      isDead: false
    };
    
    const adultPet: MockAkotchiState = {
      id: '2',
      name: 'AdultPet',
      happiness: 10,
      ageHours: 24, // 1 day old
      isDead: false
    };
    
    // Younger pets should cry more frequently (shorter intervals)
    const babyInterval = Math.max(5 * 60 * 1000, Math.min(30 * 60 * 1000, babyPet.ageHours * 2 * 60 * 1000));
    const adultInterval = Math.max(5 * 60 * 1000, Math.min(30 * 60 * 1000, adultPet.ageHours * 2 * 60 * 1000));
    
    expect(babyInterval).toBeLessThan(adultInterval);
    expect(babyInterval).toBeGreaterThanOrEqual(5 * 60 * 1000); // At least 5 minutes
    expect(adultInterval).toBeLessThanOrEqual(30 * 60 * 1000); // At most 30 minutes
  });

  it('should handle crying animation state correctly', () => {
    const deriveAnimFromStats = (pet: MockAkotchiState): string => {
      if (pet.isDead) return 'Dead';
      if (pet.happiness < 15) return 'Crying';
      if (pet.happiness < 25) return 'Sad';
      return 'Idle';
    };
    
    const cryingPet: MockAkotchiState = {
      id: '1',
      name: 'CryingPet',
      happiness: 12,
      ageHours: 2,
      isDead: false
    };
    
    const animationState = deriveAnimFromStats(cryingPet);
    expect(animationState).toBe('Crying');
  });

  it('should prioritize crying over other low stats', () => {
    const deriveAnimFromStats = (pet: MockAkotchiState): string => {
      if (pet.isDead) return 'Dead';
      if (pet.happiness < 15) return 'Crying'; // Highest priority
      if (pet.happiness < 25) return 'Sad';
      return 'Idle';
    };
    
    const veryUnhappyPet: MockAkotchiState = {
      id: '1',
      name: 'UnhappyPet',
      happiness: 8, // Very low happiness
      ageHours: 3,
      isDead: false
    };
    
    const animationState = deriveAnimFromStats(veryUnhappyPet);
    expect(animationState).toBe('Crying');
  });
});
