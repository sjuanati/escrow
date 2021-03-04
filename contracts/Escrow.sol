// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract Escrow {

    enum Status {OFFER, ORDER, COMPLETE, COMPLAIN}
    
    struct Order {
        address buyer;
        uint256 ordered;
        Status status;
    }
    
    struct Item {
        address seller;
        uint256 price;
        uint256 amount;
        Order[] orders;
    }

    mapping(string => Item) public items;
    
    function offer(string memory _name, uint256 _price, uint256 _amount) external {
        if (items[_name].seller == address(0)) {
            // Item does not exist
            items[_name].seller = msg.sender;
            items[_name].price = _price;
            items[_name].amount = _amount;
            //items[_name] = Item(msg.sender, _price, _amount, new Order[](0));
        } else {
            // Item exists
            items[_name].price = _price;
            items[_name].amount += _amount;
        }
    }
    
    function order(string memory _name, uint256 _amount) payable external {
        Item storage item = items[_name];
        require(item.seller != address(0), 'Item does not exist');
        require(item.amount >= _amount, 'Amount not available');
        require(_amount * item.price == msg.value, 'Price sent is not equal to product price');
        item.orders.push(Order(msg.sender, _amount, Status.ORDER));
        item.amount -= _amount;
    }
    
    function complete(string memory _name) external {
        Item storage item = items[_name];
        bool found = false;
        for (uint256 i=0; i<item.orders.length; i++) {
            if (item.orders[i].buyer == msg.sender && item.orders[i].status == Status.ORDER) {
                item.orders[i].status = Status.COMPLETE;
                payable(item.seller).transfer(item.orders[i].ordered * item.price);
                found = true;
                break;
            }
        }
        if (!found) revert('Item not ordered or in different status than ORDER');
    }
    
    function complain(string memory _name) external {
        Item storage item = items[_name];
        bool found = false;
        for (uint256 i=0; i<item.orders.length; i++) {
            if (item.orders[i].buyer == msg.sender && item.orders[i].status == Status.ORDER) {
                item.orders[i].status = Status.COMPLAIN;
                payable(item.orders[i].buyer).transfer(item.orders[i].ordered * item.price);
                found = true;
                break;
            }
        }
        if (!found) revert('Item not ordered or in different status than ORDER');
    }
    
    function getOrder(string memory _name) external view returns (uint256 _ordered, Status _status) {
        for (uint256 i=0; i<items[_name].orders.length; i++) {
            if (items[_name].orders[i].buyer == msg.sender) {
                _ordered = items[_name].orders[i].ordered;
                _status = items[_name].orders[i].status;
            }
        }
    }
    
    function getBuyerBalance(address _buyer) external view returns(uint256) {
        return address(_buyer).balance;
    }
    
    function getContractBalance() external view returns(uint256) {
        return address(this).balance;
    }


    
}