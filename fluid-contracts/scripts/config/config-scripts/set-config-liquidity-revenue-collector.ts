import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { IFluidLiquidity__factory } from "../../../typechain-types/factories/contracts/liquidity/interfaces/iLiquidity.sol/IFluidLiquidity__factory";

export const setConfigLiquidityRevenueCollector = async (hre: HardhatRuntimeEnvironment, revenueCollector: string) => {
  logDebug("-----------------------------------------\n Execute updateRevenueCollector() at Liquidity:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting revenueCollector): ", revenueCollector);

  const liquidity = await getLiquidityWithSigner(hre, deployer);
  const populatedTx = await liquidity.populateTransaction.updateRevenueCollector(revenueCollector);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(IFluidLiquidity__factory.abi),
    liquidity.address,
    IFluidLiquidity__factory.createInterface().getFunction("updateRevenueCollector").format(),
    {
      revenueCollector_: revenueCollector,
    }
  );
};
