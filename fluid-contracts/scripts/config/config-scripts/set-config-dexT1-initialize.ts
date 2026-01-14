import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidDexT1Admin__factory } from "../../../typechain-types";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/protocols/dex/poolT1/adminModule/main.sol/FluidDexT1Admin";
import { BigNumber } from "ethers";

export const setConfigDexT1Initialize = async (
  hre: HardhatRuntimeEnvironment,
  dexT1: string,
  initializeSettings: AdminModuleStructs.InitializeVariablesStruct,
  msgValue: BigNumber
) => {
  logDebug("-----------------------------------------\n Execute initialize() at DexT1:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting initialize configs): ", JSON.stringify(initializeSettings), " for dexT1: ", dexT1);

  const dexT1Admin = FluidDexT1Admin__factory.connect(dexT1, deployer);
  const populatedTx = await dexT1Admin.populateTransaction.initialize(initializeSettings, { value: msgValue });

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidDexT1Admin__factory.abi),
    (await hre.deployments.get("DexT1Admin")).address,
    FluidDexT1Admin__factory.createInterface().getFunction("initialize").format(),
    {
      i_: initializeSettings,
    }
  );
};
