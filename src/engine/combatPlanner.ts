/**
 * Combat planning helpers — pure evaluation of attack lines.
 */

import type { CardInstance, GameState } from './types';
import { getAllBattlefieldCards } from './queries';
import { computeCombatRawDamage } from './combatMath';
import { hasKeyword } from './keywords';
import { getCardById } from '../data/cards';
import { isLegalAttackTarget } from './targeting';

export interface AttackLine {
  attackerId: string;
  targetId: string | 'player';
  expectedHpDamage: number;
  lethal: boolean;
  score: number;
}

export function planAttackLines(state: GameState): AttackLine[] {
  const player = state.players[state.currentPlayer];
  const opponent = state.players[state.currentPlayer === 0 ? 1 : 0];
  const attackers = getAllBattlefieldCards(player).filter(
    c => c.canAttack && !c.hasAttacked && c.currentAttack > 0
  );
  const lines: AttackLine[] = [];

  for (const atk of attackers) {
    const atkDef = getCardById(atk.definitionId);
    if (!atkDef) continue;
    const pierce = hasKeyword(atk.keywords, 'Pierce');

    if (isLegalAttackTarget(state, 'player')) {
      const dmg = Math.max(1, atk.currentAttack);
      lines.push({
        attackerId: atk.instanceId,
        targetId: 'player',
        expectedHpDamage: dmg,
        lethal: opponent.life <= dmg,
        score: dmg + (opponent.life <= dmg ? 100 : 0),
      });
    }

    for (const enemy of getAllBattlefieldCards(opponent)) {
      if (!isLegalAttackTarget(state, enemy.instanceId)) continue;
      const enemyDef = getCardById(enemy.definitionId);
      if (!enemyDef) continue;
      const { raw } = computeCombatRawDamage({
        attack: atk.currentAttack,
        defense: enemy.currentDefense,
        attackerElements: atkDef.elements,
        defenderElements: enemyDef.elements,
        pierce,
      });
      const expected = Math.max(1, raw);
      const lethal = enemy.currentHp <= expected;
      lines.push({
        attackerId: atk.instanceId,
        targetId: enemy.instanceId,
        expectedHpDamage: expected,
        lethal,
        score: expected + (lethal ? 15 : 0),
      });
    }
  }

  return lines.sort((a, b) => b.score - a.score);
}

export function bestAttackLine(state: GameState): AttackLine | null {
  const lines = planAttackLines(state);
  return lines[0] ?? null;
}
