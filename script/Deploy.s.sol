// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Tempo} from "../src/Tempo.sol";

/// @notice Deploy de Tempo en Monad Testnet
/// Uso:
///   forge script script/Deploy.s.sol \
///     --rpc-url monad_testnet \
///     --broadcast \
///     --private-key $PRIVATE_KEY
contract DeployTempo is Script {
    function run() external returns (Tempo tempo) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        console.log("=== Tempo Deploy ===");
        console.log("Deployer :", deployer);
        console.log("Chain ID :", block.chainid);
        console.log("Balance  :", deployer.balance);

        vm.startBroadcast(deployerKey);
        tempo = new Tempo();
        vm.stopBroadcast();

        console.log("Tempo deployed at:", address(tempo));
    }
}
