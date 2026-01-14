import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getContractFunctionSigs, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { IFluidLiquidity__factory } from "../../../typechain-types/factories/contracts/liquidity/interfaces/iLiquidity.sol/IFluidLiquidity__factory";

export const setConfigLiquidityProxyAddImplementation = async (
  hre: HardhatRuntimeEnvironment,
  implementation: string,
  contractInterface: ethers.utils.Interface
) => {
  logDebug("-----------------------------------------\n Execute addImplementation() at Liquidity Proxy:");

  const deployer = await deployerSigner(hre);

  // get all implementation sigs
  const sigs = getContractFunctionSigs(contractInterface);

  logDebug("(setting implementation, sigs): ", implementation, sigs);

  const liquidity = await getLiquidityWithSigner(hre, deployer);

  const populatedTx = await liquidity.populateTransaction.addImplementation(implementation, sigs);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(IFluidLiquidity__factory.abi),
    liquidity.address,
    IFluidLiquidity__factory.createInterface().getFunction("addImplementation").format(),
    {
      implementation_: implementation,
      sigs_: sigs,
    }
  );
};
