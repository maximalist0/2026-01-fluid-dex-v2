import { BigNumber } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { ERC20__factory } from "../../../typechain-types";

export const erc20Approve = async (
  hre: HardhatRuntimeEnvironment,
  token: string,
  spender: string,
  amount: BigNumber
) => {
  logDebug("-----------------------------------------\n Execute ERC20 approve():");

  const deployer = await deployerSigner(hre);

  logDebug("(setting allowance): ", JSON.stringify(amount), " for token ", token);

  const erc20 = ERC20__factory.connect(token, deployer);
  const populatedTx = await erc20.populateTransaction.approve(spender, amount);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(ERC20__factory.abi),
    token,
    ERC20__factory.createInterface().getFunction("approve").format(),
    {
      spender,
      amount,
    }
  );
};
