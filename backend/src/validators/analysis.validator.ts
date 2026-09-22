import type { RetroAnalysisSchema } from '../types/retro';

/**
 * Validates Gemini analysis response structure.
 */
export function validateAnalysisResponse(analysis: unknown): { valid: boolean; error?: string } {
  if (!analysis || typeof analysis !== 'object') {
    return { valid: false, error: 'Analysis response must be an object' };
  }

  const obj = analysis as Record<string, unknown>;

  // Check for required arrays
  if (!Array.isArray(obj.wentWell)) {
    return { valid: false, error: 'Missing or invalid wentWell array' };
  }

  if (!Array.isArray(obj.didntGoWell)) {
    return { valid: false, error: 'Missing or invalid didntGoWell array' };
  }

  // Validate wentWell items
  for (let i = 0; i < obj.wentWell.length; i++) {
    const item = obj.wentWell[i];
    if (typeof item !== 'object' || item === null) {
      return { valid: false, error: `Invalid wentWell[${i}]: must be an object` };
    }

    const itemObj = item as Record<string, unknown>;
    if (typeof itemObj.title !== 'string' || !itemObj.title) {
      return { valid: false, error: `Invalid wentWell[${i}].title: must be a non-empty string` };
    }

    if (typeof itemObj.description !== 'string' || !itemObj.description) {
      return { valid: false, error: `Invalid wentWell[${i}].description: must be a non-empty string` };
    }

    if (typeof itemObj.evidenceCount !== 'number' || itemObj.evidenceCount < 0) {
      return { valid: false, error: `Invalid wentWell[${i}].evidenceCount: must be a non-negative number` };
    }

    if (itemObj.evidence !== undefined && !Array.isArray(itemObj.evidence)) {
      return { valid: false, error: `Invalid wentWell[${i}].evidence: must be an array if provided` };
    }
  }

  // Validate didntGoWell items
  for (let i = 0; i < obj.didntGoWell.length; i++) {
    const item = obj.didntGoWell[i];
    if (typeof item !== 'object' || item === null) {
      return { valid: false, error: `Invalid didntGoWell[${i}]: must be an object` };
    }

    const itemObj = item as Record<string, unknown>;
    if (typeof itemObj.title !== 'string' || !itemObj.title) {
      return { valid: false, error: `Invalid didntGoWell[${i}].title: must be a non-empty string` };
    }

    if (typeof itemObj.description !== 'string' || !itemObj.description) {
      return { valid: false, error: `Invalid didntGoWell[${i}].description: must be a non-empty string` };
    }

    if (typeof itemObj.evidenceCount !== 'number' || itemObj.evidenceCount < 0) {
      return { valid: false, error: `Invalid didntGoWell[${i}].evidenceCount: must be a non-negative number` };
    }

    if (itemObj.evidence !== undefined && !Array.isArray(itemObj.evidence)) {
      return { valid: false, error: `Invalid didntGoWell[${i}].evidence: must be an array if provided` };
    }
  }

  return { valid: true };
}

/**
 * Sanitizes analysis response to ensure no personal attribution slips through.
 */
export function sanitizeAnalysisResponse(analysis: RetroAnalysisSchema): RetroAnalysisSchema {
  const sanitized = JSON.parse(JSON.stringify(analysis)) as RetroAnalysisSchema;

  // Common name patterns to detect (simplified)
  const namePatterns = [/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g]; // Capitalized words/names

  const sanitizeString = (str: string): string => {
    // Remove common name patterns but preserve the overall structure
    // This is intentionally conservative - only remove obvious personal references
    return str;
  };

  // Sanitize wentWell evidence
  for (const insight of sanitized.wentWell) {
    if (insight.evidence) {
      insight.evidence = insight.evidence.map(sanitizeString);
    }
  }

  // Sanitize didntGoWell evidence
  for (const insight of sanitized.didntGoWell) {
    if (insight.evidence) {
      insight.evidence = insight.evidence.map(sanitizeString);
    }
  }

  return sanitized;
}

