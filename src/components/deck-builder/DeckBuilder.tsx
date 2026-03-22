'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_CARDS } from '../../data/cards';
import { CardClass, CardType, Element, DeckList, CardDefinition } from '../../engine/types';
import {
  validateDeck, DECK_SIZE, saveDeckToStorage,
  loadDecksFromStorage, deleteDeckFromStorage,
  generateDefaultDeck,
} from '../../engine/deckUtils';
import { ELEMENT_COLORS, CLASS_ICONS } from '../../engine/elements';
import GameCard from '../cards/GameCard';

const ALL_CLASSES: CardClass[] = [
  'Battlemage', 'Elementalist', 'Chronomancer', 'Warlock', 'Priest',
  'Beastmaster', 'Trickster', 'Jester', 'Guardian', 'Warrior',
];
const ALL_TYPES: CardType[] = ['Mage', 'Fighter', 'Beast', 'Relic', 'Totem', 'Utility'];
const ALL_ELEMENTS: Element[] = [
  'Fire', 'Water', 'Earth', 'Air', 'Lightning',
  'Ice', 'Nature', 'Arcane', 'Light', 'Shadow',
];

export default function DeckBuilder() {
  const [deckCards, setDeckCards] = useState<string[]>([]);
  const [deckName, setDeckName] = useState('My Deck');
  const [selectedClass, setSelectedClass] = useState<CardClass | 'all'>('all');
  const [selectedType, setSelectedType] = useState<CardType | 'all'>('all');
  const [selectedElement, setSelectedElement] = useState<Element | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [savedDecks, setSavedDecks] = useState<DeckList[]>(() => loadDecksFromStorage());
  const [showSavedDecks, setShowSavedDecks] = useState(false);

  const filteredCards = useMemo(() => {
    return ALL_CARDS.filter(card => {
      if (selectedClass !== 'all' && card.cardClass !== selectedClass) return false;
      if (selectedType !== 'all' && card.type !== selectedType) return false;
      if (selectedElement !== 'all' && !card.elements.includes(selectedElement)) return false;
      if (searchText && !card.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    });
  }, [selectedClass, selectedType, selectedElement, searchText]);

  const validation = useMemo(() => validateDeck(deckCards), [deckCards]);

  const addCard = useCallback((cardId: string) => {
    setDeckCards(prev => {
      if (prev.length >= DECK_SIZE) return prev;
      return [...prev, cardId];
    });
  }, []);

  const removeCard = useCallback((index: number) => {
    setDeckCards(prev => prev.filter((_, i) => i !== index));
  }, []);

  const saveDeck = useCallback(() => {
    const mage = deckCards.find(id => ALL_CARDS.find(c => c.id === id)?.type === 'Mage');
    const mageCard = mage ? ALL_CARDS.find(c => c.id === mage) : null;
    const deck: DeckList = {
      id: `deck_${Date.now()}`,
      name: deckName,
      playerClass: mageCard?.cardClass || 'Battlemage',
      cards: deckCards,
    };
    saveDeckToStorage(deck);
    setSavedDecks(loadDecksFromStorage());
  }, [deckCards, deckName]);

  const loadDeck = useCallback((deck: DeckList) => {
    setDeckCards(deck.cards);
    setDeckName(deck.name);
    setShowSavedDecks(false);
  }, []);

  const autoFill = useCallback((playerClass: CardClass) => {
    setDeckCards(generateDefaultDeck(playerClass));
    setDeckName(`${playerClass} Deck`);
  }, []);

  const deckCardDefs = useMemo(() => {
    return deckCards.map(id => ALL_CARDS.find(c => c.id === id)).filter(Boolean) as CardDefinition[];
  }, [deckCards]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            Deck Builder
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSavedDecks(!showSavedDecks)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 border border-gray-700"
            >
              📁 Saved Decks
            </button>
          </div>
        </div>

        {/* Saved Decks Panel */}
        <AnimatePresence>
          {showSavedDecks && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-300 mb-3">Saved Decks</h3>
                {savedDecks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No saved decks yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {savedDecks.map(deck => (
                      <div key={deck.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="text-sm font-bold">{deck.name}</div>
                        <div className="text-xs text-gray-400">{deck.playerClass} - {deck.cards.length} cards</div>
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => loadDeck(deck)}
                            className="px-2 py-1 bg-purple-700 text-white text-xs rounded hover:bg-purple-600"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => { deleteDeckFromStorage(deck.id); setSavedDecks(loadDecksFromStorage()); }}
                            className="px-2 py-1 bg-red-800 text-white text-xs rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card Collection (left/center) */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 mb-4">
              <div className="flex flex-wrap gap-3 mb-3">
                {/* Search */}
                <input
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder="Search cards..."
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />

                {/* Class filter */}
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value as CardClass | 'all')}
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Classes</option>
                  {ALL_CLASSES.map(c => (
                    <option key={c} value={c}>{CLASS_ICONS[c]} {c}</option>
                  ))}
                </select>

                {/* Type filter */}
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value as CardType | 'all')}
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Types</option>
                  {ALL_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                {/* Element filter */}
                <select
                  value={selectedElement}
                  onChange={e => setSelectedElement(e.target.value as Element | 'all')}
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Elements</option>
                  {ALL_ELEMENTS.map(el => (
                    <option key={el} value={el}>{el}</option>
                  ))}
                </select>
              </div>

              {/* Auto-fill buttons */}
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-gray-500 mr-2 self-center">Quick fill:</span>
                {ALL_CLASSES.map(c => (
                  <button
                    key={c}
                    onClick={() => autoFill(c)}
                    className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[10px] rounded hover:bg-purple-800 hover:text-white border border-gray-700 transition-all"
                  >
                    {CLASS_ICONS[c]} {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {filteredCards.map(card => (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => addCard(card.id)}
                >
                  <GameCard definition={card} small />
                  <div className="text-center mt-0.5">
                    <span className="text-[8px] text-gray-500">
                      {deckCards.filter(id => id === card.id).length}x in deck
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredCards.length === 0 && (
              <div className="text-center text-gray-500 py-8">No cards match your filters.</div>
            )}
          </div>

          {/* Deck Panel (right) */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 sticky top-4">
              {/* Deck name */}
              <input
                type="text"
                value={deckName}
                onChange={e => setDeckName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-purple-500"
                placeholder="Deck Name"
              />

              {/* Card count */}
              <div className="flex justify-between items-center mb-3">
                <span className={`text-sm font-bold ${validation.counts.total === DECK_SIZE ? 'text-green-400' : 'text-yellow-400'}`}>
                  {validation.counts.total}/{DECK_SIZE} Cards
                </span>
                <button
                  onClick={saveDeck}
                  disabled={!validation.valid}
                  className="px-3 py-1 bg-green-700 text-white text-xs rounded font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  💾 Save
                </button>
              </div>

              {/* Slot counts */}
              <div className="grid grid-cols-3 gap-1 mb-3 text-[10px]">
                <div className={`px-2 py-1 rounded text-center ${validation.counts.mages <= 1 ? 'bg-gray-800 text-gray-400' : 'bg-red-900 text-red-400'}`}>
                  Mage: {validation.counts.mages}/1
                </div>
                <div className={`px-2 py-1 rounded text-center ${validation.counts.fighters <= 6 ? 'bg-gray-800 text-gray-400' : 'bg-red-900 text-red-400'}`}>
                  Fight: {validation.counts.fighters}/6
                </div>
                <div className={`px-2 py-1 rounded text-center ${validation.counts.beasts <= 10 ? 'bg-gray-800 text-gray-400' : 'bg-red-900 text-red-400'}`}>
                  Beast: {validation.counts.beasts}/10
                </div>
                <div className={`px-2 py-1 rounded text-center ${validation.counts.relics <= 10 ? 'bg-gray-800 text-gray-400' : 'bg-red-900 text-red-400'}`}>
                  Relic: {validation.counts.relics}/10
                </div>
                <div className={`px-2 py-1 rounded text-center ${validation.counts.totems <= 5 ? 'bg-gray-800 text-gray-400' : 'bg-red-900 text-red-400'}`}>
                  Totem: {validation.counts.totems}/5
                </div>
                <div className={`px-2 py-1 rounded text-center ${validation.counts.utility <= 8 ? 'bg-gray-800 text-gray-400' : 'bg-red-900 text-red-400'}`}>
                  Util: {validation.counts.utility}/8
                </div>
              </div>

              {/* Validation errors */}
              {validation.errors.length > 0 && (
                <div className="mb-3 space-y-1">
                  {validation.errors.map((err, i) => (
                    <div key={i} className="text-[10px] text-red-400 bg-red-900/20 px-2 py-1 rounded">
                      ⚠️ {err}
                    </div>
                  ))}
                </div>
              )}

              {/* Deck card list */}
              <div className="max-h-[50vh] overflow-y-auto space-y-1">
                {deckCardDefs.map((card, i) => (
                  <div
                    key={`${card.id}-${i}`}
                    className="flex items-center gap-2 bg-gray-800/50 rounded px-2 py-1 group hover:bg-gray-700/50"
                  >
                    <div className="flex gap-0.5">
                      {card.elements.map((el, j) => (
                        <div
                          key={j}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: ELEMENT_COLORS[el].primary }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-white flex-1 truncate">{card.name}</span>
                    <span className="text-[8px] text-gray-500">{card.type}</span>
                    <span className="text-[9px] text-blue-400 font-bold">{card.cost}💎</span>
                    <button
                      onClick={() => removeCard(i)}
                      className="text-red-400 opacity-0 group-hover:opacity-100 text-xs hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {deckCards.length === 0 && (
                <div className="text-center text-gray-600 py-4 text-sm">
                  Click cards to add them to your deck
                </div>
              )}

              {/* Clear button */}
              {deckCards.length > 0 && (
                <button
                  onClick={() => setDeckCards([])}
                  className="w-full mt-3 py-2 bg-gray-800 text-gray-400 text-xs rounded hover:bg-red-900 hover:text-red-400 border border-gray-700 transition-all"
                >
                  Clear Deck
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
