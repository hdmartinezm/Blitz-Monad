// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Tempo} from "../src/Tempo.sol";

/// @notice Seed script para la demo del hackathon.
///         Crea un match con 3 wallets, arranca el juego y juega 2 rondas.
///
/// Requiere en .env:
///   TEMPO_ADDRESS   - dirección del contrato ya deployado
///   PRIVATE_KEY     - deployer / host (wallet 0)
///   PLAYER2_KEY     - wallet 1
///   PLAYER3_KEY     - wallet 2
///
/// Uso:
///   forge script script/Seed.s.sol \
///     --rpc-url monad_testnet \
///     --broadcast \
///     --private-key $PRIVATE_KEY
contract SeedTempo is Script {
    uint256 constant ENTRY_FEE      = 0.001 ether;  // barato para testnet
    uint256 constant ROUND_DURATION = 30;            // 30s - cómodo para demo en vivo

    function run() external {
        address tempoAddr = vm.envAddress("TEMPO_ADDRESS");
        Tempo tempo       = Tempo(tempoAddr);

        uint256 hostKey    = vm.envUint("PRIVATE_KEY");
        uint256 player2Key = vm.envUint("PLAYER2_KEY");
        uint256 player3Key = vm.envUint("PLAYER3_KEY");

        address host    = vm.addr(hostKey);
        address player2 = vm.addr(player2Key);
        address player3 = vm.addr(player3Key);

        console.log("=== Tempo Seed ===");
        console.log("Contrato :", tempoAddr);
        console.log("Host     :", host);
        console.log("Player2  :", player2);
        console.log("Player3  :", player3);

        // ── 1. Host crea el match ─────────────────────────────────────────────
        vm.startBroadcast(hostKey);
        uint256 matchId = tempo.createMatch{value: ENTRY_FEE}(ENTRY_FEE, ROUND_DURATION);
        vm.stopBroadcast();
        console.log("Match creado, ID:", matchId);

        // ── 2. Jugadores se unen ──────────────────────────────────────────────
        vm.startBroadcast(player2Key);
        tempo.joinMatch{value: ENTRY_FEE}(matchId);
        vm.stopBroadcast();
        console.log("Player2 joined");

        vm.startBroadcast(player3Key);
        tempo.joinMatch{value: ENTRY_FEE}(matchId);
        vm.stopBroadcast();
        console.log("Player3 joined");

        // ── 3. Host arranca el match ──────────────────────────────────────────
        vm.startBroadcast(hostKey);
        tempo.startMatch(matchId);
        vm.stopBroadcast();
        console.log("Match started - 3 jugadores");

        // ── 4. Ronda 1: todos aciertan ────────────────────────────────────────
        vm.startBroadcast(hostKey);
        tempo.startRound(matchId);
        vm.stopBroadcast();

        uint8 sym1 = tempo.getMatch(matchId).symbolOfRound;
        console.log("Ronda 1 - simbolo:", sym1);

        vm.startBroadcast(hostKey);
        tempo.submit(matchId, sym1);
        vm.stopBroadcast();

        vm.startBroadcast(player2Key);
        tempo.submit(matchId, sym1);
        vm.stopBroadcast();

        vm.startBroadcast(player3Key);
        tempo.submit(matchId, sym1);
        vm.stopBroadcast();

        console.log("Ronda 1 - todos enviaron simbolo correcto");
        console.log("Esperando deadline... (llamar endRound manualmente o usar el frontend)");

        // NOTA: endRound se llama desde el frontend/bot después del deadline.
        // En un seed automatizado necesitarías vm.warp, que no funciona on-chain.
        // El frontend llama endRound cuando block.timestamp > roundDeadline.

        console.log("=== Seed completo ===");
        console.log("matchId listo para la demo:", matchId);
        console.log("Pot total:", ENTRY_FEE * 3);
    }
}
