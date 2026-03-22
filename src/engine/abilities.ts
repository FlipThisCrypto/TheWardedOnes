import { Ability } from './types';

export const ABILITIES: Record<string, Ability> = {
  // OFFENSIVE
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    type: 'offensive',
    description: 'Deal 6 Fire damage.',
    element: 'Fire',
    damage: 6,
    targetType: 'single',
  },
  lightning_bolt: {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    type: 'offensive',
    description: 'Deal 7 Lightning damage.',
    element: 'Lightning',
    damage: 7,
    targetType: 'single',
  },
  ice_lance: {
    id: 'ice_lance',
    name: 'Ice Lance',
    type: 'offensive',
    description: 'Deal 5 Ice damage and reduce Speed by 2.',
    element: 'Ice',
    damage: 5,
    speedMod: -2,
    targetType: 'single',
  },
  arcane_blast: {
    id: 'arcane_blast',
    name: 'Arcane Blast',
    type: 'offensive',
    description: 'Deal 8 Arcane damage.',
    element: 'Arcane',
    damage: 8,
    targetType: 'single',
  },
  shadow_strike: {
    id: 'shadow_strike',
    name: 'Shadow Strike',
    type: 'offensive',
    description: 'Deal 6 damage and apply Curse.',
    element: 'Shadow',
    damage: 6,
    targetType: 'single',
    special: 'curse',
  },
  cleave: {
    id: 'cleave',
    name: 'Cleave',
    type: 'offensive',
    description: 'Attack two enemies.',
    damage: 0, // uses unit attack
    targetType: 'all_enemies',
    special: 'cleave_two',
  },

  // DEFENSIVE
  barrier: {
    id: 'barrier',
    name: 'Barrier',
    type: 'defensive',
    description: 'Gain +4 Defense for one turn.',
    defenseBoost: 4,
    duration: 1,
    targetType: 'self',
  },
  stone_skin: {
    id: 'stone_skin',
    name: 'Stone Skin',
    type: 'defensive',
    description: 'Gain +3 Defense permanently.',
    defenseBoost: 3,
    duration: -1, // permanent
    targetType: 'self',
  },
  reflect: {
    id: 'reflect',
    name: 'Reflect',
    type: 'defensive',
    description: 'Reflect next spell.',
    targetType: 'self',
    special: 'reflect',
  },
  shield_wall: {
    id: 'shield_wall',
    name: 'Shield Wall',
    type: 'defensive',
    description: 'All allies gain +2 Defense.',
    defenseBoost: 2,
    duration: -1,
    targetType: 'all_allies',
  },

  // HEALING
  heal: {
    id: 'heal',
    name: 'Heal',
    type: 'healing',
    description: 'Restore 6 HP.',
    healing: 6,
    targetType: 'single',
  },
  greater_heal: {
    id: 'greater_heal',
    name: 'Greater Heal',
    type: 'healing',
    description: 'Restore 10 HP.',
    healing: 10,
    targetType: 'single',
  },
  nature_regrowth: {
    id: 'nature_regrowth',
    name: 'Nature Regrowth',
    type: 'healing',
    description: 'Restore 4 HP per turn for 3 turns.',
    element: 'Nature',
    healing: 4,
    duration: 3,
    targetType: 'single',
    special: 'hot',
  },
  purify: {
    id: 'purify',
    name: 'Purify',
    type: 'healing',
    description: 'Remove negative effects.',
    targetType: 'single',
    special: 'purify',
  },

  // CHAOS
  chaos_swap: {
    id: 'chaos_swap',
    name: 'Chaos Swap',
    type: 'chaos',
    description: 'Swap Attack and Defense.',
    targetType: 'single',
    special: 'swap_atk_def',
  },
  random_spell: {
    id: 'random_spell',
    name: 'Random Spell',
    type: 'chaos',
    description: 'Cast random ability.',
    targetType: 'random',
    special: 'random_spell',
  },
  mirror_trick: {
    id: 'mirror_trick',
    name: 'Mirror Trick',
    type: 'chaos',
    description: 'Copy enemy ability.',
    targetType: 'single',
    special: 'mirror',
  },
  stat_flip: {
    id: 'stat_flip',
    name: 'Stat Flip',
    type: 'chaos',
    description: 'Invert stats temporarily.',
    duration: 2,
    targetType: 'single',
    special: 'stat_flip',
  },

  // BEAST
  pack_tactics: {
    id: 'pack_tactics',
    name: 'Pack Tactics',
    type: 'beast',
    description: 'Beasts gain +2 Attack.',
    attackBoost: 2,
    targetType: 'all_allies',
    special: 'beast_only',
  },
  primal_roar: {
    id: 'primal_roar',
    name: 'Primal Roar',
    type: 'beast',
    description: 'Enemies lose 2 Defense.',
    defenseBoost: -2,
    targetType: 'all_enemies',
  },
  summon_cub: {
    id: 'summon_cub',
    name: 'Summon Cub',
    type: 'beast',
    description: 'Summon L1 beast.',
    targetType: 'self',
    special: 'summon_cub',
  },

  // TOTEM
  storm_totem: {
    id: 'storm_totem',
    name: 'Storm Totem',
    type: 'totem',
    description: 'Lightning units gain +2 Attack.',
    element: 'Lightning',
    attackBoost: 2,
    targetType: 'all_allies',
    special: 'element_buff_lightning',
  },
  forest_totem: {
    id: 'forest_totem',
    name: 'Forest Totem',
    type: 'totem',
    description: 'Nature units gain +3 HP.',
    element: 'Nature',
    healing: 3,
    targetType: 'all_allies',
    special: 'element_buff_nature',
  },
  shadow_totem: {
    id: 'shadow_totem',
    name: 'Shadow Totem',
    type: 'totem',
    description: 'Shadow spells cost 1 less.',
    element: 'Shadow',
    targetType: 'all_allies',
    special: 'cost_reduction_shadow',
  },
};

export function getAbility(id: string): Ability | undefined {
  return ABILITIES[id];
}

export function getAbilitiesByType(type: Ability['type']): Ability[] {
  return Object.values(ABILITIES).filter(a => a.type === type);
}
