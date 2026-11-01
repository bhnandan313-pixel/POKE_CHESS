/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialEnergyState,
  canAffordAbility,
  deductEnergy,
  handleTurnCompletedEnergy,
  INITIAL_ENERGY,
  MAX_ENERGY,
  REGEN_TURN_INTERVAL,
} from '../src/engine/energyEngine';

describe('Energy System Testing', () => {
  it('starts each player with 5 energy and max 10', () => {
    const energy = createInitialEnergyState();
    expect(energy.w.current).toBe(INITIAL_ENERGY);
    expect(energy.w.max).toBe(MAX_ENERGY);
    expect(energy.w.personalTurnsCompleted).toBe(0);

    expect(energy.b.current).toBe(INITIAL_ENERGY);
    expect(energy.b.max).toBe(MAX_ENERGY);
    expect(energy.b.personalTurnsCompleted).toBe(0);
  });

  it('correctly validates whether an ability can be afforded', () => {
    const energy = createInitialEnergyState();
    expect(canAffordAbility(energy, 'w', 1)).toBe(true);
    expect(canAffordAbility(energy, 'w', 5)).toBe(true);
    expect(canAffordAbility(energy, 'w', 6)).toBe(false);
  });

  it('deducts the exact ability cost for each Pokémon', () => {
    let energy = createInitialEnergyState();

    // Wimpod (-1)
    energy = deductEnergy(energy, 'w', 1);
    expect(energy.w.current).toBe(4);

    // Rapidash (-2)
    energy = deductEnergy(energy, 'w', 2);
    expect(energy.w.current).toBe(2);

    // Mewtwo (-3, when energy is 2, deduction is rejected or not affordable)
    expect(canAffordAbility(energy, 'w', 3)).toBe(false);

    // Energy state for Black remains untouched (independent tracking)
    expect(energy.b.current).toBe(5);
  });

  it('regenerates +1 energy every 3 personal turns', () => {
    let energy = createInitialEnergyState();
    // Use some energy first so we can observe regen
    energy = deductEnergy(energy, 'w', 3); // current: 2

    // Turn 1
    let result = handleTurnCompletedEnergy(energy, 'w');
    energy = result.nextEnergyState;
    expect(energy.w.personalTurnsCompleted).toBe(1);
    expect(energy.w.current).toBe(2);
    expect(result.regenerated).toBe(false);

    // Turn 2
    result = handleTurnCompletedEnergy(energy, 'w');
    energy = result.nextEnergyState;
    expect(energy.w.personalTurnsCompleted).toBe(2);
    expect(energy.w.current).toBe(2);
    expect(result.regenerated).toBe(false);

    // Turn 3: +1 energy regeneration
    result = handleTurnCompletedEnergy(energy, 'w');
    energy = result.nextEnergyState;
    expect(energy.w.personalTurnsCompleted).toBe(3);
    expect(energy.w.current).toBe(3);
    expect(result.regenerated).toBe(true);

    // Black's turn count and energy remain independent
    expect(energy.b.personalTurnsCompleted).toBe(0);
    expect(energy.b.current).toBe(5);
  });

  it('does not exceed maximum energy (10)', () => {
    let energy = createInitialEnergyState();
    // Simulate player with 10 energy
    energy.w.current = 10;

    // Simulate 3 personal turns
    energy = handleTurnCompletedEnergy(energy, 'w').nextEnergyState;
    energy = handleTurnCompletedEnergy(energy, 'w').nextEnergyState;
    const result = handleTurnCompletedEnergy(energy, 'w');

    expect(result.nextEnergyState.w.current).toBe(10);
    expect(result.regenerated).toBe(false);
  });

  it('rejects energy deduction if insufficient energy exists', () => {
    const energy = createInitialEnergyState();
    // Attempting to deduct 6 when current is 5 should not reduce below 0 or corrupt state
    const after = deductEnergy(energy, 'w', 6);
    expect(after.w.current).toBe(5);
  });
});
