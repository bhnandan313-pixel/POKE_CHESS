/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Square, PieceSymbol, Color, Move } from 'chess.js';
import { PokemonPiece } from '../PokemonPieces/PokemonPiece';
import { POKEMON_PIECES } from '../../engine/pokemonRoster';
import { GameStatus, ActiveProtection, AbilityAnimationEvent, BoardTheme } from '../../types/game';
import { AbilityAnimation } from '../Abilities/AbilityAnimation';
import { EvolutionModal } from '../Evolution/EvolutionModal';
import { getBoardTheme } from '../../engine/boardThemes';
import { Shield, Sparkles, Flame, ShieldAlert } from 'lucide-react';

interface ChessboardProps {
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  selectedSquare: Square | null;
  legalMoves: Move[];
  lastMove: { from: Square; to: Square } | null;
  isFlipped: boolean;
  status: GameStatus;
  activeProtections: ActiveProtection[];
  targetingSquares?: Square[];
  targetingInstruction?: string;
  flameDashSquares?: Square[];
  activeAnimation: AbilityAnimationEvent | null;
  pendingPromotion: { from: Square; to: Square } | null;
  boardTheme?: BoardTheme;
  animationsEnabled?: boolean;
  onSquareClick: (square: Square) => void;
  onPromotionSelect: (symbol: PieceSymbol) => void;
  onCancelPromotion: () => void;
  onAnimationComplete: () => void;
  onCancelFlameDash?: () => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const Chessboard: React.FC<ChessboardProps> = ({
  board,
  selectedSquare,
  legalMoves,
  lastMove,
  isFlipped,
  status,
  activeProtections,
  targetingSquares = [],
  targetingInstruction,
  flameDashSquares = [],
  activeAnimation,
  pendingPromotion,
  boardTheme = 'cosmic_void',
  animationsEnabled = true,
  onSquareClick,
  onPromotionSelect,
  onCancelPromotion,
  onAnimationComplete,
  onCancelFlameDash,
}) => {
  const theme = getBoardTheme(boardTheme);
  // Compute ordered files and ranks based on flip orientation
  const displayFiles = isFlipped ? [...FILES].reverse() : FILES;
  const displayRanks = isFlipped ? [...RANKS].reverse() : RANKS;

  // Find king square if in check
  const inCheckSquare: Square | null = React.useMemo(() => {
    if (!status.isCheck) return null;
    const currentTurn = status.turn;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === currentTurn) {
          const file = FILES[c];
          const rank = RANKS[r];
          return `${file}${rank}` as Square;
        }
      }
    }
    return null;
  }, [board, status.isCheck, status.turn]);

  // Fast lookup for legal move targets
  const legalMoveTargets = React.useMemo(() => {
    const map = new Map<Square, { isCapture: boolean }>();
    legalMoves.forEach((m) => {
      map.set(m.to as Square, {
        isCapture: Boolean(m.captured) || m.flags.includes('e'),
      });
    });
    return map;
  }, [legalMoves]);

  // Protection lookup
  const protectionsMap = React.useMemo(() => {
    const map = new Map<Square, ActiveProtection>();
    activeProtections.forEach((p) => {
      map.set(p.square, p);
    });
    return map;
  }, [activeProtections]);

  // Helper to convert square string to percentage position for overlays
  const squareToPercent = React.useCallback(
    (square: string) => {
      const f = square[0];
      const r = square[1];
      const colIdx = displayFiles.indexOf(f);
      const rowIdx = displayRanks.indexOf(r);
      const width = 100 / 8;
      const height = 100 / 8;
      return {
        left: colIdx * width,
        top: rowIdx * height,
        width,
        height,
      };
    },
    [displayFiles, displayRanks]
  );

  return (
    <div
      className={`relative w-full max-w-[560px] aspect-square mx-auto p-2 sm:p-3.5 bg-gradient-to-b from-slate-900 via-indigo-950/70 to-slate-950 rounded-2xl shadow-2xl border transition-all duration-300 ${
        theme.outerBorderClass
      } ${theme.glowClass} ${
        status.turn === 'w' ? 'ring-1 ring-amber-400/30' : 'ring-1 ring-purple-400/30'
      }`}
    >
      {/* Targeting Prompt Banner if active */}
      {targetingInstruction && (
        <div className="absolute -top-11 left-0 right-0 z-40 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/50 backdrop-blur-md text-amber-200 text-xs font-semibold flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {targetingInstruction}
          </span>
        </div>
      )}

      {/* Flame Dash prompt banner */}
      {flameDashSquares.length > 0 && onCancelFlameDash && (
        <div className="absolute -top-11 left-0 right-0 z-40 px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-400/60 backdrop-blur-md text-orange-200 text-xs font-semibold flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-1.5 animate-pulse">
            <Flame className="w-4 h-4 text-orange-400" />
            Flame Dash: Select an adjacent square (Cost: 2 Energy)
          </span>
          <button
            onClick={onCancelFlameDash}
            className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700 cursor-pointer"
          >
            Skip Dash
          </button>
        </div>
      )}

      {/* Outer Cosmic Board Trim */}
      <div
        className={`relative w-full h-full rounded-xl overflow-hidden border-2 shadow-inner grid grid-cols-8 grid-rows-8 ${theme.gridBorderClass}`}
      >
        {displayRanks.map((rank, rankIdx) => {
          return displayFiles.map((file, fileIdx) => {
            const square = `${file}${rank}` as Square;

            // Map board array indices
            const boardRow = 8 - parseInt(rank, 10);
            const boardCol = FILES.indexOf(file);
            const piece = board[boardRow]?.[boardCol] ?? null;

            // Theme square colors
            const isLightSquare = (boardRow + boardCol) % 2 === 0;
            const squareBgClass = isLightSquare
              ? theme.lightSquareClass
              : theme.darkSquareClass;

            const isSelected = selectedSquare === square;
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isCheckSquare = inCheckSquare === square;
            const legalTarget = legalMoveTargets.get(square);
            const isTargetingSquare = targetingSquares.includes(square);
            const isFlameDashSquare = flameDashSquares.includes(square);
            const activeProtection = protectionsMap.get(square);

            return (
              <div
                key={square}
                onClick={() => onSquareClick(square)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors select-none ${squareBgClass}`}
              >
                {/* Last Move Highlighting */}
                {(isLastMoveFrom || isLastMoveTo) && (
                  <div className="absolute inset-0 bg-amber-400/20 border border-amber-300/40 pointer-events-none" />
                )}

                {/* Selected Square Glow */}
                {isSelected && (
                  <div className="absolute inset-0 bg-cyan-400/30 ring-2 ring-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)] z-10 pointer-events-none" />
                )}

                {/* Check warning on King */}
                {isCheckSquare && (
                  <div className="absolute inset-0 bg-red-600/40 ring-2 ring-red-500 animate-pulse z-10 pointer-events-none" />
                )}

                {/* Active Protection Visual Indicators */}
                {activeProtection && (
                  <div
                    className={`absolute inset-0.5 rounded-lg border-2 pointer-events-none z-10 ${
                      activeProtection.type === 'swarm'
                        ? 'border-cyan-400/80 bg-cyan-500/15 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                        : activeProtection.type === 'psychic_shield'
                        ? 'border-purple-400/80 bg-purple-500/15 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                        : 'border-slate-300/80 bg-slate-400/15 shadow-[0_0_10px_rgba(203,213,225,0.5)]'
                    }`}
                  >
                    <div className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-950/80 border border-slate-700">
                      <Shield
                        className={`w-2.5 h-2.5 ${
                          activeProtection.type === 'swarm'
                            ? 'text-cyan-400'
                            : activeProtection.type === 'psychic_shield'
                            ? 'text-purple-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Targeting Mode Highlights */}
                {isTargetingSquare && (
                  <div className="absolute inset-0 z-20 ring-2 ring-amber-400 bg-amber-400/25 animate-pulse rounded-lg pointer-events-none flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                  </div>
                )}

                {/* Flame Dash Candidate Highlights */}
                {isFlameDashSquare && (
                  <div className="absolute inset-0 z-20 border-2 border-orange-400 bg-orange-500/25 rounded-lg pointer-events-none flex items-center justify-center animate-pulse">
                    <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
                  </div>
                )}

                {/* Piece Rendering */}
                {piece && (
                  <PokemonPiece
                    symbol={piece.type}
                    color={piece.color}
                    isSelected={isSelected}
                    isTarget={Boolean(legalTarget?.isCapture)}
                  />
                )}

                {/* Legal Move Indicators */}
                {legalTarget && !piece && (
                  <div className="absolute z-20 flex items-center justify-center pointer-events-none">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-cyan-400/70 shadow-[0_0_8px_rgba(34,211,238,0.8)] border border-cyan-200" />
                  </div>
                )}

                {legalTarget && piece && (
                  <div className="absolute inset-0 z-20 border-3 sm:border-4 border-red-500/70 rounded-lg pointer-events-none animate-pulse bg-red-500/15" />
                )}

                {/* Rank notation (left edge) */}
                {fileIdx === 0 && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] sm:text-xs font-mono font-semibold pointer-events-none ${
                      isLightSquare ? 'text-slate-400' : 'text-indigo-300/70'
                    }`}
                  >
                    {rank}
                  </span>
                )}

                {/* File notation (bottom edge) */}
                {rankIdx === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-mono font-semibold pointer-events-none ${
                      isLightSquare ? 'text-slate-400' : 'text-indigo-300/70'
                    }`}
                  >
                    {file}
                  </span>
                )}
              </div>
            );
          });
        })}

        {/* Dynamic Ability Animation Overlay */}
        <AbilityAnimation
          animation={activeAnimation}
          onAnimationComplete={onAnimationComplete}
          squareToPercent={squareToPercent}
        />
      </div>

      {/* Pokémon Evolution Modal (Phase 3) */}
      {pendingPromotion && (
        <EvolutionModal
          fromSquare={pendingPromotion.from}
          toSquare={pendingPromotion.to}
          playerColor={status.turn}
          onConfirmEvolution={onPromotionSelect}
        />
      )}
    </div>
  );
};
