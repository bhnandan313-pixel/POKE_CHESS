/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { EvolutionChoice } from '../../engine/evolutionEngine';
import { Zap, Shield, Sparkles } from 'lucide-react';
import { PokemonPiece } from '../PokemonPieces/PokemonPiece';
import { Color } from 'chess.js';

interface EvolutionCardProps {
  choice: EvolutionChoice;
  playerColor: Color;
  isSelected: boolean;
  onSelect: (choice: EvolutionChoice) => void;
  onHover: (choice: EvolutionChoice) => void;
}

export const EvolutionCard: React.FC<EvolutionCardProps> = ({
  choice,
  playerColor,
  isSelected,
  onSelect,
  onHover,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => onHover(choice)}
      onClick={() => onSelect(choice)}
      className={`relative p-4 rounded-2xl cursor-pointer transition-all flex flex-col justify-between overflow-hidden border-2 ${
        isSelected
          ? 'bg-gradient-to-b from-indigo-950/90 to-slate-900 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.35)]'
          : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80 hover:border-slate-500'
      }`}
    >
      {/* Glow highlight */}
      {isSelected && (
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40"
          style={{ backgroundColor: choice.themeColor }}
        />
      )}

      {/* Top Header: Role & Choice Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
            style={{
              borderColor: `${choice.themeColor}50`,
              color: choice.accentColor,
              backgroundColor: `${choice.themeColor}15`,
            }}
          >
            {choice.title}
          </span>
          <span className="text-xs font-mono font-semibold text-slate-400">
            {choice.chessRole}
          </span>
        </div>

        {/* Pokémon Artwork Thumbnail + Name */}
        <div className="flex items-center gap-3 my-2">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-950 flex items-center justify-center shadow-inner">
            {choice.imageUrl ? (
              <img
                src={choice.imageUrl}
                alt={choice.pokemonName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-10 h-10">
                <PokemonPiece symbol={choice.symbol} color={playerColor} size="responsive" />
              </div>
            )}
          </div>

          <div>
            <h4 className="text-base font-extrabold text-white font-display leading-tight">
              {choice.pokemonName}
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              {choice.type.map((t) => (
                <span key={t} className="text-[10px] font-medium text-slate-400">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ability Overview */}
        <div className="my-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              {choice.activeAbility.name}
            </span>
            <span className="text-[10px] font-mono text-amber-300 font-bold">
              {choice.activeAbility.cost} Energy
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
            {choice.activeAbility.description}
          </p>

          {choice.passiveAbility && (
            <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-300 flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">Passive: {choice.passiveAbility.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Select CTA */}
      <button
        type="button"
        className={`w-full mt-2 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          isSelected
            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-extrabold'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{isSelected ? 'Confirm Evolution' : 'Choose This Titan'}</span>
      </button>
    </motion.div>
  );
};
