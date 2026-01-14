import { deployDexLiteResolver } from "../deploy/deploy-scripts";
import hre from "hardhat";

import { logSuccess } from "../util";

export const prodDeployFluidDexLiteResolver = async () => {
  console.log("Production FluidDexLiteResolver contract deployment");

  // Deploy FluidDexLiteResolver
  const dexLiteResolverAddress = await deployDexLiteResolver(hre, "v1_0_0");
  logSuccess("FluidDexLiteResolver deployed at: ", dexLiteResolverAddress);

  return dexLiteResolverAddress;
};

// Allow running directly
if (require.main === module) {
  prodDeployFluidDexLiteResolver()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}