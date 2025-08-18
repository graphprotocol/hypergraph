import { useHypergraphAuth } from '@graphprotocol/hypergraph-react';
import { Outlet, createRootRoute, useLayoutEffect, useRouter } from '@tanstack/react-router';
import { Navbar } from '../components/navbar';

const Root = () => {
  const { authenticated } = useHypergraphAuth();
  const router = useRouter();

  useLayoutEffect(() => {
    // Don't redirect on login or authenticate-success pages
    if (
      router.state.location.href.startsWith('/login') ||
      router.state.location.href.startsWith('/authenticate-success') ||
      router.state.location.href.startsWith('/')
    ) {
      return;
    }

    // Only redirect to login if not authenticated and not already on login page
    if (!authenticated) {
      router.navigate({
        to: '/login',
      });
    }
  }, [authenticated, router]);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </>
  );
};

export const Route = createRootRoute({
  component: Root,
});
