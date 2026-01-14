import { prodDeployFToken } from "./prod/prod-deploy-fToken";
const hre = require("hardhat");

prodDeployFToken(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
