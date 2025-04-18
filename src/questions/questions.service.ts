import { Injectable } from '@nestjs/common';
import { Question } from './interfaces/question.interface';
import questions from '../data/questions.json';

@Injectable()
export class QuestionsService {
  private list: Question[];

  constructor() {
    this.list = questions as Question[];
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

  checkAnswer(
    questionId: number,
    answer: string,
  ): { message: string; gif: string } {
    const question = this.findById(questionId);
    const correctAnswer = question.answer;

    if (answer === correctAnswer)
      return {
        message: 'Byiza cyane! 🎉 Igisubizo cyawe ni cyo!',
        gif: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHRyd2hoaGpvdmwwdmxqeDl1MTg3MGVqczFmaTluOW1xdm16dThkeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2xRu4Clh3DJhm/giphy.gif',
      };

    return {
      message: `Yiii! 😞 Igisubizo cyawe Ntabwo ari cyo.\n\nIgisubizo ni: ${correctAnswer}`,
      gif: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWw0YWVudDlrMWhuNHRscjRxNnh1MDVxbTZzdWhoNGppcDR1bTZpYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2SpNqwi0lRY5M5sk/giphy.gif',
    };
  }
}
