'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlayerState } from '../../engine/types';

interface PlayerHUDProps {
  player: PlayerState;
  isActive: boolean;
  position: 'top' | 'bottom';
  side?: boolean;
}

export default function PlayerHUD({ player, isActive, position, side = false }: PlayerHUDProps) {
  const lifePercent = (player.life / 30) * 100;
  const lifeColor = lifePercent > 50 ? 'bg-green-500' : lifePercent > 25 ? 'bg-yellow-500' : 'bg-red-500';

  if (side) {
    return (
      <div
        role="region"
        aria-label={`${player.name} status${isActive ? ', active turn' : ''}`}
        className={`
        flex flex-col items-center gap-1 px-2 py-3 rounded-lg w-16 flex-shrink-0
        ${isActive ? 'bg-purple-900/40 border border-purple-500/50' : 'bg-gray-900/40 border border-gray-700/30'}
      `}>
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm
          ${isActive ? 'bg-purple-700 border border-yellow-400' : 'bg-gray-700 border border-gray-600'}
        `}>
          {position === 'bottom' ? '⚔️' : '💀'}
        </div>
        <span className="text-[9px] font-bold text-white text-center truncate w-full">{player.name}</span>
        <span className="text-[8px] text-gray-500 text-center">{player.selectedClass}</span>
        
        {/* Vertical life bar */}
        <div className="w-3 h-16 bg-gray-800 rounded-full overflow-hidden flex flex-col-reverse">
          <motion.div
            className={`w-full rounded-full ${lifeColor}`}
            animate={{ height: `${lifePercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-[10px] text-red-400 font-bold" aria-label={`Life ${player.life}`}>
          {player.life}
        </span>
        
        <div className="flex flex-col items-center gap-0.5 mt-1">
          <span className="text-[10px] text-blue-400" aria-label={`Resources ${player.resources}`}>
            💎{player.resources}
          </span>
          <span className="text-[10px] text-gray-500" aria-label={`Deck ${player.deck.length}`}>
            🃏{player.deck.length}
          </span>
          <span className="text-[10px] text-gray-500" aria-label={`Hand ${player.hand.length}`}>
            ✋{player.hand.length}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      flex items-center gap-2 px-3 py-1 rounded flex-shrink-0
      ${isActive ? 'bg-purple-900/40 border border-purple-500/50' : 'bg-gray-900/40 border border-gray-700/30'}
    `}>
      <div className={`
        w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0
        ${isActive ? 'bg-purple-700 border border-yellow-400' : 'bg-gray-700 border border-gray-600'}
      `}>
        {position === 'bottom' ? '⚔️' : '💀'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white truncate">{player.name}</span>
          <span className="text-[10px] text-gray-500">{player.selectedClass}</span>
          <div className="flex-1" />
          <span className="text-[10px] text-red-400">❤️ {player.life}/30</span>
          <span className="text-[10px] text-blue-400">💎 {player.resources}/{player.maxResources}</span>
          <span className="text-[10px] text-gray-500">🃏{player.deck.length}</span>
          <span className="text-[10px] text-gray-500">✋{player.hand.length}</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-0.5">
          <motion.div
            className={`h-full rounded-full ${lifeColor}`}
            animate={{ width: `${lifePercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
