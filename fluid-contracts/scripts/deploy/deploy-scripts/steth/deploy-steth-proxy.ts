import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deploy } from "../../util";

export const deployStETHProxy = async (hre: HardhatRuntimeEnvironment) => {
  const emptyImplementationUUPS = await hre.deployments.get("EmptyImplementationUUPS");

  // deploy proxy
  const proxyAddress = await deploy(
    hre,
    "StETHQueueProxy",
    "contracts/protocols/steth/proxy.sol:FluidStETHQueueProxy",
    "v1_0_0",
    [emptyImplementationUUPS.address, "0x"]
  );

  return proxyAddress;
};
