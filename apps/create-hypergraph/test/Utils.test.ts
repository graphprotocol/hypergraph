import * as HelpDoc from '@effect/cli/HelpDoc';
import { describe, it } from '@effect/vitest';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';

import * as Utils from '../src/Utils.js';

describe('Utils', () => {
  describe('validatePackageName', () => {
    describe('valid package names', () => {
      it('should accept simple lowercase names', ({ expect }) => {
        const result = Utils.validatePackageName('mypackage');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('mypackage');
        expect(result.errorMessage).toBeUndefined();
      });

      it('should accept names with hyphens', ({ expect }) => {
        const result = Utils.validatePackageName('my-package-name');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('my-package-name');
      });

      it('should accept names with dots', ({ expect }) => {
        const result = Utils.validatePackageName('my.package.name');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('my.package.name');
      });

      it('should accept names with underscores', ({ expect }) => {
        const result = Utils.validatePackageName('my_package_name');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('my_package_name');
      });

      it('should accept names starting with numbers', ({ expect }) => {
        const result = Utils.validatePackageName('123package');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('123package');
      });

      it('should accept names starting with tilde', ({ expect }) => {
        const result = Utils.validatePackageName('~package');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('~package');
      });

      it('should accept valid scoped packages', ({ expect }) => {
        const result = Utils.validatePackageName('@myorg/mypackage');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('@myorg/mypackage');
      });

      it('should accept scoped packages with dots and underscores', ({ expect }) => {
        const result = Utils.validatePackageName('@my-org/my.package_name');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('@my-org/my.package_name');
      });

      it('should trim whitespace and validate', ({ expect }) => {
        const result = Utils.validatePackageName('  mypackage  ');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('mypackage');
      });
    });

    describe('invalid package names', () => {
      it('should reject empty names', ({ expect }) => {
        const result = Utils.validatePackageName('');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('');
        expect(result.errorMessage).toBe('Package name cannot be empty');
      });

      it('should reject names with only whitespace', ({ expect }) => {
        const result = Utils.validatePackageName('   ');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('');
        expect(result.errorMessage).toBe('Package name cannot be empty');
      });

      it('should reject names exceeding 214 characters', ({ expect }) => {
        const longName = 'a'.repeat(215);
        const result = Utils.validatePackageName(longName);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Package name cannot exceed 214 characters');
      });

      it('should reject names with uppercase letters', ({ expect }) => {
        const result = Utils.validatePackageName('MyPackage');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('mypackage');
        expect(result.errorMessage).toContain('Invalid package name');
      });

      it('should reject names with spaces', ({ expect }) => {
        const result = Utils.validatePackageName('my package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('my-package');
      });

      it('should reject names with special characters', ({ expect }) => {
        const result = Utils.validatePackageName('my@package!');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('my-package-');
      });

      it('should reject names starting with invalid characters', ({ expect }) => {
        const result = Utils.validatePackageName('!package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('package');
      });

      it('should reject malformed scoped packages', ({ expect }) => {
        const result = Utils.validatePackageName('@myorg');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@user/package');
      });

      it('should reject scoped packages with multiple slashes', ({ expect }) => {
        const result = Utils.validatePackageName('@myorg/sub/package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@user/package');
      });
    });

    describe('package name normalization', () => {
      it('should convert uppercase to lowercase', ({ expect }) => {
        const result = Utils.validatePackageName('MYPACKAGE');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('mypackage');
      });

      it('should replace spaces with hyphens', ({ expect }) => {
        const result = Utils.validatePackageName('my awesome package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('my-awesome-package');
      });

      it('should remove invalid starting characters', ({ expect }) => {
        const result = Utils.validatePackageName('###package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('package');
      });

      it('should handle names that become empty after cleaning', ({ expect }) => {
        const result = Utils.validatePackageName('###');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('package');
      });

      it('should normalize scoped packages correctly', ({ expect }) => {
        const result = Utils.validatePackageName('@My Org/My Package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@my-org/my-package');
      });

      it('should handle scoped packages with invalid characters', ({ expect }) => {
        const result = Utils.validatePackageName('@my!org/my!package');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@my-org/my-package');
      });

      it('should provide fallback for completely invalid names', ({ expect }) => {
        const result = Utils.validatePackageName('@###/###');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@---/---');
      });
    });

    describe('edge cases', () => {
      it('should handle single character names', ({ expect }) => {
        const result = Utils.validatePackageName('a');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('a');
      });

      it('should handle names at exactly 214 characters', ({ expect }) => {
        const maxLengthName = 'a'.repeat(214);
        const result = Utils.validatePackageName(maxLengthName);
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe(maxLengthName);
      });

      it('should handle scoped packages with empty scope', ({ expect }) => {
        const result = Utils.validatePackageName('@/package');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('@/package');
      });

      it('should handle scoped packages with empty package name', ({ expect }) => {
        const result = Utils.validatePackageName('@myorg/');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('@user/package');
      });

      it('should handle names with consecutive special characters', ({ expect }) => {
        const result = Utils.validatePackageName('my---package');
        expect(result.isValid).toBe(true);
        expect(result.normalizedName).toBe('my---package');
      });

      it('should handle names with mixed valid and invalid characters', ({ expect }) => {
        const result = Utils.validatePackageName('my$package%name');
        expect(result.isValid).toBe(false);
        expect(result.normalizedName).toBe('my-package-name');
      });
    });
  });

  describe('validateProjectName', () => {
    describe('valid project names', () => {
      it.effect('should accept simple lowercase names', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Utils.validateProjectName('myproject');
          expect(result).toEqual('myproject');
        }),
      );

      it.effect('should accept names with hyphens', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Utils.validateProjectName('my-project-name');
          expect(result).toBe('my-project-name');
        }),
      );

      it.effect('should accept names with dots', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Utils.validateProjectName('my.project.name');
          expect(result).toBe('my.project.name');
        }),
      );

      it.effect('should accept names with underscores after the first character', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Utils.validateProjectName('m_project');
          expect(result).toBe('m_project');
        }),
      );

      it.effect('should accept names with numbers', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Utils.validateProjectName('project123');
          expect(result).toBe('project123');
        }),
      );

      it.effect('should accept scoped packages with valid characters', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Utils.validateProjectName('@myorg/myproject');
          expect(result).toBe('@myorg/myproject');
        }),
      );

      it.effect('should accept names at exactly 214 characters', ({ expect }) =>
        Effect.gen(function* () {
          const maxLengthName = 'a'.repeat(214);
          const result = yield* Utils.validateProjectName(maxLengthName);
          expect(result).toBe(maxLengthName);
        }),
      );
    });

    describe('invalid project names', () => {
      it.effect('should reject empty names', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Effect.exit(Utils.validateProjectName(''));
          expect(result).toStrictEqual(Exit.fail(HelpDoc.p('Project name must be a non-empty string')));
        }),
      );

      it.effect('should reject names exceeding 214 characters', ({ expect }) =>
        Effect.gen(function* () {
          const longName = 'a'.repeat(215);
          const result = yield* Effect.exit(Utils.validateProjectName(longName));
          expect(result).toStrictEqual(Exit.fail(HelpDoc.p('Project name must not contain more than 214 characters')));
        }),
      );

      it.effect('should reject names with uppercase letters', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Effect.exit(Utils.validateProjectName('MyProject'));
          expect(result).toStrictEqual(Exit.fail(HelpDoc.p('Project name must not contain capital letters')));
        }),
      );

      it.effect('should reject names with leading whitespace', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Effect.exit(Utils.validateProjectName(' myproject'));
          expect(result).toStrictEqual(
            Exit.fail(HelpDoc.p('Project name must not contain leading or trailing whitespace')),
          );
        }),
      );

      it.effect('should reject names with trailing whitespace', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Effect.exit(Utils.validateProjectName('myproject '));
          expect(result).toStrictEqual(
            Exit.fail(HelpDoc.p('Project name must not contain leading or trailing whitespace')),
          );
        }),
      );

      it.effect('should reject names starting with a period', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Effect.exit(Utils.validateProjectName('.myproject'));
          expect(result).toStrictEqual(Exit.fail(HelpDoc.p('Project name must not start with a period')));
        }),
      );

      it.effect('should reject names starting with an underscore', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Effect.exit(Utils.validateProjectName('_myproject'));
          expect(result).toStrictEqual(Exit.fail(HelpDoc.p('Project name must not start with an underscore')));
        }),
      );

      it.effect("should reject names with special characters ~'!()*", ({ expect }) =>
        Effect.gen(function* () {
          const specialChars = ['~', "'", '!', '(', ')', '*'];
          for (const char of specialChars) {
            const result = yield* Effect.exit(Utils.validateProjectName(`my${char}project`));
            expect(result).toStrictEqual(
              Exit.fail(HelpDoc.p("Project name must not contain the special scharacters ~'!()*")),
            );
          }
        }),
      );

      it.effect('should reject NodeJS built-in module names', ({ expect }) =>
        Effect.gen(function* () {
          const builtins = ['fs', 'path', 'http', 'crypto', 'buffer'];
          for (const builtin of builtins) {
            const result = yield* Effect.exit(Utils.validateProjectName(builtin));
            expect(result).toStrictEqual(
              Exit.fail(HelpDoc.p('Project name must not be a NodeJS built-in module name')),
            );
          }
        }),
      );

      it.effect('should reject blocked names', ({ expect }) =>
        Effect.gen(function* () {
          const blockedNames = ['node_modules', 'favicon.ico'];
          for (const blocked of blockedNames) {
            const result = yield* Effect.exit(Utils.validateProjectName(blocked));
            expect(result).toStrictEqual(Exit.fail(HelpDoc.p(`Project name '${blocked}' is blocked from use`)));
          }
        }),
      );

      it.effect('should reject names with non-URL-friendly characters', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Effect.exit(Utils.validateProjectName('my<project>'));
          expect(result).toStrictEqual(Exit.fail(HelpDoc.p('Project name must only contain URL-friendly characters')));
        }),
      );

      it.effect('should reject scoped packages with non-URL-friendly characters', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Effect.exit(Utils.validateProjectName('@my<org>/my<project>'));
          expect(result).toStrictEqual(Exit.fail(HelpDoc.p('Project name must only contain URL-friendly characters')));
        }),
      );
    });

    describe('edge cases', () => {
      it.effect('should accept single character names', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Utils.validateProjectName('a');
          expect(result).toBe('a');
        }),
      );

      it.effect('should handle scoped packages with special characters in last segment', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Effect.exit(Utils.validateProjectName('@myorg/my!project'));
          expect(result).toStrictEqual(
            Exit.fail(HelpDoc.p("Project name must not contain the special scharacters ~'!()*")),
          );
        }),
      );

      it.effect('should accept names with multiple dots and hyphens', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Utils.validateProjectName('my-project.test.utils');
          expect(result).toBe('my-project.test.utils');
        }),
      );

      it.effect('should accept URL-friendly special characters', ({ expect }) =>
        Effect.gen(function* () {
          const result = yield* Utils.validateProjectName('my-project_v2.0');
          expect(result).toBe('my-project_v2.0');
        }),
      );
    });
  });
});
