pragma solidity ^0.5.0;

import "./../../../node_modules//openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./ERC20Detailed.sol";
import "./NtfTokenI.sol";
 
contract PoolToken is ERC20, ERC20Detailed{

    NtfTokenI public ntfToken;
    constructor
    (
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    )
        public
        ERC20Detailed(_name, _symbol, _decimals)
    {
    }
}