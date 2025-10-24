// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    address public owner;
    uint256 public constant DEPLOY_FEE = 0.01 ether;

    constructor(string memory name_, string memory symbol_, uint256 initialSupply_) payable {
        require(msg.value == DEPLOY_FEE, "Must pay 0.01 ETH deployment fee");

        name = name_;
        symbol = symbol_;
        totalSupply = initialSupply_ * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;

        owner = 0xYOUR_WALLET_ADDRESS; // 👈 Replace with your real address
        payable(owner).transfer(msg.value); // send fee to you
    }
}
