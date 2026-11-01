/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Color } from 'chess.js';
import { PlayerEnergyState } from '../../types/game';
import { EnergyBar } from './EnergyBar';
import { Zap } from 'lucide-react';
import { REGEN_TURN_INTERVAL } from '../../engine/energyEngine';

interface EnergyCounterProps {
  energy: PlayerEnergyState;
  color: Color;
  label?: string;
}

export const EnergyCounter: React.FC<EnergyCounterProps> = ({
  energy,
  color,
  label,
}) => {
  const isWhite = color === 'w';
  const turnsToNextRegen =
    REGEN_TURN_INTERVAL - (energy.personalTurnsCompleted % REGEN_TURN_INTERVAL);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <div className="flex items-center gap-1.5 font-medium">
          <Zap
            className={`w-3.5 h-3.5 ${
              isWhite ? 'text-amber-400' : 'text-purple-400'
            }`}
          />
          <span className="text-slate-300">{label || 'Energy Reserve'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-sm text-white">
            {energy.current}
            <span className="text-slate-500 font-normal text-xs">/{energy.max}</span>
          </span>
        </div>
      </div>

      <EnergyBar current={energy.current} max={energy.max} color={color} />

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
        <span>Personal Turns: {energy.personalTurnsCompleted}</span>
        <span className="italic">
          {energy.current >= energy.max
            ? 'Energy Maxed'
            : `+1 in ${turnsToNextRegen} turn${turnsToNextRegen === 1 ? '' : 's'}`}
        </span>
      </div>
    </div>
  );
};
