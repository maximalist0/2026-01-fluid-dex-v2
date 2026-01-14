import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, getLiquidityWithSigner, logDebug, TxQueue } from "../../util";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/AdminModule";
import { IFluidLiquidity__factory } from "../../../typechain-types/factories/contracts/liquidity/interfaces/iLiquidity.sol/IFluidLiquidity__factory";

export const setConfigLiquidityTokenRateV2 = async (
  hre: HardhatRuntimeEnvironment,
  rateData: AdminModuleStructs.RateDataV2ParamsStruct
) => {
  logDebug("-----------------------------------------\n Execute updateRateDataV2s() at Liquidity:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting token rate data): ", JSON.stringify(rateData));

  const liquidity = await getLiquidityWithSigner(hre, deployer);
  const populatedTx = await liquidity.populateTransaction.updateRateDataV2s([rateData]);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(IFluidLiquidity__factory.abi),
    liquidity.address,
    IFluidLiquidity__factory.createInterface().getFunction("updateRateDataV2s").format(),
    {
      tokensRateData_: [rateData],
    }
  );
};
