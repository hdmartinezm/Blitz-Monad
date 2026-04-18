# Tempo EndRound Bot

Bot automático que monitorea matches activos y llama `endRound()` cuando el deadline de una ronda expira.

## ¿Por qué?

En Tempo, después de que el deadline de una ronda expira, alguien debe llamar `endRound()` para:
1. Eliminar a los jugadores que fallaron o no enviaron
2. Determinar si el match terminó (≤1 jugador vivo)
3. Permitir que inicie la siguiente ronda

Este bot automatiza ese proceso, asegurando que el juego fluya sin intervención manual.

## Instalación

```bash
cd bot
npm install
```

## Configuración

El bot lee del `.env` en la raíz del proyecto:

```bash
# Requerido
TEMPO_ADDRESS=0x3e6349B8E00144dCBba5e92839055EA5f2Fc6EDe
PRIVATE_KEY=0x...  # Wallet que pagará el gas de endRound

# Opcional (usa defaults si no están)
POLL_INTERVAL=2000  # ms entre escaneos (default: 2000)
```

**Nota:** La wallet del bot necesita MON para pagar gas. Cada `endRound()` cuesta ~100k-300k gas.

## Uso

### Modo producción
```bash
npm start
```

### Modo desarrollo (auto-reload)
```bash
npm run dev
```

### Como servicio (systemd)

Crear `/etc/systemd/system/tempo-bot.service`:

```ini
[Unit]
Description=Tempo EndRound Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/Blitz-Monad/bot
ExecStart=/usr/bin/node endRoundBot.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Luego:
```bash
sudo systemctl enable tempo-bot
sudo systemctl start tempo-bot
sudo systemctl status tempo-bot
```

## Funcionamiento

1. **Escaneo:** Cada 2 segundos, el bot consulta todos los matches creados
2. **Filtrado:** Solo trackea matches en estado `Playing` (status = 1)
3. **Detección:** Compara `block.timestamp` con `roundDeadline`
4. **Ejecución:** Si el deadline expiró, llama `endRound(matchId)`
5. **Logging:** Imprime cada acción para debugging

### Logs de ejemplo

```
🤖 Tempo EndRound Bot iniciado
📍 Contrato: 0x3e6349B8E00144dCBba5e92839055EA5f2Fc6EDe
👤 Bot wallet: 0xe9CAFb1250b44B037E37Be7c7cfDa73F1C2e4444
⏱️  Poll interval: 2000 ms

🔍 Escaneando matches...

🎮 Match 0 detectado - Round 1, deadline: 2026-04-18T19:45:30.000Z
⏰ Match 0 - Deadline expirado (round 1)
✅ endRound llamado para match 0 - TX: 0xabc123...
   ✓ Confirmado en block 26300678
🏁 Match 0 terminado - Ganador: 0x1234...
```

## Seguridad

- **Private key:** Nunca commitear el `.env` con la private key real
- **Gas limits:** El bot usa `simulateContract` antes de enviar para evitar TXs fallidas
- **Error handling:** Errores esperados (ej: `RoundStillActive`) no detienen el bot
- **Idempotencia:** Si otro bot o usuario ya llamó `endRound`, el bot simplemente continúa

## Troubleshooting

### "Insufficient funds"
La wallet del bot no tiene MON. Pedir del faucet:
```bash
curl -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"chainId": 10143, "address": "YOUR_BOT_ADDRESS"}'
```

### "RoundStillActive"
Normal — el deadline aún no expiró. El bot reintentará en el próximo ciclo.

### Bot no detecta matches
Verificar que `TEMPO_ADDRESS` en `.env` es correcto y que hay matches creados.

## Alternativas

Si no quieres correr un bot 24/7:

1. **Frontend llama endRound:** El frontend puede llamar `endRound()` después del countdown
2. **Manual:** Usar `script/Interact.s.sol:EndRound` desde Foundry
3. **Cron job:** Correr el bot cada minuto con cron en vez de loop continuo

## Mejoras futuras

- [ ] Webhook notifications (Discord/Telegram) cuando un match termina
- [ ] Dashboard web con estado de matches activos
- [ ] Multi-chain support (mainnet + testnet)
- [ ] Prometheus metrics para monitoreo
- [ ] Gas price optimization (esperar gas bajo)
