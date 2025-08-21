
'use client';

import { useState, useEffect, useCallback, useReducer } from 'react';

// State and Types
export type Ring = 'bullseye' | 'inner' | 'outer' | 'miss';

export interface Attempt {
  outcome: 'hit' | 'miss';
  points: number;
  ring?: Ring;
}

interface Round {
  roundNumber: number;
  attempts: Attempt[];
  roundScore: number;
}

export interface PracticeSessionState {
  status: 'in-progress' | 'paused' | 'completed';
  startTime: number; // timestamp
  pauseTime?: number; // timestamp
  totalPausedDuration: number;
  currentRound: number;
  currentAttempt: number;
  history: Round[];
}

// Reducer Actions
type Action =
  | { type: 'LOG_ATTEMPT'; payload: { attemptData: Omit<Attempt, 'timestamp'> } }
  | { type: 'UNDO_ATTEMPT' }
  | { type: 'NEXT_ROUND' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'COMPLETE_SESSION' };

const initialState: PracticeSessionState = {
  status: 'in-progress',
  startTime: Date.now(),
  totalPausedDuration: 0,
  currentRound: 1,
  currentAttempt: 1,
  history: [{ roundNumber: 1, attempts: [], roundScore: 0 }],
};

function practiceSessionReducer(state: PracticeSessionState, action: Action): PracticeSessionState {
  switch (action.type) {
    case 'LOG_ATTEMPT': {
      const { attemptData } = action.payload;
      const updatedHistory = [...state.history];
      const currentRoundIndex = state.history.findIndex(r => r.roundNumber === state.currentRound);
      
      if (currentRoundIndex === -1) return state; // Should not happen

      const newAttempts = [...updatedHistory[currentRoundIndex].attempts, attemptData];
      const newRoundScore = newAttempts.reduce((sum, a) => sum + a.points, 0);
      
      updatedHistory[currentRoundIndex] = {
        ...updatedHistory[currentRoundIndex],
        attempts: newAttempts,
        roundScore: newRoundScore,
      };

      return {
        ...state,
        history: updatedHistory,
        currentAttempt: state.currentAttempt + 1,
      };
    }

    case 'UNDO_ATTEMPT': {
        const updatedHistory = [...state.history];
        const currentRoundIndex = state.history.findIndex(r => r.roundNumber === state.currentRound);

        if (currentRoundIndex === -1 || state.history[currentRoundIndex].attempts.length === 0) {
            return state;
        }

        const newAttempts = updatedHistory[currentRoundIndex].attempts.slice(0, -1);
        const newRoundScore = newAttempts.reduce((sum, a) => sum + a.points, 0);

        updatedHistory[currentRoundIndex] = {
            ...updatedHistory[currentRoundIndex],
            attempts: newAttempts,
            roundScore: newRoundScore,
        };

        return {
            ...state,
            history: updatedHistory,
            currentAttempt: Math.max(1, state.currentAttempt - 1),
        };
    }
    
    case 'TOGGLE_PAUSE': {
      if (state.status === 'in-progress') {
        return { ...state, status: 'paused', pauseTime: Date.now() };
      } else if (state.status === 'paused' && state.pauseTime) {
        const pausedDuration = Date.now() - state.pauseTime;
        return {
          ...state,
          status: 'in-progress',
          pauseTime: undefined,
          totalPausedDuration: state.totalPausedDuration + pausedDuration,
        };
      }
      return state;
    }
    
    // NEXT_ROUND and COMPLETE_SESSION would be added here
    default:
      return state;
  }
}

export function usePracticeSession({ initialDrill }: { initialDrill: any }) {
  const [sessionState, dispatch] = useReducer(practiceSessionReducer, initialState);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionState.status === 'in-progress') {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionState.startTime - sessionState.totalPausedDuration) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionState.status, sessionState.startTime, sessionState.totalPausedDuration]);
  
  const logAttempt = useCallback((attemptData: Omit<Attempt, 'timestamp'>) => {
    const castsPerRound = initialDrill.params.castsPerRound || 10;
    if (sessionState.currentAttempt > castsPerRound) {
        // Here you would trigger next round logic
        console.log("Round complete!");
        return false;
    }
    dispatch({ type: 'LOG_ATTEMPT', payload: { attemptData } });
    return true;
  }, [sessionState.currentAttempt, initialDrill.params.castsPerRound]);

  const undoLastAttempt = useCallback(() => {
    dispatch({ type: 'UNDO_ATTEMPT' });
  }, []);

  const togglePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  }, []);

  const getDisplayMetrics = useCallback(() => {
    const currentRoundData = sessionState.history.find(r => r.roundNumber === sessionState.currentRound);
    const totalAttemptsInRound = currentRoundData?.attempts.length || 0;
    const successfulHits = currentRoundData?.attempts.filter(a => a.outcome === 'hit').length || 0;
    
    const accuracy = totalAttemptsInRound > 0 ? Math.round((successfulHits / totalAttemptsInRound) * 100) : 100;
    const roundScore = currentRoundData?.roundScore || 0;
    const totalScore = sessionState.history.reduce((sum, r) => sum + r.roundScore, 0);
    const lastAttempt = totalAttemptsInRound > 0 ? currentRoundData!.attempts[totalAttemptsInRound - 1] : null;

    let performanceBand = "Fair";
    if (accuracy >= 90) performanceBand = "Good";
    if (accuracy >= 70 && accuracy < 90) performanceBand = "Good";
    if (accuracy >= 50 && accuracy < 70) performanceBand = "Fair";
    if (accuracy < 50) performanceBand = "Poor";


    return {
      roundScore,
      accuracy,
      performanceBand,
      totalScore,
      currentRound: sessionState.currentRound,
      currentAttempt: sessionState.currentAttempt,
      elapsedTime,
      status: sessionState.status,
      lastAttempt,
    };
  }, [sessionState, elapsedTime]);

  return {
    sessionState,
    logAttempt,
    undoLastAttempt,
    togglePause,
    getDisplayMetrics,
  };
}
