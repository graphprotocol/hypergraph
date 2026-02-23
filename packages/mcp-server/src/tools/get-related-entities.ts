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
        'Traverse the knowledge graph from a known entity. Use direction: "incoming" to find entities that point TO the given entity (e.g., people who "Works at" a company — search for the company, then get incoming "Works at" relations). Use direction: "outgoing" to follow links FROM the entity. Omit relation_type to see all connections at once and discover available relation type names before filtering.',
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
        limit: z.number().optional().describe('Optional: max results (default: 50). Use offset for pagination.'),
        offset: z.number().optional().describe('Optional: number of results to skip (for pagination)'),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ entity_id, relation_type, direction, limit, offset }) => {
      const DEFAULT_LIMIT = 50;
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
      const effectiveLimit = limit ?? DEFAULT_LIMIT;
      const sliced = fullResults.slice(start, start + effectiveLimit);

      if (sliced.length === 0) {
        const entityName = entity.name ?? entity_id;

        if (relation_type) {
          const allRelated = store.getRelatedEntities(entity_id, dir, undefined);
          const availableTypes = [
            ...new Set(allRelated.map((r) => store.resolvePropertyName(r.relationTypeId))),
          ].sort();
          const hint =
            availableTypes.length > 0
              ? `\nAvailable relation types on "${entityName}": ${availableTypes.join(', ')}`
              : '';
          return {
            content: [
              {
                type: 'text' as const,
                text: `No ${dir === 'both' ? '' : `${dir} `}related entities found for "${entityName}" with relation type "${relation_type}".${hint}`,
              },
            ],
          };
        }

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
        limit: effectiveLimit,
        ...(offset !== undefined && { offset }),
      });

      return { content: [{ type: 'text' as const, text }] };
    },
  );
};
