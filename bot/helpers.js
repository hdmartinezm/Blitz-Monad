/**
 * Tempo Helper Functions
 * 
 * Funciones útiles para el frontend que necesitan lógica más compleja
 * que simples contract reads.
 * 
 * Uso:
 *   import { getActiveMatches, getLeaderboard } from './helpers.js';
 */

import { createPublicClient, http, parseAbi } from 'viem';
import { monadTestnet } from 'viem/chains';

const TEMPO_ADDRESS = process.env.TEMPO_ADDRESS || '0x3e6349B8E00144dCBba5e92839055EA5f2Fc6EDe';

const tempoAbi = parseAbi([
  'function nextMatchId() view returns (uint256)',
  'function getMatch(uint256) view returns (tuple(address host, uint256 entryFee, uint256 pot, uint256 currentRound, uint8 symbolOfRound, uint256 roundDeadline, uint256 roundDuration, uint8 status, address winner))',
  'function getPlayers(uint256) view returns (address[])',
  'function isAlive(uint256, address) view returns (bool)',
  'function lifetimeWins(address) view returns (uint256)',
]);

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

/**
 * Obtiene todos los matches en estado Lobby (joinables)
 */
export async function getLobbyMatches() {
  const totalMatches = await publicClient.readContract({
    address: TEMPO_ADDRESS,
    abi: tempoAbi,
    functionName: 'nextMatchId',
  });

  const lobbies = [];

  for (let matchId = 0n; matchId < totalMatches; matchId++) {
    const match = await publicClient.readContract({
      address: TEMPO_ADDRESS,
      abi: tempoAbi,
      functionName: 'getMatch',
      args: [matchId],
    });

    const [host, entryFee, pot, currentRound, symbolOfRound, roundDeadline, roundDuration, status, winner] = match;

    if (status === 0) { // Lobby
      const players = await publicClient.readContract({
        address: TEMPO_ADDRESS,
        abi: tempoAbi,
        functionName: 'getPlayers',
        args: [matchId],
      });

      lobbies.push({
        matchId: matchId.toString(),
        host,
        entryFee: entryFee.toString(),
        pot: pot.toString(),
        roundDuration: roundDuration.toString(),
        playerCount: players.length,
        players,
      });
    }
  }

  return lobbies;
}

/**
 * Obtiene todos los matches activos (Playing)
 */
export async function getActiveMatches() {
  const totalMatches = await publicClient.readContract({
    address: TEMPO_ADDRESS,
    abi: tempoAbi,
    functionName: 'nextMatchId',
  });

  const active = [];

  for (let matchId = 0n; matchId < totalMatches; matchId++) {
    const match = await publicClient.readContract({
      address: TEMPO_ADDRESS,
      abi: tempoAbi,
      functionName: 'getMatch',
      args: [matchId],
    });

    const [host, entryFee, pot, currentRound, symbolOfRound, roundDeadline, roundDuration, status, winner] = match;

    if (status === 1) { // Playing
      const players = await publicClient.readContract({
        address: TEMPO_ADDRESS,
        abi: tempoAbi,
        functionName: 'getPlayers',
        args: [matchId],
      });

      // Obtener jugadores vivos
      const alivePlayers = [];
      for (const player of players) {
        const alive = await publicClient.readContract({
          address: TEMPO_ADDRESS,
          abi: tempoAbi,
          functionName: 'isAlive',
          args: [matchId, player],
        });
        if (alive) alivePlayers.push(player);
      }

      active.push({
        matchId: matchId.toString(),
        host,
        entryFee: entryFee.toString(),
        pot: pot.toString(),
        currentRound: currentRound.toString(),
        symbolOfRound,
        roundDeadline: roundDeadline.toString(),
        roundDuration: roundDuration.toString(),
        totalPlayers: players.length,
        alivePlayers,
        players,
      });
    }
  }

  return active;
}

/**
 * Obtiene el leaderboard global (top N jugadores por lifetime wins)
 */
