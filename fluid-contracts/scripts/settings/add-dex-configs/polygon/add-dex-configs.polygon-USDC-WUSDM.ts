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
const DEX_QUEUE_COUNTER = 2; // id 3

// token0 has to be smaller than token1
const TOKEN0 = TOKENS_POLYGON.USDC.address;
const TOKEN1 = TOKENS_POLYGON.WUSDM.address;

const ORACLE_MAPPING = 5852; // 5852 on Polygon (~2.1s block time) to be consistent ~1 day everywhere

// center price config must be a valid config from interface from see `add-vault-interfaces.ts`

// NOTE: SET CORRECT TYPE HERE WHEN CONFIGURING TO MAKE SURE CONFIG WILL BE VALID.
// if using an already deployed oracle, just set the "oracleName".
const CENTER_PRICE_CONFIG: GenericCenterPriceConfig = {
  contractName: "FluidGenericCenterPrice",
  centerPriceName: "GenericCenterPrice_USDC_WUSDM",
  infoName: "WUSDM for 1 USDC",
  sources: [
    {
      sourceType: GenericOracleSourceType.ERC4626,
      source: "0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812", // WUSDM contract https://polygonscan.com/address/0x57f5e098cad7a3d1eed53991d4d66c45c9af7812#readProxyContract
      invertRate: true, // invert as we want WUSDM per USDC
      multiplier: 1, // ERC4626 is scaled to 1e27, center price we ALWAYS want at e27 scaling no matter the token decimals
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
