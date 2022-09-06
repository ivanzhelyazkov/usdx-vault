//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDX is Initializable, ERC20 {
    address public vault;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    // We use initialize to set the vault instance
    function initialize(address _vault) external initializer {
        vault = _vault;
    }

    /**
     * @notice Mints USDX tokens in exchange for provided tokens to USDX instance
     * @param _recipient (address) address to send the USDX tokens to
     * @param _amount (uint256) USDX tokens amount to be minted
     * @return (bool) indicates a successful operation
     */
    function mint(address _recipient, uint256 _amount)
        external
        onlyVault
        returns (bool)
    {
        _mint(_recipient, _amount);
        return true;
    }

    /**
     * @notice Burns USDX tokens as indicated
     * @param _sender (address) address to burn USDX tokens from
     * @param _amount (uint256) USDX token amount to be burned
     * @return (bool) indicates a successful operation
     */
    function burnFrom(address _sender, uint256 _amount)
        external
        onlyVault
        returns (bool)
    {
        _burn(_sender, _amount);
        return true;
    }

    /**
     * @dev Helps to perform actions meant to be executed by the Vault
     */
    modifier onlyVault() {
        require(msg.sender == vault, "Only vault may perform this action");
        _;
    }
}
