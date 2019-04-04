pragma solidity ^0.5.0;

import "./../../node_modules/openzeppelin-eth/contracts/ownership/Ownable.sol";
import "./CoinShare.sol";
import "./Lockable.sol";

import "./interfaces/GovI.sol";

contract NtfPool is CoinShare, Ownable, Lockable {
    // nty per pool token
    uint256 constant public MAX_LOCK_DURATION = 30 days;
    uint256 constant public OWNER_ACTION_DELAY = 7 days;

    uint256 lastActionTime;
    uint256 public npt;

    NtfTokenI public ntfToken;
    GovI public gov;

    modifier delayPast() {
        require(block.timestamp > lastActionTime + OWNER_ACTION_DELAY, "dont change to quick");
        _;
    }

    modifier validLockDuration(uint256 _lockDuration) {
        require(_lockDuration <= MAX_LOCK_DURATION, "dont lock too long");
        _;
    }
    
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
        CoinShare(_name, _symbol, _decimals)
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

    function tokenPoolWithdraw()
        public
        onlyOwner()
    {
        gov.withdraw();
    }

    function fundWithdraw(
        address payable _toAddress
    )
        public
        onlyOwner()
    {
        _fundWithdraw(_toAddress);
    }

    function setLockDuration(
        uint256 _lockDuration
    )
        public
        onlyOwner()
        delayPast()
        validLockDuration(_lockDuration)
    {
        lastActionTime = block.timestamp;
        _setLockDuration(_lockDuration);
    }

    // members function
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

    function tokenMemberWithdraw(
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
        address payable _sender = msg.sender;
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

    // function getMembersBalance()
    // getFund()
}