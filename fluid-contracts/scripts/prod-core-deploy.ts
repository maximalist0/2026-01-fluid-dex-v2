import { prodDeployCore } from "./prod";
const hre = require("hardhat");

prodDeployCore(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
