import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // turbopack: {
  //   root: path.join(__dirname, '../..'),
  //   resolveAlias: {
  //     '@graphprotocol/hypergraph': path.resolve(__dirname, '../../packages/hypergraph'),
  //     '@graphprotocol/hypergraph-react': path.resolve(__dirname, '../../packages/hypergraph-react'),
  //   },
  // },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
};

export default nextConfig;
