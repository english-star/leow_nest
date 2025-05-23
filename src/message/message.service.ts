/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import {
  InteractiveMessageResponse,
  MediaType,
  MessageResponse,
} from './message.interface';
import {
  WHATSAPP_CLOUD_API_ACCESS_TOKEN,
  WHATSAPP_CLOUD_API_MESSAGES_URL,
} from './constants/cloud-api';
import { UserService } from '../user/user.service';
import {
  Question,
  QuestionType,
} from '../questions/interfaces/question.interface';
import DefaultMessages from '../data/default-messages.json';
import { ApiResponse } from './message.interface';
import { AudioService } from 'src/audio/audio.service';
import { download, getUrl } from 'src/helpers/media.helper';

@Injectable()
export class MessageService {
  constructor(
    private readonly userService: UserService,
    private readonly audioService: AudioService,
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

  async sendMedia(
    recipient: string,
    type: string,
    link: string,
  ): Promise<string> {
    const mediaData: MessageResponse = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type,
    };

    if (type === 'audio') mediaData.audio = { link };
    if (type === 'video') mediaData.video = { link };

    return this.sendRequest(mediaData);
  }

  async sendWithOptions(recipient: string, message: Question): Promise<string> {
    const { text, options, audio } = message;

    const buttons = options!.map((option, index) => ({
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
          text,
        },
        action: {
          buttons,
        },
      },
    };

    if (audio) await this.sendMedia(recipient, MediaType.Audio, audio);

    return this.sendRequest(data);
  }

  async sendFeedback(
    recipient: string,
    feedback: { message: string; media: string },
  ): Promise<void> {
    await this.sendText(recipient, feedback.message);
    await this.sendMedia(recipient, MediaType.Video, feedback.media);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.userService.incrementCurrentQuestion(recipient);
  }

  async handleInitial(
    sender: string,
    message: InteractiveMessageResponse,
  ): Promise<string> {
    const text = message.text?.body;
    if (!text) {
      this.logger.warn('Received text message without body');
      return '';
    }

    const userSession = this.userService.getSession(sender);

    if (userSession?.currentQuestionId === 1) {
      return this.sendText(sender, DefaultMessages['welcome']);
    }

    return '';
  }

  async getUserResponse(
    sender: string,
    message: InteractiveMessageResponse,
  ): Promise<string | null> {
    switch (message.type) {
      case 'text': {
        const initialMessage = await this.handleInitial(sender, message);
        return initialMessage ? null : (message.text?.body ?? '');
      }

      case 'interactive': {
        return message.interactive?.button_reply?.title as string;
      }

      case 'audio': {
        const mediaId = message.audio?.id as string;
        const audioUrl = await getUrl(mediaId, this.httpService);
        const audioBuffer = await download(audioUrl, this.httpService);
        return await this.audioService.transcribeBuffer(audioBuffer);
      }

      default:
        this.logger.warn(`Unhandled message type: ${message.type}`);
        return null;
    }
  }

  async sendQuestion(
    sender: string,
    question: Question | string,
  ): Promise<string> {
    if (typeof question === 'string') {
      return this.sendText(sender, question);
    }

    switch (question.type) {
      case QuestionType.MultipleChoice:
        return this.sendWithOptions(sender, question);
      case QuestionType.Writing:
        return this.sendText(sender, question.text);
      default:
        return Promise.resolve('Unhandled type');
    }
  }
}
