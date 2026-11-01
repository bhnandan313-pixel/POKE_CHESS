/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BattleEvent } from '../../types/game';
import {
  Swords,
  Sparkles,
  Zap,
  AlertTriangle,
  Trophy,
  Timer,
  RotateCcw,
  Flag,
  X,
} from 'lucide-react';

interface BattleEventsToastProps {
  events: BattleEvent[];
  onDismiss: (id: string) => void;
}

export const BattleEventsToast: React.FC<BattleEventsToastProps> = ({ events, onDismiss }) => {
  // Show only top 3 most recent events so it doesn't obstruct gameplay
  const displayEvents = events.slice(-3);

  const getEventIcon = (type: BattleEvent['type']) => {
    switch (type) {
      case 'capture':
        return <Swords className="w-3.5 h-3.5 text-amber-400" />;
      case 'ability':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'energy':
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
      case 'evolution':
        return <Trophy className="w-3.5 h-3.5 text-amber-300" />;
      case 'check':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'game_over':
        return <Trophy className="w-3.5 h-3.5 text-emerald-400" />;
      case 'timer':
        return <Timer className="w-3.5 h-3.5 text-red-400" />;
      case 'undo':
        return <RotateCcw className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getEventBorder = (type: BattleEvent['type']) => {
    switch (type) {
      case 'capture':
        return 'border-amber-500/50 bg-slate-900/90 text-amber-100';
      case 'ability':
        return 'border-purple-500/50 bg-slate-900/90 text-purple-100';
      case 'energy':
        return 'border-cyan-500/50 bg-slate-900/90 text-cyan-100';
      case 'evolution':
        return 'border-amber-400/70 bg-gradient-to-r from-amber-950/90 to-slate-900/90 text-amber-200';
      case 'check':
        return 'border-rose-500/70 bg-rose-950/90 text-rose-100 animate-pulse';
      case 'game_over':
        return 'border-emerald-500/70 bg-emerald-950/90 text-emerald-100';
      case 'timer':
        return 'border-red-500/70 bg-red-950/90 text-red-100';
      case 'undo':
        return 'border-sky-500/50 bg-slate-900/90 text-sky-100';
      default:
        return 'border-indigo-500/50 bg-slate-900/90 text-slate-100';
    }
  };

  return (
    <div className="fixed top-16 right-4 z-40 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {displayEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`pointer-events-auto p-3 rounded-xl border shadow-xl backdrop-blur-md flex items-start justify-between gap-2.5 text-xs ${getEventBorder(
              event.type
            )}`}
          >
            <div className="flex items-start gap-2 min-w-0">
              <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-700/60 shrink-0 mt-0.5">
                {getEventIcon(event.type)}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-xs leading-snug">
                  {event.title}
                </div>
                <div className="text-[11px] text-slate-300 leading-snug break-words">
                  {event.description}
                </div>
              </div>
            </div>

            <button
              onClick={() => onDismiss(event.id)}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
