# FlipChain — Trivia Game Fully On-Chain en Monad

**Juego de trivia competitivo on-chain, impulsado por los bloques de 1 segundo de Monad.**

FlipChain es un juego de trivia por eliminación donde los jugadores responden preguntas en tiempo real. El último superviviente gana todo el prize pool. La velocidad del juego solo es posible gracias a los bloques de 1 segundo de Monad — imposible en Ethereum con bloques de 12 segundos.

Construido para el Monad Hackathon por **Team Blitz**.

---

## 🎮 Mecánicas del Juego

1. **Host crea una sala** con entry fee → el contrato guarda el pot
2. **Jugadores se unen** pagando el entry fee
3. **Host inicia el match** → lobby se cierra
4. **Cada ronda:**
   - Se llama `startRound()` → contrato revela símbolo aleatorio + deadline
   - El frontend muestra una pregunta de trivia (A/B/C/D)
   - Jugadores vivos tienen N segundos para responder
   - Si responden correcto → envían el símbolo correcto al contrato → sobreviven
   - Si responden mal o no responden → son eliminados
5. **Último superviviente** llama `claimWin()` → recibe todo el pot

### Reglas
- Mínimo 2 jugadores para iniciar
- Responde correctamente la pregunta de cada ronda antes de que se acabe el tiempo
- Respuesta incorrecta o timeout = ELIMINACIÓN
- El último superviviente gana todo el prize pool

---

## 🏗️ Tech Stack

| Capa | Tecnología |
|------|-----------|
| Blockchain | Monad Testnet (chainId 10143) |
| Smart Contract | Solidity 0.8.28, Foundry |
| Frontend | React + TypeScript + Vite |
| Web3 | wagmi v3 + viem + RainbowKit |
| Estilos | Tailwind CSS v4 |
| Bot | Node.js + viem |

---

## 📦 Instalación

```bash
# Clonar el repo
git clone https://github.com/hdmartinezm/Blitz-Monad.git
cd Blitz-Monad

# Instalar dependencias del contrato
forge install

# Build
forge build

# Tests (15/15 passing)
forge test -vv
```

### Frontend

```bash
cd flipchain_export
npm install
npm run dev -- --host --port 3002
```

Abre http://localhost:3002

---

## 🚀 Deploy

### 1. Configurar entorno

```bash
cp .env.example .env
# Editar .env con tu PRIVATE_KEY
```

### 2. Obtener MON de testnet

```bash
curl -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"chainId": 10143, "address": "TU_ADDRESS"}'
```

### 3. Deploy

```bash
forge script script/Deploy.s.sol:DeployTempo \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --private-key $PRIVATE_KEY
```

### 4. Actualizar dirección en frontend

Editar `flipchain_export/src/lib/web3.ts`:
```ts
export const TEMPO_ADDRESS = '0xTU_CONTRATO' as const
```

---

## 🌐 Contrato Deployado

| Red | Dirección |
|-----|-----------|
| Monad Testnet | `0xe84a13e04e2139de5ecf33f7e800b2176d994806` |

