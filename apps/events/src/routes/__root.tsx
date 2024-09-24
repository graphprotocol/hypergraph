import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { CalendarDays } from "lucide-react";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="flex flex-col min-h-screen">
        <header className="px-4 lg:px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center justify-center" href="#">
            <span className="sr-only">Acme Events</span>
            <CalendarDays className="h-6 w-6" />
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              to="/space/$spaceId"
              params={{ spaceId: "abc" }}
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Space A
            </Link>
            <Link
              to="/space/$spaceId"
              params={{ spaceId: "bcd" }}
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Space B
            </Link>
          </nav>
        </header>
        <hr />

        <Outlet />
        <TanStackRouterDevtools />

        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2023 Acme Events. All rights reserved.
          </p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <a className="text-xs hover:underline underline-offset-4" href="#">
              Terms of Service
            </a>
            <a className="text-xs hover:underline underline-offset-4" href="#">
              Privacy
            </a>
          </nav>
        </footer>
      </div>
    </>
  ),
});
