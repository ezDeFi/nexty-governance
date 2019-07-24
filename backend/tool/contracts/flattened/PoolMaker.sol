
// File: zos-lib/contracts/Initializable.sol

pragma solidity >=0.4.24 <0.6.0;


/**
 * @title Initializable
 *
 * @dev Helper contract to support initializer functions. To use it, replace
 * the constructor with a function that has the `initializer` modifier.
 * WARNING: Unlike constructors, initializer functions must be manually
 * invoked. This applies both to deploying an Initializable contract, as well
 * as extending an Initializable contract via inheritance.
 * WARNING: When used with inheritance, manual care must be taken to not invoke
 * a parent initializer twice, or ensure that all initializers are idempotent,
 * because this is not dealt with automatically as with constructors.
 */
contract Initializable {

  /**
   * @dev Indicates that the contract has been initialized.
   */
  bool private initialized;

  /**
   * @dev Indicates that the contract is in the process of being initialized.
   */
  bool private initializing;

  /**
   * @dev Modifier to use in the initializer function of a contract.
   */
  modifier initializer() {
    require(initializing || isConstructor() || !initialized, "Contract instance has already been initialized");

    bool isTopLevelCall = !initializing;
    if (isTopLevelCall) {
      initializing = true;
      initialized = true;
    }

    _;

    if (isTopLevelCall) {
      initializing = false;
    }
  }

  /// @dev Returns true if and only if the function is running in the constructor
  function isConstructor() private view returns (bool) {
    // extcodesize checks the size of the code stored in an address, and
    // address returns the current address. Since the code is still not
    // deployed when running a constructor, any checks on its code size will
    // yield zero, making it an effective way to detect if a contract is
    // under construction or not.
    uint256 cs;
    assembly { cs := extcodesize(address) }
    return cs == 0;
  }

  // Reserved storage space to allow for layout changes in the future.
  uint256[50] private ______gap;
}

// File: openzeppelin-eth/contracts/ownership/Ownable.sol

pragma solidity ^0.5.0;


/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable is Initializable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    function initialize(address sender) public initializer {
        _owner = sender;
        emit OwnershipTransferred(address(0), _owner);
    }

    /**
     * @return the address of the owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    /**
     * @return true if `msg.sender` is the owner of the contract.
     */
    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    /**
     * @dev Allows the current owner to relinquish control of the contract.
     * @notice Renouncing to ownership will leave the contract without an owner.
     * It will not be possible to call the functions with the `onlyOwner`
     * modifier anymore.
     */
    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0));
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }

    uint256[50] private ______gap;
}

// File: openzeppelin-solidity/contracts/math/SafeMath.sol

pragma solidity ^0.5.0;

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
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
        require(b <= a, "SafeMath: subtraction overflow");
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
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
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
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, "SafeMath: division by zero");
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
        require(b != 0, "SafeMath: modulo by zero");
        return a % b;
    }
}

// File: openzeppelin-solidity/contracts/token/ERC20/IERC20.sol

pragma solidity ^0.5.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP. Does not include
 * the optional functions; to access them see `ERC20Detailed`.
 */
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
     * Emits a `Transfer` event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through `transferFrom`. This is
     * zero by default.
     *
     * This value changes when `approve` or `transferFrom` are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * > Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an `Approval` event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a `Transfer` event.
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
     * a call to `approve`. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// File: openzeppelin-solidity/contracts/token/ERC20/ERC20.sol

pragma solidity ^0.5.0;



/**
 * @dev Implementation of the `IERC20` interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using `_mint`.
 * For a generic mechanism see `ERC20Mintable`.
 *
 * *For a detailed writeup see our guide [How to implement supply
 * mechanisms](https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226).*
 *
 * We have followed general OpenZeppelin guidelines: functions revert instead
 * of returning `false` on failure. This behavior is nonetheless conventional
 * and does not conflict with the expectations of ERC20 applications.
 *
 * Additionally, an `Approval` event is emitted on calls to `transferFrom`.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard `decreaseAllowance` and `increaseAllowance`
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See `IERC20.approve`.
 */
