import { Link, Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/space/$spaceId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { spaceId } = Route.useParams();

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
          <Link
            to={'/space/$spaceId'}
            params={{ spaceId }}
            className="px-3 py-2 text-sm font-medium rounded-md"
            activeProps={{
              className: 'bg-gray-100 text-gray-900',
            }}
            inactiveProps={{
              className: 'text-gray-500 hover:text-gray-700',
            }}
          >
            Home
          </Link>
          <Link
            to={'/space/$spaceId/public-integration'}
            params={{ spaceId }}
            className="px-3 py-2 text-sm font-medium rounded-md"
            activeProps={{
              className: 'bg-gray-100 text-gray-900',
            }}
            inactiveProps={{
              className: 'text-gray-500 hover:text-gray-700',
            }}
          >
            Public Integration
          </Link>
          <Link
            to={'/space/$spaceId/playground'}
            params={{ spaceId }}
            className="px-3 py-2 text-sm font-medium rounded-md"
          >
            Playground
          </Link>
          <Link to={'/space/$spaceId/users'} params={{ spaceId }} className="px-3 py-2 text-sm font-medium rounded-md">
            Users
          </Link>

          <Link
            to={'/space/$spaceId/playground'}
            params={{ spaceId }}
            className="px-3 py-2 text-sm font-medium rounded-md"
          >
            Playground
          </Link>
          <Link to={'/space/$spaceId/chat'} params={{ spaceId }} className="px-3 py-2 text-sm font-medium rounded-md">
            Chat
          </Link>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
