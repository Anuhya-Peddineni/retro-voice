import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { LocalStorageService } from '../src/services/storage.service';

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const app = createApp(
      { FRONTEND_ORIGIN: 'http://localhost:5173', GEMINI_MODEL: 'gemini-3.8-flash' },
      { storageService: new LocalStorageService() },
    );

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'retrovoice-backend',
    });
  });
});

