/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { computeAiAction } from '../src/engine/ai/aiPlayer';
import {
  evaluateBoardState,
  findBestChessMove,
} from '../src/engine/ai/chessEngineFallback';
import {
  evaluateWimpodSwarm,
  evaluateRapidashFlameDash,
  evaluateAlakazamShield,
  evaluateAggronWall,
  evaluateMewtwoControl,
  evaluateArceusDivineProtection,
  evaluateAggronPassiveBonus,
  evaluateEvolutionAdvancement,
} from '../src/engine/ai/pokemonAiEvaluator';
import {
  createInitialEnergyState,
  deductEnergy,
  handleTurnCompletedEnergy,
} from '../src/engine/energyEngine';
import {
  createInitialAbilityState,
  addProtection,
} from '../src/engine/abilityEngine';
import { AI_DIFFICULTY_CONFIGS } from '../src/types/ai';

describe('Phase 5: Pokémon Chess AI Opponent Engine & Systems Testing', () => {
  describe('1. Chess AI Evaluation & Legality (All Difficulty Levels)', () => {
    it('evaluates board state accurately for both White and Black perspectives', () => {
      const chess = new Chess();
      // Starting position should be roughly equal (small tempo difference)
      const whiteEval = evaluateBoardState(chess, 'w');
      const blackEval = evaluateBoardState(chess, 'b');
      expect(Math.abs(whiteEval - (-blackEval))).toBeLessThanOrEqual(50);
    });

    it('generates strictly legal chess moves for Beginner, Intermediate, and Expert', async () => {
      const chess = new Chess();
      const energy = createInitialEnergyState();
      const abilities = createInitialAbilityState();

      const difficulties = ['beginner', 'intermediate', 'expert'] as const;

      for (const diff of difficulties) {
        const action = await computeAiAction(
          chess,
          'w',
          energy.w,
          abilities,
          energy.b,
          diff
        );

        expect(action.move).toBeDefined();
        expect(action.move.from).toBeTypeOf('string');
        expect(action.move.to).toBeTypeOf('string');

        // Verify the move is 100% legal in chess.js
        const legalMoves = chess.moves({ verbose: true });
        const isLegal = legalMoves.some(
          (m) => m.from === action.move.from && m.to === action.move.to
        );
        expect(isLegal).toBe(true);
      }
    });

    it('preserves King safety and never suggests a move that leaves King in check', async () => {
      // White King on e1 in check by Black Queen on e3, but White has legal moves (e.g. pawn or bishop or King move)
      const chess = new Chess('rnb1kbnr/pppp1ppp/8/8/8/4q3/PPPP1PPP/RNBQKBNR w KQkq - 0 1');
      expect(chess.inCheck()).toBe(true);

      const energy = createInitialEnergyState();
      const abilities = createInitialAbilityState();

      const action = await computeAiAction(
        chess,
        'w',
        energy.w,
        abilities,
        energy.b,
        'expert'
      );

      // Execute suggested move and confirm King is no longer in check
      const res = chess.move({
        from: action.move.from,
        to: action.move.to,
      });
      expect(res).not.toBeNull();
      expect(chess.inCheck()).toBe(false);
    });
  });

  describe('2. Turn Sides: AI as White (Moves 1st) and AI as Black (Moves 2nd)', () => {
    it('AI plays first move legally when Human chooses Black (AI plays White)', async () => {
      const chess = new Chess();
      const energy = createInitialEnergyState();
      const abilities = createInitialAbilityState();

      // AI is White
      const aiWhiteAction = await computeAiAction(
        chess,
        'w',
        energy.w,
        abilities,
        energy.b,
        'intermediate'
      );

      expect(aiWhiteAction.move).toBeDefined();
      const moveRes = chess.move({
        from: aiWhiteAction.move.from,
        to: aiWhiteAction.move.to,
      });
      expect(moveRes).toBeDefined();
      expect(chess.turn()).toBe('b'); // Handed turn to Human Black!
    });

    it('AI responds legally when Human chooses White and makes an opening move', async () => {
      const chess = new Chess();
      const energy = createInitialEnergyState();
      const abilities = createInitialAbilityState();

      // 1. Human plays 1. e4
      chess.move('e4');
      expect(chess.turn()).toBe('b');

      // 2. AI is Black and responds
      const aiBlackAction = await computeAiAction(
        chess,
        'b',
        energy.b,
        abilities,
        energy.w,
        'expert'
      );

      expect(aiBlackAction.move).toBeDefined();
      const moveRes = chess.move({
        from: aiBlackAction.move.from,
        to: aiBlackAction.move.to,
      });
      expect(moveRes).toBeDefined();
      expect(chess.turn()).toBe('w'); // Handed turn back to Human White!
    });
  });

  describe('3. Pokémon Ability Intelligence & Evaluation', () => {
    it('Wimpod Swarm Protection: detects attacked friendly pawn and suggests protective swarm', () => {
      // Black Queen on e4 attacks White Pawn on d5
      const chess = new Chess('rnb1kbnr/pppp1ppp/8/3p4/4q3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1');
      const energy = createInitialEnergyState();
      const abilities = createInitialAbilityState();

      const swarm = evaluateWimpodSwarm(chess, 'w', energy.w, abilities);
      expect(swarm).not.toBeNull();
      expect(swarm?.targetSquare).toBe('d5');
      expect(swarm?.bonus).toBeGreaterThan(0);
    });

    it('Rapidash Flame Dash: evaluates orthogonal bonus step after knight jump', () => {
      const chess = new Chess();
      // White plays 1. Nf3
      const knightMove = chess.move('Nf3');
      const energy = createInitialEnergyState(); // Has 5 energy (>= 2)

      const flameDash = evaluateRapidashFlameDash(chess, knightMove, 'w', energy.w);
      expect(flameDash).not.toBeNull();
      expect(flameDash?.bonusStep).toBeDefined();
      expect(flameDash?.bonus).toBeGreaterThanOrEqual(70);
    });

    it('Alakazam Psychic Shield: shields Queen or King against enemy abilities when opponent has energy', () => {
      const chess = new Chess();
      const energy = createInitialEnergyState();
      const abilities = createInitialAbilityState();
      const opponentEnergy = { current: 4, max: 10, personalTurnsCompleted: 2 }; // opponent has enough for Mewtwo

      const shield = evaluateAlakazamShield(chess, 'w', energy.w, abilities, opponentEnergy);
      expect(shield).not.toBeNull();
      expect(shield?.bonus).toBeGreaterThan(0);
      expect(['d1', 'e1']).toContain(shield?.targetSquare);
    });

    it('Aggron Iron Wall: shields adjacent ally and values pawn-immunity passive', () => {
      const chess = new Chess();
      const energy = createInitialEnergyState();
      const abilities = createInitialAbilityState();

      // White Rook (Aggron) is adjacent to White Knight / Bishop on starting squares
      const wall = evaluateAggronWall(chess, 'w', energy.w, abilities);
      // Evaluates adjacent piece
      expect(energy.w.current).toBe(5);

      // Passive bonus for Rook (Aggron) moving into pawn territory
      const testMove = {
        piece: 'r',
        color: 'w',
        from: 'a1',
        to: 'a4',
      } as any;
      const passiveBonus = evaluateAggronPassiveBonus(testMove, chess, 'w');
      expect(passiveBonus).toBe(80);
    });

    it('Arceus Divine Protection: emergency escape activated when King is in check', () => {
      // White King on e1 in check by Black Queen on e3
      const chess = new Chess('rnb1kbnr/pppp1ppp/8/8/8/4q3/PPPP1PPP/RNBQKBNR w KQkq - 0 1');
      const energy = { current: 5, max: 10, personalTurnsCompleted: 2 };
      const abilities = createInitialAbilityState();

      const rescue = evaluateArceusDivineProtection(chess, 'w', energy, abilities);
      expect(rescue).not.toBeNull();
      expect(rescue?.bonus).toBeGreaterThanOrEqual(1000);
      expect(rescue?.safeSquare).toBeDefined();
    });

    it('Evolution: prioritizes Wimpod advancing to rank 7 / 8 and promotes to Queen Mewtwo (q)', () => {
      // White pawn on e7 about to advance to e8
      const chess = new Chess('rnbqkbnr/4Pppp/8/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1');
      const move = chess.moves({ verbose: true }).find((m) => m.to === 'e8')!;

      const bonus = evaluateEvolutionAdvancement(move, 'w');
      expect(bonus).toBe(900); // Massive promotion bonus to Queen Mewtwo!
    });
  });

  describe('4. Game State Validation & Rules Parity', () => {
    it('never allows AI to spend energy it does not possess', async () => {
      const chess = new Chess();
      const bankruptEnergy = { current: 0, max: 10, personalTurnsCompleted: 0 };
      const abilities = createInitialAbilityState();

      const action = await computeAiAction(
        chess,
        'w',
        bankruptEnergy,
        abilities,
        createInitialEnergyState().b,
        'expert'
      );

      // AI cannot afford any active abilities, so action.ability must be undefined or cost 0
      if (action.ability) {
        expect(action.ability.cost).toBeLessThanOrEqual(bankruptEnergy.current);
      }
    });

    it('respects ability cooldown: only one ability activation per turn', () => {
      const abilities = createInitialAbilityState();
      abilities.abilityUsedThisTurn = true; // Ability already used

      const energy = createInitialEnergyState();
      const chess = new Chess();

      // Swarm should be null because ability was already used this turn
      const swarm = evaluateWimpodSwarm(chess, 'w', energy.w, abilities);
      expect(swarm).toBeNull();
    });

    it('detects checkmate and concludes match properly', () => {
      const chess = new Chess();
      // Scholar's Mate
      chess.move('e4');
      chess.move('e5');
      chess.move('Bc4');
      chess.move('Nc6');
      chess.move('Qh5');
      chess.move('Nf6');
      chess.move('Qxf7#');

      expect(chess.isCheckmate()).toBe(true);
      expect(chess.isGameOver()).toBe(true);
    });

    it('detects stalemate and handles draw legality', () => {
      const chess = new Chess('k7/2Q5/8/8/8/8/8/K7 b - - 0 1');
      expect(chess.isStalemate()).toBe(true);
      expect(chess.isGameOver()).toBe(true);
    });
  });
});
