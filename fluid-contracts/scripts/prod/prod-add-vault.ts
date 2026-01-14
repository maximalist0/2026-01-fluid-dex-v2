import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import {
  addVaultConfigs,
  FluidVersion,
  VaultCoreSettings,
  VaultT2CoreSettings,
  VaultT4CoreSettings,
  VAULT_TYPE,
} from "../settings";
import { deployerSigner, getTokenSymbol, logDebug, logSuccess, throwIfInvalidBorrowConfig, TxQueue } from "../util";
import {
  deployExpandPercentConfigHandler,
  deployOracle,
  deployVaultBorrowRewards,
  deployVaultRewards,
  deployVaultT1,
  deployVaultT234,
  getVaultContractName,
} from "../deploy/deploy-scripts";
import {
  setConfigDexUserBorrowConfig,
  setConfigDexUserSupplyConfig,
  setConfigLiquidityAuths,
  setConfigLiquidityUserBorrowConfig,
  setConfigLiquidityUserSupplyConfig,
  setConfigVaultFactorySetVaultAuth,
  setConfigVaultT1CoreSettings,
  setConfigVaultT1Oracle,
  setConfigVaultT1UpdateRebalancer,
  setConfigVaultT234Oracle,
  setConfigVaultT2CoreSettings,
  setConfigVaultT4CoreSettings,
} from "../config";
import { FluidVaultFactory__factory } from "../../typechain-types";

