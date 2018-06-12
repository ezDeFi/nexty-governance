pragma solidity ^0.4.23;

import "../access/Blacklist.sol";


contract BlacklistMock is Blacklist {

  function onlyWhitelistedCanDoThis()
    isNotBlacklisted
    view
    external
  {
  }
}