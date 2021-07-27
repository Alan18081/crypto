const DappTokenSale = artifacts.require('./DappTokenSale');
const DappToken = artifacts.require('./DappToken');

contract('DappTokenSale', accounts => {
   let instance;
   let tokenPrice = 1000000000000000;
   let tokensAvailable = 750000;// in wei
   const buyer = accounts[1];
   const admin = accounts[0];

   it('initializes the contract with the correct values', async () => {
       instance = await DappTokenSale.deployed();
       const address = await instance.address;
       assert.notEqual(address, 0x0, 'has contract address');
       const contractValue = await instance.tokenContract();
       assert.notEqual(contractValue, 0x0, 'has token contract');
       const price = await instance.tokenPrice();
       assert.equal(price, tokenPrice, 'token price is correct');
   });

   it('facilitates token buying', async () => {
      const tokenInstance = await DappToken.deployed();
      instance = await DappTokenSale.deployed();
      const numberOfTokens = 10;
      const value = numberOfTokens * tokenPrice;
      await tokenInstance.transfer(instance.address, tokensAvailable, { from: admin });

      const receipt = await instance.buyTokens(numberOfTokens, { from: buyer, value  });
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');

      const saleBalance = await tokenInstance.balanceOf(instance.address);
      assert.equal(saleBalance.toNumber(), tokensAvailable - numberOfTokens, 'number of tokens available for sale has decreased');

      const buyerBalance = await tokenInstance.balanceOf(buyer);
      assert.equal(buyerBalance.toNumber(), numberOfTokens, 'buyer has received bought number of tokens');

      const tokensSold = await instance.tokensSold();
      assert.equal(tokensSold.toNumber(), numberOfTokens, 'increments the number of tokens sold');


      try {
          await instance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
          assert.fail();
      } catch (e) {
          assert(e.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
      }
      try {
           await instance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice });
           assert.fail();
      } catch (e) {
           assert(e.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available for sale in contract');
      }
   });

   it('ends token sale', async () => {
      const tokenInstance = await DappToken.deployed();
      instance = await DappTokenSale.deployed();

      try {
          await instance.endSale({ from: buyer });
          assert.fail();
      } catch (e) {
          assert(e.message.indexOf('revert') >= 0, 'must be admin to end sale');
      }

      await instance.endSale({ from: admin });
      const adminBalance = await tokenInstance.balanceOf(admin);
      assert.equal(adminBalance.toNumber(), 999990, 'returns all unsold dapp tokens to admin');
      const resettedTokenPrice = await instance.tokenPrice();
      assert(resettedTokenPrice, 0, 'tokenPrice should be resetted to 0');
   });
});