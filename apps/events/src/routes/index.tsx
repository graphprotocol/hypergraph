import { createFileRoute } from '@tanstack/react-router';

import { RequireAuth } from '@/components/auth';
import { Logout } from '@/components/logout';

export const Route = createFileRoute('/')({
  component: Index,
});

export function Index() {
  return (
    <RequireAuth>
      <div className="flex flex-1 justify-center items-center flex-col gap-4">
        <Logout />
      </div>
    </RequireAuth>
  );
}
