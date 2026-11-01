/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Color } from 'chess.js';
import { GameStatus, CapturedPiece, PlayerEnergyState } from '../../types/game';
import { POKEMON_PIECES } from '../../engine/pokemonRoster';
import { PokemonPiece } from '../PokemonPieces/PokemonPiece';
import { EnergyCounter } from '../Abilities/EnergyCounter';
import { Sparkles, Swords, AlertTriangle, Trophy } from 'lucide-react';

interface PlayerInfoProps {
  status: GameStatus;
  capturedWhite: CapturedPiece[];
  capturedBlack: CapturedPiece[];
  materialScore: number;
  moveCount: number;
  energyState: Record<Color, PlayerEnergyState>;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  status,
  capturedWhite,
  capturedBlack,
  materialScore,
  moveCount,
  energyState,
}) => {
  const isWhiteTurn = status.turn === 'w';

  // Helper to render captured list
  const renderCaptured = (list: CapturedPiece[], sideColor: Color) => {
    if (list.length === 0) {
      return <span className="text-[11px] text-slate-500 italic">No captures yet</span>;
    }
    return (
      <div className="flex flex-wrap items-center gap-1.5 mt-1">
        {list.map((item) => {
          const info = POKEMON_PIECES[item.symbol];
          return (
            <div
              key={item.symbol}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-700/60"
              title={`${item.count}x ${info.name} (${info.chessPiece})`}
            >
              <div className="w-5 h-5">
                <PokemonPiece symbol={item.symbol} color={sideColor} size="responsive" />
              </div>
              {item.count > 1 && (
                <span className="text-[10px] font-mono font-bold text-amber-300">
                  ×{item.count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Match Status Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-900/50 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-indigo-900/40">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Match Status
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Move #{moveCount}
          </span>
        </div>

        <div className="space-y-2">
          {/* Main Status Text */}
          <div
            className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
              status.isCheckmate
                ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300'
                : status.isCheck
                ? 'bg-rose-950/70 border border-rose-500/50 text-rose-300 animate-pulse'
                : status.isDraw
                ? 'bg-amber-950/70 border border-amber-500/50 text-amber-300'
                : isWhiteTurn
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                : 'bg-purple-500/10 border border-purple-500/30 text-purple-200'
            }`}
          >
            {status.isCheckmate ? (
              <Trophy className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : status.isCheck ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
            )}
            <span className="leading-snug">{status.statusText}</span>
          </div>

          {/* Quick material advantage indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Material Advantage</span>
            <span className="font-mono font-semibold">
              {materialScore > 0 ? (
                <span className="text-amber-300">White +{materialScore}</span>
              ) : materialScore < 0 ? (
                <span className="text-purple-300">Black +{Math.abs(materialScore)}</span>
              ) : (
                <span className="text-slate-400">Equal (0)</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Black Player Card (Abyssal Legion) */}
      <div
        className={`p-4 rounded-xl transition-all duration-300 border ${
          !isWhiteTurn && !status.isCheckmate && !status.isDraw
            ? 'bg-purple-950/40 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)] ring-1 ring-purple-400/40'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-950 border border-purple-500/50 flex items-center justify-center shadow-inner">
              <span className="text-sm font-bold text-purple-300">M2</span>
            </div>
            <div>
              <div className="text-sm font-bold text-purple-200 leading-none">
                Abyssal Legion
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Player 2 (Black · Mewtwo)
              </div>
            </div>
          </div>
          {!isWhiteTurn && !status.isCheckmate && !status.isDraw && (
            <span className="text-[11px] font-semibold text-purple-300 tracking-wide">
              Turn Active
            </span>
          )}
        </div>

        {/* Energy Counter */}
        <div className="my-2.5 pt-2 border-t border-purple-950/80">
          <EnergyCounter energy={energyState.b} color="b" label="Legion Psionic Energy" />
        </div>

        {/* Captures by Black */}
        <div className="mt-2 pt-2 border-t border-purple-950/80">
          <div className="text-[11px] text-slate-400 font-medium">Captured White Pokémon:</div>
          {renderCaptured(capturedWhite, 'w')}
        </div>
      </div>

      {/* White Player Card (Celestial Vanguard) */}
      <div
        className={`p-4 rounded-xl transition-all duration-300 border ${
          isWhiteTurn && !status.isCheckmate && !status.isDraw
            ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/40'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-950/60 border border-amber-500/50 flex items-center justify-center shadow-inner">
              <span className="text-sm font-bold text-amber-300">AR</span>
            </div>
            <div>
              <div className="text-sm font-bold text-amber-200 leading-none">
                Celestial Vanguard
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Player 1 (White · Arceus)
              </div>
            </div>
          </div>
          {isWhiteTurn && !status.isCheckmate && !status.isDraw && (
            <span className="text-[11px] font-semibold text-amber-300 tracking-wide">
              Turn Active
            </span>
          )}
        </div>

        {/* Energy Counter */}
        <div className="my-2.5 pt-2 border-t border-amber-950/80">
          <EnergyCounter energy={energyState.w} color="w" label="Vanguard Cosmic Energy" />
        </div>

        {/* Captures by White */}
        <div className="mt-2 pt-2 border-t border-amber-950/80">
          <div className="text-[11px] text-slate-400 font-medium">Captured Black Pokémon:</div>
          {renderCaptured(capturedBlack, 'b')}
        </div>
      </div>
    </div>
  );
};
