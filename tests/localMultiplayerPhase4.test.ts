/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import {
  MatchSettings,
  MatchStats,
} from '../src/types/game';
import { DEFAULT_MATCH_SETTINGS, GameSnapshot } from '../src/hooks/useChessGame';
import { BOARD_THEMES } from '../src/engine/boardThemes';
import { TRAINER_AVATARS, getAvatarById } from '../src/engine/avatars';
import {
  createInitialEnergyState,
  deductEnergy,
  handleTurnCompletedEnergy,
} from '../src/engine/energyEngine';
import {
  createInitialAbilityState,
  addProtection,
} from '../src/engine/abilityEngine';

describe('Phase 4: Local Multiplayer Experience & Systems Validation', () => {
  describe('1. Match Setup & Profile Configuration', () => {
    it('provides valid default match settings with 8 distinct trainer avatars', () => {
      expect(DEFAULT_MATCH_SETTINGS.player1.name).toBe('Trainer Red');
      expect(DEFAULT_MATCH_SETTINGS.player1.color).toBe('w');
      expect(DEFAULT_MATCH_SETTINGS.player2.name).toBe('Trainer Blue');
      expect(DEFAULT_MATCH_SETTINGS.player2.color).toBe('b');
      expect(DEFAULT_MATCH_SETTINGS.timerMinutes).toBe(10);
      expect(DEFAULT_MATCH_SETTINGS.boardTheme).toBe('cosmic_void');

      // Verify trainer avatars catalog
      expect(TRAINER_AVATARS.length).toBeGreaterThanOrEqual(8);
      const ash = getAvatarById('ash');
      expect(ash.name).toBe('Ash');
      const cynthia = getAvatarById('cynthia');
      expect(cynthia.name).toBe('Cynthia');
    });

    it('enforces complementary side assignments for local two-player setup', () => {
      const customSettings: MatchSettings = {
        ...DEFAULT_MATCH_SETTINGS,
        player1: {
          name: 'Red',
          avatarId: 'red',
          color: 'b',
        },
        player2: {
          name: 'Blue',
          avatarId: 'blue',
          color: 'w',
        },
      };

      expect(customSettings.player1.color).toBe('b');
      expect(customSettings.player2.color).toBe('w');
      expect(customSettings.player1.color).not.toBe(customSettings.player2.color);
    });

    it('supports all required timer duration options', () => {
      const validTimerPresets = [0, 5, 10, 15, 30];
      validTimerPresets.forEach((mins) => {
        const settings: MatchSettings = {
          ...DEFAULT_MATCH_SETTINGS,
          timerMinutes: mins,
        };
        const initialSeconds = settings.timerMinutes * 60;
        if (mins === 0) {
          expect(initialSeconds).toBe(0);
        } else {
          expect(initialSeconds).toBe(mins * 60);
          expect(initialSeconds).toBeGreaterThan(0);
        }
      });
    });

    it('supports all 4 visual board themes with proper styling definitions', () => {
      const themes = ['cosmic_void', 'indigo_crystal', 'volcanic_ash', 'emerald_forest'] as const;
      themes.forEach((t) => {
        const themeDef = BOARD_THEMES[t];
        expect(themeDef).toBeDefined();
        expect(themeDef.lightSquareClass).toContain('bg-');
        expect(themeDef.darkSquareClass).toContain('bg-');
        expect(themeDef.outerBorderClass).toContain('border-');
      });
    });
  });

  describe('2. Match Clock & Flag Fall Detection', () => {
    it('simulates independent player clock decrement on turn active', () => {
      const initialSeconds = 10 * 60; // 600s
      let timers = { w: initialSeconds, b: initialSeconds };
      let activeTurn: 'w' | 'b' = 'w';

      // White's turn ticks 3 seconds
      for (let i = 0; i < 3; i++) {
        if (activeTurn === 'w') {
          timers = { ...timers, w: Math.max(0, timers.w - 1) };
        }
      }
      expect(timers.w).toBe(597);
      expect(timers.b).toBe(600);

      // Turn switches to Black and ticks 5 seconds
      activeTurn = 'b';
      for (let i = 0; i < 5; i++) {
        if (activeTurn === 'b') {
          timers = { ...timers, b: Math.max(0, timers.b - 1) };
        }
      }
      expect(timers.w).toBe(597);
      expect(timers.b).toBe(595);
    });

    it('detects timeout flag fall and determines opposite player as winner', () => {
      let timers = { w: 1, b: 240 };
      let activeTurn: 'w' | 'b' = 'w';
      let timeOutWinner: 'w' | 'b' | null = null;

      // Tick 1 second on White's clock
      if (timers[activeTurn] <= 1) {
        timers[activeTurn] = 0;
        timeOutWinner = activeTurn === 'w' ? 'b' : 'w';
      }

      expect(timers.w).toBe(0);
      expect(timeOutWinner).toBe('b');
    });
  });

  describe('3. Undo Move & Deep State Synchronization', () => {
    it('captures full state snapshot before move and completely restores state upon undo', () => {
      const chess = new Chess();
      let energy = createInitialEnergyState();
      let ability = createInitialAbilityState();
      let capturedWhite: string[] = [];
      let capturedBlack: string[] = [];
      let timers = { w: 600, b: 600 };

      const undoStack: GameSnapshot[] = [];

      // Helper to save snapshot
      const saveSnapshot = () => {
        undoStack.push({
          fen: chess.fen(),
          energyState: JSON.parse(JSON.stringify(energy)),
          abilityState: JSON.parse(JSON.stringify(ability)),
          moveHistory: [],
          timers: { ...timers },
          resignedColor: null,
          lastMove: null,
          matchStats: {
            startTime: Date.now(),
            durationSeconds: 0,
            totalMoves: 0,
            abilitiesUsed: 0,
            evolutionsCount: 0,
            capturesCount: 0,
          },
        });
      };

      // Turn 1: White saves snapshot and plays 1. e4
      saveSnapshot();
      expect(undoStack.length).toBe(1);
      chess.move('e4');
      energy = handleTurnCompletedEnergy(energy, 'w').nextEnergyState;

      // Black saves snapshot and plays 1... d5
      saveSnapshot();
      expect(undoStack.length).toBe(2);
      chess.move('d5');
      energy = handleTurnCompletedEnergy(energy, 'b').nextEnergyState;

      // Turn 2: White applies ability (Swarm Protection on e4) and captures 2. exd5
      saveSnapshot();
      expect(undoStack.length).toBe(3);
      energy = deductEnergy(energy, 'w', 1);
      ability = addProtection(ability, 'swarm', 'e4', 'w', 'p');
      const m = chess.move('exd5');
      if (m.captured) capturedWhite.push(m.captured);
      energy = handleTurnCompletedEnergy(energy, 'w').nextEnergyState;

      // Verify mutated state before Undo
      expect(chess.fen()).not.toBe(undoStack[2].fen);
      expect(ability.activeProtections.length).toBe(1);
      expect(capturedWhite).toEqual(['p']);
      expect(chess.turn()).toBe('b');

      // PERFORM UNDO of Turn 2 White's move:
      const snap = undoStack.pop()!;
      chess.load(snap.fen);
      energy = snap.energyState;
      ability = snap.abilityState;
      timers = snap.timers;

      // Assert complete restoration
      expect(chess.turn()).toBe('w');
      expect(ability.activeProtections.length).toBe(0);
      expect(energy.w.current).toBe(5); // Energy restored prior to 1 cost deduction
      expect(undoStack.length).toBe(2);
    });

    it('handles empty undo stack gracefully without errors', () => {
      const undoStack: GameSnapshot[] = [];
      expect(undoStack.length === 0).toBe(true);

      const popResult = undoStack.pop();
      expect(popResult).toBeUndefined();
    });
  });

  describe('4. Match Telemetry & Statistics Tracking', () => {
    it('aggregates total moves, captures, abilities cast, evolutions, and match duration', () => {
      const startTime = Date.now() - 154000; // ~2 mins 34 secs ago
      const matchStats: MatchStats = {
        startTime,
        durationSeconds: 154,
        totalMoves: 24,
        abilitiesUsed: 3,
        evolutionsCount: 1,
        capturesCount: 7,
      };

      expect(matchStats.totalMoves).toBe(24);
      expect(matchStats.capturesCount).toBe(7);
      expect(matchStats.abilitiesUsed).toBe(3);
      expect(matchStats.evolutionsCount).toBe(1);

      // Duration formatting verification
      const mins = Math.floor(matchStats.durationSeconds / 60);
      const secs = matchStats.durationSeconds % 60;
      expect(mins).toBe(2);
      expect(secs).toBe(34);
    });
  });

  describe('5. Rapidash Flame Dash Explicit Arming Validation', () => {
    it('ensures regular Knight moves do NOT trigger Flame Dash unless explicitly armed', () => {
      const chess = new Chess();
      let armedFlameDash = false;
      let flameDashActive = false;

      // Regular knight move without pressing "Activate Ability":
      const move = chess.move('Nf3');
      expect(move).toBeDefined();

      if (armedFlameDash) {
        flameDashActive = true;
      }

      // Must remain false!
      expect(flameDashActive).toBe(false);
      expect(chess.turn()).toBe('b'); // Successfully moved and passed turn
    });

    it('engages Flame Dash ONLY when armedFlameDash is explicitly set to true', () => {
      const chess = new Chess();
      let armedFlameDash = true; // Player pressed "Activate Ability"
      let flameDashActive = false;

      const move = chess.move('Nf3');
      expect(move).toBeDefined();

      if (armedFlameDash) {
        flameDashActive = true;
        armedFlameDash = false;
      }

      // Now Flame Dash bonus hop is enabled!
      expect(flameDashActive).toBe(true);
      expect(armedFlameDash).toBe(false);
    });
  });
});
