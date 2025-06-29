import GeoLogo from '@/assets/images/geo-logo-branded.svg?react';
import { LogoutButton } from '@/components/LogoutButton';
import { AppTitle } from '@/components/ui/AppTitle';
import { StoreConnect } from '@graphprotocol/hypergraph';
import { usePrivy } from '@privy-io/react-auth';
import { Outlet, createRootRoute, useLayoutEffect, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useSelector } from '@xstate/store/react';

export const Route = createRootRoute({
  component: () => {
    const accountAddress = useSelector(StoreConnect.store, (state) => state.context.accountAddress);
    const { authenticated, ready } = usePrivy();
    const router = useRouter();

    useLayoutEffect(() => {
      if (router.state.location.href.startsWith('/login')) {
        return;
      }

      if (ready && (!authenticated || !accountAddress)) {
        if (router.state.location.href.startsWith('/authenticate')) {
          localStorage.setItem('geo-connect-authenticate-redirect', router.state.location.href);
        }
        router.navigate({
          to: '/login',
        });
      }
    }, [authenticated, ready, accountAddress]);

    return (
      <div className="isolate grid min-h-dvh grid-rows-[1fr_auto_1fr] gap-4 overflow-clip">
        {authenticated ? (
          <header className="row-1 flex h-16 items-center px-3">
            <div className="flex items-center gap-3 pl-1 text-2xl">
              <GeoLogo className="w-[1em] shrink-0" />
              <AppTitle />
            </div>
            <div className="ml-auto">
              <LogoutButton />
            </div>
          </header>
        ) : null}

        <main className="px-container isolate row-2 flex flex-col">
          <Outlet />
        </main>

        <TanStackRouterDevtools />
      </div>
    );
  },
});
