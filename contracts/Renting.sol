pragma solidity >=0.4.21 <0.6.0;

contract Renting {
    struct Car {
        address owner;
        address rentedBy;
        string description;
        uint price;
        bool available;
    }

    Car[] public cars;

    function getNumCars() public view returns (uint) {
        return cars.length;
    }

    // returns owner address, car description, price, available
    function getCar(uint pos) public view returns (address, string memory, uint, bool) {
        Car storage c = cars[pos];
        return (c.owner, c.description, c.price, c.available);
    }

    function addCar(string memory _description, uint _price) public returns (bool) {
        Car memory car;
        car.owner = msg.sender;
        car.description = _description;
        car.price = _price;
        car.available = true;

        cars.push(car);

        return true;
    }

    function rentCar(uint pos) public returns (bool) {
        if (cars[pos].available == true) {
            Car storage c = cars[pos];
            c.available = false;
            c.rentedBy = msg.sender;
            return true;
        }

        return false;
    }

    function freeCar(uint pos) public returns (bool) {
        if (cars[pos].available == false && cars[pos].rentedBy == msg.sender) {
            cars[pos].available = true;
            return true;
        }
        return false;
    }
}