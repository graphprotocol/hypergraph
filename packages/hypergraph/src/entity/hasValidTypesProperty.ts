export const hasValidTypesProperty = (value: unknown): value is Record<'@@types@@', unknown[]> => {
  return (
    value !== null &&
    typeof value === 'object' &&
    '@@types@@' in value &&
    Array.isArray((value as { '@@types@@': unknown })['@@types@@'])
  );
};
