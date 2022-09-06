const { deploymentFixture } = require('./fixture');
const { getTokenBalance, bn, bnDecimal, bnDecimals, increaseTime } = require('../scripts/helpers');
const { expect } = require('chai');

// Tests for USDX
describe('Contract: USDX', async () => {
  beforeEach(async () => {
      ({ vault, usdx, oracle, usdt, dai, usdc, tusd, admin, user1, user2 } = 
          await deploymentFixture());
  })

  describe('USDX', async () => {
    it('usdx total supply should increase on mint with usdt', async () => {
      let totalSupplyBefore = await usdx.totalSupply();
      await vault.mintWithUSDT(bnDecimal(1000));
      let totalSupplyAfter = await usdx.totalSupply();
      expect(totalSupplyAfter).to.be.gt(totalSupplyBefore);
    }),

    it('usdx total supply should increase on mint with a whitelisted asset', async () => {
      let totalSupplyBefore = await usdx.totalSupply();
      await vault.mint(dai.address, bnDecimal(1000));
      let totalSupplyAfter = await usdx.totalSupply();
      expect(totalSupplyAfter).to.be.gt(totalSupplyBefore);
    }),

    it('usdx total supply should decrease on redeem for usdt', async () => {
      // mint to be able to redeem
      await vault.mintWithUSDT(bnDecimal(1000));

      let totalSupplyBefore = await usdx.totalSupply();
      await vault.redeem(bnDecimal(1000));
      let totalSupplyAfter = await usdx.totalSupply();
      expect(totalSupplyBefore).to.be.gt(totalSupplyAfter);
    }),

    it('usdx total supply should decrease on redeem for a whitelisted asset', async () => {
      // mint to be able to redeem
      await vault.mint(dai.address, bnDecimal(1000));

      let totalSupplyBefore = await usdx.totalSupply();
      await vault.redeemForAsset(dai.address, bnDecimal(900));
      let totalSupplyAfter = await usdx.totalSupply();
      expect(totalSupplyBefore).to.be.gt(totalSupplyAfter);
    }),

    it('shouldn\'t be able to mint directly from usdx', async () => {
      await expect(usdx.mint(admin.address, bnDecimal(1000))).
        to.be.revertedWith('Only vault may perform this action')
    }),

    it('shouldn\'t be able to burn directly from usdx', async () => {
      await expect(usdx.burnFrom(admin.address, bnDecimal(1000))).
        to.be.revertedWith('Only vault may perform this action')
    })
  })
})
