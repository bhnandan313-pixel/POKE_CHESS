/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Color } from 'chess.js';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface EnergyBarProps {
  current: number;
  max: number;
  color: Color;
  compact?: boolean;
}

export const EnergyBar: React.FC<EnergyBarProps> = ({
  current,
  max = 10,
  color,
  compact = false,
}) => {
  const isWhite = color === 'w';
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  const segmentActiveColor = isWhite
    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
    : 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]';

  const barSegments = Array.from({ length: max }, (_, i) => i < current);

  if (compact) {
    return (
      <div className="w-full">
        <div className="h-1.5 w-full bg-slate-950/80 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            className={`h-full ${isWhite ? 'bg-amber-400' : 'bg-purple-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1.5">
      {/* 10 Segmented Energy Cells */}
      <div className="grid grid-cols-10 gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
        {barSegments.map((filled, idx) => (
          <div
            key={idx}
            className={`h-3 rounded-sm transition-all duration-300 ${
              filled ? segmentActiveColor : 'bg-slate-900/60 border border-slate-800/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
