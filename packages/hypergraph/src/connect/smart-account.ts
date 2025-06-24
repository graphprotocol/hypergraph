import { MAINNET, TESTNET } from '@graphprotocol/grc-20/contracts';
import { randomBytes } from '@noble/hashes/utils';
import {
  OWNABLE_VALIDATOR_ADDRESS,
  RHINESTONE_ATTESTER_ADDRESS,
  type Session,
  SmartSessionMode,
  encodeSmartSessionSignature,
  encodeValidationData,
  encodeValidatorNonce,
  getAccount,
  getEnableSessionDetails,
  getOwnableValidator,
  getOwnableValidatorMockSignature,
  getPermissionId,
  getSmartSessionsValidator,
  getSpendingLimitsPolicy,
  getSudoPolicy,
  getTimeFramePolicy,
  getUniversalActionPolicy,
  getUsageLimitPolicy,
  getValueLimitPolicy,
} from '@rhinestone/module-sdk';
import { type SmartAccountClient, createSmartAccountClient, encodeInstallModule } from 'permissionless';
import { type ToSafeSmartAccountParameters, toSafeSmartAccount } from 'permissionless/accounts';
import { getAccountNonce } from 'permissionless/actions';
import { erc7579Actions } from 'permissionless/actions/erc7579';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import {
  http,
  type AbiFunction,
  type Account,
  type Address,
  type Calls,
  type Chain,
  ContractFunctionExecutionError,
  type Hex,
  type Narrow,
  type SignableMessage,
  type WalletClient,
  createPublicClient,
  encodeFunctionData,
  getAbiItem,
  toBytes,
  toFunctionSelector,
  toHex,
} from 'viem';
import {
  type UserOperation,
  type WaitForUserOperationReceiptReturnType,
  entryPoint07Address,
  getUserOperationHash,
} from 'viem/account-abstraction';
import { privateKeyToAccount } from 'viem/accounts';
import { bytesToHex } from '../utils/hexBytesAddressUtils.js';
import {
  daoFactoryAbi,
  mainVotingAbi,
  personalSpaceAdminAbi,
  safe7579Abi,
  safeModuleManagerAbi,
  safeOwnerManagerAbi,
  smartSessionsAbi,
} from './abis.js';

export const DEFAULT_RPC_URL = 'https://rpc-geo-genesis-h0q2s21xx8.t.conduit.xyz';
export const TESTNET_RPC_URL = 'https://rpc-geo-test-zc16z3tcvf.t.conduit.xyz';
/**
 * We provide a fallback API key for gas sponsorship for the duration of the
 * Geo Genesis early access period. This API key is gas-limited.
 */
const DEFAULT_API_KEY = 'pim_KqHm63txxhbCYjdDaWaHqH';
const BUNDLER_TRANSPORT_URL_BASE = 'https://api.pimlico.io/v2/';

const SAFE_7579_MODULE_ADDRESS = '0x7579EE8307284F293B1927136486880611F20002';
const SAFE_4337_MODULE_ADDRESS = '0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226';
const ERC7579_LAUNCHPAD_ADDRESS = '0x7579011aB74c46090561ea277Ba79D510c6C00ff';

const SPACE_FACTORY_ADDRESS: Record<string, Hex> = {
  '80451': MAINNET.DAO_FACTORY_ADDRESS,
  '19411': TESTNET.DAO_FACTORY_ADDRESS,
};

const MODULE_TYPE_VALIDATOR = 1;

const PUBLIC_SPACE_FUNCTIONS = [
  'leaveSpace',
  'leaveSpaceAsEditor',
  'createProposal',
  'proposeEdits',
  'proposeAcceptSubspace',
  'proposeRemoveSubspace',
  'proposeAddMember',
  'proposeRemoveMember',
  'proposeAddEditor',
  'proposeRemoveEditor',
  'cancelProposal',
  'vote',
  'execute',
];

