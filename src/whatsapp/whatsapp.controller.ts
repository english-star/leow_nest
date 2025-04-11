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
import { WhatsappService } from './whatsapp.service';
import { WhatsAppWebhookPayload } from './types';
import { QuestionsService } from '../questions/questions.service';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);
  private userSessions = new Map<
    string,
    {
      currentQuestionId: number;
    }
  >();

  constructor(
    private readonly whatsAppService: WhatsappService,
    private readonly questionsService: QuestionsService,
  ) {}

  @Get('webhook')
  verificationChallenge(@Req() request: Request): string {
    const mode = request.query['hub.mode'] as string;
    const challenge = request.query['hub.challenge'] as string;
    const token = request.query['hub.verify_token'] as string;

    const verificationToken =
      process.env.WHATSAPP_CLOUD_API_WEBHOOK_VERIFICATION_TOKEN;

    if (!mode && !token) {
      return 'Error verifying token';
    }

    if (mode === 'subscribe' && token === verificationToken) {
      return challenge;
    }
    return 'Verification failed';
  }

  @Post('webhook')
  @HttpCode(200)
  async handleIncomingMessage(
    @Body() request: WhatsAppWebhookPayload,
  ): Promise<void> {
    const { messages } = request?.entry?.[0]?.changes?.[0]?.value ?? {};
    if (!messages) return;

    const message = messages[0];
    const messageSender = message.from;
    const messageId = message.id;

    this.logger.log(`Received message ${messageId} from ${messageSender}`);

    if (!this.userSessions.has(messageSender)) {
      this.userSessions.set(messageSender, {
        currentQuestionId: 1,
      });
    }
    const userSession = this.userSessions.get(messageSender)!;

    switch (message.type) {
      case 'text': {
        const text = message.text?.body;
        if (!text) {
          this.logger.warn('Received text message without body');
          return;
        }

        if (userSession.currentQuestionId === 1) {
          await this.whatsAppService.sendTextMessage(
            messageSender,
            '*Muraho!* 👋\nIkaze kuri *Learn English*! Hano uziga Icyongereza mu buryo bworoshye kandi bushimishije.',
          );
        }

        await this.sendNextQuestion(messageSender);

        break;
      }

      case 'interactive': {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const buttonTitle = message.interactive?.button_reply?.title;

        const currentQuestion = this.questionsService.getQuestionById(
          userSession.currentQuestionId,
        );

        let responseMessage = '';

        if (currentQuestion) {
          if (buttonTitle === currentQuestion.answer) {
            responseMessage = 'Correct!';
          } else {
            responseMessage = 'Incorrect!';
          }

          await this.whatsAppService.sendTextMessage(
            messageSender,
            responseMessage,
          );

          setTimeout(() => {
            this.sendNextQuestion(messageSender).catch((error) =>
              this.logger.error('Error sending next question', error),
            );
          }, 1000);
        }
        break;
      }
      default:
        this.logger.warn(`Unhandled message type: ${message.type}`);
    }
  }

  private async sendNextQuestion(messageSender: string): Promise<void> {
    const userSession = this.userSessions.get(messageSender)!;

    const nextQuestion = this.questionsService.getQuestionById(
      userSession.currentQuestionId,
    );

    // Send question with options
    if (nextQuestion.options && nextQuestion.options.length > 0) {
      await this.whatsAppService.sendQuestionWithOptions(
        messageSender,
        nextQuestion.question,
        nextQuestion.options,
      );

      userSession.currentQuestionId++;
    } else {
      //Todo: Send other question types
    }
  }
}
