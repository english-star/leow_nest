export type Session = {
  currentQuestionId: number;
  completed: boolean;
  correctAnswerStreak: number;
  incorrectQuestions: number[];
  isReviewMode: boolean;
};
