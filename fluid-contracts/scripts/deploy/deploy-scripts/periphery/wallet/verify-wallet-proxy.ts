import { HardhatRuntimeEnvironment } from "hardhat/types";

import { verify } from "../../../../util";

export const verifyFluidWallet = async (hre: HardhatRuntimeEnvironment, deployedAddress: string) => {
  const fluidWalletFactoryProxy = await hre.deployments.get("FluidWalletFactoryProxy");

  const name = "FluidWallet";
  const fullyQualifiedName = "contracts/periphery/wallet/wallet/proxy.sol:FluidWallet";

  // verify contract at block explorer of current network
  await verify(hre, name, fullyQualifiedName, deployedAddress, [fluidWalletFactoryProxy.address]);
};
