import { deployDexLiteAdminModule } from "../deploy/deploy-scripts";
import hre from "hardhat";

import { logSuccess } from "../util";

export const prodDeployFluidDexLiteAdminModule = async () => {
  console.log("Production FluidDexLiteAdminModule contract deployment");

  // Deploy FluidDexLiteAdminModule
  const dexLiteAdminModuleAddress = await deployDexLiteAdminModule(hre, "v1_0_0");
  logSuccess("FluidDexLiteAdminModule deployed at: ", dexLiteAdminModuleAddress);

  return dexLiteAdminModuleAddress;
};

// Allow running directly
if (require.main === module) {
  prodDeployFluidDexLiteAdminModule().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
} 