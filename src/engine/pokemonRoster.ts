/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PieceSymbol } from 'chess.js';
import { PokemonPieceInfo } from '../types/game';

export const GOLISOPOD_IMAGE = '/src/assets/images/pokemon_piece_golisopod_1793514488292.jpg';

export const POKEMON_PIECES: Record<PieceSymbol, PokemonPieceInfo> = {
  k: {
    id: 'arceus',
    name: 'Arceus',
    chessPiece: 'King',
    symbol: 'k',
    type: ['Normal', 'Cosmic'],
    role: 'The Supreme Alpha & Creator',
    signatureMove: 'Judgment',
    tacticalNote: 'Shield Arceus at all costs. An exposed King invites catastrophic checkmate from enemy psychics.',
    description: 'Born from an egg in a vortex of nothingness, Arceus shaped the Pokémon universe. Its royal judgment controls the cosmic chessboard.',
    imageUrl: '/src/assets/images/pokemon_piece_arceus_1793512932399.jpg',
    activeAbility: {
      id: 'divine_protection',
      name: 'Divine Protection',
      cost: 4,
      type: 'reaction',
      targetType: 'safe_square',
      description: 'Once per match. When facing a capture attempt or under attack, escape immediately to an adjacent safe empty square that is not under attack.',
      effectLore: 'Surrounds Arceus in an unbreachable cosmic aura, instantaneously warping to adjacent sanctuary.',
    },
    passiveAbility: {
      name: 'Supreme Deity',
      description: 'Cannot be displaced by enemy special abilities.',
    },
    colorTheme: {
      primary: '#FBBF24',
      secondary: '#FEF3C7',
      accent: '#D97706',
    },
  },
  q: {
    id: 'mewtwo',
    name: 'Mewtwo',
    chessPiece: 'Queen',
    symbol: 'q',
    type: ['Psychic'],
    role: 'The Ultimate Psychic Vanguard',
    signatureMove: 'Psystrike',
    tacticalNote: 'The most lethal asset on the board. Mewtwo sweeps ranks, files, and diagonals with unmatched tactical range.',
    description: 'Engineered from the DNA of Mew, Mewtwo wields psychic telekinesis capable of altering reality. Unleash its fury to break fortified lines.',
    imageUrl: '/src/assets/images/pokemon_piece_mewtwo_1793512933107.jpg',
    activeAbility: {
      id: 'psychic_control',
      name: 'Psychic Control',
      cost: 3,
      type: 'active',
      targetType: 'adjacent_enemy',
      description: 'Select an adjacent enemy piece (non-King) and psychically compel it to move 1 square in any direction to an empty square without leaving either King in an illegal state.',
      effectLore: 'Channels overpowering psionic waves into an enemy soldier, forcing it out of strategic position.',
    },
    passiveAbility: {
      name: 'Psionic Anchor',
      description: 'Cannot be displaced by enemy special abilities.',
    },
    colorTheme: {
      primary: '#A855F7',
      secondary: '#E9D5FF',
      accent: '#7E22CE',
    },
  },
  r: {
    id: 'aggron',
    name: 'Aggron',
    chessPiece: 'Rook',
    symbol: 'r',
    type: ['Steel', 'Rock'],
    role: 'The Armored Bastion',
    signatureMove: 'Iron Head & Heavy Slam',
    tacticalNote: 'Dominate open ranks and open files. Aggron forms an impenetrable wall guarding your back ranks.',
    description: 'Claiming entire mountains as its dominion, Aggron repairs its iron armor by forging fallen metals. A juggernaut of lateral and vertical pressure.',
    imageUrl: '/src/assets/images/pokemon_piece_aggron_1793512932248.jpg',
    activeAbility: {
      id: 'iron_wall',
      name: 'Iron Wall',
      cost: 2,
      type: 'active',
      targetType: 'adjacent_friendly',
      description: 'Select an adjacent friendly piece. Protects it from the next enemy special ability until the opponent completes their next turn.',
      effectLore: 'Erects massive interlocking steel plates shielding allied units from psychic tampering.',
    },
    passiveAbility: {
      name: 'Sturdy Carapace',
      description: 'Enemy Pawns cannot directly capture Aggron. Other pieces can capture normally.',
    },
    colorTheme: {
      primary: '#64748B',
      secondary: '#E2E8F0',
      accent: '#334155',
    },
  },
  b: {
    id: 'alakazam',
    name: 'Alakazam',
    chessPiece: 'Bishop',
    symbol: 'b',
    type: ['Psychic'],
    role: 'The Telepathic Mystic',
    signatureMove: 'Kinesis & Psychic',
    tacticalNote: 'Operates along color-bound diagonals. Pair both Alakazams to slice open opposing pawn centers.',
    description: 'Possessing an IQ exceeding 5,000, Alakazam memorizes every grandmaster battle in history. Its bent spoons focus long-range diagonal telepathy.',
    imageUrl: '/src/assets/images/pokemon_piece_alakazam_1793514501515.jpg',
    activeAbility: {
      id: 'psychic_shield',
      name: 'Psychic Shield',
      cost: 2,
      type: 'active',
      targetType: 'friendly',
      description: 'Select any friendly piece on the board. Protects it from the next enemy special ability until the opponent completes their next turn.',
      effectLore: 'Spins telekinetic forcefields that nullify enemy special abilities upon impact.',
    },
    passiveAbility: {
      name: 'Telepathic Ward',
      description: 'Immune to Psychic-based status effects and mental disruption.',
    },
    colorTheme: {
      primary: '#EC4899',
      secondary: '#FCE7F3',
      accent: '#BE185D',
    },
  },
  n: {
    id: 'rapidash',
    name: 'Rapidash',
    chessPiece: 'Knight',
    symbol: 'n',
    type: ['Fire'],
    role: 'The Blazing Steed',
    signatureMove: 'Flame Charge',
    tacticalNote: 'The only piece capable of jumping over obstacles. Use Rapidash for sudden forks and tactical outposts.',
    description: 'Can reach speeds of 150 mph in mere paces with a blazing mane of flames. It leaps effortlessly over enemy ranks to ambush high-value targets.',
    imageUrl: '/src/assets/images/pokemon_piece_rapidash_1793514502451.jpg',
    activeAbility: {
      id: 'flame_dash',
      name: 'Flame Dash',
      cost: 2,
      type: 'active',
      targetType: 'none',
      description: 'After a legal Knight move, allows one additional horizontal or vertical square of movement into an empty square (no capture). Leaves a blazing fire trail.',
      effectLore: 'Accelerates into overdrive, blazing across an extra orthogonal square in a streak of flames.',
    },
    passiveAbility: {
      name: 'Flame Cloak',
      description: 'Immune to Fire-based status effects and hazard traps.',
    },
    colorTheme: {
      primary: '#F97316',
      secondary: '#FFEDD5',
      accent: '#EA580C',
    },
  },
  p: {
    id: 'wimpod',
    name: 'Wimpod',
    chessPiece: 'Pawn',
    symbol: 'p',
    type: ['Bug', 'Water'],
    role: 'The Chitinous Scout',
    signatureMove: 'Wimp Out & Chitin Shield',
    tacticalNote: 'Advance methodically in phalanxes. Reaching the opposing edge initiates glorious promotion into Mewtwo, Aggron, Alakazam, or Rapidash.',
    description: 'Naturally cautious and armored in shell plates, Wimpod forages the front lines. Reaching the opposing back rank awakens its evolutionary destiny.',
    activeAbility: {
      id: 'swarm_protection',
      name: 'Swarm Protection',
      cost: 1,
      type: 'active',
      targetType: 'friendly',
      description: 'Activate protection on a friendly Wimpod. Protects it from one capture attempt until the opponent completes their next turn.',
      effectLore: 'Summons an elusive swarm of chitinous shells that deflects the next lethal strike.',
    },
    passiveAbility: {
      name: 'Swarm Phalanx',
      description: 'Adjacent friendly Wimpods form a defensive phalanx, receiving a defensive resilience bonus.',
    },
    colorTheme: {
      primary: '#06B6D4',
      secondary: '#CFFAFE',
      accent: '#0891B2',
    },
  },
};

export const HERO_BATTLE_IMAGE = '/src/assets/images/pokemon_chess_hero_battle_1793512932184.jpg';