const PERSONAL_SPACE_FUNCTIONS = [
  'executeProposal',
  'submitEdits',
  'submitAcceptSubspace',
  'submitRemoveSubspace',
  'submitNewMember',
  'submitRemoveMember',
  'leaveSpace',
  'submitNewEditor',
  'submitRemoveEditor',
];

export const GEOGENESIS = {
  id: Number('80451'),
  name: 'Geo Genesis',
  nativeCurrency: {
    name: 'Graph Token',
    symbol: 'GRT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [DEFAULT_RPC_URL],
    },
    public: {
      http: [DEFAULT_RPC_URL],
    },
  },
};

export const GEO_TESTNET = {
  id: Number('19411'),
  name: 'Geo Testnet',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [TESTNET_RPC_URL],
    },
    public: {
      http: [TESTNET_RPC_URL],
    },
  },
};

export type Action = {
  actionTarget: Address;
  actionTargetSelector: Hex;
  actionPolicies: { policy: Address; address: Address; initData: Hex }[];
};

// We re-export these functions to allow creating sessions with policies for
// additional actions without needing the Rhinestone module SDK.
export {
  getSudoPolicy,
  getUniversalActionPolicy,
  getSpendingLimitsPolicy,
  getTimeFramePolicy,
  getUsageLimitPolicy,
  getValueLimitPolicy,
};

export type SmartSessionClient = {
  account: Account;
  chain: Chain;
  sendUserOperation: <const calls extends readonly unknown[]>({ calls }: { calls: calls }) => Promise<string>;
  waitForUserOperationReceipt: ({ hash }: { hash: Hex }) => Promise<WaitForUserOperationReceiptReturnType>;
  signMessage: ({ message }: { message: SignableMessage }) => Promise<Hex>;
};

// Gets the legacy Geo smart account wallet client. If the smart account returned
// by this function is deployed, it means it might need to be updated to have the 7579 module installed
const getLegacySmartAccountWalletClient = async ({
  owner,
  address,
  chain = GEOGENESIS,
  rpcUrl = DEFAULT_RPC_URL,
  apiKey = DEFAULT_API_KEY,
}: {
  owner: WalletClient | Account;
  address?: Hex;
  chain?: Chain;
  rpcUrl?: string;
  apiKey?: string;
}): Promise<SmartAccountClient> => {
  const transport = http(rpcUrl);
  const publicClient = createPublicClient({
    transport,
    chain,
  });

  const safeAccountParams: ToSafeSmartAccountParameters<'0.7', undefined> = {
    client: publicClient,
    owners: [owner],
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
    version: '1.4.1',
  };
  if (address) {
    safeAccountParams.address = address;
  }

  if (chain.id === GEO_TESTNET.id) {
    // Custom SAFE Addresses
    // TODO: remove this once we have the smart sessions module deployed on testnet
    // (and the canonical addresses are deployed)
    safeAccountParams.safeModuleSetupAddress = '0x2dd68b007B46fBe91B9A7c3EDa5A7a1063cB5b47';
    safeAccountParams.safe4337ModuleAddress = '0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226';
    safeAccountParams.safeProxyFactoryAddress = '0xd9d2Ba03a7754250FDD71333F444636471CACBC4';
    safeAccountParams.safeSingletonAddress = '0x639245e8476E03e789a244f279b5843b9633b2E7';
    safeAccountParams.multiSendAddress = '0x7B21BBDBdE8D01Df591fdc2dc0bE9956Dde1e16C';
    safeAccountParams.multiSendCallOnlyAddress = '0x32228dDEA8b9A2bd7f2d71A958fF241D79ca5eEC';
  }
  const safeAccount = await toSafeSmartAccount(safeAccountParams);

  const bundlerTransport = http(`${BUNDLER_TRANSPORT_URL_BASE}${chain.id}/rpc?apikey=${apiKey}`);
  const paymasterClient = createPimlicoClient({
    transport: bundlerTransport,
    chain,
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
  });

  const smartAccountClient = createSmartAccountClient({
    chain,
    account: safeAccount,
    paymaster: paymasterClient,
    bundlerTransport,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await paymasterClient.getUserOperationGasPrice()).fast;
      },
    },
  });
  return smartAccountClient;
};

