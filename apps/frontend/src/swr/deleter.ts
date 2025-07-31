import axios from 'axios';
import { api } from './api.ts';
import { getAuthLocalStorage } from './authTokens.ts';
import { hasMessage } from './hasMessage.ts';

export const deleter = async (url: string): Promise<null> => {
  try {
    const authTokens = getAuthLocalStorage();

    await api.delete(url, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ...(authTokens ? { Authorization: `Bearer ${authTokens.accessToken}` } : {}),
      },
    });

    return null;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data !== undefined && hasMessage(error.response.data)
          ? error.response.data.message
          : 'We encountered an unexpected error while deleting a resource. Please try again later or get in contact with us.';
      throw new Error(errorMessage);
    } else {
      throw error;
    }
  }
};
