import { prodDeployDex } from "./prod";
const hre = require("hardhat");

prodDeployDex(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
