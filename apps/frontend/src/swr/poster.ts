import axios, { AxiosError } from 'axios';
import { api } from './api.ts';
import { getAuthLocalStorage } from './authTokens.ts';
import { hasMessage } from './hasMessage.ts';

export const poster = async <T>(url: string, args: { arg: T }): Promise<unknown> => {
  try {
    const authTokens = getAuthLocalStorage();

    const response = await api.post(url, args.arg, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
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
          : 'We encountered an unexpected error while creating a resource. Please try again later or get in contact with us.';
      throw new AxiosError(errorMessage);
    } else {
      throw error;
    }
  }
};
