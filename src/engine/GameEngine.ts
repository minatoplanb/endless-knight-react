import { TICK_INTERVAL, SAVE_INTERVAL } from '../constants/game';
import { useGameStore } from '../store/useGameStore';

let gameLoop: ReturnType<typeof setInterval> | null = null;
let saveLoop: ReturnType<typeof setInterval> | null = null;

export const GameEngine = {
  start: () => {
    if (gameLoop) return;

    const store = useGameStore.getState();
    store.startGame();

    // Main game loop - 100ms tick
    gameLoop = setInterval(() => {
      useGameStore.getState().tick();
    }, TICK_INTERVAL);

    // Auto-save loop - 30 seconds
    saveLoop = setInterval(() => {
      useGameStore.getState().saveGame();
    }, SAVE_INTERVAL);

    console.log('Game engine started');
  },

  stop: () => {
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
    if (saveLoop) {
      clearInterval(saveLoop);
      saveLoop = null;
    }

    const store = useGameStore.getState();
    store.stopGame();
    store.saveGame();

    console.log('Game engine stopped');
  },

  isRunning: () => {
    return gameLoop !== null;
  },
};
