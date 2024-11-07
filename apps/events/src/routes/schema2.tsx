import { Space } from '@/components/space';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/schema2')({
  component: () => <Space />,
});
