'use client';

import React from 'react';
import { PlayerState } from '../../engine/types';
import BattlefieldSlot from './BattlefieldSlot';

interface BattlefieldProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
  onSlotClick?: (slotType: string, index: number) => void;
  onCardClick?: (instanceId: string) => void;
  validTargets?: string[];
  attackerId?: string | null;
  label: string;
}

export default function Battlefield({
  player,
  isCurrentPlayer,
  onSlotClick,
  onCardClick,
  validTargets = [],
  attackerId,
  label,
}: BattlefieldProps) {
  return (
    <div className={`
      rounded-lg px-2 py-1 flex-shrink-0
      ${isCurrentPlayer ? 'bg-purple-950/30 border border-purple-800/30' : 'bg-gray-950/30 border border-gray-800/30'}
    `}>
      <div className="flex flex-col gap-1 items-center">
        {/* Row 1: Mage + Totems side by side */}
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-gray-600">🧙</span>
            <BattlefieldSlot
              slot={player.battlefield.mage}
              label="Mage"
              onCardClick={onCardClick}
              onClick={isCurrentPlayer ? () => onSlotClick?.('mage', 0) : undefined}
              isValidTarget={player.battlefield.mage.card ? validTargets.includes(player.battlefield.mage.card.instanceId) : false}
              isAttacker={player.battlefield.mage.card?.instanceId === attackerId}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-gray-600">🗿</span>
            {player.battlefield.totems.map((slot, i) => (
              <BattlefieldSlot
                key={`totem-${i}`}
                slot={slot}
                label={`T${i + 1}`}
                onCardClick={onCardClick}
                onClick={isCurrentPlayer ? () => onSlotClick?.('totem', i) : undefined}
                isValidTarget={slot.card ? validTargets.includes(slot.card.instanceId) : false}
                isAttacker={slot.card?.instanceId === attackerId}
              />
            ))}
          </div>
        </div>

        {/* Row 2: Fighters */}
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-gray-600">⚔️</span>
          {player.battlefield.fighters.map((slot, i) => (
            <BattlefieldSlot
              key={`fighter-${i}`}
              slot={slot}
              label={`F${i + 1}`}
              onCardClick={onCardClick}
              onClick={isCurrentPlayer ? () => onSlotClick?.('fighter', i) : undefined}
              isValidTarget={slot.card ? validTargets.includes(slot.card.instanceId) : false}
              isAttacker={slot.card?.instanceId === attackerId}
            />
          ))}
          <span className="text-[8px] text-gray-600 ml-1">🐉</span>
          {player.battlefield.beasts.map((slot, i) => (
            <BattlefieldSlot
              key={`beast-${i}`}
              slot={slot}
              label={`B${i + 1}`}
              onCardClick={onCardClick}
              onClick={isCurrentPlayer ? () => onSlotClick?.('beast', i) : undefined}
              isValidTarget={slot.card ? validTargets.includes(slot.card.instanceId) : false}
              isAttacker={slot.card?.instanceId === attackerId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
