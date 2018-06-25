pragma solidity ^0.4.24;

import "openzeppelin-zos/contracts/ownership/Ownable.sol";


/**
 * @title Blacklist
 * @dev The Blacklist contract has a blacklist of addresses, and provides basic authorization control functions.
 * @dev This simplifies the implementation of "user permissions".
 */
contract Blacklist is Ownable {
  mapping(address => bool) public blacklist;

  address[] keys;

  event BlacklistedAddressAdded(address addr);
  event BlacklistedAddressRemoved(address addr);

  function initialize(address _sender) isInitializer("Blacklist", "0.1")  public {
    Ownable.initialize(_sender);
  }

  /**
   * @dev Throws if called by any account that's whitelist (a.k.a not blacklist)
   */
  modifier isBlacklisted() {
    require(blacklist[msg.sender]);
    _;
  }
  
  /**
   * @dev Throws if called by any account that's blacklist.
   */
  modifier isNotBlacklisted() {
    require(!blacklist[msg.sender]);
    _;
  }

  /**
   * @dev Add an address to the blacklist
   * @param addr address
   * @return true if the address was added to the blacklist, false if the address was already in the blacklist
   */
  function addAddressToBlacklist(address addr) onlyOwner public returns(bool success) {
    if (!blacklist[addr]) {
      blacklist[addr] = true;
      keys.push(addr);
      emit BlacklistedAddressAdded(addr);
      success = true;
    }
  }

  /**
   * @dev Add addresses to the blacklist
   * @param addrs addresses
   * @return true if at least one address was added to the blacklist,
   * false if all addresses were already in the blacklist
   */
  function addAddressesToBlacklist(address[] addrs) onlyOwner public returns(bool success) {
    for (uint256 i = 0; i < addrs.length; i++) {
      if (addAddressToBlacklist(addrs[i])) {
        success = true;
      }
    }
  }

  /**
   * @dev Remove an address from the blacklist
   * @param addr address
   * @return true if the address was removed from the blacklist,
   * false if the address wasn't in the blacklist in the first place
   */
  function removeAddressFromBlacklist(address addr) onlyOwner public returns(bool success) {
    if (blacklist[addr]) {
      blacklist[addr] = false;
      for (uint i = 0; i < keys.length; i++) {
        if (addr == keys[i]) {
          keys[i] = keys[keys.length - 1];
          keys.length--;
          break;
        }
      }
      emit BlacklistedAddressRemoved(addr);
      success = true;
    }
  }

  /**
   * @dev Remove addresses from the blacklist
   * @param addrs addresses
   * @return true if at least one address was removed from the blacklist,
   * false if all addresses weren't in the blacklist in the first place
   */
  function removeAddressesFromBlacklist(address[] addrs) onlyOwner public returns(bool success) {
    for (uint256 i = 0; i < addrs.length; i++) {
      if (removeAddressFromBlacklist(addrs[i])) {
        success = true;
      }
    }
  }

  /**
   * @dev Get all blacklist wallet addresses
   */
  function getBlacklist() public view returns (address[]) {
    return keys;
  }

}
