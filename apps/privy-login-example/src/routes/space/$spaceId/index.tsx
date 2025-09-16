import { HypergraphSpaceProvider, useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { DevTool } from '@/components/dev-tool';
import { Todos } from '@/components/todos';
import { TodosReadOnly } from '@/components/todos-read-only';
import { TodosReadOnlyFilter } from '@/components/todos-read-only-filter';
import { Button } from '@/components/ui/button';
import { Users } from '@/components/users';

export const Route = createFileRoute('/space/$spaceId/')({
  component: Space,
});

function Space() {
  const { spaceId } = Route.useParams();
  const { isConnecting } = useHypergraphApp();
  const [show2ndTodos, setShow2ndTodos] = useState(false);

  if (isConnecting) {
    return <div className="flex justify-center items-center h-screen">Loading …</div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
      <HypergraphSpaceProvider space={spaceId}>
        <Users />
        <Todos />
        <TodosReadOnlyFilter />
        <TodosReadOnly />
        {show2ndTodos && <Todos />}
        {/* <h3 className="text-xl font-bold">Invite people</h3>
        <div className="flex flex-row gap-2">
          {availableAccounts.map((invitee) => {
            return (
              <Button
                key={invitee.accountAddress}
                onClick={() => {
                  inviteToSpace({
                    space,
                    invitee: { accountAddress: getAddress(invitee.accountAddress) },
                  });
                }}
              >
                Invite {invitee.accountAddress.substring(0, 6)}
              </Button>
            );
          })}
        </div> */}
        <div className="mt-12 flex flex-row gap-2">
          <DevTool spaceId={spaceId} />
          <Button onClick={() => setShow2ndTodos((prevShow2ndTodos) => !prevShow2ndTodos)}>Toggle Todos</Button>
        </div>
      </HypergraphSpaceProvider>
    </div>
  );
}
