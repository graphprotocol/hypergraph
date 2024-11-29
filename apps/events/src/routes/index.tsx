import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { repo } from '@graphprotocol/graph-framework';

import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: Index,
  // beforeLoad: () => {
  //   if (!isAuthenticated()) {
  //     throw redirect({
  //       to: "/login",
  //       search: {
  //         // Use the current location to power a redirect after login
  //         // (Do not use `router.state.resolvedLocation` as it can
  //         // potentially lag behind the actual current location)
  //         redirect: location.href,
  //       },
  //     });
  //   }
  // },
});

export function Index() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-1 justify-center items-center flex-col gap-4">
      <Button
        onClick={() => {
          const result = repo.create();
          navigate({
            to: '/space/$spaceId',
            params: { spaceId: result.documentId },
          });
        }}
      >
        Create Space
      </Button>
      {/* <Logout /> */}
    </div>
  );
}
