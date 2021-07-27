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
        const success = await instance.transfer.call(accounts[1], 40000, { from: accounts[0] });
        assert.equal(success, true, 'it returns true');
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

    it('approves tokens for delegated transfer', async () => {
        const instance = await DappToken.deployed();
        const success = await instance.approve.call(accounts[1], 100);
        assert.equal(success, true, 'it returns true');
        const receipt = await instance.approve(accounts[1], 100);
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
        assert.equal(receipt.logs[0].args._owner, accounts[0], 'should log the account the tokens are authorized by');
        assert.equal(receipt.logs[0].args._spender, accounts[1], 'should log the account the tokens are authorized 2');
        assert.equal(receipt.logs[0].args._value, 100, 'should log the transfer amount');
        const result = await instance.allowance(accounts[0], accounts[1]);
        assert.equal(result.toNumber(), 100, 'stores the allowance for delegated transfer');
    });

    it('handles delegated token transfers', async () => {
       const instance = await DappToken.deployed();
       const fromAccount = accounts[2];
       const toAccount = accounts[3];
       const spendingAccount = accounts[4];
       // Transfer some tokens to fromAccount
        await instance.transfer(fromAccount, 100, { from: accounts[0] });
        await instance.approve(spendingAccount, 10, { from: fromAccount });
        // Try transferring something larger than the sender's balance
        try {
            await instance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
            assert.fail();
        } catch (e) {
            assert(e.message.indexOf('revert') >= 0, 'cannot transfer value that is larger than account amount');
        }
        // Try transferring something larger than the approved amount
        try {
            await instance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
            assert.fail();
        } catch (e) {
            assert(e.message.indexOf('revert') >= 0, 'cannot transfer value that is larger than approved amount');
        }
        const success = await instance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
        assert.equal(success, true, 'it returns true');
        const receipt = await instance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(receipt.logs[0].args._from, fromAccount, 'should log the account the tokens are transferred from');
        assert.equal(receipt.logs[0].args._to, toAccount, 'should log the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value, 10, 'should log the transfer amount');
        const fromBalance = await instance.balanceOf(fromAccount);
        assert.equal(fromBalance.toNumber(), 90, 'it should have subtracted amount');
        const toBalance = await instance.balanceOf(toAccount);
        assert.equal(toBalance.toNumber(), 10, 'it should have added amount');
        const allowanceAmount = await instance.allowance(fromAccount, spendingAccount);
        assert.equal(allowanceAmount.toNumber(), 0, 'it should deduct the allowance amount');
    });
});
