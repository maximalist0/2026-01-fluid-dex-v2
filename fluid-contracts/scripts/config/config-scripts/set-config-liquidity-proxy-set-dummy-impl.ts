import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { IFluidLiquidity__factory } from "../../../typechain-types/factories/contracts/liquidity/interfaces/iLiquidity.sol/IFluidLiquidity__factory";

export const setConfigLiquidityProxySetDummyImplementation = async (
  hre: HardhatRuntimeEnvironment,
  implementation: string
) => {
  logDebug("-----------------------------------------\n Execute setDummyImplementation() at Liquidity Proxy:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting implementation): ", implementation);

  const liquidity = await getLiquidityWithSigner(hre, deployer);

  const populatedTx = await liquidity.populateTransaction.setDummyImplementation(implementation);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(IFluidLiquidity__factory.abi),
    liquidity.address,
    IFluidLiquidity__factory.createInterface().getFunction("setDummyImplementation").format(),
    {
      newDummyImplementation_: implementation,
    }
  );
};
