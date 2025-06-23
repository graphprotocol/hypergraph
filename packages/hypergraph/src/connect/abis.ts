import mainVotingAbi from './abis/MainVotingPlugin.json' with { type: 'json' };
import personalSpaceAdminAbi from './abis/PersonalSpaceAdminPlugin.json' with { type: 'json' };

export { mainVotingAbi, personalSpaceAdminAbi };

// Simplified ABI for the Safe Module Manager with the functions we need
export const safeModuleManagerAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'enableModule',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'disableModule',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const safeOwnerManagerAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'threshold',
        type: 'uint256',
      },
    ],
    name: 'addOwnerWithThreshold',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// We only use this for revokeEnableSignature to use as a noop when creating a smart session
export const smartSessionsAbi = [
  {
    inputs: [
      {
        internalType: 'PermissionId',
        name: 'permissionId',
        type: 'bytes32',
      },
    ],
    name: 'revokeEnableSignature',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// ABI for the Safe7579 module, only with the functions we need
export const safe7579Abi = [
  {
    type: 'function',
    name: 'isModuleInstalled',
    inputs: [
      {
        name: 'moduleType',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'module', type: 'address', internalType: 'address' },
      { name: 'additionalContext', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
];

// ABI for the DAO Factory, only with the functions we need
export const daoFactoryAbi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'trustedForwarder',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'daoURI',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'subdomain',
            type: 'string',
          },
          {
            internalType: 'bytes',
            name: 'metadata',
            type: 'bytes',
          },
        ],
        internalType: 'struct DAOFactory.DAOSettings',
        name: '_daoSettings',
        type: 'tuple',
      },
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint8',
                    name: 'release',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint16',
                    name: 'build',
                    type: 'uint16',
                  },
                ],
                internalType: 'struct PluginRepo.Tag',
                name: 'versionTag',
                type: 'tuple',
              },
              {
                internalType: 'contract PluginRepo',
                name: 'pluginSetupRepo',
                type: 'address',
              },
            ],
            internalType: 'struct PluginSetupRef',
            name: 'pluginSetupRef',
            type: 'tuple',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct DAOFactory.PluginSettings[]',
        name: '_pluginSettings',
        type: 'tuple[]',
      },
    ],
    name: 'createDao',
    outputs: [
      {
        internalType: 'contract DAO',
        name: 'createdDao',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
