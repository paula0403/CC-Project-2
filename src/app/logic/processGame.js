import Answers from '../components/Answers';
import VisualImage from '../components/VisualImage';
import { getQuestion, initGame, isGameInitialized } from './quiz';

class Game {
  getTimeLeft() {
    return this.timeLeft;
  }

  getMode() {
    return this.mode;
  }

  getRunning() {
    return this.running;
  }

  getQuestions() {
    return this.questions;
  }

  reduceTime() {
    this.timeLeft -= 0.5;
  }

  addQuestion(question) {
    this.questions.push(question);
  }

  newGame(mode) {
    this.timeLeft = 5 || process.env.QUIZ_MAX_TIME_SECONDS;
    this.questions = [];
    this.mode = mode;
    this.running = false;
  }

  changeRunningFlag() {
    this.running = !this.running;
  }

  generateObjectForModal() {
    return {
      mode: this.mode,
      questions: this.questions,
    };
  }
}

const game = new Game();

const spreadQuestion = (question) => {
  // TODO: send question to computer player
  VisualImage(question.image);
  Answers(
    question.answers,
    question.rightAnswer,
    // Eslint warn. Use before definition
    // eslint-disable-next-line no-use-before-define
    // TODO: HumanPlayerCallback,
  );
};

const verifyImage = (question) => {
  if (game.getRunning()) {
    if (question.image.startsWith('data:image')) {
      game.addQuestion(question);
      spreadQuestion(question);
    } else {
      // Eslint warn. Function called before declaration.
      // eslint-disable-next-line no-use-before-define
      getNewQuestion();
    }
  }
};

const verifyQuestion = (question) => {
  const interval = setInterval(() => {
    if (question.image !== undefined) {
      clearInterval(interval);
      verifyImage(question);
    }
  }, 100);
};

const getNewQuestion = () => {
  const question = getQuestion();
  if (question.err === '' || question.err === undefined) {
    verifyQuestion(question);
  } else {
    getNewQuestion();
  }
};

const closeGame = (interval) => {
  game.changeRunningFlag();
  clearInterval(interval);
  // TODO: send_to_modal(game.generateObjectForModal());
};

const gameRunning = () => {
  // TODO: countdown display - TimeRemaining();
  game.changeRunningFlag();
  getNewQuestion();
  const interval = setInterval(() => {
    game.reduceTime();
    if (game.timeLeft === 0 || !game.getRunning()) {
      closeGame(interval);
    }
  }, 500);
};

const startGame = (mode) => {
  game.newGame(mode);
  gameRunning();
};

const processGame = (
  mode = 'people',
  url = process.env.SW_API_BASE_URL,
) => {
  initGame(mode, url || 'https://swapi.dev/api');
  let initializeAttempts = 3;
  const gameInitializing = setInterval(() => {
    if (isGameInitialized()) {
      clearInterval(gameInitializing);
      startGame(mode);
    }
    initializeAttempts -= 1;
    if (initializeAttempts === 0) {
      clearInterval(gameInitializing);
      throw new Error('Cannot initialize game');
    }
  }, 500);
};

export default processGame;
export const getTimeLeft = () => ({
  isRunning: game.getRunning(),
  timeLeft: game.getTimeLeft(),
});
export const askQuestion = () => getNewQuestion();
export const cancelGame = () => {
  if (game.getRunning()) {
    game.changeRunningFlag();
  }
};