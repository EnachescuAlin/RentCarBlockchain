App = {
    web3Provider: null,
    contracts: {},

    init: function () {
        return App.initWeb3();
    },

    // Instance Web3
    initWeb3: function () {
        // Is there an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            // Only useful in a development environment
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    // Instance contract
    initContract: function () {
        $.getJSON('Renting.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            App.contracts.Renting = TruffleContract(data);
            // Set the provider for our contract
            App.contracts.Renting.setProvider(App.web3Provider);
            // Use our contract to retrieve value data
            App.getCars();
        });
        return App.bindEvents();
    },

    bindEvents: function () {

        $(document).on('click', '.btn-value', function (e) {
            var $this = $(this);
            $this.button('loading');
            App.handleAddCar(e);
        });

        $(document).on('click', '.btn-vote', function (e) {
            var $this = $(this);
            $this.button('loading');
            App.handleAddVote(e);
        });

    },

    getCars: function () {
        var carsInstance;
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[1];
            App.contracts.Renting.deployed().then(function (instance) {
                carsInstance = instance;

                carsInstance.getNumCars.call().then(function (numCars) {
                    var wrapperCars = $('#wrapperCars');
                    wrapperCars.empty();
                    var proposalCar = $('#proposalCar');
                    for (var i = 0; i < numCars; i++) {
                        carsInstance.getCar.call(i).then(function (data) {
							var idx = i;
							
                            proposalCar.find('.panel-title').text(data[0]);
                            proposalCar.find('.price').text(data[1]);
                            proposalCar.find('.available').text(data[2]);
                            proposalCar.find('.btn-vote').attr('data-car', idx);
							proposalCar.find('.btn-vote').attr('disabled', false);
							proposalCar.find('.btn-rent').attr('data-car', idx);
							proposalCar.find('.btn-free').attr('data-car', idx);

							if(data[3] == true) {
								proposalCar.find('.btn-rent').attr('disabled', false);
								proposalCar.find('.btn-free').attr('disabled', true);
							}
							else {
								if(data[4] == data[0]) {
									proposalCar.find('.btn-free').attr('disabled', false);
									proposalCar.find('.btn-rent').attr('disabled', true);
								}

								proposalCar.find('.btn-rent').attr('disabled', true);
								proposalCar.find('.btn-free').attr('disabled', true);
							}

                            wrapperCars.append(proposalCar.html());
                        }).catch(function (err) {
                            console.log(err.message);
                        });
                    }
                }).catch(function (err) {
                    console.log(err.message);
                });
            });
        });
        $('button').button('reset');
    },

    handleAddCar: function (event) {
		event.preventDefault();
		
        var carInstance;
		var value = $('.input-value').val();
		
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
			}
			
			var account = accounts[1];
			
            App.contracts.Renting.deployed().then(function (instance) {
                carInstance = instance;
                return carInstance.addCar(value, 1, {
                    from: account, gas: 1000000
                });
            }).then(function (result) {
                var event = carInstance.CreatedCarEvent();
                App.handleEvent(event);
                $('.input-value').val(''); // clean input
            }).catch(function (err) {
                console.log(err.message);
                $('button').button('reset');
            });
        });
    },

    handleAddVote: function (event) {
		event.preventDefault();
		
        var voteInstance;
        var voteValue = parseInt($(event.target).data('vote'));
		var proposalInt = parseInt($(event.target).data('proposal'));
		
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
			}
			
			var account = accounts[1];
			
            App.contracts.Renting.deployed().then(function (instance) {
                voteInstance = instance;
                return voteInstance.vote(proposalInt, voteValue, {
                    from: account,
                    gas: 1000000
                });
            }).then(function (result) {
                var event = voteInstance.CreatedVoteEvent();
                App.handleEvent(event);
            }).catch(function (err) {
                console.log(err.message);
                $('button').button('reset');
            });
        });
    },

    handleEvent: function (event) {
        console.log('Waiting for a event...');
        event.watch(function (error, result) {
            if (!error) {
                App.getCars();
            } else {
                console.log(error);
            }
            event.stopWatching();
        });
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
