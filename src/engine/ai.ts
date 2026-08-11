import {
  GameState, PlayerState, CardInstance, CardDefinition,
} from './types';
import { getCardById } from '../data/cards';
import {
  canPlayCard, playCard, executeAttack, useAbility as applyAbility,
  getAllBattlefieldCards, performMulligan,
} from './gameEngine';
import { getAbility } from './abilities';
import { hasKeyword } from './keywords';
import { createRng, nextFloat, pickRandom } from './rng';

export type AIPersonality = 'aggro' | 'control' | 'balanced';

export function getRandomPersonality(seed?: number): AIPersonality {
  const types: AIPersonality[] = ['aggro', 'control', 'balanced'];
  const rng = createRng(seed ?? Date.now() >>> 0);
  return pickRandom(rng, types)!;
}

interface ScoredAction {
  type: 'play' | 'attack' | 'ability' | 'end';
  score: number;
  cardId?: string;
  targetId?: string;
  abilityId?: string;
  attachTargetId?: string;
}

export function aiMulligan(state: GameState): GameState {
  const aiPlayer = state.players[state.currentPlayer];
  // Mulligan cards that cost 5+ (keep cheap cards for early game)
  const toReplace: number[] = [];
  aiPlayer.hand.forEach((card, idx) => {
    const def = getCardById(card.definitionId);
    if (def && def.cost >= 5) {
      toReplace.push(idx);
    }
  });
  return performMulligan(state, toReplace);
}

