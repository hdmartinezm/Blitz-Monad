# Tempo — Rhythm Game Fully On-Chain

**Simon-says on-chain powered by Monad's 1-second blocks.**

Tempo is a competitive rhythm game where players must submit the correct symbol within 2-3 second rounds. The fast-paced gameplay is only possible thanks to Monad's 1-second block times — impossible on Ethereum's 12-second blocks.

Built for the Monad Hackathon.

---

## 🎮 Game Mechanics

1. **Host creates a match** with entry fee → contract holds the pot
2. **N players join** by paying the entry fee
3. **Host starts the match** → lobby closes
4. **Each round:**
   - Someone calls `startRound()` → contract reveals random symbol (↑↓←→ = 0,1,2,3) + deadline
   - Alive players have N seconds to `submit(matchId, symbol)` with the correct symbol
   - After deadline, anyone calls `endRound()` → eliminates players who failed or didn't submit
5. **Last player standing** calls `claimWin()` → receives the entire pot

---

## 🏗️ Tech Stack

- **Blockchain:** Monad Testnet (chainId 10143)
- **Framework:** Foundry
- **Solidity:** 0.8.28 with `evm_version = "prague"` (required by Monad)
- **Deploy:** `forge script` (NOT `forge create` — it's buggy)
- **Verification:** MonadVision (Sourcify) or Monadscan (Etherscan-compatible)

---

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/hdmartinezm/Blitz-Monad.git
cd Blitz-Monad

# Install dependencies
forge install

# Build
forge build

# Run tests (15/15 passing)
forge test -vv
```

---

## 🚀 Deploy

### 1. Setup Environment

```bash
# Copy .env template
cp .env.example .env

# Edit .env with your keys:
# - PRIVATE_KEY: your deployer wallet private key
# - PLAYER2_KEY, PLAYER3_KEY: additional wallets for demo (optional)
# - MONADEXPLORER_API_KEY: for contract verification (optional)
```

### 2. Get Testnet MON

Request testnet tokens from the Monad faucet:
```bash
curl -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"chainId": 10143, "address": "YOUR_ADDRESS"}'
```

### 3. Deploy Contract

```bash
forge script script/Deploy.s.sol \
  --rpc-url monad_testnet \
  --broadcast \
  --private-key $PRIVATE_KEY
```

Copy the deployed contract address and add it to `.env`:
```bash
TEMPO_ADDRESS=0x...
```

### 4. Verify Contract (Optional)

**Option A: MonadVision (Sourcify, no API key needed)**
```bash
forge verify-contract $TEMPO_ADDRESS \
  src/Tempo.sol:Tempo \
  --chain 10143 \
  --verifier sourcify \
  --verifier-url https://sourcify-api-monad.blockvision.org/
```

**Option B: Monadscan (Etherscan-compatible, requires API key)**
```bash
forge verify-contract $TEMPO_ADDRESS \
  src/Tempo.sol:Tempo \
  --chain 10143 \
  --verifier etherscan \
  --etherscan-api-key $MONADEXPLORER_API_KEY \
  --watch
```

Check verification:
- MonadVision: `https://testnet.monadexplorer.com/address/$TEMPO_ADDRESS`
- Monadscan: `https://testnet.monadscan.com/address/$TEMPO_ADDRESS`

---

## 🎯 Demo Scripts

### Seed a Match (3 players)

```bash
forge script script/Seed.s.sol \
  --rpc-url monad_testnet \
  --broadcast \
  --private-key $PRIVATE_KEY
```

This creates a match with 3 wallets, all join, host starts, and plays round 1.

### Interactive Demo (Live Gameplay)

Use the atomic interaction scripts for live demos:

```bash
# Set the match ID
export MATCH_ID=0

# 1. View match state
forge script script/Interact.s.sol:ShowMatch \
  --rpc-url monad_testnet

# 2. Start a round
forge script script/Interact.s.sol:StartRound \
  --rpc-url monad_testnet \
  --broadcast \
  --private-key $PRIVATE_KEY

# 3. Submit responses (symbol: 0=Up, 1=Down, 2=Left, 3=Right)
export SYMBOL=2  # example: Left

forge script script/Interact.s.sol:SubmitHost \
  --rpc-url monad_testnet \
  --broadcast \
  --private-key $PRIVATE_KEY

forge script script/Interact.s.sol:SubmitPlayer2 \
  --rpc-url monad_testnet \
  --broadcast \
  --private-key $PLAYER2_KEY

forge script script/Interact.s.sol:SubmitPlayer3 \
  --rpc-url monad_testnet \
  --broadcast \
  --private-key $PLAYER3_KEY

# 4. End round (after deadline passes)
forge script script/Interact.s.sol:EndRound \
  --rpc-url monad_testnet \
  --broadcast \
  --private-key $PRIVATE_KEY

# 5. Claim pot (when only 1 player remains)
forge script script/Interact.s.sol:ClaimWin \
  --rpc-url monad_testnet \
  --broadcast \
  --private-key $PRIVATE_KEY
```

### Automated Full Demo (For Pitch)

Complete game from start to finish with 3 players:

```bash
forge script script/DemoFull.s.sol:DemoFull \
  --rpc-url monad_testnet \
  --broadcast \
  --private-key $PRIVATE_KEY
```

This script:
1. Creates a match (host pays entry fee)
2. Player2 and Player3 join
3. Host starts the match
4. Plays 3 rounds with eliminations
5. Winner claims the pot

