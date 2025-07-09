import { apiRoutes } from './apiRoutes.ts';
import { hasMessage } from './hasMessage.ts';

export const poster = async <T>(url: string, args: { arg: T }): Promise<unknown> => {
  const response = await fetch(apiRoutes.base + url, {
    method: 'POST',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Accept: 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args.arg),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const errorMessage = hasMessage(data)
      ? data.message
      : 'We encountered an unexpected error while creating a resource. Please try again later or get in contact with us.';
    throw new Error(errorMessage);
  }

  return data;
};
