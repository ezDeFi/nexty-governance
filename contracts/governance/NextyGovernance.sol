pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/**
 * @title Nexty sealers management smart contract
 */
contract NextyGovernance {
    using SafeMath for uint256;

    // minimum of deposited NTF to join
    uint256 public constant MIN_NTF_AMOUNT = 100;
    // minimum blocks number distance from last leaved to current chain blocknumber to withdrawable
    uint256 public constant LOCK_DURATION = 5 * 60;

    enum SealerStatus {
        PENDING_ACTIVE,     // Sealer deposited enough NTFs into registration contract successfully.

        ACTIVE,             // Sealer send request to become a sealer 
                            // and added into activation sealer set successfully

        PENDING_WITHDRAW,   // Sealer send request to exit from activation sealer set successfully. 
                            // Sealer casted out of activation sealer set

        WITHDRAWN,          // Sealer already withdrawn their deposit NTFs successfully. 
                            // They can only make withdrawal after withdrawal period.

        PENALIZED           //Sealer marked as penalized node (update by consensus or voting result via dapp) 
                            //and cannot become active sealer and cannot withdraw balance neither.
    }

    struct SealerRecord {
        SealerStatus status;
        //ntf amount deposited
        uint256 balance;
        //sealer used address to seal blocks
        address coinbase;
        //withdrawable time after leaving
        uint256 unlockTime;
    }

    // Consensus variables

    // index = 0
    // coinbase array
    address[] public coinbases;

    // index = 1
    // coinbase => sealer map
    mapping(address => address) public cbSealer;

    // End of consensus variables

    // NTF token contract, unit used to join Nexty sealers
    IERC20 public token;

    // coinbase => SealerRecord map
    mapping(address => SealerRecord) public cbSealerRecord;

    event Deposited(address _sealer, uint _amount);
    event Joined(address _sealer, address _coinbase);
    event Left(address _sealer, address _coinbase);
    event Withdrawn(address _sealer, uint256 _amount);
    event Banned(address _sealer);
    event Unbanned(address _sealer);

    /**
    * Check if address is a valid destination to transfer tokens to
    * - must not be zero address
    * - must not be the token address
    * - must not be the sender's address
    */
    modifier validCoinbase(address _coinbase) {
        require(cbSealer[_coinbase] != address("0x0"), "coinbase already used");
        require(_coinbase != address(0x0), "coinbase zero");
        require(_coinbase != address(this), "same contract's address");
        require(_coinbase != msg.sender, "same sender's address");
        _;
    }

    modifier notBanned() {
        require(cbSealerRecord[msg.sender].status != SealerStatus.PENALIZED, "banned ");
        _;
    }

    modifier joinable() {
        require(cbSealerRecord[msg.sender].status != SealerStatus.ACTIVE, "already joined ");
        require(cbSealerRecord[msg.sender].balance >= MIN_NTF_AMOUNT, "not enough ntf");
        _;
    }

    modifier leaveable() {
        require(cbSealerRecord[msg.sender].status == SealerStatus.ACTIVE, "not joined ");
        _;
    }

    modifier withdrawable() {
        require(isWithdrawable(msg.sender), "unable to withdraw at the moment");
        _;
    }

    /**
    * contract initialize
    */
    constructor(address _token, address[] memory _sealers) public {
        token = IERC20(_token);
        for (uint i = 0; i < _sealers.length; i++) {
            coinbases.push(_sealers[i]);
            cbSealer[_sealers[i]] = _sealers[i];
            cbSealerRecord[_sealers[i]].coinbase = _sealers[i];
            cbSealerRecord[_sealers[i]].status = SealerStatus.ACTIVE;    
        }        
    }

    // Get ban status of a sealer's address
    function isBanned(address _address) public view returns(bool) {
        return (cbSealerRecord[_address].status == SealerStatus.PENALIZED);
    }

    ////////////////////////////////

    function addCoinbase(address _coinbase) internal {
        coinbases.push(_coinbase);
    }

    function removeCoinbase(address _coinbase) internal {
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
    * @param _amount NTF Tokens to deposit
    */
    function deposit(uint256 _amount) public returns (bool) {
        token.transferFrom(msg.sender, address(this), _amount);
        cbSealerRecord[msg.sender].balance = (cbSealerRecord[msg.sender].balance).add(_amount);
        emit Deposited(msg.sender, _amount);
        return true;
    }
    
    /**
    * To allow deposited NTF participate joining in as sealer. 
    * Participate already must deposit enough NTF via Deposit function. 
    * It takes coinbase as parameter.
    * @param _coinbase Destination address
    */
    function join(address _coinbase) public notBanned joinable validCoinbase(_coinbase) returns (bool) {
        cbSealerRecord[msg.sender].coinbase = _coinbase;
        cbSealerRecord[msg.sender].status = SealerStatus.ACTIVE;
        cbSealer[_coinbase] = msg.sender;
        addCoinbase(_coinbase);
        emit Joined(msg.sender, _coinbase);
        return true;
    }

    /**
    * Request to exit out of activation sealer set
    */
    function leave() public notBanned leaveable returns (bool) {
        address _coinbase = cbSealerRecord[msg.sender].coinbase;

        cbSealerRecord[msg.sender].coinbase = 0x0000000000000000000000000000000000000000;
        cbSealerRecord[msg.sender].status = SealerStatus.PENDING_WITHDRAW;
        cbSealerRecord[msg.sender].unlockTime = LOCK_DURATION.add(block.timestamp);
        delete cbSealer[_coinbase];
        removeCoinbase(_coinbase);
        emit Left(msg.sender, _coinbase);
        return true;
    }

    /**
    * To withdraw sealer’s NTF balance when they already exited and after withdrawal period.
    */
    function withdraw() public notBanned withdrawable returns (bool) {
        uint256 amount = cbSealerRecord[msg.sender].balance;
        cbSealerRecord[msg.sender].balance = 0;
        cbSealerRecord[msg.sender].status = SealerStatus.WITHDRAWN;        
        token.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
        return true;
    }

    function getStatusCode(SealerStatus _status) private pure returns(uint256){
        if (_status == SealerStatus.PENDING_ACTIVE) return 0;
        if (_status == SealerStatus.ACTIVE) return 1;
        if (_status == SealerStatus.PENDING_WITHDRAW) return 2;
        if (_status == SealerStatus.WITHDRAWN) return 3;
        return 127;
    }

    function getStatus(address _address) public view returns(uint256) {
        return getStatusCode(cbSealerRecord[_address].status);
    }

    function getBalance(address _address) public view returns(uint256) {
        return cbSealerRecord[_address].balance;
    }  

    function getCoinbase(address _address) public view returns(address) {
        return cbSealerRecord[_address].coinbase;
    }  

    function getUnlockTime(address _address) public view returns(uint256) {
        return cbSealerRecord[_address].unlockTime;
    }

    function isWithdrawable(address _address) public view returns(bool) {
        return
        (cbSealerRecord[_address].status != SealerStatus.ACTIVE)&&
        (cbSealerRecord[_address].status != SealerStatus.PENALIZED)&&
        (cbSealerRecord[_address].unlockTime < block.timestamp);
    }
}
