import axios from 'axios';
import { api } from './api.ts';
import { hasMessage } from './hasMessage.ts';

export const getter = async (url: string): Promise<unknown> => {
  try {
    const response = await api.get(url, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = hasMessage(error.response)
        ? error.response.message
        : 'We encountered an unexpected error while fetching a resource. Please try again later or get in contact with us.';
      throw new Error(errorMessage);
    } else {
      throw error
    }
  }
};
