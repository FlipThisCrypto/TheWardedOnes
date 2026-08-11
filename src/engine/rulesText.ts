/**
 * Generate structured rules text from IR / keywords for tooltips (no freeform parse).
 */

import type { EffectScript, EffectOp } from './effectIr';
import { getKeywordDescription, type KeywordData } from './keywords';
import { evalValue } from './effectIr';

function describeOp(op: EffectOp): string {
  const z = { sourceAttack: 0, sourceDefense: 0, sourceHp: 0, sourceSpeed: 0 };
  switch (op.op) {
    case 'damage':
      return `Deal ${evalValue(op.amount, z)}${op.element ? ` ${op.element}` : ''} damage` +
        (op.pierce ? ' (Pierce)' : '');
    case 'heal':
      return `Heal ${evalValue(op.amount, z)}`;
    case 'draw':
      return `Draw ${evalValue(op.count, z)}`;
    case 'gain_resource':
      return `Gain ${evalValue(op.amount, z)} resource(s)`;
    case 'buff_stat':
      return `Give +${evalValue(op.amount, z)} ${op.stat}`;
    case 'apply_keyword':
      return `Gain ${op.keyword}${op.value !== undefined ? ` ${op.value}` : ''}`;
    case 'log':
      return op.message;
    default:
      return 'Unknown effect';
  }
}

export function rulesTextFromScript(script: EffectScript): string {
  return script.ops.map(describeOp).join('. ') + (script.ops.length ? '.' : '');
}

export function rulesTextFromKeywords(keywords: KeywordData[] | undefined): string {
  if (!keywords?.length) return '';
  return keywords.map(getKeywordDescription).join(' ');
}
