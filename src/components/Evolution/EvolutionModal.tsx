/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Color, PieceSymbol, Square } from 'chess.js';
import {
  EVOLUTION_CHOICES,
  EvolutionChoice,
  EvolutionStage,
} from '../../engine/evolutionEngine';
import { EvolutionAnimation } from './EvolutionAnimation';
import { EvolutionCard } from './EvolutionCard';
import { sounds } from '../../engine/soundEffects';
import { Sparkles, Trophy, Zap, Shield, ArrowRight } from 'lucide-react';

interface EvolutionModalProps {
  fromSquare: Square;
  toSquare: Square;
  playerColor: Color;
  onConfirmEvolution: (chosenSymbol: PieceSymbol) => void;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  fromSquare,
  toSquare,
  playerColor,
  onConfirmEvolution,
}) => {
  const [stage, setStage] = useState<EvolutionStage>('WIMPOD_TO_GOLISOPOD');
  const [previewChoice, setPreviewChoice] = useState<EvolutionChoice>(EVOLUTION_CHOICES[0]);
  const [selectedChoice, setSelectedChoice] = useState<EvolutionChoice | null>(null);

  // Play opening evolution sound and progress from intermediate form
  useEffect(() => {
    sounds.playEvolutionStart();
    const golisopodTimer = setTimeout(() => {
      sounds.playEvolutionGolisopod();
      setStage('CHOICE_SELECTION');
    }, 1400);

    return () => clearTimeout(golisopodTimer);
  }, []);

  // Handle player selecting a final evolution titan
  const handleSelectEvolution = (choice: EvolutionChoice) => {
    setSelectedChoice(choice);
    setPreviewChoice(choice);
    setStage('GOLISOPOD_TO_TITAN');

    // Play final elemental burst audio
    sounds.playEvolutionFinal(choice.vfxType);

    // After transformation finishes, commit the promotion
    setTimeout(() => {
      onConfirmEvolution(choice.symbol);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 border-2 border-amber-400/60 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-[0_0_60px_rgba(251,191,36,0.3)] relative overflow-hidden my-auto"
      >
        {/* Glow backdrop decorative elements */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center mb-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pawn Transcendence · Final Rank {toSquare.toUpperCase()}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
            POKÉMON EVOLUTION CHAMBER
          </h2>

          <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
            {stage === 'WIMPOD_TO_GOLISOPOD'
              ? 'Wimpod reached the frontline pinnacle and breaks through its shell!'
              : stage === 'CHOICE_SELECTION'
              ? 'Golisopod is ready to ascend. Choose your titan to lead the tactical vanguard.'
              : `Transmuting Golisopod into ${selectedChoice?.pokemonName}...`}
          </p>
        </div>

        {/* Center Stage: Evolution Animation */}
        <div className="my-2 py-2">
          <EvolutionAnimation
            stage={stage}
            selectedChoice={selectedChoice || previewChoice}
            playerColor={playerColor}
          />
        </div>

        {/* Four Evolution Choice Cards */}
        {stage === 'CHOICE_SELECTION' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4"
          >
            <div className="text-center text-xs font-semibold text-slate-400 mb-3 flex items-center justify-center gap-2">
              <span>Select an evolution option below:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EVOLUTION_CHOICES.map((choice) => (
                <EvolutionCard
                  key={choice.symbol}
                  choice={choice}
                  playerColor={playerColor}
                  isSelected={previewChoice.symbol === choice.symbol}
                  onSelect={handleSelectEvolution}
                  onHover={(c) => setPreviewChoice(c)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-indigo-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            Team: <strong className="text-slate-200">{playerColor === 'w' ? 'Celestial Vanguard' : 'Abyssal Legion'}</strong>
          </div>
          <div>
            FIDE Promotion Rule: <strong className="text-amber-300">Mandatory Selection</strong>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
