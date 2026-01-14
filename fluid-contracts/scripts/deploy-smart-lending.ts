import { deploySmartLending } from "./prod";
const hre = require("hardhat");

deploySmartLending(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
