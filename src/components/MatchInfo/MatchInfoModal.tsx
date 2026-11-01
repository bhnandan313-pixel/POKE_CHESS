/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { MatchSettings, MatchStats } from '../../types/game';
import { getAvatar } from '../../engine/avatars';
import { getBoardTheme } from '../../engine/boardThemes';
import {
  Info,
  Timer,
  Palette,
  Volume2,
  Sparkles,
  Swords,
  Shield,
  X,
  Clock,
  History,
} from 'lucide-react';

interface MatchInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MatchSettings;
  stats: MatchStats;
  moveCount: number;
}

export const MatchInfoModal: React.FC<MatchInfoModalProps> = ({
  isOpen,
  onClose,
  settings,
  stats,
  moveCount,
}) => {
  if (!isOpen) return null;

  const p1Avatar = getAvatar(settings.player1.avatarId);
  const p2Avatar = getAvatar(settings.player2.avatarId);
  const theme = getBoardTheme(settings.boardTheme);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-slate-900 border border-indigo-900/60 rounded-2xl shadow-2xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-indigo-950/60 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center">
              <Info className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Match Intelligence
              </h3>
              <p className="text-[11px] text-slate-400">Current game parameters and battle telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Players Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Player 1 */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              {settings.player1.color === 'w' ? 'White · Celestial' : 'Black · Abyssal'}
            </span>
            <div className="font-bold text-white text-xs truncate">{settings.player1.name}</div>
            <div className="text-[10px] text-slate-400">{p1Avatar.name} ({p1Avatar.title})</div>
          </div>

          {/* Player 2 */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
              {settings.player2.color === 'w' ? 'White · Celestial' : 'Black · Abyssal'}
            </span>
            <div className="font-bold text-white text-xs truncate">{settings.player2.name}</div>
            <div className="text-[10px] text-slate-400">{p2Avatar.name} ({p2Avatar.title})</div>
          </div>
        </div>

        {/* Match Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Duration</span>
            <span className="font-mono font-bold text-white text-xs">
              {formatDuration(stats.durationSeconds)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Moves</span>
            <span className="font-mono font-bold text-amber-300 text-xs">{moveCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Abilities Cast</span>
            <span className="font-mono font-bold text-purple-300 text-xs">
              {stats.abilitiesUsed}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Evolutions</span>
            <span className="font-mono font-bold text-emerald-300 text-xs">
              {stats.evolutionsCount}
            </span>
          </div>
        </div>

        {/* Configuration settings list */}
        <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              Clock Mode:
            </span>
            <span className="font-semibold text-white">
              {settings.timerMinutes === 0 ? 'No Timer (Casual)' : `${settings.timerMinutes} Minutes / Player`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              Theme:
            </span>
            <span className="font-semibold text-white">{theme.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Features:
            </span>
            <span className="font-semibold text-white">
              Full Abilities, Energy + Undo Enabled
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
        >
          Close Match Info
        </button>
      </motion.div>
    </div>
  );
};
