App = {
    web3Provider: null,
    contracts: {},

    account: "",

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

            web3.eth.getAccounts(function (error, accounts) {
                if (error) {
                    console.log(error);
                }

                var wrapperAccounts = $('#wrapperAccounts');

                accounts.forEach(account => {
                    wrapperAccounts.append(`<option value=${account}> ${account} </option>`);
                })

            })

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

        $(document).on('click', '.btn-rent', function (e) {
            var $this = $(this);
            $this.button('loading');
            App.handleRentCar(e);
        });

        $(document).on('click', '.btn-free', function (e) {
            var $this = $(this);
            $this.button('loading');
            App.handleFreeCar(e);
        });

    },

    getCars: function () {
        var carsInstance;

        // web3.eth.getAccounts(function (error, accounts) {
        //     if (error) {
        //         console.log(error);
        // 	}

        // var account = accounts[1];

        App.contracts.Renting.deployed().then(function (instance) {
            carsInstance = instance;

            carsInstance.getNumCars.call().then(function (numCars) {
                var wrapperCars = $('#wrapperCars');
                wrapperCars.empty();
				var proposalCar = $('#proposalCar');
				
                for (var i = 0; i < numCars; i++) {
                    carsInstance.getCar.call(i).then(function (data) {
                    // carsInstance.getCar(i, {
                    //     from: account,
                    //     gas: 1000000
                    // }).then(function (data) {
                        var idx = i;

                        proposalCar.find('.panel-title').text(data[1]);
                        proposalCar.find('.price').text(data[2]);
                        proposalCar.find('.available').text(data[3]);
                        proposalCar.find('.btn-rent').attr('data-car', idx);
                        proposalCar.find('.btn-free').attr('data-car', idx);

                        if (data[3] == true) {
                            proposalCar.find('.btn-rent').attr('disabled', false);
                            proposalCar.find('.btn-free').attr('disabled', true);
                        } else {
                            if (data[4] == account) {
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
        }).catch(function (err) {
			console.log(err.message);
		});
        // });
        $('button').button('reset');
    },

    handleAddCar: function (event) {
        event.preventDefault();

        var carInstance;
        account = $('#wrapperAccounts').val();
        var value = $('.input-value').val();
        var price = $('.input-price').val();

        console.log(account, value, price)

        // web3.eth.getAccounts(function (error, accounts) {
        //     if (error) {
        //         console.log(error);
        // 	}

        // var account = accounts[1];

        App.contracts.Renting.deployed().then(function (instance) {
            carInstance = instance;

            return carInstance.addCar(value, price, {
                from: account,
                gas: 1000000
            });
        }).then(function (result) {
            var event = carInstance.CreatedCarEvent();
            App.handleEvent(event);

            $('.input-value').val(''); // clean input
            $('.input-price').val(''); // clean price
        }).catch(function (err) {
            console.log(err.message);
            $('button').button('reset');
        });
        // });
    },

    handleRentCar: function (event) {
        event.preventDefault();

        var carInstance;
        var carInt = parseInt($(event.target).data('car'));

        // web3.eth.getAccounts(function (error, accounts) {
        // if (error) {
        //     console.log(error);
        // }

        // var account = accounts[1];

        App.contracts.Renting.deployed().then(function (instance) {
            carInstance = instance;

            return carInstance.rentCar(carInt, {
                from: account,
                gas: 1000000
            });
        }).then(function (result) {
            var event = carInstance.CreatedRentEvent();
            App.handleEvent(event);

        }).catch(function (err) {
            console.log(err.message);
            $('button').button('reset');
        });
        // });
    },

    handleFreeCar: function (event) {
        event.preventDefault();

        var carInstance;
        var carInt = parseInt($(event.target).data('car'));

        // web3.eth.getAccounts(function (error, accounts) {
        // if (error) {
        //     console.log(error);
        // }

        // var account = accounts[1];

        App.contracts.Renting.deployed().then(function (instance) {
            carInstance = instance;

            return carInstance.freeCar(carInt, {
                from: account,
                gas: 1000000
            });
        }).then(function (result) {
            var event = carInstance.CreatedCarEvent();
            App.handleEvent(event);

        }).catch(function (err) {
            console.log(err.message);
            $('button').button('reset');
        });
        // });
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
