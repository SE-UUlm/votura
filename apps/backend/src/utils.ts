// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const spreadableOptional = <O extends Record<any, any>, K extends keyof O>(
  object: O,
  key: K,
): Record<string, O[K] & {}> => {
  if (object[key] === null || object[key] === undefined) {
    return {};
  }

  return {
    [key]: object[key],
  };
};
