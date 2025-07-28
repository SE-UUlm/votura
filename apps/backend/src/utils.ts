// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const spreadableOptional = <O extends Record<any, any>, K extends keyof O>(
  object: O,
  key: K,
): Record<string, O[K]> | Record<string, never> => {
  if (object[key] === null || object[key] === undefined) {
    return {};
  }

  return {
    [key]: object[key],
  };
};

export function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  if (set1.size !== set2.size) {
    return false;
  }
  return [...set1].every((item) => set2.has(item));
}
