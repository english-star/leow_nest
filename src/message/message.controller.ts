import { AudioService } from './../audio/audio.service';
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
    const sender = message.from;
    const messageId = message.id;

    const { currentQuestionId } = this.userService.getSession(sender)!;

    this.logger.log(`Received message ${messageId} from ${sender}`);

    const userResponse = await this.messageService.getUserResponse(
      sender,
      message,
    );

    if (userResponse) {
      const feedback = this.questionsService.checkAnswer(
        currentQuestionId,
        userResponse,
        sender,
      );
      await this.messageService.sendFeedback(sender, feedback);
    }

    const nextQuestion = this.questionsService.getNext(sender);
    return this.messageService.sendQuestion(sender, nextQuestion);
  }
}
