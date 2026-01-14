import { prodDeployCustom } from "./prod";
const hre = require("hardhat");

prodDeployCustom(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
