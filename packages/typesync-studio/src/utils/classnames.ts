export function classnames(...classes: Readonly<Array<string | null>>): string {
  return classes.filter(Boolean).join(' ');
}
