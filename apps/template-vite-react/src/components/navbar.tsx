import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useHypergraphApp, useHypergraphAuth } from '@graphprotocol/hypergraph-react';
import { Link, useRouter } from '@tanstack/react-router';
import { SpacesMenu } from './spaces-menu';

export function Navbar() {
  const { authenticated } = useHypergraphAuth();
  const { redirectToConnect, logout } = useHypergraphApp();
  const router = useRouter();

  const handleSignIn = () => {
    redirectToConnect({
      storage: localStorage,
      connectUrl: 'https://connect.geobrowser.io/',
      successUrl: `${window.location.origin}/authenticate-success`,
      redirectFn: (url: URL) => {
        window.location.href = url.toString();
      },
    });
  };

  const handleLogout = () => {
    logout();
    router.navigate({
      to: '/login',
    });
  };

  return (
    <TooltipProvider>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-[9998]">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1">
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/explore-public-knowledge/projects">
                    <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1">
                      Explore Public Knowledge
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>My Spaces</NavigationMenuTrigger>
                  {authenticated ? (
                    <SpacesMenu />
                  ) : (
                    <NavigationMenuContent>
                      <div className="w-[240px] py-4 text-center text-muted-foreground">
                        <p>
                          Sign in to access your
                          <br />
                          private and public spaces
                        </p>
                      </div>
                    </NavigationMenuContent>
                  )}
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Auth Button */}
            <div className="flex items-center space-x-4">
              {authenticated ? (
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              ) : (
                <Button onClick={handleSignIn}>Sign in with Geo Connect</Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
