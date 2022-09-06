const { deploymentFixture } = require('../fixture');
const { bnDecimal, bn } = require('../../scripts/helpers');
const { expect } = require('chai');

// Redeem tests for Vault
describe('Contract: Vault', async () => {
  beforeEach(async () => {
      ({ vault, usdx, oracle, usdt, dai, usdc, tusd, admin, user1, user2 } = 
          await deploymentFixture());
  })

  describe('Redeem', async () => {
    it('should be able to redeem usdt for usdx', async () => {
      // mint to be able to redeem
      await vault.mintWithUSDT(bnDecimal(1000));
      let investedAmount = await vault.getInvestedAmount(admin.address, usdt.address);
      expect(investedAmount).to.be.gt(0);
      let usdtBalanceBefore = await usdt.balanceOf(admin.address);
      await vault.redeem(bnDecimal(1000));
      let usdtBalanceAfter = await usdt.balanceOf(admin.address);
      expect(usdtBalanceAfter).to.be.gt(usdtBalanceBefore);
    }),

    it('should be able to redeem dai for usdx', async () => {
      // mint to be able to redeem
      await vault.connect(user1).mint(dai.address, bnDecimal(1000));
      let investedAmount = await vault.getInvestedAmount(user1.address, dai.address);
      expect(investedAmount).to.be.gt(0);
      let daiBalanceBefore = await dai.balanceOf(user1.address);
      let usdxBalance = await usdx.balanceOf(user1.address);
      await vault.connect(user1).redeemForAsset(dai.address, usdxBalance);
      let daiBalanceAfter = await dai.balanceOf(user1.address);
      expect(daiBalanceAfter).to.be.gt(daiBalanceBefore);
    }),

    it('should burn usdx on redeem for usdt', async () => {
      // mint to be able to redeem
      await vault.mintWithUSDT(bnDecimal(1000));
      let investedAmount = await vault.getInvestedAmount(admin.address, usdt.address);
      expect(investedAmount).to.be.gt(0);

      let redeemAmount = bnDecimal(1000);
      let usdxBalanceBefore = await usdx.balanceOf(admin.address);
      await vault.redeem(redeemAmount);
      let usdxBalanceAfter = await usdx.balanceOf(admin.address);
      let usdxBurnt = await usdxBalanceBefore.sub(usdxBalanceAfter)
      expect(usdxBurnt).to.be.eq(redeemAmount);
    }),

    it('should burn usdx on redeem for a whitelisted asset', async () => {
      // mint to be able to redeem
      await vault.connect(user1).mint(dai.address, bnDecimal(1000));
      let investedAmount = await vault.getInvestedAmount(user1.address, dai.address);
      expect(investedAmount).to.be.gt(0);
      
      let redeemAmount = bnDecimal(500);
      let usdxBalanceBefore = await usdx.balanceOf(user1.address);
      await vault.connect(user1).redeemForAsset(dai.address, redeemAmount);
      let usdxBalanceAfter = await usdx.balanceOf(user1.address);
      let usdxBurnt = usdxBalanceBefore.sub(usdxBalanceAfter);
      expect(usdxBurnt).to.be.eq(redeemAmount);
    }),

    it('should receive usdt based on oracle price when redeeming', async () => {
      // mint to be able to redeem
      await vault.mintWithUSDT(bnDecimal(1000));
      let investedAmount = await vault.getInvestedAmount(admin.address, usdt.address);
      expect(investedAmount).to.be.gt(0);

      let redeemAmount = bnDecimal(500);
      let usdtPrice = await oracle.getAssetPrice(usdt.address);
      let decimals = await usdt.decimals();
      let expectedAmountReceived = redeemAmount.
        mul(bn(10).pow(18)).div(usdtPrice).div(bn(10).pow(18 - decimals));

      let usdtBalanceBefore = await usdt.balanceOf(admin.address);
      await vault.redeem(redeemAmount);
      let usdtBalanceAfter = await usdt.balanceOf(admin.address);
      let receivedAmount = usdtBalanceAfter.sub(usdtBalanceBefore);
      
      expect(receivedAmount).to.be.eq(expectedAmountReceived);
    }),

    it('should receive whitelisted asset based on oracle price when redeeming', async () => {
      // mint to be able to redeem
      await vault.mint(dai.address, bnDecimal(1000));
      let investedAmount = await vault.getInvestedAmount(admin.address, dai.address);
      expect(investedAmount).to.be.gt(0);

      let redeemAmount = bnDecimal(500);
      let daiPrice = await oracle.getAssetPrice(dai.address);
      let decimals = await dai.decimals();
      let expectedAmountReceived = redeemAmount.
        mul(bn(10).pow(18)).div(daiPrice).div(bn(10).pow(18 - decimals));

      let daiBalanceBefore = await dai.balanceOf(admin.address);
      await vault.redeemForAsset(dai.address, redeemAmount);
      let daiBalanceAfter = await dai.balanceOf(admin.address);
      let receivedAmount = daiBalanceAfter.sub(daiBalanceBefore);
      
      expect(receivedAmount).to.be.eq(expectedAmountReceived);
    }),

    it('shouldn\'t be able to burn more usdx than available balance using redeem', async () => {
      // mint to be able to redeem
      await vault.connect(user1).mintWithUSDT(bnDecimal(1000));
      let investedAmount = await vault.getInvestedAmount(user1.address, usdt.address);
      expect(investedAmount).to.be.gt(0);
      
      let usdxBalance = await usdx.balanceOf(user1.address);
      await expect(vault.connect(user1).redeem(usdxBalance.add(1))).
        to.be.revertedWith('Not enough balance to burn')
    }),

    it('shouldn\'t be able to burn usdx on redeem if user doesn\'t have enough invested', async () => {
      // mint to be able to redeem
      await vault.connect(user1).mint(dai.address, bnDecimal(1000));
      await vault.connect(user1).mintWithUSDT(bnDecimal(1000));
      
      let usdxBalance = await usdx.balanceOf(user1.address);
      await expect(vault.connect(user1).redeem(usdxBalance)).
        to.be.revertedWith('User doesn\'t have enough invested in the asset')
    })

    it('shouldn\'t be able to burn more usdx than available balance', async () => {
      // mint to be able to redeem
      await vault.connect(user1).mint(dai.address, bnDecimal(1000));
      let investedAmount = await vault.getInvestedAmount(user1.address, dai.address);
      expect(investedAmount).to.be.gt(0);
      
      let usdxBalance = await usdx.balanceOf(user1.address);
      await expect(vault.connect(user1).redeemForAsset(dai.address, usdxBalance.add(1))).
        to.be.revertedWith('Not enough balance to burn')
    }),

    it('shouldn\'t be able to burn usdx on redeem if user doesn\'t have enough invested', async () => {
      // mint to be able to redeem
      await vault.connect(user1).mint(dai.address, bnDecimal(1000));
      await vault.connect(user1).mint(usdc.address, bnDecimal(1000));
      
      let usdxBalance = await usdx.balanceOf(user1.address);
      await expect(vault.connect(user1).redeemForAsset(dai.address, usdxBalance)).
        to.be.revertedWith('User doesn\'t have enough invested in the asset')
    })
  })
})
