import { BigNumber } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import { FluidDexT1Admin__factory } from "../../../typechain-types";

export const setConfigDexUpdateCenterPriceAddress = async (
  hre: HardhatRuntimeEnvironment,
  dexT1: string,
  centerPriceAddress: number,
  percent: number,
  time: number
) => {
  logDebug("-----------------------------------------\n Execute updateCenterPriceAddress() at DexT1:");

  const deployer = await deployerSigner(hre);

  logDebug(
    "(setting center price nonce, percent, time): ",
    JSON.stringify(centerPriceAddress),
    JSON.stringify(percent),
    JSON.stringify(time)
  );

  const dexT1Admin = FluidDexT1Admin__factory.connect(dexT1, deployer);
  const populatedTx = await dexT1Admin.populateTransaction.updateCenterPriceAddress(centerPriceAddress, percent, time);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidDexT1Admin__factory.abi),
    (await hre.deployments.get("DexT1Admin")).address,
    FluidDexT1Admin__factory.createInterface().getFunction("updateCenterPriceAddress").format(),
    {
      centerPriceAddress_: centerPriceAddress,
      percent_: percent,
      time_: time,
    }
  );
};
