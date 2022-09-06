// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import {DecimalScale} from "./libraries/DecimalScale.sol";

import "./interface/IUSDX.sol";
import "./interface/IOracle.sol";

/**
 Vault
 */
contract Vault is Ownable, Pausable, ReentrancyGuard {
    using DecimalScale for uint256;
    using SafeERC20 for IERC20;

    // -- State Variables --

    IERC20 public usdt;

    IUSDX public usdx;

    IOracle public oracle;

    // Mapping of assets which have been whitelisted
    mapping(address => bool) public isAssetWhitelisted;

    // User address => asset address => amount invested
    // Amounts invested are kept with 18 decimals
    mapping(address => mapping(address => uint256)) private userInvestedAmount;

    //--------------------------------------------------------------------------
    // Initializer
    //--------------------------------------------------------------------------

    constructor(
        IERC20 _usdt,
        IUSDX _usdx,
        IOracle _oracle
    ) {
        usdt = _usdt;
        usdx = _usdx;
        oracle = _oracle;
    }

    // Events
    event Minted(address indexed user, address indexed asset, uint256 amount);
    event Redeemed(address indexed user, address indexed asset, uint256 amount);
    // Management events
    event AssetWhitelisted(address indexed asset);
    event AssetDelisted(address indexed asset);

    /* ========================================================================================= */
    /*                                            User-facing                                    */
    /* ========================================================================================= */

    /**
     * @notice mint USDX with a whitelisted asset
     * @notice user has to approve the asset amount to the vault before minting
     * @dev amount must be sent with 18 decimals
     * @param _asset address of the asset to be deposited
     * @param _amount amount to be sent of the asset being deposited
     */
    function mint(address _asset, uint256 _amount)
        external
        nonReentrant
        whenNotPaused
    {
        require(isAssetWhitelisted[_asset], "Asset is not whitelisted");
        require(
            IERC20(_asset).balanceOf(msg.sender) >= _amount,
            "Not enough balance to mint"
        );
        // price is with 18 decimals
        uint256 price = oracle.getAssetPrice(_asset);
        uint8 assetDecimals = IERC20Metadata(_asset).decimals();
        // get the price adjusted amount with 18 decimals
        uint256 priceAdjustedAmount = (price * _amount) / 1e18;
        // Transfer _amount scaled to decimals of the asset to the vault
        IERC20(_asset).safeTransferFrom(
            msg.sender,
            address(this),
            _amount.scale(assetDecimals, 18)
        );
        // Mint usdx to user
        usdx.mint(msg.sender, priceAdjustedAmount);
        // Increment user invested amount
        userInvestedAmount[msg.sender][_asset] += _amount;
        // Emit event
        emit Minted(msg.sender, _asset, _amount);
    }

    /**
     * @notice Mint USDX with USDT
     * @notice user has to approve usdt amount to the vault before minting
     * @dev amount must be sent with 18 decimals
     * @param _amount usdt amount to be sent
     */
    function mintWithUSDT(uint256 _amount) external nonReentrant whenNotPaused {
        require(
            usdt.balanceOf(msg.sender) >= _amount,
            "Not enough balance to mint"
        );
        // price is with 18 decimals
        uint256 price = oracle.getAssetPrice(address(usdt));
        // get the price adjusted amount with 18 decimals
        uint256 priceAdjustedAmount = (price * _amount) / 1e18;
        // Transfer priceAdjustedAmount scaled to usdt decimals to the vault
        usdt.safeTransferFrom(msg.sender, address(this), _amount.scale(6, 18));
        // Mint usdx to user
        usdx.mint(msg.sender, priceAdjustedAmount);
        // Increment user invested amount
        userInvestedAmount[msg.sender][address(usdt)] += _amount;
        // Emit event
        emit Minted(msg.sender, address(usdt), _amount);
    }

    /**
     * @notice Burn USDX for USDT
     * @dev amount must be sent with 18 decimals
     * @param _amount usdx amount to be burnt
     */
    function redeem(uint256 _amount) external nonReentrant whenNotPaused {
        require(balance() >= _amount, "Not enough balance to burn");
        uint256 price = oracle.getAssetPrice(address(usdt));
        // get the price adjusted amount with 18 decimals
        uint256 priceAdjustedAmount = (_amount * 1e18) / price;
        require(
            userInvestedAmount[msg.sender][address(usdt)] >=
                priceAdjustedAmount,
            "User doesn't have enough invested in the asset"
        );
        // Subtract user invested amount
        userInvestedAmount[msg.sender][address(usdt)] -= priceAdjustedAmount;
        // Burn usdx from user
        usdx.burnFrom(msg.sender, _amount);
        // Transfer priceAdjustedAmount scaled to usdt decimals to user
        usdt.safeTransfer(msg.sender, priceAdjustedAmount.scale(6, 18));
        // Emit event
        emit Redeemed(msg.sender, address(usdt), _amount);
    }

    /**
     * @notice Burn USDX for a whitelisted asset
     * @dev amount must be sent with 18 decimals
     * @param _asset asset to be redeemed
     * @param _amount usdx amount to be burnt
     */
    function redeemForAsset(address _asset, uint256 _amount)
        external
        nonReentrant
        whenNotPaused
    {
        require(balance() >= _amount, "Not enough balance to burn");
        uint256 price = oracle.getAssetPrice(_asset);
        // get the price adjusted amount with 18 decimals
        uint256 priceAdjustedAmount = (_amount * 1e18) / price;
        require(
            userInvestedAmount[msg.sender][_asset] >= priceAdjustedAmount,
            "User doesn't have enough invested in the asset"
        );
        // get asset decimals
        uint8 assetDecimals = IERC20Metadata(_asset).decimals();
        // Subtract user invested amount
        userInvestedAmount[msg.sender][_asset] -= priceAdjustedAmount;
        // Burn usdx from user
        usdx.burnFrom(msg.sender, _amount);
        // Transfer _amount scaled to asset decimals to user
        IERC20(_asset).safeTransfer(
            msg.sender,
            priceAdjustedAmount.scale(assetDecimals, 18)
        );
        // Emit event
        emit Redeemed(msg.sender, _asset, _amount);
    }

    /**
     * @notice Get user's USDX balance
     */
    function balance() public view returns (uint256 _balance) {
        return usdx.balanceOf(msg.sender);
    }

    /**
     * @notice Get invested amount in a given asset for an user
     * @param _user investor address
     * @param _asset asset address
     */
    function getInvestedAmount(address _user, address _asset)
        public
        view
        returns (uint256 amount)
    {
        return userInvestedAmount[_user][_asset];
    }

    /* ========================================================================================= */
    /*                                            Management                                     */
    /* ========================================================================================= */

    /**
     * @notice Whitelist an asset to allow minting using the vault
     * @param _asset the address of the asset to be whitelisted
     */
    function whitelistAsset(address _asset) external onlyOwner {
        if (!isAssetWhitelisted[_asset]) {
            isAssetWhitelisted[_asset] = true;
            emit AssetWhitelisted(_asset);
        }
    }

    /**
     * @notice Removes an asset from the whitelist
     * @param _asset the address of the asset to be delisted
     */
    function delistAsset(address _asset) external onlyOwner {
        if (isAssetWhitelisted[_asset]) {
            isAssetWhitelisted[_asset] = false;
            emit AssetDelisted(_asset);
        }
    }

    /**
     * @notice Pauses mint and redeem functions
     */
    function pause() external onlyOwner returns (bool) {
        _pause();
        return true;
    }


    /**
     * @notice Unpauses mint and redeem functions
     */
    function unpause() external onlyOwner returns (bool) {
        _unpause();
        return true;
    }
}
