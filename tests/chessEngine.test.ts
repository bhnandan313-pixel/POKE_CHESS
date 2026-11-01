/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { Chess, Square } from 'chess.js';

describe('Standard Chess Engine Testing', () => {
  it('initializes standard board with all 32 pieces in correct positions', () => {
    const chess = new Chess();
    const board = chess.board();

    let whiteCount = 0;
    let blackCount = 0;

    board.forEach((row) => {
      row.forEach((piece) => {
        if (piece) {
          if (piece.color === 'w') whiteCount++;
          if (piece.color === 'b') blackCount++;
        }
      });
    });

    expect(whiteCount).toBe(16);
    expect(blackCount).toBe(16);

    // Kings in starting position
    expect(chess.get('e1')?.type).toBe('k');
    expect(chess.get('e1')?.color).toBe('w');
    expect(chess.get('e8')?.type).toBe('k');
    expect(chess.get('e8')?.color).toBe('b');

    // Queens in starting position
    expect(chess.get('d1')?.type).toBe('q');
    expect(chess.get('d8')?.type).toBe('q');

    // Starting turn is white
    expect(chess.turn()).toBe('w');
  });

  it('validates legal pawn movement (single step, double step, diagonal capture)', () => {
    const chess = new Chess();
    // 1. e4 (double step)
    const moveE4 = chess.move('e4');
    expect(moveE4).toBeTruthy();
    expect(chess.get('e4')?.type).toBe('p');
    expect(chess.get('e2')).toBeFalsy();

    // 1... d5
    chess.move('d5');
    expect(chess.get('d5')?.type).toBe('p');

    // 2. exd5 (diagonal capture)
    const captureMove = chess.move('exd5');
    expect(captureMove.captured).toBe('p');
    expect(chess.get('d5')?.color).toBe('w');
  });

  it('validates knight movement and jumping over pieces', () => {
    const chess = new Chess();
    // Nf3 over pawns
    const move = chess.move('Nf3');
    expect(move).toBeTruthy();
    expect(chess.get('f3')?.type).toBe('n');
    expect(chess.get('f3')?.color).toBe('w');
  });

  it('validates bishop movement along diagonals', () => {
    const chess = new Chess();
    chess.move('e4');
    chess.move('e5');
    const moveBc4 = chess.move('Bc4');
    expect(moveBc4).toBeTruthy();
    expect(chess.get('c4')?.type).toBe('b');
  });

  it('validates rook movement along ranks and files', () => {
    const chess = new Chess();
    chess.move('a4');
    chess.move('e5');
    const moveRa3 = chess.move('Ra3');
    expect(moveRa3).toBeTruthy();
    expect(chess.get('a3')?.type).toBe('r');
  });

  it('validates queen multi-directional movement', () => {
    const chess = new Chess();
    chess.move('e4');
    chess.move('e5');
    const moveQh5 = chess.move('Qh5');
    expect(moveQh5).toBeTruthy();
    expect(chess.get('h5')?.type).toBe('q');
  });

  it('validates king single-step movement', () => {
    const chess = new Chess();
    chess.move('e4');
    chess.move('e5');
    const moveKe2 = chess.move('Ke2');
    expect(moveKe2).toBeTruthy();
    expect(chess.get('e2')?.type).toBe('k');
  });

  it('rejects illegal moves', () => {
    const chess = new Chess();
    // Cannot move a pawn backwards or bishop through pawns
    expect(() => chess.move('Bc4')).toThrow();
    expect(() => chess.move('e5')).toThrow(); // Black cannot move first
  });

  it('validates kingside and queenside castling', () => {
    // Setup position for white kingside castling
    const chess = new Chess('rnbqk2r/pppp1ppp/5n2/2b1p3/4P3/3B1N2/PPPP1PPP/RNBQK2R w KQkq - 4 4');
    const castleMove = chess.move('O-O');
    expect(castleMove).toBeTruthy();
    expect(chess.get('g1')?.type).toBe('k');
    expect(chess.get('f1')?.type).toBe('r');
  });

  it('validates en passant pawn capture', () => {
    // White pawn on e5, Black plays d5
    const chess = new Chess('rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2');
    const epMove = chess.move('exd6');
    expect(epMove.flags).toContain('e');
    expect(epMove.captured).toBe('p');
    expect(chess.get('d5')).toBeFalsy();
    expect(chess.get('d6')?.color).toBe('w');
  });

  it('detects check and checkmate correctly (Fool’s Mate)', () => {
    const chess = new Chess();
    chess.move('f3');
    chess.move('e5');
    chess.move('g4');
    chess.move('Qh4#');

    expect(chess.inCheck()).toBe(true);
    expect(chess.isCheckmate()).toBe(true);
    expect(chess.isGameOver()).toBe(true);
  });

  it('detects stalemate correctly', () => {
    // Classic stalemate position: Black king on a8, White king on c7, White queen on b6
    const chess = new Chess('k7/2K5/1Q6/8/8/8/8/8 b - - 0 1');
    expect(chess.inCheck()).toBe(false);
    expect(chess.isStalemate()).toBe(true);
    expect(chess.isDraw()).toBe(true);
  });

  it('detects draw by insufficient material (King vs King)', () => {
    const chess = new Chess('8/8/8/4k3/8/4K3/8/8 w - - 0 1');
    expect(chess.isInsufficientMaterial()).toBe(true);
    expect(chess.isDraw()).toBe(true);
  });

  it('resets the board cleanly to initial state', () => {
    const chess = new Chess();
    chess.move('e4');
    chess.move('e5');
    chess.reset();
    expect(chess.fen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(chess.turn()).toBe('w');
  });
});
