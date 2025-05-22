export const fetcher = async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
  const response = await fetch(...args);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};
