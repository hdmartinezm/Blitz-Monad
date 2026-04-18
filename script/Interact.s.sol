// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Tempo} from "../src/Tempo.sol";

/// @notice Scripts de interaccion individuales para la demo en vivo.
///         Cada contrato es una accion atomica — se llaman por separado.
///
/// Requiere en .env:
///   TEMPO_ADDRESS, PRIVATE_KEY, PLAYER2_KEY, PLAYER3_KEY
///
/// Uso general:
///   forge script script/Interact.s.sol:<NombreContrato> \
///     --rpc-url monad_testnet --broadcast --private-key $PRIVATE_KEY

// ─── 1. Ver estado de un match ────────────────────────────────────────────────
contract ShowMatch is Script {
    function run() external view {
        Tempo tempo     = Tempo(vm.envAddress("TEMPO_ADDRESS"));
        uint256 matchId = vm.envUint("MATCH_ID");

        Tempo.Match memory m = tempo.getMatch(matchId);
        address[] memory players = tempo.getPlayers(matchId);

        console.log("=== Match", matchId, "===");
        console.log("Host        :", m.host);
        console.log("Entry fee   :", m.entryFee);
        console.log("Pot         :", m.pot);
        console.log("Status      :", uint8(m.status)); // 0=Lobby 1=Playing 2=Finished
        console.log("Round       :", m.currentRound);
        console.log("Symbol      :", m.symbolOfRound); // 0=Up 1=Down 2=Left 3=Right
        console.log("Deadline    :", m.roundDeadline);
        console.log("Winner      :", m.winner);
        console.log("Players     :", players.length);
        for (uint256 i; i < players.length; i++) {
            bool live = tempo.isAlive(matchId, players[i]);
            console.log("  player", i, ":", players[i]);
            console.log("    alive:", live);
        }
    }
}

// ─── 2. Iniciar una ronda ─────────────────────────────────────────────────────
contract StartRound is Script {
    function run() external {
        uint256 key     = vm.envUint("PRIVATE_KEY");
        Tempo tempo     = Tempo(vm.envAddress("TEMPO_ADDRESS"));
        uint256 matchId = vm.envUint("MATCH_ID");

        vm.startBroadcast(key);
        tempo.startRound(matchId);
        vm.stopBroadcast();

        Tempo.Match memory m = tempo.getMatch(matchId);
        string[4] memory symbols = ["UP", "DOWN", "LEFT", "RIGHT"];
        console.log("Ronda", m.currentRound, "iniciada");
        console.log("Simbolo :", symbols[m.symbolOfRound]);
        console.log("Deadline:", m.roundDeadline);
    }
}

// ─── 3. Enviar respuesta (host) ───────────────────────────────────────────────
contract SubmitHost is Script {
    function run() external {
        uint256 key     = vm.envUint("PRIVATE_KEY");
        Tempo tempo     = Tempo(vm.envAddress("TEMPO_ADDRESS"));
        uint256 matchId = vm.envUint("MATCH_ID");
        uint8   symbol  = uint8(vm.envUint("SYMBOL")); // 0=Up 1=Down 2=Left 3=Right

        vm.startBroadcast(key);
        tempo.submit(matchId, symbol);
        vm.stopBroadcast();

        console.log("Host submitted symbol:", symbol);
    }
}

// ─── 4. Enviar respuesta (player2) ────────────────────────────────────────────
contract SubmitPlayer2 is Script {
    function run() external {
        uint256 key     = vm.envUint("PLAYER2_KEY");
        Tempo tempo     = Tempo(vm.envAddress("TEMPO_ADDRESS"));
        uint256 matchId = vm.envUint("MATCH_ID");
        uint8   symbol  = uint8(vm.envUint("SYMBOL"));

        vm.startBroadcast(key);
        tempo.submit(matchId, symbol);
        vm.stopBroadcast();

        console.log("Player2 submitted symbol:", symbol);
    }
}

// ─── 5. Enviar respuesta (player3) ────────────────────────────────────────────
contract SubmitPlayer3 is Script {
    function run() external {
        uint256 key     = vm.envUint("PLAYER3_KEY");
        Tempo tempo     = Tempo(vm.envAddress("TEMPO_ADDRESS"));
        uint256 matchId = vm.envUint("MATCH_ID");
        uint8   symbol  = uint8(vm.envUint("SYMBOL"));

        vm.startBroadcast(key);
        tempo.submit(matchId, symbol);
        vm.stopBroadcast();

        console.log("Player3 submitted symbol:", symbol);
    }
}

// ─── 6. Cerrar ronda ──────────────────────────────────────────────────────────
contract EndRound is Script {
    function run() external {
        uint256 key     = vm.envUint("PRIVATE_KEY");
        Tempo tempo     = Tempo(vm.envAddress("TEMPO_ADDRESS"));
        uint256 matchId = vm.envUint("MATCH_ID");

        vm.startBroadcast(key);
        tempo.endRound(matchId);
        vm.stopBroadcast();

        Tempo.Match memory m = tempo.getMatch(matchId);
        console.log("Ronda cerrada");
        console.log("Status:", uint8(m.status)); // 2 = Finished
        if (m.status == Tempo.MatchStatus.Finished) {
            console.log("GANADOR:", m.winner);
            console.log("Pot    :", m.pot);
        }
    }
}

// ─── 7. Reclamar el pot ───────────────────────────────────────────────────────
contract ClaimWin is Script {
    function run() external {
        uint256 key     = vm.envUint("PRIVATE_KEY"); // cambiar a PLAYER2_KEY si gana player2
        Tempo tempo     = Tempo(vm.envAddress("TEMPO_ADDRESS"));
        uint256 matchId = vm.envUint("MATCH_ID");

        address winner = vm.addr(key);
        uint256 balBefore = winner.balance;

        vm.startBroadcast(key);
        tempo.claimWin(matchId);
        vm.stopBroadcast();

        console.log("Pot reclamado por:", winner);
        console.log("Ganancia:", winner.balance - balBefore);
        console.log("Lifetime wins:", tempo.lifetimeWins(winner));
    }
}
