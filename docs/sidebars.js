// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  docs: [
    { type: 'doc', id: 'quickstart', label: '🚀 Quickstart' },
    // { type: 'doc', id: 'faucet', label: '🪙 Testnet Faucet' },
    { type: 'doc', id: 'key-features', label: '🌟 Key Features' },
    { type: 'doc', id: 'core-concepts', label: '🧠 Core Concepts' },
    { type: 'doc', id: 'api-reference', label: '📚 API Reference' },
    { type: 'doc', id: 'troubleshooting', label: '🛠️ Troubleshooting' },
    { type: 'doc', id: 'faq', label: '❓ FAQ' },
    // { type: 'doc', id: 'legacy/README', label: '🗃️ Legacy Documentation' },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        {
          type: 'doc',
          id: 'advanced/running-connect-and-sync-server-locally',
          label: 'Running Geo Connect and Sync Server Locally',
        },
      ],
    },
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

export default sidebars;
