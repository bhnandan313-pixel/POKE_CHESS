/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Color } from 'chess.js';
import { MatchSettings, BoardTheme, GameMode, AiDifficulty } from '../../types/game';
import { TRAINER_AVATARS, getAvatar } from '../../engine/avatars';
import { BOARD_THEMES } from '../../engine/boardThemes';
import { sounds } from '../../engine/soundEffects';
import {
  Swords,
  Timer,
  Palette,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Check,
  RotateCcw,
  Shield,
  ArrowRight,
  X,
  Bot,
  Users,
  BrainCircuit,
} from 'lucide-react';

interface MatchSetupModalProps {
  initialSettings: MatchSettings;
  isOpen: boolean;
  onClose?: () => void;
  onStartBattle: (settings: MatchSettings) => void;
}

const TIMER_OPTIONS = [
  { value: 0, label: 'No Timer', sub: 'Casual duel' },
  { value: 5, label: '5 Min', sub: 'Fast Blitz' },
  { value: 10, label: '10 Min', sub: 'Rapid Battle' },
  { value: 15, label: '15 Min', sub: 'Standard' },
  { value: 30, label: '30 Min', sub: 'Classic Duel' },
];

const AI_DIFFICULTIES: {
  id: AiDifficulty;
  name: string;
  badge: string;
  avatarId: string;
  trainerName: string;
  description: string;
  colorClass: string;
}[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    badge: 'Novice AI',
    avatarId: 'blue',
    trainerName: 'Novice Blue',
    description: 'Casual chess tactics, occasional errors, relaxed Pokémon ability usage.',
    colorClass: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    badge: 'Tactical Master',
    avatarId: 'lance',
    trainerName: 'Champion Lance',
    description: 'Calculated positional chess, strategic ability deployment, and sound defenses.',
    colorClass: 'border-blue-500/50 bg-blue-950/30 text-blue-300',
  },
  {
    id: 'expert',
    name: 'Expert',
    badge: 'Grandmaster AI',
    avatarId: 'cynthia',
    trainerName: 'Champion Cynthia',
    description: 'Deep minimax search, sharp tactics, optimal Pokémon ability combos, and King safety.',
    colorClass: 'border-purple-500/50 bg-purple-950/30 text-purple-300',
  },
];

