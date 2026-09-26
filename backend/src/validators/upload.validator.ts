import type { Express } from 'express';

const ALLOWED_EXTENSIONS = ['.txt', '.vtt'];
const MAX_FILE_SIZE = 2_097_152; // 2MB
const MAX_FILES = 10;

export function validateUploadedFiles(files: Express.Multer.File[] | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!files || files.length === 0) {
    return { valid: false, error: 'No files uploaded' };
  }

  if (files.length > MAX_FILES) {
    return { valid: false, error: `Maximum ${MAX_FILES} files allowed per upload` };
  }

  for (const file of files) {
    if (hasUnsafePathSegments(file.originalname)) {
      return {
        valid: false,
        error: `Invalid file name: ${file.originalname}. File names must not include folders or path traversal patterns.`,
      };
    }

    // Check file extension
    const ext = getFileExtension(file.originalname);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `File type not supported: ${file.originalname}. Only .txt and .vtt files are allowed currently.`,
      };
    }

    // Check file size
    if (file.size === 0) {
      return { valid: false, error: `Empty file not allowed: ${file.originalname}` };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large: ${file.originalname}. Maximum size is 2MB.`,
      };
    }
  }

  return { valid: true };
}

function getFileExtension(filename: string): string {
  const index = filename.lastIndexOf('.');
  return index >= 0 ? filename.substring(index).toLowerCase() : '';
}

function hasUnsafePathSegments(filename: string): boolean {
  return filename.includes('/') || filename.includes('\\') || filename.includes('..');
}

