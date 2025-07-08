import { apiRoutes } from './apiRoutes.ts';

export const getter = async (url: string): Promise<unknown> => {
  const response = await fetch(apiRoutes.base + url, {
    method: 'GET',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
};
