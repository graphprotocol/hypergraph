import type { SchemaDataType } from '@graphprotocol/hypergraph/mapping';

import type { DataTypes } from '../generated/graphql';

export function mapKGDataTypeToPrimitiveType(dataType: DataTypes, entity: string): SchemaDataType {
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
      return 'String';
    }
  }
}
