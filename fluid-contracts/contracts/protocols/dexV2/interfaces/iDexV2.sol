// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

interface IFluidDexV2 {
    function startOperation(bytes calldata data_) external returns (bytes memory result_);

    function operate(
        uint256 dexType_,
        uint256 implementationId_,
        bytes memory data_
    ) external returns (bytes memory returnData_);

    function operateAdmin(
        uint256 dexType_,
        uint256 implementationId_,
        bytes memory data_
    ) external returns (bytes memory returnData_);

    function settle(
        address token_,
        int256 supplyAmount_,
        int256 borrowAmount_,
        int256 storeAmount_,
        address to_,
        bool isCallback_
    ) external payable;

    function readFromStorage(bytes32 slot_) external view returns (uint256 result_);    

    function readFromTransientStorage(bytes32 slot_) external view returns (uint256 result_);
}