/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Square, PieceSymbol, Color } from 'chess.js';

export type AiDifficulty = 'beginner' | 'intermediate' | 'expert';

export type AiActionType =
  | 'STANDARD_MOVE'
  | 'ABILITY_THEN_MOVE'
  | 'FLAME_DASH_MOVE'
  | 'DIVINE_PROTECTION_ESCAPE';

export interface AiAction {
  type: AiActionType;
  move: {
    from: Square;
    to: Square;
    promotion?: PieceSymbol;
  };
  ability?: {
    id: 'swarm' | 'psychic_shield' | 'iron_wall' | 'psychic_control' | 'divine_protection' | 'flame_dash';
    targetSquare?: Square;
    cost: number;
  };
  flameDashBonusStep?: Square;
  evolutionChoice?: PieceSymbol; // 'q' (Mewtwo), 'r' (Aggron), 'b' (Alakazam), 'n' (Rapidash)
  evaluationScore: number;
  reasoning: string;
}

export interface CandidateEvaluation {
  action: AiAction;
  chessCentipawns: number;
  pokemonBonus: number;
  totalScore: number;
}

export interface AiEngineConfig {
  difficulty: AiDifficulty;
  depth: number;
  maxThinkTimeMs: number;
  abilityUseProbability: number;
  randomBlunderMargin: number;
}

export const AI_DIFFICULTY_CONFIGS: Record<AiDifficulty, AiEngineConfig> = {
  beginner: {
    difficulty: 'beginner',
    depth: 1,
    maxThinkTimeMs: 600,
    abilityUseProbability: 0.35,
    randomBlunderMargin: 80, // Adds random noise to simulate occasional novice moves
  },
  intermediate: {
    difficulty: 'intermediate',
    depth: 3,
    maxThinkTimeMs: 1000,
    abilityUseProbability: 0.85,
    randomBlunderMargin: 20, // Small tactical variance
  },
  expert: {
    difficulty: 'expert',
    depth: 4,
    maxThinkTimeMs: 1500,
    abilityUseProbability: 1.0,
    randomBlunderMargin: 0, // Deterministic best move selection
  },
};
