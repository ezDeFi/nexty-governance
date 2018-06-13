pragma solidity ^0.4.24;

import "./StandardSuspendableToken.sol";
import "zos-lib/contracts/migrations/Migratable.sol";

/**
 * @title Nexty Foundation Token
 */
contract NTFToken is StandardSuspendableToken, Migratable {
  string public constant symbol = "NTF";
  string public constant name = "Nexty Foundation Token";
  uint8 public constant decimals = 18;
  uint256 public constant INITIAL_SUPPLY = 10000000 * (10 ** uint256(decimals));

  mapping(address => address) coinbase;

  event SetCoinbase(address _from, address _to);

  /**
   * Check if address is a valid destination to transfer tokens to
   * - must not be zero address
   * - must not be the token address
   * - must not be the owner's address
   */
  modifier validDestination(address to) {
    require(to != address(0x0));
    require(to != address(this));
    require(to != owner);
    _;
  }

  /**
   * Token contract initialize
   */
  function initialize() isInitializer("Nexty Foundation Token", "0") public {
    totalSupply_ = INITIAL_SUPPLY;
        
    // Mint tokens
    balances[msg.sender] = INITIAL_SUPPLY;
    holders.push(msg.sender);
    emit Transfer(address(0x0), msg.sender, INITIAL_SUPPLY);      
  }

  /**
   * Transfer from sender to another account
   *
   * @param _to Destination address
   * @param _value Amount of NTF token to send
   */
  function transfer(address _to, uint256 _value) public validDestination(_to) returns (bool) {
    return super.transfer(_to, _value);
  }
  
  /**
   * Transfer from `from` account to `to` account using allowance in `from` account to the sender
   *
   * @param _from Origin address
   * @param _to Destination address
   * @param _value Amount of NTF token to send
   */
  function transferFrom(address _from, address _to, uint256 _value) public validDestination(_to) returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }

  /**
   * Token holder can call method to set/update their coinbase for mining.
   *
   * @param _to Destination address
   */
  function setCoinbase(address _to) public validDestination(_to) returns (bool) {
    require(balances[msg.sender] > 0);

    coinbase[msg.sender] = _to;
    emit SetCoinbase(msg.sender, _to);
    return true;
  }

  /**
   * Get coinbase address of token holder
   */
  function getCoinbase() public view returns (address) {
    return coinbase[msg.sender];
  }
}
