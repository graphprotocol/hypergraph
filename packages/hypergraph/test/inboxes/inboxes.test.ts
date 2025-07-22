import { x25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Connect from '../../src/connect';
import * as Identity from '../../src/identity';
import {
  createAccountInboxCreationMessage,
  createSpaceInboxCreationMessage,
  decryptInboxMessage,
  encryptInboxMessage,
  mergeMessages,
  prepareAccountInboxMessage,
  prepareSpaceInboxMessage,
  recoverAccountInboxCreatorKey,
  recoverAccountInboxMessageSigner,
  recoverSpaceInboxCreatorKey,
  recoverSpaceInboxMessageSigner,
  validateAccountInboxMessage,
  validateSpaceInboxMessage,
} from '../../src/inboxes';
import * as Messages from '../../src/messages';
import type { AccountInboxStorageEntry, InboxMessageStorageEntry, SpaceInboxStorageEntry } from '../../src/store';
import { bytesToHex, canonicalize, generateId, hexToBytes, stringToUint8Array } from '../../src/utils';

const CHAIN = Connect.GEO_TESTNET;
const RPC_URL = Connect.TESTNET_RPC_URL;

describe('inboxes', () => {
  // Create real private keys for testing
  const signaturePrivateKey = secp256k1.utils.randomPrivateKey();
  const signaturePublicKey = secp256k1.getPublicKey(signaturePrivateKey, true);
  const encryptionPrivateKey = secp256k1.utils.randomPrivateKey();
  const encryptionPublicKey = secp256k1.getPublicKey(encryptionPrivateKey, true);
  const spaceSecretKey = secp256k1.utils.randomPrivateKey();

  const messageEncryptionPrivateKeyUint8Array = x25519.utils.randomPrivateKey();
  const messageEncryptionPublicKeyUint8Array = x25519.getPublicKey(messageEncryptionPrivateKeyUint8Array);
  const messageEncryptionPrivateKey = bytesToHex(messageEncryptionPrivateKeyUint8Array);
  const messageEncryptionPublicKey = bytesToHex(messageEncryptionPublicKeyUint8Array);

  const testParams = {
    accountAddress: '0x1234567890123456789012345678901234567890', // 40-char ethereum address
    isPublic: true,
    spaceId: generateId(),
    authPolicy: 'requires_auth',
  } as const;

  describe('createAccountInboxCreationMessage', () => {
    it('should create a valid account inbox creation message', () => {
      const result = createAccountInboxCreationMessage({
        ...testParams,
        encryptionPublicKey: bytesToHex(encryptionPublicKey),
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
      });

      expect(result.type).toBe('create-account-inbox');
      expect(result.accountAddress).toBe(testParams.accountAddress);
      expect(result.isPublic).toBe(testParams.isPublic);
      expect(result.authPolicy).toBe(testParams.authPolicy);
      expect(result.encryptionPublicKey).toBe(bytesToHex(encryptionPublicKey));

      // Verify inboxId is a 32-byte hex string
      expect(result.inboxId).toMatch(/^0x[0-9a-f]{64}$/i);

      // Verify signature exists and has correct format
      expect(result.signature).toHaveProperty('hex');
      expect(result.signature).toHaveProperty('recovery');
    });

    it('should generate unique inbox IDs for each call', () => {
      const result1 = createAccountInboxCreationMessage({
        ...testParams,
        encryptionPublicKey: bytesToHex(encryptionPublicKey),
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
      });
      const result2 = createAccountInboxCreationMessage({
        ...testParams,
        encryptionPublicKey: bytesToHex(encryptionPublicKey),
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
      });

      expect(result1.inboxId).not.toBe(result2.inboxId);
    });

    it('should create valid signatures that can be verified', () => {
      const result = createAccountInboxCreationMessage({
        ...testParams,
        encryptionPublicKey: bytesToHex(encryptionPublicKey),
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
      });

      // Reconstruct the message that was signed
      const messageToVerify = stringToUint8Array(
        canonicalize({
          accountAddress: testParams.accountAddress,
          inboxId: result.inboxId,
          encryptionPublicKey: bytesToHex(encryptionPublicKey),
        }),
      );

      // Verify the signature
      const sig = secp256k1.Signature.fromCompact(result.signature.hex).addRecoveryBit(result.signature.recovery);

      const isValid = secp256k1.verify(sig, sha256(messageToVerify), signaturePublicKey);

      expect(isValid).toBe(true);
    });

    it('should work with different auth policies', () => {
      const policies = ['anonymous', 'optional_auth', 'requires_auth'] as const;

      for (const policy of policies) {
        const result = createAccountInboxCreationMessage({
          ...testParams,
          authPolicy: policy,
          encryptionPublicKey: bytesToHex(encryptionPublicKey),
          signaturePrivateKey: bytesToHex(signaturePrivateKey),
        });
        expect(result.authPolicy).toBe(policy);
      }
    });

    it('should work with both public and private inboxes', () => {
      const publicInbox = createAccountInboxCreationMessage({
        ...testParams,
        encryptionPublicKey: bytesToHex(encryptionPublicKey),
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
      });
      expect(publicInbox.isPublic).toBe(true);

      const privateInbox = createAccountInboxCreationMessage({
        ...testParams,
        isPublic: false,
        encryptionPublicKey: bytesToHex(encryptionPublicKey),
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
      });
      expect(privateInbox.isPublic).toBe(false);
    });
  });

  describe('createSpaceInboxCreationMessage', () => {
    it('should create a valid space inbox creation message', async () => {
      const result = await createSpaceInboxCreationMessage({
        author: {
          accountAddress: testParams.accountAddress,
          signaturePrivateKey: bytesToHex(signaturePrivateKey),
          encryptionPublicKey: bytesToHex(encryptionPublicKey),
          signaturePublicKey: bytesToHex(signaturePublicKey),
        },
        authPolicy: testParams.authPolicy,
        spaceId: testParams.spaceId,
        isPublic: testParams.isPublic,
        spaceSecretKey: bytesToHex(spaceSecretKey),
        previousEventHash: generateId(),
      });

      expect(result.type).toBe('create-space-inbox-event');
      expect(result.spaceId).toBe(testParams.spaceId);
      expect(result.event).toBeDefined();
      expect(result.event.transaction.spaceId).toBe(testParams.spaceId);

      // Verify the event contains required fields
      expect(result.event.transaction.inboxId).toMatch(/^0x[0-9a-f]{64}$/i);
      expect(result.event.transaction.encryptionPublicKey).toBeDefined();
      expect(result.event.transaction.secretKey).toBeDefined();
      expect(result.event.transaction.isPublic).toBe(testParams.isPublic);
      expect(result.event.transaction.authPolicy).toBe(testParams.authPolicy);
    });

    it('should encrypt the inbox secret key', async () => {
      const result = await createSpaceInboxCreationMessage({
        author: {
          accountAddress: testParams.accountAddress,
          signaturePrivateKey: bytesToHex(signaturePrivateKey),
          encryptionPublicKey: bytesToHex(encryptionPublicKey),
          signaturePublicKey: bytesToHex(signaturePublicKey),
        },
        authPolicy: testParams.authPolicy,
        spaceId: testParams.spaceId,
        isPublic: testParams.isPublic,
        spaceSecretKey: bytesToHex(spaceSecretKey),
        previousEventHash: generateId(),
      });

      // Decrypt the secret key
      const decryptedSecretKey = Messages.decryptMessage({
        nonceAndCiphertext: hexToBytes(result.event.transaction.secretKey),
        secretKey: spaceSecretKey,
      });
      // The decrypted secret key should match the public key of the inbox
      const inboxPublicKey = x25519.getPublicKey(decryptedSecretKey);
      expect(bytesToHex(inboxPublicKey)).toBe(result.event.transaction.encryptionPublicKey);
    });
  });

  describe('recover inbox creator key', () => {
    describe('recoverAccountInboxCreatorKey', () => {
      it('should recover the creator key', () => {
        const inbox = createAccountInboxCreationMessage({
          accountAddress: '0x1234567890123456789012345678901234567890',
          isPublic: true,
          authPolicy: 'requires_auth',
          encryptionPublicKey: bytesToHex(secp256k1.getPublicKey(encryptionPrivateKey, true)),
          signaturePrivateKey: bytesToHex(signaturePrivateKey),
        });
        const creatorKey = recoverAccountInboxCreatorKey(inbox);
        expect(creatorKey).toBe(bytesToHex(secp256k1.getPublicKey(signaturePrivateKey, true)));
      });
    });
    describe('recoverSpaceInboxCreatorKey', () => {
      it('should recover the creator key', async () => {
        const inbox = await createSpaceInboxCreationMessage({
          author: {
            accountAddress: '0x1234567890123456789012345678901234567890',
            signaturePrivateKey: bytesToHex(signaturePrivateKey),
            encryptionPublicKey: bytesToHex(secp256k1.getPublicKey(encryptionPrivateKey, true)),
            signaturePublicKey: bytesToHex(signaturePublicKey),
          },
          spaceId: generateId(),
          isPublic: true,
          authPolicy: 'requires_auth',
          spaceSecretKey: bytesToHex(spaceSecretKey),
          previousEventHash: generateId(),
        });
        const creatorKey = recoverSpaceInboxCreatorKey(inbox.event);
        expect(creatorKey).toBe(bytesToHex(secp256k1.getPublicKey(signaturePrivateKey, true)));
      });
    });
  });

  describe('inbox message encryption', () => {
    it('should encrypt and decrypt a message successfully', () => {
      const originalMessage = 'Hello, this is a secret message!';

      // Encrypt the message
      const encrypted = encryptInboxMessage({
        message: originalMessage,
        encryptionPublicKey: messageEncryptionPublicKey,
      });

      // Verify the encrypted result has the expected properties
      expect(encrypted.ciphertext).toMatch(/^0x[0-9a-f]+$/i);

      // Decrypt the message
      const decrypted = decryptInboxMessage({
        ciphertext: encrypted.ciphertext,
        encryptionPrivateKey: messageEncryptionPrivateKey,
        encryptionPublicKey: messageEncryptionPublicKey,
      });

      // Verify the decrypted message matches the original
      expect(decrypted).toBe(originalMessage);
    });

    it('should fail to decrypt with wrong private key', () => {
      const originalMessage = 'Hello, this is a secret message!';
      const wrongPrivateKey = bytesToHex(x25519.utils.randomPrivateKey());

      const encrypted = encryptInboxMessage({
        message: originalMessage,
        encryptionPublicKey: messageEncryptionPublicKey,
      });

      // Attempt to decrypt with wrong private key should throw
      expect(() =>
        decryptInboxMessage({
          ciphertext: encrypted.ciphertext,
          encryptionPrivateKey: wrongPrivateKey,
          encryptionPublicKey: messageEncryptionPublicKey,
        }),
      ).toThrow();
    });
  });

  describe('prepare inbox message', () => {
    it('should prepare (encrypt and sign) a space inbox message', async () => {
      const message = 'Hello, this is a secret message!';
      const spaceId = generateId();
      const inboxId = generateId();
      const messageToSend = await prepareSpaceInboxMessage({
        message,
        spaceId,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: messageEncryptionPrivateKey,
        authorAccountAddress: '0x1234567890123456789012345678901234567890',
      });
      expect(messageToSend.ciphertext).toMatch(/^0x[0-9a-f]+$/i);
      expect(messageToSend.signature).toBeDefined();
      expect(messageToSend.signature?.hex).toMatch(/^[0-9a-f]+$/i);
      expect(messageToSend.signature?.recovery).toBeDefined();
      expect(messageToSend.authorAccountAddress).toBe('0x1234567890123456789012345678901234567890');
    });
    it('should prepare (encrypt and sign) an account inbox message', async () => {
      const message = 'Hello, this is a secret message!';
      const accountAddress = '0x1234567890123456789012345678901234567890';
      const inboxId = generateId();
      const messageToSend = await prepareAccountInboxMessage({
        message,
        accountAddress,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: messageEncryptionPrivateKey,
        authorAccountAddress: '0xabcde567890123456789012345678901234567890',
      });
      expect(messageToSend.ciphertext).toMatch(/^0x[0-9a-f]+$/i);
      expect(messageToSend.signature).toBeDefined();
      expect(messageToSend.signature?.hex).toMatch(/^[0-9a-f]+$/i);
      expect(messageToSend.signature?.recovery).toBeDefined();
      expect(messageToSend.authorAccountAddress).toBe('0xabcde567890123456789012345678901234567890');
    });
  });

  describe('recovering inbox message signers', () => {
    it('should recover the signer of a space inbox message', async () => {
      const message = 'Hello, this is a secret message!';
      const spaceId = generateId();
      const inboxId = generateId();
      const messageToSend = await prepareSpaceInboxMessage({
        message,
        spaceId,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
        authorAccountAddress: '0x1234567890123456789012345678901234567890',
      });
      const signer = recoverSpaceInboxMessageSigner(messageToSend, spaceId, inboxId);
      expect(signer).toBe(bytesToHex(secp256k1.getPublicKey(signaturePrivateKey, true)));
    });
    it('should recover the signer of an account inbox message', async () => {
      const message = 'Hello, this is a secret message!';
      const accountAddress = '0x1234567890123456789012345678901234567890';
      const inboxId = generateId();
      const messageToSend = await prepareAccountInboxMessage({
        message,
        accountAddress,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
        authorAccountAddress: '0xabcde567890123456789012345678901234567890',
      });
      const signer = recoverAccountInboxMessageSigner(messageToSend, accountAddress, inboxId);
      expect(signer).toBe(bytesToHex(signaturePublicKey));
    });
  });

  describe('space inboxmessage validation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    vi.spyOn(Identity, 'getVerifiedIdentity').mockImplementation(
      async (accountAddress: string, publicKey: string | null) => ({
        accountAddress,
        signaturePublicKey: publicKey ?? '',
        encryptionPublicKey: bytesToHex(encryptionPublicKey),
      }),
    );

    it.skip('should validate a properly signed space inbox message', async () => {
      const spaceId = generateId();
      const inboxId = generateId();

      const message = await prepareSpaceInboxMessage({
        message: 'test message',
        spaceId,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
        authorAccountAddress: testParams.accountAddress,
      });

      const inbox: SpaceInboxStorageEntry = {
        inboxId,
        isPublic: true,
        authPolicy: 'requires_auth',
        encryptionPublicKey: messageEncryptionPublicKey,
        secretKey: messageEncryptionPrivateKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateSpaceInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        spaceId,
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(true);
      expect(Identity.getVerifiedIdentity).toHaveBeenCalledWith(
        testParams.accountAddress,
        bytesToHex(signaturePublicKey),
        'https://sync.example.com',
      );
    });

    it('should reject unsigned messages for RequiresAuth inboxes', async () => {
      const message = {
        ciphertext: '0x123',
      } as Messages.InboxMessage;

      const inbox: SpaceInboxStorageEntry = {
        inboxId: generateId(),
        isPublic: true,
        authPolicy: 'requires_auth',
        encryptionPublicKey: messageEncryptionPublicKey,
        secretKey: messageEncryptionPrivateKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateSpaceInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        generateId(),
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(false);
      expect(Identity.getVerifiedIdentity).not.toHaveBeenCalled();
    });

    it('should accept unsigned messages for Anonymous inboxes', async () => {
      const message = {
        ciphertext: '0x123',
      } as Messages.InboxMessage;

      const inbox: SpaceInboxStorageEntry = {
        inboxId: generateId(),
        isPublic: true,
        authPolicy: 'anonymous',
        encryptionPublicKey: messageEncryptionPublicKey,
        secretKey: messageEncryptionPrivateKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateSpaceInboxMessage(
        message,
        inbox,
        generateId(),
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(true);
      expect(Identity.getVerifiedIdentity).not.toHaveBeenCalled();
    });

    it('should reject signed messages for Anonymous inboxes', async () => {
      const spaceId = generateId();
      const inboxId = generateId();

      const message = await prepareSpaceInboxMessage({
        message: 'test message',
        spaceId,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
        authorAccountAddress: testParams.accountAddress,
      });

      const inbox: SpaceInboxStorageEntry = {
        inboxId,
        isPublic: true,
        authPolicy: 'anonymous',
        encryptionPublicKey: messageEncryptionPublicKey,
        secretKey: messageEncryptionPrivateKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateSpaceInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        spaceId,
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(false);
      expect(Identity.getVerifiedIdentity).not.toHaveBeenCalled();
    });

    it('should handle identity verification failures', async () => {
      const spaceId = generateId();
      const inboxId = generateId();

      // Mock identity verification failure
      vi.spyOn(Identity, 'getVerifiedIdentity').mockRejectedValueOnce(new Error('Failed to verify identity'));

      const message = await prepareSpaceInboxMessage({
        message: 'test message',
        spaceId,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
        authorAccountAddress: testParams.accountAddress,
      });

      const inbox: SpaceInboxStorageEntry = {
        inboxId,
        isPublic: true,
        authPolicy: 'requires_auth',
        encryptionPublicKey: messageEncryptionPublicKey,
        secretKey: messageEncryptionPrivateKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      await expect(
        validateSpaceInboxMessage(
          {
            ...message,
            id: generateId(),
            createdAt: new Date(),
          },
          inbox,
          spaceId,
          'https://sync.example.com',
          CHAIN,
          RPC_URL,
        ),
      ).rejects.toThrow('Failed to verify identity');
    });

    it.skip('should accept signed messages on inboxes with optional auth', async () => {
      const spaceId = generateId();
      const inboxId = generateId();

      const message = await prepareSpaceInboxMessage({
        message: 'test message',
        spaceId,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
        authorAccountAddress: testParams.accountAddress,
      });

      const inbox: SpaceInboxStorageEntry = {
        inboxId,
        isPublic: true,
        authPolicy: 'optional_auth',
        encryptionPublicKey: messageEncryptionPublicKey,
        secretKey: messageEncryptionPrivateKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateSpaceInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        spaceId,
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(true);
      expect(Identity.getVerifiedIdentity).toHaveBeenCalledWith(
        testParams.accountAddress,
        bytesToHex(signaturePublicKey),
        'https://sync.example.com',
      );
    });

    it('should accept unsigned messages on inboxes with optional auth', async () => {
      const message = {
        ciphertext: '0x123',
      } as Messages.InboxMessage;

      const inbox: SpaceInboxStorageEntry = {
        inboxId: generateId(),
        isPublic: true,
        authPolicy: 'optional_auth',
        encryptionPublicKey: messageEncryptionPublicKey,
        secretKey: messageEncryptionPrivateKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateSpaceInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        generateId(),
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(true);
      expect(Identity.getVerifiedIdentity).not.toHaveBeenCalled();
    });

    it.skip('should reject messages with mismatched signature and authorAccountAddress', async () => {
      const spaceId = generateId();
      const inboxId = generateId();

      // Create a different key pair for the "wrong" signer
      const differentSignaturePrivateKey = secp256k1.utils.randomPrivateKey();
      const differentSignaturePublicKey = secp256k1.getPublicKey(differentSignaturePrivateKey, true);
      const differentAccountAddress = '0x2222222222222222222222222222222222222222';

      // Mock to return the correct public key for each account
      vi.spyOn(Identity, 'getVerifiedIdentity').mockImplementation(async (accountAddress: string) => {
        if (accountAddress === differentAccountAddress) {
          return {
            accountAddress,
            signaturePublicKey: bytesToHex(differentSignaturePublicKey),
            encryptionPublicKey: bytesToHex(encryptionPublicKey),
          };
        }
        return {
          accountAddress,
          signaturePublicKey: bytesToHex(signaturePublicKey),
          encryptionPublicKey: bytesToHex(encryptionPublicKey),
        };
      });

      // Create message signed by the different key but claiming to be from the original account
      const message = await prepareSpaceInboxMessage({
        message: 'test message',
        spaceId,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: bytesToHex(differentSignaturePrivateKey),
        authorAccountAddress: testParams.accountAddress,
      });

      const inbox: SpaceInboxStorageEntry = {
        inboxId,
        isPublic: true,
        authPolicy: 'requires_auth',
        encryptionPublicKey: messageEncryptionPublicKey,
        secretKey: messageEncryptionPrivateKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateSpaceInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        spaceId,
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(false);
      expect(Identity.getVerifiedIdentity).toHaveBeenCalledWith(
        testParams.accountAddress,
        bytesToHex(signaturePublicKey),
        'https://sync.example.com',
      );
    });
  });

  describe('account inbox message validation', () => {
    beforeEach(() => {
      vi.clearAllMocks();

      vi.spyOn(Identity, 'getVerifiedIdentity').mockImplementation(
        async (accountAddress: string, publicKey: string | null) => ({
          accountAddress,
          signaturePublicKey: publicKey ?? '',
          encryptionPublicKey: bytesToHex(encryptionPublicKey),
        }),
      );
    });

    it.skip('should validate a properly signed account inbox message', async () => {
      const accountAddress = '0x1234567890123456789012345678901234567890';
      const inboxId = generateId();

      const message = await prepareAccountInboxMessage({
        message: 'test message',
        accountAddress,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
        authorAccountAddress: testParams.accountAddress,
      });

      const inbox: AccountInboxStorageEntry = {
        inboxId,
        isPublic: true,
        authPolicy: 'requires_auth',
        encryptionPublicKey: messageEncryptionPublicKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateAccountInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        accountAddress,
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(true);
      expect(Identity.getVerifiedIdentity).toHaveBeenCalledWith(
        testParams.accountAddress,
        bytesToHex(signaturePublicKey),
        'https://sync.example.com',
      );
    });

    it('should reject unsigned messages for RequiresAuth inboxes', async () => {
      const accountAddress = '0x1234567890123456789012345678901234567890';
      const _inboxId = generateId();

      const message = {
        ciphertext: '0x123',
      } as Messages.InboxMessage;

      const inbox: AccountInboxStorageEntry = {
        inboxId: generateId(),
        isPublic: true,
        authPolicy: 'requires_auth',
        encryptionPublicKey: messageEncryptionPublicKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateAccountInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        accountAddress,
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(false);
      expect(Identity.getVerifiedIdentity).not.toHaveBeenCalled();
    });

    it.skip('should reject messages with mismatched signature and authorAccountAddress', async () => {
      const accountAddress = '0x1234567890123456789012345678901234567890';
      const inboxId = generateId();

      // Create a different key pair for the "wrong" signer
      const differentSignaturePrivateKey = secp256k1.utils.randomPrivateKey();
      const differentSignaturePublicKey = secp256k1.getPublicKey(differentSignaturePrivateKey, true);
      const differentAccountAddress = '0x2222222222222222222222222222222222222222';

      // Mock to return the correct public key for each account
      vi.spyOn(Identity, 'getVerifiedIdentity').mockImplementation(async (accountAddress: string) => {
        if (accountAddress === differentAccountAddress) {
          return {
            accountAddress,
            signaturePublicKey: bytesToHex(differentSignaturePublicKey),
            encryptionPublicKey: bytesToHex(encryptionPublicKey),
          };
        }
        return {
          accountAddress,
          signaturePublicKey: bytesToHex(signaturePublicKey),
          encryptionPublicKey: bytesToHex(encryptionPublicKey),
        };
      });

      // Create message signed by the different key but claiming to be from the original account
      const message = await prepareAccountInboxMessage({
        message: 'test message',
        accountAddress,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: bytesToHex(differentSignaturePrivateKey),
        authorAccountAddress: testParams.accountAddress,
      });

      const inbox: AccountInboxStorageEntry = {
        inboxId,
        isPublic: true,
        authPolicy: 'requires_auth',
        encryptionPublicKey: messageEncryptionPublicKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateAccountInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        accountAddress,
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(false);
      expect(Identity.getVerifiedIdentity).toHaveBeenCalledWith(
        testParams.accountAddress,
        bytesToHex(signaturePublicKey),
        'https://sync.example.com',
      );
    });

    it('should accept unsigned messages for Anonymous inboxes', async () => {
      const accountAddress = '0x1234567890123456789012345678901234567890';
      const _inboxId = generateId();

      const message = {
        ciphertext: '0x123',
      } as Messages.InboxMessage;

      const inbox: AccountInboxStorageEntry = {
        inboxId: generateId(),
        isPublic: true,
        authPolicy: 'anonymous',
        encryptionPublicKey: messageEncryptionPublicKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateAccountInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        accountAddress,
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(true);
      expect(Identity.getVerifiedIdentity).not.toHaveBeenCalled();
    });

    it('should reject signed messages for Anonymous inboxes', async () => {
      const accountAddress = '0x1234567890123456789012345678901234567890';
      const inboxId = generateId();

      const message = await prepareAccountInboxMessage({
        message: 'test message',
        accountAddress,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
        authorAccountAddress: testParams.accountAddress,
      });

      const inbox: AccountInboxStorageEntry = {
        inboxId,
        isPublic: true,
        authPolicy: 'anonymous',
        encryptionPublicKey: messageEncryptionPublicKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateAccountInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        accountAddress,
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(false);
      expect(Identity.getVerifiedIdentity).not.toHaveBeenCalled();
    });

    it.skip('should accept signed messages on inboxes with optional auth', async () => {
      const accountAddress = '0x1234567890123456789012345678901234567890';
      const inboxId = generateId();

      const message = await prepareAccountInboxMessage({
        message: 'test message',
        accountAddress,
        inboxId,
        encryptionPublicKey: messageEncryptionPublicKey,
        signaturePrivateKey: bytesToHex(signaturePrivateKey),
        authorAccountAddress: testParams.accountAddress,
      });

      const inbox: AccountInboxStorageEntry = {
        inboxId,
        isPublic: true,
        authPolicy: 'optional_auth',
        encryptionPublicKey: messageEncryptionPublicKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateAccountInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        accountAddress,
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(true);
      expect(Identity.getVerifiedIdentity).toHaveBeenCalledWith(
        testParams.accountAddress,
        bytesToHex(signaturePublicKey),
        'https://sync.example.com',
      );
    });

    it('should accept unsigned messages on inboxes with optional auth', async () => {
      const accountAddress = '0x1234567890123456789012345678901234567890';

      const message = {
        ciphertext: '0x123',
      } as Messages.InboxMessage;

      const inbox: AccountInboxStorageEntry = {
        inboxId: generateId(),
        isPublic: true,
        authPolicy: 'optional_auth',
        encryptionPublicKey: messageEncryptionPublicKey,
        lastMessageClock: new Date(0).toISOString(),
        messages: [],
        seenMessageIds: new Set(),
      };

      const isValid = await validateAccountInboxMessage(
        {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        },
        inbox,
        accountAddress,
        'https://sync.example.com',
        CHAIN,
        RPC_URL,
      );

      expect(isValid).toBe(true);
      expect(Identity.getVerifiedIdentity).not.toHaveBeenCalled();
    });
  });

  describe('mergeMessages', () => {
    const createMessage = (date: Date, plaintext = 'test'): InboxMessageStorageEntry => ({
      id: uuidv4(),
      plaintext,
      ciphertext: '0x123',
      signature: null,
      createdAt: date.toISOString(),
      authorAccountAddress: null,
    });

    it('should merge new messages with existing messages', () => {
      const existing = [createMessage(new Date('2023-01-01')), createMessage(new Date('2023-01-02'))];
      const existingSeenIds = new Set(existing.map((m) => m.id));
      const newMessages = [createMessage(new Date('2023-01-03')), createMessage(new Date('2023-01-04'))];

      const result = mergeMessages(existing, existingSeenIds, newMessages);

      expect(result.messages).toHaveLength(4);
      expect(result.messages.map((m) => m.createdAt)).toEqual([
        new Date('2023-01-01').toISOString(),
        new Date('2023-01-02').toISOString(),
        new Date('2023-01-03').toISOString(),
        new Date('2023-01-04').toISOString(),
      ]);
      expect(result.seenMessageIds.size).toBe(4);
    });

    it('should deduplicate messages', () => {
      const duplicateMessage = createMessage(new Date('2023-01-02'));
      const existing = [createMessage(new Date('2023-01-01')), duplicateMessage];
      const existingSeenIds = new Set(existing.map((m) => m.id));
      const newMessages = [duplicateMessage, createMessage(new Date('2023-01-03'))];

      const result = mergeMessages(existing, existingSeenIds, newMessages);

      expect(result.messages).toHaveLength(3);
      expect(result.messages.map((m) => m.createdAt)).toEqual([
        new Date('2023-01-01').toISOString(),
        new Date('2023-01-02').toISOString(),
        new Date('2023-01-03').toISOString(),
      ]);
      expect(result.seenMessageIds.size).toBe(3);
    });

    it('should sort messages when new messages are older', () => {
      const existing = [createMessage(new Date('2023-01-02')), createMessage(new Date('2023-01-03'))];
      const existingSeenIds = new Set(existing.map((m) => m.id));
      const newMessages = [
        createMessage(new Date('2023-01-01')), // older message
        createMessage(new Date('2023-01-04')),
      ];

      const result = mergeMessages(existing, existingSeenIds, newMessages);

      expect(result.messages).toHaveLength(4);
      expect(result.messages.map((m) => m.createdAt)).toEqual([
        new Date('2023-01-01').toISOString(),
        new Date('2023-01-02').toISOString(),
        new Date('2023-01-03').toISOString(),
        new Date('2023-01-04').toISOString(),
      ]);
    });

    it('should handle empty existing messages', () => {
      const existing: InboxMessageStorageEntry[] = [];
      const existingSeenIds = new Set<string>();
      const newMessages = [createMessage(new Date('2023-01-01')), createMessage(new Date('2023-01-02'))];

      const result = mergeMessages(existing, existingSeenIds, newMessages);

      expect(result.messages).toHaveLength(2);
      expect(result.messages.map((m) => m.createdAt)).toEqual([
        new Date('2023-01-01').toISOString(),
        new Date('2023-01-02').toISOString(),
      ]);
    });

    it('should handle empty new messages', () => {
      const existing = [createMessage(new Date('2023-01-01')), createMessage(new Date('2023-01-02'))];
      const existingSeenIds = new Set(existing.map((m) => m.id));
      const newMessages: InboxMessageStorageEntry[] = [];

      const result = mergeMessages(existing, existingSeenIds, newMessages);

      expect(result.messages).toHaveLength(2);
      expect(result.messages).toEqual(existing);
      expect(result.seenMessageIds).toEqual(existingSeenIds);
    });
  });
});
