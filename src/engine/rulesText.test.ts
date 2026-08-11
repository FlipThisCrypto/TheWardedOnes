import { describe, it, expect } from 'vitest';
import { rulesTextFromScript, rulesTextFromKeywords } from './rulesText';
import { SAMPLE_SCRIPTS } from './effectIr';

describe('rulesText', () => {
  it('renders fireball script', () => {
    const text = rulesTextFromScript(SAMPLE_SCRIPTS.fireball);
    expect(text.toLowerCase()).toContain('damage');
    expect(text).toContain('6');
  });

  it('renders ward keyword', () => {
    expect(rulesTextFromKeywords([{ keyword: 'Ward', value: 2 }])).toContain('Ward');
  });
});
