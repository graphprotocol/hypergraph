import { AddEvent } from '@/components/add-event';
import { AddUser } from '@/components/add-user';
import { Events } from '@/components/events';
import { Users } from '@/components/users';
import { SpaceProvider } from '@/schema';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/space/$spaceId')({
  component: Space,
});

export function Space() {
  const { spaceId } = Route.useParams();

  return (
    <SpaceProvider id={spaceId}>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <h1>Events of Space w/ ID: {spaceId}</h1>

            <div className="flex flex-col space-y-4">
              <AddUser />
              <Users />
              <hr />
              <AddEvent />
              <Events />
            </div>
          </div>
        </section>
      </main>
    </SpaceProvider>
  );
}
