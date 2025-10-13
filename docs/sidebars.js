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
import typedocSidebarHypergraph from './docs/api-reference/hypergraph/typedoc-sidebar.cjs';
import typedocSidebarHypergraphReact from './docs/api-reference/hypergraph-react/typedoc-sidebar.cjs';

const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  docs: [
    { type: 'doc', id: 'quickstart', label: '🚀 Quickstart' },
    { type: 'doc', id: 'ai-usage', label: '✨ AI Usage' },
    { type: 'doc', id: 'key-features', label: '🌟 Key Features' },
    { type: 'doc', id: 'core-concepts', label: '🧠 Core Concepts' },
    { type: 'doc', id: 'typesync', label: '🧬 TypeSync' },
    { type: 'doc', id: 'providers', label: '🔗 Providers' },
    { type: 'doc', id: 'authentication', label: '🔗 Authentication' },
    { type: 'doc', id: 'spaces', label: '🏠 Spaces' },
    { type: 'doc', id: 'schema', label: '🔗 Schema' },
    { type: 'doc', id: 'writing-private-data', label: '✍️ Writing Private Data' },
    { type: 'doc', id: 'query-private-data', label: '🔍 Query Private Data' },
    { type: 'doc', id: 'publishing-public-data', label: '✍️ Publishing Public Data' },
    { type: 'doc', id: 'query-public-data', label: '🔍 Query Public Data' },
    { type: 'doc', id: 'filtering-query-results', label: '🔍 Filtering Query Results' },
    { type: 'doc', id: 'space-invitations', label: '🔗 Space Invitations' },
    { type: 'doc', id: 'inboxes', label: '🔍 Inboxes' },
    {
      type: 'category',
      label: '📚 API Reference',
      items: [
        {
          type: 'category',
          label: 'Hypergraph',
          link: { type: 'doc', id: 'api-reference/hypergraph/index' },
          items: typedocSidebarHypergraph,
        },
        {
          type: 'category',
          label: 'Hypergraph React',
          link: { type: 'doc', id: 'api-reference/hypergraph-react/index' },
          items: typedocSidebarHypergraphReact,
        },
      ],
    },
    { type: 'doc', id: 'troubleshooting', label: '🛠️ Troubleshooting' },
    { type: 'doc', id: 'faq', label: '❓ FAQ' },
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
