import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/AdminModule";
import { IFluidLiquidity__factory } from "../../../typechain-types/factories/contracts/liquidity/interfaces/iLiquidity.sol/IFluidLiquidity__factory";

export const setConfigLiquidityTokenConfig = async (
  hre: HardhatRuntimeEnvironment,
  tokenConfig: AdminModuleStructs.TokenConfigStruct
) => {
  logDebug("-----------------------------------------\n Execute updateTokenConfigs() at Liquidity:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting token config): ", JSON.stringify(tokenConfig));

  const liquidity = await getLiquidityWithSigner(hre, deployer);
  const populatedTx = await liquidity.populateTransaction.updateTokenConfigs([tokenConfig]);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(IFluidLiquidity__factory.abi),
    liquidity.address,
    IFluidLiquidity__factory.createInterface().getFunction("updateTokenConfigs").format(),
    {
      tokenConfigs_: [tokenConfig],
    }
  );
};
