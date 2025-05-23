import { Injectable } from '@nestjs/common';
import DefaultMessages from '../data/default-messages.json';
import questions from '../data/mvp-lesson';
import { Session } from './user.interface';

@Injectable()
export class UserService {
  private sessions = new Map<string, Session>();

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

  private removeFromIncorrect(session: Session) {
    const currentIndex = session.incorrectQuestions.indexOf(
      session.currentQuestionId,
    );
    if (currentIndex > -1) session.incorrectQuestions.splice(currentIndex, 1);
  }

  private startReviewMode(session: Session) {
    session.isReviewMode = true;
    session.currentQuestionId = session.incorrectQuestions[0];
  }

  private exitReviewMode(session: Session) {
    session.isReviewMode = false;
    session.completed = true;
  }

  incrementCurrentQuestion(messageSender: string) {
    const session = this.getSession(messageSender);
    if (!session) return;

    if (session.isReviewMode) {
      this.removeFromIncorrect(session);
      if (session.incorrectQuestions.length === 0) {
        this.exitReviewMode(session);
        return;
      }
      session.currentQuestionId = session.incorrectQuestions[0];
      return;
    }

    if (session.currentQuestionId === questions.length) {
      if (session.incorrectQuestions.length > 0) {
        this.startReviewMode(session);
        return;
      }
      session.completed = true;
      return;
    }

    session.currentQuestionId++;
  }

  incrementCorrectAnswerStreak(messageSender: string, isCorrect: boolean) {
    const session = this.getSession(messageSender);
    if (!session) return;

    if (!isCorrect) {
      session.correctAnswerStreak = 0;
      session.incorrectQuestions.push(session.currentQuestionId);
      return;
    }

    session.correctAnswerStreak++;

    if (
      session.correctAnswerStreak > 0 &&
      session.correctAnswerStreak % 5 === 0
    ) {
      return DefaultMessages['status.answer.streak'].replace(
        '{{streakCount}}',
        `${session.correctAnswerStreak}`,
      );
    }

    return null;
  }
}