Explorers:
- [Monadscan](https://testnet.monadscan.com/address/0xe84a13e04e2139de5ecf33f7e800b2176d994806)
- [Socialscan](https://monad-testnet.socialscan.io/address/0xe84a13e04e2139de5ecf33f7e800b2176d994806)
- [MonadVision](https://testnet.monadvision.com/address/0xe84a13e04e2139de5ecf33f7e800b2176d994806)

---

## 🎯 Cómo Jugar

### Host (Crear Sala)
1. Ir a http://localhost:3002
2. Conectar wallet en MetaMask (Monad Testnet)
3. Clic en **"🆕 CREAR SALA"**
4. Seleccionar dificultad (Fácil / Medio / Difícil / Insano)
5. Confirmar transacción en MetaMask
6. Compartir el **número de sala** con los demás jugadores
7. Esperar jugadores → clic en **"INICIAR JUEGO"**

### Jugadores (Unirse)
1. Ir a http://192.168.X.X:3002 (misma red WiFi)
2. Conectar wallet
3. En la sección **"🔗 UNIRSE A SALA"**, ingresar el número de sala
4. Clic en **ENTRAR** → clic en **"UNIRSE AL JUEGO"**
5. Confirmar transacción

### Dificultades

| Nivel | Buy-in | Tiempo por ronda |
|-------|--------|-----------------|
| Fácil | 0.05 MON | 20s |
| Medio | 0.10 MON | 15s |
| Difícil | 0.25 MON | 12s |
| Insano | 0.50 MON | 10s |

---

## 🤖 Bot Automático

El bot monitorea matches activos y llama `endRound()` automáticamente cuando el deadline expira.

```bash
cd bot
npm install
npm start
```

---

## 📄 Interfaz del Contrato

```solidity
// Crear sala (host paga entry fee)
function createMatch(uint256 entryFee, uint256 roundDuration) external payable returns (uint256 matchId);

// Unirse a sala
function joinMatch(uint256 matchId) external payable;

// Iniciar match (solo host, mínimo 1 jugador)
function startMatch(uint256 matchId) external;

// Iniciar ronda (cualquiera puede llamar)
function startRound(uint256 matchId) external;

// Enviar respuesta (jugadores vivos, antes del deadline)
function submit(uint256 matchId, uint8 symbol) external;

// Cerrar ronda (cualquiera, después del deadline)
function endRound(uint256 matchId) external;

// Reclamar premio (solo ganador)
function claimWin(uint256 matchId) external;
```

---

## 🧪 Tests

```bash
forge test -vv
```

**Suite (15/15 passing):**
- ✅ Happy path: juego completo con 2 rondas, eliminaciones, claim
- ✅ 9 escenarios de revert
- ✅ Edge case: todos eliminados → host gana por defecto
- ✅ 2 fuzz tests

---

## 📚 Estructura del Proyecto

```
.
├── src/
│   └── Tempo.sol              # Contrato principal
├── test/
│   └── Tempo.t.sol            # Tests (15/15)
├── script/
│   ├── Deploy.s.sol           # Deploy script
│   ├── Seed.s.sol             # Demo seed
│   └── Interact.s.sol         # Scripts interactivos
├── flipchain_export/          # Frontend React
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx        # Lógica principal del juego
│   │   │   ├── components/    # UI components
│   │   │   └── data/          # Preguntas de trivia
│   │   └── lib/
│   │       └── web3.ts        # Config wagmi + ABI
│   └── package.json
├── bot/
│   ├── endRoundBot.js         # Bot automático
│   └── helpers.js             # Helpers para frontend
├── abi/
│   └── Tempo.json             # ABI limpio
├── DEPLOYMENT.md              # Info del contrato deployado
└── WALLETS.md                 # Wallets de demo
```

---

## 🌐 Red Monad Testnet

| Parámetro | Valor |
|-----------|-------|
| Chain ID | `10143` |
| RPC | `https://testnet-rpc.monad.xyz` |
| Símbolo | `MON` |
| Block time | ~1 segundo |
| Faucet | `https://agents.devnads.com/v1/faucet` |
| Explorer | `https://testnet.monadscan.com` |

---

## 🏆 ¿Por qué Monad?

**FlipChain demuestra la killer feature de Monad: bloques de 1 segundo.**

En Ethereum (12s por bloque), rondas de 10-20 segundos serían lentas e impredecibles. En Monad, las transacciones se confirman en ~1 segundo, creando una experiencia de juego fluida y genuinamente competitiva on-chain.

Esto es el futuro del gaming on-chain de alta frecuencia.

---

## 🔐 Seguridad

**Randomness:** Usa `block.prevrandao + block.timestamp + matchId + round` hasheado y módulo 4. Suficiente para MVP de hackathon. Producción usaría Chainlink VRF.

**Patrones:** Custom errors, checks-effects-interactions, mínimas lecturas de storage.

---

## 📝 Licencia

MIT

---

## 🤝 Equipo

Construido con ⚡ para el Monad Hackathon por **Team Blitz**.

- **Smart Contracts + Backend + Deploy:** Hector Martinez
- **Frontend + Integración Web3:** Team Blitz
- **Diseño + UX:** Team Blitz
