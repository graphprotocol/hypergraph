import type { SpaceInfo } from '../store.js';

export const formatSpacesList = (spaces: SpaceInfo[]): string => {
  const lines = spaces.map((s) => `- ${s.name}`);
  return `## Available Spaces\n\n${lines.join('\n')}`;
};
