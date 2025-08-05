import { Mapping, Utils } from '@graphprotocol/typesync';
import { Schema } from 'effect';

/**
 * Defines the type to be received by the app schema builder.
 * Used to create the app, app_schema_type and app_schema_type_property records
 */
export const InsertAppSchema = Schema.Struct({
  name: Schema.NonEmptyTrimmedString,
  description: Schema.NullOr(Schema.String),
  directory: Schema.NullOr(Schema.String.pipe(Schema.pattern(/^(\.\/|~\/|\/|[a-zA-Z]:\/)[\w\-.\s/]*[\w\-.]$/))),
  template: Schema.Literal('vite_react'),
  types: Schema.Array(Mapping.SchemaType).pipe(
    Schema.minItems(1),
    Schema.filter(Utils.namesAreUnique, {
      identifier: 'DuplicateTypeNames',
      jsonSchema: {},
      description: 'The type.name must be unique across all types in the schema',
    }),
    // todo add back once issues resolved
    // Schema.filter(allRelationPropertyTypesExist, {
    //   identifier: 'AllRelationTypesExist',
    //   jsonSchema: {},
    //   description: 'Each type property of dataType RELATION must have a type of the same name in the schema',
    // }),
  ),
}).annotations({
  identifier: 'typesync/Schema',
  title: 'TypeSync app Schema',
  examples: [
    {
      name: 'Mesh',
      description: 'Track and attend events',
      directory: '/Users/me/dev/mesh',
      template: 'vite_react',
      types: [
        {
          name: 'Account',
          knowledgeGraphId: null,
          properties: [{ name: 'username', knowledgeGraphId: null, dataType: 'String' }],
        },
        {
          name: 'Event',
          knowledgeGraphId: null,
          properties: [
            { name: 'speaker', knowledgeGraphId: null, dataType: 'Relation(Account)', relationType: 'Account' },
          ],
        },
      ],
    },
  ],
});
export type InsertAppSchema = typeof InsertAppSchema.Type;
