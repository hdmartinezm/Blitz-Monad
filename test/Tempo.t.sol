// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {Tempo} from "../src/Tempo.sol";

contract TempoTest is Test {
    Tempo public tempo;

    address host    = makeAddr("host");
    address player2 = makeAddr("player2");
    address player3 = makeAddr("player3");

    uint256 constant ENTRY_FEE      = 0.01 ether;
    uint256 constant ROUND_DURATION = 3; // segundos

    function setUp() public {
        tempo = new Tempo();
        vm.deal(host,    10 ether);
        vm.deal(player2, 10 ether);
        vm.deal(player3, 10 ether);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /// Crea un match con 3 jugadores ya en estado Playing
    function _setupPlayingMatch() internal returns (uint256 matchId) {
        vm.prank(host);
        matchId = tempo.createMatch{value: ENTRY_FEE}(ENTRY_FEE, ROUND_DURATION);

        vm.prank(player2);
        tempo.joinMatch{value: ENTRY_FEE}(matchId);

        vm.prank(player3);
        tempo.joinMatch{value: ENTRY_FEE}(matchId);

        vm.prank(host);
        tempo.startMatch(matchId);
    }

    /// Lee el símbolo correcto de una ronda ya iniciada
    function _correctSymbol(uint256 matchId) internal view returns (uint8) {
        return tempo.getMatch(matchId).symbolOfRound;
    }

    // ─── Happy path ───────────────────────────────────────────────────────────

    /// Flujo completo: crear → unirse × 2 → start → ronda 1 (player3 falla) →
    /// ronda 2 (player2 falla) → claimWin del host
    function test_happyPath_fullGame() public {
        uint256 matchId = _setupPlayingMatch();
        uint256 expectedPot = ENTRY_FEE * 3;

        // — Ronda 1 —
        tempo.startRound(matchId);
        uint8 sym1 = _correctSymbol(matchId);

        vm.prank(host);    tempo.submit(matchId, sym1);
        vm.prank(player2); tempo.submit(matchId, sym1);
        vm.prank(player3); tempo.submit(matchId, (sym1 + 1) % 4); // incorrecto

        vm.warp(block.timestamp + ROUND_DURATION + 1);
        tempo.endRound(matchId);

        assertFalse(tempo.isAlive(matchId, player3), "player3 debe estar eliminado");
        assertTrue(tempo.isAlive(matchId, host),    "host debe seguir vivo");
        assertTrue(tempo.isAlive(matchId, player2), "player2 debe seguir vivo");

        Tempo.Match memory m = tempo.getMatch(matchId);
        assertEq(uint8(m.status), uint8(Tempo.MatchStatus.Playing), "aun Playing");

        // — Ronda 2 —
        tempo.startRound(matchId);
        uint8 sym2 = _correctSymbol(matchId);

        vm.prank(host);    tempo.submit(matchId, sym2);
        vm.prank(player2); tempo.submit(matchId, (sym2 + 1) % 4); // incorrecto

        vm.warp(block.timestamp + ROUND_DURATION + 1);
        tempo.endRound(matchId);

        m = tempo.getMatch(matchId);
        assertEq(uint8(m.status), uint8(Tempo.MatchStatus.Finished), "debe ser Finished");
        assertEq(m.winner, host, "host debe ganar");
        assertEq(m.pot, expectedPot, "pot intacto antes de claim");

        // — Claim —
        uint256 balBefore = host.balance;
        vm.prank(host);
        tempo.claimWin(matchId);

        assertEq(host.balance, balBefore + expectedPot, "host recibe el pot completo");
        assertEq(tempo.lifetimeWins(host), 1, "lifetimeWins incrementado");
        assertEq(tempo.getMatch(matchId).pot, 0, "pot vaciado");
    }

    // ─── Reverts esperados ────────────────────────────────────────────────────

    function test_revert_startMatch_notHost() public {
        vm.prank(host);
        uint256 matchId = tempo.createMatch{value: ENTRY_FEE}(ENTRY_FEE, ROUND_DURATION);

        vm.prank(player2);
        tempo.joinMatch{value: ENTRY_FEE}(matchId);

        vm.expectRevert(Tempo.OnlyHost.selector);
        vm.prank(player2);
        tempo.startMatch(matchId);
    }

    function test_revert_startMatch_notEnoughPlayers() public {
        vm.prank(host);
        uint256 matchId = tempo.createMatch{value: ENTRY_FEE}(ENTRY_FEE, ROUND_DURATION);
        // Solo el host, sin segundo jugador

        vm.expectRevert(Tempo.NotEnoughPlayers.selector);
        vm.prank(host);
        tempo.startMatch(matchId);
    }

    function test_revert_submit_afterDeadline() public {
        uint256 matchId = _setupPlayingMatch();
        tempo.startRound(matchId);

        Tempo.Match memory m = tempo.getMatch(matchId);
        vm.warp(m.roundDeadline + 1);

        vm.expectRevert(Tempo.RoundExpired.selector);
        vm.prank(host);
        tempo.submit(matchId, 0);
    }

    function test_revert_submit_notAlive() public {
        uint256 matchId = _setupPlayingMatch();
        tempo.startRound(matchId);

        uint8 sym = _correctSymbol(matchId);

        // host y player2 aciertan — player3 falla; así siguen 2 vivos y el match no termina
        vm.prank(host);    tempo.submit(matchId, sym);
        vm.prank(player2); tempo.submit(matchId, sym);
        vm.prank(player3); tempo.submit(matchId, (sym + 1) % 4);

        vm.warp(block.timestamp + ROUND_DURATION + 1);
        tempo.endRound(matchId);

        // Match sigue en Playing (2 vivos). Siguiente ronda — player3 ya eliminado
        tempo.startRound(matchId);

        vm.expectRevert(Tempo.NotAlive.selector);
        vm.prank(player3);
        tempo.submit(matchId, 0);
    }

    function test_revert_submit_alreadySubmitted() public {
        uint256 matchId = _setupPlayingMatch();
        tempo.startRound(matchId);

        uint8 sym = _correctSymbol(matchId);

        vm.prank(host);
        tempo.submit(matchId, sym);

        vm.expectRevert(Tempo.AlreadySubmitted.selector);
        vm.prank(host);
        tempo.submit(matchId, sym);
    }

    function test_revert_joinMatch_wrongEntryFee() public {
        vm.prank(host);
        uint256 matchId = tempo.createMatch{value: ENTRY_FEE}(ENTRY_FEE, ROUND_DURATION);

        vm.expectRevert(Tempo.WrongEntryFee.selector);
        vm.prank(player2);
        tempo.joinMatch{value: ENTRY_FEE - 1}(matchId);
    }

    function test_revert_createMatch_wrongEntryFee() public {
        vm.expectRevert(Tempo.WrongEntryFee.selector);
        vm.prank(host);
        tempo.createMatch{value: ENTRY_FEE - 1}(ENTRY_FEE, ROUND_DURATION);
    }

    function test_revert_doubleClaim() public {
        uint256 matchId = _setupPlayingMatch();
        tempo.startRound(matchId);
        uint8 sym = _correctSymbol(matchId);

        // Todos fallan excepto host
        vm.prank(host);    tempo.submit(matchId, sym);
        vm.prank(player2); tempo.submit(matchId, (sym + 1) % 4);
        vm.prank(player3); tempo.submit(matchId, (sym + 1) % 4);

        vm.warp(block.timestamp + ROUND_DURATION + 1);
        tempo.endRound(matchId);

        vm.prank(host);
        tempo.claimWin(matchId);

        vm.expectRevert(Tempo.NothingToClaim.selector);
        vm.prank(host);
        tempo.claimWin(matchId);
    }

    function test_revert_claimWin_notWinner() public {
        uint256 matchId = _setupPlayingMatch();
        tempo.startRound(matchId);
        uint8 sym = _correctSymbol(matchId);

        vm.prank(host);    tempo.submit(matchId, sym);
        vm.prank(player2); tempo.submit(matchId, (sym + 1) % 4);
        vm.prank(player3); tempo.submit(matchId, (sym + 1) % 4);

        vm.warp(block.timestamp + ROUND_DURATION + 1);
        tempo.endRound(matchId);

        vm.expectRevert(Tempo.NotWinner.selector);
        vm.prank(player2);
        tempo.claimWin(matchId);
    }

    function test_revert_startRound_stillActive() public {
        uint256 matchId = _setupPlayingMatch();
        tempo.startRound(matchId);

        // Intentar iniciar otra ronda antes de que expire la actual
        vm.expectRevert(Tempo.RoundStillActive.selector);
        tempo.startRound(matchId);
    }

    function test_revert_joinMatch_afterLobby() public {
        uint256 matchId = _setupPlayingMatch(); // ya está en Playing

        address late = makeAddr("late");
        vm.deal(late, 1 ether); // necesita balance para pagar el entry fee

        vm.expectRevert(Tempo.WrongStatus.selector);
        vm.prank(late);
        tempo.joinMatch{value: ENTRY_FEE}(matchId);
    }

    // ─── Edge case: todos eliminados en una ronda ─────────────────────────────

    function test_allEliminated_hostWinsByDefault() public {
        uint256 matchId = _setupPlayingMatch();
        tempo.startRound(matchId);
        uint8 sym = _correctSymbol(matchId);

        // Todos fallan
        vm.prank(host);    tempo.submit(matchId, (sym + 1) % 4);
        vm.prank(player2); tempo.submit(matchId, (sym + 1) % 4);
        vm.prank(player3); tempo.submit(matchId, (sym + 1) % 4);

        vm.warp(block.timestamp + ROUND_DURATION + 1);
        tempo.endRound(matchId);

        Tempo.Match memory m = tempo.getMatch(matchId);
        assertEq(uint8(m.status), uint8(Tempo.MatchStatus.Finished));
        assertEq(m.winner, host, "host gana por defecto si todos fallan");
    }

    // ─── Fuzz ────────────────────────────────────────────────────────────────

    /// Entry fees arbitrarios: el pot siempre debe ser fee * jugadores
    function testFuzz_entryFeeAccounting(uint96 fee) public {
        vm.assume(fee > 0 && fee <= 1 ether);
        vm.deal(host,    uint256(fee) + 1);
        vm.deal(player2, uint256(fee) + 1);

        vm.prank(host);
        uint256 matchId = tempo.createMatch{value: fee}(fee, 3);

        vm.prank(player2);
        tempo.joinMatch{value: fee}(matchId);

        Tempo.Match memory m = tempo.getMatch(matchId);
        assertEq(m.pot,      uint256(fee) * 2);
        assertEq(m.entryFee, fee);
    }

    /// Símbolo inválido siempre reverts
    function testFuzz_invalidSymbol(uint8 sym) public {
        vm.assume(sym > 3);
        uint256 matchId = _setupPlayingMatch();
        tempo.startRound(matchId);

        vm.expectRevert(Tempo.InvalidSymbol.selector);
        vm.prank(host);
        tempo.submit(matchId, sym);
    }
}
