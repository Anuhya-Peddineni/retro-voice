import path from 'node:path';
import { Storage } from '@google-cloud/storage';
import type { TranscriptFileMeta } from '../types/retro';
import { parseVTT } from '../utils/vtt.parser';

/**
 * Storage service interface for managing sprint transcripts.
 * Implementations can use Google Cloud Storage, local file system, or other backends.
 */
export interface IStorageService {
  /**
   * List all sprint folders.
   */
  listSprints(): Promise<string[]>;

  /**
   * Upload multiple transcript files for a sprint.
   */
  uploadFiles(sprintName: string, files: Array<{ filename: string; buffer: Buffer }>): Promise<TranscriptFileMeta[]>;

  /**
   * List transcript files for a sprint.
   */
  listSprintFiles(sprintName: string): Promise<TranscriptFileMeta[]>;

  /**
   * Read the content of a single transcript file.
   */
  readFile(sprintName: string, fileName: string): Promise<string>;

  /**
   * Read all transcript files for a sprint and combine them.
   */
  readSprintTranscripts(sprintName: string): Promise<{ content: string; fileCount: number }>;
}

export interface UploadableTranscriptFile {
  filename: string;
  buffer: Buffer;
}

export interface GoogleCloudStorageServiceOptions {
  bucketName: string;
  projectId?: string;
}

export class GoogleCloudStorageService implements IStorageService {
  private storage: Storage;

  constructor(private options: GoogleCloudStorageServiceOptions) {
    this.storage = new Storage({ projectId: options.projectId });
  }

  async listSprints(): Promise<string[]> {
    const [, , apiResponse] = await this.storage.bucket(this.options.bucketName).getFiles({
      autoPaginate: false,
      delimiter: '/',
    });

    const prefixes = Array.isArray((apiResponse as { prefixes?: string[] } | undefined)?.prefixes)
        ? (apiResponse as { prefixes: string[] }).prefixes
        : [];

    return prefixes
        .map((prefix: string) => prefix.replace(/\/$/, ''))
        .filter(Boolean)
        .sort((left: string, right: string) => left.localeCompare(right));
  }

  async uploadFiles(sprintName: string, files: UploadableTranscriptFile[]): Promise<TranscriptFileMeta[]> {
    const bucket = this.storage.bucket(this.options.bucketName);
    const uploaded: TranscriptFileMeta[] = [];

    for (const file of files) {
      const safeFileName = sanitizeStoredFileName(file.filename);
      const objectPath = buildObjectPath(sprintName, safeFileName);

      await bucket.file(objectPath).save(file.buffer, {
        resumable: false,
        contentType: 'text/plain; charset=utf-8',
        metadata: {
          cacheControl: 'no-store',
        },
      });

      uploaded.push({
        fileName: safeFileName,
        path: objectPath,
        size: file.buffer.length,
      });
    }

    return uploaded.sort((left, right) => left.fileName.localeCompare(right.fileName));
  }

  async listSprintFiles(sprintName: string): Promise<TranscriptFileMeta[]> {
    const [files] = await this.storage.bucket(this.options.bucketName).getFiles({
      prefix: `${sprintName}/`,
    });

    return files
        .filter((file) => file.name !== `${sprintName}/` && !file.name.endsWith('/'))
        .map((file) => ({
          fileName: file.name.slice(`${sprintName}/`.length),
          path: file.name,
          size: Number(file.metadata.size || 0),
        }))
        .sort((left, right) => left.fileName.localeCompare(right.fileName));
  }

  async readFile(sprintName: string, fileName: string): Promise<string> {
    const safeFileName = sanitizeStoredFileName(fileName);
    const [contents] = await this.storage
        .bucket(this.options.bucketName)
        .file(buildObjectPath(sprintName, safeFileName))
        .download();

    const content = contents.toString('utf-8');
    return normalizeTranscriptContent(safeFileName, content);
  }

  async readSprintTranscripts(sprintName: string): Promise<{ content: string; fileCount: number }> {
    const files = await this.listSprintFiles(sprintName);
    if (files.length === 0) {
      throw new Error(`No transcripts found for sprint: ${sprintName}`);
    }

    const contents = await Promise.all(
        files.map(async (file) => `--- File: ${file.fileName} ---\n${await this.readFile(sprintName, file.fileName)}`),
    );

    return {
      content: contents.join('\n\n'),
      fileCount: files.length,
    };
  }
}

/**
 * Mock/local storage service for development and testing.
 * Stores files in memory instead of Google Cloud Storage.
 */
export class LocalStorageService implements IStorageService {
  private files: Map<string, Map<string, Buffer>> = new Map();

  async listSprints(): Promise<string[]> {
    return Array.from(this.files.keys()).sort();
  }

  async uploadFiles(sprintName: string, files: Array<{ filename: string; buffer: Buffer }>): Promise<TranscriptFileMeta[]> {
    if (!this.files.has(sprintName)) {
      this.files.set(sprintName, new Map());
    }

    const sprintFiles = this.files.get(sprintName)!;
    const uploaded: TranscriptFileMeta[] = [];

    for (const file of files) {
      const safeFileName = sanitizeStoredFileName(file.filename);
      sprintFiles.set(safeFileName, file.buffer);
      uploaded.push({
        fileName: safeFileName,
        path: buildObjectPath(sprintName, safeFileName),
        size: file.buffer.length,
      });
    }

    return uploaded;
  }

  async listSprintFiles(sprintName: string): Promise<TranscriptFileMeta[]> {
    const sprintFiles = this.files.get(sprintName);
    if (!sprintFiles) {
      return [];
    }

    return Array.from(sprintFiles.entries()).map(([fileName, buffer]) => ({
      fileName,
      path: buildObjectPath(sprintName, fileName),
      size: buffer.length,
    }));
  }

  async readFile(sprintName: string, fileName: string): Promise<string> {
    const sprintFiles = this.files.get(sprintName);
    if (!sprintFiles) {
      throw new Error(`Sprint not found: ${sprintName}`);
    }

    const buffer = sprintFiles.get(sanitizeStoredFileName(fileName));
    if (!buffer) {
      throw new Error(`File not found: ${buildObjectPath(sprintName, fileName)}`);
    }

    const content = buffer.toString('utf-8');
    return normalizeTranscriptContent(sanitizeStoredFileName(fileName), content);
  }

  async readSprintTranscripts(sprintName: string): Promise<{ content: string; fileCount: number }> {
    const files = await this.listSprintFiles(sprintName);
    if (files.length === 0) {
      throw new Error(`No transcripts found for sprint: ${sprintName}`);
    }

    const contents: string[] = [];
    for (const file of files) {
      const content = await this.readFile(sprintName, file.fileName);
      contents.push(`--- File: ${file.fileName} ---\n${content}`);
    }

    return {
      content: contents.join('\n\n'),
      fileCount: files.length,
    };
  }
}

function buildObjectPath(sprintName: string, fileName: string): string {
  return `${sprintName}/${fileName}`;
}

/**
 * Normalize transcript content based on file type.
 * VTT files are parsed to extract clean text content.
 * TXT files are returned as-is.
 */
function normalizeTranscriptContent(fileName: string, content: string): string {
  const lowerFileName = fileName.toLowerCase();
  if (lowerFileName.endsWith('.vtt')) {
    return parseVTT(content);
  }
  return content;
}

function sanitizeStoredFileName(fileName: string): string {
  return path.basename(fileName).trim();
}