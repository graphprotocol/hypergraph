import { Data } from 'effect';

export class ConfigError extends Data.TaggedError('ConfigError')<{
	readonly message: string;
}> {}

export class PrefetchError extends Data.TaggedError('PrefetchError')<{
	readonly space: string;
	readonly cause: unknown;
}> {}

export class GraphQLError extends Data.TaggedError('GraphQLError')<{
	readonly query: string;
	readonly cause: unknown;
}> {}
