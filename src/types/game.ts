/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PieceSymbol, Color, Square } from 'chess.js';

export type GameMode = 'local' | 'ai' | 'online';

export type ViewState = 'HOME' | 'PLAY' | 'HOW_TO_PLAY' | 'COLLECTION' | 'SETTINGS';

export interface AbilityData {
  id: string;
  name: string;
  cost: number;
  type: 'active' | 'passive' | 'reaction';
  targetType: 'none' | 'self' | 'friendly' | 'adjacent_friendly' | 'adjacent_enemy' | 'safe_square';
  description: string;
  effectLore: string;
}

export interface PokemonPieceInfo {
  id: string;
  name: string;
  chessPiece: string;
  symbol: PieceSymbol;
  type: string[];
  role: string;
  signatureMove: string;
  tacticalNote: string;
  description: string;
  activeAbility: AbilityData;
  passiveAbility?: {
    name: string;
    description: string;
  };
  imageUrl?: string;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface PlayerEnergyState {
  current: number; // 0 - 10, starts at 5
  max: number; // 10
  personalTurnsCompleted: number;
}

export interface ActiveProtection {
  id: string;
  type: 'swarm' | 'psychic_shield' | 'iron_wall';
  square: Square;
  color: Color; // owner
  sourcePiece: PieceSymbol;
  turnsRemaining: number; // decreases when opponent finishes their turn
}

export interface AbilityAnimationEvent {
  id: string;
  type: 'swarm' | 'flame_dash' | 'psychic_shield' | 'iron_wall' | 'psychic_control' | 'divine_protection';
  fromSquare?: Square;
  toSquare?: Square;
  targetSquare?: Square;
  trailSquares?: Square[];
  color: Color;
  timestamp: number;
}

export interface CapturedPiece {
  symbol: PieceSymbol;
  color: Color;
  count: number;
}

export interface MoveRecord {
  san: string;
  from: Square;
  to: Square;
  color: Color;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  fen: string;
  moveNumber: number;
  abilityUsed?: string;
}

export interface GameStatus {
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
  turn: Color;
  winner: Color | 'draw' | null;
  statusText: string;
}

export type BoardTheme = 'cosmic_void' | 'indigo_crystal' | 'volcanic_ash' | 'emerald_forest';

export interface PlayerProfile {
  name: string;
  avatarId: string;
  color: Color;
}

export type AiDifficulty = 'beginner' | 'intermediate' | 'expert';

export interface MatchSettings {
  mode: GameMode; // 'local' | 'ai' | 'online'
  aiDifficulty?: AiDifficulty;
  humanColor?: Color;
  player1: PlayerProfile;
  player2: PlayerProfile;
  timerMinutes: number; // 0 (no timer), 5, 10, 15, 30
  boardTheme: BoardTheme;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

export interface BattleEvent {
  id: string;
  title: string;
  description: string;
  type: 'capture' | 'ability' | 'energy' | 'evolution' | 'check' | 'game_over' | 'timer' | 'undo';
  color?: Color;
  timestamp: number;
}

export interface MatchStats {
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  totalMoves: number;
  abilitiesUsed: number;
  evolutionsCount: number;
  capturesCount: number;
}
