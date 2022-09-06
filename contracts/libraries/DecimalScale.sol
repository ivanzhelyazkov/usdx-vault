//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library DecimalScale {
    /**
     * @dev Adjust the scale of an integer
     * @param num number to scale
     * @param to decimals to scale to
     * @param from decimals to scale from
     */
    function scale(
        uint256 num,
        uint256 to,
        uint256 from
    ) internal pure returns (uint256) {
        if (to > from) {
            num = num * (10**(to - from));
        } else if (to < from) {
            num = num / (10**(from - to));
        }
        return num;
    }
}
