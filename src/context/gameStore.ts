'use client';

import { create } from 'zustand';
import {
  GameState, GameMode, CardClass, GameAnimation,
} from '../engine/types';
import {
  createGameState, executeDrawPhase, executeResourcePhase,
  playCard, executeAttack, useAbility as applyAbility, executeEndPhase,
  checkGameOver, performMulligan,
} from '../engine/gameEngine';
import { executeAITurn, aiMulligan, getRandomPersonality, AIPersonality } from '../engine/ai';
import { generateDefaultDeck } from '../engine/deckUtils';

interface GameStore {
  gameState: GameState | null;
  selectedCard: string | null;
  selectedTarget: string | null;
  isAnimating: boolean;
  showPvpTransition: boolean;
  currentAnimations: GameAnimation[];
  aiPersonality: AIPersonality;
  pendingAbility: { casterId: string; abilityId: string; targetType: 'enemy' | 'ally' } | null;
  mulliganSelection: Set<number>;
  
  // Actions
  startGame: (mode: GameMode, p1Class: CardClass, p2Class: CardClass, p1Deck?: string[], p2Deck?: string[]) => void;
  advancePhase: () => void;
  advanceToCombat: () => void;
  selectCard: (instanceId: string | null) => void;
  selectTarget: (instanceId: string | null) => void;
  playSelectedCard: (attachTargetId?: string) => void;
  attackTarget: (attackerId: string, targetId: string) => void;
  useCardAbility: (casterId: string, abilityId: string, targetId?: string) => void;
  endTurn: () => void;
  clearAnimations: () => void;
  setAnimating: (v: boolean) => void;
  resetGame: () => void;
  dismissPvpTransition: () => void;
  submitMulligan: (cardIndices: number[]) => void;
  setPendingAbility: (pending: { casterId: string; abilityId: string; targetType: 'enemy' | 'ally' } | null) => void;
  toggleMulliganCard: (index: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  selectedCard: null,
  selectedTarget: null,
  isAnimating: false,
  showPvpTransition: false,
  currentAnimations: [],
  aiPersonality: 'balanced',
  pendingAbility: null,
  mulliganSelection: new Set<number>(),
  
  startGame: (mode, p1Class, p2Class, p1Deck?, p2Deck?) => {
    const deck1 = p1Deck || generateDefaultDeck(p1Class);
    const deck2 = p2Deck || generateDefaultDeck(p2Class);
    const personality = getRandomPersonality();
    
    const state = createGameState(
      mode,
      mode === 'pvp' ? 'Player 1' : 'Player',
      p1Class, deck1,
      mode === 'pvp' ? 'Player 2' : 'AI Opponent',
      p2Class, deck2
    );
    
    // Start in mulligan phase
    set({ gameState: state, selectedCard: null, selectedTarget: null, aiPersonality: personality, mulliganSelection: new Set() });
  },
  
  advancePhase: () => {
    const { gameState } = get();
    if (!gameState || gameState.gameOver) return;
    
    let newState = structuredClone(gameState);
    
    switch (newState.phase) {
      case 'draw':
        newState = executeDrawPhase(newState);
        newState = executeResourcePhase(newState);
        break;
      case 'resource':
        newState.phase = 'main';
        break;
      case 'main':
        newState.phase = 'combat';
        break;
      case 'combat':
        newState.phase = 'end';
        break;
      case 'end':
        newState = executeEndPhase(newState);
        newState = checkGameOver(newState);
        if (!newState.gameOver) {
          // Auto draw and resource for next player
          newState = executeDrawPhase(newState);
          newState = executeResourcePhase(newState);
        }
        break;
    }
    
    set({ gameState: { ...newState, animationQueue: [] }, currentAnimations: newState.animationQueue });
  },
  
  advanceToCombat: () => {
    const { gameState } = get();
    if (!gameState || gameState.phase !== 'main') return;
    const newState = structuredClone(gameState);
    newState.phase = 'combat';
    set({ gameState: newState });
  },
  
  selectCard: (instanceId) => set({ selectedCard: instanceId }),
  selectTarget: (instanceId) => set({ selectedTarget: instanceId }),
  
  playSelectedCard: (attachTargetId?) => {
    const { gameState, selectedCard } = get();
    if (!gameState || !selectedCard) return;
    
    const newState = playCard(gameState, selectedCard, undefined, attachTargetId);
    set({
      gameState: { ...newState, animationQueue: [] },
      selectedCard: null,
      currentAnimations: newState.animationQueue,
    });
  },
  
  attackTarget: (attackerId, targetId) => {
    const { gameState } = get();
    if (!gameState) return;
    
    let newState = executeAttack(gameState, attackerId, targetId);
    newState = checkGameOver(newState);
    set({
      gameState: { ...newState, animationQueue: [] },
      selectedCard: null,
      selectedTarget: null,
      currentAnimations: newState.animationQueue,
    });
  },
  
  useCardAbility: (casterId, abilityId, targetId?) => {
    const { gameState } = get();
    if (!gameState) return;
    
    let newState = applyAbility(gameState, casterId, abilityId, targetId);
    newState = checkGameOver(newState);
    set({
      gameState: { ...newState, animationQueue: [] },
      currentAnimations: newState.animationQueue,
    });
  },
  
  endTurn: () => {
    const { gameState } = get();
    if (!gameState || gameState.gameOver) return;
    
    let newState = executeEndPhase(gameState);
    newState = checkGameOver(newState);
    
    if (newState.gameOver) {
      set({ gameState: newState });
      return;
    }
    
    // Auto draw and resource for next player
    newState = executeDrawPhase(newState);
    newState = executeResourcePhase(newState);
    
    // PvP mode: show transition screen
    if (newState.mode === 'pvp') {
      set({
        gameState: { ...newState, animationQueue: [] },
        selectedCard: null,
        selectedTarget: null,
        showPvpTransition: true,
        currentAnimations: newState.animationQueue,
      });
      return;
    }
    
    // AI mode: execute AI turn
    if (newState.mode === 'ai' && newState.currentPlayer === 1) {
      set({
        gameState: { ...newState, animationQueue: [] },
        isAnimating: true,
        selectedCard: null,
        selectedTarget: null,
        currentAnimations: newState.animationQueue,
      });
      
      // Small delay to show phase change
      setTimeout(() => {
        const currentState = get().gameState;
        const { aiPersonality } = get();
        if (!currentState || currentState.gameOver) {
          set({ isAnimating: false });
          return;
        }
        
        let aiState = executeAITurn(currentState, aiPersonality);
        aiState = executeEndPhase(aiState);
        aiState = checkGameOver(aiState);
        
        if (!aiState.gameOver) {
          aiState = executeDrawPhase(aiState);
          aiState = executeResourcePhase(aiState);
        }
        
        set({
          gameState: { ...aiState, animationQueue: [] },
          isAnimating: false,
          currentAnimations: aiState.animationQueue,
        });
      }, 1000);
      
      return; // DON'T fall through
    }
    
    set({
      gameState: { ...newState, animationQueue: [] },
      selectedCard: null,
      selectedTarget: null,
      currentAnimations: newState.animationQueue,
    });
  },
  
  clearAnimations: () => set({ currentAnimations: [] }),
  setAnimating: (v) => set({ isAnimating: v }),
  
  resetGame: () => set({
    gameState: null,
    selectedCard: null,
    selectedTarget: null,
    isAnimating: false,
    showPvpTransition: false,
    currentAnimations: [],
  }),
  
  dismissPvpTransition: () => set({ showPvpTransition: false }),
  
  toggleMulliganCard: (index: number) => {
    const { mulliganSelection } = get();
    const newSelection = new Set(mulliganSelection);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else if (newSelection.size < 3) {
      newSelection.add(index);
    }
    set({ mulliganSelection: newSelection });
  },
  
  submitMulligan: (cardIndices: number[]) => {
    const { gameState, aiPersonality } = get();
    if (!gameState || gameState.phase !== 'mulligan') return;
    
    let newState = performMulligan(gameState, cardIndices);
    
    // In AI mode, auto-mulligan for the AI (player 1 = AI)
    if (newState.mode === 'ai' && !newState.mulliganComplete[1]) {
      // Temporarily switch to AI's perspective
      const savedPlayer = newState.currentPlayer;
      newState.currentPlayer = 1;
      newState = aiMulligan(newState);
      newState.currentPlayer = savedPlayer;
    }
    
    // If mulligan phase is complete, advance to draw + resource
    if (newState.phase !== 'mulligan') {
      newState = executeDrawPhase(newState);
      newState = executeResourcePhase(newState);
    }
    
    set({ gameState: newState, mulliganSelection: new Set() });
  },
  
  setPendingAbility: (pending) => set({ pendingAbility: pending }),
}));
