import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deploy } from "../../../util";

export const deployFluidWalletFactoryProxy = async (hre: HardhatRuntimeEnvironment) => {
  const emptyImplementationUUPS = await hre.deployments.get("EmptyImplementationUUPS");

  // deploy proxy
  const proxyAddress = await deploy(
    hre,
    "FluidWalletFactoryProxy",
    "contracts/periphery/wallet/factory/proxy.sol:FluidWalletFactoryProxy",
    "v1_0_0",
    [emptyImplementationUUPS.address, "0x"]
  );

  return proxyAddress;
};
