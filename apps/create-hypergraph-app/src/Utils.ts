import * as Effect from 'effect/Effect';

export const ALWAYS_SKIP_DIRECTORIES = ['node_modules', '.git'];

const SCOPED_PACKAGE_REGEX = /^(?:@([^/]+?)[/])?([^/]+?)$/;

const blockList = ['node_modules', 'favicon.ico'];

// Generated with node -e 'console.log(require("module").builtinModules)'
const nodeBuiltins = [
  '_http_agent',
  '_http_client',
  '_http_common',
  '_http_incoming',
  '_http_outgoing',
  '_http_server',
  '_stream_duplex',
  '_stream_passthrough',
  '_stream_readable',
  '_stream_transform',
  '_stream_wrap',
  '_stream_writable',
  '_tls_common',
  '_tls_wrap',
  'assert',
  'assert/strict',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'diagnostics_channel',
  'dns',
  'dns/promises',
  'domain',
  'events',
  'fs',
  'fs/promises',
  'http',
  'http2',
  'https',
  'inspector',
  'inspector/promises',
  'module',
  'net',
  'os',
  'path',
  'path/posix',
  'path/win32',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'readline/promises',
  'repl',
  'stream',
  'stream/consumers',
  'stream/promises',
  'stream/web',
  'string_decoder',
  'sys',
  'timers',
  'timers/promises',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'util/types',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
];

const invalid = (message: string) => Effect.fail(message);

export function validateProjectName(name: string): Effect.Effect<string, string> {
  if (name.length === 0) {
    return invalid('Project name must be a non-empty string');
  }
  if (name.length > 214) {
    return invalid('Project name must not contain more than 214 characters');
  }
  if (name.toLowerCase() !== name) {
    return invalid('Project name must not contain capital letters');
  }
  if (name.trim() !== name) {
    return invalid('Project name must not contain leading or trailing whitespace');
  }
  if (name.match(/^\./)) {
    return invalid('Project name must not start with a period');
  }
  if (name.match(/^_/)) {
    return invalid('Project name must not start with an underscore');
  }
  if (/[~'!()*]/.test(name.split('/').slice(-1)[0])) {
    return invalid("Project name must not contain the special scharacters ~'!()*");
  }
  const isNodeBuiltin = nodeBuiltins.some((builtinName) => {
    return name.toLowerCase() === builtinName;
  });
  if (isNodeBuiltin) {
    return invalid('Project name must not be a NodeJS built-in module name');
  }
  const isBlockedName = blockList.some((blockedName) => {
    return name.toLowerCase() === blockedName;
  });
  if (isBlockedName) {
    return invalid(`Project name '${name}' is blocked from use`);
  }
  if (encodeURIComponent(name) !== name) {
    // Check scoped packages
    const result = name.match(SCOPED_PACKAGE_REGEX);
    if (result) {
      const user = result[1];
      const pkg = result[2];
      if (encodeURIComponent(user) !== user || encodeURIComponent(pkg) !== pkg) {
        return invalid('Project name must only contain URL-friendly characters');
      }
    }
  }
  return Effect.succeed(name);
}

/**
 * Validates and normalizes a package.json > name according to npm rules
 * Uses the official npm package name regex:
 * "^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$"
 *
 * @param name The proposed package name to validate
 * @returns An object with validity status, normalized name and error message if invalid
 */
export function validatePackageName(name: string): {
  isValid: boolean;
  normalizedName: string;
  errorMessage?: string;
} {
  // Trim whitespace
  const normalizedName = name.trim();

  // Package name cannot be empty
  if (!normalizedName) {
    return {
      isValid: false,
      normalizedName: '',
      errorMessage: 'Package name cannot be empty',
    };
  }

  // Package name length constraints (npm limits to 214 chars)
  if (normalizedName.length > 214) {
    return {
      isValid: false,
      normalizedName,
      errorMessage: 'Package name cannot exceed 214 characters',
    };
  }

  // Use the official npm package name regex
  const npmPackageNameRegex = /^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$/;

  // If the name already matches the regex, it's valid
  if (npmPackageNameRegex.test(normalizedName)) {
    return {
      isValid: true,
      normalizedName,
    };
  }

  // Name is invalid, let's try to normalize it

  // Convert to lowercase (package names cannot contain uppercase)
  let suggestedName = normalizedName.toLowerCase();

  // Handle scoped packages (@username/package-name)
  const isScopedPackage = suggestedName.startsWith('@');

  if (isScopedPackage) {
    const parts = suggestedName.split('/');

    if (parts.length !== 2) {
      // Malformed scoped package, fix the structure
      const scopeName = parts[0].replace(/[^a-z0-9-*~]/g, '-').replace(/^@/, '@');
      const packageName = (parts[1] || 'package').replace(/[^a-z0-9-._~]/g, '-');
      suggestedName = `${scopeName}/${packageName}`;
    } else {
      // Fix each part of the scoped package
      const scopeName = parts[0].replace(/[^a-z0-9-*~@]/g, '-');
      const packageName = parts[1].replace(/[^a-z0-9-._~]/g, '-');
      suggestedName = `${scopeName}/${packageName}`;
    }
  } else {
    // Regular package (not scoped)

    // Remove invalid starting characters (only allow a-z, 0-9, tilde, hyphen)
    suggestedName = suggestedName.replace(/^[^a-z0-9-~]+/, '');

    if (suggestedName === '') {
      suggestedName = 'package'; // Default if nothing valid remains
    }

    // Replace invalid characters with hyphens
    suggestedName = suggestedName.replace(/[^a-z0-9-._~]/g, '-');
  }

  // Test if our suggestion is valid
  if (!npmPackageNameRegex.test(suggestedName)) {
    // If still invalid, provide a simple fallback
    suggestedName = isScopedPackage ? '@user/package' : 'package';
  }

  return {
    isValid: false,
    normalizedName: suggestedName,
    errorMessage: `Invalid package name. Suggested alternative: ${suggestedName}`,
  };
}
