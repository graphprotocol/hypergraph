import type { DataType } from '../generated/graphql';

export function mapKGDataTypeToPrimitiveType(
  dataType: DataType,
  entity: string,
): 'Text' | 'Number' | 'Boolean' | 'Date' | 'Point' | 'Url' | `Relation(${string})` {
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
