pragma solidity >=0.4.21 <0.6.0;

contract Renting {
    struct Car {
        address owner;
        address rentedBy;
        string description;
        uint price;
        uint rentingTime;
        bool available;
    }

    Car[] public cars;

    event CreatedCarEvent();
    event CreatedRentEvent();

    function getNumCars() public view returns (uint) {
        return cars.length;
    }

    // returns owner address, car description, price, available
    function getCar(uint pos) public view returns (uint, address, string memory, uint, bool, address) {
        Car storage c = cars[pos];
        return (pos, c.owner, c.description, c.price, c.available, c.rentedBy);
    }

    function addCar(string memory _description, uint _price) public returns (bool) {
        Car memory car;
        emit CreatedCarEvent();

        car.owner = msg.sender;
        car.description = _description;
        car.price = _price;
        car.available = true;
        car.rentingTime = 0;

        cars.push(car);

        return true;
    }

    function rentCar(uint pos) public returns (bool) {
        if (cars[pos].available == true) {
            Car storage c = cars[pos];
            c.available = false;
            c.rentedBy = msg.sender;
            c.rentingTime = now;
            emit CreatedRentEvent();
            return true;
        }

        return false;
    }

    function freeCar(uint pos) public payable returns (bool) {
        if (cars[pos].available == false && cars[pos].rentedBy == msg.sender) {
            cars[pos].available = true;
            uint time = now - cars[pos].rentingTime;

            //address(cars[pos].owner).transfer(time * cars[pos].price);
            msg.sender.transfer(time * cars[pos].price);

            cars[pos].rentingTime = 0;
            return true;
        }
        return false;
    }
}