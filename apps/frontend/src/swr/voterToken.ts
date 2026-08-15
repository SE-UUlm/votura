const VOTER_LOCAL_STORAGE_KEY = 'voterToken';

export const clearVoterLocalStorage = (): void => {
  try {
    localStorage.removeItem(VOTER_LOCAL_STORAGE_KEY);
  } catch (e: unknown) {
    console.error('[voterToken] failed to clear token', e);
  }
};

export const setVoterLocalStorage = (token: string): void => {
  try {
    const t = token.trim();
    if (t !== '' && t !== 'undefined') {
      localStorage.setItem(VOTER_LOCAL_STORAGE_KEY, t);
      return;
    }
    clearVoterLocalStorage();
  } catch (e: unknown) {
    console.error('[voterToken] failed to set token', e);
  }
};

export const getVoterLocalStorage = (): string | null => {
  try {
    const raw = localStorage.getItem(VOTER_LOCAL_STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const t = raw.trim();
    if (t === '' || t === 'undefined') {
      return null;
    }
    return t;
  } catch (e: unknown) {
    console.error('[voterToken] failed to get token', e);
    return null;
  }
};
