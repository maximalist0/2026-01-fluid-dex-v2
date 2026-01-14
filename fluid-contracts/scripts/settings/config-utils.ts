import { BigNumber, ethers } from "ethers";

export const PERCENT_PRECISION = 1e2;

export const DEFAULT_HUNDRED_PERCENT = 100 * PERCENT_PRECISION;

export const DECIMALS_6 = BigNumber.from(1e6);
export const DECIMALS_18 = ethers.utils.parseEther("1");

export const MODE_INTEREST_FREE = 0;
export const MODE_WITH_INTEREST = 1;

export const DEXT1_THRESHOLD_SHIFT_TIME_MAX = 16777215;

export enum VAULT_TYPE {
  T1 = 10000,
  T2_SMART_COL = 20000,
  T3_SMART_DEBT = 30000,
  T4_SMART_COL_SMART_DEBT = 40000,
}

export const isVaultTypeSmartCol = (vaultType: VAULT_TYPE): boolean => {
  if (vaultType === VAULT_TYPE.T1) {
    return false;
  }
  if (vaultType === VAULT_TYPE.T2_SMART_COL) {
    return true;
  }
  if (vaultType === VAULT_TYPE.T3_SMART_DEBT) {
    return false;
  }
  if (vaultType === VAULT_TYPE.T4_SMART_COL_SMART_DEBT) {
    return true;
  }

  throw new Error("Vault Type not exist");
};

export const isVaultTypeSmartDebt = (vaultType: VAULT_TYPE): boolean => {
  if (vaultType === VAULT_TYPE.T1) {
    return false;
  }
  if (vaultType === VAULT_TYPE.T2_SMART_COL) {
    return false;
  }
  if (vaultType === VAULT_TYPE.T3_SMART_DEBT) {
    return true;
  }
  if (vaultType === VAULT_TYPE.T4_SMART_COL_SMART_DEBT) {
    return true;
  }

  throw new Error("Vault Type not exist");
};

export const getVaultTypeName = (vaultType: VAULT_TYPE): string => {
  if (vaultType === VAULT_TYPE.T1) {
    return "VaultT1";
  }
  if (vaultType === VAULT_TYPE.T2_SMART_COL) {
    return "VaultT2";
  }
  if (vaultType === VAULT_TYPE.T3_SMART_DEBT) {
    return "VaultT3";
  }
  if (vaultType === VAULT_TYPE.T4_SMART_COL_SMART_DEBT) {
    return "VaultT4";
  }

  throw new Error("Vault Type not exist");
};

export const getVaultTypePath = (vaultType: VAULT_TYPE): string => {
  if (vaultType === VAULT_TYPE.T1) {
    return "contracts/protocols/vault/vaultT1/";
  }
  if (vaultType === VAULT_TYPE.T2_SMART_COL) {
    return "contracts/protocols/vault/vaultT2/";
  }
  if (vaultType === VAULT_TYPE.T3_SMART_DEBT) {
    return "contracts/protocols/vault/vaultT3/";
  }
  if (vaultType === VAULT_TYPE.T4_SMART_COL_SMART_DEBT) {
    return "contracts/protocols/vault/vaultT4/";
  }

  throw new Error("Vault Type not exist");
};
