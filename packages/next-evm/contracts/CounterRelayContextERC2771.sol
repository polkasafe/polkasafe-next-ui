// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {
    GelatoRelayContextERC2771
} from "@gelatonetwork/relay-context/contracts/GelatoRelayContextERC2771.sol";

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

// Inheriting GelatoRelayContext gives access to:
// 1. _getFeeCollector(): returns the address of Gelato's feeCollector
// 2. _getFeeToken(): returns the address of the fee token
// 3. _getFee(): returns the fee to pay
// 4. _transferRelayFee(): transfers the required fee to Gelato's feeCollector.abi
// 5. _transferRelayFeeCapped(uint256 maxFee): transfers the fee to Gelato
//    only if fee < maxFee
// 6. function _getMsgSender(): decodes and returns the user's address from the
//    calldata, which can be used to refer to user safely instead of msg.sender
//    (which is Gelato Relay in this case).
// 7. _getMsgData(): returns the original msg.data without appended information
// 8. onlyGelatoRelay modifier: allows only Gelato Relay's smart contract
//    to call the function
contract CounterRelayContextERC2771 is GelatoRelayContextERC2771 {
    using Address for address payable;

    mapping(address => uint256) public contextCounter;

    // emitting an event for testing purposes
    event IncrementCounter(address msgSender);

    // `increment` is the target function to call.
    // This function increments a counter variable which is 
    // mapped to every _getMsgSender(), the address of the user.
    // This way each user off-chain has their own counter 
    // variable on-chain.
    function increment() external onlyGelatoRelayERC2771 {
        // Payment to Gelato
        // NOTE: be very careful here!
        // if you do not use the onlyGelatoRelay modifier,
        // anyone could encode themselves as the fee collector
        // in the low-level data and drain tokens from this contract.
        _transferRelayFee();

        // Incrementing the counter mapped to the _getMsgSender()
        contextCounter[_getMsgSender()]++;
        
        emit IncrementCounter(_getMsgSender());
    }
    
    // `incrementFeeCapped` is the target function to call.
    // This function uses `_transferRelayFeeCapped` method to ensure 
    // better control of gas fees. If gas fees are above the maxFee value 
    // the transaction will not be executed.
    // The maxFee will be passed as an argument to the contract call.
    // This function increments a counter variable by 1
    // IMPORTANT: with `callWithSyncFee` you need to implement 
    // your own smart contract security measures, as this 
    // function can be called by any third party and not only by 
    // Gelato Relay. If not done properly, funds kept in this
    // smart contract can be stolen.
    function incrementFeeCapped(uint256 maxFee) external  onlyGelatoRelayERC2771 {

        // Payment to Gelato
        // NOTE: be very careful here!
        // if you do not use the onlyGelatoRelay modifier,
        // anyone could encode themselves as the fee collector
        // in the low-level data and drain tokens from this contract.
  
        _transferRelayFeeCapped(maxFee);

        // Incrementing the counter mapped to the _getMsgSender()
        contextCounter[_getMsgSender()]++;

        emit IncrementCounter(_getMsgSender());
    }
}
