# Domain Model Overview

## Core Entities

### Account
Central user entity representing an identity in the system.
```prisma
model Account {
  address                    String @id
  spaces                     Space[] @relation("space-members")
  invitations                Invitation[]
  appIdentities              AppIdentity[]
  updates                    Update[]
  inboxes                    AccountInbox[]
  connectAddress             String @unique
  connectCiphertext          String
  connectNonce               String
  connectSignaturePublicKey  String
  connectEncryptionPublicKey String
  connectAccountProof        String
  connectKeyProof            String
  connectSignerAddress       String
  spaceKeyBoxes              SpaceKeyBox[]
  infoAuthor                 Space[]
}
```

### Space
Collaborative workspace containing members, events, and data.
```prisma
model Space {
  id                    String @id
  events                SpaceEvent[]
  members               Account[] @relation("space-members")
  invitations           Invitation[]
  keys                  SpaceKey[]
  updates               Update[]
  inboxes               SpaceInbox[]
  appIdentities         AppIdentity[]
  name                  String
  infoContent           Bytes
  infoAuthorAddress     String
  infoSignatureHex      String
  infoSignatureRecovery Int
}
```

### AppIdentity
Application-specific identity linked to an account.
```prisma
model AppIdentity {
  address             String @id
  ciphertext          String
  signaturePublicKey  String
  encryptionPublicKey String
  accountProof        String
  keyProof            String
  accountAddress      String
  spaces              Space[]
  spaceKeyBoxes       SpaceKeyBox[]
  appId               String
  sessionToken        String
  sessionTokenExpires DateTime
  @@unique([accountAddress, appId])
}
```

### SpaceEvent
Append-only log of events within a space.
```prisma
model SpaceEvent {
  id        String @id
  event     String
  state     String
  counter   Int
  spaceId   String
  createdAt DateTime @default(now())
  inboxes   SpaceInbox[]
  @@unique([spaceId, counter])
}
```

### SpaceKey & SpaceKeyBox
Encryption key management for spaces.
```prisma
model SpaceKey {
  id        String @id
  spaceId   String
  createdAt DateTime @default(now())
  keyBoxes  SpaceKeyBox[]
}

model SpaceKeyBox {
  id                 String @id
  spaceKeyId         String
  ciphertext         String
  nonce              String
  authorPublicKey    String
  accountAddress     String
  appIdentityAddress String?
  @@unique([spaceKeyId, nonce])
}
```

### Update
CRDT updates for collaborative editing.
```prisma
model Update {
  spaceId           String
  clock             Int
  content           Bytes
  accountAddress    String
  signatureHex      String
  signatureRecovery Int
  updateId          String
  @@id([spaceId, clock])
}
```

### Inbox System
Message queuing for spaces and accounts.

#### SpaceInbox & SpaceInboxMessage
```prisma
model SpaceInbox {
  id                  String @id
  spaceId             String
  isPublic            Boolean
  authPolicy          String
  encryptionPublicKey String
  encryptedSecretKey  String
  spaceEventId        String
  messages            SpaceInboxMessage[]
  createdAt           DateTime @default(now())
}

model SpaceInboxMessage {
  id                   String @id @default(uuid(4))
  spaceInboxId         String
  ciphertext           String
  signatureHex         String?
  signatureRecovery    Int?
  authorAccountAddress String?
  createdAt            DateTime @default(now())
}
```

#### AccountInbox & AccountInboxMessage
```prisma
model AccountInbox {
  id                  String @id
  accountAddress      String
  isPublic            Boolean
  authPolicy          String
  encryptionPublicKey String
  signatureHex        String
  signatureRecovery   Int
  messages            AccountInboxMessage[]
  createdAt           DateTime @default(now())
}

model AccountInboxMessage {
  id                   String @id @default(uuid(7))
  accountInboxId       String
  ciphertext           String
  signatureHex         String?
  signatureRecovery    Int?
  authorAccountAddress String?
  createdAt            DateTime @default(now())
}
```

### Invitation System
```prisma
model Invitation {
  id                    String @id
  spaceId               String
  accountAddress        String
  inviteeAccountAddress String
  createdAt             DateTime @default(now())
  targetApps            InvitationTargetApp[]
  @@unique([spaceId, inviteeAccountAddress])
}

model InvitationTargetApp {
  id           String @id
  invitationId String
}
```

## Key Relationships

1. **Account ↔ Space**: Many-to-many through membership
2. **Account ↔ AppIdentity**: One-to-many, unique per app
3. **Space ↔ SpaceEvent**: One-to-many, append-only log
4. **Space ↔ Update**: One-to-many, CRDT updates
5. **SpaceKey ↔ SpaceKeyBox**: One-to-many, encrypted for each member
6. **Inbox ↔ Message**: One-to-many for both Space and Account inboxes

## Authentication & Authorization

1. **Connect Identity**: Primary identity with signature/encryption keys
2. **App Identity**: App-specific identity with session tokens
3. **Session Tokens**: 30-day expiry for app authentication
4. **Privy Integration**: External auth provider for Connect app

## Security Features

1. **E2E Encryption**: All sensitive data encrypted client-side
2. **Key Rotation**: New keys generated when members removed
3. **Signature Verification**: All events/messages signed
4. **Ownership Proofs**: Cryptographic proofs for identity claims