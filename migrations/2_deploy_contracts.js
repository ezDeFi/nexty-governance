var NTFToken = artifacts.require("./token/ERC20/NTFToken.sol");
var NextyManager = artifacts.require("./governance/NextyManager.sol");

module.exports = async function(deployer) {
    let NTFTokenInst, NextyManagerInst;

   /* deployer.deploy(NTFToken).then(async function() {
        //NTFToken.deployed.initialize('0x21a790077be4f722a9bd773b7b78f7e7c2cc6e42')
        deployer.deploy(NextyManager).then(async function() {
            await NTFToken.deployed.initialize('0x21a790077be4f722a9bd773b7b78f7e7c2cc6e42')
            //NextyManager.initialize('0x21a790077be4f722a9bd773b7b78f7e7c2cc6e42', NTFToken.address, NTFToken.address)
        });
    })
    */

    await Promise.all([
        
/*        deployer.deploy(NTFToken).then(function() {
            //NTFToken.initialize('0x6f53c8502bb884775e422c7c34be681554cee2ba')
            return deployer.deploy(NextyManager, NTFToken.address, NTFToken.address);
        })
  */      
       deployer.deploy(NTFToken),
       deployer.deploy(NextyManager)
    ])

    instances = await Promise.all([
        NTFToken.deployed(),
        NextyManager.deployed()
    ])
    
      NTFTokenInst      = instances[0];
      NextyManagerInst  = instances[1];

      results = await Promise.all([
        NTFTokenInst.initialize('0x21a790077be4f722a9bd773b7b78f7e7c2cc6e42'),
        NextyManagerInst.initialize(NTFToken.address)
      ]);
      
    
};