Perfect for live demonstrations during the pitch!

### Quick Test

Verify the deployed contract is working:

```bash
forge script script/QuickTest.s.sol:QuickTest \
  --rpc-url monad_testnet \
  --broadcast \
  --private-key $PRIVATE_KEY
```

---

## 🧪 Testing

```bash
# Run all tests
forge test

# Verbose output
forge test -vv

# Gas report
forge test --gas-report

# Test coverage
forge coverage
```

**Test Suite (15/15 passing):**
- ✅ Happy path: full game with 2 rounds, eliminations, claim
- ✅ 9 revert scenarios (host-only, deadline, alive, fees, double-claim, etc.)
- ✅ Edge case: all players eliminated → host wins by default
- ✅ 2 fuzz tests (entry fee accounting, invalid symbols)

---

## 📄 Contract Interface

### Core Functions

```solidity
// Create a match (host pays entry fee)
function createMatch(uint256 entryFee, uint256 roundDuration) external payable returns (uint256 matchId);

// Join a match (pay entry fee)
function joinMatch(uint256 matchId) external payable;

// Start the match (host only, min 2 players)
function startMatch(uint256 matchId) external;

// Start a round (anyone can call)
function startRound(uint256 matchId) external;

// Submit your answer (alive players only, before deadline)
function submit(uint256 matchId, uint8 symbol) external;

// End round (anyone can call after deadline)
function endRound(uint256 matchId) external;

// Claim pot (winner only)
function claimWin(uint256 matchId) external;
```

### View Functions

```solidity
function getMatch(uint256 matchId) external view returns (Match memory);
function getPlayers(uint256 matchId) external view returns (address[] memory);
function isAlive(uint256 matchId, address player) external view returns (bool);
function lifetimeWins(address player) external view returns (uint256);
```

### Events

```solidity
event MatchCreated(uint256 indexed matchId, address indexed host, uint256 entryFee);
event PlayerJoined(uint256 indexed matchId, address indexed player);
event MatchStarted(uint256 indexed matchId, uint256 playerCount);
event RoundStarted(uint256 indexed matchId, uint256 indexed round, uint8 symbol, uint256 deadline);
event PlayerEliminated(uint256 indexed matchId, uint256 indexed round, address indexed player);
event MatchFinished(uint256 indexed matchId, address indexed winner, uint256 pot);
event WinClaimed(uint256 indexed matchId, address indexed winner, uint256 amount);
```

---

## 🎨 Frontend Integration

The ABI is available at `abi/Tempo.json` for easy frontend integration.

**Key events to listen to:**
- `RoundStarted` — display the symbol and countdown
- `PlayerEliminated` — show who got eliminated
- `MatchFinished` — announce the winner

**Symbol mapping:**
- `0` = Up (↑)
- `1` = Down (↓)
- `2` = Left (←)
- `3` = Right (→)

---

## 🔐 Security Notes

**Randomness:** Uses `block.prevrandao + block.timestamp + matchId + round` hashed and modulo 4. Sufficient for hackathon MVP. Production would use Chainlink VRF or similar.

**Gas Optimization:** Custom errors instead of require strings, checks-effects-interactions pattern, minimal storage reads.

---

## 🤖 Bot Automático (H4)

El bot monitorea matches activos y llama `endRound()` automáticamente cuando el deadline expira.

### Setup

```bash
cd bot
npm install
```

### Uso

```bash
# Iniciar bot
npm start

# Test helpers (ver estado actual)
npm test
```

Ver `bot/README.md` para documentación completa.

---

## 📚 Project Structure

```
.
├── src/
│   └── Tempo.sol              # Main game contract
├── test/
│   └── Tempo.t.sol            # Test suite (15 tests)
├── script/
│   ├── Deploy.s.sol           # Deployment script
│   ├── Seed.s.sol             # Demo seed script
│   ├── Interact.s.sol         # Interactive demo scripts
│   └── Verify.s.sol           # Verification commands
├── bot/
│   ├── endRoundBot.js         # Automated endRound caller
│   ├── helpers.js             # Frontend helper functions
│   └── README.md              # Bot documentation
├── abi/
│   └── Tempo.json             # Clean ABI for frontend
├── foundry.toml               # Foundry config (Monad settings)
├── DEPLOYMENT.md              # Deployed contract info
└── .env.example               # Environment template
```

---

## 🌐 Network Info

**Monad Testnet**
- Chain ID: `10143`
- RPC: `https://testnet-rpc.monad.xyz`
- Block time: ~1 second
- Faucet: `https://agents.devnads.com/v1/faucet`
- Explorer (MonadVision): `https://testnet.monadexplorer.com`
- Explorer (Monadscan): `https://testnet.monadscan.com`

---

## 🏆 Why Monad?

**Tempo showcases Monad's killer feature: 1-second blocks.**

On Ethereum (12s blocks), a 3-second round would be impossible — players would need to wait multiple blocks. On Monad, rounds flow naturally at 2-3 seconds, creating genuine rhythm game mechanics on-chain.

This is the future of high-frequency on-chain gaming.

---

## 📝 License

MIT

---

## 🤝 Team

Built with ⚡ for the Monad Hackathon by Team Blitz.

- Smart Contracts + Deploy + Backend: [Persona A]
- Frontend: [Persona B]
- Design + UX: [Persona C]
