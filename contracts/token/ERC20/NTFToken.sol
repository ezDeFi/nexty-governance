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

  mapping(address => address) public coinbase;
  mapping(address => bool) public sealer;
  address[] public signers;
  uint256 public checkpoint;
  uint256 public sealers;

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
   *
   * @param _sender smart contract owner address
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
