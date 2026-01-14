import { prodDeployCappedRate } from "./prod";
const hre = require("hardhat");

prodDeployCappedRate(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
