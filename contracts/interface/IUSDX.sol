// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Interface of USDX
 */
interface IUSDX is IERC20 {
    /// @notice Mints USDX tokens in exchange for provided tokens to USDX instance
    /// @param _recipient (address) address to send the SCLR tokens to
    /// @param _amount (uint256) USDX tokens amount to be minted
    /// @return  (bool) indicates a successful operation
    function mint(address _recipient, uint256 _amount) external returns (bool);

    /// @notice Burns USDX tokens as indicated
    /// @param _sender (address) address to burn USDX tokens from
    /// @param _amount (uint256) USDX token amount to be burned
    /// @return  (bool) indicates a successful operation
    function burnFrom(address _sender, uint256 _amount) external returns (bool);
}
