/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Color } from 'chess.js';
import {
  Undo2,
  RotateCcw,
  Volume2,
  VolumeX,
  Flag,
  ArrowLeft,
  RefreshCw,
  Info,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../../engine/soundEffects';

interface GameControlsProps {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  turn: Color;
  isGameOver: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onToggleSound: () => void;
  onToggleAnimations: () => void;
  onFlipBoard: () => void;
  onResetGame: () => void;
  onResign: (color: Color) => void;
  onOpenMatchInfo: () => void;
  onReturnHome: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  soundEnabled,
  animationsEnabled,
  turn,
  isGameOver,
  canUndo,
  onUndo,
  onToggleSound,
  onToggleAnimations,
  onFlipBoard,
  onResetGame,
  onResign,
  onOpenMatchInfo,
  onReturnHome,
}) => {
  const [showResignModal, setShowResignModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {/* Primary Action Buttons Grid (4x2 on mobile/desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Undo Button (Local Multiplayer Feature) */}
        <button
          disabled={!canUndo || isGameOver}
          onClick={() => {
            sounds.playUndo();
            onUndo();
          }}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            canUndo && !isGameOver
              ? 'bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border-sky-600/50 shadow-sm'
              : 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
          }`}
          title={canUndo ? 'Undo last move (restores board, energy & abilities)' : 'No moves to undo'}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>

        {/* Flip Board */}
        <button
          onClick={onFlipBoard}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
          title="Flip board perspective"
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Flip</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute sound FX' : 'Enable sound FX'}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sound</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <span>Muted</span>
            </>
          )}
        </button>

        {/* Match Info Button */}
        <button
          onClick={onOpenMatchInfo}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
          title="Match statistics & telemetry"
        >
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Info</span>
        </button>
      </div>

      {/* Secondary Controls: Resign & Restart */}
      <div className="grid grid-cols-2 gap-2">
        {/* Resign Button */}
        <button
          disabled={isGameOver}
          onClick={() => setShowResignModal(true)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/60 hover:border-rose-700/60 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Surrender the match"
        >
          <Flag className="w-3.5 h-3.5 text-rose-400" />
          <span>Resign Match</span>
        </button>

        {/* Restart Match Button */}
        <button
          onClick={() => setShowResetModal(true)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
          title="Restart match from beginning"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Restart</span>
        </button>
      </div>

      {/* Return to Home Bar */}
      <button
        onClick={onReturnHome}
        className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-slate-950/60 hover:bg-indigo-950/50 text-slate-400 hover:text-indigo-200 border border-slate-800 text-xs font-medium transition-colors cursor-pointer mt-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Pokémon Chess Main Menu</span>
      </button>

      {/* Resign Confirmation Modal */}
      {showResignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-600/40 rounded-xl p-5 max-w-sm w-full shadow-2xl text-center">
            <h4 className="text-base font-bold text-rose-300 font-display mb-1">
              Concede the Match?
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {turn === 'w' ? 'White (Celestial Vanguard)' : 'Black (Abyssal Legion)'} will surrender victory to their opponent.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowResignModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResignModal(false);
                  onResign(turn);
                }}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg cursor-pointer"
              >
                Confirm Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-5 max-w-sm w-full shadow-2xl text-center">
            <h4 className="text-base font-bold text-amber-300 font-display mb-1">
              Restart Match?
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              This will restart the board, restore initial energy pools, reset the clock timer, and clear move history.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  onResetGame();
                }}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-lg cursor-pointer"
              >
                Restart Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
