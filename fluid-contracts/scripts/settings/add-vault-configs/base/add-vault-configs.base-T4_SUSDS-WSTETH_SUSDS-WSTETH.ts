import { VAULT_TYPE } from "../config-utils";
import { DexSmartT4CLOracleConfig, DexSmartT4CLOracleL2Config } from "./add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_BASE } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0; // id 20

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_BASE.DEX_SUSDS_WSTETH.address;

const BORROW_TOKEN = TOKENS_BASE.DEX_SUSDS_WSTETH.address;

const ORACLE_CONFIG: DexSmartT4CLOracleL2Config = {
  oracleName: "DexSmartT4CLOracleL2_SUSDS-WSTETH",
  contractName: "DexSmartT4CLOracleL2",
  infoName: "SUSDS/WSTETH dbtSh. / 1 colSh.",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in WSTETH
    infoName: "SUSDS/WSTETH dbtSh. / 1 colSh.",
    reservesConversion: {
      hops: 3,
      feed1: {
        feed: "0x026a5B6114431d8F3eF2fA0E1B2EDdDccA9c540E", // SUSDS <> USDS Contract rate via Chainlink interface, returns rate in e27!!
        invertRate: false,
        token0Decimals: 27,
      },
      feed2: {
        feed: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70", // ETH <> USD
        invertRate: true,
        token0Decimals: 18,
      },
      feed3: {
        feed: "0x43a5C292A453A3bF3606fa856197f09D7B74251a", // WSTETH <> ETH
        invertRate: true,
        token0Decimals: 18,
      },
    },
    reservesConversionPriceMultiplier: 1,
    reservesConversionPriceDivisor: 1e10, // USD -> USDS
    // diff between WSTETH and shares decimal, adjusting final price (already quoting in WSTETH so no decimals diff):
    resultMultiplier: 1,
    resultDivisor: 1,
  },
};

//#region no changes needed below, just for exporting to use in scripts
// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const addVaultConfigs = () => ({
  vaultType: VAULTTYPE,
  addToVaultIdCounter: VAULT_QUEUE_COUNTER,
  supplyToken: SUPPLY_TOKEN,
  borrowToken: BORROW_TOKEN,
  oracle: ORACLE_CONFIG,
});
//#endregion
