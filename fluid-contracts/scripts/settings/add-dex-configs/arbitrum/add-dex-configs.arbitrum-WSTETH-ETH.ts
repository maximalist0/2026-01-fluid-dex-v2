import { ChainlinkCenterPriceL2Config } from "../add-vault-configs/add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_ARBITRUM } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A DEX, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE DEX DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE DEX DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because dex logs etc. are affected by dexId, which is increased by one for each new deployment
const DEX_QUEUE_COUNTER = 0; // id 1

// token0 has to be smaller than token1
const TOKEN0 = TOKENS_ARBITRUM.WSTETH.address;
const TOKEN1 = NATIVE_TOKEN.address;
const ORACLE_MAPPING = 16384; // not used for this pool

// center price config must be a valid config from interface from see `add-vault-interfaces.ts`

// NOTE: SET CORRECT TYPE HERE WHEN CONFIGURING TO MAKE SURE CONFIG WILL BE VALID.
// if using an already deployed oracle, just set the "oracleName".
const CENTER_PRICE_CONFIG: ChainlinkCenterPriceL2Config = {
  contractName: "ChainlinkCenterPriceL2",
  centerPriceName: "ChainlinkCenterPriceL2_WSTETH_ETH",
  infoName: "ETH for 1 WSTETH",
  clParams: {
    hops: 1,
    feed1: {
      feed: "0xB1552C5e96B312d0Bf8b554186F846C40614a540", // WSTETH <> STETH (contract exchange rate)
      invertRate: false,
      token0Decimals: 18,
    },
    feed2: {
      feed: ethers.constants.AddressZero,
      invertRate: false,
      token0Decimals: 0,
    },
    feed3: {
      feed: ethers.constants.AddressZero,
      invertRate: false,
      token0Decimals: 0,
    },
  },
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
