#!/usr/bin/env node
/**
 * Tempo EndRound Bot
 * 
 * Monitorea matches activos y llama endRound() automáticamente
 * cuando el deadline de una ronda expira.
 * 
 * Uso:
 *   node bot/endRoundBot.js
 * 
 * Requiere:
 *   - .env con TEMPO_ADDRESS y PRIVATE_KEY
 *   - npm install viem dotenv
 */

import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// Config
const TEMPO_ADDRESS = process.env.TEMPO_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const POLL_INTERVAL = 2000; // 2 segundos (bloques de Monad son 1s)

if (!TEMPO_ADDRESS || !PRIVATE_KEY) {
  console.error('❌ Falta TEMPO_ADDRESS o PRIVATE_KEY en .env');
  process.exit(1);
}

// ABI mínimo necesario
const tempoAbi = parseAbi([
  'function nextMatchId() view returns (uint256)',
  'function getMatch(uint256) view returns (tuple(address host, uint256 entryFee, uint256 pot, uint256 currentRound, uint8 symbolOfRound, uint256 roundDeadline, uint256 roundDuration, uint8 status, address winner))',
  'function endRound(uint256) external',
  'event RoundStarted(uint256 indexed matchId, uint256 indexed round, uint8 symbol, uint256 deadline)',
  'event MatchFinished(uint256 indexed matchId, address indexed winner, uint256 pot)',
]);

// Clients
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http(),
});

console.log('🤖 Tempo EndRound Bot iniciado');
console.log('📍 Contrato:', TEMPO_ADDRESS);
console.log('👤 Bot wallet:', account.address);
console.log('⏱️  Poll interval:', POLL_INTERVAL, 'ms\n');

// Estado interno
const activeMatches = new Map(); // matchId -> { roundDeadline, currentRound }

/**
 * Obtiene el total de matches creados
 */
async function getTotalMatches() {
  return await publicClient.readContract({
    address: TEMPO_ADDRESS,
    abi: tempoAbi,
    functionName: 'nextMatchId',
  });
}

/**
 * Obtiene info de un match
 */
async function getMatch(matchId) {
  return await publicClient.readContract({
    address: TEMPO_ADDRESS,
    abi: tempoAbi,
    functionName: 'getMatch',
    args: [matchId],
  });
}

/**
 * Llama endRound para un match
 */
async function callEndRound(matchId) {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address: TEMPO_ADDRESS,
      abi: tempoAbi,
      functionName: 'endRound',
      args: [matchId],
    });

    const hash = await walletClient.writeContract(request);
    console.log(`✅ endRound llamado para match ${matchId} - TX: ${hash}`);
    
    // Esperar confirmación
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`   ✓ Confirmado en block ${receipt.blockNumber}`);
    
    return true;
  } catch (error) {
    // Errores esperados (ej: deadline no pasó aún)
    if (error.message.includes('RoundStillActive')) {
      return false; // No es error, solo aún no es tiempo
    }
    console.error(`❌ Error en endRound para match ${matchId}:`, error.message);
    return false;
  }
}

/**
 * Escanea todos los matches y actualiza el estado
 */
async function scanMatches() {
  try {
    const totalMatches = await getTotalMatches();
    const now = Math.floor(Date.now() / 1000);

    for (let matchId = 0n; matchId < totalMatches; matchId++) {
      const match = await getMatch(matchId);
      const [host, entryFee, pot, currentRound, symbolOfRound, roundDeadline, roundDuration, status, winner] = match;

      // Status: 0=Lobby, 1=Playing, 2=Finished
      if (status !== 1) {
        // No está en Playing, remover del tracking
        if (activeMatches.has(matchId.toString())) {
          activeMatches.delete(matchId.toString());
          if (status === 2) {
            console.log(`🏁 Match ${matchId} terminado - Ganador: ${winner}`);
          }
        }
        continue;
      }

      // Match en Playing
      const matchKey = matchId.toString();
      const deadlineNum = Number(roundDeadline);

      // Si el deadline ya pasó, intentar endRound
      if (deadlineNum > 0 && now > deadlineNum) {
        console.log(`⏰ Match ${matchId} - Deadline expirado (round ${currentRound})`);
        const success = await callEndRound(matchId);
        
        if (success) {
          // Actualizar estado después de endRound
          const updatedMatch = await getMatch(matchId);
          const [,,,,,,, newStatus] = updatedMatch;
          
          if (newStatus === 2) {
            // Match terminó
            activeMatches.delete(matchKey);
          } else {
            // Sigue jugando, esperar próxima ronda
            activeMatches.set(matchKey, { roundDeadline: 0n, currentRound: currentRound + 1n });
          }
        }
      } else {
        // Trackear match activo
        if (!activeMatches.has(matchKey)) {
          console.log(`🎮 Match ${matchId} detectado - Round ${currentRound}, deadline: ${new Date(deadlineNum * 1000).toISOString()}`);
        }
        activeMatches.set(matchKey, { roundDeadline, currentRound });
      }
    }
  } catch (error) {
    console.error('❌ Error en scanMatches:', error.message);
  }
}

/**
 * Loop principal
 */
async function main() {
  console.log('🔍 Escaneando matches...\n');
  
  while (true) {
    await scanMatches();
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
}

// Manejo de señales
process.on('SIGINT', () => {
  console.log('\n👋 Bot detenido');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Bot detenido');
  process.exit(0);
});

// Iniciar
main().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
