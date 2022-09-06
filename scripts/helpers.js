const { ethers, network } = require("hardhat");


/**
 * Deploy a contract by name without constructor arguments
 */
async function deploy(contractName) {
    let Contract = await ethers.getContractFactory(contractName);
    return await Contract.deploy({gasLimit: 8888888});
}

/**
 * Deploy a contract by name with constructor arguments
 */
async function deployArgs(contractName, ...args) {
    let Contract = await ethers.getContractFactory(contractName);
    return await Contract.deploy(...args, {gasLimit: 8888888});
}

/**
 * Deploy a contract with abi
 */
 async function deployWithAbi(contract, deployer, ...args) {
    let Factory = new ethers.ContractFactory(contract.abi, contract.bytecode, deployer);
    return await Factory.deploy(...args, {gasLimit: 8888888});
}

/**
 * Deploy a contract by name without constructor arguments
 * Link contract to a library address
 */
 async function deployAndLink(contractName, libraryName, libraryAddress) {
    const params = {
        libraries: {
            [libraryName]: libraryAddress
        }
    }
    let Contract = await ethers.getContractFactory(contractName, params);
    return await Contract.deploy({gasLimit: 8888888});
}

/**
 * Get ETH Balance of contract
 * @param {ethers.Contract} contract 
 */
async function getBalance(contract) {
    return await contract.provider.getBalance(contract.address);
}

/**
 * Get latest block timestamp
 * @returns current block timestamp
 */
async function getBlockTimestamp() {
    const latestBlock = await network.provider.send("eth_getBlockByNumber", ["latest", false]);
    return web3.utils.hexToNumber(latestBlock.timestamp);
}

/**
 * Increase time in Hardhat Network
 */
async function increaseTime(time) {
    await network.provider.send("evm_increaseTime", [time]);
    await network.provider.send("evm_mine");
}

/**
 * Decrease time in Hardhat Network
 */
async function decreaseTime(seconds) {
    await network.provider.send("evm_increaseTime", [-seconds]);
    await network.provider.send("evm_mine");
}

/**
 * Mine several blocks in network
 * @param {Number} blockCount how many blocks to mine
 */
async function mineBlocks(blockCount) {
    for(let i = 0 ; i < blockCount ; ++i) {
        await network.provider.send("evm_mine");
    }
}

/**
 * Activate or disactivate automine in hardhat network
 * @param {Boolean} active 
 */
async function setAutomine(active) {
    await network.provider.send("evm_setAutomine", [active]);
}

async function getLastBlock() {
    return await network.provider.send("eth_getBlockByNumber", ["latest", false]);
}

async function getLastBlockTimestamp() {
    let block = await getLastBlock();
    return block.timestamp;
}

async function verifyContractNoArgs(address) {
    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: [],
        });
    } catch (err) {
        console.log('error while verifying contract:', err);
    }
}

async function verifyContractWithArgs(address, ...args) {
    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: [...args],
        });
    } catch (err) {
        console.log('error while verifying contract:', err);
    }
}

async function verifyContractWithArgsAndName(address, contractName, ...args) {
    try {
        await hre.run("verify:verify", {
            address: address,
            contract: contractName,
            constructorArguments: [...args],
        });
    } catch (err) {
        console.log('error while verifying contract:', err);
    }
}

/**
 * Return BigNumber
 */
function bn(amount) {
    return ethers.BigNumber.from(amount);
}

/**
 * Returns bignumber scaled to 18 decimals
 */
function bnDecimal(amount) {
    let decimal = Math.pow(10, 18);
    let decimals = bn(decimal.toString());
    return bn(amount).mul(decimals);
}

/**
 * Returns bignumber scaled to custom amount of decimals
 */
 function bnDecimals(amount, _decimals) {
    let decimal = Math.pow(10, _decimals);
    let decimals = bn(decimal.toString());
    return bn(amount).mul(decimals);
}

/**
 * Returns number representing BigNumber without decimal precision
 */
function getNumberNoDecimals(amount) {
    let decimal = Math.pow(10, 18);
    let decimals = bn(decimal.toString());
    return amount.div(decimals).toNumber();
}

/**
 * Returns number representing BigNumber without decimal precision (custom)
 */
 function getNumberDivDecimals(amount, _decimals) {
    let decimal = Math.pow(10, _decimals);
    let decimals = bn(decimal.toString());
    return amount.div(decimals).toNumber();
}

module.exports = {
    deploy, deployArgs, deployWithAbi, deployAndLink,
    bn, bnDecimal, bnDecimals, getNumberNoDecimals, getNumberDivDecimals, 
    getBlockTimestamp, increaseTime, mineBlocks, getBalance, setAutomine, getLastBlock, 
    getLastBlockTimestamp, decreaseTime,
    verifyContractNoArgs, verifyContractWithArgs, verifyContractWithArgsAndName
}