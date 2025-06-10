import type { DataType } from '../generated/graphql';
import type { SchemaTypeName } from '../schema';

export function mapKGDataTypeToPrimitiveType(dataType: DataType, entity: string): SchemaTypeName {
  switch (dataType) {
    case 'CHECKBOX': {
      return 'Boolean';
    }
    case 'NUMBER': {
      return 'Number';
    }
    case 'POINT': {
      return 'Point';
    }
    case 'TIME': {
      return 'Date';
    }
    case 'RELATION': {
      return `Relation(${entity})`;
    }
    default: {
      return 'Text';
    }
  }
}
