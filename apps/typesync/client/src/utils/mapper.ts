import type { DataType } from '../generated/graphql';
import type { SchemaDataType } from '../schema';

export function mapKGDataTypeToPrimitiveType(dataType: DataType, entity: string): SchemaDataType {
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
