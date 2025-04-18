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
import { WebhookPayload } from './types';
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

    this.logger.log(`Received message ${messageId} from ${messageSender}`);

    switch (message.type) {
      case 'text': {
        await this.messageService.parseText(messageSender, message);
        break;
      }

      case 'interactive': {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const buttonTitle = message.interactive?.button_reply?.title as string;
        const { currentQuestionId } =
          this.userService.getSession(messageSender)!;
        const feedback = this.questionsService.checkAnswer(
          currentQuestionId,
          buttonTitle,
        );

        await this.messageService.sendFeedback(messageSender, feedback);
        break;
      }
      default:
        this.logger.warn(`Unhandled message type: ${message.type}`);
    }

    const { currentQuestionId } = this.userService.getSession(messageSender)!;
    const nextQuestion = this.questionsService.findById(currentQuestionId);

    return this.messageService.sendNext(messageSender, nextQuestion);
  }
}
