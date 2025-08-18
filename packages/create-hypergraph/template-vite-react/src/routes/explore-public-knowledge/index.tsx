import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/explore-public-knowledge/')({
  beforeLoad: () => {
    throw redirect({ to: '/explore-public-knowledge/projects' });
  },
});