export function getAIActions(state: GameState, personality: AIPersonality = 'balanced'): ScoredAction[] {
  const aiPlayer = state.players[state.currentPlayer];
  const opponent = state.players[state.currentPlayer === 0 ? 1 : 0];
  const actions: ScoredAction[] = [];
  
  // Evaluate playing cards from hand
  for (const card of aiPlayer.hand) {
    if (canPlayCard(aiPlayer, card)) {
      const def = getCardById(card.definitionId);
      if (!def) continue;
      
      let score = evaluatePlayScore(def, aiPlayer, opponent, personality);
      // Add slight randomness (seeded)
      score += (nextFloat(state.rng) - 0.5) * 2;
      
      // Personality: control AI holds utility cards for board clears
      if (personality === 'control' && def.type === 'Utility') {
        const enemyCount = getAllBattlefieldCards(opponent).length;
        if ((def.id === 'u_field_clear' || def.id === 'u_chaos_bolt') && enemyCount < 3) {
          score -= 10; // Hold AoE for when enemy has 3+ units
        }
      }
      
      const action: ScoredAction = {
        type: 'play',
        score,
        cardId: card.instanceId,
      };
      
      // For relics, find best attach target
      if (def.type === 'Relic') {
        const bestTarget = findBestRelicTarget(aiPlayer);
        if (bestTarget) {
          action.attachTargetId = bestTarget.instanceId;
        } else {
          continue; // Skip if no valid target
        }
      }
      
      actions.push(action);
    }
  }
  
  // Evaluate attacks
  const myUnits = getAllBattlefieldCards(aiPlayer).filter(c => c.canAttack && !c.hasAttacked && c.currentAttack > 0);
  const enemyUnits = getAllBattlefieldCards(opponent);
  
  for (const unit of myUnits) {
    const unitDef = getCardById(unit.definitionId);
    if (!unitDef) continue;
    
    // Attack enemy units
    for (const enemy of enemyUnits) {
      const enemyDef = getCardById(enemy.definitionId);
      if (!enemyDef) continue;
      
      let score = evaluateAttackScore(unit, unitDef, enemy, enemyDef);
      score += (nextFloat(state.rng) - 0.5) * 1.5;
      
      actions.push({
        type: 'attack',
        score,
        cardId: unit.instanceId,
        targetId: enemy.instanceId,
      });
    }
    
    // Direct attack on player (if no taunt units)
    const hasTaunts = enemyUnits.some(c => hasKeyword(c.keywords, 'Taunt'));
    
    if (!hasTaunts) {
      let faceScore = unit.currentAttack * 1.5 + (opponent.life <= unit.currentAttack ? 100 : 0);
      // Aggro loves going face
      if (personality === 'aggro') faceScore *= 1.8;
      // Control prefers board control
      if (personality === 'control') faceScore *= 0.5;
      actions.push({
        type: 'attack',
        score: faceScore,
        cardId: unit.instanceId,
        targetId: 'player',
      });
    }
  }
  
  // Evaluate abilities
  for (const unit of getAllBattlefieldCards(aiPlayer)) {
    const unitDef = getCardById(unit.definitionId);
    if (!unitDef) continue;
    
    for (const abilityId of unitDef.abilities) {
      const ability = getAbility(abilityId);
      if (!ability) continue;
      
      if (ability.type === 'healing') {
        // Find injured ally
        const injured = getAllBattlefieldCards(aiPlayer)
          .filter(c => {
            const d = getCardById(c.definitionId);
            return d && c.currentHp < d.hp;
          })
          .sort((a, b) => {
            const aDef = getCardById(a.definitionId);
            const bDef = getCardById(b.definitionId);
            const aRatio = aDef ? a.currentHp / aDef.hp : 1;
            const bRatio = bDef ? b.currentHp / bDef.hp : 1;
            return aRatio - bRatio;
          });
        
        if (injured.length > 0) {
          const healValue = ability.healing || 0;
          const urgency = aiPlayer.life < 10 ? 15 : 5;
          actions.push({
            type: 'ability',
            score: healValue + urgency + (nextFloat(state.rng) * 2),
            cardId: unit.instanceId,
            abilityId,
            targetId: injured[0].instanceId,
          });
        }
      } else if (ability.type === 'offensive' && ability.damage) {
        for (const enemy of enemyUnits) {
          const enemyDef = getCardById(enemy.definitionId);
          if (!enemyDef) continue;
          const canKill = enemy.currentHp <= ability.damage;
          actions.push({
            type: 'ability',
            score: (ability.damage || 0) + (canKill ? 10 : 0) + (nextFloat(state.rng) * 2),
            cardId: unit.instanceId,
            abilityId,
            targetId: enemy.instanceId,
          });
        }
      } else if (ability.type === 'defensive') {
        actions.push({
          type: 'ability',
          score: 4 + (nextFloat(state.rng) * 3),
          cardId: unit.instanceId,
          abilityId,
          targetId: unit.instanceId,
        });
      } else if (ability.type === 'beast' || ability.type === 'chaos') {
        const targets = ability.targetType === 'all_enemies' ? enemyUnits : getAllBattlefieldCards(aiPlayer);
        if (targets.length > 0) {
          actions.push({
            type: 'ability',
            score: 5 + (nextFloat(state.rng) * 3),
            cardId: unit.instanceId,
            abilityId,
            targetId: targets[0]?.instanceId,
          });
        }
      }
    }
  }
  
  // Always include end turn option
  actions.push({ type: 'end', score: 0 });
  
  return actions.sort((a, b) => b.score - a.score);
}

function evaluatePlayScore(def: CardDefinition, player: PlayerState, opponent: PlayerState, personality: AIPersonality = 'balanced'): number {
  let score = 0;
  
  // Mage is highest priority if not on field
  if (def.type === 'Mage' && !player.battlefield.mage.card) {
    score += 20;
  }
  
  // Value by stats relative to cost
  const statTotal = def.hp + def.attack * 1.5 + def.defense;
  score += statTotal / Math.max(def.cost, 1);
  
  // Prefer efficient resource usage
  if (def.cost <= player.resources) {
    score += 3;
  }
  
  // Fighters and beasts provide board presence
  if (def.type === 'Fighter') score += 5;
  if (def.type === 'Beast') score += 4;
  if (def.type === 'Totem') score += 3;
  
  // Evolution is valuable
  if (def.level >= 2) score += 4;
  if (def.level >= 3) score += 6;
  
  // Healing utility when low
  if (def.type === 'Utility' && def.abilities.some(a => a.includes('heal'))) {
    if (player.life < 15) score += 8;
  }
  
  // Personality modifiers
  if (personality === 'aggro') {
    // Aggro prefers cheap, high-attack units
    if (def.cost <= 2) score += 3;
    score += def.attack * 0.5;
  } else if (personality === 'control') {
    // Control prefers defensive units and totems
    score += def.defense * 0.5;
    if (def.type === 'Totem') score += 3;
    if (def.keywords?.some(k => k.keyword === 'Taunt' || k.keyword === 'Ward')) score += 3;
  }
  
  return score;
}

