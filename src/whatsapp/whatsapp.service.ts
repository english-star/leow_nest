import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { WhatsAppMessageResponse } from './types';
import { WHATSAPP_CLOUD_API_MESSAGES_URL } from './constants/cloudApiUrl';

interface WhatsAppApiResponse {
  messages: Array<{
    id: string;
    message_status: string;
  }>;
}

@Injectable()
export class WhatsappService {
  private readonly httpService = new HttpService();
  private readonly logger = new Logger(WhatsappService.name);

  async sendTextMessage(messageSender: string, text: string): Promise<string> {
    const url = WHATSAPP_CLOUD_API_MESSAGES_URL;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_API_ACCESS_TOKEN}`,
      },
    };

    const data: WhatsAppMessageResponse = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: messageSender,
      type: 'text',
      text: {
        body: text,
      },
    };

    try {
      const response = this.httpService
        .post<WhatsAppApiResponse>(url, data, config)
        .pipe(map((res) => res.data))
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw new BadRequestException(
              'Error Posting to Whatsapp Cloud API',
            );
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

  async sendQuestionWithOptions(
    recipient: string,
    question: string,
    options: string[],
  ): Promise<string> {
    const url = WHATSAPP_CLOUD_API_MESSAGES_URL;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_API_ACCESS_TOKEN}`,
      },
    };

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

    try {
      const response = this.httpService
        .post<WhatsAppApiResponse>(url, data, config)
        .pipe(map((res) => res.data))
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw new BadRequestException(
              'Error Posting to Whatsapp Cloud API',
            );
          }),
        );
      const messageSendingStatus = await lastValueFrom(response);
      this.logger.log(
        'Question with options sent. Status:',
        messageSendingStatus,
      );
      return 'Question with options sent successfully';
    } catch (error) {
      this.logger.error(error);
      return 'There was an error sending the question';
    }
  }
}
