/**
 * Validates and normalizes a package name according to npm rules
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
