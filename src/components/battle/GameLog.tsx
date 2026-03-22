'use client';

import React, { useRef, useEffect } from 'react';
import { GameLogEntry } from '../../engine/types';

interface GameLogProps {
  log: GameLogEntry[];
}

export default function GameLog({ log }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log.length]);

  const lastEntries = log.slice(-20);

  return (
    <div className="bg-gray-950/60 border border-gray-800/50 rounded-lg p-2 h-48 flex flex-col">
      <div className="text-xs text-gray-400 font-bold mb-1">Battle Log</div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-0.5 text-[10px]">
        {lastEntries.map((entry, i) => (
          <div key={i} className="text-gray-400">
            <span className="text-purple-400">T{entry.turn}</span>{' '}
            {entry.message}
          </div>
        ))}
        {log.length === 0 && (
          <div className="text-gray-600 italic">Game begins...</div>
        )}
      </div>
    </div>
  );
}
