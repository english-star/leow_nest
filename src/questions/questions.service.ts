import { Injectable } from '@nestjs/common';
import { Question } from './interfaces/question.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class QuestionsService {
  private questions: Question[];

  constructor() {
    const jsonPath = path.join(__dirname, '../../src/data/questions.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    this.questions = JSON.parse(jsonData) as Question[];
  }

  getAllQuestions(): Question[] {
    return this.questions;
  }

  getQuestionById(id: number): Question {
    const question = this.questions.find((question) => question._id === id);
    if (!question) {
      throw new Error(`Question with ID ${id} not found`);
    }
    return question;
  }
}
