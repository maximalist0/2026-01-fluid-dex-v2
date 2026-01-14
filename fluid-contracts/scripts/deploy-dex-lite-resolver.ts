import { deployDexLiteResolver } from "./deploy/deploy-scripts/resolvers/deploy-dex-lite-resolver";
const hre = require("hardhat");

deployDexLiteResolver(hre, "v1_0_0").catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});