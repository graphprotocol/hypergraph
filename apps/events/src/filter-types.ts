import { Entity } from '@graphprotocol/hypergraph';

// Filter options for Entity.Checkbox fields
export type CheckboxFilter = {
  is: boolean;
};

// Filter options for Entity.Number fields
export type NumberFilter = {
  is?: number;
  greaterThan?: number;
  lessThan?: number;
};

// Filter options for Entity.Text fields
export type TextFilter = {
  is?: string;
  startsWith?: string;
  endsWith?: string;
  contains?: string;
  equals?: string;
};

// Generic type to map Entity field types to their corresponding filter types
export type EntityFieldFilter<T> = T extends typeof Entity.Checkbox
  ? CheckboxFilter
  : T extends typeof Entity.Number
    ? NumberFilter
    : T extends typeof Entity.Text
      ? TextFilter
      : never;

// Type to convert an Entity.Class fields object to a filter object
export type EntityFilter<T> = {
  [K in keyof T]?: EntityFieldFilter<T[K]>;
};

// Example usage:
// type TodoFilter = EntityFilter<typeof Todo.fields>;
// This would create a type like:
// {
//   name?: TextFilter;
//   completed?: CheckboxFilter;
//   assignees?: never; // Relations are not supported in filters
// }
