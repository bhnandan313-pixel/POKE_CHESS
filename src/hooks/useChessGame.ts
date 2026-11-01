/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';
import {
  GameStatus,
  MoveRecord,
  CapturedPiece,
  AbilityAnimationEvent,
  MatchSettings,
  MatchStats,
  BattleEvent,
} from '../types/game';
import { sounds } from '../engine/soundEffects';
import {
  createInitialEnergyState,
  deductEnergy,
  canAffordAbility,
  handleTurnCompletedEnergy,
} from '../engine/energyEngine';
import {
  createInitialAbilityState,
  addProtection,
  hasActiveProtection,
  consumeProtection,
  handleTurnCompletedProtections,
  AbilityState,
} from '../engine/abilityEngine';
import {
  getAdjacentSquares,
  getOrthogonalSquares,
  isAggronImmuneToPawnCapture,
  validateWimpodSwarm,
  validateAlakazamShield,
  validateAggronWall,
  validateMewtwoControlTarget,
  getMewtwoControlDestinations,
  getRapidashFlameDashDestinations,
  getSafeArceusEscapeSquares,
} from '../engine/abilityValidator';
import { POKEMON_PIECES } from '../engine/pokemonRoster';
import { computeAiAction } from '../engine/ai/aiPlayer';

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const STARTING_PIECES: Record<PieceSymbol, number> = {
  p: 8,
  r: 2,
  n: 2,
  b: 2,
  q: 1,
  k: 1,
};

export const DEFAULT_MATCH_SETTINGS: MatchSettings = {
  mode: 'local',
  aiDifficulty: 'intermediate',
  humanColor: 'w',
  player1: {
    name: 'Trainer Red',
    avatarId: 'red',
    color: 'w',
  },
  player2: {
    name: 'Trainer Blue',
    avatarId: 'blue',
    color: 'b',
  },
  timerMinutes: 10,
  boardTheme: 'cosmic_void',
  soundEnabled: true,
  animationsEnabled: true,
};

export interface GameSnapshot {
  fen: string;
  energyState: ReturnType<typeof createInitialEnergyState>;
  abilityState: AbilityState;
  moveHistory: MoveRecord[];
  timers: Record<Color, number>;
  resignedColor: Color | null;
  lastMove: { from: Square; to: Square } | null;
  matchStats: MatchStats;
}

