import { describe, expect, it } from '@effect/vitest';

// @ts-ignore - fix the ts setup
import { toCamelCase, toPascalCase } from '../src/Utils.js';

describe('toCamelCase', () => {
  it('should convert space-separated words to camelCase', () => {
    expect(toCamelCase('Address line 1')).toBe('addressLine1');
    expect(toCamelCase('Academic field')).toBe('academicField');
    expect(toCamelCase('User profile')).toBe('userProfile');
    expect(toCamelCase('Email address')).toBe('emailAddress');
    expect(toCamelCase('Phone number')).toBe('phoneNumber');
  });

  it('should convert underscore-separated words to camelCase', () => {
    expect(toCamelCase('address_line_1')).toBe('addressLine1');
    expect(toCamelCase('user_profile')).toBe('userProfile');
    expect(toCamelCase('email_address')).toBe('emailAddress');
  });

  it('should convert hyphen-separated words to camelCase', () => {
    expect(toCamelCase('address-line-1')).toBe('addressLine1');
    expect(toCamelCase('user-profile')).toBe('userProfile');
    expect(toCamelCase('email-address')).toBe('emailAddress');
  });

  it('should convert mixed separators to camelCase', () => {
    expect(toCamelCase('address-line_1')).toBe('addressLine1');
    expect(toCamelCase('address-line 1')).toBe('addressLine1');
    expect(toCamelCase('user_profile-name')).toBe('userProfileName');
  });

  it('should handle already camelCase strings', () => {
    expect(toCamelCase('addressLine1')).toBe('addressLine1');
    expect(toCamelCase('userProfile')).toBe('userProfile');
    expect(toCamelCase('emailAddress')).toBe('emailAddress');
  });

  it('should handle PascalCase strings', () => {
    expect(toCamelCase('AddressLine1')).toBe('addressLine1');
    expect(toCamelCase('UserProfile')).toBe('userProfile');
    expect(toCamelCase('EmailAddress')).toBe('emailAddress');
  });

  it('should handle uppercase strings', () => {
    expect(toCamelCase('ADDRESS_LINE_1')).toBe('addressLine1');
    expect(toCamelCase('USER_PROFILE')).toBe('userProfile');
    expect(toCamelCase('EMAIL_ADDRESS')).toBe('emailAddress');
  });

  it('should handle single words', () => {
    expect(toCamelCase('Address')).toBe('address');
    expect(toCamelCase('User')).toBe('user');
    expect(toCamelCase('Email')).toBe('email');
  });

  it('should handle numbers', () => {
    expect(toCamelCase('Address1')).toBe('address1');
    expect(toCamelCase('User2')).toBe('user2');
    expect(toCamelCase('Email3')).toBe('email3');
  });

  it('should skip leading non-alphanumeric characters', () => {
    expect(toCamelCase('!Address')).toBe('address');
    expect(toCamelCase('@User')).toBe('user');
    expect(toCamelCase('#Email')).toBe('email');
    expect(toCamelCase('  Address')).toBe('address');
  });

  it('should throw error for empty input or whitespace-only input', () => {
    expect(() => toCamelCase('')).toThrow();
    expect(() => toCamelCase('   ')).toThrow();
    expect(() => toCamelCase('  ')).toThrow();
    expect(() => toCamelCase('\t')).toThrow();
    expect(() => toCamelCase('\n')).toThrow();
    expect(() => toCamelCase(' \t \n ')).toThrow();
  });
});

describe('toPascalCase', () => {
  it('should convert space-separated words to PascalCase', () => {
    expect(toPascalCase('Address line 1')).toBe('AddressLine1');
    expect(toPascalCase('Academic field')).toBe('AcademicField');
    expect(toPascalCase('User profile')).toBe('UserProfile');
    expect(toPascalCase('Email address')).toBe('EmailAddress');
    expect(toPascalCase('Phone number')).toBe('PhoneNumber');
  });

  it('should convert underscore-separated words to PascalCase', () => {
    expect(toPascalCase('address_line_1')).toBe('AddressLine1');
    expect(toPascalCase('user_profile')).toBe('UserProfile');
    expect(toPascalCase('email_address')).toBe('EmailAddress');
  });

  it('should convert hyphen-separated words to PascalCase', () => {
    expect(toPascalCase('address-line-1')).toBe('AddressLine1');
    expect(toPascalCase('user-profile')).toBe('UserProfile');
    expect(toPascalCase('email-address')).toBe('EmailAddress');
  });

  it('should convert mixed separators to PascalCase', () => {
    expect(toPascalCase('address-line_1')).toBe('AddressLine1');
    expect(toPascalCase('address-line 1')).toBe('AddressLine1');
    expect(toPascalCase('user_profile-name')).toBe('UserProfileName');
  });

  it('should handle already PascalCase strings', () => {
    expect(toPascalCase('AddressLine1')).toBe('AddressLine1');
    expect(toPascalCase('UserProfile')).toBe('UserProfile');
    expect(toPascalCase('EmailAddress')).toBe('EmailAddress');
  });

  it('should handle camelCase strings', () => {
    expect(toPascalCase('addressLine1')).toBe('AddressLine1');
    expect(toPascalCase('userProfile')).toBe('UserProfile');
    expect(toPascalCase('emailAddress')).toBe('EmailAddress');
  });

  it('should handle uppercase strings', () => {
    expect(toPascalCase('ADDRESS_LINE_1')).toBe('AddressLine1');
    expect(toPascalCase('USER_PROFILE')).toBe('UserProfile');
    expect(toPascalCase('EMAIL_ADDRESS')).toBe('EmailAddress');
  });

  it('should handle single words', () => {
    expect(toPascalCase('Address')).toBe('Address');
    expect(toPascalCase('User')).toBe('User');
    expect(toPascalCase('Email')).toBe('Email');
  });

  it('should handle numbers', () => {
    expect(toPascalCase('Address1')).toBe('Address1');
    expect(toPascalCase('User2')).toBe('User2');
    expect(toPascalCase('Email3')).toBe('Email3');
  });

  it('should skip leading non-alphanumeric characters', () => {
    expect(toPascalCase('!Address')).toBe('Address');
    expect(toPascalCase('@User')).toBe('User');
    expect(toPascalCase('#Email')).toBe('Email');
    expect(toPascalCase('  Address')).toBe('Address');
  });

  it('should throw error for empty input or whitespace-only input', () => {
    expect(() => toPascalCase('')).toThrow();
    expect(() => toPascalCase('   ')).toThrow();
    expect(() => toPascalCase('  ')).toThrow();
    expect(() => toPascalCase('\t')).toThrow();
    expect(() => toPascalCase('\n')).toThrow();
    expect(() => toPascalCase(' \t \n ')).toThrow();
  });
});
