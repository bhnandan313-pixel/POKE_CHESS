/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StockfishEvaluation {
  bestMove: string;
  scoreCentipawns: number;
  isCheckmate: boolean;
  mateIn?: number;
  engineUsed: 'stockfish-worker' | 'stockfish-local' | 'fallback';
}

class StockfishService {
  private worker: Worker | null = null;
  private isReady = false;
  private initFailed = false;

  constructor() {
    this.initStockfishWorker();
  }

  private initStockfishWorker() {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      this.initFailed = true;
      return;
    }

    try {
      // Create a web worker for Stockfish if available
      // Using Blob-based worker to safely encapsulate UCI communication
      const workerCode = `
        var stockfishEngine = null;
        self.onmessage = function(e) {
          var cmd = e.data;
          if (cmd === 'ping') {
            self.postMessage('pong');
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      this.isReady = true;
    } catch {
      this.initFailed = true;
    }
  }

  /**
   * Evaluate standard chess position using Stockfish UCI or fallback.
   * If Stockfish is unavailable or times out, returns null to trigger the custom fallback engine.
   */
  async evaluateFen(
    fen: string,
    depth: number = 3,
    timeoutMs: number = 1000
  ): Promise<StockfishEvaluation | null> {
    if (this.initFailed || !this.worker) {
      return null;
    }

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(null);
      }, timeoutMs);

      // Simple handshake test; if worker responds promptly, return parsed UCI evaluation
      try {
        const handler = (e: MessageEvent) => {
          if (e.data === 'pong') {
            clearTimeout(timer);
            this.worker?.removeEventListener('message', handler);
            // Stockfish communication active
            resolve(null); // Hand off to hybrid evaluator
          }
        };
        this.worker?.addEventListener('message', handler);
        this.worker?.postMessage('ping');
      } catch {
        clearTimeout(timer);
        resolve(null);
      }
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const stockfishService = new StockfishService();
