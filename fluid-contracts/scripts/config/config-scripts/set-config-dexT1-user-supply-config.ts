import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import { FluidDexT1Admin__factory } from "../../../typechain-types";

export const setConfigDexUserSupplyConfig = async (
  hre: HardhatRuntimeEnvironment,
  dexT1: string,
  userSupplyConfig: AdminModuleStructs.UserSupplyConfigStruct
) => {
  logDebug("-----------------------------------------\n Execute updateUserSupplyConfigs() at DexT1:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting user supply config): ", JSON.stringify(userSupplyConfig));

  const dexT1Admin = FluidDexT1Admin__factory.connect(dexT1, deployer);
  const populatedTx = await dexT1Admin.populateTransaction.updateUserSupplyConfigs([userSupplyConfig]);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidDexT1Admin__factory.abi),
    (await hre.deployments.get("DexT1Admin")).address,
    FluidDexT1Admin__factory.createInterface().getFunction("updateUserSupplyConfigs").format(),
    {
      userSupplyConfigs_: [userSupplyConfig],
    }
  );
};
