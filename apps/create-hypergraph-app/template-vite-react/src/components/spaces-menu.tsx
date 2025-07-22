import { NavigationMenuContent, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { useSpaces } from '@graphprotocol/hypergraph-react';
import { Link } from '@tanstack/react-router';

export function SpacesMenu() {
  const { data: publicSpaces, isPending: publicSpacesPending } = useSpaces({ mode: 'public' });
  const { data: privateSpaces, isPending: privateSpacesPending } = useSpaces({ mode: 'private' });

  const isLoading = publicSpacesPending || privateSpacesPending;

  if (isLoading) {
    return (
      <NavigationMenuContent>
        <ul className="grid w-[300px] gap-3 p-4">
          <li className="text-sm text-muted-foreground">Loading spaces...</li>
        </ul>
      </NavigationMenuContent>
    );
  }

  return (
    <NavigationMenuContent>
      <ul className="grid w-[300px] gap-3 p-4">
        {/* Private Spaces Section */}
        <li>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Private Spaces</div>
          {privateSpaces && privateSpaces.length > 0 ? (
            <div className="space-y-1">
              {privateSpaces.map((space) => (
                <NavigationMenuLink asChild key={space.id}>
                  <Link
                    to="/private-space/$space-id"
                    params={{ 'space-id': space.id }}
                    className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">{space.name}</div>
                  </Link>
                </NavigationMenuLink>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-2">No private spaces found</div>
          )}
        </li>

        {/* Separator */}
        <li className="border-t border-border my-2" />

        {/* Public Spaces Section */}
        <li>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Public Spaces</div>
          {publicSpaces && publicSpaces.length > 0 ? (
            <div className="space-y-1">
              {publicSpaces.map((space) => (
                <NavigationMenuLink asChild key={space.id}>
                  <Link
                    to="/public-space/$space-id"
                    params={{ 'space-id': space.id }}
                    className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">{space.name}</div>
                  </Link>
                </NavigationMenuLink>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-2">No public spaces found</div>
          )}
        </li>
      </ul>
    </NavigationMenuContent>
  );
}
