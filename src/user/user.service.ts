import { Injectable } from '@nestjs/common';
import DefaultMessages from '../data/default-messages.json';
import questions from '../data/mvp-lesson';

@Injectable()
export class UserService {
  private sessions = new Map<
    string,
    {
      currentQuestionId: number;
      completed: boolean;
      correctAnswerStreak: number;
      incorrectQuestions: number[];
      isReviewMode: boolean;
    }
  >();

  getSession(messageSender: string) {
    if (!this.sessions.has(messageSender)) {
      this.sessions.set(messageSender, {
        currentQuestionId: 1,
        completed: false,
        correctAnswerStreak: 0,
        incorrectQuestions: [],
        isReviewMode: false,
      });
    }
    return this.sessions.get(messageSender);
  }

  incrementCurrentQuestion(messageSender: string) {
    const session = this.getSession(messageSender);
    if (session) {
      if (session.isReviewMode) {
        const currentIndex = session.incorrectQuestions.indexOf(
          session.currentQuestionId,
        );
        if (currentIndex > -1) {
          session.incorrectQuestions.splice(currentIndex, 1);
        }

        if (session.incorrectQuestions.length === 0) {
          session.isReviewMode = false;
          session.currentQuestionId = 1;
          return;
        }

        session.currentQuestionId = session.incorrectQuestions[0];
      } else {
        session.currentQuestionId++;

        if (
          session.currentQuestionId > questions.length &&
          session.incorrectQuestions.length > 0
        ) {
          session.isReviewMode = true;
          session.currentQuestionId = session.incorrectQuestions[0];
        }
      }
    }
  }

  incrementCorrectAnswerStreak(messageSender: string, isCorrect: boolean) {
    const session = this.getSession(messageSender);
    if (session) {
      if (isCorrect) {
        session.correctAnswerStreak++;
        if (
          session.correctAnswerStreak === 5 ||
          session.correctAnswerStreak === 10 ||
          session.correctAnswerStreak === 15
        ) {
          return DefaultMessages['status.answer.streak'].replace(
            '{{streakCount}}',
            `${session.correctAnswerStreak}`,
          );
        }
      } else {
        session.correctAnswerStreak = 0;
        if (
          !session.isReviewMode &&
          !session.incorrectQuestions.includes(session.currentQuestionId)
        ) {
          session.incorrectQuestions.push(session.currentQuestionId);
        }
      }
    }
    return null;
  }

  setReviewMode(messageSender: string, isReviewMode: boolean) {
    const session = this.getSession(messageSender)!;
    session.isReviewMode = isReviewMode;
  }

  setCurrrentQuestionId(
    messageSender: string,
    currentQuestionId: number,
  ): void {
    const session = this.getSession(messageSender)!;
    session.currentQuestionId = currentQuestionId;
  }
}
