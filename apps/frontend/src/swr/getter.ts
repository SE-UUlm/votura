import axios from 'axios';
import { api } from './api.ts';
import { getAuthLocalStorage } from './authTokens.ts';
import { hasMessage } from './hasMessage.ts';

export const getter = async (url: string): Promise<unknown> => {
  try {
    const authTokens = getAuthLocalStorage();

    const response = await api.get(url, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ...(authTokens ? { Authorization: `Bearer ${authTokens.accessToken}` } : {}),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data !== undefined && hasMessage(error.response.data)
          ? error.response.data.message
          : 'We encountered an unexpected error while fetching a resource. Please try again later or get in contact with us.';
      throw new Error(errorMessage);
    } else {
      throw error;
    }
  }
};
