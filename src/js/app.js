const App = {
    web3Provider: null,
    web3: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokensAvailable: 750000,
    init() {
        console.log('App initialized');
        $('form').on('submit', this.buyTokens.bind(this));
        return this.initWeb3();
    },
    initWeb3() {
        console.log(window.ethereum);
        // console.log(window.ethereum.isMetamask);
      if (this.web3) {
          this.web3Provider = this.web3.currentProvider;
      } else if (window.ethereum && window.ethereum.isMetaMask) {
          this.web3 = new Web3(window.web3.currentProvider);
          window.ethereum.enable();
          this.web3Provider = this.web3.currentProvider;
      }
      else {
          this.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
          this.web3 = new Web3(this.web3Provider);
      }
      return this.initContracts();
    },
    initContracts() {
        $.getJSON('DappTokenSale.json', dappTokenSale => {
            console.log(dappTokenSale);
            this.contracts.DappTokenSale = TruffleContract(dappTokenSale);
            this.contracts.DappTokenSale.setProvider(this.web3Provider);
            console.log('Before failure');
            this.contracts.DappTokenSale.deployed().then(deployed => {
                console.log('Dapp token sale address:', deployed.address);
            })
            console.log('After failure');
        }).done(() => {
           $.getJSON('DappToken.json', dappToken => {
              this.contracts.DappToken = TruffleContract(dappToken);
              this.contracts.DappToken.setProvider(this.web3Provider);
              this.contracts.DappToken.deployed().then(deployed => {
                 console.log('Dapp token address:', deployed.address);
              });
              // this.listenForEvents();
              return this.render();
           });
        });
    },
    async listenForEvents() {
        const instance = await this.contracts.DappTokenSale.deployed();
        // const res = await instance.getPastEvents('Sell', {
        //     fromBlock: 0,
        //     toBlock: 'latest'
        // });
        // console.log(res);
        // console.log(instance.Sell({}, {
        //     fromBlock: 0,
        //     toBlock: 'latest'
        // }).then(res => console.log(res)));
        console.log(instance.Sell({}, {
            fromBlock: 0,
            toBlock: 'latest'
        }, (err, res) => console.log(err, res)));
        // console.log(instance.Sell().on('Sell', (err, event) => {
        //     console.log('event triggered', event);
        //     this.render();
        // }))
        // const event = await instance.Sell();
        // event.on('data', (err, event) => {
        //     console.log('event triggered', event);
        //     this.render();
        // })
    },
    async render() {
        if (this.loading) {
            return;
        }
        this.loading = true;
        const loader = $('#loader');
        const content = $('#content');

        loader.show();
        content.hide();

        // Load account data
        this.web3.eth.getCoinbase((err, account) => {
           if (!err) {
               this.account = account;
               $('#accountAddress').html('Your account: ' + account);
           }
        });
        console.log('Here')
        const dappTokenSaleInst = await this.contracts.DappTokenSale.deployed();
        console.log('Here #2')
        this.tokenPrice = await dappTokenSaleInst.tokenPrice();
        $('.token-price').html(this.web3.utils.fromWei(this.tokenPrice, 'ether'));
        this.tokensSold = await dappTokenSaleInst.tokensSold();
        $('.tokens-sold').html(this.tokensSold.toNumber());
        $('.tokens-available').html(this.tokensAvailable);

        const progressPercent = (this.tokensSold / this.tokensAvailable) * 100;
        $('#progress').css('width', progressPercent + '%');

        const dappTokenInst = await this.contracts.DappToken.deployed();
        const balance = await dappTokenInst.balanceOf(this.account);
        $('.dapp-balance').html(balance.toNumber());

        // Show ready content on the page
        this.loading = false;
        loader.hide();
        content.show();
    },
    async buyTokens(e) {
        e.preventDefault();
        $('#content').hide();
        $('#loader').show();

        const numberOfTokens = $('#numberOfTokens').val();
        const deployedInstance = await this.contracts.DappTokenSale.deployed();
        console.log({
            from: this.account,
            value: numberOfTokens * this.tokenPrice,
            gas: 500000
        });
        console.log(numberOfTokens);
        const result = await deployedInstance.buyTokens(numberOfTokens, {
            from: this.account,
            value: numberOfTokens * this.tokenPrice,
            gas: 500000
        });
        console.log('Tokens bought');
        $('form').trigger('reset');

        $('#loader').hide();
        $('#content').show();
    }
}

$(() => {
    $(window).load(() => {
       App.init();
    });
});