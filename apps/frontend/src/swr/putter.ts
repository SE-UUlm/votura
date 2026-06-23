import axios, { AxiosError } from 'axios';
import { api } from './api.ts';
import { getAuthLocalStorage } from './authTokens.ts';
import { hasMessage } from './hasMessage.ts';
import i18next from 'i18next';


export const putter = async <T>(url: string, args: { arg: T }): Promise<unknown> => {
  try {
    const authTokens = getAuthLocalStorage();

    const response = await api.put(url, args.arg, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ...(authTokens ? { Authorization: i18next.t('bearerAccesstoken', 'Bearer {{accessToken}}', { accessToken: authTokens.accessToken }) } : {}),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data !== undefined && hasMessage(error.response.data)
          ? error.response.data.message
          : i18next.t('weEncounteredAnUnexpectedErrorWhileUpdatingAResourcePleaseTryAgainLaterOrGetInContactWithUs', 'We encountered an unexpected error while updating a resource. Please try again later or get in contact with us.');
      throw new AxiosError(errorMessage);
    } else {
      throw error;
    }
  }
};
