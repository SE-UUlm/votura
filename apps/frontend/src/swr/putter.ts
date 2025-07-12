import axios from 'axios';
import { api } from './api.ts';
import { hasMessage } from './hasMessage.ts';

export const putter = async <T>(url: string, args: { arg: T }): Promise<unknown> => {
  try {
    const response = await api.put(url, args.arg, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = hasMessage(error.response)
        ? error.response.message
        : 'We encountered an unexpected error while updating a resource. Please try again later or get in contact with us.';
      throw new Error(errorMessage);
    } else {
      throw error;
    }
  }
};
