import { apiRoutes } from './apiRoutes.ts';

export const putter = async <T>(url: string, args: { arg: T }): Promise<unknown> => {
  const response = await fetch(apiRoutes.base + url, {
    method: 'PUT',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Accept: 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args.arg),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
};
