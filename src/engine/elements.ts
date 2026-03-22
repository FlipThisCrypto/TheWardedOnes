import { Element } from './types';

// Element strength relationships: key is strong against value
export const ELEMENT_STRENGTHS: Record<Element, Element> = {
  Fire: 'Nature',
  Water: 'Fire',
  Earth: 'Lightning',
  Air: 'Earth',
  Lightning: 'Water',
  Ice: 'Air',
  Nature: 'Water',
  Arcane: 'Ice',
  Light: 'Shadow',
  Shadow: 'Light',
};

// Inverse: key is weak against value
export const ELEMENT_WEAKNESSES: Record<Element, Element> = {
  Nature: 'Fire',
  Fire: 'Water',
  Lightning: 'Earth',
  Earth: 'Air',
  Water: 'Lightning',
  Air: 'Ice',
  Arcane: 'Shadow',
  Ice: 'Arcane',
  Shadow: 'Light',
  Light: 'Shadow',
};

// Strong: +3 damage, Weak: -2 damage
export const STRONG_MODIFIER = 3;
export const WEAK_MODIFIER = -2;

export function getElementModifier(attackerElements: Element[], defenderElements: Element[]): number {
  let modifier = 0;
  
  for (const atkEl of attackerElements) {
    for (const defEl of defenderElements) {
      if (ELEMENT_STRENGTHS[atkEl] === defEl) {
        modifier += STRONG_MODIFIER;
      }
      if (ELEMENT_STRENGTHS[defEl] === atkEl) {
        modifier += WEAK_MODIFIER;
      }
    }
  }
  
  return modifier;
}

export const ELEMENT_COLORS: Record<Element, { primary: string; glow: string; gradient: string }> = {
  Fire: { primary: '#ff4500', glow: '#ff6b35', gradient: 'from-orange-600 to-red-700' },
  Water: { primary: '#1e90ff', glow: '#4da6ff', gradient: 'from-blue-500 to-cyan-600' },
  Earth: { primary: '#8b4513', glow: '#a0522d', gradient: 'from-amber-700 to-yellow-900' },
  Air: { primary: '#87ceeb', glow: '#b0e0e6', gradient: 'from-sky-300 to-slate-400' },
  Lightning: { primary: '#ffd700', glow: '#ffed4a', gradient: 'from-yellow-400 to-amber-500' },
  Ice: { primary: '#00bfff', glow: '#7fdbff', gradient: 'from-cyan-300 to-blue-400' },
  Nature: { primary: '#228b22', glow: '#32cd32', gradient: 'from-green-600 to-emerald-700' },
  Arcane: { primary: '#9370db', glow: '#b19cd9', gradient: 'from-purple-500 to-violet-600' },
  Light: { primary: '#fffacd', glow: '#fff8dc', gradient: 'from-yellow-100 to-amber-200' },
  Shadow: { primary: '#2f1f4e', glow: '#4a2f7a', gradient: 'from-purple-900 to-slate-900' },
};

export const CLASS_ICONS: Record<string, string> = {
  Battlemage: '⚔️',
  Elementalist: '🔮',
  Chronomancer: '⏳',
  Warlock: '💀',
  Priest: '✨',
  Beastmaster: '🐺',
  Trickster: '🎭',
  Jester: '🃏',
  Guardian: '🛡️',
  Warrior: '⚔️',
};

export const TYPE_ICONS: Record<string, string> = {
  Mage: '🧙',
  Fighter: '⚔️',
  Beast: '🐉',
  Relic: '💎',
  Totem: '🗿',
  Utility: '📜',
};
