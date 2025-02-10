export const hasArrayField = (obj: unknown, key: string): obj is { [K in string]: string[] } => {
  // biome-ignore lint/suspicious/noExplicitAny: any is fine here
  return obj !== null && typeof obj === 'object' && key in obj && Array.isArray((obj as any)[key]);
};
