const SPRINT_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const MAX_SPRINT_NAME_LENGTH = 15;
const MIN_SPRINT_NAME_LENGTH = 5;
const MAX_FILE_SIZE = 2_097_152;
const MAX_FILES = 10;

export function validateSprintNameInput(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Sprint name is required.';
  }

   if (trimmed.length < MIN_SPRINT_NAME_LENGTH) {
     return 'Sprint name must be at least 5 characters.';
   }

  if (trimmed.length > MAX_SPRINT_NAME_LENGTH) {
    return 'Sprint name must be at most 15 characters.';
  }

  if (!SPRINT_NAME_REGEX.test(trimmed)) {
    return 'Sprint name can only include letters, numbers, hyphens, and underscores.';
  }

  return undefined;
}

export function normalizeSprintName(value: string): string {
  return value.trim().toLowerCase();
}

export function validateSelectedFiles(files: File[]): string | undefined {
  if (files.length === 0) {
    return 'Select at least one .txt or .vtt transcript file.';
  }

  if (files.length > MAX_FILES) {
    return `You can upload at most ${MAX_FILES} transcript files at a time.`;
  }

  for (const file of files) {
    const lowercaseName = file.name.toLowerCase();
    const isAllowed = lowercaseName.endsWith('.txt') || lowercaseName.endsWith('.vtt');
    if (!isAllowed) {
      return `Unsupported file type: ${file.name}. Only .txt and .vtt files are allowed.`;
    }

    if (file.size === 0) {
      return `Empty file not allowed: ${file.name}.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${file.name}. Maximum size is 2MB.`;
    }
  }

  return undefined;
}