// Gets the 7579 smart account wallet client. This is the new type of smart account that
// includes the session keys validator and the 7579 module.
const get7579SmartAccountWalletClient = async ({
  owner,
  address,
  chain = GEOGENESIS,
  rpcUrl = DEFAULT_RPC_URL,
  apiKey = DEFAULT_API_KEY,
}: {
  owner: WalletClient | Account;
  address?: Hex;
  chain?: Chain;
  rpcUrl?: string;
  apiKey?: string;
}): Promise<SmartAccountClient> => {
  const transport = http(rpcUrl);
  const publicClient = createPublicClient({
    transport,
    chain,
  });
  console.log('owner', owner);
  console.log('chain', chain);
  console.log('rpcUrl', rpcUrl);
  console.log('apiKey', apiKey);
  console.log('address', address);
  const ownerAddress = 'account' in owner ? owner.account?.address : owner.address;
  if (!ownerAddress) {
    throw new Error('Owner address not found');
  }

  const ownableValidator = getOwnableValidator({
    owners: [ownerAddress],
    threshold: 1,
  });
  const smartSessionsValidator = getSmartSessionsValidator({});

  const safeAccountParams: ToSafeSmartAccountParameters<'0.7', Hex> = {
    client: publicClient,
    owners: [owner],
    version: '1.4.1' as const,
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7' as const,
    },
    safe4337ModuleAddress: SAFE_7579_MODULE_ADDRESS as Hex,
    erc7579LaunchpadAddress: ERC7579_LAUNCHPAD_ADDRESS as Hex,
    attesters: [
      RHINESTONE_ATTESTER_ADDRESS, // Rhinestone Attester
    ],
    attestersThreshold: 1,
    validators: [
      {
        address: ownableValidator.address,
        context: ownableValidator.initData,
      },
      {
        address: smartSessionsValidator.address,
        context: smartSessionsValidator.initData,
      },
    ],
  };
  if (address) {
    safeAccountParams.address = address;
  }
  const safeAccount = await toSafeSmartAccount(safeAccountParams);

  const bundlerTransport = http(`${BUNDLER_TRANSPORT_URL_BASE}${chain.id}/rpc?apikey=${apiKey}`);
  const paymasterClient = createPimlicoClient({
    transport: bundlerTransport,
    chain,
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
  });

  const smartAccountClient = createSmartAccountClient({
    chain,
    account: safeAccount,
    paymaster: paymasterClient,
    bundlerTransport,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await paymasterClient.getUserOperationGasPrice()).fast;
      },
    },
  }).extend(erc7579Actions());
  // For some reason, the .extend() breaks the type inference, so we need to cast to unknown
  return smartAccountClient as unknown as SmartAccountClient;
};

// Checks if the smart account is deployed.
export const isSmartAccountDeployed = async (smartAccountClient: SmartAccountClient): Promise<boolean> => {
  if (!smartAccountClient.account) {
    throw new Error('Invalid smart account');
  }
  return smartAccountClient.account.isDeployed();
};