export const MatchSetupModal: React.FC<MatchSetupModalProps> = ({
  initialSettings,
  isOpen,
  onClose,
  onStartBattle,
}) => {
  const [mode, setMode] = useState<GameMode>(initialSettings.mode || 'local');
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>(initialSettings.aiDifficulty || 'intermediate');

  const [p1Name, setP1Name] = useState(initialSettings.player1.name || 'Trainer Red');
  const [p1Color, setP1Color] = useState<Color>(initialSettings.player1.color || 'w');
  const [p1AvatarId, setP1AvatarId] = useState(initialSettings.player1.avatarId || 'red');

  const [p2Name, setP2Name] = useState(initialSettings.player2.name || 'Trainer Blue');
  const [p2AvatarId, setP2AvatarId] = useState(initialSettings.player2.avatarId || 'blue');

  // P2 color is strictly opposite of P1
  const p2Color: Color = p1Color === 'w' ? 'b' : 'w';

  const [timerMinutes, setTimerMinutes] = useState<number>(initialSettings.timerMinutes);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(initialSettings.boardTheme);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialSettings.soundEnabled);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(initialSettings.animationsEnabled);

  if (!isOpen) return null;

  const handleDifficultySelect = (diff: AiDifficulty) => {
    sounds.playClick();
    setAiDifficulty(diff);
    const target = AI_DIFFICULTIES.find((d) => d.id === diff);
    if (target) {
      setP2Name(target.trainerName);
      setP2AvatarId(target.avatarId);
    }
  };

  const handleToggleSide = () => {
    sounds.playClick();
    setP1Color((prev) => (prev === 'w' ? 'b' : 'w'));
  };

  const handleStart = () => {
    sounds.playVictory();
    const finalSettings: MatchSettings = {
      mode,
      aiDifficulty: mode === 'ai' ? aiDifficulty : undefined,
      humanColor: mode === 'ai' ? p1Color : undefined,
      player1: {
        name: p1Name.trim() || 'Player 1',
        avatarId: p1AvatarId,
        color: p1Color,
      },
      player2: {
        name: mode === 'ai' ? (p2Name.trim() || 'AI Opponent') : (p2Name.trim() || 'Player 2'),
        avatarId: p2AvatarId,
        color: p2Color,
      },
      timerMinutes,
      boardTheme,
      soundEnabled,
      animationsEnabled,
    };
    onStartBattle(finalSettings);
  };

  const p1Avatar = getAvatar(p1AvatarId);
  const p2Avatar = getAvatar(p2AvatarId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', duration: 0.35 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-indigo-900/60 rounded-2xl shadow-2xl overflow-hidden my-6"
      >
        {/* Glow ambient header */}
        <div className="absolute top-0 left-1/4 w-1/2 h-24 bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-950/60 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center shadow-inner">
              {mode === 'ai' ? (
                <Bot className="w-5 h-5 text-amber-400" />
              ) : (
                <Swords className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display tracking-tight flex items-center gap-2">
                MATCH CONFIGURATION
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  mode === 'ai'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                }`}>
                  {mode === 'ai' ? 'Play vs AI Opponent' : 'Local Pass & Play'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'ai'
                  ? 'Select difficulty, choose allegiance, and battle algorithmic Pokémon strategists.'
                  : 'Configure both trainers, starting sides, match clock, and battlefield theme.'}
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-4 pb-1 bg-slate-950/40 border-b border-indigo-950/50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMode('local');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              mode === 'local'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Local Multiplayer (2 Players)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMode('ai');
              // Set default AI preset
              const target = AI_DIFFICULTIES.find((d) => d.id === aiDifficulty) || AI_DIFFICULTIES[1];
              setP2Name(target.trainerName);
              setP2AvatarId(target.avatarId);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              mode === 'ai'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Play Against AI Opponent</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* AI Difficulty Selector (Only in AI Mode) */}
          {mode === 'ai' && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-purple-400" />
                  Select AI Difficulty Level
                </span>
                <span className="text-[11px] text-slate-400">
                  Stockfish-powered tactical analysis
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AI_DIFFICULTIES.map((diff) => {
                  const isSelected = aiDifficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => handleDifficultySelect(diff.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? `${diff.colorClass} ring-2 ring-purple-400 shadow-lg`
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-purple-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{diff.name}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {diff.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {diff.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Players Setup (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* PLAYER 1 CARD (Human) */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                p1Color === 'w'
                  ? 'bg-gradient-to-b from-amber-950/30 via-slate-900/80 to-slate-950 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'bg-gradient-to-b from-purple-950/30 via-slate-900/80 to-slate-950 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {mode === 'ai' ? 'You (Human Trainer)' : 'Player 1 (Challenger)'}
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${
                    p1Color === 'w'
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                  }`}
                >
                  {p1Color === 'w' ? 'WHITE (Moves 1st)' : 'BLACK (Defending)'}
                </span>
              </div>

              {/* Name Input */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Trainer Name
                </label>
                <input
                  type="text"
                  value={p1Name}
                  maxLength={18}
                  onChange={(e) => setP1Name(e.target.value)}
                  placeholder="Enter Trainer Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-semibold text-white outline-none transition-all"
                />
              </div>

              {/* Selected Avatar Preview */}
              <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div
                  className="w-12 h-12 rounded-xl border flex items-center justify-center font-black text-lg text-white shadow-md shrink-0"
                  style={{
                    backgroundColor: `${p1Avatar.themeColor}25`,
                    borderColor: p1Avatar.themeColor,
                  }}
                >
                  {p1Avatar.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-tight">
                    {p1Avatar.name}
                  </div>
                  <div className="text-[11px] text-slate-400">{p1Avatar.title}</div>
                  <div className="text-[10px] text-amber-400/90 italic">"{p1Avatar.quote}"</div>
                </div>
              </div>

              {/* Avatar Selector Grid */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Select Your Avatar
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TRAINER_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setP1AvatarId(av.id);
                      }}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                        p1AvatarId === av.id
                          ? 'border-amber-400 bg-amber-500/20 ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60'
                      }`}
                    >
                      <div
                        className="w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-xs font-bold mb-1"
                        style={{
                          backgroundColor: `${av.themeColor}35`,
                          color: av.themeColor,
                        }}
                      >
                        {av.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-medium text-slate-300 block truncate">
                        {av.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PLAYER 2 CARD (Opponent / AI) */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                p2Color === 'w'
                  ? 'bg-gradient-to-b from-amber-950/30 via-slate-900/80 to-slate-950 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'bg-gradient-to-b from-purple-950/30 via-slate-900/80 to-slate-950 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${mode === 'ai' ? 'bg-purple-400' : 'bg-cyan-400'}`} />
                  {mode === 'ai' ? `AI Opponent (${aiDifficulty.toUpperCase()})` : 'Player 2 (Defender)'}
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${
                    p2Color === 'w'
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                  }`}
                >
                  {p2Color === 'w' ? 'WHITE (Moves 1st)' : 'BLACK (Defending)'}
                </span>
              </div>

              {/* Name Input */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {mode === 'ai' ? 'AI Persona Name' : 'Trainer Name'}
                </label>
                <input
                  type="text"
                  value={p2Name}
                  maxLength={18}
                  onChange={(e) => setP2Name(e.target.value)}
                  placeholder="Enter Opponent Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-sm font-semibold text-white outline-none transition-all"
                />
              </div>

              {/* Selected Avatar Preview */}
              <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div
                  className="w-12 h-12 rounded-xl border flex items-center justify-center font-black text-lg text-white shadow-md shrink-0"
                  style={{
                    backgroundColor: `${p2Avatar.themeColor}25`,
                    borderColor: p2Avatar.themeColor,
                  }}
                >
                  {p2Avatar.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-tight flex items-center gap-2">
                    <span>{p2Avatar.name}</span>
                    {mode === 'ai' && (
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 font-mono">
                        AI BOT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{p2Avatar.title}</div>
                  <div className="text-[10px] text-purple-400/90 italic">"{p2Avatar.quote}"</div>
                </div>
              </div>

              {/* Avatar Selector Grid */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  {mode === 'ai' ? 'Change AI Avatar Persona' : 'Select Avatar'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TRAINER_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setP2AvatarId(av.id);
                      }}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                        p2AvatarId === av.id
                          ? 'border-purple-400 bg-purple-500/20 ring-1 ring-purple-400'
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60'
                      }`}
                    >
                      <div
                        className="w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-xs font-bold mb-1"
                        style={{
                          backgroundColor: `${av.themeColor}35`,
                          color: av.themeColor,
                        }}
                      >
                        {av.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-medium text-slate-300 block truncate">
                        {av.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side Switch Button */}
          <div className="flex justify-center -my-2">
            <button
              type="button"
              onClick={handleToggleSide}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:border-amber-400"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {mode === 'ai'
                  ? p1Color === 'w'
                    ? 'Switch to Play as Black (AI Moves 1st)'
                    : 'Switch to Play as White (You Move 1st)'
                  : 'Swap Sides (White ↔ Black)'}
              </span>
            </button>
          </div>

          {/* Section: Match Settings */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-indigo-950/80 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-400" />
              <span>Match Timer Preset</span>
            </h3>

            {/* Timer Options */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setTimerMinutes(opt.value);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    timerMinutes === opt.value
                      ? 'border-amber-400 bg-amber-500/20 text-white shadow-md ring-1 ring-amber-400'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm text-white">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>

            {/* Board Themes */}
            <div className="pt-4 border-t border-indigo-950/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>Battlefield Theme</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.values(BOARD_THEMES).map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setBoardTheme(th.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      boardTheme === th.id
                        ? 'border-amber-400 bg-amber-500/15 shadow-md ring-1 ring-amber-400'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-sm border border-slate-700"
                        style={{ backgroundColor: th.previewColors[0] }}
                      />
                      <div
                        className="w-4 h-4 rounded-sm border border-slate-700"
                        style={{ backgroundColor: th.previewColors[1] }}
                      />
                    </div>
                    <div className="text-xs font-bold text-white">{th.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {th.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio & Animations Toggles */}
            <div className="pt-4 border-t border-indigo-950/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => {
                      sounds.playClick();
                      setSoundEnabled(e.target.checked);
                    }}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                  <span>Sound Effects</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={animationsEnabled}
                    onChange={(e) => {
                      sounds.playClick();
                      setAnimationsEnabled(e.target.checked);
                    }}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                  <span>Move & Ability Animations</span>
                </label>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {mode === 'ai' ? `Engine: Stockfish + Pokémon AI (${aiDifficulty})` : 'Mode: Local Pass & Play'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-indigo-950/60 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 hidden sm:block">
            {mode === 'ai'
              ? `You are playing ${p1Color === 'w' ? 'White (First Move)' : 'Black'} against ${p2Name}`
              : `Match ready: ${p1Name} (White) vs ${p2Name} (Black)`}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={handleStart}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 hover:brightness-110 shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>START BATTLE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
