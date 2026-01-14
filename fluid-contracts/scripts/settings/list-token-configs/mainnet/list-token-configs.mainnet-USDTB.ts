import { TOKENS_MAINNET } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR DEPLOYING AN FTOKEN, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

const IS_FTOKEN_NATIVE = false; // only true for WETH
const TOKEN = TOKENS_MAINNET.USDTB.address;

//#region no changes needed below, just for exporting to use in scripts
// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const listTokenConfigs = () => ({
  token: TOKEN,
  lending: {
    isNativeUnderlying: IS_FTOKEN_NATIVE,
  },
});
//#endregion
