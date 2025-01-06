import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/space/$spaceId')({
  component: RouteComponent,
});

function RouteComponent() {
  return 'Hello /space/$spaceId!';
}