function evaluateAttackScore(
  attacker: CardInstance,
  attackerDef: CardDefinition,
  defender: CardInstance,
  defenderDef: CardDefinition
): number {
  let score = 0;
  
  const damage = Math.max(1, attacker.currentAttack - defender.currentDefense);
  const canKill = damage >= defender.currentHp;
  
  // Prioritize kills
  if (canKill) {
    score += 15 + defenderDef.cost * 2;
  }
  
  // Prefer attacking low HP targets
  score += (1 - defender.currentHp / Math.max(defenderDef.hp, 1)) * 8;
  
  // Prefer attacking high-value targets
  score += defenderDef.attack * 0.5;
  
  // Avoid attacking high-defense targets if we can't do much
  if (damage <= 1 && !canKill) {
    score -= 5;
  }
  
  // Mage targets are high priority
  if (defenderDef.type === 'Mage') score += 5;
  
  // Totem targets remove buffs
  if (defenderDef.type === 'Totem') score += 3;
  
  return score;
}

function findBestRelicTarget(player: PlayerState): CardInstance | null {
  const units = getAllBattlefieldCards(player).filter(c => {
    const d = getCardById(c.definitionId);
    return d && d.type !== 'Totem';
  });
  
  if (units.length === 0) return null;
  
  // Prefer units with high attack (aggressive) or mage
  return units.sort((a, b) => {
    const aDef = getCardById(a.definitionId);
    const bDef = getCardById(b.definitionId);
    if (aDef?.type === 'Mage') return -1;
    if (bDef?.type === 'Mage') return 1;
    return b.currentAttack - a.currentAttack;
  })[0];
}

export function executeAITurn(state: GameState, personality?: AIPersonality): GameState {
  let currentState = structuredClone(state);
  const aiPersonality = personality || getRandomPersonality();
  const maxActions = 10; // Safety limit
  let actionsPerformed = 0;
  let cardsPlayed = 0;
  
  while (actionsPerformed < maxActions && !currentState.gameOver) {
    const actions = getAIActions(currentState, aiPersonality);
    
    if (actions.length === 0 || actions[0].type === 'end') break;
    
    const bestAction = actions[0];
    
    // Don't perform actions with very low scores
    if (bestAction.score < 1 && bestAction.type !== 'play') break;
    
    // Resource conservation: after playing 2-3 cards, only play if score is high
    if (bestAction.type === 'play' && cardsPlayed >= 2 && bestAction.score < 5) break;
    
    switch (bestAction.type) {
      case 'play':
        if (bestAction.cardId) {
          currentState = playCard(
            currentState,
            bestAction.cardId,
            undefined,
            bestAction.attachTargetId
          );
          cardsPlayed++;
        }
        break;
      case 'attack':
        if (bestAction.cardId && bestAction.targetId) {
          currentState = executeAttack(
            currentState,
            bestAction.cardId,
            bestAction.targetId
          );
        }
        break;
      case 'ability':
        if (bestAction.cardId && bestAction.abilityId) {
          currentState = applyAbility(
            currentState,
            bestAction.cardId,
            bestAction.abilityId,
            bestAction.targetId
          );
        }
        break;
    }
    
    actionsPerformed++;
  }
  
  return currentState;
}
