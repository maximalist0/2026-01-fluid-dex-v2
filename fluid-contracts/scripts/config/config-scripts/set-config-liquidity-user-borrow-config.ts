import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/AdminModule";
import { IFluidLiquidity__factory } from "../../../typechain-types/factories/contracts/liquidity/interfaces/iLiquidity.sol/IFluidLiquidity__factory";

export const setConfigLiquidityUserBorrowConfig = async (
  hre: HardhatRuntimeEnvironment,
  userBorrowConfig: AdminModuleStructs.UserBorrowConfigStruct
) => {
  logDebug("-----------------------------------------\n Execute updateUserBorrowConfigs() at Liquidity:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting user Borrow config): ", JSON.stringify(userBorrowConfig));

  const liquidity = await getLiquidityWithSigner(hre, deployer);
  const populatedTx = await liquidity.populateTransaction.updateUserBorrowConfigs([userBorrowConfig]);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(IFluidLiquidity__factory.abi),
    liquidity.address,
    IFluidLiquidity__factory.createInterface().getFunction("updateUserBorrowConfigs").format(),
    {
      userBorrowConfigs_: [userBorrowConfig],
    }
  );
};
