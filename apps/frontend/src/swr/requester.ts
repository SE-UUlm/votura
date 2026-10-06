import axios, { AxiosError, type AxiosResponse } from 'axios';
import i18next from 'i18next';
import { hasMessage } from './hasMessage.ts';

export const request = async <T>(
  send: () => Promise<AxiosResponse<T>>,
  fallbackMessageKey: string,
  fallbackMessage: string,
): Promise<AxiosResponse<T>> => {
  try {
    return await send();
  } catch (error: unknown) {
    if (!axios.isAxiosError(error)) {
      throw error;
    }

    let message = i18next.t(fallbackMessageKey, fallbackMessage);

    if (error.response?.data !== undefined && hasMessage(error.response.data)) {
      // Use error message from server response
      message = error.response.data.message;
    } else if (error.response?.status === 429) {
      // Check for rate limiting response
      message = i18next.t(
        'tooManyRequestsPleaseTryAgainLater',
        'Too many requests. Please try again later.',
      );
    }

    throw new AxiosError(message, error.code, error.config, error.request, error.response);
  }
};