export const prodAddVault = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID ADD VAULT -------------------\n");

  const version: FluidVersion = "v1_1_0";

  const vaultConfig = addVaultConfigs();

  // deploy Oracle for Vault
  if (!!vaultConfig.oracle) {
    await deployOracle(hre, version, vaultConfig.oracle);
  }

  let vault: string;
  if (vaultConfig.vaultType === VAULT_TYPE.T1) {
    // deploy VaultT1 via Factory
    vault = await deployVaultT1(
      hre,
      version,
      vaultConfig.supplyToken,
      vaultConfig.borrowToken,
      vaultConfig.addToVaultIdCounter
    );
  } else {
    vault = await deployVaultT234(
      hre,
      version,
      vaultConfig.supplyToken,
      vaultConfig.borrowToken,
      vaultConfig.addToVaultIdCounter,
      vaultConfig.vaultType
    );
  }

  if (vaultConfig.vaultType === VAULT_TYPE.T1 || vaultConfig.vaultType === VAULT_TYPE.T3_SMART_DEBT) {
    // set user config for vault at Liquidity
    await setConfigLiquidityUserSupplyConfig(hre, vaultConfig.vault.supplyConfig(vault));
  } else {
    // set user config for vault at Dex
    await setConfigDexUserSupplyConfig(hre, vaultConfig.supplyToken, vaultConfig.vault.supplyConfig(vault));
  }

  if (vaultConfig.vaultType === VAULT_TYPE.T1 || vaultConfig.vaultType === VAULT_TYPE.T2_SMART_COL) {
    await setConfigLiquidityUserBorrowConfig(hre, vaultConfig.vault.borrowConfig(vault));
  } else {
    // set user config for vault at Dex
    await setConfigDexUserBorrowConfig(hre, vaultConfig.borrowToken, vaultConfig.vault.borrowConfig(vault));
  }

  if (vaultConfig.vaultType === VAULT_TYPE.T1) {
    // set core settings via VaultAdmin
    await setConfigVaultT1CoreSettings(hre, vault, vaultConfig.vault.coreSettings as any as VaultCoreSettings);
  } else if (vaultConfig.vaultType === VAULT_TYPE.T2_SMART_COL) {
    await setConfigVaultT2CoreSettings(hre, vault, vaultConfig.vault.coreSettings as any as VaultT2CoreSettings);
  } else if (vaultConfig.vaultType === VAULT_TYPE.T4_SMART_COL_SMART_DEBT) {
    await setConfigVaultT4CoreSettings(hre, vault, vaultConfig.vault.coreSettings as any as VaultT4CoreSettings);
  } else {
    throw new Error("set config vault core settings for vault t3 not implemented yet");
  }

  // let oracleName = "CappedRateChainlink_WEETH";
  let oracleName = vaultConfig?.oracle?.oracleName;
  if (vaultConfig.vaultType === VAULT_TYPE.T1) {
    // set oracle via VaultAdmin
    await setConfigVaultT1Oracle(hre, vault, (await hre.deployments.get(oracleName)).address);
  } else {
    // set oracle via VaultAdmin
    await setConfigVaultT234Oracle(hre, vault, (await hre.deployments.get(oracleName)).linkedData?.nonce);
  }

  let rebalancer = vaultConfig.vault.rebalancer;
  if (rebalancer === hre.ethers.constants.AddressZero) {
    rebalancer = (await hre.deployments.get("ReserveContractProxy")).address;
  }
  if (rebalancer && rebalancer !== hre.ethers.constants.AddressZero) {
    // set rebalancer via VaultAdmin
    await setConfigVaultT1UpdateRebalancer(hre, vault, rebalancer);
  }

  // if (vaultConfig.rewards(vault)) {
  //   let vaultRewards: string;
  //   if (vaultConfig.rewards(vault).type === "BORROW") {
  //     vaultRewards = await deployVaultBorrowRewards(
  //       hre,
  //       version,
  //       vault,
  //       vaultConfig.rewards(vault).duration,
  //       vaultConfig.rewards(vault).rewardsAmount,
  //       vaultConfig.rewards(vault).initiator,
  //       vaultConfig.borrowToken,
  //       await getVaultContractName(hre, vaultConfig.supplyToken, vaultConfig.borrowToken, vaultConfig.vaultType),
  //       vaultConfig.rewards(vault).governance
  //     );
  //   } else {
  //     vaultRewards = await deployVaultRewards(
  //       hre,
  //       version,
  //       vault,
  //       vaultConfig.rewards(vault).duration,
  //       vaultConfig.rewards(vault).rewardsAmount,
  //       vaultConfig.rewards(vault).initiator,
  //       vaultConfig.supplyToken,
  //       await getVaultContractName(hre, vaultConfig.supplyToken, vaultConfig.borrowToken, vaultConfig.vaultType),
  //       vaultConfig.rewards(vault).governance
  //     );
  //   }

  //   // allow rewards contract as auth at vault so that it can set the supply rate magnifier
  //   await setConfigVaultFactorySetVaultAuth(hre, vault, vaultRewards, true);
  // } else {
  //   logDebug("\nSkipped deploying a VaultRewards contract, not configured.\n");
  // }

  const supplyTokenSymbol = await getTokenSymbol(hre, vaultConfig.supplyToken);
  const borrowTokenSymbol = await getTokenSymbol(hre, vaultConfig.borrowToken);

  const vaultId =
    (
      await FluidVaultFactory__factory.connect(
        (
          await hre.deployments.get("VaultFactory")
        ).address,
        await deployerSigner(hre)
      ).totalVaults()
    ).toNumber() +
    1 +
    vaultConfig.addToVaultIdCounter;

  const jsonBatchFilename = `add-vault-${supplyTokenSymbol}_${borrowTokenSymbol}-vaultId-${vaultId}`;
  await TxQueue.processQueue(hre, jsonBatchFilename);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline(
      "Executed all steps for Fluid",
      version.replace(/_/g, "."),
      "add vault (vaultId: " + vaultId + ")!\n"
    )
  );
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "1. Import the json file into Avocado transaction builder and execute.\n",
    "2. Manually copy the transaction hash into the deployment logs for the vault.\n",
    "3. Run this script with only step deployVault again (other steps commented out), to verify code at block explorer and create full logs.\n",
    "4. Double check all configs!\n",
    "5. Every new vault should be seeded with an initial deposit & borrow that is never withdrawn!\n"
  );
};
