pragma solidity ^0.5.0;

contract Lockable {
    mapping(address => uint256) internal unlockTime;
    uint256 internal lockDuration;

    modifier notLocking() {
        require(!isLocking(msg.sender), "still locking");
        _;
    }

    function _setLockDuration(
        uint256 _lockDuration
    )
        internal
    {
        lockDuration = _lockDuration;
    }

    function _lock(
        address _member
    )
        internal
    {
        unlockTime[_member] = block.timestamp + lockDuration;
    }

    function _unlock(
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

    function isLocking(
        address _member
    )
        public
        view
        returns(bool)
    {
        return unlockTime[_member] != 0 && unlockTime[_member] > block.timestamp;
    }
}