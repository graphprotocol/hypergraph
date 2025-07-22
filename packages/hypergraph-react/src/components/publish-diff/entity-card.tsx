import { useState } from 'react';
import type { EntityLike } from '../../types.js';
import { IGNORED_PROPERTIES } from './constants.js';

type EntityCardProps = {
  entity: EntityLike;
  type: 'new' | 'deleted';
};

export const EntityCard = ({ entity, type }: EntityCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const headerBgColor = type === 'new' ? 'bg-green-50' : 'bg-red-50';
  const borderColor = type === 'new' ? 'border-green-200' : 'border-red-200';
  const textColor = type === 'new' ? 'text-green-800' : 'text-red-800';

  return (
    <div className={`border rounded-sm ${borderColor} overflow-hidden text-xs`}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: EntityCard has keyboard support via Enter key */}
      <div
        className={`p-3 flex justify-between items-center cursor-pointer ${headerBgColor}`}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className={`font-medium ${textColor}`}>
          {/* TODO: We should always be able to rely on the constructor, but sometimes it's a raw object */}
          {(entity as { type?: string }).type || entity.constructor?.name}{' '}
          <span className="text-gray-500 font-normal"> - {entity.id}</span>
        </div>
        <button className="text-gray-500" type="button">
          {isExpanded ? (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Collapse</title>
              <path d="m18 15-6-6-6 6" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Expand</title>
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="px-3 pt-0 border-t border-dashed border-gray-200 bg-white">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-1/3" />
              <col className="w-2/3" />
            </colgroup>
            <tbody>
              {Object.entries(entity)
                .filter(([key]) => !IGNORED_PROPERTIES.includes(key))
                .map(([key, value]) => (
                  <tr key={key} className="border-b border-gray-100 last:border-0">
                    <td className="py-1.5 font-medium text-gray-600 pr-3">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </td>
                    <td className="py-1.5">
                      {/* check for number to exclude Point fields */}
                      {Array.isArray(value) && !value.every((v) => typeof v === 'number') ? (
                        <ul>
                          {value.map(({ id, name }) => (
                            <li key={id}>
                              {name} <span className="text-gray-500">- {id}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        String(value)
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
