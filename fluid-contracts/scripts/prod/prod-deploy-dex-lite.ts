import { prodDeployFluidDexLite } from "./prod-deploy-fluid-dex-lite";
import { prodDeployFluidDexLiteAdminModule } from "./prod-deploy-fluid-dex-lite-admin-module";

export const prodDeployDexLiteBoth = async () => {
  console.log("Production DexLite contracts deployment (Both contracts)");

  // Deploy FluidDexLite
  const dexLiteAddress = await prodDeployFluidDexLite();

  // Deploy FluidDexLiteAdminModule
  const dexLiteAdminModuleAddress = await prodDeployFluidDexLiteAdminModule();

  return {
    fluidDexLite: dexLiteAddress,
    fluidDexLiteAdminModule: dexLiteAdminModuleAddress
  };
};

// Allow running directly
if (require.main === module) {
  prodDeployDexLiteBoth().catch((error: any) => {
    console.error(error);
    process.exitCode = 1;
  });
} 