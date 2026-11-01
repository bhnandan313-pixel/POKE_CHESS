/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Sparkles, BrainCircuit } from 'lucide-react';
import { AiDifficulty } from '../../types/ai';
import { getAvatar } from '../../engine/avatars';

interface AiThinkingIndicatorProps {
  isThinking: boolean;
  aiTrainerName: string;
  aiAvatarId: string;
  difficulty: AiDifficulty;
  thinkingMessage?: string;
}

export const AiThinkingIndicator: React.FC<AiThinkingIndicatorProps> = ({
  isThinking,
  aiTrainerName,
  aiAvatarId,
  difficulty,
  thinkingMessage,
}) => {
  const avatar = getAvatar(aiAvatarId);

  const difficultyBadge =
    difficulty === 'beginner'
      ? { label: 'Beginner AI', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
      : difficulty === 'intermediate'
      ? { label: 'Intermediate AI', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' }
      : { label: 'Expert AI', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };

  return (
    <AnimatePresence>
      {isThinking && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-18 left-1/2 -translate-x-1/2 z-40 max-w-md w-full px-4 pointer-events-none"
        >
          <div className="p-3 rounded-2xl bg-slate-950/95 border border-indigo-500/40 shadow-[0_0_30px_rgba(79,70,229,0.35)] backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-600/50 flex items-center justify-center text-amber-400">
                  <BrainCircuit className="w-5 h-5 animate-pulse text-amber-400" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs truncate">
                    {aiTrainerName}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficultyBadge.color}`}>
                    {difficultyBadge.label}
                  </span>
                </div>
                <div className="text-[11px] text-indigo-300 flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="truncate">
                    {thinkingMessage || 'Analyzing tactical Pokémon moves...'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono text-slate-400 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/40">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI TURN</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
