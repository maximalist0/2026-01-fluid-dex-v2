import { BigNumber } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import { FluidDexT1Admin__factory } from "../../../typechain-types";

export const setConfigDexRangePercents = async (
  hre: HardhatRuntimeEnvironment,
  dexT1: string,
  upperPercent: number,
  lowerPercent: number,
  shiftTime: number
) => {
  logDebug("-----------------------------------------\n Execute updateRangePercents() at DexT1:");

  const deployer = await deployerSigner(hre);

  logDebug(
    `(setting range percents): upperPercent=${upperPercent}, lowerPercent=${lowerPercent}, shiftTime=${shiftTime}`
  );

  const dexT1Admin = FluidDexT1Admin__factory.connect(dexT1, deployer);
  const populatedTx = await dexT1Admin.populateTransaction.updateRangePercents(upperPercent, lowerPercent, shiftTime);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidDexT1Admin__factory.abi),
    (await hre.deployments.get("DexT1Admin")).address,
    FluidDexT1Admin__factory.createInterface().getFunction("updateRangePercents").format(),
    {
      upperPercent_: upperPercent,
      lowerPercent_: lowerPercent,
      shiftTime_: shiftTime,
    }
  );
};
