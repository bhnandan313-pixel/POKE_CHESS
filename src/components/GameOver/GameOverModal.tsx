/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { GameStatus, MatchSettings, MatchStats } from '../../types/game';
import { POKEMON_PIECES } from '../../engine/pokemonRoster';
import { getAvatar } from '../../engine/avatars';
import {
  Trophy,
  RefreshCw,
  Eye,
  Sparkles,
  Swords,
  Timer,
  Zap,
  RotateCcw,
  Home,
  Shield,
  Crown,
} from 'lucide-react';

interface GameOverModalProps {
  status: GameStatus;
  settings: MatchSettings;
  stats: MatchStats;
  onRematch: () => void;
  onNewMatch: () => void;
  onMainMenu: () => void;
  onReviewBoard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  settings,
  stats,
  onRematch,
  onNewMatch,
  onMainMenu,
  onReviewBoard,
}) => {
  const isWinnerWhite = status.winner === 'w';
  const isWinnerBlack = status.winner === 'b';
  const isDraw = status.winner === 'draw' || (!isWinnerWhite && !isWinnerBlack);

  // Identify winning trainer
  const winnerPlayer = isWinnerWhite
    ? settings.player1.color === 'w'
      ? settings.player1
      : settings.player2
    : isWinnerBlack
    ? settings.player1.color === 'b'
      ? settings.player1
      : settings.player2
    : null;

  const winnerAvatar = winnerPlayer ? getAvatar(winnerPlayer.avatarId) : null;

  const winnerData = isWinnerWhite
    ? {
        title: `${winnerPlayer?.name || 'Celestial Vanguard'} Victorious!`,
        subtitle: 'Arceus, the Original One, shattered the opponent’s cosmic formation.',
        bannerBorder: 'border-amber-400/80',
        glowBg: 'from-amber-500/20 via-slate-900 to-amber-950/40',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        image: POKEMON_PIECES.k.imageUrl,
        heroPokemon: 'Arceus (Celestial King)',
        team: 'Celestial Vanguard (White)',
      }
    : isWinnerBlack
    ? {
        title: `${winnerPlayer?.name || 'Abyssal Legion'} Victorious!`,
        subtitle: 'Mewtwo tore through the vanguard defenses with relentless psionic pressure.',
        bannerBorder: 'border-purple-400/80',
        glowBg: 'from-purple-500/20 via-slate-900 to-purple-950/40',
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
        image: POKEMON_PIECES.q.imageUrl,
        heroPokemon: 'Mewtwo (Abyssal Queen)',
        team: 'Abyssal Legion (Black)',
      }
    : {
        title: 'Tactical Draw',
        subtitle: 'Neither commander yielded. The battlefield remains in cosmic equilibrium.',
        bannerBorder: 'border-slate-500/60',
        glowBg: 'from-slate-800/40 via-slate-900 to-slate-950',
        badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-400/40',
        heroPokemon: 'Equal Strategy & Mastery',
        team: 'Peaceful Resolution',
      };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`bg-slate-900 border ${winnerData.bannerBorder} rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden my-4`}
      >
        {/* Animated ambient victory glow */}
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative text-center">
          {/* Trophy & Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-950/90 border border-indigo-700/60 mb-3 shadow-xl relative">
            <Trophy className="w-8 h-8 text-amber-400" />
            {!isDraw && (
              <Crown className="w-4 h-4 text-amber-300 absolute -top-1.5 -right-1.5" />
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
            {winnerData.title}
          </h3>

          <div className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-950/80 border border-slate-800 text-slate-300">
            {winnerData.team}
          </div>

          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            {winnerData.subtitle}
          </p>

          {/* Winner Artwork Banner if available */}
          {winnerData.image && (
            <div className="my-4 mx-auto w-32 h-32 rounded-2xl overflow-hidden border-2 border-indigo-700/80 shadow-2xl bg-slate-950 relative group">
              <img
                src={winnerData.image}
                alt={winnerData.heroPokemon}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-xs py-1 text-[10px] font-bold text-amber-300">
                {winnerData.heroPokemon}
              </div>
            </div>
          )}

          {/* Match Telemetry Dashboard Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-center">
            <div className="p-1.5">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Duration</span>
              <span className="font-mono font-bold text-white text-sm">
                {formatDuration(stats.durationSeconds)}
              </span>
            </div>

            <div className="p-1.5">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Moves</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {stats.totalMoves}
              </span>
            </div>

            <div className="p-1.5">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Captures</span>
              <span className="font-mono font-bold text-cyan-300 text-sm">
                {stats.capturesCount}
              </span>
            </div>

            <div className="p-1.5">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Evolutions</span>
              <span className="font-mono font-bold text-purple-300 text-sm">
                {stats.evolutionsCount}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={onRematch}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Rematch (Same Rules)</span>
              </button>

              <button
                onClick={onNewMatch}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                <Swords className="w-4 h-4 text-cyan-400" />
                <span>New Match Setup</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onReviewBoard}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-slate-300 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Review Board</span>
              </button>

              <button
                onClick={onMainMenu}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-slate-300 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>Main Menu</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
