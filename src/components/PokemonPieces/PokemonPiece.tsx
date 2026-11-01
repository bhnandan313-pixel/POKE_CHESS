/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { PieceSymbol, Color } from 'chess.js';

interface PokemonPieceProps {
  symbol: PieceSymbol;
  color: Color;
  isSelected?: boolean;
  isTarget?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
}

export const PokemonPiece: React.FC<PokemonPieceProps> = ({
  symbol,
  color,
  isSelected = false,
  isTarget = false,
  size = 'responsive',
}) => {
  const isWhite = color === 'w';

  // Side styling
  const sideTheme = isWhite
    ? {
        ring: 'border-amber-300/80',
        glow: 'shadow-[0_0_15px_rgba(251,191,36,0.35)]',
        baseGradient: 'from-amber-100 via-white to-slate-200',
        strokeColor: '#D97706',
        accentColor: '#F59E0B',
        fillHighlight: '#FEF3C7',
        badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
        subtleGaze: 'bg-gradient-to-t from-amber-500/10 to-transparent',
      }
    : {
        ring: 'border-purple-400/80',
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.45)]',
        baseGradient: 'from-purple-950 via-slate-900 to-indigo-950',
        strokeColor: '#C084FC',
        accentColor: '#A855F7',
        fillHighlight: '#581C87',
        badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
        subtleGaze: 'bg-gradient-to-t from-purple-500/20 to-transparent',
      };

  // Dimensions
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-16 h-16 text-sm',
    responsive: 'w-full h-full p-1 sm:p-1.5',
  }[size];

  // Render Pokémon Art SVGs
  const renderSvg = () => {
    switch (symbol) {
      // KING: ARCEUS (Cosmic Wheel, Divine Crown, Golden Halo)
      case 'k':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
            <defs>
              <radialGradient id={`arceusGlow-${color}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={isWhite ? '#FDE68A' : '#A855F7'} stopOpacity="0.8" />
                <stop offset="100%" stopColor={isWhite ? '#B45309' : '#3B0764'} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Arceus Cosmic Wheel Ring behind King */}
            <circle cx="50" cy="46" r="34" fill="none" stroke={sideTheme.strokeColor} strokeWidth="3" opacity="0.6" strokeDasharray="6 3" />
            <circle cx="50" cy="46" r="28" fill="none" stroke={sideTheme.accentColor} strokeWidth="1.5" opacity="0.4" />
            {/* 4 Golden Wheel Cross Spokes */}
            <line x1="50" y1="12" x2="50" y2="80" stroke={sideTheme.strokeColor} strokeWidth="2.5" opacity="0.5" />
            <line x1="16" y1="46" x2="84" y2="46" stroke={sideTheme.strokeColor} strokeWidth="2.5" opacity="0.5" />
            {/* Wheel jewels */}
            <circle cx="50" cy="14" r="3.5" fill={isWhite ? '#F59E0B' : '#C084FC'} />
            <circle cx="50" cy="78" r="3.5" fill={isWhite ? '#F59E0B' : '#C084FC'} />
            <circle cx="18" cy="46" r="3.5" fill={isWhite ? '#F59E0B' : '#C084FC'} />
            <circle cx="82" cy="46" r="3.5" fill={isWhite ? '#F59E0B' : '#C084FC'} />

            {/* Arceus King Pedestal */}
            <path d="M22 84 L78 84 L72 92 L28 92 Z" fill={isWhite ? '#F1F5F9' : '#1E1B4B'} stroke={sideTheme.strokeColor} strokeWidth="2" />
            <rect x="30" y="80" width="40" height="4" rx="2" fill={sideTheme.accentColor} />

            {/* Arceus Body and Royal Chest Flange */}
            <path
              d="M36 80 C36 65, 42 55, 46 45 C40 40, 36 28, 44 18 C48 12, 52 12, 56 18 C64 28, 60 40, 54 45 C58 55, 64 65, 64 80 Z"
              fill={isWhite ? '#FFFFFF' : '#2E1065'}
              stroke={sideTheme.strokeColor}
              strokeWidth="2.5"
            />

            {/* Arceus Facial Crest & Golden Crown */}
            <path
              d="M44 26 C47 22, 53 22, 56 26 L50 35 Z"
              fill={isWhite ? '#FBBF24' : '#9333EA'}
              stroke={sideTheme.strokeColor}
              strokeWidth="1.5"
            />
            {/* Eyes */}
            <ellipse cx="47" cy="27" rx="1.5" ry="2.5" fill={isWhite ? '#DC2626' : '#22D3EE'} />
            <ellipse cx="53" cy="27" rx="1.5" ry="2.5" fill={isWhite ? '#DC2626' : '#22D3EE'} />

            {/* King Cross Crown Top */}
            <path d="M47 8 L53 8 L53 14 L47 14 Z" fill={sideTheme.accentColor} />
            <path d="M44 10 L56 10 L56 12 L44 12 Z" fill={sideTheme.accentColor} />
          </svg>
        );

      // QUEEN: MEWTWO (Psychic Horns, Telekinetic Orbs, Long Curved Crown Crest)
      case 'q':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
            {/* Telekinetic Aura Vortex */}
            <ellipse cx="50" cy="50" rx="38" ry="38" fill="none" stroke={isWhite ? '#FBBF24' : '#A855F7'} strokeWidth="1.5" opacity="0.3" strokeDasharray="4 4" />
            <circle cx="50" cy="28" r="4" fill={isWhite ? '#F59E0B' : '#C084FC'} opacity="0.7" />

            {/* Mewtwo Queen Base */}
            <path d="M26 84 L74 84 L70 92 L30 92 Z" fill={isWhite ? '#F8FAFC' : '#1E1B4B'} stroke={sideTheme.strokeColor} strokeWidth="2" />
            <rect x="32" y="80" width="36" height="4" rx="2" fill={sideTheme.accentColor} />

            {/* Mewtwo Sleek Neck and Torso */}
            <path
              d="M38 80 C36 68, 42 56, 45 46 C41 42, 38 34, 42 24 C44 20, 48 18, 50 18 C52 18, 56 20, 58 24 C62 34, 59 42, 55 46 C58 56, 64 68, 62 80 Z"
              fill={isWhite ? '#FFFFFF' : '#3B0764'}
              stroke={sideTheme.strokeColor}
              strokeWidth="2.5"
            />

            {/* Mewtwo Iconic Twin Psychic Horns & Crown Peaks */}
            <path d="M42 22 L36 10 L44 18 Z" fill={isWhite ? '#FDE68A' : '#7E22CE'} stroke={sideTheme.strokeColor} strokeWidth="1.5" />
            <path d="M58 22 L64 10 L56 18 Z" fill={isWhite ? '#FDE68A' : '#7E22CE'} stroke={sideTheme.strokeColor} strokeWidth="1.5" />
            <path d="M48 18 L50 9 L52 18 Z" fill={sideTheme.accentColor} stroke={sideTheme.strokeColor} strokeWidth="1.5" />

            {/* Mewtwo Stern Eyes */}
            <path d="M44 28 L48 29 L46 31 Z" fill={isWhite ? '#B91C1C' : '#E879F9'} />
            <path d="M56 28 L52 29 L54 31 Z" fill={isWhite ? '#B91C1C' : '#E879F9'} />

            {/* Psychic Tube behind head */}
            <path d="M48 35 C42 42, 42 52, 49 56" fill="none" stroke={sideTheme.strokeColor} strokeWidth="2.5" strokeLinecap="round" />

            {/* Queen Crown Beads */}
            <circle cx="36" cy="9" r="2.5" fill={sideTheme.accentColor} />
            <circle cx="50" cy="8" r="3" fill={sideTheme.accentColor} />
            <circle cx="64" cy="9" r="2.5" fill={sideTheme.accentColor} />
          </svg>
        );

      // ROOK: AGGRON (Steel Fortress, Battlements, Horned Armor Plates)
      case 'r':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
            {/* Fortress Battlements Base */}
            <path d="M22 84 L78 84 L74 92 L26 92 Z" fill={isWhite ? '#F1F5F9' : '#1E293B'} stroke={sideTheme.strokeColor} strokeWidth="2" />
            <rect x="26" y="78" width="48" height="6" fill={sideTheme.accentColor} rx="1" />

            {/* Sturdy Armor Torso */}
            <path
              d="M30 78 L34 38 L66 38 L70 78 Z"
              fill={isWhite ? '#FFFFFF' : '#0F172A'}
              stroke={sideTheme.strokeColor}
              strokeWidth="2.5"
            />

            {/* Heavy Armor Bands */}
            <path d="M33 58 L67 58" stroke={sideTheme.strokeColor} strokeWidth="2" strokeDasharray="4 3" />
            <path d="M31 68 L69 68" stroke={sideTheme.strokeColor} strokeWidth="2" />

            {/* Castle Rampart Crenels (Rook Turret + Aggron Crest) */}
            <path
              d="M26 38 L26 22 L36 22 L36 28 L46 28 L46 22 L54 22 L54 28 L64 28 L64 22 L74 22 L74 38 Z"
              fill={isWhite ? '#E2E8F0' : '#1E293B'}
              stroke={sideTheme.strokeColor}
              strokeWidth="2"
            />

            {/* Aggron Steel Curved Horns */}
            <path d="M26 26 C16 18, 14 8, 24 12 C28 14, 29 20, 30 26 Z" fill={isWhite ? '#CBD5E1' : '#475569'} stroke={sideTheme.strokeColor} strokeWidth="1.5" />
            <path d="M74 26 C84 18, 86 8, 76 12 C72 14, 71 20, 70 26 Z" fill={isWhite ? '#CBD5E1' : '#475569'} stroke={sideTheme.strokeColor} strokeWidth="1.5" />

            {/* Aggron Glowing Visor Slit */}
            <ellipse cx="50" cy="46" rx="9" ry="3.5" fill={isWhite ? '#EF4444' : '#38BDF8'} />
            <circle cx="50" cy="46" r="1.5" fill="#FFFFFF" />
          </svg>
        );

      // BISHOP: ALAKAZAM (Twin Mystic Spoons, Miter Crown, Telepathic Mustache Whiskers)
      case 'b':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
            {/* Mystic aura */}
            <circle cx="50" cy="46" r="30" fill="none" stroke={isWhite ? '#F59E0B' : '#C084FC'} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

            {/* Bishop Pedestal */}
            <path d="M28 84 L72 84 L68 92 L32 92 Z" fill={isWhite ? '#F8FAFC' : '#1E1B4B'} stroke={sideTheme.strokeColor} strokeWidth="2" />
            <circle cx="50" cy="80" r="4" fill={sideTheme.accentColor} />

            {/* Bishop Miter Body / Alakazam Robes */}
            <path
              d="M34 80 C34 62, 38 46, 42 36 C42 22, 50 14, 50 14 C50 14, 58 22, 58 36 C62 46, 66 62, 66 80 Z"
              fill={isWhite ? '#FFFFFF' : '#3B0764'}
              stroke={sideTheme.strokeColor}
              strokeWidth="2.5"
            />

            {/* Bishop Miter Cross Slit */}
            <path d="M50 20 L50 36 M44 26 L56 26" stroke={sideTheme.strokeColor} strokeWidth="2" />

            {/* Alakazam Spiky Ears */}
            <path d="M42 32 L28 24 L38 38 Z" fill={isWhite ? '#FDE68A' : '#6B21A8'} stroke={sideTheme.strokeColor} strokeWidth="1.5" />
            <path d="M58 32 L72 24 L62 38 Z" fill={isWhite ? '#FDE68A' : '#6B21A8'} stroke={sideTheme.strokeColor} strokeWidth="1.5" />

            {/* Alakazam Signature Long Whiskers */}
            <path d="M44 48 C36 54, 26 56, 20 64" fill="none" stroke={sideTheme.accentColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M56 48 C64 54, 74 56, 80 64" fill="none" stroke={sideTheme.accentColor} strokeWidth="2.5" strokeLinecap="round" />

            {/* Iconic Bent Spoons (Left & Right) */}
            <g transform="translate(18, 38) rotate(-25)">
              <ellipse cx="6" cy="4" rx="4.5" ry="6.5" fill={isWhite ? '#E2E8F0' : '#A855F7'} stroke={sideTheme.strokeColor} strokeWidth="1.2" />
              <line x1="6" y1="10" x2="6" y2="30" stroke={sideTheme.strokeColor} strokeWidth="2" />
            </g>
            <g transform="translate(76, 38) rotate(25)">
              <ellipse cx="6" cy="4" rx="4.5" ry="6.5" fill={isWhite ? '#E2E8F0' : '#A855F7'} stroke={sideTheme.strokeColor} strokeWidth="1.2" />
              <line x1="6" y1="10" x2="6" y2="30" stroke={sideTheme.strokeColor} strokeWidth="2" />
            </g>

            {/* Bishop Top Finial Ball */}
            <circle cx="50" cy="13" r="3.5" fill={sideTheme.accentColor} />
          </svg>
        );

      // KNIGHT: RAPIDASH (Equine Head, Flaming Mane, Horn)
      case 'n':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
            {/* Knight Base */}
            <path d="M26 84 L74 84 L70 92 L30 92 Z" fill={isWhite ? '#F8FAFC' : '#1E1B4B'} stroke={sideTheme.strokeColor} strokeWidth="2" />
            <rect x="32" y="80" width="36" height="4" rx="2" fill={sideTheme.accentColor} />

            {/* Rapidash Galloping Stallion Head & Neck */}
            <path
              d="M32 80 C32 66, 36 50, 42 42 C40 38, 34 36, 28 40 C24 38, 24 32, 30 28 C38 22, 50 20, 58 26 C64 30, 68 40, 68 80 Z"
              fill={isWhite ? '#FFFFFF' : '#312E81'}
              stroke={sideTheme.strokeColor}
              strokeWidth="2.5"
            />

            {/* Rapidash Blazing Mane of Flames */}
            <path
              d="M58 26 C66 18, 76 16, 78 24 C82 30, 74 36, 80 44 C84 50, 78 58, 80 66 C74 68, 70 74, 68 80"
              fill={isWhite ? '#F97316' : '#C026D3'}
              stroke={sideTheme.strokeColor}
              strokeWidth="1.8"
            />
            {/* Inner Flame Glow */}
            <path
              d="M62 30 C68 24, 73 24, 74 30 C76 36, 71 42, 74 48 C76 54, 72 60, 70 66"
              fill="none"
              stroke={isWhite ? '#FDE047' : '#F472B6'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Rapidash Unicorn Horn */}
            <path d="M46 22 L52 8 L54 22 Z" fill={isWhite ? '#FBBF24' : '#E879F9'} stroke={sideTheme.strokeColor} strokeWidth="1.5" />

            {/* Steed Eye & Bridle Line */}
            <ellipse cx="40" cy="32" rx="2" ry="3" fill={isWhite ? '#DC2626' : '#38BDF8'} />
            <path d="M30 40 L44 38" stroke={sideTheme.strokeColor} strokeWidth="1.5" />
          </svg>
        );

      // PAWN: WIMPOD (Carapace Plates, Antennae, Chitin Shell)
      case 'p':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
            {/* Pawn Base */}
            <path d="M30 84 L70 84 L66 92 L34 92 Z" fill={isWhite ? '#F8FAFC' : '#1E1B4B'} stroke={sideTheme.strokeColor} strokeWidth="2" />
            <rect x="34" y="80" width="32" height="4" rx="2" fill={sideTheme.accentColor} />

            {/* Pawn Bell Collar */}
            <path
              d="M36 80 C36 68, 42 60, 44 52 L56 52 C58 60, 64 68, 64 80 Z"
              fill={isWhite ? '#FFFFFF' : '#1E293B'}
              stroke={sideTheme.strokeColor}
              strokeWidth="2"
            />

            {/* Wimpod Segmented Carapace / Shell Plating */}
            <ellipse cx="50" cy="40" rx="18" ry="16" fill={isWhite ? '#E0F2FE' : '#334155'} stroke={sideTheme.strokeColor} strokeWidth="2.5" />
            <path d="M34 38 C42 42, 58 42, 66 38" stroke={sideTheme.strokeColor} strokeWidth="1.8" />
            <path d="M38 46 C44 50, 56 50, 62 46" stroke={sideTheme.strokeColor} strokeWidth="1.8" />

            {/* Wimpod Antennae Feelers */}
            <path d="M44 26 C40 18, 32 14, 26 12" fill="none" stroke={sideTheme.accentColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M56 26 C60 18, 68 14, 74 12" fill="none" stroke={sideTheme.accentColor} strokeWidth="2.5" strokeLinecap="round" />

            {/* Pawn Top Crest Ball */}
            <circle cx="50" cy="24" r="8" fill={isWhite ? '#BAE6FD' : '#475569'} stroke={sideTheme.strokeColor} strokeWidth="2" />

            {/* Wimpod Eyes */}
            <circle cx="47" cy="24" r="1.5" fill={isWhite ? '#0284C7' : '#F43F5E'} />
            <circle cx="53" cy="24" r="1.5" fill={isWhite ? '#0284C7' : '#F43F5E'} />
          </svg>
        );

      default:
        return null;
    }
  };

  // Pokémon name mapping for accessible title
  const pokemonNames: Record<PieceSymbol, string> = {
    k: 'Arceus (King)',
    q: 'Mewtwo (Queen)',
    r: 'Aggron (Rook)',
    b: 'Alakazam (Bishop)',
    n: 'Rapidash (Knight)',
    p: 'Wimpod (Pawn)',
  };

  return (
    <motion.div
      className={`relative flex items-center justify-center cursor-pointer select-none transition-transform ${sizeClasses}`}
      title={`${isWhite ? 'White' : 'Black'} ${pokemonNames[symbol]}`}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Background glow when selected */}
      {isSelected && (
        <motion.div
          layoutId="selectedGlow"
          className={`absolute inset-1 rounded-full ${sideTheme.glow} ring-2 ${sideTheme.ring} bg-amber-400/10 pointer-events-none`}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Target indicator ring */}
      {isTarget && (
        <div className="absolute inset-1 rounded-full border-2 border-red-500/80 bg-red-500/20 animate-pulse pointer-events-none" />
      )}

      {/* Piece SVG container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {renderSvg()}
      </div>

      {/* Mini subtle piece badge indicator */}
      <div
        className={`absolute bottom-0 right-0 z-20 px-1 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-tighter border shadow-sm ${sideTheme.badgeBg} pointer-events-none`}
      >
        {symbol.toUpperCase()}
      </div>
    </motion.div>
  );
};
