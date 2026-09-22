import request from 'supertest';
import { describe, expect, it, beforeEach } from 'vitest';
import { createApp } from '../src/app';
import { LocalStorageService } from '../src/services/storage.service';
import { validateSprintName, normalizeSprintName } from '../src/validators/sprint.validator';
import { validateUploadedFiles } from '../src/validators/upload.validator';

describe('RetroVoice Backend - Phase 3', () => {
  describe('Sprint Name Validation', () => {
    it('accepts valid sprint names', () => {
      expect(validateSprintName('mysprint')).toEqual({ valid: true });
      expect(validateSprintName('my-sprint')).toEqual({ valid: true });
      expect(validateSprintName('my_sprint')).toEqual({ valid: true });
    });

    it('rejects invalid sprint names', () => {
      const result = validateSprintName('ab'); // Too short
      expect(result.valid).toBe(false);
    });

    it('normalizes sprint names', () => {
      expect(normalizeSprintName('MySprint')).toBe('mysprint');
      expect(normalizeSprintName('  test  ')).toBe('test');
    });
  });

  describe('LocalStorageService', () => {
    let service: LocalStorageService;

    beforeEach(() => {
      service = new LocalStorageService();
    });

    it('lists sprints correctly', async () => {
      expect(await service.listSprints()).toEqual([]);

      await service.uploadFiles('sprint1', [{ filename: 'test.txt', buffer: Buffer.from('content') }]);
      const sprints = await service.listSprints();
      expect(sprints).toContain('sprint1');
    });

    it('uploads and lists files', async () => {
      const result = await service.uploadFiles('mysprint', [
        { filename: 'file1.txt', buffer: Buffer.from('content1') },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].fileName).toBe('file1.txt');

      const files = await service.listSprintFiles('mysprint');
      expect(files).toHaveLength(1);
    });

    it('reads file content', async () => {
      const content = 'Hello, World!';
      await service.uploadFiles('mysprint', [{ filename: 'test.txt', buffer: Buffer.from(content) }]);

      const result = await service.readFile('mysprint', 'test.txt');
      expect(result).toBe(content);
    });

    it('combines sprint transcripts', async () => {
      await service.uploadFiles('mysprint', [
        { filename: 'file1.txt', buffer: Buffer.from('Content 1') },
        { filename: 'file2.txt', buffer: Buffer.from('Content 2') },
      ]);

      const result = await service.readSprintTranscripts('mysprint');
      expect(result.content).toContain('Content 1');
      expect(result.content).toContain('Content 2');
      expect(result.fileCount).toBe(2);
    });
  });

  describe('Sprint API Endpoints', () => {
    let app: Express.Application;

    beforeEach(() => {
      app = createApp({ FRONTEND_ORIGIN: 'http://localhost:5173' });
    });

    it('GET /api/health returns status ok', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('GET /api/sprints returns empty list initially', async () => {
      const response = await request(app).get('/api/sprints');
      expect(response.status).toBe(200);
      expect(response.body.sprints).toEqual([]);
    });

    it('POST upload with invalid sprint name returns 400', async () => {
      const response = await request(app)
        .post('/api/sprints/ab/transcripts')
        .attach('files', Buffer.from('content'), 'test.txt');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_SPRINT_NAME');
    });

    it('POST upload with invalid file type returns 400', async () => {
      const response = await request(app)
        .post('/api/sprints/mysprint/transcripts')
        .attach('files', Buffer.from('content'), 'test.pdf');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('UPLOAD_VALIDATION_FAILED');
    });

    it('POST upload with valid txt file returns 200', async () => {
      const response = await request(app)
        .post('/api/sprints/mysprint/transcripts')
        .attach('files', Buffer.from('transcript content'), 'standup.txt');

      expect(response.status).toBe(200);
      expect(response.body.sprintName).toBe('mysprint');
      expect(response.body.uploadedFiles).toHaveLength(1);
      expect(response.body.uploadedFiles[0].fileName).toBe('standup.txt');
    });

    it('GET /api/sprints/:sprintName/transcripts with invalid sprint name returns 400', async () => {
      const response = await request(app).get('/api/sprints/ab/transcripts');
      expect(response.status).toBe(400);
    });

    it('GET /api/sprints/:sprintName/transcripts after upload returns file list', async () => {
      // Upload first
      await request(app)
        .post('/api/sprints/mysprint/transcripts')
        .attach('files', Buffer.from('content'), 'test.txt');

      // List
      const response = await request(app).get('/api/sprints/mysprint/transcripts');
      expect(response.status).toBe(200);
      expect(response.body.sprintName).toBe('mysprint');
      expect(response.body.files).toHaveLength(1);
    });
  });
});

