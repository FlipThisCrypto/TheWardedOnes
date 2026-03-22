'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BattlefieldSlot as SlotType } from '../../engine/types';
import GameCard from '../cards/GameCard';

interface BattlefieldSlotProps {
  slot: SlotType;
  label: string;
  onClick?: () => void;
  onCardClick?: (instanceId: string) => void;
  isValidTarget?: boolean;
  isAttacker?: boolean;
}

export default function BattlefieldSlot({
  slot,
  label,
  onClick,
  onCardClick,
  isValidTarget = false,
  isAttacker = false,
}: BattlefieldSlotProps) {
  if (slot.card) {
    return (
      <motion.div
        layout
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative ${isAttacker ? 'ring-2 ring-red-500 rounded-lg' : ''} ${isValidTarget ? 'ring-2 ring-yellow-400 rounded-lg animate-pulse' : ''}`}
      >
        <GameCard
          card={slot.card}
          small
          onClick={() => onCardClick?.(slot.card!.instanceId)}
          selected={isAttacker}
        />
        {/* Status effects indicator */}
        {slot.card.statusEffects.length > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">{slot.card.statusEffects.length}</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05, borderColor: '#d4a574' } : {}}
      onClick={onClick}
      className={`
        w-16 h-20 rounded-lg border border-dashed
        ${isValidTarget ? 'border-yellow-400 bg-yellow-900/20 animate-pulse' : 'border-gray-700/40 bg-gray-900/20'}
        flex items-center justify-center
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      <span className="text-[7px] text-gray-600 text-center">{label}</span>
    </motion.div>
  );
}
