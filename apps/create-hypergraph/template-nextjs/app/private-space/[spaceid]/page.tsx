import { redirect } from 'next/navigation';

import { PrivateSpaceWrapper } from '@/Components/Space/PrivateSpace';

type PrivateSpacePageParams = { params: Promise<{ spaceid: string }> };

export default async function PrivateSpacePage(props: Readonly<PrivateSpacePageParams>) {
  const params = await props.params;
  const spaceid = params.spaceid;

  if (!spaceid) {
    return redirect('/404');
  }

  return <PrivateSpaceWrapper spaceid={spaceid} />;
}
