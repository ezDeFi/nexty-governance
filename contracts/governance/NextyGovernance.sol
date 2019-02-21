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
    // zero address
    address constant ZERO_ADDRESS = address(0x0);

    enum Status {
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

    struct Account {
        Status status;
        // ntf amount deposited
        uint256 balance;
        // delegated address to seal blocks
        address signer;
        // withdrawable time after leaving
        uint256 unlockTime;
    }

    // Consensus variables

    // index = 0
    // signers array
    address[] public signers;

    // index = 1
    // signer => coinbase (beneficiary address) map
    mapping(address => address) public signerCoinbase;

    // End of consensus variables

    // coinbase => NTF Account map
    mapping(address => Account) public account;

    // NTF token contract, unit used to join Nexty sealers
    IERC20 public token;

    event Deposited(address _sealer, uint _amount);
    event Joined(address _sealer, address _signer);
    event Left(address _sealer, address _signer);
    event Withdrawn(address _sealer, uint256 _amount);
    event Banned(address _sealer);
    event Unbanned(address _sealer);

    /**
    * Check if address is a valid destination to transfer tokens to
    * - must not be zero address
    * - must not be the token address
    * - must not be the sender's address
    */
    modifier validSigner(address _signer) {
        require(signerCoinbase[_signer] != ZERO_ADDRESS, "signer already used");
        require(_signer != ZERO_ADDRESS, "signer zero");
        require(_signer != address(this), "same contract's address");
        require(_signer != msg.sender, "same sender's address");
        _;
    }

    modifier notBanned() {
        require(account[msg.sender].status != Status.PENALIZED, "banned ");
        _;
    }

    modifier joinable() {
        require(account[msg.sender].status != Status.ACTIVE, "already joined ");
        require(account[msg.sender].balance >= MIN_NTF_AMOUNT, "not enough ntf");
        _;
    }

    modifier leaveable() {
        require(account[msg.sender].status == Status.ACTIVE, "not joined ");
        _;
    }

    modifier withdrawable() {
        require(isWithdrawable(msg.sender), "unable to withdraw at the moment");
        _;
    }

    /**
    * contract initialize
    */
    constructor(address _token, address[] memory _signers) public {
        token = IERC20(_token);
        for (uint i = 0; i < _signers.length; i++) {
            signers.push(_signers[i]);
            signerCoinbase[_signers[i]] = _signers[i];
            account[_signers[i]].signer = _signers[i];
            account[_signers[i]].status = Status.ACTIVE;    
        }        
    }

    // Get ban status of a sealer's address
    function isBanned(address _address) public view returns(bool) {
        return (account[_address].status == Status.PENALIZED);
    }

    ////////////////////////////////

    function addSigner(address _signer) internal {
        signers.push(_signer);
    }

    function removeSigner(address _signer) internal {
        for (uint i = 0; i < signers.length; i++) {
            if (_signer == signers[i]) {
                signers[i] = signers[signers.length - 1];
                signers.length--;
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
        account[msg.sender].balance = (account[msg.sender].balance).add(_amount);
        emit Deposited(msg.sender, _amount);
        return true;
    }
    
    /**
    * To allow deposited NTF participate joining in as sealer. 
    * Participate already must deposit enough NTF via Deposit function. 
    * It takes signer as parameter.
    * @param _signer Destination address
    */
    function join(address _signer) public notBanned joinable validSigner(_signer) returns (bool) {
        account[msg.sender].signer = _signer;
        account[msg.sender].status = Status.ACTIVE;
        signerCoinbase[_signer] = msg.sender;
        addSigner(_signer);
        emit Joined(msg.sender, _signer);
        return true;
    }

    /**
    * Request to exit out of activation sealer set
    */
    function leave() public notBanned leaveable returns (bool) {
        address _signer = account[msg.sender].signer;

        account[msg.sender].signer = ZERO_ADDRESS;
        account[msg.sender].status = Status.PENDING_WITHDRAW;
        account[msg.sender].unlockTime = LOCK_DURATION.add(block.timestamp);
        delete signerCoinbase[_signer];
        removeSigner(_signer);
        emit Left(msg.sender, _signer);
        return true;
    }

    /**
    * To withdraw sealer’s NTF balance when they already exited and after withdrawal period.
    */
    function withdraw() public notBanned withdrawable returns (bool) {
        uint256 amount = account[msg.sender].balance;
        account[msg.sender].balance = 0;
        account[msg.sender].status = Status.WITHDRAWN;        
        token.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
        return true;
    }

    function getStatusCode(Status _status) private pure returns(uint256){
        if (_status == Status.PENDING_ACTIVE) return 0;
        if (_status == Status.ACTIVE) return 1;
        if (_status == Status.PENDING_WITHDRAW) return 2;
        if (_status == Status.WITHDRAWN) return 3;
        return 127;
    }

    function getStatus(address _address) public view returns(uint256) {
        return getStatusCode(account[_address].status);
    }

    function getBalance(address _address) public view returns(uint256) {
        return account[_address].balance;
    }  

    function getCoinbase(address _address) public view returns(address) {
        return account[_address].signer;
    }  

    function getUnlockTime(address _address) public view returns(uint256) {
        return account[_address].unlockTime;
    }

    function isWithdrawable(address _address) public view returns(bool) {
        return 
        (account[_address].status != Status.ACTIVE) && 
        (account[_address].status != Status.PENALIZED) && 
        (account[_address].unlockTime < block.timestamp);
    }
}
