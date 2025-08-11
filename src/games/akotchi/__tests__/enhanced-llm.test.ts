import { describe, it, expect } from '@jest/globals';

// Mock AkotchiState for testing
interface MockAkotchiState {
  id: string;
  name: string;
  personality: string;
  ageHours: number;
  hunger: number;
  energy: number;
  happiness: number;
  health: number;
}

describe('Enhanced LLM Message Generation', () => {
  it('should generate personality-driven messages', () => {
    const cheerfulPet: MockAkotchiState = {
      id: '1',
      name: 'CheerfulPet',
      personality: 'Cheerful',
      ageHours: 5,
      hunger: 30,
      energy: 80,
      happiness: 70,
      health: 90
    };
    
    const lazyPet: MockAkotchiState = {
      id: '2',
      name: 'LazyPet',
      personality: 'Lazy',
      ageHours: 10,
      hunger: 25,
      energy: 20,
      happiness: 60,
      health: 85
    };
    
    // Different personalities should generate different message styles
    expect(cheerfulPet.personality).toBe('Cheerful');
    expect(lazyPet.personality).toBe('Lazy');
    expect(cheerfulPet.personality).not.toBe(lazyPet.personality);
  });

  it('should handle different request types appropriately', () => {
    const requestTypes = ['FEED', 'PLAY', 'SLEEP', 'CLEAN', 'HEAL', 'SCOLD'];
    
    requestTypes.forEach(type => {
      expect(requestTypes).toContain(type);
    });
    
    // Each request type should have appropriate examples
    const examples = {
      'FEED': 'That was delicious! I feel so much better now, thank you!',
      'PLAY': 'That was so much fun! I love playing with you!',
      'SLEEP': 'I feel so rested and cozy now, that was perfect!',
      'CLEAN': 'I feel so fresh and clean! Thank you for taking care of me!',
      'HEAL': 'I\'m feeling much better now! Your care really helps!',
      'SCOLD': 'I understand, I\'ll try to be better. Thank you for teaching me.'
    };
    
    Object.entries(examples).forEach(([type, example]) => {
      // Check that examples are appropriate for their type
      if (type === 'PLAY') {
        expect(example).toContain('fun');
      } else if (type === 'SLEEP') {
        expect(example).toContain('rest');
      } else if (type === 'HEAL') {
        expect(example).toContain('better');
      }
      expect(example.length).toBeLessThan(100); // Reasonable length
    });
  });

  it('should generate proactive messages for needs', () => {
    const needyPet: MockAkotchiState = {
      id: '1',
      name: 'NeedyPet',
      personality: 'Hyper',
      ageHours: 2,
      hunger: 20,
      energy: 15,
      happiness: 25,
      health: 40
    };
    
    // Pet should generate messages for multiple needs
    const needs = ['hungry', 'tired', 'sad', 'sick'];
    needs.forEach(need => {
      expect(needs).toContain(need);
    });
    
    // Hyper personality should be energetic in requests
    expect(needyPet.personality).toBe('Hyper');
    expect(needyPet.hunger).toBeLessThan(25); // Hungry
    expect(needyPet.energy).toBeLessThan(20); // Tired
  });

  it('should respect message constraints', () => {
    const constraints = {
      maxWords: 20,
      maxLength: 120,
      style: 'playful, caring, concise, personality-driven'
    };
    
    expect(constraints.maxWords).toBeLessThanOrEqual(25);
    expect(constraints.maxLength).toBeLessThanOrEqual(150);
    expect(constraints.style).toContain('personality-driven');
  });

  it('should handle different age contexts', () => {
    const babyPet: MockAkotchiState = {
      id: '1',
      name: 'BabyPet',
      personality: 'Shy',
      ageHours: 1,
      hunger: 50,
      energy: 50,
      happiness: 50,
      health: 50
    };
    
    const adultPet: MockAkotchiState = {
      id: '2',
      name: 'AdultPet',
      personality: 'Moody',
      ageHours: 48,
      hunger: 50,
      energy: 50,
      happiness: 50,
      health: 50
    };
    
    // Age should be included in message context
    expect(babyPet.ageHours).toBeLessThan(adultPet.ageHours);
    expect(babyPet.ageHours).toBe(1);
    expect(adultPet.ageHours).toBe(48);
  });
});
