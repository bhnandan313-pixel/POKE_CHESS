/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import { Chessboard } from '../components/Chessboard/Chessboard';
import { PlayerDashboard } from '../components/PlayerDashboard/PlayerDashboard';
import { MoveHistory } from '../components/MoveHistory/MoveHistory';
import { PokemonInfoPanel } from '../components/PokemonInfo/PokemonInfoPanel';
import { AbilityPanel } from '../components/Abilities/AbilityPanel';
import { GameControls } from '../components/GameControls/GameControls';
import { GameOverModal } from '../components/GameOver/GameOverModal';
import { MatchSetupModal } from '../components/MatchSetup/MatchSetupModal';
import { MatchInfoModal } from '../components/MatchInfo/MatchInfoModal';
import { BattleEventsToast } from '../components/BattleEvents/BattleEventsToast';
import { AiThinkingIndicator } from '../components/AiThinkingIndicator/AiThinkingIndicator';
import {
  ArrowLeft,
  RotateCcw,
  X,
  Info,
  CheckCircle2,
  AlertTriangle,
  Undo2,
  Settings2,
  Swords,
  Timer,
  Bot,
} from 'lucide-react';

interface GamePageProps {
  onReturnHome: () => void;
  initialShowSetup?: boolean;
  initialGameMode?: 'local' | 'ai';
}

