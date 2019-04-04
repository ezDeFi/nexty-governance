pragma solidity ^0.5.0;

interface NtfTokenI {
  function approve(address _spender, uint256 _value) external returns(bool);
  function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
  function transfer(address _to, uint256 _value) external returns (bool);

  function balanceOf(address _address) external view returns(uint256);
}