pragma solidity 0.5.1;

contract DappToken {
    // Constructor
    // Set the total number of tokens
    // Read the total number of tokens
    uint public totalSupply;

    constructor() public {
        totalSupply = 1000000;
    }
}