export const Game: React.FC<GamePageProps> = ({
  onReturnHome,
  initialShowSetup = false,
  initialGameMode,
}) => {
  const {
    board,
    selectedSquare,
    legalMoves,
    lastMove,
    moveHistory,
    status,
    capturedWhite,
    capturedBlack,
    materialScore,
    pendingPromotion,
    isFlipped,
    soundEnabled,
    animationsEnabled,
    inspectedPiece,
    energyState,
    abilityState,
    targetingSquares,
    targetingInstruction,
    flameDashSquares,
    notification,
    matchSettings,
    matchStats,
    timers,
    timeOutWinner,
    battleEvents,
    canUndo,
    undo,
    dismissBattleEvent,
    updateMatchSettings,
    clearNotification,
    handleSquareClick,
    handlePromotionSelect,
    cancelPromotion,
    resetGame,
    resign,
    isAiThinking,
    aiThinkingMessage,
    flipBoard,
    toggleSound,
    toggleAnimations,
    handleStartTargeting,
    handleCancelTargeting,
    handleCancelFlameDash,
    handleAnimationComplete,
  } = useChessGame(initialGameMode ? { mode: initialGameMode } : undefined);

  const [isReviewingBoard, setIsReviewingBoard] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(initialShowSetup);
  const [showMatchInfoModal, setShowMatchInfoModal] = useState(false);

  const isGameOver = status.isCheckmate || status.isDraw;
  const showGameOverModal = isGameOver && !isReviewingBoard;

  const handleRematch = () => {
    setIsReviewingBoard(false);
    resetGame();
  };

  const handleNewMatch = () => {
    setIsReviewingBoard(false);
    setShowSetupModal(true);
  };

  // Currently selected piece for AbilityPanel
  const selectedPiece = selectedSquare
    ? (() => {
        const p = board[8 - parseInt(selectedSquare[1], 10)]?.[
          ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].indexOf(selectedSquare[0])
        ];
        return p ? { symbol: p.type, color: p.color } : null;
      })()
    : null;

  // Resolve player profiles by color
  const whitePlayer =
    matchSettings.player1.color === 'w' ? matchSettings.player1 : matchSettings.player2;
  const blackPlayer =
    matchSettings.player1.color === 'b' ? matchSettings.player1 : matchSettings.player2;

  const humanColor = matchSettings.humanColor || 'w';
  const aiColor = humanColor === 'w' ? 'b' : 'w';
  const aiPlayer = matchSettings.mode === 'ai' ? (whitePlayer.color === aiColor ? whitePlayer : blackPlayer) : null;
  const isWhiteAi = matchSettings.mode === 'ai' && whitePlayer.color === aiColor;
  const isBlackAi = matchSettings.mode === 'ai' && blackPlayer.color === aiColor;

  return (
    <div className="min-h-screen bg-[#080B16] text-slate-100 flex flex-col">
      {/* Top Game Bar adhering to Top Bar Contract */}
      <header className="flex items-center justify-between gap-4 px-4 sm:px-8 py-3.5 border-b border-indigo-950/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onReturnHome}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Back to menu"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Menu</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <span className="text-base sm:text-lg font-black tracking-tight text-white whitespace-nowrap font-display flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            Pokémon Chess
          </span>
        </div>

        {/* Zone 2: Navigation / Players Info */}
        <div className="hidden md:flex items-center gap-3 text-xs font-medium text-slate-300">
          <span className="font-bold text-amber-300">{whitePlayer.name} (White)</span>
          <span className="text-slate-600">vs</span>
          <span className="font-bold text-purple-300">{blackPlayer.name} (Black)</span>
          {matchSettings.mode === 'ai' && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Bot className="w-3 h-3 text-purple-400" />
              <span>{matchSettings.aiDifficulty} AI</span>
            </span>
          )}
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-400 flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-slate-500" />
            {matchSettings.timerMinutes > 0 ? `${matchSettings.timerMinutes}m Clock` : 'Casual'}
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-amber-400/90 font-mono">Move #{Math.floor(moveHistory.length / 2) + 1}</span>
        </div>

        {/* Zone 3: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Undo Shortcut */}
          <button
            disabled={!canUndo || isGameOver}
            onClick={undo}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              canUndo && !isGameOver
                ? 'bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border-sky-600/50'
                : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
            }`}
            title="Undo move"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          {/* Setup / Settings Button */}
          <button
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Configure match settings"
          >
            <Settings2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Setup</span>
          </button>

          {isGameOver && isReviewingBoard && (
            <button
              onClick={() => setIsReviewingBoard(false)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Show Outcome
            </button>
          )}

          <button
            onClick={resetGame}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Battle Event Notifications Stack (Floating Top-Right) */}
      <BattleEventsToast events={battleEvents} onDismiss={dismissBattleEvent} />

      {/* AI Opponent Thinking Indicator */}
      {matchSettings.mode === 'ai' && aiPlayer && (
        <AiThinkingIndicator
          isThinking={isAiThinking}
          aiTrainerName={aiPlayer.name}
          aiAvatarId={aiPlayer.avatarId}
          difficulty={matchSettings.aiDifficulty || 'intermediate'}
          thinkingMessage={aiThinkingMessage}
        />
      )}

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`p-3 rounded-xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
                : notification.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/60 text-amber-200'
                : 'bg-indigo-950/90 border-indigo-500/60 text-indigo-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : notification.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
              <span className="font-medium leading-snug">{notification.text}</span>
            </div>
            <button
              onClick={clearNotification}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main 3-Column Chess Arena Layout */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-3 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Player Dashboards (White & Black) (3 cols) */}
          <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-4">
            {/* White Player Dashboard */}
            <PlayerDashboard
              player={whitePlayer}
              sideColor="w"
              status={status}
              energyState={energyState.w}
              capturedPieces={capturedWhite}
              materialScore={materialScore}
              timeRemainingSeconds={timers.w}
              timerMinutes={matchSettings.timerMinutes}
              isCheck={status.isCheck && status.turn === 'w'}
              isActiveTurn={status.turn === 'w'}
              isAi={isWhiteAi}
              aiDifficulty={matchSettings.aiDifficulty}
            />

            {/* Black Player Dashboard */}
            <PlayerDashboard
              player={blackPlayer}
              sideColor="b"
              status={status}
              energyState={energyState.b}
              capturedPieces={capturedBlack}
              materialScore={-materialScore}
              timeRemainingSeconds={timers.b}
              timerMinutes={matchSettings.timerMinutes}
              isCheck={status.isCheck && status.turn === 'b'}
              isActiveTurn={status.turn === 'b'}
              isAi={isBlackAi}
              aiDifficulty={matchSettings.aiDifficulty}
            />
          </div>

          {/* CENTER COLUMN: 8x8 Chessboard (6 cols) */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center">
            <Chessboard
              board={board}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              isFlipped={isFlipped}
              status={status}
              activeProtections={abilityState.activeProtections}
              targetingSquares={targetingSquares}
              targetingInstruction={targetingInstruction}
              flameDashSquares={flameDashSquares}
              activeAnimation={abilityState.activeAnimation}
              pendingPromotion={pendingPromotion}
              boardTheme={matchSettings.boardTheme}
              animationsEnabled={animationsEnabled}
              onSquareClick={handleSquareClick}
              onPromotionSelect={handlePromotionSelect}
              onCancelPromotion={cancelPromotion}
              onAnimationComplete={handleAnimationComplete}
              onCancelFlameDash={handleCancelFlameDash}
            />

            {/* Bottom Quick Bar */}
            <div className="w-full max-w-[560px] mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-indigo-900/30 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-300">Active Turn:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    status.turn === 'w'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {status.turn === 'w'
                    ? `${whitePlayer.name} (White)`
                    : `${blackPlayer.name} (Black)`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={!canUndo || isGameOver}
                  onClick={undo}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                    canUndo && !isGameOver
                      ? 'text-sky-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                  title="Undo last move"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>

                <div className="h-3 w-px bg-slate-800" />

                <button
                  onClick={flipBoard}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Flip view"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Ability Panel, Pokémon Codex & Controls (3 cols) */}
          <div className="lg:col-span-3 order-3 flex flex-col gap-4">
            {/* Ability Command Panel */}
            <AbilityPanel
              selectedSquare={selectedSquare}
              selectedPiece={selectedPiece}
              currentTurn={status.turn}
              energyState={energyState}
              abilityUsedThisTurn={abilityState.abilityUsedThisTurn}
              usedDivineProtection={abilityState.usedDivineProtection}
              isTargeting={Boolean(abilityState.targetingMode)}
              targetingAbilityId={abilityState.targetingMode?.abilityId}
              onStartTargeting={handleStartTargeting}
              onCancelTargeting={handleCancelTargeting}
            />

            {/* Pokémon Codex Panel */}
            <PokemonInfoPanel inspectedPiece={inspectedPiece} />

            {/* Move History */}
            <MoveHistory moveHistory={moveHistory} />

            {/* Game Controls */}
            <GameControls
              soundEnabled={soundEnabled}
              animationsEnabled={animationsEnabled}
              turn={status.turn}
              isGameOver={isGameOver}
              canUndo={canUndo}
              onUndo={undo}
              onToggleSound={toggleSound}
              onToggleAnimations={toggleAnimations}
              onFlipBoard={flipBoard}
              onResetGame={resetGame}
              onResign={resign}
              onOpenMatchInfo={() => setShowMatchInfoModal(true)}
              onReturnHome={onReturnHome}
            />
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
      {showGameOverModal && (
        <GameOverModal
          status={status}
          settings={matchSettings}
          stats={matchStats}
          onRematch={handleRematch}
          onNewMatch={handleNewMatch}
          onMainMenu={onReturnHome}
          onReviewBoard={() => setIsReviewingBoard(true)}
        />
      )}

      {/* Match Setup Modal */}
      <MatchSetupModal
        initialSettings={matchSettings}
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onStartBattle={(newSettings) => {
          setShowSetupModal(false);
          updateMatchSettings(newSettings);
        }}
      />

      {/* Match Information Modal */}
      <MatchInfoModal
        isOpen={showMatchInfoModal}
        onClose={() => setShowMatchInfoModal(false)}
        settings={matchSettings}
        stats={matchStats}
        moveCount={Math.floor(moveHistory.length / 2) + 1}
      />
    </div>
  );
};
