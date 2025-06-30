import {
  preparePublish,
  publishOps,
  useCreateEntity,
  useHypergraphApp,
  useQuery,
  useSpaces,
} from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { Event } from '../../schema';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const Events = () => {
  const { data: eventsLocalData } = useQuery(Event, { mode: 'private' });
  const createEvent = useCreateEntity(Event);
  const { getSmartSessionClient } = useHypergraphApp();
  const { data: spaces } = useSpaces({ mode: 'public' });
  const [selectedSpace, setSelectedSpace] = useState<string>('');

  const handlePublish = async (event: Event) => {
    if (!selectedSpace) {
      alert('No space selected');
      return;
    }
    const { ops } = await preparePublish({ entity: event, publicSpace: selectedSpace });
    const smartSessionClient = await getSmartSessionClient();
    if (!smartSessionClient) {
      throw new Error('Missing smartSessionClient');
    }
    const publishResult = await publishOps({
      ops,
      space: selectedSpace,
      name: 'Publish Event',
      walletClient: smartSessionClient,
    });
    console.log(publishResult, ops);
  };

  return (
    <>
      <h2 className="text-2xl font-bold">Events (Local)</h2>
      {eventsLocalData.map((event) => (
        <div key={event.id} className="flex flex-row items-center gap-2">
          <h2>{event.name}</h2>
          <div className="text-xs">{event.id}</div>
          <select
            value={selectedSpace}
            onChange={(e) => setSelectedSpace(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">Select a space</option>
            {spaces?.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>
          <Button variant="secondary" size="sm" onClick={() => handlePublish(event)}>
            Publish
          </Button>
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const name = formData.get('name') as string;
          createEvent({ name });
        }}
      >
        <Input type="text" name="name" />
        <Button type="submit">Create Event</Button>
      </form>
    </>
  );
};
