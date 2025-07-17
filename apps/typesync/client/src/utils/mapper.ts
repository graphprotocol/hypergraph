import type { SchemaDataType } from '@graphprotocol/typesync/Mapping';

import type { DataTypes } from '../generated/graphql';

export function mapKGDataTypeToPrimitiveType(dataType: DataTypes, entity: string): SchemaDataType {
  switch (dataType) {
    case 'CHECKBOX': {
      return 'Checkbox';
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
