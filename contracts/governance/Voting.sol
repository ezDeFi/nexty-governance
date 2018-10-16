pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./Blacklist.sol";

contract Voting {
    using SafeMath for uint256;
    struct Poll {
        address target;
        bool ban; //true = ban, false = unban
        uint256 startTime;
        uint256 endTime;
        address[] joinedAdresses;
        bool result;
        bool ended;
        uint256 yesCounter;
        uint256 noCounter;
    }

    //uint256 constant public ONEDAY = 24 * 60 * 60;
    uint256 constant public ONEDAY = 2;

    Blacklist public blacklistContract;
    
    mapping(address => bool) public isTarget;
    mapping(address => mapping (uint256 => bool)) public votesByAddress;
    mapping(address => mapping (uint256 => bool)) public joinedByAddress;
    //mapping(address => bool) banned;
    
    Poll[] public polls;
    
    event PollCreatedSuccess(address _from, address _target);
    event VoteSuccess(address _from, uint256 _id);
    
    modifier onlyGoodMan() {
        require(!blacklistContract.inBlacklist(msg.sender) && !isTarget[msg.sender], "banned or is target of a poll");
        _;
    }
    
//////////////////////////////////////////////////////////////////
   
    constructor (address _blacklistAddress) public{
        blacklistContract = Blacklist(_blacklistAddress);
    }
    
    function pollCreate(address _target, bool _ban, uint256 _startTime, uint256 _endTime) public {
        require(!isTarget[_target], "is target of a poll");
        require(blacklistContract.inBlacklist(_target) != _ban, "already banned or unbanned");
        isTarget[_target] = true;
        Poll memory _poll;
        _poll.target = _target;
        _poll.ban = _ban;
        _poll.startTime = _startTime;
        _poll.endTime = _endTime;
        polls.push(_poll);
        emit PollCreatedSuccess(msg.sender, _target);
    }

    function pollCreateByDuration(address _target, bool _ban, uint256 _duration) public {
        require(!isTarget[_target], "is target of a poll");
        require(blacklistContract.inBlacklist(_target) != _ban, "already banned or unbanned");
        uint256 startTime = now;
        uint256 endTime = now + _duration.mul(ONEDAY);
        pollCreate(_target, _ban, startTime, endTime);
    }
    
    function vote(uint256 id, bool agree) public {
        require(id < polls.length, "id not exist");
        Poll memory poll = polls[id];
        require(now >= poll.startTime && now <= poll.endTime, " not during voting time");
        
        if (!joinedByAddress[msg.sender][id]) {
            joinedByAddress[msg.sender][id] = true;
            polls[id].joinedAdresses.push(msg.sender);
        }
        
        votesByAddress[msg.sender][id] = agree;
        emit VoteSuccess(msg.sender, id);
    }
    
    function isSubjectApproved(uint256 yesCounter, uint256 noCounter) internal pure returns(bool) {
        return yesCounter > noCounter;
    }

    function getPollResult(uint256 id) private view returns(bool, uint256, uint256) {
        uint256 yesCounter; 
        uint256 noCounter; 
        (yesCounter, noCounter) = getCurrentCounter(id);
        return (isSubjectApproved(yesCounter, noCounter), yesCounter, noCounter);
    }
    
    function pollEnforce(uint256 id) private {
        require(id < polls.length, "id not exist");
        Poll memory poll = polls[id];
        //vote to ban
        if (poll.ban)
        blacklistContract.addAddressToBlacklist(poll.target); else 
        //vote to unban
        blacklistContract.removeAddressFromBlacklist(poll.target);
    }
    
    function tryToFinalize(uint256 id) public returns(bool) {
        require(id < polls.length, "id not exist");
        Poll memory poll = polls[id];
        if ((now < poll.endTime) || (poll.ended)) {
            return false;
        }
        (polls[id].result, polls[id].yesCounter, polls[id].noCounter) = getPollResult(id);
        delete polls[id].joinedAdresses;
        if (polls[id].result) pollEnforce(id);
        polls[id].ended = true;
        isTarget[poll.target] = false;
        return true;
    }

    function isTargetByAddress(address _address) public view returns(bool){
        return isTarget[_address];
    }

    function getCurrentCounter(uint256 id) public view returns(uint256, uint256) {
        require(id < polls.length, "id not exist");
        Poll memory poll = polls[id];
        uint256 yesCounter = 0;
        uint256 noCounter = 0;
        for (uint256 i = 0; i < poll.joinedAdresses.length; i++ ) {
            address _address = poll.joinedAdresses[i];
            bool voteValue = votesByAddress[_address][id];
            if (voteValue) yesCounter = yesCounter.add(_address.balance); else 
            noCounter = noCounter.add(_address.balance);
        }

        return (yesCounter, noCounter);
    }

    function getPollsLength() public view returns(uint256) { 
        return polls.length;
    }

    function getPollById(uint256 id) public view returns(address, bool, uint256, uint256, bool, bool, uint256, uint256 ) {
        Poll memory poll = polls[id];
        uint256 yesCounter = polls[id].yesCounter;
        uint256 noCounter = polls[id].noCounter;
        if (!poll.ended) (yesCounter, noCounter) = getCurrentCounter(id);
        return (poll.target, poll.ban, poll.startTime, poll.endTime, poll.result, poll.ended, yesCounter, noCounter);
    }

    function getJoinedByAddress(address _address, uint256 _id) public view returns(bool) {
        return joinedByAddress[_address][_id];
    }

    function getVotesByAddress(address _address, uint256 _id) public view  returns(bool) {
        return votesByAddress[_address][_id];
    }
    
    function testAddWithCall(address _address) public {
        blacklistContract.addAddressToBlacklist(_address);
    }
    
    function testRemoveWithCall(address _address) public {
        blacklistContract.removeAddressFromBlacklist(_address);
    }
}