import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/AdminModule";
import { IFluidLiquidity__factory } from "../../../typechain-types/factories/contracts/liquidity/interfaces/iLiquidity.sol/IFluidLiquidity__factory";

export const setConfigLiquidityGuardians = async (hre: HardhatRuntimeEnvironment, guardians: string[]) => {
  logDebug("-----------------------------------------\n Execute updateGuardians() at Liquidity:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting guardians as allowed): ", JSON.stringify(guardians));

  const guardiansWithBool: AdminModuleStructs.AddressBoolStruct[] = guardians.map((guardian) => ({
    addr: guardian,
    value: true,
  }));

  const liquidity = await getLiquidityWithSigner(hre, deployer);
  const populatedTx = await liquidity.populateTransaction.updateGuardians(guardiansWithBool);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(IFluidLiquidity__factory.abi),
    liquidity.address,
    IFluidLiquidity__factory.createInterface().getFunction("updateGuardians").format(),
    {
      guardiansStatus_: guardiansWithBool,
    }
  );
};
