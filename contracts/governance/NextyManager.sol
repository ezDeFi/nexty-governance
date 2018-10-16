//solium-disable linebreak-style
pragma solidity ^0.4.24;

import "zos-lib/contracts/migrations/Migratable.sol";
//import "openzeppelin-zos/contracts/ownership/Ownable.sol";
import "./SafeMath.sol";
import "./Blacklist.sol";

contract NTFToken {
    //need approve first with DApp to call this function
    function transferFrom(address _from, address _to, uint _tokens) public returns (bool success);
    //function for withdraw the deposited ntf amount
    function transfer(address _to, uint256 _amount) public returns(bool success);
}

/**
 * @title Nexty sealers management smart contract
 */
contract NextyManager is Migratable, Blacklist {
    using SafeMath for uint256;

    //minimum of deposited NTF to join
    uint256 public constant MIN_NTF_AMOUNT = 2;
    //minimum blocks number distance from last leaved to current chain blocknumber to withdrawable
    uint256 public constant MIN_BLOCKS_DISTANCE = 100;

    enum SealerStatus {
        PENDING_ACTIVE,     //Sealer deposited enough NTFs into registration contract successfully.

        ACTIVE,             //Sealer send request to become a sealer 
                            //and added into activation sealer set successfully

        PENDING_WITHDRAW,   //Sealer send request to exit from activation sealer set successfully. 
                            //Sealer casted out of activation sealer set

        WITHDRAWN,          //Sealer already withdrawn their deposit NTFs successfully. 
                            //They can only make withdrawal after withdrawal period.

        PENALIZED           //Sealer marked as penalized node (update by consensus or voting result via dapp) 
                            //and cannot become active sealer and cannot withdraw balance neither.
    }

    struct Record {
        SealerStatus status;
        //ntf amount deposited
        uint256 balance;
        //sealer used address to seal blocks
        address coinbase;
        //blocknumber, that sealer leaved from sealers set. On first deposit got value of 0
        uint256 leavedBlocknumber;
    }

    //ntf token contract, unit used to join Nexty sealers
    address public ntfAddress;
    //voting smart contract to lock(bann) or unlock(unbann) a sealer
    address public voteAddress;

    //get invester address of a coinbase
    mapping(address => Record) public sealers;

    //address[] public coinbases;
    address[] public coinbases;
    //check if address of a coinbase
    mapping(address => bool) public isCoinbase;
    //get sealer's address of a coinbase address
    mapping(address => address) public getSealer;

    event Deposited(address _sealer, uint _tokens);
    event Joined(address _sealer, address _coinbase);
    event Leaved(address _sealer, address _coinbase);
    event Withdrawn(address _sealer, uint256 _tokens);
    event Banned(address _sealer);
    event Unbanned(address _sealer);

    /**
    * Check if address is a valid destination to transfer tokens to
    * - must not be zero address
    * - must not be the token address
    * - must not be the owner's address
    * - must not be the sender's address
    */
    modifier validCoinbase(address _coinbase) {
        require(!isCoinbase[_coinbase], "coinbase already used");
        require(_coinbase != address(0x0), "coinbase zero");
        require(_coinbase != address(this), "same contract's address");
        require(_coinbase != owner, "same owner's address");
        require(_coinbase != msg.sender, "same sender's address");
        _;
    }

    modifier notBanned() {
        require(sealers[msg.sender].status != SealerStatus.PENALIZED, "banned ");
        _;
    }

    modifier joinable() {
        require(sealers[msg.sender].status != SealerStatus.ACTIVE, "already joined ");
        require(sealers[msg.sender].balance >= MIN_NTF_AMOUNT, "not enough ntf");
        _;
    }

    modifier leaveable() {
        require(sealers[msg.sender].status == SealerStatus.ACTIVE, "not joined ");
        _;
    }

    modifier withdrawable() {
        require(sealers[msg.sender].status != SealerStatus.ACTIVE, "NTF locked while sealing");
        uint256 currentBlock = block.number;
        //distance from current block to the block, that sealer leaved sealers set
        uint256 distance = currentBlock.sub(sealers[msg.sender].leavedBlocknumber);
        //withdrawl period
        require(distance >= MIN_BLOCKS_DISTANCE, "NTF still locked after leaving");
        _;
    }

    //only voting smart contract
    modifier onlyVoteContract() {
        require(msg.sender == voteAddress, "only voting contract");
        _;
    }

    /**
    *contract initialize
    */
    function NextyManager(address _ntfAddress, address _voteAddress) public {
        ntfAddress = _ntfAddress;
        voteAddress = _voteAddress;
    }

    //change voting smart contract address
    function moveVoteContract(address _to) public onlyOwner {
        voteAddress = _to;
    }

    //get bann status of a sealer's address
    function isBanned(address _address) public view {
        return (sealers[_address].status == SealerStatus.PENALIZED);
    }

    //voting contract's function
    function sealerLock(address _address) external onlyVoteContract {
        address _coinbase = sealers[msg.sender].coinbase;

        sealers[msg.sender].coinbase = 0x0;
        sealers[msg.sender].status = SealerStatus.PENALIZED;
        sealers[msg.sender].leavedBlocknumber = block.number;
        delete getSealer[_coinbase];
        removeCoinbase(_coinbase);
        emit Banned(_address);
    }

    function sealerUnlock(address _address) external onlyVoteContract {
        sealers[_address].status = SealerStatus.PENDING_WITHDRAW;
        emit Unbanned(_address);
    }

    ////////////////////////////////

    function addCoinbase(address _coinbase) internal {
        isCoinbase[_coinbase] = true;
        coinbases.push(_coinbase);
    }

    function removeCoinbase(address _coinbase) internal {
        isCoinbase[_coinbase] = false;
        for (uint i = 0; i < coinbases.length; i++) {
            if (_coinbase == coinbases[i]) {
                coinbases[i] = coinbases[coinbases.length - 1];
                coinbases.length--;
                return;
            }
        }
    }

    /**
    * Transfer the NTF from token holder to registration contract. 
    * Sealer might have to approve contract to transfer an amount of NTF before calling this function.
    * @param tokens NTF Tokens to deposit
    */
    function deposit(uint256 tokens) public returns (bool) {
        NTFToken(ntfAddress).transferFrom(msg.sender, address(this), tokens);
        sealers[msg.sender].balance = (sealers[msg.sender].balance).add(tokens);
        emit Deposited(msg.sender, tokens);
        return true;
    }
        
    /**
    * To allow deposited NTF participate joining in as sealer. 
    * Participate already must deposit enough NTF via Deposit function. 
    * It takes coinbase as parameter.
    * @param _coinbase Destination address
    */
    function join(address _coinbase) public notBanned joinable validCoinbase(_coinbase) returns (bool) {
        sealers[msg.sender].coinbase = _coinbase;
        sealers[msg.sender].status = SealerStatus.ACTIVE;
        getSealer[_coinbase] = msg.sender;
        addCoinbase(_coinbase);
        emit Joined(msg.sender, _coinbase);
        return true;
    }

    /**
    * Request to exit out of activation sealer set
    */
    function leave() public notBanned leaveable returns (bool) {
        address _coinbase = sealers[msg.sender].coinbase;

        sealers[msg.sender].coinbase = 0x0;
        sealers[msg.sender].status = SealerStatus.PENDING_WITHDRAW;
        sealers[msg.sender].leavedBlocknumber = block.number;
        delete getSealer[_coinbase];
        removeCoinbase(_coinbase);
        emit Leaved(msg.sender, _coinbase);
        return true;
    }

    /**
    * To withdraw sealer’s NTF balance when they already exited and after withdrawal period.
    */
    function withdraw() public notBanned withdrawable returns (bool) {
        uint256 tokens = sealers[msg.sender].balance;
        //NTFToken(ntfAddress).transfer(msg.sender, tokens);
        sealers[msg.sender].status = SealerStatus.WITHDRAWN;
        emit Withdrawn(msg.sender, tokens);
        return true;
    }

}