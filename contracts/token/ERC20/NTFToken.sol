pragma solidity ^0.4.24;

import "zos-lib/contracts/migrations/Migratable.sol";
import "openzeppelin-zos/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-zos/contracts/ownership/Ownable.sol";
//import "openzeppelin-zos/contracts/Initializable.sol";


/**
 * @title Nexty Foundation Token
 */
contract NTFToken is Migratable, StandardToken, Ownable {

  string public constant SYMBOL = "NTF";
  string public constant NAME = "Nexty Foundation Token";
  uint8 public constant DECIMALS = 18;
  uint256 public constant INITIAL_SUPPLY = 10;
  mapping (address => mapping (address => uint256)) public history;

  /**
   * Token contract initialize
   *
   * @param _sender smart contract owner address
   */
  function initialize(address _sender) isInitializer("NTFToken", "0.1") public {
    Ownable.initialize(_sender);
    totalSupply_ = INITIAL_SUPPLY;

    // Mint tokens
    balances[_sender] = INITIAL_SUPPLY;
    emit Transfer(address(0x0), _sender, INITIAL_SUPPLY);
  }
  
  /*function NTFTransfer(address to, uint256 tokens) public {
      transfer(to, tokens);
      history[msg.sender][to] += tokens;
  }*/
}
