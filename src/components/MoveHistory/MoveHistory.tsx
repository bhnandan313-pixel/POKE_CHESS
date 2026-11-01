/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { MoveRecord } from '../../types/game';
import { POKEMON_PIECES } from '../../engine/pokemonRoster';
import { History, ScrollText } from 'lucide-react';

interface MoveHistoryProps {
  moveHistory: MoveRecord[];
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moveHistory }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Group moves into pairs (White move, Black move)
  const movePairs = React.useMemo(() => {
    const pairs: { moveNumber: number; white?: MoveRecord; black?: MoveRecord }[] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      pairs.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: moveHistory[i],
        black: moveHistory[i + 1],
      });
    }
    return pairs;
  }, [moveHistory]);

  // Auto-scroll to latest move
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  return (
    <div className="flex flex-col h-48 sm:h-52 rounded-xl bg-slate-900/80 border border-indigo-900/40 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border-b border-indigo-900/40 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <History className="w-3.5 h-3.5 text-indigo-400" />
          <span>Move Notation</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {moveHistory.length} ply
        </span>
      </div>

      {/* Moves List */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
        {movePairs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs italic gap-1">
            <ScrollText className="w-5 h-5 opacity-40" />
            <span>Awaiting opening move...</span>
          </div>
        ) : (
          movePairs.map((pair) => (
            <div
              key={pair.moveNumber}
              className="grid grid-cols-12 gap-1 items-center py-1 px-1.5 rounded hover:bg-slate-800/40 transition-colors font-mono"
            >
              <span className="col-span-2 text-slate-500 text-[11px]">
                {pair.moveNumber}.
              </span>

              {/* White Move */}
              <span className="col-span-5 font-semibold text-amber-200 truncate flex items-center gap-1">
                {pair.white?.san}
                {pair.white?.captured && (
                  <span className="text-[9px] text-amber-400/80" title={`Captured ${POKEMON_PIECES[pair.white.captured].name}`}>
                    ×{POKEMON_PIECES[pair.white.captured].name.slice(0, 3)}
                  </span>
                )}
              </span>

              {/* Black Move */}
              <span className="col-span-5 font-semibold text-purple-300 truncate flex items-center gap-1">
                {pair.black?.san || ''}
                {pair.black?.captured && (
                  <span className="text-[9px] text-purple-400/80" title={`Captured ${POKEMON_PIECES[pair.black.captured].name}`}>
                    ×{POKEMON_PIECES[pair.black.captured].name.slice(0, 3)}
                  </span>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
