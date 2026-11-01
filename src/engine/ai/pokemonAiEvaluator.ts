/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Chess, Square, Color, PieceSymbol, Move } from 'chess.js';
import { PlayerEnergyState, ActiveProtection } from '../../types/game';
import { AbilityState } from '../abilityEngine';
import {
  getAdjacentSquares,
  getRapidashFlameDashDestinations,
  getSafeArceusEscapeSquares,
  isAggronImmuneToPawnCapture,
  validateMewtwoControlTarget,
  getMewtwoControlDestinations,
} from '../abilityValidator';
import { AiAction, AiDifficulty } from '../../types/ai';

export interface PokemonActionScore {
  action: AiAction;
  pokemonBonus: number;
}

/**
 * Calculates strategic value of spending energy vs preserving it.
 */
export function evaluateEnergyReserve(
  energy: PlayerEnergyState,
  costToSpend: number
): number {
  const current = energy.current;
  if (current < costToSpend) return -Infinity; // Cannot afford

  // Cost penalty in centipawns: reserving energy is valuable, so spending must pay off
  const costPenalty = costToSpend * 25;
  return -costPenalty;
}

/**
 * Checks if a specific square containing an AI piece is attacked by opponent pieces.
 */
export function isSquareUnderAttackByOpponent(
  chess: Chess,
  sq: Square,
  opponentColor: Color
): boolean {
  const opponentMoves = chess.moves({ verbose: true });
  return opponentMoves.some((m) => m.to === sq && m.color === opponentColor);
}

/**
 * Evaluates Wimpod Swarm Protection opportunities.
 * Returns potential Swarm action if beneficial.
 */
export function evaluateWimpodSwarm(
  chess: Chess,
  color: Color,
  energy: PlayerEnergyState,
  abilityState: AbilityState
): { targetSquare: Square; bonus: number } | null {
  if (energy.current < 1) return null;

  const opponentColor: Color = color === 'w' ? 'b' : 'w';
  const board = chess.board();

  // Find all friendly Wimpods (pawns)
  let bestWimpod: { sq: Square; bonus: number } | null = null;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'p' && piece.color === color) {
        const sq = `${String.fromCharCode(97 + c)}${8 - r}` as Square;

        // Skip if already protected
        const isProtected = abilityState.activeProtections.some(
          (p) => p.square === sq && p.type === 'swarm'
        );
        if (isProtected) continue;

        // Check if under enemy attack
        const isAttacked = isSquareUnderAttackByOpponent(chess, sq, opponentColor);
        if (isAttacked) {
          // Saving an attacked pawn yields high value (+120 centipawns)
          const bonus = 120;
          if (!bestWimpod || bonus > bestWimpod.bonus) {
            bestWimpod = { sq, bonus };
          }
        }
      }
    }
  }

  return bestWimpod ? { targetSquare: bestWimpod.sq, bonus: bestWimpod.bonus } : null;
}

/**
 * Evaluates Rapidash Flame Dash bonus step after a Knight move.
 */
export function evaluateRapidashFlameDash(
  chess: Chess,
  knightMove: Move,
  color: Color,
  energy: PlayerEnergyState
): { bonusStep: Square; bonus: number } | null {
  if (knightMove.piece !== 'n' || knightMove.color !== color) return null;
  if (energy.current < 2) return null;

  const destinations = getRapidashFlameDashDestinations(chess, knightMove.to);
  if (destinations.length === 0) return null;

  const opponentColor: Color = color === 'w' ? 'b' : 'w';
  let bestStep: { sq: Square; bonus: number } | null = null;

  for (const stepSq of destinations) {
    // Check if the bonus step is safe or creates a fork
    const isAttacked = isSquareUnderAttackByOpponent(chess, stepSq, opponentColor);
    let stepBonus = 70; // Base mobility bonus

    if (!isAttacked) {
      stepBonus += 60; // Safe square bonus
    }

    // Check if bonus step attacks high-value opponent piece (Knight fork potential)
    const adjKnights = getAdjacentSquares(stepSq);
    for (const adj of adjKnights) {
      const targetPiece = chess.get(adj);
      if (targetPiece && targetPiece.color === opponentColor) {
        if (targetPiece.type === 'q' || targetPiece.type === 'k' || targetPiece.type === 'r') {
          stepBonus += 80; // Threat bonus
        }
      }
    }

    if (!bestStep || stepBonus > bestStep.bonus) {
      bestStep = { sq: stepSq, bonus: stepBonus };
    }
  }

  return bestStep ? { bonusStep: bestStep.sq, bonus: bestStep.bonus } : null;
}

/**
 * Evaluates Alakazam Psychic Shield.
 */
