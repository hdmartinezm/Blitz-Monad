// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Tempo} from "../src/Tempo.sol";

/// @notice Test rápido: crea un match y verifica que todo funciona
/// Útil para verificar que el contrato deployado responde correctamente
///
/// Uso:
///   forge script script/QuickTest.s.sol:QuickTest \
///     --rpc-url monad_testnet \
///     --broadcast \
///     --private-key $PRIVATE_KEY
contract QuickTest is Script {
    function run() external {
        address tempoAddr = vm.envAddress("TEMPO_ADDRESS");
        Tempo tempo       = Tempo(tempoAddr);
        uint256 key       = vm.envUint("PRIVATE_KEY");
        address deployer  = vm.addr(key);

        console.log("=== QUICK TEST ===");
        console.log("Contrato:", tempoAddr);
        console.log("Tester  :", deployer);
        console.log("Balance :", deployer.balance);
        console.log("");

        // Ver cuántos matches existen
        uint256 totalMatches = tempo.nextMatchId();
        console.log("Total matches creados:", totalMatches);

        // Crear un match de prueba
        console.log("\nCreando match de prueba...");
        vm.startBroadcast(key);
        uint256 matchId = tempo.createMatch{value: 0.001 ether}(0.001 ether, 30);
        vm.stopBroadcast();

        console.log("Match creado, ID:", matchId);

        // Verificar el match
        Tempo.Match memory m = tempo.getMatch(matchId);
        console.log("\nDetalles del match:");
        console.log("  Host       :", m.host);
        console.log("  Entry fee  :", m.entryFee);
        console.log("  Pot        :", m.pot);
        console.log("  Status     :", uint8(m.status)); // 0=Lobby
        console.log("  Duration   :", m.roundDuration, "segundos");

        address[] memory players = tempo.getPlayers(matchId);
        console.log("  Players    :", players.length);

        console.log("\nTest completado - Contrato funcionando correctamente");
    }
}
