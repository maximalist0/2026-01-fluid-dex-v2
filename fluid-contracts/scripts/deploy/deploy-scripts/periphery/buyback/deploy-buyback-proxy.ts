import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deploy } from "../../../util";

export const deployBuybackProxy = async (hre: HardhatRuntimeEnvironment) => {
  const emptyImplementationUUPS = await hre.deployments.get("EmptyImplementationUUPS");

  // deploy proxy
  const proxyAddress = await deploy(
    hre,
    "FluidBuybackProxy",
    "contracts/periphery/buyback/proxy.sol:FluidBuybackProxy",
    "v1_0_0",
    [emptyImplementationUUPS.address, "0x"]
  );

  return proxyAddress;
};
