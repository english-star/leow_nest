import { Controller, Get, Param } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from './interfaces/question.interface';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  getAllQuestions(): Question[] {
    return this.questionsService.getAllQuestions();
  }

  @Get(':id')
  getQuestionById(@Param('id') id: string): Question | undefined {
    return this.questionsService.getQuestionById(+id);
  }
}
