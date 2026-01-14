import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { addVaultConfigs, FluidVersion, VAULT_TYPE } from "../settings";
import { deployerSigner, getTokenSymbol, logDebug, logSuccess, TxQueue } from "../util";
import { deployOracle, deployVaultT1, deployVaultT234 } from "../deploy/deploy-scripts";
import { FluidVaultFactory__factory } from "../../typechain-types";

export const prodDeployVault = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID DEPLOY VAULT -------------------\n");

  const version: FluidVersion = "v1_1_0";

  const vaultConfig = addVaultConfigs();

  if (!!vaultConfig.oracle) {
    // deploy Oracle for Vault
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
      "deploy vault (vaultId: " + vaultId + ")!\n"
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
