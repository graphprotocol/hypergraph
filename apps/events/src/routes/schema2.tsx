import { SchemaTestAutomerge } from '@/components/schema-test-automerge'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/schema2')({
  component: () => <SchemaTestAutomerge />,
})
