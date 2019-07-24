pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

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