# Demo Wallets - Tempo Hackathon

Wallets generadas y fondeadas para la demo del hackathon.

**⚠️ IMPORTANTE:** Estas wallets son SOLO para testnet. NO usar en mainnet.

---

## Wallet 1 - Host / Deployer

**Address:** `0xe9CAFb1250b44B037E37Be7c7cfDa73F1C2e4444`  
**Private Key:** Ver `~/.monad-wallet` o `.env`  
**Balance inicial:** 1 MON (del faucet)  
**Balance actual:** ~2.85 MON  
**Funded TX:** `0xe6711d87405dd4feb5705dd79206765b82d55743e673c072df51bc500de07201`

**Uso:**
- Deployó el contrato Tempo
- Host en las demos
- Tiene suficiente MON para múltiples demos

---

## Wallet 2 - Player 2

**Address:** `0xC9E95DB5813FaEb13e4D3D70b3fD9352E569CfD7`  
**Private Key:** Ver `~/.monad-wallet` o `.env` (PLAYER2_KEY)  
**Balance:** 1 MON  
**Funded TX:** `0x7a6ce9733dbf2dec974f3810a56293638d111116faf279e313bd6aa48c9243e6d`

**Uso:**
- Segundo jugador en demos
- Se une a matches creados por el host

---

## Wallet 3 - Player 3

**Address:** `0xa7cb72f866214058Dc37Ec5a83a034eaB0C0C530`  
**Private Key:** Ver `~/.monad-wallet` o `.env` (PLAYER3_KEY)  
**Balance:** 1 MON  
**Funded TX:** `0xd4d4a1377b93640abdd6855a9d21af3953904895c79e345cee0e6524b3e00449`

**Uso:**
- Tercer jugador en demos
- Se une a matches creados por el host

---

## Importar en MetaMask

Para cada wallet:

1. MetaMask → Click en el ícono de cuenta
2. "Import Account"
3. Pega la private key correspondiente
4. Asegúrate de estar en Monad Testnet (Chain ID 10143)

---

## Verificar Balances

```bash
# Wallet 1 (Host)
cast balance 0xe9CAFb1250b44B037E37Be7c7cfDa73F1C2e4444 \
  --rpc-url https://testnet-rpc.monad.xyz --ether

# Wallet 2 (Player 2)
cast balance 0xC9E95DB5813FaEb13e4D3D70b3fD9352E569CfD7 \
  --rpc-url https://testnet-rpc.monad.xyz --ether

# Wallet 3 (Player 3)
cast balance 0xa7cb72f866214058Dc37Ec5a83a034eaB0C0C530 \
  --rpc-url https://testnet-rpc.monad.xyz --ether
```

---

## Pedir más MON (si se acaba)

```bash
# Para cualquier wallet
curl -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"chainId": 10143, "address": "TU_ADDRESS_AQUI"}'
```

---

## Explorers

- **Socialscan:** https://monad-testnet.socialscan.io
- **Monadscan:** https://testnet.monadscan.com
- **MonadVision:** https://testnet.monadvision.com

---

## Seguridad

- ✅ Wallets guardadas en `~/.monad-wallet` (chmod 600)
- ✅ `.env` en `.gitignore` (no se commitea)
- ✅ Solo para testnet - NO usar en mainnet
- ⚠️ Si commiteas por error, regenera las wallets inmediatamente

---

## Wallet 4 - Player 4 (nuevo participante)

**Address:** `0xb6Fb54263a62dc0383D62Ba66DED6F7A48aEc10d`  
**Private Key:** `0x9368b8b72af19bd0735f557510a4c2bbdab09ef29d2884af8b4d48e85c502df0`  
**Balance:** 1 MON  
**Funded TX:** `0x5a2cfe571d2300e44c8d5f9a321a8bd47c84f00a32def4ba0017b47f4ac9ed49`
