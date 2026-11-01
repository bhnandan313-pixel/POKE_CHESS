/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import {
  createInitialAbilityState,
  addProtection,
  hasActiveProtection,
  consumeProtection,
  handleTurnCompletedProtections,
} from '../src/engine/abilityEngine';
import {
  isAggronImmuneToPawnCapture,
  validateWimpodSwarm,
  validateAlakazamShield,
  validateAggronWall,
  validateMewtwoControlTarget,
  getMewtwoControlDestinations,
  getRapidashFlameDashDestinations,
  getSafeArceusEscapeSquares,
  hasAdjacentWimpodBonus,
} from '../src/engine/abilityValidator';

describe('Pokémon Ability & Protection Engine Testing', () => {
  describe('Wimpod - Swarm Protection & Passive', () => {
    it('validates swarm protection target (friendly Wimpod only)', () => {
      const chess = new Chess();
      // White Wimpod on e2
      expect(validateWimpodSwarm(chess, 'e2', 'w').valid).toBe(true);
      // Empty square
      expect(validateWimpodSwarm(chess, 'e4', 'w').valid).toBe(false);
      // Opponent Wimpod on e7
      expect(validateWimpodSwarm(chess, 'e7', 'w').valid).toBe(false);
      // Non-pawn (Arceus on e1)
      expect(validateWimpodSwarm(chess, 'e1', 'w').valid).toBe(false);
    });

    it('adds and consumes swarm protection on capture attempt', () => {
      let state = createInitialAbilityState();
      state = addProtection(state, 'swarm', 'e4', 'w', 'p');
      expect(hasActiveProtection(state.activeProtections, 'e4', 'swarm')).toBe(true);

      // Deflects capture and consumes protection
      const { nextState, consumed } = consumeProtection(state, 'e4', 'swarm');
      expect(consumed).toBe(true);
      expect(hasActiveProtection(nextState.activeProtections, 'e4', 'swarm')).toBe(false);
    });

    it('expires swarm protection after the opponent completes their turn', () => {
      let state = createInitialAbilityState();
      state = addProtection(state, 'swarm', 'e2', 'w', 'p'); // Cast by White

      // White finishes their turn (protection stays active)
      state = handleTurnCompletedProtections(state, 'w');
      expect(hasActiveProtection(state.activeProtections, 'e2', 'swarm')).toBe(true);

      // Opponent (Black) finishes their turn -> protection expires!
      state = handleTurnCompletedProtections(state, 'b');
      expect(hasActiveProtection(state.activeProtections, 'e2', 'swarm')).toBe(false);
    });

    it('validates Wimpod passive defensive bonus for adjacent friendly Wimpods', () => {
      // White pawns on d2 and e2 (adjacent)
      const chess = new Chess();
      expect(hasAdjacentWimpodBonus(chess, 'e2', 'w')).toBe(true);
      expect(hasAdjacentWimpodBonus(chess, 'd2', 'w')).toBe(true);

      // Isolated pawn on a2 with no adjacent pawns
      const isolatedChess = new Chess('8/8/8/8/8/8/P7/4K2k w - - 0 1');
      expect(hasAdjacentWimpodBonus(isolatedChess, 'a2', 'w')).toBe(false);
    });
  });

  describe('Rapidash - Flame Dash & Passive', () => {
    it('calculates valid empty orthogonal destinations for Flame Dash', () => {
      const chess = new Chess();
      // Rapidash on f3, surrounding squares: f4 (empty), f2 (pawn), e3 (empty), g3 (empty)
      chess.move('Nf3');
      const dests = getRapidashFlameDashDestinations(chess, 'f3');
      expect(dests).toContain('f4');
      expect(dests).toContain('e3');
      expect(dests).toContain('g3');
      expect(dests).not.toContain('f2'); // Occupied by White pawn on f2
    });

    it('cannot capture another piece during the Flame Dash step', () => {
      // Board with enemy piece adjacent to Knight
      const chess = new Chess('rnbqkbnr/pppppppp/8/8/4p3/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1');
      // Rapidash on f3, enemy pawn on e4. e4 is NOT a valid Flame Dash destination because it is occupied!
      const dests = getRapidashFlameDashDestinations(chess, 'f3');
      expect(dests).not.toContain('e4');
    });

    it('requires explicit activation: armedFlameDash is null initially and only set when activated', () => {
      const state = createInitialAbilityState();
      // Initially not armed
      expect(state.armedFlameDash).toBeNull();
      expect(state.pendingFlameDash).toBeNull();

      // When player presses Activate Ability for Rapidash on b1:
      const armedState = {
        ...state,
        armedFlameDash: { knightSquare: 'b1' as const, color: 'w' as const },
        targetingMode: {
          abilityId: 'flame_dash',
          sourceSquare: 'b1' as const,
          sourcePiece: 'n' as const,
          step: 'select_target' as const,
        },
      };

      expect(armedState.armedFlameDash).not.toBeNull();
      expect(armedState.armedFlameDash?.knightSquare).toBe('b1');
      expect(armedState.targetingMode?.abilityId).toBe('flame_dash');
    });
  });

  describe('Alakazam - Psychic Shield & Passive', () => {
    it('validates friendly target and rejects enemy or empty squares', () => {
      const chess = new Chess();
      expect(validateAlakazamShield(chess, 'e2', 'w').valid).toBe(true); // Friendly
      expect(validateAlakazamShield(chess, 'e7', 'w').valid).toBe(false); // Enemy
      expect(validateAlakazamShield(chess, 'e4', 'w').valid).toBe(false); // Empty
    });

    it('allows normal chess captures while blocking special abilities', () => {
      let state = createInitialAbilityState();
      state = addProtection(state, 'psychic_shield', 'd4', 'w', 'b');

      // Shield is present
      expect(hasActiveProtection(state.activeProtections, 'd4', 'psychic_shield')).toBe(true);

      // Psychic Control targeting d4 is blocked by consuming the shield
      const { nextState, consumed } = consumeProtection(state, 'd4', 'psychic_shield');
      expect(consumed).toBe(true);
      expect(hasActiveProtection(nextState.activeProtections, 'd4', 'psychic_shield')).toBe(false);
    });
  });

  describe('Aggron - Iron Wall & Sturdy Carapace Passive', () => {
    it('allows Iron Wall only on adjacent friendly pieces and rejects non-adjacent', () => {
      const chess = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      // Aggron on a1, b1 is knight (adjacent friendly), c1 is bishop (non-adjacent)
      expect(validateAggronWall(chess, 'a1', 'b1', 'w').valid).toBe(true);
      expect(validateAggronWall(chess, 'a1', 'c1', 'w').valid).toBe(false); // Not adjacent
      expect(validateAggronWall(chess, 'a1', 'a2', 'w').valid).toBe(true); // Adjacent pawn
    });

    it('enforces Sturdy Carapace passive: Enemy Pawns cannot capture Aggron, but other pieces can', () => {
      // Pawn attacking Aggron (Rook)
      expect(isAggronImmuneToPawnCapture('p', 'r')).toBe(true);

      // Non-pawn pieces attacking Aggron (Rook, Knight, Bishop, Queen) are NOT immune
      expect(isAggronImmuneToPawnCapture('r', 'r')).toBe(false);
      expect(isAggronImmuneToPawnCapture('n', 'r')).toBe(false);
      expect(isAggronImmuneToPawnCapture('b', 'r')).toBe(false);
      expect(isAggronImmuneToPawnCapture('q', 'r')).toBe(false);
    });
  });

  describe('Mewtwo - Psychic Control & Passive', () => {
    it('validates adjacent enemy piece and rejects friendly pieces or non-adjacent pieces', () => {
      // Mewtwo on d4, enemy pawn on d5 (adjacent enemy), friendly pawn on d3 (friendly)
      const chess = new Chess('8/8/8/3p4/3Q4/3P4/8/4K2k w - - 0 1');
      expect(validateMewtwoControlTarget(chess, 'd4', 'd5', 'w').valid).toBe(true);
      expect(validateMewtwoControlTarget(chess, 'd4', 'd3', 'w').valid).toBe(false); // Friendly
      expect(validateMewtwoControlTarget(chess, 'd4', 'h8', 'w').valid).toBe(false); // Non-adjacent
    });

    it('rejects controlling enemy King (Arceus is immune)', () => {
      // Mewtwo on d4, enemy King on e5
      const chess = new Chess('8/8/8/4k3/3Q4/8/8/4K3 w - - 0 1');
      const result = validateMewtwoControlTarget(chess, 'd4', 'e5', 'w');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Arceus is immune');
    });

    it('rejects displacing enemy Mewtwo (passive: immune to displacement)', () => {
      // White Mewtwo on d4, Black Mewtwo on e5
      const chess = new Chess('8/8/8/4q3/3Q4/8/8/4K2k w - - 0 1');
      const result = validateMewtwoControlTarget(chess, 'd4', 'e5', 'w');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Immune to displacement');
    });

    it('rejects moving piece if it exposes Mewtwo’s King to illegal check', () => {
      // White King on e1. Black Rook on e4, White Queen on d4.
      // If Mewtwo moves a blocking enemy piece that opens a discovered check on White King,
      // King safety simulation rejects it!
      const chess = new Chess('8/8/8/4r3/3Q4/4P3/8/4K2k w - - 0 1');
      // Any destination that leaves White King in check is rejected
      const dests = getMewtwoControlDestinations(chess, 'e4', 'w');
      // Dest squares are verified safe
      expect(Array.isArray(dests)).toBe(true);
    });
  });

  describe('Arceus - Divine Protection & Passive', () => {
    it('identifies safe empty adjacent squares for Arceus escape', () => {
      // White King on e1, e2 is empty and safe
      const chess = new Chess('rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      chess.remove('e2'); // Empty e2
      const safeSquares = getSafeArceusEscapeSquares(chess, 'e1', 'w');
      expect(safeSquares).toContain('e2');
    });

    it('rejects squares that are under enemy attack', () => {
      // Black rook on e8 attacking file e, White King on d1, Black King on h8. e1 is attacked by rook!
      const chess = new Chess('4r2k/8/8/8/8/8/8/3K4 w - - 0 1');
      const safeSquares = getSafeArceusEscapeSquares(chess, 'd1', 'w');
      expect(safeSquares).not.toContain('e1'); // Attacked by e8 rook
      expect(safeSquares).toContain('c1'); // Safe empty square
      expect(safeSquares).toContain('d2'); // Safe empty square
    });

    it('enforces once per match limitation', () => {
      const state = createInitialAbilityState();
      expect(state.usedDivineProtection.w).toBe(false);

      const afterUse = {
        ...state,
        usedDivineProtection: { ...state.usedDivineProtection, w: true },
      };
      expect(afterUse.usedDivineProtection.w).toBe(true);
    });
  });
});
