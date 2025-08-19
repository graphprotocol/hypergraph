import { redirect } from 'next/navigation';

import { PublicSpaceWrapper } from '@/Components/Space/PublicSpace';

type PublicSpacePageParams = { params: Promise<{ spaceid: string }> };

export default async function PublicSpacePage(props: Readonly<PublicSpacePageParams>) {
  const params = await props.params;
  const spaceid = params.spaceid;

  if (!spaceid) {
    return redirect('/404');
  }

  return <PublicSpaceWrapper spaceid={spaceid} />;
}
