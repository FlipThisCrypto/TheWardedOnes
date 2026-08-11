/**
 * Lifesteal application: controller gains life equal to HP damage dealt.
 */

import type { PlayerState } from './types';
import type { CardInstance } from './types';
import { hasKeyword } from './keywords';

export function applyLifesteal(
  controller: PlayerState,
  source: CardInstance,
  hpDamage: number
): number {
  if (hpDamage <= 0) return 0;
  if (!hasKeyword(source.keywords, 'Lifesteal')) return 0;
  controller.life += hpDamage;
  return hpDamage;
}
