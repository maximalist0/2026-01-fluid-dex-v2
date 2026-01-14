import { prodDeployOracle } from "./prod";
const hre = require("hardhat");

prodDeployOracle(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
