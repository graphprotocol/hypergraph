'use client';

import { Schema as HypergraphSchema } from '@graphprotocol/hypergraph/mapping';
import { createFormHook } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import { Schema } from 'effect';

import { fieldContext, formContext } from '@/Components/Form/form.ts';
import { SubmitButton } from '@/Components/Form/SubmitButton.tsx';
import { TextField } from '@/Components/Form/TextField.tsx';
import { TypeSelect } from '@/Components/Schema/TypeSelect.tsx';
import { useHypergraphSchemaQuery } from '@/hooks/useHypergraphSchemaQuery.tsx';

export const Route = createFileRoute('/')({
  component: SchemaBuilderComponent,
});

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    TypeSelect,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

function SchemaBuilderComponent() {
  const { data: schema } = useHypergraphSchemaQuery();

  const createSchemaForm = useAppForm({
    defaultValues: HypergraphSchema.make({
      types: [
        {
          name: '',
          knowledgeGraphId: null,
          properties: [{ name: '', knowledgeGraphId: null, dataType: 'String' }],
        },
      ],
    }),
    validators: {
      onChangeAsyncDebounceMs: 100,
      // biome-ignore lint/suspicious/noExplicitAny: fixes an issue with the prop.dataType type-string of `Relation(${name})`
      onChange: Schema.standardSchemaV1(HypergraphSchema) as any,
    },
  });

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
