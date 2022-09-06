const { deploymentFixture } = require('../fixture');
const { bn, bnDecimal, bnDecimals, increaseTime } = require('../../scripts/helpers');
const { expect } = require('chai');

// Ownership tests for Vault
describe('Contract: Vault', async () => {
  beforeEach(async () => {
      ({ vault, usdx, oracle, usdt, dai, usdc, tusd, admin, user1, user2 } = 
          await deploymentFixture());
  })

  describe('Ownership', async () => {
    it('admin should be able to whitelist asset in Vault', async () => {
      let isTUSDWhitelisted = await vault.isAssetWhitelisted(tusd.address);
      expect(isTUSDWhitelisted).to.be.eq(false);
      await vault.whitelistAsset(tusd.address);
      isTUSDWhitelisted = await vault.isAssetWhitelisted(tusd.address);
      expect(isTUSDWhitelisted).to.be.eq(true);
    }),

    it('admin should be able to delist asset in Vault', async () => {
      let isDAIWhitelisted = await vault.isAssetWhitelisted(dai.address);
      expect(isDAIWhitelisted).to.be.eq(true);
      await vault.delistAsset(dai.address);
      isDAIWhitelisted = await vault.isAssetWhitelisted(dai.address);
      expect(isDAIWhitelisted).to.be.eq(false);
    }),

    it('admin should be able to pause mint and redeem in Vault', async () => {
      let isPaused = await vault.paused();
      expect(isPaused).to.be.eq(false);
      await vault.pause();
      isPaused = await vault.paused();
      expect(isPaused).to.be.eq(true);
    }),

    it('admin should be able to unpause mint and redeem in Vault', async () => {
      let isPaused = await vault.paused();
      expect(isPaused).to.be.eq(false);
      await vault.pause();
      await vault.unpause();
      isPaused = await vault.paused();
      expect(isPaused).to.be.eq(false);
    }),

    it('other users shouln\'t be able to whitelist asset in Vault', async () => {
      await expect(vault.connect(user1).whitelistAsset(dai.address)).
        to.be.revertedWith('Ownable: caller is not the owner');
      await expect(vault.connect(user2).whitelistAsset(dai.address)).
        to.be.revertedWith('Ownable: caller is not the owner');
    }),

    it('other users shouln\'t be able to delist asset in Vault', async () => {
      await expect(vault.connect(user1).delistAsset(dai.address)).
        to.be.revertedWith('Ownable: caller is not the owner');
      await expect(vault.connect(user2).delistAsset(dai.address)).
        to.be.revertedWith('Ownable: caller is not the owner');
    })

    it('other users should\'t be able to pause mint and redeem in Vault', async () => {
      await expect(vault.connect(user1).pause()).
        to.be.revertedWith('Ownable: caller is not the owner');
      await expect(vault.connect(user1).unpause()).
        to.be.revertedWith('Ownable: caller is not the owner');
    })
  })
})
