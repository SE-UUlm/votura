import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from '../src/app.js';
import { HttpStatusCode } from '../src/httpStatusCode.js';

describe('Handle unknown routes', () => {
  it('should return 400 for unknown route', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
    expect(res.body.message.length).toBeGreaterThan(0);
  });
});