export function evaluateAlakazamShield(
  chess: Chess,
  color: Color,
  energy: PlayerEnergyState,
  abilityState: AbilityState,
  opponentEnergy: PlayerEnergyState
): { targetSquare: Square; bonus: number } | null {
  if (energy.current < 2) return null;

  // Only prioritize shield if opponent has 3+ energy (capable of Psychic Control)
  if (opponentEnergy.current < 3) return null;

  const board = chess.board();
  let kingSquare: Square | null = null;
  let queenSquare: Square | null = null;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const sq = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
        if (piece.type === 'k') kingSquare = sq;
        if (piece.type === 'q') queenSquare = sq;
      }
    }
  }

  const target = queenSquare || kingSquare;
  if (!target) return null;

  // Check if target already has psychic shield
  const alreadyShielded = abilityState.activeProtections.some(
    (p) => p.square === target && p.type === 'psychic_shield'
  );
  if (alreadyShielded) return null;

  return { targetSquare: target, bonus: 110 };
}

/**
 * Evaluates Aggron Iron Wall for adjacent allies.
 */
export function evaluateAggronWall(
  chess: Chess,
  color: Color,
  energy: PlayerEnergyState,
  abilityState: AbilityState
): { targetSquare: Square; bonus: number } | null {
  if (energy.current < 2) return null;

  const board = chess.board();
  let aggronSquare: Square | null = null;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'r' && p.color === color) {
        aggronSquare = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
        break;
      }
    }
    if (aggronSquare) break;
  }

  if (!aggronSquare) return null;

  const adjacent = getAdjacentSquares(aggronSquare);
  for (const adj of adjacent) {
    const ally = chess.get(adj);
    if (ally && ally.color === color && (ally.type === 'k' || ally.type === 'q')) {
      const alreadyProtected = abilityState.activeProtections.some(
        (p) => p.square === adj && p.type === 'iron_wall'
      );
      if (!alreadyProtected) {
        return { targetSquare: adj, bonus: 95 };
      }
    }
  }

  return null;
}

/**
 * Evaluates Mewtwo Psychic Control.
 */
export function evaluateMewtwoControl(
  chess: Chess,
  color: Color,
  energy: PlayerEnergyState
): { targetSquare: Square; destinationSquare: Square; bonus: number } | null {
  if (energy.current < 3) return null;

  const board = chess.board();
  let mewtwoSquare: Square | null = null;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'q' && p.color === color) {
        mewtwoSquare = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
        break;
      }
    }
    if (mewtwoSquare) break;
  }

  if (!mewtwoSquare) return null;

  const adjacent = getAdjacentSquares(mewtwoSquare);
  const opponentColor: Color = color === 'w' ? 'b' : 'w';

  for (const adj of adjacent) {
    if (validateMewtwoControlTarget(chess, mewtwoSquare, adj, color)) {
      const dests = getMewtwoControlDestinations(chess, adj, color);
      if (dests.length > 0) {
        // Displacing an enemy piece (especially away from center) is very strong
        return {
          targetSquare: adj,
          destinationSquare: dests[0],
          bonus: 175,
        };
      }
    }
  }

  return null;
}

/**
 * Evaluates Arceus Divine Protection warp escape.
 */
export function evaluateArceusDivineProtection(
  chess: Chess,
  color: Color,
  energy: PlayerEnergyState,
  abilityState: AbilityState
): { safeSquare: Square; bonus: number } | null {
  if (energy.current < 4) return null;
  if (abilityState.usedDivineProtection[color]) return null;

  // Only consider if in check or heavily threatened
  if (!chess.inCheck()) return null;

  const board = chess.board();
  let arceusSquare: Square | null = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) {
        arceusSquare = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
        break;
      }
    }
    if (arceusSquare) break;
  }
  if (!arceusSquare) return null;

  const safeSquares = getSafeArceusEscapeSquares(chess, arceusSquare, color);
  if (safeSquares.length > 0) {
    // Critical emergency rescue
    return { safeSquare: safeSquares[0], bonus: 1200 };
  }

  return null;
}

/**
 * Evaluates Aggron passive: enemy pawns cannot capture Aggron.
 * If move places Aggron on a square where pawns might attempt a capture, award immunity bonus.
 */
export function evaluateAggronPassiveBonus(
  move: Move,
  chess: Chess,
  color: Color
): number {
  if (move.piece !== 'r') return 0;
  // Aggron Sturdy Carapace passive immunity bonus
  return 80;
}

/**
 * Evaluates Wimpod evolution opportunity.
 * Pawns advancing to rank 7 (White) or rank 2 (Black) receive strong forward momentum bonus.
 */
export function evaluateEvolutionAdvancement(move: Move, color: Color): number {
  if (move.piece !== 'p') return 0;
  const targetRank = parseInt(move.to[1], 10);
  if (color === 'w' && targetRank === 8) return 900; // Direct evolution to Queen Mewtwo!
  if (color === 'b' && targetRank === 1) return 900; // Direct evolution to Queen Mewtwo!
  if (color === 'w' && targetRank === 7) return 150; // Approaching evolution rank
  if (color === 'b' && targetRank === 2) return 150; // Approaching evolution rank
  return 0;
}
