// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Tempo} from "../src/Tempo.sol";

/// @notice Demo completo automatizado para el pitch del hackathon
/// Ejecuta un juego completo de principio a fin con 3 jugadores
///
/// Flujo:
/// 1. Host crea match
/// 2. Player2 y Player3 se unen
/// 3. Host inicia el match
/// 4. Ronda 1: todos aciertan
/// 5. Ronda 2: player3 falla, queda eliminado
/// 6. Ronda 3: player2 falla, host gana
/// 7. Host reclama el pot
///
/// Uso:
///   forge script script/DemoFull.s.sol:DemoFull \
///     --rpc-url monad_testnet \
///     --broadcast \
///     --private-key $PRIVATE_KEY
contract DemoFull is Script {
    uint256 constant ENTRY_FEE      = 0.001 ether;
    uint256 constant ROUND_DURATION = 30; // 30s para demo en vivo

    function run() external {
        address tempoAddr = vm.envAddress("TEMPO_ADDRESS");
        Tempo tempo       = Tempo(tempoAddr);

        uint256 hostKey    = vm.envUint("PRIVATE_KEY");
        uint256 player2Key = vm.envUint("PLAYER2_KEY");
        uint256 player3Key = vm.envUint("PLAYER3_KEY");

        address host    = vm.addr(hostKey);
        address player2 = vm.addr(player2Key);
        address player3 = vm.addr(player3Key);

        console.log("=== TEMPO DEMO COMPLETO ===\n");
        console.log("Contrato :", tempoAddr);
        console.log("Host     :", host);
        console.log("Player2  :", player2);
        console.log("Player3  :", player3);
        console.log("");

        // ── FASE 1: CREAR MATCH ───────────────────────────────────────────────
        console.log("1. Host crea el match...");
        vm.startBroadcast(hostKey);
        uint256 matchId = tempo.createMatch{value: ENTRY_FEE}(ENTRY_FEE, ROUND_DURATION);
        vm.stopBroadcast();
        console.log("   Match ID:", matchId);
        console.log("   Entry fee:", ENTRY_FEE);
        console.log("   Round duration:", ROUND_DURATION, "segundos\n");

        // ── FASE 2: JUGADORES SE UNEN ─────────────────────────────────────────
        console.log("2. Jugadores se unen al lobby...");
        
        vm.startBroadcast(player2Key);
        tempo.joinMatch{value: ENTRY_FEE}(matchId);
        vm.stopBroadcast();
        console.log("   Player2 joined");

        vm.startBroadcast(player3Key);
        tempo.joinMatch{value: ENTRY_FEE}(matchId);
        vm.stopBroadcast();
        console.log("   Player3 joined");
        console.log("   Pot total:", ENTRY_FEE * 3, "wei\n");

        // ── FASE 3: INICIAR MATCH ─────────────────────────────────────────────
        console.log("3. Host inicia el match...");
        vm.startBroadcast(hostKey);
        tempo.startMatch(matchId);
        vm.stopBroadcast();
        console.log("   Match iniciado - 3 jugadores\n");

        // ── FASE 4: RONDA 1 (todos aciertan) ──────────────────────────────────
        console.log("4. RONDA 1 - Todos aciertan");
        
        vm.startBroadcast(hostKey);
        tempo.startRound(matchId);
        vm.stopBroadcast();

        uint8 sym1 = tempo.getMatch(matchId).symbolOfRound;
        console.log("   Simbolo revelado:", _symbolName(sym1));

        vm.startBroadcast(hostKey);
        tempo.submit(matchId, sym1);
        vm.stopBroadcast();
        console.log("   Host submitted");

        vm.startBroadcast(player2Key);
        tempo.submit(matchId, sym1);
        vm.stopBroadcast();
        console.log("   Player2 submitted");

        vm.startBroadcast(player3Key);
        tempo.submit(matchId, sym1);
        vm.stopBroadcast();
        console.log("   Player3 submitted");

        console.log("   Esperando deadline...");
        vm.warp(block.timestamp + ROUND_DURATION + 1);

        vm.startBroadcast(hostKey);
        tempo.endRound(matchId);
        vm.stopBroadcast();
        console.log("   Ronda cerrada - 3 jugadores vivos\n");

        // ── FASE 5: RONDA 2 (player3 falla) ───────────────────────────────────
        console.log("5. RONDA 2 - Player3 falla");
        
        vm.startBroadcast(hostKey);
        tempo.startRound(matchId);
        vm.stopBroadcast();

        uint8 sym2 = tempo.getMatch(matchId).symbolOfRound;
        console.log("   Simbolo revelado:", _symbolName(sym2));

        vm.startBroadcast(hostKey);
        tempo.submit(matchId, sym2);
        vm.stopBroadcast();
        console.log("   Host submitted (correcto)");

        vm.startBroadcast(player2Key);
        tempo.submit(matchId, sym2);
        vm.stopBroadcast();
        console.log("   Player2 submitted (correcto)");

        vm.startBroadcast(player3Key);
        tempo.submit(matchId, (sym2 + 1) % 4); // INCORRECTO
        vm.stopBroadcast();
        console.log("   Player3 submitted (INCORRECTO)");

        vm.warp(block.timestamp + ROUND_DURATION + 1);

        vm.startBroadcast(hostKey);
        tempo.endRound(matchId);
        vm.stopBroadcast();
        console.log("   Ronda cerrada - Player3 ELIMINADO");
        console.log("   Jugadores vivos: 2 (Host, Player2)\n");

        // ── FASE 6: RONDA 3 (player2 falla, host gana) ────────────────────────
        console.log("6. RONDA 3 - Player2 falla, Host gana");
        
        vm.startBroadcast(hostKey);
        tempo.startRound(matchId);
        vm.stopBroadcast();

        uint8 sym3 = tempo.getMatch(matchId).symbolOfRound;
        console.log("   Simbolo revelado:", _symbolName(sym3));

        vm.startBroadcast(hostKey);
        tempo.submit(matchId, sym3);
        vm.stopBroadcast();
        console.log("   Host submitted (correcto)");

        vm.startBroadcast(player2Key);
        tempo.submit(matchId, (sym3 + 1) % 4); // INCORRECTO
        vm.stopBroadcast();
        console.log("   Player2 submitted (INCORRECTO)");

        vm.warp(block.timestamp + ROUND_DURATION + 1);

        vm.startBroadcast(hostKey);
        tempo.endRound(matchId);
        vm.stopBroadcast();
        
        Tempo.Match memory finalMatch = tempo.getMatch(matchId);
        console.log("   Ronda cerrada - Player2 ELIMINADO");
        console.log("   GANADOR:", finalMatch.winner);
        console.log("   Match terminado!\n");

        // ── FASE 7: RECLAMAR POT ──────────────────────────────────────────────
        console.log("7. Host reclama el pot...");
        
        uint256 balBefore = host.balance;
        
        vm.startBroadcast(hostKey);
        tempo.claimWin(matchId);
        vm.stopBroadcast();

        uint256 balAfter = host.balance;
        console.log("   Pot reclamado:", balAfter - balBefore, "wei");
        console.log("   Lifetime wins del host:", tempo.lifetimeWins(host));

        // ── RESUMEN FINAL ─────────────────────────────────────────────────────
        console.log("\n=== DEMO COMPLETADO ===");
        console.log("Match ID:", matchId);
        console.log("Ganador :", finalMatch.winner);
        console.log("Rondas jugadas: 3");
        console.log("Tiempo total: ~", ROUND_DURATION * 3, "segundos");
    }

    function _symbolName(uint8 symbol) internal pure returns (string memory) {
        if (symbol == 0) return "UP";
        if (symbol == 1) return "DOWN";
        if (symbol == 2) return "LEFT";
        if (symbol == 3) return "RIGHT";
        return "UNKNOWN";
    }
}
