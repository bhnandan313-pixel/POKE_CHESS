/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EvolutionStage, EvolutionChoice, GOLISOPOD_IMAGE } from '../../engine/evolutionEngine';
import { POKEMON_PIECES } from '../../engine/pokemonRoster';
import { Color } from 'chess.js';
import { PokemonPiece } from '../PokemonPieces/PokemonPiece';
import { Sparkles, Waves, Flame, Zap, ShieldAlert } from 'lucide-react';

interface EvolutionAnimationProps {
  stage: EvolutionStage;
  selectedChoice: EvolutionChoice | null;
  playerColor: Color;
}

export const EvolutionAnimation: React.FC<EvolutionAnimationProps> = ({
  stage,
  selectedChoice,
  playerColor,
}) => {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-amber-500/20 blur-2xl animate-pulse pointer-events-none" />

      {/* STAGE 1: Wimpod → Golisopod (Water & Blue Energy Particles) */}
      {stage === 'WIMPOD_TO_GOLISOPOD' && (
        <motion.div
          key="stage1"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          className="relative w-full h-full flex flex-col items-center justify-center"
        >
          {/* Swirling water particles & energy rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-2 border-cyan-400/60 border-dashed"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-full bg-cyan-500/25 blur-lg"
          />

          {/* Morphing avatar: Wimpod bursting into Golisopod */}
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-cyan-400 bg-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center justify-center p-1">
            <motion.img
              initial={{ scale: 0.8, filter: 'brightness(2)' }}
              animate={{ scale: 1, filter: 'brightness(1)' }}
              transition={{ duration: 1 }}
              src={GOLISOPOD_IMAGE}
              alt="Golisopod Evolution"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-cyan-300">
            <Waves className="w-4 h-4 animate-bounce text-cyan-400" />
            <span>Awakening Golisopod Carapace...</span>
          </div>
        </motion.div>
      )}

      {/* STAGE 2: Choice Selection (Golisopod Intermediate Standby) */}
      {stage === 'CHOICE_SELECTION' && (
        <motion.div
          key="stage2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative w-full h-full flex flex-col items-center justify-center"
        >
          {/* Stable power aura */}
          <div className="absolute inset-3 rounded-full bg-indigo-500/20 blur-md animate-pulse" />

          <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-indigo-400/80 bg-slate-950 shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center justify-center p-1">
            <img
              src={GOLISOPOD_IMAGE}
              alt="Golisopod Intermediate Form"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <div className="mt-2 text-center">
            <span className="text-xs font-black text-slate-200 tracking-wide block">
              Golisopod (Intermediate Form)
            </span>
            <span className="text-[10px] text-indigo-300">
              Ready to transcend into an apex chess titan
            </span>
          </div>
        </motion.div>
      )}

      {/* STAGE 3: Golisopod → Selected Titan Final Transformation */}
      {stage === 'GOLISOPOD_TO_TITAN' && selectedChoice && (
        <motion.div
          key="stage3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full h-full flex flex-col items-center justify-center"
        >
          {/* Element-specific particles and energy */}
          {selectedChoice.vfxType === 'psychic' && (
            <>
              <motion.div
                animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute inset-[-10%] rounded-full bg-purple-600/35 blur-xl"
              />
              <div className="absolute inset-0 rounded-full border-3 border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.8)] animate-ping" />
            </>
          )}

          {selectedChoice.vfxType === 'metallic' && (
            <>
              <motion.div
                animate={{ scale: [1.2, 0.95, 1.05] }}
                transition={{ duration: 0.5 }}
                className="absolute inset-[-10%] rounded-2xl bg-slate-400/30 blur-xl"
              />
              <div className="absolute inset-0 rounded-2xl border-4 border-slate-300 shadow-[0_0_40px_rgba(203,213,225,0.9)] animate-pulse" />
            </>
          )}

          {selectedChoice.vfxType === 'fire' && (
            <>
              <motion.div
                animate={{ scale: [1, 1.4, 1.2] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute inset-[-10%] rounded-full bg-orange-600/40 blur-xl"
              />
              <div className="absolute inset-0 rounded-full border-3 border-orange-400 shadow-[0_0_40px_rgba(249,115,22,0.9)] animate-bounce" />
            </>
          )}

          {selectedChoice.vfxType === 'golden_psychic' && (
            <>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-[-10%] rounded-full bg-amber-500/35 blur-xl"
              />
              <div className="absolute inset-0 rounded-full border-3 border-amber-300 shadow-[0_0_40px_rgba(251,191,36,0.9)] animate-ping" />
            </>
          )}

          {/* Morphing into the Final Titan */}
          <div
            className="relative w-36 h-36 rounded-2xl overflow-hidden border-3 bg-slate-950 flex items-center justify-center shadow-2xl p-1"
            style={{ borderColor: selectedChoice.accentColor }}
          >
            <motion.img
              initial={{ scale: 0.5, filter: 'brightness(3)' }}
              animate={{ scale: 1, filter: 'brightness(1)' }}
              transition={{ duration: 0.6 }}
              src={selectedChoice.imageUrl}
              alt={selectedChoice.pokemonName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <div className="mt-2 text-center">
            <span
              className="text-sm font-extrabold tracking-wider block font-display uppercase"
              style={{ color: selectedChoice.accentColor }}
            >
              {selectedChoice.pokemonName} Manifested!
            </span>
            <span className="text-[10px] text-slate-300">
              {selectedChoice.vfxDescription}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
