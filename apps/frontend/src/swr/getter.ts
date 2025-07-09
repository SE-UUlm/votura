import { apiRoutes } from './apiRoutes.ts';
import { hasMessage } from './hasMessage.ts';

export const getter = async (url: string): Promise<unknown> => {
  const response = await fetch(apiRoutes.base + url, {
    method: 'GET',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Accept: 'application/json',
    },
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const errorMessage = hasMessage(data)
      ? data.message
      : 'We encountered an unexpected error while fetching a resource. Please try again later or get in contact with us.';
    throw new Error(errorMessage);
  }

  return data;
};
