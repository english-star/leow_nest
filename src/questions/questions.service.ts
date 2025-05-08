import { Injectable } from '@nestjs/common';
import { Question, QuestionType } from './interfaces/question.interface';
import questions from '../data/mvpLessonQuestions';
import DefaultMessages from '../data/default-messages.json';
import { UserService } from '../user/user.service';
import { MessageService } from '../message/message.service';

@Injectable()
export class QuestionsService {
  private list: Question[];

  constructor(
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {
    this.list = questions;
  }

  findAll(): Question[] {
    return this.list;
  }

  findById(id: number): Question {
    const question = this.list.find((question) => question._id === id);
    if (!question) {
      throw new Error(`Question with ID ${id} not found`);
    }
    return question;
  }

  private getFeedback(correctAnswer: string) {
    return {
      correct: {
        message: DefaultMessages['status.answer.correct'],
        media: 'https://leow.netlify.app/Great%20Job%20Gif.mp4',
      },
      incorrect: {
        message: `${DefaultMessages['status.answer.incorrect']} ${correctAnswer}`,
        media: 'https://leow.netlify.app/That_s_not_right.mp4',
      },
    };
  }

  private isCorrect(question: Question, answer: string): boolean {
    switch (question.type) {
      case QuestionType.MultipleChoice:
        return question.answer === answer;
      case QuestionType.Writing || QuestionType.Speaking:
        return question.answer
          .toLowerCase()
          .trim()
          .includes(answer.toLowerCase().trim());
      default:
        return false;
    }
  }

  async checkAnswer(
    questionId: number,
    answer: string,
    messageSender: string,
  ): Promise<{ message: string; media: string; nextQuestion?: Question }> {
    const question = this.findById(questionId);
    const correctAnswer = question.answer;
    const feedback = this.getFeedback(correctAnswer);

    const isCorrect = this.isCorrect(question, answer);
    const streakMessage = this.userService.incrementCorrectAnswerStreak(
      messageSender,
      isCorrect,
    );

    this.userService.incrementCurrentQuestion(messageSender);
    const nextQuestion = this.getNext(messageSender);

    if (streakMessage) {
      await this.messageService.sendFeedback(
        messageSender,
        isCorrect ? feedback.correct : feedback.incorrect,
      );
      await this.messageService.sendText(messageSender, streakMessage);
      return {
        message: '',
        media: '',
        nextQuestion:
          typeof nextQuestion === 'string' ? undefined : nextQuestion,
      };
    }

    return {
      ...(isCorrect ? feedback.correct : feedback.incorrect),
      nextQuestion: typeof nextQuestion === 'string' ? undefined : nextQuestion,
    };
  }

  getNext(messageSender: string): Question | string {
    const session = this.userService.getSession(messageSender);
    if (!session) {
      return DefaultMessages['lesson.end'];
    }

    const isReviewMode = this.userService.isInReviewMode(messageSender);

    if (isReviewMode && session.incorrectQuestions.length === 0) {
      session.isReviewMode = false;
      return DefaultMessages['lesson.end'];
    }

    if (
      !isReviewMode &&
      session.currentQuestionId > this.list.length &&
      session.incorrectQuestions.length > 0
    ) {
      session.isReviewMode = true;
      session.currentQuestionId = session.incorrectQuestions[0];
    }

    const nextQuestion = this.findById(session.currentQuestionId);

    if (nextQuestion.audio && !nextQuestion.text) {
      nextQuestion.text = DefaultMessages['question.audio.text'];
    }

    if (isReviewMode) {
      nextQuestion.text = `[Review Mode] ${nextQuestion.text}`;
    }

    return nextQuestion;
  }
}
