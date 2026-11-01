/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { POKEMON_PIECES, HERO_BATTLE_IMAGE } from '../engine/pokemonRoster';
import { PokemonPiece } from '../components/PokemonPieces/PokemonPiece';
import {
  Users,
  Bot,
  Globe,
  Sparkles,
  BookOpen,
  HelpCircle,
  Settings,
  ChevronRight,
  Shield,
  Zap,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { PieceSymbol } from 'chess.js';
import { sounds } from '../engine/soundEffects';

interface HomeProps {
  onStartGame: (initialMode?: 'local' | 'ai') => void;
}

export const Home: React.FC<HomeProps> = ({ onStartGame }) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'HOW_TO_PLAY' | 'COLLECTION' | 'SETTINGS'>('NONE');
  const [selectedPiecePreview, setSelectedPiecePreview] = useState<PieceSymbol>('k');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playClick();
  };

  const handleNavClick = (modal: 'HOW_TO_PLAY' | 'COLLECTION' | 'SETTINGS') => {
    sounds.playClick();
    setActiveModal(modal);
  };

  const closeModal = () => {
    sounds.playClick();
    setActiveModal('NONE');
  };

  const handleStartPlay = (mode: 'local' | 'ai' = 'local') => {
    sounds.playMove();
    onStartGame(mode);
  };

  const activePieceData = POKEMON_PIECES[selectedPiecePreview];

  return (
    <div className="min-h-screen bg-[#080B16] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/15 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-900/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-amber-900/10 blur-[130px]" />
      </div>

      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 lg:px-12 py-4 border-b border-indigo-950/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single Wordmark Brand */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0 font-display flex items-center gap-2.5"
        >
          <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
          Pokémon Chess
        </a>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a
            href="#home"
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Home
          </a>
          <button
            onClick={() => handleNavClick('HOW_TO_PLAY')}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How to Play
          </button>
          <button
            onClick={() => handleNavClick('COLLECTION')}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pokémon Collection
          </button>
          <button
            onClick={() => handleNavClick('SETTINGS')}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleStartPlay('local')}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Play Now
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative px-6 lg:px-12 pt-12 pb-16 max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Phase 5 · AI Opponent & Pokémon Ability Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-display leading-[1.08] text-balance">
              POKÉMON <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-purple-400 bg-clip-text text-transparent">CHESS</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Where Strategy Meets the Pokémon World. Classical FIDE chess engine augmented with tactical Pokémon abilities, energy reserves, and the cinematic Wimpod → Golisopod → Titan evolution system!
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleStartPlay('local')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>PLAY NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleNavClick('COLLECTION')}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-indigo-900/60 hover:border-indigo-600 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>EXPLORE POKÉMON</span>
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-10 pt-6 border-t border-indigo-950/80 flex items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>chess.js Validation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>En Passant & Castling</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pawn Promotion</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Slot: Cosmic Battlefield clash */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.25)] bg-slate-950 group"
            >
              <img
                src={HERO_BATTLE_IMAGE}
                alt="Pokémon Chess Legendary Battlefield"
                referrerPolicy="no-referrer"
                className="w-full h-auto aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200 pointer-events-none">
                <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-indigo-900/60">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-semibold">Celestial Vanguard (Arceus)</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-900/60">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="font-semibold">Abyssal Legion (Mewtwo)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Game Mode Selection Section */}
      <section className="px-6 lg:px-12 py-12 max-w-[1440px] mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Select Game Mode
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Choose your preferred arena. Local multiplayer is fully operational in Phase 1.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Local Multiplayer (FUNCTIONAL) */}
          <div
            onClick={() => handleStartPlay('local')}
            className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-indigo-950/60 border border-amber-500/40 hover:border-amber-400 shadow-lg hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] transition-all cursor-pointer group relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Play
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors font-display">
                Local Multiplayer
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Pass & play on the same device. White and Black take alternating turns with complete FIDE move legality, check warnings, and instant game-over detection.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-900/50 flex items-center justify-between text-xs font-semibold text-amber-300">
              <span>Start Local Match</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Play Against AI (FUNCTIONAL) */}
          <div
            onClick={() => handleStartPlay('ai')}
            className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-purple-950/60 border border-purple-500/40 hover:border-purple-400 shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all cursor-pointer group relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Play
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors font-display">
                Play Against AI
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Battle algorithmic Pokémon chess engines across 3 difficulty tiers (Beginner, Intermediate, Expert) powered by Stockfish search and custom ability evaluation.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-900/50 flex items-center justify-between text-xs font-semibold text-purple-300">
              <span>Challenge AI Opponent</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Online Multiplayer (Coming Soon) */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative flex flex-col justify-between opacity-85">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Coming Soon · Phase 3
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-200 font-display">
                Online Multiplayer
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Challenge trainers from around the globe via real-time rooms, spectator lobbies, and competitive Elo ladder ratings.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Under Development</span>
              <span className="text-[10px]">Phase 3</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pokémon Roster Showcase Section */}
      <section id="collection" className="px-6 lg:px-12 py-12 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              The Pokémon Chess Roster
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Every traditional chess role maps to an iconic Pokémon titan. Click any piece to inspect details.
            </p>
          </div>

          {/* Piece selection tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-indigo-900/50 overflow-x-auto">
            {(['k', 'q', 'r', 'b', 'n', 'p'] as PieceSymbol[]).map((symbol) => {
              const p = POKEMON_PIECES[symbol];
              const isSelected = selectedPiecePreview === symbol;
              return (
                <button
                  key={symbol}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedPiecePreview(symbol);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.name} ({p.chessPiece})
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Pokémon Spotlight Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90 border border-indigo-800/50 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Art View */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-indigo-500/40 bg-slate-950 shadow-inner flex items-center justify-center p-2">
              {activePieceData.imageUrl ? (
                <img
                  src={activePieceData.imageUrl}
                  alt={activePieceData.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-32 h-32">
                  <PokemonPiece symbol={selectedPiecePreview} color="w" size="responsive" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span>White Variant:</span>
                <div className="w-6 h-6">
                  <PokemonPiece symbol={selectedPiecePreview} color="w" size="responsive" />
                </div>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span>Black Variant:</span>
                <div className="w-6 h-6">
                  <PokemonPiece symbol={selectedPiecePreview} color="b" size="responsive" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Details View */}
          <div className="md:col-span-8 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                Chess {activePieceData.chessPiece}
              </span>
              <div className="flex items-center gap-1">
                {activePieceData.type.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {t} Type
                  </span>
                ))}
              </div>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              {activePieceData.name}
            </h3>

            <p className="text-sm text-indigo-300 font-medium italic mt-1">
              "{activePieceData.role}"
            </p>

            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              {activePieceData.description}
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-4 border-t border-indigo-900/60">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Signature Move</span>
                </div>
                <div className="text-xs text-slate-200">
                  {activePieceData.signatureMove}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-1">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Chess Strategy</span>
                </div>
                <div className="text-xs text-slate-300 leading-tight">
                  {activePieceData.tacticalNote}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-indigo-950/60 bg-slate-950 py-8 px-6 lg:px-12 text-center text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold text-slate-300">Pokémon Chess · Phase 4 Local Multiplayer</span>
          </div>
          <div>
            Chess engine powered by <span className="font-mono text-slate-400">chess.js</span>. Built with React & TypeScript.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => handleNavClick('HOW_TO_PLAY')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Rules
            </button>
            <button
              onClick={() => handleNavClick('SETTINGS')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sound Settings
            </button>
          </div>
        </div>
      </footer>

      {/* How to Play Modal */}
      {activeModal === 'HOW_TO_PLAY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-indigo-800/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-900/60">
              <div className="flex items-center gap-2 text-white font-bold font-display text-lg">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>How to Play Pokémon Chess</span>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-300 leading-relaxed">
              {/* Energy System Explanation */}
              <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-700/60">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 text-sm mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>The Energy System</span>
                </div>
                <p className="text-slate-300 mb-1">
                  Each player commands an independent energy pool starting at <strong>5 Energy</strong> (capped at 10 max).
                </p>
                <p className="text-slate-400">
                  <strong>Regeneration:</strong> Gain <strong>+1 Energy</strong> every 3 personal turns. Energy is required to trigger tactical Pokémon abilities.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-0.5">
                    <strong className="text-amber-300">King · Arceus</strong>
                    <span className="text-[10px] font-mono text-amber-400">Divine Protection · 4 Energy</span>
                  </div>
                  <span className="text-slate-400 block text-[11px]">
                    Once per match. When facing capture, safely warps Arceus to an adjacent empty square not under attack.
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-0.5">
                    <strong className="text-purple-300">Queen · Mewtwo</strong>
                    <span className="text-[10px] font-mono text-purple-400">Psychic Control · 3 Energy</span>
                  </div>
                  <span className="text-slate-400 block text-[11px]">
                    Compels an adjacent enemy piece (non-King) to move 1 square to an empty space without breaking King safety.
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-0.5">
                    <strong className="text-slate-200">Rook · Aggron</strong>
                    <span className="text-[10px] font-mono text-slate-300">Iron Wall · 2 Energy</span>
                  </div>
                  <span className="text-slate-400 block text-[11px]">
                    Grants an adjacent ally a metallic barrier protecting it from the next enemy ability.
                    <br />
                    <em className="text-slate-300">Passive (Sturdy Carapace):</em> Enemy pawns cannot directly capture Aggron.
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-0.5">
                    <strong className="text-pink-300">Bishop · Alakazam</strong>
                    <span className="text-[10px] font-mono text-pink-400">Psychic Shield · 2 Energy</span>
                  </div>
                  <span className="text-slate-400 block text-[11px]">
                    Grants any friendly piece a telepathic shield protecting it from the next enemy special ability.
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-0.5">
                    <strong className="text-orange-300">Knight · Rapidash</strong>
                    <span className="text-[10px] font-mono text-orange-400">Flame Dash · 2 Energy</span>
                  </div>
                  <span className="text-slate-400 block text-[11px]">
                    After making a legal Knight leap, dash 1 additional orthogonal square into an empty space in a single blazing turn.
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-0.5">
                    <strong className="text-cyan-300">Pawn · Wimpod</strong>
                    <span className="text-[10px] font-mono text-cyan-400">Swarm Protection · 1 Energy</span>
                  </div>
                  <span className="text-slate-400 block text-[11px]">
                    Summons a chitin shield on a friendly Wimpod, absorbing the next enemy capture attempt.
                  </span>
                </div>
              </div>

              <div className="pt-2 text-slate-400">
                <p>
                  <strong>Core Invariants:</strong> Standard FIDE chess rules apply for check, checkmate, castling, and en passant. King safety is always strictly preserved.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pokémon Collection Modal */}
      {activeModal === 'COLLECTION' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-indigo-800/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-900/60">
              <div className="flex items-center gap-2 text-white font-bold font-display text-lg">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Pokémon Chess Piece Collection</span>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {(Object.keys(POKEMON_PIECES) as PieceSymbol[]).map((symbol) => {
                const p = POKEMON_PIECES[symbol];
                return (
                  <div
                    key={symbol}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-indigo-900/50 flex gap-3 items-center"
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-indigo-800/60 flex items-center justify-center shrink-0">
                      <PokemonPiece symbol={symbol} color="w" size="responsive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{p.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300">
                          {p.chessPiece}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-300 mt-0.5">
                        {p.signatureMove}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {p.role}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer"
              >
                Close Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'SETTINGS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-indigo-800/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-900/60">
              <div className="flex items-center gap-2 text-white font-bold font-display text-lg">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>Game Settings</span>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Sound FX Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Sound Effects
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Synthesized chess piece movements and attacks
                    </span>
                  </div>
                </div>

                <button
                  onClick={toggleSound}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>

              {/* Engine Info */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
                <div className="font-semibold text-slate-200 mb-1">Engine Configuration</div>
                <div>FIDE Chess Rule Validation: Strict</div>
                <div>Move Execution: Synchronous</div>
                <div>Platform: Web SPA (Phase 1)</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
