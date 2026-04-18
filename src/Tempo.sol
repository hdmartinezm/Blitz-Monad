// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Tempo — Simon-says rhythm game fully on-chain en Monad
/// @notice Rondas de 2-3s son posibles gracias a los bloques de 1s de Monad
contract Tempo {
    // ─── Tipos ────────────────────────────────────────────────────────────────

    enum MatchStatus { Lobby, Playing, Finished }

    struct Match {
        address host;
        uint256 entryFee;
        uint256 pot;
        uint256 currentRound;
        uint8   symbolOfRound;   // 0=Up 1=Down 2=Left 3=Right
        uint256 roundDeadline;
        uint256 roundDuration;   // segundos por ronda
        MatchStatus status;
        address winner;
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    mapping(uint256 => Match)   public matches;
    mapping(uint256 => address[]) public matchPlayers;
    /// @dev vivo en el match
    mapping(uint256 => mapping(address => bool)) public alive;
    /// @dev match => round => player => acertó
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public submittedCorrect;
    /// @dev leaderboard global
    mapping(address => uint256) public lifetimeWins;

    uint256 public nextMatchId;

    // Tracking interno: ya envió en esta ronda (sin importar si acertó)
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) private _submitted;

    // ─── Errores ──────────────────────────────────────────────────────────────

    error MatchNotFound();
    error WrongStatus();
    error WrongEntryFee();
    error OnlyHost();
    error NotEnoughPlayers();
    error RoundStillActive();
    error RoundExpired();
    error NotAlive();
    error AlreadySubmitted();
    error InvalidSymbol();
    error NotWinner();
    error NothingToClaim();

    // ─── Eventos ──────────────────────────────────────────────────────────────

    event MatchCreated(uint256 indexed matchId, address indexed host, uint256 entryFee);
    event PlayerJoined(uint256 indexed matchId, address indexed player);
    event MatchStarted(uint256 indexed matchId, uint256 playerCount);
    event RoundStarted(uint256 indexed matchId, uint256 indexed round, uint8 symbol, uint256 deadline);
    event PlayerEliminated(uint256 indexed matchId, uint256 indexed round, address indexed player);
    event MatchFinished(uint256 indexed matchId, address indexed winner, uint256 pot);
    event WinClaimed(uint256 indexed matchId, address indexed winner, uint256 amount);

    // ─── Funciones públicas ───────────────────────────────────────────────────

    /// @notice Host crea un match pagando su propio entry fee
    function createMatch(uint256 entryFee, uint256 roundDuration)
        external
        payable
        returns (uint256 matchId)
    {
        if (msg.value != entryFee) revert WrongEntryFee();

        matchId = nextMatchId++;
        Match storage m = matches[matchId];
        m.host         = msg.sender;
        m.entryFee     = entryFee;
        m.pot          = msg.value;
        m.roundDuration = roundDuration;
        m.status       = MatchStatus.Lobby;

        matchPlayers[matchId].push(msg.sender);
        alive[matchId][msg.sender] = true;

        emit MatchCreated(matchId, msg.sender, entryFee);
    }

    /// @notice Jugador se une al lobby pagando el entry fee exacto
    function joinMatch(uint256 matchId) external payable {
        Match storage m = matches[matchId];
        if (m.host == address(0))          revert MatchNotFound();
        if (m.status != MatchStatus.Lobby) revert WrongStatus();
        if (msg.value != m.entryFee)       revert WrongEntryFee();

        m.pot += msg.value;
        matchPlayers[matchId].push(msg.sender);
        alive[matchId][msg.sender] = true;

        emit PlayerJoined(matchId, msg.sender);
    }

    /// @notice Solo el host puede arrancar, mínimo 1 jugador
    function startMatch(uint256 matchId) external {
        Match storage m = matches[matchId];
        if (m.host == address(0))              revert MatchNotFound();
        if (msg.sender != m.host)              revert OnlyHost();
        if (m.status != MatchStatus.Lobby)     revert WrongStatus();
        if (matchPlayers[matchId].length < 1)  revert NotEnoughPlayers();

        m.status = MatchStatus.Playing;
        emit MatchStarted(matchId, matchPlayers[matchId].length);
    }

    /// @notice Cualquiera inicia una ronda; revela símbolo random y abre ventana
    function startRound(uint256 matchId) external {
        Match storage m = matches[matchId];
        if (m.host == address(0))                revert MatchNotFound();
        if (m.status != MatchStatus.Playing)     revert WrongStatus();
        // Primera ronda: roundDeadline == 0. Rondas siguientes: deadline ya pasó.
        if (m.roundDeadline != 0 && block.timestamp <= m.roundDeadline) revert RoundStillActive();

        m.currentRound++;
        m.symbolOfRound = _randomSymbol(matchId, m.currentRound);
        m.roundDeadline = block.timestamp + m.roundDuration;

        emit RoundStarted(matchId, m.currentRound, m.symbolOfRound, m.roundDeadline);
    }

    /// @notice Jugador vivo envía su respuesta durante la ventana activa
    function submit(uint256 matchId, uint8 symbol) external {
        Match storage m = matches[matchId];
        if (m.host == address(0))            revert MatchNotFound();
        if (m.status != MatchStatus.Playing) revert WrongStatus();
        if (block.timestamp > m.roundDeadline) revert RoundExpired();
        if (!alive[matchId][msg.sender])     revert NotAlive();
        if (symbol > 3)                      revert InvalidSymbol();

        uint256 round = m.currentRound;
        if (_submitted[matchId][round][msg.sender]) revert AlreadySubmitted();

        _submitted[matchId][round][msg.sender] = true;
        if (symbol == m.symbolOfRound) {
            submittedCorrect[matchId][round][msg.sender] = true;
        }
    }

    /// @notice Cierra la ronda, elimina a los que fallaron/no enviaron
    function endRound(uint256 matchId) external {
        Match storage m = matches[matchId];
        if (m.host == address(0))            revert MatchNotFound();
        if (m.status != MatchStatus.Playing) revert WrongStatus();
        if (block.timestamp <= m.roundDeadline) revert RoundStillActive();

        uint256 round   = m.currentRound;
        address[] storage players = matchPlayers[matchId];
        uint256 aliveCount;
        address lastAlive;

        for (uint256 i; i < players.length; i++) {
            address p = players[i];
            if (!alive[matchId][p]) continue; // ya eliminado en rondas previas

            if (!submittedCorrect[matchId][round][p]) {
                alive[matchId][p] = false;
                emit PlayerEliminated(matchId, round, p);
            } else {
                aliveCount++;
                lastAlive = p;
            }
        }

        // Fin del match: ≤1 vivo
        if (aliveCount <= 1) {
            m.status = MatchStatus.Finished;
            // Si 0 sobreviven (todos fallaron), el pot va al host por defecto
            m.winner = aliveCount == 1 ? lastAlive : m.host;
            emit MatchFinished(matchId, m.winner, m.pot);
        }
    }

    /// @notice El ganador retira el pot; incrementa su contador en el leaderboard
    function claimWin(uint256 matchId) external {
        Match storage m = matches[matchId];
        if (m.host == address(0))               revert MatchNotFound();
        if (m.status != MatchStatus.Finished)   revert WrongStatus();
        if (msg.sender != m.winner)             revert NotWinner();
        if (m.pot == 0)                         revert NothingToClaim();

        uint256 amount = m.pot;
        m.pot = 0; // checks-effects-interactions: reset antes del transfer
        lifetimeWins[msg.sender]++;

        emit WinClaimed(matchId, msg.sender, amount);

        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
    }

    // ─── Vistas ───────────────────────────────────────────────────────────────

    function getPlayers(uint256 matchId) external view returns (address[] memory) {
        return matchPlayers[matchId];
    }

    function isAlive(uint256 matchId, address player) external view returns (bool) {
        return alive[matchId][player];
    }

    function getMatch(uint256 matchId) external view returns (Match memory) {
        return matches[matchId];
    }

    // ─── Interno ──────────────────────────────────────────────────────────────

    /// @dev MVP randomness: suficiente para hackathon; producción usaría VRF
    function _randomSymbol(uint256 matchId, uint256 round) internal view returns (uint8) {
        return uint8(
            uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, matchId, round))) % 4
        );
    }
}
