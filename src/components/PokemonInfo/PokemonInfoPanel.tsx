/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PieceSymbol, Color } from 'chess.js';
import { POKEMON_PIECES } from '../../engine/pokemonRoster';
import { PokemonPiece } from '../PokemonPieces/PokemonPiece';
import { Sparkles, Zap, Shield, Info } from 'lucide-react';

interface PokemonInfoPanelProps {
  inspectedPiece: { symbol: PieceSymbol; color: Color } | null;
}

export const PokemonInfoPanel: React.FC<PokemonInfoPanelProps> = ({ inspectedPiece }) => {
  // Default to Arceus or Mewtwo if none selected
  const activeSymbol = inspectedPiece?.symbol || 'k';
  const activeColor = inspectedPiece?.color || 'w';
  const info = POKEMON_PIECES[activeSymbol];

  const typeColors: Record<string, string> = {
    Normal: 'text-amber-200 border-amber-500/30 bg-amber-500/10',
    Cosmic: 'text-indigo-200 border-indigo-500/30 bg-indigo-500/10',
    Psychic: 'text-purple-200 border-purple-500/30 bg-purple-500/10',
    Steel: 'text-slate-300 border-slate-500/30 bg-slate-500/10',
    Rock: 'text-stone-300 border-stone-500/30 bg-stone-500/10',
    Fire: 'text-orange-200 border-orange-500/30 bg-orange-500/10',
    Bug: 'text-emerald-200 border-emerald-500/30 bg-emerald-500/10',
    Water: 'text-cyan-200 border-cyan-500/30 bg-cyan-500/10',
  };

  return (
    <div className="flex flex-col rounded-xl bg-slate-900/80 border border-indigo-900/40 backdrop-blur-md overflow-hidden p-3.5">
      {/* Header with Title and Piece Type */}
      <div className="flex items-center justify-between pb-2 border-b border-indigo-900/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Pokémon Codex</span>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          {activeColor === 'w' ? 'Celestial' : 'Abyssal'} Team
        </span>
      </div>

      {/* Main Pokémon Feature Card */}
      <div className="mt-3 flex items-start gap-3">
        {/* Visual Slot: High-res portrait or fallback SVG */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-950 border border-indigo-800/50 shadow-inner flex items-center justify-center">
          {info.imageUrl ? (
            <img
              src={info.imageUrl}
              alt={info.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-12 h-12">
              <PokemonPiece symbol={activeSymbol} color={activeColor} size="responsive" />
            </div>
          )}
        </div>

        {/* Name and Typings */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-base font-bold text-white font-display truncate">
              {info.name}
            </h4>
            <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-200 uppercase">
              {info.chessPiece}
            </span>
          </div>

          {/* Clean Type Labels */}
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {info.type.map((t) => (
              <span
                key={t}
                className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                  typeColors[t] || 'text-slate-300 border-slate-700 bg-slate-800'
                }`}
              >
                {t}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-indigo-300/90 mt-1 italic leading-tight">
            "{info.role}"
          </p>
        </div>
      </div>

      {/* Lore Description */}
      <p className="text-xs text-slate-300/90 mt-2.5 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
        {info.description}
      </p>

      {/* Signature Move & Tactical Note */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-300">Signature Move:</span>
          <span className="text-amber-200 font-medium">{info.signatureMove}</span>
        </div>

        <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span className="leading-snug text-slate-300">
            <strong className="text-cyan-300 font-semibold">Grandmaster Tip: </strong>
            {info.tacticalNote}
          </span>
        </div>
      </div>
    </div>
  );
};
