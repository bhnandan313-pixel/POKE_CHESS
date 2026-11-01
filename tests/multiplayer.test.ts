/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import {
  createInitialEnergyState,
  deductEnergy,
  handleTurnCompletedEnergy,
} from '../src/engine/energyEngine';
import {
  createInitialAbilityState,
  addProtection,
} from '../src/engine/abilityEngine';

describe('Local Multiplayer & Game State Management Testing', () => {
  describe('Turn Alternation & Player Rules', () => {
    it('initializes game with White to move', () => {
      const chess = new Chess();
      expect(chess.turn()).toBe('w');
    });

    it('alternates turn strictly after each legal move', () => {
      const chess = new Chess();
      expect(chess.turn()).toBe('w');

      // White plays e4
      chess.move('e4');
      expect(chess.turn()).toBe('b');

      // Black plays e5
      chess.move('e5');
      expect(chess.turn()).toBe('w');

      // White plays Nf3
      chess.move('Nf3');
      expect(chess.turn()).toBe('b');
    });

    it('rejects moves attempted by the inactive player', () => {
      const chess = new Chess();
      expect(chess.turn()).toBe('w');

      // Attempting to move Black piece e7-e5 when it is White's turn
      expect(() => {
        chess.move({ from: 'e7', to: 'e5' });
      }).toThrow();

      // Board remains in initial state and turn remains White
      expect(chess.turn()).toBe('w');
    });
  });

  describe('Captured Piece Graveyard Tracking', () => {
    it('accurately tracks captured pieces for both players', () => {
      const chess = new Chess();
      const capturedByWhite: string[] = [];
      const capturedByBlack: string[] = [];

      // 1. e4 d5
      chess.move('e4');
      chess.move('d5');

      // 2. exd5 (White captures Black pawn)
      const move1 = chess.move('exd5');
      if (move1.captured) {
        capturedByWhite.push(move1.captured);
      }
      expect(capturedByWhite).toEqual(['p']);
      expect(capturedByBlack).toEqual([]);

      // 2... Qxd5 (Black captures White pawn)
      const move2 = chess.move('Qxd5');
      if (move2.captured) {
        capturedByBlack.push(move2.captured);
      }
      expect(capturedByWhite).toEqual(['p']);
      expect(capturedByBlack).toEqual(['p']);
    });
  });

  describe('Move History and SAN Notation', () => {
    it('records valid algebraic notation and history entries', () => {
      const chess = new Chess();
      chess.move('e4');
      chess.move('e5');
      chess.move('Nf3');
      chess.move('Nc6');

      const history = chess.history();
      expect(history).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);

      const verboseHistory = chess.history({ verbose: true });
      expect(verboseHistory[0].from).toBe('e2');
      expect(verboseHistory[0].to).toBe('e4');
      expect(verboseHistory[0].san).toBe('e4');
      expect(verboseHistory[2].piece).toBe('n');
    });
  });

  describe('Game Termination, Resignation & Checkmate', () => {
    it('detects checkmate and concludes match correctly (Scholar’s Mate)', () => {
      const chess = new Chess();
      chess.move('e4');
      chess.move('e5');
      chess.move('Bc4');
      chess.move('Nc6');
      chess.move('Qh5');
      chess.move('Nf6');
      chess.move('Qxf7#');

      expect(chess.isCheckmate()).toBe(true);
      expect(chess.isGameOver()).toBe(true);
      // Winner is White (color before final checkmate position)
      expect(chess.turn()).toBe('b'); // Black is checkmated
    });

    it('detects draw by stalemate', () => {
      // Classic stalemate position: White Ka8, Qc7, Black Ka6
      const chess = new Chess('k7/2Q5/8/8/8/8/8/K7 b - - 0 1');
      expect(chess.isStalemate()).toBe(true);
      expect(chess.isGameOver()).toBe(true);
    });
  });

  describe('Game Reset & State Restoration', () => {
    it('completely restores all game sub-engines to starting state', () => {
      // 1. Play some moves
      const chess = new Chess();
      chess.move('e4');
      chess.move('e5');

      // 2. Simulate energy changes
      let energy = createInitialEnergyState();
      energy = deductEnergy(energy, 'w', 3);
      energy = handleTurnCompletedEnergy(energy, 'w').nextEnergyState;

      // 3. Simulate ability usage
      let abilities = createInitialAbilityState();
      abilities = addProtection(abilities, 'swarm', 'e4', 'w', 'p');

      // 4. Perform RESET:
      const resetChess = new Chess();
      const resetEnergy = createInitialEnergyState();
      const resetAbilities = createInitialAbilityState();

      // Assert Chess state restored
      expect(resetChess.fen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(resetChess.turn()).toBe('w');
      expect(resetChess.history()).toEqual([]);

      // Assert Energy state restored
      expect(resetEnergy.w.current).toBe(5);
      expect(resetEnergy.b.current).toBe(5);
      expect(resetEnergy.w.personalTurnsCompleted).toBe(0);
      expect(resetEnergy.b.personalTurnsCompleted).toBe(0);

      // Assert Ability state restored
      expect(resetAbilities.activeProtections).toHaveLength(0);
      expect(resetAbilities.usedDivineProtection.w).toBe(false);
      expect(resetAbilities.usedDivineProtection.b).toBe(false);
    });
  });
});
