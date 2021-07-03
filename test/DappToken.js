const DappToken = artifacts.require('./DappToken');

contract('DappToken', accounts => {

    it('should initialize the contract with correct values', async () => {
       const instance = await DappToken.deployed();
       const name = await instance.name();
       assert.equal(name, 'DApp Token');
       const symbol = await instance.symbol();
       assert.equal(symbol, 'DAPP');
       const standard = await instance.standard();
       assert.equal(standard, 'DApp Token v1.0')
    });

    it('sets the total supply upon deployment', async () => {
       const instance = await DappToken.deployed();
       const value = await instance.totalSupply();
       assert.equal(value.toNumber(), 1000000, 'sets the total supply to 1,000,000');
       const adminBalance = await instance.balanceOf(accounts[0]);
       assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin');
    });

    it('should transfer ownership', async () => {
       const instance = await DappToken.deployed();
       const receipt = await instance.transfer(accounts[1], 250000, { from: accounts[0] });
       assert.equal(receipt.logs.length, 1, 'triggers one event');
       assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
       assert.equal(receipt.logs[0].args._from, accounts[0], 'should log the account the tokens are transferred from');
       assert.equal(receipt.logs[0].args._to, accounts[1], 'should log the account the tokens are transferred to');
       assert.equal(receipt.logs[0].args._value, 250000, 'should log the transfer amount');
       const receiverBalance = await instance.balanceOf(accounts[1]);
       const senderBalance = await instance.balanceOf(accounts[0]);
       assert.equal(receiverBalance.toNumber(), 250000, 'adds the amount to the receiving account');
       assert.equal(senderBalance.toNumber(), 750000, 'subtracts the amount from the receiving account');
    });

    it('should fail if invalid amount is provided', async () => {
        try {
            const instance = await DappToken.deployed();
            await instance.transfer.call(accounts[1], 99999999999999);
            assert.fail();
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'error message must contain revert');
        }
    });

    it('should return true for "transfer"', async () => {
        const instance = await DappToken.deployed();
        const success = await instance.transfer.call(accounts[1], 30000);
        assert.equal(success, true, 'it returns true');
    });
});
