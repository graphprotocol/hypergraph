import type { Invitation } from 'graph-framework';
import { Button } from './ui/button';

type Props = {
  invitations: Invitation[];
  accept: (invitation: Invitation) => void;
};

export function DebugInvitations({ invitations, accept }: Props) {
  return (
    <ul className="text-xs">
      {invitations.map((invitation) => {
        return (
          <li key={invitation.spaceId} className="border border-gray-300">
            <pre>{JSON.stringify(invitation, null, 2)}</pre>
            <Button
              onClick={() => {
                accept(invitation);
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
