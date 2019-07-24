pragma solidity ^0.5.0;

import "./ntfPool/NtfPool.sol";

interface NtfPoolI {
    function name() external view returns (string memory);
    function getPoolNtfBalance() external view returns(uint256);
    function getPoolGovBalance() external view returns(uint256);
}

contract PoolMaker {
    address public ntfAddress;
    address public govAddress;
    address[] public pools;
    mapping(address => address) public poolOwner;

    constructor (
        address _ntfAddress,
        address _govAddress
    )
      public
    {
        ntfAddress = _ntfAddress;
        govAddress = _govAddress;
    }

    function createPool(
        address _owner,
        uint256 _COMPRATE,
        uint256 _MAX_LOCK_DURATION,
        uint256 _OWNER_ACTION_DELAY,
        string memory _name,
        string memory _website,
        string memory _location,
        string memory _profile
    )
        public
        returns (address)
    {
        NtfPool ntfPool = new NtfPool(
            _owner,
            ntfAddress,
            govAddress,
            _COMPRATE,
            _MAX_LOCK_DURATION,
            _OWNER_ACTION_DELAY,
            _name,
            _website,
            _location,
            _profile
        );
        pools.push(address(ntfPool));
        poolOwner[address(ntfPool)] = _owner;
        return (address(ntfPool));
    }

    // Read

    function getPoolCount()
        public
        view
        returns(uint256)
    {
        return pools.length;
    }

    function getPool(uint256 i)
        public
        view
        returns(address, address, string memory, uint256, uint256)
    {
        address _pAddress = pools[i];
        address _owner = poolOwner[_pAddress];
        string memory _name = NtfPoolI(_pAddress).name();
        // avaiable balance
        uint256 _poolNtfBalance = NtfPoolI(_pAddress).getPoolNtfBalance();
        // in Gov Ntf balance
        uint256 _poolGovBalance = NtfPoolI(_pAddress).getPoolGovBalance();
        return(_pAddress, _owner, _name, _poolNtfBalance, _poolGovBalance);
    }
}