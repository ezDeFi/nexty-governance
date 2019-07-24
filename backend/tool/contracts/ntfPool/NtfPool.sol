pragma solidity ^0.5.0;

import "./../../node_modules/openzeppelin-eth/contracts/ownership/Ownable.sol";
import "./CoinShare.sol";
import "./Request.sol";

import "./interfaces/GovI.sol";
import "./interfaces/NtfTokenI.sol";

contract PoolDesc {
    string public name;
    string public website;
    string public location;
    string public email;
    string public logo;

    constructor (
        string memory _name,
        string memory _website,
        string memory _location,
        string memory _logo
    ) public {
        name = _name;
        website = _website;
        location = _location;
        logo = _logo;
    }
}

contract NtfPool is PoolDesc, CoinShare, Ownable, Request {
    uint256 public OWNER_ACTION_DELAY; // = 7 days;

    uint256 lastActionTime;

    NtfTokenI public ntfToken;
    GovI public gov;

    modifier delayPast() {
        require(block.timestamp > lastActionTime + OWNER_ACTION_DELAY, "dont change to quick");
        _;
    }

    function () external payable {}

    constructor
    (
        address _owner,
        address _ntfAddress,
        address _govAddress,
        uint256 _COMPRATE,
        uint256 _MAX_LOCK_DURATION,
        uint256 _OWNER_ACTION_DELAY,
        string memory _name,
        string memory _website,
        string memory _location,
        string memory _logo
    )
        public
        PoolDesc(_name, _website, _location, _logo)
    {
        ntfToken = NtfTokenI(_ntfAddress);
        gov = GovI(_govAddress);
        require(_COMPRATE >= 0 && _COMPRATE <= 100, "invalid compensation rate");
        COMPRATE = _COMPRATE;
        MAX_LOCK_DURATION = _MAX_LOCK_DURATION;
        _setLockDuration(60);
        OWNER_ACTION_DELAY = _OWNER_ACTION_DELAY;
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
        require(_amount.add(pendingOutSum) <= getPoolNtfBalance(), "not enough to join");
        ntfToken.approve(address(gov), _amount);
        gov.deposit(_amount);
        gov.join(_signer);
    }

    function _leave()
        internal
    {
        gov.leave();
    }

    function leave()
        public
        onlyOwner()
    {
        _leave();
    }

    function tokenPoolWithdraw()
        public
        //onlyOwner()
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
    {
        lastActionTime = block.timestamp;
        _setLockDuration(_lockDuration);
    }

    // members function
    function requestOut(
        uint256 _amount
    )
        public
    {
        _updateFundCpt();
        address payable _sender = msg.sender;
        _coinWithdraw(_sender);
        uint256 _added = _requestOut(_sender, _amount);
        _burn(_sender, _added);
        _updateCredit(_sender, 0);
    }

    function tokenDeposit(
        uint256 _amount
    )
            public
    {
        _updateFundCpt();
        address _sender = msg.sender;
        uint256 _coinBalance = coinOf(_sender);
        ntfToken.transferFrom(_sender, address(this), _amount);
        _mint(_sender, _amount);
        _updateCredit(_sender, _coinBalance);
    }

    function tokenMemberWithdraw(
    )
        public
        notLocking()
    {
        address _sender = msg.sender;
        uint256 _amount = pendingOut[_sender];
        if (_amount > getPoolNtfBalance()) {
            _leave();
            return;
        }
        ntfToken.transfer(_sender, _amount);
        _removeRequest(_sender);
    }

    function coinWithdraw()
        public
    {
        address payable _sender = msg.sender;
        _coinWithdraw(_sender);
    }

    // Read Functions

    // deployed NtfToken contract
    function getPoolNtfBalance()
        public
        view
        returns(uint256)
    {
        return ntfToken.balanceOf(address(this));
    }

    //  CoinShare contract
    // function getCpt() public view returns(uint256)
    // function getFund() public view returns(uint256)
    // function getCoinOf(address _member) public view returns(uint256)

    // Lockable contract
    // function getUnlockTime(address _member) public view returns(uint256)
    // function isLocking(address _member) public view returns(bool)
    // function getLockDuration() public view returns(uint256)

    function getStatus()
        public
        view
        returns(uint256)
    {
        return gov.getStatus(address(this));
    }

    function getPoolGovBalance()
        public
        view
        returns(uint256)
    {
        return gov.getBalance(address(this));
    }

    function getCoinbase()
        public
        view
        returns(address)
    {
        return gov.getCoinbase(address(this));
    }

    function getUnlockHeight()
        public
        view
        returns(uint256)
    {
        return gov.getUnlockHeight(address(this));
    }

    function isWithdrawable()
        external
        view
        returns(bool)
    {
        return gov.isWithdrawable(address(this));
    }

/*
    TEST TEST TEST TEST TEST TEST TEST TEST TEST 
*/
    // send nty to contract as Reward from Core
    function virtuellMining()
        public
        payable
    {

    }
}