pragma solidity ^0.5.0;

import "./tokens/PoolToken.sol";
import "./../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract CoinShare is PoolToken{
    using SafeMath for uint256;

    //CPT ZOOMED
    uint256 constant public CPT_ZOOM = 1000;
    uint256 constant public TAX_PERCENT = 10;

    mapping(address => uint256) private credit;

    // coin per token
    uint256 private cpt;
    uint256 private fund;
    uint256 private lastBalance;

    constructor
    (
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    )
        public
        PoolToken(_name, _symbol, _decimals)
    {
    }

    function _updateCpt()
        internal
    {
        uint256 _addedBalance = address(this).balance.sub(lastBalance);
        uint256 _addedFund = _addedBalance * TAX_PERCENT / 100;
        fund = fund.add(_addedFund);
        lastBalance = address(this).balance;
        if (totalSupply() == 0) cpt = 0;
        cpt = ((address(this).balance).sub(fund)).mul(CPT_ZOOM) / totalSupply();
    }

    function _fundWithdraw(
        address payable _toAddress
    )
        internal
    {
        uint256 _fund = fund;
        fund = 0;
        _toAddress.transfer(_fund);
    }

    function _coinWithdraw(
        address payable _member
    )
        internal
    {
        _updateCpt();
        uint256 _amount = coinOf(_member);
        credit[_member] = credit[_member].add(_amount);
        coinOf(_member);
        _member.transfer(_amount);
    }

    function _updateCredit(
        address _member,
        uint256 _memberBalance
    )
        internal
    {
        // _memberBalance = balanceOf(_member) * cpt - credit
        credit[_member] = balanceOf(_member).mul(cpt).sub(_memberBalance);
    }

    function getCpt()
        public
        view
        returns(uint256)
    {
        return cpt;
    }

    function getFund()
        public
        view
        returns(uint256)
    {
        return fund;
    }

    function coinOf(
        address _member
    )
        public
        view
        returns(uint256)
    {
        return (balanceOf(_member).mul(cpt) / CPT_ZOOM).sub(credit[_member]);
    }

    function creditOf(
        address _member
    )
        public
        view
        returns(uint256)
    {
        return credit[_member];
    }

    function getMembersBalance()
        public
        view
        returns(uint256)
    {
        return (address(this).balance).sub(fund);
    }
}