// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract KnifeHitLeaderboard {
    mapping(address => uint256) public bestLevel;

    event LevelRecorded(address indexed player, uint256 level, uint256 best);

    function submitLevel(uint256 level) external {
        bool isNewBest = level > bestLevel[msg.sender];
        if (isNewBest) {
            bestLevel[msg.sender] = level;
        }
        emit LevelRecorded(msg.sender, level, bestLevel[msg.sender]);
    }
}
