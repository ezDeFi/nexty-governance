var NTFToken = artifacts.require('./token/ERC20/NTFToken.sol');
var NextyManager = artifacts.require('./governance/NextyManager.sol');

module.exports = async function(deployer) {
    let NTFTokenInst, NextyManagerInst;

    await Promise.all([

        deployer.deploy(NTFToken),
        deployer.deploy(NextyManager)
    ])

    instances = await Promise.all([
        NTFToken.deployed(),
        NextyManager.deployed()
    ])

    NTFTokenInst = instances[0];
    NextyManagerInst = instances[1];

    results = await Promise.all([
        NTFTokenInst.initialize('0x6f53c8502bb884775e422c7c34be681554cee2ba'),
        NextyManagerInst.initialize(NTFToken.address)
    ]);

};
