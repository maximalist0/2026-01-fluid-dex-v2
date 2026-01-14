import { prodDeployfRewards } from "./prod";
const hre = require("hardhat");

prodDeployfRewards(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
