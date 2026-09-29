import { z } from 'zod';

const sprintNameSchema = z
   .string()
   .trim()
   .min(5, 'Sprint name must be at least 5 characters')
   .max(50, 'Sprint name must be at most 50 characters')
   .regex(/^[a-zA-Z0-9_-]+$/, 'Sprint name must contain only letters, numbers, hyphens, or underscores');

export function validateSprintName(name: string): { valid: boolean; error?: string } {
  const result = sprintNameSchema.safeParse(name);
  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message };
  }
  return { valid: true };
}

export function normalizeSprintName(name: string): string {
  return name.trim().toLowerCase();
}


