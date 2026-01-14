import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { addDexConfigs, FluidVersion } from "../settings";
import { deployerSigner, getTokenSymbol, logDebug, logSuccess, TxQueue } from "../util";
import { deployOracle, deployDexT1 } from "../deploy/deploy-scripts";
import { FluidDexFactory__factory } from "../../typechain-types";
import { deployCenterPrice } from "../deploy/deploy-scripts/centerPrices/deploy-centerPrice";

export const prodDeployDex = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID ADD DEX -------------------\n");

  const version: FluidVersion = "v1_1_0";

  const dexConfig = addDexConfigs();

  // deploy dexT1 via Factory
  const dexT1 = await deployDexT1(
    hre,
    version,
    dexConfig.token0,
    dexConfig.token1,
    dexConfig.oracleMapping,
    dexConfig.addToDexIdCounter
  );

  const token0TokenSymbol = await getTokenSymbol(hre, dexConfig.token0);
  const token1TokenSymbol = await getTokenSymbol(hre, dexConfig.token1);

  const dexId =
    (
      await FluidDexFactory__factory.connect(
        (
          await hre.deployments.get("DexFactory")
        ).address,
        await deployerSigner(hre)
      ).totalDexes()
    ).toNumber() +
    1 +
    dexConfig.addToDexIdCounter;

  const jsonBatchFilename = `add-dex-${token0TokenSymbol}_${token1TokenSymbol}-dexId-${dexId}`;
  await TxQueue.processQueue(hre, jsonBatchFilename);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline(
      "Executed all steps for Fluid",
      version.replace(/_/g, "."),
      "add dex (dexId: " + dexId + ")!\n"
    )
  );
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "1. Import the json file into Avocado transaction builder and execute.\n",
    "2. Manually copy the transaction hash into the deployment logs for the dex (replace TODO). \n",
    "3. If first add dex: run this script with only step deployDexT1 again (other steps commented out), to verify code at block explorer.\n",
    "4. Double check all configs!\n",
    "5. Every new dex should be seeded with an initial deposit & borrow that is never withdrawn!\n"
  );
};
