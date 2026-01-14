import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/AdminModule";
import { IFluidLiquidity__factory } from "../../../typechain-types/factories/contracts/liquidity/interfaces/iLiquidity.sol/IFluidLiquidity__factory";

export const setConfigLiquidityUserSupplyConfig = async (
  hre: HardhatRuntimeEnvironment,
  userSupplyConfig: AdminModuleStructs.UserSupplyConfigStruct
) => {
  logDebug("-----------------------------------------\n Execute updateUserSupplyConfigs() at Liquidity:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting user supply config): ", JSON.stringify(userSupplyConfig));

  const liquidity = await getLiquidityWithSigner(hre, deployer);
  const populatedTx = await liquidity.populateTransaction.updateUserSupplyConfigs([userSupplyConfig]);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(IFluidLiquidity__factory.abi),
    liquidity.address,
    IFluidLiquidity__factory.createInterface().getFunction("updateUserSupplyConfigs").format(),
    {
      userSupplyConfigs_: [userSupplyConfig],
    }
  );
};
