/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Color } from 'chess.js';
import { PlayerEnergyState } from '../types/game';

export const INITIAL_ENERGY = 5;
export const MAX_ENERGY = 10;
export const REGEN_TURN_INTERVAL = 3;

export function createInitialEnergyState(): Record<Color, PlayerEnergyState> {
  return {
    w: {
      current: INITIAL_ENERGY,
      max: MAX_ENERGY,
      personalTurnsCompleted: 0,
    },
    b: {
      current: INITIAL_ENERGY,
      max: MAX_ENERGY,
      personalTurnsCompleted: 0,
    },
  };
}

export function canAffordAbility(
  energyState: Record<Color, PlayerEnergyState>,
  color: Color,
  cost: number
): boolean {
  return (energyState[color]?.current ?? 0) >= cost;
}

export function deductEnergy(
  energyState: Record<Color, PlayerEnergyState>,
  color: Color,
  cost: number
): Record<Color, PlayerEnergyState> {
  const current = energyState[color]?.current ?? 0;
  if (current < cost) {
    return energyState;
  }
  return {
    ...energyState,
    [color]: {
      ...energyState[color],
      current: Math.max(0, current - cost),
    },
  };
}

export function handleTurnCompletedEnergy(
  energyState: Record<Color, PlayerEnergyState>,
  completedColor: Color
): { nextEnergyState: Record<Color, PlayerEnergyState>; regenerated: boolean } {
  const player = energyState[completedColor];
  const newTurnsCount = player.personalTurnsCompleted + 1;
  const shouldRegen = newTurnsCount % REGEN_TURN_INTERVAL === 0;
  const newCurrent = shouldRegen ? Math.min(MAX_ENERGY, player.current + 1) : player.current;

  const nextEnergyState: Record<Color, PlayerEnergyState> = {
    ...energyState,
    [completedColor]: {
      ...player,
      personalTurnsCompleted: newTurnsCount,
      current: newCurrent,
    },
  };

  return {
    nextEnergyState,
    regenerated: shouldRegen && player.current < MAX_ENERGY,
  };
}
