import type { Doc } from '@/types';
import type { AutomergeUrl } from '@automerge/automerge-repo';
import { useDocument } from '@automerge/automerge-repo-react-hooks';
import { Button } from './ui/button';

export const AutomergeApp = ({ url }: { url: AutomergeUrl }) => {
  const [doc, changeDoc] = useDocument<Doc>(url);

  if (!doc) {
    return null;
  }

  return (
    <Button
      onClick={() => {
        changeDoc((d: Doc) => {
          d.count = (d.count || 0) + 1;
        });
      }}
    >
      Count: {doc?.count ?? 0}
    </Button>
  );
};
