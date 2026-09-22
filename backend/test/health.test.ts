import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const app = createApp({ FRONTEND_ORIGIN: 'http://localhost:5173' });

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'retrovoice-backend',
    });
  });
});

