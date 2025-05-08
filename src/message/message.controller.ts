import { AudioService } from './../audio/audio.service';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Req,
  HttpCode,
  Post,
  Body,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { MessageService } from './message.service';
import { WebhookPayload } from './message.interface';
import { QuestionsService } from '../questions/questions.service';
import { UserService } from '../user/user.service';
import { WHATSAPP_CLOUD_API_ACCESS_TOKEN } from './constants/cloud-api';
import { QuestionType } from 'src/questions/interfaces/question.interface';

@Controller('message')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(
    private readonly messageService: MessageService,
    private readonly questionsService: QuestionsService,
    private readonly userService: UserService,
    private readonly audioService: AudioService,
  ) {}

  @Get('webhook')
  verifyWebhook(@Req() request: Request): string {
    const mode = request.query['hub.mode'] as string;
    const challenge = request.query['hub.challenge'] as string;
    const token = request.query['hub.verify_token'] as string;

    if (!mode && !token) {
      return 'Error verifying token';
    }

    if (mode === 'subscribe' && token === WHATSAPP_CLOUD_API_ACCESS_TOKEN) {
      return challenge;
    }
    return 'Verification failed';
  }

  @Post('webhook')
  @HttpCode(200)
  async incomingText(@Body() request: WebhookPayload): Promise<void | string> {
    const { messages } = request?.entry?.[0]?.changes?.[0]?.value ?? {};
    if (!messages) return;

    const message = messages[0];
    const messageSender = message.from;
    const messageId = message.id;

    const { currentQuestionId } = this.userService.getSession(messageSender)!;
    let userResponse = '';

    this.logger.log(`Received message ${messageId} from ${messageSender}`);

    switch (message.type) {
      case 'text': {
        await this.messageService.parseText(messageSender, message);
        userResponse = message.text?.body ?? '';
        break;
      }

      case 'interactive': {
        userResponse = message.interactive?.button_reply?.title as string;
        break;
      }

      case 'audio': {
        const mediaId = message.audio?.id as string;
        const mediaUrl = await this.messageService.getMediaUrl(mediaId);
        userResponse = await this.audioService.transcribe(mediaUrl);
        break;
      }

      default:
        this.logger.warn(`Unhandled message type: ${message.type}`);
    }

    if (userResponse) {
      const feedback = await this.questionsService.checkAnswer(
        currentQuestionId,
        userResponse,
        messageSender,
      );

      await this.messageService.sendFeedback(messageSender, feedback);
    }

    const nextQuestion = this.questionsService.getNext(messageSender);

    if (typeof nextQuestion === 'string') {
      return this.messageService.sendText(messageSender, nextQuestion);
    }

    switch (nextQuestion.type) {
      case QuestionType.MultipleChoice:
        return this.messageService.sendWithOptions(messageSender, nextQuestion);
      case QuestionType.Writing || QuestionType.Speaking:
        return this.messageService.sendText(messageSender, nextQuestion.text);
      default:
        return Promise.resolve('Unhandled type');
    }
  }
}
