import { prodDeployVault } from "./prod";
const hre = require("hardhat");

prodDeployVault(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