export function useChessGame(initialConfig?: Partial<MatchSettings>) {
  const [matchSettings, setMatchSettings] = useState<MatchSettings>(() => ({
    ...DEFAULT_MATCH_SETTINGS,
    ...initialConfig,
  }));

  const [chess] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>(chess.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(matchSettings.soundEnabled);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(matchSettings.animationsEnabled);
  const [inspectedPiece, setInspectedPiece] = useState<{ symbol: PieceSymbol; color: Color } | null>(null);
  const [resignedColor, setResignedColor] = useState<Color | null>(null);

  // Phase 4 Match Timer State
  const [timers, setTimers] = useState<Record<Color, number>>(() => ({
    w: (matchSettings.timerMinutes || 10) * 60,
    b: (matchSettings.timerMinutes || 10) * 60,
  }));
  const [timeOutWinner, setTimeOutWinner] = useState<Color | null>(null);

  // Phase 4 Match Statistics
  const [matchStats, setMatchStats] = useState<MatchStats>(() => ({
    startTime: Date.now(),
    durationSeconds: 0,
    totalMoves: 0,
    abilitiesUsed: 0,
    evolutionsCount: 0,
    capturesCount: 0,
  }));

  // Phase 4 Local Multiplayer Undo Stack
  const [undoStack, setUndoStack] = useState<GameSnapshot[]>([]);

  // Phase 4 Battle Events Notification Stack
  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([]);

  // Phase 2 Energy & Ability State
  const [energyState, setEnergyState] = useState(() => createInitialEnergyState());
  const [abilityState, setAbilityState] = useState<AbilityState>(() => createInitialAbilityState());
  const [notification, setNotification] = useState<{ text: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // Phase 5 AI Thinking State
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [aiThinkingMessage, setAiThinkingMessage] = useState<string>('');

  // Sync sound settings
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sounds.enabled = next;
      if (next) sounds.playClick();
      return next;
    });
  }, []);

  // Compute 8x8 board representation
  const board = useMemo(() => chess.board(), [chess, fen]);

  // Compute game status
  const status: GameStatus = useMemo(() => {
    const turn = chess.turn();
    const isCheck = chess.inCheck();
    const isCheckmate = chess.isCheckmate();
    const isStalemate = chess.isStalemate();
    const isThreefoldRepetition = chess.isThreefoldRepetition();
    const isInsufficientMaterial = chess.isInsufficientMaterial();
    const isDraw = chess.isDraw() || isStalemate || isThreefoldRepetition || isInsufficientMaterial;

    let winner: Color | 'draw' | null = null;
    let statusText = '';

    if (timeOutWinner) {
      winner = timeOutWinner;
      const whitePlayer = matchSettings.player1.color === 'w' ? matchSettings.player1.name : matchSettings.player2.name;
      const blackPlayer = matchSettings.player1.color === 'b' ? matchSettings.player1.name : matchSettings.player2.name;
      const winnerName = timeOutWinner === 'w' ? whitePlayer : blackPlayer;
      statusText = `Time Expired! ${winnerName} (${timeOutWinner === 'w' ? 'White' : 'Black'}) wins on time!`;
    } else if (resignedColor) {
      winner = resignedColor === 'w' ? 'b' : 'w';
      const whitePlayer = matchSettings.player1.color === 'w' ? matchSettings.player1.name : matchSettings.player2.name;
      const blackPlayer = matchSettings.player1.color === 'b' ? matchSettings.player1.name : matchSettings.player2.name;
      const resigningName = resignedColor === 'w' ? whitePlayer : blackPlayer;
      const winningName = winner === 'w' ? whitePlayer : blackPlayer;
      statusText = `${resigningName} resigned. ${winningName} (${winner === 'w' ? 'White' : 'Black'}) wins!`;
    } else if (isCheckmate) {
      winner = turn === 'w' ? 'b' : 'w';
      const whitePlayer = matchSettings.player1.color === 'w' ? matchSettings.player1.name : matchSettings.player2.name;
      const blackPlayer = matchSettings.player1.color === 'b' ? matchSettings.player1.name : matchSettings.player2.name;
      const winningName = winner === 'w' ? whitePlayer : blackPlayer;
      statusText = `Checkmate! ${winningName} (${winner === 'w' ? 'Celestial Vanguard' : 'Abyssal Legion'}) is Victorious!`;
    } else if (isStalemate) {
      winner = 'draw';
      statusText = 'Stalemate! Game drawn by lack of legal moves.';
    } else if (isThreefoldRepetition) {
      winner = 'draw';
      statusText = 'Draw by Threefold Repetition!';
    } else if (isInsufficientMaterial) {
      winner = 'draw';
      statusText = 'Draw by Insufficient Material!';
    } else if (isCheck) {
      const whitePlayer = matchSettings.player1.color === 'w' ? matchSettings.player1.name : matchSettings.player2.name;
      const blackPlayer = matchSettings.player1.color === 'b' ? matchSettings.player1.name : matchSettings.player2.name;
      statusText = `${turn === 'w' ? `${whitePlayer} (Arceus)` : `${blackPlayer} (Mewtwo)`} is in Check!`;
    } else {
      const whitePlayer = matchSettings.player1.color === 'w' ? matchSettings.player1.name : matchSettings.player2.name;
      const blackPlayer = matchSettings.player1.color === 'b' ? matchSettings.player1.name : matchSettings.player2.name;
      statusText = `${turn === 'w' ? `${whitePlayer}'s Turn (White)` : `${blackPlayer}'s Turn (Black)`}`;
    }

    return {
      isCheck,
      isCheckmate: isCheckmate || resignedColor !== null || timeOutWinner !== null,
      isDraw: isDraw && !resignedColor && !timeOutWinner,
      isStalemate,
      isThreefoldRepetition,
      isInsufficientMaterial,
      turn,
      winner,
      statusText,
    };
  }, [chess, fen, resignedColor, timeOutWinner, matchSettings]);

  // Compute captured pieces and material differences
  const { capturedWhite, capturedBlack, materialScore } = useMemo(() => {
    const currentCounts: { w: Record<PieceSymbol, number>; b: Record<PieceSymbol, number> } = {
      w: { p: 0, r: 0, n: 0, b: 0, q: 0, k: 0 },
      b: { p: 0, r: 0, n: 0, b: 0, q: 0, k: 0 },
    };

    board.forEach((row) => {
      row.forEach((piece) => {
        if (piece) {
          currentCounts[piece.color][piece.type]++;
        }
      });
    });

    const capturedW: CapturedPiece[] = [];
    const capturedB: CapturedPiece[] = [];

    let whiteScore = 0;
    let blackScore = 0;

    (Object.keys(STARTING_PIECES) as PieceSymbol[]).forEach((symbol) => {
      const lostWhite = STARTING_PIECES[symbol] - currentCounts.w[symbol];
      if (lostWhite > 0) {
        capturedW.push({ symbol, color: 'w', count: lostWhite });
      }

      const lostBlack = STARTING_PIECES[symbol] - currentCounts.b[symbol];
      if (lostBlack > 0) {
        capturedB.push({ symbol, color: 'b', count: lostBlack });
      }

      whiteScore += currentCounts.w[symbol] * PIECE_VALUES[symbol];
      blackScore += currentCounts.b[symbol] * PIECE_VALUES[symbol];
    });

    return {
      capturedWhite: capturedW,
      capturedBlack: capturedB,
      materialScore: whiteScore - blackScore,
    };
  }, [board]);

  // Helper to trigger an animation
  const triggerAnimation = useCallback((event: AbilityAnimationEvent) => {
    setAbilityState((prev) => ({
      ...prev,
      activeAnimation: event,
    }));
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setAbilityState((prev) => ({
      ...prev,
      activeAnimation: null,
    }));
  }, []);

  // Helper to add battle events
  const addBattleEvent = useCallback((event: BattleEvent) => {
    setBattleEvents((prev) => [...prev.slice(-7), event]);
  }, []);

  const dismissBattleEvent = useCallback((id: string) => {
    setBattleEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Save state snapshot for local multiplayer Undo
  const saveSnapshot = useCallback(() => {
    setUndoStack((prev) => [
      ...prev,
      {
        fen: chess.fen(),
        energyState: JSON.parse(JSON.stringify(energyState)),
        abilityState: JSON.parse(JSON.stringify(abilityState)),
        moveHistory: [...moveHistory],
        timers: { ...timers },
        resignedColor,
        lastMove,
        matchStats: { ...matchStats },
      },
    ]);
  }, [chess, energyState, abilityState, moveHistory, timers, resignedColor, lastMove, matchStats]);

  // Match Timer Countdown Interval
  useEffect(() => {
    if (matchSettings.timerMinutes === 0) return;
    if (status.isCheckmate || status.isDraw || resignedColor || timeOutWinner) return;

    const interval = setInterval(() => {
      const activeColor = chess.turn();

      setTimers((prev) => {
        const remaining = prev[activeColor];
        if (remaining <= 1) {
          clearInterval(interval);
          const flagWinner: Color = activeColor === 'w' ? 'b' : 'w';
          setTimeOutWinner(flagWinner);
          sounds.playVictory();
          addBattleEvent({
            id: `timer-expiry-${Date.now()}`,
            title: "Time Expired!",
            description: `${activeColor === 'w' ? 'White' : 'Black'} ran out of time. ${flagWinner === 'w' ? 'White' : 'Black'} wins!`,
            type: 'timer',
            timestamp: Date.now(),
          });
          return { ...prev, [activeColor]: 0 };
        }

        if (remaining === 30 && soundEnabled) {
          sounds.playTimeWarning();
        }

        return { ...prev, [activeColor]: remaining - 1 };
      });

      setMatchStats((prev) => ({
        ...prev,
        durationSeconds: Math.floor((Date.now() - prev.startTime) / 1000),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [
    matchSettings.timerMinutes,
    status.isCheckmate,
    status.isDraw,
    resignedColor,
    timeOutWinner,
    chess,
    soundEnabled,
    addBattleEvent,
  ]);

  // Compute valid targeting squares based on targeting mode
  const { targetingSquares, targetingInstruction } = useMemo<{
    targetingSquares: Square[];
    targetingInstruction?: string;
  }>(() => {
    if (!abilityState.targetingMode) {
      return { targetingSquares: [], targetingInstruction: undefined };
    }

    const { abilityId, sourceSquare, step, firstTargetSquare } = abilityState.targetingMode;
    const currentTurn = chess.turn();

    if (abilityId === 'swarm_protection') {
      // Find all friendly Wimpods (Pawns)
      const squares: Square[] = [];
      const allFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const allRanks = ['1', '2', '3', '4', '5', '6', '7', '8'];
      allFiles.forEach((f) => {
        allRanks.forEach((r) => {
          const sq = `${f}${r}` as Square;
          const p = chess.get(sq);
          if (p && p.color === currentTurn && p.type === 'p') {
            squares.push(sq);
          }
        });
      });
      return {
        targetingSquares: squares,
        targetingInstruction: 'Select a friendly Wimpod to protect with Swarm Shield',
      };
    }

    if (abilityId === 'psychic_shield') {
      // Find all friendly pieces
      const squares: Square[] = [];
      const allFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const allRanks = ['1', '2', '3', '4', '5', '6', '7', '8'];
      allFiles.forEach((f) => {
        allRanks.forEach((r) => {
          const sq = `${f}${r}` as Square;
          const p = chess.get(sq);
          if (p && p.color === currentTurn) {
            squares.push(sq);
          }
        });
      });
      return {
        targetingSquares: squares,
        targetingInstruction: 'Select any friendly Pokémon to receive Psychic Shield',
      };
    }

    if (abilityId === 'iron_wall') {
      // Adjacent friendly pieces
      const adjacent = getAdjacentSquares(sourceSquare);
      const friendlyAdjacent = adjacent.filter((sq) => {
        const p = chess.get(sq);
        return p && p.color === currentTurn;
      });
      return {
        targetingSquares: friendlyAdjacent,
        targetingInstruction: 'Select an adjacent friendly Pokémon for Iron Wall',
      };
    }

    if (abilityId === 'psychic_control') {
      if (step === 'select_destination' && firstTargetSquare) {
        const dests = getMewtwoControlDestinations(chess, firstTargetSquare, currentTurn);
        return {
          targetingSquares: dests,
          targetingInstruction: 'Select an empty square to move the controlled Pokémon',
        };
      }
      // Step 1: select adjacent enemy piece (non-King)
      const adjacent = getAdjacentSquares(sourceSquare);
      const enemyAdjacent = adjacent.filter((sq) => {
        const p = chess.get(sq);
        return p && p.color !== currentTurn && p.type !== 'k';
      });
      return {
        targetingSquares: enemyAdjacent,
        targetingInstruction: 'Select an adjacent enemy Pokémon to control (King is immune)',
      };
    }

    if (abilityId === 'divine_protection') {
      const safeDests = getSafeArceusEscapeSquares(chess, sourceSquare, currentTurn);
      return {
        targetingSquares: safeDests,
        targetingInstruction: 'Select an adjacent safe square for Arceus to escape',
      };
    }

    if (abilityId === 'flame_dash') {
      const knightMoves = chess.moves({ square: sourceSquare, verbose: true });
      return {
        targetingSquares: knightMoves.map((m) => m.to as Square),
        targetingInstruction: 'Flame Dash Activated! Move Rapidash to any target square, then choose the extra dash square',
      };
    }

    return { targetingSquares: [], targetingInstruction: undefined };
  }, [abilityState.targetingMode, chess]);

  // Compute flame dash destination squares if active
  const flameDashSquares = useMemo(() => {
    if (!abilityState.pendingFlameDash) return [];
    return getRapidashFlameDashDestinations(chess, abilityState.pendingFlameDash.knightSquare);
  }, [abilityState.pendingFlameDash, chess]);

  // Turn Finalization Helper
  const finalizeTurn = useCallback(
    (completedTurnColor: Color, nextFen: string, moveRecord?: MoveRecord) => {
      setFen(nextFen);
      setSelectedSquare(null);
      setLegalMoves([]);
      setPendingPromotion(null);

      // Handle Energy regeneration
      const { nextEnergyState, regenerated } = handleTurnCompletedEnergy(energyState, completedTurnColor);
      setEnergyState(nextEnergyState);
      if (regenerated) {
        setNotification({
          text: `+1 Energy regenerated for ${completedTurnColor === 'w' ? 'Celestial Vanguard' : 'Abyssal Legion'}!`,
          type: 'info',
        });
      }

      // Handle Ability & Protection turn expiration
      setAbilityState((prev) => handleTurnCompletedProtections(prev, completedTurnColor));

      if (moveRecord) {
        setMoveHistory((prev) => [...prev, moveRecord]);
      }
    },
    [energyState]
  );

  // Execute a standard or capture move on the board
  const executeMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol) => {
      try {
        const pieceOnSource = chess.get(from);
        const targetPiece = chess.get(to);
        const currentTurn = chess.turn();

        // 1. Passive Check: Aggron's Sturdy Carapace
        // "Enemy pawns cannot directly capture Aggron"
        if (targetPiece && pieceOnSource) {
          if (isAggronImmuneToPawnCapture(pieceOnSource.type, targetPiece.type)) {
            sounds.playShieldDeflect();
            setNotification({
              text: "Blocked! Enemy pawns cannot directly capture Aggron's titanium armor.",
              type: 'warning',
            });
            return false;
          }
        }

        // 2. Active Protection Check: Wimpod's Swarm Protection
        // "Protects it from one capture attempt. Expires after opponent's next turn."
        const hasSwarm = hasActiveProtection(abilityState.activeProtections, to, 'swarm');
        if (hasSwarm && targetPiece) {
          // Consume the swarm protection and deflect the capture!
          sounds.playShieldDeflect();
          setAbilityState((prev) => {
            const { nextState } = consumeProtection(prev, to, 'swarm');
            return nextState;
          });

          setNotification({
            text: 'Swarm Protection absorbed the capture attempt! Wimpod survives.',
            type: 'success',
          });

          // Attacker's turn ends; move is deflected
          const nextFen = chess.fen();
          finalizeTurn(currentTurn, nextFen);
          return true;
        }

        // Save state snapshot for Undo feature before making a move
        saveSnapshot();

        // Standard Chess move execution
        const moveResult = chess.move({
          from,
          to,
          promotion: promotion || undefined,
        });

        if (moveResult) {
          const nextFen = chess.fen();
          setLastMove({ from, to });

          // Update match stats total moves
          setMatchStats((prev) => ({ ...prev, totalMoves: prev.totalMoves + 1 }));

          // Audio triggers
          const isCapture = Boolean(targetPiece || moveResult.flags.includes('e'));
          if (chess.isCheckmate()) {
            sounds.playVictory();
            addBattleEvent({
              id: `checkmate-${Date.now()}`,
              title: 'Checkmate!',
              description: `${currentTurn === 'w' ? 'White' : 'Black'} has checkmated the enemy King!`,
              type: 'game_over',
              color: currentTurn,
              timestamp: Date.now(),
            });
          } else if (chess.inCheck()) {
            sounds.playCheck();
            addBattleEvent({
              id: `check-${Date.now()}`,
              title: 'King in Check!',
              description: `${chess.turn() === 'w' ? 'White Arceus' : 'Black Mewtwo'} is under direct attack!`,
              type: 'check',
              color: chess.turn(),
              timestamp: Date.now(),
            });
          } else if (promotion) {
            const evolvedInfo = POKEMON_PIECES[promotion];
            setMatchStats((prev) => ({ ...prev, evolutionsCount: prev.evolutionsCount + 1 }));
            addBattleEvent({
              id: `evolution-${Date.now()}`,
              title: 'Pokémon Evolved!',
              description: `Wimpod evolved into ${evolvedInfo.name} (${evolvedInfo.chessPiece})!`,
              type: 'evolution',
              color: currentTurn,
              timestamp: Date.now(),
            });
            setNotification({
              text: `Evolution Complete! Wimpod has ascended into ${evolvedInfo.name} (${evolvedInfo.chessPiece})!`,
              type: 'success',
            });
          } else if (isCapture) {
            sounds.playCapture();
            const capType = targetPiece?.type || 'p';
            setMatchStats((prev) => ({ ...prev, capturesCount: prev.capturesCount + 1 }));
            addBattleEvent({
              id: `capture-${Date.now()}`,
              title: 'Pokémon Captured!',
              description: `${currentTurn === 'w' ? 'White' : 'Black'} captured ${POKEMON_PIECES[capType]?.name || 'Pokémon'}!`,
              type: 'capture',
              color: currentTurn,
              timestamp: Date.now(),
            });
          } else {
            sounds.playMove();
          }

          // Record in history
          const newRecord: MoveRecord = {
            san: moveResult.san,
            from,
            to,
            color: moveResult.color,
            piece: moveResult.piece,
            captured: targetPiece?.type || (moveResult.flags.includes('e') ? 'p' : undefined),
            promotion: promotion,
            fen: nextFen,
            moveNumber: Math.floor(moveHistory.length / 2) + 1,
          };

          // Check for Rapidash's Flame Dash eligibility
          // CRITICAL: The power of Knight is ONLY activated if the player explicitly pressed ACTIVATE!
          // A regular Knight move without pressing Activate must NEVER trigger Flame Dash!
          const isArmedForFlameDash =
            Boolean(abilityState.armedFlameDash) &&
            abilityState.armedFlameDash?.knightSquare === from &&
            abilityState.armedFlameDash?.color === currentTurn;

          const hasFlameDashEnergy = canAffordAbility(energyState, currentTurn, 2);
          const emptyOrthogonals = getRapidashFlameDashDestinations(chess, to);

          if (
            isArmedForFlameDash &&
            pieceOnSource &&
            pieceOnSource.type === 'n' &&
            hasFlameDashEnergy &&
            !abilityState.abilityUsedThisTurn &&
            emptyOrthogonals.length > 0
          ) {
            // Keep turn open for Flame Dash optional step
            setFen(nextFen);
            setSelectedSquare(null);
            setLegalMoves([]);
            setPendingPromotion(null);
            setAbilityState((prev) => ({
              ...prev,
              targetingMode: null,
              armedFlameDash: null,
              pendingFlameDash: { knightSquare: to, color: currentTurn },
            }));
            setNotification({
              text: 'Flame Dash Active! Select an empty adjacent square to dash (2 Energy) or click Skip Dash.',
              type: 'info',
            });
            return true;
          }

          // Complete regular turn
          setAbilityState((prev) => ({
            ...prev,
            armedFlameDash: null,
            targetingMode: null,
          }));
          finalizeTurn(currentTurn, nextFen, newRecord);

          if (pieceOnSource) {
            setInspectedPiece({ symbol: pieceOnSource.type, color: pieceOnSource.color });
          }

          return true;
        }
      } catch (err) {
        console.error('Invalid move attempted:', err);
      }
      return false;
    },
    [
      chess,
      abilityState.activeProtections,
      abilityState.abilityUsedThisTurn,
      energyState,
      finalizeTurn,
      moveHistory.length,
    ]
  );

  // Execute Rapidash's Flame Dash
  const handleExecuteFlameDash = useCallback(
    (targetDest: Square) => {
      if (!abilityState.pendingFlameDash) return;
      const { knightSquare, color } = abilityState.pendingFlameDash;

      if (!canAffordAbility(energyState, color, 2)) {
        setNotification({ text: 'Insufficient energy for Flame Dash.', type: 'warning' });
        return;
      }

      // Check destination is empty orthogonal
      const validDests = getRapidashFlameDashDestinations(chess, knightSquare);
      if (!validDests.includes(targetDest)) return;

      saveSnapshot();
      setMatchStats((prev) => ({ ...prev, abilitiesUsed: prev.abilitiesUsed + 1 }));
      addBattleEvent({
        id: `flame-dash-${Date.now()}`,
        title: 'Flame Dash Executed!',
        description: `Rapidash surged forward to ${targetDest.toUpperCase()}!`,
        type: 'ability',
        color,
        timestamp: Date.now(),
      });

      // Move knight from knightSquare to targetDest via chess engine board manipulation
      const knightPiece = chess.remove(knightSquare);
      if (knightPiece) {
        chess.put(knightPiece, targetDest);
        const nextFen = chess.fen();

        // Deduct 2 energy
        setEnergyState((prev) => deductEnergy(prev, color, 2));

        // Audio & Visual VFX
        sounds.playAbilityFlameDash();
        triggerAnimation({
          id: `flame-dash-${Date.now()}`,
          type: 'flame_dash',
          fromSquare: knightSquare,
          toSquare: targetDest,
          color,
          timestamp: Date.now(),
        });

        const newRecord: MoveRecord = {
          san: `Flame Dash → ${targetDest.toUpperCase()}`,
          from: knightSquare,
          to: targetDest,
          color,
          piece: 'n',
          fen: nextFen,
          moveNumber: Math.floor(moveHistory.length / 2) + 1,
          abilityUsed: 'Flame Dash',
        };

        setLastMove({ from: knightSquare, to: targetDest });
        setAbilityState((prev) => ({
          ...prev,
          abilityUsedThisTurn: true,
          pendingFlameDash: null,
        }));

        finalizeTurn(color, nextFen, newRecord);
        setNotification({
          text: `Rapidash blazed across the battlefield to ${targetDest.toUpperCase()}!`,
          type: 'success',
        });
      }
    },
    [abilityState.pendingFlameDash, chess, energyState, finalizeTurn, moveHistory.length, triggerAnimation]
  );

  const handleCancelFlameDash = useCallback(() => {
    if (!abilityState.pendingFlameDash) return;
    const { color } = abilityState.pendingFlameDash;
    setAbilityState((prev) => ({ ...prev, pendingFlameDash: null }));
    finalizeTurn(color, chess.fen());
  }, [abilityState.pendingFlameDash, chess, finalizeTurn]);

  // Phase 5 AI Opponent Turn Automation
  useEffect(() => {
    if (matchSettings.mode !== 'ai') return;
    if (status.isCheckmate || status.isDraw || resignedColor || timeOutWinner) return;
    if (pendingPromotion) return; // Do not interrupt pending promotion modal
    if (abilityState.pendingFlameDash) return; // Wait if flame dash step is ongoing

    const humanSide: Color = matchSettings.humanColor || 'w';
    const aiColor: Color = humanSide === 'w' ? 'b' : 'w';

    if (chess.turn() !== aiColor) return;
    if (isAiThinking) return;

    setIsAiThinking(true);
    const aiPlayerProfile =
      aiColor === 'w'
        ? matchSettings.player1.color === 'w'
          ? matchSettings.player1
          : matchSettings.player2
        : matchSettings.player1.color === 'b'
        ? matchSettings.player1
        : matchSettings.player2;

    const thinkMessages = [
      `${aiPlayerProfile.name} is calculating optimal moves...`,
      `${aiPlayerProfile.name} is evaluating Pokémon abilities...`,
      `${aiPlayerProfile.name} is reading board patterns...`,
    ];
    setAiThinkingMessage(thinkMessages[Math.floor(Math.random() * thinkMessages.length)]);

    const thinkDelay =
      matchSettings.aiDifficulty === 'beginner'
        ? 600
        : matchSettings.aiDifficulty === 'intermediate'
        ? 800
        : 1100;

    const timer = setTimeout(async () => {
      try {
        const action = await computeAiAction(
          chess,
          aiColor,
          energyState[aiColor],
          abilityState,
          energyState[humanSide],
          matchSettings.aiDifficulty || 'intermediate'
        );

        // 1. Standalone / Pre-move ability execution
        if (action.ability && action.type === 'ABILITY_THEN_MOVE') {
          const abId = action.ability.id;
          const cost = action.ability.cost;
          if (canAffordAbility(energyState, aiColor, cost) && action.ability.targetSquare) {
            setEnergyState((prev) => deductEnergy(prev, aiColor, cost));
            setMatchStats((prev) => ({ ...prev, abilitiesUsed: prev.abilitiesUsed + 1 }));

            if (abId === 'swarm') {
              sounds.playAbilitySwarm();
              setAbilityState((prev) =>
                addProtection(prev, 'swarm', action.ability!.targetSquare!, aiColor, 'p')
              );
              addBattleEvent({
                id: `ai-swarm-${Date.now()}`,
                title: 'AI Swarm Protection!',
                description: `${aiPlayerProfile.name} shielded Wimpod on ${action.ability!.targetSquare!.toUpperCase()}!`,
                type: 'ability',
                color: aiColor,
                timestamp: Date.now(),
              });
            } else if (abId === 'psychic_shield') {
              sounds.playAbilityPsychicShield();
              setAbilityState((prev) =>
                addProtection(prev, 'psychic_shield', action.ability!.targetSquare!, aiColor, 'b')
              );
              addBattleEvent({
                id: `ai-shield-${Date.now()}`,
                title: 'AI Psychic Shield!',
                description: `${aiPlayerProfile.name} cast Psychic Shield on ${action.ability!.targetSquare!.toUpperCase()}!`,
                type: 'ability',
                color: aiColor,
                timestamp: Date.now(),
              });
            } else if (abId === 'iron_wall') {
              sounds.playAbilityIronWall();
              setAbilityState((prev) =>
                addProtection(prev, 'iron_wall', action.ability!.targetSquare!, aiColor, 'r')
              );
              addBattleEvent({
                id: `ai-wall-${Date.now()}`,
                title: 'AI Iron Wall!',
                description: `${aiPlayerProfile.name} activated Iron Wall on ${action.ability!.targetSquare!.toUpperCase()}!`,
                type: 'ability',
                color: aiColor,
                timestamp: Date.now(),
              });
            }
          }
        }

        // 2. Emergency Divine Protection
        if (action.type === 'DIVINE_PROTECTION_ESCAPE' && action.ability?.targetSquare) {
          const kingSq = action.move.from;
          const safeSq = action.ability.targetSquare;
          const arceusPiece = chess.remove(kingSq);
          if (arceusPiece) {
            chess.put(arceusPiece, safeSq);
            const nextFen = chess.fen();
            setEnergyState((prev) => deductEnergy(prev, aiColor, 4));
            sounds.playAbilityDivine();
            setAbilityState((prev) => ({
              ...prev,
              usedDivineProtection: { ...prev.usedDivineProtection, [aiColor]: true },
            }));
            addBattleEvent({
              id: `ai-divine-${Date.now()}`,
              title: 'AI Divine Protection!',
              description: `${aiPlayerProfile.name}'s Arceus warped safely to ${safeSq.toUpperCase()}!`,
              type: 'ability',
              color: aiColor,
              timestamp: Date.now(),
            });
            finalizeTurn(aiColor, nextFen);
            setIsAiThinking(false);
            return;
          }
        }

        // 3. Move Execution (automatically promotes to Queen Mewtwo if pawn reaches final rank)
        const moveRes = executeMove(
          action.move.from,
          action.move.to,
          action.move.promotion || 'q'
        );

        // 4. Flame Dash bonus step
        if (action.type === 'FLAME_DASH_MOVE' && action.flameDashBonusStep && moveRes) {
          setTimeout(() => {
            handleExecuteFlameDash(action.flameDashBonusStep!);
          }, 350);
        }
      } catch (err) {
        console.error('AI calculation or move execution error:', err);
        const moves = chess.moves({ verbose: true });
        if (moves.length > 0) {
          executeMove(moves[0].from, moves[0].to, moves[0].promotion || 'q');
        }
      } finally {
        setIsAiThinking(false);
      }
    }, thinkDelay);

    return () => clearTimeout(timer);
  }, [
    matchSettings.mode,
    matchSettings.humanColor,
    matchSettings.aiDifficulty,
    matchSettings.player1,
    matchSettings.player2,
    status.turn,
    status.isCheckmate,
    status.isDraw,
    resignedColor,
    timeOutWinner,
    pendingPromotion,
    abilityState.pendingFlameDash,
    chess,
    energyState,
    abilityState,
    executeMove,
    finalizeTurn,
    handleExecuteFlameDash,
    isAiThinking,
    addBattleEvent,
  ]);

  // Start Ability Targeting Mode
  const handleStartTargeting = useCallback(
    (abilityId: string, square: Square, pieceSymbol: PieceSymbol) => {
      if (isAiThinking) return;
      if (matchSettings.mode === 'ai' && chess.turn() !== matchSettings.humanColor) return;

      const currentTurn = chess.turn();
      const ability = POKEMON_PIECES[pieceSymbol].activeAbility;

      if (!canAffordAbility(energyState, currentTurn, ability.cost)) {
        setNotification({
          text: `Need ${ability.cost} Energy to activate ${ability.name}.`,
          type: 'warning',
        });
        return;
      }

      if (abilityState.abilityUsedThisTurn) {
        setNotification({
          text: 'Only one ability can be activated per turn.',
          type: 'warning',
        });
        return;
      }

      if (abilityId === 'flame_dash') {
        const moves = chess.moves({ square, verbose: true });
        if (moves.length === 0) {
          setNotification({
            text: 'Rapidash has no legal moves to dash from.',
            type: 'warning',
          });
          return;
        }

        setAbilityState((prev) => ({
          ...prev,
          armedFlameDash: { knightSquare: square, color: currentTurn },
          targetingMode: {
            abilityId,
            sourceSquare: square,
            sourcePiece: pieceSymbol,
            step: 'select_target',
          },
        }));
        setSelectedSquare(square);
        setLegalMoves(moves);
        sounds.playClick();
        setNotification({
          text: 'Flame Dash Activated! Move Rapidash to any legal square to unleash the extra orthogonal dash.',
          type: 'info',
        });
        return;
      }

      setAbilityState((prev) => ({
        ...prev,
        targetingMode: {
          abilityId,
          sourceSquare: square,
          sourcePiece: pieceSymbol,
          step: 'select_target',
        },
      }));
      sounds.playClick();
    },
    [chess, energyState, abilityState.abilityUsedThisTurn]
  );

  const handleCancelTargeting = useCallback(() => {
    setAbilityState((prev) => ({
      ...prev,
      targetingMode: null,
      armedFlameDash: null,
    }));
    sounds.playClick();
  }, []);

  // Handle clicking a square during ability targeting
  const handleTargetingClick = useCallback(
    (square: Square) => {
      if (!abilityState.targetingMode) return;
      const { abilityId, sourceSquare, sourcePiece, step, firstTargetSquare } = abilityState.targetingMode;
      const currentTurn = chess.turn();

      // 0. RAPIDASH: FLAME DASH
      if (abilityId === 'flame_dash') {
        const moves = chess.moves({ square: sourceSquare, verbose: true });
        const isLegal = moves.some((m) => m.to === square);
        if (isLegal) {
          executeMove(sourceSquare, square);
        } else {
          setNotification({ text: 'Select a legal destination square for Rapidash.', type: 'warning' });
        }
        return;
      }

      // 1. WIMPOD: SWARM PROTECTION
      if (abilityId === 'swarm_protection') {
        const val = validateWimpodSwarm(chess, square, currentTurn);
        if (!val.valid) {
          setNotification({ text: val.reason || 'Invalid target.', type: 'warning' });
          return;
        }

        // Deduct 1 energy
        setEnergyState((prev) => deductEnergy(prev, currentTurn, 1));
        setAbilityState((prev) =>
          addProtection(
            { ...prev, targetingMode: null },
            'swarm',
            square,
            currentTurn,
            sourcePiece
          )
        );

        sounds.playAbilitySwarm();
        triggerAnimation({
          id: `swarm-${Date.now()}`,
          type: 'swarm',
          targetSquare: square,
          color: currentTurn,
          timestamp: Date.now(),
        });

        setNotification({
          text: `Swarm Protection active on Wimpod (${square.toUpperCase()})! Protects from next capture.`,
          type: 'success',
        });
        return;
      }

      // 2. ALAKAZAM: PSYCHIC SHIELD
      if (abilityId === 'psychic_shield') {
        const val = validateAlakazamShield(chess, square, currentTurn);
        if (!val.valid) {
          setNotification({ text: val.reason || 'Invalid target.', type: 'warning' });
          return;
        }

        setEnergyState((prev) => deductEnergy(prev, currentTurn, 2));
        setAbilityState((prev) =>
          addProtection(
            { ...prev, targetingMode: null },
            'psychic_shield',
            square,
            currentTurn,
            sourcePiece
          )
        );

        sounds.playAbilityPsychicShield();
        triggerAnimation({
          id: `psychic-shield-${Date.now()}`,
          type: 'psychic_shield',
          targetSquare: square,
          color: currentTurn,
          timestamp: Date.now(),
        });

        setNotification({
          text: `Psychic Shield deployed on ${square.toUpperCase()}! Nullifies next enemy special ability.`,
          type: 'success',
        });
        return;
      }

      // 3. AGGRON: IRON WALL
      if (abilityId === 'iron_wall') {
        const val = validateAggronWall(chess, sourceSquare, square, currentTurn);
        if (!val.valid) {
          setNotification({ text: val.reason || 'Invalid target.', type: 'warning' });
          return;
        }

        setEnergyState((prev) => deductEnergy(prev, currentTurn, 2));
        setAbilityState((prev) =>
          addProtection(
            { ...prev, targetingMode: null },
            'iron_wall',
            square,
            currentTurn,
            sourcePiece
          )
        );

        sounds.playAbilityIronWall();
        triggerAnimation({
          id: `iron-wall-${Date.now()}`,
          type: 'iron_wall',
          targetSquare: square,
          color: currentTurn,
          timestamp: Date.now(),
        });

        setNotification({
          text: `Iron Wall erected around ${square.toUpperCase()}! Protects against enemy abilities.`,
          type: 'success',
        });
        return;
      }

      // 4. MEWTWO: PSYCHIC CONTROL
      if (abilityId === 'psychic_control') {
        if (step === 'select_target') {
          // Step 1: Selecting enemy adjacent piece
          const val = validateMewtwoControlTarget(chess, sourceSquare, square, currentTurn);
          if (!val.valid) {
            setNotification({ text: val.reason || 'Invalid target.', type: 'warning' });
            return;
          }

          // Check if target has Psychic Shield or Iron Wall
          const hasPsychicShield = hasActiveProtection(abilityState.activeProtections, square, 'psychic_shield');
          const hasIronWall = hasActiveProtection(abilityState.activeProtections, square, 'iron_wall');

          if (hasPsychicShield || hasIronWall) {
            // Shield absorbs the psychic control!
            sounds.playShieldDeflect();
            setEnergyState((prev) => deductEnergy(prev, currentTurn, 3));
            setAbilityState((prev) => {
              let updated = prev;
              if (hasPsychicShield) {
                updated = consumeProtection(updated, square, 'psychic_shield').nextState;
              }
              if (hasIronWall) {
                updated = consumeProtection(updated, square, 'iron_wall').nextState;
              }
              return {
                ...updated,
                targetingMode: null,
                abilityUsedThisTurn: true,
              };
            });

            setNotification({
              text: `Psychic Control was absorbed and dissipated by the target's Shield!`,
              type: 'info',
            });
            return;
          }

          // Move to step 2: choose destination
          setAbilityState((prev) => ({
            ...prev,
            targetingMode: {
              ...prev.targetingMode!,
              step: 'select_destination',
              firstTargetSquare: square,
            },
          }));
          sounds.playClick();
          return;
        }

        if (step === 'select_destination' && firstTargetSquare) {
          const validDests = getMewtwoControlDestinations(chess, firstTargetSquare, currentTurn);
          if (!validDests.includes(square)) {
            setNotification({ text: 'Destination must be an empty safe square.', type: 'warning' });
            return;
          }

          // Perform movement
          const movedPiece = chess.remove(firstTargetSquare);
          if (movedPiece) {
            chess.put(movedPiece, square);
            const nextFen = chess.fen();

            setEnergyState((prev) => deductEnergy(prev, currentTurn, 3));
            sounds.playAbilityPsychicControl();

            triggerAnimation({
              id: `psychic-control-${Date.now()}`,
              type: 'psychic_control',
              fromSquare: firstTargetSquare,
              toSquare: square,
              color: currentTurn,
              timestamp: Date.now(),
            });

            setLastMove({ from: firstTargetSquare, to: square });
            setAbilityState((prev) => ({
              ...prev,
              targetingMode: null,
              abilityUsedThisTurn: true,
            }));

            const record: MoveRecord = {
              san: `Psychic Control: ${firstTargetSquare.toUpperCase()} → ${square.toUpperCase()}`,
              from: firstTargetSquare,
              to: square,
              color: currentTurn,
              piece: 'q',
              fen: nextFen,
              moveNumber: Math.floor(moveHistory.length / 2) + 1,
              abilityUsed: 'Psychic Control',
            };

            finalizeTurn(currentTurn, nextFen, record);
            setNotification({
              text: `Mewtwo telekinetically moved enemy Pokémon from ${firstTargetSquare.toUpperCase()} to ${square.toUpperCase()}!`,
              type: 'success',
            });
          }
          return;
        }
      }

      // 5. ARCEUS: DIVINE PROTECTION
      if (abilityId === 'divine_protection') {
        const safeDests = getSafeArceusEscapeSquares(chess, sourceSquare, currentTurn);
        if (!safeDests.includes(square)) {
          setNotification({ text: 'Must choose a safe, empty square not under attack.', type: 'warning' });
          return;
        }

        const arceusPiece = chess.remove(sourceSquare);
        if (arceusPiece) {
          chess.put(arceusPiece, square);
          const nextFen = chess.fen();

          setEnergyState((prev) => deductEnergy(prev, currentTurn, 4));
          sounds.playAbilityDivine();

          triggerAnimation({
            id: `divine-${Date.now()}`,
            type: 'divine_protection',
            fromSquare: sourceSquare,
            toSquare: square,
            color: currentTurn,
            timestamp: Date.now(),
          });

          setLastMove({ from: sourceSquare, to: square });
          setAbilityState((prev) => ({
            ...prev,
            targetingMode: null,
            abilityUsedThisTurn: true,
            usedDivineProtection: {
              ...prev.usedDivineProtection,
              [currentTurn]: true,
            },
          }));

          const record: MoveRecord = {
            san: `Divine Protection → ${square.toUpperCase()}`,
            from: sourceSquare,
            to: square,
            color: currentTurn,
            piece: 'k',
            fen: nextFen,
            moveNumber: Math.floor(moveHistory.length / 2) + 1,
            abilityUsed: 'Divine Protection',
          };

          finalizeTurn(currentTurn, nextFen, record);
          setNotification({
            text: `Arceus invoked Divine Protection and safely warped to ${square.toUpperCase()}!`,
            type: 'success',
          });
        }
      }
    },
    [
      abilityState.targetingMode,
      abilityState.activeProtections,
      chess,
      finalizeTurn,
      moveHistory.length,
      triggerAnimation,
    ]
  );

  // General square click handler
  const handleSquareClick = useCallback(
    (square: Square) => {
      if (status.isCheckmate || status.isDraw || resignedColor || isAiThinking) {
        return;
      }

      if (matchSettings.mode === 'ai' && chess.turn() !== matchSettings.humanColor) {
        return;
      }

      // If in Flame Dash mode
      if (abilityState.pendingFlameDash) {
        if (flameDashSquares.includes(square)) {
          handleExecuteFlameDash(square);
          return;
        }
      }

      // If in Ability Targeting mode
      if (abilityState.targetingMode) {
        if (targetingSquares.includes(square)) {
          handleTargetingClick(square);
          return;
        }
      }

      const pieceOnSquare = chess.get(square);

      // If user has a selected square and clicks on a legal move destination
      if (selectedSquare) {
        const isLegal = legalMoves.some((m) => m.to === square);

        if (isLegal) {
          const movingPiece = chess.get(selectedSquare);
          // Check if it's a pawn promotion move
          const isPawnPromotion =
            movingPiece &&
            movingPiece.type === 'p' &&
            ((movingPiece.color === 'w' && square[1] === '8') ||
              (movingPiece.color === 'b' && square[1] === '1'));

          if (isPawnPromotion) {
            setPendingPromotion({ from: selectedSquare, to: square });
            return;
          }

          // Execute standard move
          executeMove(selectedSquare, square);
          return;
        }
      }

      // If clicking on their own piece
      if (pieceOnSquare && pieceOnSquare.color === chess.turn()) {
        if (abilityState.targetingMode) {
          setAbilityState((prev) => ({ ...prev, targetingMode: null, armedFlameDash: null }));
        }
        setSelectedSquare(square);
        const rawMoves = chess.moves({ square, verbose: true });

        // Filter out moves that violate Aggron's Passive:
        // "Enemy pawns cannot directly capture Aggron"
        const filteredMoves = rawMoves.filter((m) => {
          if (m.captured === 'r' && pieceOnSquare.type === 'p') {
            return false;
          }
          return true;
        });

        setLegalMoves(filteredMoves);
        setInspectedPiece({ symbol: pieceOnSquare.type, color: pieceOnSquare.color });
        sounds.playClick();
      } else {
        // Deselect or inspect clicked piece
        if (abilityState.targetingMode) {
          setAbilityState((prev) => ({ ...prev, targetingMode: null, armedFlameDash: null }));
        }
        setSelectedSquare(null);
        setLegalMoves([]);
        if (pieceOnSquare) {
          setInspectedPiece({ symbol: pieceOnSquare.type, color: pieceOnSquare.color });
        }
      }
    },
    [
      abilityState.pendingFlameDash,
      abilityState.targetingMode,
      chess,
      executeMove,
      flameDashSquares,
      handleExecuteFlameDash,
      handleTargetingClick,
      legalMoves,
      resignedColor,
      selectedSquare,
      status,
      targetingSquares,
    ]
  );

  // Confirm pawn promotion
  const handlePromotionSelect = useCallback(
    (promotionSymbol: PieceSymbol) => {
      if (!pendingPromotion) return;
      executeMove(pendingPromotion.from, pendingPromotion.to, promotionSymbol);
    },
    [executeMove, pendingPromotion]
  );

  // Cancel promotion modal
  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  // Phase 4 Local Multiplayer Undo Feature
  const canUndo = undoStack.length > 0 && !status.isCheckmate && !status.isDraw;

  const undo = useCallback(() => {
    if (undoStack.length === 0 || status.isCheckmate || status.isDraw) {
      return false;
    }
    // In AI mode, if human clicks undo, pop both AI move and Human move so human can move again
    let targetSnapshot: GameSnapshot;
    if (matchSettings.mode === 'ai' && undoStack.length >= 2) {
      targetSnapshot = undoStack[undoStack.length - 2];
      setUndoStack((prev) => prev.slice(0, -2));
    } else {
      targetSnapshot = undoStack[undoStack.length - 1];
      setUndoStack((prev) => prev.slice(0, -1));
    }

    chess.load(targetSnapshot.fen);
    setFen(targetSnapshot.fen);
    setEnergyState(targetSnapshot.energyState);
    setAbilityState(targetSnapshot.abilityState);
    setMoveHistory(targetSnapshot.moveHistory);
    setTimers(targetSnapshot.timers);
    setLastMove(targetSnapshot.lastMove);
    setMatchStats(targetSnapshot.matchStats);
    setResignedColor(targetSnapshot.resignedColor);
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
    setIsAiThinking(false);

    sounds.playUndo();
    addBattleEvent({
      id: `undo-${Date.now()}`,
      title: 'Move Undone',
      description: 'Restored board position, energy reserves, and ability status.',
      type: 'undo',
      timestamp: Date.now(),
    });
    setNotification({
      text: 'Move undone. Previous board and ability state restored.',
      type: 'info',
    });
    return true;
  }, [undoStack, status.isCheckmate, status.isDraw, matchSettings.mode, chess, addBattleEvent]);

  // Reset / New Game
  const resetGame = useCallback(() => {
    chess.reset();
    setFen(chess.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setLastMove(null);
    setPendingPromotion(null);
    setResignedColor(null);
    setTimeOutWinner(null);
    setIsAiThinking(false);
    setTimers({
      w: (matchSettings.timerMinutes || 0) * 60,
      b: (matchSettings.timerMinutes || 0) * 60,
    });
    setEnergyState(createInitialEnergyState());
    setAbilityState(createInitialAbilityState());
    setUndoStack([]);
    setBattleEvents([]);
    setMatchStats({
      startTime: Date.now(),
      durationSeconds: 0,
      totalMoves: 0,
      abilitiesUsed: 0,
      evolutionsCount: 0,
      capturesCount: 0,
    });
    setNotification(null);
    sounds.playMove();
  }, [chess, matchSettings.timerMinutes]);

  // Resign
  const resign = useCallback(
    (color: Color) => {
      setResignedColor(color);
      sounds.playVictory();
      addBattleEvent({
        id: `resign-${Date.now()}`,
        title: 'Player Resigned',
        description: `${color === 'w' ? 'White' : 'Black'} surrendered the match.`,
        type: 'game_over',
        color,
        timestamp: Date.now(),
      });
    },
    [addBattleEvent]
  );

  // Toggle Animations
  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled((prev) => !prev);
    sounds.playClick();
  }, []);

  // Update Match Settings from Setup modal
  const updateMatchSettings = useCallback(
    (newSettings: MatchSettings) => {
      setMatchSettings(newSettings);
      sounds.enabled = newSettings.soundEnabled;
      setSoundEnabled(newSettings.soundEnabled);
      setAnimationsEnabled(newSettings.animationsEnabled);
      chess.reset();
      setFen(chess.fen());
      setSelectedSquare(null);
      setLegalMoves([]);
      setMoveHistory([]);
      setLastMove(null);
      setPendingPromotion(null);
      setResignedColor(null);
      setTimeOutWinner(null);
      setIsAiThinking(false);

      if (newSettings.mode === 'ai' && newSettings.humanColor === 'b') {
        setIsFlipped(true);
      } else {
        setIsFlipped(false);
      }

      setTimers({
        w: (newSettings.timerMinutes || 0) * 60,
        b: (newSettings.timerMinutes || 0) * 60,
      });
      setEnergyState(createInitialEnergyState());
      setAbilityState(createInitialAbilityState());
      setUndoStack([]);
      setBattleEvents([]);
      setMatchStats({
        startTime: Date.now(),
        durationSeconds: 0,
        totalMoves: 0,
        abilitiesUsed: 0,
        evolutionsCount: 0,
        capturesCount: 0,
      });
      setNotification({
        text: 'New match configured and initialized!',
        type: 'success',
      });
    },
    [chess]
  );

  // Flip board perspective
  const flipBoard = useCallback(() => {
    setIsFlipped((prev) => !prev);
    sounds.playClick();
  }, []);

  return {
    chess,
    board,
    fen,
    turn: chess.turn(),
    selectedSquare,
    legalMoves,
    lastMove,
    moveHistory,
    status,
    capturedWhite,
    capturedBlack,
    materialScore,
    pendingPromotion,
    isFlipped,
    soundEnabled,
    animationsEnabled,
    inspectedPiece,
    energyState,
    abilityState,
    targetingSquares,
    targetingInstruction,
    flameDashSquares,
    notification,
    matchSettings,
    matchStats,
    timers,
    timeOutWinner,
    battleEvents,
    canUndo,
    undo,
    isAiThinking,
    aiThinkingMessage,
    dismissBattleEvent,
    updateMatchSettings,
    clearNotification: () => setNotification(null),
    setInspectedPiece,
    handleSquareClick,
    handlePromotionSelect,
    cancelPromotion,
    resetGame,
    resign,
    flipBoard,
    toggleSound,
    toggleAnimations,
    handleStartTargeting,
    handleCancelTargeting,
    handleCancelFlameDash,
    handleAnimationComplete,
  };
}
