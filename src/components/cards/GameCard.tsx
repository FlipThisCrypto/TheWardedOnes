'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CardDefinition, CardInstance } from '../../engine/types';
import { ELEMENT_COLORS, CLASS_ICONS, TYPE_ICONS } from '../../engine/elements';
import { getCardById } from '../../data/cards';

interface GameCardProps {
  card?: CardInstance;
  definition?: CardDefinition;
  onClick?: () => void;
  selected?: boolean;
  small?: boolean;
  showStats?: boolean;
  disabled?: boolean;
  faceDown?: boolean;
}

export default function GameCard({
  card,
  definition,
  onClick,
  selected = false,
  small = false,
  showStats = true,
  disabled = false,
  faceDown = false,
}: GameCardProps) {
  const def = definition || (card ? getCardById(card.definitionId) : null);
  if (!def && !faceDown) return null;

  if (faceDown) {
    return (
      <div className={`
        ${small ? 'w-32 h-44' : 'w-36 h-52'}
        rounded-lg border border-purple-800
        bg-gradient-to-br from-[#1a0a2e] to-[#0a0a0f]
        flex items-center justify-center relative flex-shrink-0
        shadow-md shadow-purple-900/30
      `}>
        <div className={`${small ? 'text-lg' : 'text-2xl'} opacity-40`}>🔮</div>
      </div>
    );
  }

  const primaryElement = def!.elements[0];
  const colors = ELEMENT_COLORS[primaryElement];
  const classIcon = CLASS_ICONS[def!.cardClass];
  const typeIcon = TYPE_ICONS[def!.type];

  const hp = card ? card.currentHp : def!.hp;
  const atk = card ? card.currentAttack : def!.attack;
  const defStat = card ? card.currentDefense : def!.defense;
  const spd = card ? card.currentSpeed : def!.speed;

  const isHurt = card && card.currentHp < def!.hp;
  const isBoosted = card && (card.currentAttack > def!.attack || card.currentDefense > def!.defense);

  return (
    <motion.div
      whileHover={disabled ? {} : { y: small ? -6 : -8, scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={disabled ? undefined : onClick}
      className={`
        ${small ? 'w-32 h-44' : 'w-36 h-52'}
        rounded-lg border relative overflow-hidden flex-shrink-0
        cursor-pointer select-none
        transition-all duration-200
        ${selected ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-black border-yellow-400' : 'border-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{
        boxShadow: selected
          ? `0 0 15px ${colors.glow}, 0 0 30px ${colors.glow}40`
          : `0 0 6px ${colors.glow}30`,
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}20 0%, #0a0a0f 50%, ${colors.primary}10 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-1">
        {/* Top bar: cost + class icon */}
        <div className="flex justify-between items-center">
          <div className={`${small ? 'w-6 h-6' : 'w-6 h-6'} rounded-full bg-blue-900/80 border border-blue-400 flex items-center justify-center`}>
            <span className={`${small ? 'text-xs' : 'text-xs'} font-bold text-blue-200`}>{def!.cost}</span>
          </div>
          <span className={small ? 'text-sm' : 'text-xs'}>{classIcon}</span>
        </div>

        {/* Card art area */}
        <div
          className={`${small ? 'h-14 my-0.5' : 'h-16 my-1'} rounded flex items-center justify-center relative overflow-hidden`}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}40, ${colors.primary}10)`,
          }}
        >
          <span className={small ? 'text-xl' : 'text-2xl'}>{typeIcon}</span>
          {/* Element dots */}
          <div className="absolute bottom-0 right-0.5 flex gap-px">
            {def!.elements.map((el, i) => (
              <div
                key={i}
                className={`${small ? 'w-2 h-2' : 'w-2 h-2'} rounded-full`}
                style={{ backgroundColor: ELEMENT_COLORS[el].primary }}
                title={el}
              />
            ))}
          </div>
          {def!.level > 1 && (
            <div className="absolute top-0 left-0 bg-yellow-900/80 rounded-br px-0.5">
              <span className="text-[6px] font-bold text-yellow-300">L{def!.level}</span>
            </div>
          )}
        </div>

        {/* Name */}
        <div className={`${small ? 'text-xs leading-tight' : 'text-[10px]'} font-bold text-center text-white truncate`}>
          {def!.name}
        </div>

        {/* Stats */}
        {showStats && def!.type !== 'Utility' && (
          <div className={`mt-auto grid grid-cols-2 gap-0.5 ${small ? 'text-[10px]' : 'text-[8px]'}`}>
            <div className={`text-center rounded-sm ${isHurt ? 'bg-red-900/60 text-red-300' : 'bg-red-900/30 text-red-400'}`}>
              <span className="font-bold">{hp}</span><span className="opacity-60"> HP</span>
            </div>
            <div className={`text-center rounded-sm ${isBoosted ? 'bg-orange-900/60 text-orange-300' : 'bg-orange-900/30 text-orange-400'}`}>
              <span className="font-bold">{atk}</span><span className="opacity-60"> ATK</span>
            </div>
            <div className="text-center rounded-sm bg-blue-900/30 text-blue-400">
              <span className="font-bold">{defStat}</span><span className="opacity-60"> DEF</span>
            </div>
            <div className="text-center rounded-sm bg-green-900/30 text-green-400">
              <span className="font-bold">{spd}</span><span className="opacity-60"> SPD</span>
            </div>
          </div>
        )}
      </div>

      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded opacity-0 hover:opacity-20 transition-opacity pointer-events-none"
        style={{ backgroundColor: colors.glow }}
      />
    </motion.div>
  );
}
