pragma solidity ^0.4.24;

import "../token/ERC20/StandardSuspendableToken.sol";


// mock class using StandardSuspendableToken
contract StandardSuspendableTokenMock is StandardSuspendableToken {
  constructor(address initialAccount, uint256 initialBalance) public {
    balances[initialAccount] = initialBalance;
    totalSupply_ = initialBalance;
  }
}
