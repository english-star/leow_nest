import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from './interfaces/question.interface';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(): Question[] {
    return this.questionsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Question | undefined {
    return this.questionsService.findById(+id);
  }

  @Post(':id/answer')
  async checkAnswer(
    @Param('id') id: string,
    @Body('answer') answer: string,
    @Body('messageSender') messageSender: string,
  ): Promise<{ message: string; media: string; nextQuestion?: Question }> {
    return this.questionsService.checkAnswer(+id, answer, messageSender);
  }
}
