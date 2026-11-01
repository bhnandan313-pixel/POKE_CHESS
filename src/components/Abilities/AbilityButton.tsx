/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Zap, AlertCircle, Sparkles } from 'lucide-react';
import { AbilityData } from '../../types/game';

interface AbilityButtonProps {
  ability: AbilityData;
  playerEnergy: number;
  isAvailable: boolean;
  disabledReason?: string;
  isTargeting: boolean;
  onActivate: () => void;
  onCancel: () => void;
}

export const AbilityButton: React.FC<AbilityButtonProps> = ({
  ability,
  playerEnergy,
  isAvailable,
  disabledReason,
  isTargeting,
  onActivate,
  onCancel,
}) => {
  const hasEnoughEnergy = playerEnergy >= ability.cost;
  const canActivate = isAvailable && hasEnoughEnergy;

  if (isTargeting) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-400/50 text-amber-200 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Targeting {ability.name}...
          </span>
          <button
            onClick={onCancel}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <motion.button
        whileHover={canActivate ? { scale: 1.02 } : {}}
        whileTap={canActivate ? { scale: 0.98 } : {}}
        disabled={!canActivate}
        onClick={onActivate}
        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
          canActivate
            ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
            : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Zap className={`w-3.5 h-3.5 ${canActivate ? 'text-slate-950' : 'text-slate-600'}`} />
          <span>Activate {ability.name}</span>
        </span>

        <span
          className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
            canActivate
              ? 'bg-slate-950/20 text-slate-950 font-extrabold'
              : 'bg-slate-900 text-slate-500'
          }`}
        >
          {ability.cost} Energy
        </span>
      </motion.button>

      {/* Disabled Explanation if not usable */}
      {!canActivate && disabledReason && (
        <div className="flex items-center gap-1 text-[11px] text-slate-400 px-1">
          <AlertCircle className="w-3 h-3 text-amber-400/80 shrink-0" />
          <span>{disabledReason}</span>
        </div>
      )}
    </div>
  );
};
