'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ParticleCanvas from '../components/effects/ParticleCanvas';
import GameCard from '../components/cards/GameCard';
import { ALL_CARDS } from '../data/cards';

const SHOWCASE_CARDS = ALL_CARDS.filter(c => c.type === 'Mage');

export default function LandingPage() {
  const [currentCard, setCurrentCard] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard(prev => (prev + 1) % SHOWCASE_CARDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-dark-fantasy relative overflow-hidden">
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <ParticleCanvas width={1400} height={900} className="w-full h-full" ambient />
      </div>

      {/* Rune circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-purple-800/20 rounded-full rune-spin pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-yellow-800/10 rounded-full rune-spin pointer-events-none" style={{ animationDirection: 'reverse' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-purple-900/10 rounded-full rune-spin pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center max-w-4xl"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8"
          >
            <div className="text-6xl mb-4">🔮</div>
            <h1 className="text-5xl md:text-7xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 via-yellow-300 to-purple-400 bg-clip-text text-transparent">
                The Warded Ones
              </span>
            </h1>
            <div className="text-xl md:text-2xl text-[#d4a574] font-light tracking-widest">
              TRADING CARD GAME
            </div>
          </motion.div>

          {/* Lore text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            In a world where ancient wards shatter and dark magic floods the land,
            ten classes of mages rise to battle for supremacy. Wield the power of
            ten elements. Command beasts, summon totems, and evolve your forces
            to crush your enemies.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/battle">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-700 to-purple-900 text-white font-bold text-lg rounded-lg border border-purple-500/50 shadow-lg shadow-purple-900/30 transition-all"
              >
                ⚔️ Play Now
              </motion.button>
            </Link>
            <Link href="/deck-builder">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-900/80 text-[#d4a574] font-bold text-lg rounded-lg border border-[#d4a574]/30 hover:border-[#d4a574]/60 transition-all"
              >
                🃏 Build Deck
              </motion.button>
            </Link>
            <Link href="/rules">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-900/80 text-gray-300 font-bold text-lg rounded-lg border border-gray-700 hover:border-gray-500 transition-all"
              >
                📜 Learn Rules
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Card Showcase Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex items-center gap-4 justify-center"
        >
          {SHOWCASE_CARDS.map((card, i) => {
            const offset = (i - currentCard + SHOWCASE_CARDS.length) % SHOWCASE_CARDS.length;
            const isCenter = offset === 0;
            const isNear = offset === 1 || offset === SHOWCASE_CARDS.length - 1;
            
            if (!isCenter && !isNear) return null;
            
            return (
              <motion.div
                key={card.id}
                animate={{
                  scale: isCenter ? 1.1 : 0.85,
                  opacity: isCenter ? 1 : 0.5,
                  x: isCenter ? 0 : offset === 1 ? 20 : -20,
                }}
                transition={{ duration: 0.5 }}
                className={isCenter ? 'animate-float' : ''}
              >
                <GameCard definition={card} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-gray-500 text-sm"
          >
            ↓ Scroll for more
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            <span className="bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
              Master the Elements
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔮',
                title: '10 Unique Classes',
                desc: 'From the arcane Chronomancer to the savage Beastmaster. Each class offers a distinct playstyle and strategy.',
              },
              {
                icon: '⚡',
                title: '10 Elements',
                desc: 'Fire, Water, Earth, Air, Lightning, Ice, Nature, Arcane, Light, Shadow. Master the affinity chart to dominate.',
              },
              {
                icon: '📈',
                title: 'Card Evolution',
                desc: 'Evolve your units from L1 to L3. Watch them grow from recruits to legends on the battlefield.',
              },
              {
                icon: '🐺',
                title: 'Beast & Totem Synergy',
                desc: 'Command beasts, place totems, and attach relics. Build synergies that overwhelm your opponent.',
              },
              {
                icon: '🤖',
                title: 'AI Opponent',
                desc: 'Test your decks against a strategic AI that evaluates threats and plays smart.',
              },
              {
                icon: '⚔️',
                title: 'Local PvP',
                desc: 'Challenge a friend in hot-seat mode. Same screen, same stakes, no mercy.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-900/40 border border-purple-900/30 rounded-xl p-6 hover:border-purple-700/50 transition-all"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Class Showcase */}
      <section className="relative z-10 py-20 px-4 bg-purple-950/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gold">Choose Your Class</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SHOWCASE_CARDS.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-2"
              >
                <GameCard definition={card} small />
                <span className="text-xs text-gray-400">{card.cardClass}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-white">Ready to Battle?</h2>
        <p className="text-gray-400 mb-8">Build your deck. Choose your class. Enter the arena.</p>
        <Link href="/battle">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-purple-700 to-yellow-700 text-white font-bold text-xl rounded-lg shadow-lg transition-all"
          >
            ⚔️ Enter the Arena
          </motion.button>
        </Link>
        <div className="mt-16 text-gray-600 text-xs">
          The Warded Ones TCG &copy; 2026 Fiend Studios. All rights reserved.
        </div>
      </section>
    </div>
  );
}
