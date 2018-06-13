pragma solidity ^0.4.24;

import "../token/ERC20/NTFToken.sol";


contract NTFTokenMock is NTFToken {

  /**
   * Token contract constructor
   */
  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
        
    // Mint tokens
    balances[msg.sender] = INITIAL_SUPPLY;
    holders.push(msg.sender);
    emit Transfer(address(0x0), msg.sender, INITIAL_SUPPLY);
  }
}
