import { describe, expect, it } from 'vitest';
import {
  authenticatableUserObject,
  changePasswordUserObject,
  insertableUserObject,
  setInitialPasswordDataObject,
  userCountObject,
} from '../../src/objects/user.js';

describe('User tests', () => {
  it('Should not allow unsafe password', () => {
    const insertResult = insertableUserObject.safeParse({
      email: 'test@votura.org',
      password: '12345678',
      role: 'admin',
      active: true,
    });
    expect(insertResult.success).toBe(false);

    const authenticationResult = authenticatableUserObject.safeParse({
      email: 'test@votura.org',
      password: '12345678',
    });
    expect(authenticationResult.success).toBe(false);

    const changePasswordResult = changePasswordUserObject.safeParse({
      currentPassword: 'MyP@ssw0rd!1!',
      newPassword: '12345678',
      newPasswordVerification: '12345678',
    });
    expect(changePasswordResult.success).toBe(false);

    const setInitialPasswordResult = setInitialPasswordDataObject.safeParse({
      userId: '01234567-89ab-cdef-0123-456789abcdef',
      currentPassword: 'MyP@ssw0rd!1!',
      newPassword: '12345678',
      newPasswordVerification: '12345678',
    });
    expect(setInitialPasswordResult.success).toBe(false);
  });

  it('Should not allow different passwords', () => {
    const changePasswordResult = changePasswordUserObject.safeParse({
      currentPassword: 'MyP@ssw0rd!1!',
      newPassword: 'MyP@ssw0rd!1!',
      newPasswordVerification: 'MyP@ssw0rd!2!',
    });
    expect(changePasswordResult.success).toBe(false);

    const setInitialPasswordResult = setInitialPasswordDataObject.safeParse({
      userId: '01234567-89ab-cdef-0123-456789abcdef',
      currentPassword: 'MyP@ssw0rd!1!',
      newPassword: 'MyP@ssw0rd!1!',
      newPasswordVerification: 'MyP@ssw0rd!2!',
    });
    expect(setInitialPasswordResult.success).toBe(false);
  });

  it('Should not allow negative numbers for user count', () => {
    const result = userCountObject.safeParse({
      count: -1,
    });
    expect(result.success).toBe(false);
  });
});
