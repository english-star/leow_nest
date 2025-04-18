import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private sessions = new Map<
    string,
    {
      currentQuestionId: number;
      completed: boolean;
    }
  >();

  getSession(messageSender: string) {
    if (!this.sessions.has(messageSender)) {
      this.sessions.set(messageSender, {
        currentQuestionId: 1,
        completed: false,
      });
    }
    return this.sessions.get(messageSender);
  }

  incrementCurrentQuestion(messageSender: string) {
    const session = this.getSession(messageSender);
    if (session) {
      session.currentQuestionId++;
    }
  }

  hasCompletedAllQuestions(
    currentQuestionId: number,
    totalQuestions: number,
  ): boolean {
    return currentQuestionId > totalQuestions;
  }
}
