pragma solidity 0.6.1;

import "./DappToken.sol";

contract DappTokenSale {
    address payable admin;
    DappToken public tokenContract;
    uint public tokenPrice;
    uint public tokensSold;

    event Sell(address _buyer, uint _amount);

    constructor(DappToken _tokenContract, uint _tokenPrice) public {
        // Assign an admin (address with specific privileges)
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
        // Token Contract
        // Token Price
    }

    // multiply function
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint _numberOfTokens) public payable {
        // Require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // Require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Require that transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        // Keep track of tokensSold
        tokensSold += _numberOfTokens;
        // Emit Sell Event
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        // Require admin
        require(msg.sender == admin);
        // Transfer remaining dapp tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        // Destroy contract
        selfdestruct(admin);
    }
}