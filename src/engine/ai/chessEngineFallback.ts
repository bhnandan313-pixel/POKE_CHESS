/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Chess, Move, Color, Square, PieceSymbol } from 'chess.js';

// Material base values (in centipawns)
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (from White's perspective; indexed a1=0 to h8=63)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0,
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];

/**
 * Returns square index 0-63 (0=a8 in 8x8 matrix or standard rank/file)
 */
function squareToIndex(sq: Square, color: Color): number {
  const file = sq.charCodeAt(0) - 97; // a=0, h=7
  const rank = parseInt(sq[1], 10) - 1; // 1=0, 8=7
  // Flip rank if Black for symmetric piece-square evaluation
  const effectiveRank = color === 'w' ? 7 - rank : rank;
  return effectiveRank * 8 + file;
}

/**
 * Evaluates board statically from perspective of player 'turnColor'.
 * Positive score means advantage for turnColor.
 */
export function evaluateBoardState(chess: Chess, turnColor: Color): number {
  if (chess.isCheckmate()) {
    return chess.turn() === turnColor ? -100000 : 100000;
  }
  if (chess.isDraw() || chess.isStalemate()) {
    return 0;
  }

  let whiteScore = 0;
  let blackScore = 0;

  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = PIECE_VALUES[piece.type];
      const sq = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
      const idx = squareToIndex(sq, piece.color);

      let posBonus = 0;
      switch (piece.type) {
        case 'p':
          posBonus = PAWN_TABLE[idx] || 0;
          break;
        case 'n':
          posBonus = KNIGHT_TABLE[idx] || 0;
          break;
        case 'b':
          posBonus = BISHOP_TABLE[idx] || 0;
          break;
        case 'r':
          posBonus = ROOK_TABLE[idx] || 0;
          break;
        case 'q':
          posBonus = QUEEN_TABLE[idx] || 0;
          break;
        case 'k':
          posBonus = KING_TABLE[idx] || 0;
          break;
      }

      const totalVal = baseVal + posBonus;
      if (piece.color === 'w') {
        whiteScore += totalVal;
      } else {
        blackScore += totalVal;
      }
    }
  }

  // Mobility bonus (number of legal moves available to side)
  const mobility = chess.moves().length * 4;
  if (chess.turn() === 'w') {
    whiteScore += mobility;
  } else {
    blackScore += mobility;
  }

  // In check penalty
  if (chess.inCheck()) {
    if (chess.turn() === 'w') whiteScore -= 50;
    else blackScore -= 50;
  }

  const netScore = whiteScore - blackScore;
  return turnColor === 'w' ? netScore : -netScore;
}

export interface SearchResult {
  move: Move | null;
  score: number;
}

/**
 * Minimax with Alpha-Beta pruning for fast fallback standard chess move evaluation.
 */
export function minimaxSearch(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  perspectiveColor: Color
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoardState(chess, perspectiveColor);
  }

  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) {
    return evaluateBoardState(chess, perspectiveColor);
  }

  // Move ordering: captures and checks first
  legalMoves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece];
    if (b.captured) scoreB += PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece];
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;
    return scoreB - scoreA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      chess.move(move);
      const evaluation = minimaxSearch(
        chess,
        depth - 1,
        alpha,
        beta,
        false,
        perspectiveColor
      );
      chess.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      chess.move(move);
      const evaluation = minimaxSearch(
        chess,
        depth - 1,
        alpha,
        beta,
        true,
        perspectiveColor
      );
      chess.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Evaluates all legal moves for the active player and returns the best chess move.
 */
export function findBestChessMove(
  chess: Chess,
  depth: number = 2
): SearchResult {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) {
    return { move: null, score: evaluateBoardState(chess, chess.turn()) };
  }

  const turn = chess.turn();
  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  // Search each candidate
  for (const move of legalMoves) {
    chess.move(move);
    const score = minimaxSearch(
      chess,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      turn
    );
    chess.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return { move: bestMove, score: bestScore };
}
