// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    address public owner;
    uint256 public constant DEPLOY_FEE = 0.001 ether; // 0.001 ABT (on Abstract)

    constructor(string memory name_, string memory symbol_, uint256 initialSupply_) payable {
        require(msg.value == DEPLOY_FEE, "Must pay 0.001 ABT deployment fee");

        // set token metadata
        name = name_;
        symbol = symbol_;
        totalSupply = initialSupply_ * 10 ** uint256(decimals);

        // define fee receiver
        owner = 0x5Def5bd962988d32D85EEAe3496dC12dC2eeb31f; // your Abstract wallet

        // calculate 1% for owner
        uint256 ownerShare = totalSupply / 100; // 1%

        // assign balances
        balanceOf[owner] = ownerShare; // 1% to owner
        balanceOf[msg.sender] = totalSupply - ownerShare; // 99% to deployer

        // transfer deploy fee
        payable(owner).transfer(msg.value);
    }
}
