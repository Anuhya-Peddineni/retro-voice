import type { TranscriptFileMeta } from '../types/retro';

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
      sprintFiles.set(file.filename, file.buffer);
      uploaded.push({
        fileName: file.filename,
        path: `${sprintName}/${file.filename}`,
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
      path: `${sprintName}/${fileName}`,
      size: buffer.length,
    }));
  }

  async readFile(sprintName: string, fileName: string): Promise<string> {
    const sprintFiles = this.files.get(sprintName);
    if (!sprintFiles) {
      throw new Error(`Sprint not found: ${sprintName}`);
    }

    const buffer = sprintFiles.get(fileName);
    if (!buffer) {
      throw new Error(`File not found: ${sprintName}/${fileName}`);
    }

    return buffer.toString('utf-8');
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

