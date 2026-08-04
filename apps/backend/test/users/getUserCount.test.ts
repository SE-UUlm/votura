import { insertableUserObject, userCountObject } from '@repo/votura-validators';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import {
  createUser,
  userCount as getPersistentUserCount,
} from '../../src/services/users.service.js';

describe(`GET /users/count`, () => {
  const requestPath = '/users/count';

  it('200: should return the current user count without authentication', async () => {
    const baseCount = await getPersistentUserCount();
    const uniqueSuffix = Date.now();

    await createUser(
      insertableUserObject.parse({
        email: `count-user-a-${uniqueSuffix}@votura.org`,
        password: 'MyStrong!Password123',
        role: 'user',
        active: true
      }),
    );
    await createUser(
      insertableUserObject.parse({
        email: `count-user-b-${uniqueSuffix}@votura.org`,
        password: 'MyStrong!Password123',
        role: 'user',
        active: true
      }),
    );

    const res = await request(app).get(requestPath);

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = userCountObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.count).toBe(baseCount + 2);
  });
});
