import { HardhatRuntimeEnvironment } from "hardhat/types";

import { GOVERNANCE } from "../../../settings/core-configs/core-configs";
import { deployerAddress } from "../../../util";
import { deploy } from "../../util";

export const deployEmptyImplementationUUPSDeployer = async (hre: HardhatRuntimeEnvironment) => {
  const deployer = await deployerAddress(hre);

  // deploy empty UUPS logic contract
  const emptyImplementationUUPS = await deploy(
    hre,
    "EmptyImplementationUUPSDeployer_" + deployer,
    "contracts/mocks/emptyImplementationUUPS.sol:EmptyImplementationUUPS",
    "v1_0_0",
    [deployer]
  );

  return emptyImplementationUUPS;
};
