import { CardDefinition, Element } from '../engine/types';
import { KeywordData } from '../engine/keywords';

export const ALL_CARDS: CardDefinition[] = [
  // ============================================
  // MAGES (10 - one per class, 3 elements each)
  // ============================================
  {
    id: 'mage_battlemage',
    name: 'Kael the Warforged',
    cardClass: 'Battlemage',
    elements: ['Fire', 'Arcane', 'Lightning'],
    type: 'Mage',
    level: 1,
    cost: 3,
    hp: 20,
    attack: 6,
    defense: 5,
    speed: 5,
    abilities: ['fireball', 'arcane_blast'],
    flavorText: 'Steel tempered by spell. Spell sharpened by steel.',
  },
  {
    id: 'mage_elementalist',
    name: 'Lyra Stormweaver',
    cardClass: 'Elementalist',
    elements: ['Fire', 'Ice', 'Lightning'],
    type: 'Mage',
    level: 1,
    cost: 3,
    hp: 16,
    attack: 8,
    defense: 3,
    speed: 5,
    abilities: ['fireball', 'ice_lance', 'lightning_bolt'],
    flavorText: 'She speaks in three tongues of destruction.',
  },
  {
    id: 'mage_chronomancer',
    name: 'Aldric Timebender',
    cardClass: 'Chronomancer',
    elements: ['Arcane', 'Air', 'Light'],
    type: 'Mage',
    level: 1,
    cost: 3,
    hp: 18,
    attack: 4,
    defense: 5,
    speed: 8,
    abilities: ['arcane_blast', 'barrier'],
    flavorText: 'He has already won this fight. You just don\'t know it yet.',
  },
  {
    id: 'mage_warlock',
    name: 'Morrith the Hollow',
    cardClass: 'Warlock',
    elements: ['Shadow', 'Fire', 'Arcane'],
    type: 'Mage',
    level: 1,
    cost: 3,
    hp: 18,
    attack: 7,
    defense: 4,
    speed: 5,
    abilities: ['shadow_strike', 'fireball'],
    flavorText: 'What he gives, he takes back threefold.',
  },
  {
    id: 'mage_priest',
    name: 'Sera the Anointed',
    cardClass: 'Priest',
    elements: ['Light', 'Nature', 'Water'],
    type: 'Mage',
    level: 1,
    cost: 3,
    hp: 20,
    attack: 3,
    defense: 5,
    speed: 5,
    abilities: ['greater_heal', 'purify'],
    flavorText: 'Her light burns away all that festers.',
  },
  {
    id: 'mage_beastmaster',
    name: 'Fenris Wildcaller',
    cardClass: 'Beastmaster',
    elements: ['Nature', 'Earth', 'Air'],
    type: 'Mage',
    level: 1,
    cost: 3,
    hp: 18,
    attack: 5,
    defense: 4,
    speed: 5,
    abilities: ['pack_tactics', 'summon_cub'],
    flavorText: 'The pack answers to no leash, only his howl.',
  },
  {
    id: 'mage_trickster',
    name: 'Vex Shadowhand',
    cardClass: 'Trickster',
    elements: ['Shadow', 'Air', 'Arcane'],
    type: 'Mage',
    level: 1,
    cost: 3,
    hp: 15,
    attack: 5,
    defense: 3,
    speed: 8,
    abilities: ['mirror_trick', 'shadow_strike'],
    flavorText: 'By the time you see him, it\'s already too late.',
  },
  {
    id: 'mage_jester',
    name: 'Jinx the Unbound',
    cardClass: 'Jester',
    elements: ['Arcane', 'Shadow', 'Fire'],
    type: 'Mage',
    level: 1,
    cost: 3,
    hp: 17,
    attack: 5,
    defense: 3,
    speed: 7,
    abilities: ['chaos_swap', 'random_spell'],
    flavorText: 'Every game has a wild card. He\'s all of them.',
  },
  {
    id: 'mage_guardian',
    name: 'Thormund Ironward',
    cardClass: 'Guardian',
    elements: ['Earth', 'Light', 'Ice'],
    type: 'Mage',
    level: 1,
    cost: 3,
    hp: 24,
    attack: 3,
    defense: 8,
    speed: 3,
    abilities: ['shield_wall', 'stone_skin'],
    flavorText: 'Behind him, nothing passes. Before him, nothing stands.',
  },
  {
    id: 'mage_warrior',
    name: 'Brynn Ironfist',
    cardClass: 'Warrior',
    elements: ['Fire', 'Earth', 'Lightning'],
    type: 'Mage',
    level: 1,
    cost: 3,
    hp: 22,
    attack: 7,
    defense: 5,
    speed: 4,
    abilities: ['cleave', 'stone_skin'],
    flavorText: 'She doesn\'t cast spells. She IS the weapon.',
  },

  // ============================================
  // FIGHTERS (30+)
  // ============================================

  // Battlemage Fighters
  { id: 'f_bm_spellblade', name: 'Spellblade Adept', cardClass: 'Battlemage', elements: ['Arcane'], type: 'Fighter', level: 1, cost: 2, hp: 8, attack: 5, defense: 3, speed: 5, abilities: ['arcane_blast'], flavorText: 'Half warrior, half scholar, full danger.' },
  { id: 'f_bm_spellblade_l2', name: 'Spellblade Veteran', cardClass: 'Battlemage', elements: ['Arcane', 'Fire'], type: 'Fighter', level: 2, cost: 4, hp: 12, attack: 7, defense: 4, speed: 5, abilities: ['arcane_blast', 'fireball'], flavorText: 'His blade writes runes in the air as it swings.', evolvesFrom: 'f_bm_spellblade' },
  { id: 'f_bm_spellblade_l3', name: 'Spellblade Master', cardClass: 'Battlemage', elements: ['Arcane', 'Fire', 'Lightning'], type: 'Fighter', level: 3, cost: 6, hp: 16, attack: 9, defense: 5, speed: 6, abilities: ['arcane_blast', 'fireball', 'lightning_bolt'], flavorText: 'Three elements, one blade, zero mercy.', evolvesFrom: 'f_bm_spellblade_l2' },

  // Elementalist Fighters
  { id: 'f_el_flamecaster', name: 'Flamecaster', cardClass: 'Elementalist', elements: ['Fire'], type: 'Fighter', level: 1, cost: 2, hp: 6, attack: 6, defense: 2, speed: 5, abilities: ['fireball'], flavorText: 'Born in the pyre, raised by embers.' },
  { id: 'f_el_frostmage', name: 'Frostmage', cardClass: 'Elementalist', elements: ['Ice'], type: 'Fighter', level: 1, cost: 2, hp: 7, attack: 5, defense: 3, speed: 4, abilities: ['ice_lance'], flavorText: 'Winter speaks through her fingertips.' },
  { id: 'f_el_stormcaller', name: 'Stormcaller', cardClass: 'Elementalist', elements: ['Lightning'], type: 'Fighter', level: 1, cost: 3, hp: 8, attack: 7, defense: 2, speed: 6, abilities: ['lightning_bolt'], flavorText: 'Every bolt finds its mark.' },

  // Chronomancer Fighters
  { id: 'f_ch_timeguard', name: 'Temporal Guard', cardClass: 'Chronomancer', elements: ['Arcane'], type: 'Fighter', level: 1, cost: 2, hp: 8, attack: 4, defense: 4, speed: 7, abilities: ['barrier'], flavorText: 'She moves between seconds.' },
  { id: 'f_ch_phaseshifter', name: 'Phase Shifter', cardClass: 'Chronomancer', elements: ['Air', 'Arcane'], type: 'Fighter', level: 1, cost: 3, hp: 7, attack: 5, defense: 3, speed: 8, abilities: ['barrier', 'arcane_blast'], flavorText: 'Now you see him, now you never did.' },
  { id: 'f_ch_timewarden', name: 'Timewarden', cardClass: 'Chronomancer', elements: ['Arcane', 'Light'], type: 'Fighter', level: 2, cost: 5, hp: 12, attack: 6, defense: 5, speed: 9, abilities: ['barrier', 'arcane_blast', 'heal'], flavorText: 'Guardian of the eternal clock.', evolvesFrom: 'f_ch_timeguard' },

  // Warlock Fighters
  { id: 'f_wl_cultist', name: 'Shadow Cultist', cardClass: 'Warlock', elements: ['Shadow'], type: 'Fighter', level: 1, cost: 2, hp: 7, attack: 6, defense: 2, speed: 5, abilities: ['shadow_strike'], flavorText: 'Devoted to the void.' },
  { id: 'f_wl_bloodmage', name: 'Blood Mage', cardClass: 'Warlock', elements: ['Shadow', 'Fire'], type: 'Fighter', level: 2, cost: 4, hp: 10, attack: 8, defense: 3, speed: 5, abilities: ['shadow_strike', 'fireball'], flavorText: 'Power has a price. She pays in crimson.', evolvesFrom: 'f_wl_cultist' },
  { id: 'f_wl_soulreaver', name: 'Soul Reaver', cardClass: 'Warlock', elements: ['Shadow', 'Arcane'], type: 'Fighter', level: 1, cost: 3, hp: 9, attack: 7, defense: 2, speed: 5, abilities: ['shadow_strike'], flavorText: 'It feeds on what you cannot see.' },

  // Priest Fighters
  { id: 'f_pr_acolyte', name: 'Temple Acolyte', cardClass: 'Priest', elements: ['Light'], type: 'Fighter', level: 1, cost: 2, hp: 8, attack: 3, defense: 4, speed: 4, abilities: ['heal'], flavorText: 'Faith is the first shield.' },
  { id: 'f_pr_paladin', name: 'Radiant Paladin', cardClass: 'Priest', elements: ['Light', 'Nature'], type: 'Fighter', level: 2, cost: 4, hp: 12, attack: 5, defense: 6, speed: 4, abilities: ['heal', 'shield_wall'], flavorText: 'Her oath is her armor.', evolvesFrom: 'f_pr_acolyte' },
  { id: 'f_pr_cleric', name: 'Battle Cleric', cardClass: 'Priest', elements: ['Light', 'Water'], type: 'Fighter', level: 1, cost: 3, hp: 10, attack: 4, defense: 5, speed: 4, abilities: ['greater_heal', 'purify'], flavorText: 'Healing hands that can also harm.' },

  // Beastmaster Fighters
  { id: 'f_bst_handler', name: 'Beast Handler', cardClass: 'Beastmaster', elements: ['Nature'], type: 'Fighter', level: 1, cost: 2, hp: 8, attack: 5, defense: 3, speed: 5, abilities: ['pack_tactics'], flavorText: 'Speaks the old tongue of fang and claw.' },
  { id: 'f_bst_alpha', name: 'Alpha Warden', cardClass: 'Beastmaster', elements: ['Nature', 'Earth'], type: 'Fighter', level: 2, cost: 4, hp: 12, attack: 6, defense: 4, speed: 5, abilities: ['pack_tactics', 'primal_roar'], flavorText: 'The pack moves as one under his gaze.', evolvesFrom: 'f_bst_handler' },
  { id: 'f_bst_tracker', name: 'Wild Tracker', cardClass: 'Beastmaster', elements: ['Air'], type: 'Fighter', level: 1, cost: 2, hp: 7, attack: 4, defense: 3, speed: 7, abilities: ['summon_cub'], flavorText: 'Where she walks, the wild follows.' },

  // Trickster Fighters
  { id: 'f_tr_rogue', name: 'Shadow Rogue', cardClass: 'Trickster', elements: ['Shadow'], type: 'Fighter', level: 1, cost: 2, hp: 6, attack: 5, defense: 2, speed: 8, abilities: ['shadow_strike'], keywords: [{ keyword: 'Pierce' }], flavorText: 'Gone before the blood hits the ground.' },
  { id: 'f_tr_illusionist', name: 'Illusionist', cardClass: 'Trickster', elements: ['Arcane', 'Air'], type: 'Fighter', level: 1, cost: 3, hp: 7, attack: 4, defense: 3, speed: 7, abilities: ['mirror_trick'], flavorText: 'Which one is real? None of them.' },
  { id: 'f_tr_assassin', name: 'Phantom Assassin', cardClass: 'Trickster', elements: ['Shadow', 'Arcane'], type: 'Fighter', level: 2, cost: 5, hp: 10, attack: 8, defense: 3, speed: 9, abilities: ['shadow_strike', 'mirror_trick'], keywords: [{ keyword: 'Pierce' }, { keyword: 'Lifesteal' }], flavorText: 'Death wears many faces. She wears them all.', evolvesFrom: 'f_tr_rogue' },

  // Jester Fighters
  { id: 'f_je_fool', name: 'Cackling Fool', cardClass: 'Jester', elements: ['Arcane'], type: 'Fighter', level: 1, cost: 2, hp: 7, attack: 4, defense: 2, speed: 7, abilities: ['chaos_swap'], flavorText: 'His laughter precedes the madness.' },
  { id: 'f_je_wildcard', name: 'Wild Card', cardClass: 'Jester', elements: ['Fire', 'Shadow'], type: 'Fighter', level: 1, cost: 3, hp: 8, attack: 5, defense: 3, speed: 6, abilities: ['random_spell'], flavorText: 'What comes next? Even he doesn\'t know.' },
  { id: 'f_je_madcap', name: 'Madcap Sorcerer', cardClass: 'Jester', elements: ['Arcane', 'Shadow'], type: 'Fighter', level: 2, cost: 5, hp: 11, attack: 7, defense: 3, speed: 8, abilities: ['chaos_swap', 'random_spell', 'stat_flip'], flavorText: 'Order is a suggestion he politely declines.', evolvesFrom: 'f_je_fool' },

  // Guardian Fighters
  { id: 'f_gu_sentinel', name: 'Iron Sentinel', cardClass: 'Guardian', elements: ['Earth'], type: 'Fighter', level: 1, cost: 2, hp: 10, attack: 3, defense: 6, speed: 3, abilities: ['shield_wall'], keywords: [{ keyword: 'Taunt' }, { keyword: 'Fortify' }], flavorText: 'Unmoved. Unmovable.' },
  { id: 'f_gu_bulwark', name: 'Arcane Bulwark', cardClass: 'Guardian', elements: ['Earth', 'Light'], type: 'Fighter', level: 2, cost: 4, hp: 14, attack: 4, defense: 8, speed: 3, abilities: ['shield_wall', 'stone_skin'], keywords: [{ keyword: 'Taunt' }, { keyword: 'Ward', value: 3 }], flavorText: 'A wall that fights back.', evolvesFrom: 'f_gu_sentinel' },
  { id: 'f_gu_protector', name: 'Ward Protector', cardClass: 'Guardian', elements: ['Light'], type: 'Fighter', level: 1, cost: 3, hp: 12, attack: 3, defense: 7, speed: 2, abilities: ['barrier', 'reflect'], keywords: [{ keyword: 'Ward', value: 4 }, { keyword: 'Taunt' }], flavorText: 'The last line that never breaks.' },

  // Warrior Fighters
  { id: 'f_wa_recruit', name: 'War Recruit', cardClass: 'Warrior', elements: ['Fire'], type: 'Fighter', level: 1, cost: 1, hp: 6, attack: 4, defense: 3, speed: 4, abilities: [], keywords: [{ keyword: 'Haste' }], flavorText: 'Green but hungry.' },
  { id: 'f_wa_berserker', name: 'Berserker', cardClass: 'Warrior', elements: ['Fire', 'Lightning'], type: 'Fighter', level: 1, cost: 3, hp: 10, attack: 8, defense: 2, speed: 5, abilities: ['cleave'], keywords: [{ keyword: 'Pierce' }], flavorText: 'Rage is the only strategy she needs.' },
  { id: 'f_wa_champion', name: 'War Champion', cardClass: 'Warrior', elements: ['Fire', 'Earth'], type: 'Fighter', level: 2, cost: 5, hp: 14, attack: 9, defense: 5, speed: 4, abilities: ['cleave', 'stone_skin'], flavorText: 'A hundred battles. A hundred victories.', evolvesFrom: 'f_wa_berserker' },
  { id: 'f_wa_vanguard', name: 'Frontline Vanguard', cardClass: 'Warrior', elements: ['Earth'], type: 'Fighter', level: 1, cost: 2, hp: 9, attack: 5, defense: 4, speed: 4, abilities: ['shield_wall'], flavorText: 'Always first through the breach.' },

  // ============================================
  // BEASTS (20+)
  // ============================================
  { id: 'b_fire_drake', name: 'Fire Drake', cardClass: 'Beastmaster', elements: ['Fire'], type: 'Beast', level: 1, cost: 2, hp: 7, attack: 5, defense: 2, speed: 5, abilities: ['fireball'], keywords: [{ keyword: 'Ward', value: 2 }], flavorText: 'A small flame, but hungry.' },
  { id: 'b_fire_drake_l2', name: 'Inferno Drake', cardClass: 'Beastmaster', elements: ['Fire'], type: 'Beast', level: 2, cost: 4, hp: 11, attack: 7, defense: 3, speed: 5, abilities: ['fireball'], flavorText: 'The sky burns when it breathes.', evolvesFrom: 'b_fire_drake' },
  { id: 'b_shadow_wolf', name: 'Shadow Wolf', cardClass: 'Beastmaster', elements: ['Shadow'], type: 'Beast', level: 1, cost: 2, hp: 6, attack: 5, defense: 2, speed: 7, abilities: ['pack_tactics'], keywords: [{ keyword: 'Lifesteal' }], flavorText: 'It hunts what light cannot find.' },
  { id: 'b_storm_hawk', name: 'Storm Hawk', cardClass: 'Beastmaster', elements: ['Lightning', 'Air'], type: 'Beast', level: 1, cost: 2, hp: 5, attack: 4, defense: 1, speed: 9, abilities: ['lightning_bolt'], keywords: [{ keyword: 'Haste' }], flavorText: 'Lightning given wings and talons.' },
  { id: 'b_frost_bear', name: 'Frost Bear', cardClass: 'Beastmaster', elements: ['Ice'], type: 'Beast', level: 1, cost: 3, hp: 10, attack: 5, defense: 4, speed: 3, abilities: ['ice_lance'], keywords: [{ keyword: 'Fortify' }], flavorText: 'The cold follows in its wake.' },
  { id: 'b_earth_golem', name: 'Stone Golem', cardClass: 'Guardian', elements: ['Earth'], type: 'Beast', level: 1, cost: 3, hp: 12, attack: 3, defense: 6, speed: 2, abilities: ['stone_skin'], keywords: [{ keyword: 'Fortify' }, { keyword: 'Taunt' }], flavorText: 'Carved from the mountain\'s heart.' },
  { id: 'b_arcane_wisp', name: 'Arcane Wisp', cardClass: 'Elementalist', elements: ['Arcane'], type: 'Beast', level: 1, cost: 1, hp: 3, attack: 3, defense: 1, speed: 8, abilities: ['arcane_blast'], flavorText: 'A flicker of raw magic given will.' },
  { id: 'b_nature_sprite', name: 'Nature Sprite', cardClass: 'Priest', elements: ['Nature'], type: 'Beast', level: 1, cost: 1, hp: 4, attack: 2, defense: 2, speed: 6, abilities: ['nature_regrowth'], flavorText: 'Where it steps, flowers bloom.' },
  { id: 'b_water_serpent', name: 'Tidal Serpent', cardClass: 'Elementalist', elements: ['Water'], type: 'Beast', level: 1, cost: 3, hp: 9, attack: 6, defense: 3, speed: 5, abilities: [], flavorText: 'Born in the deepest currents.' },
  { id: 'b_light_phoenix', name: 'Dawn Phoenix', cardClass: 'Priest', elements: ['Light', 'Fire'], type: 'Beast', level: 2, cost: 5, hp: 8, attack: 6, defense: 3, speed: 7, abilities: ['heal', 'fireball'], flavorText: 'From ash, it rises. From flame, it heals.', evolvesFrom: 'b_fire_drake' },
  { id: 'b_void_stalker', name: 'Void Stalker', cardClass: 'Warlock', elements: ['Shadow'], type: 'Beast', level: 1, cost: 3, hp: 8, attack: 6, defense: 2, speed: 6, abilities: ['shadow_strike'], flavorText: 'It walks between the spaces.' },
  { id: 'b_thunder_ram', name: 'Thunder Ram', cardClass: 'Warrior', elements: ['Lightning', 'Earth'], type: 'Beast', level: 1, cost: 2, hp: 7, attack: 5, defense: 3, speed: 5, abilities: [], flavorText: 'Hooves like thunder, horns like lightning.' },
  { id: 'b_wind_serpent', name: 'Wind Serpent', cardClass: 'Chronomancer', elements: ['Air'], type: 'Beast', level: 1, cost: 2, hp: 5, attack: 4, defense: 2, speed: 8, abilities: [], flavorText: 'It rides the breeze between moments.' },
  { id: 'b_ice_elemental', name: 'Ice Elemental', cardClass: 'Elementalist', elements: ['Ice'], type: 'Beast', level: 2, cost: 4, hp: 10, attack: 6, defense: 4, speed: 4, abilities: ['ice_lance', 'barrier'], flavorText: 'Pure cold given form and fury.', evolvesFrom: 'b_frost_bear' },
  { id: 'b_shadow_cat', name: 'Phantom Cat', cardClass: 'Trickster', elements: ['Shadow', 'Arcane'], type: 'Beast', level: 1, cost: 2, hp: 5, attack: 4, defense: 2, speed: 9, abilities: ['mirror_trick'], flavorText: 'Nine lives, nine tricks.' },
  { id: 'b_chaos_imp', name: 'Chaos Imp', cardClass: 'Jester', elements: ['Fire', 'Arcane'], type: 'Beast', level: 1, cost: 1, hp: 4, attack: 3, defense: 1, speed: 7, abilities: ['random_spell'], keywords: [{ keyword: 'Haste' }], flavorText: 'Mischief made manifest.' },
  { id: 'b_iron_tortoise', name: 'Iron Tortoise', cardClass: 'Guardian', elements: ['Earth', 'Ice'], type: 'Beast', level: 1, cost: 3, hp: 14, attack: 2, defense: 7, speed: 1, abilities: ['barrier'], keywords: [{ keyword: 'Fortify' }, { keyword: 'Ward', value: 3 }], flavorText: 'Patience is its greatest weapon.' },
  { id: 'b_primal_wolf', name: 'Primal Alpha', cardClass: 'Beastmaster', elements: ['Nature', 'Shadow'], type: 'Beast', level: 2, cost: 4, hp: 10, attack: 7, defense: 3, speed: 7, abilities: ['pack_tactics', 'primal_roar'], flavorText: 'Leader of the hunt.', evolvesFrom: 'b_shadow_wolf' },
  { id: 'b_ember_fox', name: 'Ember Fox', cardClass: 'Trickster', elements: ['Fire'], type: 'Beast', level: 1, cost: 1, hp: 4, attack: 3, defense: 1, speed: 8, abilities: [], keywords: [{ keyword: 'Haste' }], flavorText: 'Quick as flame, twice as elusive.' },
  { id: 'b_crystal_stag', name: 'Crystal Stag', cardClass: 'Priest', elements: ['Light', 'Nature'], type: 'Beast', level: 1, cost: 3, hp: 9, attack: 4, defense: 4, speed: 6, abilities: ['heal'], keywords: [{ keyword: 'Lifesteal' }], flavorText: 'Its antlers catch the dawn.' },
  { id: 'b_war_hound', name: 'War Hound', cardClass: 'Warrior', elements: ['Fire'], type: 'Beast', level: 1, cost: 1, hp: 5, attack: 4, defense: 2, speed: 6, abilities: [], flavorText: 'Loyal until the last breath.' },

  // ============================================
  // RELICS (12)
  // ============================================
  { id: 'r_flame_sword', name: 'Flamebrand Sword', cardClass: 'Warrior', elements: ['Fire'], type: 'Relic', level: 1, cost: 2, hp: 0, attack: 3, defense: 0, speed: 0, abilities: [], flavorText: 'Forged in dragonfire.' },
  { id: 'r_ice_shield', name: 'Frostguard Shield', cardClass: 'Guardian', elements: ['Ice'], type: 'Relic', level: 1, cost: 2, hp: 0, attack: 0, defense: 4, speed: 0, abilities: ['barrier'], keywords: [{ keyword: 'Ward', value: 3 }], flavorText: 'Cold enough to freeze steel.' },
  { id: 'r_arcane_tome', name: 'Tome of Secrets', cardClass: 'Elementalist', elements: ['Arcane'], type: 'Relic', level: 1, cost: 3, hp: 0, attack: 2, defense: 0, speed: 0, abilities: ['arcane_blast'], flavorText: 'Each page holds a universe.' },
  { id: 'r_shadow_cloak', name: 'Cloak of Shadows', cardClass: 'Trickster', elements: ['Shadow'], type: 'Relic', level: 1, cost: 2, hp: 0, attack: 0, defense: 2, speed: 3, abilities: [], keywords: [{ keyword: 'Haste' }], flavorText: 'Wraps the wearer in living darkness.' },
  { id: 'r_nature_amulet', name: 'Amulet of Regrowth', cardClass: 'Priest', elements: ['Nature'], type: 'Relic', level: 1, cost: 2, hp: 0, attack: 0, defense: 0, speed: 0, abilities: ['nature_regrowth'], flavorText: 'Life pulses within the emerald.' },
  { id: 'r_lightning_rod', name: 'Stormcatcher Rod', cardClass: 'Elementalist', elements: ['Lightning'], type: 'Relic', level: 1, cost: 2, hp: 0, attack: 2, defense: 0, speed: 2, abilities: ['lightning_bolt'], flavorText: 'Channels the sky\'s fury.' },
  { id: 'r_earth_plate', name: 'Earthen Plate', cardClass: 'Guardian', elements: ['Earth'], type: 'Relic', level: 1, cost: 3, hp: 0, attack: 0, defense: 5, speed: -1, abilities: ['stone_skin'], flavorText: 'Heavy as the mountain it came from.' },
  { id: 'r_chrono_glass', name: 'Chronoglass Pendant', cardClass: 'Chronomancer', elements: ['Arcane'], type: 'Relic', level: 1, cost: 3, hp: 0, attack: 0, defense: 0, speed: 4, abilities: ['barrier'], flavorText: 'Time bends around its wearer.' },
  { id: 'r_blood_gem', name: 'Bloodstone Gem', cardClass: 'Warlock', elements: ['Shadow'], type: 'Relic', level: 1, cost: 2, hp: 0, attack: 3, defense: 0, speed: 0, abilities: ['shadow_strike'], keywords: [{ keyword: 'Pierce' }], flavorText: 'Feeds on vitality.' },
  { id: 'r_beast_fang', name: 'Primal Fang', cardClass: 'Beastmaster', elements: ['Nature'], type: 'Relic', level: 1, cost: 1, hp: 0, attack: 2, defense: 0, speed: 1, abilities: ['pack_tactics'], keywords: [{ keyword: 'Lifesteal' }], flavorText: 'Tooth of the first beast.' },
  { id: 'r_chaos_dice', name: 'Chaos Dice', cardClass: 'Jester', elements: ['Arcane'], type: 'Relic', level: 1, cost: 2, hp: 0, attack: 1, defense: 1, speed: 1, abilities: ['random_spell'], flavorText: 'Roll the dice. Accept the outcome.' },
  { id: 'r_war_banner', name: 'War Banner', cardClass: 'Warrior', elements: ['Fire'], type: 'Relic', level: 1, cost: 2, hp: 0, attack: 2, defense: 1, speed: 0, abilities: ['cleave'], flavorText: 'Rally to the crimson flag.' },

  // ============================================
  // TOTEMS (12)
  // ============================================
  { id: 't_storm', name: 'Totem of Storms', cardClass: 'Elementalist', elements: ['Lightning'], type: 'Totem', level: 1, cost: 3, hp: 8, attack: 0, defense: 4, speed: 0, abilities: ['storm_totem'], flavorText: 'Lightning dances at its peak.' },
  { id: 't_forest', name: 'Totem of the Grove', cardClass: 'Beastmaster', elements: ['Nature'], type: 'Totem', level: 1, cost: 3, hp: 8, attack: 0, defense: 4, speed: 0, abilities: ['forest_totem'], flavorText: 'Roots deep, power deeper.' },
  { id: 't_shadow', name: 'Totem of Shadows', cardClass: 'Warlock', elements: ['Shadow'], type: 'Totem', level: 1, cost: 3, hp: 6, attack: 0, defense: 3, speed: 0, abilities: ['shadow_totem'], flavorText: 'Darkness pools at its base.' },
  { id: 't_fire', name: 'Pyre Totem', cardClass: 'Battlemage', elements: ['Fire'], type: 'Totem', level: 1, cost: 2, hp: 6, attack: 0, defense: 3, speed: 0, abilities: ['fireball'], flavorText: 'Eternal flame, contained.' },
  { id: 't_ice', name: 'Frozen Monolith', cardClass: 'Elementalist', elements: ['Ice'], type: 'Totem', level: 1, cost: 3, hp: 10, attack: 0, defense: 5, speed: 0, abilities: ['ice_lance'], flavorText: 'The air crystalizes around it.' },
  { id: 't_earth', name: 'Stone Pillar', cardClass: 'Guardian', elements: ['Earth'], type: 'Totem', level: 1, cost: 2, hp: 12, attack: 0, defense: 6, speed: 0, abilities: ['shield_wall'], flavorText: 'Unbreakable as the world itself.' },
  { id: 't_arcane', name: 'Arcane Nexus', cardClass: 'Chronomancer', elements: ['Arcane'], type: 'Totem', level: 1, cost: 3, hp: 7, attack: 0, defense: 3, speed: 0, abilities: ['arcane_blast'], flavorText: 'A conduit for raw magical energy.' },
  { id: 't_light', name: 'Beacon of Dawn', cardClass: 'Priest', elements: ['Light'], type: 'Totem', level: 1, cost: 3, hp: 8, attack: 0, defense: 4, speed: 0, abilities: ['heal'], flavorText: 'Its light never fades.' },
  { id: 't_chaos', name: 'Totem of Madness', cardClass: 'Jester', elements: ['Arcane', 'Shadow'], type: 'Totem', level: 1, cost: 2, hp: 5, attack: 0, defense: 2, speed: 0, abilities: ['chaos_swap'], flavorText: 'Sanity warps near its glow.' },
  { id: 't_wind', name: 'Windcaller Totem', cardClass: 'Trickster', elements: ['Air'], type: 'Totem', level: 1, cost: 2, hp: 6, attack: 0, defense: 3, speed: 0, abilities: ['reflect'], flavorText: 'The wind carries back what was given.' },
  { id: 't_war', name: 'War Drum Totem', cardClass: 'Warrior', elements: ['Fire', 'Earth'], type: 'Totem', level: 1, cost: 3, hp: 8, attack: 0, defense: 4, speed: 0, abilities: ['cleave'], flavorText: 'Its beat quickens the blood.' },
  { id: 't_primal', name: 'Primal Totem', cardClass: 'Beastmaster', elements: ['Nature', 'Earth'], type: 'Totem', level: 1, cost: 3, hp: 9, attack: 0, defense: 4, speed: 0, abilities: ['pack_tactics', 'summon_cub'], flavorText: 'The wild gathers here.' },

  // ============================================
  // UTILITY CARDS (10)
  // ============================================
  { id: 'u_draw_power', name: 'Arcane Insight', cardClass: 'Elementalist', elements: ['Arcane'], type: 'Utility', level: 1, cost: 1, hp: 0, attack: 0, defense: 0, speed: 0, abilities: [], flavorText: 'Knowledge flows like water.', },
  { id: 'u_resource_surge', name: 'Mana Surge', cardClass: 'Battlemage', elements: ['Arcane'], type: 'Utility', level: 1, cost: 0, hp: 0, attack: 0, defense: 0, speed: 0, abilities: [], flavorText: 'Power floods the ley lines.', },
  { id: 'u_mass_heal', name: 'Divine Restoration', cardClass: 'Priest', elements: ['Light'], type: 'Utility', level: 1, cost: 4, hp: 0, attack: 0, defense: 0, speed: 0, abilities: ['greater_heal'], flavorText: 'All wounds close at her word.', },
  { id: 'u_field_clear', name: 'Cataclysm', cardClass: 'Elementalist', elements: ['Fire', 'Lightning'], type: 'Utility', level: 1, cost: 6, hp: 0, attack: 0, defense: 0, speed: 0, abilities: [], flavorText: 'When all else fails, burn it all.', },
  { id: 'u_steal', name: 'Pickpocket', cardClass: 'Trickster', elements: ['Shadow'], type: 'Utility', level: 1, cost: 2, hp: 0, attack: 0, defense: 0, speed: 0, abilities: [], flavorText: 'What\'s yours is mine.', },
  { id: 'u_time_warp', name: 'Temporal Shift', cardClass: 'Chronomancer', elements: ['Arcane'], type: 'Utility', level: 1, cost: 3, hp: 0, attack: 0, defense: 0, speed: 0, abilities: [], flavorText: 'Skip ahead. Leave them behind.', },
  { id: 'u_blood_pact', name: 'Blood Pact', cardClass: 'Warlock', elements: ['Shadow'], type: 'Utility', level: 1, cost: 2, hp: 0, attack: 0, defense: 0, speed: 0, abilities: [], flavorText: 'Pay in blood. Gain in power.', },
  { id: 'u_fortify', name: 'Fortify', cardClass: 'Guardian', elements: ['Earth'], type: 'Utility', level: 1, cost: 2, hp: 0, attack: 0, defense: 0, speed: 0, abilities: ['shield_wall'], flavorText: 'The line holds.', },
  { id: 'u_beast_call', name: 'Call of the Wild', cardClass: 'Beastmaster', elements: ['Nature'], type: 'Utility', level: 1, cost: 3, hp: 0, attack: 0, defense: 0, speed: 0, abilities: ['summon_cub'], flavorText: 'The forest answers.', },
  { id: 'u_chaos_bolt', name: 'Chaos Bolt', cardClass: 'Jester', elements: ['Arcane', 'Fire'], type: 'Utility', level: 1, cost: 2, hp: 0, attack: 0, defense: 0, speed: 0, abilities: ['random_spell'], flavorText: 'Aim is optional. Chaos is guaranteed.', },
];

export function getCardById(id: string): CardDefinition | undefined {
  return ALL_CARDS.find(c => c.id === id);
}

export function getCardsByClass(cardClass: string): CardDefinition[] {
  return ALL_CARDS.filter(c => c.cardClass === cardClass);
}

export function getCardsByType(type: string): CardDefinition[] {
  return ALL_CARDS.filter(c => c.type === type);
}

export function getCardsByElement(element: string): CardDefinition[] {
  return ALL_CARDS.filter(c => c.elements.includes(element as Element));
}
