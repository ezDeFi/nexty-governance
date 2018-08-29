pragma solidity ^0.4.24;

import "zos-lib/contracts/migrations/Migratable.sol";
import "../access/Blacklist.sol";


/**
 * @title Nexty governance smart contract
 */
contract Nexty is Migratable, Blacklist {
  mapping(address => uint256) balances;
  mapping(address => address) public coinbase;
  mapping(address => bool) public sealer;
  
  address[] public signers;
  address[] public holders;

  event SetCoinbase(address _holder, address _coinbase);
  event UnSetCoinbase(address _holder, address _coinbase);

  /**
   * Check if address is a valid destination to transfer tokens to
   * - must not be zero address
   * - must not be the token address
   * - must not be the owner's address
   * - must not be the sender's address
   */
  modifier validDestination(address to) {
    require(to != address(0x0));
    require(to != address(this));
    require(to != owner);
    require(to != msg.sender);
    _;
  }

  /**
   * Token contract initialize
   */
  function initialize() isInitializer("Nexty", "0.1") public {
  }

  /**
   * @dev Get all the list of current token holder.
   * @return array of all token holder.
   */
  function getHolders() public view returns (address[]) {
    return holders;
  }

  /**
   * @dev Get all the list of current singer.
   */
  function getSigners() public view returns (address[]) {
    return signers;
  }

  /**
   * Token holder can call method to set their coinbase for mining.
   *
   * @param _coinbase Destination address
   */
  function setCoinbase(address _coinbase) public validDestination(_coinbase) returns (bool) {
    require(balances[msg.sender] > 0);
    require(sealer[msg.sender] == false);
    
    coinbase[_coinbase] = msg.sender;
    signers.push(_coinbase);
    sealer[msg.sender] = true;
    emit SetCoinbase(msg.sender, _coinbase);
    return true;
  }

  /**
   * Token holder can call method to remove their coinbase and reset to other coinbase later for mining.
   *
   * @param _coinbase Destination address
   */
  function unSetCoinbase(address _coinbase) public returns (bool) {
    require(coinbase[_coinbase] == msg.sender);
    require(sealer[msg.sender] == true);

    delete coinbase[_coinbase];
    removeSigner(_coinbase);
    delete sealer[msg.sender];
    emit UnSetCoinbase(msg.sender, _coinbase);
    return true;
  }

  /**
   * @dev Remove a specific address/account out of signer list
   */
  function removeSigner(address _signer) internal {
    for (uint i = 0; i < signers.length; i++) {
      if (_signer == signers[i]) {
        signers[i] = signers[signers.length - 1];
        signers.length--;
        return;
      }
    }
  }
}