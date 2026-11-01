/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Square, Color, PieceSymbol } from 'chess.js';
import { ActiveProtection, AbilityAnimationEvent } from '../types/game';

export interface AbilityState {
  activeProtections: ActiveProtection[];
  usedDivineProtection: Record<Color, boolean>;
  abilityUsedThisTurn: boolean;
  activeAnimation: AbilityAnimationEvent | null;
  targetingMode: {
    abilityId: string;
    sourceSquare: Square;
    sourcePiece: PieceSymbol;
    step?: 'select_target' | 'select_destination';
    firstTargetSquare?: Square;
  } | null;
  armedFlameDash: {
    knightSquare: Square;
    color: Color;
  } | null;
  pendingFlameDash: {
    knightSquare: Square;
    color: Color;
  } | null;
}

export function createInitialAbilityState(): AbilityState {
  return {
    activeProtections: [],
    usedDivineProtection: { w: false, b: false },
    abilityUsedThisTurn: false,
    activeAnimation: null,
    targetingMode: null,
    armedFlameDash: null,
    pendingFlameDash: null,
  };
}

export function addProtection(
  state: AbilityState,
  type: 'swarm' | 'psychic_shield' | 'iron_wall',
  square: Square,
  color: Color,
  sourcePiece: PieceSymbol
): AbilityState {
  // Remove existing protection of same type on that square if any
  const filtered = state.activeProtections.filter(
    (p) => !(p.square === square && p.type === type)
  );

  const newProtection: ActiveProtection = {
    id: `${type}-${square}-${Date.now()}`,
    type,
    square,
    color,
    sourcePiece,
    turnsRemaining: 1, // lasts until opponent completes their next turn
  };

  return {
    ...state,
    activeProtections: [...filtered, newProtection],
    abilityUsedThisTurn: true,
  };
}

export function hasActiveProtection(
  protections: ActiveProtection[],
  square: Square,
  type?: 'swarm' | 'psychic_shield' | 'iron_wall'
): boolean {
  if (type) {
    return protections.some((p) => p.square === square && p.type === type);
  }
  return protections.some((p) => p.square === square);
}

export function consumeProtection(
  state: AbilityState,
  square: Square,
  type: 'swarm' | 'psychic_shield' | 'iron_wall'
): { nextState: AbilityState; consumed: boolean } {
  const exists = state.activeProtections.some((p) => p.square === square && p.type === type);
  if (!exists) return { nextState: state, consumed: false };

  const nextState: AbilityState = {
    ...state,
    activeProtections: state.activeProtections.filter(
      (p) => !(p.square === square && p.type === type)
    ),
  };
  return { nextState, consumed: true };
}

export function handleTurnCompletedProtections(
  state: AbilityState,
  completedTurnColor: Color
): AbilityState {
  // When a player completes their turn, protections placed by the OPPONENT
  // that were waiting for opponent's turn to complete now decrement/expire!
  const updatedProtections: ActiveProtection[] = [];

  for (const protection of state.activeProtections) {
    if (protection.color !== completedTurnColor) {
      // It belongs to the other player; this was the opponent's turn!
      const turns = protection.turnsRemaining - 1;
      if (turns > 0) {
        updatedProtections.push({ ...protection, turnsRemaining: turns });
      }
      // If turns <= 0, it expires
    } else {
      // It belongs to the current player, keep it active
      updatedProtections.push(protection);
    }
  }

  return {
    ...state,
    activeProtections: updatedProtections,
    abilityUsedThisTurn: false,
    targetingMode: null,
    armedFlameDash: null,
    pendingFlameDash: null,
  };
}
