import { createClient, DeepgramClient } from '@deepgram/sdk';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AudioService {
  private deepgram: DeepgramClient;
  private readonly logger = new Logger(AudioService.name);

  constructor(private configService: ConfigService) {
    const deepgramApiKey = this.configService.get<string>('DEEPGRAM_API_KEY');
    this.deepgram = createClient(deepgramApiKey);
  }

  async transcribeBuffer(audioBuffer: Buffer): Promise<string> {
    try {
      const { result, error } =
        await this.deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
          model: 'nova-3',
          smart_format: true,
        });

      if (error) {
        this.logger.error('Error during transcription', error);
        throw error;
      }

      return result.results.channels[0].alternatives[0].transcript;
    } catch (err) {
      this.logger.error('Failed to transcribe audio buffer', err);
      throw new Error('Audio transcription failed. Please try again.');
    }
  }
}
