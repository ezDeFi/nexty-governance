pragma solidity ^0.4.24;

import "../access/Blacklist.sol";


contract BlacklistMock is Blacklist {

  function onlyWhitelistedCanDoThis()
    isNotBlacklisted
    view
    external
  {
    //
  }
}