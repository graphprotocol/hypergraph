/**
 * We only use Prettier to sort Tailwind classes; Biome handles the rest.
 * When Biome's `useSortedClasses` is on par with `prettier-plugin-tailwindcss`, we can switch to it and remove Prettier completely.
 * See https://biomejs.dev/linter/rules/use-sorted-classes/
 */
export default {
  singleQuote: true,
  printWidth: 120,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindPreserveWhitespace: true,
  tailwindFunctions: ['cn'],
};
