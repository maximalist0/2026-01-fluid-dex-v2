import { prodDeployPeriphery } from "./prod";
const hre = require("hardhat");

prodDeployPeriphery(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
