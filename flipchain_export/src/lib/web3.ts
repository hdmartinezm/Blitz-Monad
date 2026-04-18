import { http, createConfig } from 'wagmi'
import { monadTestnet } from 'viem/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [
    injected({ 
      target: 'metaMask',
      shimDisconnect: true,
    }),
  ],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz', {
      batch: false,
      retryCount: 3,
      timeout: 30000,
    }),
  },
})

export const TEMPO_ADDRESS = '0xe84a13e04e2139de5ecf33f7e800b2176d994806' as const

export const TEMPO_ABI = [
  { type: 'function', name: 'nextMatchId', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getMatch', inputs: [{ name: 'matchId', type: 'uint256' }], outputs: [{ type: 'tuple', components: [
    { name: 'host', type: 'address' },
    { name: 'entryFee', type: 'uint256' },
    { name: 'pot', type: 'uint256' },
    { name: 'currentRound', type: 'uint256' },
    { name: 'symbolOfRound', type: 'uint8' },
    { name: 'roundDeadline', type: 'uint256' },
    { name: 'roundDuration', type: 'uint256' },
    { name: 'status', type: 'uint8' },
    { name: 'winner', type: 'address' },
  ]}], stateMutability: 'view' },
  { type: 'function', name: 'getPlayers', inputs: [{ name: 'matchId', type: 'uint256' }], outputs: [{ type: 'address[]' }], stateMutability: 'view' },
  { type: 'function', name: 'isAlive', inputs: [{ name: 'matchId', type: 'uint256' }, { name: 'player', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'lifetimeWins', inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'createMatch', inputs: [{ name: 'entryFee', type: 'uint256' }, { name: 'roundDuration', type: 'uint256' }], outputs: [{ name: 'matchId', type: 'uint256' }], stateMutability: 'payable' },
  { type: 'function', name: 'joinMatch', inputs: [{ name: 'matchId', type: 'uint256' }], outputs: [], stateMutability: 'payable' },
  { type: 'function', name: 'startMatch', inputs: [{ name: 'matchId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'startRound', inputs: [{ name: 'matchId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'submit', inputs: [{ name: 'matchId', type: 'uint256' }, { name: 'symbol', type: 'uint8' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'endRound', inputs: [{ name: 'matchId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'claimWin', inputs: [{ name: 'matchId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'event', name: 'RoundStarted', inputs: [{ name: 'matchId', type: 'uint256', indexed: true }, { name: 'round', type: 'uint256', indexed: true }, { name: 'symbol', type: 'uint8', indexed: false }, { name: 'deadline', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'PlayerEliminated', inputs: [{ name: 'matchId', type: 'uint256', indexed: true }, { name: 'round', type: 'uint256', indexed: true }, { name: 'player', type: 'address', indexed: true }] },
  { type: 'event', name: 'MatchFinished', inputs: [{ name: 'matchId', type: 'uint256', indexed: true }, { name: 'winner', type: 'address', indexed: true }, { name: 'pot', type: 'uint256', indexed: false }] },
] as const
