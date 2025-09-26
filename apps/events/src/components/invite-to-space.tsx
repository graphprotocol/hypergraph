import { useHypergraphApp, useSpace } from '@graphprotocol/hypergraph-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function InviteToSpace() {
  const { inviteToSpace } = useHypergraphApp();
  const { ready: spaceReady, id: spaceId } = useSpace({ mode: 'private' });

  if (!spaceReady) {
    return <div>Loading space...</div>;
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          console.log((event.target as HTMLFormElement).inviteeAddress.value);
          const inviteeAddress = (event.target as HTMLFormElement).inviteeAddress.value;
          await inviteToSpace({
            space: spaceId,
            inviteeAccountAddress: inviteeAddress,
          });
          alert('Invited to space');
          (event.target as HTMLFormElement).inviteeAddress.value = '';
        } catch (error) {
          alert('Failed to invite to space');
          console.error(error);
        }
      }}
    >
      <Input type="text" name="inviteeAddress" />
      <Button type="submit">Invite to space</Button>
    </form>
  );
}
