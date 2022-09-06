//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Oracle {
    mapping(address => uint256) assetPrice;

    /**
     * @dev get price for a given asset
     * @dev price is returned with 18 decimals
     */
    function getAssetPrice(address _asset)
        external
        view
        returns (uint256 price)
    {
        return assetPrice[_asset];
    }

    /**
     * @dev set price for a given asset
     * @dev price should be with 18 decimals
     */
    function setAssetPrice(address _asset, uint256 price) external {
        assetPrice[_asset] = price;
    }
}
