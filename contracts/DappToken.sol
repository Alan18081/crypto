pragma solidity 0.5.1;

contract DappToken {
    // Name
    string public name = "DApp Token";
    string public symbol = "DAPP";
    string public standard = "DApp Token v1.0";

    event Transfer(address _from, address _to, uint _value);

    uint public totalSupply;
    mapping(address => uint) public balanceOf;

    // Constructor
    // Set the total number of tokens
    // Read the total number of tokens
    constructor(uint _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
        // allocate the initial supply
    }

    // Transfer
    function transfer(address _to, uint _value) public returns (bool success) {
        // Exception
        require(balanceOf[msg.sender] >= _value);
        // Exception if account doesn't have enough
        // Return a boolean
        // Transfer event
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}
