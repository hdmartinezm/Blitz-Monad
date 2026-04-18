// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Este archivo NO es un Script de Foundry ejecutable.
// Es documentacion ejecutable: los comandos de verificacion estan abajo.
// Correlos desde la terminal despues del deploy.

// ─── Verificacion en MonadVision (Sourcify) — SIN API key ────────────────────
//
// forge verify-contract \
//   $TEMPO_ADDRESS \
//   src/Tempo.sol:Tempo \
//   --chain 10143 \
//   --verifier sourcify \
//   --verifier-url https://sourcify-api-monad.blockvision.org/
//
// ─── Verificacion en Monadscan (Etherscan-compatible) — CON API key ───────────
//
// forge verify-contract \
//   $TEMPO_ADDRESS \
//   src/Tempo.sol:Tempo \
//   --chain 10143 \
//   --verifier etherscan \
//   --etherscan-api-key $MONADEXPLORER_API_KEY \
//   --watch
//
// ─── Verificar que quedo verificado ──────────────────────────────────────────
//
// MonadVision : https://testnet.monadexplorer.com/address/$TEMPO_ADDRESS
// Monadscan   : https://testnet.monadscan.com/address/$TEMPO_ADDRESS
