import { useSpaces } from '@/hooks/use-spaces';

export function Spaces() {
  const { isPending, error, data } = useSpaces();

  if (isPending) return 'Loading spaces …';

  if (error) return `An error has occurred: ${error.message}`;

  return (
    <div>
      <h2 className="font-bold mb-2 mt-2">Spaces</h2>
      <ul className="space-y-4">
        {data.map((space) => (
          <li key={space.id}>
            <p>{space.name}</p>
            <p className="text-xs text-gray-500 mt-2 mb-1">Apps with access to this space</p>
            <ul>
              {space.apps.map((app) => (
                <li key={app.id} className="text-sm">
                  {app.name}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
