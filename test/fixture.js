const { ethers, deployments } = require('hardhat');
const { deploy, deployArgs, bnDecimal } = require('../scripts/helpers');

/**
 * Deployment fixture
 * Deploys minimum required for tests
 */
const deploymentFixture = deployments.createFixture(async () => {
    const [admin, user1, user2] = await ethers.getSigners();
    const usdt = await deployArgs('ERC20Decimals', 'USDT', 'USDT', 6);
    const dai = await deployArgs('ERC20Basic', 'DAI', 'DAI');
    const usdc = await deployArgs('ERC20Decimals', 'USDC', 'USDC', 6);
    // non-whitelisted asset
    const tusd = await deployArgs('ERC20Basic', 'TUSD', 'TUSD')

    const oracle = await deploy('Oracle');
  
    const usdx = await deployArgs('USDX', 'USDX', 'USDX');
  
    const vault = await deployArgs('Vault', usdt.address, usdx.address, oracle.address);
  
    await usdx.initialize(vault.address);

    // whitelist DAI and USDC for minting
    await vault.whitelistAsset(dai.address);
    await vault.whitelistAsset(usdc.address);

    // set asset prices
    await oracle.setAssetPrice(usdt.address, '1000000000000000000');
    await oracle.setAssetPrice(dai.address, '998000000000000000');
    await oracle.setAssetPrice(usdc.address, '1008000000000000000');

    // transfer tokens to other users
    await usdt.transfer(user1.address, bnDecimal(1000000));
    await dai.transfer(user1.address, bnDecimal(1000000));
    await usdc.transfer(user1.address, bnDecimal(1000000));
    await usdt.transfer(user2.address, bnDecimal(1000000));
    await dai.transfer(user2.address, bnDecimal(1000000));
    await usdc.transfer(user2.address, bnDecimal(1000000));

    // approve vault
    await usdt.approve(vault.address, bnDecimal(1000000000));
    await dai.approve(vault.address, bnDecimal(1000000000));
    await usdc.approve(vault.address, bnDecimal(1000000000));
    await usdt.connect(user1).approve(vault.address, bnDecimal(1000000000));
    await dai.connect(user1).approve(vault.address, bnDecimal(1000000000));
    await usdc.connect(user1).approve(vault.address, bnDecimal(1000000000));
    await usdt.connect(user2).approve(vault.address, bnDecimal(1000000000));
    await dai.connect(user2).approve(vault.address, bnDecimal(1000000000));

    return {
      vault, usdx, oracle, usdt, dai, usdc, tusd, admin, user1, user2
    }
});

module.exports = { deploymentFixture };