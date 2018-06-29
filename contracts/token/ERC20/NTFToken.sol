pragma solidity ^0.4.24;

import "zos-lib/contracts/migrations/Migratable.sol";
import "./StandardSuspendableToken.sol";
import "openzeppelin-zos/contracts/math/SafeMath.sol";


/**
 * @title Nexty Foundation Token
 */
contract NTFToken is Migratable, StandardSuspendableToken {
  using SafeMath for uint256;

  string public constant SYMBOL = "NTF";
  string public constant NAME = "Nexty Foundation Token";
  uint8 public constant DECIMALS = 18;
  uint256 public constant INITIAL_SUPPLY = 10000000 * (10 ** uint256(DECIMALS));

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
  function initialize(address _sender) isInitializer("NTFToken", "0.1") public {
    StandardSuspendableToken.initialize(_sender);
    totalSupply_ = INITIAL_SUPPLY;

    // Mint tokens
    balances[_sender] = INITIAL_SUPPLY;
    holders.push(_sender);
    emit Transfer(address(0x0), _sender, INITIAL_SUPPLY);
  }

  /**
  * @dev total number of tokens in existence
  */
  function totalSupply() public view returns (uint256) {
    return totalSupply_;
  }

  /**
   * @dev Get all the list of current token holder.
   * @return array of all token holder.
   */
  function getHolders() public view returns (address[]) {
    return holders;
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
