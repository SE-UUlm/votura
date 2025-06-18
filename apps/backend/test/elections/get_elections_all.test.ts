import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { response406Object, selectableElectionObject } from '@repo/votura-validators';

const AUTH_TOKEN = '1234';
const ELECTIONS_SLUG = '/elections';

describe('GET /elections', () => {
  it('should get all elections', async () => {
    const res = await request(app).get(ELECTIONS_SLUG).set('Authorization', AUTH_TOKEN).send();

    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.type).toBe('application/json');
    expect(res.body).toBeInstanceOf(Array);
    const arrBody = res.body as unknown[];
    expect(arrBody.length).toBeGreaterThan(0);

    const parseResult = await Promise.all(
      arrBody.map((el) => selectableElectionObject.safeParseAsync(el)),
    );

    parseResult.forEach((result) => {
      expect(result.success).toBe(true);
    });
  });

  it('should return 406 Not Acceptable when Accept header is not application/json', async () => {
    const res = await request(app)
      .get(ELECTIONS_SLUG)
      .set('Authorization', AUTH_TOKEN)
      .set('Accept', 'text/plain')
      .send();

    expect(res.status).toBe(HttpStatusCode.NotAcceptable);
    expect(res.type).toBe('application/json');
    const parseResult = await response406Object.safeParseAsync(res.body);
    expect(parseResult.success).toBe(true);
  });
});
