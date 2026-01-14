import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";
import { FluidVersion, listTokenConfigs } from "../settings";
import { getTokenSymbol, logDebug, logSuccess, TxQueue } from "../util";
import { deployLendingFToken, FTokenType } from "../deploy/deploy-scripts";

export const prodDeployFToken = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID DEPLOY FTOKEN -------------------\n");
  const version: FluidVersion = "v1_0_0";
  // check that token is not already configured.
  const config = listTokenConfigs();

  // deploy fToken
  let fTokenType = config.lending.isNativeUnderlying ? FTokenType.NativeUnderlying : FTokenType.fToken;
  const fToken = await deployLendingFToken(hre, version, config.token, fTokenType);

  const tokenSymbol = await getTokenSymbol(hre, config.token);
  await TxQueue.processQueue(hre, "deploy-ftoken-" + tokenSymbol);

  logDebug("\n-----------------------------------------");
  logSuccess(chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "deploy fToken!\n"));
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "1. Import the json file into Avocado transaction builder and execute.\n",
    "2. If first token listing: run this script with only step deployLendingFToken again (other steps commented out), to verify code at block explorer.\n",
    "3. Manually copy the transaction hash into the deployment logs for the fToken.\n",
    "4. Double check all configs!\n",
    "5. Every new fToken should be seeded with an initial deposit that is never withdrawn!\n"
  );
};
