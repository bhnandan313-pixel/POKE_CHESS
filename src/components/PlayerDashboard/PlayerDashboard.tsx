/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Color } from 'chess.js';
import { GameStatus, CapturedPiece, PlayerEnergyState, PlayerProfile } from '../../types/game';
import { getAvatar } from '../../engine/avatars';
import { POKEMON_PIECES } from '../../engine/pokemonRoster';
import { PokemonPiece } from '../PokemonPieces/PokemonPiece';
import { EnergyCounter } from '../Abilities/EnergyCounter';
import {
  Shield,
  Zap,
  Timer as TimerIcon,
  AlertTriangle,
  Crown,
  Swords,
  Trophy,
  Bot,
} from 'lucide-react';

interface PlayerDashboardProps {
  player: PlayerProfile;
  sideColor: Color;
  status: GameStatus;
  energyState: PlayerEnergyState;
  capturedPieces: CapturedPiece[]; // Pieces captured by this player
  materialScore: number;
  timeRemainingSeconds?: number;
  timerMinutes: number;
  isCheck: boolean;
  isActiveTurn: boolean;
  isAi?: boolean;
  aiDifficulty?: 'beginner' | 'intermediate' | 'expert';
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  player,
  sideColor,
  status,
  energyState,
  capturedPieces,
  materialScore,
  timeRemainingSeconds,
  timerMinutes,
  isCheck,
  isActiveTurn,
  isAi = false,
  aiDifficulty,
}) => {
  const avatar = getAvatar(player.avatarId);
  const isWhite = sideColor === 'w';

  // Format time remaining
  const formatTime = (secs?: number) => {
    if (secs === undefined || timerMinutes === 0) return 'Casual';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime =
    timerMinutes > 0 &&
    timeRemainingSeconds !== undefined &&
    timeRemainingSeconds <= 30 &&
    timeRemainingSeconds > 0;

  const isTimeOut =
    timerMinutes > 0 &&
    timeRemainingSeconds !== undefined &&
    timeRemainingSeconds <= 0;

  const teamName = isWhite ? 'Celestial Vanguard' : 'Abyssal Legion';
  const roleTitle = isWhite ? 'White · Arceus Allegiance' : 'Black · Mewtwo Allegiance';

  return (
    <div
      className={`relative w-full rounded-2xl p-4 transition-all duration-300 border backdrop-blur-md shadow-xl overflow-hidden ${
        isActiveTurn && !status.isCheckmate && !status.isDraw
          ? isWhite
            ? 'bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-950 border-amber-400/80 ring-2 ring-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
            : 'bg-gradient-to-b from-purple-950/40 via-slate-900/90 to-slate-950 border-purple-400/80 ring-2 ring-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
          : 'bg-slate-900/70 border-slate-800/80'
      }`}
    >
      {/* Active turn indicator ambient glow */}
      {isActiveTurn && !status.isCheckmate && !status.isDraw && (
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
            isWhite ? 'bg-amber-500/15' : 'bg-purple-500/15'
          }`}
        />
      )}

      {/* Top Header: Avatar + Name + Timer */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-indigo-950/60">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Icon with active turn halo */}
          <div className="relative shrink-0">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-inner border transition-all ${
                isActiveTurn
                  ? isWhite
                    ? 'border-amber-400 ring-2 ring-amber-400/60'
                    : 'border-purple-400 ring-2 ring-purple-400/60'
                  : 'border-slate-700'
              }`}
              style={{
                backgroundColor: `${avatar.themeColor}30`,
              }}
            >
              {avatar.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Side Pip */}
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-slate-950 flex items-center justify-center text-[9px] font-bold ${
                isWhite ? 'bg-amber-400 text-slate-950' : 'bg-purple-500 text-white'
              }`}
            >
              {isWhite ? 'W' : 'B'}
            </div>
          </div>

          {/* Player Name and Team */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-white truncate font-display">
                {player.name}
              </span>
              {isAi && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[9px] font-bold uppercase tracking-wider">
                  <Bot className="w-2.5 h-2.5" />
                  <span>AI</span>
                </span>
              )}
              {isAi && aiDifficulty && (
                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                  {aiDifficulty}
                </span>
              )}
              {isActiveTurn && !status.isCheckmate && !status.isDraw && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </div>
            <div className="text-[11px] font-medium text-slate-400 truncate">
              {teamName}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {roleTitle}
            </div>
          </div>
        </div>

        {/* Timer Box */}
        <div className="text-right shrink-0">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all font-mono font-black text-sm ${
              isTimeOut
                ? 'bg-red-950 border-red-500 text-red-200 animate-bounce'
                : isLowTime
                ? 'bg-rose-950/90 border-rose-500/80 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : isActiveTurn
                ? isWhite
                  ? 'bg-amber-950/60 border-amber-400/60 text-amber-200 shadow-md'
                  : 'bg-purple-950/60 border-purple-400/60 text-purple-200 shadow-md'
                : 'bg-slate-950/80 border-slate-800 text-slate-400'
            }`}
          >
            <TimerIcon
              className={`w-3.5 h-3.5 ${
                isLowTime
                  ? 'text-rose-400 animate-spin'
                  : isActiveTurn
                  ? isWhite
                    ? 'text-amber-400'
                    : 'text-purple-400'
                  : 'text-slate-500'
              }`}
            />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>

          {/* Active Turn Badge / In-Check Alert */}
          <div className="mt-1">
            {isCheck ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40 animate-pulse">
                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                King in Check!
              </span>
            ) : isActiveTurn && !status.isCheckmate && !status.isDraw ? (
              <span
                className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isWhite
                    ? 'text-amber-300 bg-amber-400/15 border border-amber-400/30'
                    : 'text-purple-300 bg-purple-400/15 border border-purple-400/30'
                }`}
              >
                Turn Active
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-medium">Waiting</span>
            )}
          </div>
        </div>
      </div>

      {/* Energy Management Module */}
      <div className="my-3">
        <EnergyCounter
          energy={energyState}
          color={sideColor}
          label={`${teamName} Energy`}
        />
      </div>

      {/* Captured Pokémon Graveyard */}
      <div className="pt-2.5 border-t border-indigo-950/60">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-400 font-medium">Captured Opponents:</span>
          {materialScore !== 0 && (
            <span
              className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                materialScore > 0
                  ? isWhite
                    ? 'text-amber-300 bg-amber-500/20'
                    : 'text-slate-400'
                  : !isWhite
                  ? 'text-purple-300 bg-purple-500/20'
                  : 'text-slate-400'
              }`}
            >
              {materialScore > 0 && isWhite
                ? `+${materialScore}`
                : materialScore < 0 && !isWhite
                ? `+${Math.abs(materialScore)}`
                : ''}
            </span>
          )}
        </div>

        {capturedPieces.length === 0 ? (
          <div className="text-[10px] text-slate-500 italic py-1">
            No opposing Pokémon captured yet
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {capturedPieces.map((item) => {
              const info = POKEMON_PIECES[item.symbol];
              const oppColor: Color = isWhite ? 'b' : 'w';
              return (
                <div
                  key={item.symbol}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-950/80 border border-slate-700/60 shadow-sm"
                  title={`${item.count}x ${info.name} (${info.chessPiece})`}
                >
                  <div className="w-4 h-4">
                    <PokemonPiece symbol={item.symbol} color={oppColor} size="responsive" />
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
        )}
      </div>
    </div>
  );
};
