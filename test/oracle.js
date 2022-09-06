const { deploymentFixture } = require('./fixture');
const { getTokenBalance, bn, bnDecimal, bnDecimals, increaseTime } = require('../scripts/helpers');
const { expect } = require('chai');

// Tests for Oracle
describe('Contract: Oracle', async () => {
  beforeEach(async () => {
      ({ oracle, usdt } = 
          await deploymentFixture());
  })

  describe('Oracle', async () => {
    it('should be able to get asset price', async () => {
      let price = await oracle.getAssetPrice(usdt.address);
      expect(price).not.to.be.eq(0);
    }),

    it('should be able to set asset price', async () => {
      await oracle.setAssetPrice(usdt.address, bnDecimal(2));
      let price = await oracle.getAssetPrice(usdt.address);
      expect(price).not.to.be.eq(2);
    })
  })
})
