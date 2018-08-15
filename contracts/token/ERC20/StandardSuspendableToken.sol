pragma solidity ^0.4.24;

import "openzeppelin-zos/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-zos/contracts/math/SafeMath.sol";
import "../../access/Blacklist.sol";


/**
 * @title Standard Suspendable Token
 * @dev Suspendable basic version of StandardToken, with no allowances.
 */
contract StandardSuspendableToken is StandardToken, Blacklist {
  using SafeMath for uint256;

  bytes32 constant ZERO_TX = 0x0000000000000000000000000000000000000000000000000000000000000000;

  struct Transaction {
    bool exist;
    bytes32 txId;
    address from;
    address to;
    uint256 amount;
  }

  mapping(address => uint256) balances;
  address[] holders;
  mapping(address => mapping(bytes32 => Transaction)) pendingTransfers;
  mapping(address => mapping(bytes32 => Transaction)) pendingReceives;
  mapping(address => bytes32[]) pendingSendTnx;
  mapping(address => bytes32[]) pendingReceiveTnx;

  uint256 totalSupply_;

  event TransferCancelled(address from, address to, uint256 value);
  event TransferConfirmed(bytes32 txId, address to);
  event PendingTransfer(address indexed from, address indexed to, uint256 value);

  function initialize(address _sender) isInitializer("StandardSuspendableToken", "0.1")  public {
    Blacklist.initialize(_sender);
  }

  /**
  * @dev total number of tokens in existence
  */
  function totalSupply() public view returns (uint256) {
    return totalSupply_;
  }

  /**
  * @dev Transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_to != address(0x0));
    require(_value > uint256(0x0));
    require(_value <= balances[msg.sender]);
    require(balances[_to] + _value >= balances[_to]);

    if (!blacklist[msg.sender]) {
      if (balances[_to] == uint256(0x0)) {
        holders.push(_to);
      }
      balances[msg.sender] = balances[msg.sender].sub(_value);
      updateHolder(msg.sender);
      balances[_to] = balances[_to].add(_value);
      emit Transfer(msg.sender, _to, _value);
      return true;
    }

    bytes32 _txId = keccak256(abi.encodePacked(abi.encodePacked(msg.sender, _to, _value), block.number));
    pendingTransfers[msg.sender][_txId] = Transaction({
      exist: true,
      txId: _txId,
      from: msg.sender,
      to: _to,
      amount: _value
    });
    pendingSendTnx[msg.sender].push(_txId);
    pendingReceives[_to][_txId] = Transaction({
      exist: true,
      txId: _txId,
      from: msg.sender,
      to: _to,
      amount: _value
    });
    pendingReceiveTnx[_to].push(_txId);
    emit PendingTransfer(msg.sender, _to, _value);
    return true;
  }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));
    require(_value > uint256(0x0));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);

    if (!blacklist[_from] && !blacklist[msg.sender]) {
      if (balances[_to] == uint256(0x0)) {
        holders.push(_to);
      }
      balances[_from] = balances[_from].sub(_value);
      balances[_to] = balances[_to].add(_value);
      allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
      updateHolder(_from);
      emit Transfer(_from, _to, _value);
      return true;
    }

    bytes32 _txId = keccak256(abi.encodePacked(abi.encodePacked(msg.sender, _to, _value), block.number));
    pendingTransfers[_from][_txId] = Transaction({
      exist: true,
      txId: _txId,
      from: _from,
      to: _to,
      amount: _value
    });
    pendingSendTnx[msg.sender].push(_txId);
    pendingReceives[_to][_txId] = Transaction({
      exist: true,
      txId: _txId,
      from: _from,
      to: _to,
      amount: _value
    });
    pendingReceiveTnx[_to].push(_txId);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    emit PendingTransfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Cancel pending transfer for a specified transaction id
   * @param _txId The transaction id to be cancelled.
   */
  function cancelTransfer(bytes32 _txId) public returns (bool) {
    require(_txId != ZERO_TX);
    Transaction memory transaction;
    transaction = pendingTransfers[msg.sender][_txId];
    if (transaction.exist == true && msg.sender == transaction.from) {
      delete pendingTransfers[msg.sender][_txId];
      Transaction memory tnx;
      tnx = pendingReceives[transaction.to][_txId];
      if (tnx.exist == true && transaction.to == tnx.to) {
        delete pendingReceives[transaction.to][_txId];
      }
      emit TransferCancelled(msg.sender, transaction.to, transaction.amount);
      return true;
    }
    return false;
  }

  /**
   * @dev confirm pending transaction to perform token transfer
   * @param _txId The transaction id to confirm.
   */
  function confirmTransfer(bytes32 _txId) public returns (bool) {
    require(_txId != ZERO_TX);
    emit TransferConfirmed(_txId, msg.sender);
    Transaction memory transaction;
    transaction = pendingReceives[msg.sender][_txId];
    if (transaction.exist == true && msg.sender == transaction.to) {
      if (transaction.to == address(0x0)) {
        revert();
      }
      if (transaction.amount > balances[transaction.from]) {
        revert();
      }
      if (balances[transaction.to] + transaction.amount < balances[transaction.to]) {
        revert();
      }
      if (balances[msg.sender] == uint256(0x0)) {
        holders.push(msg.sender);
      }
      balances[transaction.from] = balances[transaction.from].sub(transaction.amount);
      balances[msg.sender] = balances[msg.sender].add(transaction.amount);
      updateHolder(transaction.from);
      if (blacklist[transaction.from] && !blacklist[msg.sender]) {
        blacklist[msg.sender] = true;
        keys.push(msg.sender);
      }
      delete pendingReceives[msg.sender][_txId];

      Transaction memory tnx;
      tnx = pendingTransfers[transaction.from][_txId];
      if (tnx.exist == true && transaction.from == tnx.from) {
        delete pendingTransfers[transaction.from][_txId];
      }
      emit Transfer(transaction.from, msg.sender, transaction.amount);
      return true;
    }
    return false;
  }

  /**
   * @dev Get all pending transfer transactions of the sender
   */
  function getPendingTransfers() public view returns (bytes32[]) {
    return pendingSendTnx[msg.sender];
  }

  /**
   * @dev Get all pending receive transactions of the sender
   */
  function getPendingReceives() public view returns (bytes32[]) {
    return pendingReceiveTnx[msg.sender];
  }

  /**
   * @dev Gets the balance of the specified address.
   * @param _owner The address to query the the balance of.
   * @return An uint256 representing the amount owned by the passed address.
   */
  function balanceOf(address _owner) public view returns (uint256) {
    return balances[_owner];
  }

  /**
   * @dev Get all the list of current token holder.
   * @return array of all token holder.
   */
  function getHolders() public view returns (address[]) {
    return holders;
  }

  /**
   * @dev remove holder if their balance is zero
   */
  function updateHolder(address _holder) internal {
    if (balances[_holder] == uint256(0x0)) {
      for (uint h = 0; h < holders.length; h++) {
        if (_holder == holders[h]) {
          holders[h] = holders[holders.length - 1];
          holders.length--;
          return;
        }
      }
    }
  }
}
