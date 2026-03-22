'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ELEMENT_COLORS, ELEMENT_STRENGTHS, CLASS_ICONS } from '../../engine/elements';
import { Element, CardClass } from '../../engine/types';
import GameCard from '../../components/cards/GameCard';
import { ALL_CARDS } from '../../data/cards';

const ELEMENTS: Element[] = ['Fire', 'Water', 'Earth', 'Air', 'Lightning', 'Ice', 'Nature', 'Arcane', 'Light', 'Shadow'];

const CLASS_INFO: { name: CardClass; role: string; strengths: string; weaknesses: string }[] = [
  { name: 'Battlemage', role: 'Hybrid magic fighter', strengths: 'Balanced spellcasting and combat', weaknesses: 'No extreme specialization' },
  { name: 'Elementalist', role: 'Elemental spell specialist', strengths: 'Highest elemental damage', weaknesses: 'Fragile without support' },
  { name: 'Chronomancer', role: 'Time manipulation controller', strengths: 'Turn manipulation, high speed', weaknesses: 'Lower direct damage' },
  { name: 'Warlock', role: 'Forbidden magic wielder', strengths: 'Life drain, curse effects', weaknesses: 'Self-damage mechanics' },
  { name: 'Priest', role: 'Healing and protection', strengths: 'Healing, debuff removal', weaknesses: 'Low offensive potential' },
  { name: 'Beastmaster', role: 'Creature synergy commander', strengths: 'Beast buffs, summoning', weaknesses: 'Relies on beasts' },
  { name: 'Trickster', role: 'Tactical disruption', strengths: 'Battlefield manipulation', weaknesses: 'Low survivability' },
  { name: 'Jester', role: 'Chaos manipulation', strengths: 'Unpredictable, ability copying', weaknesses: 'Inconsistent strategy' },
  { name: 'Guardian', role: 'Defensive protector', strengths: 'High durability, protection', weaknesses: 'Limited offense' },
  { name: 'Warrior', role: 'Direct physical fighter', strengths: 'Reliable combat damage', weaknesses: 'Limited magical ability' },
];

const RULES_SECTIONS = [
  {
    title: 'Win Condition',
    icon: '🏆',
    content: 'Reduce your opponent\'s Life to 0. Each player starts with 30 Life.',
  },
  {
    title: 'Turn Structure',
    icon: '🔄',
    content: `Each turn follows 5 phases:
1. **Draw Phase** - Draw a card from your deck
2. **Resource Phase** - Your resources increase by 1 (max 10)
3. **Main Phase** - Play cards from your hand
4. **Combat Phase** - Declare attacks with your units
5. **End Phase** - Resolve end-of-turn effects`,
  },
  {
    title: 'Resources',
    icon: '💎',
    content: 'Resources grow automatically each turn. Turn 1 = 1 resource, Turn 2 = 2, and so on up to 10. Each card has a cost that must be paid to play it.',
  },
  {
    title: 'Battlefield',
    icon: '⚔️',
    content: `Each player controls:
- **1 Mage** - Your commander
- **4 Fighters** - Your main combat units
- **3 Beasts** - Creature allies
- **2 Totems** - Field effect generators
- **Relics** - Equipment that attaches to units`,
  },
  {
    title: 'Combat',
    icon: '💥',
    content: 'Damage = Attack - Defense (minimum 1 damage). Element strengths add +3 damage, weaknesses reduce by -2. Units can attack once per turn after their first turn in play.',
  },
  {
    title: 'Evolution',
    icon: '📈',
    content: 'Cards evolve through levels: L1 → L2 → L3. To play an L2 card, its L1 version must be on the battlefield. L3 requires L2. Equipment stays attached through evolution.',
  },
  {
    title: 'Deck Building',
    icon: '🃏',
    content: `Recommended deck size: 40 cards
- 1 Mage
- 6 Fighters
- 10 Beasts
- 10 Relics
- 5 Totems
- 8 Utility cards`,
  },
];

