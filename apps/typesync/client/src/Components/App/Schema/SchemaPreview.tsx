'use client';

import { useQuery } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import { codeToTokens, type ThemedToken } from 'shiki';

import type { AppSchema } from '../../../schema.js';
import { classnames } from '../../../utils/classnames.js';
import * as Utils from './utils.js';

enum FontStyle {
  NotSet = -1,
  None = 0,
  Italic = 1,
  Bold = 2,
  Underline = 4,
  Strikethrough = 8,
}

type CodeChunk = ThemedToken;
type CodeLine = { chunks: Array<CodeChunk>; style: 'added' | 'deleted' | null };

export function SchemaPreview({ schema }: Readonly<{ schema: AppSchema }>) {
  const { code, hash } = Utils.buildAppSchemaFormCode(schema);
  const { data } = useQuery({
    queryKey: ['App', 'schema', 'preview', hash] as const,
    async queryFn() {
      const tokens = await codeToTokens(code, {
        lang: 'typescript',
        theme: 'github-dark-dimmed',
      });

      return tokens.tokens.map<CodeLine>((lineTokens) => {
        const lineContent = lineTokens.map((token) => token.content).join('');

        if (!lineContent) {
          return { chunks: [], style: null };
        }

        const lineChunks: Array<CodeChunk> = [];
        let currentTokenIndex = 0;
        let currentToken = lineTokens[currentTokenIndex];
        let currentChunk: CodeChunk = {
          ...currentToken,
          content: '',
        };
        let currentOffset = currentChunk.offset;

        for (let characterIndex = 0; characterIndex < lineContent.length; characterIndex++) {
          const character = lineContent[characterIndex];
          const moveToNextToken = currentOffset >= currentToken.offset + currentToken.content.length;
          if (moveToNextToken) {
            lineChunks.push(currentChunk);
            if (moveToNextToken) {
              currentTokenIndex++;
              currentToken = lineTokens[currentTokenIndex];
            }
            currentChunk = { ...currentToken, content: character };
          } else {
            currentChunk.content += character;
          }
          currentOffset++;
        }
        lineChunks.push(currentChunk);

        return {
          chunks: lineChunks,
          style: null,
        };
      });
    },
  });

  const lines = data ?? [];

  return (
    <div className="w-full">
      <pre
        dir="ltr"
        className="overflow-auto [--padding:theme(spacing.4)] bg-gray-50 dark:bg-slate-800 rounded-lg shadow"
      >
        <code
          className={`
              text-m14 grid min-w-max ${/* Ensure the right padding is preserved when there is a horizontal scroll */ ''}
              gap-x-3 py-[var(--padding)]
              group-data-[wrap]/code-block:min-w-0
              group-data-[line-numbers]/code-block:grid-cols-[min-content_1fr]
              group-data-[wrap]/code-block:whitespace-pre-wrap
              group-data-[wrap]/code-block:break-words
            `}
        >
          {lines.flatMap((line, lineIndex) => {
            const key = `schema_preview_line__${lineIndex}`;
            return (
              <span
                key={key}
                data-style={line.style}
                className={classnames(
                  'col-span-full grid min-h-[1lh] grid-cols-subgrid items-baseline px-[var(--padding)]',
                  line.style
                    ? `data-[style=added]:bg-green/16
                      data-[style=deleted]:bg-red/8
                      data-[style=added]:text-green
                      data-[style=deleted]:text-red`
                    : null,
                )}
              >
                <span
                  aria-hidden="true"
                  className="text-m12 hidden select-none text-end text-white/32 group-data-[line-numbers]/code-block:block"
                >
                  {lineIndex + 1}
                </span>
                <span>
                  {line.chunks.map((chunk, chunkIndex) => {
                    const fontStyle = chunk.fontStyle as number | undefined;
                    const chunkClasses = [
                      fontStyle === FontStyle.Bold ? 'font-bold' : null,
                      fontStyle === FontStyle.Italic ? 'italic' : null,
                      fontStyle === FontStyle.Underline ? 'underline' : null,
                    ];
                    const chunkStyle: CSSProperties = {
                      color: chunk.color,
                      backgroundColor: chunk.bgColor,
                    };
                    let chunkContent = chunk.content;
                    if ((line.style === 'added' || line.style === 'deleted') && chunkIndex === 0) {
                      /**
                       * Replace whitespaces between the initial `+` or `-` character and the content of the line with non-breaking spaces,
                       * to prevent wrapping there. Also replace the `-` character by an actual minus symbol (`−`) to prevent wrapping right
                       * after it in Chrome (other browsers seem to understand that it's not a hyphen).
                       */
                      chunkContent = chunkContent.replace(
                        /^([+-])\s+/,
                        (match, plusOrMinus: string) =>
                          (plusOrMinus === '-' ? '−' : plusOrMinus) + '\u00A0'.repeat(match.length - 1),
                      );
                    }

                    const chunkKey = `line_chunk__${chunkIndex}`;

                    return (
                      <span key={chunkKey} className={classnames(...chunkClasses)} style={chunkStyle}>
                        {chunkContent}
                      </span>
                    );
                  })}
                </span>
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
