
const VOTER_LOCAL_STORAGE_KEY = 'voterToken';

export const setVoterLocalStorage = (token: unknown): void => {
  try {
    if (typeof token === 'string') {
      const t = token.trim();
      // do not store empty strings or the literal "undefined"
      if (t !== '' && t !== 'undefined') {
        localStorage.setItem(VOTER_LOCAL_STORAGE_KEY, t);
        console.debug('[voterToken] set token', t);
        return;
      }
    }

    // if token is invalid, ensure storage is cleared
    clearVoterLocalStorage();
    console.debug('[voterToken] invalid token provided, cleared storage', token);
  } catch (e) {
    console.error('[voterToken] failed to set token', e);
  }
};

export const getVoterLocalStorage = (): string | null => {
  try {
    const raw = localStorage.getItem(VOTER_LOCAL_STORAGE_KEY);
    if (raw === null) return null;
    const t = raw.trim();
    if (t === '' || t === 'undefined') return null;
    console.debug('[voterToken] get token', t);
    return t;
  } catch (e) {
    console.error('[voterToken] failed to get token', e);
    return null;
  }
};

export const clearVoterLocalStorage = (): void => {
  try {
    localStorage.removeItem(VOTER_LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error('[voterToken] failed to clear token', e);
  }
};
