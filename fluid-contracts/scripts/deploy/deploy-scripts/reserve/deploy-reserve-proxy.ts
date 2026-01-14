import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deploy } from "../../util";

export const deployReserveProxy = async (hre: HardhatRuntimeEnvironment) => {
  const emptyImplementationUUPS = await hre.deployments.get("EmptyImplementationUUPS");

  // deploy proxy
  const proxyAddress = await deploy(
    hre,
    "ReserveContractProxy",
    "contracts/reserve/proxy.sol:FluidReserveContractProxy",
    "v1_0_0",
    [emptyImplementationUUPS.address, "0x"]
  );

  return proxyAddress;
};
