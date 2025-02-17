import { Account } from '@graphprotocol/grc-20';
export const createAccount = async (accountId: string) => {
  const account = Account.make(accountId);
  console.log(account);
  return account;
};
