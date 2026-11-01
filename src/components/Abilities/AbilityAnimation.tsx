/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AbilityAnimationEvent } from '../../types/game';

interface AbilityAnimationProps {
  animation: AbilityAnimationEvent | null;
  onAnimationComplete: () => void;
  squareToPercent: (square: string) => { left: number; top: number; width: number; height: number };
}

export const AbilityAnimation: React.FC<AbilityAnimationProps> = ({
  animation,
  onAnimationComplete,
  squareToPercent,
}) => {
  useEffect(() => {
    if (!animation) return;
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 1200);
    return () => clearTimeout(timer);
  }, [animation, onAnimationComplete]);

  if (!animation) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      <AnimatePresence>
        {/* SWARM PROTECTION */}
        {animation.type === 'swarm' && animation.targetSquare && (() => {
          const pos = squareToPercent(animation.targetSquare);
          return (
            <motion.div
              key={animation.id}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1, times: [0, 0.4, 1] }}
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                width: `${pos.width}%`,
                height: `${pos.height}%`,
              }}
              className="absolute flex items-center justify-center"
            >
              {/* Swirling aquatic bug swarm rings */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/80 animate-ping" />
              <div className="absolute inset-[-10%] rounded-full bg-cyan-500/25 blur-md" />
              <div className="relative w-10 h-10 rounded-full border-2 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.8)] flex items-center justify-center">
                <span className="text-[10px] font-bold text-cyan-200">SWARM</span>
              </div>
            </motion.div>
          );
        })()}

        {/* FLAME DASH */}
        {animation.type === 'flame_dash' && animation.fromSquare && animation.toSquare && (() => {
          const fromPos = squareToPercent(animation.fromSquare);
          const toPos = squareToPercent(animation.toSquare);
          return (
            <motion.div
              key={animation.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.1 }}
              className="absolute inset-0"
            >
              {/* Fire streak on destination */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1, 1.4, 1], opacity: [0, 0.9, 0] }}
                transition={{ duration: 0.9 }}
                style={{
                  left: `${toPos.left}%`,
                  top: `${toPos.top}%`,
                  width: `${toPos.width}%`,
                  height: `${toPos.height}%`,
                }}
                className="absolute flex items-center justify-center"
              >
                <div className="absolute inset-0 rounded-xl bg-orange-500/40 blur-md animate-pulse" />
                <div className="w-12 h-12 rounded-full border-2 border-orange-400 bg-gradient-to-t from-orange-600/50 to-amber-300/60 shadow-[0_0_20px_rgba(249,115,22,0.9)] flex items-center justify-center">
                  <span className="text-[9px] font-black text-amber-100 tracking-wider">FLAME DASH</span>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}

        {/* PSYCHIC SHIELD */}
        {animation.type === 'psychic_shield' && animation.targetSquare && (() => {
          const pos = squareToPercent(animation.targetSquare);
          return (
            <motion.div
              key={animation.id}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.6, 1.25, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1 }}
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                width: `${pos.width}%`,
                height: `${pos.height}%`,
              }}
              className="absolute flex items-center justify-center"
            >
              <div className="absolute inset-[-15%] rounded-full bg-purple-600/30 blur-lg" />
              <div className="relative w-12 h-12 rounded-full border-2 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.9)] bg-purple-950/40 backdrop-blur-sm flex items-center justify-center">
                <span className="text-[9px] font-extrabold text-purple-200">SHIELD</span>
              </div>
            </motion.div>
          );
        })()}

        {/* IRON WALL */}
        {animation.type === 'iron_wall' && animation.targetSquare && (() => {
          const pos = squareToPercent(animation.targetSquare);
          return (
            <motion.div
              key={animation.id}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.8, 1.15, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1 }}
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                width: `${pos.width}%`,
                height: `${pos.height}%`,
              }}
              className="absolute flex items-center justify-center"
            >
              <div className="absolute inset-[-10%] rounded-xl bg-slate-400/20 blur-md" />
              <div className="relative w-12 h-12 rounded-xl border-3 border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.7)] bg-slate-900/70 flex items-center justify-center">
                <span className="text-[9px] font-black text-slate-200">IRON WALL</span>
              </div>
            </motion.div>
          );
        })()}

        {/* PSYCHIC CONTROL */}
        {animation.type === 'psychic_control' && animation.fromSquare && animation.toSquare && (() => {
          const toPos = squareToPercent(animation.toSquare);
          return (
            <motion.div
              key={animation.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.8, 1.3, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1 }}
              style={{
                left: `${toPos.left}%`,
                top: `${toPos.top}%`,
                width: `${toPos.width}%`,
                height: `${toPos.height}%`,
              }}
              className="absolute flex items-center justify-center"
            >
              <div className="absolute inset-[-20%] rounded-full bg-fuchsia-600/35 blur-xl animate-spin" />
              <div className="relative w-12 h-12 rounded-full border-2 border-fuchsia-400 shadow-[0_0_25px_rgba(217,70,239,0.9)] bg-indigo-950/60 flex items-center justify-center">
                <span className="text-[9px] font-black text-fuchsia-200">CONTROL</span>
              </div>
            </motion.div>
          );
        })()}

        {/* DIVINE PROTECTION */}
        {animation.type === 'divine_protection' && animation.toSquare && (() => {
          const pos = squareToPercent(animation.toSquare);
          return (
            <motion.div
              key={animation.id}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.6, 1.4, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2 }}
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                width: `${pos.width}%`,
                height: `${pos.height}%`,
              }}
              className="absolute flex items-center justify-center"
            >
              <div className="absolute inset-[-30%] rounded-full bg-amber-400/40 blur-2xl" />
              <div className="relative w-14 h-14 rounded-full border-3 border-amber-300 shadow-[0_0_35px_rgba(251,191,36,1)] bg-amber-950/60 flex items-center justify-center">
                <span className="text-[9px] font-black text-amber-200 tracking-wider">DIVINE</span>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};
