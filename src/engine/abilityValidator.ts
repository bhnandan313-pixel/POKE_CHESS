/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Chess, Square, PieceSymbol, Color } from 'chess.js';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export function squareToCoords(square: Square): { x: number; y: number } {
  const f = square[0];
  const r = square[1];
  return {
    x: FILES.indexOf(f),
    y: RANKS.indexOf(r),
  };
}

export function coordsToSquare(x: number, y: number): Square | null {
  if (x < 0 || x > 7 || y < 0 || y > 7) return null;
  return `${FILES[x]}${RANKS[y]}` as Square;
}

export function getAdjacentSquares(square: Square): Square[] {
  const { x, y } = squareToCoords(square);
  const squares: Square[] = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const s = coordsToSquare(x + dx, y + dy);
      if (s) squares.push(s);
    }
  }
  return squares;
}

export function getOrthogonalSquares(square: Square): Square[] {
  const { x, y } = squareToCoords(square);
  const squares: Square[] = [];
  const dirs = [
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
  ];

  for (const { dx, dy } of dirs) {
    const s = coordsToSquare(x + dx, y + dy);
    if (s) squares.push(s);
  }
  return squares;
}

export function isAggronImmuneToPawnCapture(attackerType: PieceSymbol, defenderType: PieceSymbol): boolean {
  // Passive: Enemy pawns cannot directly capture Aggron
  return attackerType === 'p' && defenderType === 'r';
}

export function validateWimpodSwarm(
  chess: Chess,
  targetSquare: Square,
  playerColor: Color
): { valid: boolean; reason?: string } {
  const piece = chess.get(targetSquare);
  if (!piece) {
    return { valid: false, reason: 'Target square is empty.' };
  }
  if (piece.color !== playerColor) {
    return { valid: false, reason: 'Can only protect a friendly Wimpod.' };
  }
  if (piece.type !== 'p') {
    return { valid: false, reason: 'Swarm Protection only applies to Wimpod (Pawn).' };
  }
  return { valid: true };
}

export function validateAlakazamShield(
  chess: Chess,
  targetSquare: Square,
  playerColor: Color
): { valid: boolean; reason?: string } {
  const piece = chess.get(targetSquare);
  if (!piece) {
    return { valid: false, reason: 'Target square is empty.' };
  }
  if (piece.color !== playerColor) {
    return { valid: false, reason: 'Can only shield a friendly Pokémon.' };
  }
  return { valid: true };
}

export function validateAggronWall(
  chess: Chess,
  aggronSquare: Square,
  targetSquare: Square,
  playerColor: Color
): { valid: boolean; reason?: string } {
  const piece = chess.get(targetSquare);
  if (!piece) {
    return { valid: false, reason: 'Target square is empty.' };
  }
  if (piece.color !== playerColor) {
    return { valid: false, reason: 'Can only shield a friendly Pokémon.' };
  }
  const adjacent = getAdjacentSquares(aggronSquare);
  if (!adjacent.includes(targetSquare)) {
    return { valid: false, reason: 'Target Pokémon must be adjacent to Aggron.' };
  }
  return { valid: true };
}

export function hasAdjacentWimpodBonus(
  chess: Chess,
  square: Square,
  playerColor: Color
): boolean {
  const piece = chess.get(square);
  if (!piece || piece.type !== 'p' || piece.color !== playerColor) return false;
  const adjacent = getAdjacentSquares(square);
  return adjacent.some((adjSquare) => {
    const adjPiece = chess.get(adjSquare);
    return adjPiece && adjPiece.type === 'p' && adjPiece.color === playerColor;
  });
}

export function validateMewtwoControlTarget(
  chess: Chess,
  mewtwoSquare: Square,
  targetSquare: Square,
  mewtwoColor: Color
): { valid: boolean; reason?: string } {
  const piece = chess.get(targetSquare);
  if (!piece) {
    return { valid: false, reason: 'Target square is empty.' };
  }
  if (piece.color === mewtwoColor) {
    return { valid: false, reason: 'Must target an adjacent enemy Pokémon.' };
  }
  if (piece.type === 'k') {
    return { valid: false, reason: 'Cannot control the enemy King (Arceus is immune).' };
  }
  if (piece.type === 'q') {
    return { valid: false, reason: 'Cannot displace enemy Mewtwo (Passive: Immune to displacement).' };
  }
  const adjacent = getAdjacentSquares(mewtwoSquare);
  if (!adjacent.includes(targetSquare)) {
    return { valid: false, reason: 'Target must be adjacent to Mewtwo.' };
  }
  return { valid: true };
}

export function getMewtwoControlDestinations(
  chess: Chess,
  targetSquare: Square,
  mewtwoColor: Color
): Square[] {
  const piece = chess.get(targetSquare);
  if (!piece || piece.type === 'k') return [];

  const adjacent = getAdjacentSquares(targetSquare);
  const validDests: Square[] = [];

  for (const dest of adjacent) {
    // Destination must be empty
    if (chess.get(dest)) continue;

    // Simulation check: Does moving the piece leave Mewtwo's King in check?
    // We clone the board state and verify king safety
    try {
      const fen = chess.fen();
      const sim = new Chess(fen);
      const pieceToMove = sim.remove(targetSquare);
      if (pieceToMove) {
        sim.put(pieceToMove, dest);
        // Find Mewtwo's king position
        let mewtwoKingSquare: Square | null = null;
        for (const f of FILES) {
          for (const r of RANKS) {
            const sq = `${f}${r}` as Square;
            const p = sim.get(sq);
            if (p && p.type === 'k' && p.color === mewtwoColor) {
              mewtwoKingSquare = sq;
              break;
            }
          }
          if (mewtwoKingSquare) break;
        }

        const opponentColor: Color = mewtwoColor === 'w' ? 'b' : 'w';
        // Ensure Mewtwo's King is not exposed to check
        if (mewtwoKingSquare && sim.isAttacked(mewtwoKingSquare, opponentColor)) {
          continue; // Illegal position for active player
        }

        validDests.push(dest);
      }
    } catch {
      // If simulation fails, do not allow
    }
  }

  return validDests;
}

export function getRapidashFlameDashDestinations(
  chess: Chess,
  rapidashSquare: Square
): Square[] {
  const orthogonals = getOrthogonalSquares(rapidashSquare);
  // Additional destination must be empty. Cannot capture another piece.
  return orthogonals.filter((sq) => !chess.get(sq));
}

export function getSafeArceusEscapeSquares(
  chess: Chess,
  arceusSquare: Square,
  color: Color
): Square[] {
  const adjacent = getAdjacentSquares(arceusSquare);
  const opponentColor: Color = color === 'w' ? 'b' : 'w';
  const safeDests: Square[] = [];

  for (const dest of adjacent) {
    // Destination must be empty
    if (chess.get(dest)) continue;

    // Destination must not be under attack
    if (chess.isAttacked(dest, opponentColor)) continue;

    // Simulate move to ensure no discovery check remains
    try {
      const fen = chess.fen();
      const sim = new Chess(fen);
      const k = sim.remove(arceusSquare);
      if (k) {
        sim.put(k, dest);
        if (!sim.isAttacked(dest, opponentColor)) {
          safeDests.push(dest);
        }
      }
    } catch {
      // ignore
    }
  }

  return safeDests;
}
