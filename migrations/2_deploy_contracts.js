var NTFToken = artifacts.require("./token/ERC20/NTFToken.sol");
var NextyManager = artifacts.require("./governance/NextyManager.sol");

module.exports = function(deployer) {
    /*deployer.deploy(SPToken, '0xc287C713CAA50790a50251bD7FB664E4Ee620937').then(function() {
        //
        /*deployer.deploy(BinaryBetting, SPToken.address).then(function() {
            console.log(BinaryBetting.address)
        })
        BinaryBetting.deployed().then(() => console.log('test' + BinaryBetting.address))*/
        /*
        SPToken.deployed().then(function() {
            console.log(SPToken.address),
            deployer.deploy(BinaryBetting, SPToken.address).then(function() {
                console.log(BinaryBetting.address)
                BinaryBetting.deployed().then(() => console.log('test' + BinaryBetting.address))
            })
        })
    }); 
*/
    deployer.deploy(NTFToken).then(function() {
        return deployer.deploy(NextyManager, NTFToken.address, NTFToken.address);
    });
};
