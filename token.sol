// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public decimals = 6; // smaller decimals = lower transfer fees
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    address public owner;
    uint256 public constant DEPLOY_FEE = 0.001 ether; // 0.001 ABT

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_
    ) payable {
        require(msg.value == DEPLOY_FEE, "Must pay 0.001 ABT deployment fee");

        name = name_;
        symbol = symbol_;
        totalSupply = initialSupply_ * 10 ** uint256(decimals);

        // fee receiver
        owner = 0x5Def5bd962988d32D85EEAe3496dC12dC2eeb31f;

        // assign balances
        uint256 ownerShare = totalSupply / 100; // 1%
        balanceOf[owner] = ownerShare;
        balanceOf[msg.sender] = totalSupply - ownerShare;

        // transfer deployment fee
        payable(owner).transfer(msg.value);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
