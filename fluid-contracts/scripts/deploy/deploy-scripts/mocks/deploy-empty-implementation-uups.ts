import { HardhatRuntimeEnvironment } from "hardhat/types";

import { GOVERNANCE } from "../../../settings/core-configs/core-configs";
import { deploy } from "../../util";

export const deployEmptyImplementationUUPS = async (hre: HardhatRuntimeEnvironment) => {
  // deploy empty UUPS logic contract
  const emptyImplementationUUPS = await deploy(
    hre,
    "EmptyImplementationUUPS",
    "contracts/mocks/emptyImplementationUUPS.sol:EmptyImplementationUUPS",
    "v1_0_0",
    [GOVERNANCE]
  );

  return emptyImplementationUUPS;
};
