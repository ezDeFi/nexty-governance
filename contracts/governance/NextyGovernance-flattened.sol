pragma solidity ^0.5.0;

library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     *
     * _Available since v2.4.0._
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
/**
 * @title Nexty sealers management smart contract
 */
contract NextyGovernance {
    using SafeMath for uint256;

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
        // withdrawable block number after leaving
        uint256 unlockHeight;
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

    // minimum of deposited NTF to join
    uint256 public stakeRequire;
    // minimum number of blocks signer has to wait from leaving block to withdraw the fund
    uint256 public stakeLockHeight;

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
        require(signerCoinbase[_signer] == ZERO_ADDRESS, "coinbase already used");
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
        require(account[msg.sender].balance >= stakeRequire, "not enough ntf");
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
    constructor(address _token, uint256 _stakeRequire, uint256 _stakeLockHeight, address[] memory _signers) public {
        token = IERC20(_token);
        stakeRequire = _stakeRequire;
        stakeLockHeight = _stakeLockHeight;
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
        account[msg.sender].unlockHeight = stakeLockHeight.add(block.number);
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

    function getUnlockHeight(address _address) public view returns(uint256) {
        return account[_address].unlockHeight;
    }

    function isWithdrawable(address _address) public view returns(bool) {
        return 
        (account[_address].status != Status.ACTIVE) && 
        (account[_address].status != Status.PENALIZED) && 
        (account[_address].unlockHeight < block.number);
    }
}
