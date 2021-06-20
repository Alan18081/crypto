const DappToken = artifacts.require('./DappToken');

contract('DappToken', accounts => {

    it('sets the total supply upon deployment', async () => {
       const instance = await DappToken.deployed();
       const value = await instance.totalSupply();
       assert.equal(value.toNumber(), 1000000);
    });

});
