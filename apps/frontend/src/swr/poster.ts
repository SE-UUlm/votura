import { apiRoutes } from './apiRoutes.ts';

export const poster = async <T>(url: string, args: { arg: T }): Promise<unknown> => {
  const response = await fetch(apiRoutes.base + url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args.arg),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};
