const { deploymentFixture } = require('../fixture');
const { getTokenBalance, bn, bnDecimal, bnDecimals, increaseTime } = require('../../scripts/helpers');
const { expect } = require('chai');

// Event tests for Vault
describe('Contract: Vault', async () => {
  beforeEach(async () => {
      ({ vault, usdx, oracle, usdt, dai, usdc, tusd, admin, user1, user2 } = 
          await deploymentFixture());
      await vault.mintWithUSDT(bnDecimal(1000));
      await vault.mint(dai.address, bnDecimal(1000));
  })

  describe('Events', async () => {
    it('should emit Minted on mintWithUSDT', async () => {
      await expect(vault.mintWithUSDT(bnDecimal(1000))).to.emit(vault, 'Minted');
    }),

    it('should emit Minted on mint with a whitelisted asset', async () => {
      await expect(vault.mint(dai.address, bnDecimal(1000))).to.emit(vault, 'Minted');
    }),

    it('should emit Redeemed on redeem', async () => {
      await expect(vault.redeem(bnDecimal(1000))).to.emit(vault, 'Redeemed');
    }),

    it('should emit Redeemed on redeem for a whitelisted asset', async () => {
      await expect(vault.redeemForAsset(dai.address, bnDecimal(500))).to.emit(vault, 'Redeemed');
    }),

    it('should emit AssetWhitelisted on asset whitelist', async () => {
      await expect(vault.whitelistAsset(tusd.address)).to.emit(vault, 'AssetWhitelisted');
    }),

    it('should emit AssetDelisted on asset delist', async () => {
      await expect(vault.delistAsset(dai.address)).to.emit(vault, 'AssetDelisted');
    }),

    it('should not emit AssetWhitelisted if asset has been whitelisted already', async () => {
      let isAssetWhitelisted = await vault.isAssetWhitelisted(dai.address);
      expect(isAssetWhitelisted).to.be.eq(true);
      await expect(vault.whitelistAsset(dai.address)).not.to.emit(vault, 'AssetWhitelisted');
    }),

    it('should not emit AssetDelisted if asset has not been whitelisted', async () => {
      let isAssetWhitelisted = await vault.isAssetWhitelisted(tusd.address);
      expect(isAssetWhitelisted).to.be.eq(false);
      await expect(vault.delistAsset(tusd.address)).not.to.emit(vault, 'AssetDelisted');
    })
  })
})
