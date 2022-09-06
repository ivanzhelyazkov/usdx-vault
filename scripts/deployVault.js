const fs = require('fs');
const { ethers } = require('hardhat');
const { deploy, deployArgs, verifyContractNoArgs, verifyContractWithArgs } = require('./helpers');

deployVault('mainnet')
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});

/**
 * Deployment of Vault
 */
async function deployVault(network) {
  const [admin] = await ethers.getSigners();

  console.log('deploying vault on', network, 'from', admin.address);

  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

  const oracle = await deploy('Oracle');

  const usdx = await deployArgs('USDX', 'USDX', 'USDX');

  const vault = await deployArgs('Vault', usdtAddress, usdx.address, oracle.address);

  await usdx.initialize(vault.address);

  let deployment = {
    "vault": vault.address,
    "usdx": usdx.address,
    "oracle": oracle.address
  }

  fs.writeFileSync(`./scripts/deployment_${network}.json`, JSON.stringify(deployment));

   // Verify
   try {
    await verifyContractNoArgs(oracle.address);
   } catch(err) {
     console.log(err);
   }
   try {
    await verifyContractWithArgs(usdx.address, 'USDX', 'USDX');
   } catch(err) {
     console.log(err);
   }
   try {
    await verifyContractWithArgs(vault.address, usdtAddress, usdx.address, oracle.address);
   } catch(err) {
     console.log(err);
   }
}