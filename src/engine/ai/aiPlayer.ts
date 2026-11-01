/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Chess, Color, Move, Square } from 'chess.js';
import { PlayerEnergyState } from '../../types/game';
import { AbilityState } from '../abilityEngine';
import {
  AiAction,
  AiDifficulty,
  AI_DIFFICULTY_CONFIGS,
  CandidateEvaluation,
} from '../../types/ai';
import { findBestChessMove, evaluateBoardState, minimaxSearch } from './chessEngineFallback';
import {
  evaluateWimpodSwarm,
  evaluateRapidashFlameDash,
  evaluateAlakazamShield,
  evaluateAggronWall,
  evaluateMewtwoControl,
  evaluateArceusDivineProtection,
  evaluateAggronPassiveBonus,
  evaluateEvolutionAdvancement,
} from './pokemonAiEvaluator';

export interface AiTurnPlan {
  action: AiAction;
}

/**
 * Main AI decision engine for Pokémon Chess.
 * Evaluates chess engine legality, Stockfish/minimax search, and custom Pokémon abilities.
 */
export async function computeAiAction(
  chess: Chess,
  color: Color,
  energyState: PlayerEnergyState,
  abilityState: AbilityState,
  opponentEnergy: PlayerEnergyState,
  difficulty: AiDifficulty = 'intermediate'
): Promise<AiAction> {
  const config = AI_DIFFICULTY_CONFIGS[difficulty];
  const legalMoves = chess.moves({ verbose: true });

  if (legalMoves.length === 0) {
    throw new Error('No legal moves available for AI');
  }

  // 1. Emergency Check: Arceus Divine Protection warp
  if (config.abilityUseProbability >= 0.5) {
    const divineRescue = evaluateArceusDivineProtection(
      chess,
      color,
      energyState,
      abilityState
    );
    if (divineRescue && chess.inCheck()) {
      return {
        type: 'DIVINE_PROTECTION_ESCAPE',
        move: {
          from: legalMoves[0].from,
          to: divineRescue.safeSquare,
        },
        ability: {
          id: 'divine_protection',
          targetSquare: divineRescue.safeSquare,
          cost: 4,
        },
        evaluationScore: 10000,
        reasoning: 'Arceus triggered Divine Protection to escape check!',
      };
    }
  }

  // 2. Check standalone / pre-move abilities (Swarm, Shield, Wall)
  let preMoveAbility: AiAction['ability'] | undefined = undefined;
  let preMoveBonus = 0;
  const canUseAbilityRoll = Math.random() < config.abilityUseProbability;

  if (canUseAbilityRoll && !abilityState.abilityUsedThisTurn) {
    // A. Wimpod Swarm Protection
    const swarm = evaluateWimpodSwarm(chess, color, energyState, abilityState);
    if (swarm) {
      preMoveAbility = {
        id: 'swarm',
        targetSquare: swarm.targetSquare,
        cost: 1,
      };
      preMoveBonus = swarm.bonus;
    }

    // B. Alakazam Psychic Shield (if no swarm and enough energy)
    if (!preMoveAbility) {
      const shield = evaluateAlakazamShield(
        chess,
        color,
        energyState,
        abilityState,
        opponentEnergy
      );
      if (shield) {
        preMoveAbility = {
          id: 'psychic_shield',
          targetSquare: shield.targetSquare,
          cost: 2,
        };
        preMoveBonus = shield.bonus;
      }
    }

    // C. Aggron Iron Wall
    if (!preMoveAbility) {
      const wall = evaluateAggronWall(chess, color, energyState, abilityState);
      if (wall) {
        preMoveAbility = {
          id: 'iron_wall',
          targetSquare: wall.targetSquare,
          cost: 2,
        };
        preMoveBonus = wall.bonus;
      }
    }
  }

  // 3. Evaluate each legal chess move + Pokémon synergy
  const candidateEvaluations: CandidateEvaluation[] = [];

  for (const move of legalMoves) {
    // Chess search score
    chess.move(move);
    const searchDepth = Math.max(1, config.depth - 1);
    const chessScore = minimaxSearch(
      chess,
      searchDepth,
      -Infinity,
      Infinity,
      false,
      color
    );
    chess.undo();

    // Pokémon tactical bonuses
    let pokemonBonus = 0;
    pokemonBonus += evaluateEvolutionAdvancement(move, color);
    pokemonBonus += evaluateAggronPassiveBonus(move, chess, color);

    // If pre-move ability is active, add its bonus
    if (preMoveAbility) {
      pokemonBonus += preMoveBonus;
    }

    // Check Rapidash Flame Dash if it is a Knight move
    let flameDashBonusStep: Square | undefined = undefined;
    if (move.piece === 'n' && canUseAbilityRoll && energyState.current >= 2) {
      const flameDash = evaluateRapidashFlameDash(chess, move, color, energyState);
      if (flameDash) {
        flameDashBonusStep = flameDash.bonusStep;
        pokemonBonus += flameDash.bonus;
      }
    }

    // Random variance for difficulty simulation (Beginner makes occasional small blunders)
    const randomNoise =
      config.randomBlunderMargin > 0
        ? (Math.random() * 2 - 1) * config.randomBlunderMargin
        : 0;

    const totalScore = chessScore + pokemonBonus + randomNoise;

    const isPromotion = Boolean(move.promotion);
    const actionType = flameDashBonusStep
      ? 'FLAME_DASH_MOVE'
      : preMoveAbility
      ? 'ABILITY_THEN_MOVE'
      : 'STANDARD_MOVE';

    const action: AiAction = {
      type: actionType,
      move: {
        from: move.from,
        to: move.to,
        promotion: isPromotion ? 'q' : undefined,
      },
      ability: flameDashBonusStep
        ? {
            id: 'flame_dash',
            cost: 2,
          }
        : preMoveAbility,
      flameDashBonusStep,
      evolutionChoice: isPromotion ? 'q' : undefined,
      evaluationScore: totalScore,
      reasoning: isPromotion
        ? 'Evolving Wimpod to Mewtwo!'
        : flameDashBonusStep
        ? 'Rapidash Flame Dash flank maneuver'
        : preMoveAbility
        ? `Activated ${preMoveAbility.id} and moved`
        : `Standard move ${move.san}`,
    };

    candidateEvaluations.push({
      action,
      chessCentipawns: chessScore,
      pokemonBonus,
      totalScore,
    });
  }

  // Sort candidates by total score descending
  candidateEvaluations.sort((a, b) => b.totalScore - a.totalScore);

  return candidateEvaluations[0].action;
}
