export function InlineCode({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="text-xs inline font-light text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-600 ring-gray-500/10 rounded-md px-1.5 py-0.5 whitespace-nowrap ring-1 ring-inset">
      {children}
    </span>
  );
}
