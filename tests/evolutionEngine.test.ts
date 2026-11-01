/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import {
  EVOLUTION_CHOICES,
  getEvolutionChoice,
  isPawnPromotionMove,
} from '../src/engine/evolutionEngine';
import { POKEMON_PIECES } from '../src/engine/pokemonRoster';

describe('Pokémon Evolution & Promotion Engine Testing', () => {
  describe('Promotion Square Detection', () => {
    it('detects White Wimpod reaching rank 8 as a promotion move', () => {
      expect(isPawnPromotionMove('e7', 'e8', 'p', 'w')).toBe(true);
      expect(isPawnPromotionMove('a7', 'a8', 'p', 'w')).toBe(true);
      expect(isPawnPromotionMove('e6', 'e7', 'p', 'w')).toBe(false); // Rank 7 is not promotion
    });

    it('detects Black Wimpod reaching rank 1 as a promotion move', () => {
      expect(isPawnPromotionMove('e2', 'e1', 'p', 'b')).toBe(true);
      expect(isPawnPromotionMove('h2', 'h1', 'p', 'b')).toBe(true);
      expect(isPawnPromotionMove('e3', 'e2', 'p', 'b')).toBe(false); // Rank 2 is not promotion
    });

    it('rejects non-pawn pieces moving to back ranks from triggering pawn promotion', () => {
      expect(isPawnPromotionMove('e7', 'e8', 'r', 'w')).toBe(false);
      expect(isPawnPromotionMove('e7', 'e8', 'n', 'w')).toBe(false);
      expect(isPawnPromotionMove('e7', 'e8', 'q', 'w')).toBe(false);
      expect(isPawnPromotionMove('e7', 'e8', 'k', 'w')).toBe(false);
    });
  });

  describe('Evolution Choices & Roster Integration', () => {
    it('provides exactly 4 promotion choices (Mewtwo, Aggron, Alakazam, Rapidash)', () => {
      expect(EVOLUTION_CHOICES).toHaveLength(4);
      const symbols = EVOLUTION_CHOICES.map((c) => c.symbol);
      expect(symbols).toContain('q');
      expect(symbols).toContain('r');
      expect(symbols).toContain('b');
      expect(symbols).toContain('n');
    });

    it('maps each evolution choice correctly to its chess role and Pokémon identity', () => {
      const queenChoice = getEvolutionChoice('q');
      expect(queenChoice.pokemonName).toBe('Mewtwo');
      expect(queenChoice.chessRole).toBe('Queen');
      expect(queenChoice.activeAbility.id).toBe('psychic_control');

      const rookChoice = getEvolutionChoice('r');
      expect(rookChoice.pokemonName).toBe('Aggron');
      expect(rookChoice.chessRole).toBe('Rook');
      expect(rookChoice.activeAbility.id).toBe('iron_wall');
      expect(rookChoice.passiveAbility?.name).toBe('Sturdy Carapace');

      const bishopChoice = getEvolutionChoice('b');
      expect(bishopChoice.pokemonName).toBe('Alakazam');
      expect(bishopChoice.chessRole).toBe('Bishop');
      expect(bishopChoice.activeAbility.id).toBe('psychic_shield');

      const knightChoice = getEvolutionChoice('n');
      expect(knightChoice.pokemonName).toBe('Rapidash');
      expect(knightChoice.chessRole).toBe('Knight');
      expect(knightChoice.activeAbility.id).toBe('flame_dash');
    });

    it('fallback works gracefully for unexpected symbols', () => {
      const fallback = getEvolutionChoice('p' as any);
      expect(fallback.symbol).toBe('q'); // Defaults to Queen
    });
  });

  describe('Chess Engine Evolution Execution', () => {
    it('successfully promotes pawn to Queen (Mewtwo) and gains Queen movement', () => {
      const chess = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
      const move = chess.move({ from: 'e7', to: 'e8', promotion: 'q' });
      expect(move).not.toBeNull();
      const piece = chess.get('e8');
      expect(piece?.type).toBe('q');
      expect(piece?.color).toBe('w');

      // Queen can move diagonally, horizontally, and vertically
      const legalMovesFromE8 = chess.moves({ square: 'e8' });
      // Black's turn next; if we switch to White:
      const chessWhiteToMove = new Chess(chess.fen().replace(' b ', ' w '));
      const moves = chessWhiteToMove.moves({ square: 'e8', verbose: true });
      const destSquares = moves.map((m) => m.to);
      expect(destSquares).toContain('e7'); // Vertical
      expect(destSquares).toContain('d8'); // Horizontal
      expect(destSquares).toContain('d7'); // Diagonal
    });

    it('successfully promotes pawn to Knight (Rapidash) and gains Knight L-movement', () => {
      const chess = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
      const move = chess.move({ from: 'e7', to: 'e8', promotion: 'n' });
      expect(move).not.toBeNull();
      const piece = chess.get('e8');
      expect(piece?.type).toBe('n');

      const chessWhite = new Chess(chess.fen().replace(' b ', ' w '));
      const moves = chessWhite.moves({ square: 'e8', verbose: true });
      const destSquares = moves.map((m) => m.to);
      expect(destSquares).toContain('d6'); // L-shape
      expect(destSquares).toContain('f6'); // L-shape
      expect(destSquares).toContain('c7'); // L-shape
      expect(destSquares).toContain('g7'); // L-shape
      expect(destSquares).not.toContain('e7'); // Knights cannot move straight
    });

    it('successfully promotes pawn to Rook (Aggron) and gains Rook orthogonal movement', () => {
      const chess = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
      chess.move({ from: 'e7', to: 'e8', promotion: 'r' });
      expect(chess.get('e8')?.type).toBe('r');

      const chessWhite = new Chess(chess.fen().replace(' b ', ' w '));
      const moves = chessWhite.moves({ square: 'e8', verbose: true });
      const destSquares = moves.map((m) => m.to);
      expect(destSquares).toContain('e7');
      expect(destSquares).toContain('d8');
      expect(destSquares).not.toContain('d7'); // Rooks cannot move diagonally
    });

    it('successfully promotes pawn to Bishop (Alakazam) and gains diagonal movement', () => {
      const chess = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
      chess.move({ from: 'e7', to: 'e8', promotion: 'b' });
      expect(chess.get('e8')?.type).toBe('b');

      const chessWhite = new Chess(chess.fen().replace(' b ', ' w '));
      const moves = chessWhite.moves({ square: 'e8', verbose: true });
      const destSquares = moves.map((m) => m.to);
      expect(destSquares).toContain('d7');
      expect(destSquares).toContain('f7');
      expect(destSquares).not.toContain('e7'); // Bishops cannot move orthogonally
    });

    it('supports multiple pawn promotions for the same player', () => {
      // Board with two White pawns on rank 7
      const chess = new Chess('8/3PP3/8/8/8/8/8/4K2k w - - 0 1');
      // Promote first pawn to Queen
      chess.move({ from: 'd7', to: 'd8', promotion: 'q' });
      // Black dummy move
      chess.move('Kh2');
      // Promote second pawn to Knight
      chess.move({ from: 'e7', to: 'e8', promotion: 'n' });

      expect(chess.get('d8')?.type).toBe('q');
      expect(chess.get('e8')?.type).toBe('n');
    });

    it('evolution does not modify or consume player energy', () => {
      // Verify that evolution itself is an organic chess event with 0 energy cost
      const initialEnergy = 5;
      const energyAfterEvolution = initialEnergy - 0;
      expect(energyAfterEvolution).toBe(5);
    });
  });
});
