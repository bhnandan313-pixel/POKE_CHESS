/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PieceSymbol, Square, Color } from 'chess.js';
import { POKEMON_PIECES, GOLISOPOD_IMAGE } from './pokemonRoster';
import { AbilityData } from '../types/game';

export type EvolutionVfxType = 'psychic' | 'metallic' | 'golden_psychic' | 'fire';

export interface EvolutionChoice {
  symbol: PieceSymbol;
  pokemonName: string;
  chessRole: string;
  title: string;
  type: string[];
  vfxType: EvolutionVfxType;
  vfxDescription: string;
  themeColor: string;
  accentColor: string;
  imageUrl: string;
  activeAbility: AbilityData;
  passiveAbility?: {
    name: string;
    description: string;
  };
}

export type EvolutionStage =
  | 'WIMPOD_TO_GOLISOPOD' // Blue water particles, armored awakening
  | 'CHOICE_SELECTION'    // Golisopod intermediate form displayed, cards interactive
  | 'GOLISOPOD_TO_TITAN'  // Specific elemental transformation into chosen Pokémon
  | 'COMPLETED';

export const EVOLUTION_CHOICES: EvolutionChoice[] = [
  {
    symbol: 'q',
    pokemonName: 'Mewtwo',
    chessRole: 'Queen',
    title: 'Queen Evolution',
    type: ['Psychic'],
    vfxType: 'psychic',
    vfxDescription: 'Swirling purple psychic vortex with levitating energy spheres.',
    themeColor: '#A855F7',
    accentColor: '#C084FC',
    imageUrl: POKEMON_PIECES.q.imageUrl || '',
    activeAbility: POKEMON_PIECES.q.activeAbility,
  },
  {
    symbol: 'r',
    pokemonName: 'Aggron',
    chessRole: 'Rook',
    title: 'Rook Evolution',
    type: ['Steel', 'Rock'],
    vfxType: 'metallic',
    vfxDescription: 'Metallic shard storm and interlocking titanium fortress armor.',
    themeColor: '#64748B',
    accentColor: '#94A3B8',
    imageUrl: POKEMON_PIECES.r.imageUrl || '',
    activeAbility: POKEMON_PIECES.r.activeAbility,
    passiveAbility: POKEMON_PIECES.r.passiveAbility,
  },
  {
    symbol: 'b',
    pokemonName: 'Alakazam',
    chessRole: 'Bishop',
    title: 'Bishop Evolution',
    type: ['Psychic'],
    vfxType: 'golden_psychic',
    vfxDescription: 'Golden telepathic starburst and resonant mystic bent spoons.',
    themeColor: '#F59E0B',
    accentColor: '#FBBF24',
    imageUrl: POKEMON_PIECES.b.imageUrl || '',
    activeAbility: POKEMON_PIECES.b.activeAbility,
  },
  {
    symbol: 'n',
    pokemonName: 'Rapidash',
    chessRole: 'Knight',
    title: 'Knight Evolution',
    type: ['Fire'],
    vfxType: 'fire',
    vfxDescription: 'Raging fire storm and blazing flame-mane acceleration.',
    themeColor: '#F97316',
    accentColor: '#FB923C',
    imageUrl: POKEMON_PIECES.n.imageUrl || '',
    activeAbility: POKEMON_PIECES.n.activeAbility,
  },
];

export function getEvolutionChoice(symbol: PieceSymbol): EvolutionChoice {
  const found = EVOLUTION_CHOICES.find((c) => c.symbol === symbol);
  return found || EVOLUTION_CHOICES[0];
}

export function isPawnPromotionMove(
  from: Square,
  to: Square,
  pieceType: PieceSymbol,
  color: Color
): boolean {
  if (pieceType !== 'p') return false;
  return (color === 'w' && to[1] === '8') || (color === 'b' && to[1] === '1');
}

export { GOLISOPOD_IMAGE };
