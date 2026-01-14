import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";
import { FluidVersion } from "../settings";
import { logDebug, logSuccess, TxQueue } from "../util";
import { deploySmartLendingViaFactory } from "../deploy/deploy-scripts";
import { setConfigSmartLendingSetRebalancer } from "../config";

export const deploySmartLending = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID SMART LENDING -------------------\n");
  const version: FluidVersion = "v1_0_0";

  // deploy smart Lending ids:

  // MAINNET
  const DEUSD_USDC_DEX_ID = 19;
  const USR_USDC_DEX_ID = 20;
  const USD0_USDC_DEX_ID = 23;
  const FXUSD_USDC_DEX_ID = 24;
  const RLP_USDC_DEX_ID = 28;
  const SUSDS_USDT_DEX_ID = 31;
  const IUSD_USDE_DEX_ID = 35;
  const USDC_CSUSDL_DEX_ID = 38;

  // POLYGON
  const USDC_WUSDM = 3;
  const AUSD_USDC = 4;
  const USDC_EUROP = 7;
  const USDC_XSGD = 8;

  // ARB
  const FLUID_ETH_ARB_DEX_ID = 5;
  const SUSDAI_USDC_ARB_DEX_ID = 9;
  const RLP_USDC_ARB_DEX_ID = 12;

  // BASE
  const FLUID_ETH_BASE_DEX_ID = 4;
  const YOETH_ETH_BASE_DEX_ID = 6;
  const YOUSD_USDC_BASE_DEX_ID = 7;
  const YOBTC_CBBTC_BASE_DEX_ID = 8;

  // PLASMA
  const SUSDAI_USDT_PLASMA_DEX_ID = 6;
  const FLUID_WETH_PLASMA_DEX_ID = 8;

  const dexId = FLUID_WETH_PLASMA_DEX_ID;

  const smartLending = await deploySmartLendingViaFactory(hre, version, dexId);

  await setConfigSmartLendingSetRebalancer(
    hre,
    smartLending,
    (
      await hre.deployments.get("ReserveContractProxy")
    ).address
  );

  await TxQueue.processQueue(hre, "smart-lending-" + dexId);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "smart lending deployment!\n")
  );
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "1. Import the json file into Avocado transaction builder and execute.\n",
    "2. If first smart lending deployment: run this script again to verify code at block explorer.\n",
    "3. Manually copy the transaction hash into the deployment logs for the smartLending.\n",
    "4. Double check all configs!\n",
    "5. Every new SmartLending should be seeded with an initial deposit that is never withdrawn!\n"
  );
};
