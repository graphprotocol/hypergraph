import type { Invitation } from 'graph-framework';
import { Button } from './ui/button';

export function DebugInvitations({ invitations }: { invitations: Invitation[] }) {
  return (
    <ul className="text-xs">
      {invitations.map((invitation) => {
        return (
          <li key={invitation.spaceId} className="border border-gray-300">
            <pre>{JSON.stringify(invitation, null, 2)}</pre>
            <Button
              onClick={() => {
                alert('TODO');
              }}
            >
              Accept
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
