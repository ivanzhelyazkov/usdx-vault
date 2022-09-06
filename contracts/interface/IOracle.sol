//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IOracle {
    function getAssetPrice(address _asset) external returns (uint256 price);
}
