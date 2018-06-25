[![Build Status](https://travis-ci.org/nextyio/ntf-smart-contract.svg?branch=master)](https://travis-ci.org/nextyio/ntf-smart-contract)

# Nexty Token Foundation

# Testing NTF token on local network

For convenience, we will use **ganache**  as local network to run test `NTF` token. Below are detail steps to setup and run test the upgradble `NTF` token on local testnet.

## Deploy zos-stdlib to the local network

Because the zos-stdlib was not avaiable on local testnet then to use it we need to deploy the stdlib on the local testnet first by running below command.

```
zos push --deploy-stdlib --network ganache
```

A new config file named `zos.ganache.json` will be created on the project folder; the content might be as below, the `address` will be difference on other machines/networks.

```
{
  "contracts": {
    "NTFToken": {
      "address": "0x5fd5306ffe2810b8f2d1ab7a21a640389f6024b4",
      "bytecodeHash": "0cee4edc888c41ad85edff463fc1f416918795940f160e679c796a3bb36e0f58"
    }
  },
  "proxies": {},
  "stdlib": {
    "address": "0xa5d2edb038d1cd4a06be6fa1a40c2cd8d2e346c7",
    "customDeploy": true,
    "name": "openzeppelin-zos",
    "version": "1.9.1"
  },
  "app": {
    "address": "0xaf9cc21d3d2e378452b3d873180fdf5885b6382e"
  },
  "version": "0.1.0",
  "package": {
    "address": "0xe04569837e18391ffdcaa162ed9752734d63732a"
  },
  "provider": {
    "address": "0xe57071f01798a06d0e7026ae77593f45e9a2a8e2"
  }
}
```

## Deploy an upgradeable instance of NTF token

Add `NTFtoken` smart contract to the project and push to the local network.

```
zos add NTFToken
zos push --network ganache
```

After running above command successfully, this content will be added into `zos.json` file

```
  "contracts": {
    "NTFToken": "NTFToken"
  },
```

We can now create an upgradeable instance of NTFToken contract simply through:

```
zos create NTFToken --init initialize --args 0x7165E6d65046a7d8270B59Ea5bE5148cc13a2Dd4 --network ganache
```

among that, `0x7165E6d65046a7d8270B59Ea5bE5148cc13a2Dd4` will be the owner of the contract. After running `create` command successfully, the `proxies` content below will be added into `zos.ganache.json` file.

```
...
  "proxies": {
    "NTFToken": [
      {
        "address": "0x6e27d4f5a5216388fe555c59dc20b5d1c1d12406",
        "version": "0.1.0",
        "implementation": "0x5fd5306ffe2810b8f2d1ab7a21a640389f6024b4"
      }
    ]
  },
...
```

Voilà! Now, we can use truffle console to interact with the NTF token smart contract.

## Interact with deployed NTF token smart contract

Open `truffle console` with **ganache** local network by running command

```
npx truffle console --network ganache
```

`truffle(ganache)>` will be prompt and ready to receive user command to interact with smart contract.

For instance, firstly we can get the smart contract by specify proxy address of the contract as below

```
truffle(ganache)> token = NTFToken.at("0x6e27d4f5a5216388fe555c59dc20b5d1c1d12406");
```

then, we can get the total supply of NTF token by running

```
truffle(ganache)> token.totalSupply();
```

You can see `BigNumber { s: 1, e: 25, c: [ 100000000000 ] }` output on the console.

