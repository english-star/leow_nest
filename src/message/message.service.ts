import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { InteractiveMessageResponse, MessageResponse } from './types';
import {
  WHATSAPP_CLOUD_API_ACCESS_TOKEN,
  WHATSAPP_CLOUD_API_MESSAGES_URL,
} from './constants/cloud-api';
import { QuestionsService } from '../questions/questions.service';
import { UserService } from '../user/user.service';

interface ApiResponse {
  messages: Array<{
    id: string;
    message_status: string;
  }>;
}

@Injectable()
export class MessageService {
  constructor(
    private readonly userService: UserService,
    private readonly questionsService: QuestionsService,
  ) {}

  private readonly httpService = new HttpService();
  private readonly logger = new Logger(MessageService.name);

  async sendRequest(data: any): Promise<string> {
    const url = WHATSAPP_CLOUD_API_MESSAGES_URL;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WHATSAPP_CLOUD_API_ACCESS_TOKEN}`,
      },
    };

    try {
      const response = this.httpService
        .post<ApiResponse>(url, data, config)
        .pipe(map((res) => res.data))
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw new BadRequestException('Error Posting to Cloud API');
          }),
        );
      const messageSendingStatus = await lastValueFrom(response);
      this.logger.log('Message Sent. Status:', messageSendingStatus);
      return 'Message sent successfully';
    } catch (error) {
      this.logger.error(error);
      return 'There was an error sending the message';
    }
  }

  async sendText(recipient: string, text: string): Promise<string> {
    const data: MessageResponse = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: {
        body: text,
      },
    };

    return this.sendRequest(data);
  }

  async sendMediaAndText(
    recipient: string,
    mediaUrl: string,
    text: string,
  ): Promise<string> {
    const mediaData = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'image',
      image: {
        link: mediaUrl,
        caption: text,
      },
    };

    return this.sendRequest(mediaData);
  }

  async sendWithOptions(
    recipient: string,
    question: string,
    options: string[],
  ): Promise<string> {
    const buttons = options.map((option, index) => ({
      type: 'reply',
      reply: {
        id: `option_${index}`,
        title: option,
      },
    }));

    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: question,
        },
        action: {
          buttons,
        },
      },
    };

    return this.sendRequest(data);
  }

  async sendNext(
    recipient: string,
    message: { question: string; options: string[] },
  ): Promise<string> {
    const userSession = this.userService.getSession(recipient);
    const totalQuestions = this.questionsService.findAll().length;

    if (
      this.userService.hasCompletedAllQuestions(
        userSession?.currentQuestionId ?? 1,
        totalQuestions,
      )
    ) {
      await this.sendText(
        recipient,
        'Congratulations! 🎉 You have completed the lesson.',
      );
      return Promise.resolve('Lesson completed');
    }

    if (message.options && message.options.length > 0) {
      return this.sendWithOptions(recipient, message.question, message.options);
    }

    return Promise.resolve('Loading questions...');
  }

  async sendFeedback(
    recipient: string,
    feedback: { message: string; gif: string },
  ): Promise<void> {
    await this.sendMediaAndText(recipient, feedback.gif, feedback.message);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.userService.incrementCurrentQuestion(recipient);
  }

  async parseText(
    messageSender: string,
    message: InteractiveMessageResponse,
  ): Promise<void> {
    const text = message.text?.body;
    if (!text) {
      this.logger.warn('Received text message without body');
      return;
    }

    const userSession = this.userService.getSession(messageSender);

    if (userSession?.currentQuestionId === 1) {
      await this.sendText(
        messageSender,
        '*Muraho!* 👋\nIkaze kuri *Learn English*! Hano uziga Icyongereza mu buryo bworoshye kandi bushimishije.',
      );
    }
  }
}
