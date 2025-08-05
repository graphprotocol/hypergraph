import type { Mapping } from '@graphprotocol/hypergraph';

import type { DataTypes } from '../generated/graphql';

export function mapKGDataTypeToPrimitiveType(dataType: DataTypes, entity: string): Mapping.SchemaDataType {
  switch (dataType) {
    case 'BOOLEAN': {
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
