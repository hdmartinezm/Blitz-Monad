#!/usr/bin/env node
/**
 * Test script para los helpers
 * Muestra el estado actual del contrato deployado
 */

import { 
  getLobbyMatches, 
  getActiveMatches, 
  getMatchDetails,
  formatSymbol,
  formatStatus,
  getTimeRemaining 
} from './helpers.js';

console.log('🧪 Testing Tempo Helpers\n');
console.log('📍 Contract: 0x3e6349B8E00144dCBba5e92839055EA5f2Fc6EDe');
console.log('🌐 Network: Monad Testnet\n');

try {
  // Test 1: Lobbies
  console.log('1️⃣  Fetching lobby matches...');
  const lobbies = await getLobbyMatches();
  console.log(`   Found ${lobbies.length} open lobbies\n`);
  
  if (lobbies.length > 0) {
    lobbies.forEach(lobby => {
      console.log(`   📋 Match ${lobby.matchId}`);
      console.log(`      Host: ${lobby.host}`);
      console.log(`      Entry: ${lobby.entryFee} wei`);
      console.log(`      Players: ${lobby.playerCount}`);
      console.log(`      Pot: ${lobby.pot} wei\n`);
    });
  }

  // Test 2: Active matches
  console.log('2️⃣  Fetching active matches...');
  const active = await getActiveMatches();
  console.log(`   Found ${active.length} active matches\n`);
  
  if (active.length > 0) {
    active.forEach(match => {
      const symbol = formatSymbol(match.symbolOfRound);
      const remaining = getTimeRemaining(match.roundDeadline);
      
      console.log(`   🎮 Match ${match.matchId}`);
      console.log(`      Round: ${match.currentRound}`);
      console.log(`      Symbol: ${symbol.icon} ${symbol.name}`);
      console.log(`      Alive: ${match.alivePlayers.length}/${match.totalPlayers}`);
      console.log(`      Time left: ${remaining}s`);
      console.log(`      Pot: ${match.pot} wei\n`);
    });
  }

  // Test 3: Match details (si existe match 0)
  console.log('3️⃣  Fetching match 0 details...');
  try {
    const details = await getMatchDetails(0);
    console.log(`   Match ${details.matchId} - ${formatStatus(details.status)}`);
    console.log(`   Players:`);
    details.players.forEach(p => {
      const badge = p.isHost ? '👑' : '👤';
      const status = p.alive ? '✅' : '❌';
      console.log(`      ${badge} ${p.address.slice(0, 10)}... ${status} (${p.lifetimeWins} wins)`);
    });
    console.log();
  } catch (error) {
    console.log('   Match 0 no existe aún\n');
  }

  console.log('✅ Tests completados');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
