import { response400Object, response409Object } from '@repo/votura-validators';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { demoUser } from '../mockData.js';

describe(`POST /users`, () => {
  const requestPath = '/users';

  it('201: should create a new user with valid data', async () => {
    const res = await request(app).post(requestPath).send(demoUser);
    expect(res.status).toBe(HttpStatusCode.NoContent);
    expect(res.type).toBe('');
  });

  it('400: should return error for invalid user data', async () => {
    const res = await request(app).post(requestPath).send({
      email: 'invalid-email',
      password: 'short',
    });
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('409: should return error for duplicate email', async () => {
    // User is already created in the first test
    const res = await request(app).post(requestPath).send(demoUser);
    expect(res.status).toBe(HttpStatusCode.Conflict);
    expect(res.type).toBe('application/json');
    const parseResult = response409Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
