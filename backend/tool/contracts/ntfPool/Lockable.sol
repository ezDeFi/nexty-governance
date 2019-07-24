pragma solidity ^0.5.0;

contract Lockable {
    mapping(address => uint256) internal unlockTime;
    uint256 internal lockDuration;
    uint256 public MAX_LOCK_DURATION; // = 30 days;

    modifier notLocking() {
        require(!isLocking(msg.sender), "still locking");
        _;
    }

    modifier validLockDuration(uint256 _lockDuration) {
        require(_lockDuration <= MAX_LOCK_DURATION, "dont lock too long");
        _;
    }

    function _setLockDuration(
        uint256 _lockDuration
    )
        internal
        validLockDuration(_lockDuration)
    {
        lockDuration = _lockDuration;
    }

    function _setLock(
        address _member
    )
        internal
    {
        unlockTime[_member] = block.timestamp + lockDuration;
    }

    function _relock(
        address _member
    )
        internal
    {
        unlockTime[_member] = 0;
    }

    // Read Functions

    function getUnlockTime(
        address _member
    )
        public
        view
        returns(uint256)
    {
        return unlockTime[_member];
    }

    function getLockDuration()
        public
        view
        returns(uint256)
    {
        return lockDuration;
    }

    function isLocking(
        address _member
    )
        public
        view
        returns(bool)
    {
        return unlockTime[_member] > block.timestamp;
    }
}