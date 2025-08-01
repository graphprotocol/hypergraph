'use client';

import { createFileRoute } from '@tanstack/react-router';

import { useHypergraphSchemaQuery } from '@/hooks/useHypergraphSchemaQuery.tsx';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const { data: schema } = useHypergraphSchemaQuery();

  return (
    <div>
      Schema Builder
      <ul>
        {schema.types.map((type) => (
          <li key={type.name}>{type.name}</li>
        ))}
      </ul>
    </div>
  );
}
