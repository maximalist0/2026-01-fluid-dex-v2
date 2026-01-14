import { BigNumber } from "ethers";

import { GenericCenterPriceConfig, GenericOracleSourceType } from "../add-vault-configs/add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_POLYGON } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A DEX, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE DEX DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE DEX DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because dex logs etc. are affected by dexId, which is increased by one for each new deployment
const DEX_QUEUE_COUNTER = 1; // id 2

// token0 has to be smaller than token1
const TOKEN0 = NATIVE_TOKEN.address;
const TOKEN1 = TOKENS_POLYGON.MATICX.address;

const ORACLE_MAPPING = 5852; // 5852 on Polygon (~2.1s block time) to be consistent ~1 day everywhere

// center price config must be a valid config from interface from see `add-vault-interfaces.ts`

// NOTE: SET CORRECT TYPE HERE WHEN CONFIGURING TO MAKE SURE CONFIG WILL BE VALID.
// if using an already deployed oracle, just set the "oracleName".
const CENTER_PRICE_CONFIG: GenericCenterPriceConfig = {
  contractName: "FluidGenericCenterPrice",
  centerPriceName: "GenericCenterPrice_POL_MATICX",
  infoName: "MATICX for 1 POL",
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0", // MATIC<>USD: https://data.chain.link/feeds/polygon/mainnet/matic-usd
      invertRate: false,
      multiplier: BigNumber.from(10).pow(9), // scale POL to e27 (+9)
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x5d37E4b374E6907de8Fc7fb33EE3b0af403C7403", // MATICX<>USD: https://data.chain.link/feeds/polygon/mainnet/calculated-maticx-usd
      invertRate: true,
      multiplier: BigNumber.from(10).pow(9), // scale MATICX to e27 (+9)
      divisor: 1,
    },
  ],
};

//#region no changes needed below, just for exporting to use in scripts
// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const addDexConfigs = () => ({
  addToDexIdCounter: DEX_QUEUE_COUNTER,
  token0: TOKEN0,
  token1: TOKEN1,
  oracleMapping: ORACLE_MAPPING,
  centerPrice: CENTER_PRICE_CONFIG,
});
//#endregion
