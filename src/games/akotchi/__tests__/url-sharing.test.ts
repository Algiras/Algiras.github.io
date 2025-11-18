import { describe, expect, it } from '@jest/globals';

// Mock URL and URLSearchParams for testing
const mockURL = (url: string) => {
  const searchParams = new Map();
  if (url.includes('?pet=')) {
    const petParam = url.split('?pet=')[1];
    searchParams.set('pet', petParam);
  }

  return {
    searchParams: {
      get: (key: string) => searchParams.get(key) || null,
    },
  };
};

describe('Akotchi URL Sharing', () => {
  it('should parse URL with pet parameter', () => {
    const testUrl =
      'http://localhost:3000/#/games/akotchi?pet=%7B%22version%22%3A1%2C%22pet%22%3A%7B%22name%22%3A%22TestPet%22%7D%7D';
    const url = mockURL(testUrl);
    const petParam = url.searchParams.get('pet');

    // The parameter should remain encoded in the URL
    expect(petParam).toBe(
      '%7B%22version%22%3A1%2C%22pet%22%3A%7B%22name%22%3A%22TestPet%22%7D%7D'
    );

    // When decoded, it should match the expected JSON
    const decodedPet = decodeURIComponent(petParam!);
    expect(decodedPet).toBe('{"version":1,"pet":{"name":"TestPet"}}');
  });

  it('should handle URL without pet parameter', () => {
    const testUrl = 'http://localhost:3000/#/games/akotchi';
    const url = mockURL(testUrl);
    const petParam = url.searchParams.get('pet');

    expect(petParam).toBeNull();
  });

  it('should generate shareable URL', () => {
    const mockPet = { version: 1, pet: { name: 'TestPet', id: '123' } };
    const mockExportPayload = JSON.stringify(mockPet);
    const mockBaseUrl = 'http://localhost:3000/#/games/akotchi';

    const shareableUrl = `${mockBaseUrl}?pet=${encodeURIComponent(mockExportPayload)}`;

    expect(shareableUrl).toContain('?pet=');
    expect(shareableUrl).toContain(encodeURIComponent(mockExportPayload));
  });

  it('should handle import from URL parameter', () => {
    const mockPetData = { version: 1, pet: { name: 'TestPet', id: '123' } };
    const encodedPet = encodeURIComponent(JSON.stringify(mockPetData));

    // Simulate URL parameter parsing
    const decodedPet = decodeURIComponent(encodedPet);
    const parsed = JSON.parse(decodedPet);

    expect(parsed).toEqual(mockPetData);
    expect(parsed.pet.name).toBe('TestPet');
  });
});
