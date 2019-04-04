pragma solidity ^0.5.0;

import "./../../node_modules/openzeppelin-eth/contracts/ownership/Ownable.sol";
import "./tokens/CoinShare.sol";
import "./Lockable.sol";

import "./interfaces/GovI.sol";

contract NtfPool is CoinShare, Ownable, Lockable {
    // nty per pool token
    uint256 public npt;

    NtfTokenI public ntfToken;
    GovI public gov;
    
    constructor
    (
        address _owner,
        address _ntfAddress,
        address _govAddress,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    )
        public
        PoolToken(_name, _symbol, _decimals)
    {
        ntfToken = NtfTokenI(_ntfAddress);
        gov = GovI(_govAddress);
        initialize(_owner);
    }

    // owner function
    // function deposit(uint256 _amount) external returns (bool);
    // function join(address _signer) external returns (bool);
    // function leave() external returns (bool);
    // function withdraw() external returns (bool);

    function join(
        uint256 _amount,
        address _signer
    ) 
        public
        onlyOwner()
    {
        ntfToken.approve(address(gov), _amount);
        gov.deposit(_amount);
        gov.join(_signer);
    }

    function leave()
        public
        onlyOwner()
    {
        gov.leave();
    }

    function tokenWithdraw()
        public
        onlyOwner()
    {
        gov.withdraw();
    }

    function _fundWithdraw(
        address payable _toAddress
    )
        public
        onlyOwner()
    {
        uint256 _fund = fund;
        fund = 0;
        transfer(owner()).value(_fund);
    }

    function setLockDuration(
        uint256 _lockDuration
    )
        public
        onlyOwner()
    {
        _setLockDuration(_lockDuration);
    }

    // investers function
    function tokenDeposit(
        uint256 _amount
    )
            public
    {
        address _sender = msg.sender;
        uint256 _coinBalance = coinOf(_sender);
        ntfToken.transferFrom(_sender, address(this), _amount);
        _mint(_sender, _amount);
        _updateCredit(_sender, _coinBalance);
        _lock(_sender);
    }

    function tokenWithdraw(
        uint256 _amount
    )
        public
        notLocking()
    {
        address _sender = msg.sender;
        uint256 _coinBalance = coinOf(_sender);
        _burn(_sender, _amount);
        ntfToken.transfer(_sender, _amount);
        _updateCredit(_sender, _coinBalance);
    }

    function coinWithdraw()
        public
    {
        address payable _sender;
        _coinWithdraw(_sender);
    }

    // Read Functions
    function getPoolNtfBalance()
        public
        view
        returns(uint256)
    {
        return ntfToken.balanceOf(address(this));
    }

    function getPoolNtyBalance()
        public
        view
        returns(uint256)
    {
        return (address(this).balance).sub(fund);
    }
}