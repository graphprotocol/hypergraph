import { loadKeys } from './keyStorage';

export const isAuthenticated = () => {
  const localStorageSignerAddress = localStorage.getItem('signerAddress');
  if (!localStorageSignerAddress) {
    return false;
  }
  const keys = loadKeys(localStorageSignerAddress);
  if (!keys) {
    return false;
  }
  return true;
};
