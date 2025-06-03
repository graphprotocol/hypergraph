export function ErrorMessages({
  id,
  errors,
}: Readonly<{ id: string | undefined; errors: Array<string | { message: string }> }>) {
  return (
    <div id={id} className="mt-2 flex flex-col gap-y-1 w-full">
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="text-sm text-red-600 dark:text-red-500 w-full"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </div>
  );
}
