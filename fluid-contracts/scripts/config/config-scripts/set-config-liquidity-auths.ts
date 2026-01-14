import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/AdminModule";
import { IFluidLiquidity__factory } from "../../../typechain-types/factories/contracts/liquidity/interfaces/iLiquidity.sol/IFluidLiquidity__factory";

export const setConfigLiquidityAuths = async (hre: HardhatRuntimeEnvironment, auths: string[]) => {
  logDebug("-----------------------------------------\n Execute updateAuths() at Liquidity:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting auths as allowed): ", JSON.stringify(auths));

  const authsWithBool: AdminModuleStructs.AddressBoolStruct[] = auths.map((auth) => ({ addr: auth, value: true }));

  const liquidity = await getLiquidityWithSigner(hre, deployer);
  const populatedTx = await liquidity.populateTransaction.updateAuths(authsWithBool);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(IFluidLiquidity__factory.abi),
    liquidity.address,
    IFluidLiquidity__factory.createInterface().getFunction("updateAuths").format(),
    {
      authsStatus_: authsWithBool,
    }
  );
};
