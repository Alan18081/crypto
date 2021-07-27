pragma solidity 0.6.1;

contract DappToken {
    // Name
    string public name = "DApp Token";
    string public symbol = "DAPP";
    string public standard = "DApp Token v1.0";

    event Transfer(address _from, address _to, uint _value);
    event Approval(address _owner, address _spender, uint _value);
    // transfer event

    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    // allowance

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

    // Delegated Transfer
    // approve
    function approve(address _spender, uint _value) public returns (bool success) {
        // allowance
        allowance[msg.sender][_spender] = _value;
        // Approval
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    // transferFrom
    function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
        // Require _from has enough tokens
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        // Change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // Update the allowance
        allowance[_from][msg.sender] -= _value;

        // Transfer event
        emit Transfer(_from, _to, _value);
        return true;
    }
}
