import type { SchemaDataType } from '../../../domain/Domain';

import type { DataType } from '../generated/graphql';

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