export type SmartAccountParams = {
  owner: WalletClient | Account;
  address?: Hex;
  chain?: Chain;
  rpcUrl?: string;
  apiKey?: string;
};
// Gets the smart account wallet client. This is the main function to use to get a smart account wallet client.
// It will return the 7579 smart account wallet client if the smart account is deployed, otherwise it will return the legacy smart account wallet client, that might need to be updated.
// You can use smartAccountNeedsUpdate to check if the smart account needs to be updated, and then call updateLegacySmartAccount to update it,
// which requires executing a user operation.
export const getSmartAccountWalletClient = async ({
  owner,
  address,
  chain = GEOGENESIS,
  rpcUrl = DEFAULT_RPC_URL,
  apiKey = DEFAULT_API_KEY,
}: SmartAccountParams): Promise<SmartAccountClient> => {
  if (chain.id === GEO_TESTNET.id) {
    // We don't have the smart sessions module deployed on testnet yet, so we need to use the legacy smart account wallet client
    // TODO: remove this once we have the smart sessions module deployed on testnet
    const params: SmartAccountParams = { owner, chain, rpcUrl, apiKey };
    if (address) {
      params.address = address;
    }
    console.log('on testnet, getting legacy smart account wallet client');
    return getLegacySmartAccountWalletClient(params);
  }
  if (address) {
    return get7579SmartAccountWalletClient({ owner, address, chain, rpcUrl, apiKey });
  }
  const legacyClient = await getLegacySmartAccountWalletClient({ owner, chain, rpcUrl, apiKey });
  if (await isSmartAccountDeployed(legacyClient)) {
    return legacyClient;
  }
  return get7579SmartAccountWalletClient({ owner, chain, rpcUrl, apiKey });
};

// Checks if the smart account has the 7579 module installed, the smart sessions validator installed, and the ownable validator installed.
export const legacySmartAccountUpdateStatus = async (
  smartAccountClient: SmartAccountClient,
  chain: Chain,
  rpcUrl: string,
): Promise<{ has7579Module: boolean; hasSmartSessionsValidator: boolean; hasOwnableValidator: boolean }> => {
  if (!smartAccountClient.account) {
    throw new Error('Invalid smart account');
  }
  // We assume the smart account is deployed, so we just need to check if it has the 7579 module and smart sesions validator installed
  // TODO: call the isModuleInstalled function from the safe7579Abi on the
  // smart account, checking if the smart sessions validator is installed. This would fail
  // if the smart account doesn't have the 7579 module installed.
  const transport = http(rpcUrl);
  const publicClient = createPublicClient({
    transport,
    chain,
  });
  const smartSessionsValidator = getSmartSessionsValidator({});
  let isSmartSessionsValidatorInstalled = false;
  try {
    isSmartSessionsValidatorInstalled = (await publicClient.readContract({
      abi: safe7579Abi,
      address: smartAccountClient.account.address,
      functionName: 'isModuleInstalled',
      args: [MODULE_TYPE_VALIDATOR, smartSessionsValidator.address, '0x'],
    })) as boolean;
  } catch (error) {
    if (error instanceof ContractFunctionExecutionError && error.details.includes('execution reverted')) {
      // If the smart account doesn't have the 7579 module installed, the isModuleInstalled function will revert
      return { has7579Module: false, hasSmartSessionsValidator: false, hasOwnableValidator: false };
    }
    throw error;
  }
  const ownableValidator = getOwnableValidator({
    owners: [smartAccountClient.account.address],
    threshold: 1,
  });
  // This shouldn't throw because by now we know the smart account has the 7579 module installed
  const isOwnableValidatorInstalled = (await publicClient.readContract({
    abi: safe7579Abi,
    address: smartAccountClient.account.address,
    functionName: 'isModuleInstalled',
    args: [MODULE_TYPE_VALIDATOR, ownableValidator.address, '0x'],
  })) as boolean;
  return {
    has7579Module: true,
    hasSmartSessionsValidator: isSmartSessionsValidatorInstalled,
    hasOwnableValidator: isOwnableValidatorInstalled,
  };
};

// Checks if the smart account needs to be updated from a legacy ERC-4337 smart account to an ERC-7579 smart account
// with support for smart sessions.
export const smartAccountNeedsUpdate = async (
  smartAccountClient: SmartAccountClient,
  chain: Chain,
  rpcUrl: string,
): Promise<boolean> => {
  if (chain.id === GEO_TESTNET.id) {
    // We don't have the smart sessions module deployed on testnet yet, so we need to use the legacy smart account wallet client
    // TODO: remove this once we have the smart sessions module deployed on testnet
    return false;
  }
  // If we haven't deployed the smart account, we would always deploy an updated version
  if (!(await isSmartAccountDeployed(smartAccountClient))) {
    return false;
  }
  const updateStatus = await legacySmartAccountUpdateStatus(smartAccountClient, chain, rpcUrl);
  return !updateStatus.has7579Module || !updateStatus.hasSmartSessionsValidator || !updateStatus.hasOwnableValidator;
};

