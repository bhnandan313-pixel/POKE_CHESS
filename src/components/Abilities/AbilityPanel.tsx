/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Color, PieceSymbol, Square } from 'chess.js';
import { POKEMON_PIECES } from '../../engine/pokemonRoster';
import { AbilityButton } from './AbilityButton';
import { Shield, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { PlayerEnergyState } from '../../types/game';

interface AbilityPanelProps {
  selectedSquare: Square | null;
  selectedPiece: { symbol: PieceSymbol; color: Color } | null;
  currentTurn: Color;
  energyState: Record<Color, PlayerEnergyState>;
  abilityUsedThisTurn: boolean;
  usedDivineProtection: Record<Color, boolean>;
  isTargeting: boolean;
  targetingAbilityId?: string;
  onStartTargeting: (abilityId: string, square: Square, piece: PieceSymbol) => void;
  onCancelTargeting: () => void;
}

export const AbilityPanel: React.FC<AbilityPanelProps> = ({
  selectedSquare,
  selectedPiece,
  currentTurn,
  energyState,
  abilityUsedThisTurn,
  usedDivineProtection,
  isTargeting,
  targetingAbilityId,
  onStartTargeting,
  onCancelTargeting,
}) => {
  // If no piece is selected, show prompt
  if (!selectedPiece || !selectedSquare) {
    return (
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-900/40 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300 pb-2 border-b border-indigo-900/40">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ability Engine</span>
        </div>
        <div className="py-4 text-center text-xs text-slate-500 italic">
          Select a friendly Pokémon on the board to view and activate special abilities.
        </div>
      </div>
    );
  }

  const info = POKEMON_PIECES[selectedPiece.symbol];
  const isCurrentTurnPlayer = selectedPiece.color === currentTurn;
  const playerEnergy = energyState[currentTurn]?.current ?? 0;
  const activeAbility = info.activeAbility;

  // Determine availability
  let isAvailable = isCurrentTurnPlayer && !abilityUsedThisTurn;
  let disabledReason: string | undefined;

  if (!isCurrentTurnPlayer) {
    isAvailable = false;
    disabledReason = 'Not this Pokémon’s turn.';
  } else if (abilityUsedThisTurn) {
    isAvailable = false;
    disabledReason = 'Only one ability can be activated per turn.';
  } else if (activeAbility.id === 'divine_protection' && usedDivineProtection[currentTurn]) {
    isAvailable = false;
    disabledReason = 'Divine Protection can only be invoked once per match.';
  } else if (playerEnergy < activeAbility.cost) {
    isAvailable = false;
    disabledReason = `Insufficient energy (${playerEnergy}/${activeAbility.cost}).`;
  }

  return (
    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-900/40 backdrop-blur-md flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-indigo-900/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Ability Command</span>
        </div>
        <span className="text-[11px] font-mono font-medium text-slate-400">
          Square {selectedSquare.toUpperCase()}
        </span>
      </div>

      {/* Selected Piece Role Badge */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-white font-display">
            {info.name}
          </span>
          <span className="text-xs text-slate-400 block">
            {selectedPiece.color === 'w' ? 'Celestial Vanguard' : 'Abyssal Legion'} · {info.chessPiece}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Energy
          </span>
          <span className="font-mono font-bold text-amber-300 text-xs">
            {playerEnergy} / 10
          </span>
        </div>
      </div>

      {/* Passive Ability Banner (e.g. Aggron) */}
      {info.passiveAbility && (
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-0.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Passive: {info.passiveAbility.name}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            {info.passiveAbility.description}
          </p>
        </div>
      )}

      {/* Active Ability Information */}
      <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {activeAbility.name}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
            Cost: {activeAbility.cost} Energy
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-snug">
          {activeAbility.description}
        </p>

        <p className="text-[10px] text-indigo-300/80 italic pt-0.5">
          "{activeAbility.effectLore}"
        </p>
      </div>

      {/* Ability Trigger Button */}
      <AbilityButton
        ability={activeAbility}
        playerEnergy={playerEnergy}
        isAvailable={isAvailable}
        disabledReason={disabledReason}
        isTargeting={isTargeting && targetingAbilityId === activeAbility.id}
        onActivate={() => onStartTargeting(activeAbility.id, selectedSquare, selectedPiece.symbol)}
        onCancel={onCancelTargeting}
      />
    </div>
  );
};
