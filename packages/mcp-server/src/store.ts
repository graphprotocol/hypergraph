import type { PrefetchedSpace } from './prefetch.js';

export type SpaceInfo = { name: string; id: string };
export type TypeInfo = { id: string; name: string };

export type PrefetchedStore = {
	getSpaces: () => SpaceInfo[];
	getTypes: (spaceId: string) => TypeInfo[];
	getSpaceNames: () => string[];
};

export const buildStore = (prefetchedData: PrefetchedSpace[]): PrefetchedStore => {
	const spaces: SpaceInfo[] = prefetchedData.map((s) => ({ name: s.spaceName, id: s.spaceId }));

	const typesBySpace = new Map<string, TypeInfo[]>();
	for (const space of prefetchedData) {
		const types: TypeInfo[] = space.types
			.filter((t): t is { id: string; name: string } => t.name !== null)
			.map((t) => ({ id: t.id, name: t.name }));
		typesBySpace.set(space.spaceId, types);
	}

	return {
		getSpaces: () => spaces,
		getTypes: (spaceId: string) => typesBySpace.get(spaceId) ?? [],
		getSpaceNames: () => spaces.map((s) => s.name),
	};
};
