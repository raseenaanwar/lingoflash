export interface VocabularyCard {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  partOfSpeech: string;
}

export enum AppState {
  START = 'START',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  SUMMARY = 'SUMMARY',
  ERROR = 'ERROR'
}

export interface GameStats {
  total: number;
  correct: number;
  incorrect: number;
  seenWords: VocabularyCard[];
  incorrectWords: VocabularyCard[];
}