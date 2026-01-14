import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";
import { BigNumber } from "ethers";

import { addDexConfigs, FluidVersion, NATIVE_TOKEN } from "../settings";
import { deployerSigner, getTokenSymbol, logDebug, logSuccess, TxQueue } from "../util";
import { deployDexT1 } from "../deploy/deploy-scripts";
import { FluidDexFactory__factory } from "../../typechain-types";
import {
  erc20Approve,
  setConfigDexMaxBorrowShares,
  setConfigDexMaxSupplyShares,
  setConfigDexT1Initialize,
  setConfigLiquidityUserBorrowConfig,
  setConfigLiquidityUserSupplyConfig,
} from "../config";

export const prodAddDex = async (hre: HardhatRuntimeEnvironment) => {
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

  // give the dex limits at the LL
  if (dexConfig.dex?.initializeSettings?.smartCol && !!(dexConfig.dex as any)?.token0SupplyConfig(dexT1)) {
    await setConfigLiquidityUserSupplyConfig(hre, (dexConfig.dex as any).token0SupplyConfig(dexT1));
    await setConfigLiquidityUserSupplyConfig(hre, (dexConfig.dex as any).token1SupplyConfig(dexT1));
  }
  if (dexConfig.dex?.initializeSettings?.smartDebt && !!(dexConfig.dex as any)?.token0BorrowConfig(dexT1)) {
    await setConfigLiquidityUserBorrowConfig(hre, (dexConfig.dex as any).token0BorrowConfig(dexT1));
    await setConfigLiquidityUserBorrowConfig(hre, (dexConfig.dex as any).token1BorrowConfig(dexT1));
  }

  if (!!dexConfig.dex?.initializeSettings) {
    let msgValue: BigNumber = BigNumber.from(0);
    if (dexConfig.dex?.initializeSettings?.smartCol) {
      // approve token amounts to dex for initialize

      // Calculate token0 amount from init settings
      const token0ColAmt = dexConfig.dex.initializeSettings.token0ColAmt as BigNumber;
      // Calculate token1 amount using centerPrice and add 2% buffer
      const centerPrice = dexConfig.dex.initializeSettings.centerPrice as BigNumber;
      // token1ColAmt = token0ColAmt * centerPrice / 1e27 * 1.02
      const ONE_E27 = BigInt("1000000000000000000000000000");
      let token1ColAmt = token0ColAmt.mul(centerPrice).mul(102n).div(100n).div(ONE_E27);
      // token1ColAmt is in token0Decimals now -> adjust to token1 decimals
      token1ColAmt = token1ColAmt.mul(dexConfig.TOKEN1_DECIMALS_MULTIPLIER).div(dexConfig.TOKEN0_DECIMALS_MULTIPLIER);

      // handle native token without approval accordingly sending msg.value along
      if (dexConfig.token0 != NATIVE_TOKEN.address) {
        // Approve token0 to dexT1
        await erc20Approve(hre, dexConfig.token0, dexT1, token0ColAmt);
      } else {
        msgValue.add(token0ColAmt);
      }

      if (dexConfig.token1 != NATIVE_TOKEN.address) {
        // Approve token1 to dexT1
        await erc20Approve(hre, dexConfig.token1, dexT1, token1ColAmt);
      } else {
        msgValue.add(token1ColAmt);
      }
    }

    // initialize
    await setConfigDexT1Initialize(hre, dexT1, dexConfig.dex.initializeSettings, msgValue);
  }

  // set max shares
  if (dexConfig.dex?.initializeSettings?.smartCol && !!(dexConfig.dex as any)?.maxSupplyShares) {
    await setConfigDexMaxSupplyShares(hre, dexT1, (dexConfig.dex as any)?.maxSupplyShares);
  }
  if (dexConfig.dex?.initializeSettings?.smartDebt && !!(dexConfig.dex as any)?.maxBorrowShares) {
    await setConfigDexMaxBorrowShares(hre, dexT1, (dexConfig.dex as any)?.maxBorrowShares);
  }

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