// Legacy Geo smart accounts (i.e. the ones that don't have the 7579 module installed)
// need to be updated to have the 7579 module installed with the ownable and smart sessions validators.
export const updateLegacySmartAccount = async (
  smartAccountClient: SmartAccountClient,
  chain: Chain,
  rpcUrl: string,
): Promise<WaitForUserOperationReceiptReturnType | undefined> => {
  if (!smartAccountClient.account?.address) {
    throw new Error('Invalid smart account');
  }
  if (chain.id === GEO_TESTNET.id) {
    // We don't have the smart sessions module deployed on testnet yet, so we need to use the legacy smart account wallet client
    // TODO: remove this once we have the smart sessions module deployed on testnet
    console.log('on testnet, skipping updateLegacySmartAccount');
    return;
  }
  const ownableValidator = getOwnableValidator({
    owners: [smartAccountClient.account.address],
    threshold: 1,
  });
  const smartSessionsValidator = getSmartSessionsValidator({});
  const installValidatorsTx = encodeInstallModule({
    account: smartAccountClient.account,
    modules: [
      {
        type: ownableValidator.type,
        address: ownableValidator.address,
        context: ownableValidator.initData,
      },
      {
        type: smartSessionsValidator.type,
        address: smartSessionsValidator.address,
        context: smartSessionsValidator.initData,
      },
    ],
  });

  const updateStatus = await legacySmartAccountUpdateStatus(smartAccountClient, chain, rpcUrl);
  const calls = [];
  if (!updateStatus.has7579Module) {
    calls.push({
      to: smartAccountClient.account.address,
      data: encodeFunctionData({
        abi: safeModuleManagerAbi,
        functionName: 'enableModule',
        args: [SAFE_7579_MODULE_ADDRESS as Hex],
      }),
      value: BigInt(0),
    });
    calls.push({
      to: smartAccountClient.account.address,
      data: encodeFunctionData({
        abi: safeModuleManagerAbi,
        functionName: 'setFallbackHandler',
        args: [SAFE_7579_MODULE_ADDRESS as Hex],
      }),
      value: BigInt(0),
    });
    calls.push({
      to: smartAccountClient.account.address,
      data: encodeFunctionData({
        abi: safeModuleManagerAbi,
        functionName: 'disableModule',
        args: [SAFE_4337_MODULE_ADDRESS as Hex],
      }),
      value: BigInt(0),
    });
  }
  if (!updateStatus.hasOwnableValidator) {
    calls.push({
      to: installValidatorsTx[0].to,
      data: installValidatorsTx[0].data,
      value: installValidatorsTx[0].value,
    });
  }
  if (!updateStatus.hasSmartSessionsValidator) {
    calls.push({
      to: installValidatorsTx[1].to,
      data: installValidatorsTx[1].data,
      value: installValidatorsTx[1].value,
    });
  }
  if (calls.length === 0) {
    return;
  }
  const tx = await smartAccountClient.sendUserOperation({
    calls,
  });
  const receipt = await smartAccountClient.waitForUserOperationReceipt({
    hash: tx,
  });
  if (!receipt.success) {
    throw new Error('Transaction to update legacy smart account failed');
  }
  return receipt;
};

