import { PrivyClient, type Wallet } from '@privy-io/server-auth';

export async function getAddressByPrivyToken(idToken: string | undefined): Promise<string> {
  if (!idToken) {
    throw new Error('No Privy ID token provided');
  }

  if (!process.env.PRIVY_APP_SECRET || !process.env.PRIVY_APP_ID) {
    throw new Error('Missing Privy configuration');
  }

  const privy = new PrivyClient(process.env.PRIVY_APP_ID, process.env.PRIVY_APP_SECRET);
  const user = await privy.getUser({ idToken });

  if (!user) {
    throw new Error('Invalid Privy user');
  }

  const wallet = user.linkedAccounts.find(
    (account) => account.type === 'wallet' && account.walletClientType === 'privy',
  ) as Wallet;

  if (!wallet) {
    throw new Error('No Privy wallet found');
  }

  return wallet.address;
}
