import { BigNumber, ethers } from "ethers";
import { Structs as AdminModuleStructs } from "../../typechain-types/contracts/liquidity/adminModule/main.sol/AdminModule";

export const throwIfAddressZero = (addressToCheck: string, errorPlaceIdentifier: string): string => {
  if (!addressToCheck || addressToCheck === ethers.constants.AddressZero) {
    throw new Error("ADDRESS IS ZERO: " + errorPlaceIdentifier);
  }

  return addressToCheck;
};

export const throwIfNumberZeroOrAboveMax = (
  valueToCheck: number,
  maxValue: number,
  errorPlaceIdentifier: string
): number => {
  if (valueToCheck === 0) {
    throw new Error("VALUE IS ZERO: " + errorPlaceIdentifier);
  }
  if (valueToCheck > maxValue) {
    throw new Error("VALUE IS ABOVE MAX: " + errorPlaceIdentifier);
  }

  return valueToCheck;
};

export const throwIfBigNumberZeroOrAboveMax = (
  valueToCheck: BigNumber,
  maxValue: number,
  errorPlaceIdentifier: string
): BigNumber => {
  if (valueToCheck.eq(0)) {
    throw new Error("VALUE IS ZERO: " + errorPlaceIdentifier);
  }
  if (valueToCheck.gt(maxValue)) {
    throw new Error("VALUE IS ABOVE MAX: " + errorPlaceIdentifier);
  }

  return valueToCheck;
};

export const throwIfInvalidBorrowConfig = (
  borrowConfig: AdminModuleStructs.UserBorrowConfigStruct,
  errorPlaceIdentifier: string
): AdminModuleStructs.UserBorrowConfigStruct => {
  throwIfAddressZero(borrowConfig.user as string, errorPlaceIdentifier + " Borrow Config user address");
  throwIfAddressZero(borrowConfig.token as string, errorPlaceIdentifier + " Borrow Config token address");

  if (borrowConfig.mode != 0 && borrowConfig.mode != 1) {
    throw new Error("BORROW CONFIG INTEREST MODE INVALID: " + errorPlaceIdentifier);
  }

  // todo could do more validations here to avoid reverts...

  return borrowConfig;
};