export default function RulesPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [activeTab, setActiveTab] = useState<'rules' | 'elements' | 'classes'>('rules');
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          <span className="bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            📜 Rules &amp; Reference
          </span>
        </h1>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {(['rules', 'elements', 'classes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-bold text-sm capitalize transition-all ${
                activeTab === tab
                  ? 'bg-purple-700 text-white border border-purple-500'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
              }`}
            >
              {tab === 'rules' ? '📖 Rules' : tab === 'elements' ? '⚡ Elements' : '🧙 Classes'}
            </button>
          ))}
        </div>

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1 space-y-1">
              {RULES_SECTIONS.map((section, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSection(i)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                    activeSection === i
                      ? 'bg-purple-800/50 text-white border-l-2 border-purple-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {section.icon} {section.title}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-900/40 border border-purple-900/30 rounded-xl p-6"
                >
                  <h2 className="text-2xl font-bold mb-4 text-gold">
                    {RULES_SECTIONS[activeSection].icon} {RULES_SECTIONS[activeSection].title}
                  </h2>
                  <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {RULES_SECTIONS[activeSection].content.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Elements Tab */}
        {activeTab === 'elements' && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-center text-gold">Element Affinity Chart</h2>
            
            {/* Modifier legend */}
            <div className="flex justify-center gap-6 mb-6 text-sm">
              <span className="text-green-400">Strong Against: +3 damage</span>
              <span className="text-red-400">Weak Against: -2 damage</span>
              <span className="text-gray-400">Neutral: No change</span>
            </div>

            {/* Element grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {ELEMENTS.map(el => {
                const colors = ELEMENT_COLORS[el];
                const strongAgainst = ELEMENT_STRENGTHS[el];
                const weakTo = Object.entries(ELEMENT_STRENGTHS).find(([, v]) => v === el)?.[0] as Element | undefined;
                
                return (
                  <motion.div
                    key={el}
                    whileHover={{ scale: 1.05 }}
                    onHoverStart={() => setHoveredElement(el)}
                    onHoverEnd={() => setHoveredElement(null)}
                    className={`
                      p-4 rounded-xl border transition-all cursor-pointer
                      ${hoveredElement === el ? 'border-2' : 'border border-gray-700'}
                    `}
                    style={{
                      borderColor: hoveredElement === el ? colors.primary : undefined,
                      background: `linear-gradient(135deg, ${colors.primary}15, #0a0a0f)`,
                      boxShadow: hoveredElement === el ? `0 0 20px ${colors.glow}30` : 'none',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div className="text-center font-bold text-sm">{el}</div>
                    <div className="text-center mt-2 space-y-1">
                      <div className="text-[10px] text-green-400">Strong vs: {strongAgainst}</div>
                      {weakTo && (
                        <div className="text-[10px] text-red-400">Weak to: {weakTo}</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Relationship chart */}
            <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="p-1 text-gray-500">Attacker ↓</th>
                    {ELEMENTS.map(el => (
                      <th key={el} className="p-1 text-center" style={{ color: ELEMENT_COLORS[el].primary }}>
                        {el.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ELEMENTS.map(atkEl => (
                    <tr key={atkEl}>
                      <td className="p-1 font-bold" style={{ color: ELEMENT_COLORS[atkEl].primary }}>
                        {atkEl}
                      </td>
                      {ELEMENTS.map(defEl => {
                        const isStrong = ELEMENT_STRENGTHS[atkEl] === defEl;
                        const isWeak = ELEMENT_STRENGTHS[defEl] === atkEl;
                        return (
                          <td
                            key={defEl}
                            className={`p-1 text-center font-bold ${
                              isStrong ? 'text-green-400 bg-green-900/20' : 
                              isWeak ? 'text-red-400 bg-red-900/20' : 
                              'text-gray-600'
                            }`}
                          >
                            {isStrong ? '+3' : isWeak ? '-2' : '0'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLASS_INFO.map((cls, i) => {
              const mageCard = ALL_CARDS.find(c => c.type === 'Mage' && c.cardClass === cls.name);
              return (
                <motion.div
                  key={cls.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gray-900/40 border border-purple-900/30 rounded-xl p-4 flex gap-4"
                >
                  <div className="flex-shrink-0">
                    {mageCard && <GameCard definition={mageCard} small />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {CLASS_ICONS[cls.name]} {cls.name}
                    </h3>
                    <p className="text-xs text-purple-400 mb-2">{cls.role}</p>
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-green-400 font-bold">Strengths:</span>{' '}
                        <span className="text-gray-300">{cls.strengths}</span>
                      </div>
                      <div>
                        <span className="text-red-400 font-bold">Weaknesses:</span>{' '}
                        <span className="text-gray-300">{cls.weaknesses}</span>
                      </div>
                      {mageCard && (
                        <div className="text-gray-500 mt-1">
                          Elements: {mageCard.elements.map(e => (
                            <span
                              key={e}
                              className="inline-block px-1 rounded text-[10px] mr-1"
                              style={{ backgroundColor: ELEMENT_COLORS[e].primary + '30', color: ELEMENT_COLORS[e].primary }}
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
