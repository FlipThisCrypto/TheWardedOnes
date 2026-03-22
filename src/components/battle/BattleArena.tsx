'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../context/gameStore';
import { getCardById } from '../../data/cards';
import { getAllBattlefieldCards } from '../../engine/gameEngine';
import { getAbility } from '../../engine/abilities';
import { CardClass, GameMode } from '../../engine/types';
import Battlefield from './Battlefield';
import HandArea from './HandArea';
import PlayerHUD from './PlayerHUD';
import GameLog from './GameLog';
import ParticleCanvas from '../effects/ParticleCanvas';

const ALL_CLASSES: CardClass[] = [
  'Battlemage', 'Elementalist', 'Chronomancer', 'Warlock', 'Priest',
  'Beastmaster', 'Trickster', 'Jester', 'Guardian', 'Warrior',
];

export default function BattleArena() {
  const {
    gameState, selectedCard, isAnimating,
    startGame, selectCard, playSelectedCard, attackTarget,
    useCardAbility: applyCardAbility, endTurn, resetGame, showPvpTransition, dismissPvpTransition,
    advanceToCombat, submitMulligan, mulliganSelection, toggleMulliganCard,
    pendingAbility, setPendingAbility,
  } = useGameStore();

  const [setupMode, setSetupMode] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [p1Class, setP1Class] = useState<CardClass>('Battlemage');
  const [p2Class, setP2Class] = useState<CardClass>('Elementalist');
  const [attackMode, setAttackMode] = useState(false);
  const [attackerId, setAttackerId] = useState<string | null>(null);
  const [showAbilityMenu, setShowAbilityMenu] = useState<{ cardId: string; abilities: string[] } | null>(null);

  const handleStartGame = () => {
    startGame(gameMode, p1Class, p2Class);
    setSetupMode(false);
  };

  const handleCardClickInHand = useCallback((instanceId: string) => {
    if (!gameState || gameState.phase !== 'main') return;
    selectCard(instanceId === selectedCard ? null : instanceId);
    setAttackMode(false);
    setAttackerId(null);
  }, [gameState, selectedCard, selectCard]);

  const handlePlayCard = useCallback((attachTargetId?: string) => {
    if (!selectedCard || !gameState) return;
    const card = gameState.players[gameState.currentPlayer].hand.find(
      c => c.instanceId === selectedCard
    );
    if (!card) return;
    const def = getCardById(card.definitionId);
    if (def?.type === 'Relic') {
      // Need to select attach target
      playSelectedCard(attachTargetId);
    } else {
      playSelectedCard();
    }
  }, [selectedCard, gameState, playSelectedCard]);

  const handleBattlefieldCardClick = useCallback((instanceId: string) => {
    if (!gameState) return;
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const opponent = gameState.players[gameState.currentPlayer === 0 ? 1 : 0];

    // Handle pending ability targeting
    if (pendingAbility) {
      if (pendingAbility.targetType === 'enemy') {
        const isEnemy = getAllBattlefieldCards(opponent).some(c => c.instanceId === instanceId);
        if (isEnemy) {
          applyCardAbility(pendingAbility.casterId, pendingAbility.abilityId, instanceId);
          setPendingAbility(null);
          setShowAbilityMenu(null);
          return;
        }
      } else if (pendingAbility.targetType === 'ally') {
        const isAlly = getAllBattlefieldCards(currentPlayer).some(c => c.instanceId === instanceId);
        if (isAlly) {
          applyCardAbility(pendingAbility.casterId, pendingAbility.abilityId, instanceId);
          setPendingAbility(null);
          setShowAbilityMenu(null);
          return;
        }
      }
      return; // Click didn't match valid target
    }

    // Check if selected card is a relic waiting for attach target
    if (selectedCard) {
      const handCard = currentPlayer.hand.find(c => c.instanceId === selectedCard);
      if (handCard) {
        const def = getCardById(handCard.definitionId);
        if (def?.type === 'Relic') {
          handlePlayCard(instanceId);
          return;
        }
      }
    }

    // If in attack mode and clicking enemy unit
    if (attackMode && attackerId) {
      const isEnemyUnit = getAllBattlefieldCards(opponent).some(c => c.instanceId === instanceId);
      if (isEnemyUnit) {
        attackTarget(attackerId, instanceId);
        setAttackMode(false);
        setAttackerId(null);
        return;
      }
    }

    // Click own unit: enter attack mode or show abilities
    const isOwnUnit = getAllBattlefieldCards(currentPlayer).some(c => c.instanceId === instanceId);
    if (isOwnUnit && (gameState.phase === 'main' || gameState.phase === 'combat')) {
      const unit = getAllBattlefieldCards(currentPlayer).find(c => c.instanceId === instanceId);
      if (unit && unit.canAttack && !unit.hasAttacked) {
        setAttackMode(true);
        setAttackerId(instanceId);
        selectCard(null);

        // Check abilities
        const def = getCardById(unit.definitionId);
        if (def && def.abilities.length > 0) {
          setShowAbilityMenu({ cardId: instanceId, abilities: def.abilities });
        }
      }
    }
  }, [gameState, selectedCard, attackMode, attackerId, attackTarget, selectCard, handlePlayCard, pendingAbility, applyCardAbility, setPendingAbility]);

  const handleAttackPlayer = useCallback(() => {
    if (attackMode && attackerId && gameState) {
      attackTarget(attackerId, 'player');
      setAttackMode(false);
      setAttackerId(null);
    }
  }, [attackMode, attackerId, gameState, attackTarget]);

  const handleUseAbility = useCallback((abilityId: string) => {
    if (!showAbilityMenu || !gameState) return;
    const ability = getAbility(abilityId);
    if (!ability) return;

    // Targeted abilities: enter targeting mode
    if (ability.type === 'offensive' && ability.targetType === 'single') {
      setPendingAbility({ casterId: showAbilityMenu.cardId, abilityId, targetType: 'enemy' });
      setAttackMode(false);
      setAttackerId(null);
      return;
    }
    if (ability.type === 'healing' && ability.targetType === 'single') {
      setPendingAbility({ casterId: showAbilityMenu.cardId, abilityId, targetType: 'ally' });
      setAttackMode(false);
      setAttackerId(null);
      return;
    }

    // Non-targeted abilities apply immediately (AoE, self, etc.)
    const targetId = showAbilityMenu.cardId;
    applyCardAbility(showAbilityMenu.cardId, abilityId, targetId);
    setShowAbilityMenu(null);
  }, [showAbilityMenu, gameState, applyCardAbility, setPendingAbility]);

  const validTargets = useMemo(() => {
    if (!gameState) return [];
    // Pending ability targeting
    if (pendingAbility) {
      if (pendingAbility.targetType === 'enemy') {
        const opponent = gameState.players[gameState.currentPlayer === 0 ? 1 : 0];
        return getAllBattlefieldCards(opponent).map(c => c.instanceId);
      } else if (pendingAbility.targetType === 'ally') {
        const current = gameState.players[gameState.currentPlayer];
        return getAllBattlefieldCards(current).map(c => c.instanceId);
      }
    }
    if (!attackMode) return [];
    const opponent = gameState.players[gameState.currentPlayer === 0 ? 1 : 0];
    return getAllBattlefieldCards(opponent).map(c => c.instanceId);
  }, [gameState, attackMode, pendingAbility]);

  // Mulligan screen
  if (!setupMode && gameState && gameState.phase === 'mulligan') {
    const mulliganPlayer = gameState.players[gameState.currentPlayer];
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="absolute inset-0">
          <ParticleCanvas width={1200} height={800} className="w-full h-full" ambient />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-gray-900/80 border border-purple-800/50 rounded-2xl p-8 max-w-2xl w-full backdrop-blur-sm"
        >
          <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            Mulligan Phase
          </h2>
          <p className="text-center text-gray-400 text-sm mb-6">
            Select up to 3 cards to replace, then confirm.
          </p>
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {mulliganPlayer.hand.map((card, idx) => {
              const def = getCardById(card.definitionId);
              const isSelected = mulliganSelection.has(idx);
              return (
                <button
                  key={card.instanceId}
                  onClick={() => toggleMulliganCard(idx)}
                  className={`w-24 h-32 rounded-lg border-2 p-2 flex flex-col items-center justify-center text-center transition-all ${
                    isSelected
                      ? 'border-red-500 bg-red-900/40 scale-95'
                      : 'border-purple-600/50 bg-gray-800/80 hover:border-purple-400'
                  }`}
                >
                  <span className="text-[10px] font-bold text-white">{def?.name || '???'}</span>
                  <span className="text-[9px] text-gray-400 mt-1">{def?.type}</span>
                  <span className="text-[9px] text-yellow-400 mt-1">Cost: {def?.cost}</span>
                  {isSelected && <span className="text-red-400 text-xs mt-1">✕ Replace</span>}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => submitMulligan(Array.from(mulliganSelection))}
              className="px-6 py-3 bg-gradient-to-r from-purple-700 to-yellow-700 text-white font-bold rounded-lg hover:from-purple-600 hover:to-yellow-600 transition-all"
            >
              {mulliganSelection.size > 0 ? `Replace ${mulliganSelection.size} card${mulliganSelection.size > 1 ? 's' : ''}` : 'Keep All'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Setup screen
  if (setupMode || !gameState) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="absolute inset-0">
          <ParticleCanvas width={1200} height={800} className="w-full h-full" ambient />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-gray-900/80 border border-purple-800/50 rounded-2xl p-8 max-w-lg w-full backdrop-blur-sm"
        >
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            Battle Setup
          </h2>

          {/* Game mode */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Game Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGameMode('ai')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  gameMode === 'ai'
                    ? 'bg-purple-700 text-white border border-purple-500'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                🤖 vs AI
              </button>
              <button
                onClick={() => setGameMode('pvp')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  gameMode === 'pvp'
                    ? 'bg-purple-700 text-white border border-purple-500'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                ⚔️ Local PvP
              </button>
            </div>
          </div>

          {/* Class selection */}
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">
              {gameMode === 'pvp' ? 'Player 1 Class' : 'Your Class'}
            </label>
            <div className="grid grid-cols-5 gap-1">
              {ALL_CLASSES.map(c => (
                <button
                  key={c}
                  onClick={() => setP1Class(c)}
                  className={`py-1.5 px-1 rounded text-[10px] font-bold transition-all ${
                    p1Class === c
                      ? 'bg-purple-700 text-white border border-purple-400'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">
              {gameMode === 'pvp' ? 'Player 2 Class' : 'AI Class'}
            </label>
            <div className="grid grid-cols-5 gap-1">
              {ALL_CLASSES.map(c => (
                <button
                  key={c}
                  onClick={() => setP2Class(c)}
                  className={`py-1.5 px-1 rounded text-[10px] font-bold transition-all ${
                    p2Class === c
                      ? 'bg-red-700 text-white border border-red-400'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-3 bg-gradient-to-r from-purple-700 to-yellow-700 text-white font-bold rounded-lg hover:from-purple-600 hover:to-yellow-600 transition-all transform hover:scale-[1.02]"
          >
            ⚔️ Begin Battle
          </button>
        </motion.div>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const opponent = gameState.players[gameState.currentPlayer === 0 ? 1 : 0];
  const isMyTurn = gameState.mode === 'ai' ? gameState.currentPlayer === 0 : true;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0a0a0f] flex flex-col relative">
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleCanvas width={1200} height={900} className="w-full h-full" ambient />
      </div>

      {/* PvP Transition Screen */}
      <AnimatePresence>
        {showPvpTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                {currentPlayer.name}&apos;s Turn
              </h2>
              <p className="text-gray-400 mb-6">Pass the device to {currentPlayer.name}</p>
              <button
                onClick={dismissPvpTransition}
                className="px-8 py-3 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-600"
              >
                Ready
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {gameState.gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center bg-gray-900/90 border border-yellow-500/50 rounded-2xl p-8"
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
                🏆 Victory!
              </h2>
              <p className="text-xl text-white mb-2">
                {gameState.winner !== null ? gameState.players[gameState.winner].name : 'Draw'} wins!
              </p>
              <p className="text-gray-400 mb-6">Turn {gameState.turn}</p>
              <button
                onClick={() => { resetGame(); setSetupMode(true); }}
                className="px-6 py-3 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-600"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex-1 flex flex-row max-w-6xl mx-auto w-full px-1 py-1 gap-1">
        {/* Left side: Opponent HUD */}
        <PlayerHUD player={opponent} isActive={!isMyTurn} position="top" side />

        {/* Center: Game board */}
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          {/* Opponent hand (face down) */}
          {gameState.mode === 'ai' && (
            <div className="flex justify-center gap-1">
              {opponent.hand.map((_, i) => (
                <div key={i} className="w-8 h-10 rounded border border-purple-800/60 bg-gradient-to-br from-[#1a0a2e] to-[#0a0a0f] flex items-center justify-center">
                  <span className="text-[8px] opacity-40">🔮</span>
                </div>
              ))}
            </div>
          )}

          {/* Opponent Battlefield */}
          <Battlefield
            player={opponent}
            isCurrentPlayer={false}
            onCardClick={handleBattlefieldCardClick}
            validTargets={validTargets}
            label={`${opponent.name}'s Field`}
          />

          {/* Center divider with phase info + action buttons */}
          <div className="flex items-center justify-between gap-1 px-1 flex-wrap">
            <div className="flex gap-1">
              {selectedCard && (
                <button
                  onClick={() => handlePlayCard()}
                  className="px-3 py-1.5 bg-green-700 text-white text-xs rounded font-bold hover:bg-green-600 transition-all"
                >
                  ▶ Play
                </button>
              )}
              {attackMode && (
                <>
                  <button
                    onClick={handleAttackPlayer}
                    className="px-3 py-1.5 bg-red-700 text-white text-xs rounded font-bold hover:bg-red-600 transition-all animate-pulse"
                  >
                    ⚔️ Hit Player
                  </button>
                  <button
                    onClick={() => { setAttackMode(false); setAttackerId(null); setShowAbilityMenu(null); }}
                    className="px-2 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                  >
                    ✕
                  </button>
                </>
              )}
              {pendingAbility && (
                <button
                  onClick={() => { setPendingAbility(null); setShowAbilityMenu(null); }}
                  className="px-2 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  ✕ Cancel
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500">T{gameState.turn}</span>
              <span className="text-xs text-purple-400 font-bold uppercase">{gameState.phase}</span>
              {attackMode && (
                <span className="text-[10px] text-red-400 font-bold animate-pulse">Pick target</span>
              )}
              {pendingAbility && (
                <span className="text-[10px] text-cyan-400 font-bold animate-pulse">
                  🎯 {pendingAbility.targetType === 'enemy' ? 'Pick enemy' : 'Pick ally'}
                </span>
              )}
              {selectedCard && (() => {
                const handCard = gameState.players[gameState.currentPlayer].hand.find(c => c.instanceId === selectedCard);
                const cardDef = handCard ? getCardById(handCard.definitionId) : null;
                if (cardDef?.type === 'Relic') {
                  return <span className="text-[10px] text-yellow-400 font-bold animate-pulse">🔗 Equip</span>;
                }
                return null;
              })()}
            </div>

            <div className="flex gap-1">
              {gameState.phase === 'main' && (
                <button
                  onClick={advanceToCombat}
                  className="px-3 py-1.5 bg-orange-700 text-white text-xs rounded font-bold hover:bg-orange-600"
                >
                  Combat →
                </button>
              )}
              <button
                onClick={() => { endTurn(); setAttackMode(false); setAttackerId(null); setShowAbilityMenu(null); }}
                disabled={isAnimating || !isMyTurn}
                className="px-3 py-1.5 bg-purple-700 text-white text-xs rounded font-bold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                End Turn ⏭
              </button>
            </div>
          </div>

          {/* Player Battlefield */}
          <Battlefield
            player={currentPlayer}
            isCurrentPlayer
            onCardClick={handleBattlefieldCardClick}
            onSlotClick={() => {
              if (selectedCard) handlePlayCard();
            }}
            attackerId={attackerId}
            label={`${currentPlayer.name}'s Field`}
          />

          {/* Player hand - scrollable */}
          <HandArea
            hand={currentPlayer.hand}
            player={currentPlayer}
            selectedCard={selectedCard}
            onSelectCard={handleCardClickInHand}
            canPlay={isMyTurn && gameState.phase === 'main'}
            hidden={gameState.mode === 'pvp' && showPvpTransition}
          />
        </div>

        {/* Right side: Player HUD */}
        <PlayerHUD player={currentPlayer} isActive={isMyTurn} position="bottom" side />

        {/* Ability Menu */}
        <AnimatePresence>
          {showAbilityMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/95 border border-purple-600/50 rounded-lg p-2 backdrop-blur-sm z-40"
            >
              <div className="text-[10px] text-gray-400 mb-1">Use Ability:</div>
              <div className="flex gap-1 flex-wrap">
                {showAbilityMenu.abilities.map(abilityId => {
                  const ability = getAbility(abilityId);
                  if (!ability) return null;
                  return (
                    <button
                      key={abilityId}
                      onClick={() => handleUseAbility(abilityId)}
                      className="px-3 py-2 bg-purple-800/80 text-white text-xs rounded hover:bg-purple-700 border border-purple-600/50 transition-all"
                    >
                      <div className="font-bold">{ability.name}</div>
                      <div className="text-[9px] text-gray-400">{ability.description}</div>
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowAbilityMenu(null)}
                  className="px-3 py-2 bg-gray-800 text-gray-400 text-xs rounded hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
