import { prodDeployStETH } from "./prod";
const hre = require("hardhat");

prodDeployStETH(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
