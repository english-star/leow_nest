import { Injectable } from '@nestjs/common';
import { Question, QuestionType } from './interfaces/question.interface';
import questions from '../data/mvp-lesson';
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
      case QuestionType.Writing:
        return question.answer
          .toLowerCase()
          .trim()
          .includes(answer.toLowerCase().trim());
      default:
        return false;
    }
  }

  checkAnswer(
    questionId: number,
    answer: string,
    messageSender: string,
  ): { message: string; media: string } {
    const question = this.findById(questionId);
    const correctAnswer = question.answer;
    const feedback = this.getFeedback(correctAnswer);

    const isCorrect = this.isCorrect(question, answer);
    const streakMessage = this.userService.incrementCorrectAnswerStreak(
      messageSender,
      isCorrect,
    );

    if (streakMessage)
      feedback.correct.message = `${feedback.correct.message} \n ${streakMessage}`;

    if (isCorrect) return feedback.correct;

    return feedback.incorrect;
  }

  getNext(messageSender: string): Question | string {
    const { isReviewMode, incorrectQuestions, currentQuestionId } =
      this.userService.getSession(messageSender)!;

    const hasFinishedIncorrectQuestions =
      isReviewMode && incorrectQuestions.length > 0;

    if (hasFinishedIncorrectQuestions) {
      this.userService.setReviewMode(messageSender, false);
      return DefaultMessages['lesson.end'];
    }

    const hasFinishedAllQuestions =
      !isReviewMode &&
      currentQuestionId > this.list.length &&
      incorrectQuestions.length === 0;

    if (hasFinishedAllQuestions) {
      this.userService.setReviewMode(messageSender, true);
      this.userService.setCurrrentQuestionId(
        messageSender,
        incorrectQuestions[0],
      );
    }

    const nextQuestion = this.findById(currentQuestionId);

    if (nextQuestion.audio && !nextQuestion.text) {
      nextQuestion.text = DefaultMessages['question.audio.text'];
    }

    if (isReviewMode) {
      nextQuestion.text = `[Gusubiramo] ${nextQuestion.text}`;
    }

    return nextQuestion;
  }
}
