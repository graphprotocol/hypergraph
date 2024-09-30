import {
  Boolean,
  Schema as EffectSchema,
  Number,
  String,
} from "@effect/schema/Schema";
import { useY } from "react-yjs";
import * as Yjs from "yjs";

export const t = {
  String: String,
  Number: Number,
  Boolean: Boolean,
} as const;

type SchemaType = (typeof t)[keyof typeof t];

export type Schema<E extends Record<string, Record<string, SchemaType>>> = {
  entities: E;
};

type TypeOf<S> = S extends EffectSchema<any, infer A> ? A : never;

type InferSchemaType<T extends Record<string, SchemaType>> = {
  [K in keyof T]: TypeOf<T[K]>;
};

export function createSchema<
  E extends Record<string, Record<string, SchemaType>>,
>({ schema, yDoc }: { schema: { entities: E }; yDoc: Yjs.Doc }) {
  return {
    useQuery<K extends keyof E>({
      entity,
    }: {
      entity: K;
    }): InferSchemaType<E[K]>[] {
      const yEntities = yDoc.getMap("entities");
      if (!yEntities.has(entity as string)) {
        yEntities.set(entity as string, new Yjs.Map());
      }
      const yEntityMap = yEntities.get(entity as string) as Yjs.Map<any>;
      const entityMap = useY(yEntityMap);
      return Object.values(entityMap) as InferSchemaType<E[K]>[];
    },
    createEntity<K extends keyof E>({
      entity,
      data,
    }: {
      entity: K;
      data: InferSchemaType<E[K]>;
    }) {
      const yEntities = yDoc.getMap("entities");
      if (!yEntities.has(entity as string)) {
        yEntities.set(entity as string, new Yjs.Map());
      }
      const yEntityMap = yEntities.get(entity as string) as Yjs.Map<any>;
      yEntityMap.set((data as any).id, data);
    },
    deleteEntity<K extends keyof E>({ entity, id }: { entity: K; id: string }) {
      const yEntities = yDoc.getMap("entities");
      if (yEntities.has(entity as string)) {
        const yEntityMap = yEntities.get(entity as string) as Yjs.Map<any>;
        if (yEntityMap.has(id)) {
          yEntityMap.delete(id);
        }
      }
    },
  };
}
