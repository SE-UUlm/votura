import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from '../src/app.js';
import { HttpStatusCode } from '../src/httpStatusCode.js';
import { response400Object } from '@repo/votura-validators';

describe('Handle unknown routes', () => {
  it('should return 400 for unknown route', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