export async function getLeaderboard(topN = 10, knownPlayers = []) {
  // Nota: sin eventos indexados, necesitamos una lista de jugadores conocidos
  // El frontend puede mantener esta lista escuchando eventos PlayerJoined
  
  const leaderboard = [];

  for (const player of knownPlayers) {
    const wins = await publicClient.readContract({
      address: TEMPO_ADDRESS,
      abi: tempoAbi,
      functionName: 'lifetimeWins',
      args: [player],
    });

    if (wins > 0n) {
      leaderboard.push({
        address: player,
        wins: wins.toString(),
      });
    }
  }

  // Ordenar por wins descendente
  leaderboard.sort((a, b) => BigInt(b.wins) - BigInt(a.wins));

  return leaderboard.slice(0, topN);
}

/**
 * Obtiene el estado completo de un match (para UI detallada)
 */
export async function getMatchDetails(matchId) {
  const match = await publicClient.readContract({
    address: TEMPO_ADDRESS,
    abi: tempoAbi,
    functionName: 'getMatch',
    args: [BigInt(matchId)],
  });

  const [host, entryFee, pot, currentRound, symbolOfRound, roundDeadline, roundDuration, status, winner] = match;

  const players = await publicClient.readContract({
    address: TEMPO_ADDRESS,
    abi: tempoAbi,
    functionName: 'getPlayers',
    args: [BigInt(matchId)],
  });

  // Estado de cada jugador
  const playerStates = [];
  for (const player of players) {
    const alive = await publicClient.readContract({
      address: TEMPO_ADDRESS,
      abi: tempoAbi,
      functionName: 'isAlive',
      args: [BigInt(matchId), player],
    });

    const wins = await publicClient.readContract({
      address: TEMPO_ADDRESS,
      abi: tempoAbi,
      functionName: 'lifetimeWins',
      args: [player],
    });

    playerStates.push({
      address: player,
      alive,
      lifetimeWins: wins.toString(),
      isHost: player.toLowerCase() === host.toLowerCase(),
    });
  }

  return {
    matchId: matchId.toString(),
    host,
    entryFee: entryFee.toString(),
    pot: pot.toString(),
    currentRound: currentRound.toString(),
    symbolOfRound,
    roundDeadline: roundDeadline.toString(),
    roundDuration: roundDuration.toString(),
    status, // 0=Lobby, 1=Playing, 2=Finished
    winner,
    players: playerStates,
    totalPlayers: players.length,
    alivePlayers: playerStates.filter(p => p.alive).length,
  };
}

/**
 * Calcula el tiempo restante hasta el deadline (en segundos)
 */
export function getTimeRemaining(roundDeadline) {
  const now = Math.floor(Date.now() / 1000);
  const deadline = Number(roundDeadline);
  return Math.max(0, deadline - now);
}

/**
 * Formatea un símbolo a su representación visual
 */
export function formatSymbol(symbolId) {
  const symbols = {
    0: { name: 'Up', icon: '↑', emoji: '⬆️' },
    1: { name: 'Down', icon: '↓', emoji: '⬇️' },
    2: { name: 'Left', icon: '←', emoji: '⬅️' },
    3: { name: 'Right', icon: '→', emoji: '➡️' },
  };
  return symbols[symbolId] || { name: 'Unknown', icon: '?', emoji: '❓' };
}

/**
 * Formatea un status a string legible
 */
export function formatStatus(status) {
  const statuses = {
    0: 'Lobby',
    1: 'Playing',
    2: 'Finished',
  };
  return statuses[status] || 'Unknown';
}

// Ejemplo de uso
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔍 Tempo Helpers - Ejemplos\n');

  // Lobbies
  const lobbies = await getLobbyMatches();
  console.log('📋 Lobbies abiertos:', lobbies.length);
  lobbies.forEach(l => {
    console.log(`  Match ${l.matchId}: ${l.playerCount} jugadores, entry ${l.entryFee} wei`);
  });

  // Matches activos
  const active = await getActiveMatches();
  console.log('\n🎮 Matches activos:', active.length);
  active.forEach(m => {
    const symbol = formatSymbol(m.symbolOfRound);
    const remaining = getTimeRemaining(m.roundDeadline);
    console.log(`  Match ${m.matchId}: Round ${m.currentRound}, ${symbol.icon} ${symbol.name}, ${m.alivePlayers.length}/${m.totalPlayers} vivos, ${remaining}s restantes`);
  });
}
