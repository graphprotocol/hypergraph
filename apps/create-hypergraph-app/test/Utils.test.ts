import { describe, expect, it } from '@effect/vitest';

import * as Utils from '../src/Utils.js';

describe('Utils', () => {
  describe('validatePackageName', () => {
    describe('valid package names', () => {
      it('should accept simple lowercase names', () => {
        const result = Utils.validatePackageName('mypackage');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('mypackage');
        expect(result.errorMessage).toBeUndefined();
      });

      it('should accept names with hyphens', () => {
        const result = Utils.validatePackageName('my-package-name');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('my-package-name');
      });

      it('should accept names with dots', () => {
        const result = Utils.validatePackageName('my.package.name');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('my.package.name');
      });

      it('should accept names with underscores', () => {
        const result = Utils.validatePackageName('my_package_name');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('my_package_name');
      });

      it('should accept names starting with numbers', () => {
        const result = Utils.validatePackageName('123package');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('123package');
      });

      it('should accept names starting with tilde', () => {
        const result = Utils.validatePackageName('~package');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('~package');
      });

      it('should accept valid scoped packages', () => {
        const result = Utils.validatePackageName('@myorg/mypackage');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('@myorg/mypackage');
      });

      it('should accept scoped packages with dots and underscores', () => {
        const result = Utils.validatePackageName('@my-org/my.package_name');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('@my-org/my.package_name');
      });

      it('should trim whitespace and validate', () => {
        const result = Utils.validatePackageName('  mypackage  ');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('mypackage');
      });
    });

    describe('invalid package names', () => {
      it('should reject empty names', () => {
        const result = Utils.validatePackageName('');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('');
        expect(result.errorMessage).toBe('Package name cannot be empty');
      });

      it('should reject names with only whitespace', () => {
        const result = Utils.validatePackageName('   ');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('');
        expect(result.errorMessage).toBe('Package name cannot be empty');
      });

      it('should reject names exceeding 214 characters', () => {
        const longName = 'a'.repeat(215);
        const result = Utils.validatePackageName(longName);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Package name cannot exceed 214 characters');
      });

      it('should reject names with uppercase letters', () => {
        const result = Utils.validatePackageName('MyPackage');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('mypackage');
        expect(result.errorMessage).toContain('Invalid package name');
      });

      it('should reject names with spaces', () => {
        const result = Utils.validatePackageName('my package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('my-package');
      });

      it('should reject names with special characters', () => {
        const result = Utils.validatePackageName('my@package!');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('my-package-');
      });

      it('should reject names starting with invalid characters', () => {
        const result = Utils.validatePackageName('!package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('package');
      });

      it('should reject malformed scoped packages', () => {
        const result = Utils.validatePackageName('@myorg');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@user/package');
      });

      it('should reject scoped packages with multiple slashes', () => {
        const result = Utils.validatePackageName('@myorg/sub/package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@user/package');
      });
    });

    describe('package name normalization', () => {
      it('should convert uppercase to lowercase', () => {
        const result = Utils.validatePackageName('MYPACKAGE');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('mypackage');
      });

      it('should replace spaces with hyphens', () => {
        const result = Utils.validatePackageName('my awesome package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('my-awesome-package');
      });

      it('should remove invalid starting characters', () => {
        const result = Utils.validatePackageName('###package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('package');
      });

      it('should handle names that become empty after cleaning', () => {
        const result = Utils.validatePackageName('###');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('package');
      });

      it('should normalize scoped packages correctly', () => {
        const result = Utils.validatePackageName('@My Org/My Package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@my-org/my-package');
      });

      it('should handle scoped packages with invalid characters', () => {
        const result = Utils.validatePackageName('@my!org/my!package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@my-org/my-package');
      });

      it('should provide fallback for completely invalid names', () => {
        const result = Utils.validatePackageName('@###/###');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@---/---');
      });
    });

    describe('edge cases', () => {
      it('should handle single character names', () => {
        const result = Utils.validatePackageName('a');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('a');
      });

      it('should handle names at exactly 214 characters', () => {
        const maxLengthName = 'a'.repeat(214);
        const result = Utils.validatePackageName(maxLengthName);
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe(maxLengthName);
      });

      it('should handle scoped packages with empty scope', () => {
        const result = Utils.validatePackageName('@/package');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('@/package');
      });

      it('should handle scoped packages with empty package name', () => {
        const result = Utils.validatePackageName('@myorg/');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@user/package');
      });

      it('should handle names with consecutive special characters', () => {
        const result = Utils.validatePackageName('my---package');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('my---package');
      });

      it('should handle names with mixed valid and invalid characters', () => {
        const result = Utils.validatePackageName('my$package%name');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('my-package-name');
      });
    });
  });
});
