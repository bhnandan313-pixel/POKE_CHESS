/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoardTheme } from '../types/game';

export interface BoardThemeConfig {
  id: BoardTheme;
  name: string;
  description: string;
  lightSquareClass: string;
  darkSquareClass: string;
  outerBorderClass: string;
  gridBorderClass: string;
  accentColor: string;
  glowClass: string;
  previewColors: [string, string];
}

export const BOARD_THEMES: Record<BoardTheme, BoardThemeConfig> = {
  cosmic_void: {
    id: 'cosmic_void',
    name: 'Cosmic Void',
    description: 'Deep navy and starry celestial nebula squares.',
    lightSquareClass: 'bg-slate-800/85 hover:bg-slate-700/80',
    darkSquareClass: 'bg-indigo-950/90 hover:bg-indigo-900/80',
    outerBorderClass: 'border-indigo-900/50 shadow-indigo-950/50',
    gridBorderClass: 'border-indigo-500/30',
    accentColor: '#F59E0B',
    glowClass: 'shadow-[0_0_40px_rgba(79,70,229,0.25)]',
    previewColors: ['#1e293b', '#1e1b4b'],
  },
  indigo_crystal: {
    id: 'indigo_crystal',
    name: 'Indigo Crystal',
    description: 'Luminous sapphire quartz and mystic psionic glow.',
    lightSquareClass: 'bg-sky-900/60 hover:bg-sky-800/60',
    darkSquareClass: 'bg-blue-950/95 hover:bg-blue-900/90',
    outerBorderClass: 'border-cyan-900/50 shadow-cyan-950/50',
    gridBorderClass: 'border-cyan-500/30',
    accentColor: '#06B6D4',
    glowClass: 'shadow-[0_0_40px_rgba(6,182,212,0.25)]',
    previewColors: ['#0c4a6e', '#172554'],
  },
  volcanic_ash: {
    id: 'volcanic_ash',
    name: 'Volcanic Ash',
    description: 'Smoldering obsidian stones and ember flame highlights.',
    lightSquareClass: 'bg-stone-800/85 hover:bg-stone-700/85',
    darkSquareClass: 'bg-zinc-950/95 hover:bg-zinc-900/90',
    outerBorderClass: 'border-orange-950/60 shadow-orange-950/50',
    gridBorderClass: 'border-orange-500/30',
    accentColor: '#F97316',
    glowClass: 'shadow-[0_0_40px_rgba(249,115,22,0.25)]',
    previewColors: ['#292524', '#09090b'],
  },
  emerald_forest: {
    id: 'emerald_forest',
    name: 'Emerald Forest',
    description: 'Enchanted Viridian grove with vitality energy.',
    lightSquareClass: 'bg-emerald-950/50 hover:bg-emerald-900/50',
    darkSquareClass: 'bg-slate-950/95 hover:bg-slate-900/90',
    outerBorderClass: 'border-emerald-900/50 shadow-emerald-950/50',
    gridBorderClass: 'border-emerald-500/30',
    accentColor: '#10B981',
    glowClass: 'shadow-[0_0_40px_rgba(16,185,129,0.25)]',
    previewColors: ['#064e3b', '#020617'],
  },
};

export function getBoardTheme(themeId?: BoardTheme): BoardThemeConfig {
  return (themeId && BOARD_THEMES[themeId]) || BOARD_THEMES.cosmic_void;
}
