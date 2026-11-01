/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home } from './pages/Home';
import { Game } from './pages/Game';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'HOME' | 'GAME'>('HOME');
  const [showSetupOnEnter, setShowSetupOnEnter] = useState(true);
  const [initialGameMode, setInitialGameMode] = useState<'local' | 'ai'>('local');

  const handleStartGame = (mode: 'local' | 'ai' = 'local') => {
    setInitialGameMode(mode);
    setShowSetupOnEnter(true);
    setCurrentPage('GAME');
  };

  return (
    <div className="min-h-screen bg-[#080B16] font-sans antialiased">
      {currentPage === 'HOME' ? (
        <Home onStartGame={handleStartGame} />
      ) : (
        <Game
          onReturnHome={() => setCurrentPage('HOME')}
          initialShowSetup={showSetupOnEnter}
          initialGameMode={initialGameMode}
        />
      )}
    </div>
  );
}
