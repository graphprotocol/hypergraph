import { Graph } from '@graphprotocol/grc-20';
import { GraphQLClient } from 'graphql-request';

export const graphqlClient = new GraphQLClient(`${Graph.TESTNET_API_ORIGIN}/v2/graphql`);
