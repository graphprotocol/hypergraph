import type { Entity } from '@graphprotocol/hypergraph';
import { useState } from 'react';
import type { DiffEntry } from '../../types.js';
import { IGNORED_PROPERTIES } from './constants.js';

type UpdatedEntityCardProps<S extends Entity.AnyNoContext> = {
  entity: {
    id: string;
    current: Entity.Entity<S>;
    next: Entity.Entity<S>;
    diff: DiffEntry<S>;
  };
};

export const UpdatedEntityCard = <S extends Entity.AnyNoContext>({ entity }: UpdatedEntityCardProps<S>) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get all unique keys from both current and next, excluding ignored properties
  const allKeys = new Set(
    [...Object.keys(entity.current), ...Object.keys(entity.next)].filter((key) => !IGNORED_PROPERTIES.includes(key)),
  );

  return (
    <div className="border rounded-sm border-gray-200 overflow-hidden text-xs">
      <div
        className="p-3 flex justify-between items-center cursor-pointer bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="font-medium">ID: {entity.id}</div>
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
        <div className="px-3 pt-1.5 border-t border-dashed border-gray-200">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-1/3" />
              <col className="w-1/3" />
              <col className="w-1/3" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 font-medium text-gray-600" />
                <th className="text-left py-1.5 font-medium text-gray-600">Current</th>
                <th className="text-left py-1.5 font-medium text-gray-600">New</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(allKeys).map((key) => {
                const currentValue = entity.current[key];
                const nextValue = entity.next[key];
                const hasChanged = currentValue !== nextValue;

                return (
                  <tr key={key} className="border-b border-gray-100 last:border-0">
                    <td className="py-1.5 font-medium text-gray-600 pr-3">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </td>
                    <td className="py-1.5">
                      {hasChanged ? <span className="text-red-700">{String(currentValue)}</span> : String(currentValue)}
                    </td>
                    <td className="py-1.5">
                      {nextValue !== undefined && nextValue !== null ? (
                        hasChanged ? (
                          <span className="text-green-700">{String(nextValue)}</span>
                        ) : (
                          String(nextValue)
                        )
                      ) : (
                        String(currentValue)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
