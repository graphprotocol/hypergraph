import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { formatRelatedEntityList } from '../formatters/entities.js';
import type { PrefetchedStore } from '../store.js';

export const registerGetRelatedEntitiesTool = (server: McpServer, store: PrefetchedStore): void => {
  server.registerTool(
    'get_related_entities',
    {
      title: 'Get Related Entities',
      description:
        'Traverse the knowledge graph from a known entity. Returns entities connected via outgoing relations (entity → targets), incoming relations (other entities → entity), or both. Optionally filter by relation type name (fuzzy-matched). Use this to explore how entities are connected — e.g., find all members of an organization, events at a venue, or topics related to a person.',
      inputSchema: {
        entity_id: z.string().describe('The entity ID to traverse from'),
        relation_type: z
          .string()
          .optional()
          .describe('Optional: filter by relation type name (fuzzy matched, e.g., "Types", "Organizer")'),
        direction: z
          .enum(['outgoing', 'incoming', 'both'])
          .optional()
          .default('both')
          .describe(
            'Traversal direction: "outgoing" (entity → targets), "incoming" (sources → entity), or "both" (default)',
          ),
        limit: z.number().optional().describe('Optional: maximum number of results to return'),
        offset: z.number().optional().describe('Optional: number of results to skip (for pagination)'),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ entity_id, relation_type, direction, limit, offset }) => {
      const entity = store.getEntity(entity_id);

      if (!entity) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Entity "${entity_id}" not found. Provide a valid entity ID from search results.`,
            },
          ],
          isError: true,
        };
      }

      let relationTypeIds: string[] | undefined;
      let relationTypeName: string | undefined;

      if (relation_type) {
        relationTypeIds = store.resolveRelationTypeIds(relation_type);

        if (relationTypeIds.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Relation type "${relation_type}" not found in property registry. Try a different name.`,
              },
            ],
            isError: true,
          };
        }

        relationTypeName = store.resolvePropertyName(relationTypeIds[0]);
      }

      const dir = direction ?? 'both';
      const fullResults = store.getRelatedEntities(entity_id, dir, relationTypeIds);

      const start = offset ?? 0;
      const sliced = limit !== undefined ? fullResults.slice(start, start + limit) : fullResults.slice(start);

      if (sliced.length === 0) {
        const entityName = entity.name ?? entity_id;
        return {
          content: [
            {
              type: 'text' as const,
              text: `No ${dir === 'both' ? '' : `${dir} `}related entities found for "${entityName}".`,
            },
          ],
        };
      }

      const text = formatRelatedEntityList(sliced, store, {
        sourceEntityName: entity.name ?? entity_id,
        direction: dir,
        ...(relationTypeName !== undefined && { relationTypeName }),
        total: fullResults.length,
        ...(limit !== undefined && { limit }),
        ...(offset !== undefined && { offset }),
      });

      return { content: [{ type: 'text' as const, text }] };
    },
  );
};
