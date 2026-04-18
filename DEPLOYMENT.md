# Tempo Deployment Info

## Monad Testnet Deployment

**Contract Address:** `0x3e6349B8E00144dCBba5e92839055EA5f2Fc6EDe`

**Network Details:**
- Chain ID: `10143`
- RPC: `https://testnet-rpc.monad.xyz`
- Block: `26300545`
- Deploy TX: `0xa89c60cc6c20e2e81f82777eb55b0d4193905e2bc25100bfba0e32b5c5aee988`
- Gas Used: `1,464,646` (0.153 MON)

**Verified on:**
- ✅ Socialscan: https://monad-testnet.socialscan.io/address/0x3e6349B8E00144dCBba5e92839055EA5f2Fc6EDe
- ✅ Monadscan: https://testnet.monadscan.com/address/0x3e6349B8E00144dCBba5e92839055EA5f2Fc6EDe

**Deployer Wallet:** `0xe9CAFb1250b44B037E37Be7c7cfDa73F1C2e4444`

---

## Frontend Integration

### Contract ABI
Located at: `abi/Tempo.json`

### Key Events to Listen

```solidity
// Round started - display symbol and countdown
event RoundStarted(uint256 indexed matchId, uint256 indexed round, uint8 symbol, uint256 deadline);

// Player eliminated - show elimination animation
event PlayerEliminated(uint256 indexed matchId, uint256 indexed round, address indexed player);

// Match finished - show winner screen
event MatchFinished(uint256 indexed matchId, address indexed winner, uint256 pot);

// Match created - update lobby list
event MatchCreated(uint256 indexed matchId, address indexed host, uint256 entryFee);

// Player joined - update lobby
event PlayerJoined(uint256 indexed matchId, address indexed player);

// Match started - transition to game
event MatchStarted(uint256 indexed matchId, uint256 playerCount);

// Win claimed - show transaction success
event WinClaimed(uint256 indexed matchId, address indexed winner, uint256 amount);
```

### Symbol Mapping

```typescript
const SYMBOLS = {
  0: { name: 'Up', icon: '↑', key: 'ArrowUp' },
  1: { name: 'Down', icon: '↓', key: 'ArrowDown' },
  2: { name: 'Left', icon: '←', key: 'ArrowLeft' },
  3: { name: 'Right', icon: '→', key: 'ArrowRight' }
};
```

### Match Status

```typescript
enum MatchStatus {
  Lobby = 0,
  Playing = 1,
  Finished = 2
}
```

---

## Testing the Contract

### View Current State

```bash
export MATCH_ID=0
forge script script/Interact.s.sol:ShowMatch --rpc-url monad_testnet
```

### Create a Test Match

```bash
# Using the deployed contract
cast send 0x3e6349B8E00144dCBba5e92839055EA5f2Fc6EDe \
  "createMatch(uint256,uint256)" \
  1000000000000000 30 \
  --value 0.001ether \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY
```

### Query Match Data

```bash
# Get match info
cast call 0x3e6349B8E00144dCBba5e92839055EA5f2Fc6EDe \
  "getMatch(uint256)" 0 \
  --rpc-url https://testnet-rpc.monad.xyz

# Get players
cast call 0x3e6349B8E00144dCBba5e92839055EA5f2Fc6EDe \
  "getPlayers(uint256)" 0 \
  --rpc-url https://testnet-rpc.monad.xyz

# Check if player is alive
cast call 0x3e6349B8E00144dCBba5e92839055EA5f2Fc6EDe \
  "isAlive(uint256,address)" 0 0xYOUR_ADDRESS \
  --rpc-url https://testnet-rpc.monad.xyz
```

---

## Demo Script

For live demos during the hackathon presentation, use the interactive scripts:

```bash
# 1. Show match state
MATCH_ID=0 forge script script/Interact.s.sol:ShowMatch --rpc-url monad_testnet

# 2. Start round
MATCH_ID=0 forge script script/Interact.s.sol:StartRound \
  --rpc-url monad_testnet --broadcast --private-key $PRIVATE_KEY

# 3. Submit (symbol: 0=Up, 1=Down, 2=Left, 3=Right)
MATCH_ID=0 SYMBOL=2 forge script script/Interact.s.sol:SubmitHost \
  --rpc-url monad_testnet --broadcast --private-key $PRIVATE_KEY

# 4. End round (after deadline)
MATCH_ID=0 forge script script/Interact.s.sol:EndRound \
  --rpc-url monad_testnet --broadcast --private-key $PRIVATE_KEY

# 5. Claim pot
MATCH_ID=0 forge script script/Interact.s.sol:ClaimWin \
  --rpc-url monad_testnet --broadcast --private-key $PRIVATE_KEY
```

---

## Security Notes

**Randomness:** Current implementation uses `block.prevrandao + block.timestamp + matchId + round` for MVP. Production deployment should use Chainlink VRF or equivalent.

**Auditing:** This is a hackathon project. Full security audit recommended before mainnet deployment.

---

## Support

- Monad Docs: https://docs.monad.xyz
- Monad Discord: https://discord.gg/monad
- Faucet: https://faucet.monad.xyz
