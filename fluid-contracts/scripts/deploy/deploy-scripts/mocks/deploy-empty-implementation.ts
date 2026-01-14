import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deploy } from "../../util";

export const deployEmptyImplementation = async (hre: HardhatRuntimeEnvironment) => {
  // deploy empty logic contract
  const emptyImplementation = await deploy(
    hre,
    "EmptyImplementation",
    "contracts/mocks/emptyImplementation.sol:EmptyImplementation",
    "v1_0_0",
    []
  );

  return emptyImplementation;
};
