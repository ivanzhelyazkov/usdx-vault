const { deploymentFixture } = require('../fixture');
const { getTokenBalance, bn, bnDecimal, bnDecimals, increaseTime } = require('../../scripts/helpers');
const { expect } = require('chai');

// Mint tests for Vault
describe('Contract: Vault', async () => {
  beforeEach(async () => {
      ({ vault, usdx, oracle, usdt, dai, usdc, tusd, admin, user1, user2 } = 
          await deploymentFixture());
  })

  describe('Mint', async () => {
    it('should be able to mint usdx with usdt', async () => {
      let usdxBalanceBefore = await usdx.balanceOf(admin.address);
      await vault.mintWithUSDT(bnDecimal(1000));
      let usdxBalanceAfter = await usdx.balanceOf(admin.address);
      expect(usdxBalanceAfter).to.be.gt(usdxBalanceBefore);
    }),

    it('user should send `mintAmount` usdt adjusted for decimals on mintWithUSDT', async () => {
      let usdtBalanceBefore = await usdt.balanceOf(admin.address);
      let mintAmount = bnDecimal(1000);
      await vault.mintWithUSDT(mintAmount);
      let usdtBalanceAfter = await usdt.balanceOf(admin.address);
      let usdtSent = usdtBalanceBefore.sub(usdtBalanceAfter);
      // Expected amount sent should be adjusted for decimals
      let expectedUSDTSent = mintAmount.div(bn(10).pow(12));
      expect(usdtSent).to.be.eq(expectedUSDTSent);
    }),

    it('user should receive usdx on mint based on the current oracle price using mintWithUSDT', async () => {
      let usdxBalanceBefore = await usdx.balanceOf(admin.address);
      let mintAmount = bnDecimal(1000);
      let oraclePrice = await oracle.getAssetPrice(usdt.address);
      let expectedAmountReceived = mintAmount.mul(oraclePrice).div(bn(10).pow(18));

      await vault.mintWithUSDT(bnDecimal(1000));
      
      let usdxBalanceAfter = await usdx.balanceOf(admin.address);
      let usdxGain = usdxBalanceAfter.sub(usdxBalanceBefore);
      expect(expectedAmountReceived).to.be.eq(usdxGain);
    }),

    it('should be able to mint usdx with a whitelisted asset', async () => {
      let isWhitelisted = await vault.isAssetWhitelisted(dai.address);
      expect(isWhitelisted).to.be.eq(true);
      let usdxBalanceBefore = await usdx.balanceOf(admin.address);
      await vault.mint(dai.address, bnDecimal(1000));
      let usdxBalanceAfter = await usdx.balanceOf(admin.address);
      expect(usdxBalanceAfter).to.be.gt(usdxBalanceBefore);
    }),

    it('user should send `mintAmount` of whitelisted asset adjusted for decimals on mint', async () => {
      let daiBalanceBefore = await dai.balanceOf(admin.address);
      let mintAmount = bnDecimal(1000);
      await vault.mint(dai.address, mintAmount);
      let daiBalanceAfter = await dai.balanceOf(admin.address);
      let daiSent = daiBalanceBefore.sub(daiBalanceAfter);
      // Expected amount sent should be adjusted for decimals
      let decimals = await dai.decimals();
      let expectedDAISent = mintAmount.div(bn(10).pow(18 - decimals));
      expect(daiSent).to.be.eq(expectedDAISent);
    }),

    it('user should receive usdx on mint based on the current oracle price on mint', async () => {
      let usdxBalanceBefore = await usdx.balanceOf(admin.address);
      let mintAmount = bnDecimal(1000);
      let oraclePrice = await oracle.getAssetPrice(dai.address);
      let expectedAmountReceived = mintAmount.mul(oraclePrice).div(bn(10).pow(18));

      await vault.mint(dai.address, bnDecimal(1000));
      
      let usdxBalanceAfter = await usdx.balanceOf(admin.address);
      let usdxGain = usdxBalanceAfter.sub(usdxBalanceBefore);
      expect(expectedAmountReceived).to.be.eq(usdxGain);
    }),

    it('shouldn\'t be able to mint usdx with a non-whitelisted asset', async () => {
      let isWhitelisted = await vault.isAssetWhitelisted(tusd.address);
      expect(isWhitelisted).to.be.eq(false);
      await expect(vault.mint(tusd.address, bnDecimal(1000))).
        to.be.revertedWith('Asset is not whitelisted')
    }),

    it('shouldn\'t be able to mint with more than available balance', async () => {
      let balance = await usdt.balanceOf(admin.address);
      await expect(vault.mintWithUSDT(balance.add(1))).
        to.be.revertedWith('Not enough balance to mint');
      balance = await dai.balanceOf(admin.address);
      await expect(vault.mint(dai.address, balance.add(1))).
        to.be.revertedWith('Not enough balance to mint');
    })
  })
})