contract ERC20 is IERC20 {
    using SafeMath for uint256;

    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowances;

    uint256 private _totalSupply;

    /**
     * @dev See `IERC20.totalSupply`.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See `IERC20.balanceOf`.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See `IERC20.transfer`.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    /**
     * @dev See `IERC20.allowance`.
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See `IERC20.approve`.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 value) public returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev See `IERC20.transferFrom`.
     *
     * Emits an `Approval` event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of `ERC20`;
     *
     * Requirements:
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `value`.
     * - the caller must have allowance for `sender`'s tokens of at least
     * `amount`.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, _allowances[sender][msg.sender].sub(amount));
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to `approve` that can be used as a mitigation for
     * problems described in `IERC20.approve`.
     *
     * Emits an `Approval` event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender].add(addedValue));
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to `approve` that can be used as a mitigation for
     * problems described in `IERC20.approve`.
     *
     * Emits an `Approval` event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender].sub(subtractedValue));
        return true;
    }

    /**
     * @dev Moves tokens `amount` from `sender` to `recipient`.
     *
     * This is internal function is equivalent to `transfer`, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a `Transfer` event.
     *
     * Requirements:
     *
     * - `sender` cannot be the zero address.
     * - `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _balances[sender] = _balances[sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a `Transfer` event with `from` set to the zero address.
     *
     * Requirements
     *
     * - `to` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }

     /**
     * @dev Destoys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a `Transfer` event with `to` set to the zero address.
     *
     * Requirements
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 value) internal {
        require(account != address(0), "ERC20: burn from the zero address");

        _totalSupply = _totalSupply.sub(value);
        _balances[account] = _balances[account].sub(value);
        emit Transfer(account, address(0), value);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner`s tokens.
     *
     * This is internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an `Approval` event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    /**
     * @dev Destoys `amount` tokens from `account`.`amount` is then deducted
     * from the caller's allowance.
     *
     * See `_burn` and `_approve`.
     */
    function _burnFrom(address account, uint256 amount) internal {
        _burn(account, amount);
        _approve(account, msg.sender, _allowances[account][msg.sender].sub(amount));
    }
}

// File: contracts/ntfPool/CoinShare.sol

pragma solidity ^0.5.0;



contract CoinShare is ERC20{
    using SafeMath for uint256;

    //CPT ZOOMED
    uint256 constant public CPT_ZOOM = 2**40;
    uint256 public COMPRATE;

    mapping(address => int256) private credit;

    // coin per token
    uint256 private cpt;
    uint256 private fund;
    uint256 private lastBalance;

    // Pooltokens are not transferable
    // overwrite ERC20
    function transfer(address to, uint256 value) public returns (bool) {
        return to == address(0) && value == 0;
    }

    function _updateFundCpt()
        internal
    {
        (fund, cpt) = getCurFundCpt();
        lastBalance = address(this).balance;
    }

    function _fundWithdraw(
        address payable _toAddress
    )
        internal
    {
        _updateFundCpt();
        uint256 _fund = fund;
        fund = 0;
        lastBalance = lastBalance.sub(_fund);
        _toAddress.transfer(_fund);
    }

    function _coinWithdraw(
        address payable _member
    )
        internal
    {
        _updateFundCpt();
        uint256 _amount = coinOf(_member);
        credit[_member] = credit[_member] + int256(_amount);
        lastBalance = lastBalance.sub(_amount);
        coinOf(_member);
        _member.transfer(_amount);
    }
    // CREDIT NEGATIVE IN CASE TOKEN WITHDRAW
    // NEED FIXED
    function _updateCredit(
        address _member,
        uint256 _memberBalance
    )
        internal
    {
        credit[_member] = int256(balanceOf(_member).mul(cpt) / CPT_ZOOM) - int256(_memberBalance);
    }

    function coinOf(
        address _member
    )
        internal
        view
        returns(uint256)
    {
        return uint256(
            int256(balanceOf(_member).mul(cpt) / CPT_ZOOM) - credit[_member]
            );
    }

    // read functions
    function getCurFundCpt()
        public
        view
        returns(uint256, uint256)
    {
        uint256 _addedBalance = address(this).balance.sub(lastBalance);
        uint256 _addedFund = _addedBalance * COMPRATE / 100;
        if (totalSupply() == 0) {
            return (fund.add(_addedBalance), 0);
        }
        uint256 _addedCpt = (_addedBalance.sub(_addedFund)).mul(CPT_ZOOM) / totalSupply();
        return (fund.add(_addedFund), cpt.add(_addedCpt));
    }

    function getCoinOf(
        address _member
    )
        public
        view
        returns(uint256)
    {
        (uint256 _fund, uint256 _cpt) = getCurFundCpt();
        return uint256(int256(balanceOf(_member).mul(_cpt) / CPT_ZOOM) - credit[_member]);
    }

    function getMembersBalance()
        public
        view
        returns(uint256)
    {
        (uint256 _fund, uint256 _cpt) = getCurFundCpt();
        return (address(this).balance.sub(_fund));
    }
}

