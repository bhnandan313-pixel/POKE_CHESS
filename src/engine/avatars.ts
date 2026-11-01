/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AvatarInfo {
  id: string;
  name: string;
  title: string;
  badge: string;
  themeColor: string;
  bgGradient: string;
  borderColor: string;
  quote: string;
  avatarIcon: string; // SVG icon identifier or path
}

export const TRAINER_AVATARS: AvatarInfo[] = [
  {
    id: 'red',
    name: 'Red',
    title: 'Legendary Champion',
    badge: 'Kanto Legend',
    themeColor: '#EF4444',
    bgGradient: 'from-red-950 via-slate-900 to-amber-950',
    borderColor: 'border-red-500/60',
    quote: 'Words are unnecessary. Let the chessboard speak.',
    avatarIcon: 'red',
  },
  {
    id: 'blue',
    name: 'Blue',
    title: 'Grand Strategist',
    badge: 'Tactical Rival',
    themeColor: '#3B82F6',
    bgGradient: 'from-blue-950 via-slate-900 to-indigo-950',
    borderColor: 'border-blue-500/60',
    quote: 'Smell ya later! My opening gambit is unbeatable.',
    avatarIcon: 'blue',
  },
  {
    id: 'cynthia',
    name: 'Cynthia',
    title: 'Sinnoh Mythologist',
    badge: 'Undefeated Master',
    themeColor: '#A855F7',
    bgGradient: 'from-purple-950 via-slate-900 to-slate-950',
    borderColor: 'border-purple-500/60',
    quote: 'Every piece holds ancient power. Awaken Arceus.',
    avatarIcon: 'cynthia',
  },
  {
    id: 'steven',
    name: 'Steven',
    title: 'Iron Fortress',
    badge: 'Steel Champion',
    themeColor: '#94A3B8',
    bgGradient: 'from-slate-900 via-slate-950 to-cyan-950',
    borderColor: 'border-slate-400/60',
    quote: 'Noble and unyielding, like Aggron’s titanium armor.',
    avatarIcon: 'steven',
  },
  {
    id: 'lance',
    name: 'Lance',
    title: 'Dragon Vanguard',
    badge: 'Indigo Master',
    themeColor: '#F97316',
    bgGradient: 'from-orange-950 via-slate-900 to-red-950',
    borderColor: 'border-orange-500/60',
    quote: 'Unleash the draconic storm across the ranks.',
    avatarIcon: 'lance',
  },
  {
    id: 'serena',
    name: 'Serena',
    title: 'Kalos Strategist',
    badge: 'Grand Performer',
    themeColor: '#EC4899',
    bgGradient: 'from-pink-950 via-slate-900 to-purple-950',
    borderColor: 'border-pink-500/60',
    quote: 'Grace and precision dictate the tempo of victory.',
    avatarIcon: 'serena',
  },
  {
    id: 'ash',
    name: 'Ash',
    title: 'World Monarch',
    badge: 'Aura Champion',
    themeColor: '#EAB308',
    bgGradient: 'from-amber-950 via-slate-900 to-sky-950',
    borderColor: 'border-amber-500/60',
    quote: 'Never surrender until the very last checkmate!',
    avatarIcon: 'ash',
  },
  {
    id: 'leon',
    name: 'Leon',
    title: 'Galar Sovereign',
    badge: 'The Undefeated',
    themeColor: '#8B5CF6',
    bgGradient: 'from-violet-950 via-slate-900 to-amber-950',
    borderColor: 'border-violet-500/60',
    quote: 'Let’s give the audience a truly champion battle!',
    avatarIcon: 'leon',
  },
];

export function getAvatar(id: string): AvatarInfo {
  return TRAINER_AVATARS.find((a) => a.id === id) || TRAINER_AVATARS[0];
}

export const getAvatarById = getAvatar;