// Gets the actions that a session key needs permission to perform on a space.
const getSpaceActions = (space: { address: Hex; type: 'personal' | 'public' }) => {
  const actions: Action[] = [];
  if (space.type === 'public') {
    for (const functionName of PUBLIC_SPACE_FUNCTIONS) {
      actions.push({
        actionTarget: space.address,
        actionTargetSelector: toFunctionSelector(
          getAbiItem({
            abi: mainVotingAbi,
            name: functionName,
          }) as AbiFunction,
        ),
        actionPolicies: [getSudoPolicy()],
      });
    }
  } else {
    for (const functionName of PERSONAL_SPACE_FUNCTIONS) {
      actions.push({
        actionTarget: space.address,
        actionTargetSelector: toFunctionSelector(
          getAbiItem({
            abi: personalSpaceAdminAbi,
            name: functionName,
          }) as AbiFunction,
        ),
        actionPolicies: [getSudoPolicy()],
      });
    }
  }
  return actions;
};

// This is the function that the Connect app uses to create a smart session and
// enable it on the smart account.
// It will prompt the user to sign the message to enable the session, and then
// execute the transaction to enable the session.
// It will return the permissionId that can be used to create a smart session client.
export const createSmartSession = async (
  owner: WalletClient,
  accountAddress: Hex,
  sessionPrivateKey: Hex,
  chain: Chain,
  rpcUrl: string,
  {
    allowCreateSpace = false,
    spaces = [],
    additionalActions = [],
  }: {
    allowCreateSpace?: boolean;
    spaces?: {
      address: Hex;
      type: 'personal' | 'public';
    }[];
    additionalActions?: Action[];
  } = {},
): Promise<Hex> => {
  const smartAccountClient = await getSmartAccountWalletClient({
    owner,
    address: accountAddress,
    chain,
    rpcUrl,
  });
  if (!smartAccountClient.account) {
    throw new Error('Invalid wallet client');
  }
  if (!smartAccountClient.account.isDeployed()) {
    throw new Error('Smart account must be deployed');
  }
  if (await smartAccountNeedsUpdate(smartAccountClient, chain, rpcUrl)) {
    throw new Error('Smart account needs to be updated');
  }
  if (!smartAccountClient.chain) {
    throw new Error('Invalid smart account chain');
  }
  if (!owner.account) {
    throw new Error('Invalid wallet client');
  }

  const sessionKeyAccount = privateKeyToAccount(sessionPrivateKey);
  const transport = http(rpcUrl);
  const publicClient = createPublicClient({
    transport,
    chain,
  });
  if (chain.id === GEO_TESTNET.id) {
    // We don't have the smart sessions module deployed on testnet yet, so we need to fake it by adding an account owner
    // TODO: remove this once we have the smart sessions module deployed on testnet
    console.log('on testnet, faking a smart session by adding an account owner');
    const tx = await smartAccountClient.sendUserOperation({
      calls: [
        {
          to: smartAccountClient.account.address,
          data: encodeFunctionData({
            abi: safeOwnerManagerAbi,
            functionName: 'addOwnerWithThreshold',
            args: [sessionKeyAccount.address, BigInt(1)],
          }),
          value: BigInt(0),
        },
      ],
      account: smartAccountClient.account,
    });
    const receipt = await smartAccountClient.waitForUserOperationReceipt({
      hash: tx,
    });
    if (!receipt.success) {
      throw new Error('Transaction to add account owner failed');
    }
    console.log('account owner added');
    return bytesToHex(randomBytes(32)) as Hex;
  }
  // We create a dummy action so that we can execute a userOp immediately and create the session onchain,
  // rather than having to pass along all the enable data to the end user app.
  // In the future, if we enable attestations with the Rhinestone registry, we can remove this and instead
  // call enableSessions on the smart sessions module from the smart account.
  console.log('creating noOpActionPolicy');
  const noOpActionPolicy = getUniversalActionPolicy({
    paramRules: {
      length: BigInt(1),
      // @ts-expect-error - The Rhinestone SDK doesn't export the types we need here
      rules: new Array(16).fill({
        condition: BigInt(0), // ParamCondition.EQUAL
        isLimited: false,
        offset: BigInt(0),
        ref: toHex(toBytes('0x', { size: 32 })),
        usage: { limit: BigInt(0), used: BigInt(0) },
      }),
    },
    valueLimitPerUse: BigInt(0),
  });
  console.log('noOpActionPolicy created');
  const actions: Action[] = [
    {
      actionTarget: sessionKeyAccount.address,
      actionTargetSelector: toFunctionSelector(
        getAbiItem({
          abi: smartSessionsAbi,
          name: 'revokeEnableSignature',
        }) as AbiFunction,
      ),
      actionPolicies: [noOpActionPolicy],
    },
  ];

  console.log('getting space actions');
  for (const space of spaces) {
    actions.push(...getSpaceActions(space));
  }
  console.log('space actions created');
  if (allowCreateSpace) {
    const spaceFactoryAddress = SPACE_FACTORY_ADDRESS[chain.id.toString()];
    actions.push({
      actionTarget: spaceFactoryAddress,
      actionTargetSelector: toFunctionSelector(
        getAbiItem({
          abi: daoFactoryAbi,
          name: 'createDao',
        }) as AbiFunction,
      ),
      actionPolicies: [getSudoPolicy()],
    });
  }
  if (additionalActions) {
    actions.push(...additionalActions);
  }
  console.log('actions created');
  const session: Session = {
    sessionValidator: OWNABLE_VALIDATOR_ADDRESS,
    sessionValidatorInitData: encodeValidationData({
      threshold: 1,
      owners: [sessionKeyAccount.address],
    }),
    salt: bytesToHex(randomBytes(32)) as Hex,
    userOpPolicies: [getSudoPolicy()],
    erc7739Policies: {
      allowedERC7739Content: [],
      erc1271Policies: [],
    },
    actions,
    chainId: BigInt(smartAccountClient.chain.id),
    permitERC4337Paymaster: true,
  };
  const account = getAccount({
    address: smartAccountClient.account.address,
    type: 'safe',
  });

  console.log('session object');
  // We use UNSAFE_ENABLE because we're not using Rhinestone's Registry
  // contract to attest to the sessions we're creating.
  // That's also why we set ignoreSecurityAttestations to true.
  const sessionDetails = await getEnableSessionDetails({
    // enableMode: SmartSessionMode.ENABLE,
    sessions: [session],
    account,
    clients: [publicClient],
    // ignoreSecurityAttestations: true,
  });

  console.log('signing session details');
  // This will prompt the user to sign the message to enable the session
  sessionDetails.enableSessionData.enableSession.permissionEnableSig = await owner.signMessage({
    message: { raw: sessionDetails.permissionEnableHash },
    account: owner.account.address,
  });
  console.log('session details signed');
  const smartSessions = getSmartSessionsValidator({});
  const nonce = await getAccountNonce(publicClient, {
    address: smartAccountClient.account.address,
    entryPointAddress: entryPoint07Address,
    key: encodeValidatorNonce({
      account,
      validator: smartSessions,
    }),
  });
  console.log('nonce');
  // This will be replaced with the actual signature below
  sessionDetails.signature = getOwnableValidatorMockSignature({
    threshold: 1,
  });
  console.log('prep user op');
  const userOperation = await smartAccountClient.prepareUserOperation({
    account: smartAccountClient.account,
    calls: [
      {
        // We use the revokeEnableSignature with permissionId 0 function to create a noop action
        to: sessionKeyAccount.address,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: smartSessionsAbi,
          functionName: 'revokeEnableSignature',
          args: [toHex(toBytes('0x', { size: 32 }))],
        }),
      },
    ],
    nonce,
    signature: encodeSmartSessionSignature(sessionDetails),
  });
  console.log('user operation prepared');
  const userOpHashToSign = getUserOperationHash({
    chainId: chain.id,
    entryPointAddress: entryPoint07Address,
    entryPointVersion: '0.7',
    userOperation,
  });
  console.log('user op hash to sign');
  sessionDetails.signature = await sessionKeyAccount.signMessage({
    message: { raw: userOpHashToSign },
  });
  console.log('user op hash to sign signed');
  userOperation.signature = encodeSmartSessionSignature(sessionDetails);
  console.log('user op hash to sign encoded');
  const userOpHash = await smartAccountClient.sendUserOperation(userOperation as UserOperation); // No idea why the type doesn't match
  console.log('user op hash');
  const receipt = await smartAccountClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });
  if (!receipt.success) {
    throw new Error('Transaction to create smart session failed');
  }
  return getPermissionId({ session });
};

