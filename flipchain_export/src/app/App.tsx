import { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther, formatEther } from 'viem';
import { TEMPO_ADDRESS, TEMPO_ABI } from '../lib/web3';
import { Lobby } from './components/Lobby';
import { QuestionRound } from './components/QuestionRound';
import { Winner } from './components/Winner';
import { UserProfile, UserData } from './components/UserProfile';
import { DifficultySelection } from './components/DifficultySelection';
import { Difficulty } from './data/difficulties';
import { QUESTIONS } from './data/questions';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

type GameState = 'connect' | 'home' | 'create-match' | 'lobby' | 'waiting-round' | 'question' | 'winner';
type TxAction = 'createMatch' | 'joinMatch' | 'startMatch' | 'startRound' | 'submit' | 'endRound' | 'claimWin' | null;

const DEFAULT_USER: UserData = {
  avatar: '👤', name: 'Player',
  wallet: '0x0000000000000000000000000000000000000000',
  preferredNGO: 'red-cross',
};

const pickQuestion = (symbol: number) => {
  const idx = (symbol * 7 + Math.floor(Date.now() / 10000)) % QUESTIONS.length;
  return QUESTIONS[idx] ?? QUESTIONS[0];
};

export default function App() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<UserData>(DEFAULT_USER);
  const [gameState, setGameState] = useState<GameState>('connect');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [matchId, setMatchId] = useState<bigint | null>(null);
  const [playerAnswer, setPlayerAnswer] = useState<number>(-1);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState(QUESTIONS[0]);
  const [joinMatchIdInput, setJoinMatchIdInput] = useState('');

  // useRef para txAction — no causa re-renders y siempre tiene el valor actual
  const txActionRef = useRef<TxAction>(null);
  const matchIdRef = useRef<bigint | null>(null);

  // Sync matchId to ref
  useEffect(() => { matchIdRef.current = matchId; }, [matchId]);

  useEffect(() => {
    if (address) {
      setUser(prev => ({ ...prev, wallet: address, name: `${address.slice(0, 6)}...${address.slice(-4)}` }));
      if (gameState === 'connect') setGameState('home');
    } else {
      setGameState('connect');
    }
  }, [address]);

  const { data: nextMatchId, refetch: refetchNextMatchId } = useReadContract({
    address: TEMPO_ADDRESS, abi: TEMPO_ABI, functionName: 'nextMatchId',
    query: { refetchInterval: 3000 },
  });

  const { data: matchData, refetch: refetchMatch } = useReadContract({
    address: TEMPO_ADDRESS, abi: TEMPO_ABI, functionName: 'getMatch',
    args: matchId !== null ? [matchId] : undefined,
    query: { enabled: matchId !== null, refetchInterval: 3000 },
  });

  const { data: players, refetch: refetchPlayers } = useReadContract({
    address: TEMPO_ADDRESS, abi: TEMPO_ABI, functionName: 'getPlayers',
    args: matchId !== null ? [matchId] : undefined,
    query: { enabled: matchId !== null, refetchInterval: 3000 },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const lastProcessedHash = useRef<string | null>(null);

  // Helper para llamar writeContract y setear txAction
  const sendTx = (action: TxAction, params: Parameters<typeof writeContract>[0]) => {
    txActionRef.current = action;
    writeContract(params);
  };

  useEffect(() => {
    if (!isSuccess || !hash) return;
    // Evitar procesar el mismo hash dos veces
    if (lastProcessedHash.current === hash) return;
    lastProcessedHash.current = hash;

    const action = txActionRef.current;
    txActionRef.current = null;
    const mid = matchIdRef.current;

    console.log('TX Success, action:', action, 'hash:', hash, 'matchId:', mid?.toString());

    if (action === 'createMatch') {
      refetchNextMatchId().then(({ data }) => {
        if (data !== undefined) {
          const newId = (data as bigint) - 1n;
          setMatchId(newId);
          setGameState('lobby');
          toast.success(`¡Sala #${newId} creada!`);
        }
      });
    }

    if (action === 'joinMatch') {
      setGameState('lobby');
      toast.success('¡Te uniste!');
      setTimeout(() => refetchPlayers(), 500);
    }

    if (action === 'startMatch') {
      // Llamar startRound automáticamente
      setTimeout(() => {
        if (mid !== null) {
          sendTx('startRound', {
            address: TEMPO_ADDRESS, abi: TEMPO_ABI,
            functionName: 'startRound', args: [mid],
          });
        }
      }, 1500);
    }

    if (action === 'startRound') {
      setTimeout(() => {
        refetchMatch().then(({ data }) => {
          if (data) {
            const symbol = Number((data as any).symbolOfRound);
            setCurrentSymbol(symbol);
            setCurrentQuestion(pickQuestion(symbol));
            setIsAnswerLocked(false);
            setPlayerAnswer(-1);
            setGameState('question');
          }
        });
      }, 1000);
    }

    if (action === 'submit') {
      // NO cambiar gameState — quedarse en question esperando el timer
      console.log('Submit confirmed, staying in question screen');
    }

    if (action === 'endRound') {
      setTimeout(() => {
        refetchMatch().then(({ data }) => {
          if (data) {
            const status = Number((data as any).status);
            if (status === 2) {
              setGameState('winner');
              toast.success('¡Juego terminado!');
            } else {
              toast.info('¡Siguiente ronda!');
              if (mid !== null) {
                sendTx('startRound', {
                  address: TEMPO_ADDRESS, abi: TEMPO_ABI,
                  functionName: 'startRound', args: [mid],
                });
              }
            }
          }
        });
      }, 1000);
    }

    if (action === 'claimWin') {
      toast.success('¡Premio reclamado!');
    }
  }, [isSuccess]);

  // Eventos del contrato
  useWatchContractEvent({
    address: TEMPO_ADDRESS, abi: TEMPO_ABI, eventName: 'RoundStarted',
    onLogs(logs) {
      const log = logs[0] as any;
      const eventMatchId = BigInt(log.args.matchId);
      if (matchIdRef.current !== null && eventMatchId === matchIdRef.current) {
        const symbol = Number(log.args.symbol);
        console.log('RoundStarted event, symbol:', symbol);
        setCurrentSymbol(symbol);
        setCurrentQuestion(pickQuestion(symbol));
        setIsAnswerLocked(false);
        setPlayerAnswer(-1);
        setGameState('question');
      }
    },
  });

  useWatchContractEvent({
    address: TEMPO_ADDRESS, abi: TEMPO_ABI, eventName: 'MatchFinished',
    onLogs(logs) {
      const log = logs[0] as any;
      const eventMatchId = BigInt(log.args.matchId);
      if (matchIdRef.current !== null && eventMatchId === matchIdRef.current) {
        setGameState('winner');
        refetchMatch();
      }
    },
  });

  useWatchContractEvent({
    address: TEMPO_ADDRESS, abi: TEMPO_ABI, eventName: 'PlayerEliminated',
    onLogs(logs) {
      const log = logs[0] as any;
      if (log.args.player?.toLowerCase() === address?.toLowerCase()) {
        toast.error('¡Fuiste eliminado!');
      } else {
        toast.warning(`${log.args.player?.slice(0, 6)}... eliminado`);
      }
    },
  });

  // Datos del match
  const match = matchData ? {
    host: (matchData as any).host as string,
    entryFee: (matchData as any).entryFee as bigint,
    pot: (matchData as any).pot as bigint,
    currentRound: (matchData as any).currentRound as bigint,
    status: Number((matchData as any).status),
    roundDuration: (matchData as any).roundDuration as bigint,
  } : null;

  const isValidMatch = !!(match?.host && match.host !== '0x0000000000000000000000000000000000000000');
  const playerList = (players as string[] | undefined) ?? [];
  const playerCount = playerList.length;
  const prizePool = isValidMatch ? parseFloat(formatEther(match!.pot)) : 0;
  const isHost = !!(isValidMatch && address && match!.host?.toLowerCase() === address.toLowerCase());
  const hasJoined = playerList.map(p => p.toLowerCase()).includes(address?.toLowerCase() ?? '');

  // Polling: jugadores no-host detectan inicio de ronda
  useEffect(() => {
    if (!isValidMatch || gameState !== 'waiting-round') return;
    if (match!.status === 1 && match!.currentRound > 0n) {
      const symbol = Number((matchData as any).symbolOfRound);
      setCurrentSymbol(symbol);
      setCurrentQuestion(pickQuestion(symbol));
      setIsAnswerLocked(false);
      setPlayerAnswer(-1);
      setGameState('question');
    }
  }, [matchData]);

  // Handlers
  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    sendTx('createMatch', {
      address: TEMPO_ADDRESS, abi: TEMPO_ABI,
      functionName: 'createMatch',
      args: [parseEther(difficulty.buyIn.toString()), BigInt(difficulty.timeLimit)],
      value: parseEther(difficulty.buyIn.toString()),
    });
    toast.info('Creando sala...');
  };

  const handleJoinById = () => {
    if (!joinMatchIdInput) return;
    const id = BigInt(joinMatchIdInput);
    setMatchId(id);
    setGameState('lobby');
  };

  const handleJoinGame = () => {
    if (matchId === null || !isValidMatch) return;
    sendTx('joinMatch', {
      address: TEMPO_ADDRESS, abi: TEMPO_ABI,
      functionName: 'joinMatch', args: [matchId], value: match!.entryFee,
    });
  };

  const handleStartGame = () => {
    if (matchId === null) return;
    sendTx('startMatch', {
      address: TEMPO_ADDRESS, abi: TEMPO_ABI,
      functionName: 'startMatch', args: [matchId],
    });
  };

  const handleStartRound = () => {
    if (matchId === null) return;
    sendTx('startRound', {
      address: TEMPO_ADDRESS, abi: TEMPO_ABI,
      functionName: 'startRound', args: [matchId],
    });
  };

  const handleAnswer = (answer: number) => {
    if (matchId === null || isAnswerLocked) return;
    setPlayerAnswer(answer);
    setIsAnswerLocked(true);
    const isCorrect = answer === currentQuestion.correctAnswer;
    const submitSymbol = isCorrect ? currentSymbol : (currentSymbol + 1) % 4;
    sendTx('submit', {
      address: TEMPO_ADDRESS, abi: TEMPO_ABI,
      functionName: 'submit', args: [matchId, submitSymbol],
    });
    toast(isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto', { duration: 2000 });
  };

  const handleRoundTimeout = () => {
    const mid = matchIdRef.current;
    if (mid === null) return;
    
    // Llamar endRound en el contrato
    setTimeout(() => {
      sendTx('endRound', {
        address: TEMPO_ADDRESS, abi: TEMPO_ABI,
        functionName: 'endRound', args: [mid],
      });
    }, 1500);
  };

  const handleClaimPrize = () => {
    if (matchId === null) return;
    sendTx('claimWin', {
      address: TEMPO_ADDRESS, abi: TEMPO_ABI,
      functionName: 'claimWin', args: [matchId],
    });
  };

  const handlePlayAgain = () => {
    setGameState('home');
    setSelectedDifficulty(null);
    setMatchId(null);
    setPlayerAnswer(-1);
    setIsAnswerLocked(false);
    txActionRef.current = null;
    setJoinMatchIdInput('');
  };

  const bgGradient = gameState === 'winner'
    ? 'from-yellow-950 via-amber-950 to-orange-950'
    : 'from-zinc-950 via-slate-900 to-purple-950';

  return (
    <>
      <Toaster />
      <div className="fixed top-6 left-6 z-50"><ConnectButton /></div>
      {isConnected && !['home', 'create-match'].includes(gameState) && (
        <UserProfile user={user} onUpdate={setUser} />
      )}

      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 md:p-8`}>
        <div className="w-full max-w-2xl">

          {(isPending || isConfirming) && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg text-center text-yellow-400 font-mono text-sm animate-pulse">
              {isPending ? '⏳ Confirma en MetaMask...' : '⛓️ Procesando en Monad...'}
            </div>
          )}

          {/* CONNECT */}
          {!isConnected && (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">🎵</div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-violet-500 bg-clip-text text-transparent mb-4">FLIPCHAIN</h1>
              <p className="text-zinc-400 text-xl mb-8">Trivia game on-chain en Monad</p>
              <ConnectButton />
            </div>
          )}

          {/* HOME */}
          {isConnected && gameState === 'home' && (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <div className="text-6xl mb-3">🎵</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">FLIPCHAIN</h1>
                <p className="text-zinc-400 mt-2">Trivia game on-chain en Monad</p>
              </div>
              <button onClick={() => setGameState('create-match')}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold py-6 rounded-2xl border-2 border-purple-400 text-2xl">
                🆕 CREAR SALA
              </button>
              <div className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-2xl p-6">
                <p className="text-zinc-300 font-bold text-lg text-center mb-4">🔗 UNIRSE A SALA</p>
                <div className="flex gap-3">
                  <input type="number" min="0" value={joinMatchIdInput}
                    onChange={e => setJoinMatchIdInput(e.target.value)}
                    placeholder="Número de sala"
                    className="flex-1 bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-4 text-white text-3xl font-bold text-center focus:outline-none focus:border-purple-500" />
                  <button onClick={handleJoinById} disabled={!joinMatchIdInput}
                    className="bg-gradient-to-r from-green-600 to-emerald-700 disabled:opacity-40 text-white font-bold px-6 rounded-xl text-xl">
                    ENTRAR
                  </button>
                </div>
                <p className="text-zinc-500 text-xs font-mono mt-3 text-center">El host te dice el número</p>
              </div>
            </div>
          )}

          {/* CREATE */}
          {isConnected && gameState === 'create-match' && (
            <div className="flex flex-col gap-4">
              <button onClick={() => setGameState('home')} className="text-zinc-500 hover:text-zinc-300 font-mono text-sm text-left">← Volver</button>
              <DifficultySelection onSelect={handleDifficultySelect} />
            </div>
          )}

          {/* LOBBY */}
          {isConnected && gameState === 'lobby' && matchId !== null && (
            <div className="flex flex-col gap-4">
              <div className="bg-purple-900/40 border-2 border-purple-500 rounded-2xl p-5 text-center">
                <p className="text-purple-300 font-mono text-xs mb-1">SALA — COMPARTE ESTE NÚMERO</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-white font-bold text-6xl">#{matchId.toString()}</span>
                  <button onClick={() => { navigator.clipboard.writeText(matchId.toString()); toast.success('¡Copiado!'); }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm">📋</button>
                </div>
                <p className="text-zinc-400 font-mono text-xs mt-2">
                  {playerCount < 2 ? `⏳ ${playerCount}/2 jugadores` : `✅ ${playerCount} jugadores listos`}
                </p>
              </div>
              <Lobby
                playerCount={playerCount} confirmedCount={playerCount}
                prizePool={prizePool} donationAmount={0} donationPercentage={0}
                buyIn={isValidMatch ? parseFloat(formatEther(match!.entryFee)) : (selectedDifficulty?.buyIn ?? 0.05)}
                difficultyName={selectedDifficulty?.name ?? `Sala #${matchId}`}
                onJoin={handleJoinGame} onStart={handleStartGame}
                hasJoined={hasJoined} isConfirmed={hasJoined}
                isHost={isHost || !isValidMatch}
              />
            </div>
          )}

          {/* WAITING ROUND */}
          {isConnected && gameState === 'waiting-round' && (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 animate-pulse">🎮</div>
              <h1 className="text-4xl font-bold text-white mb-2">¡Match iniciado!</h1>
              <p className="text-zinc-400 mb-8">Sala #{matchId?.toString()}</p>
              {isHost ? (
                <button onClick={handleStartRound} disabled={isPending || isConfirming}
                  className="bg-gradient-to-r from-green-600 to-emerald-700 disabled:opacity-50 text-white font-bold py-5 px-10 rounded-xl border-2 border-green-400 text-2xl">
                  {isPending || isConfirming ? '⏳ Procesando...' : '🚀 INICIAR PRIMERA RONDA'}
                </button>
              ) : (
                <p className="text-zinc-500 font-mono text-lg animate-pulse">⏳ Esperando al host...</p>
              )}
            </div>
          )}

          {/* PREGUNTA */}
          {isConnected && gameState === 'question' && (
            <QuestionRound
              question={currentQuestion}
              timeLimit={isValidMatch ? Number(match!.roundDuration) : (selectedDifficulty?.timeLimit || 30)}
              onAnswer={handleAnswer}
              onTimeout={handleRoundTimeout}
              isAnswerLocked={isAnswerLocked}
            />
          )}

          {/* GANADOR */}
          {isConnected && gameState === 'winner' && (
            <Winner
              prizePool={prizePool} donationAmount={0} donationPercentage={0}
              onClaim={handleClaimPrize} onPlayAgain={handlePlayAgain}
            />
          )}

        </div>
      </div>
    </>
  );
}