// File: contracts/ntfPool/Lockable.sol

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

// File: contracts/ntfPool/Request.sol

pragma solidity ^0.5.0;


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

// File: contracts/ntfPool/interfaces/GovI.sol

pragma solidity ^0.5.0;

interface GovI {
  function deposit(uint256 _amount) external returns (bool);
  function join(address _signer) external returns (bool);
  function leave() external returns (bool);
  function withdraw() external returns (bool);
  
  function getStatus(address _address) external view returns(uint256);
  function getBalance(address _address) external view returns(uint256);
  function getCoinbase(address _address) external view returns(address);
  function getUnlockHeight(address _address) external view returns(uint256);
  function isWithdrawable(address _address) external view returns(bool);
}

// File: contracts/ntfPool/interfaces/NtfTokenI.sol

pragma solidity ^0.5.0;

interface NtfTokenI {
  function approve(address _spender, uint256 _value) external returns(bool);
  function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
  function transfer(address _to, uint256 _value) external returns (bool);

  function balanceOf(address _address) external view returns(uint256);
}

// File: contracts/ntfPool/NtfPool.sol

pragma solidity ^0.5.0;






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

// File: contracts/PoolMaker.sol

pragma solidity ^0.5.0;


interface NtfPoolI {
    function name() external view returns (string memory);
    function getPoolNtfBalance() external view returns(uint256);
    function getPoolGovBalance() external view returns(uint256);
}

contract PoolMaker {
    address public ntfAddress;
    address public govAddress;
    address[] public pools;
    mapping(address => address) public poolOwner;

    constructor (
        address _ntfAddress,
        address _govAddress
    )
      public
    {
        ntfAddress = _ntfAddress;
        govAddress = _govAddress;
    }

    function createPool(
        address _owner,
        uint256 _COMPRATE,
        uint256 _MAX_LOCK_DURATION,
        uint256 _OWNER_ACTION_DELAY,
        string memory _name,
        string memory _website,
        string memory _location,
        string memory _profile
    )
        public
        returns (address)
    {
        NtfPool ntfPool = new NtfPool(
            _owner,
            ntfAddress,
            govAddress,
            _COMPRATE,
            _MAX_LOCK_DURATION,
            _OWNER_ACTION_DELAY,
            _name,
            _website,
            _location,
            _profile
        );
        pools.push(address(ntfPool));
        poolOwner[address(ntfPool)] = _owner;
        return (address(ntfPool));
    }

    // Read

    function getPoolCount()
        public
        view
        returns(uint256)
    {
        return pools.length;
    }

    function getPool(uint256 i)
        public
        view
        returns(address, address, string memory, uint256, uint256)
    {
        address _pAddress = pools[i];
        address _owner = poolOwner[_pAddress];
        string memory _name = NtfPoolI(_pAddress).name();
        // avaiable balance
        uint256 _poolNtfBalance = NtfPoolI(_pAddress).getPoolNtfBalance();
        // in Gov Ntf balance
        uint256 _poolGovBalance = NtfPoolI(_pAddress).getPoolGovBalance();
        return(_pAddress, _owner, _name, _poolNtfBalance, _poolGovBalance);
    }
}
