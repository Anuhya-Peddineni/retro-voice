import { describe, expect, it } from 'vitest';
import { normalizeSprintName, validateSelectedFiles, validateSprintNameInput } from './validation';
import { normalizeApiError } from './api';

describe('frontend validation utilities', () => {
  it('accepts valid sprint names and normalizes them', () => {
    expect(validateSprintNameInput('Sprint_One')).toBeUndefined();
    expect(normalizeSprintName('  Sprint_One  ')).toBe('sprint_one');
  });

  it('rejects invalid sprint names', () => {
    expect(validateSprintNameInput('ab')).toContain('at least 3');
    expect(validateSprintNameInput('my sprint')).toContain('letters, numbers');
  });

  it('validates selected transcript files', () => {
    const validFiles = [
      { name: 'notes.txt', size: 128 } as File,
      { name: 'retro.txt', size: 256 } as File,
    ];

    expect(validateSelectedFiles(validFiles)).toBeUndefined();
    expect(validateSelectedFiles([{ name: 'notes.pdf', size: 128 } as File])).toContain('.txt');
  });

  it('normalizes backend-style errors', () => {
    expect(normalizeApiError(400, { error: { code: 'INVALID_SPRINT_NAME', message: 'Bad sprint' } })).toEqual({
      code: 'INVALID_SPRINT_NAME',
      message: 'Bad sprint',
    });

    expect(normalizeApiError(0, null)).toEqual({
      code: 'NETWORK_ERROR',
      message: 'Could not reach the backend. Check that the backend is running and CORS is configured.',
    });
  });
});

