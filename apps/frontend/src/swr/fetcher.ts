export const fetcher = async (...args: Parameters<typeof fetch>): Promise<unknown> => {
  const response = await fetch(...args);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};
