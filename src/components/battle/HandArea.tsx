'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardInstance } from '../../engine/types';
import { canPlayCard } from '../../engine/gameEngine';
import { PlayerState } from '../../engine/types';
import { getCardById } from '../../data/cards';
import GameCard from '../cards/GameCard';

interface HandAreaProps {
  hand: CardInstance[];
  player: PlayerState;
  selectedCard: string | null;
  onSelectCard: (instanceId: string) => void;
  canPlay: boolean;
  hidden?: boolean;
}

export default function HandArea({
  hand,
  player,
  selectedCard,
  onSelectCard,
  canPlay,
  hidden = false,
}: HandAreaProps) {
  return (
    <div className="flex items-end justify-start gap-2 py-2 min-h-[100px] overflow-x-auto px-2 flex-shrink-0">
      <AnimatePresence>
        {hand.map((card, i) => {
          const playable = canPlay && canPlayCard(player, card);
          return (
            <motion.div
              key={card.instanceId}
              initial={{ x: 100, opacity: 0, rotateY: 180 }}
              animate={{
                x: 0,
                opacity: 1,
                rotateY: 0,
                rotate: hand.length > 5 ? (i - (hand.length - 1) / 2) * 3 : 0,
              }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {hidden ? (
                <GameCard faceDown small />
              ) : (
                <div className="relative group">
                  <GameCard
                    card={card}
                    small
                    selected={selectedCard === card.instanceId}
                    onClick={() => onSelectCard(card.instanceId)}
                    disabled={!playable && canPlay}
                  />
                  {!playable && canPlay && (() => {
                    const def = getCardById(card.definitionId);
                    if (def && def.cost > player.resources) {
                      return (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-[9px] text-red-400 px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 border border-red-800/50">
                          Cost {def.cost} / {player.resources} available
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {hand.length === 0 && (
        <div className="text-gray-600 text-sm italic">No cards in hand</div>
      )}
    </div>
  );
}
