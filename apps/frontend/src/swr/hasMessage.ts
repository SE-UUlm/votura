export const hasMessage = (obj: unknown): obj is { message: string } => {
  return (
    typeof obj === 'object' && obj !== null && 'message' in obj && typeof obj.message === 'string'
  );
};
