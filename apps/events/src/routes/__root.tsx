import { Logout } from '@/components/logout';
import { useHypergraphAuth } from '@graphprotocol/hypergraph-react';
import { Link, Outlet, createRootRoute, useLayoutEffect, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => {
    const { authenticated, identity } = useHypergraphAuth();

    const router = useRouter();

    useLayoutEffect(() => {
      if (router.state.location.href.startsWith('/login')) {
        return;
      }

      if (!authenticated) {
        router.navigate({
          to: '/login',
        });
      }
    }, [authenticated]);

    return (
      <>
        <div className="flex flex-col min-h-screen">
          <header className="px-4 lg:px-6 h-14 flex items-center">
            <Link to={authenticated ? '/' : '/login'} className="flex items-center justify-center">
              Home
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6">
              {authenticated ? (
                <div className="flex items-center gap-4">
                  <Link className="text-xs" to="/settings/export-wallet">
                    Export Wallet
                  </Link>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {identity?.accountId.substring(0, 6)}
                  </span>
                  <Logout />
                </div>
              ) : null}
            </nav>
          </header>
          <hr />

          <Outlet />

          <TanStackRouterDevtools />

          <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
            <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 Acme Events. All rights reserved.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
              {/* biome-ignore lint/a11y/useValidAnchor: todo */}
              <a className="text-xs hover:underline underline-offset-4" href="#">
                Terms of Service
              </a>
              {/* biome-ignore lint/a11y/useValidAnchor: todo */}
              <a className="text-xs hover:underline underline-offset-4" href="#">
                Privacy
              </a>
            </nav>
          </footer>
        </div>
      </>
    );
  },
});