// This is the function that we use on the end user app to create a smart session client that can send transactions to the smart account.
// The session must have previously been created by the createSmartSession function.
// The client also includes a signMessage function that can be used to sign messages with the session key.
export const getSmartSessionClient = async ({
  accountAddress,
  chain = GEOGENESIS,
  rpcUrl = DEFAULT_RPC_URL,
  apiKey = DEFAULT_API_KEY,
  sessionPrivateKey,
  permissionId,
}: {
  accountAddress: Hex;
  chain?: Chain;
  rpcUrl?: string;
  apiKey?: string;
  sessionPrivateKey: Hex;
  permissionId: Hex;
}): Promise<SmartSessionClient> => {
  const sessionKeyAccount = privateKeyToAccount(sessionPrivateKey);
  const smartAccountClient = await getSmartAccountWalletClient({
    owner: sessionKeyAccount, // Won't really be used (except in testnet), but we need to pass in an account
    address: accountAddress,
    chain,
    rpcUrl,
    apiKey,
  });
  if (!smartAccountClient.account) {
    throw new Error('Invalid smart account');
  }

  const smartSessions = getSmartSessionsValidator({});
  const publicClient = createPublicClient({
    transport: http(rpcUrl),
    chain,
  });

  return {
    account: smartAccountClient.account,
    chain,
    sendUserOperation: async <const calls extends readonly unknown[]>({ calls }: { calls: calls }) => {
      if (!smartAccountClient.account) {
        throw new Error('Invalid smart account');
      }
      if (chain.id === GEO_TESTNET.id) {
        // We don't have the smart sessions module deployed on testnet yet, so we need to use the legacy smart account wallet client
        // TODO: remove this once we have the smart sessions module deployed on testnet
        return smartAccountClient.sendUserOperation({
          calls: calls as Calls<Narrow<calls>>,
          account: smartAccountClient.account,
        });
      }
      const account = getAccount({
        address: smartAccountClient.account.address,
        type: 'safe',
      });
      const sessionDetails = {
        mode: SmartSessionMode.USE,
        permissionId,
        signature: getOwnableValidatorMockSignature({
          threshold: 1,
        }),
      };
      const nonce = await getAccountNonce(publicClient, {
        address: smartAccountClient.account.address,
        entryPointAddress: entryPoint07Address,
        key: encodeValidatorNonce({
          account,
          validator: smartSessions,
        }),
      });
      const userOperation = await smartAccountClient.prepareUserOperation({
        account: smartAccountClient.account,
        calls,
        nonce,
        signature: encodeSmartSessionSignature(sessionDetails),
      });

      const userOpHashToSign = getUserOperationHash({
        chainId: chain.id,
        entryPointAddress: entryPoint07Address,
        entryPointVersion: '0.7',
        userOperation,
      });

      sessionDetails.signature = await sessionKeyAccount.signMessage({
        message: { raw: userOpHashToSign },
      });

      userOperation.signature = encodeSmartSessionSignature(sessionDetails);

      return smartAccountClient.sendUserOperation(userOperation as UserOperation);
    },
    signMessage: async ({ message }: { message: SignableMessage }) => {
      return sessionKeyAccount.signMessage({ message });
    },
    waitForUserOperationReceipt: async ({ hash }: { hash: Hex }) => {
      return smartAccountClient.waitForUserOperationReceipt({ hash });
    },
  };
};
