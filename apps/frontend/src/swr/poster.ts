import { apiRoutes } from './apiRoutes.ts';

export const poster = async (url: string, data: unknown): Promise<unknown> => {
  const response = await fetch(apiRoutes.base + url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};
