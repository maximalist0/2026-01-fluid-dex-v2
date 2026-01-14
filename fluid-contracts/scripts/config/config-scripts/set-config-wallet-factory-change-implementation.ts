import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidWalletFactory__factory } from "../../../typechain-types";

export const setConfigFluidWalletFactoryChangeImplementation = async (
  hre: HardhatRuntimeEnvironment,
  implementation: string
) => {
  logDebug("-----------------------------------------\n Execute changeImplementation() at WalletFactory:");

  logDebug("(setting implementation to): ", implementation);

  const proxyAddress = (await hre.deployments.get("FluidWalletFactoryProxy")).address;
  const walletFactory = FluidWalletFactory__factory.connect(proxyAddress, await deployerSigner(hre));

  // set implementation address
  // function changeImplementation(address implementation_) public onlyOwner {

  const populatedTx = await walletFactory.populateTransaction.changeImplementation(implementation);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidWalletFactory__factory.abi),
    walletFactory.address,
    FluidWalletFactory__factory.createInterface().getFunction("changeImplementation").format(),
    {
      implementation_: implementation,
    }
  );
};
