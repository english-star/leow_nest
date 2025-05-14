import { createClient, DeepgramClient } from '@deepgram/sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AudioService {
  private deepgram: DeepgramClient;

  constructor(private configService: ConfigService) {
    const deepgramApiKey = this.configService.get<string>('DEEPGRAM_API_KEY');
    this.deepgram = createClient(deepgramApiKey);
  }

  async transcribe(url: string): Promise<string> {
    const { result, error } =
      await this.deepgram.listen.prerecorded.transcribeUrl(
        {
          url,
        },
        {
          model: 'nova-3',
          smart_format: true,
        },
      );
    if (error) throw error;

    return result.results.channels[0].alternatives[0].transcript;
  }
}
