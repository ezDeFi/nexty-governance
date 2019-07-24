pragma solidity ^0.5.0;
import "./Lockable.sol";

contract Request is Lockable {
    uint256 public pendingOutSum;

    mapping(address => uint256) public pendingOut;

    function _requestOut(
        address _sender,
        uint256 _amount)
        internal
        returns (uint256)
    {
        require(_amount > pendingOut[_sender], "new amount must be greater than the older");
        uint256 _added = _amount - pendingOut[_sender];
        pendingOut[_sender] = _amount;
        pendingOutSum += _amount;
        _setLock(_sender);
        return _added;
    }

    function _removeRequest(
        address _sender
    )
        internal
    {
        pendingOutSum -= pendingOut[_sender];
        pendingOut[_sender] = 0;
        _relock(_sender);
    }
}