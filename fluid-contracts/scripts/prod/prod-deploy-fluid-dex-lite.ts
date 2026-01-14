import { deployDexLite } from "../deploy/deploy-scripts";
import hre from "hardhat";

import { logSuccess } from "../util";

export const prodDeployFluidDexLite = async () => {
  console.log("Production FluidDexLite contract deployment");

  // Deploy FluidDexLite
  const dexLiteAddress = await deployDexLite(hre, "v1_0_0");
  logSuccess("FluidDexLite deployed at: ", dexLiteAddress);

  return dexLiteAddress;
};

// Allow running directly
if (require.main === module) {
  prodDeployFluidDexLite().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
} 